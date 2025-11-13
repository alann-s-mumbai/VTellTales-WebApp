import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { checkProfileCompletion, DEFAULT_USER_ID } from '../services/api'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isProfileComplete, setIsProfileComplete] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const checkProfile = async () => {
      try {
        // Get current user ID - in a real app this would come from auth context
        const userId = localStorage.getItem('userId') || DEFAULT_USER_ID
        
        // Check if profile is marked as completed in localStorage (for demo)
        const profileCompleted = localStorage.getItem('profileCompleted') === 'true'
        if (profileCompleted) {
          setIsProfileComplete(true)
          setIsLoading(false)
          return
        }

        // Check profile completion via API
        const isComplete = await checkProfileCompletion(userId)
        setIsProfileComplete(isComplete)
        
        if (isComplete) {
          localStorage.setItem('profileCompleted', 'true')
        }
      } catch (error) {
        console.error('Error checking profile:', error)
        setIsProfileComplete(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkProfile()
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

  if (!isProfileComplete) {
    // Redirect to profile completion, preserving the intended destination
    return <Navigate to="/complete-profile" state={{ from: location }} replace />
  }

  return <>{children}</>
}