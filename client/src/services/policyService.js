export async function fetchPolicyDetails({ policyNumber, sessionToken }) {
  const res = await fetch(`/policy/${encodeURIComponent(policyNumber)}`, {
    headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to load policy (${res.status})`);
  }
  return res.json();
}

export async function downloadProofOfInsurance({ policyNumber, sessionToken }) {
  const res = await fetch(`/policy/${encodeURIComponent(policyNumber)}/proof-of-insurance`, {
    headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Download failed (${res.status})`);
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `proof-of-insurance-${policyNumber}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

