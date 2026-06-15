import { useState } from 'react'
import { Plus, Trash2, Save, X, CheckSquare, BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'

export default function QuizBuilder() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [quizzes, setQuizzes] = useState([
    {
      id: 1,
      title: 'Fragrance Basics Quiz',
      module: 'Fragrance Basics',
      questions: 10,
      duration: 15,
      passingScore: 70,
    },
    {
      id: 2,
      title: 'Blending Techniques Assessment',
      module: 'Blending Techniques',
      questions: 15,
      duration: 30,
      passingScore: 75,
    },
  ])

  const [formData, setFormData] = useState({
    title: '',
    module: '',
    duration: '',
    passingScore: 70,
    description: '',
  })

  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState({
    type: 'multiple-choice',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    points: 1,
  })

  const handleCreateQuiz = (e) => {
    e.preventDefault()
    if (questions.length === 0) {
      alert('Please add at least one question')
      return
    }
    // Create quiz API call
    setFormData({ title: '', module: '', duration: '', passingScore: 70, description: '' })
    setQuestions([])
    setShowCreateForm(false)
  }

  const addQuestion = () => {
    setQuestions([...questions, currentQuestion])
    setCurrentQuestion({
      type: 'multiple-choice',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      points: 1,
    })
  }

  const updateOption = (index, value) => {
    const newOptions = [...currentQuestion.options]
    newOptions[index] = value
    setCurrentQuestion({ ...currentQuestion, options: newOptions })
  }

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  return (
    <main className="flex-1 overflow-y-auto bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100">
      {/* Header */}
      <div className="glass sticky top-0 z-10 mx-4 mt-4 mb-4">
        <div className="px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-purple-900">Quiz Builder</h1>
            <p className="text-stone-600 mt-1">Create assessments to test student knowledge</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-amber-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Create Quiz
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 relative z-5">
        {/* Create Quiz Form */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-purple-900">Create New Quiz</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-stone-600" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Quiz Settings */}
              <div className="space-y-4">
                <h3 className="font-bold text-purple-900 mb-4">Quiz Settings</h3>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Quiz Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Blending Techniques Final Assessment"
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
                    <label className="block text-sm font-medium text-stone-700 mb-1">Duration (minutes)</label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="30"
                      className="glass-input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Passing Score (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.passingScore}
                      onChange={(e) => setFormData({ ...formData, passingScore: e.target.value })}
                      className="glass-input w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Instructions for students..."
                    rows="3"
                    className="glass-input w-full"
                  />
                </div>
              </div>

              {/* Question Info */}
              <div>
                <h3 className="font-bold text-purple-900 mb-4">Questions Summary</h3>
                <div className="bg-white/40 border border-white/60 rounded-lg p-4">
                  <p className="text-3xl font-bold text-purple-900">{questions.length}</p>
                  <p className="text-stone-600">Questions added</p>
                  <div className="mt-4 space-y-2">
                    <p className="text-sm">
                      <span className="font-semibold">Total Points:</span>{' '}
                      {questions.reduce((sum, q) => sum + (q.points || 1), 0)}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Estimated Time:</span> {formData.duration || '—'} minutes
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Question Builder */}
            <div className="border-t border-white/60 pt-8">
              <h3 className="font-bold text-purple-900 mb-4">Add Questions</h3>

              {/* Current Question Editor */}
              <motion.div className="glass-card mb-6 p-6 bg-purple-50">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-stone-700 mb-2">Question Type</label>
                  <select
                    value={currentQuestion.type}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, type: e.target.value })}
                    className="glass-input w-full"
                  >
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="short-answer">Short Answer</option>
                    <option value="essay">Essay</option>
                    <option value="true-false">True/False</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-stone-700 mb-2">Question Text *</label>
                  <textarea
                    value={currentQuestion.question}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                    placeholder="Write your question here..."
                    rows="2"
                    className="glass-input w-full"
                    required
                  />
                </div>

                {currentQuestion.type === 'multiple-choice' && (
                  <div className="mb-4 space-y-3">
                    <label className="block text-sm font-medium text-stone-700">Answer Options</label>
                    {currentQuestion.options.map((option, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="radio"
                          name="correct"
                          checked={currentQuestion.correctAnswer === idx}
                          onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: idx })}
                          className="mt-2"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(idx, e.target.value)}
                          placeholder={`Option ${idx + 1}`}
                          className="glass-input flex-1"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Points</label>
                    <input
                      type="number"
                      min="1"
                      value={currentQuestion.points}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) || 1 })}
                      className="glass-input w-full"
                    />
                  </div>
                </div>

                <button
                  onClick={addQuestion}
                  className="mt-4 w-full py-2 bg-gradient-to-r from-purple-600 to-amber-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                >
                  Add Question
                </button>
              </motion.div>

              {/* Added Questions List */}
              {questions.length > 0 && (
                <div className="space-y-2 mb-6">
                  <h4 className="font-semibold text-stone-900">Added Questions ({questions.length})</h4>
                  {questions.map((q, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-white/40 border border-white/60 rounded-lg">
                      <span className="text-sm font-bold text-purple-600">Q{idx + 1}.</span>
                      <div className="flex-1">
                        <p className="text-sm text-stone-900">{q.question}</p>
                        <p className="text-xs text-stone-600">{q.points} point(s)</p>
                      </div>
                      <button
                        onClick={() => removeQuestion(idx)}
                        className="p-2 hover:bg-red-100 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-white/60">
              <button
                onClick={() => {
                  setShowCreateForm(false)
                  setQuestions([])
                  setFormData({ title: '', module: '', duration: '', passingScore: 70, description: '' })
                }}
                className="px-4 py-2 text-stone-700 hover:bg-white/50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateQuiz}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-amber-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                <Save className="w-4 h-4" />
                Create Quiz
              </button>
            </div>
          </motion.div>
        )}

        {/* Existing Quizzes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quizzes.map((quiz, idx) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card overflow-hidden group hover:shadow-lg transition-all"
            >
              <div className="h-16 bg-gradient-to-r from-green-600 to-emerald-600 flex items-center px-6">
                <CheckSquare className="w-5 h-5 text-white mr-3" />
                <h3 className="text-lg font-bold text-white">{quiz.title}</h3>
              </div>

              <div className="p-6">
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-600 text-sm">Module:</span>
                    <span className="text-purple-900 font-semibold">{quiz.module}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-600 text-sm">Questions:</span>
                    <span className="text-purple-900 font-semibold">{quiz.questions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-600 text-sm">Duration:</span>
                    <span className="text-purple-900 font-semibold">{quiz.duration} min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-600 text-sm">Passing Score:</span>
                    <span className="text-purple-900 font-semibold">{quiz.passingScore}%</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors font-medium text-sm">
                    Edit
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
