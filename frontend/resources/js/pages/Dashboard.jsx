import { useEffect, useState } from 'react'
import { Flame, BookOpen, Award, TrendingUp, ArrowRight, Star, CheckCircle2, Clock, Users, Zap, AlertCircle, BarChart3, Send, Trophy, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useRole } from '../hooks/useRole'
import TrainerDashboard from './TrainerDashboard'
import axios from 'axios'

export default function Dashboard({ user }) {
  const { isAdmin, isTrainer, isStaff } = useRole()
  const [dashboardData, setDashboardData] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [certificates, setCertificates] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }
      const [dashRes, assignRes, certRes, courseRes] = await Promise.all([
        fetch('/api/dashboard', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        axios.get('/api/assignments', { headers }).catch(() => ({ data: { assignments: [] } })),
        axios.get('/api/certificates', { headers }).catch(() => ({ data: [] })),
        axios.get('/api/courses', { headers }).catch(() => ({ data: { courses: [] } })),
      ])
      setDashboardData(dashRes)
      setAssignments(assignRes.data?.assignments || [])
      setCertificates(certRes.data || [])
      setCourses(courseRes.data?.courses || [])
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

  const upcomingAssignments = assignments.filter(a => a.status === 'not-started').slice(0, 3)
  const issuedCertificates = certificates.filter(c => c.status === 'issued')
  const recommendedCourses = courses.filter(c => c.progress < 100).slice(0, 3)

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
                <p className="text-3xl font-bold text-slate-900 mt-2">{issuedCertificates.length}</p>
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
                upcomingAssignments.map((assignment, idx) => {
                  const daysLeft = assignment.due_date
                    ? Math.ceil((new Date(assignment.due_date) - new Date()) / (1000 * 60 * 60 * 24))
                    : null
                  return (
                    <motion.div
                      key={assignment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Send className="w-5 h-5 text-teal-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{assignment.title}</p>
                        <p className="text-xs text-slate-600">
                          {daysLeft != null
                            ? daysLeft > 0 ? `Jatuh tempo: ${daysLeft} hari lagi` : 'Sudah jatuh tempo'
                            : 'Tanpa batas waktu'}
                        </p>
                      </div>
                      <button onClick={() => navigate('/assignments')} className="text-xs font-bold text-teal-600 hover:text-teal-700 flex-shrink-0">Mulai</button>
                    </motion.div>
                  )
                })
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
              {issuedCertificates.length > 0 ? (
                issuedCertificates.slice(0, 3).map((cert, idx) => (
                  <motion.div
                    key={cert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Trophy className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{cert.learning_path_title}</p>
                      <p className="text-xs text-slate-600 font-mono">{cert.certificate_number}</p>
                    </div>
                    <button onClick={() => navigate('/certificates')} className="text-xs font-bold text-teal-600 hover:text-teal-700 flex-shrink-0">Lihat</button>
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

          {recommendedCourses.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl">
              <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 text-sm">Semua kursus sudah selesai — kerja bagus!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedCourses.map((course, idx) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.05 }}
                  className="border border-gray-200 rounded-lg overflow-hidden bg-white group cursor-pointer hover:shadow-md transition-all"
                  onClick={() => navigate(`/courses/${course.id}`)}
                >
                  <div className="h-36 bg-gradient-to-br from-teal-50 to-slate-100 flex items-center justify-center">
                    <BookOpen className="w-10 h-10 text-teal-400 opacity-60" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-2">{course.title}</h3>
                    {course.description && (
                      <p className="text-sm text-slate-500 mt-1.5 line-clamp-2">{course.description}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">Oleh {course.instructor}</p>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      {course.progress > 0 ? (
                        <div>
                          <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>{course.difficulty}</span>
                            <span>{course.progress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-teal-400 rounded-full" style={{ width: `${course.progress}%` }} />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400 capitalize">{course.difficulty} · {course.lessons_count} lessons</span>
                          <span className="text-xs font-bold text-teal-600">Mulai →</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </main>
  )
}
