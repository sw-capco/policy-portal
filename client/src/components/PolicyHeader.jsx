import React from "react";

function badgeStyle(status) {
  const common = { display: "inline-block", padding: "2px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600 };
  if (status === "active") return { ...common, color: "#027a48", background: "#ecfdf3", border: "1px solid #abefc6" };
  return { ...common, color: "#344054", background: "#f2f4f7", border: "1px solid #e4e7ec" };
}

export default function PolicyHeader({ policy }) {
  return (
    <div style={{ border: "1px solid #e4e7ec", borderRadius: 12, padding: 16, background: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ color: "#667085", fontSize: 12 }}>Policy Number</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{policy.policy_number}</div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
          <span style={badgeStyle(policy.status)} aria-label={`Status ${policy.status}`}>
            {String(policy.status || "").toUpperCase()}
          </span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 12, color: "#475467" }}>
        <div>
          <div style={{ fontSize: 12, color: "#667085" }}>Effective</div>
          <div>{policy.effective_date}</div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: "#667085" }}>Expiry</div>
          <div>{policy.expiry_date}</div>
        </div>
      </div>
    </div>
  );
}

