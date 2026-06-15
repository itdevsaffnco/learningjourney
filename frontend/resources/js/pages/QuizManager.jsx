import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, BookOpen, Clock, ArrowRight, Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'

export default function QuizManager() {
  const navigate = useNavigate()
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteModal, setDeleteModal] = useState({ show: false, quizId: null, quizName: null })
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    passing_score: '',
    time_limit: '',
  })

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quiz.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    fetchQuizzes()
  }, [])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchQuizzes()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const fetchQuizzes = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/trainer/quizzes', {
        headers: { Authorization: `Bearer ${token}` },
      })
      console.log('Fetch quizzes response:', response.data)
      setQuizzes(response.data.quizzes || [])
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch quizzes:', error.response?.data || error.message)
      setQuizzes([])
      setLoading(false)
    }
  }

  const handleCreateQuiz = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      await axios.post('/api/trainer/quizzes', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      setFormData({ title: '', description: '', passing_score: '', time_limit: '' })
      setShowCreateForm(false)
      await fetchQuizzes()
    } catch (error) {
      console.error('Error creating quiz:', error.response?.data || error.message)
      alert('Failed to create quiz')
    }
  }

  const handleDeleteQuiz = async () => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/trainer/quizzes/${deleteModal.quizId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setDeleteModal({ show: false, quizId: null, quizName: null })
      await fetchQuizzes()
    } catch (error) {
      console.error('Error deleting quiz:', error)
      alert('Failed to delete quiz')
    }
  }

  return (
    <main className="flex-1 overflow-y-auto bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Quizzes</h1>
            <p className="text-slate-600 mt-2 text-sm">Create and manage your quizzes</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 px-6 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors duration-200"
          >
            <Plus className="w-5 h-5" />
            Create Quiz
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
            <h2 className="text-xl font-bold text-slate-900 mb-6">Create New Quiz</h2>
            <form onSubmit={handleCreateQuiz} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Quiz Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Fragrance Basics Test"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900 placeholder-slate-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What will students be tested on?"
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900 placeholder-slate-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Passing Score (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.passing_score}
                    onChange={(e) => setFormData({ ...formData, passing_score: e.target.value })}
                    placeholder="e.g., 70"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900 placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Time Limit (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.time_limit}
                    onChange={(e) => setFormData({ ...formData, time_limit: e.target.value })}
                    placeholder="e.g., 30"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900 placeholder-slate-500"
                  />
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
                  Create Quiz
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
              placeholder="Search quizzes..."
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
                onClick={() => setDeleteModal({ show: false, quizId: null, quizName: null })}
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
                    <h3 className="text-lg font-bold text-slate-900">Delete Quiz?</h3>
                    <p className="text-slate-600 text-sm">
                      Are you sure you want to delete "{deleteModal.quizName}"? This action cannot be undone.
                    </p>
                  </div>
                  <div className="flex gap-4 p-6 border-t border-gray-200">
                    <button
                      onClick={() => setDeleteModal({ show: false, quizId: null, quizName: null })}
                      className="flex-1 px-4 py-3 border border-gray-200 text-slate-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteQuiz}
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

        {/* Quizzes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12 text-slate-600">Loading...</div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-slate-600">No quizzes found. Create your first quiz!</p>
            </div>
          ) : (
            filteredQuizzes.map((quiz, idx) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col relative"
              >
                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  {/* Title and Description */}
                  <div className="mb-5">
                    <h3 className="font-bold text-lg text-slate-900 leading-tight mb-3">{quiz.title}</h3>
                    <p className="text-sm text-slate-600 line-clamp-2">{quiz.description}</p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-slate-700 rounded-lg">
                          <BookOpen className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs font-medium text-slate-600">Questions</span>
                      </div>
                      <p className="text-lg font-bold text-slate-900">{quiz.questions_count || 0}</p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-slate-700 rounded-lg">
                          <Clock className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs font-medium text-slate-600">Time Limit</span>
                      </div>
                      <p className="text-lg font-bold text-slate-900">{quiz.time_limit || '-'} min</p>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="space-y-2 mt-auto">
                    <button
                      onClick={() => navigate(`/trainer/quizzes/${quiz.id}`)}
                      className="w-full py-3 bg-slate-700 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 group/btn"
                    >
                      View & Manage
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                    <button
                      onClick={() => setDeleteModal({ show: true, quizId: quiz.id, quizName: quiz.title })}
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
