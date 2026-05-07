import React, { useMemo, useState } from "react";
import { submitContactUs } from "../services/contactUsService.js";
import { validateContactUs } from "./contactUsValidation.js";

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #d0d5dd",
  fontSize: 14
};

const textAreaStyle = { ...inputStyle, minHeight: 120, resize: "vertical" };

const buttonStyle = {
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #d0d5dd",
  background: "#101828",
  color: "white",
  fontWeight: 600,
  cursor: "pointer"
};

const SUPPORT_INFO = {
  phone: "1-833-555-0199",
  email: "support@capco.example",
  address: "123 Example Street, Toronto, ON M5J 2N1"
};

export default function ContactUsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [touched, setTouched] = useState({});
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const errors = useMemo(() => validateContactUs({ name, email, message }), [name, email, message]);
  const canSubmit = Object.keys(errors).length === 0 && !busy;

  async function onSubmit(e) {
    e.preventDefault();
    setTouched({ name: true, email: true, message: true });
    setServerError("");
    setSuccessMessage("");
    const currentErrors = validateContactUs({ name, email, message });
    if (Object.keys(currentErrors).length) return;

    setBusy(true);
    try {
      const res = await submitContactUs({ name: name.trim(), email: email.trim(), message: message.trim() });
      setSuccessMessage(res.message || "Your message has been received.");
      setName("");
      setEmail("");
      setMessage("");
      setTouched({});
    } catch (err) {
      setServerError(err?.message || "Unable to submit request");
    } finally {
      setBusy(false);
    }
  }

  function showFieldError(field) {
    return Boolean(touched[field] && errors[field]);
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 16, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto" }}>
      <h1 style={{ margin: "8px 0 4px" }}>Contact Us</h1>
      <p style={{ margin: "0 0 16px", color: "#475467" }}>Send a message to our support team and we’ll get back to you.</p>

      {serverError ? (
        <div role="alert" style={{ color: "#b42318", background: "#fffbfa", border: "1px solid #fee4e2", padding: 12, borderRadius: 8, marginBottom: 12 }}>
          {serverError}
        </div>
      ) : null}

      {successMessage ? (
        <div role="status" style={{ color: "#027a48", background: "#ecfdf3", border: "1px solid #abefc6", padding: 12, borderRadius: 8, marginBottom: 12 }}>
          {successMessage}
        </div>
      ) : null}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <label>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Name</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            autoComplete="name"
            aria-invalid={showFieldError("name") || undefined}
            style={{ ...inputStyle, borderColor: showFieldError("name") ? "#fda29b" : inputStyle.border }}
          />
          {showFieldError("name") ? <div style={{ marginTop: 6, color: "#b42318", fontSize: 13 }}>{errors.name}</div> : null}
        </label>

        <label>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Email</div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            autoComplete="email"
            inputMode="email"
            aria-invalid={showFieldError("email") || undefined}
            style={{ ...inputStyle, borderColor: showFieldError("email") ? "#fda29b" : inputStyle.border }}
          />
          {showFieldError("email") ? <div style={{ marginTop: 6, color: "#b42318", fontSize: 13 }}>{errors.email}</div> : null}
        </label>

        <label>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Message</div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, message: true }))}
            aria-invalid={showFieldError("message") || undefined}
            style={{ ...textAreaStyle, borderColor: showFieldError("message") ? "#fda29b" : textAreaStyle.border }}
          />
          {showFieldError("message") ? <div style={{ marginTop: 6, color: "#b42318", fontSize: 13 }}>{errors.message}</div> : null}
        </label>

        <button disabled={!canSubmit} type="submit" style={{ ...buttonStyle, opacity: canSubmit ? 1 : 0.6 }}>
          {busy ? "Sending…" : "Submit"}
        </button>
      </form>

      <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid #eaecf0" }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 18 }}>Support information</h2>
        <div style={{ display: "grid", gap: 6, color: "#475467" }}>
          <div>
            <span style={{ color: "#101828", fontWeight: 600 }}>Phone:</span> {SUPPORT_INFO.phone}
          </div>
          <div>
            <span style={{ color: "#101828", fontWeight: 600 }}>Email:</span> {SUPPORT_INFO.email}
          </div>
          <div>
            <span style={{ color: "#101828", fontWeight: 600 }}>Office:</span> {SUPPORT_INFO.address}
          </div>
        </div>
      </div>
    </div>
  );
}

