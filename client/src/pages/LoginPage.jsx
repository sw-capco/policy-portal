import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { login, verifyMfa } from "../services/authService.js";

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #d0d5dd",
  fontSize: 14
};

const buttonStyle = {
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #d0d5dd",
  background: "#101828",
  color: "white",
  fontWeight: 600,
  cursor: "pointer"
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const nextPath = useMemo(() => params.get("next") || "/policy/ON-123-456-789", [params]);

  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("Password123!");
  const [temporaryToken, setTemporaryToken] = useState("");
  const [code, setCode] = useState("000000");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const hasSessionToken = Boolean(window.localStorage.getItem("session_token"));

  async function onStartLogin(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await login({ email, password });
      setTemporaryToken(result.temporary_token);
    } catch (err) {
      setError(err?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  async function onVerify(e) {
    e.preventDefault();
    if (!temporaryToken) {
      setError("Missing temporary token. Start login again.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await verifyMfa({ temporaryToken, code });
      window.localStorage.setItem("session_token", result.session_token);
      window.localStorage.setItem("refresh_token", result.refresh_token);
      if (result.policyholder) window.localStorage.setItem("policyholder", JSON.stringify(result.policyholder));
      navigate(nextPath, { replace: true });
    } catch (err) {
      setError(err?.message || "MFA verification failed");
    } finally {
      setBusy(false);
    }
  }

  function onContinue() {
    navigate(nextPath, { replace: true });
  }

  function onClearTokens() {
    window.localStorage.removeItem("session_token");
    window.localStorage.removeItem("refresh_token");
    window.localStorage.removeItem("policyholder");
    setTemporaryToken("");
    setCode("000000");
    setError("");
  }

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: 16, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto" }}>
      <h1 style={{ margin: "8px 0 4px" }}>Sign in</h1>
      <p style={{ margin: "0 0 16px", color: "#475467" }}>Local demo auth flow (email/password + TOTP MFA).</p>

      {error ? (
        <div role="alert" style={{ color: "#b42318", background: "#fffbfa", border: "1px solid #fee4e2", padding: 12, borderRadius: 8, marginBottom: 12 }}>
          {error}
        </div>
      ) : null}

      {hasSessionToken ? (
        <div style={{ background: "#f9fafb", border: "1px solid #eaecf0", padding: 12, borderRadius: 8, marginBottom: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>You already have a session token</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={onContinue} style={buttonStyle}>
              Continue
            </button>
            <button type="button" onClick={onClearTokens} style={{ ...buttonStyle, background: "white", color: "#101828" }}>
              Clear tokens
            </button>
          </div>
        </div>
      ) : null}

      <form onSubmit={onStartLogin} style={{ display: "grid", gap: 10 }}>
        <label>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Email</div>
          <input value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" style={inputStyle} />
        </label>
        <label>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Password</div>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" style={inputStyle} />
        </label>
        <button disabled={busy} type="submit" style={{ ...buttonStyle, opacity: busy ? 0.7 : 1 }}>
          {busy ? "Working…" : "Sign in"}
        </button>
      </form>

      {temporaryToken ? (
        <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid #eaecf0" }}>
          <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>MFA</h2>
          <p style={{ margin: "0 0 12px", color: "#475467" }}>
            Dummy mode is enabled for local development. Use code <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}>000000</span>.
          </p>

          <form onSubmit={onVerify} style={{ display: "grid", gap: 10, marginTop: 12 }}>
            <label>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>TOTP code</div>
              <input value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" placeholder="123456" style={inputStyle} />
            </label>
            <button disabled={busy} type="submit" style={{ ...buttonStyle, opacity: busy ? 0.7 : 1 }}>
              {busy ? "Verifying…" : "Verify & continue"}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
