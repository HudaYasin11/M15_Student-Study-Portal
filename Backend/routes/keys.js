// backend/routes/keys.js
//
// Week 1 deliverable: "API key model (generate, hash, scope, revoke)"
//
// NOTE: In a real system, key creation itself would sit behind login/auth
// (only a logged-in developer can generate keys for their own account).
// That developer-login layer isn't built yet — this is the key MANAGEMENT
// piece specifically, which is what Week 1 asks for. Login/ownership comes
// with the Developer Portal in Week 5.

// backend/routes/keys.js — Week 4: added sandbox key support
const express = require("express");
const router = express.Router();
const db = require("../db");
const { generateApiKey, hashApiKey } = require("../utils/apiKeys");

// POST /api/keys
// body: { name, scopes: ["read","write"], sandbox: true|false }
router.post("/", async (req, res) => {
  try {
    const { name, scopes, sandbox } = req.body;
    if (!name) {
      return res.status(400).json({ error: "name is required" });
    }

    const { plainKey, prefix } = generateApiKey();
    const keyHash = hashApiKey(plainKey);
    const finalScopes = Array.isArray(scopes) && scopes.length ? scopes : ["read"];
    const isSandbox = Boolean(sandbox);

    const result = await db.query(
      `INSERT INTO api_keys (name, key_hash, key_prefix, scopes, is_sandbox)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, key_prefix, scopes, is_sandbox, created_at`,
      [name, keyHash, prefix, finalScopes, isSandbox]
    );

    res.status(201).json({
      ...result.rows[0],
      apiKey: plainKey,
      warning: "Save this key now — it will not be shown again.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate API key" });
  }
});

// GET /api/keys
router.get("/", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, name, key_prefix, scopes, is_sandbox, revoked, created_at, last_used_at
       FROM api_keys ORDER BY created_at DESC`
    );
    res.json({ keys: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to list API keys" });
  }
});

// PATCH /api/keys/:id/revoke
router.patch("/:id/revoke", async (req, res) => {
  try {
    const result = await db.query(
      `UPDATE api_keys SET revoked = TRUE WHERE id = $1 RETURNING id, name, revoked`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Key not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to revoke key" });
  }
});

module.exports = router;
