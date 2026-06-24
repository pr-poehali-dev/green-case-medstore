"""
CRUD для сделок клиентов: deals, deal_stages, deal_comments.
Роутинг через ?resource=stages|comments|deals (default).
Доступно: developer, admin, manager.
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


def respond(status, body):
    return {'statusCode': status, 'headers': CORS, 'body': json.dumps(body, ensure_ascii=False)}


def _stage_row(r):
    return {
        'id': r[0], 'deal_id': r[1], 'title': r[2], 'status': r[3],
        'taken_by': r[4], 'taken_at': str(r[5]) if r[5] else None,
        'completed_at': str(r[6]) if r[6] else None, 'created_at': str(r[7]),
    }


def _deal_row(r):
    return {
        'id': r[0], 'client_id': r[1], 'title': r[2], 'description': r[3] or '',
        'status': r[4], 'created_at': str(r[5]), 'updated_at': str(r[6]),
        'created_by_name': r[7] or '', 'stages_total': r[8] or 0, 'stages_done': r[9] or 0,
    }


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    resource = params.get('resource', 'deals')  # deals | stages | comments

    conn = get_conn()
    user = get_user(event, conn)

    if not user or user['role'] not in ('developer', 'admin', 'manager'):
        conn.close()
        return respond(403, {'error': 'Нет доступа'})

    is_privileged = user['role'] in ('developer', 'admin')
    cur = conn.cursor()

    # ══════════════════════════════════════════════════════════════════════════
    # COMMENTS
    # ══════════════════════════════════════════════════════════════════════════
    if resource == 'comments':
        if method == 'GET':
            stage_id = params.get('stage_id')
            cur.execute(
                f"SELECT id,stage_id,author,text,created_at FROM {SCHEMA}.deal_comments WHERE stage_id=%s ORDER BY created_at",
                (stage_id,)
            )
            rows = cur.fetchall()
            conn.close()
            return respond(200, [{'id': r[0], 'stage_id': r[1], 'author': r[2], 'text': r[3], 'created_at': str(r[4])} for r in rows])

        if method == 'POST':
            body = json.loads(event.get('body') or '{}')
            text = (body.get('text') or '').strip()
            if not text:
                conn.close()
                return respond(400, {'error': 'Текст комментария обязателен'})
            cur.execute(
                f"INSERT INTO {SCHEMA}.deal_comments (stage_id,author,text) VALUES (%s,%s,%s) RETURNING id,created_at",
                (body.get('stage_id'), user['name'], text)
            )
            row = cur.fetchone()
            conn.commit()
            conn.close()
            return respond(201, {'id': row[0], 'stage_id': body.get('stage_id'), 'author': user['name'], 'text': text, 'created_at': str(row[1])})

    # ══════════════════════════════════════════════════════════════════════════
    # STAGES
    # ══════════════════════════════════════════════════════════════════════════
    if resource == 'stages':
        if method == 'GET':
            deal_id = params.get('deal_id')
            cur.execute(
                f"""SELECT id,deal_id,title,status,taken_by,taken_at,completed_at,created_at
                    FROM {SCHEMA}.deal_stages WHERE deal_id=%s ORDER BY created_at""",
                (deal_id,)
            )
            rows = cur.fetchall()
            conn.close()
            return respond(200, [_stage_row(r) for r in rows])

        if method == 'POST':
            body = json.loads(event.get('body') or '{}')
            title = (body.get('title') or '').strip()
            if not title:
                conn.close()
                return respond(400, {'error': 'Название этапа обязательно'})
            cur.execute(
                f"INSERT INTO {SCHEMA}.deal_stages (deal_id,title) VALUES (%s,%s) RETURNING id,created_at",
                (body.get('deal_id'), title)
            )
            row = cur.fetchone()
            conn.commit()
            conn.close()
            return respond(201, {'id': row[0], 'deal_id': body.get('deal_id'), 'title': title,
                                  'status': 'pending', 'taken_by': None, 'taken_at': None,
                                  'completed_at': None, 'created_at': str(row[1])})

        if method == 'PUT':
            body = json.loads(event.get('body') or '{}')
            stage_id = body.get('id')
            action = body.get('action')

            if action == 'take':
                cur.execute(
                    f"UPDATE {SCHEMA}.deal_stages SET status='in_work', taken_by=%s, taken_at=NOW() WHERE id=%s",
                    (user['name'], stage_id)
                )
            elif action == 'complete':
                cur.execute(
                    f"UPDATE {SCHEMA}.deal_stages SET status='done', completed_at=NOW() WHERE id=%s",
                    (stage_id,)
                )
            elif action == 'reopen':
                cur.execute(
                    f"UPDATE {SCHEMA}.deal_stages SET status='pending', taken_by=NULL, taken_at=NULL, completed_at=NULL WHERE id=%s",
                    (stage_id,)
                )
            elif body.get('title'):
                cur.execute(f"UPDATE {SCHEMA}.deal_stages SET title=%s WHERE id=%s", (body['title'], stage_id))

            conn.commit()
            cur.execute(
                f"SELECT id,deal_id,title,status,taken_by,taken_at,completed_at,created_at FROM {SCHEMA}.deal_stages WHERE id=%s",
                (stage_id,)
            )
            row = cur.fetchone()
            conn.close()
            return respond(200, _stage_row(row))

        if method == 'DELETE':
            if not is_privileged:
                conn.close()
                return respond(403, {'error': 'Недостаточно прав'})
            stage_id = params.get('id')
            cur.execute(f"UPDATE {SCHEMA}.deal_stages SET deal_id=deal_id WHERE id=%s", (stage_id,))
            conn.close()
            return respond(200, {'ok': True})

    # ══════════════════════════════════════════════════════════════════════════
    # DEALS
    # ══════════════════════════════════════════════════════════════════════════
    if method == 'GET':
        client_id = params.get('client_id')
        if not client_id:
            conn.close()
            return respond(400, {'error': 'client_id обязателен'})
        cur.execute(
            f"""SELECT d.id, d.client_id, d.title, d.description, d.status,
                       d.created_at, d.updated_at, u.name as created_by_name,
                       COUNT(s.id) as stages_total,
                       SUM(CASE WHEN s.status='done' THEN 1 ELSE 0 END) as stages_done
                FROM {SCHEMA}.deals d
                LEFT JOIN {SCHEMA}.users u ON u.id=d.created_by
                LEFT JOIN {SCHEMA}.deal_stages s ON s.deal_id=d.id
                WHERE d.client_id=%s
                GROUP BY d.id, u.name
                ORDER BY d.created_at DESC""",
            (client_id,)
        )
        rows = cur.fetchall()
        conn.close()
        return respond(200, [_deal_row(r) for r in rows])

    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        title = (body.get('title') or '').strip()
        if not title:
            conn.close()
            return respond(400, {'error': 'Название обязательно'})
        cur.execute(
            f"""INSERT INTO {SCHEMA}.deals (client_id,title,description,created_by)
                VALUES (%s,%s,%s,%s) RETURNING id,created_at""",
            (body.get('client_id'), title, body.get('description', ''), user['id'])
        )
        row = cur.fetchone()
        deal_id = row[0]
        for stage_title in (body.get('stages') or []):
            if (stage_title or '').strip():
                cur.execute(
                    f"INSERT INTO {SCHEMA}.deal_stages (deal_id,title) VALUES (%s,%s)",
                    (deal_id, stage_title.strip())
                )
        conn.commit()
        conn.close()
        return respond(201, {'id': deal_id, 'created_at': str(row[1])})

    if method == 'PUT':
        body = json.loads(event.get('body') or '{}')
        deal_id = body.get('id')
        fields, vals = [], []
        if 'title' in body:
            fields.append("title=%s"); vals.append(body['title'])
        if 'description' in body:
            fields.append("description=%s"); vals.append(body['description'])
        if 'status' in body:
            fields.append("status=%s"); vals.append(body['status'])
        if not fields:
            conn.close()
            return respond(400, {'error': 'Нет полей для обновления'})
        fields.append("updated_at=NOW()")
        vals.append(deal_id)
        cur.execute(f"UPDATE {SCHEMA}.deals SET {', '.join(fields)} WHERE id=%s", vals)
        conn.commit()
        conn.close()
        return respond(200, {'ok': True})

    if method == 'DELETE':
        if not is_privileged:
            conn.close()
            return respond(403, {'error': 'Недостаточно прав'})
        deal_id = params.get('id')
        cur.execute(
            f"""DELETE FROM {SCHEMA}.deal_comments
                WHERE stage_id IN (SELECT id FROM {SCHEMA}.deal_stages WHERE deal_id=%s)""",
            (deal_id,)
        )
        cur.execute(f"DELETE FROM {SCHEMA}.deal_stages WHERE deal_id=%s", (deal_id,))
        cur.execute(f"DELETE FROM {SCHEMA}.deals WHERE id=%s", (deal_id,))
        conn.commit()
        conn.close()
        return respond(200, {'ok': True})

    conn.close()
    return respond(405, {'error': 'Method not allowed'})