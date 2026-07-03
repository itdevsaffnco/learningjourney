import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Play, FileText, BookOpen, ChevronDown, ChevronRight, Trophy, X, Headphones } from 'lucide-react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { useQuizLock } from '../context/QuizLockContext'

export default function CourseLearn() {
  const { moduleId } = useParams()
  const navigate = useNavigate()
  const [module, setModule] = useState(null)
  const [lessons, setLessons] = useState([])
  const [currentLesson, setCurrentLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [quiz, setQuiz] = useState(null)
  const [quizPhase, setQuizPhase] = useState('idle') // idle | active | done
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizResult, setQuizResult] = useState(null)
  const [quizSubmitting, setQuizSubmitting] = useState(false)
  const [showQuizWarning, setShowQuizWarning] = useState(false)
  const contentRef = useRef(null)
  const { setIsQuizActive } = useQuizLock()

  useEffect(() => {
    fetchData()
  }, [moduleId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }

      // showModule already returns lessons via eager loading
      const moduleRes = await axios.get(`/api/modules/${moduleId}`, { headers })
      const moduleData = moduleRes.data
      const rawLessons = (moduleData.lessons || []).sort((a, b) => a.order - b.order)

      setModule(moduleData)

      // Fetch progress for all lessons
      const lessonsWithProgress = await Promise.all(
        rawLessons.map(async (lesson) => {
          try {
            const res = await axios.get(`/api/lessons/${lesson.id}`, { headers })
            return {
              ...lesson,
              is_completed: res.data.progress?.is_completed || false,
              content: res.data.lesson?.content,
              video_url: res.data.lesson?.video_url,
              audio_url: res.data.lesson?.audio_url,
              quiz_id: res.data.lesson?.quiz_id,
            }
          } catch {
            return { ...lesson, is_completed: false }
          }
        })
      )

      setLessons(lessonsWithProgress)
      if (lessonsWithProgress.length > 0) {
        setCurrentLesson(lessonsWithProgress[0])
      }

      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch course data:', error)
      setLoading(false)
    }
  }

  const selectLesson = async (lesson) => {
    if (quizPhase === 'active') {
      setShowQuizWarning(true)
      return
    }
    setCurrentLesson(lesson)
    setQuiz(null)
    setQuizPhase('idle')
    setQuizAnswers({})
    setQuizResult(null)
  }

  const startQuiz = async (quizId) => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get(`/api/quizzes/${quizId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      let questions = res.data.quiz?.questions || []

      if (currentLesson.randomize_questions) {
        questions = [...questions].sort(() => Math.random() - 0.5)
      }

      if (currentLesson.num_questions_to_show && currentLesson.num_questions_to_show < questions.length) {
        questions = questions.slice(0, currentLesson.num_questions_to_show)
      }

      setQuiz({ ...res.data.quiz, questions })
      setQuizPhase('active')
      setQuizAnswers({})
      setIsQuizActive(true)
    } catch (error) {
      console.error('Failed to load quiz:', error)
    }
  }

  const submitQuiz = async () => {
    if (!quiz || quizSubmitting) return
    try {
      setQuizSubmitting(true)
      const token = localStorage.getItem('token')
      const answers = quiz.questions.map(q => ({
        question_id: q.id,
        selected_option_id: quizAnswers[q.id] || null,
      }))

      const res = await axios.post(`/api/quizzes/${quiz.id}/submit`, { answers }, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setQuizResult(res.data)
      setQuizPhase('done')
      setIsQuizActive(false)

      if (res.data.passed) {
        await markComplete()
      }
    } catch (error) {
      console.error('Failed to submit quiz:', error)
    } finally {
      setQuizSubmitting(false)
    }
  }

  const markComplete = async () => {
    if (!currentLesson || marking) return
    try {
      setMarking(true)
      const token = localStorage.getItem('token')
      await axios.post(`/api/lessons/${currentLesson.id}/progress`, {
        is_completed: true,
        progress_percentage: 100,
      }, { headers: { Authorization: `Bearer ${token}` } })

      const updated = lessons.map(l =>
        l.id === currentLesson.id ? { ...l, is_completed: true } : l
      )
      setLessons(updated)
      setCurrentLesson({ ...currentLesson, is_completed: true })
    } catch (error) {
      console.error('Failed to mark complete:', error)
    } finally {
      setMarking(false)
    }
  }

  const goToNextLesson = () => {
    const currentIdx = lessons.findIndex(l => l.id === currentLesson?.id)
    if (currentIdx < lessons.length - 1) {
      selectLesson(lessons[currentIdx + 1])
    }
  }

  const getLessonIcon = (type) => {
    if (type === 'video') return <Play size={14} className="text-blue-500" />
    if (type === 'audio') return <Headphones size={14} className="text-teal-500" />
    if (type === 'quiz') return <BookOpen size={14} className="text-purple-500" />
    return <FileText size={14} className="text-slate-500" />
  }

  const completedCount = lessons.filter(l => l.is_completed).length
  const progress = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0

  if (loading) {
    return (
      <main className="flex-1 overflow-y-auto bg-white flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </main>
    )
  }

  return (
    <main className="flex-1 flex overflow-hidden bg-white">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-0'} flex-shrink-0 border-r border-gray-200 overflow-y-auto transition-all duration-300 bg-white`}>
        <div className="p-4 border-b border-gray-200">
          <button onClick={() => navigate('/courses')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-3 text-sm">
            <ArrowLeft size={16} /> Back to Courses
          </button>
          <h2 className="font-bold text-slate-900 text-sm line-clamp-2">{module?.title}</h2>
          <div className="mt-2">
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span>{completedCount}/{lessons.length} lessons</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="py-2">
          {lessons.map((lesson, idx) => (
            <button
              key={lesson.id}
              onClick={() => selectLesson(lesson)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                currentLesson?.id === lesson.id ? 'bg-teal-50 border-r-2 border-teal-500' : ''
              }`}
            >
              <div className="flex-shrink-0">
                {lesson.is_completed
                  ? <CheckCircle2 size={16} className="text-teal-500" />
                  : <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center">
                      <span className="text-xs text-slate-500">{idx + 1}</span>
                    </div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${currentLesson?.id === lesson.id ? 'font-semibold text-teal-700' : 'text-slate-700'}`}>
                  {lesson.title}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  {getLessonIcon(lesson.type)}
                  <span className="text-xs text-slate-400 capitalize">{lesson.type}</span>
                  {lesson.duration_minutes > 0 && (
                    <span className="text-xs text-slate-400">· {lesson.duration_minutes}m</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div ref={contentRef} className="flex-1 overflow-y-auto">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center gap-4 sticky top-0 bg-white z-10">
          <button onClick={() => setSidebarOpen(o => !o)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            {sidebarOpen ? <ChevronDown size={18} className="rotate-90" /> : <ChevronRight size={18} />}
          </button>
          <h1 className="text-lg font-bold text-slate-900 flex-1 truncate">{currentLesson?.title}</h1>
          {currentLesson && !currentLesson.is_completed && (
            <button
              onClick={markComplete}
              disabled={marking}
              className="px-5 py-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-60 text-sm"
            >
              {marking ? 'Saving...' : 'Mark Complete'}
            </button>
          )}
          {currentLesson?.is_completed && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-600 rounded-lg text-sm font-semibold">
                <CheckCircle2 size={16} />
                Completed
              </div>
              {lessons.findIndex(l => l.id === currentLesson.id) < lessons.length - 1 && (
                <button
                  onClick={goToNextLesson}
                  className="px-5 py-2 bg-slate-700 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors text-sm flex items-center gap-2"
                >
                  Next Lesson
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          )}
        </div>

        {currentLesson ? (
          <div className="max-w-4xl mx-auto px-6 py-8">
            {/* Text lesson */}
            {currentLesson.type === 'text' && currentLesson.content && (
              <motion.div
                key={currentLesson.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: currentLesson.content }}
              />
            )}

            {/* Video lesson */}
            {currentLesson.type === 'video' && currentLesson.video_url && (
              <motion.div key={currentLesson.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {(() => {
                  const url = currentLesson.video_url
                  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
                  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/)
                  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
                  if (ytMatch) return (
                    <iframe src={`https://www.youtube.com/embed/${ytMatch[1]}`} className="w-full aspect-video rounded-lg shadow-md" allowFullScreen />
                  )
                  if (driveMatch) return (
                    <iframe src={`https://drive.google.com/file/d/${driveMatch[1]}/preview`} className="w-full aspect-video rounded-lg shadow-md" allowFullScreen />
                  )
                  if (vimeoMatch) return (
                    <iframe src={`https://player.vimeo.com/video/${vimeoMatch[1]}`} className="w-full aspect-video rounded-lg shadow-md" allowFullScreen />
                  )
                  return (
                    <video src={url} controls className="w-full rounded-lg shadow-md" onEnded={markComplete} />
                  )
                })()}
                {currentLesson.content && currentLesson.content !== '<p></p>' && (
                  <div
                    className="mt-6 prose prose-slate max-w-none"
                    dangerouslySetInnerHTML={{ __html: currentLesson.content }}
                  />
                )}
                {!currentLesson.content && currentLesson.description && (
                  <p className="mt-4 text-slate-600 whitespace-pre-line">{currentLesson.description}</p>
                )}
              </motion.div>
            )}

            {/* Audio lesson */}
            {currentLesson.type === 'audio' && currentLesson.audio_url && (
              <motion.div key={currentLesson.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="bg-gradient-to-br from-teal-50 to-slate-50 border border-teal-100 rounded-xl p-8 mb-6 flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center">
                    <Headphones size={40} className="text-teal-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{currentLesson.title}</h3>
                  <audio
                    src={currentLesson.audio_url}
                    controls
                    className="w-full max-w-xl"
                    onEnded={markComplete}
                  />
                </div>
                {currentLesson.content && currentLesson.content !== '<p></p>' && (
                  <div
                    className="prose prose-slate max-w-none mt-4"
                    dangerouslySetInnerHTML={{ __html: currentLesson.content }}
                  />
                )}
              </motion.div>
            )}

            {/* Quiz lesson */}
            {currentLesson.type === 'quiz' && (
              <motion.div key={currentLesson.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>

                {/* Idle: before quiz starts */}
                {quizPhase === 'idle' && (
                  <div className="text-center py-16 border border-gray-200 rounded-xl">
                    <BookOpen size={56} className="mx-auto text-purple-500 mb-5" />
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{currentLesson.title}</h3>
                    <p className="text-slate-600 mb-8">{currentLesson.description || 'Complete this quiz to mark the lesson as done'}</p>
                    {currentLesson.quiz_id ? (
                      <button
                        onClick={() => startQuiz(currentLesson.quiz_id)}
                        className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors text-lg"
                      >
                        Start Quiz
                      </button>
                    ) : (
                      <p className="text-slate-400 text-sm">No quiz linked to this lesson yet.</p>
                    )}
                  </div>
                )}

                {/* Active: answering questions */}
                {quizPhase === 'active' && quiz && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-slate-900">{quiz.title}</h3>
                      <span className="text-sm text-slate-500">
                        {Object.keys(quizAnswers).length}/{quiz.questions?.length || 0} answered
                      </span>
                    </div>

                    {quiz.questions?.map((question, qIdx) => (
                      <div key={question.id} className="border border-gray-200 rounded-xl p-6">
                        <p className="font-semibold text-slate-900 mb-4">
                          <span className="text-purple-600 mr-2">{qIdx + 1}.</span>
                          {question.question}
                        </p>
                        <div className="space-y-3">
                          {question.options?.map(option => (
                            <label
                              key={option.id}
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                quizAnswers[question.id] === option.id
                                  ? 'border-purple-500 bg-purple-50'
                                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`question-${question.id}`}
                                value={option.id}
                                checked={quizAnswers[question.id] === option.id}
                                onChange={() => setQuizAnswers(prev => ({ ...prev, [question.id]: option.id }))}
                                className="accent-purple-600"
                              />
                              <span className="text-slate-800">{option.option_text}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <button
                        onClick={() => setShowQuizWarning(true)}
                        className="px-5 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={submitQuiz}
                        disabled={quizSubmitting || Object.keys(quizAnswers).length < (quiz.questions?.length || 0)}
                        className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {quizSubmitting ? 'Submitting...' : 'Submit Quiz'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Done: results screen */}
                {quizPhase === 'done' && quizResult && (
                  <div className="text-center py-12 border border-gray-200 rounded-xl">
                    {quizResult.passed ? (
                      <>
                        <Trophy size={64} className="mx-auto text-yellow-500 mb-4" />
                        <h3 className="text-2xl font-bold text-green-600 mb-2">You Passed!</h3>
                      </>
                    ) : (
                      <>
                        <X size={64} className="mx-auto text-red-400 mb-4" />
                        <h3 className="text-2xl font-bold text-red-500 mb-2">Not Quite</h3>
                      </>
                    )}

                    <div className="inline-flex items-center gap-6 mt-4 mb-6 px-8 py-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-3xl font-bold text-slate-900">{quizResult.score}</p>
                        <p className="text-xs text-slate-500 mt-1">Score</p>
                      </div>
                      <div className="w-px h-10 bg-gray-200" />
                      <div>
                        <p className="text-3xl font-bold text-slate-900">{quizResult.percentage}%</p>
                        <p className="text-xs text-slate-500 mt-1">Percentage</p>
                      </div>
                      <div className="w-px h-10 bg-gray-200" />
                      <div>
                        <p className="text-3xl font-bold text-slate-900">{quizResult.passing_score}%</p>
                        <p className="text-xs text-slate-500 mt-1">Passing Score</p>
                      </div>
                    </div>

                    <p className="text-slate-600 mb-8">
                      {quizResult.passed
                        ? 'Great job! This lesson has been marked as complete.'
                        : `You need ${quizResult.passing_score}% to pass. Give it another try!`}
                    </p>

                    <div className="flex justify-center gap-3">
                      {!quizResult.passed && (() => {
                        const currentIdx = lessons.findIndex(l => l.id === currentLesson?.id)
                        const prevLesson = currentIdx > 0 ? lessons[currentIdx - 1] : null
                        return (
                          <>
                            {prevLesson && (
                              <button
                                onClick={() => selectLesson(prevLesson)}
                                className="px-6 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-lg transition-colors flex items-center gap-2"
                              >
                                <ArrowLeft size={16} />
                                Learn More
                              </button>
                            )}
                            <button
                              onClick={() => { setQuizPhase('idle'); setQuiz(null); setQuizAnswers({}); setQuizResult(null) }}
                              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                            >
                              Try Again
                            </button>
                          </>
                        )
                      })()}
                      {quizResult.passed && lessons.findIndex(l => l.id === currentLesson.id) < lessons.length - 1 && (
                        <button
                          onClick={goToNextLesson}
                          className="px-6 py-2 bg-slate-700 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                        >
                          Next Lesson <ChevronRight size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Fallback if no content */}
            {currentLesson.type !== 'quiz' && currentLesson.type !== 'audio' && !currentLesson.content && !currentLesson.video_url && (
              <div className="text-center py-12 text-slate-500">
                <FileText size={48} className="mx-auto mb-4 opacity-40" />
                <p>No content available for this lesson yet.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">
            <p>Select a lesson from the sidebar to begin</p>
          </div>
        )}
      </div>

      {/* Quiz warning modal */}
      {showQuizWarning && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setShowQuizWarning(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-sm w-full pointer-events-auto p-6 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <BookOpen size={24} className="text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Quiz In Progress</h3>
              <p className="text-slate-600 text-sm mb-6">
                Please finish the quiz first before navigating away.
              </p>
              <button
                onClick={() => setShowQuizWarning(false)}
                className="w-full px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
              >
                Continue Quiz
              </button>
            </motion.div>
          </div>
        </>
      )}
    </main>
  )
}
