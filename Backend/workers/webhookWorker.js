// backend/workers/webhookWorker.js
//
// This runs as its OWN process, separate from server.js — it's the thing
// that pulls delivery jobs off the queue and actually makes the outbound
// HTTP call to the subscriber's URL. Retries on failure happen automatically
// per the attempts/backoff config set in services/webhookDispatcher.js.
//
// Run it with:   node workers/webhookWorker.js
// Or for auto-restart during dev:   npx nodemon workers/webhookWorker.js
//
// Keep this running ALONGSIDE `npm run dev` (server.js) in a second terminal —
// if this isn't running, jobs just sit in the queue until it starts.
console.log("WORKER FILE STARTED"); //debug
require("dotenv").config();
console.log("REDIS_URL loaded:", process.env.REDIS_URL ? "yes" : "MISSING");
const { Worker } = require("bullmq");
const IORedis = require("ioredis");
const db = require("../db");
const { signPayload } = require("../utils/webhooks");

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "webhook-delivery",
  async (job) => {
    const { subscriptionId, targetUrl, secret, event, data, timestamp } = job.data;

    const body = JSON.stringify({ event, data, timestamp });
    const signature = signPayload(secret, body);

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": signature,
        "X-Webhook-Event": event,
      },
      body,
    });

    if (!response.ok) {
      // Throwing here is what tells BullMQ this attempt failed, so it
      // schedules a retry per the backoff config. Don't swallow this.
      throw new Error(`Subscriber responded with HTTP ${response.status}`);
    }

    await db
      .query(`UPDATE webhook_subscriptions SET last_delivered_at = NOW() WHERE id = $1`, [
        subscriptionId,
      ])
      .catch(() => {});

    return { delivered: true };
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`✅ Webhook delivered — job ${job.id}, event "${job.data.event}"`);
});

worker.on("failed", (job, err) => {
  const attempt = job?.attemptsMade;
  const max = job?.opts?.attempts;
  console.error(`❌ Webhook delivery failed — job ${job?.id}, attempt ${attempt}/${max}: ${err.message}`);
});

console.log("👂 Webhook worker listening for jobs on queue 'webhook-delivery'...");
console.log("WORKER FILE REACHED END");