const { Policy } = require("../models/Policy");

async function getPolicyByNumberForPolicyholder({ policyNumber, policyholderId }) {
  const policy = await Policy.findByNumber(policyNumber);
  if (!policy || policy.status !== "active") return { status: "not_found" };
  if (String(policy.policyholder_id) !== String(policyholderId)) return { status: "forbidden" };
  return { status: "ok", policy };
}

async function getProofPdfForPolicy(policy) {
  // Minimal valid PDF bytes; replace with real proof-of-insurance rendering later.
  // Keeping it deterministic and dependency-free for MVP scaffolding.
  void policy;
  const header = "%PDF-1.4\n";
  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>\nendobj\n",
    "4 0 obj\n<< /Length 44 >>\nstream\nBT\n/F1 24 Tf\n72 720 Td\n(Proof of Insurance) Tj\nET\nendstream\nendobj\n",
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n"
  ];

  let body = header;
  const offsets = [0];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(body, "utf8"));
    body += obj;
  }

  const xrefStart = Buffer.byteLength(body, "utf8");
  let xref = `xref\n0 ${objects.length + 1}\n`;
  xref += "0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i++) {
    xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }

  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  return Buffer.from(body + xref + trailer, "utf8");
}

module.exports = { getPolicyByNumberForPolicyholder, getProofPdfForPolicy };
