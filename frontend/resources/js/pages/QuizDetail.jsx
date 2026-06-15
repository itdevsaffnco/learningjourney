import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, X, CheckCircle, AlertCircle, Plus, Trash2, Edit } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'

export default function QuizDetail() {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [quizData, setQuizData] = useState(null)
  const [questions, setQuestions] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [activeTab, setActiveTab] = useState('questions')
  const [message, setMessage] = useState({ show: false, type: 'success', text: '' })
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [editingQuestionId, setEditingQuestionId] = useState(null)
  const [deleteModal, setDeleteModal] = useState({ show: false, questionId: null, questionText: null })
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    passing_score: '',
    time_limit: '',
  })
  const [questionFormData, setQuestionFormData] = useState({
    question_text: '',
    options: ['', '', '', ''],
    correct_option: 0,
  })

  useEffect(() => {
    fetchData()
  }, [quizId])

  useEffect(() => {
    if (activeTab === 'submissions') {
      fetchSubmissions()
    }
  }, [activeTab])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const quizRes = await axios.get(`/api/trainer/quizzes/${quizId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setQuizData(quizRes.data.quiz)
      setFormData({
        title: quizRes.data.quiz.title,
        description: quizRes.data.quiz.description || '',
        passing_score: quizRes.data.quiz.passing_score || '',
        time_limit: quizRes.data.quiz.time_limit_minutes || '',
      })

      setQuestions(quizRes.data.questions || [])
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      setLoading(false)
    }
  }

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get(`/api/trainer/quizzes/${quizId}/submissions`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSubmissions(res.data.submissions || [])
    } catch (error) {
      console.error('Failed to fetch submissions:', error)
    }
  }

  const handleViewSubmissionDetail = async (submissionId) => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get(`/api/trainer/quizzes/${quizId}/submissions/${submissionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSelectedSubmission(res.data)
    } catch (error) {
      console.error('Failed to fetch submission detail:', error)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem('token')

      await axios.put(
        `/api/trainer/quizzes/${quizId}`,
        {
          title: formData.title,
          description: formData.description,
          passing_score: parseInt(formData.passing_score) || 70,
          time_limit_minutes: parseInt(formData.time_limit) || 30,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      setSaving(false)
      setMessage({
        show: true,
        type: 'success',
        text: 'Quiz updated successfully!',
      })
      setTimeout(() => setMessage({ show: false, type: 'success', text: '' }), 2000)
      await fetchData()
    } catch (error) {
      setSaving(false)
      setMessage({
        show: true,
        type: 'error',
        text: error.response?.data?.message || 'Failed to save',
      })
    }
  }

  const handleAddQuestion = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')

      const payload = {
        quiz_id: quizId,
        question_text: questionFormData.question_text,
        options: questionFormData.options.filter(o => o.trim()),
        correct_option: questionFormData.correct_option,
      }

      if (editingQuestionId) {
        await axios.put(`/api/trainer/quizzes/${quizId}/questions/${editingQuestionId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setMessage({
          show: true,
          type: 'success',
          text: 'Question updated successfully!',
        })
      } else {
        await axios.post(`/api/trainer/quizzes/${quizId}/questions`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setMessage({
          show: true,
          type: 'success',
          text: 'Question added successfully!',
        })
      }

      setQuestionFormData({
        question_text: '',
        options: ['', '', '', ''],
        correct_option: 0,
      })
      setShowQuestionForm(false)
      setEditingQuestionId(null)
      setTimeout(() => setMessage({ show: false, type: 'success', text: '' }), 2000)

      await fetchData()
    } catch (error) {
      console.error('Error managing question:', error)
      setMessage({
        show: true,
        type: 'error',
        text: error.response?.data?.message || 'Failed to save question',
      })
    }
  }

  const handleEditQuestion = (question) => {
    setQuestionFormData({
      question_text: question.question,
      options: question.options?.map(o => o.option_text) || ['', '', '', ''],
      correct_option: question.options?.findIndex(o => o.is_correct) || 0,
    })
    setEditingQuestionId(question.id)
    setShowQuestionForm(true)
  }

  const handleDeleteQuestion = async () => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/trainer/quizzes/${quizId}/questions/${deleteModal.questionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setDeleteModal({ show: false, questionId: null, questionText: null })
      await fetchData()
    } catch (error) {
      console.error('Error deleting question:', error)
    }
  }

  if (loading) {
    return (
      <main className="flex-1 overflow-y-auto bg-white">
        <div className="text-center py-12 text-slate-600">Loading...</div>
      </main>
    )
  }

  return (
    <main className="flex-1 overflow-y-auto bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/trainer/quizzes')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} className="text-slate-900" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{quizData?.title}</h1>
              <p className="text-slate-600 text-sm">Edit quiz details and manage questions</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <Save size={20} />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Tabs */}
        <div className="border-b border-gray-200 flex gap-8 px-0 py-4">
          <button
            onClick={() => setActiveTab('questions')}
            className={`pb-4 font-semibold transition-colors ${
              activeTab === 'questions'
                ? 'text-slate-900 border-b-2 border-slate-900'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Questions
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`pb-4 font-semibold transition-colors ${
              activeTab === 'submissions'
                ? 'text-slate-900 border-b-2 border-slate-900'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Submissions
          </button>
        </div>

        <div className="py-8">
        {/* Edit Form Section */}
        {activeTab === 'questions' && <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-gray-200 rounded-lg bg-white p-8 mb-8 shadow-sm"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-6">Quiz Details</h2>

          <div className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900"
              />
            </div>

            {/* Passing Score & Time Limit */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Passing Score (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.passing_score}
                  onChange={(e) => setFormData({ ...formData, passing_score: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Time Limit (minutes)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.time_limit}
                  onChange={(e) => setFormData({ ...formData, time_limit: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900"
                />
              </div>
            </div>
          </div>
        </motion.div>}

        {/* Questions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="border border-gray-200 rounded-lg bg-white p-8 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Questions</h2>
            <button
              onClick={() => setShowQuestionForm(!showQuestionForm)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </button>
          </div>

          {/* Add Question Form */}
          {showQuestionForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-200 rounded-lg p-6 mb-6 bg-gray-50"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                {editingQuestionId ? 'Edit Question' : 'New Multiple Choice Question'}
              </h3>
              <form onSubmit={handleAddQuestion} className="space-y-4">
                {/* Question Text */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Question</label>
                  <input
                    type="text"
                    value={questionFormData.question_text}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, question_text: e.target.value })}
                    placeholder="Enter the question..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900"
                    required
                  />
                </div>

                {/* Options */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Answer Options</label>
                  <div className="space-y-2">
                    {questionFormData.options.map((option, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correct_option"
                          checked={questionFormData.correct_option === idx}
                          onChange={() => setQuestionFormData({ ...questionFormData, correct_option: idx })}
                          className="w-4 h-4"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...questionFormData.options]
                            newOptions[idx] = e.target.value
                            setQuestionFormData({ ...questionFormData, options: newOptions })
                          }}
                          placeholder={`Option ${idx + 1}`}
                          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900"
                        />
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                          {questionFormData.correct_option === idx ? '✓ Correct' : 'Option'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuestionForm(false)
                      setEditingQuestionId(null)
                      setQuestionFormData({
                        question_text: '',
                        options: ['', '', '', ''],
                        correct_option: 0,
                      })
                    }}
                    className="px-4 py-2 text-slate-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors"
                  >
                    {editingQuestionId ? 'Update Question' : 'Add Question'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Questions List */}
          {questions.length > 0 ? (
            <div className="space-y-3">
              {questions.map((question) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 mb-2">{question.question}</p>
                      <div className="space-y-1">
                        {question.options?.map((option, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-gray-300 text-xs">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span>{option.option_text}</span>
                            {option.is_correct && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                ✓ Correct
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="ml-4 flex gap-2">
                      <button
                        onClick={() => handleEditQuestion(question)}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-slate-600 hover:text-blue-600"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ show: true, questionId: question.id, questionText: question.question })}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors text-slate-600 hover:text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-600">
              <p>No questions yet. Add your first question to get started!</p>
            </div>
          )}
        </motion.div>

        {/* Submissions Tab */}
        {activeTab === 'submissions' && (
          <div className="space-y-4">
            {selectedSubmission ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 rounded-lg bg-white p-8 shadow-sm"
              >
                <div className="flex items-center gap-4 mb-6">
                  <button
                    onClick={() => setSelectedSubmission(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ArrowLeft size={24} className="text-slate-900" />
                  </button>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{selectedSubmission.submission.user_name}</h3>
                    <p className="text-slate-600 text-sm">{selectedSubmission.submission.user_email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-8">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-slate-600 text-sm mb-1">Score</p>
                    <p className="text-2xl font-bold text-slate-900">{selectedSubmission.submission.score}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-slate-600 text-sm mb-1">Percentage</p>
                    <p className="text-2xl font-bold text-slate-900">{selectedSubmission.submission.percentage}%</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-slate-600 text-sm mb-1">Correct</p>
                    <p className="text-2xl font-bold text-slate-900">{selectedSubmission.submission.correct_answers}/{selectedSubmission.submission.total_questions}</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-slate-600 text-sm mb-1">Submitted</p>
                    <p className="text-sm font-semibold text-slate-900">{new Date(selectedSubmission.submission.submitted_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <h4 className="text-lg font-bold text-slate-900 mb-4">Answers</h4>
                <div className="space-y-4">
                  {selectedSubmission.answers.map((answer, idx) => (
                    <div key={answer.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <p className="font-semibold text-slate-900">Q{idx + 1}: {answer.question?.question}</p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          answer.is_correct
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {answer.is_correct ? '✓ Correct' : '✗ Incorrect'}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {answer.question?.options?.map((option, oidx) => (
                          <div
                            key={option.id}
                            className={`p-3 rounded-lg border ${
                              answer.selected_option?.id === option.id
                                ? option.is_correct
                                  ? 'border-green-300 bg-green-50'
                                  : 'border-red-300 bg-red-50'
                                : option.is_correct
                                ? 'border-green-300 bg-green-50'
                                : 'border-gray-200 bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-semibold ${
                                answer.selected_option?.id === option.id
                                  ? option.is_correct ? 'text-green-700' : 'text-red-700'
                                  : option.is_correct ? 'text-green-700' : 'text-slate-900'
                              }`}>
                                {String.fromCharCode(65 + oidx)}.
                              </span>
                              <span className="text-sm">{option.option_text}</span>
                              {option.is_correct && (
                                <span className="ml-auto text-xs font-semibold text-green-700">✓ Correct</span>
                              )}
                              {answer.selected_option?.id === option.id && !option.is_correct && (
                                <span className="ml-auto text-xs font-semibold text-red-700">✗ Your answer</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 rounded-lg bg-white p-8 shadow-sm"
              >
                <h2 className="text-xl font-bold text-slate-900 mb-6">Quiz Submissions</h2>
                {submissions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-slate-900">Staff Name</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-900">Email</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-900">Score</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-900">Percentage</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-900">Submitted</th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-900">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submissions.map((submission) => (
                          <tr key={submission.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4 text-slate-900">{submission.user_name}</td>
                            <td className="py-3 px-4 text-slate-600 text-sm">{submission.user_email}</td>
                            <td className="py-3 px-4 text-slate-900 font-semibold">{submission.score}</td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                {submission.percentage}%
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-600 text-sm">
                              {new Date(submission.submitted_at).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => handleViewSubmissionDetail(submission.id)}
                                className="px-3 py-1 bg-slate-700 hover:bg-slate-800 text-white text-sm rounded-lg transition-colors"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-600">
                    <p>No submissions yet</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.show && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteModal({ show: false, questionId: null, questionText: null })}
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
                  <h3 className="text-lg font-bold text-slate-900">Delete Question?</h3>
                  <p className="text-slate-600 text-sm">
                    Are you sure you want to delete "{deleteModal.questionText}"? This action cannot be undone.
                  </p>
                </div>
                <div className="flex gap-4 p-6 border-t border-gray-200">
                  <button
                    onClick={() => setDeleteModal({ show: false, questionId: null, questionText: null })}
                    className="flex-1 px-4 py-3 border border-gray-200 text-slate-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteQuestion}
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

      {/* Message Modal */}
      <AnimatePresence>
        {message.show && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMessage({ show: false, type: 'success', text: '' })}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
            >
              <div
                className={`rounded-lg shadow-lg border px-8 py-6 flex items-center gap-4 ${
                  message.type === 'success'
                    ? 'bg-white border-green-200'
                    : 'bg-white border-red-200'
                }`}
              >
                {message.type === 'success' ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                )}
                <p
                  className={`text-sm font-medium ${
                    message.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {message.text}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  )
}
