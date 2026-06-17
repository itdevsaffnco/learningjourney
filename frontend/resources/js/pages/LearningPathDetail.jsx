import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import {
  ArrowLeft, Clock, BookOpen, CheckCircle2, Play,
  Plus, Trash2, X, Search, Layers, AlertCircle,
  Users, Target, Milestone, BarChart2, Lock
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'

// ─── Trainer view ────────────────────────────────────────────────────────────

function TrainerView({ pathId }) {
  const navigate = useNavigate()
  const [path, setPath] = useState(null)
  const [modules, setModules] = useState([])   // modules attached to path
  const [loading, setLoading] = useState(true)
  const [showPicker, setShowPicker] = useState(false)

  useEffect(() => { fetchPath() }, [pathId])

  const fetchPath = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get(`/api/trainer/learning-paths/${pathId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setPath(res.data.path)
      setModules(res.data.modules || [])
    } catch (e) {
      console.error('Failed to fetch learning path', e)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (moduleId) => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/trainer/learning-paths/${pathId}/modules/${moduleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setModules(prev => prev.filter(m => m.id !== moduleId))
    } catch (e) {
      console.error('Failed to remove module', e)
    }
  }

  const handleAdd = async (module) => {
    try {
      const token = localStorage.getItem('token')
      await axios.post(`/api/trainer/learning-paths/${pathId}/modules`, { module_id: module.id }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setModules(prev => [...prev, module])
      setShowPicker(false)
    } catch (e) {
      console.error('Failed to add module', e)
    }
  }

  if (loading) {
    return (
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="text-center py-12 text-slate-600">Loading...</div>
      </main>
    )
  }

  return (
    <main className="flex-1 overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 flex items-start gap-4">
          <button
            onClick={() => navigate('/trainer/learning-paths')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors mt-0.5 flex-shrink-0"
          >
            <ArrowLeft size={20} className="text-slate-700" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-1">Learning Path</p>
            <h1 className="text-2xl font-bold text-slate-900 truncate">{path?.title || 'Untitled'}</h1>
            {path?.description && (
              <p className="text-sm text-slate-500 mt-1 line-clamp-2">{path.description}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              {path?.target_division && (
                <span className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                  <Users size={11} /> {path.target_division}
                </span>
              )}
              {path?.target_role && (
                <span className="flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                  <Target size={11} /> {path.target_role}
                </span>
              )}
              {path?.duration > 0 && (
                <span className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-slate-600 rounded-full text-xs font-medium">
                  <Clock size={11} /> {path.duration} jam
                </span>
              )}
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                path?.status === 'published'
                  ? 'bg-green-100 text-green-700'
                  : path?.status === 'archived'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {path?.status ? path.status.charAt(0).toUpperCase() + path.status.slice(1) : 'Draft'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        {/* Modules section */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-teal-600" />
              <h2 className="font-bold text-slate-900 text-sm">Modules in this Path</h2>
              <span className="px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full text-xs font-semibold">
                {modules.length}
              </span>
            </div>
            <button
              onClick={() => setShowPicker(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <Plus size={14} /> Add Module
            </button>
          </div>

          {modules.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Layers className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No modules yet</p>
              <p className="text-xs mt-1">Click "Add Module" to pick from your existing modules</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {modules.map((module, idx) => (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">{module.title}</p>
                    {module.description && (
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{module.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      {module.lessons_count != null && (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <BookOpen size={11} /> {module.lessons_count ?? module.lessons ?? 0} lessons
                        </span>
                      )}
                      {module.level && (
                        <span className="text-xs text-slate-400 capitalize">{module.level}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(module.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Remove from path"
                  >
                    <Trash2 size={15} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Module picker modal */}
      <AnimatePresence>
        {showPicker && (
          <ModulePicker
            attachedIds={modules.map(m => m.id)}
            onAdd={handleAdd}
            onClose={() => setShowPicker(false)}
          />
        )}
      </AnimatePresence>
    </main>
  )
}

// ─── Module picker modal ──────────────────────────────────────────────────────

function ModulePicker({ attachedIds, onAdd, onClose }) {
  const [allModules, setAllModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [adding, setAdding] = useState(null)

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get('/api/trainer/modules', {
          headers: { Authorization: `Bearer ${token}` },
        })
        setAllModules(res.data.modules || res.data.data || [])
      } catch (e) {
        console.error('Failed to fetch modules', e)
      } finally {
        setLoading(false)
      }
    }
    fetchModules()
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return allModules
    const q = search.toLowerCase()
    return allModules.filter(m =>
      m.title?.toLowerCase().includes(q) || m.description?.toLowerCase().includes(q)
    )
  }, [allModules, search])

  const handleAdd = async (module) => {
    setAdding(module.id)
    await onAdd(module)
    setAdding(null)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg max-h-[80vh] flex flex-col pointer-events-auto">
          {/* Modal header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="font-bold text-slate-900">Add Module</h2>
              <p className="text-xs text-slate-500 mt-0.5">Pick from your existing modules</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-slate-500"
            >
              <X size={18} />
            </button>
          </div>

          {/* Search */}
          <div className="px-6 py-3 border-b border-gray-100">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search modules..."
                className="w-full pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                autoFocus
              />
            </div>
          </div>

          {/* Module list */}
          <div className="flex-1 overflow-y-auto py-2">
            {loading ? (
              <div className="text-center py-8 text-slate-400 text-sm">Loading modules...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">{search ? 'No modules match your search' : 'No modules found'}</p>
              </div>
            ) : (
              filtered.map(module => {
                const isAttached = attachedIds.includes(module.id)
                return (
                  <div
                    key={module.id}
                    className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                      isAttached ? 'opacity-50' : 'hover:bg-gray-50 cursor-pointer'
                    }`}
                    onClick={() => !isAttached && handleAdd(module)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                      <BookOpen size={14} className="text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{module.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {module.lessons ?? module.lessons_count ?? 0} lessons
                        {module.level ? ` · ${module.level}` : ''}
                      </p>
                    </div>
                    {isAttached ? (
                      <span className="flex items-center gap-1 text-xs text-green-600 font-semibold flex-shrink-0">
                        <CheckCircle2 size={14} /> Added
                      </span>
                    ) : adding === module.id ? (
                      <span className="text-xs text-slate-400 flex-shrink-0">Adding...</span>
                    ) : (
                      <Plus size={16} className="text-slate-400 flex-shrink-0" />
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </motion.div>
    </>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDuration(dur) {
  if (!dur) return null
  if (typeof dur === 'string' && isNaN(Number(dur))) return dur
  const hours = Number(dur)
  if (hours <= 0) return null
  if (hours >= 168) return `${Math.round(hours / 168)} Minggu`
  if (hours >= 24) return `${Math.round(hours / 24)} Hari`
  return `${hours} Jam`
}

// ─── Staff view (progress-based) ─────────────────────────────────────────────

function StaffView({ pathId }) {
  const navigate = useNavigate()
  const [pathData, setPathData] = useState(null)
  const [selectedModule, setSelectedModule] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [pathId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const res = await axios.get(`/api/user/learning-paths/${pathId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = {
        ...res.data.path,
        modules: res.data.modules || [],
      }
      setPathData(data)
      setSelectedModule(data.modules[0] || null)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <main className="flex-1 overflow-y-auto bg-white"><div className="text-center py-12 text-slate-600">Loading...</div></main>
  }

  const totalLessons = pathData?.modules.reduce((sum, m) => sum + (m.lessons || 0), 0) || 0
  const completedLessons = pathData?.modules.reduce((sum, m) => sum + (m.lessons_completed || 0), 0) || 0
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  return (
    <main className="flex-1 overflow-y-auto bg-white">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <button onClick={() => navigate('/learning-path')} className="flex items-center gap-2 text-slate-700 hover:text-slate-900 mb-4 font-semibold">
            <ArrowLeft size={20} /> Back
          </button>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">{pathData?.title}</h1>
          <p className="text-slate-600 max-w-2xl">{pathData?.description}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2">
            <div className="mb-12">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-slate-900">Your Progress</h3>
                <span className="text-sm font-bold text-slate-700">{progressPercentage}%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div animate={{ width: `${progressPercentage}%` }} transition={{ duration: 0.5 }} className="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full" />
              </div>
            </div>

            <div className="space-y-4">
              {pathData?.modules.map((module, idx) => {
                // A module is locked if the previous module is not yet completed
                const isLocked = idx > 0 && !pathData.modules[idx - 1].completed
                return (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative"
                  >
                    {/* connector line */}
                    {idx < pathData.modules.length - 1 && (
                      <div className={`absolute left-6 top-full w-0.5 h-4 z-10 ${
                        module.completed
                          ? 'bg-gradient-to-b from-teal-400 to-teal-200'
                          : 'bg-gradient-to-b from-gray-300 to-gray-200'
                      }`} />
                    )}

                    <button
                      onClick={() => !isLocked && setSelectedModule(module)}
                      disabled={isLocked}
                      className={`w-full rounded-xl border transition-all text-left shadow-sm ${
                        isLocked
                          ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                          : selectedModule?.id === module.id
                          ? 'border-teal-400 bg-teal-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-teal-200 hover:shadow-md'
                      }`}
                    >
                      {/* Langkah label bar */}
                      <div className="flex items-center justify-between px-5 pt-4 pb-2">
                        <div className={`flex items-center gap-1.5 ${isLocked ? 'text-slate-400' : 'text-slate-500'}`}>
                          <Milestone size={14} />
                          <span className="text-xs font-semibold uppercase tracking-wide">
                            Langkah {module.stage}
                          </span>
                        </div>
                        {isLocked ? (
                          <span className="flex items-center gap-1 text-xs font-semibold text-slate-400">
                            <Lock size={13} /> Terkunci
                          </span>
                        ) : module.completed ? (
                          <span className="flex items-center gap-1 text-xs font-semibold text-teal-600">
                            <CheckCircle2 size={14} /> Selesai
                          </span>
                        ) : null}
                      </div>

                      {/* Module content */}
                      <div className="px-5 pb-5">
                        <h3 className={`text-lg font-bold mb-3 ${isLocked ? 'text-slate-400' : 'text-slate-900'}`}>
                          {module.title}
                        </h3>
                        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-slate-500 mb-3">
                          {formatDuration(module.duration) && (
                            <span className="flex items-center gap-1.5">
                              <Clock size={14} className="text-slate-400" />
                              {formatDuration(module.duration)}
                            </span>
                          )}
                          {module.level && (
                            <span className="flex items-center gap-1.5">
                              <BarChart2 size={14} className="text-slate-400" />
                              {module.level}
                            </span>
                          )}
                          <span className="flex items-center gap-1.5">
                            <BookOpen size={14} className="text-slate-400" />
                            {module.lessons ?? 0} Lessons
                          </span>
                        </div>
                        {/* Per-module progress bar (only when not locked and has progress) */}
                        {!isLocked && module.progress > 0 && (
                          <div>
                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <motion.div
                                animate={{ width: `${module.progress}%` }}
                                transition={{ duration: 0.5 }}
                                className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full"
                              />
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              {module.lessons_completed}/{module.lessons} lessons selesai
                            </p>
                          </div>
                        )}
                        {/* Lock explanation */}
                        {isLocked && (
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Lock size={11} />
                            Selesaikan Langkah {module.stage - 1} terlebih dahulu
                          </p>
                        )}
                      </div>
                    </button>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {selectedModule && (
            <motion.div key={selectedModule.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="col-span-1 sticky top-32">
              <div className="bg-gradient-to-br from-slate-50 to-white border border-gray-200 rounded-lg p-8 space-y-6">
                <div>
                  <div className="flex items-center gap-1.5 text-slate-400 mb-2">
                    <Milestone size={13} />
                    <span className="text-xs font-semibold uppercase tracking-wide">Langkah {selectedModule.stage}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">{selectedModule.title}</h2>
                  {selectedModule.description && (
                    <p className="text-slate-600 leading-relaxed text-sm">{selectedModule.description}</p>
                  )}
                </div>
                <div className="border-t border-gray-200 pt-6 space-y-3">
                  {formatDuration(selectedModule.duration) && (
                    <div className="flex items-center justify-between"><span className="text-slate-600 text-sm">Durasi Belajar</span><span className="font-semibold text-slate-900">{formatDuration(selectedModule.duration)}</span></div>
                  )}
                  <div className="flex items-center justify-between"><span className="text-slate-600 text-sm">Total Lessons</span><span className="font-semibold text-slate-900">{selectedModule.lessons ?? 0} Lessons</span></div>
                  {selectedModule.level && (
                    <div className="flex items-center justify-between"><span className="text-slate-600 text-sm">Level</span><span className="font-semibold text-slate-900 capitalize">{selectedModule.level}</span></div>
                  )}
                </div>
                {(() => {
                  const moduleIdx = pathData?.modules.findIndex(m => m.id === selectedModule.id) ?? 0
                  const isSelectedLocked = moduleIdx > 0 && !pathData?.modules[moduleIdx - 1]?.completed
                  return isSelectedLocked ? (
                    <div className="w-full py-3 rounded-lg bg-gray-100 text-slate-400 font-semibold flex items-center justify-center gap-2 cursor-not-allowed">
                      <Lock size={16} /> Terkunci
                    </div>
                  ) : (
                    <button
                      onClick={() => navigate(`/courses/${selectedModule.id}`)}
                      className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                        selectedModule.completed
                          ? 'bg-gray-100 text-slate-600 hover:bg-gray-200'
                          : 'bg-teal-500 hover:bg-teal-600 text-white'
                      }`}
                    >
                      <Play size={18} />
                      {selectedModule.completed ? 'Buka Modul' : 'Mulai Belajar'}
                    </button>
                  )
                })()}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  )
}

// ─── Root: detect route and delegate ─────────────────────────────────────────

export default function LearningPathDetail() {
  const { pathId } = useParams()
  const { pathname } = useLocation()
  const isTrainer = pathname.startsWith('/trainer/')
  return isTrainer ? <TrainerView pathId={pathId} /> : <StaffView pathId={pathId} />
}
