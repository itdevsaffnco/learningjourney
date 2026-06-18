import { useState, useEffect } from 'react'
import { Users, Plus, Edit2, Trash2, Check } from 'lucide-react'
import { motion } from 'framer-motion'

export default function UserManagement({ user }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterDivision, setFilterDivision] = useState('all')
  const [roles, setRoles] = useState([])
  const [divisions, setDivisions] = useState([])
  const [successMessage, setSuccessMessage] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    division_id: '',
    role_id: '',
    store_location: '',
  })

  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetchUsers()
    fetchRoles()
    fetchDivisions()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/trainer/staff', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data.data || data.staff || [])
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/roles', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setRoles(data.data || data.roles || [])
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error)
    }
  }

  const fetchDivisions = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/divisions', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setDivisions(data.data || data.divisions || [])
      }
    } catch (error) {
      console.error('Failed to fetch divisions:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const url = editingId ? `/api/trainer/staff/${editingId}` : '/api/trainer/staff'
      const method = editingId ? 'PUT' : 'POST'

      const payload = editingId
        ? { name: formData.name, division_id: formData.division_id, role_id: formData.role_id, store_location: formData.store_location || null }
        : formData

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        setSuccessMessage(editingId ? 'User updated successfully!' : 'User created successfully!')
        setTimeout(() => setSuccessMessage(null), 3000)
        setFormData({ name: '', email: '', password: '', division_id: '', role_id: '', store_location: '' })
        setRoleSearch('')
        setDivisionSearch('')
        setEditingId(null)
        setShowForm(false)
        fetchUsers()
      }
    } catch (error) {
      console.error('Failed to save user:', error)
    }
  }

  const handleDelete = async (userId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/trainer/staff/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setSuccessMessage('User deleted successfully!')
        setTimeout(() => setSuccessMessage(null), 3000)
        setDeleteConfirm(null)
        fetchUsers()
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }

  const handleEdit = (userData) => {
    setFormData({
      name: userData.name,
      email: userData.email,
      password: '',
      division_id: userData.division?.id || '',
      role_id: userData.role?.id || '',
      store_location: userData.store_location || '',
    })
    setEditingId(userData.id)
    setShowForm(true)
  }

  const filteredUsers = users.filter(u => {
    const matchSearch = !searchTerm ||
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchRole = filterRole === 'all' || u.role?.name === filterRole
    const matchDivision = filterDivision === 'all' || u.division?.name === filterDivision
    return matchSearch && matchRole && matchDivision
  })

  const getRoleColor = (role) => {
    const colors = {
      'Admin': 'bg-purple-100 text-purple-800',
      'Trainer': 'bg-blue-100 text-blue-800',
      'Staff': 'bg-green-100 text-green-800',
    }
    return colors[role?.name] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <main className="flex-1 overflow-y-auto bg-white">
        <div className="text-center py-12 text-slate-600">Loading...</div>
      </main>
    )
  }

  return (
    <main className="flex-1 overflow-y-auto bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 sticky top-0 z-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
            <p className="text-slate-600 mt-2 text-sm">Create and manage user accounts and roles</p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm)
              setEditingId(null)
              setFormData({ name: '', email: '', password: '', division_id: '', role_id: '', store_location: '' })
            }}
            className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Create User
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Success Message */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="mb-6"
          >
            <div className="bg-white rounded-lg shadow-lg border border-green-200 px-6 py-4 flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
          </motion.div>
        )}

        {/* Create/Edit Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 mb-8"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              {editingId ? 'Edit User' : 'Create New User'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={editingId}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    required
                  />
                </div>

                {!editingId && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900"
                      required
                      minLength="8"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Role</label>
                  <select
                    value={formData.role_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, role_id: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900 bg-white"
                    required
                  >
                    <option value="">Select role...</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Division</label>
                  <select
                    value={formData.division_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, division_id: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900 bg-white"
                  >
                    <option value="">Select division...</option>
                    {divisions.map(div => (
                      <option key={div.id} value={div.id}>{div.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Store Location <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.store_location}
                    onChange={(e) => setFormData({ ...formData, store_location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900"
                    placeholder="e.g. Jakarta Selatan, Grand Indonesia"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingId(null)
                    setFormData({ name: '', email: '', password: '', division_id: '', role_id: '', store_location: '' })
                    setRoleSearch('')
                    setDivisionSearch('')
                  }}
                  className="px-6 py-2 text-slate-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors"
                >
                  {editingId ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Search & Filters */}
        <div className="mb-6 space-y-3">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900"
          />

          <div className="flex flex-wrap gap-2 items-center">
            {/* Role filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium">Role:</span>
              {['all', 'Admin', 'Trainer', 'Staff'].map(r => (
                <button key={r} onClick={() => setFilterRole(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterRole === r ? 'bg-slate-700 text-white' : 'border border-gray-200 text-slate-600 hover:bg-gray-50'}`}
                >
                  {r === 'all' ? 'All' : r}
                </button>
              ))}
            </div>

            <div className="w-px h-5 bg-gray-200 mx-1" />

            {/* Division filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-slate-500 font-medium">Division:</span>
              <button onClick={() => setFilterDivision('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterDivision === 'all' ? 'bg-slate-700 text-white' : 'border border-gray-200 text-slate-600 hover:bg-gray-50'}`}
              >All</button>
              {divisions.map(div => (
                <button key={div.id} onClick={() => setFilterDivision(div.name)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterDivision === div.name ? 'bg-slate-700 text-white' : 'border border-gray-200 text-slate-600 hover:bg-gray-50'}`}
                >
                  {div.name}
                </button>
              ))}
            </div>

            {/* Clear filters */}
            {(filterRole !== 'all' || filterDivision !== 'all' || searchTerm) && (
              <button onClick={() => { setFilterRole('all'); setFilterDivision('all'); setSearchTerm('') }}
                className="ml-auto text-xs text-slate-500 hover:text-slate-800 underline transition-colors"
              >
                Reset filter
              </button>
            )}
          </div>

          {(filterRole !== 'all' || filterDivision !== 'all' || searchTerm) && (
            <p className="text-xs text-slate-500">{filteredUsers.length} user ditemukan</p>
          )}
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Division</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Store Location</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(userData => (
                    <tr key={userData.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{userData.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{userData.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(userData.role)}`}>
                          {userData.role?.name || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{userData.division?.name || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{userData.store_location || '-'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(userData)}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(userData.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-600">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl"
          >
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete User</h3>
            <p className="text-slate-600 mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-6 py-2 text-slate-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  )
}
