import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

export default function ProtectedLayout({ user }) {
  return (
    <div className="flex h-screen bg-white">
      <Sidebar user={user} />
      <Outlet context={{ user }} />
    </div>
  )
}
