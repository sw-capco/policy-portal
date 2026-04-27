import { useState } from 'react';

function NewClaimForm() {
  const [claimDescription, setClaimDescription] = useState('');
  const [claimDate, setClaimDate] = useState('');
  const [attachments, setAttachments] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Dispatch action to create new claim
  };

  return (
    <div className="new-claim-form">
      <h2>File a New Claim</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Claim Description:
          <textarea value={claimDescription} onChange={(e) => setClaimDescription(e.target.value)} />
        </label>
        <label>
          Claim Date:
          <input type="date" value={claimDate} onChange={(e) => setClaimDate(e.target.value)} />
        </label>
        <label>
          Attachments:
          <input type="file" multiple onChange={(e) => setAttachments(e.target.files)} />
        </label>
        <button type="submit">Submit Claim</button>
      </form>
    </div>
  );
}
