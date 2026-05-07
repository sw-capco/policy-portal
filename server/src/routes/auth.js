const express = require("express");
const { rateLimiter } = require("../middleware/rateLimiter");
const {
  login,
  enrollMfa,
  verifyMfa,
  refreshSession,
  logout
} = require("../controllers/authController");
const { requireTempToken, requireSessionToken } = require("../middleware/authMiddleware");

const authRouter = express.Router();

authRouter.post("/login", rateLimiter({ windowMs: 60_000, max: 10 }), login);
authRouter.post("/mfa/enroll", rateLimiter({ windowMs: 60_000, max: 10 }), requireTempToken, enrollMfa);
authRouter.post("/mfa/verify", rateLimiter({ windowMs: 60_000, max: 10 }), requireTempToken, verifyMfa);
authRouter.post("/refresh", rateLimiter({ windowMs: 60_000, max: 20 }), refreshSession);
authRouter.post("/logout", requireSessionToken, logout);

module.exports = { authRouter };

