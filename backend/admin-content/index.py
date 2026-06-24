"""
CRUD для статей и новостей. Доступно: admin, content.
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


def row_to_article(row):
    return {
        'id': row[0], 'title': row[1], 'type': row[2], 'status': row[3],
        'body': row[4] or '', 'author': row[5] or '',
        'created_at': str(row[6]), 'updated_at': str(row[7]),
    }


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    conn = get_conn()

    # GET — публичный (для блога на сайте)
    if method == 'GET':
        cur = conn.cursor()
        cur.execute(
            f"SELECT id,title,type,status,body,author,created_at,updated_at FROM {SCHEMA}.articles ORDER BY created_at DESC"
        )
        rows = cur.fetchall()
        conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps([row_to_article(r) for r in rows], ensure_ascii=False)}

    user = get_user(event, conn)
    if not user or user['role'] not in ('admin', 'content', 'developer'):
        conn.close()
        return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Нет доступа'})}

    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        cur = conn.cursor()
        cur.execute(
            f"INSERT INTO {SCHEMA}.articles (title,type,status,body,author) VALUES (%s,%s,%s,%s,%s) RETURNING id",
            (body.get('title',''), body.get('type','Статья'),
             body.get('status','Черновик'), body.get('body',''), user['name'])
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return {'statusCode': 201, 'headers': CORS, 'body': json.dumps({'id': new_id})}

    if method == 'PUT':
        body = json.loads(event.get('body') or '{}')
        aid = body.get('id')
        cur = conn.cursor()
        cur.execute(
            f"""UPDATE {SCHEMA}.articles
                SET title=%s, type=%s, status=%s, body=%s, updated_at=NOW()
                WHERE id=%s""",
            (body.get('title',''), body.get('type','Статья'),
             body.get('status','Черновик'), body.get('body',''), aid)
        )
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

    conn.close()
    return {'statusCode': 405, 'headers': CORS, 'body': json.dumps({'error': 'Method not allowed'})}