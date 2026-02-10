const axios = require('axios');
const config = require('./config');

// State tracking
const state = {
  checks: {}, // service_id -> { status, lastCheck, uptime, failureCount, history }
};

// Initialize state for all services
config.services.forEach(service => {
  state.checks[service.id] = {
    status: 'unknown',
    lastCheck: null,
    lastSuccess: null,
    uptime: 0, // percentage
    totalChecks: 0,
    successfulChecks: 0,
    failureCount: 0, // consecutive failures
    history: [], // last 100 checks
  };
});

/**
 * Check a single service
 */
async function checkService(service) {
  const start = Date.now();
  const check = {
    timestamp: start,
    status: 'unknown',
    responseTime: null,
    error: null,
  };

  try {
    const response = await axios.get(service.endpoint, {
      timeout: service.timeout,
      validateStatus: () => true, // Don't throw on non-2xx
    });

    check.responseTime = Date.now() - start;
    check.status = response.status === service.expectedStatus ? 'up' : 'down';
    
    if (check.status === 'down') {
      check.error = `Expected ${service.expectedStatus}, got ${response.status}`;
    }
  } catch (error) {
    check.responseTime = Date.now() - start;
    check.status = 'down';
    check.error = error.code || error.message;
  }

  return check;
}

/**
 * Update state for a service
 */
function updateState(serviceId, check) {
  const s = state.checks[serviceId];
  
  s.lastCheck = check.timestamp;
  s.totalChecks++;
  
  if (check.status === 'up') {
    s.status = 'up';
    s.lastSuccess = check.timestamp;
    s.successfulChecks++;
    s.failureCount = 0;
  } else {
    s.status = 'down';
    s.failureCount++;
  }
  
  // Calculate uptime percentage
  s.uptime = s.totalChecks > 0 
    ? Math.round((s.successfulChecks / s.totalChecks) * 10000) / 100 
    : 0;
  
  // Keep last 100 checks
  s.history.push(check);
  if (s.history.length > 100) {
    s.history.shift();
  }
}

/**
 * Send alert if needed
 */
async function checkAlerts(service, check) {
  const s = state.checks[service.id];
  
  // Alert on consecutive failures threshold
  if (s.failureCount === config.alerts.consecutiveFailures) {
    await sendAlert({
      service: service.name,
      status: 'down',
      failureCount: s.failureCount,
      error: check.error,
      uptime: s.uptime,
    });
  }
  
  // Alert on recovery (was down, now up)
  if (check.status === 'up' && s.failureCount === 0 && s.totalChecks > 1) {
    const prevCheck = s.history[s.history.length - 2];
    if (prevCheck && prevCheck.status === 'down') {
      await sendAlert({
        service: service.name,
        status: 'recovered',
        downtime: check.timestamp - s.lastSuccess,
      });
    }
  }
}

/**
 * Send alert via webhook
 */
async function sendAlert(alert) {
  if (!config.alerts.webhook) return;
  
  try {
    await axios.post(config.alerts.webhook, {
      text: formatAlert(alert),
      ...alert,
    });
  } catch (error) {
    console.error('Failed to send alert:', error.message);
  }
}

/**
 * Format alert message
 */
function formatAlert(alert) {
  if (alert.status === 'down') {
    return `🚨 **${alert.service}** is DOWN\n` +
           `Consecutive failures: ${alert.failureCount}\n` +
           `Error: ${alert.error}\n` +
           `Uptime: ${alert.uptime}%`;
  } else if (alert.status === 'recovered') {
    const mins = Math.round(alert.downtime / 60000);
    return `✅ **${alert.service}** recovered\n` +
           `Downtime: ${mins} minutes`;
  }
}

/**
 * Run health checks for all services
 */
async function runChecks() {
  console.log(`[${new Date().toISOString()}] Running health checks...`);
  
  for (const service of config.services) {
    const check = await checkService(service);
    updateState(service.id, check);
    await checkAlerts(service, check);
    
    console.log(`  ${service.name}: ${check.status} (${check.responseTime}ms)`);
  }
}

/**
 * Get current state
 */
function getState() {
  return {
    services: config.services.map(service => ({
      ...service,
      ...state.checks[service.id],
    })),
    summary: {
      total: config.services.length,
      up: Object.values(state.checks).filter(s => s.status === 'up').length,
      down: Object.values(state.checks).filter(s => s.status === 'down').length,
      unknown: Object.values(state.checks).filter(s => s.status === 'unknown').length,
    },
  };
}

module.exports = {
  runChecks,
  getState,
  state,
};
