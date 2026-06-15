import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, FileText, Clock, CheckCircle2, AlertCircle, Send, X } from 'lucide-react'
import axios from 'axios'

export default function Assignments() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAssignments()
  }, [])

  const fetchAssignments = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const res = await axios.get('/api/assignments', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setAssignments(res.data.assignments || [])
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch assignments:', error)
      setAssignments([])
      setLoading(false)
    }
  }

  const mockAssignments = [
    {
      id: 1,
      title: 'Product Knowledge Assessment',
      description: 'Demonstrate your understanding of SAFF product portfolio and fragrance classifications',
      dueDate: '2026-06-25',
      status: 'not-started',
      questions: 8,
      duration: 30,
      createdBy: 'Rina Wijaya'
    },
    {
      id: 2,
      title: 'Sales Pitch Development',
      description: 'Create a compelling sales pitch for our signature fragrance line',
      dueDate: '2026-06-20',
      status: 'submitted',
      questions: 5,
      duration: 45,
      createdBy: 'Budi Santoso',
      submittedAt: '2026-06-18'
    },
    {
      id: 3,
      title: 'Customer Service Scenario',
      description: 'Handle various customer service scenarios and provide appropriate responses',
      dueDate: '2026-06-15',
      status: 'submitted',
      questions: 10,
      duration: 60,
      createdBy: 'Siti Nur Aini',
      submittedAt: '2026-06-14'
    },
    {
      id: 4,
      title: 'Brand Marketing Campaign Proposal',
      description: 'Develop a marketing campaign proposal for new fragrance launch',
      dueDate: '2026-07-05',
      status: 'not-started',
      questions: 6,
      duration: 90,
      createdBy: 'Ahmad Gunawan'
    },
    {
      id: 5,
      title: 'Digital Marketing Analysis',
      description: 'Analyze current digital marketing strategies and provide recommendations',
      dueDate: '2026-06-28',
      status: 'submitted',
      questions: 7,
      duration: 45,
      createdBy: 'Luna Pratama',
      submittedAt: '2026-06-19'
    }
  ]

  const filteredAssignments = useMemo(() => {
    return assignments.filter(assignment => {
      const matchSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.created_by.toLowerCase().includes(searchQuery.toLowerCase())
      const matchStatus = statusFilter === 'all' || assignment.status === statusFilter

      return matchSearch && matchStatus
    })
  }, [searchQuery, statusFilter, assignments])

  const getStatusBadge = (status) => {
    switch (status) {
      case 'not-started':
        return { color: 'bg-gray-100 text-gray-700', icon: AlertCircle, label: 'Not Started' }
      case 'submitted':
        return { color: 'bg-green-100 text-green-700', icon: CheckCircle2, label: 'Submitted' }
      default:
        return { color: 'bg-gray-100 text-gray-700', icon: FileText, label: 'Unknown' }
    }
  }

  const isOverdue = (dueDate, status) => {
    if (status === 'submitted') return false
    return new Date(dueDate) < new Date()
  }

  return (
    <main className="flex-1 overflow-y-auto bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Assignments</h1>
          <p className="text-slate-600">Complete your assignments and final term assessments</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Cari assignment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-slate-900"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8 flex gap-3">
          {[
            { value: 'all', label: 'All' },
            { value: 'not-started', label: 'Not Started' },
            { value: 'submitted', label: 'Submitted' }
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                statusFilter === tab.value
                  ? 'bg-slate-700 text-white'
                  : 'bg-gray-100 text-slate-700 hover:bg-gray-200'
              }`}
            >
              {tab.label} ({assignments.filter(a => tab.value === 'all' || a.status === tab.value).length})
            </button>
          ))}
        </div>

        {/* Assignments List */}
        {loading ? (
          <div className="text-center py-12 text-slate-600">Loading assignments...</div>
        ) : filteredAssignments.length > 0 ? (
          <div className="space-y-4">
            {filteredAssignments.map((assignment, idx) => {
              const statusInfo = getStatusBadge(assignment.status)
              const StatusIcon = statusInfo.icon
              const overdue = isOverdue(assignment.due_date, assignment.status)

              return (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white group cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-slate-900">{assignment.title}</h3>
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                          <StatusIcon size={14} />
                          {statusInfo.label}
                        </div>
                        {overdue && (
                          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                            <AlertCircle size={14} />
                            Overdue
                          </div>
                        )}
                      </div>
                      <p className="text-slate-600 mb-4">{assignment.description}</p>

                      <div className="flex flex-wrap gap-6 text-sm text-slate-600 mb-4">
                        <div className="flex items-center gap-1">
                          <FileText size={16} />
                          <span>{assignment.questions} questions</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={16} />
                          <span>{assignment.duration} mins</span>
                        </div>
                        <div>
                          <span>Due: <strong className={overdue && assignment.status !== 'submitted' ? 'text-red-600' : 'text-slate-900'}>{assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No deadline'}</strong></span>
                        </div>
                        <div>
                          <span>By: <strong>{assignment.created_by}</strong></span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/assignments/${assignment.id}`)}
                      className={`ml-4 flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-colors flex-shrink-0 ${
                        assignment.status === 'submitted'
                          ? 'bg-gray-100 text-slate-600 hover:bg-gray-200'
                          : 'bg-slate-700 hover:bg-slate-800 text-white'
                      }`}
                    >
                      <Send size={16} />
                      {assignment.status === 'submitted' ? 'View' : 'Start'}
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-slate-400 mb-4" />
            <p className="text-slate-600">No assignments found</p>
          </div>
        )}
      </div>
    </main>
  )
}
