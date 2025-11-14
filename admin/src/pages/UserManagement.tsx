import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { getApiUrl } from '../config'
import { Search, Plus, Edit2, Trash2, Shield, UserX, CheckCircle, XCircle } from 'lucide-react'

interface AdminUser {
  AdminId: number
  Username: string
  Email: string
  FullName: string
  Role: string
  IsActive: boolean
  CreatedAt: string
  LastLogin: string | null
}

export default function UserManagement() {
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
    role: 'Admin'
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      const response = await fetch(getApiUrl('/api/admin/admins'), {
        credentials: 'include'
      })
      const data = await response.json()
      
      if (data.Success) {
        setAdmins(data.Admins || [])
      } else {
        setError(data.Message || 'Failed to load admins')
      }
    } catch (err) {
      setError('Failed to load admins')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAdmin = () => {
    setModalMode('create')
    setSelectedAdmin(null)
    setFormData({
      username: '',
      email: '',
      fullName: '',
      password: '',
      role: 'Admin'
    })
    setShowModal(true)
  }

  const handleEditAdmin = (admin: AdminUser) => {
    setModalMode('edit')
    setSelectedAdmin(admin)
    setFormData({
      username: admin.Username,
      email: admin.Email,
      fullName: admin.FullName,
      password: '',
      role: admin.Role
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const endpoint = modalMode === 'create' 
        ? '/api/admin/admins'
        : `/api/admin/admins/${selectedAdmin?.AdminId}`
      
      const method = modalMode === 'create' ? 'POST' : 'PUT'
      
      const payload = modalMode === 'create'
        ? formData
        : {
            email: formData.email,
            fullName: formData.fullName,
            role: formData.role,
            ...(formData.password && { password: formData.password })
          }

      const response = await fetch(getApiUrl(endpoint), {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (data.Success) {
        setSuccess(modalMode === 'create' ? 'Admin created successfully' : 'Admin updated successfully')
        setShowModal(false)
        fetchAdmins()
      } else {
        setError(data.Message || 'Operation failed')
      }
    } catch (err) {
      setError('An error occurred')
      console.error(err)
    }
  }

  const handleToggleStatus = async (admin: AdminUser) => {
    if (!confirm(`Are you sure you want to ${admin.IsActive ? 'deactivate' : 'activate'} ${admin.Username}?`)) {
      return
    }

    try {
      const response = await fetch(getApiUrl(`/api/admin/admins/${admin.AdminId}/toggle-status`), {
        method: 'POST',
        credentials: 'include'
      })

      const data = await response.json()

      if (data.Success) {
        setSuccess(`Admin ${admin.IsActive ? 'deactivated' : 'activated'} successfully`)
        fetchAdmins()
      } else {
        setError(data.Message || 'Failed to update status')
      }
    } catch (err) {
      setError('Failed to update status')
      console.error(err)
    }
  }

  const handleDeleteAdmin = async (admin: AdminUser) => {
    if (!confirm(`Are you sure you want to delete ${admin.Username}? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(getApiUrl(`/api/admin/admins/${admin.AdminId}`), {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await response.json()

      if (data.Success) {
        setSuccess('Admin deleted successfully')
        fetchAdmins()
      } else {
        setError(data.Message || 'Failed to delete admin')
      }
    } catch (err) {
      setError('Failed to delete admin')
      console.error(err)
    }
  }

  const filteredAdmins = admins.filter(admin =>
    admin.Username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.FullName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Admin User Management</h1>
          <p className="text-gray-600 mt-2">Manage super admin and admin users</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <span>{success}</span>
            <button onClick={() => setSuccess('')} className="text-green-700 hover:text-green-900">
              <CheckCircle className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by username, email, or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleCreateAdmin}
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                Add Admin
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading admins...</div>
            ) : filteredAdmins.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {searchTerm ? 'No admins found matching your search' : 'No admins found'}
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAdmins.map((admin) => (
                    <tr key={admin.AdminId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">{admin.Username}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{admin.FullName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{admin.Email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          admin.Role === 'SuperAdmin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {admin.Role === 'SuperAdmin' && <Shield className="w-3 h-3" />}
                          {admin.Role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          admin.IsActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {admin.IsActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {admin.LastLogin ? new Date(admin.LastLogin).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditAdmin(admin)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(admin)}
                            className={admin.IsActive ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}
                            title={admin.IsActive ? 'Deactivate' : 'Activate'}
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                          {admin.Role !== 'SuperAdmin' && (
                            <button
                              onClick={() => handleDeleteAdmin(admin)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {modalMode === 'create' ? 'Add New Admin' : 'Edit Admin'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {modalMode === 'create' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {modalMode === 'edit' && '(leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  required={modalMode === 'create'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={selectedAdmin?.Role === 'SuperAdmin'}
                >
                  <option value="Admin">Admin</option>
                  <option value="SuperAdmin">Super Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {modalMode === 'create' ? 'Create Admin' : 'Update Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
