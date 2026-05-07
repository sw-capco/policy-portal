import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchPolicyDetails, downloadProofOfInsurance } from "../services/policyService.js";
import PolicyHeader from "../components/PolicyHeader.jsx";
import CoverageCard from "../components/CoverageCard.jsx";
import VehicleCard from "../components/VehicleCard.jsx";

export default function PolicyDetailsPage() {
  const { policyNumber } = useParams();
  const navigate = useNavigate();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const authToken = window.localStorage.getItem("session_token") || "";

  useEffect(() => {
    if (!authToken) navigate(`/login?next=${encodeURIComponent(`/policy/${policyNumber}`)}`, { replace: true });
  }, [authToken, navigate, policyNumber]);

  useEffect(() => {
    if (!authToken) return;
    let alive = true;
    setLoading(true);
    setError(null);
    fetchPolicyDetails({ policyNumber, sessionToken: authToken })
      .then((data) => {
        if (!alive) return;
        setPolicy(data);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e.message || "Unable to load policy details");
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [policyNumber, authToken]);

  async function onDownload() {
    try {
      await downloadProofOfInsurance({ policyNumber, sessionToken: authToken });
      // Minimal UX: alert. Replace with toast system when UI framework exists.
      window.alert("Proof-of-insurance PDF downloaded.");
    } catch (e) {
      window.alert(e.message || "Download failed");
    }
  }

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 16, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto" }}>
      <h1 style={{ margin: "8px 0 16px" }}>Policy Details</h1>
      {loading ? <div aria-label="Loading">Loading…</div> : null}
      {error ? (
        <div role="alert" style={{ color: "#b42318", background: "#fffbfa", border: "1px solid #fee4e2", padding: 12, borderRadius: 8 }}>
          {error}
        </div>
      ) : null}
      {policy ? (
        <>
          <PolicyHeader policy={policy} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, marginTop: 12 }}>
            {policy.coverages?.map((c) => (
              <CoverageCard key={c.type} coverage={c} />
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <VehicleCard vehicle={policy.vehicle} onDownload={onDownload} />
          </div>
        </>
      ) : null}
    </div>
  );
}
