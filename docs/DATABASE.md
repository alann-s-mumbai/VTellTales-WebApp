# Database Configuration

## Contabo Server Database

**Server Details:**
- **Host**: `94.136.189.179` (Contabo VPS)
- **Database**: `VTellTales_Web_db`
- **Username**: `lhzpvxok_admin`
- **Password**: `vTT@2021#`
- **Port**: `3306` (MySQL default)
- **SSL Mode**: None
- **Connection String**: `Server=94.136.189.179;Database=VTellTales_Web_db;Uid=lhzpvxok_admin;Pwd=vTT@2021#;SslMode=None;AllowPublicKeyRetrieval=true;`

## Environment Configuration

### Development Environment
```json
{
  "ConnectionSettings": {
    "StoryBookDB": "Server=94.136.189.179;Database=VTellTales_Web_db;Uid=lhzpvxok_admin;Pwd=vTT@2021#;SslMode=None;AllowPublicKeyRetrieval=true;"
  }
}
```

### Production Environment
```json
{
  "ConnectionSettings": {
    "StoryBookDB": "Server=94.136.189.179;Database=VTellTales_Web_db;Uid=lhzpvxok_admin;Pwd=vTT@2021#;SslMode=None;AllowPublicKeyRetrieval=true;"
  }
}
```

### Docker Environment Variables
```env
DB_HOST=94.136.189.179
DB_PORT=3306
DB_NAME=VTellTales_Web_db
DB_USER=lhzpvxok_admin
DB_PASSWORD=vTT@2021#
DB_ROOT_PASSWORD=vTT@2021#
```

## Database Schema

### Tables Overview
- **Users**: User account information
- **StoryTypes**: Story category definitions  
- **UserStories**: User-created stories
- **Additional tables**: As defined in the existing schema

### Connection Testing
```bash
# Test database connection from command line
mysql -h 94.136.189.179 -u lhzpvxok_admin -p VTellTales_Web_db

# Test from .NET application
# Connection configured in appsettings.json files
```

## Security Notes

- Database is hosted on Contabo VPS
- Connection uses standard MySQL authentication
- SSL is disabled for compatibility
- Password authentication is configured
- Connection is used across all environments (dev/staging/prod)

## Backup Strategy

The database on Contabo server should be backed up regularly:
- Daily automated backups
- Manual backups before major deployments
- Version control of schema changes

## Usage in Application

The application uses Entity Framework Core with the configured connection string:
- Development: `appsettings.Development.json`
- Production: `appsettings.Production.json`
- Main config: `appsettings.json`

All environments point to the same Contabo database instance for consistency.