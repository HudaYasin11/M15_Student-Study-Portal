// backend/utils/webhooks.js
//
// HMAC signing for webhook payloads — lets a subscriber verify a delivered
// payload really came from us and wasn't forged/tampered with in transit.

const crypto = require("crypto");

// Generates a new webhook signing secret, shown to the developer ONCE at
// subscribe time (same pattern as API keys — store it, we don't show it again).
function generateWebhookSecret() {
  return `whsec_${crypto.randomBytes(24).toString("hex")}`;
}

// Signs a JSON payload with the subscription's secret.
// The subscriber recomputes this same HMAC on their end using the raw request
// body + the secret we gave them, and compares it to the X-Webhook-Signature
// header we send. If they match, the payload is authentic and untampered.
function signPayload(secret, payloadString) {
  return crypto.createHmac("sha256", secret).update(payloadString).digest("hex");
}

module.exports = { generateWebhookSecret, signPayload };
