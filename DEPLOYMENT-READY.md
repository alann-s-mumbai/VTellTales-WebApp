# VTellTales Production Deployment Guide

## 🚀 Complete Deployment Package Ready!

All build artifacts and deployment scripts have been prepared for production deployment to the Contabo server.

## 📦 What's Been Prepared

### ✅ Built Applications
- **Frontend**: Production build with API URL `https://webapp.vtelltales.com/api`
- **Backend**: Release compilation targeting .NET 8.0 runtime
- **Database**: Connection configured for `VTellTales_Web_db` 

### ✅ Configuration Files
- `frontend/.env.production` - Production API endpoints
- `backend/appsettings.Production.json` - Production database and CORS settings
- Deployment scripts with automated server setup

### ✅ Deployment Artifacts
- **Frontend Build**: `/frontend/dist/` (602 KB index.html + assets)
- **Backend Build**: `/backend/VTellTalesCore/publish/` (Complete .NET application)
- **Deployment Scripts**: Automated upload, configuration, and service setup

## 🔧 SSH Setup Required

Before running the deployment, SSH access needs to be configured for the Contabo server:

### Option 1: SSH Key Authentication (Recommended)
```bash
# Generate SSH key if not exists
ssh-keygen -t rsa -b 4096 -C "vtelltales-deployment"

# Copy public key to server
ssh-copy-id root@94.136.189.179
```

### Option 2: Password Authentication
```bash
# Edit deployment scripts to use password authentication
# Add -o PasswordAuthentication=yes to ssh/scp commands
```

### Option 3: Manual File Transfer
```bash
# Use alternative file transfer methods:
# - SFTP clients (FileZilla, WinSCP)
# - rsync with password authentication
# - Direct server access via hosting panel
```

## 🚀 Deployment Execution

Once SSH access is configured:

### 1. Pre-deployment Test
```bash
cd /Users/alann/Projects/VTellTales-WebApp
./test-deployment.sh
```

### 2. Full Deployment
```bash
cd /Users/alann/Projects/VTellTales-WebApp  
./deploy-production.sh
```

## 📋 Manual Deployment Alternative

If automated deployment isn't possible, here's the manual process:

### 1. Upload Frontend
```bash
# Package frontend
cd /Users/alann/Projects/VTellTales-WebApp/frontend/dist
tar -czf frontend.tar.gz *

# Manual upload to server: /var/www/webapp.vtelltales.com/app/
```

### 2. Upload Backend  
```bash
# Package backend
cd /Users/alann/Projects/VTellTales-WebApp/backend/VTellTalesCore/publish
tar -czf backend.tar.gz *

# Manual upload to server: /var/www/webapp.vtelltales.com/api/
```

### 3. Server Configuration

On the Contabo server (94.136.189.179), execute:

```bash
# Extract frontend
cd /var/www/webapp.vtelltales.com/app
tar -xzf frontend.tar.gz
chown -R www-data:www-data /var/www/webapp.vtelltales.com/app

# Extract backend  
cd /var/www/webapp.vtelltales.com/api
tar -xzf backend.tar.gz
chmod +x VTellTales_WA.API
chown -R www-data:www-data /var/www/webapp.vtelltales.com/api
```

### 4. Create Systemd Service

```bash
# Create service file
cat > /etc/systemd/system/vtelltales-api.service << 'EOF'
[Unit]
Description=VTellTales Web API
After=network.target

[Service]
Type=notify
WorkingDirectory=/var/www/webapp.vtelltales.com/api
ExecStart=/usr/bin/dotnet /var/www/webapp.vtelltales.com/api/VTellTales_WA.API.dll
Restart=always
RestartSec=10
User=www-data
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=ASPNETCORE_URLS=http://127.0.0.1:5001

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
systemctl daemon-reload
systemctl enable vtelltales-api
systemctl start vtelltales-api
```

### 5. Configure Nginx

```bash
# Create webapp nginx config
cat > /etc/nginx/sites-available/webapp.vtelltales.com << 'EOF'
server {
    listen 80;
    server_name webapp.vtelltales.com;
    root /var/www/webapp.vtelltales.com/app;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable site and reload nginx
ln -sf /etc/nginx/sites-available/webapp.vtelltales.com /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

## 🧪 Post-Deployment Verification

### Test Endpoints
```bash
# Test frontend
curl -I http://webapp.vtelltales.com

# Test API via unified domain
curl -I http://webapp.vtelltales.com
curl http://webapp.vtelltales.com/api/storyapi/StoryBook/getallstorytype
```

### Expected Results
- **webapp.vtelltales.com**: Returns HTML with VTellTales React app
- **webapp.vtelltales.com/api**: Returns API responses
- **Profile completion**: Mandatory flow works correctly
- **Database**: Connected to VTellTales_Web_db successfully

## 🔍 Troubleshooting

### Service Status
```bash
# Check backend service
systemctl status vtelltales-api
journalctl -u vtelltales-api -f

# Check nginx
systemctl status nginx
tail -f /var/log/nginx/error.log
```

### Common Issues
- **CORS Errors**: Verify nginx CORS headers for webapi
- **Database Connection**: Check production connection string
- **File Permissions**: Ensure www-data owns all files
- **Port Conflicts**: Verify port 5000 is available for backend

## 🎉 Deployment Complete!

Once deployed successfully:
- **Frontend**: http://webapp.vtelltales.com ✅
- **Backend API**: http://webapp.vtelltales.com/api ✅  
- **Database**: VTellTales_Web_db connected ✅
- **Profile System**: Mandatory completion enforced ✅

---

## 📞 Next Steps

1. **Configure SSH access** to enable automated deployment
2. **Run deployment scripts** or follow manual deployment process  
3. **Test application functionality** thoroughly
4. **Configure SSL certificates** for HTTPS (recommended)
5. **Set up monitoring and backups** for production environment

All build artifacts are ready and waiting for deployment! 🚀