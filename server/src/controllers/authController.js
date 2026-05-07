const { z } = require("zod");
const { Policyholder } = require("../models/Policyholder");
const { comparePassword } = require("../services/passwordService");
const { issueJwt } = require("../services/jwtService");
const { enrollForPolicyholder, verifyForPolicyholder } = require("../services/mfaService");
const { refreshTokenStore } = require("../services/refreshTokenStore");

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

async function login(req, res, next) {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const policyholder = await Policyholder.findByEmail(email);
    if (!policyholder) {
      return res.status(401).json({ error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" } });
    }

    const ok = await comparePassword(password, policyholder.password_hash);
    if (!ok) {
      return res.status(401).json({ error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" } });
    }

    const temporary_token = issueJwt({
      type: "temp",
      ttlSeconds: 10 * 60,
      claims: { policyholder_id: policyholder.id, policy_number: policyholder.policy_number }
    });

    return res.json({ temporary_token, mfa_required: true });
  } catch (err) {
    return next(err);
  }
}

async function enrollMfa(req, res, next) {
  try {
    const { policyholder_id } = req.auth;
    const result = await enrollForPolicyholder(policyholder_id);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

const verifySchema = z.object({
  code: z.string().min(6).max(8)
});

async function verifyMfa(req, res, next) {
  try {
    const { policyholder_id, policy_number } = req.auth;
    const { code } = verifySchema.parse(req.body);

    const policyholder = await verifyForPolicyholder(policyholder_id, code);
    if (!policyholder) {
      return res.status(401).json({ error: { code: "INVALID_MFA", message: "Invalid or expired MFA code" } });
    }

    const session_token = issueJwt({
      type: "session",
      ttlSeconds: 24 * 60 * 60,
      claims: { policyholder_id, policy_number }
    });

    const refresh_token = refreshTokenStore.generateToken();
    await refreshTokenStore.storeToken({ policyholderId: policyholder_id, refreshToken: refresh_token, ttlSeconds: 7 * 24 * 60 * 60 });

    return res.json({
      session_token,
      refresh_token,
      policyholder: { id: policyholder.id, email: policyholder.email, policy_number: policyholder.policy_number }
    });
  } catch (err) {
    return next(err);
  }
}

const refreshSchema = z.object({
  refresh_token: z.string().min(10)
});

async function refreshSession(req, res, next) {
  try {
    const { refresh_token } = refreshSchema.parse(req.body);
    const record = await refreshTokenStore.consumeToken(refresh_token);
    if (!record) return res.status(401).json({ error: { code: "INVALID_REFRESH", message: "Invalid refresh token" } });

    const policyholder = await Policyholder.findById(record.policyholderId);
    if (!policyholder) return res.status(401).json({ error: { code: "INVALID_REFRESH", message: "Invalid refresh token" } });

    const session_token = issueJwt({
      type: "session",
      ttlSeconds: 24 * 60 * 60,
      claims: { policyholder_id: policyholder.id, policy_number: policyholder.policy_number }
    });

    const new_refresh_token = refreshTokenStore.generateToken();
    await refreshTokenStore.storeToken({ policyholderId: policyholder.id, refreshToken: new_refresh_token, ttlSeconds: 7 * 24 * 60 * 60 });

    return res.json({ session_token, refresh_token: new_refresh_token });
  } catch (err) {
    return next(err);
  }
}

async function logout(req, res, next) {
  try {
    const { refresh_token } = req.body || {};
    if (typeof refresh_token === "string") await refreshTokenStore.revokeToken(refresh_token);
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
}

module.exports = { login, enrollMfa, verifyMfa, refreshSession, logout };

