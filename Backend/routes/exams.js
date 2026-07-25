// backend/routes/exams.js — Week 4: sandbox data isolation added
const express = require("express");
const router = express.Router();
const db = require("../db");
const { requireScope } = require("../middleware/auth");

// GET /api/v1/exams — sandbox keys only see sandbox exams, live keys only see live exams
router.get("/", requireScope("read"), async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, title, description, duration FROM exams WHERE is_sandbox = $1 ORDER BY id`,
      [req.apiKey.is_sandbox]
    );
    res.json({ exams: result.rows, sandbox: req.apiKey.is_sandbox });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch exams" });
  }
});

router.get("/:id", requireScope("read"), async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM exams WHERE id = $1 AND is_sandbox = $2`,
      [req.params.id, req.apiKey.is_sandbox]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Exam not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch exam" });
  }
});

// POST /api/v1/exams — new exams inherit whichever "world" the key belongs to
router.post("/", requireScope("write"), async (req, res) => {
  try {
    const { title, description, duration } = req.body;
    if (!title) {
      return res.status(400).json({ error: "title is required" });
    }
    const result = await db.query(
      `INSERT INTO exams (title, description, duration, is_sandbox)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [title, description || null, duration || null, req.apiKey.is_sandbox]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create exam" });
  }
});

module.exports = router;
