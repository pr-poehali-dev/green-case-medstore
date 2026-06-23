ALTER TABLE t_p61771184_green_case_medstore.users
  ALTER COLUMN role SET DEFAULT 'manager',
  ADD COLUMN IF NOT EXISTS failed_attempts INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS created_by INTEGER;

ALTER TABLE t_p61771184_green_case_medstore.sessions
  ADD COLUMN IF NOT EXISTS ip_address VARCHAR(64),
  ADD COLUMN IF NOT EXISTS user_agent VARCHAR(512);

UPDATE t_p61771184_green_case_medstore.users
  SET role = 'developer'
  WHERE email = 'admin@greencase.ru';
