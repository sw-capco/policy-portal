const crypto = require("crypto");
const { Policyholder } = require("../models/Policyholder");
const emailService = require("./emailService");

// Simple in-memory MFA store for MVP/demo. Replace with Redis in production.
const sessions = new Map();

function nowMs() {
  return Date.now();
}

function generateSessionId() {
  return crypto.randomBytes(18).toString("hex");
}

function generate6DigitCode() {
  const n = crypto.randomInt(0, 1_000_000);
  return String(n).padStart(6, "0");
}

function constantTimeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

async function startEmailMfaSession({ policyholderId, email, ttlMs = 5 * 60 * 1000 }) {
  const policyholder = await Policyholder.findById(policyholderId);
  if (!policyholder || policyholder.email.toLowerCase() !== String(email).toLowerCase()) {
    throw new Error("Invalid policyholder");
  }

  const sessionId = generateSessionId();
  const code = generate6DigitCode();
  const codeHash = crypto.createHash("sha256").update(code).digest("hex");

  sessions.set(sessionId, {
    policyholderId: policyholder.id,
    policyNumber: policyholder.policy_number,
    codeHash,
    expiresAtMs: nowMs() + ttlMs
  });

  await emailService.sendMfaCodeEmail({ toEmail: policyholder.email, code });
  return { sessionId };
}

async function verifyEmailMfaSession({ sessionId, code }) {
  const record = sessions.get(String(sessionId));
  if (!record) return null;

  if (nowMs() > record.expiresAtMs) {
    sessions.delete(String(sessionId));
    return null;
  }

  const codeHash = crypto.createHash("sha256").update(String(code)).digest("hex");
  const ok = constantTimeEqual(codeHash, record.codeHash);
  if (!ok) return null;

  // Single-use: consume the session after successful verification.
  sessions.delete(String(sessionId));
  return { policyholderId: record.policyholderId, policyNumber: record.policyNumber };
}

function __dangerous__getSessionsForTest() {
  return sessions;
}

module.exports = { startEmailMfaSession, verifyEmailMfaSession, __dangerous__getSessionsForTest };
