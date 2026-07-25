// backend/routes/demo.js
//
// A tiny protected endpoint so you can PROVE auth + rate limiting work
// end-to-end. Real M-14 endpoints (exams, results, etc.) get built in Week 2.

const express = require("express");
const router = express.Router();

router.get("/ping", (req, res) => {
  res.json({
    message: "You're authenticated!",
    keyName: req.apiKey.name,
    scopes: req.apiKey.scopes,
  });
});

module.exports = router;
