import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, BarChart3 } from 'lucide-react'
import { motion } from 'framer-motion'
import axios from 'axios'

export default function StudentProgress() {
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDivision, setFilterDivision] = useState('all')

  const DIVISIONS = ['Beauty Advisor', 'Host Live', 'Customer Service']

  const filteredStudents = students.filter(student => {
    const matchSearch = !searchQuery ||
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchDivision = filterDivision === 'all' || student.division === filterDivision
    return matchSearch && matchDivision
  })

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/progress/students', {
        headers: { Authorization: `Bearer ${token}` },
      })
      console.log('Fetch students response:', response.data)
      setStudents(response.data.students || [])
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch students:', error.response?.data || error.message)
      setStudents([])
      setLoading(false)
    }
  }

  return (
    <main className="flex-1 overflow-y-auto bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Student Progress</h1>
            <p className="text-slate-600 mt-2 text-sm">Track and monitor student learning progress</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Search Section */}
        <div className="mb-8 space-y-5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search students by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900 placeholder-slate-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Division filter chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500 font-medium">Division:</span>
            <button
              onClick={() => setFilterDivision('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterDivision === 'all' ? 'bg-slate-700 text-white' : 'border border-gray-200 text-slate-600 hover:bg-gray-50'}`}
            >All</button>
            {DIVISIONS.map(div => (
              <button
                key={div}
                onClick={() => setFilterDivision(div)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterDivision === div ? 'bg-slate-700 text-white' : 'border border-gray-200 text-slate-600 hover:bg-gray-50'}`}
              >{div}</button>
            ))}
            {(filterDivision !== 'all' || searchQuery) && (
              <button
                onClick={() => { setFilterDivision('all'); setSearchQuery('') }}
                className="ml-auto text-xs text-slate-500 hover:text-slate-800 underline transition-colors"
              >Reset</button>
            )}
          </div>

          {(filterDivision !== 'all' || searchQuery) && (
            <p className="text-xs text-slate-500">{filteredStudents.length} student ditemukan</p>
          )}
        </div>

        {/* Students Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12 text-slate-600">Loading...</div>
          ) : filteredStudents.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-slate-600">No students found.</p>
            </div>
          ) : (
            filteredStudents.map((student, idx) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col"
              >
                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  {/* Student Info */}
                  <div className="mb-5">
                    <h3 className="font-bold text-lg text-slate-900 leading-tight mb-1">
                      {student.name}
                    </h3>
                    <p className="text-sm text-slate-600 mb-2">{student.email}</p>
                    {student.division && (
                      <span className="inline-block px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full border border-purple-100">
                        {student.division}
                      </span>
                    )}
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-slate-600">Completed</span>
                      </div>
                      <p className="text-lg font-bold text-slate-900">
                        {student.completed_lessons || 0}
                      </p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-slate-600">Points</span>
                      </div>
                      <p className="text-lg font-bold text-slate-900">
                        {student.total_points || 0}
                      </p>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => navigate(`/trainer/student-progress/${student.id}`)}
                    className="w-full py-3 bg-slate-700 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}
