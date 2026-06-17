import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, BookOpen, FileText, Brain, AlertTriangle,
  CheckCircle, RotateCcw, ChevronDown, ChevronUp
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'

export default function StudentProgressDetail() {
  const { studentId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [student, setStudent] = useState(null)
  const [progressSummary, setProgressSummary] = useState(null)
  const [modulesLearned, setModulesLearned] = useState([])
  const [assignmentResults, setAssignmentResults] = useState([])
  const [activeTab, setActiveTab] = useState('modules')
  // per-module quiz score visibility: { [moduleId]: bool }
  const [quizVisible, setQuizVisible] = useState({})

  useEffect(() => {
    fetchStudentDetail()
  }, [studentId])

  const fetchStudentDetail = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`/api/progress/students/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setStudent(response.data.student)
      setProgressSummary(response.data.progress_summary)
      setModulesLearned(response.data.modules_learned || [])
      setAssignmentResults(response.data.assignment_results || [])
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch student detail:', error)
      setLoading(false)
    }
  }

  const toggleQuiz = (moduleId) =>
    setQuizVisible(prev => ({ ...prev, [moduleId]: !prev[moduleId] }))

  if (loading) {
    return (
      <main className="flex-1 overflow-y-auto bg-white">
        <div className="text-center py-12 text-slate-600">Loading...</div>
      </main>
    )
  }

  return (
    <main className="flex-1 overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 flex items-center gap-4">
          <button
            onClick={() => navigate('/trainer/student-progress')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} className="text-slate-900" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{student?.name}</h1>
            <p className="text-slate-600 text-sm">{student?.email}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">
        {/* Progress Summary */}
        {progressSummary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-gray-200 rounded-xl bg-white p-6 shadow-sm"
          >
            <h2 className="text-base font-bold text-slate-900 mb-4">Progress Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Lessons Completed', value: progressSummary.completed_lessons },
                { label: 'Total Lessons', value: progressSummary.total_lessons },
                { label: 'Total Points', value: progressSummary.total_points },
                { label: 'Assignment Points', value: progressSummary.assignment_points },
              ].map(stat => (
                <div key={stat.label} className="border border-gray-200 rounded-lg p-4">
                  <p className="text-xs font-medium text-slate-500 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Tabbed card ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
        >
          {/* Tab bar */}
          <div className="flex border-b border-gray-200 px-6 pt-4">
            <button
              onClick={() => setActiveTab('modules')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors relative mr-1 ${
                activeTab === 'modules'
                  ? 'text-teal-700 bg-teal-50 border border-b-0 border-teal-200 -mb-px z-10'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-gray-50'
              }`}
            >
              <BookOpen size={15} />
              Modules Learned
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                activeTab === 'modules' ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-slate-500'
              }`}>
                {modulesLearned.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('assignments')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors relative ${
                activeTab === 'assignments'
                  ? 'text-slate-900 bg-white border border-b-0 border-gray-200 -mb-px z-10'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-gray-50'
              }`}
            >
              <FileText size={15} />
              Assignment Results
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                activeTab === 'assignments' ? 'bg-slate-100 text-slate-600' : 'bg-gray-100 text-slate-500'
              }`}>
                {assignmentResults.length}
              </span>
            </button>
          </div>

          {/* Tab content */}
          <div className="p-6">
            <AnimatePresence mode="wait">

              {/* ── Modules tab ── */}
              {activeTab === 'modules' && (
                <motion.div
                  key="modules"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                >
                  {modulesLearned.length > 0 ? (
                    <div className="space-y-4">
                      {modulesLearned.map((module) => {
                        const hasQuiz = module.quiz_stats?.length > 0
                        const quizShown = !!quizVisible[module.id]
                        return (
                          <div key={module.id} className="border border-gray-200 rounded-xl overflow-hidden">
                            {/* Module row */}
                            <div className="flex items-center justify-between gap-4 px-5 py-4 bg-gray-50">
                              <div className="flex items-center gap-3 min-w-0">
                                <BookOpen size={16} className="text-teal-600 flex-shrink-0" />
                                <div className="min-w-0">
                                  <h3 className="font-semibold text-slate-900 text-sm truncate">{module.title}</h3>
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    {module.lessons_count || 0} lessons · {module.duration_minutes || 0} min
                                  </p>
                                </div>
                              </div>
                              {hasQuiz && (
                                <button
                                  onClick={() => toggleQuiz(module.id)}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex-shrink-0 ${
                                    quizShown
                                      ? 'bg-teal-100 text-teal-700 hover:bg-teal-200'
                                      : 'bg-gray-200 text-slate-600 hover:bg-gray-300'
                                  }`}
                                >
                                  <Brain size={13} />
                                  Quiz Scores
                                  {quizShown ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                </button>
                              )}
                            </div>

                            {/* Quiz stats — collapsible */}
                            <AnimatePresence initial={false}>
                              {hasQuiz && quizShown && (
                                <motion.div
                                  key="quiz"
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-5 pb-4 pt-3 space-y-2 border-t border-gray-100">
                                    {module.quiz_stats.map((quiz, qi) => (
                                      <div
                                        key={qi}
                                        className={`rounded-lg border px-4 py-3 ${
                                          quiz.attempts === 0
                                            ? 'border-gray-200 bg-white'
                                            : quiz.passed
                                            ? 'border-green-200 bg-green-50'
                                            : 'border-red-200 bg-red-50'
                                        }`}
                                      >
                                        <div className="flex items-center justify-between gap-4">
                                          <div className="flex items-center gap-2">
                                            <Brain size={14} className={
                                              quiz.attempts === 0 ? 'text-slate-400'
                                              : quiz.passed ? 'text-green-600'
                                              : 'text-red-500'
                                            } />
                                            <span className="text-sm font-medium text-slate-800">{quiz.lesson_title}</span>
                                          </div>
                                          <div className="flex items-center gap-3 shrink-0">
                                            <span className="flex items-center gap-1 text-xs text-slate-500">
                                              <RotateCcw size={11} />
                                              {quiz.attempts}x
                                            </span>
                                            {quiz.best_score !== null ? (
                                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                                quiz.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                              }`}>
                                                {quiz.best_score}% / {quiz.passing_score}%
                                              </span>
                                            ) : (
                                              <span className="text-xs text-slate-400">Not attempted</span>
                                            )}
                                            {quiz.passed
                                              ? <CheckCircle size={15} className="text-green-500" />
                                              : quiz.attempts > 0
                                              ? <AlertTriangle size={15} className="text-red-500" />
                                              : null}
                                          </div>
                                        </div>
                                        {quiz.attempts > 0 && !quiz.passed && (
                                          <p className="mt-1.5 text-xs text-red-600 font-medium">
                                            Below passing score — needs improvement
                                          </p>
                                        )}
                                        {quiz.attempt_details?.length > 0 && (
                                          <div className="mt-2.5 border-t border-gray-200 pt-2.5 space-y-1.5">
                                            {quiz.attempt_details.map((attempt) => (
                                              <div key={attempt.attempt_number} className="flex items-center justify-between text-xs">
                                                <span className="text-slate-500">
                                                  Attempt {attempt.attempt_number}
                                                  {attempt.submitted_at && (
                                                    <span className="ml-2 text-slate-400">{attempt.submitted_at}</span>
                                                  )}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                  {attempt.correct_answers != null && attempt.total_questions != null && (
                                                    <span className="text-slate-400">
                                                      {attempt.correct_answers}/{attempt.total_questions} correct
                                                    </span>
                                                  )}
                                                  <span className={`font-semibold px-2 py-0.5 rounded-full ${
                                                    attempt.score >= quiz.passing_score
                                                      ? 'bg-green-100 text-green-700'
                                                      : 'bg-red-100 text-red-700'
                                                  }`}>
                                                    {attempt.score}%
                                                  </span>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-500">
                      <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No modules learned yet</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── Assignments tab ── */}
              {activeTab === 'assignments' && (
                <motion.div
                  key="assignments"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                >
                  {assignmentResults.length > 0 ? (
                    <div className="space-y-3">
                      {assignmentResults.map((assignment) => (
                        <div
                          key={assignment.id}
                          className="border border-gray-200 rounded-xl px-5 py-4 flex items-start justify-between gap-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <FileText size={14} className="text-slate-600" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-semibold text-slate-900 text-sm">{assignment.title}</h3>
                              {assignment.description && (
                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{assignment.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                              assignment.status === 'graded'
                                ? 'bg-green-100 text-green-700'
                                : assignment.status === 'submitted'
                                ? 'bg-blue-100 text-blue-700'
                                : assignment.status === 'late'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-slate-600'
                            }`}>
                              {assignment.status
                                ? assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)
                                : 'Not Started'}
                            </span>
                            {assignment.score !== null && (
                              <span className="text-sm font-bold text-slate-900">
                                {assignment.score}/{assignment.max_score}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-500">
                      <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No assignments available</p>
                    </div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
