import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, FileText, CheckCircle2, Circle, Brain, AlertTriangle, CheckCircle, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'
import axios from 'axios'

export default function StudentProgressDetail() {
  const { studentId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [student, setStudent] = useState(null)
  const [progressSummary, setProgressSummary] = useState(null)
  const [modulesLearned, setModulesLearned] = useState([])
  const [assignmentResults, setAssignmentResults] = useState([])

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

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Progress Summary */}
        {progressSummary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-gray-200 rounded-lg bg-white p-6 mb-8 shadow-sm"
          >
            <h2 className="text-lg font-bold text-slate-900 mb-4">Progress Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-xs font-medium text-slate-600 mb-1">Lessons Completed</p>
                <p className="text-2xl font-bold text-slate-900">{progressSummary.completed_lessons}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-xs font-medium text-slate-600 mb-1">Total Lessons</p>
                <p className="text-2xl font-bold text-slate-900">{progressSummary.total_lessons}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-xs font-medium text-slate-600 mb-1">Total Points</p>
                <p className="text-2xl font-bold text-slate-900">{progressSummary.total_points}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-xs font-medium text-slate-600 mb-1">Assignment Points</p>
                <p className="text-2xl font-bold text-slate-900">{progressSummary.assignment_points}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Modules Learned */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="border border-gray-200 rounded-lg bg-white p-8 mb-8 shadow-sm"
        >
          <h2 className="text-lg font-bold text-slate-900 mb-6">Modules Learned</h2>

          {modulesLearned.length > 0 ? (
            <div className="space-y-3">
              {modulesLearned.map((module) => (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border border-gray-200 rounded-lg p-4 flex items-start gap-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <BookOpen className="w-5 h-5 text-slate-600 flex-shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-1">{module.title}</h3>
                        <p className="text-sm text-slate-600">{module.lessons_count || 0} lessons</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-medium text-slate-600">Duration</p>
                        <p className="text-sm font-bold text-slate-900">{module.duration_minutes || 0} min</p>
                      </div>
                    </div>

                    {/* Quiz Stats */}
                    {module.quiz_stats?.length > 0 && (
                      <div className="mt-3 space-y-2">
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
                                {/* Attempts badge */}
                                <span className="flex items-center gap-1 text-xs text-slate-600">
                                  <RotateCcw size={11} />
                                  {quiz.attempts}x
                                </span>
                                {/* Score */}
                                {quiz.best_score !== null ? (
                                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                    quiz.passed
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-red-100 text-red-700'
                                  }`}>
                                    {quiz.best_score}% / {quiz.passing_score}%
                                  </span>
                                ) : (
                                  <span className="text-xs text-slate-400">Not attempted</span>
                                )}
                                {/* Status icon */}
                                {quiz.passed
                                  ? <CheckCircle size={15} className="text-green-500" />
                                  : quiz.attempts > 0
                                  ? <AlertTriangle size={15} className="text-red-500" />
                                  : null
                                }
                              </div>
                            </div>
                            {/* Below passing score warning */}
                            {quiz.attempts > 0 && !quiz.passed && (
                              <p className="mt-1.5 text-xs text-red-600 font-medium">
                                Below passing score — needs improvement
                              </p>
                            )}

                            {/* Individual attempt breakdown */}
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
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-600">
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-50" />
              <p>No modules learned yet</p>
            </div>
          )}
        </motion.div>

        {/* Assignment Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="border border-gray-200 rounded-lg bg-white p-8 shadow-sm"
        >
          <h2 className="text-lg font-bold text-slate-900 mb-6">Assignment Results</h2>

          {assignmentResults.length > 0 ? (
            <div className="space-y-3">
              {assignmentResults.map((assignment) => (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border border-gray-200 rounded-lg p-4 flex items-start justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <FileText className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">{assignment.title}</h3>
                      {assignment.description && (
                        <p className="text-sm text-slate-600">{assignment.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex flex-col gap-2 items-end">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        assignment.status === 'graded'
                          ? 'bg-green-100 text-green-800'
                          : assignment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : assignment.status === 'submitted'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-200 text-slate-800'
                      }`}>
                        {assignment.status ? assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1) : 'Not Started'}
                      </span>
                      {assignment.score !== null && (
                        <span className="text-sm font-bold text-slate-900">
                          {assignment.score}/{assignment.max_score}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-600">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-50" />
              <p>No assignments available</p>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  )
}
