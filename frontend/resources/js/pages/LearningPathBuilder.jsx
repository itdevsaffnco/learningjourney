import { useState, useEffect } from 'react'
import { Plus, Trash2, GripVertical, FileText, BookOpen, ArrowDown, Save } from 'lucide-react'
import { motion } from 'framer-motion'

export default function LearningPathBuilder() {
  const [paths, setPaths] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [availableModules, setAvailableModules] = useState([])
  const [selectedModules, setSelectedModules] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetDivision: '',
    targetRole: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    // Fetch available modules and existing paths
    setAvailableModules([
      { id: 1, title: 'Fragrance Basics', duration: '4 weeks', lessons: 8 },
      { id: 2, title: 'Blending Techniques', duration: '6 weeks', lessons: 12 },
      { id: 3, title: 'Product Formulation', duration: '8 weeks', lessons: 16 },
      { id: 4, title: 'Customer Relations', duration: '3 weeks', lessons: 6 },
      { id: 5, title: 'Sales Strategies', duration: '5 weeks', lessons: 10 },
    ])

    setPaths([
      {
        id: 1,
        title: 'New Employee Onboarding',
        description: 'Complete path for new sales staff',
        modules: [1, 2],
        targetDivision: 'Sales',
        duration: '10 weeks',
        students: 15,
      },
      {
        id: 2,
        title: 'Advanced Perfumery',
        description: 'For experienced fragrance professionals',
        modules: [2, 3],
        targetDivision: 'HQ',
        duration: '14 weeks',
        students: 8,
      },
    ])
  }

  const toggleModule = (moduleId) => {
    setSelectedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    )
  }

  const handleCreatePath = (e) => {
    e.preventDefault()
    // Create path API call here
    setFormData({ title: '', description: '', targetDivision: '', targetRole: '' })
    setSelectedModules([])
    setShowCreateForm(false)
    fetchData()
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const getModuleTitle = (moduleId) => {
    return availableModules.find(m => m.id === moduleId)?.title || 'Unknown Module'
  }

  return (
    <main className="flex-1 overflow-y-auto bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100">
      {/* Header */}
      <div className="glass sticky top-0 z-10 mx-4 mt-4 mb-4">
        <div className="px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-purple-900">Learning Paths</h1>
            <p className="text-stone-600 mt-1">Create structured learning journeys by combining modules</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-amber-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Create Path
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 relative z-5">
        {/* Create Form */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card mb-8"
          >
            <h2 className="text-2xl font-bold text-purple-900 mb-6">Create New Learning Path</h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Left: Path Details */}
              <div className="space-y-4">
                <h3 className="font-bold text-purple-900 mb-4">Path Details</h3>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Path Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., New Trainer Certification"
                    className="glass-input w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="What is this learning path for?"
                    rows="3"
                    className="glass-input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Target Division</label>
                  <select
                    name="targetDivision"
                    value={formData.targetDivision}
                    onChange={handleInputChange}
                    className="glass-input w-full"
                  >
                    <option value="">Select division...</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="HQ">HQ</option>
                    <option value="R&D">R&D</option>
                    <option value="Retail BA">Retail BA</option>
                  </select>
                </div>
              </div>

              {/* Right: Module Selection */}
              <div>
                <h3 className="font-bold text-purple-900 mb-4">Select Modules (in order)</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {availableModules.map(module => (
                    <label
                      key={module.id}
                      className="flex items-center gap-3 p-3 bg-white/40 border-2 border-white/60 rounded-lg hover:bg-white/50 cursor-pointer transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={selectedModules.includes(module.id)}
                        onChange={() => toggleModule(module.id)}
                        className="w-5 h-5 text-purple-600 rounded cursor-pointer"
                      />
                      <BookOpen className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-stone-900">{module.title}</p>
                        <p className="text-xs text-stone-600">{module.lessons} lessons • {module.duration}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Modules Preview */}
            {selectedModules.length > 0 && (
              <div className="mt-6 pt-6 border-t border-white/60">
                <h3 className="font-bold text-purple-900 mb-3">Learning Sequence</h3>
                <div className="space-y-2">
                  {selectedModules.map((moduleId, idx) => (
                    <motion.div
                      key={moduleId}
                      layout
                      className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg"
                    >
                      <span className="flex items-center justify-center w-6 h-6 bg-purple-600 text-white text-xs font-bold rounded-full">
                        {idx + 1}
                      </span>
                      <GripVertical className="w-4 h-4 text-stone-400" />
                      <div className="flex-1">
                        <p className="font-medium text-stone-900">{getModuleTitle(moduleId)}</p>
                      </div>
                      <button
                        onClick={() => toggleModule(moduleId)}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </motion.div>
                  ))}
                  {selectedModules.length > 1 && (
                    <p className="text-xs text-stone-600 text-center mt-2">
                      Total duration: ~{selectedModules.length * 5} weeks
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-end mt-6 pt-6 border-t border-white/60">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false)
                  setSelectedModules([])
                }}
                className="px-4 py-2 text-stone-700 hover:bg-white/50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePath}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-amber-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                <Save className="w-4 h-4" />
                Create Path
              </button>
            </div>
          </motion.div>
        )}

        {/* Existing Paths */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paths.map((path, idx) => (
            <motion.div
              key={path.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card overflow-hidden"
            >
              {/* Header */}
              <div className="h-16 bg-gradient-to-r from-purple-600 to-amber-600 flex items-center px-6">
                <FileText className="w-5 h-5 text-white mr-3" />
                <h3 className="text-lg font-bold text-white">{path.title}</h3>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-sm text-stone-600 mb-4">{path.description}</p>

                {/* Division & Students */}
                <div className="flex gap-4 mb-4 text-xs">
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-semibold">
                    {path.targetDivision}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold">
                    {path.students} students
                  </span>
                </div>

                {/* Module Sequence */}
                <div className="space-y-2 mb-4">
                  {path.modules.map((moduleId, idx) => (
                    <div key={moduleId} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-purple-600 bg-purple-100 w-5 h-5 flex items-center justify-center rounded-full">
                        {idx + 1}
                      </span>
                      <span className="text-sm text-stone-700">{getModuleTitle(moduleId)}</span>
                      {idx < path.modules.length - 1 && (
                        <ArrowDown className="w-3 h-3 text-stone-400 ml-2" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Duration */}
                <div className="pt-4 border-t border-white/60">
                  <p className="text-xs text-stone-600">Total duration: <span className="font-bold text-stone-900">{path.duration}</span></p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <button className="flex-1 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors font-medium text-sm">
                    Edit Path
                  </button>
                  <button className="flex-1 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium text-sm">
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {paths.length === 0 && !showCreateForm && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-stone-400 mx-auto mb-3" />
            <p className="text-stone-600">No learning paths yet. Create one to help students follow a structured learning journey!</p>
          </div>
        )}
      </div>
    </main>
  )
}
