import { useState, useEffect } from 'react'
import { ArrowLeft, Flame } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'

export default function Leaderboard() {
  const navigate = useNavigate()
  const [leaderboard, setLeaderboard] = useState([])
  const [streakLeaders, setStreakLeaders] = useState([])
  const [activeTab, setActiveTab] = useState('points')
  const [loading, setLoading] = useState(true)

  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}') } catch { return {} } })()
  const isTrainer = user?.role === 'Trainer' || user?.role?.name === 'Trainer'

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      if (activeTab === 'points') {
        const res = await axios.get('/api/leaderboard', {
          headers: { Authorization: `Bearer ${token}` },
        })
        setLeaderboard(res.data.leaderboard || [])
      } else if (activeTab === 'streak') {
        const res = await axios.get('/api/leaderboard/streak', {
          headers: { Authorization: `Bearer ${token}` },
        })
        setStreakLeaders(res.data || [])
      }
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
      setLoading(false)
    }
  }

  const data = activeTab === 'points' ? leaderboard : streakLeaders

  return (
    <main className="flex-1 overflow-y-auto bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(isTrainer ? '/trainer/dashboard' : '/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} className="text-slate-900" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Leaderboard</h1>
              <p className="text-slate-600 text-sm">See who's leading the way</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Tabs */}
        <div className="border-b border-gray-200 flex gap-8 py-4">
          <button
            onClick={() => setActiveTab('points')}
            className={`pb-4 font-semibold transition-colors ${
              activeTab === 'points'
                ? 'text-slate-900 border-b-2 border-slate-900'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Points
          </button>
          <button
            onClick={() => setActiveTab('streak')}
            className={`pb-4 font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'streak'
                ? 'text-slate-900 border-b-2 border-slate-900'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flame size={20} />
            Daily Streak
          </button>
        </div>

        <div className="py-8">
          {loading ? (
            <div className="text-center py-12 text-slate-600">Loading...</div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-4 px-6 font-semibold text-slate-900">Rank</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-900">Name</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-900">Division</th>
                      <th className="text-right py-4 px-6 font-semibold text-slate-900">
                        {activeTab === 'points' ? 'Total Points' : 'Streak Days'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.length > 0 ? (
                      data.map((item, idx) => (
                        <motion.tr
                          key={idx}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-center gap-2">
                              {item.rank === 1 && <span className="text-2xl">🥇</span>}
                              {item.rank === 2 && <span className="text-2xl">🥈</span>}
                              {item.rank === 3 && <span className="text-2xl">🥉</span>}
                              {item.rank > 3 && (
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-900 font-semibold">
                                  {item.rank}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <p className="font-semibold text-slate-900">{item.user_name}</p>
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700">
                              {item.division || 'N/A'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <p className="font-bold text-slate-900 text-lg">
                              {activeTab === 'points' ? item.total_points : item.daily_streak}
                            </p>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-8 px-6 text-center text-slate-600">
                          No data yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  )
}
