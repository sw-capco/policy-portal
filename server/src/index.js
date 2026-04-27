const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

// Placeholder routes
app.get('/api/policies', (req, res) => {
  res.json([/* mock policy data */]);
});

app.get('/api/claims', (req, res) => {
  res.json([/* mock claim data */]);
});

app.post('/api/claims', (req, res) => {
  // Handle new claim submission
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
