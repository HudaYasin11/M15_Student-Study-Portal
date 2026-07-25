-- backend/sql/004_sandbox_and_logging.sql
-- Week 4: sandbox environment + API request logging
-- Run against m14_public_api (pgAdmin Query Tool)

-- 1. Sandbox flag on API keys — a key is either "live" or "sandbox"
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS is_sandbox BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Sandbox flag on the core data tables, so sandbox keys only ever
--    see/create sandbox data, never real data (and vice versa).
ALTER TABLE exams        ADD COLUMN IF NOT EXISTS is_sandbox BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE enrollments  ADD COLUMN IF NOT EXISTS is_sandbox BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE results      ADD COLUMN IF NOT EXISTS is_sandbox BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS is_sandbox BOOLEAN NOT NULL DEFAULT FALSE;

-- 3. Seed some sandbox-only sample data so a sandbox key has something
--    real to interact with immediately.
INSERT INTO exams (title, description, duration, is_sandbox)
VALUES ('Sandbox Demo Exam', 'Fake exam for developers testing the API', 30, TRUE);

-- 4. Fix api_logs to match what the logging middleware actually needs.
--    Your existing table used "api_key" (varchar) and "timestamp" — we
--    widen it slightly so it works whether or not a key was present
--    (e.g. a request that failed auth entirely still gets logged).
ALTER TABLE api_logs ADD COLUMN IF NOT EXISTS api_key_id INTEGER REFERENCES api_keys(id);
ALTER TABLE api_logs ADD COLUMN IF NOT EXISTS response_time_ms INTEGER;
