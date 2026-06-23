"""
Авторизация: action=login/logout/me/change-password через query ?action=...
Безопасность: bcrypt, brute-force (5 попыток → блокировка 15 мин), токен 96 hex.
"""
import json
import os
import secrets
import bcrypt
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p61771184_green_case_medstore')
MAX_ATTEMPTS = 5
LOCKOUT_MINUTES = 15

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def extract_token(event: dict) -> str:
    auth = (event.get('headers') or {}).get('X-Authorization', '') or \
           (event.get('headers') or {}).get('Authorization', '')
    return auth.replace('Bearer ', '').strip()


def get_session_user(cur, token: str):
    if not token:
        return None
    cur.execute(
        f"""SELECT u.id, u.name, u.email, u.role
            FROM {SCHEMA}.sessions s
            JOIN {SCHEMA}.users u ON u.id = s.user_id
            WHERE s.token = %s AND s.expires_at > NOW() AND u.is_active = true""",
        (token,)
    )
    row = cur.fetchone()
    return {'id': row[0], 'name': row[1], 'email': row[2], 'role': row[3]} if row else None


def check_password(plain: str, hashed: str) -> bool:
    if hashed.startswith('$2b$') or hashed.startswith('$2a$'):
        try:
            return bcrypt.checkpw(plain.encode(), hashed.encode())
        except Exception:
            return False
    import hashlib
    return hashlib.sha256(plain.encode()).hexdigest() == hashed


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt(rounds=12)).decode()


def respond(status: int, body: dict) -> dict:
    return {'statusCode': status, 'headers': CORS, 'body': json.dumps(body, ensure_ascii=False)}


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')

    # ── login ─────────────────────────────────────────────────────────────────
    if action == 'login' and method == 'POST':
        body = json.loads(event.get('body') or '{}')
        email = (body.get('email') or '').strip().lower()
        password = body.get('password') or ''

        if not email or not password:
            return respond(400, {'error': 'Email и пароль обязательны'})

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"""SELECT id, name, email, role, password_hash, is_active,
                       failed_attempts, locked_until
                FROM {SCHEMA}.users WHERE email = %s""",
            (email,)
        )
        row = cur.fetchone()

        if not row:
            conn.close()
            return respond(401, {'error': 'Неверный email или пароль'})

        uid, name, u_email, role, pw_hash, is_active, failed, locked_until = row

        if not is_active:
            conn.close()
            return respond(403, {'error': 'Аккаунт деактивирован. Обратитесь к администратору'})

        if locked_until:
            cur.execute(f"SELECT locked_until > NOW() FROM {SCHEMA}.users WHERE id = %s", (uid,))
            if cur.fetchone()[0]:
                conn.close()
                return respond(429, {'error': f'Аккаунт временно заблокирован из-за многократных неудачных попыток. Попробуйте через {LOCKOUT_MINUTES} минут'})
            cur.execute(f"UPDATE {SCHEMA}.users SET failed_attempts=0, locked_until=NULL WHERE id=%s", (uid,))

        if not check_password(password, pw_hash):
            new_attempts = (failed or 0) + 1
            if new_attempts >= MAX_ATTEMPTS:
                cur.execute(
                    f"UPDATE {SCHEMA}.users SET failed_attempts=%s, locked_until=NOW()+INTERVAL '{LOCKOUT_MINUTES} minutes' WHERE id=%s",
                    (new_attempts, uid)
                )
                conn.commit()
                conn.close()
                return respond(429, {'error': f'Слишком много неудачных попыток. Аккаунт заблокирован на {LOCKOUT_MINUTES} минут'})
            cur.execute(f"UPDATE {SCHEMA}.users SET failed_attempts=%s WHERE id=%s", (new_attempts, uid))
            conn.commit()
            conn.close()
            remaining = MAX_ATTEMPTS - new_attempts
            return respond(401, {'error': f'Неверный email или пароль. Осталось попыток: {remaining}'})

        token = secrets.token_hex(48)
        ip = ((event.get('requestContext') or {}).get('identity') or {}).get('sourceIp', '')
        ua = ((event.get('headers') or {}).get('User-Agent', '') or '')[:512]

        cur.execute(
            f"INSERT INTO {SCHEMA}.sessions (user_id, token, ip_address, user_agent) VALUES (%s, %s, %s, %s)",
            (uid, token, ip, ua)
        )
        cur.execute(
            f"UPDATE {SCHEMA}.users SET failed_attempts=0, locked_until=NULL, last_login=NOW() WHERE id=%s",
            (uid,)
        )
        if not (pw_hash.startswith('$2b$') or pw_hash.startswith('$2a$')):
            cur.execute(f"UPDATE {SCHEMA}.users SET password_hash=%s WHERE id=%s", (hash_password(password), uid))

        conn.commit()
        conn.close()
        return respond(200, {'token': token, 'user': {'id': uid, 'name': name, 'email': u_email, 'role': role}})

    # ── me ────────────────────────────────────────────────────────────────────
    if action == 'me' and method == 'GET':
        token = extract_token(event)
        if not token:
            return respond(401, {'error': 'Не авторизован'})
        conn = get_conn()
        cur = conn.cursor()
        user = get_session_user(cur, token)
        conn.close()
        if not user:
            return respond(401, {'error': 'Сессия истекла или недействительна'})
        return respond(200, user)

    # ── logout ────────────────────────────────────────────────────────────────
    if action == 'logout' and method == 'POST':
        token = extract_token(event)
        if token:
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(f"UPDATE {SCHEMA}.sessions SET expires_at=NOW() WHERE token=%s", (token,))
            conn.commit()
            conn.close()
        return respond(200, {'ok': True})

    # ── change-password ───────────────────────────────────────────────────────
    if action == 'change-password' and method == 'PUT':
        token = extract_token(event)
        if not token:
            return respond(401, {'error': 'Не авторизован'})
        body = json.loads(event.get('body') or '{}')
        old_pw = body.get('old_password') or ''
        new_pw = body.get('new_password') or ''
        if not old_pw or not new_pw:
            return respond(400, {'error': 'Укажите старый и новый пароль'})
        if len(new_pw) < 8:
            return respond(400, {'error': 'Пароль минимум 8 символов'})

        conn = get_conn()
        cur = conn.cursor()
        user = get_session_user(cur, token)
        if not user:
            conn.close()
            return respond(401, {'error': 'Не авторизован'})

        cur.execute(f"SELECT password_hash FROM {SCHEMA}.users WHERE id=%s", (user['id'],))
        pw_hash = cur.fetchone()[0]
        if not check_password(old_pw, pw_hash):
            conn.close()
            return respond(400, {'error': 'Текущий пароль введён неверно'})

        cur.execute(f"UPDATE {SCHEMA}.users SET password_hash=%s WHERE id=%s", (hash_password(new_pw), user['id']))
        cur.execute(f"UPDATE {SCHEMA}.sessions SET expires_at=NOW() WHERE user_id=%s AND token!=%s", (user['id'], token))
        conn.commit()
        conn.close()
        return respond(200, {'ok': True, 'message': 'Пароль успешно изменён'})

    return respond(404, {'error': 'Not found'})
