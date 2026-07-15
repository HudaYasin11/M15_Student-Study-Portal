import { useEffect, useState } from "react";

// M-15 Student Study Portal — Week 1 scaffold
// This just confirms frontend <-> backend connectivity.
// Real practice-mode UI gets built starting this week.

export default function App() {
  const [status, setStatus] = useState("checking backend...");

  useEffect(() => {
    fetch("http://localhost:5000/")
      .then((res) => res.json())
      .then((data) => setStatus(data.message))
      .catch(() => setStatus("backend not reachable (start the backend server first)"));
  }, []);

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>M-15 — Student Study Portal & Practice Mode</h1>
      <p>Week 1 scaffold — frontend is running.</p>
      <p>
        <strong>Backend status:</strong> {status}
      </p>
    </div>
  );
}
