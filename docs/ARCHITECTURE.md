# Architecture Documentation

## System Overview

VTellTales is a modern web application built for interactive storytelling, featuring a React TypeScript frontend, .NET 8.0 backend API, and MySQL database. The system supports user authentication, story creation, story type management, and demo modes for development and testing.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                        │
├─────────────────────────────────────────────────────────────┤
│  React 18 + TypeScript + Vite + Tailwind CSS              │
│  - Component-based UI                                      │
│  - State management with Context API                       │
│  - Responsive design                                       │
│  - HTTP client for API communication                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       API Gateway                          │
├─────────────────────────────────────────────────────────────┤
│  Nginx (Production) / Development Server                   │
│  - Load balancing                                          │
│  - SSL termination                                         │
│  - Rate limiting                                           │
│  - Static file serving                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                       │
├─────────────────────────────────────────────────────────────┤
│  .NET 8.0 Web API                                         │
│  - RESTful API endpoints                                   │
│  - Authentication & Authorization                          │
│  - Business logic processing                               │
│  - Data validation                                         │
│  - Error handling                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                            │
├─────────────────────────────────────────────────────────────┤
│  Entity Framework Core + MySQL                             │
│  - Object-relational mapping                               │
│  - Database migrations                                     │
│  - Query optimization                                      │
│  - Connection pooling                                      │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Component Structure
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI elements (buttons, inputs, cards)
│   ├── layout/          # Layout components (header, sidebar, navigation)
│   └── feature/         # Feature-specific components
├── pages/               # Route components / screens
├── contexts/            # React context providers
├── hooks/               # Custom React hooks
├── services/            # API communication layer
├── types/               # TypeScript type definitions
├── lib/                 # Utility functions and configurations
└── assets/              # Static assets (images, icons, fonts)
```

### State Management
```typescript
// Context-based state management
interface AppContextType {
  user: User | null
  stories: Story[]
  loading: boolean
  error: string | null
}

// Authentication Context
interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}
```

### Component Communication Pattern
```
┌─────────────┐    Props    ┌─────────────┐
│   Parent    │────────────▶│   Child     │
│ Component   │◀────────────│ Component   │
└─────────────┘  Callbacks  └─────────────┘
       │                           │
       │         Context           │
       └───────────┬───────────────┘
                   │
            ┌─────────────┐
            │   Global    │
            │    State    │
            └─────────────┘
```

### Routing Structure
```typescript
// React Router configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "stories", element: <StoryListScreen /> },
      { path: "stories/:id", element: <StoryDetailsScreen /> },
      { path: "create-story", element: <NewStoryScreen /> },
      { path: "profile", element: <ProfileScreen /> }
    ]
  },
  { path: "/login", element: <LoginScreen /> },
  { path: "/register", element: <RegisterScreen /> }
])
```

## Backend Architecture

### Layered Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                      │
├─────────────────────────────────────────────────────────────┤
│  Controllers (VTellTales.API)                              │
│  - HTTP request handling                                   │
│  - Input validation                                        │
│  - Response formatting                                     │
│  - Authentication/Authorization                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Business Layer                         │
├─────────────────────────────────────────────────────────────┤
│  Services (VTellTales.BL)                                  │
│  - Business logic implementation                           │
│  - Data transformation                                     │
│  - Workflow coordination                                   │
│  - Domain rules enforcement                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                            │
├─────────────────────────────────────────────────────────────┤
│  Repositories & Context (VTellTales.DL)                   │
│  - Data access abstraction                                │
│  - Entity Framework context                               │
│  - Database operations                                     │
│  - Query building                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Transfer Layer                     │
├─────────────────────────────────────────────────────────────┤
│  DTOs (VTellTales.DTO)                                     │
│  - API request/response models                             │
│  - Data validation attributes                              │
│  - Serialization configuration                            │
└─────────────────────────────────────────────────────────────┘
```

### API Endpoints Structure
```
/storyapi/
├── userstory/
│   ├── GET    /all                    # Get paginated stories
│   ├── GET    /{id}                   # Get story by ID
│   ├── POST   /                       # Create new story
│   ├── PUT    /{id}                   # Update story
│   └── DELETE /{id}                   # Delete story
├── storytype/
│   ├── GET    /all                    # Get all story types
│   ├── GET    /{id}                   # Get story type by ID
│   ├── POST   /                       # Create story type
│   └── PUT    /{id}                   # Update story type
├── user/
│   ├── GET    /profile                # Get user profile
│   ├── PUT    /profile                # Update user profile
│   └── POST   /complete-profile       # Complete user profile
└── auth/
    ├── POST   /login                  # User authentication
    ├── POST   /register               # User registration
    └── POST   /logout                 # User logout
```

### Service Layer Pattern
```csharp
public interface IStoryService
{
    Task<PaginatedResult<StoryDto>> GetStoriesAsync(int page, int pageSize);
    Task<StoryDto?> GetStoryByIdAsync(int id);
    Task<StoryDto> CreateStoryAsync(CreateStoryDto createStoryDto);
    Task<StoryDto?> UpdateStoryAsync(int id, UpdateStoryDto updateStoryDto);
    Task<bool> DeleteStoryAsync(int id);
}

public class StoryService : IStoryService
{
    private readonly ApplicationDbContext _context;
    
    public StoryService(ApplicationDbContext context)
    {
        _context = context;
    }
    
    // Implementation details...
}
```

## Database Architecture

### Entity Relationship Diagram
```
┌─────────────────────┐      ┌─────────────────────┐
│       Users         │      │    StoryTypes       │
├─────────────────────┤      ├─────────────────────┤
│ Id (string) PK      │      │ Id (int) PK         │
│ Email (string)      │      │ Name (string)       │
│ FirstName (string)  │      │ Description (text)  │
│ LastName (string)   │      │ CreatedDate (date)  │
│ AgeGroup (string)   │      └─────────────────────┘
│ CreatedDate (date)  │               │
└─────────────────────┘               │
           │                          │
           │                          │
           │         ┌─────────────────────┐
           └────────▶│    UserStories      │◀──────┘
                     ├─────────────────────┤
                     │ Id (int) PK         │
                     │ UserId (string) FK  │
                     │ StoryTitle (string) │
                     │ StoryDesc (text)    │
                     │ StoryTypeId (int) FK│
                     │ CreatedDate (date)  │
                     │ UpdatedDate (date)  │
                     └─────────────────────┘
```

### Database Schema
```sql
-- Users table
CREATE TABLE Users (
    Id VARCHAR(255) PRIMARY KEY,
    Email VARCHAR(255) UNIQUE NOT NULL,
    FirstName VARCHAR(100),
    LastName VARCHAR(100),
    AgeGroup VARCHAR(50),
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedDate DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (Email)
);

-- Story Types table
CREATE TABLE StoryTypes (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Description TEXT,
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (Name)
);

-- User Stories table
CREATE TABLE UserStories (
    Id INT PRIMARY KEY AUTO_INCREMENT,
    UserId VARCHAR(255) NOT NULL,
    StoryTitle VARCHAR(255) NOT NULL,
    StoryDesc TEXT,
    StoryTypeId INT NOT NULL,
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedDate DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (StoryTypeId) REFERENCES StoryTypes(Id) ON DELETE RESTRICT,
    INDEX idx_user_stories (UserId, CreatedDate),
    INDEX idx_story_type (StoryTypeId)
);
```

## Security Architecture

### Authentication & Authorization Flow
```
┌─────────────┐    1. Login     ┌─────────────┐
│   Client    │───────────────▶│   Backend   │
└─────────────┘                └─────────────┘
       │                              │
       │        2. Validate           │
       │           Credentials        │
       │                              ▼
       │                    ┌─────────────┐
       │                    │  Database   │
       │                    └─────────────┘
       │                              │
       │        3. Generate           │
       │           JWT Token          │
       │                              │
       │◀─────────────────────────────┘
       │        4. Return Token
       │
       │    5. Subsequent Requests
       │       (with JWT in header)
       │───────────────────────────────────▶
```

### Security Measures
```typescript
// Frontend Security
const API_CONFIG = {
  baseURL: process.env.VITE_API_BASE_URL,
  timeout: 10000,
  withCredentials: false, // Prevent CSRF attacks
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
}

// HTTPS enforcement
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
  location.replace(`https:${location.href.substring(location.protocol.length)}`)
}
```

```csharp
// Backend Security Configuration
public void ConfigureServices(IServiceCollection services)
{
    // CORS configuration
    services.AddCors(options =>
    {
        options.AddDefaultPolicy(policy =>
        {
            policy.WithOrigins("https://yourdomain.com")
                  .AllowedHeaders("Content-Type", "Authorization")
                  .AllowedMethods("GET", "POST", "PUT", "DELETE")
                  .AllowCredentials(false);
        });
    });

    // Security headers
    services.AddHsts(options =>
    {
        options.Preload = true;
        options.IncludeSubDomains = true;
        options.MaxAge = TimeSpan.FromDays(365);
    });
}
```

## Deployment Architecture

### Container Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                     Load Balancer                          │
│                      (Nginx)                               │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼
┌─────────────┐              ┌─────────────┐
│  Frontend   │              │   Backend   │
│ Container   │              │ Container   │
│ (React SPA) │              │ (.NET API)  │
└─────────────┘              └─────────────┘
                                     │
                                     │
                                     ▼
                             ┌─────────────┐
                             │  Database   │
                             │ Container   │
                             │   (MySQL)   │
                             └─────────────┘
```

### Production Environment
```yaml
# Production Docker Compose Architecture
services:
  nginx:          # Load balancer & reverse proxy
  frontend:       # React application container
  backend:        # .NET API container
  mysql:          # Database container
  backup:         # Automated backup service
```

### Scaling Strategy
```
         Load Balancer
              │
    ┌─────────┼─────────┐
    │         │         │
    ▼         ▼         ▼
Frontend  Frontend  Frontend
Instance  Instance  Instance
    │         │         │
    └─────────┼─────────┘
              │
         API Gateway
              │
    ┌─────────┼─────────┐
    │         │         │
    ▼         ▼         ▼
Backend   Backend   Backend
Instance  Instance  Instance
    │         │         │
    └─────────┼─────────┘
              │
         Database
         Cluster
```

## Performance Architecture

### Frontend Performance
- **Code Splitting**: Route-based and component-based splitting
- **Lazy Loading**: Dynamic imports for non-critical components
- **Memoization**: React.memo, useMemo, useCallback for optimization
- **Bundle Optimization**: Tree shaking, minification, compression

### Backend Performance
- **Async Operations**: All database operations are asynchronous
- **Connection Pooling**: EF Core connection pool management
- **Caching Strategy**: In-memory caching for frequently accessed data
- **Query Optimization**: LINQ query optimization and indexing

### Database Performance
```sql
-- Indexing strategy
CREATE INDEX idx_user_stories_user_date ON UserStories(UserId, CreatedDate);
CREATE INDEX idx_user_stories_type ON UserStories(StoryTypeId);
CREATE INDEX idx_users_email ON Users(Email);

-- Query optimization example
SELECT s.*, st.Name as StoryTypeName, u.FirstName, u.LastName
FROM UserStories s
INNER JOIN StoryTypes st ON s.StoryTypeId = st.Id
INNER JOIN Users u ON s.UserId = u.Id
WHERE s.UserId = @UserId
ORDER BY s.CreatedDate DESC
LIMIT @PageSize OFFSET @Offset;
```

## Monitoring & Observability

### Application Metrics
```csharp
// Health checks configuration
services.AddHealthChecks()
    .AddDbContextCheck<ApplicationDbContext>()
    .AddUrlGroup(new Uri("https://api.example.com/health"), "External API");

// Logging configuration
services.AddLogging(builder =>
{
    builder.AddConsole();
    builder.AddFile("logs/app-{Date}.log");
    builder.SetMinimumLevel(LogLevel.Information);
});
```

### Monitoring Stack
```
┌─────────────┐    Metrics    ┌─────────────┐
│ Application │──────────────▶│ Prometheus  │
└─────────────┘               └─────────────┘
       │                             │
       │ Logs                        │ Queries
       ▼                             ▼
┌─────────────┐               ┌─────────────┐
│   Grafana   │               │   AlertM.   │
│ Dashboards  │               │  Manager    │
└─────────────┘               └─────────────┘
```

## Error Handling Architecture

### Frontend Error Boundaries
```typescript
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### Backend Error Handling
```csharp
// Global exception middleware
public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        
        var response = exception switch
        {
            ArgumentException _ => new { StatusCode = 400, Message = "Bad Request" },
            UnauthorizedAccessException _ => new { StatusCode = 401, Message = "Unauthorized" },
            _ => new { StatusCode = 500, Message = "Internal Server Error" }
        };

        context.Response.StatusCode = response.StatusCode;
        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}
```

This architecture documentation provides a comprehensive overview of the VTellTales application structure, covering all major architectural decisions and implementation patterns.