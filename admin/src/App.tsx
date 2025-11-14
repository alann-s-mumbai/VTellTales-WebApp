import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getApiUrl } from './config'
import Setup from './pages/Setup'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import UserManagement from './pages/UserManagement'
import SmtpSettings from './pages/SmtpSettings'
import AdminManagement from './pages/AdminManagement'
import StoryModeration from './pages/StoryModeration'
import Analytics from './pages/Analytics'
import EmailTemplates from './pages/EmailTemplates'
import EducatorApproval from './pages/EducatorApproval'

function App() {
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    checkSetupStatus()
    checkAuthStatus()
  }, [])

  const checkSetupStatus = async () => {
    try {
      const response = await fetch(getApiUrl('/api/admin/requires-setup'))
      const data = await response.json()
      setNeedsSetup(data.requiresSetup)
    } catch (error) {
      console.error('Failed to check setup status:', error)
      setNeedsSetup(false)
    }
  }

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(getApiUrl('/api/admin/current'))
      setIsAuthenticated(response.ok)
    } catch (error) {
      setIsAuthenticated(false)
    }
  }

  if (needsSetup === null || isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <BrowserRouter basename="/admin">
      <Routes>
        <Route 
          path="/setup" 
          element={needsSetup ? <Setup onSetupComplete={() => setNeedsSetup(false)} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login onLoginSuccess={() => setIsAuthenticated(true)} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/" 
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/users" 
          element={isAuthenticated ? <UserManagement /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/smtp" 
          element={isAuthenticated ? <SmtpSettings /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/admins" 
          element={isAuthenticated ? <AdminManagement /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/stories" 
          element={isAuthenticated ? <StoryModeration /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/analytics" 
          element={isAuthenticated ? <Analytics /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/email-templates" 
          element={isAuthenticated ? <EmailTemplates /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/educators" 
          element={isAuthenticated ? <EducatorApproval /> : <Navigate to="/login" />} 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
