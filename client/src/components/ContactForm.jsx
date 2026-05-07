import React, { useMemo, useState } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateName(value) {
  if (!value.trim()) return "Name is required.";
  return null;
}

function validateEmail(value) {
  if (!value.trim()) return "Email is required.";
  if (!EMAIL_RE.test(value.trim())) return "Enter a valid email address.";
  return null;
}

function validateMessage(value) {
  const trimmed = value.trim();
  if (!trimmed) return "Message is required.";
  if (trimmed.length < 10) return "Message must be at least 10 characters.";
  return null;
}

function validateAll({ name, email, message }) {
  return {
    name: validateName(name),
    email: validateEmail(email),
    message: validateMessage(message)
  };
}

export default function ContactForm({ onSubmit }) {
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [touched, setTouched] = useState({ name: false, email: false, message: false });
  const [fieldErrors, setFieldErrors] = useState({ name: null, email: null, message: null });
  const [submitError, setSubmitError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const validity = useMemo(() => validateAll(values), [values]);
  const isValid = !validity.name && !validity.email && !validity.message;

  function setField(name, value) {
    setValues((v) => ({ ...v, [name]: value }));
    setSubmitError(null);
    setFieldErrors((e) => ({ ...e, [name]: null }));
  }

  function markTouched(name) {
    setTouched((t) => ({ ...t, [name]: true }));
    const next = validateAll(values);
    setFieldErrors((e) => ({ ...e, [name]: next[name] }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);

    const next = validateAll(values);
    setFieldErrors(next);
    setTouched({ name: true, email: true, message: true });
    if (next.name || next.email || next.message) return;

    setSubmitting(true);
    try {
      const result = await onSubmit({ ...values });
      if (result?.ok) {
        setValues({ name: "", email: "", message: "" });
        setTouched({ name: false, email: false, message: false });
        setFieldErrors({ name: null, email: null, message: null });
        setSuccessMessage(result.message || "Thank you for contacting us. We will respond within 1–2 business days.");
        window.setTimeout(() => setSuccessMessage(null), 4000);
      } else if (result?.fieldErrors) {
        setFieldErrors((e2) => ({ ...e2, ...result.fieldErrors }));
        setSubmitError(result.message || "Please correct the errors below.");
      } else {
        setSubmitError(result?.message || "Unable to submit your request. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section aria-label="Contact form">
      <h2 style={{ margin: "0 0 12px", fontSize: 18 }}>Send us a message</h2>
      {successMessage ? (
        <div
          role="status"
          style={{
            marginBottom: 12,
            border: "1px solid #abefc6",
            background: "#ecfdf3",
            color: "#067647",
            padding: 12,
            borderRadius: 10,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12
          }}
        >
          <div style={{ fontSize: 14 }}>{successMessage}</div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            style={{
              border: "1px solid #abefc6",
              background: "#ffffff",
              padding: "6px 10px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 14
            }}
          >
            Dismiss
          </button>
        </div>
      ) : null}
      {submitError ? (
        <div role="alert" style={{ marginBottom: 12, color: "#b42318", background: "#fffbfa", border: "1px solid #fee4e2", padding: 12, borderRadius: 10 }}>
          {submitError}
        </div>
      ) : null}
      <form onSubmit={handleSubmit} noValidate style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#344054" }}>Name</span>
          <input
            name="name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={(e) => setField("name", e.target.value)}
            onBlur={() => markTouched("name")}
            aria-invalid={Boolean((touched.name && validity.name) || fieldErrors.name)}
            aria-describedby="contact-name-error"
            style={{
              border: `1px solid ${((touched.name && validity.name) || fieldErrors.name) ? "#fda29b" : "#d0d5dd"}`,
              borderRadius: 10,
              padding: "10px 12px",
              fontSize: 14
            }}
          />
          {((touched.name && validity.name) || fieldErrors.name) ? (
            <span id="contact-name-error" style={{ color: "#b42318", fontSize: 12 }}>
              {fieldErrors.name || validity.name}
            </span>
          ) : null}
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#344054" }}>Email</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => setField("email", e.target.value)}
            onBlur={() => markTouched("email")}
            aria-invalid={Boolean((touched.email && validity.email) || fieldErrors.email)}
            aria-describedby="contact-email-error"
            style={{
              border: `1px solid ${((touched.email && validity.email) || fieldErrors.email) ? "#fda29b" : "#d0d5dd"}`,
              borderRadius: 10,
              padding: "10px 12px",
              fontSize: 14
            }}
          />
          {((touched.email && validity.email) || fieldErrors.email) ? (
            <span id="contact-email-error" style={{ color: "#b42318", fontSize: 12 }}>
              {fieldErrors.email || validity.email}
            </span>
          ) : null}
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#344054" }}>Message</span>
          <textarea
            name="message"
            rows={6}
            value={values.message}
            onChange={(e) => setField("message", e.target.value)}
            onBlur={() => markTouched("message")}
            aria-invalid={Boolean((touched.message && validity.message) || fieldErrors.message)}
            aria-describedby="contact-message-error"
            style={{
              border: `1px solid ${((touched.message && validity.message) || fieldErrors.message) ? "#fda29b" : "#d0d5dd"}`,
              borderRadius: 10,
              padding: "10px 12px",
              fontSize: 14,
              resize: "vertical"
            }}
          />
          {((touched.message && validity.message) || fieldErrors.message) ? (
            <span id="contact-message-error" style={{ color: "#b42318", fontSize: 12 }}>
              {fieldErrors.message || validity.message}
            </span>
          ) : null}
        </label>

        <button
          type="submit"
          disabled={!isValid || submitting}
          style={{
            justifySelf: "start",
            border: "1px solid #175cd3",
            background: submitting ? "#84caff" : "#175cd3",
            color: "#ffffff",
            padding: "10px 14px",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 700,
            cursor: !isValid || submitting ? "not-allowed" : "pointer"
          }}
        >
          {submitting ? "Submitting…" : "Submit"}
        </button>
      </form>
    </section>
  );
}

