ALTER TABLE t_p61771184_green_case_medstore.products
  ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS complectation JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS certs JSONB DEFAULT '[]';

UPDATE t_p61771184_green_case_medstore.products SET
  photos = '[]'::jsonb,
  complectation = '[]'::jsonb,
  certs = '[]'::jsonb
WHERE photos IS NULL;
