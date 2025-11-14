#!/bin/bash

# VTellTales Production Deployment Script v1.1.0
# This script deploys the application to production servers

set -e  # Exit on any error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🚀 VTellTales Production Deployment v1.1.0"
echo "==========================================="

# Configuration
PRODUCTION_HOST="94.136.189.179"
FRONTEND_DOMAIN="webapp.vtelltales.com"
SSH_USER="root"
SSH_KEY_PATH="$HOME/.ssh/vtelltales_deploy"

echo "🔍 Pre-deployment checks..."

# Check if SSH key exists
if [ ! -f "$SSH_KEY_PATH" ]; then
    echo "⚠️  SSH key not found at $SSH_KEY_PATH"
    echo "   Creating SSH key for deployment..."
    ssh-keygen -t ed25519 -C "vtelltales-deploy@$(hostname)" -f "$SSH_KEY_PATH" -N ""
    echo "✅ SSH key created at $SSH_KEY_PATH"
    echo ""
    echo "📋 NEXT STEPS:"
    echo "   1. Copy public key to server:"
    echo "      ssh-copy-id -i $SSH_KEY_PATH.pub $SSH_USER@$PRODUCTION_HOST"
    echo "   2. Or manually add to server authorized_keys:"
    echo "      cat $SSH_KEY_PATH.pub"
    echo ""
    echo "🔄 Run this script again after SSH key is configured"
    exit 0
fi

# Test SSH connection
echo "🔐 Testing SSH connection..."
if ssh -i "$SSH_KEY_PATH" -o ConnectTimeout=10 -o BatchMode=yes "$SSH_USER@$PRODUCTION_HOST" "echo 'SSH connection successful'" >/dev/null 2>&1; then
    echo "✅ SSH connection verified"
else
    echo "❌ SSH connection failed"
    echo "   Please ensure SSH key is properly configured on the server"
    echo "   Test manually: ssh -i $SSH_KEY_PATH $SSH_USER@$PRODUCTION_HOST"
    exit 1
fi

# Build frontend for production
echo "🎨 Building frontend for production..."
cd "$PROJECT_ROOT/frontend"
npm run build

# Build backend for production
echo "🔧 Building backend for production..."
cd "$PROJECT_ROOT/backend/VTellTalesCore/VTellTales_WA.API/VTellTales_WA.API"
dotnet publish -c Release -o "$PROJECT_ROOT/deployment/backend"

# Create deployment packages
echo "📦 Creating deployment packages..."
cd "$PROJECT_ROOT"
mkdir -p deployment

# Package frontend
tar -czf deployment/frontend-v1.1.0.tar.gz -C frontend/dist .
echo "✅ Frontend package: deployment/frontend-v1.1.0.tar.gz"

# Package backend
tar -czf deployment/backend-v1.1.0.tar.gz -C deployment/backend .
echo "✅ Backend package: deployment/backend-v1.1.0.tar.gz"

# Deploy to production server
echo "🌐 Deploying to production server..."

# Create deployment script for server
cat > deployment/server-deploy.sh << 'EOF'
#!/bin/bash

# VTellTales Server Deployment Script
echo "🚀 VTellTales Server Deployment Starting..."

# Create application directories
sudo mkdir -p /var/www/webapp.vtelltales.com/app
sudo mkdir -p /var/www/webapp.vtelltales.com/api
sudo mkdir -p /var/www/webapp.vtelltales.com/data
sudo mkdir -p /var/www/webapp.vtelltales.com/admin
sudo mkdir -p /var/www/webapp.vtelltales.com/logs/app
sudo mkdir -p /var/www/webapp.vtelltales.com/logs/api

# Backup existing deployment
if [ -d "/var/www/webapp.vtelltales.com/app" ]; then
    sudo tar -czf "/var/www/webapp.vtelltales.com/backup-app-$(date +%Y%m%d-%H%M%S).tar.gz" -C /var/www/webapp.vtelltales.com app
fi

if [ -d "/var/www/webapp.vtelltales.com/api" ]; then
    sudo tar -czf "/var/www/webapp.vtelltales.com/backup-api-$(date +%Y%m%d-%H%M%S).tar.gz" -C /var/www/webapp.vtelltales.com api
fi

# Deploy frontend
echo "🎨 Deploying frontend..."
sudo rm -rf /var/www/webapp.vtelltales.com/app/*
sudo tar -xzf frontend-v1.1.0.tar.gz -C /var/www/webapp.vtelltales.com/app/

# Deploy backend
echo "🔧 Deploying backend..."
sudo rm -rf /var/www/webapp.vtelltales.com/api/*
sudo tar -xzf backend-v1.1.0.tar.gz -C /var/www/webapp.vtelltales.com/api/

# Set permissions
sudo chown -R www-data:www-data /var/www/webapp.vtelltales.com/
sudo chmod -R 755 /var/www/webapp.vtelltales.com/

# Create systemd service for backend
sudo tee /etc/systemd/system/vtelltales-api.service > /dev/null << 'SYSTEMD_EOF'
[Unit]
Description=VTellTales API
After=network.target

[Service]
Type=notify
ExecStart=/usr/bin/dotnet /var/www/webapp.vtelltales.com/api/VTellTales_WA.API.dll
Restart=always
RestartSec=5
User=www-data
Group=www-data
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=ASPNETCORE_URLS=http://127.0.0.1:5001
WorkingDirectory=/var/www/webapp.vtelltales.com/api
KillSignal=SIGINT
TimeoutStopSec=30

[Install]
WantedBy=multi-user.target
SYSTEMD_EOF

# Configure Nginx
sudo tee /etc/nginx/sites-available/vtelltales > /dev/null << 'NGINX_EOF'
server {
    listen 80;
    server_name webapp.vtelltales.com;
    root /var/www/webapp.vtelltales.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";

    # Redirect base to app dashboard
    location = / {
        return 302 /app/;
    }

    # SPA application
    location /app/ {
        try_files $uri $uri/ /app/index.html;
    }

    # Admin panel placeholder
    location /admin/ {
        try_files $uri $uri/ /admin/index.html;
    }

    # Static data files
    location /data/ {
        alias /var/www/webapp.vtelltales.com/data/;
        autoindex off;
        add_header Cache-Control "public, max-age=31536000";
    }

    # API proxy to backend
    location /api/ {
        proxy_pass http://127.0.0.1:5001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        add_header Access-Control-Allow-Origin "https://webapp.vtelltales.com" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization" always;

        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }

    error_log /var/www/webapp.vtelltales.com/logs/app/error.log;
    access_log /var/www/webapp.vtelltales.com/logs/app/access.log;
}
NGINX_EOF

# Enable site and restart services
sudo ln -sf /etc/nginx/sites-available/vtelltales /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Start backend service
sudo systemctl daemon-reload
sudo systemctl enable vtelltales-api
sudo systemctl restart vtelltales-api

# Wait for services to start
sleep 5

echo "✅ Deployment completed successfully!"
echo ""
echo "🌐 Services:"
echo "   Frontend: https://webapp.vtelltales.com/app"
echo "   API:      https://webapp.vtelltales.com/api"
echo ""
echo "📊 Service Status:"
sudo systemctl status vtelltales-api --no-pager -l
echo ""
echo "🧪 Testing endpoints..."
curl -f http://127.0.0.1:5001/health || echo "Backend not responding"
EOF

chmod +x deployment/server-deploy.sh

# Upload and execute deployment
echo "📤 Uploading deployment packages..."
scp -i "$SSH_KEY_PATH" \
    deployment/frontend-v1.1.0.tar.gz \
    deployment/backend-v1.1.0.tar.gz \
    deployment/server-deploy.sh \
    "$SSH_USER@$PRODUCTION_HOST:/tmp/"

echo "🚀 Executing deployment on server..."
ssh -i "$SSH_KEY_PATH" "$SSH_USER@$PRODUCTION_HOST" "cd /tmp && bash server-deploy.sh"

echo ""
echo "🎉 Production Deployment Complete!"
echo "=================================="
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: https://webapp.vtelltales.com/app"
echo "   API:      https://webapp.vtelltales.com/api"
echo ""
echo "🧪 Test Commands:"
echo "   curl https://webapp.vtelltales.com/app/"
echo "   curl https://webapp.vtelltales.com/api/storyapi/StoryBook/getallstorytype"
echo ""
echo "📊 Monitor Logs:"
echo "   ssh -i $SSH_KEY_PATH $SSH_USER@$PRODUCTION_HOST"
echo "   sudo journalctl -u vtelltales-api -f"
echo "   sudo tail -f /var/www/webapp.vtelltales.com/logs/access.log"
