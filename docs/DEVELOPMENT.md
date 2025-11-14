# Development Guide

## Getting Started

This guide will help you set up the VTellTales development environment on your local machine.

## Prerequisites

### System Requirements
- **Operating System**: Windows 10+, macOS 10.15+, or Ubuntu 18.04+
- **Memory**: 8GB RAM minimum, 16GB recommended
- **Storage**: 10GB free space for development environment

### Required Software

#### Node.js & npm
```bash
# Install Node.js 18+ from https://nodejs.org/
node --version  # Should be 18.0.0 or higher
npm --version   # Should be 8.0.0 or higher
```

#### .NET 8.0 SDK
```bash
# Install .NET 8.0 SDK from https://dotnet.microsoft.com/download
dotnet --version  # Should be 8.0.0 or higher
```

#### Database
```bash
# Option 1: MySQL 8.0+
mysql --version

# Option 2: MariaDB 10.6+
mariadb --version

# Option 3: Docker (recommended for development)
docker --version
docker-compose --version
```

#### Git
```bash
# Install Git from https://git-scm.com/
git --version  # Should be 2.30.0 or higher
```

## Project Setup

### 1. Clone Repository
```bash
git clone https://github.com/vtelltales/VTellTales-WebApp.git
cd VTellTales-WebApp
```

### 2. Database Setup

#### Option A: Docker (Recommended)
```bash
# Create docker-compose.yml in project root
cat > docker-compose.yml << EOF
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: VTellTales_Web_db
      MYSQL_USER: vtelltales
      MYSQL_PASSWORD: password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
volumes:
  mysql_data:
EOF

# Start database
docker-compose up -d mysql
```

#### Option B: Local MySQL Installation
```sql
-- Connect to MySQL as root
CREATE DATABASE VTellTales_Web_db;
CREATE USER 'vtelltales'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON VTellTales_Web_db.* TO 'vtelltales'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Backend Setup

```bash
# Navigate to API project
cd backend/VTellTalesCore/VTellTales_WA.API/VTellTales_WA.API

# Restore dependencies
dotnet restore

# Database connection is already configured in appsettings.Development.json
# Using Contabo server: Server=94.136.189.179;Database=VTellTales_Web_db;Uid=lhzpvxok_admin;Pwd=vTT@2021#;SslMode=None;AllowPublicKeyRetrieval=true;

# Run database migrations (if available)
dotnet ef database update

# Start the backend
dotnet run --urls "http://0.0.0.0:5000"
```

### 4. Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create development environment file
cat > .env.development << EOF
VITE_API_BASE_URL=http://127.0.0.1:5001
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
EOF

# Start development server
npm run dev
```

## Development Workflow

### Daily Development
1. **Pull Latest Changes**
   ```bash
   git pull origin main
   ```

2. **Start Services**
   ```bash
   # Terminal 1: Database (if using Docker)
   docker-compose up mysql
   
   # Terminal 2: Backend
   cd backend/VTellTalesCore/VTellTales_WA.API/VTellTales_WA.API
   dotnet run --urls "http://0.0.0.0:5000"
   
   # Terminal 3: Frontend
   cd frontend
   npm run dev
   ```

3. **Access Applications**
   - Frontend: http://localhost:3000
  - Backend API: http://127.0.0.1:5001
  - API Documentation: http://127.0.0.1:5001/swagger

### Making Changes

#### Frontend Development
```bash
# Create new component
touch src/components/NewComponent.tsx

# Add TypeScript types
touch src/types/NewTypes.ts

# Run tests
npm run test

# Lint code
npm run lint

# Format code
npm run format
```

#### Backend Development
```bash
# Add new controller
touch Controllers/NewController.cs

# Add new service
touch Services/NewService.cs

# Run tests
dotnet test

# Format code
dotnet format
```

### Code Quality

#### Frontend Code Standards
```typescript
// Component naming: PascalCase
export function StoryCard({ story }: StoryCardProps): JSX.Element {
  // State: camelCase with descriptive names
  const [isLoading, setIsLoading] = useState<boolean>(false)
  
  // Event handlers: handle + Action
  const handleStoryClick = useCallback(() => {
    // Implementation
  }, [])
  
  return (
    <div className="story-card">
      {/* JSX content */}
    </div>
  )
}
```

#### Backend Code Standards
```csharp
// Controller naming: [Entity]Controller
[ApiController]
[Route("storyapi/[controller]")]
public class StoryController : ControllerBase
{
    private readonly IStoryService _storyService;
    
    public StoryController(IStoryService storyService)
    {
        _storyService = storyService;
    }
    
    [HttpGet("{id}")]
    public async Task<ActionResult<StoryDto>> GetStory(int id)
    {
        // Implementation
    }
}
```

### Testing

#### Frontend Testing
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

#### Backend Testing
```bash
# Unit tests
dotnet test

# Integration tests
dotnet test --filter Category=Integration

# Coverage report
dotnet test --collect:"XPlat Code Coverage"
```

### Debugging

#### Frontend Debugging
```typescript
// React Developer Tools
// Install browser extension for React debugging

// Console debugging
console.log('Debug info:', { variable })

// Breakpoints in VS Code
debugger; // Add this line for breakpoint
```

#### Backend Debugging
```csharp
// Visual Studio debugging
// Set breakpoints in IDE

// Console debugging
Console.WriteLine($"Debug info: {variable}");

// Logging
_logger.LogInformation("Debug info: {Variable}", variable);
```

## Database Development

### Schema Changes
```sql
-- Always create migration scripts
-- File: migrations/001_add_story_categories.sql

ALTER TABLE userstory 
ADD COLUMN category_id INT,
ADD FOREIGN KEY (category_id) REFERENCES story_categories(id);
```

### Sample Data
```sql
-- File: data/sample_stories.sql
INSERT INTO userstory (userid, storytitle, storydesc, storytypeid) VALUES
('demo-user-1', 'The Magic Forest', 'A magical adventure story', 1),
('demo-user-2', 'Space Explorer', 'Journey through the cosmos', 2);
```

## Environment Configuration

### Development Environment Variables

#### Frontend (.env.development)
```env
VITE_API_BASE_URL=http://127.0.0.1:5001
VITE_ENVIRONMENT=development
VITE_LOG_LEVEL=debug
VITE_FIREBASE_API_KEY=your_development_key
VITE_FIREBASE_AUTH_DOMAIN=your-dev-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-dev-project-id
```

#### Backend (appsettings.Development.json)
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Port=3306;Database=VTellTales_Web_db;Uid=vtelltales;Pwd=password;"
  },
  "AllowedHosts": "*",
  "CORS": {
    "AllowedOrigins": ["http://localhost:3000"]
  }
}
```

## Performance Optimization

### Frontend Performance
```typescript
// Code splitting
const LazyComponent = lazy(() => import('./LazyComponent'))

// Memoization
const MemoizedComponent = memo(Component)

// Callback optimization
const optimizedCallback = useCallback(() => {
  // Implementation
}, [dependencies])
```

### Backend Performance
```csharp
// Async/await patterns
public async Task<ActionResult<List<Story>>> GetStoriesAsync()
{
    return await _storyService.GetStoriesAsync();
}

// Caching
[ResponseCache(Duration = 300)]
public async Task<ActionResult<Story>> GetStory(int id)
{
    // Implementation
}
```

## Troubleshooting

### Common Issues

#### Frontend Issues
```bash
# Node modules issues
rm -rf node_modules package-lock.json
npm install

# Port conflicts
lsof -ti:3000 | xargs kill
npm run dev

# TypeScript errors
npm run type-check
```

#### Backend Issues
```bash
# Package restore issues
dotnet clean
dotnet restore

# Database connection issues
# Check connection string in appsettings.json
# Verify database is running

# Port conflicts
lsof -ti:5000 | xargs kill
dotnet run
```

### Debug Commands
```bash
# Check service status
curl http://127.0.0.1:5001/health
curl http://localhost:3000

# Database connection test
mysql -h localhost -u vtelltales -p VTellTales_Web_db

# View logs
tail -f logs/application.log
```

## VS Code Setup

### Recommended Extensions
```json
// .vscode/extensions.json
{
  "recommendations": [
    "ms-dotnettools.csharp",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### Workspace Settings
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[csharp]": {
    "editor.defaultFormatter": "ms-dotnettools.csharp"
  },
  "typescript.preferences.includePackageJsonAutoImports": "auto"
}
```

## Git Workflow

### Branch Naming
```bash
# Feature branches
git checkout -b feature/story-comments
git checkout -b feature/user-profiles

# Bug fixes
git checkout -b fix/authentication-bug
git checkout -b fix/memory-leak

# Hotfixes
git checkout -b hotfix/security-patch
```

### Commit Messages
```bash
# Format: type(scope): description
git commit -m "feat(stories): add story commenting system"
git commit -m "fix(auth): resolve token expiry handling"
git commit -m "docs(api): update authentication endpoints"
```

This development guide should help you get started with VTellTales development. For more specific topics, check the other documentation files in the `/docs` folder.