import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, X, CheckCircle, AlertCircle, Plus, Trash2, Edit, Eye } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'

export default function AssignmentDetail() {
  const { assignmentId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [assignmentData, setAssignmentData] = useState(null)
  const [questions, setQuestions] = useState([])
  const [message, setMessage] = useState({ show: false, type: 'success', text: '' })
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [editingQuestionId, setEditingQuestionId] = useState(null)
  const [questionType, setQuestionType] = useState('multiple_choice')
  const [deleteModal, setDeleteModal] = useState({ show: false, questionId: null, questionText: null })
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    due_date: '',
    max_score: '',
    mc_weight: 60,
    duration_minutes: '',
    requires_camera: false,
    requires_location: false,
  })
  const [questionFormData, setQuestionFormData] = useState({
    question_text: '',
    type: 'multiple_choice',
    options: ['', '', '', ''],
    correct_option: 0,
  })

  useEffect(() => {
    fetchData()
  }, [assignmentId])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const assignmentRes = await axios.get(`/api/trainer/assignments/${assignmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setAssignmentData(assignmentRes.data.assignment)
      setFormData({
        title: assignmentRes.data.assignment.title,
        description: assignmentRes.data.assignment.description || '',
        instructions: assignmentRes.data.assignment.instructions || '',
        due_date: assignmentRes.data.assignment.due_date ? assignmentRes.data.assignment.due_date.split('T')[0] : '',
        max_score: assignmentRes.data.assignment.max_score || '',
        mc_weight: assignmentRes.data.assignment.mc_weight ?? 60,
        duration_minutes: assignmentRes.data.assignment.duration_minutes || '',
        requires_camera: assignmentRes.data.assignment.requires_camera || false,
        requires_location: assignmentRes.data.assignment.requires_location || false,
      })

      setQuestions(assignmentRes.data.questions || [])
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      setLoading(false)
    }
  }

  const handleTogglePublish = async () => {
    try {
      const token = localStorage.getItem('token')
      const newStatus = assignmentData.status === 'published' ? 'draft' : 'published'
      await axios.put(
        `/api/trainer/assignments/${assignmentId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setAssignmentData(prev => ({ ...prev, status: newStatus }))
      setMessage({
        show: true,
        type: 'success',
        text: newStatus === 'published' ? 'Assignment published!' : 'Assignment set to draft.',
      })
      setTimeout(() => setMessage({ show: false, type: 'success', text: '' }), 2000)
    } catch (error) {
      setMessage({ show: true, type: 'error', text: 'Failed to update status' })
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem('token')

      await axios.put(
        `/api/trainer/assignments/${assignmentId}`,
        {
          title: formData.title,
          description: formData.description,
          instructions: formData.instructions,
          due_date: formData.due_date,
          max_score: parseInt(formData.max_score) || 100,
          mc_weight: formData.mc_weight,
          duration_minutes: parseInt(formData.duration_minutes) || null,
          requires_camera: formData.requires_camera,
          requires_location: formData.requires_location,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      setSaving(false)
      setMessage({
        show: true,
        type: 'success',
        text: 'Assignment updated successfully!',
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
        question_text: questionFormData.question_text,
        type: questionFormData.type,
      }

      if (questionFormData.type === 'multiple_choice') {
        payload.options = questionFormData.options.filter(o => o.trim())
        payload.correct_option = questionFormData.correct_option
      }

      if (editingQuestionId) {
        await axios.put(`/api/trainer/assignments/${assignmentId}/questions/${editingQuestionId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setMessage({
          show: true,
          type: 'success',
          text: 'Question updated successfully!',
        })
      } else {
        await axios.post(`/api/trainer/assignments/${assignmentId}/questions`, payload, {
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
        type: 'multiple_choice',
        options: ['', '', '', ''],
        correct_option: 0,
      })
      setShowQuestionForm(false)
      setEditingQuestionId(null)
      setQuestionType('multiple_choice')
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
      type: question.type,
      options: question.type === 'multiple_choice' ? question.options?.map(o => o.option_text) || ['', '', '', ''] : ['', '', '', ''],
      correct_option: question.type === 'multiple_choice' ? question.options?.findIndex(o => o.is_correct) || 0 : 0,
    })
    setQuestionType(question.type)
    setEditingQuestionId(question.id)
    setShowQuestionForm(true)
  }

  const handleDeleteQuestion = async () => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/trainer/assignments/${assignmentId}/questions/${deleteModal.questionId}`, {
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
              onClick={() => navigate('/trainer/assignments')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} className="text-slate-900" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{assignmentData?.title}</h1>
              <p className="text-slate-600 text-sm">Edit assignment details and manage questions</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleTogglePublish}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-colors border ${
                assignmentData?.status === 'published'
                  ? 'border-green-500 text-green-600 hover:bg-green-50'
                  : 'border-gray-300 text-slate-600 hover:bg-gray-50'
              }`}
            >
              {assignmentData?.status === 'published' ? (
                <><CheckCircle size={18} className="text-green-500" /> Published</>
              ) : (
                <><Eye size={18} /> Publish</>
              )}
            </button>
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
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Edit Form Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-gray-200 rounded-lg bg-white p-8 mb-8 shadow-sm"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-6">Assignment Details</h2>

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
                rows="2"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900"
              />
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Instructions</label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                rows="3"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900"
              />
            </div>

            {/* Due Date, Max Score & Duration */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Due Date</label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Max Score</label>
                <input
                  type="number"
                  min="1"
                  value={formData.max_score}
                  onChange={(e) => setFormData({ ...formData, max_score: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 45"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900"
                />
              </div>
            </div>

            {/* Score Weighting — only visible when assignment has both MC and essay questions */}
            {questions.some(q => q.type === 'multiple_choice') && questions.some(q => q.type === 'essay') && (
            <div className="border border-gray-200 rounded-xl p-5 bg-gray-50">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-slate-900">Score Weighting</p>
                <div className="flex items-center gap-3 text-sm font-semibold">
                  <span className="text-teal-700">MC {formData.mc_weight}%</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-blue-700">Essay {100 - formData.mc_weight}%</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Determines how Multiple Choice and Essay questions contribute to the final score when grading.
              </p>
              {/* Bar visual */}
              <div className="h-2 rounded-full overflow-hidden bg-blue-200 mb-3">
                <div
                  className="h-full bg-teal-500 rounded-full transition-all"
                  style={{ width: `${formData.mc_weight}%` }}
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-teal-600 font-medium w-16">MC 0%</span>
                <input
                  type="range"
                  min="0" max="100" step="5"
                  value={formData.mc_weight}
                  onChange={e => setFormData(prev => ({ ...prev, mc_weight: Number(e.target.value) }))}
                  className="flex-1 accent-teal-600"
                />
                <span className="text-xs text-teal-600 font-medium w-20 text-right">MC 100%</span>
              </div>
            </div>
            )}

            {/* Permission Toggles */}
            <div className="grid grid-cols-2 gap-4">
              {/* Camera Toggle */}
              <div
                onClick={() => setFormData(prev => ({ ...prev, requires_camera: !prev.requires_camera }))}
                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all select-none ${
                  formData.requires_camera
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    formData.requires_camera ? 'bg-teal-100' : 'bg-gray-200'
                  }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={formData.requires_camera ? 'text-teal-600' : 'text-slate-400'}>
                      <path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                    </svg>
                  </div>
                  <div>
                    <p className={`font-semibold text-sm ${formData.requires_camera ? 'text-teal-800' : 'text-slate-700'}`}>
                      Require Camera
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formData.requires_camera ? 'Camera must be on' : 'Camera not required'}
                    </p>
                  </div>
                </div>
                <div className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
                  formData.requires_camera ? 'bg-teal-500' : 'bg-gray-300'
                }`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    formData.requires_camera ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </div>
              </div>

              {/* Location Toggle */}
              <div
                onClick={() => setFormData(prev => ({ ...prev, requires_location: !prev.requires_location }))}
                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all select-none ${
                  formData.requires_location
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    formData.requires_location ? 'bg-blue-100' : 'bg-gray-200'
                  }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={formData.requires_location ? 'text-blue-600' : 'text-slate-400'}>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div>
                    <p className={`font-semibold text-sm ${formData.requires_location ? 'text-blue-800' : 'text-slate-700'}`}>
                      Require Location
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formData.requires_location ? 'Location will be recorded' : 'Location not required'}
                    </p>
                  </div>
                </div>
                <div className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
                  formData.requires_location ? 'bg-blue-500' : 'bg-gray-300'
                }`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    formData.requires_location ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

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
              onClick={() => {
                setShowQuestionForm(!showQuestionForm)
                if (showQuestionForm) {
                  setEditingQuestionId(null)
                  setQuestionType('multiple_choice')
                  setQuestionFormData({
                    question_text: '',
                    type: 'multiple_choice',
                    options: ['', '', '', ''],
                    correct_option: 0,
                  })
                }
              }}
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
                {editingQuestionId ? 'Edit Question' : 'New Question'}
              </h3>
              <form onSubmit={handleAddQuestion} className="space-y-4">
                {/* Question Type */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Question Type</label>
                  <select
                    value={questionType}
                    onChange={(e) => {
                      setQuestionType(e.target.value)
                      setQuestionFormData({ ...questionFormData, type: e.target.value })
                    }}
                    disabled={editingQuestionId !== null}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900 bg-white"
                  >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="essay">Essay</option>
                    <option value="video">Video Answer</option>
                  </select>
                </div>

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

                {/* Multiple Choice Options */}
                {questionType === 'multiple_choice' && (
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
                )}

                {/* Essay Note */}
                {questionType === 'essay' && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Students will write their answer in a text field. You can grade these submissions manually.
                    </p>
                  </div>
                )}

                {/* Video Note */}
                {questionType === 'video' && (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm text-purple-800 font-medium mb-1">Video Answer</p>
                    <p className="text-sm text-purple-700">
                      Students can upload an MP4 video file (max 200MB) or paste a video link (YouTube, Google Drive, etc.). You can review and grade their video submission manually.
                    </p>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuestionForm(false)
                      setEditingQuestionId(null)
                      setQuestionType('multiple_choice')
                      setQuestionFormData({
                        question_text: '',
                        type: 'multiple_choice',
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
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold text-slate-900">{question.question}</p>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                          {question.type === 'multiple_choice' ? 'Multiple Choice' : question.type === 'video' ? 'Video Answer' : 'Essay'}
                        </span>
                      </div>
                      {question.type === 'multiple_choice' && question.options && (
                        <div className="space-y-1">
                          {question.options.map((option, idx) => (
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
                      )}
                      {question.type === 'essay' && (
                        <p className="text-sm text-slate-600 italic">Essay question — students write their own answer</p>
                      )}
                      {question.type === 'video' && (
                        <p className="text-sm text-slate-600 italic">Video question — students upload MP4 or paste a video link</p>
                      )}
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
