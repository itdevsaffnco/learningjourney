import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Home, BookOpen, Trophy, FileText, CheckSquare, Gift,
  Medal, Bell, LogOut, Menu, X, Users, BarChart3,
  Settings, Zap, Award, User
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRole } from '../hooks/useRole'
import logoSaff from '../../../assets/logosaff.jpg'

export default function Sidebar({ user }) {
  const [isOpen, setIsOpen] = useState(true)
  const navigate = useNavigate()
  const { isAdmin, isTrainer, isStaff, role } = useRole()

  // Debug: Log role detection
  console.log('[Sidebar] Detected Role:', role, 'isAdmin:', isAdmin(), 'isTrainer:', isTrainer(), 'isStaff:', isStaff())

  // Role-based menu items
  const adminMenuItems = [
    { label: 'Dashboard', icon: Home, path: '/dashboard' },
    { label: 'User Management', icon: Users, path: '/admin/users' },
    { label: 'Divisions', icon: Zap, path: '/admin/divisions' },
    { label: 'Content Review', icon: CheckSquare, path: '/admin/content' },
    { label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
    { label: 'Settings', icon: Settings, path: '/admin/settings' },
  ]

  const trainerMenuItems = [
    { label: 'Dashboard', icon: Home, path: '/trainer/dashboard' },
    { label: 'Modules', icon: BookOpen, path: '/trainer/modules' },
    { label: 'Learning Paths', icon: FileText, path: '/trainer/learning-paths' },
    { label: 'Quizzes', icon: CheckSquare, path: '/trainer/quizzes' },
    { label: 'Assignments', icon: Medal, path: '/trainer/assignments' },
    { label: 'Student Progress', icon: BarChart3, path: '/trainer/student-progress' },
    { label: 'Leaderboard', icon: Trophy, path: '/leaderboard' },
    { label: 'Announcements', icon: Bell, path: '/trainer/announcements' },
    { label: 'User Management', icon: Users, path: '/admin/users' },
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
  if (isAdmin()) {
    menuItems = adminMenuItems
  } else if (isTrainer()) {
    menuItems = trainerMenuItems
  }

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

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className={`${
          isOpen ? 'w-80' : 'w-20'
        } bg-white border-r border-gray-200 text-slate-900 flex flex-col transition-all duration-300 shadow-sm`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {isOpen && (
            <div className="flex items-center gap-3">
              <img
                src={logoSaff}
                alt="SAFF Logo"
                className="w-8 h-8 object-contain"
              />
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">SAFF LMS</h1>
                <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                  isAdmin() ? 'bg-gray-200 text-slate-800' :
                  isTrainer() ? 'bg-gray-200 text-slate-800' :
                  'bg-gray-200 text-slate-800'
                }`}>
                  {role || 'Unknown'}
                </span>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-slate-900"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors group relative"
              title={!isOpen ? item.label : ''}
            >
              <item.icon className="w-5 h-5 flex-shrink-0 text-slate-700" />
              {isOpen && <span className="text-sm font-medium text-slate-800">{item.label}</span>}
              {!isOpen && (
                <div className="absolute left-20 bg-white border border-gray-200 px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-xs text-slate-900 shadow-sm">
                  {item.label}
                </div>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          {isOpen && (
            <div className="mb-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-600">{user?.division}</p>
            </div>
          )}
          <Link
            to="/account"
            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium text-slate-700"
          >
            <User className="w-4 h-4" />
            {isOpen && 'Account'}
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            {isOpen && 'Logout'}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
