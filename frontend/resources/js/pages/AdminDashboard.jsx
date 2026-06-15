import { useState, useEffect } from 'react'
import { Users, BookOpen, Zap, TrendingUp, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeCourses: 0,
    divisions: 5,
    completionRate: 0,
  })
  const [loading, setLoading] = useState(true)
  const [pendingApprovals, setPendingApprovals] = useState([])

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token')

      // Fetch dashboard data - adjust endpoints based on your backend
      const response = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setStats({
          totalUsers: data.users?.length || 0,
          activeCourses: 45,
          divisions: 5,
          completionRate: 68,
        })
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex-1 overflow-y-auto bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100">
      {/* Header */}
      <div className="glass sticky top-0 z-10 mx-4 mt-4 mb-4">
        <div className="px-6 py-6">
          <h1 className="text-3xl font-bold text-purple-900">Admin Dashboard</h1>
          <p className="text-stone-600 mt-1">Platform overview and management</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 relative z-5">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="glass-card"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-stone-600 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-stone-900 mt-2">{stats.totalUsers}</p>
              </div>
              <div className="glass-sm p-3">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          {/* Active Courses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass-card"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-stone-600 text-sm font-medium">Active Courses</p>
                <p className="text-3xl font-bold text-stone-900 mt-2">{stats.activeCourses}</p>
              </div>
              <div className="glass-sm p-3">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>

          {/* Divisions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-stone-600 text-sm font-medium">Divisions</p>
                <p className="text-3xl font-bold text-stone-900 mt-2">{stats.divisions}</p>
              </div>
              <div className="glass-sm p-3">
                <Zap className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </motion.div>

          {/* Completion Rate */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-stone-600 text-sm font-medium">Avg Completion</p>
                <p className="text-3xl font-bold text-stone-900 mt-2">{stats.completionRate}%</p>
              </div>
              <div className="glass-sm p-3">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card mb-8"
        >
          <div className="mb-6">
            <h2 className="text-lg font-bold text-purple-900">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
              <Users className="w-5 h-5 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-stone-900">Add User</p>
            </button>
            <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors">
              <BookOpen className="w-5 h-5 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-stone-900">Review Content</p>
            </button>
            <button className="p-4 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors">
              <BarChart3 className="w-5 h-5 text-amber-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-stone-900">View Analytics</p>
            </button>
            <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors">
              <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-stone-900">Generate Report</p>
            </button>
          </div>
        </motion.div>

        {/* Pending Approvals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-purple-900">Pending Approvals</h2>
            <span className="bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full">3</span>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center gap-3 p-3 bg-white/40 border border-white/60 rounded-lg">
                <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-stone-900">New Course: Advanced Blending</p>
                  <p className="text-xs text-stone-600">Submitted by Trainer X • 2 hours ago</p>
                </div>
                <button className="text-xs font-bold text-purple-600 hover:text-purple-700">Review</button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  )
}

function BarChart3({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}
