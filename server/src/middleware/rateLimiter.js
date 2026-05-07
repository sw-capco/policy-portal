const rateLimit = require("express-rate-limit");

function rateLimiter({ windowMs, max }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: { code: "RATE_LIMITED", message: "Too many requests. Please try again later." }
    }
  });
}

module.exports = { rateLimiter };

