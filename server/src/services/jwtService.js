const jwt = require("jsonwebtoken");

function getJwtSecret() {
  // Never commit real secrets. Use env in deployments.
  return process.env.JWT_SECRET || "dev-only-jwt-secret";
}

function issueJwt({ type, ttlSeconds, claims }) {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const payload = {
    typ: type,
    iat: nowSeconds,
    ...claims
  };
  return jwt.sign(payload, getJwtSecret(), { expiresIn: ttlSeconds });
}

function verifyJwt(token, { expectedType }) {
  try {
    const payload = jwt.verify(token, getJwtSecret());
    if (!payload || payload.typ !== expectedType) return { ok: false, error: "Invalid token type" };
    return { ok: true, payload };
  } catch (err) {
    return { ok: false, error: "Invalid or expired token" };
  }
}

module.exports = { issueJwt, verifyJwt };

