const express = require("express");
const helmet = require("helmet");

const { authRouter } = require("./routes/auth");
const { apiAuthRouter } = require("./routes/apiAuth");
const { policyRouter } = require("./routes/policy");

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(express.json({ limit: "2mb" }));

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/auth", authRouter);
  app.use("/api/auth", apiAuthRouter);
  app.use("/policy", policyRouter);

  // Consistent error shape
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    const status = err.statusCode || 500;
    res.status(status).json({
      error: {
        code: err.code || "INTERNAL_ERROR",
        message: err.message || "Unexpected error"
      }
    });
  });

  return app;
}

module.exports = { createApp };
