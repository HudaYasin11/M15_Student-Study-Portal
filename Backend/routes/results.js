// backend/routes/results.js — Week 4: sandbox data isolation added
const express = require("express");
const router = express.Router();
const db = require("../db");
const { requireScope } = require("../middleware/auth");

router.get("/", requireScope("read"), async (req, res) => {
  try {
    const { enrollmentId } = req.query;
    const result = enrollmentId
      ? await db.query(
          `SELECT * FROM results WHERE enrollment_id = $1 AND is_sandbox = $2 ORDER BY id`,
          [enrollmentId, req.apiKey.is_sandbox]
        )
      : await db.query(
          `SELECT * FROM results WHERE is_sandbox = $1 ORDER BY id`,
          [req.apiKey.is_sandbox]
        );
    res.json({ results: result.rows, sandbox: req.apiKey.is_sandbox });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch results" });
  }
});

router.post("/", requireScope("write"), async (req, res) => {
  try {
    const { enrollmentId, score, passed } = req.body;
    if (!enrollmentId || score === undefined || passed === undefined) {
      return res.status(400).json({ error: "enrollmentId, score, and passed are required" });
    }

    const result = await db.query(
      `INSERT INTO results (enrollment_id, score, passed, is_sandbox)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [enrollmentId, score, passed, req.apiKey.is_sandbox]
    );

    await db.query(`UPDATE enrollments SET status = 'completed' WHERE id = $1`, [enrollmentId]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit result" });
  }
});

module.exports = router;
