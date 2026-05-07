const express = require("express");
const { z } = require("zod");

const contactUsRouter = express.Router();

const contactUsSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().min(1, "Email is required").email("Invalid email format"),
  message: z.string().trim().min(1, "Message is required")
});

async function handleContactUs(req, res) {
  const parsed = contactUsSchema.safeParse(req.body || {});
  if (!parsed.success) {
    const firstError = parsed.error.issues?.[0]?.message || "Invalid request";
    return res.status(400).json({ success: false, error: firstError });
  }

  const { name, email, message } = parsed.data;
  console.info("[contact-us] submission", {
    timestamp: new Date().toISOString(),
    name,
    email,
    message
  });

  return res.status(200).json({ success: true, message: "Your message has been received." });
}

contactUsRouter.post("/", handleContactUs);

module.exports = { contactUsRouter, handleContactUs };
