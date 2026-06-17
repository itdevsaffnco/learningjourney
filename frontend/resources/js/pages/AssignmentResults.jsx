import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, X, CheckCircle, XCircle, Star, RotateCcw, ToggleLeft, ToggleRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'

export default function AssignmentResults() {
  const { assignmentId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [assignment, setAssignment] = useState(null)
  const [questions, setQuestions] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [viewingSubmission, setViewingSubmission] = useState(null)

  // Submissions tab filter
  const [submissionTab, setSubmissionTab] = useState('all')

  // Remedial
  const [remedialConfirm, setRemedialConfirm] = useState(null) // submission object or null
  const [remedialLoading, setRemedialLoading] = useState(false)

  // Grading state
  const [essayScores, setEssayScores] = useState({})
  const [gradeFeedback, setGradeFeedback] = useState('')
  const [gradeSubmitting, setGradeSubmitting] = useState(false)

  // Show score toggle
  const [toggleLoading, setToggleLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [assignmentId])

  // Reset grading state whenever a new submission is opened
  useEffect(() => {
    if (!viewingSubmission) return
    setGradeFeedback(viewingSubmission.feedback || '')
    setEssayScores({})
  }, [viewingSubmission?.id])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const [assignmentRes, submissionsRes] = await Promise.all([
        axios.get(`/api/trainer/assignments/${assignmentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`/api/assignments/${assignmentId}/submissions`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])
      setAssignment(assignmentRes.data.assignment)
      setQuestions(assignmentRes.data.questions || [])
      setSubmissions(submissionsRes.data || [])
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      setLoading(false)
    }
  }

  const submitGrade = async () => {
    setGradeSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      await axios.post(`/api/assignments/${viewingSubmission.id}/grade`, {
        score: totalScore,
        feedback: gradeFeedback,
      }, { headers: { Authorization: `Bearer ${token}` } })

      setSubmissions(prev =>
        prev.map(s =>
          s.id === viewingSubmission.id
            ? { ...s, status: 'graded', score: totalScore, feedback: gradeFeedback }
            : s
        )
      )
      setViewingSubmission(null)
    } catch (e) {
      console.error('Grade failed:', e)
    } finally {
      setGradeSubmitting(false)
    }
  }

  const submitRemedial = async () => {
    if (!remedialConfirm) return
    setRemedialLoading(true)
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/assignments/submissions/${remedialConfirm.id}/remedial`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSubmissions(prev => prev.filter(s => s.id !== remedialConfirm.id))
      setRemedialConfirm(null)
    } catch (e) {
      console.error('Remedial failed:', e)
    } finally {
      setRemedialLoading(false)
    }
  }

  const toggleShowScore = async () => {
    if (toggleLoading) return
    setToggleLoading(true)
    try {
      const token = localStorage.getItem('token')
      const newValue = !assignment.show_score_to_staff
      await axios.put(`/api/trainer/assignments/${assignmentId}`, {
        show_score_to_staff: newValue,
      }, { headers: { Authorization: `Bearer ${token}` } })
      setAssignment(prev => ({ ...prev, show_score_to_staff: newValue }))
    } catch (e) {
      console.error('Toggle failed:', e)
    } finally {
      setToggleLoading(false)
    }
  }

  // ── Score calculations (only used when modal is open) ──────────────────────
  const parsedAnswers = (() => {
    if (!viewingSubmission) return {}
    try { return JSON.parse(viewingSubmission.submission_content || '{}') }
    catch { return {} }
  })()

  const mcQuestions = questions.filter(q => q.type === 'multiple_choice')
  const essayQuestions = questions.filter(q => q.type === 'essay')
  // If only one type exists, weight is 100% for that type regardless of stored mc_weight
  const mcWeight =
    mcQuestions.length > 0 && essayQuestions.length === 0 ? 100
    : mcQuestions.length === 0 && essayQuestions.length > 0 ? 0
    : (assignment?.mc_weight ?? 60)
  const essayWeight = 100 - mcWeight
  const maxScore = assignment?.max_score || 100

  const mcMaxPoints = (mcWeight / 100) * maxScore
  const essayMaxPoints = (essayWeight / 100) * maxScore
  const essayMaxPerQ = essayQuestions.length > 0 ? essayMaxPoints / essayQuestions.length : 0

  const mcCorrectCount = mcQuestions.filter(q => {
    const correct = q.options?.find(o => o.is_correct)
    return correct && String(correct.id) === String(parsedAnswers[q.id])
  }).length

  const mcScore = mcQuestions.length > 0 ? (mcCorrectCount / mcQuestions.length) * mcMaxPoints : 0
  const essayTotal = essayQuestions.reduce(
    (sum, q) => sum + Math.min(parseFloat(essayScores[q.id]) || 0, Math.round(essayMaxPerQ)),
    0
  )
  const totalScore = Math.round(mcScore + essayTotal)
  // ───────────────────────────────────────────────────────────────────────────

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
            onClick={() => navigate('/trainer/assignments')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} className="text-slate-900" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{assignment?.title}</h1>
            <p className="text-slate-600 text-sm">Submission Results</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-gray-200 rounded-lg bg-white p-6 mb-8 shadow-sm"
        >
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Total Submissions', value: submissions.length },
              { label: 'Graded', value: submissions.filter(s => s.status === 'graded').length },
              { label: 'Late Submissions', value: submissions.filter(s => s.status === 'late').length },
              { label: 'Pending Grade', value: submissions.filter(s => s.status !== 'graded').length },
            ].map(stat => (
              <div key={stat.label} className="border border-gray-200 rounded-lg p-4">
                <p className="text-xs font-medium text-slate-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Show score toggle */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900 text-sm">Show Score to Staff</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {assignment?.show_score_to_staff
                  ? 'Staff can see their score on this assignment'
                  : 'Score is hidden from staff'}
              </p>
            </div>
            <button
              onClick={toggleShowScore}
              disabled={toggleLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors disabled:opacity-60 ${
                assignment?.show_score_to_staff
                  ? 'bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100'
                  : 'bg-gray-100 text-slate-600 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              {assignment?.show_score_to_staff
                ? <><ToggleRight size={20} className="text-teal-600" /> Visible</>
                : <><ToggleLeft size={20} /> Hidden</>}
            </button>
          </div>
        </motion.div>

        {/* Submissions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden"
        >
          {/* Tab header */}
          {(() => {
            const passing = Math.round(maxScore * 0.7)
            const passedList = submissions.filter(s => s.status === 'graded' && s.score !== null && s.score >= passing)
            const notPassedList = submissions.filter(s => !(s.status === 'graded' && s.score !== null && s.score >= passing))
            const tabs = [
              { key: 'all', label: 'All', count: submissions.length },
              { key: 'passed', label: 'Passed', count: passedList.length },
              { key: 'not_passed', label: 'Not Passed', count: notPassedList.length },
            ]
            const filtered =
              submissionTab === 'passed' ? passedList
              : submissionTab === 'not_passed' ? notPassedList
              : submissions

            return (
              <>
                <div className="flex items-center justify-between border-b border-gray-200 px-8 pt-6 pb-0">
                  <div className="flex gap-1">
                    {tabs.map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setSubmissionTab(tab.key)}
                        className={`relative px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
                          submissionTab === tab.key
                            ? 'text-slate-900 bg-white border border-b-white border-gray-200 -mb-px z-10'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-gray-50'
                        }`}
                      >
                        {tab.label}
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                          submissionTab === tab.key
                            ? tab.key === 'passed' ? 'bg-green-100 text-green-700'
                              : tab.key === 'not_passed' ? 'bg-red-100 text-red-700'
                              : 'bg-slate-100 text-slate-600'
                            : 'bg-gray-100 text-slate-500'
                        }`}>
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 pb-2">Passing score ≥ {Math.round(maxScore * 0.7)}</p>
                </div>

                <div className="p-8">
                  {filtered.length > 0 ? (
                    <div className="space-y-3">
                      {filtered.map(submission => (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border border-gray-200 rounded-lg p-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 mb-1">
                      {submission.user?.name || 'Anonymous'}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span>Submitted: {new Date(submission.submitted_at).toLocaleString()}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        submission.status === 'graded'
                          ? 'bg-green-100 text-green-800'
                          : submission.status === 'late'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {submission.status}
                      </span>
                      {submission.score !== null && (
                        <span className="font-semibold text-slate-900">
                          Score: {submission.score}/{maxScore}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    {/* Remedial — only for not-passed submissions */}
                    {!(submission.status === 'graded' && submission.score !== null && submission.score >= Math.round(maxScore * 0.7)) && (
                      <button
                        onClick={() => setRemedialConfirm(submission)}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
                      >
                        <RotateCcw size={15} />
                        Remedial
                      </button>
                    )}
                    <button
                      onClick={() => setViewingSubmission(submission)}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
                    >
                      <Eye size={16} />
                      {submission.status === 'graded' ? 'Review' : 'Grade'}
                    </button>
                  </div>
                      </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-600">
                      <p>No submissions {submissionTab !== 'all' ? `in this category` : 'yet'}.</p>
                    </div>
                  )}
                </div>
              </>
            )
          })()}
        </motion.div>
      </div>

      {/* Remedial Confirm Modal */}
      <AnimatePresence>
        {remedialConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !remedialLoading && setRemedialConfirm(null)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-md w-full p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <RotateCcw size={20} className="text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Grant Remedial?</h3>
                    <p className="text-sm text-slate-500">{remedialConfirm.user?.name || 'Staff'}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-6">
                  This will delete their current submission and allow them to retake the assignment from scratch. This cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setRemedialConfirm(null)}
                    disabled={remedialLoading}
                    className="flex-1 px-4 py-2.5 border border-gray-200 text-slate-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitRemedial}
                    disabled={remedialLoading}
                    className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <RotateCcw size={15} />
                    {remedialLoading ? 'Processing...' : 'Yes, Grant Remedial'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Submission Detail Modal */}
      <AnimatePresence>
        {viewingSubmission && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingSubmission(null)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 md:inset-8 flex flex-col z-50 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Submission from {viewingSubmission.user?.name || 'Anonymous'}
                  </h3>
                  <p className="text-sm text-slate-600 mt-0.5">
                    Submitted: {new Date(viewingSubmission.submitted_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setViewingSubmission(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-slate-600" />
                </button>
              </div>

              {/* Modal Body — scrollable */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {questions.map((question, idx) => {
                  const answer = parsedAnswers[question.id]
                  const isEssay = question.type === 'essay'
                  const correctOption = question.options?.find(o => o.is_correct)
                  const staffAnsweredCorrectly =
                    correctOption && String(correctOption.id) === String(answer)

                  return (
                    <div
                      key={question.id}
                      className="border border-gray-200 rounded-lg p-5 bg-gray-50"
                    >
                      {/* Question header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <p className="font-semibold text-slate-900 leading-snug">
                          {idx + 1}. {question.question}
                        </p>
                        {!isEssay && answer && (
                          <span className={`shrink-0 flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                            staffAnsweredCorrectly
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {staffAnsweredCorrectly
                              ? <><CheckCircle size={12} /> Correct</>
                              : <><XCircle size={12} /> Wrong</>
                            }
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mb-3">
                        {isEssay ? 'Essay' : 'Multiple Choice'}
                      </p>

                      {isEssay ? (
                        <>
                          <div className="bg-white border border-gray-200 rounded-lg p-3 min-h-[60px]">
                            <p className="text-sm text-slate-900 whitespace-pre-wrap">
                              {answer || <span className="text-slate-400 italic">No answer</span>}
                            </p>
                          </div>
                          {/* Essay score input */}
                          <div className="mt-3 flex items-center gap-3">
                            <label className="text-sm font-medium text-slate-700 shrink-0">
                              Score for this question:
                            </label>
                            <input
                              type="number"
                              min="0"
                              max={Math.round(essayMaxPerQ)}
                              value={essayScores[question.id] ?? ''}
                              onChange={e =>
                                setEssayScores(prev => ({ ...prev, [question.id]: e.target.value }))
                              }
                              className="w-20 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-center focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none"
                              placeholder="0"
                            />
                            <span className="text-sm text-slate-500">
                              / {Math.round(essayMaxPerQ)} pts
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-2">
                          {question.options?.map(option => {
                            const isCorrect = option.is_correct
                            const isSelected = String(option.id) === String(answer)

                            let cls = 'border-gray-200 bg-white text-slate-700'
                            if (isCorrect && isSelected)
                              cls = 'border-green-400 bg-green-100 text-green-900'
                            else if (isCorrect)
                              cls = 'border-green-300 bg-green-50 text-green-800'
                            else if (isSelected)
                              cls = 'border-red-300 bg-red-50 text-red-800'

                            return (
                              <div
                                key={option.id}
                                className={`flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg border ${cls}`}
                              >
                                <span className="text-sm">{option.option_text}</span>
                                <div className="flex items-center gap-1 shrink-0">
                                  {isCorrect && (
                                    <span className="text-xs font-semibold text-green-700 flex items-center gap-0.5">
                                      <CheckCircle size={12} /> Correct
                                    </span>
                                  )}
                                  {isSelected && !isCorrect && (
                                    <span className="text-xs font-semibold text-red-600 flex items-center gap-0.5">
                                      <XCircle size={12} /> Staff's answer
                                    </span>
                                  )}
                                  {isSelected && isCorrect && (
                                    <span className="text-xs font-semibold text-green-700 ml-1">
                                      ← Staff's answer
                                    </span>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                          {!answer && (
                            <p className="text-sm text-slate-400 italic">No answer provided</p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Grading Panel — pinned at bottom */}
              <div className="border-t border-gray-200 bg-gray-50 p-6 space-y-5 shrink-0">
                {/* Weight info (read-only, set on assignment) */}
                {mcQuestions.length > 0 && essayQuestions.length > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-700">Score Weighting</span>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full font-semibold text-xs">
                        MC {mcWeight}%
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold text-xs">
                        Essay {essayWeight}%
                      </span>
                    </div>
                  </div>
                )}

                {/* Score breakdown */}
                <div className="grid grid-cols-3 gap-3">
                  {mcQuestions.length > 0 && (
                    <div className="border border-gray-200 rounded-lg p-3 text-center bg-white">
                      <p className="text-xs text-slate-500 mb-1">Multiple Choice</p>
                      <p className="text-xl font-bold text-slate-900">{Math.round(mcScore)}</p>
                      <p className="text-xs text-slate-400">/ {Math.round(mcMaxPoints)} pts</p>
                      <p className="text-xs text-green-600 mt-1">
                        {mcCorrectCount}/{mcQuestions.length} correct
                      </p>
                    </div>
                  )}
                  {essayQuestions.length > 0 && (
                    <div className="border border-gray-200 rounded-lg p-3 text-center bg-white">
                      <p className="text-xs text-slate-500 mb-1">Essay</p>
                      <p className="text-xl font-bold text-slate-900">{Math.round(essayTotal)}</p>
                      <p className="text-xs text-slate-400">/ {Math.round(essayMaxPoints)} pts</p>
                    </div>
                  )}
                  <div className={`border border-teal-300 rounded-lg p-3 text-center bg-teal-50 ${
                    mcQuestions.length === 0 || essayQuestions.length === 0 ? 'col-span-2' : ''
                  }`}>
                    <p className="text-xs text-teal-600 mb-1 font-semibold">Total Score</p>
                    <p className="text-2xl font-bold text-teal-700">{totalScore}</p>
                    <p className="text-xs text-teal-500">/ {maxScore} pts</p>
                  </div>
                </div>

                {/* Feedback + Submit */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-1">
                      Feedback <span className="font-normal text-slate-500">(optional)</span>
                    </label>
                    <textarea
                      value={gradeFeedback}
                      onChange={e => setGradeFeedback(e.target.value)}
                      rows={2}
                      placeholder="Leave feedback for the staff member..."
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900 text-sm resize-none bg-white"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                      {viewingSubmission.status === 'graded'
                        ? `Previously graded: ${viewingSubmission.score}/${maxScore}`
                        : 'Not yet graded'}
                    </p>
                    <button
                      onClick={submitGrade}
                      disabled={gradeSubmitting}
                      className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white rounded-lg font-semibold transition-colors"
                    >
                      <Star size={16} />
                      {gradeSubmitting
                        ? 'Saving...'
                        : viewingSubmission.status === 'graded'
                        ? 'Update Grade'
                        : 'Submit Grade'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  )
}
