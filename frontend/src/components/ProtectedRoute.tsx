import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { checkProfileCompletion } from '../services/api'
import { authService } from '../services/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isProfileComplete, setIsProfileComplete] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = authService.getUser()
        
        if (!user) {
          setIsAuthenticated(false)
          setIsProfileComplete(false)
          setIsLoading(false)
          return
        }

        setIsAuthenticated(true)
        
        const userId = user.id || user.Id
        if (!userId) {
          setIsProfileComplete(false)
          setIsLoading(false)
          return
        }

        const isComplete = await checkProfileCompletion(userId)
        setIsProfileComplete(isComplete)
      } catch (error) {
        console.error('Error checking profile:', error)
        setIsAuthenticated(false)
        setIsProfileComplete(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Subscribe to auth state changes
    const unsubscribe = authService.subscribe((state) => {
      if (!state.isAuthenticated) {
        setIsAuthenticated(false)
        setIsProfileComplete(false)
      }
    })

    return unsubscribe
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Checking profile...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!isProfileComplete) {
    // Redirect to profile completion, preserving the intended destination
    return <Navigate to="/complete-profile" state={{ from: location }} replace />
  }

  return <>{children}</>
}
