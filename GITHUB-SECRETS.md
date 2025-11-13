# GitHub Secrets Configuration for VTellTales-WebApp

This document lists all the secrets that need to be configured in your GitHub repository at https://github.com/alann-s-mumbai/VTellTales-WebApp for the CI/CD pipeline to work fully.

## Quick Setup

Go to: **https://github.com/alann-s-mumbai/VTellTales-WebApp/settings/secrets/actions**

Click "New repository secret" for each required secret below.

## Required Secrets

### Docker Hub (Optional - for image registry)
- `DOCKERHUB_USERNAME`: Your Docker Hub username
- `DOCKERHUB_TOKEN`: Your Docker Hub access token

### Staging Environment (Optional - for staging deployments)
- `STAGING_HOST`: Staging server IP/domain (e.g., staging.vtelltales.com)
- `STAGING_USERNAME`: SSH username for staging server (e.g., deploy)
- `STAGING_SSH_KEY`: Private SSH key for staging server authentication
- `STAGING_PORT`: SSH port for staging server (usually 22)

### Production Environment (For Contabo Server Deployment)
- **`PRODUCTION_HOST`**: `94.136.189.179`
- **`PRODUCTION_USERNAME`**: `root` (or your server username)
- **`PRODUCTION_SSH_KEY`**: Private SSH key for server access
- **`PRODUCTION_PORT`**: `22`

### Notifications (Optional)
- `SLACK_WEBHOOK_URL`: Slack webhook for deployment notifications

## SSH Key Setup

### 1. Generate SSH Key Pair (if needed)
```bash
ssh-keygen -t ed25519 -C "github-actions@vtelltales.com" -f ~/.ssh/vtelltales_deploy
```

### 2. Add Public Key to Server
```bash
# Copy public key to server
ssh-copy-id -i ~/.ssh/vtelltales_deploy.pub user@server-ip

# Or manually add to authorized_keys
cat ~/.ssh/vtelltales_deploy.pub >> ~/.ssh/authorized_keys
```

### 3. Add Private Key to GitHub Secrets
```bash
# Copy private key content
cat ~/.ssh/vtelltales_deploy

# Paste the entire content (including headers) into GitHub secret
```

## Testing SSH Connection

Test your SSH connection before adding to GitHub:

```bash
ssh -i ~/.ssh/vtelltales_deploy user@server-ip
```

## Current Status

Based on your project configuration:

- ✅ **GitHub Token**: Automatically provided
- ❌ **Docker Hub**: Not configured (optional)
- ❌ **Staging**: Not configured (optional) 
- ❌ **Production**: Not configured (required for automated deployment)
- ❌ **Slack**: Not configured (optional)

## Manual Deployment Alternative

If you prefer not to set up automated deployment, you can use the manual deployment scripts:

```bash
# Local development
./start-dev.sh

# Manual production deployment
./deploy-production.sh
```