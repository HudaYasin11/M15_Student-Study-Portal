// backend/tests/api.test.js
//
// End-to-end integration tests. These hit your REAL, RUNNING server —
// same way you've been testing manually all along, just automated.
//
// IMPORTANT: your server (npm start) must already be running on
// http://localhost:5000 before running these tests.
//
// Run with: npm test

const BASE_URL = "http://localhost:5000";

let writeKey; // read+write, live
let readOnlyKey; // read only, live
let sandboxKey; // read+write, sandbox

// Helper — makes a request and returns { status, body }
async function call(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, options);
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

describe("API key generation", () => {
  test("generates a live read+write key", async () => {
    const { status, body } = await call("/api/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test write key", scopes: ["read", "write"], sandbox: false }),
    });
    expect(status).toBe(201);
    expect(body.apiKey).toMatch(/^sk_live_/);
    writeKey = body.apiKey;
  });

  test("generates a live read-only key", async () => {
    const { status, body } = await call("/api/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test read-only key", scopes: ["read"], sandbox: false }),
    });
    expect(status).toBe(201);
    readOnlyKey = body.apiKey;
  });

  test("generates a sandbox key", async () => {
    const { status, body } = await call("/api/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test sandbox key", scopes: ["read", "write"], sandbox: true }),
    });
    expect(status).toBe(201);
    expect(body.is_sandbox).toBe(true);
    sandboxKey = body.apiKey;
  });
});

describe("Auth enforcement", () => {
  test("rejects requests with no key", async () => {
    const { status } = await call("/api/v1/exams");
    expect(status).toBe(401);
  });

  test("rejects requests with an invalid key", async () => {
    const { status } = await call("/api/v1/exams", {
      headers: { Authorization: "Bearer sk_live_totally_fake_key_here" },
    });
    expect(status).toBe(401);
  });

  test("read-only key is blocked from write actions", async () => {
    const { status } = await call("/api/v1/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${readOnlyKey}` },
      body: JSON.stringify({ title: "Should not be created" }),
    });
    expect(status).toBe(403);
  });
});

describe("Sandbox isolation", () => {
  test("sandbox key only sees sandbox exams", async () => {
    const { status, body } = await call("/api/v1/exams", {
      headers: { Authorization: `Bearer ${sandboxKey}` },
    });
    expect(status).toBe(200);
    expect(body.sandbox).toBe(true);
    body.exams.forEach((exam) => {
      expect(exam.title).not.toBe("Intro to Databases"); // the real/live exam
    });
  });
});

describe("Full certificate flow", () => {
  let examId, enrollmentId, resultId, certificateCode;

  test("creates an exam", async () => {
    const { status, body } = await call("/api/v1/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${writeKey}` },
      body: JSON.stringify({ title: "Integration Test Exam", duration: 45 }),
    });
    expect(status).toBe(201);
    examId = body.id;
  });

  test("enrolls a user", async () => {
    const { status, body } = await call("/api/v1/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${writeKey}` },
      body: JSON.stringify({ userId: 1, examId }),
    });
    expect(status).toBe(201);
    enrollmentId = body.id;
  });

  test("submits a passing result", async () => {
    const { status, body } = await call("/api/v1/results", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${writeKey}` },
      body: JSON.stringify({ enrollmentId, score: 95, passed: true }),
    });
    expect(status).toBe(201);
    expect(body.passed).toBe(true);
    resultId = body.id;
  });

  test("issues a certificate", async () => {
    const { status, body } = await call("/api/v1/certificates", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${writeKey}` },
      body: JSON.stringify({ resultId }),
    });
    expect(status).toBe(201);
    certificateCode = body.certificate_code;
  });

  test("verifies the certificate", async () => {
    const { status, body } = await call(`/api/v1/certificates/${certificateCode}`, {
      headers: { Authorization: `Bearer ${writeKey}` },
    });
    expect(status).toBe(200);
    expect(body.valid).toBe(true);
    expect(body.exam_title).toBe("Integration Test Exam");
  });
});

describe("Request logging", () => {
  test("logged requests show up in /api/v1/logs", async () => {
    const { status, body } = await call("/api/v1/logs", {
      headers: { Authorization: `Bearer ${writeKey}` },
    });
    expect(status).toBe(200);
    expect(Array.isArray(body.logs)).toBe(true);
    expect(body.logs.length).toBeGreaterThan(0);
  });
});
