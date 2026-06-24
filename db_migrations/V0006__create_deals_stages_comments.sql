CREATE TABLE t_p61771184_green_case_medstore.deals (
    id          SERIAL PRIMARY KEY,
    client_id   INTEGER NOT NULL REFERENCES t_p61771184_green_case_medstore.clients(id),
    title       VARCHAR(300) NOT NULL,
    description TEXT NULL DEFAULT '',
    status      VARCHAR(30) NOT NULL DEFAULT 'active',
    created_by  INTEGER NULL REFERENCES t_p61771184_green_case_medstore.users(id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE t_p61771184_green_case_medstore.deal_stages (
    id            SERIAL PRIMARY KEY,
    deal_id       INTEGER NOT NULL REFERENCES t_p61771184_green_case_medstore.deals(id),
    title         VARCHAR(300) NOT NULL,
    status        VARCHAR(30) NOT NULL DEFAULT 'pending',
    taken_by      VARCHAR(200) NULL,
    taken_at      TIMESTAMPTZ NULL,
    completed_at  TIMESTAMPTZ NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE t_p61771184_green_case_medstore.deal_comments (
    id         SERIAL PRIMARY KEY,
    stage_id   INTEGER NOT NULL REFERENCES t_p61771184_green_case_medstore.deal_stages(id),
    author     VARCHAR(200) NOT NULL,
    text       TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);