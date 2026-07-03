import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronRight, CheckCircle2, Clock, Play, FileText, BookOpen, ArrowLeft, ArrowRight, Download, Lock } from 'lucide-react'
import { motion } from 'framer-motion'
import axios from 'axios'

export default function LearnLesson() {
  const { pathId } = useParams()
  const navigate = useNavigate()
  const [pathData, setPathData] = useState(null)
  const [currentLesson, setCurrentLesson] = useState(null)
  const [lessonContent, setLessonContent] = useState(null)
  const [expandedModules, setExpandedModules] = useState([0])
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [quizState, setQuizState] = useState({
    isStarted: false,
    currentQuestionIndex: 0,
    answers: {},
    isSubmitted: false,
    results: null,
    isSubmitting: false
  })
  const [quizQuestions, setQuizQuestions] = useState([])

  const toggleModule = (idx) => {
    setExpandedModules(prev =>
      prev.includes(idx)
        ? prev.filter(i => i !== idx)
        : [...prev, idx]
    )
  }

  const isHtmlQuizCompleted = () => {
    if (!pathData) return false
    const htmlModule = pathData.modules.find(m => m.id === 1)
    if (!htmlModule) return false
    const htmlQuiz = htmlModule.lessons.find(l => l.id === 3)
    return htmlQuiz?.completed || false
  }

  const shouldLockCssLessons = () => {
    return !isHtmlQuizCompleted()
  }

  const getEffectiveLockedStatus = (lesson, moduleId) => {
    // CSS Styling module (id: 2) requires HTML Quiz completion
    if (moduleId === 2) {
      return shouldLockCssLessons()
    }
    return lesson.locked || false
  }

  const getModuleProgress = (module) => {
    const total = module.lessons.length
    const completed = module.lessons.filter(l => l.completed).length
    const percentage = Math.round((completed / total) * 100)
    return { completed, total, percentage, isComplete: completed === total }
  }

  useEffect(() => {
    fetchData()
  }, [pathId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      // Mock data - dalam real app, fetch dari API
      const mockPath = {
        id: pathId,
        title: 'Belajar Web Development',
        description: 'Master the fundamentals of web development',
        modules: [
          {
            id: 1,
            title: 'HTML Basics',
            lessons: [
              { id: 1, title: 'Introduction to HTML', type: 'text', completed: false, locked: false },
              { id: 2, title: 'HTML Tags & Structure', type: 'text', completed: true, locked: false },
              { id: 3, title: 'HTML Quiz', type: 'quiz', completed: false, locked: false }
            ]
          },
          {
            id: 2,
            title: 'CSS Styling',
            lessons: [
              { id: 4, title: 'CSS Selectors', type: 'text', completed: false, locked: false },
              { id: 5, title: 'CSS Flexbox Video', type: 'video', completed: false, locked: false }
            ]
          }
        ]
      }

      const mockLesson = {
        id: 1,
        title: 'Pengenalan Mentor, Kelas Ini Penting',
        type: 'text',
        duration: 15,
        content: `<h2>Kenapa Kelas Ini dan Mentornya</h2>
        <p>Sebelum kamu invest waktu membaca kelas ini — ada satu pertanyaan yang layak dijawab dulu: <strong>kenapa kamu harus mendengarkan orang yang menulis ini?</strong></p>

        <p>Pertanyaan yang fair. Internet penuh dengan orang yang mengajarkan cara membangun bisnis tapi belum pernah membangun satu pun. Penuh dengan "guru startup" yang pengalamannya hanya dari buku dan podcast — bukan dari production server yang crash jam 2 pagi atau customer yang marah karena billing error.</p>

        <p>Kelas ini berbeda. Bukan karena materinya paling lengkap di internet — tapi karena setiap lesson dituis oleh seseorang yang sedang menjalankan apa yang dijarkan. Bukan dulu. Sekarang. Sekarang.</p>

        <h3>Siapa yang Menulis Kelas Ini</h3>
        <p>Nama saya <strong>Angga Risky Setiawan</strong>. Saya founder <strong>BuildWithAngga</strong> (buildwithangga.com) — platform edtech dengan 900K+ students di Indonesia, dan builder <strong>Shayna AI</strong> (shaynaaa.com) — AI-powered website builder.</p>

        <p>Tapi title dan angka itu tidak terlalu berarti tanpa konteks. Jadi ini cerita singkatnya.</p>`
      }

      setPathData(mockPath)
      setCurrentLesson(mockPath.modules[0].lessons[0])
      setLessonContent(mockLesson)

      // Mock quiz questions
      const mockQuizQuestions = [
        {
          id: 1,
          question: 'What does HTML stand for?',
          type: 'multiple_choice',
          options: [
            { id: 1, text: 'Hyper Text Markup Language', isCorrect: true },
            { id: 2, text: 'High Tech Modern Language', isCorrect: false },
            { id: 3, text: 'Home Tool Markup Language', isCorrect: false },
            { id: 4, text: 'Hyperlinks and Text Markup Language', isCorrect: false }
          ]
        },
        {
          id: 2,
          question: 'Which tag is used to define a paragraph in HTML?',
          type: 'multiple_choice',
          options: [
            { id: 1, text: '<paragraph>', isCorrect: false },
            { id: 2, text: '<p>', isCorrect: true },
            { id: 3, text: '<para>', isCorrect: false },
            { id: 4, text: '<pg>', isCorrect: false }
          ]
        },
        {
          id: 3,
          question: 'What is the purpose of the <head> tag?',
          type: 'multiple_choice',
          options: [
            { id: 1, text: 'To define the main heading', isCorrect: false },
            { id: 2, text: 'To contain metadata and other information about the document', isCorrect: true },
            { id: 3, text: 'To create a header section', isCorrect: false },
            { id: 4, text: 'None of the above', isCorrect: false }
          ]
        },
        {
          id: 4,
          question: 'Which of the following is a semantic HTML5 tag?',
          type: 'multiple_choice',
          options: [
            { id: 1, text: '<div>', isCorrect: false },
            { id: 2, text: '<span>', isCorrect: false },
            { id: 3, text: '<article>', isCorrect: true },
            { id: 4, text: '<font>', isCorrect: false }
          ]
        }
      ]
      setQuizQuestions(mockQuizQuestions)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      setLoading(false)
    }
  }

  const getAllLessons = () => {
    if (!pathData) return []
    const allLessons = []
    pathData.modules.forEach(module => {
      allLessons.push(...module.lessons)
    })
    return allLessons
  }

  const getCurrentLessonIndex = () => {
    const allLessons = getAllLessons()
    return allLessons.findIndex(l => l.id === currentLesson?.id)
  }

  const getNextLesson = () => {
    const allLessons = getAllLessons()
    const currentIndex = getCurrentLessonIndex()
    if (currentIndex < allLessons.length - 1) {
      return allLessons[currentIndex + 1]
    }
    return null
  }

  const getPreviousLesson = () => {
    const allLessons = getAllLessons()
    const currentIndex = getCurrentLessonIndex()
    if (currentIndex > 0) {
      return allLessons[currentIndex - 1]
    }
    return null
  }

  const handleMarkComplete = async () => {
    try {
      setMarking(true)
      const token = localStorage.getItem('token')
      // API call to mark lesson as complete
      // await axios.post(`/api/lessons/${currentLesson.id}/progress`, {}, {
      //   headers: { Authorization: `Bearer ${token}` }
      // })

      // Update pathData with completed lesson
      const updatedPath = {
        ...pathData,
        modules: pathData.modules.map(module => ({
          ...module,
          lessons: module.lessons.map(l =>
            l.id === currentLesson.id ? { ...l, completed: true } : l
          )
        }))
      }
      setPathData(updatedPath)

      // Update current lesson
      const updatedLesson = { ...currentLesson, completed: true }
      setCurrentLesson(updatedLesson)

      // Auto navigate to next lesson
      const nextLesson = getNextLesson()
      if (nextLesson) {
        setCurrentLesson(nextLesson)
      }

      setMarking(false)
    } catch (error) {
      console.error('Failed to mark complete:', error)
      setMarking(false)
    }
  }

  const handlePreviousLesson = () => {
    const prevLesson = getPreviousLesson()
    if (prevLesson) {
      setCurrentLesson(prevLesson)
    }
  }

  const handleNextLesson = () => {
    const nextLesson = getNextLesson()
    if (nextLesson) {
      setCurrentLesson(nextLesson)
    }
  }

  const startQuiz = () => {
    setQuizState(prev => ({
      ...prev,
      isStarted: true,
      currentQuestionIndex: 0,
      answers: {},
      isSubmitted: false
    }))
  }

  const selectAnswer = (optionId) => {
    const currentQuestion = quizQuestions[quizState.currentQuestionIndex]
    setQuizState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [currentQuestion.id]: optionId
      }
    }))
  }

  const goToNextQuestion = () => {
    if (quizState.currentQuestionIndex < quizQuestions.length - 1) {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }))
    }
  }

  const goToPreviousQuestion = () => {
    if (quizState.currentQuestionIndex > 0) {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1
      }))
    }
  }

  const submitQuiz = async () => {
    try {
      setQuizState(prev => ({ ...prev, isSubmitting: true }))

      // Calculate results
      let correctCount = 0
      const detailedResults = quizQuestions.map(question => {
        const selectedOptionId = quizState.answers[question.id]
        const selectedOption = question.options.find(opt => opt.id === selectedOptionId)
        const isCorrect = selectedOption?.isCorrect || false
        if (isCorrect) correctCount++

        return {
          questionId: question.id,
          question: question.question,
          selectedOptionId,
          selectedOption: selectedOption?.text,
          correctOption: question.options.find(opt => opt.isCorrect)?.text,
          isCorrect
        }
      })

      const percentage = Math.round((correctCount / quizQuestions.length) * 100)
      const passed = percentage >= 70

      const results = {
        score: correctCount,
        totalQuestions: quizQuestions.length,
        percentage,
        passed,
        details: detailedResults
      }

      setQuizState(prev => ({
        ...prev,
        isSubmitted: true,
        results,
        isSubmitting: false
      }))

      // Mark lesson as complete if passed
      if (passed) {
        handleMarkComplete()
      }
    } catch (error) {
      console.error('Error submitting quiz:', error)
      setQuizState(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  const resetQuiz = () => {
    setQuizState({
      isStarted: false,
      currentQuestionIndex: 0,
      answers: {},
      isSubmitted: false,
      results: null,
      isSubmitting: false
    })
  }

  const handleMarkLessonComplete = (e, lesson) => {
    e.stopPropagation()
    // Update pathData with completed lesson
    const updatedPath = {
      ...pathData,
      modules: pathData.modules.map(module => ({
        ...module,
        lessons: module.lessons.map(l =>
          l.id === lesson.id ? { ...l, completed: true } : l
        )
      }))
    }
    setPathData(updatedPath)

    // If this is the current lesson, also update it
    if (currentLesson?.id === lesson.id) {
      setCurrentLesson({ ...currentLesson, completed: true })
    }
  }

  if (loading) {
    return (
      <main className="flex h-screen bg-white">
        <div className="flex items-center justify-center w-full">
          <div className="text-slate-600">Loading...</div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      <motion.div
        animate={{ width: sidebarOpen ? 320 : 0 }}
        className="border-r border-gray-200 overflow-hidden"
      >
        <div className="w-80 h-full flex flex-col overflow-y-auto">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
            <button
              onClick={() => navigate('/my-learning')}
              className="flex items-center gap-2 text-slate-700 hover:text-slate-900 mb-4 font-semibold"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <h3 className="font-bold text-slate-900 text-sm">{pathData?.title}</h3>
          </div>

          {/* Modules & Lessons */}
          <div className="flex-1 p-4 space-y-3">
            {pathData?.modules.map((module, idx) => (
              <div key={module.id}>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    toggleModule(idx)
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <span className="font-semibold text-slate-900 text-sm text-left">{module.title}</span>
                  <motion.div
                    animate={{ rotate: expandedModules.includes(idx) ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={18} className="text-slate-600" />
                  </motion.div>
                </button>

                {expandedModules.includes(idx) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 pl-4 pb-3"
                  >
                    {/* Lessons List */}
                    <div className="space-y-2">
                      {module.lessons.map((lesson) => {
                      const isLocked = getEffectiveLockedStatus(lesson, module.id)
                      return (
                        <div
                          key={lesson.id}
                          className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors group ${
                            currentLesson?.id === lesson.id && !isLocked
                              ? 'bg-slate-700 text-white'
                              : isLocked
                              ? 'opacity-50'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          <button
                            onClick={() => !isLocked && setCurrentLesson(lesson)}
                            disabled={isLocked}
                            className="flex-1 flex items-center gap-2 min-w-0 text-left text-sm disabled:cursor-not-allowed"
                          >
                            {lesson.type === 'text' && <FileText size={16} className="flex-shrink-0" />}
                            {lesson.type === 'video' && <Play size={16} className="flex-shrink-0" />}
                            {lesson.type === 'quiz' && <CheckCircle2 size={16} className="flex-shrink-0" />}
                            <span className={`truncate font-medium ${
                              currentLesson?.id === lesson.id ? 'text-white' : 'text-slate-700'
                            }`}>
                              {lesson.title}
                            </span>
                          </button>

                          {/* Lock Icon / Checkmark Button */}
                          {isLocked ? (
                            <div
                              className="p-1 rounded flex-shrink-0 text-slate-500 cursor-not-allowed"
                              title="Complete HTML Quiz first"
                            >
                              <Lock size={18} />
                            </div>
                          ) : (
                            <button
                              onClick={(e) => handleMarkLessonComplete(e, lesson)}
                              className="flex-shrink-0 hover:scale-110 transition-colors"
                              title={lesson.completed ? 'Completed' : 'Mark as complete'}
                            >
                              {lesson.completed ? (
                                <CheckCircle2 size={18} className="text-green-500" strokeWidth={2} />
                              ) : (
                                <CheckCircle2 size={18} className="text-gray-300" strokeWidth={2} />
                              )}
                            </button>
                          )}
                        </div>
                      )
                    })}
                    </div>

                    {/* Module Progress Card */}
                    {(() => {
                      const progress = getModuleProgress(module)
                      return (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-900">{progress.completed}/{progress.total} lessons</span>
                              <span className="font-bold text-slate-700">{progress.percentage}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                              <motion.div
                                animate={{ width: `${progress.percentage}%` }}
                                transition={{ duration: 0.5 }}
                                className="h-full bg-gradient-to-r from-slate-700 to-slate-900 rounded-full"
                              />
                            </div>
                            {progress.isComplete && (
                              <div className="flex items-center gap-1 justify-center pt-1">
                                <span className="text-xs font-bold text-green-600">🎉 Module Complete!</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })()}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? '✕' : '☰'}
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{currentLesson?.title}</h1>
              <p className="text-slate-600 text-sm">
                {currentLesson?.type === 'text' && '📄 Text Lesson'}
                {currentLesson?.type === 'video' && '🎥 Video Lesson'}
                {currentLesson?.type === 'quiz' && '✓ Quiz'}
                {currentLesson?.duration && ` • ${currentLesson.duration} min`}
              </p>
            </div>
          </div>
          {!currentLesson?.completed && (
            <button
              onClick={handleMarkComplete}
              disabled={marking}
              className="flex items-center gap-2 px-6 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              <CheckCircle2 size={20} />
              {marking ? 'Marking...' : 'Mark as Complete'}
            </button>
          )}
          {currentLesson?.completed && (
            <div className="flex items-center gap-2 px-6 py-2 bg-green-100 text-green-700 rounded-lg font-semibold">
              <CheckCircle2 size={20} />
              Completed
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-8 py-12">
            {/* Text Lesson */}
            {currentLesson?.type === 'text' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="prose prose-slate max-w-none"
              >
                <div
                  dangerouslySetInnerHTML={{ __html: lessonContent?.content || '' }}
                  className="text-slate-700 leading-relaxed space-y-4"
                />
              </motion.div>
            )}

            {/* Video Lesson */}
            {currentLesson?.type === 'video' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Video Player */}
                <div className="bg-black rounded-lg overflow-hidden aspect-video">
                  {(() => {
                    const url = lessonContent?.videoUrl || ''
                    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
                    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/)
                    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
                    if (ytMatch) {
                      return <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${ytMatch[1]}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                    } else if (driveMatch) {
                      return <iframe className="w-full h-full" src={`https://drive.google.com/file/d/${driveMatch[1]}/preview`} allow="autoplay" allowFullScreen />
                    } else if (vimeoMatch) {
                      return <iframe className="w-full h-full" src={`https://player.vimeo.com/video/${vimeoMatch[1]}`} allow="autoplay; fullscreen" allowFullScreen />
                    } else {
                      return (
                        <video controls className="w-full h-full">
                          <source src={url} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      )
                    }
                  })()}
                </div>

                {/* Video Info */}
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">{currentLesson?.title}</h2>
                    <p className="text-slate-600">
                      {currentLesson?.duration && `Duration: ${currentLesson.duration} minutes`}
                    </p>
                  </div>

                  {/* Description */}
                  {lessonContent?.content && (
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="font-semibold text-slate-900 mb-3">About this video</h3>
                      <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {lessonContent.content}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Quiz Lesson */}
            {currentLesson?.type === 'quiz' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 max-w-2xl"
              >
                {/* Quiz Start Screen */}
                {!quizState.isStarted && !quizState.isSubmitted && (
                  <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg p-8 text-white">
                    <h2 className="text-3xl font-bold mb-4">{currentLesson?.title}</h2>
                    <div className="space-y-3 mb-6">
                      <p className="text-slate-200">📋 {quizQuestions.length} questions</p>
                      <p className="text-slate-200">⏱️ Estimated time: 10 minutes</p>
                      <p className="text-slate-200">✓ Passing score: 70%</p>
                    </div>
                    <p className="text-slate-300 mb-8">Test your knowledge and complete this module!</p>
                    <button
                      onClick={startQuiz}
                      className="px-8 py-3 bg-white text-slate-900 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
                    >
                      Start Quiz →
                    </button>
                  </div>
                )}

                {/* Quiz Questions */}
                {quizState.isStarted && !quizState.isSubmitted && (
                  <div className="space-y-6">
                    {/* Progress */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-slate-900">
                          Question {quizState.currentQuestionIndex + 1} of {quizQuestions.length}
                        </span>
                        <span className="text-sm font-semibold text-slate-700">{Math.round(((quizState.currentQuestionIndex + 1) / quizQuestions.length) * 100)}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          animate={{ width: `${((quizState.currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
                          transition={{ duration: 0.3 }}
                          className="h-full bg-slate-700 rounded-full"
                        />
                      </div>
                    </div>

                    {/* Question */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-slate-900 mb-6">
                        {quizQuestions[quizState.currentQuestionIndex]?.question}
                      </h3>

                      {/* Options */}
                      <div className="space-y-3">
                        {quizQuestions[quizState.currentQuestionIndex]?.options.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => selectAnswer(option.id)}
                            className={`w-full p-4 rounded-lg border-2 transition-colors text-left ${
                              quizState.answers[quizQuestions[quizState.currentQuestionIndex].id] === option.id
                                ? 'border-slate-700 bg-slate-50'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                quizState.answers[quizQuestions[quizState.currentQuestionIndex].id] === option.id
                                  ? 'border-slate-700 bg-slate-700'
                                  : 'border-gray-300'
                              }`}>
                                {quizState.answers[quizQuestions[quizState.currentQuestionIndex].id] === option.id && (
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                )}
                              </div>
                              <span className="font-medium text-slate-900">{option.text}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex gap-3 justify-between">
                      <button
                        onClick={goToPreviousQuestion}
                        disabled={quizState.currentQuestionIndex === 0}
                        className="px-4 py-2 border border-gray-200 text-slate-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        ← Previous
                      </button>

                      {quizState.currentQuestionIndex === quizQuestions.length - 1 ? (
                        <button
                          onClick={submitQuiz}
                          disabled={quizState.isSubmitting || !quizState.answers[quizQuestions[quizState.currentQuestionIndex].id]}
                          className="px-8 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-semibold disabled:opacity-50 transition-colors"
                        >
                          {quizState.isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                        </button>
                      ) : (
                        <button
                          onClick={goToNextQuestion}
                          disabled={!quizState.answers[quizQuestions[quizState.currentQuestionIndex].id]}
                          className="px-8 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-semibold disabled:opacity-50 transition-colors"
                        >
                          Next →
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Quiz Results */}
                {quizState.isSubmitted && quizState.results && (
                  <div className="space-y-6">
                    {/* Score Card */}
                    <div className={`rounded-lg p-8 text-white text-center ${
                      quizState.results.passed ? 'bg-gradient-to-br from-green-500 to-green-600' : 'bg-gradient-to-br from-red-500 to-red-600'
                    }`}>
                      <h3 className="text-4xl font-bold mb-2">{quizState.results.percentage}%</h3>
                      <p className="text-lg mb-4">{quizState.results.passed ? '🎉 Congratulations!' : '📚 Try Again'}</p>
                      <p className="text-sm mb-6 opacity-90">
                        You answered {quizState.results.score} out of {quizState.results.totalQuestions} questions correctly
                      </p>
                      <p className="text-sm opacity-90">Passing score: 70%</p>
                    </div>

                    {/* Results Details */}
                    <div className="space-y-3">
                      {quizState.results.details.map((detail, idx) => (
                        <div
                          key={idx}
                          className={`rounded-lg p-4 border-l-4 ${
                            detail.isCorrect
                              ? 'border-green-500 bg-green-50'
                              : 'border-red-500 bg-red-50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="text-2xl">
                              {detail.isCorrect ? '✓' : '✗'}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-slate-900 mb-2">{detail.question}</p>
                              <p className="text-sm text-slate-700 mb-1">
                                <strong>Your answer:</strong> {detail.selectedOption || 'Not answered'}
                              </p>
                              {!detail.isCorrect && (
                                <p className="text-sm text-slate-700">
                                  <strong>Correct answer:</strong> {detail.correctOption}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Action Button */}
                    <div className="flex gap-3 justify-center">
                      {!quizState.results.passed && (
                        <button
                          onClick={resetQuiz}
                          className="px-8 py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors"
                        >
                          Retake Quiz
                        </button>
                      )}
                      <button
                        onClick={() => handleNextLesson()}
                        className="px-8 py-3 border-2 border-slate-700 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold transition-colors"
                      >
                        Continue Learning →
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="border-t border-gray-200 px-8 py-6 bg-white">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <button
              onClick={handlePreviousLesson}
              disabled={!getPreviousLesson()}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-lg font-semibold transition-colors text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={20} />
              Previous
            </button>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span>Lesson {getCurrentLessonIndex() + 1} of {getAllLessons().length}</span>
              <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${((getCurrentLessonIndex() + 1) / getAllLessons().length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-slate-700 rounded-full"
                />
              </div>
            </div>

            {!currentLesson?.completed ? (
              <button
                onClick={handleMarkComplete}
                disabled={marking}
                className="flex items-center gap-2 px-6 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {marking ? 'Completing...' : 'Complete'}
                <ArrowRight size={20} />
              </button>
            ) : (
              <button
                onClick={handleNextLesson}
                disabled={!getNextLesson()}
                className="flex items-center gap-2 px-6 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ArrowRight size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
