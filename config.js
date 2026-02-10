// Service Monitor Configuration

module.exports = {
  // Check interval (ms)
  checkInterval: 5 * 60 * 1000, // 5 minutes

  // Services to monitor
  services: [
    {
      name: 'Crypto Regulatory Tracker',
      id: 'crypto-tracker',
      type: 'http',
      endpoint: process.env.CRYPTO_TRACKER_URL || 'https://crypto-tracker.example.com/health',
      timeout: 10000,
      expectedStatus: 200,
    },
    {
      name: 'ProductHunt Scraper',
      id: 'ph-scraper',
      type: 'http',
      endpoint: process.env.PH_SCRAPER_URL || 'https://ph-scraper.example.com/health',
      timeout: 10000,
      expectedStatus: 200,
    },
  ],

  // Alert configuration
  alerts: {
    webhook: process.env.ALERT_WEBHOOK, // Slack, Discord, etc.
    consecutiveFailures: 3, // Alert after N failures
  },

  // Dashboard configuration
  dashboard: {
    port: process.env.PORT || 3000,
    title: 'Agent Services Monitor',
  },
};
