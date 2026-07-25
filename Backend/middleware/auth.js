// backend/middleware/auth.js
//
// Week 1 deliverable: "auth middleware"
//
// Checks the Authorization: Bearer <key> header against api_keys table.
// Attaches req.apiKey with scope info if valid, so routes can check scope.
// backend/middleware/auth.js — Week 4: now carries is_sandbox on req.apiKey
const db = require("../db");
const { hashApiKey } = require("../utils/apiKeys");

async function requireApiKey(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or malformed Authorization header" });
  }

  const plainKey = authHeader.replace("Bearer ", "").trim();
  const keyHash = hashApiKey(plainKey);

  try {
    const result = await db.query(
      `SELECT id, name, scopes, revoked, is_sandbox FROM api_keys WHERE key_hash = $1`,
      [keyHash]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    const key = result.rows[0];
    if (key.revoked) {
      return res.status(401).json({ error: "This API key has been revoked" });
    }

    db.query(`UPDATE api_keys SET last_used_at = NOW() WHERE id = $1`, [key.id]).catch(() => {});

    req.apiKey = key; // now includes is_sandbox
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to validate API key" });
  }
}

function requireScope(scope) {
  return (req, res, next) => {
    if (!req.apiKey || !req.apiKey.scopes.includes(scope)) {
      return res.status(403).json({ error: `This key does not have the '${scope}' scope` });
    }
    next();
  };
}

module.exports = { requireApiKey, requireScope };
