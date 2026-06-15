import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, Clock, Star, BookOpen, Play } from 'lucide-react'
import axios from 'axios'

export default function LearningPath() {
  const navigate = useNavigate()
  const [paths, setPaths] = useState([])
  const [selectedPath, setSelectedPath] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPaths()
  }, [])

  const fetchPaths = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get('/api/user/learning-paths', {
        headers: { Authorization: `Bearer ${token}` },
      })

      const allPaths = [...(res.data.in_progress || []), ...(res.data.completed || [])]
      setPaths(allPaths)
      setSelectedPath(allPaths[0] || null)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch paths:', error)
      setPaths([])
      setLoading(false)
    }
  }

  if (loading) {
    return <main className="flex-1 overflow-y-auto bg-white"><div className="text-center py-12">Loading...</div></main>
  }

  if (paths.length === 0) {
    return (
      <main className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Learning Paths</h1>
          <p className="text-slate-600 mb-8">Belum ada learning path yang dimulai</p>
          <button
            onClick={() => navigate('/courses')}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-semibold"
          >
            Jelajahi Courses
          </button>
        </div>
      </main>
    )
  }

  if (loading) {
    return <main className="flex-1 overflow-y-auto bg-white"><div className="text-center py-12">Loading...</div></main>
  }

  return (
    <main className="flex-1 overflow-y-auto bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Learning Paths</h1>
          <p className="text-slate-600">Pilih path pembelajaran yang sesuai dengan tujuanmu</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-3 gap-8">
          {/* Left: Paths List */}
          <div className="col-span-2 space-y-4">
            {paths.map((path, idx) => (
              <motion.button
                key={path.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setSelectedPath(path)}
                className={`w-full p-6 rounded-lg border-2 transition-all text-left ${
                  selectedPath?.id === path.id
                    ? 'border-teal-500 bg-teal-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex gap-4">
                  {/* Indicator */}
                  <div className="flex flex-col items-center pt-1">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center relative z-10 ${
                        path.progress > 0
                          ? 'bg-teal-500 border-teal-500'
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      {path.progress > 0 && <CheckCircle2 size={16} className="text-white" />}
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{path.title}</h3>
                    <p className="text-slate-600 text-sm mb-3">{path.description}</p>

                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Clock size={16} />
                        <span>{path.duration} Jam</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600">
                        <Star size={16} className="text-yellow-500" />
                        <span>{path.rating}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600">
                        <BookOpen size={16} />
                        <span>{path.modules} Modul</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {path.progress > 0 && (
                      <div className="mt-3">
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            animate={{ width: `${path.progress}%` }}
                            transition={{ duration: 0.5 }}
                            className="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full"
                          />
                        </div>
                        <span className="text-xs text-slate-600 mt-1 block">{path.progress}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Right: Path Details */}
          {selectedPath && (
            <motion.div
              key={selectedPath.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="col-span-1 sticky top-32"
            >
              <div className="bg-gradient-to-br from-slate-50 to-white border border-gray-200 rounded-lg p-8 space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-3">{selectedPath.title}</h2>
                  <p className="text-slate-600 leading-relaxed">{selectedPath.description}</p>
                </div>

                <div className="border-t border-gray-200 pt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 text-sm">Rating</span>
                    <div className="flex items-center gap-1">
                      <Star size={16} className="text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold text-slate-900">{selectedPath.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 text-sm">Total Modul</span>
                    <span className="font-semibold text-slate-900">{selectedPath.modules}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 text-sm">Durasi Total</span>
                    <span className="font-semibold text-slate-900">{selectedPath.duration} Jam</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 text-sm">Peserta</span>
                    <span className="font-semibold text-slate-900">{selectedPath.totalStudents.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/learning-path/${selectedPath.id}`)}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                    selectedPath.progress > 0
                      ? 'bg-gray-100 text-slate-600 hover:bg-gray-200'
                      : 'bg-teal-500 hover:bg-teal-600 text-white'
                  }`}
                >
                  <Play size={18} />
                  {selectedPath.progress > 0 ? 'Lanjutkan' : 'Mulai Belajar'}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  )
}
