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
import { ProtectedRoute } from './components/ProtectedRoute'
import { CreatorPage } from './pages/CreatorPage'
import { AboutPage } from './pages/AboutPage'
import { ContactPage } from './pages/ContactPage'
import { PrivacyPage } from './pages/PrivacyPage'
import StyleEditorPage from './pages/StyleEditorPage'

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth routes without main layout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Profile completion route - required before accessing main app */}
        <Route path="/complete-profile" element={<ProfileCompletionPage />} />
        
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
