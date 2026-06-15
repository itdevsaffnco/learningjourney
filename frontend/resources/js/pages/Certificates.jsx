import { useState, useEffect } from 'react'
import { ArrowLeft, Award, Download, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'

export default function Certificates() {
  const navigate = useNavigate()
  const [certificates, setCertificates] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      const [certRes, coursesRes] = await Promise.all([
        axios.get('/api/certificates', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('/api/courses', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      setCertificates(certRes.data || [])
      setCourses(coursesRes.data.courses || [])
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      setLoading(false)
    }
  }

  const getCertificateForCourse = (courseId) => {
    return certificates.find(cert => cert.course_id === courseId)
  }

  return (
    <main className="flex-1 overflow-y-auto bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} className="text-slate-900" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Certificates</h1>
            <p className="text-slate-600 text-sm">Complete courses to earn certificates</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        {loading ? (
          <div className="text-center py-12 text-slate-600">Loading certificates...</div>
        ) : certificates.length === 0 ? (
          <div className="text-center py-16">
            <Award size={48} className="mx-auto text-slate-400 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Certificates Yet</h3>
            <p className="text-slate-600 mb-6">
              Complete a course to earn your first certificate
            </p>
            <button
              onClick={() => navigate('/courses')}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors"
            >
              Explore Courses
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert, idx) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="border border-teal-200 rounded-lg p-6 bg-gradient-to-br from-teal-50 to-white shadow-md hover:shadow-lg transition-shadow"
              >
                {/* Course Title */}
                <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
                  {cert.course?.name || 'Course'}
                </h3>

                {/* Certificate Issued Badge */}
                <div className="bg-teal-100 rounded-lg p-4 text-center mb-4">
                  <Award size={32} className="text-teal-600 mx-auto mb-2" />
                  <p className="text-teal-900 font-semibold text-sm">Certificate Earned!</p>
                  <p className="text-teal-700 text-xs mt-1">
                    {new Date(cert.issued_date).toLocaleDateString()}
                  </p>
                </div>

                {/* Certificate Details */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 mb-4">
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Certificate Number</p>
                    <p className="text-sm font-mono text-slate-900 break-all">{cert.certificate_number}</p>
                  </div>
                </div>

                {/* Download Button */}
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors font-semibold">
                  <Download size={16} />
                  Download Certificate
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
