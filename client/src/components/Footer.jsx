import React from "react";

export default function Footer() {
  return (
    <footer style={{ marginTop: "auto", borderTop: "1px solid #eaecf0", padding: "14px 16px", background: "white" }}>
      <div style={{ maxWidth: 980, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontSize: 13, color: "#667085" }}>© {new Date().getFullYear()} Policy Portal</div>
        <nav style={{ display: "flex", gap: 14, fontSize: 14 }}>
          <a href="/contact-us" target="_blank" rel="noopener noreferrer" style={{ color: "#101828", textDecoration: "none", fontWeight: 600 }}>
            Contact Us
          </a>
        </nav>
      </div>
    </footer>
  );
}

