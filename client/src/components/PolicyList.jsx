import React, { useEffect, useState } from 'react';

function PolicyList() {
  const [policies, setPolicies] = useState([]);

  useEffect(() => {
    // Fetch policies from the server
    fetch('/api/policies')
      .then(res => res.json())
      .then(data => setPolicies(data));
  }, []);

  return (
    <div>
      <h2>Your Policies</h2>
      <ul>
        {policies.map(policy => (
          <li key={policy.id}>
            <h3>{policy.policyNumber}</h3>
            <p>Vehicle: {policy.vehicle.make} {policy.vehicle.model}</p>
            <p>Coverage: {policy.coverageDetails}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PolicyList;
