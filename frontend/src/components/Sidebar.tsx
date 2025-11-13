import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { 
  Home, 
  Search, 
  User, 
  Info, 
  Mail, 
  Shield,
  Play,
  LogIn,
  LogOut
} from 'lucide-react'
import { cn } from '../utils/cn'

const navigationItems = [
  { icon: Home, label: 'Home', path: '/', exact: true },
  { icon: Search, label: 'Discover', path: '/stories' },
  { icon: User, label: 'Profile', path: '/profile' },
]

const infoItems = [
  { icon: Info, label: 'About Us', path: '/about' },
  { icon: Mail, label: 'Contact', path: '/contact' },
  { icon: Shield, label: 'Privacy', path: '/privacy' },
]

interface User {
  id: string
  email: string
  name?: string
  profileImg?: string
}

export function Sidebar() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const updateUserState = () => {
      const userData = localStorage.getItem('vtelltales_user')
      if (userData) {
        try {
          setUser(JSON.parse(userData))
        } catch (error) {
          console.error('Error parsing user data:', error)
        }
      } else {
        setUser(null)
      }
    }

    // Initial load
    updateUserState()

    // Listen for storage changes (when user logs in/out from other components)
    window.addEventListener('storage', updateUserState)
    
    // Listen for custom events (for same-tab updates)
    window.addEventListener('userStateChanged', updateUserState)

    return () => {
      window.removeEventListener('storage', updateUserState)
      window.removeEventListener('userStateChanged', updateUserState)
    }
  }, [])

  const handleLogin = () => {
    navigate('/login')
  }

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault()
    localStorage.removeItem('vtelltales_user')
    localStorage.removeItem('vtelltales_token')
    localStorage.removeItem('vtelltales_firebase_token')
    setUser(null)
    
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event('userStateChanged'))
    
    navigate('/')
  }
  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-100 z-50 transform-none">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-primary-yellow via-accent-orange to-accent-orange p-2.5 rounded-2xl shadow-lg">
            <Play className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900">VtellTales: WebApp</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Main Navigation */}
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  cn(
                    'sidebar-nav-button',
                    isActive && 'active'
                  )
                }
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            )
          })}
        </div>

        {/* Information */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-500 px-4 mb-2">Information</h3>
          {infoItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'sidebar-nav-button',
                    isActive && 'active'
                  )
                }
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            )
          })}
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-100">
        {user ? (
          <div className="space-y-3">
            {/* User Info */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-yellow to-accent-orange rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name || 'User'}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {user.email}
                </p>
              </div>
            </div>
            
            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        ) : (
          /* Login Button */
          <button
            type="button"
            onClick={handleLogin}
            className="btn btn-primary w-full px-4 py-3 text-center font-medium flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </button>
        )}
      </div>
    </aside>
  )
}
