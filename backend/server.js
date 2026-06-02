const path = require('path');
const express = require('express');
const app = require('./app');

const PORT = process.env.PORT || 5000;

// Serve frontend files static middleware (for local run only)
app.use(express.static(path.join(__dirname, '../frontend')));

// Default fallback route to serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`================================================`);
  console.log(`FutureMe server running on http://localhost:${PORT}`);
  console.log(`Serving frontend static files from: ../frontend`);
  console.log(`================================================`);
});