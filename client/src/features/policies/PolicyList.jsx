import { useSelector } from 'react-redux';
import { selectAllPolicies } from './policiesSlice';

function PolicyList() {
  const policies = useSelector(selectAllPolicies);

  return (
    <div className="policy-list">
      <h2>My Policies</h2>
      <ul>
        {policies.map(policy => (
          <li key={policy.id}>
            <div className="policy-card">
              <h3>{policy.policyNumber}</h3>
              <p>{policy.vehicleMake} {policy.vehicleModel}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
