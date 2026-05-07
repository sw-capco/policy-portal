const { verifyJwt } = require("../services/jwtService");

function getBearerToken(req) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

function requireTempToken(req, res, next) {
  const token = getBearerToken(req);
  if (!token) return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Missing bearer token" } });

  const verified = verifyJwt(token, { expectedType: "temp" });
  if (!verified.ok) return res.status(401).json({ error: { code: "UNAUTHORIZED", message: verified.error } });

  req.auth = verified.payload;
  return next();
}

function requireSessionToken(req, res, next) {
  const token = getBearerToken(req);
  if (!token) return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Missing bearer token" } });

  const verified = verifyJwt(token, { expectedType: "session" });
  if (!verified.ok) return res.status(401).json({ error: { code: "UNAUTHORIZED", message: verified.error } });

  req.auth = verified.payload;
  return next();
}

module.exports = { requireTempToken, requireSessionToken };

