import { Link } from 'react-router-dom'
import { Users, Settings, Shield, BookOpen, BarChart3, Mail, GraduationCap, LogOut, Menu } from 'lucide-react'
import { useState } from 'react'
import { getApiUrl } from '../config'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = async () => {
    try {
      const response = await fetch(getApiUrl('/api/admin/logout'), { 
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Logout response:', data)
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Always redirect to login regardless of API response
      // This ensures user is logged out even if there's a server error
      window.location.href = '/admin/login'
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className={`bg-gradient-to-b from-purple-900 to-indigo-900 text-white transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-8">
            {sidebarOpen && <h1 className="text-xl font-bold">VTellTales Admin</h1>}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/10 rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
          </div>

          <nav className="space-y-2">
            <NavLink to="/admin" icon={<BarChart3 />} label="Dashboard" collapsed={!sidebarOpen} />
            <NavLink to="/admin/users" icon={<Users />} label="Users" collapsed={!sidebarOpen} />
            <NavLink to="/admin/stories" icon={<BookOpen />} label="Stories" collapsed={!sidebarOpen} />
            <NavLink to="/admin/educators" icon={<GraduationCap />} label="Educators" collapsed={!sidebarOpen} />
            <NavLink to="/admin/admins" icon={<Shield />} label="Admins" collapsed={!sidebarOpen} />
            <NavLink to="/admin/smtp" icon={<Mail />} label="SMTP Settings" collapsed={!sidebarOpen} />
            <NavLink to="/admin/email-templates" icon={<Mail />} label="Email Templates" collapsed={!sidebarOpen} />
            <NavLink to="/admin/analytics" icon={<BarChart3 />} label="Analytics" collapsed={!sidebarOpen} />
          </nav>

          <div className="mt-8 pt-8 border-t border-white/20">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full p-3 hover:bg-white/10 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}

interface NavLinkProps {
  to: string
  icon: React.ReactNode
  label: string
  collapsed: boolean
}

function NavLink({ to, icon, label, collapsed }: NavLinkProps) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg transition-colors"
      title={collapsed ? label : undefined}
    >
      <div className="w-5 h-5">{icon}</div>
      {!collapsed && <span>{label}</span>}
    </Link>
  )
}
