import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function ClaimList() {
  const [claims, setClaims] = useState([]);

  useEffect(() => {
    // Fetch claims from the server
    fetch('/api/claims')
      .then(res => res.json())
      .then(data => setClaims(data));
  }, []);

  return (
    <div>
      <h2>Your Claims</h2>
      <ul>
        {claims.map(claim => (
          <li key={claim.id}>
            <h3>{claim.claimNumber}</h3>
            <p>Date: {claim.claimDate}</p>
            <p>Status: {claim.status}</p>
          </li>
        ))}
      </ul>
      <Link to="/new-claim">Initiate New Claim</Link>
    </div>
  );
}

export default ClaimList;
