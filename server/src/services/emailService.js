async function sendMfaCodeEmail({ toEmail, code }) {
  // Intentionally avoid logging MFA codes.
  if (!toEmail) throw new Error("Missing toEmail");
  if (!code) throw new Error("Missing code");
  return { ok: true };
}

module.exports = { sendMfaCodeEmail };
