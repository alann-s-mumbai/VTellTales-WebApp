# Docker Configuration Files

## Development Docker Setup

### Main Docker Compose
```yaml
# docker-compose.yml (Development)
version: '3.8'

services:
  # Database service for development
  mysql:
    image: mysql:8.0
    container_name: vtelltales-mysql
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: VTellTales_Web_db
      MYSQL_USER: vtelltales
      MYSQL_PASSWORD: password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/init:/docker-entrypoint-initdb.d:ro
    networks:
      - vtelltales-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

  # Backend API service
  backend:
    build:
      context: ./backend/VTellTalesCore
      dockerfile: Dockerfile.dev
    container_name: vtelltales-backend
    ports:
      - "5000:5000"
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ConnectionStrings__DefaultConnection=Server=mysql;Port=3306;Database=VTellTales_Web_db;Uid=vtelltales;Pwd=password;
      - ASPNETCORE_URLS=http://0.0.0.0:5000
    volumes:
      - ./backend/VTellTalesCore:/app
      - /app/bin
      - /app/obj
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - vtelltales-network
    restart: unless-stopped

  # Frontend service
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    container_name: vtelltales-frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_API_BASE_URL=http://127.0.0.1:5001
      - VITE_ENVIRONMENT=development
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend
    networks:
      - vtelltales-network
    restart: unless-stopped

  # Nginx reverse proxy (optional for development)
  nginx:
    image: nginx:alpine
    container_name: vtelltales-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/dev.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend
    networks:
      - vtelltales-network
    restart: unless-stopped

volumes:
  mysql_data:
    driver: local

networks:
  vtelltales-network:
    driver: bridge
```

### Production Docker Compose
```yaml
# docker-compose.prod.yml (Production)
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: vtelltales-mysql-prod
    environment:
      MYSQL_ROOT_PASSWORD: vTT@2021#
      MYSQL_DATABASE: VTellTales_Web_db
      MYSQL_USER: lhzpvxok_admin
      MYSQL_PASSWORD: vTT@2021#
    volumes:
      - mysql_data_prod:/var/lib/mysql
      - ./database/init:/docker-entrypoint-initdb.d:ro
      - ./database/backups:/backups
    networks:
      - vtelltales-network
    restart: always
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  backend:
    build:
      context: ./backend/VTellTalesCore
      dockerfile: Dockerfile.prod
    container_name: vtelltales-backend-prod
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionSettings__StoryBookDB=Server=94.136.189.179;Database=VTellTales_Web_db;Uid=lhzpvxok_admin;Pwd=vTT@2021#;SslMode=None;AllowPublicKeyRetrieval=true;
      - ASPNETCORE_URLS=http://0.0.0.0:5000
      - Firebase__ProjectId=${FIREBASE_PROJECT_ID}
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - vtelltales-network
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://127.0.0.1:5001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    container_name: vtelltales-frontend-prod
    depends_on:
      - backend
    networks:
      - vtelltales-network
    restart: always
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  nginx:
    image: nginx:alpine
    container_name: vtelltales-nginx-prod
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/prod.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - ./static:/usr/share/nginx/html/static:ro
    depends_on:
      - frontend
      - backend
    networks:
      - vtelltales-network
    restart: always
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # Backup service
  backup:
    image: mysql:8.0
    container_name: vtelltales-backup
    environment:
      MYSQL_PWD: ${DB_PASSWORD}
    volumes:
      - mysql_data_prod:/var/lib/mysql:ro
      - ./database/backups:/backups
      - ./scripts/backup.sh:/backup.sh:ro
    depends_on:
      - mysql
    networks:
      - vtelltales-network
    restart: "no"
    command: /bin/bash /backup.sh
    profiles:
      - backup

volumes:
  mysql_data_prod:
    driver: local

networks:
  vtelltales-network:
    driver: bridge
```

## Dockerfiles

### Frontend Development Dockerfile
```dockerfile
# frontend/Dockerfile.dev
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Development command with hot reloading
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

### Frontend Production Dockerfile
```dockerfile
# frontend/Dockerfile.prod
FROM node:18-alpine as builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy build files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### Backend Development Dockerfile
```dockerfile
# backend/VTellTalesCore/Dockerfile.dev
FROM mcr.microsoft.com/dotnet/sdk:8.0

# Set working directory
WORKDIR /app

# Copy project files
COPY *.sln ./
COPY VTellTales_WA.API/*.csproj ./VTellTales_WA.API/
COPY VTellTales_WA.BL/*.csproj ./VTellTales_WA.BL/
COPY VTellTales_WA.DL/*.csproj ./VTellTales_WA.DL/
COPY VTellTales_WA.DTO/*.csproj ./VTellTales_WA.DTO/

# Restore dependencies
RUN dotnet restore

# Copy source code
COPY . .

# Build the application
RUN dotnet build -c Debug --no-restore

# Expose port
EXPOSE 5000

# Set environment
ENV ASPNETCORE_ENVIRONMENT=Development
ENV ASPNETCORE_URLS=http://0.0.0.0:5000

# Development command with hot reloading
WORKDIR /app/VTellTales_WA.API
CMD ["dotnet", "watch", "run", "--no-restore"]
```

### Backend Production Dockerfile
```dockerfile
# backend/VTellTalesCore/Dockerfile.prod
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5000

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files
COPY *.sln ./
COPY VTellTales_WA.API/*.csproj ./VTellTales_WA.API/
COPY VTellTales_WA.BL/*.csproj ./VTellTales_WA.BL/
COPY VTellTales_WA.DL/*.csproj ./VTellTales_WA.DL/
COPY VTellTales_WA.DTO/*.csproj ./VTellTales_WA.DTO/

# Restore dependencies
RUN dotnet restore

# Copy source code
COPY . .

# Build the application
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish --no-restore

FROM base AS final
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 dotnet
RUN adduser --system --uid 1001 dotnet

# Copy published files
COPY --from=publish /app/publish .

# Set ownership
RUN chown -R dotnet:dotnet /app
USER dotnet

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://127.0.0.1:5001/health || exit 1

# Set environment
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://0.0.0.0:5000

ENTRYPOINT ["dotnet", "VTellTales_WA.API.dll"]
```

## Nginx Configuration

### Development Nginx Config
```nginx
# nginx/dev.conf
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Basic settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    # Development server configuration
    server {
        listen 80;
        server_name localhost;

        # Frontend proxy
        location / {
            proxy_pass http://frontend:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 86400;
        }

        # Backend API proxy
        location /storyapi/ {
            proxy_pass http://backend:5000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_read_timeout 300;
        }

        # Health check endpoint
        location /health {
            proxy_pass http://backend:5000/health;
            access_log off;
        }
    }
}
```

### Production Nginx Config
```nginx
# nginx/prod.conf
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    # Basic settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        application/xml
        image/svg+xml;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'" always;

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name _;
        return 301 https://$host$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        # SSL configuration
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_session_timeout 1d;
        ssl_session_cache shared:SSL:50m;
        ssl_session_tickets off;

        # Modern SSL configuration
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
        ssl_prefer_server_ciphers off;

        # HSTS
        add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

        # Root directory
        root /usr/share/nginx/html;
        index index.html;

        # Frontend static files
        location / {
            try_files $uri $uri/ /index.html;
            
            # Cache static assets
            location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
                expires 1y;
                add_header Cache-Control "public, immutable";
                add_header X-Frame-Options "SAMEORIGIN" always;
            }
        }

        # Backend API proxy
        location /storyapi/ {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://backend:5000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_read_timeout 300;
            proxy_connect_timeout 60;
            proxy_send_timeout 300;

            # Add security headers for API
            add_header X-Frame-Options "DENY" always;
            add_header X-Content-Type-Options "nosniff" always;
        }

        # Authentication endpoints (stricter rate limiting)
        location /storyapi/auth/ {
            limit_req zone=login burst=5 nodelay;
            
            proxy_pass http://backend:5000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health check endpoint
        location /health {
            proxy_pass http://backend:5000/health;
            access_log off;
        }

        # Block access to hidden files
        location ~ /\. {
            deny all;
            access_log off;
            log_not_found off;
        }

        # Custom error pages
        error_page 404 /404.html;
        error_page 500 502 503 504 /50x.html;
    }
}
```

## Environment Configuration

### Development Environment File
```bash
# .env.dev
# Database
DB_ROOT_PASSWORD=password
DB_PASSWORD=password
DB_HOST=mysql
DB_PORT=3306
DB_NAME=VTellTales_Web_db

# API
API_PORT=5000
ASPNETCORE_ENVIRONMENT=Development

# Frontend
FRONTEND_PORT=3000
VITE_API_BASE_URL=http://127.0.0.1:5001
VITE_ENVIRONMENT=development

# Firebase (optional for development)
FIREBASE_PROJECT_ID=your-dev-project-id
```

### Production Environment File
```bash
# .env.prod
# Database (Using Contabo server)
DB_ROOT_PASSWORD=vTT@2021#
DB_PASSWORD=vTT@2021#
DB_HOST=94.136.189.179
DB_PORT=3306
DB_NAME=VTellTales_Web_db
DB_USER=lhzpvxok_admin

# API
API_PORT=5000
ASPNETCORE_ENVIRONMENT=Production

# Firebase
FIREBASE_PROJECT_ID=your-production-project-id

# SSL (if using Let's Encrypt)
LETSENCRYPT_EMAIL=your@email.com
LETSENCRYPT_HOST=yourdomain.com

# Backup
BACKUP_RETENTION_DAYS=30
BACKUP_SCHEDULE=0 2 * * *
```

## Docker Commands

### Development Commands
```bash
# Start development environment
docker-compose up -d

# View logs
docker-compose logs -f

# Restart a specific service
docker-compose restart backend

# Rebuild and restart
docker-compose up -d --build

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Execute commands in containers
docker-compose exec backend bash
docker-compose exec mysql mysql -u root -p
```

### Production Commands
```bash
# Start production environment
docker-compose -f docker-compose.prod.yml up -d

# Pull latest images
docker-compose -f docker-compose.prod.yml pull

# Update and restart
docker-compose -f docker-compose.prod.yml up -d --build

# View production logs
docker-compose -f docker-compose.prod.yml logs -f

# Backup database
docker-compose -f docker-compose.prod.yml run --rm backup

# Monitor resource usage
docker stats

# Clean up unused images
docker system prune -f
```

### Backup Script
```bash
#!/bin/bash
# scripts/backup.sh

set -e

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="VTellTales_Web_db"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
echo "Creating database backup..."
mysqldump -h mysql -u vtelltales -p$MYSQL_PWD $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Cleanup old backups (keep 30 days)
echo "Cleaning up old backups..."
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: db_$DATE.sql.gz"

# List recent backups
echo "Recent backups:"
ls -lah $BACKUP_DIR/*.sql.gz | tail -5
```

This Docker configuration provides both development and production environments with proper security, monitoring, and backup capabilities.