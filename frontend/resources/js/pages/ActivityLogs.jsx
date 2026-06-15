import { useState, useEffect } from 'react'
import { ArrowRight, Filter, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ActivityLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/activity-logs', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs || [])
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type) => {
    const icons = {
      'quiz_submission': '📝',
      'assignment_submission': '✅',
      'module_completion': '📚',
      'lesson_created': '📖',
      'quiz_created': '❓',
      'assignment_created': '📋',
      'user_created': '👤',
      'module_created': '📦',
      'learning_path_created': '🎯',
      'announcement_created': '📢',
      'announcement_updated': '✏️',
    }
    return icons[type] || '📌'
  }

  const getActivityColor = (type) => {
    const colors = {
      'quiz_submission': 'bg-green-100',
      'assignment_submission': 'bg-blue-100',
      'module_completion': 'bg-purple-100',
      'lesson_created': 'bg-orange-100',
      'quiz_created': 'bg-yellow-100',
      'assignment_created': 'bg-red-100',
      'user_created': 'bg-indigo-100',
      'module_created': 'bg-cyan-100',
      'learning_path_created': 'bg-pink-100',
      'announcement_created': 'bg-teal-100',
      'announcement_updated': 'bg-lime-100',
    }
    return colors[type] || 'bg-gray-100'
  }

  const formatRelativeTime = (dateString) => {
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

  const formatFullDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatActivityName = (type) => {
    return type
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
  }

  const filteredLogs = logs.filter((log) => {
    const matchesType = filterType === 'all' || log.type === filterType
    const matchesSearch = log.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesSearch
  })

  const uniqueTypes = [...new Set(logs.map((log) => log.type))]

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
          <h1 className="text-3xl font-bold text-slate-900">Activity Logs</h1>
          <p className="text-slate-600 mt-2 text-sm">View all system activities and events</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4 flex-col md:flex-row">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900"
              />
            </div>

            {/* Filter by type */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900 bg-white"
            >
              <option value="all">All Activities</option>
              {uniqueTypes.map((type) => (
                <option key={type} value={type}>
                  {formatActivityName(type)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Logs */}
        <div className="space-y-3">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-4 p-4 ${getActivityColor(log.type)} border border-gray-200 rounded-lg transition-colors hover:shadow-md`}
              >
                <div className="text-2xl flex-shrink-0">
                  {getActivityIcon(log.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{log.description}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <p className="text-xs text-slate-500">{formatRelativeTime(log.created_at)}</p>
                    <span className="text-xs text-slate-400">•</span>
                    <p className="text-xs text-slate-500">{formatFullDate(log.created_at)}</p>
                  </div>
                </div>
                {log.user && (
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-medium text-slate-900">{log.user}</p>
                  </div>
                )}
                <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12 text-slate-500">
              <p className="text-sm">No activities found</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
