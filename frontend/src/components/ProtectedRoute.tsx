import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { checkProfileCompletion } from '../services/api'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isProfileComplete, setIsProfileComplete] = useState(false)
  const location = useLocation()
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null

  useEffect(() => {
    const checkProfile = async () => {
      try {
        if (!userId) {
          setIsProfileComplete(false)
          setIsLoading(false)
          return
        }

        const isComplete = await checkProfileCompletion(userId)
        setIsProfileComplete(isComplete)
      } catch (error) {
        console.error('Error checking profile:', error)
        setIsProfileComplete(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkProfile()
  }, [userId])

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

  if (!userId) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!isProfileComplete) {
    // Redirect to profile completion, preserving the intended destination
    return <Navigate to="/complete-profile" state={{ from: location }} replace />
  }

  return <>{children}</>
}
