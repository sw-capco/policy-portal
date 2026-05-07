import React from "react";

export default function SupportInfoCard({ phone, email, addressLines }) {
  return (
    <section
      aria-label="Support contact information"
      style={{
        border: "1px solid #eaecf0",
        borderRadius: 12,
        padding: 16,
        background: "#ffffff"
      }}
    >
      <h2 style={{ margin: "0 0 12px", fontSize: 18 }}>Support</h2>
      <div style={{ display: "grid", gap: 10, color: "#344054", fontSize: 14 }}>
        <div>
          <div style={{ color: "#667085", fontWeight: 600, marginBottom: 4 }}>Phone</div>
          <a href={`tel:${phone}`} style={{ color: "#175cd3", textDecoration: "none" }}>
            {phone}
          </a>
        </div>
        <div>
          <div style={{ color: "#667085", fontWeight: 600, marginBottom: 4 }}>Email</div>
          <a href={`mailto:${email}`} style={{ color: "#175cd3", textDecoration: "none" }}>
            {email}
          </a>
        </div>
        <div>
          <div style={{ color: "#667085", fontWeight: 600, marginBottom: 4 }}>Office</div>
          <address style={{ fontStyle: "normal", margin: 0, lineHeight: 1.4 }}>
            {addressLines.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </address>
        </div>
      </div>
    </section>
  );
}

