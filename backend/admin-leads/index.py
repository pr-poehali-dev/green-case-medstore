"""
CRUD для заявок (leads).
POST / — публичная форма, без авторизации.
GET, PUT, POST /history — только admin/manager.
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
    return {'id': row[0], 'name': row[1], 'role': row[2]} if row else None


def row_to_lead(row):
    return {
        'id': row[0], 'type': row[1], 'org': row[2], 'contact': row[3],
        'phone': row[4], 'email': row[5] or '', 'inn': row[6] or '',
        'amount': row[7], 'status': row[8], 'manager': row[9] or '',
        'comment': row[10] or '', 'product': row[11] or '',
        'created_at': str(row[12]), 'updated_at': str(row[13]),
    }


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = event.get('path', '')
    conn = get_conn()

    # POST / — публичная форма отправки заявки (без авторизации)
    if method == 'POST' and 'history' not in path:
        body = json.loads(event.get('body') or '{}')
        cur = conn.cursor()
        cur.execute(
            f"""INSERT INTO {SCHEMA}.leads
                    (type, org, contact, phone, email, inn, comment, product, amount, status, manager)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,0,'new','')
                RETURNING id""",
            (
                body.get('type', 'kp'),
                body.get('org', ''),
                body.get('contact', ''),
                body.get('phone', ''),
                body.get('email', ''),
                body.get('inn', ''),
                body.get('comment', ''),
                body.get('product', ''),
            )
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return {'statusCode': 201, 'headers': CORS, 'body': json.dumps({'id': new_id})}

    # Все остальные методы — только admin/manager
    user = get_user(event, conn)
    if not user or user['role'] not in ('admin', 'manager'):
        conn.close()
        return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Нет доступа'})}

    # GET /history?lead_id=X
    if method == 'GET' and 'history' in path:
        params = event.get('queryStringParameters') or {}
        lead_id = params.get('lead_id')
        cur = conn.cursor()
        cur.execute(
            f"SELECT id,lead_id,author,text,created_at FROM {SCHEMA}.lead_history WHERE lead_id=%s ORDER BY created_at",
            (lead_id,)
        )
        rows = cur.fetchall()
        conn.close()
        result = [{'id': r[0], 'lead_id': r[1], 'author': r[2], 'text': r[3], 'created_at': str(r[4])} for r in rows]
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(result, ensure_ascii=False)}

    # POST /history — добавить комментарий
    if method == 'POST' and 'history' in path:
        body = json.loads(event.get('body') or '{}')
        cur = conn.cursor()
        cur.execute(
            f"INSERT INTO {SCHEMA}.lead_history (lead_id,author,text) VALUES (%s,%s,%s)",
            (body.get('lead_id'), user['name'], body.get('text', ''))
        )
        conn.commit()
        conn.close()
        return {'statusCode': 201, 'headers': CORS, 'body': json.dumps({'ok': True})}

    # GET — список заявок
    if method == 'GET':
        cur = conn.cursor()
        cur.execute(
            f"""SELECT id,type,org,contact,phone,email,inn,amount,status,manager,comment,product,created_at,updated_at
                FROM {SCHEMA}.leads ORDER BY created_at DESC"""
        )
        rows = cur.fetchall()
        conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps([row_to_lead(r) for r in rows], ensure_ascii=False)}

    # PUT — обновить статус / менеджера
    if method == 'PUT':
        body = json.loads(event.get('body') or '{}')
        lid = body.get('id')
        cur = conn.cursor()
        fields, vals = [], []
        if 'status' in body:
            fields.append("status=%s"); vals.append(body['status'])
        if 'manager' in body:
            fields.append("manager=%s"); vals.append(body['manager'])
        if not fields:
            conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Нет полей для обновления'})}
        fields.append("updated_at=NOW()")
        vals.append(lid)
        cur.execute(f"UPDATE {SCHEMA}.leads SET {', '.join(fields)} WHERE id=%s", vals)
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

    conn.close()
    return {'statusCode': 405, 'headers': CORS, 'body': json.dumps({'error': 'Method not allowed'})}
