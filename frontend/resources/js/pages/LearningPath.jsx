import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, BookOpen, ArrowRight, Layers } from 'lucide-react'
import axios from 'axios'

function formatDuration(dur) {
  if (!dur) return null
  if (typeof dur === 'string' && isNaN(Number(dur))) return dur
  const hours = Number(dur)
  if (hours <= 0) return null
  if (hours >= 168) return `${Math.round(hours / 168)} Minggu`
  if (hours >= 24) return `${Math.round(hours / 24)} Hari`
  return `${hours} Jam`
}

export default function LearningPath() {
  const navigate = useNavigate()
  const [paths, setPaths] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchPaths() }, [])

  const fetchPaths = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get('/api/user/learning-paths', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const allPaths = [...(res.data.in_progress || []), ...(res.data.completed || [])]
      setPaths(allPaths)
    } catch (error) {
      console.error('Failed to fetch paths:', error)
    } finally {
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
          <Layers className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Belum ada Learning Path</h1>
          <p className="text-slate-500 mb-6 text-sm">Learning path yang ditugaskan untuk kamu akan muncul di sini.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
          <h1 className="text-3xl font-bold text-slate-900">Learning Paths</h1>
          <p className="text-slate-500 mt-1 text-sm">Pilih path pembelajaran dan lihat langkah-langkahnya</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-4">
        {paths.map((path, idx) => (
          <motion.button
            key={path.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            onClick={() => navigate(`/learning-path/${path.id}`)}
            className="w-full text-left bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-teal-300 transition-all group"
          >
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-teal-700 transition-colors">
                    {path.title}
                  </h3>
                  {path.description && (
                    <p className="text-sm text-slate-500 line-clamp-2 mb-3">{path.description}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                    {formatDuration(path.duration) && (
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} className="text-slate-400" />
                        {formatDuration(path.duration)}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <BookOpen size={14} className="text-slate-400" />
                      {path.modules_count ?? 0} Modul
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 flex-shrink-0">
                  {path.progress > 0 && (
                    <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">
                      {path.progress}%
                    </span>
                  )}
                  <ArrowRight size={18} className="text-slate-400 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
                </div>
              </div>

              {/* Progress bar */}
              {path.progress > 0 && (
                <div className="mt-4">
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      animate={{ width: `${path.progress}%` }}
                      transition={{ duration: 0.6 }}
                      className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </main>
  )
}
