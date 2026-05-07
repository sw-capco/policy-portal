const express = require("express");
const { rateLimiter } = require("../middleware/rateLimiter");
const { login, mfa } = require("../controllers/apiAuthController");

const apiAuthRouter = express.Router();

apiAuthRouter.post("/login", rateLimiter({ windowMs: 60_000, max: 10 }), login);
apiAuthRouter.post("/mfa", rateLimiter({ windowMs: 60_000, max: 10 }), mfa);

module.exports = { apiAuthRouter };

