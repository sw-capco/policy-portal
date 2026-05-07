export async function submitContactUs({ name, email, message }) {
  const res = await fetch("/api/contact-us", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, message })
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    const errMsg = data?.error || text || `Unable to submit (${res.status})`;
    throw new Error(errMsg);
  }

  if (!data?.success) throw new Error(data?.error || "Unable to submit");
  return data;
}

