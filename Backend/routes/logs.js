// backend/routes/logs.js — Week 4: view your own API request history
const express = require("express");
const router = express.Router();
const db = require("../db");
const { requireScope } = require("../middleware/auth");

// GET /api/v1/logs — see recent requests made with THIS key
router.get("/", requireScope("read"), async (req, res) => {
  try {
    const result = await db.query(
      `SELECT endpoint, method, status, response_time_ms, timestamp
       FROM api_logs
       WHERE api_key_id = $1
       ORDER BY timestamp DESC
       LIMIT 50`,
      [req.apiKey.id]
    );
    res.json({ logs: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

module.exports = router;
