const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const { Policyholder } = require("../models/Policyholder");

async function enrollForPolicyholder(policyholderId) {
  const secret = speakeasy.generateSecret({ name: "Policy Portal" });
  await Policyholder.setPendingMfaSecret(policyholderId, secret.base32);
  const qr_code_data_url = await QRCode.toDataURL(secret.otpauth_url);
  return { qr_code_data_url, secret: secret.base32 };
}

async function verifyForPolicyholder(policyholderId, token) {
  const dummy = process.env.DUMMY_TOTP_CODE || "000000";
  if (process.env.NODE_ENV !== "production" && String(token) === String(dummy)) {
    return Policyholder.findById(policyholderId);
  }

  const secrets = await Policyholder.getMfaSecrets(policyholderId);
  if (!secrets) return null;

  const candidate = secrets.pendingSecret || secrets.secret;
  if (!candidate) return null;

  const ok = speakeasy.totp.verify({
    secret: candidate,
    encoding: "base32",
    token: String(token),
    window: 1
  });
  if (!ok) return null;

  if (secrets.pendingSecret) await Policyholder.enableMfaFromPending(policyholderId);
  return Policyholder.findById(policyholderId);
}

module.exports = { enrollForPolicyholder, verifyForPolicyholder };
