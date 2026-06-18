import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Home, BookOpen, Trophy, FileText, CheckSquare, Gift,
  Medal, Bell, LogOut, Menu, X, Users, BarChart3,
  Award, User, ShoppingBag
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRole } from '../hooks/useRole'
import { useQuizLock } from '../context/QuizLockContext'
import logoSaff from '../../../assets/logosaff.jpg'

export default function Sidebar({ user, mobileOpen = false, onMobileClose = () => {} }) {
  const [isOpen, setIsOpen] = useState(true)
  const [showQuizWarning, setShowQuizWarning] = useState(false)
  const navigate = useNavigate()
  const { isAdmin, isTrainer, isStaff, role } = useRole()
  const { isQuizActive } = useQuizLock()

  const adminMenuItems = [
    { label: 'Dashboard', icon: Home, path: '/trainer/dashboard' },
    { label: 'Modules', icon: BookOpen, path: '/trainer/modules' },
    { label: 'Learning Paths', icon: FileText, path: '/trainer/learning-paths' },
    { label: 'Quizzes', icon: CheckSquare, path: '/trainer/quizzes' },
    { label: 'Assignments', icon: Medal, path: '/trainer/assignments' },
    { label: 'Student Progress', icon: BarChart3, path: '/trainer/student-progress' },
    { label: 'Certificate Requests', icon: Award, path: '/trainer/certificate-requests' },
    { label: 'Leaderboard', icon: Trophy, path: '/leaderboard' },
    { label: 'Announcements', icon: Bell, path: '/trainer/announcements' },
    { label: 'User Management', icon: Users, path: '/admin/users' },
    { label: 'Mystery Shopper', icon: ShoppingBag, path: '/trainer/mystery-shopper' },
    { label: 'Activity Logs', icon: BarChart3, path: '/trainer/logs' },
  ]

  const trainerMenuItems = [
    { label: 'Dashboard', icon: Home, path: '/trainer/dashboard' },
    { label: 'Modules', icon: BookOpen, path: '/trainer/modules' },
    { label: 'Learning Paths', icon: FileText, path: '/trainer/learning-paths' },
    { label: 'Quizzes', icon: CheckSquare, path: '/trainer/quizzes' },
    { label: 'Assignments', icon: Medal, path: '/trainer/assignments' },
    { label: 'Student Progress', icon: BarChart3, path: '/trainer/student-progress' },
    { label: 'Certificate Requests', icon: Award, path: '/trainer/certificate-requests' },
    { label: 'Leaderboard', icon: Trophy, path: '/leaderboard' },
    { label: 'Announcements', icon: Bell, path: '/trainer/announcements' },
    { label: 'User Management', icon: Users, path: '/admin/users' },
    { label: 'Mystery Shopper', icon: ShoppingBag, path: '/trainer/mystery-shopper' },
    { label: 'Activity Logs', icon: BarChart3, path: '/trainer/logs' },
  ]

  const staffMenuItems = [
    { label: 'Home', icon: Home, path: '/dashboard' },
    { label: 'My Learning', icon: BookOpen, path: '/my-learning' },
    { label: 'Learning Path', icon: FileText, path: '/learning-path' },
    { label: 'Courses', icon: Trophy, path: '/courses' },
    { label: 'Assignments', icon: Medal, path: '/assignments' },
    { label: 'Leaderboard', icon: Award, path: '/leaderboard' },
    { label: 'Certificates', icon: Gift, path: '/certificates' },
    { label: 'Announcements', icon: Bell, path: '/announcements' },
  ]

  let menuItems = staffMenuItems
  if (isAdmin()) menuItems = adminMenuItems
  else if (isTrainer()) menuItems = trainerMenuItems

  const handleLogout = () => {
    const token = localStorage.getItem('token')
    fetch('/api/logout', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    }).finally(() => {
      localStorage.removeItem('token')
      navigate('/login')
    })
  }

  const handleNavClick = () => {
    // Close mobile drawer on navigation
    onMobileClose()
  }

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-30 md:hidden"
            onClick={onMobileClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <div
        className={[
          // Base
          'flex flex-col bg-white border-r border-gray-200 text-slate-900 shadow-sm',
          // Mobile: fixed full-height drawer
          'fixed inset-y-0 left-0 z-40 w-72',
          'transition-transform duration-300 ease-in-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop: static, no transform, collapsible width
          'md:static md:inset-auto md:z-auto md:translate-x-0',
          'md:transition-all md:duration-300',
          isOpen ? 'md:w-80' : 'md:w-20',
        ].join(' ')}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          {(isOpen || mobileOpen) && (
            <div className="flex items-center gap-3">
              <img src={logoSaff} alt="SAFF Logo" className="w-8 h-8 object-contain" />
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">SAFF LMS</h1>
                <span className="px-2 py-1 text-xs font-bold rounded-full bg-gray-200 text-slate-800">
                  {role || 'Unknown'}
                </span>
              </div>
            </div>
          )}

          {/* Mobile: always X to close */}
          <button
            onClick={onMobileClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-slate-900 md:hidden"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Desktop: toggle collapse */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hidden md:block p-2 hover:bg-gray-100 rounded-lg transition-colors text-slate-900"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={(e) => {
                if (isQuizActive) {
                  e.preventDefault()
                  setShowQuizWarning(true)
                  return
                }
                handleNavClick()
              }}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors group relative"
              title={!isOpen ? item.label : ''}
            >
              <item.icon className="w-5 h-5 flex-shrink-0 text-slate-700" />
              {(isOpen || mobileOpen) && (
                <span className="text-sm font-medium text-slate-800">{item.label}</span>
              )}
              {!isOpen && !mobileOpen && (
                <div className="absolute left-20 bg-white border border-gray-200 px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-xs text-slate-900 shadow-sm pointer-events-none">
                  {item.label}
                </div>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 space-y-2 flex-shrink-0">
          {(isOpen || mobileOpen) && (
            <div className="mb-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs font-semibold text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-600">{user?.division}</p>
            </div>
          )}
          <Link
            to="/account"
            onClick={(e) => {
              if (isQuizActive) { e.preventDefault(); setShowQuizWarning(true); return }
              handleNavClick()
            }}
            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium text-slate-700"
          >
            <User className="w-4 h-4 flex-shrink-0" />
            {(isOpen || mobileOpen) && 'Account'}
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {(isOpen || mobileOpen) && 'Logout'}
          </button>
        </div>
      </div>

      {/* Quiz lock warning */}
      {showQuizWarning && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setShowQuizWarning(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-sm w-full pointer-events-auto p-6 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-purple-600" />
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
    </>
  )
}
