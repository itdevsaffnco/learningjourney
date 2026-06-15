import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, BookOpen, Clock, Star, Users, Play, X } from 'lucide-react'
import axios from 'axios'

export default function Courses() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    role: 'all',
    difficulty: 'all',
    duration: 'all',
    rating: 'all'
  })

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const res = await axios.get('/api/courses', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setCourses(res.data.courses || [])
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch courses:', error)
      setCourses([])
      setLoading(false)
    }
  }

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
      const matchDifficulty = filters.difficulty === 'all' || course.difficulty === filters.difficulty
      const matchDuration = filters.duration === 'all' ||
        (filters.duration === 'short' && course.duration <= 10) ||
        (filters.duration === 'medium' && course.duration > 10 && course.duration <= 15) ||
        (filters.duration === 'long' && course.duration > 15)
      const matchRating = filters.rating === 'all' ||
        (filters.rating === '4' && course.rating >= 4) ||
        (filters.rating === '4.5' && course.rating >= 4.5)

      return matchSearch && matchDifficulty && matchDuration && matchRating
    })
  }, [searchQuery, filters, courses])

  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced']

  return (
    <main className="flex-1 overflow-y-auto bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Courses</h1>
          <p className="text-slate-600">Jelajahi semua course yang tersedia</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Cari course atau instruktur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-slate-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6 sticky top-40">
              <h3 className="text-lg font-bold text-slate-900">Filter</h3>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">Difficulty</label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="all">All Levels</option>
                  {difficulties.slice(1).map(diff => (
                    <option key={diff} value={diff}>{diff}</option>
                  ))}
                </select>
              </div>

              {/* Duration Filter */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">Duration</label>
                <select
                  value={filters.duration}
                  onChange={(e) => setFilters({ ...filters, duration: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="all">Any Duration</option>
                  <option value="short">Short (&le;10 hrs)</option>
                  <option value="medium">Medium (10-15 hrs)</option>
                  <option value="long">Long (&gt;15 hrs)</option>
                </select>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">Rating</label>
                <select
                  value={filters.rating}
                  onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="all">All Ratings</option>
                  <option value="4">4.0+</option>
                  <option value="4.5">4.5+</option>
                </select>
              </div>

              {/* Reset Filters */}
              {Object.values(filters).some(v => v !== 'all') && (
                <button
                  onClick={() => setFilters({ difficulty: 'all', duration: 'all', rating: 'all' })}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X size={16} /> Reset
                </button>
              )}
            </div>
          </div>

          {/* Courses Grid */}
          <div className="col-span-3">
            {loading ? (
              <div className="text-center py-12 text-slate-600">Loading courses...</div>
            ) : filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course, idx) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow group cursor-pointer bg-white"
                  >
                    {/* Image */}
                    <div className="relative h-40 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-blue-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                      <div className="absolute top-3 right-3 inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-white/90 text-slate-700">
                        {course.difficulty}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-bold text-slate-900 mb-1 line-clamp-2">{course.title}</h3>
                      <p className="text-slate-600 text-xs mb-3">{course.instructor}</p>

                      {/* Stats */}
                      <div className="flex items-center gap-4 mb-4 text-xs text-slate-600">
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>{course.duration}h</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-yellow-500" />
                          <span>{course.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users size={14} />
                          <span>{(course.students / 1000).toFixed(1)}k</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {course.progress > 0 && (
                        <>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
                            <motion.div
                              animate={{ width: `${course.progress}%` }}
                              transition={{ duration: 0.8 }}
                              className="h-full bg-gradient-to-r from-slate-700 to-slate-900 rounded-full"
                            />
                          </div>
                          <span className="text-xs text-slate-600">{course.progress}%</span>
                        </>
                      )}

                      {/* Button */}
                      <button
                        onClick={() => navigate(`/courses/${course.id}`)}
                        className={`w-full mt-4 flex items-center justify-center gap-2 py-2 rounded-lg font-semibold transition-colors ${
                          course.progress > 0
                            ? 'bg-gray-100 text-slate-600 hover:bg-gray-200'
                            : 'bg-slate-700 hover:bg-slate-800 text-white'
                        }`}
                      >
                        <Play size={16} />
                        {course.progress > 0 ? 'Continue' : 'Start'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen size={48} className="mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600">No courses found matching your filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
