-- migrations/003_webhooks.sql
-- Week 3: webhook subscriptions
--
-- Run this against your local m15/m14 database, e.g.:
--   psql -U postgres -d m15_study_portal -f migrations/003_webhooks.sql
-- (swap the -d database name for whatever your DATABASE_URL actually points to)

CREATE TABLE IF NOT EXISTS webhook_subscriptions (
  id               SERIAL PRIMARY KEY,
  api_key_id       INTEGER NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  target_url       TEXT NOT NULL,
  secret           TEXT NOT NULL,
  events           TEXT[] NOT NULL DEFAULT '{}',
  active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
  last_delivered_at TIMESTAMP
);

-- Speeds up the "find all subscribers for this event" lookup in
-- services/webhookDispatcher.js
CREATE INDEX IF NOT EXISTS idx_webhook_subscriptions_events
  ON webhook_subscriptions USING GIN (events);
