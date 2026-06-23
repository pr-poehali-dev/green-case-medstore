"""
Первичное наполнение БД демо-данными и создание admin-пользователя.
Вызывается один раз при первом запуске.
"""
import json
import os
import hashlib
import psycopg2

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p61771184_green_case_medstore')
CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    conn = get_conn()
    cur = conn.cursor()
    seeded = []

    # Admin user
    admin_hash = hash_password('Admin123!')
    cur.execute(
        f"INSERT INTO {SCHEMA}.users (name,email,password_hash,role) VALUES (%s,%s,%s,'admin') ON CONFLICT (email) DO NOTHING",
        ('Алексей Козлов', 'admin@greencase.ru', admin_hash)
    )
    seeded.append('admin user')

    # Products
    cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.products")
    if cur.fetchone()[0] == 0:
        products = [
            ('Эндоскопическая видеосистема Full HD', 'Видеосистема медицинская', 'Видеосистемы', 'MedTech Optix', 'РЗН 2023/19847', '12.2028', 'in_stock', '["4K UHD сенсор","NBI-режим","Глубина 1.5–100 мм"]'),
            ('Кольпоскоп оптический бинокулярный', 'Кольпоскоп КС-01', 'Гинекология', 'GynoVision', 'РЗН 2022/16204', '06.2027', 'order', '["Увеличение ×4–×25","LED 50 000 ч","Зелёный фильтр"]'),
            ('Аппарат электрохирургический ЭХВЧ', 'Коагулятор ЭХ-400', 'Электрохирургия', 'ElectroSurg', 'РЗН 2023/18091', '09.2028', 'in_stock', '["Мощность 400 Вт","Аргон-режим","Биполяр LigaSure"]'),
            ('Рентген-аппарат мобильный цифровой', 'Рентген РМ-Digital', 'Рентген аппараты', 'RadioPro', 'РЗН 2021/14730', '03.2026', 'order', '["Детектор 35×43 см","Доза −40%","Мобильная С-дуга"]'),
            ('Лазер косметологический фракционный', 'Лазер дерматологический', 'Косметология', 'DermaLaser', 'РЗН 2020/12033', '01.2025', 'discontinued', '["Длина волны 1550 нм","Мощность 30 Вт","3 насадки"]'),
            ('ЛОР-комбайн универсальный', 'Комплекс ЛОР-хирургический', 'Отоларингология', 'ENT Systems', 'РЗН 2023/17720', '11.2028', 'in_stock', '["5 функциональных модулей","Встроенный отоскоп","Видеоэндоскопия"]'),
        ]
        for p in products:
            cur.execute(
                f"INSERT INTO {SCHEMA}.products (name,reg_name,category,brand,ru_number,ru_valid,status,specs) VALUES (%s,%s,%s,%s,%s,%s,%s,%s::jsonb)",
                p
            )
        seeded.append(f'{len(products)} products')

    # Leads
    cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.leads")
    if cur.fetchone()[0] == 0:
        leads = [
            ('kp', 'ГКБ №1 им. Пирогова', 'Иванова Е.А.', '+7 495 111-22-33', 2400000, 'new', ''),
            ('tender', 'Клиника «МедСтандарт»', 'Петров С.В.', '+7 812 444-55-66', 5800000, 'in_work', 'Смирнов А.'),
            ('consult', 'ООО «ДентаЛюкс»', 'Сидорова М.И.', '+7 495 777-88-99', 0, 'kp_sent', 'Козлова Н.'),
            ('kp', 'Областная больница №4', 'Морозов Д.К.', '+7 343 222-33-44', 1150000, 'approval', 'Смирнов А.'),
            ('tender', 'НИИ кардиологии', 'Волкова О.П.', '+7 495 333-44-55', 9200000, 'payment', 'Козлова Н.'),
            ('kp', 'Медцентр «Здоровье+»', 'Зайцев Р.А.', '+7 861 555-66-77', 760000, 'shipment', 'Смирнов А.'),
            ('consult', 'Санаторий «Сосны»', 'Белов И.Н.', '+7 499 888-99-00', 430000, 'closed', 'Козлова Н.'),
        ]
        for l in leads:
            cur.execute(
                f"INSERT INTO {SCHEMA}.leads (type,org,contact,phone,amount,status,manager) VALUES (%s,%s,%s,%s,%s,%s,%s)",
                l
            )
        seeded.append(f'{len(leads)} leads')

    # Clients
    cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.clients")
    if cur.fetchone()[0] == 0:
        clients = [
            ('ГКБ №1 им. Пирогова', '7701234567', '770101001', 'state', 7, 12, 28400000),
            ('Клиника «МедСтандарт»', '7809876543', '780901001', 'private', 5, 8, 15600000),
            ('ООО «ДентаЛюкс»', '7712398745', '771201001', 'private', 0, 3, 2300000),
            ('Областная больница №4', '6634567890', '663401001', 'state', 10, 6, 9800000),
            ('НИИ кардиологии', '7745612398', '774501001', 'state', 12, 15, 41200000),
        ]
        for c in clients:
            cur.execute(
                f"INSERT INTO {SCHEMA}.clients (name,inn,kpp,type,discount,deals_count,total_amount) VALUES (%s,%s,%s,%s,%s,%s,%s)",
                c
            )
        seeded.append(f'{len(clients)} clients')

    # Articles
    cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.articles")
    if cur.fetchone()[0] == 0:
        articles = [
            ('Как выбрать эндоскопическую стойку для клиники', 'Статья', 'Опубликовано', 'Козлова Н.'),
            ('Новые поступления: рентген-аппараты 2026', 'Новость', 'Опубликовано', 'Козлова Н.'),
            ('Лицензия Росздравнадзора №ФС-2026-1142', 'Документ', 'Опубликовано', 'Admin'),
            ('Обзор трендов medtech на 2026 год', 'Статья', 'Черновик', 'Козлова Н.'),
        ]
        for a in articles:
            cur.execute(
                f"INSERT INTO {SCHEMA}.articles (title,type,status,author) VALUES (%s,%s,%s,%s)",
                a
            )
        seeded.append(f'{len(articles)} articles')

    conn.commit()
    conn.close()
    return {
        'statusCode': 200,
        'headers': CORS,
        'body': json.dumps({'ok': True, 'seeded': seeded}, ensure_ascii=False)
    }
