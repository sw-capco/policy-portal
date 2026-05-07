import React from "react";

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid #eaecf0",
        marginTop: 24,
        padding: "16px 0",
        background: "#ffffff"
      }}
    >
      <div
        style={{
          maxWidth: 980,
          margin: "0 auto",
          padding: "0 16px",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap"
        }}
      >
        <div style={{ color: "#475467", fontSize: 14 }}>© {new Date().getFullYear()} Policy Portal</div>
        <a
          href="/contact-us"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#175cd3", textDecoration: "none", fontSize: 14, fontWeight: 600 }}
        >
          Contact Us
        </a>
      </div>
    </footer>
  );
}

