# M-14 — Public API & Developer Portal

Summer Internship 2026

A public REST API for an online exam platform — external developers can
authenticate with API keys, enroll students in exams, submit results, issue
and verify certificates, and subscribe to webhooks for real-time events.
Includes a sandbox mode, request logging, and an interactive developer portal.

## Quick links (once the server is running)

- Developer portal: http://localhost:5000
- Interactive API docs (Swagger): http://localhost:5000/api-docs

## Getting started

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Set up your `.env`
Copy `.env.example` to `.env` and fill in:
- `DATABASE_URL` — your local PostgreSQL connection string
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — rate limiting
- `REDIS_URL` — standard Redis connection, used by BullMQ for webhooks

### 3. Run the database migrations
In order, using pgAdmin's Query Tool or `psql`:
```
sql/001_api_keys.sql
sql/002_week2_tables.sql
sql/003_webhooks.sql
sql/004_sandbox_and_logging.sql
```

### 4. Start the server
```bash
npm start
```

### 5. Start the webhook worker (separate terminal — required for webhook delivery)
```bash
npm run dev:worker
```

### 6. Generate your first API key
Visit http://localhost:5000, use the "Generate an API key" form, or:
```bash
curl -X POST http://localhost:5000/api/keys \
  -H "Content-Type: application/json" \
  -d '{"name": "My first key", "scopes": ["read","write"], "sandbox": true}'
```
Save the `apiKey` value — it's shown only once.

## Authentication

Every endpoint except `POST /api/keys` requires:
```
Authorization: Bearer sk_live_your_key_here
```

Keys have **scopes** (`read`, `write`) and a **sandbox flag**. Sandbox keys
only ever see/create sandbox data, safe for testing without touching real
records.

## Core endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/keys` | Generate a new API key |
| GET | `/api/keys` | List keys (metadata only) |
| PATCH | `/api/keys/:id/revoke` | Revoke a key |
| GET/POST | `/api/v1/exams` | List / create exams |
| POST | `/api/v1/enrollments` | Enroll a user in an exam |
| POST | `/api/v1/results` | Submit an exam result |
| POST | `/api/v1/certificates` | Issue a certificate (triggers webhooks) |
| GET | `/api/v1/certificates/:code` | Verify a certificate |
| GET/POST | `/api/v1/webhooks` | List / create webhook subscriptions |
| GET | `/api/v1/logs` | View your own request history |

Full request/response schemas: see `/api-docs`.

## Webhooks

Subscribe a URL to be notified when events happen (currently:
`certificate.issued`). Deliveries are queued via BullMQ/Redis, retried up to
5 times with exponential backoff, and signed with HMAC-SHA256 — verify the
`X-Webhook-Signature` header using the `secret` you received at subscribe time.

## Testing

### Validate the OpenAPI spec
```bash
npm run validate:openapi
```

### Run integration tests
The server must already be running (`npm start`) in another terminal, then:
```bash
npm test
```
Covers: key generation, auth rejection (missing/invalid/wrong-scope keys),
sandbox data isolation, the full enroll → result → certificate → verify
flow, and request logging.

## Known limitations / not yet built

- No real developer login system — key generation is currently open (any
  request can generate a key). A production version would gate this behind
  developer accounts.
- Only one webhook event type (`certificate.issued`) exists so far.
- SDK generation (`openapi-typescript-codegen`) produces a basic client but
  hasn't been published as a package — see `sdk/` folder for the generated stub.

## Tech stack

- Node.js + Express
- PostgreSQL (`pg`)
- Redis: Upstash REST (rate limiting) + standard Redis via BullMQ (webhooks)
- Swagger UI + OpenAPI 3.0
- Jest (integration tests)
