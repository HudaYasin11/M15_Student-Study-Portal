// backend/services/webhookDispatcher.js
//
// Called from wherever an event actually happens (e.g. right after a
// certificate is issued). Looks up every active subscription listening for
// that event type and enqueues one delivery job per subscriber.
//
// Deliberately does NOT make the HTTP call itself — that happens in
// workers/webhookWorker.js — so the API response to the original request
// (e.g. "certificate created") returns instantly regardless of whether the
// subscriber's server is fast, slow, or down.

const db = require("../db");
const { webhookQueue } = require("../queues/webhookQueue");

async function dispatchEvent(eventType, payloadData) {
  try {
    const { rows: subs } = await db.query(
      `SELECT id, target_url, secret FROM webhook_subscriptions
       WHERE active = TRUE AND $1 = ANY(events)`,
      [eventType]
    );

    for (const sub of subs) {
      await webhookQueue.add(
        "deliver",
        {
          subscriptionId: sub.id,
          targetUrl: sub.target_url,
          secret: sub.secret,
          event: eventType,
          data: payloadData,
          timestamp: new Date().toISOString(),
        },
        {
          attempts: 5,
          backoff: { type: "exponential", delay: 2000 }, // retries at ~2s, 4s, 8s, 16s, 32s
          removeOnComplete: true,
          removeOnFail: false, // keep failed jobs so you can inspect/replay them later
        }
      );
    }
  } catch (err) {
    // A dispatch failure here must NEVER break the actual API request that
    // triggered it (e.g. issuing the certificate). Log and move on.
    console.error("Failed to dispatch webhook event:", err.message);
  }
}

module.exports = { dispatchEvent };
