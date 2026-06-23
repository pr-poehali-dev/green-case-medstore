"""
Авторизация администраторов: login, logout, me, seed.
"""
import json
import os
import secrets
import hashlib
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p61771184_green_case_medstore')
CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def hash_password(password: str) -> str:
    """SHA-256 хэш пароля (простая схема без bcrypt)."""
    return hashlib.sha256(password.encode()).hexdigest()


def get_token(event: dict) -> str:
    auth = event.get('headers', {}).get('X-Authorization', '') or \
           event.get('headers', {}).get('Authorization', '')
    return auth.replace('Bearer ', '').strip()


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    path = event.get('path', '').rstrip('/')
    method = event.get('httpMethod', 'GET')

    # POST /login
    if method == 'POST' and path.endswith('/login'):
        body = json.loads(event.get('body') or '{}')
        email = body.get('email', '').strip().lower()
        password = body.get('password', '')
        if not email or not password:
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'email и пароль обязательны'})}

        pw_hash = hash_password(password)
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"SELECT id, name, email, role FROM {SCHEMA}.users WHERE email=%s AND password_hash=%s AND is_active=true",
            (email, pw_hash)
        )
        row = cur.fetchone()
        if not row:
            conn.close()
            return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Неверный email или пароль'})}

        user_id, name, user_email, role = row
        token = secrets.token_hex(48)
        cur.execute(
            f"INSERT INTO {SCHEMA}.sessions (user_id, token) VALUES (%s, %s)",
            (user_id, token)
        )
        conn.commit()
        conn.close()
        return {
            'statusCode': 200,
            'headers': CORS,
            'body': json.dumps({'token': token, 'user': {'id': user_id, 'name': name, 'email': user_email, 'role': role}})
        }

    # POST /logout
    if method == 'POST' and path.endswith('/logout'):
        token = get_token(event)
        if token:
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(f"UPDATE {SCHEMA}.sessions SET expires_at=NOW() WHERE token=%s", (token,))
            conn.commit()
            conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

    # GET /me
    if method == 'GET' and path.endswith('/me'):
        token = get_token(event)
        if not token:
            return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Не авторизован'})}
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"""SELECT u.id, u.name, u.email, u.role
                FROM {SCHEMA}.sessions s
                JOIN {SCHEMA}.users u ON u.id = s.user_id
                WHERE s.token=%s AND s.expires_at > NOW() AND u.is_active=true""",
            (token,)
        )
        row = cur.fetchone()
        conn.close()
        if not row:
            return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Сессия истекла'})}
        uid, name, email, role = row
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'id': uid, 'name': name, 'email': email, 'role': role})}

    # POST /seed — заполнить БД тестовыми данными (только admin)
    if method == 'POST' and path.endswith('/seed'):
        token = get_token(event)
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"""SELECT u.role FROM {SCHEMA}.sessions s
                JOIN {SCHEMA}.users u ON u.id=s.user_id
                WHERE s.token=%s AND s.expires_at>NOW()""", (token,)
        )
        row = cur.fetchone()
        if not row or row[0] != 'admin':
            conn.close()
            return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Только для администратора'})}

        # Seed admin user if not exists
        admin_hash = hash_password('Admin123!')
        cur.execute(
            f"INSERT INTO {SCHEMA}.users (name,email,password_hash,role) VALUES (%s,%s,%s,'admin') ON CONFLICT (email) DO NOTHING",
            ('Алексей Козлов', 'admin@greencase.ru', admin_hash)
        )

        # Seed products
        products = [
            ('Эндоскопическая видеосистема Full HD','Видеосистема медицинская','Видеосистемы','MedTech Optix','РЗН 2023/19847','12.2028','in_stock','["4K UHD сенсор","NBI-режим","Глубина 1.5–100 мм"]'),
            ('Кольпоскоп оптический бинокулярный','Кольпоскоп КС-01','Гинекология','GynoVision','РЗН 2022/16204','06.2027','order','["Увеличение ×4–×25","LED 50 000 ч","Зелёный фильтр"]'),
            ('Аппарат электрохирургический ЭХВЧ','Коагулятор ЭХ-400','Электрохирургия','ElectroSurg','РЗН 2023/18091','09.2028','in_stock','["Мощность 400 Вт","Аргон-режим","Биполяр LigaSure"]'),
            ('Рентген-аппарат мобильный цифровой','Рентген РМ-Digital','Рентген аппараты','RadioPro','РЗН 2021/14730','03.2026','order','["Детектор 35×43 см","Доза −40%","Мобильная С-дуга"]'),
            ('Лазер косметологический фракционный','Лазер дерматологический','Косметология','DermaLaser','РЗН 2020/12033','01.2025','discontinued','["Длина волны 1550 нм","Мощность 30 Вт","3 насадки"]'),
            ('ЛОР-комбайн универсальный','Комплекс ЛОР-хирургический','Отоларингология','ENT Systems','РЗН 2023/17720','11.2028','in_stock','["5 функциональных модулей","Встроенный отоскоп","Видеоэндоскопия"]'),
        ]
        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.products")
        if cur.fetchone()[0] == 0:
            for p in products:
                cur.execute(
                    f"INSERT INTO {SCHEMA}.products (name,reg_name,category,brand,ru_number,ru_valid,status,specs) VALUES (%s,%s,%s,%s,%s,%s,%s,%s::jsonb)",
                    p
                )

        # Seed leads
        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.leads")
        if cur.fetchone()[0] == 0:
            leads = [
                ('kp','ГКБ №1 им. Пирогова','Иванова Е.А.','+7 495 111-22-33',2400000,'new',''),
                ('tender','Клиника «МедСтандарт»','Петров С.В.','+7 812 444-55-66',5800000,'in_work','Смирнов А.'),
                ('consult','ООО «ДентаЛюкс»','Сидорова М.И.','+7 495 777-88-99',0,'kp_sent','Козлова Н.'),
                ('kp','Областная больница №4','Морозов Д.К.','+7 343 222-33-44',1150000,'approval','Смирнов А.'),
                ('tender','НИИ кардиологии','Волкова О.П.','+7 495 333-44-55',9200000,'payment','Козлова Н.'),
                ('kp','Медцентр «Здоровье+»','Зайцев Р.А.','+7 861 555-66-77',760000,'shipment','Смирнов А.'),
                ('consult','Санаторий «Сосны»','Белов И.Н.','+7 499 888-99-00',430000,'closed','Козлова Н.'),
            ]
            for l in leads:
                cur.execute(
                    f"INSERT INTO {SCHEMA}.leads (type,org,contact,phone,amount,status,manager) VALUES (%s,%s,%s,%s,%s,%s,%s)",
                    l
                )

        # Seed clients
        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.clients")
        if cur.fetchone()[0] == 0:
            clients = [
                ('ГКБ №1 им. Пирогова','7701234567','770101001','state',7,12,28400000),
                ('Клиника «МедСтандарт»','7809876543','780901001','private',5,8,15600000),
                ('ООО «ДентаЛюкс»','7712398745','771201001','private',0,3,2300000),
                ('Областная больница №4','6634567890','663401001','state',10,6,9800000),
                ('НИИ кардиологии','7745612398','774501001','state',12,15,41200000),
            ]
            for c in clients:
                cur.execute(
                    f"INSERT INTO {SCHEMA}.clients (name,inn,kpp,type,discount,deals_count,total_amount) VALUES (%s,%s,%s,%s,%s,%s,%s)",
                    c
                )

        # Seed articles
        cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.articles")
        if cur.fetchone()[0] == 0:
            arts = [
                ('Как выбрать эндоскопическую стойку для клиники','Статья','Опубликовано','Козлова Н.'),
                ('Новые поступления: рентген-аппараты 2026','Новость','Опубликовано','Козлова Н.'),
                ('Лицензия Росздравнадзора №ФС-2026-1142','Документ','Опубликовано','Admin'),
                ('Обзор трендов medtech на 2026 год','Статья','Черновик','Козлова Н.'),
            ]
            for a in arts:
                cur.execute(
                    f"INSERT INTO {SCHEMA}.articles (title,type,status,author) VALUES (%s,%s,%s,%s)",
                    a
                )

        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True, 'message': 'Данные загружены'})}

    return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Not found'})}
