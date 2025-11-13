# VTellTales - Interactive Storytelling WebApp

![VTellTales Logo](https://vtelltales.com/logo.png)

## 🌟 Overview

VTellTales is a comprehensive interactive storytelling web application designed for children and educators. Create, share, and explore engaging digital stories with interactive elements, multimedia content, and social features.

## 🚀 Features

### Core Functionality
- **📖 Story Creation**: Rich text editor with multimedia support
- **🎨 Interactive Elements**: Branching storylines and user choices
- **👥 Social Features**: Story sharing, comments, and user profiles
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile
- **🔐 User Authentication**: Secure login and profile management
- **⭐ Story Rating**: Like, favorite, and comment system

### Technical Highlights
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: .NET Core 8.0 Web API
- **Database**: MariaDB/MySQL
- **Authentication**: Firebase Auth + JWT
- **Deployment**: Automated scripts for production

## 📦 Project Structure

```
VTellTales-WebApp/
├── frontend/                    # React TypeScript SPA
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/             # Route-based page components
│   │   ├── services/          # API client and utilities
│   │   ├── contexts/          # React context providers
│   │   └── types/             # TypeScript type definitions
│   ├── dist/                  # Production build output
│   └── package.json
├── backend/                     # .NET Core Web API
│   └── VTellTalesCore/
│       ├── VTellTales_WA.API/ # Main API project
│       ├── VTellTales_WA.BL/  # Business Logic layer
│       ├── VTellTales_WA.DL/  # Data Access layer
│       └── VTellTales_WA.DTO/ # Data Transfer Objects
├── manual-deployment/           # Production deployment files
│   ├── frontend-files/        # Built React app
│   └── backend-files/         # Compiled .NET binaries
└── docs/                       # Project documentation
```

## 🛠️ Development Setup

### Prerequisites
- **Node.js** 18+ and npm
- **.NET 8.0** SDK
- **MariaDB/MySQL** 8.0+
- **Git** for version control

### Quick Start

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd VTellTales-WebApp
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   npm run dev
   ```

3. **Backend Setup**
   ```bash
   cd backend/VTellTalesCore/VTellTales_WA.API/VTellTales_WA.API
   dotnet restore
   dotnet run --urls "http://0.0.0.0:5000"
   ```

4. **Database Setup**
   ```sql
   CREATE DATABASE VTellTales_Web_db;
   -- Run database migration scripts
   ```

### Development URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/swagger

## 🌐 Production Deployment

### Automated Deployment
```bash
# Configure SSH access first
./test-deployment.sh    # Pre-flight checks
./deploy-production.sh  # Full production deployment
```

### Manual Deployment
```bash
# Build applications
cd frontend && npm run build
cd backend && dotnet publish -c Release

# Upload to server
scp -r dist/* user@server:/var/www/webapp.vtelltales.com/html/
scp -r publish/* user@server:/var/www/webapi.vtelltales.com/app/
```

### Production URLs
- **Frontend**: https://webapp.vtelltales.com
- **Backend API**: https://webapp.vtelltales.com/api
- **Database**: VTellTales_Web_db on production server

## 📖 API Documentation

### Core Endpoints

#### Stories
- `GET /storyapi/StoryBook/GetTopStory/{userId}` - Featured stories
- `GET /storyapi/StoryBook/GetAllStoriesbypage/{userId}/{page}/{limit}` - Paginated stories
- `POST /storyapi/StoryBook/AddStory` - Create new story
- `GET /storyapi/StoryBook/story/{userId}/{storyId}` - Story details

#### User Management
- `POST /storyapi/StoryBook/LoginUser` - User authentication
- `GET /storyapi/StoryBook/viewprofile/{userId}` - User profile
- `POST /storyapi/StoryBook/updateProfile` - Update profile

#### Story Interaction
- `POST /storyapi/StoryBook/AddStoryLike` - Like story
- `GET /storyapi/StoryBook/GetStoryComments/{storyId}` - Story comments
- `POST /storyapi/StoryBook/AddStoryComment` - Add comment

## 🏗️ Architecture

### Frontend Architecture
```
React Components
     ↓
Context Providers (Auth, Theme)
     ↓
API Services (Axios/Fetch)
     ↓
Backend APIs
```

### Backend Architecture
```
Controllers (API Layer)
     ↓
Business Logic (BL)
     ↓
Data Access (DL)
     ↓
Database (MariaDB)
```

### Database Schema
- `usertbl` - User accounts and profiles
- `userstory` - Story metadata and content
- `storypages` - Individual story pages
- `storyview` - Story view analytics
- `storylike` - Story likes and favorites
- `storycomments` - User comments

## 🔧 Configuration

### Environment Variables

**Frontend (.env)**
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_firebase_key
```

**Backend (appsettings.json)**
```json
### Database Configuration

The application uses a MySQL database hosted on a Contabo server:

```json
{
  "ConnectionSettings": {
    "StoryBookDB": "Server=94.136.189.179;Database=VTellTales_Web_db;Uid=lhzpvxok_admin;Pwd=vTT@2021#;SslMode=None;AllowPublicKeyRetrieval=true;"
  }
}
```

**Database Details:**
- **Host**: 94.136.189.179 (Contabo VPS)
- **Database**: VTellTales_Web_db
- **User**: lhzpvxok_admin
- **Port**: 3306

> **Note**: The same database is used for both development and production environments for data consistency.
```

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm run test         # Unit tests
npm run test:e2e     # End-to-end tests
npm run lint         # Code linting
```

### Backend Testing
```bash
cd backend/VTellTalesCore
dotnet test          # Unit tests
dotnet test --logger trx --collect:"XPlat Code Coverage"
```

## 📱 Features Deep Dive

### Story Creation System
- **Rich Text Editor**: WYSIWYG editor with formatting options
- **Media Upload**: Images, audio, and video support
- **Story Templating**: Pre-built templates for different age groups
- **Publishing Workflow**: Draft → Review → Publish states

### User Profile System
- **Mandatory Completion**: Users must complete profile before story access
- **Social Features**: Following, followers, and friend connections
- **Activity Tracking**: Story views, likes, and engagement metrics
- **Content Management**: Created stories, favorites, and reading history

### Administrative Features
- **Content Moderation**: Review and approve user-generated content
- **User Management**: Account administration and user support
- **Analytics Dashboard**: Usage metrics and engagement statistics
- **System Configuration**: Application settings and feature toggles

## 🔒 Security

### Authentication & Authorization
- **JWT Tokens**: Secure API authentication
- **Firebase Auth**: Social login integration
- **Role-Based Access**: User, Creator, Admin roles
- **Input Validation**: XSS and injection prevention

### Data Protection
- **Encrypted Storage**: Sensitive data encryption
- **CORS Configuration**: Cross-origin request security
- **Rate Limiting**: API abuse prevention
- **SSL/TLS**: HTTPS enforcement in production

## 🚀 Performance

### Frontend Optimizations
- **Code Splitting**: Lazy loading of routes and components
- **Image Optimization**: WebP format and responsive images
- **Caching Strategy**: Service worker for offline capability
- **Bundle Analysis**: Webpack bundle optimization

### Backend Optimizations
- **Database Indexing**: Query performance optimization
- **Caching Layer**: Redis for frequently accessed data
- **Connection Pooling**: Efficient database connections
- **API Response Compression**: Gzip compression enabled

## 🌍 Localization

### Multi-language Support
- **i18n Framework**: React i18next integration
- **Language Files**: JSON-based translation files
- **Dynamic Loading**: Language switching without reload
- **RTL Support**: Right-to-left language compatibility

## 📊 Monitoring & Analytics

### Application Monitoring
- **Error Tracking**: Sentry integration for error reporting
- **Performance Monitoring**: Application performance metrics
- **User Analytics**: Google Analytics for user behavior
- **Health Checks**: API endpoint monitoring

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Code Standards
- **Frontend**: ESLint + Prettier for TypeScript/React
- **Backend**: .NET coding standards and StyleCop
- **Database**: Naming conventions and migration scripts
- **Testing**: Minimum 80% code coverage requirement

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Lead Developer**: VTellTales Development Team
- **UI/UX Designer**: Design Team
- **DevOps Engineer**: Infrastructure Team
- **QA Engineer**: Quality Assurance Team

## 📞 Support

### Getting Help
- **Documentation**: Check this README and docs/ folder
- **Issues**: Report bugs via GitHub Issues
- **Community**: Join our Discord server
- **Email**: support@vtelltales.com

### Resources
- **Demo**: https://demo.vtelltales.com
- **Documentation**: https://docs.vtelltales.com
- **API Reference**: https://api-docs.vtelltales.com
- **Community Forum**: https://community.vtelltales.com

---

## 🎯 Roadmap

### Version 2.0 Features
- [ ] **Mobile Apps**: React Native iOS/Android apps
- [ ] **AI Integration**: Story generation assistance
- [ ] **Video Stories**: Interactive video storytelling
- [ ] **Collaborative Editing**: Real-time story collaboration
- [ ] **Marketplace**: Premium story templates and assets

### Performance Goals
- [ ] **Load Time**: < 2 seconds initial page load
- [ ] **API Response**: < 200ms average response time
- [ ] **Uptime**: 99.9% service availability
- [ ] **Scalability**: Support 10,000+ concurrent users

---

**🌟 Thank you for contributing to VTellTales - where every story comes to life! 🌟**