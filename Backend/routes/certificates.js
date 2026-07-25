// backend/routes/certificates.js — Week 4: sandbox isolation added
// (webhook dispatch from Week 3 preserved as-is)
const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const db = require("../db");
const { requireScope } = require("../middleware/auth");
const { dispatchEvent } = require("../services/webhookDispatcher");

// GET /api/v1/certificates/:code — verify a certificate (read scope)
router.get("/:code", requireScope("read"), async (req, res) => {
  try {
    const result = await db.query(
      `SELECT c.certificate_code, c.issued_at, r.score, r.passed, e.title AS exam_title
       FROM certificates c
       JOIN results r ON r.id = c.result_id
       JOIN enrollments en ON en.id = r.enrollment_id
       JOIN exams e ON e.id = en.exam_id
       WHERE c.certificate_code = $1 AND c.is_sandbox = $2`,
      [req.params.code, req.apiKey.is_sandbox]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Certificate not found", valid: false });
    }
    res.json({ valid: true, ...result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to verify certificate" });
  }
});

// POST /api/v1/certificates — issue a certificate (write scope)
router.post("/", requireScope("write"), async (req, res) => {
  try {
    const { resultId } = req.body;
    if (!resultId) {
      return res.status(400).json({ error: "resultId is required" });
    }

    // Note: also scoped by is_sandbox so a live key can't issue a
    // certificate off a sandbox result, or vice versa.
    const resultCheck = await db.query(
      `SELECT passed FROM results WHERE id = $1 AND is_sandbox = $2`,
      [resultId, req.apiKey.is_sandbox]
    );
    if (resultCheck.rows.length === 0) {
      return res.status(404).json({ error: "Result not found" });
    }
    if (!resultCheck.rows[0].passed) {
      return res.status(400).json({ error: "Cannot issue a certificate for a failed result" });
    }

    const certificateCode = crypto.randomBytes(8).toString("hex").toUpperCase();

    const result = await db.query(
      `INSERT INTO certificates (result_id, certificate_code, is_sandbox)
       VALUES ($1, $2, $3) RETURNING *`,
      [resultId, certificateCode, req.apiKey.is_sandbox]
    );

    // Webhook dispatch unchanged from Week 3 — fires for both live and
    // sandbox certificates. A developer testing in sandbox mode SHOULD
    // see their test webhooks fire too, that's the whole point of a sandbox.
    dispatchEvent("certificate.issued", result.rows[0]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to issue certificate" });
  }
});

module.exports = router;
