"""
CRUD для клиентов. Доступно: developer, admin, manager, accountant.
DELETE — только developer и admin.
"""
import json
import os
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p61771184_green_case_medstore')
CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def get_user(event, conn):
    auth = (event.get('headers') or {}).get('X-Authorization', '') or \
           (event.get('headers') or {}).get('Authorization', '')
    token = auth.replace('Bearer ', '').strip()
    if not token:
        return None
    cur = conn.cursor()
    cur.execute(
        f"""SELECT u.id, u.name, u.role FROM {SCHEMA}.sessions s
            JOIN {SCHEMA}.users u ON u.id=s.user_id
            WHERE s.token=%s AND s.expires_at>NOW() AND u.is_active=true""",
        (token,)
    )
    row = cur.fetchone()
    return {'id': row[0], 'name': row[1], 'role': row[2]} if row else None


def row_to_client(row):
    return {
        'id': row[0], 'name': row[1], 'inn': row[2] or '', 'kpp': row[3] or '',
        'type': row[4], 'discount': row[5], 'deals_count': row[6],
        'total_amount': row[7], 'created_at': str(row[8]),
    }


def respond(status, body):
    return {'statusCode': status, 'headers': CORS, 'body': json.dumps(body, ensure_ascii=False)}


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    conn = get_conn()
    user = get_user(event, conn)
    if not user or user['role'] not in ('admin', 'manager', 'accountant', 'developer'):
        conn.close()
        return respond(403, {'error': 'Нет доступа'})

    is_privileged = user['role'] in ('developer', 'admin')
    cur = conn.cursor()

    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        q = f"SELECT id,name,inn,kpp,type,discount,deals_count,total_amount,created_at FROM {SCHEMA}.clients"
        filters, vals = [], []
        if params.get('q'):
            filters.append("(name ILIKE %s OR inn ILIKE %s)")
            vals += [f"%{params['q']}%", f"%{params['q']}%"]
        if params.get('type'):
            filters.append("type=%s"); vals.append(params['type'])
        if filters:
            q += " WHERE " + " AND ".join(filters)
        q += " ORDER BY total_amount DESC"
        cur.execute(q, vals)
        rows = cur.fetchall()
        conn.close()
        return respond(200, [row_to_client(r) for r in rows])

    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        cur.execute(
            f"INSERT INTO {SCHEMA}.clients (name,inn,kpp,type,discount) VALUES (%s,%s,%s,%s,%s) RETURNING id",
            (body.get('name', ''), body.get('inn', ''), body.get('kpp', ''),
             body.get('type', 'private'), body.get('discount', 0))
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return respond(201, {'id': new_id})

    if method == 'PUT':
        body = json.loads(event.get('body') or '{}')
        cid = body.get('id')
        cur.execute(
            f"""UPDATE {SCHEMA}.clients
                SET name=%s, inn=%s, kpp=%s, type=%s, discount=%s
                WHERE id=%s""",
            (body.get('name', ''), body.get('inn', ''), body.get('kpp', ''),
             body.get('type', 'private'), body.get('discount', 0), cid)
        )
        conn.commit()
        conn.close()
        return respond(200, {'ok': True})

    if method == 'DELETE':
        if not is_privileged:
            conn.close()
            return respond(403, {'error': 'Недостаточно прав'})
        params = event.get('queryStringParameters') or {}
        cid = params.get('id')
        if not cid:
            conn.close()
            return respond(400, {'error': 'id обязателен'})
        # Каскадно удаляем: комментарии → этапы → сделки → клиент
        cur.execute(
            f"""DELETE FROM {SCHEMA}.deal_comments
                WHERE stage_id IN (
                    SELECT s.id FROM {SCHEMA}.deal_stages s
                    JOIN {SCHEMA}.deals d ON d.id=s.deal_id
                    WHERE d.client_id=%s
                )""",
            (cid,)
        )
        cur.execute(
            f"""DELETE FROM {SCHEMA}.deal_stages
                WHERE deal_id IN (SELECT id FROM {SCHEMA}.deals WHERE client_id=%s)""",
            (cid,)
        )
        cur.execute(f"DELETE FROM {SCHEMA}.deals WHERE client_id=%s", (cid,))
        cur.execute(f"DELETE FROM {SCHEMA}.clients WHERE id=%s", (cid,))
        conn.commit()
        conn.close()
        return respond(200, {'ok': True})

    conn.close()
    return respond(405, {'error': 'Method not allowed'})
