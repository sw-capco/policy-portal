import React from "react";
import ContactForm from "../components/ContactForm.jsx";
import SupportInfoCard from "../components/SupportInfoCard.jsx";

async function submitContactUs({ name, email, message }) {
  const res = await fetch("/api/contact-us", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, message })
  });

  const bodyText = await res.text();
  let data = null;
  try {
    data = bodyText ? JSON.parse(bodyText) : null;
  } catch {
    data = null;
  }

  if (res.ok && data?.success) return { ok: true, message: data.message };

  if (res.status === 400 && data?.success === false && Array.isArray(data.errors)) {
    const fieldErrors = {};
    for (const err of data.errors) {
      if (!err?.field || typeof err.message !== "string") continue;
      fieldErrors[err.field] = err.message;
    }
    return { ok: false, message: "Please correct the errors below.", fieldErrors };
  }

  return { ok: false, message: (data && data.message) || "Unable to submit your request. Please try again." };
}

export default function ContactUsPage() {
  // Values intentionally non-sensitive placeholders until business-approved values are wired in.
  const support = {
    phone: "1-800-555-0199",
    email: "support@example.com",
    addressLines: ["123 Example Street", "Toronto, ON M5V 2T6", "Canada"]
  };

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 16, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto" }}>
      <h1 style={{ margin: "8px 0 8px" }}>Contact Us</h1>
      <p style={{ margin: "0 0 16px", color: "#475467", fontSize: 14, lineHeight: 1.45 }}>
        Need help with your policy or documents? Send us a message and our support team will respond within 1–2 business days.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, alignItems: "start" }}>
        <div
          style={{
            border: "1px solid #eaecf0",
            borderRadius: 12,
            padding: 16,
            background: "#ffffff"
          }}
        >
          <ContactForm onSubmit={submitContactUs} />
        </div>
        <SupportInfoCard phone={support.phone} email={support.email} addressLines={support.addressLines} />
      </div>
    </div>
  );
}

