# Testing Guide

## Overview

This guide covers testing strategies, frameworks, and best practices for the vtelltales_wa application.

## Testing Strategy

### Test Pyramid
```
    /\
   /  \ E2E Tests (Few)
  /____\
 /      \ Integration Tests (Some)
/________\
Unit Tests (Many)
```

### Testing Levels

1. **Unit Tests** (70-80%)
   - Test individual components/functions in isolation
   - Fast execution and immediate feedback
   - High code coverage

2. **Integration Tests** (15-25%)
   - Test component interactions
   - API endpoint testing
   - Database integration testing

3. **End-to-End Tests** (5-10%)
   - Test complete user workflows
   - Browser automation
   - Critical path validation

## Frontend Testing

### Setup

#### Test Dependencies
```json
{
  "devDependencies": {
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/user-event": "^14.4.3",
    "@vitest/ui": "^0.28.5",
    "vitest": "^0.28.5",
    "jsdom": "^21.1.0",
    "msw": "^0.49.3"
  }
}
```

#### Vitest Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/',
        '**/*.d.ts',
        '**/*.config.ts'
      ]
    }
  }
})
```

#### Test Setup
```typescript
// src/tests/setup.ts
import '@testing-library/jest-dom'
import { setupServer } from 'msw/node'
import { rest } from 'msw'

// Mock API server
export const server = setupServer(
  rest.get('/storyapi/stories', (req, res, ctx) => {
    return res(ctx.json({
      data: [
        { id: 1, title: 'Test Story', description: 'Test Description' }
      ],
      pagination: { page: 1, totalPages: 1, totalCount: 1 }
    }))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

### Unit Testing

#### Component Testing
```typescript
// src/components/__tests__/StoryCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { StoryCard } from '../StoryCard'

const mockStory = {
  id: 1,
  title: 'Test Story',
  description: 'Test Description',
  createdDate: '2024-01-01',
  storyType: { id: 1, name: 'Adventure' }
}

describe('StoryCard', () => {
  it('renders story information correctly', () => {
    render(<StoryCard story={mockStory} />)
    
    expect(screen.getByText('Test Story')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
    expect(screen.getByText('Adventure')).toBeInTheDocument()
  })

  it('calls onClick handler when clicked', () => {
    const mockOnClick = vi.fn()
    render(<StoryCard story={mockStory} onClick={mockOnClick} />)
    
    fireEvent.click(screen.getByTestId('story-card'))
    
    expect(mockOnClick).toHaveBeenCalledWith(mockStory.id)
  })

  it('displays loading state', () => {
    render(<StoryCard story={mockStory} loading />)
    
    expect(screen.getByTestId('story-card-loading')).toBeInTheDocument()
  })
})
```

#### Hook Testing
```typescript
// src/hooks/__tests__/useStories.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useStories } from '../useStories'

// Mock the API
vi.mock('../services/api', () => ({
  getStories: vi.fn().mockResolvedValue({
    data: [
      { id: 1, title: 'Test Story', description: 'Test Description' }
    ],
    pagination: { page: 1, totalPages: 1, totalCount: 1 }
  })
}))

describe('useStories', () => {
  it('fetches stories on mount', async () => {
    const { result } = renderHook(() => useStories())

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.stories).toHaveLength(1)
    expect(result.current.stories[0].title).toBe('Test Story')
  })

  it('handles errors correctly', async () => {
    vi.mocked(getStories).mockRejectedValueOnce(new Error('API Error'))

    const { result } = renderHook(() => useStories())

    await waitFor(() => {
      expect(result.current.error).toBe('API Error')
    })
  })
})
```

#### Service Testing
```typescript
// src/services/__tests__/api.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getStories, createStory } from '../api'

// Mock fetch
global.fetch = vi.fn()

describe('API Service', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('getStories', () => {
    it('fetches stories successfully', async () => {
      const mockResponse = {
        data: [{ id: 1, title: 'Test Story' }],
        pagination: { page: 1, totalPages: 1, totalCount: 1 }
      }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await getStories()

      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/storyapi/userstory/all?page=1&pageSize=10')
      expect(result).toEqual(mockResponse)
    })

    it('handles API errors', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      } as Response)

      await expect(getStories()).rejects.toThrow('HTTP error! status: 500')
    })
  })

  describe('createStory', () => {
    it('creates story successfully', async () => {
      const newStory = { title: 'New Story', description: 'New Description' }
      const mockResponse = { id: 1, ...newStory }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await createStory(newStory)

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/storyapi/userstory',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newStory)
        })
      )
      expect(result).toEqual(mockResponse)
    })
  })
})
```

### Integration Testing

#### Page Testing
```typescript
// src/pages/__tests__/HomePage.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import { HomePage } from '../HomePage'
import { AuthProvider } from '../../contexts/AuthContext'

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('HomePage', () => {
  it('displays stories after loading', async () => {
    renderWithProviders(<HomePage />)

    expect(screen.getByText('Loading stories...')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Test Story')).toBeInTheDocument()
    })

    expect(screen.queryByText('Loading stories...')).not.toBeInTheDocument()
  })

  it('displays error message on failure', async () => {
    // Mock API failure
    server.use(
      rest.get('/storyapi/stories', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'Server Error' }))
      })
    )

    renderWithProviders(<HomePage />)

    await waitFor(() => {
      expect(screen.getByText(/Error loading stories/)).toBeInTheDocument()
    })
  })
})
```

#### Context Testing
```typescript
// src/contexts/__tests__/AuthContext.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { AuthProvider, useAuth } from '../AuthContext'

const TestComponent = () => {
  const { user, login, logout, loading } = useAuth()

  return (
    <div>
      {loading && <div>Loading...</div>}
      {user ? (
        <div>
          <div>Welcome, {user.email}</div>
          <button onClick={() => logout()}>Logout</button>
        </div>
      ) : (
        <button onClick={() => login('test@example.com', 'password')}>
          Login
        </button>
      )}
    </div>
  )
}

describe('AuthContext', () => {
  it('handles login flow', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    fireEvent.click(screen.getByText('Login'))

    await waitFor(() => {
      expect(screen.getByText('Welcome, test@example.com')).toBeInTheDocument()
    })
  })

  it('handles logout flow', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Login first
    fireEvent.click(screen.getByText('Login'))
    await waitFor(() => {
      expect(screen.getByText('Logout')).toBeInTheDocument()
    })

    // Then logout
    fireEvent.click(screen.getByText('Logout'))
    await waitFor(() => {
      expect(screen.getByText('Login')).toBeInTheDocument()
    })
  })
})
```

### End-to-End Testing

#### Playwright Setup
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
})
```

#### E2E Test Examples
```typescript
// e2e/story-creation.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Story Creation', () => {
  test('creates a new story successfully', async ({ page }) => {
    // Navigate to home page
    await page.goto('/')

    // Login as demo user
    await page.click('[data-testid="demo-login"]')

    // Navigate to story creation
    await page.click('[data-testid="create-story-btn"]')

    // Fill story details
    await page.fill('[data-testid="story-title"]', 'My Test Story')
    await page.fill('[data-testid="story-description"]', 'This is a test story')
    await page.selectOption('[data-testid="story-type"]', 'Adventure')

    // Submit form
    await page.click('[data-testid="submit-story"]')

    // Verify success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="story-title"]')).toContainText('My Test Story')
  })

  test('validates required fields', async ({ page }) => {
    await page.goto('/create-story')

    // Try to submit without filling fields
    await page.click('[data-testid="submit-story"]')

    // Check for validation errors
    await expect(page.locator('[data-testid="title-error"]')).toContainText('Title is required')
    await expect(page.locator('[data-testid="description-error"]')).toContainText('Description is required')
  })
})
```

```typescript
// e2e/user-journey.spec.ts
import { test, expect } from '@playwright/test'

test.describe('User Journey', () => {
  test('complete user flow from registration to story viewing', async ({ page }) => {
    // Start from home page
    await page.goto('/')

    // Register new user
    await page.click('[data-testid="register-link"]')
    await page.fill('[data-testid="email-input"]', 'newuser@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="register-btn"]')

    // Complete profile
    await page.fill('[data-testid="first-name"]', 'John')
    await page.fill('[data-testid="last-name"]', 'Doe')
    await page.selectOption('[data-testid="age-group"]', '25-34')
    await page.click('[data-testid="complete-profile-btn"]')

    // Create first story
    await page.click('[data-testid="create-story-btn"]')
    await page.fill('[data-testid="story-title"]', 'My First Story')
    await page.fill('[data-testid="story-description"]', 'An amazing adventure')
    await page.click('[data-testid="submit-story"]')

    // View stories
    await page.goto('/stories')
    await expect(page.locator('[data-testid="story-card"]')).toBeVisible()
    await expect(page.locator('[data-testid="story-title"]')).toContainText('My First Story')

    // View story details
    await page.click('[data-testid="story-card"]')
    await expect(page.locator('[data-testid="story-detail-title"]')).toContainText('My First Story')
  })
})
```

## Backend Testing

### Setup

#### Test Dependencies
```xml
<!-- vtelltales_wa.Tests.csproj -->
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <IsPackable>false</IsPackable>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.5.0" />
    <PackageReference Include="xunit" Version="2.4.2" />
    <PackageReference Include="xunit.runner.visualstudio" Version="2.4.5" />
    <PackageReference Include="Moq" Version="4.18.4" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.InMemory" Version="8.0.0" />
    <PackageReference Include="Microsoft.AspNetCore.Mvc.Testing" Version="8.0.0" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="../VTellTales_WA.API/VTellTales_WA.API.csproj" />
  </ItemGroup>
</Project>
```

### Unit Testing

#### Controller Testing
```csharp
// Tests/Controllers/StoryControllerTests.cs
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;
using VTellTales_WA.API.Controllers;

public class StoryControllerTests
{
    private readonly Mock<IStoryService> _mockStoryService;
    private readonly StoryController _controller;

    public StoryControllerTests()
    {
        _mockStoryService = new Mock<IStoryService>();
        _controller = new StoryController(_mockStoryService.Object);
    }

    [Fact]
    public async Task GetStories_ReturnsOkResult_WithStories()
    {
        // Arrange
        var stories = new List<StoryDto>
        {
            new() { Id = 1, Title = "Test Story", Description = "Test Description" }
        };
        var paginatedResult = new PaginatedResult<StoryDto>
        {
            Data = stories,
            Page = 1,
            TotalPages = 1,
            TotalCount = 1
        };

        _mockStoryService
            .Setup(s => s.GetStoriesAsync(It.IsAny<int>(), It.IsAny<int>()))
            .ReturnsAsync(paginatedResult);

        // Act
        var result = await _controller.GetStories(1, 10);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedStories = Assert.IsType<PaginatedResult<StoryDto>>(okResult.Value);
        Assert.Single(returnedStories.Data);
        Assert.Equal("Test Story", returnedStories.Data.First().Title);
    }

    [Fact]
    public async Task CreateStory_ReturnsCreatedResult_WithValidStory()
    {
        // Arrange
        var createStoryDto = new CreateStoryDto
        {
            Title = "New Story",
            Description = "New Description"
        };

        var createdStory = new StoryDto
        {
            Id = 1,
            Title = createStoryDto.Title,
            Description = createStoryDto.Description
        };

        _mockStoryService
            .Setup(s => s.CreateStoryAsync(It.IsAny<CreateStoryDto>()))
            .ReturnsAsync(createdStory);

        // Act
        var result = await _controller.CreateStory(createStoryDto);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        var returnedStory = Assert.IsType<StoryDto>(createdResult.Value);
        Assert.Equal(createdStory.Title, returnedStory.Title);
    }

    [Fact]
    public async Task GetStory_ReturnsNotFound_WhenStoryDoesNotExist()
    {
        // Arrange
        _mockStoryService
            .Setup(s => s.GetStoryByIdAsync(It.IsAny<int>()))
            .ReturnsAsync((StoryDto?)null);

        // Act
        var result = await _controller.GetStory(999);

        // Assert
        Assert.IsType<NotFoundResult>(result.Result);
    }
}
```

#### Service Testing
```csharp
// Tests/Services/StoryServiceTests.cs
using Microsoft.EntityFrameworkCore;
using Xunit;

public class StoryServiceTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly StoryService _service;

    public StoryServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ApplicationDbContext(options);
        _service = new StoryService(_context);

        SeedData();
    }

    [Fact]
    public async Task GetStoriesAsync_ReturnsAllStories()
    {
        // Act
        var result = await _service.GetStoriesAsync(1, 10);

        // Assert
        Assert.Equal(2, result.TotalCount);
        Assert.Equal(2, result.Data.Count());
    }

    [Fact]
    public async Task CreateStoryAsync_CreatesNewStory()
    {
        // Arrange
        var createStoryDto = new CreateStoryDto
        {
            Title = "New Story",
            Description = "New Description",
            UserId = "user1",
            StoryTypeId = 1
        };

        // Act
        var result = await _service.CreateStoryAsync(createStoryDto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(createStoryDto.Title, result.Title);
        
        var storyInDb = await _context.UserStories.FindAsync(result.Id);
        Assert.NotNull(storyInDb);
        Assert.Equal(createStoryDto.Title, storyInDb.StoryTitle);
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public async Task CreateStoryAsync_ThrowsException_WhenTitleIsEmpty(string title)
    {
        // Arrange
        var createStoryDto = new CreateStoryDto
        {
            Title = title,
            Description = "Description",
            UserId = "user1",
            StoryTypeId = 1
        };

        // Act & Assert
        await Assert.ThrowsAsync<ArgumentException>(() => 
            _service.CreateStoryAsync(createStoryDto));
    }

    private void SeedData()
    {
        _context.StoryTypes.AddRange(
            new StoryType { Id = 1, Name = "Adventure" },
            new StoryType { Id = 2, Name = "Fantasy" }
        );

        _context.UserStories.AddRange(
            new UserStory
            {
                Id = 1,
                StoryTitle = "Story 1",
                StoryDesc = "Description 1",
                UserId = "user1",
                StoryTypeId = 1,
                CreatedDate = DateTime.UtcNow
            },
            new UserStory
            {
                Id = 2,
                StoryTitle = "Story 2",
                StoryDesc = "Description 2",
                UserId = "user2",
                StoryTypeId = 2,
                CreatedDate = DateTime.UtcNow
            }
        );

        _context.SaveChanges();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
```

### Integration Testing

#### API Integration Tests
```csharp
// Tests/Integration/StoryApiTests.cs
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Net;
using System.Net.Http.Json;
using Xunit;

public class StoryApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public StoryApiTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));

                if (descriptor != null)
                    services.Remove(descriptor);

                services.AddDbContext<ApplicationDbContext>(options =>
                {
                    options.UseInMemoryDatabase("TestDb");
                });
            });
        });

        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task GetStories_ReturnsSuccessAndCorrectContentType()
    {
        // Act
        var response = await _client.GetAsync("/storyapi/userstory/all");

        // Assert
        response.EnsureSuccessStatusCode();
        Assert.Equal("application/json; charset=utf-8", 
            response.Content.Headers.ContentType?.ToString());
    }

    [Fact]
    public async Task CreateStory_ReturnsCreated_WithValidData()
    {
        // Arrange
        var createStoryDto = new CreateStoryDto
        {
            Title = "Integration Test Story",
            Description = "Test Description",
            UserId = "test-user",
            StoryTypeId = 1
        };

        // Act
        var response = await _client.PostAsJsonAsync("/storyapi/userstory", createStoryDto);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        
        var story = await response.Content.ReadFromJsonAsync<StoryDto>();
        Assert.NotNull(story);
        Assert.Equal(createStoryDto.Title, story.Title);
    }

    [Fact]
    public async Task CreateStory_ReturnsBadRequest_WithInvalidData()
    {
        // Arrange
        var invalidStoryDto = new CreateStoryDto
        {
            Title = "", // Invalid empty title
            Description = "Description",
            UserId = "test-user",
            StoryTypeId = 1
        };

        // Act
        var response = await _client.PostAsJsonAsync("/storyapi/userstory", invalidStoryDto);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
```

### Test Data Management

#### Test Fixtures
```csharp
// Tests/Fixtures/DatabaseFixture.cs
public class DatabaseFixture : IDisposable
{
    public ApplicationDbContext Context { get; private set; }

    public DatabaseFixture()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: "TestDatabase")
            .Options;

        Context = new ApplicationDbContext(options);
        
        SeedDatabase();
    }

    private void SeedDatabase()
    {
        Context.StoryTypes.AddRange(
            new StoryType { Id = 1, Name = "Adventure" },
            new StoryType { Id = 2, Name = "Fantasy" },
            new StoryType { Id = 3, Name = "Science Fiction" }
        );

        Context.Users.AddRange(
            new User { Id = "user1", Email = "user1@example.com", FirstName = "John", LastName = "Doe" },
            new User { Id = "user2", Email = "user2@example.com", FirstName = "Jane", LastName = "Smith" }
        );

        Context.SaveChanges();
    }

    public void Dispose()
    {
        Context.Dispose();
    }
}

[CollectionDefinition("Database collection")]
public class DatabaseCollection : ICollectionFixture<DatabaseFixture>
{
}
```

## Test Execution

### Running Tests

#### Frontend Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test StoryCard.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="should render"
```

#### Backend Tests
```bash
# Run all tests
dotnet test

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"

# Run specific test class
dotnet test --filter "FullyQualifiedName~StoryControllerTests"

# Run tests matching pattern
dotnet test --filter "Name~CreateStory"

# Run tests in parallel
dotnet test --parallel
```

#### E2E Tests
```bash
# Install Playwright browsers
npx playwright install

# Run all E2E tests
npx playwright test

# Run tests in headed mode
npx playwright test --headed

# Run specific test file
npx playwright test story-creation.spec.ts

# Run tests with UI
npx playwright test --ui
```

### Continuous Integration

#### GitHub Actions
```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: 18
        cache: 'npm'
        cache-dependency-path: frontend/package-lock.json
    
    - name: Install dependencies
      run: cd frontend && npm ci
    
    - name: Run tests
      run: cd frontend && npm run test:coverage
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: frontend/coverage/lcov.info

  backend-tests:
    runs-on: ubuntu-latest
    
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: password
          MYSQL_DATABASE: VTellTales_Test_db
        ports:
          - 3306:3306
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3
    
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-dotnet@v3
      with:
        dotnet-version: 8.0.x
    
    - name: Restore dependencies
      run: dotnet restore backend/VTellTalesCore
    
    - name: Run tests
      run: dotnet test backend/VTellTalesCore --collect:"XPlat Code Coverage"
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: 18
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Install Playwright Browsers
      run: npx playwright install --with-deps
    
    - name: Run Playwright tests
      run: npx playwright test
    
    - uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
```

### Test Coverage

#### Coverage Goals
- **Unit Tests**: 80%+ line coverage
- **Integration Tests**: 70%+ API endpoint coverage
- **E2E Tests**: 90%+ critical user journey coverage

#### Coverage Reports
```bash
# Generate frontend coverage report
cd frontend && npm run test:coverage

# Generate backend coverage report
cd backend && dotnet test --collect:"XPlat Code Coverage"
reportgenerator -reports:"**/coverage.cobertura.xml" -targetdir:"coverage" -reporttypes:Html
```

### Test Best Practices

#### General Principles
1. **AAA Pattern**: Arrange, Act, Assert
2. **Single Responsibility**: Each test should verify one behavior
3. **Descriptive Names**: Test names should describe what is being tested
4. **Independent Tests**: Tests should not depend on each other
5. **Fast Execution**: Unit tests should run quickly

#### Mocking Guidelines
```typescript
// Good: Mock external dependencies
const mockApiService = {
  getStories: vi.fn().mockResolvedValue(mockStories),
  createStory: vi.fn().mockResolvedValue(mockStory)
}

// Avoid: Mocking internal implementation details
// Don't mock useState, useEffect, or component internals
```

#### Test Data
```typescript
// Use factory functions for test data
const createMockStory = (overrides: Partial<Story> = {}): Story => ({
  id: 1,
  title: 'Test Story',
  description: 'Test Description',
  createdDate: '2024-01-01',
  storyType: { id: 1, name: 'Adventure' },
  ...overrides
})
```

This testing guide provides comprehensive coverage of testing strategies and implementation for the vtelltales_wa application.