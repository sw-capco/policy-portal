const crypto = require("crypto");

function getKey() {
  const key = process.env.MFA_SECRET_KEY;
  // No secrets are committed; require env in real deployments.
  // For local dev without env, fall back to a deterministic non-secret key to keep the demo usable.
  const fallback = "dev-only-not-a-secret-dev-only-not-a-secret";
  const raw = (key && key.length >= 32 ? key : fallback).slice(0, 32);
  return Buffer.from(raw, "utf8");
}

function encryptForStorage(plaintext) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(String(plaintext), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]).toString("base64");
}

function decryptFromStorage(payloadB64) {
  const buf = Buffer.from(String(payloadB64), "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const ciphertext = buf.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintext.toString("utf8");
}

module.exports = { encryptForStorage, decryptFromStorage };

