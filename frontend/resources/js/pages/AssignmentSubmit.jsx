import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, CheckCircle, AlertCircle, Clock, Eye, CheckCircle2, Video, VideoOff, MapPin, MapPinOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'

export default function AssignmentSubmit() {
  const { assignmentId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [assignment, setAssignment] = useState(null)
  const [questions, setQuestions] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState({ show: false, type: 'success', text: '' })
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [existingSubmission, setExistingSubmission] = useState(null)
  const [cameraStream, setCameraStream] = useState(null)
  const [cameraError, setCameraError] = useState(null)
  const videoRef = useRef(null)
  const [location, setLocation] = useState(null)
  const [locationError, setLocationError] = useState(null)

  useEffect(() => {
    fetchAssignment()
  }, [assignmentId])

  // Timer effect — only runs when actively taking the assignment
  useEffect(() => {
    if (!assignment || isSubmitted || existingSubmission || timeLeft === null) return

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit(new Event('submit'))
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [assignment, isSubmitted, existingSubmission, timeLeft])

  // Start camera when assignment requires it (and not read-only)
  useEffect(() => {
    if (!assignment?.requires_camera || existingSubmission || isSubmitted) return
    let stream = null
    navigator.mediaDevices?.getUserMedia({ video: true })
      .then(s => {
        stream = s
        setCameraStream(s)
        if (videoRef.current) videoRef.current.srcObject = s
      })
      .catch(() => setCameraError('Camera access denied. This assignment requires camera.'))
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop())
    }
  }, [assignment, existingSubmission, isSubmitted])

  // Attach stream to video element when ref is ready
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream
    }
  }, [cameraStream])

  // Request location when assignment requires it
  useEffect(() => {
    if (!assignment?.requires_location || existingSubmission || isSubmitted) return
    navigator.geolocation?.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude.toFixed(5), lng: pos.coords.longitude.toFixed(5) }),
      () => setLocationError('Location access denied. This assignment requires your location.')
    )
  }, [assignment, existingSubmission, isSubmitted])

  // Prevent accidental navigation while taking (not in read-only mode)
  useEffect(() => {
    if (existingSubmission || isSubmitted) return
    const handleBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = ''
      return ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [existingSubmission, isSubmitted])

  const fetchAssignment = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`/api/assignments/${assignmentId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      setAssignment(response.data.assignment)
      setQuestions(response.data.assignment.questions || [])

      const submission = response.data.submission
      if (submission) {
        // Already submitted — parse previous answers for read-only display
        setExistingSubmission(submission)
        try {
          const parsed = JSON.parse(submission.submission_content || '{}')
          setAnswers(parsed)
        } catch {
          setAnswers({})
        }
      } else {
        // Fresh start — initialize empty answers + timer
        const initialAnswers = {}
        response.data.assignment.questions?.forEach(q => {
          initialAnswers[q.id] = ''
        })
        setAnswers(initialAnswers)
        if (response.data.assignment.duration_minutes) {
          setTimeLeft(response.data.assignment.duration_minutes * 60)
        }
      }

      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch assignment:', error)
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault()
    try {
      setSubmitting(true)
      const token = localStorage.getItem('token')

      await axios.post(`/api/assignments/${assignmentId}/submit`, {
        assignment_id: assignmentId,
        answers,
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      setIsSubmitted(true)
      cameraStream?.getTracks().forEach(t => t.stop())
      setCameraStream(null)
      setMessage({ show: true, type: 'success', text: 'Assignment submitted successfully!' })
      setSubmitting(false)
      setTimeout(() => navigate(-1), 2000)
    } catch (error) {
      setSubmitting(false)
      setMessage({
        show: true,
        type: 'error',
        text: error.response?.data?.message || 'Failed to submit assignment',
      })
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-slate-600">Loading assignment...</div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-slate-600">Assignment not found</div>
      </div>
    )
  }

  const isReadOnly = !!existingSubmission

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} className="text-slate-900" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{assignment.title}</h1>
              <p className="text-slate-500 text-sm">
                {isReadOnly ? 'Submission review — read only' : 'Submit your assignment'}
              </p>
            </div>
          </div>

          {/* Camera indicator */}
          {!isReadOnly && assignment?.requires_camera && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold ${
              cameraStream ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'
            }`}>
              {cameraStream ? <Video size={16} /> : <VideoOff size={16} />}
              {cameraStream ? 'Camera On' : 'No Camera'}
            </div>
          )}

          {/* Location indicator */}
          {!isReadOnly && assignment?.requires_location && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold ${
              location ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-red-50 text-red-600 border border-red-200'
            }`}>
              {location ? <MapPin size={16} /> : <MapPinOff size={16} />}
              {location ? `${location.lat}, ${location.lng}` : 'No Location'}
            </div>
          )}

          {/* Timer — only shown when actively taking */}
          {!isReadOnly && timeLeft !== null && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-lg ${
              timeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}>
              <Clock size={20} />
              {formatTime(timeLeft)}
            </div>
          )}

          {/* Submitted badge */}
          {isReadOnly && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg font-semibold text-sm">
              <CheckCircle2 size={18} />
              Submitted {existingSubmission.submitted_at
                ? new Date(existingSubmission.submitted_at).toLocaleDateString()
                : ''}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        {/* Camera preview — shown when assignment requires camera and actively taking */}
        {!isReadOnly && assignment?.requires_camera && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            {cameraError ? (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                <VideoOff size={20} className="flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Camera Required</p>
                  <p className="text-xs mt-0.5">{cameraError}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="relative flex-shrink-0">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-44 h-32 object-cover rounded-lg bg-black"
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    LIVE
                  </div>
                </div>
                <div className="pt-1">
                  <p className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                    <Video size={16} className="text-teal-600" />
                    Camera Active
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Your camera is on as required by this assignment. It will turn off automatically after submission.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Location banner */}
        {!isReadOnly && assignment?.requires_location && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            {locationError ? (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                <MapPinOff size={20} className="flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Location Required</p>
                  <p className="text-xs mt-0.5">{locationError}</p>
                </div>
              </div>
            ) : location ? (
              <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-700">
                <MapPin size={20} className="flex-shrink-0 text-blue-600" />
                <div>
                  <p className="font-semibold text-sm">Location Recorded</p>
                  <p className="text-xs mt-0.5 font-mono">{location.lat}, {location.lng}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700">
                <MapPin size={20} className="flex-shrink-0 animate-pulse" />
                <p className="text-sm font-semibold">Getting your location...</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Assignment Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-gray-200 rounded-lg bg-white p-8 mb-8 shadow-sm"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-4">Assignment Details</h2>

          {assignment.description && (
            <p className="text-slate-700 mb-6">{assignment.description}</p>
          )}

          {assignment.instructions && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Instructions</h3>
              <p className="text-blue-800 whitespace-pre-line">{assignment.instructions}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {assignment.due_date && (
              <div className="border border-gray-200 rounded-lg p-3">
                <p className="text-xs font-medium text-slate-600 mb-1">Due Date</p>
                <p className="text-lg font-bold text-slate-900">
                  {new Date(assignment.due_date).toLocaleDateString()}
                </p>
              </div>
            )}
            {assignment.duration_minutes && (
              <div className="border border-gray-200 rounded-lg p-3">
                <p className="text-xs font-medium text-slate-600 mb-1">Duration</p>
                <p className="text-lg font-bold text-slate-900">{assignment.duration_minutes} minutes</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Score — only shown when trainer has enabled show_score_to_staff */}
        {isReadOnly && assignment?.show_score_to_staff && existingSubmission?.status === 'graded' && existingSubmission?.score !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="border border-green-200 rounded-lg bg-green-50 p-6 mb-8 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-green-800 mb-0.5">Your Score</p>
              <p className="text-xs text-green-600">Graded by trainer</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-green-700">{existingSubmission.score}</p>
              <p className="text-sm text-green-600">/ {assignment.max_score || 100}</p>
            </div>
          </motion.div>
        )}

        {/* Questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="border border-gray-200 rounded-lg bg-white p-8 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Questions</h2>
            {isReadOnly && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Eye size={16} />
                Read-only view
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {questions.map((question, idx) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="border border-gray-200 rounded-lg p-6 bg-gray-50"
              >
                <div className="mb-4">
                  <p className="font-semibold text-slate-900 mb-1">
                    {idx + 1}. {question.question}
                  </p>
                  <p className="text-xs text-slate-500 capitalize">
                    {question.type === 'multiple_choice' ? 'Multiple Choice' : 'Essay'}
                  </p>
                </div>

                {question.type === 'multiple_choice' ? (
                  <div className="space-y-2">
                    {question.options?.map((option) => {
                      const isSelected = String(answers[question.id]) === String(option.id)
                      return (
                        <label
                          key={option.id}
                          className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                            isReadOnly
                              ? isSelected
                                ? 'bg-teal-50 border border-teal-400 cursor-default'
                                : 'bg-white border border-gray-200 cursor-default opacity-60'
                              : 'cursor-pointer hover:bg-white border border-transparent hover:border-gray-200'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option.id}
                            checked={isSelected}
                            onChange={(e) =>
                              !isReadOnly && setAnswers({ ...answers, [question.id]: e.target.value })
                            }
                            disabled={isReadOnly}
                            className="w-4 h-4 accent-teal-600"
                          />
                          <span className={`text-slate-700 ${isSelected && isReadOnly ? 'font-semibold text-teal-800' : ''}`}>
                            {option.option_text}
                          </span>
                          {isSelected && isReadOnly && (
                            <CheckCircle2 size={16} className="ml-auto text-teal-500 flex-shrink-0" />
                          )}
                        </label>
                      )
                    })}
                  </div>
                ) : (
                  <textarea
                    value={answers[question.id] || ''}
                    onChange={(e) =>
                      !isReadOnly && setAnswers({ ...answers, [question.id]: e.target.value })
                    }
                    readOnly={isReadOnly}
                    placeholder={isReadOnly ? 'No answer provided' : 'Write your answer here...'}
                    rows="4"
                    className={`w-full px-4 py-3 border border-gray-200 rounded-lg text-slate-900 placeholder-slate-400 ${
                      isReadOnly
                        ? 'bg-gray-50 cursor-default focus:outline-none'
                        : 'focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none'
                    }`}
                  />
                )}
              </motion.div>
            ))}

            {questions.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <p>No questions in this assignment yet.</p>
              </div>
            )}

            {/* Actions */}
            {!isReadOnly && questions.length > 0 && (
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  <Send size={18} />
                  {submitting ? 'Submitting...' : 'Submit Assignment'}
                </button>
              </div>
            )}

            {isReadOnly && (
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  <ArrowLeft size={18} />
                  Back to Assignments
                </button>
              </div>
            )}
          </form>
        </motion.div>
      </div>

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
              <div className={`rounded-lg shadow-lg border px-8 py-6 flex items-center gap-4 bg-white ${
                message.type === 'success' ? 'border-green-200' : 'border-red-200'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                )}
                <p className={`text-sm font-medium ${
                  message.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
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
