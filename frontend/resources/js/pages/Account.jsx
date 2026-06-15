import { useState, useEffect } from 'react'
import { User, Mail, Building2, LogOut, Check, Lock } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Account() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUser(response.data)
      setFormData({
        name: response.data.name,
        bio: response.data.bio || '',
      })
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      await axios.put('/api/profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      setUser({ ...user, ...formData })
      setEditing(false)
      setSuccessMessage('Profile updated successfully!')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 8) {
      alert('Password must be at least 8 characters')
      return
    }

    try {
      const token = localStorage.getItem('token')
      await axios.post('/api/change-password', {
        current_password: passwordData.currentPassword,
        password: passwordData.newPassword,
        password_confirmation: passwordData.confirmPassword,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setChangingPassword(false)
      setSuccessMessage('Password changed successfully!')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (error) {
      console.error('Error changing password:', error)
      alert(error.response?.data?.message || 'Failed to change password')
    }
  }

  const handleLogout = () => {
    const token = localStorage.getItem('token')
    axios.post('/api/logout', {}, {
      headers: { Authorization: `Bearer ${token}` },
    }).finally(() => {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      navigate('/login')
    })
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
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <h1 className="text-3xl font-bold text-slate-900">Account Settings</h1>
          <p className="text-slate-600 mt-2 text-sm">Manage your profile and account information</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8">
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

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 mb-8"
        >
          <div className="flex items-center gap-6 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-slate-700" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{user?.name}</h2>
              <p className="text-slate-600 flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4" />
                {user?.email}
              </p>
            </div>
          </div>

          {user?.division && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-3">
              <Building2 className="w-5 h-5 text-slate-600" />
              <div>
                <p className="text-xs font-medium text-slate-600">Division</p>
                <p className="text-sm font-semibold text-slate-900">{user.division.name}</p>
              </div>
            </div>
          )}

          {editing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-5 border-t border-gray-200 pt-8">
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
                <label className="block text-sm font-semibold text-slate-900 mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900 placeholder-slate-500"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-6 py-2 text-slate-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="border-t border-gray-200 pt-8">
              {formData.bio && (
                <div className="mb-6">
                  <p className="text-xs font-medium text-slate-600 mb-2">Bio</p>
                  <p className="text-slate-900">{formData.bio}</p>
                </div>
              )}
              <button
                onClick={() => setEditing(true)}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors"
              >
                Edit Profile
              </button>
            </div>
          )}
        </motion.div>

        {/* Change Password Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 mb-8"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Change Password
          </h3>
          <p className="text-slate-600 text-sm mb-6">Update your password to keep your account secure</p>

          {changingPassword ? (
            <form onSubmit={handleChangePassword} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">At least 8 characters</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setChangingPassword(false)
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                  }}
                  className="px-6 py-2 text-slate-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors"
                >
                  Change Password
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setChangingPassword(true)}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors"
            >
              Change Password
            </button>
          )}
        </motion.div>

        {/* Logout Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg border border-gray-200 shadow-sm p-8"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-4">Logout</h3>
          <p className="text-slate-600 text-sm mb-6">Sign out from your account</p>
          <button
            onClick={handleLogout}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </motion.div>
      </div>
    </main>
  )
}
