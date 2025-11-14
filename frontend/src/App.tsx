import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { MainLayout } from './layouts/MainLayout'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { StoryListPage } from './pages/StoryListPage'
import { StoryDetailsPage } from './pages/StoryDetailsPage'
import { ProfilePage } from './pages/ProfilePage'
import { ProfileCompletionPage } from './pages/ProfileCompletionPage'
import { VerifyEmailPage } from './pages/VerifyEmailPage'
import { CompleteProfilePage as CompleteProfilePageV2 } from './pages/CompleteProfilePageV2'
import { ProtectedRoute } from './components/ProtectedRoute'
import { CreatorPage } from './pages/CreatorPage'
import { AboutPage } from './pages/AboutPage'
import { ContactPage } from './pages/ContactPage'
import { PrivacyPage } from './pages/PrivacyPage'
import StyleEditorPage from './pages/StyleEditorPage'
import PWAManager from './components/PWAManager'
import { PWAService } from './services/PWAService'
import { authService } from './services/auth'
import { useEffect } from 'react'

function App() {
  useEffect(() => {
    // Initialize auth service and PWA
    const init = async () => {
      // Initialize auth service (restore session from backend)
      await authService.initialize();
      
      // Initialize PWA service
      const pwa = PWAService.getInstance();
      await pwa.init();
      pwa.setupInstallPrompt();
    };
    
    init();
  }, []);

  return (
    <Router>
      <PWAManager />
      <Routes>
        {/* Auth routes without main layout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Email verification route */}
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        
        {/* Profile completion routes - required before accessing main app */}
        <Route path="/complete-profile" element={<ProfileCompletionPage />} />
        <Route path="/complete-profile-v2" element={<CompleteProfilePageV2 />} />
        
        {/* Viewer routes without sidebar */}
        
        {/* Creator tools without sidebar */}
        <Route path="/creator" element={<CreatorPage />} />
        
        {/* Developer tools without layout */}
        <Route path="/style-editor" element={<StyleEditorPage />} />
        
        {/* Main app routes with sidebar - protected by profile completion */}
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/stories" element={<StoryListPage />} />
          <Route path="/story/:id" element={<StoryDetailsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
