import { useState } from 'react'
import { Plus, X, Save, Medal, Calendar, Users } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AssignmentBuilder() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [assignments, setAssignments] = useState([
    {
      id: 1,
      title: 'Fragrance Blending Project',
      module: 'Fragrance Basics',
      type: 'Project',
      points: 100,
      dueDate: '2026-07-15',
      submissions: 12,
    },
    {
      id: 2,
      title: 'Product Formulation Report',
      module: 'Product Formulation',
      type: 'Report',
      points: 50,
      dueDate: '2026-07-20',
      submissions: 5,
    },
  ])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    module: '',
    type: 'project',
    points: 100,
    dueDate: '',
    instructions: '',
  })

  const [rubric, setRubric] = useState([
    { criterion: '', maxPoints: 25, weight: 25 },
    { criterion: '', maxPoints: 25, weight: 25 },
    { criterion: '', maxPoints: 25, weight: 25 },
    { criterion: '', maxPoints: 25, weight: 25 },
  ])

  const handleCreateAssignment = (e) => {
    e.preventDefault()
    // Create assignment API call
    setFormData({
      title: '',
      description: '',
      module: '',
      type: 'project',
      points: 100,
      dueDate: '',
      instructions: '',
    })
    setShowCreateForm(false)
  }

  const updateRubric = (index, field, value) => {
    const newRubric = [...rubric]
    newRubric[index] = { ...newRubric[index], [field]: value }
    setRubric(newRubric)
  }

  return (
    <main className="flex-1 overflow-y-auto bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100">
      {/* Header */}
      <div className="glass sticky top-0 z-10 mx-4 mt-4 mb-4">
        <div className="px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-purple-900">Assignment Builder</h1>
            <p className="text-stone-600 mt-1">Create assignments with rubrics for consistent grading</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-amber-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Create Assignment
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 relative z-5">
        {/* Create Assignment Form */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-purple-900">Create New Assignment</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-stone-600" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment}>
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="font-bold text-purple-900 mb-4">Assignment Details</h3>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Fragrance Blending Project"
                      className="glass-input w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Module</label>
                    <select
                      value={formData.module}
                      onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                      className="glass-input w-full"
                    >
                      <option value="">Select module...</option>
                      <option value="Fragrance Basics">Fragrance Basics</option>
                      <option value="Blending Techniques">Blending Techniques</option>
                      <option value="Product Formulation">Product Formulation</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="glass-input w-full"
                      >
                        <option value="project">Project</option>
                        <option value="essay">Essay</option>
                        <option value="report">Report</option>
                        <option value="presentation">Presentation</option>
                        <option value="practical">Practical</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Max Points</label>
                      <input
                        type="number"
                        value={formData.points}
                        onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                        className="glass-input w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="glass-input w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of the assignment"
                      rows="2"
                      className="glass-input w-full"
                    />
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-4">
                  <h3 className="font-bold text-purple-900 mb-4">Instructions</h3>
                  <textarea
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    placeholder="Detailed instructions for students..."
                    rows="10"
                    className="glass-input w-full"
                  />
                </div>
              </div>

              {/* Grading Rubric */}
              <div className="border-t border-white/60 pt-8 mb-8">
                <h3 className="font-bold text-purple-900 mb-4">Grading Rubric</h3>
                <p className="text-sm text-stone-600 mb-4">Define criteria and their point values for consistent grading</p>

                <div className="space-y-3">
                  {rubric.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-3 items-end">
                      <input
                        type="text"
                        value={item.criterion}
                        onChange={(e) => updateRubric(idx, 'criterion', e.target.value)}
                        placeholder={`Criterion ${idx + 1} (e.g., Creativity)`}
                        className="glass-input col-span-6"
                      />
                      <input
                        type="number"
                        value={item.maxPoints}
                        onChange={(e) => updateRubric(idx, 'maxPoints', parseInt(e.target.value))}
                        placeholder="Points"
                        className="glass-input col-span-3"
                      />
                      <span className="text-sm text-stone-600 col-span-3">
                        {Math.round((item.maxPoints / formData.points) * 100)}%
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm text-stone-700">
                    <span className="font-semibold">Total Points:</span>{' '}
                    {rubric.reduce((sum, item) => sum + (parseInt(item.maxPoints) || 0), 0)} / {formData.points}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-6 border-t border-white/60">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-stone-700 hover:bg-white/50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-amber-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <Save className="w-4 h-4" />
                  Create Assignment
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Assignments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignments.map((assignment, idx) => (
            <motion.div
              key={assignment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card overflow-hidden group hover:shadow-lg transition-all"
            >
              <div className="h-16 bg-gradient-to-r from-amber-600 to-orange-600 flex items-center px-6">
                <Medal className="w-5 h-5 text-white mr-3" />
                <h3 className="text-lg font-bold text-white">{assignment.title}</h3>
              </div>

              <div className="p-6">
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-600 text-sm">Module:</span>
                    <span className="text-purple-900 font-semibold">{assignment.module}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-600 text-sm">Type:</span>
                    <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs font-semibold">
                      {assignment.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-600 text-sm">Max Points:</span>
                    <span className="text-purple-900 font-semibold">{assignment.points}</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-600 text-sm">
                    <Calendar className="w-4 h-4" />
                    Due: {assignment.dueDate}
                  </div>
                  <div className="flex items-center gap-2 text-stone-600 text-sm">
                    <Users className="w-4 h-4" />
                    {assignment.submissions} submissions
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors font-medium text-sm">
                    Edit
                  </button>
                  <button className="flex-1 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium text-sm">
                    Grade
                  </button>
                  <button className="flex-1 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium text-sm">
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  )
}
