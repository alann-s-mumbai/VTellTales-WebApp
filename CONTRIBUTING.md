# Contributing to VTellTales

Thank you for your interest in contributing to VTellTales! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues
- **Bug Reports**: Use the issue template and provide detailed reproduction steps
- **Feature Requests**: Clearly describe the proposed feature and its benefits
- **Security Issues**: Email security@vtelltales.com instead of creating public issues

### Development Process

1. **Fork & Clone**
   ```bash
   git clone https://github.com/yourusername/VTellTales-WebApp.git
   cd VTellTales-WebApp
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Development Setup**
   ```bash
   # Frontend
   cd frontend && npm install && npm run dev
   
   # Backend
   cd backend/VTellTalesCore/VTellTales_WA.API/VTellTales_WA.API
   dotnet run --urls "http://0.0.0.0:5000"
   ```

4. **Make Changes**
   - Follow coding standards
   - Add tests for new features
   - Update documentation

5. **Submit Pull Request**
   - Clear title and description
   - Reference related issues
   - Include screenshots for UI changes

## 📋 Code Standards

### Frontend (TypeScript/React)
```typescript
// Use functional components with hooks
export function ComponentName(): JSX.Element {
  const [state, setState] = useState<Type>(initialValue)
  
  return (
    <div className="component-styles">
      {/* JSX content */}
    </div>
  )
}
```

### Backend (C#/.NET)
```csharp
// Use PascalCase for public members
public class ServiceName : IServiceName
{
    private readonly IConfiguration _configuration;
    
    public ServiceName(IConfiguration configuration)
    {
        _configuration = configuration;
    }
    
    public async Task<Result> MethodName(Parameter param)
    {
        // Implementation
    }
}
```

### Database (SQL)
```sql
-- Use snake_case for table and column names
CREATE TABLE story_pages (
    page_id INT AUTO_INCREMENT PRIMARY KEY,
    story_id INT NOT NULL,
    page_content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🧪 Testing Requirements

### Frontend Testing
```bash
# Unit tests (Required for all components)
npm run test

# E2E tests (Required for critical user flows)
npm run test:e2e

# Code coverage (Minimum 80%)
npm run test:coverage
```

### Backend Testing
```bash
# Unit tests (Required for all business logic)
dotnet test

# Integration tests (Required for API endpoints)
dotnet test --filter Category=Integration
```

## 📝 Documentation

### Code Documentation
- **Functions**: Document all public methods with XML comments
- **Components**: Include JSDoc comments for React components
- **APIs**: Update OpenAPI/Swagger documentation

### User Documentation
- **Features**: Update README.md for new features
- **Setup**: Update installation instructions if dependencies change
- **API**: Document new endpoints with examples

## 🎨 UI/UX Guidelines

### Design System
- **Colors**: Use Tailwind CSS color palette
- **Typography**: Consistent font sizes and weights
- **Spacing**: Use Tailwind spacing units (4, 8, 16, 24px)
- **Components**: Follow existing component patterns

### Accessibility
- **WCAG 2.1**: Meet AA compliance standards
- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Color Contrast**: Minimum 4.5:1 ratio for text

## 🔒 Security Guidelines

### Data Protection
- **Input Validation**: Validate all user inputs
- **XSS Prevention**: Sanitize all user-generated content
- **SQL Injection**: Use parameterized queries
- **Authentication**: Secure JWT token handling

### Code Security
- **Secrets**: Never commit API keys or passwords
- **Dependencies**: Regular security audits with `npm audit`
- **HTTPS**: Enforce HTTPS in production
- **CORS**: Proper cross-origin configuration

## 🚀 Performance Standards

### Frontend Performance
- **Bundle Size**: Keep individual chunks under 250KB
- **Loading Time**: First Contentful Paint under 2 seconds
- **Lazy Loading**: Implement for routes and large components
- **Image Optimization**: Use WebP format and responsive images

### Backend Performance
- **API Response**: Target under 200ms for most endpoints
- **Database Queries**: Optimize with proper indexing
- **Caching**: Implement for frequently accessed data
- **Memory Usage**: Monitor and optimize memory consumption

## 🌐 Internationalization

### Translation Guidelines
- **Key Naming**: Use descriptive keys like `story.create.title`
- **Pluralization**: Handle singular/plural forms correctly
- **Context**: Provide translator context for ambiguous terms
- **Testing**: Test with pseudo-localization

### Supported Languages
- English (en) - Primary
- Spanish (es) - Planned
- French (fr) - Planned
- German (de) - Planned

## 📊 Release Process

### Version Numbering
- **Major**: Breaking changes (v2.0.0)
- **Minor**: New features (v1.1.0)
- **Patch**: Bug fixes (v1.0.1)

### Release Checklist
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Version numbers bumped
- [ ] Changelog updated
- [ ] Security review completed
- [ ] Performance benchmarks met

## 🏷️ Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Screenshots
Include before/after screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

## 🐛 Issue Template

```markdown
## Bug Description
Clear description of the issue

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g. macOS 12.0]
- Browser: [e.g. Chrome 95.0]
- Version: [e.g. v1.2.3]

## Additional Context
Screenshots, logs, etc.
```

## 👥 Community

### Communication Channels
- **GitHub Discussions**: General questions and ideas
- **Discord**: Real-time chat and support
- **Email**: security@vtelltales.com for security issues

### Code of Conduct
- Be respectful and inclusive
- No harassment or discrimination
- Constructive feedback only
- Help create a welcoming environment

## 🎖️ Recognition

### Contributors Hall of Fame
Contributors will be recognized in:
- README.md contributors section
- Release notes for major contributions
- Special badges on Discord
- Annual contributor awards

Thank you for helping make VTellTales amazing! 🌟