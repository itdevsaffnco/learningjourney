import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, BookOpen, Clock, ArrowRight, Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'

export default function LearningPathManager() {
  const navigate = useNavigate()
  const [paths, setPaths] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteModal, setDeleteModal] = useState({ show: false, pathId: null, pathName: null })
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_role: '',
    target_division: '',
    duration: { value: '', unit: 'hours' },
  })

  const filteredPaths = paths.filter(path =>
    path.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    path.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    fetchPaths()
  }, [])

  // Refetch when component becomes visible (user navigates back from detail page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchPaths()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const fetchPaths = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/trainer/learning-paths', {
        headers: { Authorization: `Bearer ${token}` },
      })
      console.log('Fetch paths response:', response.data)
      setPaths(response.data.paths || [])
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch learning paths:', error.response?.data || error.message)
      setPaths([])
      setLoading(false)
    }
  }

  const handleCreatePath = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')

      // Convert duration to hours
      let durationHours = 0
      if (formData.duration.value) {
        const value = parseInt(formData.duration.value)
        switch (formData.duration.unit) {
          case 'days':
            durationHours = value * 24
            break
          case 'weeks':
            durationHours = value * 7 * 24
            break
          default:
            durationHours = value
        }
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        target_role: formData.target_role,
        target_division: formData.target_division,
        duration: durationHours,
      }

      const response = await axios.post('/api/trainer/learning-paths', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      console.log('Create response:', response.data)
      setFormData({
        title: '',
        description: '',
        target_role: '',
        target_division: '',
        duration: { value: '', unit: 'hours' },
      })
      setShowCreateForm(false)
      await new Promise(resolve => setTimeout(resolve, 500))
      await fetchPaths()
    } catch (error) {
      console.error('Error creating path:', error.response?.data || error.message)
      const errorMsg = error.response?.data?.message || error.response?.data?.errors || 'Failed to create learning path'
      alert('Error: ' + (typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg))
    }
  }

  const handleDeletePath = async () => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/trainer/learning-paths/${deleteModal.pathId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setDeleteModal({ show: false, pathId: null, pathName: null })
      await fetchPaths()
    } catch (error) {
      console.error('Error deleting path:', error)
      alert('Failed to delete learning path')
    }
  }

  return (
    <main className="flex-1 overflow-y-auto bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Learning Paths</h1>
            <p className="text-slate-600 mt-2 text-sm">Create and manage your learning paths</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 px-6 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors duration-200"
          >
            <Plus className="w-5 h-5" />
            Create Path
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Create Form */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-gray-200 rounded-lg bg-white p-8 mb-8 shadow-sm"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-6">Create New Learning Path</h2>
            <form onSubmit={handleCreatePath} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Path Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Sales Associate Training"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900 placeholder-slate-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What will students learn in this path?"
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900 placeholder-slate-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Target Division</label>
                  <input
                    type="text"
                    value={formData.target_division}
                    onChange={(e) => setFormData({ ...formData, target_division: e.target.value })}
                    placeholder="e.g., Sales"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900 placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Target Role</label>
                  <input
                    type="text"
                    value={formData.target_role}
                    onChange={(e) => setFormData({ ...formData, target_role: e.target.value })}
                    placeholder="e.g., Sales Associate"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900 placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">Duration</label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    min="1"
                    value={formData.duration.value}
                    onChange={(e) => setFormData({
                      ...formData,
                      duration: { ...formData.duration, value: e.target.value }
                    })}
                    placeholder="e.g., 4"
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900"
                  />
                  <select
                    value={formData.duration.unit}
                    onChange={(e) => setFormData({
                      ...formData,
                      duration: { ...formData.duration, unit: e.target.value }
                    })}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900 bg-white"
                  >
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-2 text-slate-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors"
                >
                  Create Path
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Search Section */}
        <div className="mb-8 space-y-5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search learning paths..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900 placeholder-slate-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Delete Modal */}
        <AnimatePresence>
          {deleteModal.show && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDeleteModal({ show: false, pathId: null, pathName: null })}
                className="fixed inset-0 bg-black/50 z-40"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 flex items-center justify-center z-50 p-4"
              >
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-md w-full">
                  <div className="p-6 space-y-4">
                    <h3 className="text-lg font-bold text-slate-900">Delete Learning Path?</h3>
                    <p className="text-slate-600 text-sm">
                      Are you sure you want to delete "{deleteModal.pathName}"? This action cannot be undone.
                    </p>
                  </div>
                  <div className="flex gap-4 p-6 border-t border-gray-200">
                    <button
                      onClick={() => setDeleteModal({ show: false, pathId: null, pathName: null })}
                      className="flex-1 px-4 py-3 border border-gray-200 text-slate-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeletePath}
                      className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Paths Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12 text-slate-600">Loading...</div>
          ) : filteredPaths.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-slate-600">No learning paths found. Create your first path!</p>
            </div>
          ) : (
            filteredPaths.map((path, idx) => (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col"
              >
                <div className="p-6 flex flex-col flex-1">
                  {/* Title and Info */}
                  <div className="mb-5">
                    <h3 className="font-bold text-lg text-slate-900 leading-tight mb-2">{path.title}</h3>
                    <p className="text-sm text-slate-600 line-clamp-2">{path.description}</p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-slate-700 rounded-lg">
                          <BookOpen className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs font-medium text-slate-600">Modules</span>
                      </div>
                      <p className="text-lg font-bold text-slate-900">{path.modules_count || 0}</p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-slate-700 rounded-lg">
                          <Clock className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs font-medium text-slate-600">Duration</span>
                      </div>
                      <p className="text-lg font-bold text-slate-900">{path.duration > 0 ? `${path.duration}h` : '-'}</p>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="space-y-2 mt-auto">
                    <button
                      onClick={() => navigate(`/trainer/learning-paths/${path.id}`)}
                      className="w-full py-3 bg-slate-700 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 group/btn"
                    >
                      View & Manage
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                    <button
                      onClick={() => setDeleteModal({ show: true, pathId: path.id, pathName: path.title })}
                      className="w-full py-2 border border-gray-200 text-slate-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}
