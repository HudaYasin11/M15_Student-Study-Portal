// backend/middleware/requestLogger.js — Week 4: API request logging
//
// Logs every request AFTER it finishes (so we know the real status code
// and how long it took), regardless of whether auth succeeded or failed.
// Mount this BEFORE requireApiKey so even failed-auth attempts get logged.

const db = require("../db");

function requestLogger(req, res, next) {
  const startTime = Date.now();

  res.on("finish", () => {
    const responseTimeMs = Date.now() - startTime;
    const apiKeyId = req.apiKey ? req.apiKey.id : null;

    db.query(
      `INSERT INTO api_logs (api_key, api_key_id, endpoint, method, status, response_time_ms, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [
        req.apiKey ? req.apiKey.name : "unauthenticated",
        apiKeyId,
        req.originalUrl,
        req.method,
        res.statusCode,
        responseTimeMs,
      ]
    ).catch((err) => console.error("Failed to write request log:", err.message));
  });

  next();
}

module.exports = { requestLogger };
