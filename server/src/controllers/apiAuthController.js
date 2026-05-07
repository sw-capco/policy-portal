const { z } = require("zod");
const { Policyholder } = require("../models/Policyholder");
const { comparePassword } = require("../services/passwordService");
const { issueJwt } = require("../services/jwtService");
const { startEmailMfaSession, verifyEmailMfaSession } = require("../services/emailMfaService");

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

async function login(req, res, next) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid request body" });
    const { email, password } = parsed.data;

    const policyholder = await Policyholder.findByEmail(email);
    if (!policyholder) return res.status(401).json({ error: "Invalid email or password" });

    const ok = await comparePassword(password, policyholder.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid email or password" });

    if (!policyholder.mfa_enabled) {
      const sessionToken = issueJwt({
        type: "session",
        ttlSeconds: 24 * 60 * 60,
        claims: { policyholderId: policyholder.id, policyNumber: policyholder.policy_number }
      });
      return res.json({ sessionToken });
    }

    const session = await startEmailMfaSession({ policyholderId: policyholder.id, email: policyholder.email });
    return res.json({ mfaRequired: true, mfaChannel: "email", sessionId: session.sessionId });
  } catch (err) {
    return next(err);
  }
}

const mfaSchema = z.object({
  sessionId: z.string().min(10),
  code: z.string().min(6).max(6)
});

async function mfa(req, res, next) {
  try {
    const parsed = mfaSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid request body" });
    const { sessionId, code } = parsed.data;

    const result = await verifyEmailMfaSession({ sessionId, code });
    if (!result) return res.status(401).json({ error: "Invalid or expired MFA code" });

    const sessionToken = issueJwt({
      type: "session",
      ttlSeconds: 24 * 60 * 60,
      claims: { policyholderId: result.policyholderId, policyNumber: result.policyNumber }
    });

    return res.json({ sessionToken });
  } catch (err) {
    return next(err);
  }
}

module.exports = { login, mfa };

