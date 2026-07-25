// backend/routes/webhooks.js — Week 3: subscription management
//
// Lets whoever holds an API key subscribe a URL of theirs to get notified
// when events happen (e.g. "certificate.issued"), list their own
// subscriptions, and unsubscribe. Each key can only see/manage its own
// subscriptions — same ownership model as the rest of the API.

const express = require("express");
const router = express.Router();
const db = require("../db");
const { requireScope } = require("../middleware/auth");
const { generateWebhookSecret } = require("../utils/webhooks");

// Add new event types here as the platform grows (e.g. "result.submitted").
const VALID_EVENTS = ["certificate.issued"];

// POST /api/v1/webhooks — subscribe (write scope)
// body: { targetUrl, events?: ["certificate.issued"] }  (events defaults to all valid events)
router.post("/", requireScope("write"), async (req, res) => {
  try {
    const { targetUrl, events } = req.body;

    if (!targetUrl) {
      return res.status(400).json({ error: "targetUrl is required" });
    }

    const finalEvents = Array.isArray(events) && events.length ? events : VALID_EVENTS;
    const invalid = finalEvents.filter((e) => !VALID_EVENTS.includes(e));
    if (invalid.length) {
      return res.status(400).json({ error: `Unknown event type(s): ${invalid.join(", ")}` });
    }

    const secret = generateWebhookSecret();

    const result = await db.query(
      `INSERT INTO webhook_subscriptions (api_key_id, target_url, secret, events)
       VALUES ($1, $2, $3, $4)
       RETURNING id, target_url, events, active, created_at`,
      [req.apiKey.id, targetUrl, secret, finalEvents]
    );

    res.status(201).json({
      ...result.rows[0],
      secret, // shown ONLY here, ONLY once — same pattern as API key generation
      warning:
        "Save this secret now — it will not be shown again. Use it to verify the X-Webhook-Signature header on delivered payloads.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create webhook subscription" });
  }
});

// GET /api/v1/webhooks — list subscriptions belonging to the current key (read scope)
router.get("/", requireScope("read"), async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, target_url, events, active, created_at, last_delivered_at
       FROM webhook_subscriptions
       WHERE api_key_id = $1
       ORDER BY created_at DESC`,
      [req.apiKey.id]
    );
    res.json({ subscriptions: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to list webhook subscriptions" });
  }
});

// DELETE /api/v1/webhooks/:id — unsubscribe (write scope)
// Scoped to api_key_id so one key can't delete another key's subscription.
router.delete("/:id", requireScope("write"), async (req, res) => {
  try {
    const result = await db.query(
      `DELETE FROM webhook_subscriptions WHERE id = $1 AND api_key_id = $2 RETURNING id`,
      [req.params.id, req.apiKey.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Subscription not found" });
    }
    res.json({ deleted: true, id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to unsubscribe" });
  }
});

module.exports = router;
