import React from "react";

function maskVin(vin) {
  const s = String(vin || "");
  if (s.length <= 4) return s;
  return `${"•".repeat(Math.max(0, s.length - 4))}${s.slice(-4)}`;
}

export default function VehicleCard({ vehicle, onDownload }) {
  return (
    <div style={{ border: "1px solid #e4e7ec", borderRadius: 12, padding: 16, background: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Vehicle</div>
          <div style={{ color: "#475467" }}>
            {vehicle?.year} {vehicle?.make} {vehicle?.model}
          </div>
          <div style={{ color: "#475467", marginTop: 4 }}>
            <span style={{ color: "#667085" }}>VIN:</span> <span aria-label="Masked VIN">{maskVin(vehicle?.vin)}</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <button
            type="button"
            onClick={onDownload}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #7f56d9",
              background: "#7f56d9",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer"
            }}
            aria-label="Download proof-of-insurance"
          >
            Download Proof-of-Insurance (PDF)
          </button>
        </div>
      </div>
    </div>
  );
}

