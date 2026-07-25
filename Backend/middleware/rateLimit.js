// backend/middleware/rateLimit.js
//
// Week 1 deliverable: "rate limiting with Redis"
// Uses Upstash's REST-based Redis + their official ratelimit package —
// no persistent TCP connection needed, works anywhere.

const { Ratelimit } = require("@upstash/ratelimit");
const { Redis } = require("@upstash/redis");

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Example limit: 100 requests per hour PER API KEY.
// Sliding window is more accurate than a fixed window (no burst-at-reset issue).
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 h"),
  analytics: true,
  prefix: "m14_ratelimit",
});

async function rateLimitByApiKey(req, res, next) {
  // req.apiKey is set by requireApiKey — this middleware must run AFTER auth.
  const identifier = req.apiKey ? `key_${req.apiKey.id}` : `ip_${req.ip}`;

  try {
    const { success, limit, remaining, reset } = await ratelimit.limit(identifier);

    res.setHeader("X-RateLimit-Limit", limit);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", reset);

    if (!success) {
      const retryAfterSeconds = Math.ceil((reset - Date.now()) / 1000);
      res.setHeader("Retry-After", retryAfterSeconds);
      return res.status(429).json({
        error: "Rate limit exceeded",
        retryAfterSeconds,
      });
    }

    next();
  } catch (err) {
    console.error("Rate limit check failed:", err.message);
    // Fail-open: if Upstash itself is unreachable, don't block all traffic.
    next();
  }
}

module.exports = { rateLimitByApiKey };
