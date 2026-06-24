"""
Управление пользователями системы.
Иерархия ролей (кто что может):
  developer  — полный доступ, создаёт/редактирует/деактивирует любых пользователей,
               может назначать роль admin и developer
  admin      — создаёт/редактирует пользователей с ролями manager/content/accountant,
               НЕ может трогать developer и других admin
  manager / content / accountant — только чтение своего профиля (через /me в auth)
"""
import json
import os
import secrets
import bcrypt
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p61771184_green_case_medstore')

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization',
}

# Роли, упорядоченные по уровню доступа
ROLE_LEVEL = {
    'developer': 100,
    'admin': 50,
    'manager': 10,
    'content': 10,
    'accountant': 10,
}

ROLE_LABELS = {
    'developer': 'Разработчик',
    'admin': 'Администратор',
    'manager': 'Менеджер по продажам',
    'content': 'Контент-менеджер',
    'accountant': 'Бухгалтер',
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


def can_manage(actor_role: str, target_role: str) -> bool:
    """Может ли actor управлять пользователем с ролью target."""
    return ROLE_LEVEL.get(actor_role, 0) > ROLE_LEVEL.get(target_role, 0)


def can_assign_role(actor_role: str, new_role: str) -> bool:
    """Может ли actor назначить роль new_role.
    developer может назначать любую роль (включая developer и admin).
    admin может назначать роли с уровнем ниже своего (manager/content/accountant).
    """
    if actor_role == 'developer':
        return True
    return ROLE_LEVEL.get(actor_role, 0) > ROLE_LEVEL.get(new_role, 0)


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt(rounds=12)).decode()


def generate_temp_password() -> str:
    return secrets.token_urlsafe(12)


def row_to_user(row) -> dict:
    return {
        'id': row[0], 'name': row[1], 'email': row[2], 'role': row[3],
        'is_active': row[4],
        'last_login': str(row[5]) if row[5] else None,
        'created_at': str(row[6]),
        'created_by': row[7],
    }


def respond(status: int, body) -> dict:
    return {'statusCode': status, 'headers': CORS, 'body': json.dumps(body, ensure_ascii=False)}


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = (event.get('path') or '').rstrip('/')

    conn = get_conn()
    cur = conn.cursor()
    token = extract_token(event)
    actor = get_session_user(cur, token)

    if not actor:
        conn.close()
        return respond(401, {'error': 'Не авторизован'})

    actor_level = ROLE_LEVEL.get(actor['role'], 0)
    if actor_level < 50:
        conn.close()
        return respond(403, {'error': 'Недостаточно прав'})

    # ── GET / — список пользователей ─────────────────────────────────────────
    if method == 'GET':
        if actor['role'] == 'developer':
            cur.execute(
                f"""SELECT id, name, email, role, is_active, last_login, created_at, created_by
                    FROM {SCHEMA}.users ORDER BY created_at"""
            )
        else:
            # admin видит только пользователей с уровнем ниже своего
            cur.execute(
                f"""SELECT id, name, email, role, is_active, last_login, created_at, created_by
                    FROM {SCHEMA}.users
                    WHERE role NOT IN ('developer', 'admin')
                    ORDER BY created_at"""
            )
        rows = cur.fetchall()
        conn.close()
        return respond(200, [row_to_user(r) for r in rows])

    # ── POST / — создать пользователя ────────────────────────────────────────
    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        name = (body.get('name') or '').strip()
        email = (body.get('email') or '').strip().lower()
        role = (body.get('role') or '').strip()
        password = (body.get('password') or '').strip()

        if not name or not email or not role:
            conn.close()
            return respond(400, {'error': 'Имя, email и роль обязательны'})

        if role not in ROLE_LEVEL:
            conn.close()
            return respond(400, {'error': f'Недопустимая роль. Допустимые: {", ".join(ROLE_LEVEL.keys())}'})

        if not can_assign_role(actor['role'], role):
            conn.close()
            return respond(403, {'error': f'Вы не можете назначить роль «{ROLE_LABELS.get(role, role)}»'})

        # Проверить уникальность email
        cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE email=%s", (email,))
        if cur.fetchone():
            conn.close()
            return respond(409, {'error': 'Пользователь с таким email уже существует'})

        if not password:
            password = generate_temp_password()
            is_temp = True
        else:
            is_temp = False

        if len(password) < 8:
            conn.close()
            return respond(400, {'error': 'Пароль должен содержать минимум 8 символов'})

        pw_hash = hash_password(password)
        cur.execute(
            f"""INSERT INTO {SCHEMA}.users (name, email, password_hash, role, created_by)
                VALUES (%s, %s, %s, %s, %s) RETURNING id""",
            (name, email, pw_hash, role, actor['id'])
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        conn.close()

        result = {'id': new_id, 'name': name, 'email': email, 'role': role}
        if is_temp:
            result['temp_password'] = password
            result['message'] = 'Пользователь создан. Передайте временный пароль. При первом входе рекомендуется его сменить.'
        return respond(201, result)

    # ── PUT / — редактировать пользователя ────────────────────────────────────
    if method == 'PUT':
        body = json.loads(event.get('body') or '{}')
        target_id = body.get('id')
        if not target_id:
            conn.close()
            return respond(400, {'error': 'id обязателен'})

        # Загрузить целевого пользователя
        cur.execute(
            f"SELECT id, name, email, role, is_active FROM {SCHEMA}.users WHERE id=%s",
            (target_id,)
        )
        t_row = cur.fetchone()
        if not t_row:
            conn.close()
            return respond(404, {'error': 'Пользователь не найден'})

        t_id, t_name, t_email, t_role, t_active = t_row

        # Нельзя редактировать себя через этот endpoint (только через change-password в auth)
        if t_id == actor['id']:
            conn.close()
            return respond(400, {'error': 'Для изменения своего профиля используйте настройки аккаунта'})

        if not can_manage(actor['role'], t_role):
            conn.close()
            return respond(403, {'error': 'Вы не можете редактировать этого пользователя'})

        fields, vals = [], []

        if 'name' in body and body['name']:
            fields.append("name=%s"); vals.append(body['name'].strip())

        if 'email' in body and body['email']:
            new_email = body['email'].strip().lower()
            if new_email != t_email:
                cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE email=%s AND id!=%s", (new_email, t_id))
                if cur.fetchone():
                    conn.close()
                    return respond(409, {'error': 'Email уже занят другим пользователем'})
                fields.append("email=%s"); vals.append(new_email)

        if 'role' in body:
            new_role = body['role']
            if new_role not in ROLE_LEVEL:
                conn.close()
                return respond(400, {'error': 'Недопустимая роль'})
            if not can_assign_role(actor['role'], new_role):
                conn.close()
                return respond(403, {'error': f'Нельзя назначить роль «{ROLE_LABELS.get(new_role, new_role)}»'})
            fields.append("role=%s"); vals.append(new_role)

        if 'is_active' in body:
            fields.append("is_active=%s"); vals.append(bool(body['is_active']))

        if 'password' in body and body['password']:
            new_pw = body['password']
            if len(new_pw) < 8:
                conn.close()
                return respond(400, {'error': 'Пароль минимум 8 символов'})
            fields.append("password_hash=%s"); vals.append(hash_password(new_pw))
            # При смене пароля — инвалидировать все сессии пользователя
            cur.execute(f"UPDATE {SCHEMA}.sessions SET expires_at=NOW() WHERE user_id=%s", (t_id,))

        if not fields:
            conn.close()
            return respond(400, {'error': 'Нет полей для обновления'})

        vals.append(t_id)
        cur.execute(f"UPDATE {SCHEMA}.users SET {', '.join(fields)} WHERE id=%s", vals)
        conn.commit()
        conn.close()
        return respond(200, {'ok': True})

    conn.close()
    return respond(405, {'error': 'Method not allowed'})