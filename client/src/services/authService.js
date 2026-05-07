export async function login({ email, password }) {
  const res = await fetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const bodyText = await res.text();
  if (!res.ok) throw new Error(bodyText || `Login failed (${res.status})`);

  const data = bodyText ? JSON.parse(bodyText) : {};
  if (!data.temporary_token) throw new Error("Login did not return a temporary token");
  return data;
}

export async function enrollMfa({ temporaryToken }) {
  const res = await fetch("/auth/mfa/enroll", {
    method: "POST",
    headers: { Authorization: `Bearer ${temporaryToken}` }
  });

  const bodyText = await res.text();
  if (!res.ok) throw new Error(bodyText || `MFA enroll failed (${res.status})`);

  return bodyText ? JSON.parse(bodyText) : {};
}

export async function verifyMfa({ temporaryToken, code }) {
  const res = await fetch("/auth/mfa/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${temporaryToken}` },
    body: JSON.stringify({ code })
  });

  const bodyText = await res.text();
  if (!res.ok) throw new Error(bodyText || `MFA verify failed (${res.status})`);

  const data = bodyText ? JSON.parse(bodyText) : {};
  if (!data.session_token) throw new Error("MFA verify did not return a session token");
  if (!data.refresh_token) throw new Error("MFA verify did not return a refresh token");
  return data;
}

