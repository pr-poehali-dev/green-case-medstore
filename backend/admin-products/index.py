"""
CRUD для товаров каталога. Доступно: admin, content.
"""
import json
import os
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p61771184_green_case_medstore')
CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def get_user(event, conn):
    auth = event.get('headers', {}).get('X-Authorization', '') or \
           event.get('headers', {}).get('Authorization', '')
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
    if not row:
        return None
    return {'id': row[0], 'name': row[1], 'role': row[2]}


def row_to_product(row):
    return {
        'id': row[0], 'name': row[1], 'reg_name': row[2], 'category': row[3],
        'brand': row[4], 'ru_number': row[5], 'ru_valid': row[6],
        'status': row[7], 'specs': row[8] or [], 'description': row[9] or '',
        'files_count': row[10],
        'created_at': str(row[11]), 'updated_at': str(row[12]),
    }


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    conn = get_conn()

    # GET — список товаров (публичный доступ для витрины)
    if method == 'GET':
        cur = conn.cursor()
        q = f"SELECT id,name,reg_name,category,brand,ru_number,ru_valid,status,specs,description,files_count,created_at,updated_at FROM {SCHEMA}.products"
        filters, vals = [], []
        if params.get('status'):
            filters.append("status=%s"); vals.append(params['status'])
        if params.get('category'):
            filters.append("category=%s"); vals.append(params['category'])
        if params.get('q'):
            filters.append("(name ILIKE %s OR ru_number ILIKE %s)")
            vals += [f"%{params['q']}%", f"%{params['q']}%"]
        if filters:
            q += " WHERE " + " AND ".join(filters)
        q += " ORDER BY created_at DESC"
        cur.execute(q, vals)
        rows = cur.fetchall()
        conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps([row_to_product(r) for r in rows], ensure_ascii=False)}

    # POST — создать товар
    if method == 'POST':
        user = get_user(event, conn)
        if not user or user['role'] not in ('admin', 'content'):
            conn.close()
            return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Нет доступа'})}
        body = json.loads(event.get('body') or '{}')
        cur = conn.cursor()
        cur.execute(
            f"""INSERT INTO {SCHEMA}.products (name,reg_name,category,brand,ru_number,ru_valid,status,specs,description)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s::jsonb,%s) RETURNING id""",
            (body.get('name',''), body.get('reg_name',''), body.get('category',''),
             body.get('brand',''), body.get('ru_number',''), body.get('ru_valid',''),
             body.get('status','in_stock'), json.dumps(body.get('specs',[]), ensure_ascii=False),
             body.get('description',''))
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return {'statusCode': 201, 'headers': CORS, 'body': json.dumps({'id': new_id})}

    # PUT — обновить товар
    if method == 'PUT':
        user = get_user(event, conn)
        if not user or user['role'] not in ('admin', 'content'):
            conn.close()
            return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Нет доступа'})}
        body = json.loads(event.get('body') or '{}')
        pid = body.get('id')
        if not pid:
            conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'id обязателен'})}
        cur = conn.cursor()
        cur.execute(
            f"""UPDATE {SCHEMA}.products
                SET name=%s, reg_name=%s, category=%s, brand=%s,
                    ru_number=%s, ru_valid=%s, status=%s, specs=%s::jsonb,
                    description=%s, updated_at=NOW()
                WHERE id=%s""",
            (body.get('name',''), body.get('reg_name',''), body.get('category',''),
             body.get('brand',''), body.get('ru_number',''), body.get('ru_valid',''),
             body.get('status','in_stock'), json.dumps(body.get('specs',[]), ensure_ascii=False),
             body.get('description',''), pid)
        )
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

    conn.close()
    return {'statusCode': 405, 'headers': CORS, 'body': json.dumps({'error': 'Method not allowed'})}
