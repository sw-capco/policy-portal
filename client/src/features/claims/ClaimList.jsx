import { useSelector } from 'react-redux';
import { selectAllClaims } from './claimsSlice';

function ClaimList() {
  const claims = useSelector(selectAllClaims);

  return (
    <div className="claim-list">
      <h2>My Claims</h2>
      <ul>
        {claims.map(claim => (
          <li key={claim.id}>
            <div className="claim-card">
              <h3>{claim.claimNumber}</h3>
              <p>Status: {claim.status}</p>
            </div>
          </li>
        ))}
      </ul>
      <button>File New Claim</button>
    </div>
  );
}
