import { useEffect, useState } from "react";

export default function App() {
    const [status, setStatus] = useState("checking backend...");
    const [error, setError] = useState(false);

    useEffect(() => {
        fetch("http://localhost:5000/api/health")
            .then((res) => res.json())
            .then((data) => {
                setStatus(data.message);
                setError(false);
            })
            .catch(() => {
                setStatus("❌ Backend not reachable");
                setError(true);
            });
    }, []);

    return (
        <div style={{
            fontFamily: "sans-serif",
            padding: "2rem",
            textAlign: "center",
            backgroundColor: error ? "#ffebee" : "#e8f5e9",  // ✅ Fixed
            minHeight: "100vh"
        }}>
            <h1>📚 M-15 Student Study Portal</h1>
            <p>Week 1 — Frontend is running!</p>
            <div style={{
                padding: "20px",
                margin: "20px auto",
                maxWidth: "400px",
                border: "1px solid #ddd",
                borderRadius: "10px",
                backgroundColor: "white"
            }}>
                <strong>Backend Status:</strong>
                <p style={{ color: error ? "red" : "green" }}>{status}</p>
            </div>
        </div>
    );
}