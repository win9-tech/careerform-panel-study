CREATE TABLE IF NOT EXISTS study_responses (
 id uuid PRIMARY KEY, received_at timestamptz NOT NULL DEFAULT now(), version text NOT NULL,
 sequence text NOT NULL, preference text NOT NULL, payload text NOT NULL
);
