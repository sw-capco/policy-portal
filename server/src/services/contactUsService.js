async function submitContactInquiry({ name, email, message, meta }) {
  // Placeholder for persistence or ticketing integration.
  // Intentionally does not log message contents.
  return {
    ok: true,
    receivedAt: meta.receivedAt,
    requesterIp: meta.requesterIp,
    name,
    email,
    message
  };
}

module.exports = { submitContactInquiry };

