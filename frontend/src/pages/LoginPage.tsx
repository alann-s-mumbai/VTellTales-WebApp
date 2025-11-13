import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { signInWithGoogle } from '../services/firebase'
import { validateFirebaseToken, loginWithEmail, checkProfileCompletion, type AuthResponse } from '../services/api'

export function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authFeedback, setAuthFeedback] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [loginMethod, setLoginMethod] = useState<'email' | 'google' | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setAuthError('Please enter both email and password')
      return
    }
    
    setAuthFeedback('')
    setAuthError('')
    setAuthLoading(true)
    setLoginMethod('email')
    
    try {
      const result: AuthResponse = await loginWithEmail({ email, password })
      
      if (result.success && result.user) {
        // Store user session
        localStorage.setItem('vtelltales_user', JSON.stringify(result.user))
        localStorage.setItem('userId', result.user.id) // Store user ID for profile checking
        if (result.token) {
          localStorage.setItem('vtelltales_token', result.token)
        }
        
        // Dispatch event to update sidebar
        window.dispatchEvent(new Event('userStateChanged'))
        
        setAuthFeedback(`Welcome back, ${result.user.name || result.user.email}!`)
        
        // Check if profile is complete
        try {
          const isProfileComplete = await checkProfileCompletion(result.user.id)
          
          if (!isProfileComplete) {
            // Profile incomplete - redirect to completion page
            setTimeout(() => {
              navigate('/complete-profile')
            }, 1500)
          } else {
            // Profile complete - mark as completed and navigate to dashboard
            localStorage.setItem('profileCompleted', 'true')
            setTimeout(() => {
              navigate('/dashboard')
            }, 1500)
          }
        } catch (error) {
          console.error('Error checking profile completion:', error)
          // If error checking profile, assume incomplete and redirect to completion
          setTimeout(() => {
            navigate('/complete-profile')
          }, 1500)
        }
      } else {
        setAuthError(result.message || 'Login failed. Please check your credentials.')
      }
    } catch (error) {
      console.error('Login error:', error)
      setAuthError('Login failed. Please check your email and password.')
    } finally {
      setAuthLoading(false)
      setLoginMethod(null)
    }
  }

  const handleGoogleLogin = async () => {
    setAuthFeedback('')
    setAuthError('')
    setAuthLoading(true)
    setLoginMethod('google')
    
    try {
      const credential = await signInWithGoogle()
      
      if (!credential) {
        setAuthError('Google sign-in is not available. Please use email/password login or contact support to enable Google authentication.')
        return
      }
      
      const idToken = await credential.user.getIdToken()
      const result = await validateFirebaseToken(idToken)
      
      if (result.success) {
        // Store user session
        const userData = {
          id: result.uid || 'firebase_user',
          email: result.email || credential.user.email || '',
          name: result.name || credential.user.displayName || 'Firebase User'
        }
        
        localStorage.setItem('vtelltales_user', JSON.stringify(userData))
        localStorage.setItem('userId', userData.id) // Store user ID for profile checking
        localStorage.setItem('vtelltales_firebase_token', idToken)
        
        // Dispatch event to update sidebar
        window.dispatchEvent(new Event('userStateChanged'))
        
        setAuthFeedback(`Welcome, ${userData.name}!`)
        
        // Check if profile is complete
        try {
          const isProfileComplete = await checkProfileCompletion(userData.id)
          
          if (!isProfileComplete) {
            // Profile incomplete - redirect to completion page
            setTimeout(() => {
              navigate('/complete-profile')
            }, 1500)
          } else {
            // Profile complete - mark as completed and navigate to dashboard
            localStorage.setItem('profileCompleted', 'true')
            setTimeout(() => {
              navigate('/dashboard')
            }, 1500)
          }
        } catch (error) {
          console.error('Error checking profile completion:', error)
          // If error checking profile, assume incomplete and redirect to completion
          setTimeout(() => {
            navigate('/complete-profile')
          }, 1500)
        }
      } else {
        setAuthError(result.message || 'Unable to validate Firebase token.')
      }
    } catch (err: any) {
      console.error('Google sign in error:', err)
      
      // Handle specific Firebase errors
      if (err?.code === 'auth/api-key-not-valid') {
        setAuthError('Google sign-in is not configured. Please use email/password login.')
      } else if (err?.code === 'auth/popup-closed-by-user') {
        setAuthError('Google sign-in was cancelled.')
      } else if (err?.code === 'auth/popup-blocked') {
        setAuthError('Please allow popups and try again.')
      } else {
        setAuthError('Google sign-in failed. Please use email/password login or try again later.')
      }
    } finally {
      setAuthLoading(false)
      setLoginMethod(null)
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

        {/* Login Form */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8 space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Welcome Back!</h1>
            <p className="text-gray-600">Sign in to continue your storytelling journey</p>
            
            {authFeedback && (
              <p className="text-sm text-emerald-600">{authFeedback}</p>
            )}
            {authError && (
              <p className="text-sm text-red-600">{authError}</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                  placeholder="Enter your password"
                  required
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
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-yellow focus:ring-primary-yellow border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-primary-blue hover:text-primary-blue/80">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="btn btn-primary w-full py-3 text-lg font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {authLoading && loginMethod === 'email' ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={handleGoogleLogin}
                disabled={authLoading}
                className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {authLoading && loginMethod === 'google' ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span className="ml-2">Google</span>
                  </>
                )}
              </button>

              <button className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-500 hover:bg-gray-50">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="ml-2">Facebook</span>
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="font-medium text-primary-blue hover:text-primary-blue/80">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
