// backend/utils/apiKeys.js
//
// API keys are generated once, shown to the developer ONCE, then only the
// HASH is stored. This matches how Stripe/GitHub/etc. handle keys — if the
// database is ever leaked, no usable keys leak with it.

const crypto = require("crypto");

// Generates a new plain-text key, e.g. "sk_live_9f2a1b3c..."
function generateApiKey() {
  const randomPart = crypto.randomBytes(24).toString("hex"); // 48 chars
  const plainKey = `sk_live_${randomPart}`;
  const prefix = plainKey.slice(0, 12); // shown in dashboards, safe to display
  return { plainKey, prefix };
}

// One-way hash — this is what actually gets stored in the database.
function hashApiKey(plainKey) {
  return crypto.createHash("sha256").update(plainKey).digest("hex");
}

module.exports = { generateApiKey, hashApiKey };
