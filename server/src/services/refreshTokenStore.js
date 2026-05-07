const crypto = require("crypto");

// Minimal refresh token store with in-memory fallback.
// If REDIS_URL is provided later, this file can be swapped to Redis-backed storage.

const mem = new Map();

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

async function storeToken({ policyholderId, refreshToken, ttlSeconds }) {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  mem.set(refreshToken, { policyholderId, expiresAt });
}

async function consumeToken(refreshToken) {
  const record = mem.get(refreshToken);
  if (!record) return null;
  mem.delete(refreshToken);
  if (Date.now() > record.expiresAt) return null;
  return record;
}

async function revokeToken(refreshToken) {
  mem.delete(refreshToken);
}

const refreshTokenStore = { generateToken, storeToken, consumeToken, revokeToken };

module.exports = { refreshTokenStore };

