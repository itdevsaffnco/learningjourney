import { useState, useEffect } from 'react'
import { PlayCircle, CheckCircle2, Clock, BookOpen, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'

export default function MyLearning() {
  const navigate = useNavigate()
  const [inProgress, setInProgress] = useState([])
  const [completed, setCompleted] = useState([])
  const [activeTab, setActiveTab] = useState('progress')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLearningData()
  }, [])

  const fetchLearningData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }

      const res = await axios.get('/api/courses', { headers })
      const courses = res.data.courses || []

      setInProgress(courses.filter(c => c.progress > 0 && c.progress < 100))
      setCompleted(courses.filter(c => c.progress >= 100))
    } catch (error) {
      console.error('Failed to fetch learning data:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentData = activeTab === 'progress' ? inProgress : completed

  return (
    <main className="flex-1 overflow-y-auto bg-white">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <h1 className="text-3xl font-bold text-slate-900">My Learning</h1>
          <p className="text-slate-600 text-sm">Continue your learning journey</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="border-b border-gray-200 flex gap-8 py-4">
          <button
            onClick={() => setActiveTab('progress')}
            className={`pb-4 font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'progress'
                ? 'text-slate-900 border-b-2 border-slate-900'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PlayCircle size={20} />
            In Progress ({inProgress.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`pb-4 font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'completed'
                ? 'text-slate-900 border-b-2 border-slate-900'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 size={20} />
            Completed ({completed.length})
          </button>
        </div>

        <div className="py-8">
          {loading ? (
            <div className="text-center py-12 text-slate-600">Loading...</div>
          ) : currentData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentData.map((course, idx) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow group cursor-pointer bg-white"
                  onClick={() => navigate(`/courses/${course.id}`)}
                >
                  <div className="relative h-40 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-400/20 to-blue-500/20" />
                    <div className="absolute top-3 right-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur text-slate-700 capitalize">
                      {course.difficulty}
                    </div>
                    {activeTab === 'completed' && (
                      <div className="absolute top-3 left-3 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-500 text-white">
                        <CheckCircle2 size={12} /> Completed
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-slate-900 mb-1 line-clamp-2">{course.title}</h3>
                    <p className="text-slate-500 text-xs mb-3">{course.instructor}</p>

                    <div className="flex items-center gap-4 mb-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1">
                        <BookOpen size={14} />
                        <span>{course.lessons_count} lessons</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{course.duration}h</span>
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${course.progress}%` }}
                        transition={{ delay: idx * 0.1 + 0.2, duration: 0.8 }}
                        className="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full"
                      />
                    </div>
                    <p className="text-xs font-semibold text-slate-700 mb-4">{course.progress}% complete</p>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/courses/${course.id}`)
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors text-sm"
                    >
                      {activeTab === 'progress' ? 'Continue' : 'Review'}
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              {activeTab === 'progress' ? (
                <BookOpen size={48} className="mx-auto text-slate-400 mb-4" />
              ) : (
                <CheckCircle2 size={48} className="mx-auto text-slate-400 mb-4" />
              )}
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {activeTab === 'progress' ? 'No courses in progress' : 'No completed courses yet'}
              </h3>
              <p className="text-slate-600 mb-6">
                {activeTab === 'progress'
                  ? 'Start a course to see your progress here'
                  : 'Complete all lessons in a course to see it here'}
              </p>
              {activeTab === 'progress' && (
                <button
                  onClick={() => navigate('/courses')}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors"
                >
                  Explore Courses
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
