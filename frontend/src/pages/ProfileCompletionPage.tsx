import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { updateProfile, fetchProfile } from '../services/api'

interface ProfileCompletionData {
  firstName: string
  lastName: string
  // Future fields will be added here
}

interface LocationState {
  from?: {
    pathname: string
  }
}

export function ProfileCompletionPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState
  
  const [formData, setFormData] = useState<ProfileCompletionData>({
    firstName: 'John', // Demo placeholder data
    lastName: 'Doe'    // Demo placeholder data
  })
  const [errors, setErrors] = useState<Partial<ProfileCompletionData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load existing profile data for editing
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const userId = localStorage.getItem('userId')
        if (userId) {
          const profile = await fetchProfile(userId)
          if (profile?.name) {
            const nameParts = profile.name.split(' ')
            if (nameParts.length >= 2) {
              setFormData({
                firstName: nameParts[0] || 'John',
                lastName: nameParts.slice(1).join(' ') || 'Doe'
              })
            }
          }
        }
      } catch (error) {
        console.error('Error loading profile data:', error)
        // Keep default demo data if loading fails
      }
    }

    loadProfileData()
  }, [])

  const validateForm = (): boolean => {
    const newErrors: Partial<ProfileCompletionData> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof ProfileCompletionData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      // Get current user ID from localStorage or use demo fallback
      const userId = localStorage.getItem('userId') || 'demo-user-fallback'
      
      // Combine first and last name for the name field
      const fullName = `${formData.firstName} ${formData.lastName}`.trim()
      
      await updateProfile({
        userid: userId,
        name: fullName,
        // Add other fields as we expand
      })

      // Mark profile as completed
      localStorage.setItem('profileCompleted', 'true')
      
      // Redirect to the intended page or dashboard
      const redirectTo = state?.from?.pathname || '/dashboard'
      navigate(redirectTo, { replace: true })
    } catch (error) {
      console.error('Profile completion failed:', error)
      console.error('Profile completion failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">
            Please provide the required information to continue
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4 text-sm text-blue-700">
            <strong>Demo Note:</strong> We&apos;ve pre-filled some dummy data below. Please edit these fields with your actual information.
          </div>
          <div className="w-16 h-1 bg-gradient-to-r from-primary-blue to-accent-orange mx-auto mt-4 rounded-full"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* First Name - Required */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue/20 transition-colors ${
                errors.firstName 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-200 focus:border-primary-blue'
              }`}
              placeholder="Enter your first name"
              disabled={isSubmitting}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name - Required */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue/20 transition-colors ${
                errors.lastName 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-200 focus:border-primary-blue'
              }`}
              placeholder="Enter your last name"
              disabled={isSubmitting}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-primary-blue to-accent-orange text-white font-semibold py-3 px-6 rounded-xl hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary-blue/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Completing Profile...' : 'Complete Profile'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Fields marked with <span className="text-red-500">*</span> are required
          </p>
        </div>
      </div>
    </div>
  )
}
