# Deployment Guide

## Overview

This guide covers deploying vtelltales_wa to various environments including development, staging, and production.

## Deployment Methods

### 1. Manual Deployment

#### Frontend Deployment

```bash
# Build for production
cd frontend
npm run build

# The build files will be in the 'dist' directory
# Upload contents to your web server
```

##### Apache Configuration
```apache
# .htaccess for React Router
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

##### Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/vtelltales_wa/frontend;
    index index.html;

    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Backend Deployment

```bash
# Build for production
cd backend/VTellTalesCore/VTellTales_WA.API/VTellTales_WA.API
dotnet publish -c Release -o publish

# Upload the 'publish' folder to your server
```

##### Linux Service Configuration
```ini
# /etc/systemd/system/vtelltales_wa-api.service
[Unit]
Description=vtelltales_wa API
After=network.target

[Service]
Type=notify
User=www-data
Group=www-data
WorkingDirectory=/var/www/webapp.vtelltales.com/api
ExecStart=/usr/bin/dotnet VTellTales_WA.API.dll
Restart=on-failure
KillSignal=SIGINT
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=ASPNETCORE_URLS=http://0.0.0.0:5000

[Install]
WantedBy=multi-user.target
```

```bash
# Start service
sudo systemctl enable vtelltales_wa-api
sudo systemctl start vtelltales_wa-api
sudo systemctl status vtelltales_wa-api
```

### 2. Docker Deployment

#### Docker Compose Setup

```yaml
# docker-compose.production.yml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    ports:
      - "80:80"
    depends_on:
      - backend

  backend:
    build:
      context: ./backend/VTellTalesCore
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__DefaultConnection=Server=database;Port=3306;Database=VTellTales_Web_db;Uid=vtelltales;Pwd=${DB_PASSWORD}
    depends_on:
      - database

  database:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: VTellTales_Web_db
      MYSQL_USER: vtelltales
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/init:/docker-entrypoint-initdb.d
    ports:
      - "3306:3306"

volumes:
  mysql_data:
```

#### Frontend Dockerfile
```dockerfile
# frontend/Dockerfile.prod
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Backend Dockerfile
```dockerfile
# backend/VTellTalesCore/Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5000

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["VTellTales_WA.API/VTellTales_WA.API.csproj", "VTellTales_WA.API/"]
RUN dotnet restore "VTellTales_WA.API/VTellTales_WA.API.csproj"

COPY . .
WORKDIR "/src/VTellTales_WA.API"
RUN dotnet build "VTellTales_WA.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "VTellTales_WA.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "VTellTales_WA.API.dll"]
```

#### Deploy with Docker Compose
```bash
# Create environment file
cat > .env << EOF
DB_ROOT_PASSWORD=your_secure_root_password
DB_PASSWORD=your_secure_password
EOF

# Deploy
docker-compose -f docker-compose.production.yml up -d

# Check status
docker-compose -f docker-compose.production.yml ps
```

### 3. Cloud Deployment

#### AWS Deployment

##### Using AWS ECS
```bash
# Install AWS CLI
aws configure

# Create ECR repositories
aws ecr create-repository --repository-name vtelltales_wa/frontend
aws ecr create-repository --repository-name vtelltales_wa/backend

# Build and push images
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com

docker build -t vtelltales_wa/frontend -f frontend/Dockerfile.prod frontend
docker tag vtelltales_wa/frontend:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/vtelltales_wa/frontend:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/vtelltales_wa/frontend:latest

docker build -t vtelltales_wa/backend backend/vtelltales_waCore
docker tag vtelltales_wa/backend:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/vtelltales_wa/backend:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/vtelltales_wa/backend:latest
```

##### ECS Task Definition
```json
{
  "family": "vtelltales_wa-app",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "frontend",
      "image": "123456789012.dkr.ecr.us-east-1.amazonaws.com/vtelltales_wa/frontend:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "essential": true
    },
    {
      "name": "backend",
      "image": "123456789012.dkr.ecr.us-east-1.amazonaws.com/vtelltales_wa/backend:latest",
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "ASPNETCORE_ENVIRONMENT",
          "value": "Production"
        }
      ],
      "essential": true
    }
  ]
}
```

#### Azure Deployment

##### Using Azure Container Apps
```bash
# Install Azure CLI
az login

# Create resource group
az group create --name vtelltales_wa-rg --location eastus

# Create container app environment
az containerapp env create --name vtelltales_wa-env --resource-group vtelltales_wa-rg --location eastus

# Deploy frontend
az containerapp create \
  --name vtelltales_wa-frontend \
  --resource-group vtelltales_wa-rg \
  --environment vtelltales_wa-env \
  --image nginx:alpine \
  --target-port 80 \
  --ingress external

# Deploy backend
az containerapp create \
  --name vtelltales_wa-backend \
  --resource-group vtelltales_wa-rg \
  --environment vtelltales_wa-env \
  --image mcr.microsoft.com/dotnet/aspnet:8.0 \
  --target-port 5000 \
  --ingress external
```

#### Google Cloud Platform

##### Using Cloud Run
```bash
# Install gcloud CLI
gcloud auth login
gcloud config set project your-project-id

# Build and deploy frontend
gcloud builds submit --tag gcr.io/your-project-id/vtelltales_wa-frontend frontend

gcloud run deploy vtelltales_wa-frontend \
  --image gcr.io/your-project-id/vtelltales_wa-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Build and deploy backend
gcloud builds submit --tag gcr.io/your-project-id/vtelltales_wa-backend backend/vtelltales_waCore

gcloud run deploy vtelltales_wa-backend \
  --image gcr.io/your-project-id/vtelltales_wa-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### 4. Kubernetes Deployment

#### Namespace
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: vtelltales_wa
```

#### Frontend Deployment
```yaml
# k8s/frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: vtelltales_wa
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: vtelltales_wa/frontend:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"

---
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
  namespace: vtelltales_wa
spec:
  selector:
    app: frontend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: LoadBalancer
```

#### Backend Deployment
```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: vtelltales_wa
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: vtelltales_wa/backend:latest
        ports:
        - containerPort: 5000
        env:
        - name: ASPNETCORE_ENVIRONMENT
          value: "Production"
        - name: ConnectionStrings__DefaultConnection
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: connection-string
        resources:
          requests:
            memory: "256Mi"
            cpu: "200m"
          limits:
            memory: "512Mi"
            cpu: "500m"

---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: vtelltales_wa
spec:
  selector:
    app: backend
  ports:
  - protocol: TCP
    port: 5000
    targetPort: 5000
  type: ClusterIP
```

#### Database Deployment
```yaml
# k8s/database-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mysql
  namespace: vtelltales_wa
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mysql
  template:
    metadata:
      labels:
        app: mysql
    spec:
      containers:
      - name: mysql
        image: mysql:8.0
        ports:
        - containerPort: 3306
        env:
        - name: MYSQL_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: root-password
        - name: MYSQL_DATABASE
          value: "VTellTales_Web_db"
        - name: MYSQL_USER
          value: "vtelltales"
        - name: MYSQL_PASSWORD
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: user-password
        volumeMounts:
        - name: mysql-storage
          mountPath: /var/lib/mysql
      volumes:
      - name: mysql-storage
        persistentVolumeClaim:
          claimName: mysql-pvc

---
apiVersion: v1
kind: Service
metadata:
  name: mysql-service
  namespace: vtelltales
spec:
  selector:
    app: mysql
  ports:
  - protocol: TCP
    port: 3306
    targetPort: 3306
  type: ClusterIP

---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mysql-pvc
  namespace: vtelltales
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
```

#### Secrets
```yaml
# k8s/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: database-secret
  namespace: vtelltales
type: Opaque
data:
  root-password: <base64-encoded-root-password>
  user-password: <base64-encoded-user-password>
  connection-string: <base64-encoded-connection-string>
```

#### Deploy to Kubernetes
```bash
# Create secrets
echo -n 'your-root-password' | base64
echo -n 'your-user-password' | base64
echo -n 'Server=mysql-service;Port=3306;Database=VTellTales_Web_db;Uid=vtelltales;Pwd=your-user-password;' | base64

# Apply configurations
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/database-deployment.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml

# Check status
kubectl get all -n vtelltales
```

## Environment Configuration

### Production Environment Variables

#### Frontend (.env.production)
```env
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_ENVIRONMENT=production
VITE_LOG_LEVEL=error
VITE_FIREBASE_API_KEY=your_production_key
VITE_FIREBASE_AUTH_DOMAIN=your-prod-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-prod-project-id
```

#### Backend (appsettings.Production.json)
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "Microsoft.AspNetCore": "Error"
    }
  },
  "ConnectionSettings": {
    "StoryBookDB": "Server=94.136.189.179;Database=VTellTales_Web_db;Uid=lhzpvxok_admin;Pwd=vTT@2021#;SslMode=None;AllowPublicKeyRetrieval=true;"
  },
  "AllowedHosts": "vtelltales.com,*.vtelltales.com",
  "CORS": {
    "AllowedOrigins": ["https://vtelltales.com", "https://www.vtelltales.com", "https://webapp.vtelltales.com"]
  },
  "Firebase": {
    "ProjectId": "your-production-firebase-project-id"
  }
}
```

## Database Migration

### Production Database Setup
```sql
-- Using existing Contabo database
-- Server: 94.136.189.179
-- Database: VTellTales_Web_db
-- User: lhzpvxok_admin
-- Connection configured in appsettings.json files
```

### Migration Script
```bash
#!/bin/bash
# migrate-production.sh

set -e

echo "Starting production migration..."

# Backup existing database
mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME > backup_$(date +%Y%m%d_%H%M%S).sql

# Run migrations
if [ -d "database/migrations" ]; then
    for migration in database/migrations/*.sql; do
        echo "Running migration: $migration"
        mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME < $migration
    done
fi

# Insert sample data if needed
if [ -f "database/sample-data.sql" ]; then
    echo "Inserting sample data..."
    mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME < database/sample-data.sql
fi

echo "Migration completed successfully!"
```

## SSL/HTTPS Setup

### Let's Encrypt with Certbot
```bash
# Install certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Nginx SSL Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    location / {
        root /var/www/vtelltales/frontend;
        try_files $uri $uri/ /index.html;
    }
    
    location /storyapi/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## Monitoring and Logging

### Application Logging
```csharp
// Backend logging configuration
public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
{
    if (env.IsProduction())
    {
        app.UseExceptionHandler("/Error");
        app.UseHsts();
    }
    
    app.UseHttpsRedirection();
    app.UseStaticFiles();
    app.UseRouting();
    app.UseCors();
    app.UseAuthentication();
    app.UseAuthorization();
    app.UseEndpoints(endpoints =>
    {
        endpoints.MapControllers();
    });
}
```

### Health Checks
```csharp
// Add to Program.cs
builder.Services.AddHealthChecks()
    .AddDbContextCheck<ApplicationDbContext>();

// Add endpoint
app.MapHealthChecks("/health");
```

### Monitoring Script
```bash
#!/bin/bash
# monitor.sh

check_service() {
    local service=$1
    local url=$2
    
    if curl -f -s $url > /dev/null; then
        echo "✅ $service is running"
    else
        echo "❌ $service is down"
        # Send alert (email, Slack, etc.)
    fi
}

check_service "Frontend" "https://yourdomain.com"
check_service "Backend" "https://yourdomain.com/health"
check_service "Database" "mysql://your-db-server:3306"
```

## Backup Strategy

### Database Backup
```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/var/backups/vtelltales"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="VTellTales_Web_db"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Application backup
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/vtelltales

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

### Automated Backup
```bash
# Add to crontab
sudo crontab -e

# Daily backup at 2 AM
0 2 * * * /opt/vtelltales/scripts/backup.sh

# Weekly full backup on Sundays at 3 AM
0 3 * * 0 /opt/vtelltales/scripts/full-backup.sh
```

## Rollback Procedures

### Application Rollback
```bash
#!/bin/bash
# rollback.sh

BACKUP_VERSION=$1
APP_DIR="/var/www/vtelltales"

if [ -z "$BACKUP_VERSION" ]; then
    echo "Usage: ./rollback.sh <backup-date>"
    exit 1
fi

# Stop services
sudo systemctl stop vtelltales-api
sudo systemctl stop nginx

# Restore application
tar -xzf /var/backups/vtelltales/app_$BACKUP_VERSION.tar.gz -C /

# Restore database
gunzip < /var/backups/vtelltales/db_$BACKUP_VERSION.sql.gz | mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME

# Start services
sudo systemctl start vtelltales-api
sudo systemctl start nginx

echo "Rollback completed to version: $BACKUP_VERSION"
```

This deployment guide covers various deployment scenarios for VTellTales. Choose the method that best fits your infrastructure and requirements.