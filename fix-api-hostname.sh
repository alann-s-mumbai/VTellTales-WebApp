#!/bin/bash

# Backend API Integration Fix Script
echo "🔧 VTellTales Backend API Integration"
echo "===================================="

echo ""
echo "🎯 Fixing API hostname validation..."

# Create updated appsettings for production
cat > /tmp/appsettings.Production.json << 'EOF'
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=vtelltales_db;User Id=root;Password=vtell123;",
    "MySqlConnection": "Server=localhost;Database=vtelltales_db;User Id=root;Password=vtell123;"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "webapp.vtelltales.com;localhost;127.0.0.1",
  "Urls": "http://0.0.0.0:5000",
  "Kestrel": {
    "Endpoints": {
      "Http": {
        "Url": "http://0.0.0.0:5000"
      }
    }
  },
  "Cors": {
    "AllowedOrigins": [
      "https://webapp.vtelltales.com",
      "http://webapp.vtelltales.com",
      "http://localhost:3000"
    ]
  }
}
EOF

# Upload the configuration
sudo cp /tmp/appsettings.Production.json /var/www/webapp.vtelltales.com/api/appsettings.Production.json
sudo chown www-data:www-data /var/www/webapp.vtelltales.com/api/appsettings.Production.json

# Restart the API service
echo "🔄 Restarting API service with new configuration..."
sudo systemctl restart vtelltales-api

# Wait for service to start
sleep 5

echo ""
echo "📊 Service Status:"
sudo systemctl status vtelltales-api --no-pager -l | head -10

echo ""
echo "🧪 Testing API endpoints..."

# Test root endpoint
echo -n "Root endpoint: "
if curl -f -s -H "Host: webapp.vtelltales.com" "http://127.0.0.1:5001/health" > /dev/null 2>&1; then
    echo "✅ Responding"
else
    echo "❌ Not responding"
fi

# Test story API endpoint
echo -n "Story API: "
if timeout 10 curl -s -H "Host: webapp.vtelltales.com" "http://127.0.0.1:5001/storyapi/StoryBook/getallstorytype" | grep -q '"' 2>/dev/null; then
    echo "✅ Returning data"
else
    echo "⚠️  May need database setup"
fi

echo ""
echo "✅ Hostname validation fix applied!"
echo "📋 Next: Test API integration from frontend"
