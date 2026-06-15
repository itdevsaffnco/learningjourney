import { useEffect, useState } from 'react'
import { Flame, BookOpen, Award, TrendingUp, ArrowRight, Star, CheckCircle2, Clock, Users, Zap, AlertCircle, BarChart3, Send, Trophy, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useRole } from '../hooks/useRole'
import TrainerDashboard from './TrainerDashboard'

export default function Dashboard({ user }) {
  const { isAdmin, isTrainer, isStaff } = useRole()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  // Trainer Dashboard
  if (isTrainer()) {
    return <TrainerDashboard user={user} />
  }

  // Admin Dashboard
  if (isAdmin()) {
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
                  <p className="text-3xl font-bold text-stone-900 mt-2">250+</p>
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
                  <p className="text-3xl font-bold text-stone-900 mt-2">45</p>
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
                  <p className="text-3xl font-bold text-stone-900 mt-2">5</p>
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
                  <p className="text-3xl font-bold text-stone-900 mt-2">68%</p>
                </div>
                <div className="glass-sm p-3">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Pending Approvals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-purple-900">Pending Content Approvals</h2>
              <span className="bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full">3</span>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center gap-3 p-3 bg-white/40 border border-white/60 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-stone-900">New Course: Advanced Blending</p>
                    <p className="text-xs text-stone-600">Submitted by Trainer • 2 hours ago</p>
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

  // Staff Dashboard (Default)
  const navigate = useNavigate()

  const upcomingAssignments = [
    { id: 1, title: 'Product Knowledge Assessment', dueDate: '2026-06-25', daysLeft: 13 },
    { id: 2, title: 'Sales Pitch Development', dueDate: '2026-06-20', daysLeft: 8 }
  ]

  const recentCertificates = [
    { id: 1, name: 'Backend Developer Certification', pathName: 'Backend Developer', earnedDate: '2024-12-15' },
    { id: 2, name: 'Frontend Developer Certification', pathName: 'Frontend Developer', earnedDate: '2024-11-20' }
  ]

  return (
    <main className="flex-1 overflow-y-auto bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Halo, {dashboardData?.user.name || user?.name}! 👋</h1>
              <p className="text-slate-600 mt-1">Lanjutkan belajarmu dan raih pencapaian baru</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">Divisi: <strong>{dashboardData?.user.division || user?.division}</strong></p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Stats Grid - 4 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Points */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Poin Saya</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{dashboardData?.stats.total_points || 0}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-teal-600" />
              </div>
            </div>
          </motion.div>

          {/* Streak */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Streak</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{dashboardData?.stats.daily_streak || 0}</p>
                <p className="text-xs text-slate-500 mt-1">hari berturut-turut</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <Flame className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </motion.div>

          {/* Lessons Completed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Pelajaran Selesai</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{dashboardData?.stats.lessons_completed || 0}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          {/* Sertifikat */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Sertifikat</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{recentCertificates.length}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <Trophy className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Learning Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-gray-200 rounded-lg p-6 bg-white mb-8"
        >
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">Progres Keseluruhan</h2>
            <p className="text-sm text-slate-600 mt-1">
              {dashboardData?.stats.lessons_completed} dari {dashboardData?.stats.total_lessons || 0} pelajaran selesai
            </p>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${dashboardData?.stats.completion_percentage || 0}%` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-slate-700 to-slate-900 rounded-full"
            />
          </div>
        </motion.div>

        {/* Upcoming Assignments & Recent Certificates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Upcoming Assignments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-gray-200 rounded-lg p-6 bg-white"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Tugas Mendatang</h2>
              <button onClick={() => navigate('/assignments')} className="text-xs font-bold text-teal-600 hover:text-teal-700">Lihat Semua →</button>
            </div>
            <div className="space-y-3">
              {upcomingAssignments.length > 0 ? (
                upcomingAssignments.map((assignment, idx) => (
                  <motion.div
                    key={assignment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Send className="w-5 h-5 text-teal-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{assignment.title}</p>
                      <p className="text-xs text-slate-600">Jatuh tempo: {assignment.daysLeft} hari</p>
                    </div>
                    <button onClick={() => navigate('/assignments')} className="text-xs font-bold text-teal-600 hover:text-teal-700">Mulai</button>
                  </motion.div>
                ))
              ) : (
                <p className="text-sm text-slate-600 text-center py-4">Tidak ada tugas mendatang</p>
              )}
            </div>
          </motion.div>

          {/* Recent Certificates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="border border-gray-200 rounded-lg p-6 bg-white"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Sertifikat Terbaru</h2>
              <button onClick={() => navigate('/certificates')} className="text-xs font-bold text-teal-600 hover:text-teal-700">Lihat Semua →</button>
            </div>
            <div className="space-y-3">
              {recentCertificates.length > 0 ? (
                recentCertificates.map((cert, idx) => (
                  <motion.div
                    key={cert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Trophy className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{cert.name}</p>
                      <p className="text-xs text-slate-600">{cert.pathName}</p>
                    </div>
                    <button onClick={() => navigate('/certificates')} className="text-xs font-bold text-teal-600 hover:text-teal-700">Lihat</button>
                  </motion.div>
                ))
              ) : (
                <p className="text-sm text-slate-600 text-center py-4">Belum ada sertifikat</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Recommended Courses Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Kursus Direkomendasikan</h2>
            <button onClick={() => navigate('/courses')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-medium">
              Lihat Semua <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Advanced Fragrance Blending', description: 'Master advanced blending techniques', rating: 4.9, instructor: 'Rina Wijaya' },
              { title: 'Digital Marketing Mastery', description: 'Comprehensive digital marketing strategies', rating: 4.8, instructor: 'Ahmad Gunawan' },
              { title: 'Customer Excellence', description: 'Deliver exceptional customer experiences', rating: 4.7, instructor: 'Siti Nur Aini' }
            ].map((course, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.05 }}
                className="border border-gray-200 rounded-lg overflow-hidden bg-white group cursor-pointer hover:shadow-md transition-all"
                onClick={() => navigate('/courses')}
              >
                <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-400 text-4xl">
                  📚
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-slate-900 group-hover:text-slate-700 transition-colors line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-slate-600 mt-2 line-clamp-2">{course.description}</p>
                  <p className="text-xs text-slate-500 mt-2">Oleh {course.instructor}</p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-medium text-slate-700">{course.rating}</span>
                    </div>
                    <button className="text-slate-600 hover:text-slate-900 font-medium text-xs">
                      Mulai →
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  )
}
