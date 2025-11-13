# VTellTales Production Deployment Checklist

## Pre-Deployment Verification ✅

### Local Build Status
- [✅] Frontend built successfully with production API URL
- [✅] Backend compiled and published for Release
- [✅] Production configuration files created
- [✅] Profile completion system implemented and tested
- [✅] No TypeScript compilation errors
- [✅] All dependencies resolved

### Configuration Status
- [✅] Frontend `.env.production` - API URL: `https://webapi.vtelltales.com`
- [✅] Backend `appsettings.Production.json` - Database connection configured
- [✅] CORS settings updated for production domains
- [✅] Database credentials: `94.136.189.179:VTellTales_Web_db`

### Deployment Script Features
- [✅] Automated frontend upload to `webapp.vtelltales.com`
- [✅] Automated backend deployment to `webapi.vtelltales.com` 
- [✅] Systemd service creation for backend
- [✅] Nginx configuration for both domains
- [✅] Database connectivity testing
- [✅] Service startup and health checks
- [✅] Backup of existing deployments

## Deployment Process 🚀

### Ready to Execute:
```bash
cd /Users/alann/Projects/VTellTales-WebApp
./deploy-production.sh
```

### What the Script Does:
1. **Package Applications** 📦
   - Creates `frontend.tar.gz` from `/dist` folder
   - Creates `backend.tar.gz` from `/publish` folder

2. **Upload to Server** 📤
   - Uploads packages via SCP to Contabo server
   - Server: `94.136.189.179` (Contabo)

3. **Deploy Frontend** 📱
   - Extracts to `/var/www/webapp.vtelltales.com/html`
   - Sets proper permissions for www-data
   - Configures nginx for React Router

4. **Deploy Backend** ⚙️
   - Extracts to `/var/www/webapi.vtelltales.com/app`
   - Creates systemd service: `vtelltales-api.service`
   - Configures nginx reverse proxy

5. **Configure Services** 🔧
   - Nginx virtual hosts for both domains
   - CORS headers for API access
   - Production environment variables

6. **Start & Test** 🧪
   - Starts backend service
   - Reloads nginx
   - Tests endpoint connectivity

## Expected Results 🎯

### After Successful Deployment:
- **Frontend**: http://webapp.vtelltales.com ✅
- **Backend API**: http://webapi.vtelltales.com ✅
- **Database**: Connected to VTellTales_Web_db ✅
- **Profile System**: Mandatory completion enforced ✅

### Test Endpoints:
- `http://webapp.vtelltales.com` → React app loads
- `http://webapi.vtelltales.com/storyapi/StoryBook/getallstorytype` → API response
- Profile completion flow functional

## Post-Deployment Verification 🔍

### Manual Checks Required:
1. **Frontend Functionality**
   - [ ] App loads without errors
   - [ ] Navigation works correctly
   - [ ] Profile completion redirects properly
   - [ ] API calls succeed

2. **Backend Functionality** 
   - [ ] API endpoints responding
   - [ ] Database queries working
   - [ ] CORS headers present
   - [ ] Authentication flow works

3. **Profile Completion System**
   - [ ] Redirects to `/complete-profile` when incomplete
   - [ ] Form validation works
   - [ ] Successful submission redirects properly
   - [ ] Required fields enforced

## Troubleshooting 🔧

### Service Management:
```bash
# Check backend service
systemctl status vtelltales-api
journalctl -u vtelltales-api -f

# Check nginx
systemctl status nginx  
tail -f /var/log/nginx/error.log

# Restart services
systemctl restart vtelltales-api
systemctl reload nginx
```

### Common Issues:
- **CORS Errors**: Check nginx CORS headers in webapi config
- **Database Connection**: Verify connection string in production config
- **File Permissions**: Ensure www-data owns deployed files
- **Service Startup**: Check systemd service logs for errors

## Security Considerations 🔒

### Implemented:
- [✅] Database connection over private network
- [✅] Proper file permissions (www-data)
- [✅] CORS restricted to specific domains
- [✅] Security headers in nginx
- [✅] Production logging configuration

### Additional Recommendations:
- [ ] SSL certificates for HTTPS
- [ ] Firewall rules for port restrictions
- [ ] Log rotation configuration
- [ ] Regular backup automation
- [ ] Monitoring and alerting setup

## Rollback Plan 📋

### If Deployment Fails:
1. **Restore Previous Version**:
   ```bash
   # Restore webapp backup
   mv /var/www/webapp.vtelltales.com/html.backup.* /var/www/webapp.vtelltales.com/html
   
   # Restore backend backup  
   systemctl stop vtelltales-api
   mv /var/www/webapi.vtelltales.com/app.backup.* /var/www/webapi.vtelltales.com/app
   systemctl start vtelltales-api
   ```

2. **Check Service Status**: Verify all services are running
3. **Test Functionality**: Ensure previous version works
4. **Investigate Issues**: Check logs for deployment problems

---

## Ready for Production Deployment! 🎉

All components built, configured, and ready for deployment to:
- **webapp.vtelltales.com** (Frontend)
- **webapi.vtelltales.com** (Backend API)
- **VTellTales_Web_db** (Database)

Execute: `./deploy-production.sh` when ready! 🚀