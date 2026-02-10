# Service Monitor 🔨

Lightweight monitoring dashboard for agent services. Tracks health, uptime, and response times with alert notifications.

## Features

- 🔍 **Health Checks** — HTTP endpoint monitoring with custom status codes
- 📊 **Uptime Tracking** — Percentage uptime with historical data
- ⚡ **Response Time** — Track performance over time
- 🚨 **Alerts** — Webhook notifications (Slack, Discord, etc.)
- 📈 **Visual Dashboard** — Clean status page with 50-check history
- 🔄 **Auto-Recovery Detection** — Notifies when services come back online

## Quick Start

```bash
# Install dependencies
npm install

# Configure services (see below)
cp .env.example .env
vim .env

# Start monitor
npm start
```

Dashboard will be available at `http://localhost:3000`

## Configuration

Create a `.env` file:

```bash
# Dashboard port
PORT=3000

# Service endpoints (must have /health endpoints)
CRYPTO_TRACKER_URL=https://crypto-tracker.example.com/health
PH_SCRAPER_URL=https://ph-scraper.example.com/health

# Alert webhook (optional)
ALERT_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### Adding Services

Edit `config.js` to add more services:

```javascript
{
  name: 'My Service',
  id: 'my-service',
  type: 'http',
  endpoint: process.env.MY_SERVICE_URL || 'https://example.com/health',
  timeout: 10000,
  expectedStatus: 200,
}
```

## Health Check Endpoints

Your services need a `/health` endpoint that returns:

```json
{
  "status": "ok"
}
```

HTTP 200 status code indicates healthy. Anything else triggers alerts.

## Alerts

When a service fails **3 consecutive checks**, an alert is sent to the webhook:

```
🚨 **Crypto Regulatory Tracker** is DOWN
Consecutive failures: 3
Error: ECONNREFUSED
Uptime: 97.5%
```

When recovered:

```
✅ **Crypto Regulatory Tracker** recovered
Downtime: 15 minutes
```

### Webhook Format

Alerts are sent as JSON:

```json
{
  "text": "formatted message",
  "service": "Service Name",
  "status": "down|recovered",
  "failureCount": 3,
  "error": "error message",
  "uptime": 97.5
}
```

Compatible with Slack, Discord, and most webhook services.

## Deployment

### Local

```bash
npm start
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]
```

```bash
docker build -t service-monitor .
docker run -p 3000:3000 --env-file .env service-monitor
```

### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway init
railway up
```

Set environment variables in Railway dashboard.

### Systemd (Linux)

Create `/etc/systemd/system/service-monitor.service`:

```ini
[Unit]
Description=Agent Services Monitor
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/service-monitor
ExecStart=/usr/bin/node server.js
Restart=always
Environment=NODE_ENV=production
EnvironmentFile=/var/www/service-monitor/.env

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable service-monitor
sudo systemctl start service-monitor
```

## API Endpoints

### `GET /`
Dashboard HTML

### `GET /api/status`
Current status of all services:

```json
{
  "services": [
    {
      "name": "Crypto Tracker",
      "id": "crypto-tracker",
      "status": "up",
      "uptime": 99.2,
      "lastCheck": 1234567890,
      "totalChecks": 500,
      "successfulChecks": 496
    }
  ],
  "summary": {
    "total": 2,
    "up": 2,
    "down": 0,
    "unknown": 0
  }
}
```

### `GET /api/history/:serviceId`
Historical checks for a service (last 100)

### `GET /health`
Monitor's own health check

## Monitoring the Monitor

The monitor itself has a `/health` endpoint. Add it to your infrastructure monitoring or use a service like UptimeRobot to alert if the monitor goes down.

## Cost

**Self-hosted:** ~$5-10/month on a small VPS  
**Railway:** Free tier includes 500 hours/month  
**API calls:** Minimal bandwidth (<1MB/day)

## Tech Stack

- **Express** — Web server
- **Axios** — HTTP client
- **node-cron** — Scheduled checks
- **Pure HTML/CSS** — No frontend framework

Total size: ~15KB (dashboard) + ~10KB (server)

## Customization

### Check Interval

Edit `config.js`:

```javascript
checkInterval: 5 * 60 * 1000, // 5 minutes
```

### Alert Threshold

Edit `config.js`:

```javascript
consecutiveFailures: 3, // Alert after N failures
```

### Dashboard Styling

Edit `dashboard.html` — all styles are inline in the `<style>` tag.

## Troubleshooting

### Services showing as "down" but they're actually up

- Check that your `/health` endpoint returns HTTP 200
- Verify the endpoint URL is correct (check for trailing slashes)
- Check timeout settings (increase if services are slow)

### Alerts not sending

- Verify `ALERT_WEBHOOK` is set in `.env`
- Test the webhook manually with curl:
  ```bash
  curl -X POST $ALERT_WEBHOOK -d '{"text":"test"}'
  ```
- Check logs for webhook errors

### Dashboard not updating

- Check browser console for errors
- Verify `/api/status` returns data
- Refresh the page (auto-refresh is every 30s)

## License

MIT

## Contributing

PRs welcome! This is a minimal monitoring tool — if you add features, keep it simple and self-contained.

---

Built by Forge 🔨 for the Agent Squad
