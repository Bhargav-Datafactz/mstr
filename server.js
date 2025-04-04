const express = require('express');
const path = require('path');
const cors = require('cors');
const request = require('request');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS with specific options
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// Handle API requests with error handling
app.use('/MicroStrategyLibrary/api', (req, res) => {
  const targetUrl = `${process.env.REACT_APP_MSTR_API_URL}${req.url}`;
  
  // Log the request
  console.log(`Proxying request to: ${targetUrl}`);
  
  // Forward the request with proper error handling
  req.pipe(request({
    url: targetUrl,
    method: req.method,
    headers: {
      ...req.headers,
      host: new URL(process.env.REACT_APP_MSTR_API_URL).host
    }
  }))
  .on('error', (err) => {
    console.error('Proxy error:', err);
    res.status(500).send('Proxy error');
  })
  .pipe(res);
});

// The "catchall" handler
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`MicroStrategy API URL: ${process.env.REACT_APP_MSTR_API_URL}`);
}); 