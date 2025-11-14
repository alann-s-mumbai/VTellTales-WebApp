#!/bin/bash

# Update API configuration with proper database connection
cat > /var/www/webapp.vtelltales.com/api/appsettings.Production.json << 'CONFIG_EOF'
{
  "Logging": {
    "Console": {
      "FormatterName": "json"
    },
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning",
      "Microsoft.Hosting.Lifetime": "Information"
    }
  },
  "AllowedHosts": "webapp.vtelltales.com;localhost",
  "Cors": {
    "AllowedOrigins": [
      "https://webapp.vtelltales.com",
      "http://webapp.vtelltales.com",
      "http://localhost:3000"
    ]
  },
  "Api": {
    "BasePath": ""
  },
  "ConnectionSettings": {
    "StoryBookDB": "Server=94.136.189.179;Database=VTellTales_Web_db;Uid=lhzpvxok_admin;Pwd=vTT@2021#;SslMode=None;AllowPublicKeyRetrieval=true;"
  },
  "AssetStorage": {
    "Root": "/var/www/vtelltales/data",
    "Cdn": "https://webapp.vtelltales.com/data"
  }
}
CONFIG_EOF

sudo chown www-data:www-data /var/www/webapp.vtelltales.com/api/appsettings.Production.json
sudo systemctl restart vtelltales-api
sleep 5
echo "Configuration updated and service restarted"
