CREATE TABLE IF NOT EXISTS t_p61771184_green_case_medstore.sessions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES t_p61771184_green_case_medstore.users(id),
  token VARCHAR(128) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days'
);

CREATE TABLE IF NOT EXISTS t_p61771184_green_case_medstore.products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(500) NOT NULL,
  reg_name VARCHAR(500),
  category VARCHAR(200),
  brand VARCHAR(200),
  ru_number VARCHAR(100),
  ru_valid VARCHAR(20),
  status VARCHAR(30) NOT NULL DEFAULT 'in_stock',
  specs JSONB DEFAULT '[]',
  description TEXT,
  files_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p61771184_green_case_medstore.leads (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL DEFAULT 'kp',
  org VARCHAR(300),
  contact VARCHAR(200),
  phone VARCHAR(50),
  email VARCHAR(200),
  inn VARCHAR(20),
  amount BIGINT DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'new',
  manager VARCHAR(200) DEFAULT '',
  comment TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p61771184_green_case_medstore.lead_history (
  id SERIAL PRIMARY KEY,
  lead_id INT NOT NULL REFERENCES t_p61771184_green_case_medstore.leads(id),
  author VARCHAR(200),
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p61771184_green_case_medstore.clients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(400) NOT NULL,
  inn VARCHAR(20),
  kpp VARCHAR(20),
  type VARCHAR(20) NOT NULL DEFAULT 'private',
  discount INT DEFAULT 0,
  deals_count INT DEFAULT 0,
  total_amount BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p61771184_green_case_medstore.articles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  type VARCHAR(30) NOT NULL DEFAULT 'Статья',
  status VARCHAR(20) NOT NULL DEFAULT 'Черновик',
  body TEXT DEFAULT '',
  author VARCHAR(200),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);