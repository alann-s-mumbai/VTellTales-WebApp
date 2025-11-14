#!/bin/bash

# Fix VTellTales API Service Configuration
echo "🔧 Fixing VTellTales API service configuration..."

# Create improved systemd service
sudo tee /etc/systemd/system/vtelltales-api.service > /dev/null << 'EOF'
[Unit]
Description=VTellTales API v1.2.0
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/dotnet /var/www/webapp.vtelltales.com/api/VTellTales_WA.API.dll
Restart=always
RestartSec=5
User=www-data
Group=www-data
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=ASPNETCORE_URLS=http://127.0.0.1:5001
Environment=ASPNETCORE_HOSTINGSTARTUPASSEMBLIES=
WorkingDirectory=/var/www/webapp.vtelltales.com/api
KillSignal=SIGINT
TimeoutStopSec=30
TimeoutStartSec=60

[Install]
WantedBy=multi-user.target
EOF

# Reload and restart service
sudo systemctl daemon-reload
sudo systemctl enable vtelltales-api
sudo systemctl restart vtelltales-api

# Wait for startup
sleep 10

echo "✅ Service configuration updated!"
echo ""
echo "📊 Service Status:"
sudo systemctl status vtelltales-api --no-pager -l

echo ""
echo "🧪 Testing API endpoint:"
curl -f http://127.0.0.1:5001/health 2>/dev/null && echo "✅ API responding" || echo "❌ API not responding"

echo ""
echo "🔍 Recent logs:"
sudo journalctl -u vtelltales-api -n 10 --no-pager
