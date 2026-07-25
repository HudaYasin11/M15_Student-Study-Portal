// backend/queues/webhookQueue.js
//
// BullMQ queue for webhook deliveries. This needs a real, persistent
// ioredis-style connection (REDIS_URL) — NOT the REST client used for
// rate limiting in middleware/rateLimit.js. Those are two different
// products on the same Upstash database; don't mix them up.

require("dotenv").config();
const { Queue } = require("bullmq");
const IORedis = require("ioredis");

if (!process.env.REDIS_URL) {
  console.error("Missing REDIS_URL in .env — needed for BullMQ (webhook queue).");
}

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null, // required by BullMQ, otherwise it throws on startup
});

const webhookQueue = new Queue("webhook-delivery", { connection });

module.exports = { webhookQueue, connection };
