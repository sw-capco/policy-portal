import React, { useState } from 'react';

function NewClaimForm() {
  const [claimDescription, setClaimDescription] = useState('');
  const [claimDate, setClaimDate] = useState('');
  const [attachments, setAttachments] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit new claim to the server
    const formData = new FormData();
    formData.append('claimDescription', claimDescription);
    formData.append('claimDate', claimDate);
    for (const attachment of attachments) {
      formData.append('attachments', attachment);
    }
    fetch('/api/claims', {
      method: 'POST',
      body: formData,
    });
  };

  return (
    <div>
      <h2>Initiate New Claim</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="claimDescription">Claim Description</label>
          <textarea
            id="claimDescription"
            value={claimDescription}
            onChange={(e) => setClaimDescription(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="claimDate">Claim Date</label>
          <input
            id="claimDate"
            type="date"
            value={claimDate}
            onChange={(e) => setClaimDate(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="attachments">Attachments</label>
          <input
            id="attachments"
            type="file"
            multiple
            onChange={(e) => setAttachments(Array.from(e.target.files))}
          />
        </div>
        <button type="submit">Submit Claim</button>
      </form>
    </div>
  );
}

export default NewClaimForm;
