const { z } = require("zod");
const contactUsService = require("../services/contactUsService");

const contactSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  message: z.string().trim().min(10).max(5000)
});

function escapeHtml(value) {
  return String(value)
    .replace(/\u0000/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function mapZodIssues(issues) {
  const errors = [];
  for (const issue of issues || []) {
    const field = Array.isArray(issue.path) && issue.path.length ? String(issue.path[0]) : "unknown";
    if (field === "name" && issue.code === "too_small") errors.push({ field: "name", message: "Name is required." });
    else if (field === "email" && (issue.code === "too_small" || issue.validation === "email")) errors.push({ field: "email", message: "Enter a valid email address." });
    else if (field === "message" && issue.code === "too_small") errors.push({ field: "message", message: "Message must be at least 10 characters." });
    else if (field === "message") errors.push({ field: "message", message: "Message is required." });
    else if (field === "name") errors.push({ field: "name", message: "Name is required." });
    else if (field === "email") errors.push({ field: "email", message: "Enter a valid email address." });
  }

  // Ensure stable shape: at least one error when invalid.
  if (!errors.length) errors.push({ field: "unknown", message: "Invalid request body." });
  return errors;
}

async function submitContactForm(req, res, next) {
  try {
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: mapZodIssues(parsed.error.issues) });
    }

    const requesterIp = req.ip || req.headers["x-forwarded-for"] || "unknown";
    const receivedAt = new Date().toISOString();

    const sanitized = {
      name: escapeHtml(parsed.data.name),
      email: parsed.data.email.trim(),
      message: escapeHtml(parsed.data.message)
    };

    await contactUsService.submitContactInquiry({
      ...sanitized,
      meta: { requesterIp, receivedAt }
    });

    console.info(JSON.stringify({ event: "contact_us_submission", receivedAt, requesterIp }));

    return res.status(200).json({
      success: true,
      message: "Thank you for contacting us. We will respond within 1-2 business days."
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { submitContactForm };
