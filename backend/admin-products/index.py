"""
CRUD для товаров каталога.
GET    /          — список (публично, с фильтрами q/status/category)
POST   /          — создать товар (admin/content)
PUT    /          — обновить товар (admin/content)
DELETE /          — удалить товар (admin/content)
POST   ?action=upload-photo  — загрузить фото в S3, вернуть URL
POST   ?action=csv-import    — импорт из CSV-текста
"""
import json, os, base64, io, csv, uuid, boto3
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


def get_s3():
    return boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )


def cdn_url(key: str) -> str:
    ak = os.environ['AWS_ACCESS_KEY_ID']
    return f"https://cdn.poehali.dev/projects/{ak}/bucket/{key}"


def row_to_product(row):
    return {
        'id': row[0], 'name': row[1], 'reg_name': row[2] or '',
        'category': row[3] or '', 'brand': row[4] or '',
        'ru_number': row[5] or '', 'ru_valid': row[6] or '',
        'status': row[7], 'specs': row[8] or [],
        'description': row[9] or '', 'files_count': row[10] or 0,
        'photos': row[11] or [],
        'complectation': row[12] or [],
        'certs': row[13] or [],
        'created_at': str(row[14]), 'updated_at': str(row[15]),
    }


SELECT_COLS = "id,name,reg_name,category,brand,ru_number,ru_valid,status,specs,description,files_count,photos,complectation,certs,created_at,updated_at"


def respond(status: int, body) -> dict:
    return {'statusCode': status, 'headers': CORS, 'body': json.dumps(body, ensure_ascii=False)}


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')

    # ── Загрузка фото в S3 ────────────────────────────────────────────────────
    if action == 'upload-photo' and method == 'POST':
        conn = get_conn()
        user = get_user(event, conn)
        conn.close()
        if not user or user['role'] not in ('admin', 'content', 'developer'):
            return respond(403, {'error': 'Нет доступа'})

        body = json.loads(event.get('body') or '{}')
        b64 = body.get('data', '')
        mime = body.get('mime', 'image/jpeg')
        if not b64:
            return respond(400, {'error': 'data обязателен'})

        ext = mime.split('/')[-1].replace('jpeg', 'jpg')
        key = f"products/{uuid.uuid4().hex}.{ext}"
        img_bytes = base64.b64decode(b64)

        s3 = get_s3()
        s3.put_object(Bucket='files', Key=key, Body=img_bytes, ContentType=mime)
        return respond(200, {'url': cdn_url(key), 'key': key})

    # ── CSV-импорт ────────────────────────────────────────────────────────────
    if action == 'csv-import' and method == 'POST':
        conn = get_conn()
        user = get_user(event, conn)
        if not user or user['role'] not in ('admin', 'content', 'developer'):
            conn.close()
            return respond(403, {'error': 'Нет доступа'})

        body = json.loads(event.get('body') or '{}')
        csv_text = body.get('csv', '')
        if not csv_text:
            conn.close()
            return respond(400, {'error': 'csv поле обязательно'})

        reader = csv.DictReader(io.StringIO(csv_text))
        cur = conn.cursor()
        imported = 0
        errors = []
        for i, row in enumerate(reader):
            name = (row.get('name') or row.get('название') or '').strip()
            if not name:
                errors.append(f"Строка {i+2}: нет названия")
                continue
            specs_raw = (row.get('specs') or row.get('характеристики') or '')
            specs = [s.strip() for s in specs_raw.split(';') if s.strip()]
            try:
                cur.execute(
                    f"""INSERT INTO {SCHEMA}.products
                        (name,reg_name,category,brand,ru_number,ru_valid,status,specs,description)
                        VALUES (%s,%s,%s,%s,%s,%s,%s,%s::jsonb,%s)""",
                    (name,
                     (row.get('reg_name') or row.get('рег_название') or '').strip(),
                     (row.get('category') or row.get('категория') or '').strip(),
                     (row.get('brand') or row.get('бренд') or '').strip(),
                     (row.get('ru_number') or row.get('ру_номер') or '').strip(),
                     (row.get('ru_valid') or row.get('ру_действует') or '').strip(),
                     (row.get('status') or 'in_stock').strip(),
                     json.dumps(specs, ensure_ascii=False),
                     (row.get('description') or row.get('описание') or '').strip())
                )
                imported += 1
            except Exception as e:
                errors.append(f"Строка {i+2}: {str(e)[:80]}")

        conn.commit()
        conn.close()
        return respond(200, {'imported': imported, 'errors': errors})

    # ── GET — список товаров (публично) ───────────────────────────────────────
    if method == 'GET':
        conn = get_conn()
        cur = conn.cursor()
        q = f"SELECT {SELECT_COLS} FROM {SCHEMA}.products"
        filters, vals = [], []
        if params.get('status'):
            filters.append("status=%s"); vals.append(params['status'])
        if params.get('category'):
            filters.append("category=%s"); vals.append(params['category'])
        if params.get('q'):
            filters.append("(name ILIKE %s OR ru_number ILIKE %s OR brand ILIKE %s)")
            vals += [f"%{params['q']}%", f"%{params['q']}%", f"%{params['q']}%"]
        if filters:
            q += " WHERE " + " AND ".join(filters)
        q += " ORDER BY created_at DESC"
        cur.execute(q, vals)
        rows = cur.fetchall()
        conn.close()
        return respond(200, [row_to_product(r) for r in rows])

    # ── POST — создать товар ──────────────────────────────────────────────────
    if method == 'POST':
        conn = get_conn()
        user = get_user(event, conn)
        if not user or user['role'] not in ('admin', 'content', 'developer'):
            conn.close()
            return respond(403, {'error': 'Нет доступа'})
        body = json.loads(event.get('body') or '{}')
        if not body.get('name'):
            conn.close()
            return respond(400, {'error': 'Название обязательно'})
        cur = conn.cursor()
        cur.execute(
            f"""INSERT INTO {SCHEMA}.products
                (name,reg_name,category,brand,ru_number,ru_valid,status,specs,description,photos,complectation,certs)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s::jsonb,%s,%s::jsonb,%s::jsonb,%s::jsonb)
                RETURNING id""",
            (body.get('name',''), body.get('reg_name',''), body.get('category',''),
             body.get('brand',''), body.get('ru_number',''), body.get('ru_valid',''),
             body.get('status','in_stock'),
             json.dumps(body.get('specs',[]), ensure_ascii=False),
             body.get('description',''),
             json.dumps(body.get('photos',[]), ensure_ascii=False),
             json.dumps(body.get('complectation',[]), ensure_ascii=False),
             json.dumps(body.get('certs',[]), ensure_ascii=False))
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return respond(201, {'id': new_id})

    # ── PUT — обновить товар ──────────────────────────────────────────────────
    if method == 'PUT':
        conn = get_conn()
        user = get_user(event, conn)
        if not user or user['role'] not in ('admin', 'content', 'developer'):
            conn.close()
            return respond(403, {'error': 'Нет доступа'})
        body = json.loads(event.get('body') or '{}')
        pid = body.get('id')
        if not pid:
            conn.close()
            return respond(400, {'error': 'id обязателен'})
        cur = conn.cursor()
        cur.execute(
            f"""UPDATE {SCHEMA}.products
                SET name=%s, reg_name=%s, category=%s, brand=%s,
                    ru_number=%s, ru_valid=%s, status=%s,
                    specs=%s::jsonb, description=%s,
                    photos=%s::jsonb, complectation=%s::jsonb, certs=%s::jsonb,
                    updated_at=NOW()
                WHERE id=%s""",
            (body.get('name',''), body.get('reg_name',''), body.get('category',''),
             body.get('brand',''), body.get('ru_number',''), body.get('ru_valid',''),
             body.get('status','in_stock'),
             json.dumps(body.get('specs',[]), ensure_ascii=False),
             body.get('description',''),
             json.dumps(body.get('photos',[]), ensure_ascii=False),
             json.dumps(body.get('complectation',[]), ensure_ascii=False),
             json.dumps(body.get('certs',[]), ensure_ascii=False),
             pid)
        )
        conn.commit()
        conn.close()
        return respond(200, {'ok': True})

    # ── DELETE — удалить товар ────────────────────────────────────────────────
    if method == 'DELETE':
        conn = get_conn()
        user = get_user(event, conn)
        if not user or user['role'] not in ('admin', 'developer'):
            conn.close()
            return respond(403, {'error': 'Нет доступа'})
        body = json.loads(event.get('body') or '{}')
        pid = body.get('id') or params.get('id')
        if not pid:
            conn.close()
            return respond(400, {'error': 'id обязателен'})
        cur = conn.cursor()
        cur.execute(f"UPDATE {SCHEMA}.products SET status='discontinued' WHERE id=%s", (pid,))
        conn.commit()
        conn.close()
        return respond(200, {'ok': True})

    conn = get_conn()
    conn.close()
    return respond(405, {'error': 'Method not allowed'})
