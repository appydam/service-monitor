# Deployment Guide 🚀

This guide covers deploying Service Monitor to various platforms.

## Prerequisites

- Git repository set up (✅ done: https://github.com/appydam/service-monitor)
- Environment variables configured (see below)

## Environment Variables

All platforms need these environment variables:

```bash
PORT=3000
NODE_ENV=production
CRYPTO_TRACKER_URL=https://your-crypto-tracker.com/health
PH_SCRAPER_URL=https://your-ph-scraper.com/health
ALERT_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

---

## Option 1: Railway (Recommended - Easiest)

**Why Railway?**
- Automatic HTTPS
- Free tier available
- One-command deploy
- Built-in environment variable management

### Deploy Steps

1. **Install Railway CLI:**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login:**
   ```bash
   railway login
   ```

3. **Initialize and deploy:**
   ```bash
   cd service-monitor
   railway init
   railway add  # Add environment variables in web UI
   railway up
   ```

4. **Get your URL:**
   ```bash
   railway domain
   ```

**Cost:** Free tier includes:
- 500 hours/month execution time
- $5 credit/month
- More than enough for a monitoring dashboard

---

## Option 2: Render

**Why Render?**
- Free tier with automatic SSL
- GitHub integration
- No credit card required for free tier

### Deploy Steps

1. **Go to:** https://render.com/

2. **Create new Web Service:**
   - Connect GitHub repo: `appydam/service-monitor`
   - Name: `service-monitor`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Add environment variables** in Render dashboard

4. **Deploy!** Render will auto-deploy from `main` branch

**Cost:** Free tier includes:
- 750 hours/month
- Automatic SSL
- Spins down after 15 min inactivity (spins back up on request)

---

## Option 3: Docker + Any Host

**Why Docker?**
- Works anywhere (DigitalOcean, AWS, GCP, Azure, etc.)
- Reproducible deployments
- Easy scaling

### Deploy Steps

1. **Build image:**
   ```bash
   docker build -t service-monitor .
   ```

2. **Run locally (test):**
   ```bash
   docker run -p 3000:3000 --env-file .env service-monitor
   ```

3. **Deploy to Docker Hub:**
   ```bash
   docker tag service-monitor yourusername/service-monitor:latest
   docker push yourusername/service-monitor:latest
   ```

4. **Run on any server:**
   ```bash
   docker pull yourusername/service-monitor:latest
   docker run -d -p 3000:3000 \
     -e PORT=3000 \
     -e CRYPTO_TRACKER_URL=https://... \
     -e PH_SCRAPER_URL=https://... \
     -e ALERT_WEBHOOK=https://... \
     yourusername/service-monitor:latest
   ```

---

## Option 4: Vercel (Serverless)

**Note:** Vercel is optimized for serverless/static sites. For a long-running monitoring service, Railway or Render are better choices.

If you still want to use Vercel:

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   cd service-monitor
   vercel
   ```

3. **Add environment variables:**
   ```bash
   vercel env add CRYPTO_TRACKER_URL
   vercel env add PH_SCRAPER_URL
   vercel env add ALERT_WEBHOOK
   ```

4. **Redeploy:**
   ```bash
   vercel --prod
   ```

**Limitation:** Vercel has 10-second timeout for serverless functions. Monitor runs continuously, so it needs a persistent server (Railway/Render better).

---

## Post-Deployment

### 1. Verify Deployment

Visit your deployment URL. You should see the dashboard.

### 2. Test Health Checks

The monitor will start checking services immediately. Check the dashboard after ~5 minutes to see status.

### 3. Test Alerts

Trigger a failure (stop one of your services) and verify webhook alert is sent.

### 4. Update GitHub README

Add your deployment URL to the README:

```markdown
**Live Demo:** https://your-deployment.railway.app
```

---

## Monitoring the Monitor

The dashboard itself is lightweight (~20MB memory, <1% CPU). Check your hosting platform's metrics to ensure it's running smoothly.

### Railway Metrics
```bash
railway logs
railway status
```

### Render Metrics
Check the Render dashboard → Metrics tab

### Docker Metrics
```bash
docker stats service-monitor
docker logs service-monitor
```

---

## Troubleshooting

**Issue:** Dashboard not loading
- Check logs for errors
- Verify PORT environment variable is set
- Ensure build completed successfully

**Issue:** Services showing as down
- Verify service URLs are correct
- Check that services have `/health` endpoints
- Test service URLs manually with curl

**Issue:** Alerts not sending
- Verify ALERT_WEBHOOK is correct
- Check webhook service logs (Slack/Discord)
- Ensure services fail 3 consecutive checks before alert

---

## Cost Comparison

| Platform | Free Tier | Paid Tier | Best For |
|----------|-----------|-----------|----------|
| Railway | $5 credit/month | ~$5-10/month | Quick deploy |
| Render | 750 hours/month | $7/month | Auto-scaling |
| DigitalOcean | None | $5-6/month | Full control |
| Vercel | Limited | Not ideal | Static sites |

**Recommendation:** Start with Railway or Render free tier. Upgrade when you need more resources.

---

## Next Steps

1. ✅ Deploy to chosen platform
2. ✅ Configure environment variables
3. ✅ Verify deployment is working
4. ✅ Update GitHub README with live URL
5. ✅ Set up monitoring alerts
6. 🎉 You're live!
