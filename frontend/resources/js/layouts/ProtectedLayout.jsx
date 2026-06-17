import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import logoSaff from '../../../assets/logosaff.jpg'

export default function ProtectedLayout({ user }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar
        user={user}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-20 flex-shrink-0">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-slate-900" />
          </button>
          <img src={logoSaff} alt="SAFF" className="w-7 h-7 object-contain" />
          <span className="font-bold text-slate-900 text-lg">SAFF LMS</span>
        </div>

        <Outlet context={{ user }} />
      </div>
    </div>
  )
}
