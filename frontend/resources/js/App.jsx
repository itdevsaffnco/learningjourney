import { useState, useEffect, Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedLayout from './layouts/ProtectedLayout'

const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const LearningPath = lazy(() => import('./pages/LearningPath'))
const TrainerDashboard = lazy(() => import('./pages/TrainerDashboard'))
const ModuleManager = lazy(() => import('./pages/ModuleManager'))
const LessonManager = lazy(() => import('./pages/LessonManager'))
const LearningPathManager = lazy(() => import('./pages/LearningPathManager'))
const LearningPathDetail = lazy(() => import('./pages/LearningPathDetail'))
const QuizManager = lazy(() => import('./pages/QuizManager'))
const QuizDetail = lazy(() => import('./pages/QuizDetail'))
const AssignmentManager = lazy(() => import('./pages/AssignmentManager'))
const AssignmentDetail = lazy(() => import('./pages/AssignmentDetail'))
const AssignmentResults = lazy(() => import('./pages/AssignmentResults'))
const AssignmentSubmit = lazy(() => import('./pages/AssignmentSubmit'))
const StudentProgress = lazy(() => import('./pages/StudentProgress'))
const StudentProgressDetail = lazy(() => import('./pages/StudentProgressDetail'))
const Announcements = lazy(() => import('./pages/Announcements'))
const Account = lazy(() => import('./pages/Account'))
const UserManagement = lazy(() => import('./pages/UserManagement'))
const ActivityLogs = lazy(() => import('./pages/ActivityLogs'))
const Leaderboard = lazy(() => import('./pages/Leaderboard'))
const MyLearning = lazy(() => import('./pages/MyLearning'))
const LearnLesson = lazy(() => import('./pages/LearnLesson'))
const Courses = lazy(() => import('./pages/Courses'))
const AssignmentsPage = lazy(() => import('./pages/Assignments'))
const Certificates = lazy(() => import('./pages/Certificates'))
const CertificateRequests = lazy(() => import('./pages/CertificateRequests'))
const CourseLearn = lazy(() => import('./pages/CourseLearn'))
const AnnouncementsPage = lazy(() => import('./pages/Announcements'))

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetchUser(token)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async (token) => {
    try {
      const response = await fetch('/api/user', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
        setIsAuthenticated(true)
      } else {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <Routes>
        <Route path="/login" element={
          <Login onLogin={(token, userData) => {
            localStorage.setItem('token', token)
            setUser(userData)
            setIsAuthenticated(true)
          }} />
        } />

        {/* Public Assignment Submission */}
        <Route path="/assignments/:assignmentId" element={<AssignmentSubmit />} />

        {isAuthenticated && (
          <Route element={<ProtectedLayout user={user} />}>
            {/* Default/Staff Routes */}
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/my-learning" element={<MyLearning user={user} />} />
            <Route path="/courses" element={<Courses user={user} />} />
            <Route path="/courses/:moduleId" element={<CourseLearn user={user} />} />
            <Route path="/assignments" element={<AssignmentsPage user={user} />} />
            <Route path="/assignments/:assignmentId" element={<AssignmentSubmit />} />
            <Route path="/learning-path/:pathId/lessons" element={<LearnLesson user={user} />} />
            <Route path="/learning-path/:pathId" element={<LearningPathDetail user={user} />} />
            <Route path="/learning-path" element={<LearningPath user={user} />} />

            {/* Trainer Routes */}
            <Route path="/trainer/dashboard" element={<TrainerDashboard user={user} />} />
            <Route path="/trainer/modules" element={<ModuleManager user={user} />} />
            <Route path="/trainer/modules/:moduleId/lessons" element={<LessonManager user={user} />} />
            <Route path="/trainer/learning-paths" element={<LearningPathManager user={user} />} />
            <Route path="/trainer/learning-paths/:pathId" element={<LearningPathDetail user={user} />} />
            <Route path="/trainer/quizzes" element={<QuizManager user={user} />} />
            <Route path="/trainer/quizzes/:quizId" element={<QuizDetail user={user} />} />
            <Route path="/trainer/assignments" element={<AssignmentManager user={user} />} />
            <Route path="/trainer/assignments/:assignmentId" element={<AssignmentDetail user={user} />} />
            <Route path="/trainer/assignments/:assignmentId/results" element={<AssignmentResults user={user} />} />
            <Route path="/trainer/student-progress" element={<StudentProgress user={user} />} />
            <Route path="/trainer/student-progress/:studentId" element={<StudentProgressDetail user={user} />} />
            <Route path="/trainer/announcements" element={<Announcements user={user} />} />
            <Route path="/trainer/certificate-requests" element={<CertificateRequests user={user} />} />
            <Route path="/admin/users" element={<UserManagement user={user} />} />
            <Route path="/trainer/logs" element={<ActivityLogs user={user} />} />
            <Route path="/leaderboard" element={<Leaderboard user={user} />} />
            <Route path="/certificates" element={<Certificates user={user} />} />
            <Route path="/announcements" element={<AnnouncementsPage user={user} />} />
            <Route path="/account" element={<Account user={user} />} />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Route>
        )}

        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </Suspense>
  )
}
