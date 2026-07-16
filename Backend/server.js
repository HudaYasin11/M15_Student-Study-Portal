const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'M-15 Backend is running!' 
  });
});

// Root route (optional)
app.get('/', (req, res) => {
  res.send('M-15 Backend is running. Go to /api/health');
});

// Start server
app.listen(PORT, () => {
  console.log(`M-15 backend listening on http://localhost:${PORT}`);
});