import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit2, Trash2, BookOpen, Users, ArrowRight, Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const DIVISIONS = [
  { id: null, name: 'All Divisions' },
  { id: 'beauty_advisor', name: 'Beauty Advisor' },
  { id: 'host_live', name: 'Host Live' },
  { id: 'customer_service', name: 'Customer Service' },
]

export default function ModuleManager() {
  const navigate = useNavigate()
  const [modules, setModules] = useState([])
  const [divisions, setDivisions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [deleteModal, setDeleteModal] = useState({ show: false, moduleId: null, moduleName: null })
  const [editModal, setEditModal] = useState(null) // holds module being edited
  const [formData, setFormData] = useState({
    title: '',
    level: 'easy',
    description: '',
    duration: '',
    objectives: '',
    division_ids: [],
  })

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLevel = selectedLevel === 'all' || module.level === selectedLevel
    return matchesSearch && matchesLevel
  })

  useEffect(() => {
    fetchModules()
    fetchDivisions()
  }, [])

  const fetchDivisions = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/divisions', { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setDivisions(data.data || data.divisions || [])
      }
    } catch {}
  }

  const toggleDivision = (id) => {
    setFormData(prev => {
      const ids = prev.division_ids || []
      return {
        ...prev,
        division_ids: ids.includes(id) ? ids.filter(d => d !== id) : [...ids, id],
      }
    })
  }

  const divisionLabel = (module) => {
    if (!module.division_ids || module.division_ids.length === 0) return 'All Divisions'
    return module.division_ids
      .map(id => divisions.find(d => d.id === id)?.name || id)
      .join(', ')
  }

  const fetchModules = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/trainer/modules', {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setModules(data.modules || [])
        setLoading(false)
        return
      }

      setModules([])
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch modules:', error)
      setLoading(false)
    }
  }

  const handleCreateModule = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/trainer/modules', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormData({ title: '', level: 'easy', description: '', duration: '', objectives: '', division_ids: [] })
        setShowCreateForm(false)
        await fetchModules()
      } else {
        const error = await response.json()
        console.error('Failed to create module:', error)
        alert('Failed to create module. Please check the form and try again.')
      }
    } catch (error) {
      console.error('Error creating module:', error)
      alert('An error occurred. Please try again.')
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleDeleteModule = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/trainer/modules/${deleteModal.moduleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setDeleteModal({ show: false, moduleId: null, moduleName: null })
        await fetchModules()
      } else {
        alert('Failed to delete module')
      }
    } catch (error) {
      console.error('Error deleting module:', error)
      alert('An error occurred while deleting the module')
    }
  }

  const handleEditModule = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/trainer/modules/${editModal.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editModal.title,
          level: editModal.level,
          description: editModal.description,
          duration: String(editModal.duration),
          objectives: editModal.objectives,
          division_ids: editModal.division_ids || [],
        }),
      })
      if (response.ok) {
        setEditModal(null)
        await fetchModules()
      }
    } catch (error) {
      console.error('Error updating module:', error)
    }
  }

  const openDeleteModal = (moduleId, moduleName) => {
    setDeleteModal({ show: true, moduleId, moduleName })
  }

  return (
    <main className="flex-1 overflow-y-auto bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Module Management</h1>
            <p className="text-slate-600 mt-2 text-sm">Create and manage your learning modules</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 px-6 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors duration-200"
          >
            <Plus className="w-5 h-5" />
            Create Module
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 relative z-5">
        {/* Create Module Form */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-gray-200 rounded-lg bg-white p-8 mb-8 shadow-sm"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-6">Create New Module</h2>
            <form onSubmit={handleCreateModule} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Module Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Advanced Blending Techniques"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900 placeholder-slate-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">Level</label>
                <div className="flex gap-3">
                  {['easy', 'medium', 'hard'].map(lvl => (
                    <label key={lvl} className="flex items-center gap-3 cursor-pointer px-4 py-3 border border-gray-200 rounded-lg flex-1 hover:border-slate-700 transition-colors"
                      style={{
                        borderColor: formData.level === lvl ? '#334155' : undefined,
                        backgroundColor: formData.level === lvl ? '#f8fafc' : 'transparent',
                      }}>
                      <input
                        type="radio"
                        name="level"
                        value={lvl}
                        checked={formData.level === lvl}
                        onChange={handleInputChange}
                        className="w-4 h-4"
                      />
                      <span className="font-medium text-slate-900 capitalize">{lvl}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="What will students learn in this module?"
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900 placeholder-slate-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="e.g., 4 weeks"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900 placeholder-slate-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Learning Objectives</label>
                  <input
                    type="text"
                    name="objectives"
                    value={formData.objectives}
                    onChange={handleInputChange}
                    placeholder="Key outcomes"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900 placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">Visible untuk Divisi</label>
                <div className="flex flex-wrap gap-2">
                  {divisions.map(div => {
                    const selected = (formData.division_ids || []).includes(div.id)
                    return (
                      <button
                        key={div.id}
                        type="button"
                        onClick={() => toggleDivision(div.id)}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                          selected
                            ? 'bg-slate-700 text-white border-slate-700'
                            : 'border-gray-200 text-slate-700 hover:bg-gray-50'
                        }`}
                      >
                        {div.name}
                      </button>
                    )
                  })}
                </div>
                {(formData.division_ids || []).length === 0 && (
                  <p className="text-xs text-slate-400 mt-2">Tidak dipilih = tampil untuk semua divisi</p>
                )}
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
                  Create Module
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Search and Filter Section */}
        <div className="mb-8 space-y-5">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search modules..."
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

          {/* Level Filter */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedLevel('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedLevel === 'all'
                  ? 'bg-slate-700 text-white'
                  : 'border border-gray-200 text-slate-700 hover:bg-gray-50'
              }`}
            >
              All Levels
            </button>
            <button
              onClick={() => setSelectedLevel('easy')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedLevel === 'easy'
                  ? 'bg-slate-700 text-white'
                  : 'border border-gray-200 text-slate-700 hover:bg-gray-50'
              }`}
            >
              Easy
            </button>
            <button
              onClick={() => setSelectedLevel('medium')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedLevel === 'medium'
                  ? 'bg-slate-700 text-white'
                  : 'border border-gray-200 text-slate-700 hover:bg-gray-50'
              }`}
            >
              Medium
            </button>
            <button
              onClick={() => setSelectedLevel('hard')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedLevel === 'hard'
                  ? 'bg-slate-700 text-white'
                  : 'border border-gray-200 text-slate-700 hover:bg-gray-50'
              }`}
            >
              Hard
            </button>
          </div>

          {/* Results Info */}
          {(searchQuery || selectedLevel !== 'all') && (
            <p className="text-sm text-slate-600">
              Found <span className="font-semibold text-slate-900">{filteredModules.length}</span> module{filteredModules.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((module, idx) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col relative"
            >
              {/* Level Badge */}
              {module.level && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 capitalize">
                    {module.level}
                  </span>
                </div>
              )}

              {/* Division Badge */}
              <div className="absolute top-4 right-4 z-10">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  !module.division_ids || module.division_ids.length === 0
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-purple-50 text-purple-700'
                }`}>
                  {divisionLabel(module)}
                </span>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-1">
                {/* Title and Description */}
                <div className="mb-5 pt-6">
                  <h3 className="font-bold text-lg text-slate-900 leading-tight mb-3">{module.title}</h3>
                  <p className="text-sm text-slate-600 line-clamp-2">{module.description}</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-slate-700" />
                      <span className="text-xs font-medium text-slate-600">Lessons</span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">{module.lessons}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-slate-700" />
                      <span className="text-xs font-medium text-slate-600">Students</span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">{module.students}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-slate-600">Level</span>
                    </div>
                    <p className="text-lg font-bold capitalize text-slate-900">{module.level}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-slate-700" />
                      <span className="text-xs font-medium text-slate-600">Duration</span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">
                      {module.duration > 0 ? `${module.duration} hrs` : '-'}
                    </p>
                  </div>
                </div>

                {/* Quiz & Assignment */}
                <div className="flex gap-3 mb-6">
                  <div className="flex-1 border border-gray-200 rounded-lg p-3 text-center">
                    <p className="text-xs font-medium text-slate-700">{module.quizzes} Quiz</p>
                  </div>
                  <div className="flex-1 border border-gray-200 rounded-lg p-3 text-center">
                    <p className="text-xs font-medium text-slate-700">{module.assignments} Assign</p>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-2 mt-auto">
                  <button
                    onClick={() => navigate(`/trainer/modules/${module.id}/lessons`)}
                    className="w-full py-3 bg-slate-700 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 group/btn"
                  >
                    View & Manage
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => setEditModal({ ...module, division_ids: module.division_ids || [] })}
                    className="w-full py-2 border border-gray-200 text-slate-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => openDeleteModal(module.id, module.title)}
                    className="w-full py-2 border border-gray-200 text-slate-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredModules.length === 0 && modules.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-700">No modules yet. Create your first module to get started!</p>
          </div>
        )}

        {filteredModules.length === 0 && modules.length > 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-700">No modules match your search or filter criteria.</p>
          </div>
        )}
      </div>

      {/* Edit Module Modal */}
      <AnimatePresence>
        {editModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-slate-900">Edit Module</h3>
                <button onClick={() => setEditModal(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              <form onSubmit={handleEditModule} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Module Title</label>
                  <input type="text" value={editModal.title}
                    onChange={e => setEditModal({ ...editModal, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3">Level</label>
                  <div className="flex gap-3">
                    {['easy', 'medium', 'hard'].map(lvl => (
                      <label key={lvl} className={`flex items-center gap-2 cursor-pointer px-4 py-2.5 border rounded-lg flex-1 transition-colors ${editModal.level === lvl ? 'border-slate-700 bg-slate-50' : 'border-gray-200 hover:border-slate-300'}`}>
                        <input type="radio" name="edit-level" value={lvl} checked={editModal.level === lvl}
                          onChange={() => setEditModal({ ...editModal, level: lvl })} className="w-4 h-4" />
                        <span className="font-medium text-slate-900 capitalize text-sm">{lvl}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Description</label>
                  <textarea value={editModal.description}
                    onChange={e => setEditModal({ ...editModal, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900 resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Duration</label>
                    <input type="text" value={editModal.duration}
                      onChange={e => setEditModal({ ...editModal, duration: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Objectives</label>
                    <input type="text" value={editModal.objectives || ''}
                      onChange={e => setEditModal({ ...editModal, objectives: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3">Visible untuk Divisi</label>
                  <div className="flex flex-wrap gap-2">
                    {divisions.map(div => {
                      const selected = (editModal.division_ids || []).includes(div.id)
                      return (
                        <button key={div.id} type="button"
                          onClick={() => {
                            const ids = editModal.division_ids || []
                            setEditModal({
                              ...editModal,
                              division_ids: ids.includes(div.id) ? ids.filter(d => d !== div.id) : [...ids, div.id],
                            })
                          }}
                          className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${selected ? 'bg-slate-700 text-white border-slate-700' : 'border-gray-200 text-slate-700 hover:bg-gray-50'}`}
                        >
                          {div.name}
                        </button>
                      )
                    })}
                  </div>
                  {(editModal.division_ids || []).length === 0 && (
                    <p className="text-xs text-slate-400 mt-2">Tidak dipilih = tampil untuk semua divisi</p>
                  )}
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button type="button" onClick={() => setEditModal(null)}
                    className="px-6 py-2 text-slate-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                  >Cancel</button>
                  <button type="submit"
                    className="px-6 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors"
                  >Save Changes</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.show && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteModal({ show: false, moduleId: null, moduleName: null })}
              className="fixed inset-0 bg-black/40 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-8 border border-gray-200">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-gray-100 rounded-full mb-4">
                  <Trash2 className="w-6 h-6 text-slate-700" />
                </div>

                <h3 className="text-lg font-bold text-slate-900 text-center mb-2">
                  Delete Module?
                </h3>

                <p className="text-slate-600 text-center mb-8 text-sm">
                  Are you sure you want to delete <span className="font-semibold">{deleteModal.moduleName}</span>? This action cannot be undone.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteModal({ show: false, moduleId: null, moduleName: null })}
                    className="flex-1 py-3 px-4 border border-gray-200 text-slate-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteModule}
                    className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  )
}
