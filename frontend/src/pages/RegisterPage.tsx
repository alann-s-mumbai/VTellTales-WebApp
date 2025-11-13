import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import { registerWithEmail, type AuthResponse } from '../services/api'

export function RegisterPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [authFeedback, setAuthFeedback] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password || !name) {
      setAuthError('Please fill in all fields')
      return
    }

    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters long')
      return
    }
    
    setAuthFeedback('')
    setAuthError('')
    setAuthLoading(true)
    
    try {
      const result: AuthResponse = await registerWithEmail({ email, password, name })
      
      if (result.success && result.user) {
        // Store user session
        localStorage.setItem('vtelltales_user', JSON.stringify(result.user))
        if (result.token) {
          localStorage.setItem('vtelltales_token', result.token)
        }
        
        // Dispatch event to update sidebar
        window.dispatchEvent(new Event('userStateChanged'))
        
        setAuthFeedback(`Welcome to VtellTales, ${result.user.name || result.user.email}!`)
        
        // Navigate to dashboard after brief delay
        setTimeout(() => {
          navigate('/dashboard')
        }, 2000)
      } else {
        setAuthError(result.message || 'Registration failed. Please try again.')
      }
    } catch (error) {
      console.error('Registration error:', error)
      setAuthError('Registration failed. Please try again later.')
    } finally {
      setAuthLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary-yellow via-accent-orange to-accent-orange p-3 rounded-2xl shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3l14 9-14 9V3z" />
              </svg>
            </div>
            <span className="font-bold text-2xl text-gray-900">VtellTales: WebApp</span>
          </Link>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8 space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Join VtellTales!</h1>
            <p className="text-gray-600">Create your account and start your storytelling journey</p>
            
            {authFeedback && (
              <p className="text-sm text-emerald-600">{authFeedback}</p>
            )}
            {authError && (
              <p className="text-sm text-red-600">{authError}</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
                  placeholder="Create a password (min. 6 characters)"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters long</p>
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                className="h-4 w-4 text-primary-yellow focus:ring-primary-yellow border-gray-300 rounded mt-0.5"
                required
              />
              <span className="ml-2 text-sm text-gray-600">
                I agree to the{' '}
                <Link to="/privacy" className="text-primary-blue hover:text-primary-blue/80 underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary-blue hover:text-primary-blue/80 underline">
                  Privacy Policy
                </Link>
              </span>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="btn btn-primary w-full py-3 text-lg font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {authLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary-blue hover:text-primary-blue/80">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}