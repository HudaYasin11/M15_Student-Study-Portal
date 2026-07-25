// backend/routes/practice.js
//
// Week 1 deliverable: practice mode engine (attempt flow, auto-grade,
// private result storage) + practice history.
//
// NOTE: There's no real "questions" table yet (that comes from the wider
// platform, outside M-15's scope). For now we use a small hardcoded demo
// quiz so the attempt -> grade -> store -> history flow is fully real and
// testable end-to-end. Swap DEMO_QUESTIONS for a real questions table later.

const express = require("express");
const router = express.Router();
const db = require("../db");

const DEMO_QUESTIONS = [
  { id: 1, question: "2 + 2 = ?", options: ["3", "4", "5"], correct: "4" },
  { id: 2, question: "Capital of France?", options: ["Berlin", "Paris", "Rome"], correct: "Paris" },
  { id: 3, question: "HTML stands for HyperText Markup ___?", options: ["Language", "Logic", "Layout"], correct: "Language" },
];

// POST /api/practice/start
// body: { studentId }
// Creates a new attempt row and returns the quiz WITHOUT correct answers.
router.post("/start", async (req, res) => {
  try {
    const { studentId } = req.body;
    if (!studentId) {
      return res.status(400).json({ error: "studentId is required" });
    }

    const result = await db.query(
      `INSERT INTO practice_attempts (student_id, total_questions)
       VALUES ($1, $2)
       RETURNING id, started_at`,
      [studentId, DEMO_QUESTIONS.length]
    );

    const attempt = result.rows[0];

    // Strip correct answers before sending to the client
    const questionsForClient = DEMO_QUESTIONS.map(({ id, question, options }) => ({
      id, question, options,
    }));

    res.json({
      attemptId: attempt.id,
      startedAt: attempt.started_at,
      questions: questionsForClient,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to start practice attempt" });
  }
});

// POST /api/practice/submit
// body: { attemptId, answers: [{ questionId, answer }] }
// Auto-grades against DEMO_QUESTIONS, stores result privately.
router.post("/submit", async (req, res) => {
  try {
    const { attemptId, answers } = req.body;
    if (!attemptId || !Array.isArray(answers)) {
      return res.status(400).json({ error: "attemptId and answers[] are required" });
    }

    let correctCount = 0;
    answers.forEach(({ questionId, answer }) => {
      const q = DEMO_QUESTIONS.find((dq) => dq.id === questionId);
      if (q && q.correct === answer) correctCount++;
    });

    const score = (correctCount / DEMO_QUESTIONS.length) * 100;

    const result = await db.query(
      `UPDATE practice_attempts
       SET completed_at = NOW(), score = $1, answers = $2
       WHERE id = $3
       RETURNING id, score, completed_at`,
      [score, JSON.stringify(answers), attemptId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Attempt not found" });
    }

    res.json({
      attemptId: result.rows[0].id,
      score: result.rows[0].score,
      correctCount,
      totalQuestions: DEMO_QUESTIONS.length,
      completedAt: result.rows[0].completed_at,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit practice attempt" });
  }
});

// GET /api/practice/history/:studentId
// Returns past attempts for ONE student only — this is the "private result
// storage" requirement: nothing here is queryable by instructor/admin role.
// (Role-based access control itself is a Week-1 stretch item — see note below.)
router.get("/history/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    const result = await db.query(
      `SELECT id, started_at, completed_at, score, total_questions
       FROM practice_attempts
       WHERE student_id = $1
       ORDER BY started_at DESC`,
      [studentId]
    );

    res.json({ attempts: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch practice history" });
  }
});

module.exports = router;
