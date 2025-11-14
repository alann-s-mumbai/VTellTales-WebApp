import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { authService } from '../services/auth'

export function VerifyEmailPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'pending'>('pending')
  const [message, setMessage] = useState('')
  const [resending, setResending] = useState(false)
  const token = searchParams.get('token')
  const user = authService.getUser()

  useEffect(() => {
    if (token) {
      verifyEmail(token)
    } else if (user?.IsEmailVerified) {
      navigate('/complete-profile')
    }
  }, [token, user, navigate])

  const verifyEmail = async (verificationToken: string) => {
    setStatus('verifying')
    try {
      const response = await fetch('/api/storyapi/StoryBook/VerifyEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ Token: verificationToken })
      })

      const result = await response.json()

      if (result.Success) {
        setStatus('success')
        setMessage('Your email has been verified successfully!')
        
        // Update user in auth service
        authService.setUser({ ...user, IsEmailVerified: true })
        
        // Redirect to profile completion after 2 seconds
        setTimeout(() => navigate('/complete-profile'), 2000)
      } else {
        setStatus('error')
        setMessage(result.Message || 'Verification failed. The link may be expired or invalid.')
      }
    } catch (error) {
      console.error('Email verification error:', error)
      setStatus('error')
      setMessage('An error occurred during verification. Please try again.')
    }
  }

  const resendVerificationEmail = async () => {
    if (!user?.Email) return

    setResending(true)
    try {
      const response = await fetch('/api/storyapi/StoryBook/ResendVerificationEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ Email: user.Email })
      })

      const result = await response.json()

      if (result.Success) {
        setMessage('Verification email sent! Please check your inbox.')
      } else {
        setMessage(result.Message || 'Failed to resend email. Please try again later.')
      }
    } catch (error) {
      console.error('Resend email error:', error)
      setMessage('An error occurred. Please try again.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center">
          {status === 'verifying' && (
            <>
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-10 h-10 border-4 border-primary-blue border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Your Email</h1>
              <p className="text-gray-600">Please wait while we verify your email address...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-gray-500">Redirecting to profile setup...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <button
                onClick={resendVerificationEmail}
                disabled={resending}
                className="w-full bg-gradient-to-r from-primary-blue to-primary-purple text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
              >
                {resending ? 'Sending...' : 'Resend Verification Email'}
              </button>
            </>
          )}

          {status === 'pending' && !token && (
            <>
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-12 h-12 text-yellow-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
              <p className="text-gray-600 mb-6">
                We've sent a verification email to <strong>{user?.Email}</strong>. 
                Please check your inbox and click the verification link to continue.
              </p>
              
              <div className="space-y-4">
                <button
                  onClick={resendVerificationEmail}
                  disabled={resending}
                  className="w-full bg-gradient-to-r from-primary-blue to-primary-purple text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-5 h-5 ${resending ? 'animate-spin' : ''}`} />
                  {resending ? 'Sending...' : 'Resend Verification Email'}
                </button>

                <button
                  onClick={() => navigate('/login')}
                  className="w-full text-gray-600 font-medium py-3 px-6 rounded-xl hover:bg-gray-50 transition-all"
                >
                  Back to Login
                </button>
              </div>

              {message && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
                  {message}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
