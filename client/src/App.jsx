import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import PolicyDetailsPage from "./pages/PolicyDetailsPage.jsx";
import ContactUsPage from "./pages/ContactUsPage.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/policy/ON-123-456-789" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/policy/:policyNumber" element={<PolicyDetailsPage />} />
          <Route path="/contact-us" element={<ContactUsPage />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}
