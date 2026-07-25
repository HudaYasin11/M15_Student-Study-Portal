// backend/routes/enrollments.js — Week 4: sandbox data isolation added
const express = require("express");
const router = express.Router();
const db = require("../db");
const { requireScope } = require("../middleware/auth");

// GET /api/v1/enrollments?userId=1 — only shows enrollments in the key's own "world"
router.get("/", requireScope("read"), async (req, res) => {
  try {
    const { userId } = req.query;
    const result = userId
      ? await db.query(
          `SELECT * FROM enrollments WHERE user_id = $1 AND is_sandbox = $2 ORDER BY id`,
          [userId, req.apiKey.is_sandbox]
        )
      : await db.query(
          `SELECT * FROM enrollments WHERE is_sandbox = $1 ORDER BY id`,
          [req.apiKey.is_sandbox]
        );
    res.json({ enrollments: result.rows, sandbox: req.apiKey.is_sandbox });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch enrollments" });
  }
});

// POST /api/v1/enrollments — new enrollment inherits the key's sandbox/live world
router.post("/", requireScope("write"), async (req, res) => {
  try {
    const { userId, examId } = req.body;
    if (!userId || !examId) {
      return res.status(400).json({ error: "userId and examId are required" });
    }
    const result = await db.query(
      `INSERT INTO enrollments (user_id, exam_id, is_sandbox)
       VALUES ($1, $2, $3) RETURNING *`,
      [userId, examId, req.apiKey.is_sandbox]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create enrollment" });
  }
});

module.exports = router;
