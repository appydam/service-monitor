#!/bin/bash
# test-deployment.sh - Verify service monitor deployment

set -e

echo "🧪 Testing Service Monitor Deployment..."
echo ""

# Check if URL is provided
if [ -z "$1" ]; then
    echo "Usage: ./test-deployment.sh <deployment-url>"
    echo "Example: ./test-deployment.sh https://service-monitor.onrender.com"
    exit 1
fi

DEPLOYMENT_URL="$1"

echo "📍 Testing: $DEPLOYMENT_URL"
echo ""

# Test 1: Dashboard loads
echo "1️⃣ Testing dashboard loads..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL")
if [ "$STATUS" -eq 200 ]; then
    echo "   ✅ Dashboard is accessible (HTTP $STATUS)"
else
    echo "   ❌ Dashboard returned HTTP $STATUS"
    exit 1
fi

# Test 2: Dashboard contains expected elements
echo "2️⃣ Testing dashboard content..."
CONTENT=$(curl -s "$DEPLOYMENT_URL")
if echo "$CONTENT" | grep -q "Service Monitor"; then
    echo "   ✅ Dashboard title found"
else
    echo "   ❌ Dashboard title missing"
    exit 1
fi

# Test 3: Check for service status elements
echo "3️⃣ Testing service status display..."
if echo "$CONTENT" | grep -q "status"; then
    echo "   ✅ Status indicators present"
else
    echo "   ⚠️  Status indicators not found (may be loading)"
fi

# Test 4: Response time
echo "4️⃣ Testing response time..."
RESPONSE_TIME=$(curl -s -w "%{time_total}" -o /dev/null "$DEPLOYMENT_URL")
echo "   ⏱️  Response time: ${RESPONSE_TIME}s"
if (( $(echo "$RESPONSE_TIME < 5.0" | bc -l) )); then
    echo "   ✅ Response time is good"
else
    echo "   ⚠️  Response time is slow (>5s)"
fi

echo ""
echo "✨ Deployment test complete!"
echo ""
echo "📊 Visit your dashboard: $DEPLOYMENT_URL"
echo "🔄 Monitor will start checking services every 5 minutes"
echo "🚨 Alerts will trigger after 3 consecutive failures"
