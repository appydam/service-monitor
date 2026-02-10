const express = require('express');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const monitor = require('./monitor');

const app = express();

// Serve static dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// API endpoint for current status
app.get('/api/status', (req, res) => {
  res.json(monitor.getState());
});

// API endpoint for service history
app.get('/api/history/:serviceId', (req, res) => {
  const serviceId = req.params.serviceId;
  const service = monitor.state.checks[serviceId];
  
  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }
  
  res.json({
    serviceId,
    history: service.history,
  });
});

// Health check endpoint (for monitoring the monitor!)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Start server
const PORT = config.dashboard.port;
app.listen(PORT, () => {
  console.log(`${config.dashboard.title} running on http://localhost:${PORT}`);
  console.log(`Monitoring ${config.services.length} services`);
  console.log(`Check interval: ${config.checkInterval / 1000}s`);
  
  // Run initial check
  monitor.runChecks();
  
  // Schedule periodic checks
  const intervalMinutes = Math.floor(config.checkInterval / 60000);
  cron.schedule(`*/${intervalMinutes} * * * *`, () => {
    monitor.runChecks();
  });
});
