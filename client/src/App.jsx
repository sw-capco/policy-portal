import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import PolicyDetailsPage from "./pages/PolicyDetailsPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/policy/ON-123-456-789" replace />} />
      <Route path="/policy/:policyNumber" element={<PolicyDetailsPage />} />
    </Routes>
  );
}

