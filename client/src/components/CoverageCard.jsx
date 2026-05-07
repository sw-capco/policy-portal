import React from "react";

function formatMoney(n) {
  if (typeof n !== "number") return String(n ?? "");
  return n.toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });
}

function label(type) {
  const t = String(type || "");
  if (t === "liability") return "Liability";
  if (t === "collision") return "Collision";
  if (t === "comprehensive") return "Comprehensive";
  return t;
}

export default function CoverageCard({ coverage }) {
  return (
    <div style={{ border: "1px solid #e4e7ec", borderRadius: 12, padding: 16, background: "#fff" }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>{label(coverage.type)}</div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, color: "#475467" }}>
        <div>
          <div style={{ fontSize: 12, color: "#667085" }}>Limit</div>
          <div>{formatMoney(coverage.limit)}</div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: "#667085" }}>Deductible</div>
          <div>{formatMoney(coverage.deductible)}</div>
        </div>
      </div>
    </div>
  );
}

