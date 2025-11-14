import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Facebook, Instagram, School, BookOpen, Award } from 'lucide-react'
import { authService } from '../services/auth'

interface CompleteProfileFormData {
  firstName: string
  lastName: string
  username: string
  dateOfBirth: string
  phoneNumber: string
  facebookAccount: string
  instagramAccount: string
  address: string
  occupation: string
  userType: 'regular' | 'educator'
  // Educator fields
  schoolName: string
  schoolAddress: string
  schoolPhone: string
  teachingSubjects: string
  yearsOfExperience: string
}

export function CompleteProfilePage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<CompleteProfileFormData>({
    firstName: '',
    lastName: '',
    username: '',
    dateOfBirth: '',
    phoneNumber: '',
    facebookAccount: '',
    instagramAccount: '',
    address: '',
    occupation: '',
    userType: 'regular',
    schoolName: '',
    schoolAddress: '',
    schoolPhone: '',
    teachingSubjects: '',
    yearsOfExperience: ''
  })
  const [errors, setErrors] = useState<Partial<CompleteProfileFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [checkingUsername, setCheckingUsername] = useState(false)

  const user = authService.getUser()

  useEffect(() => {
    if (!user || !user.IsEmailVerified) {
      navigate('/verify-email')
      return
    }

    // Pre-fill email and name if available
    if (user.FirstName) setFormData(prev => ({ ...prev, firstName: user.FirstName || '' }))
    if (user.LastName) setFormData(prev => ({ ...prev, lastName: user.LastName || '' }))
    if (user.UserType) setFormData(prev => ({ ...prev, userType: user.UserType as 'regular' | 'educator' }))
  }, [user, navigate])

  const checkUsernameAvailability = async (username: string) => {
    if (username.length < 3) {
      setUsernameAvailable(null)
      return
    }

    setCheckingUsername(true)
    try {
      const response = await fetch(`/api/storyapi/StoryBook/CheckUsername/${encodeURIComponent(username)}`, {
        credentials: 'include'
      })
      const data = await response.json()
      setUsernameAvailable(data.Available)
    } catch (error) {
      console.error('Error checking username:', error)
    } finally {
      setCheckingUsername(false)
    }
  }

  const handleInputChange = (field: keyof CompleteProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }

    // Check username availability
    if (field === 'username') {
      const debounceTimer = setTimeout(() => checkUsernameAvailability(value), 500)
      return () => clearTimeout(debounceTimer)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<CompleteProfileFormData> = {}

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    } else if (!usernameAvailable) {
      newErrors.username = 'Username is already taken'
    }

    // Educator validation
    if (formData.userType === 'educator') {
      if (!formData.schoolName.trim()) newErrors.schoolName = 'School name is required for educators'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || isSubmitting) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch('/api/storyapi/StoryBook/CompleteProfile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.Success) {
        // Update auth service with complete profile
        authService.setUser({ ...user, ...result.User, IsProfileComplete: true })
        navigate('/dashboard')
      } else {
        setSubmitError(result.Message || 'Failed to complete profile')
      }
    } catch (error) {
      console.error('Profile completion error:', error)
      setSubmitError('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-blue to-primary-purple rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
            <p className="text-gray-600">
              Let's set up your account. Fields marked with * are required.
            </p>
          </div>

          {submitError && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* User Type Selection */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                I am a *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleInputChange('userType', 'regular')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    formData.userType === 'regular'
                      ? 'border-primary-blue bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <User className="w-8 h-8 mx-auto mb-3 text-primary-blue" />
                  <div className="font-semibold text-gray-900">Regular User</div>
                  <div className="text-sm text-gray-600 mt-1">I want to read and create stories</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleInputChange('userType', 'educator')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    formData.userType === 'educator'
                      ? 'border-primary-blue bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <School className="w-8 h-8 mx-auto mb-3 text-primary-blue" />
                  <div className="font-semibold text-gray-900">Educator</div>
                  <div className="text-sm text-gray-600 mt-1">I'm a teacher or school professional</div>
                </button>
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5" />
                Basic Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.firstName ? 'border-red-300' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-primary-blue`}
                    placeholder="John"
                  />
                  {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.lastName ? 'border-red-300' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-primary-blue`}
                    placeholder="Doe"
                  />
                  {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={user?.Email || ''}
                    disabled
                    className="flex-1 bg-transparent border-none outline-none text-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.username ? 'border-red-300' : 
                      usernameAvailable === true ? 'border-green-300' :
                      usernameAvailable === false ? 'border-red-300' :
                      'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-primary-blue`}
                    placeholder="johndoe123"
                  />
                  {checkingUsername && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-primary-blue border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
                {usernameAvailable === true && (
                  <p className="mt-1 text-sm text-green-600">✓ Username is available</p>
                )}
                {usernameAvailable === false && !errors.username && (
                  <p className="mt-1 text-sm text-red-600">✗ Username is already taken</p>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Additional Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-blue"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  rows={2}
                  placeholder="123 Main St, City, State, ZIP"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Briefcase className="w-4 h-4 inline mr-1" />
                  Occupation
                </label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => handleInputChange('occupation', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  placeholder="Software Engineer, Teacher, Student, etc."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Facebook className="w-4 h-4 inline mr-1" />
                    Facebook Profile
                  </label>
                  <input
                    type="url"
                    value={formData.facebookAccount}
                    onChange={(e) => handleInputChange('facebookAccount', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-blue"
                    placeholder="https://facebook.com/username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Instagram className="w-4 h-4 inline mr-1" />
                    Instagram Profile
                  </label>
                  <input
                    type="url"
                    value={formData.instagramAccount}
                    onChange={(e) => handleInputChange('instagramAccount', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-blue"
                    placeholder="https://instagram.com/username"
                  />
                </div>
              </div>
            </div>

            {/* Educator-specific fields */}
            {formData.userType === 'educator' && (
              <div className="space-y-4 p-6 bg-blue-50 rounded-2xl border-2 border-blue-100">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <School className="w-5 h-5 text-primary-blue" />
                  Educational Institution Details
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    School Name *
                  </label>
                  <input
                    type="text"
                    value={formData.schoolName}
                    onChange={(e) => handleInputChange('schoolName', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.schoolName ? 'border-red-300' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-primary-blue bg-white`}
                    placeholder="Riverside High School"
                  />
                  {errors.schoolName && <p className="mt-1 text-sm text-red-600">{errors.schoolName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    School Address
                  </label>
                  <textarea
                    value={formData.schoolAddress}
                    onChange={(e) => handleInputChange('schoolAddress', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-blue bg-white"
                    rows={2}
                    placeholder="123 School St, City, State, ZIP"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    School Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.schoolPhone}
                    onChange={(e) => handleInputChange('schoolPhone', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-blue bg-white"
                    placeholder="+1 (555) 987-6543"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <BookOpen className="w-4 h-4 inline mr-1" />
                    Teaching Subjects
                  </label>
                  <input
                    type="text"
                    value={formData.teachingSubjects}
                    onChange={(e) => handleInputChange('teachingSubjects', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-blue bg-white"
                    placeholder="English, Mathematics, Science"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Award className="w-4 h-4 inline mr-1" />
                    Years of Experience
                  </label>
                  <input
                    type="text"
                    value={formData.yearsOfExperience}
                    onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-blue bg-white"
                    placeholder="5 years"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting || usernameAvailable === false}
                className="flex-1 bg-gradient-to-r from-primary-blue to-primary-purple text-white font-semibold py-4 px-6 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Completing Profile...
                  </span>
                ) : (
                  'Complete Profile & Continue'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
