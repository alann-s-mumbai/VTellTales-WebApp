# 🔄 VTellTales Deployment Structure Changes

## ✅ Updated Deployment Paths

### Previous Structure:
```
/var/www/webapp.vtelltales.com/html/     ← Frontend
/var/www/webapi.vtelltales.com/app/      ← Backend API
```

### New Structure:
```
/var/www/webapp.vtelltales.com/app/      ← Frontend
/var/www/webapp.vtelltales.com/api/      ← Backend API
```

---

## 🌐 Updated Domain Configuration

### API Access:
- **Before**: `https://webapi.vtelltales.com/storyapi/...`
- **After**: `https://webapp.vtelltales.com/api/storyapi/...`

### Benefits:
- ✅ Single domain management
- ✅ Simplified CORS configuration  
- ✅ Better SEO and SSL management
- ✅ Unified deployment structure

---

## 📦 Files Updated

### 1. Server Deployment Script (`server-deploy.sh`)
- ✅ Updated directory paths to new structure
- ✅ Modified systemd service configuration
- ✅ Updated nginx configuration with `/api/` proxy

### 2. Frontend Configuration (`.env.production`)
- ✅ Changed API base URL from `webapi.vtelltales.com` to `webapp.vtelltales.com/api`

### 3. Deployment Documentation (`DEPLOYMENT-COMPLETE.md`)
- ✅ Updated domain structure documentation
- ✅ Modified testing endpoints
- ✅ Updated system architecture diagram

---

## 🚀 Updated Server Configuration

### Nginx Configuration:
```nginx
# Main webapp domain
server {
    listen 80;
    server_name webapp.vtelltales.com;
    root /var/www/webapp.vtelltales.com/app;
    
    # Frontend - React SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API - Proxy to dotnet
    location /api/ {
        proxy_pass http://localhost:5000/;
        # ... CORS headers and proxy settings
    }
}

# Optional: Keep webapi subdomain for legacy support
server {
    listen 80;
    server_name webapi.vtelltales.com;
    
    location / {
        proxy_pass http://localhost:5000;
        # ... CORS headers
    }
}
```

### Systemd Service:
```ini
[Service]
WorkingDirectory=/var/www/webapp.vtelltales.com/api
ExecStart=/usr/bin/dotnet /var/www/webapp.vtelltales.com/api/VTellTales_WA.API.dll
```

---

## 📋 Deployment Instructions

### 1. Upload Updated Packages:
```bash
# Frontend package uploaded ✅
scp frontend.tar.gz root@94.136.189.179:/tmp/

# Backend package (no changes needed) ✅  
scp backend.tar.gz root@94.136.189.179:/tmp/
```

### 2. Server Deployment:
```bash
# SSH to server and run:
bash server-deploy.sh
```

### 3. Test Endpoints:
```bash
# Frontend
curl http://webapp.vtelltales.com

# API via proxy  
curl http://webapp.vtelltales.com/api/storyapi/StoryBook/getallstorytype

# Direct API (legacy support)
curl http://webapi.vtelltales.com/storyapi/StoryBook/getallstorytype
```

---

## ✅ Verification Checklist

- [✅] Frontend package rebuilt with new API URL
- [✅] Frontend package uploaded to server (475KB)
- [✅] Backend package ready (1.1MB) 
- [✅] Server deployment script updated
- [✅] Nginx configuration updated
- [✅] Documentation updated
- [ ] Server deployment executed
- [ ] Endpoints tested
- [ ] Profile completion system verified

---

## 🎯 Next Steps

1. **SSH to server** and execute deployment:
   ```bash
   ssh root@94.136.189.179
   bash server-deploy.sh
   ```

2. **Test the application**:
   - Frontend: `http://webapp.vtelltales.com`
   - API: `http://webapp.vtelltales.com/api/storyapi/StoryBook/getallstorytype`

3. **Verify profile completion system** works with new API structure

---

**Status**: Ready for deployment with unified domain structure! 🚀