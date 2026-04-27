import { Routes, Route } from 'react-router-dom';
import PolicyList from './features/policies/PolicyList';
import PolicyDetails from './features/policies/PolicyDetails';
import ClaimList from './features/claims/ClaimList';
import ClaimDetails from './features/claims/ClaimDetails';
import NewClaimForm from './features/claims/NewClaimForm';

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<PolicyList />} />
        <Route path="/policies/:id" element={<PolicyDetails />} />
        <Route path="/claims" element={<ClaimList />} />
        <Route path="/claims/:id" element={<ClaimDetails />} />
        <Route path="/claims/new" element={<NewClaimForm />} />
      </Routes>
    </div>
  );
}
