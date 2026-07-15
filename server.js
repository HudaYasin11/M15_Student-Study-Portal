// M-15 Student Study Portal & Practice Mode — backend entry point
// Week 1 goal: basic server running, ready for practice-engine routes

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check — confirms the server is alive
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    module: "M-15 Student Study Portal & Practice Mode",
    message: "Backend is running",
  });
});

// Placeholder route for Week 1 deliverable: practice attempt flow
// TODO: replace with real DB-backed logic (PostgreSQL)
app.get("/api/practice/health", (req, res) => {
  res.json({ practiceEngine: "not yet implemented" });
});

app.listen(PORT, () => {
  console.log(`M-15 backend listening on http://localhost:${PORT}`);
});
