import { useState, useEffect } from 'react'
import { Users, BookOpen, CheckSquare, Medal, FileText, TrendingUp, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export default function TrainerDashboard({ user }) {
  const [stats, setStats] = useState({
    totalStaff: 0,
    totalModules: 0,
    totalQuizzes: 0,
    totalAssignments: 0,
    totalPaths: 0,
    activeStudents: 0,
  })
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    fetchTrainerData()
  }, [])

  const fetchTrainerData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/trainer/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Dashboard data:', data)
        setStats(data.stats || {})

        // Format recent activity data
        const activities = []

        // Add quiz submissions
        if (data.recent_quiz_submissions && Array.isArray(data.recent_quiz_submissions)) {
          data.recent_quiz_submissions.forEach(submission => {
            activities.push({
              type: 'quiz',
              title: `${submission.user_name} took "${submission.quiz_title}"`,
              date: submission.submitted_at,
              timestamp: new Date(submission.submitted_at).getTime(),
            })
          })
        }

        // Add assignment submissions
        if (data.recent_assignment_submissions && Array.isArray(data.recent_assignment_submissions)) {
          data.recent_assignment_submissions.forEach(submission => {
            activities.push({
              type: 'assignment',
              title: `${submission.user_name} submitted "${submission.assignment_title}"`,
              date: submission.submitted_at,
              timestamp: new Date(submission.submitted_at).getTime(),
            })
          })
        }

        // Add module completions
        if (data.recent_completions && Array.isArray(data.recent_completions)) {
          data.recent_completions.forEach(completion => {
            activities.push({
              type: 'module',
              title: `${completion.user_name} completed "${completion.module_title}"`,
              date: completion.completed_at,
              timestamp: new Date(completion.completed_at).getTime(),
            })
          })
        }

        // Sort by timestamp (newest first) and take top 8
        activities.sort((a, b) => b.timestamp - a.timestamp)
        setRecentActivity(activities.slice(0, 8))
      } else {
        console.error('Dashboard API error:', response.status)
        setStats({
          totalStaff: 0,
          totalModules: 0,
          totalQuizzes: 0,
          totalAssignments: 0,
          totalPaths: 0,
          activeStudents: 0,
          avgRating: 0,
        })
        setRecentActivity([])
      }

      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch trainer data:', error)
      console.error('Error response:', error.response?.data)
      setStats({
        totalStaff: 0,
        totalModules: 0,
        totalQuizzes: 0,
        totalAssignments: 0,
        totalPaths: 0,
        activeStudents: 0,
        avgRating: 0,
      })
      setRecentActivity([])
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'recently'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString()
  }

  const displayValue = (value) => {
    return value || 0
  }

  return (
    <main className="flex-1 overflow-y-auto bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 sticky top-0 z-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <h1 className="text-3xl font-bold text-slate-900">Trainer Dashboard</h1>
          <p className="text-slate-600 mt-2 text-sm">Manage your learning content and track student progress</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Staff */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Staff</p>
                <p className="text-3xl font-bold text-slate-900 mt-3">{displayValue(stats.totalStaff)}</p>
                <p className="text-xs text-slate-500 mt-1">{displayValue(stats.activeStudents)} active</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          {/* Total Modules */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">My Modules</p>
                <p className="text-3xl font-bold text-slate-900 mt-3">{displayValue(stats.totalModules)}</p>
                <p className="text-xs text-slate-500 mt-1">Created</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>

          {/* Total Quizzes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Quizzes</p>
                <p className="text-3xl font-bold text-slate-900 mt-3">{displayValue(stats.totalQuizzes)}</p>
                <p className="text-xs text-slate-500 mt-1">Active</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckSquare className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          {/* Total Assignments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Assignments</p>
                <p className="text-3xl font-bold text-slate-900 mt-3">{displayValue(stats.totalAssignments)}</p>
                <p className="text-xs text-slate-500 mt-1">Created</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <Medal className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </motion.div>

          {/* Learning Paths */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Learning Paths</p>
                <p className="text-3xl font-bold text-slate-900 mt-3">{displayValue(stats.totalPaths)}</p>
                <p className="text-xs text-slate-500 mt-1">Curated</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </motion.div>

          {/* Avg Rating */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Avg Rating</p>
                <p className="text-3xl font-bold text-slate-900 mt-3">{stats.avgRating > 0 ? `${stats.avgRating}/5` : '-'}</p>
                <p className="text-xs text-slate-500 mt-1">From students</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-gray-200 shadow-sm p-8"
        >
          <h2 className="text-lg font-bold text-slate-900 mb-6">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${
                    activity.type === 'module' ? 'bg-purple-100' :
                    activity.type === 'quiz' ? 'bg-green-100' :
                    activity.type === 'assignment' ? 'bg-amber-100' :
                    'bg-blue-100'
                  }`}>
                    {activity.type === 'module' && <BookOpen className="w-5 h-5 text-purple-600" />}
                    {activity.type === 'quiz' && <CheckSquare className="w-5 h-5 text-green-600" />}
                    {activity.type === 'assignment' && <Medal className="w-5 h-5 text-amber-600" />}
                    {activity.type === 'student' && <Users className="w-5 h-5 text-blue-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{activity.title}</p>
                    <p className="text-xs text-slate-500">{formatDate(activity.date)}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p className="text-sm">No recent activity yet</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </main>
  )
}
