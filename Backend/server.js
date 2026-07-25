// backend/server.js — UPDATED
// Week 1: real practice-engine routes wired in, backed by PostgreSQL.

const express = require("express");
const cors = require("cors");
const practiceRoutes = require("./routes/practice");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    module: "M-15 Student Study Portal & Practice Mode",
    message: "Backend is running",
  });
});

// Real Week 1 feature: practice engine
app.use("/api/practice", practiceRoutes);

app.listen(PORT, () => {
  console.log(`M-15 backend listening on http://localhost:${PORT}`);
});
