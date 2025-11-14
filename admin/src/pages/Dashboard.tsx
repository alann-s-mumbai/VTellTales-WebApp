import Layout from '../components/Layout'
import { Users, BookOpen, GraduationCap, Activity } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getApiUrl } from '../config'

export default function Dashboard() {
  const [admin, setAdmin] = useState<any>(null)

  useEffect(() => {
    fetchCurrentAdmin()
  }, [])

  const fetchCurrentAdmin = async () => {
    try {
      const response = await fetch(getApiUrl('/api/admin/current'))
      if (response.ok) {
        const data = await response.json()
        setAdmin(data)
      }
    } catch (error) {
      console.error('Failed to fetch admin:', error)
    }
  }

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          {admin && (
            <p className="text-gray-600 mt-2">
              Welcome back, {admin.firstName} {admin.lastName}
              <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                {admin.role}
              </span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value="0"
            icon={<Users className="w-8 h-8" />}
            color="bg-blue-500"
          />
          <StatCard
            title="Total Stories"
            value="0"
            icon={<BookOpen className="w-8 h-8" />}
            color="bg-green-500"
          />
          <StatCard
            title="Pending Educators"
            value="0"
            icon={<GraduationCap className="w-8 h-8" />}
            color="bg-yellow-500"
          />
          <StatCard
            title="Active Sessions"
            value="1"
            icon={<Activity className="w-8 h-8" />}
            color="bg-purple-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <p className="text-gray-500">No recent activity</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <QuickAction href="/admin/users" label="Manage Users" />
              <QuickAction href="/admin/stories" label="Review Stories" />
              <QuickAction href="/admin/educators" label="Approve Educators" />
              <QuickAction href="/admin/smtp" label="Configure Email" />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

interface StatCardProps {
  title: string
  value: string
  icon: React.ReactNode
  color: string
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className={`${color} text-white p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

interface QuickActionProps {
  href: string
  label: string
}

function QuickAction({ href, label }: QuickActionProps) {
  return (
    <a
      href={href}
      className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
    >
      {label}
    </a>
  )
}
