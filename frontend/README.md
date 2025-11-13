# VTellTales Frontend

A modern React application for the VTellTales interactive storytelling platform, built with TypeScript, Vite, and Tailwind CSS.

## 🚀 Features

- **Modern React 18** with TypeScript for type safety
- **Vite** for lightning-fast development and optimized builds
- **Tailwind CSS** with custom VTellTales design system
- **React Router v6** for client-side routing
- **Lucide React** icons for consistent iconography
- **Framer Motion** for smooth animations
- **Mobile-first responsive design**

## 🎨 Pages Implemented

### Main Application (with Sidebar)
- **Home Page** - Hero section, categories, featured stories
- **Story List** - Browse and search stories
- **Story Details** - Individual story view
- **Profile** - User profile and stats
- **About** - About VTellTales
- **Contact** - Contact form
- **Privacy** - Privacy policy

### Standalone Pages (no sidebar)
- **Login** - Authentication with social login
- **Register** - User registration
- **Creator** - Canva-style story creator
- **Viewers** - Age-specific story viewers (3-5, 5-7, 7-10)

## 🛠️ Development

### Install Dependencies
```bash
npm install
```

### Configure backend API
Copy `frontend/.env.example` to `frontend/.env` (or set `VITE_API_BASE_URL`) to point at the .NET API before running the dev server.

### Configure Firebase
Add your Firebase web credentials to the same `.env` file by filling in `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, and `VITE_FIREBASE_APP_ID`.

### Start Development Server
```bash
npm run dev
```

The app will be available at:
- **Local**: http://localhost:3000
- **Network**: http://0.0.0.0:3000 (accessible from other devices on your network)

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🎨 Design System

The application uses a custom Tailwind CSS configuration based on VTellTales brand colors:

### Brand Colors
- **Primary Yellow**: #F3D657
- **Primary Blue**: #5BCCF6  
- **Accent Orange**: #FF6B35
- **Accent Green**: #4CAF50
- **Accent Red**: #E53E3E
- **Accent Purple**: #8B5CF6

### Key Components
- Custom button styles (`btn`, `btn-primary`, `btn-secondary`)
- Sidebar navigation components
- Card layouts
- Animated elements with custom keyframes

## 📱 Responsive Design

The application is optimized for:
- **Mobile phones** (320px+)
- **Tablets** (768px+) 
- **Desktop** (1024px+)
- **Large screens** (1280px+)

### Mobile Features
- Collapsible mobile header
- Touch-friendly navigation
- Optimized layouts for small screens

## 🔧 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Sidebar.tsx     # Desktop sidebar navigation
│   └── MobileHeader.tsx # Mobile header with menu
├── layouts/             # Page layout components
│   └── MainLayout.tsx  # Main app layout with sidebar
├── pages/              # Route-based page components
│   ├── HomePage.tsx    # Landing page
│   ├── LoginPage.tsx   # Authentication
│   └── ...
├── utils/              # Utility functions
│   └── cn.ts          # Class name utility
├── App.tsx            # Main app with routing
├── main.tsx           # App entry point
└── index.css          # Global styles and Tailwind
```

## 🚀 Next Steps

1. **Backend Integration** - Connect to .NET 8 Web API
2. **Authentication** - Implement JWT token management
3. **Story Creator** - Build the full Canva-style editor
4. **Story Viewers** - Implement age-appropriate viewing experiences
5. **Real-time Features** - Add WebSocket support for live collaboration
6. **Testing** - Add unit and integration tests
7. **Performance** - Optimize for production deployment

## 🔗 API Integration

The frontend is designed to integrate with the VTellTales .NET 8 Web API. Update the API base URL in your environment variables:

```typescript
// Future API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000'
```

## 🌟 iMac Optimizations

This project is optimized for macOS development:
- Uses `0.0.0.0` host for network access
- Optimized for Retina displays
- macOS-friendly font stack
- Touch Bar support (where applicable)
- Hot module replacement for fast development
