import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Award, CheckCircle2, XCircle, AlertCircle, ArrowLeft, Clock } from 'lucide-react'
import axios from 'axios'

const TABS = [
  { key: 'pending',  label: 'Pending',  icon: Clock },
  { key: 'issued',   label: 'Disetujui', icon: CheckCircle2 },
  { key: 'rejected', label: 'Ditolak',  icon: XCircle },
]

export default function CertificateRequests() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('pending')
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => { fetchRequests() }, [activeTab])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const res = await axios.get(`/api/trainer/certificate-requests?status=${activeTab}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setRequests(res.data.requests || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const showToast = (type, text) => {
    setToast({ type, text })
    setTimeout(() => setToast(null), 3000)
  }

  const handleAction = async (id, action) => {
    setActing(id)
    try {
      const token = localStorage.getItem('token')
      await axios.put(`/api/trainer/certificate-requests/${id}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setRequests(prev => prev.filter(r => r.id !== id))
      showToast('success', action === 'approve' ? 'Sertifikat disetujui!' : 'Sertifikat ditolak.')
    } catch (e) {
      showToast('error', 'Gagal memproses request')
    } finally {
      setActing(null)
    }
  }

  return (
    <main className="flex-1 overflow-y-auto bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 flex items-center gap-4">
          <button
            onClick={() => navigate('/trainer/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-slate-700" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Certificate Requests</h1>
            <p className="text-slate-500 text-sm mt-0.5">Review dan approve request sertifikat dari staff</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mt-2">
          {TABS.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="py-8">
          {loading ? (
            <div className="text-center py-16 text-slate-500">Loading...</div>
          ) : requests.length === 0 ? (
            <div className="text-center py-16">
              <Award size={40} className="mx-auto text-slate-200 mb-3" />
              <p className="text-slate-500 font-medium">Tidak ada sertifikat {activeTab === 'pending' ? 'yang menunggu review' : activeTab === 'issued' ? 'yang disetujui' : 'yang ditolak'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req, idx) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: idx * 0.04 }}
                  className="flex items-center gap-4 p-5 border border-gray-200 rounded-xl bg-white hover:shadow-sm transition-shadow"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 font-bold text-slate-600 text-sm">
                    {req.user_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900">{req.user_name}</p>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {req.user_division && (
                        <span className="inline-block mr-2 px-2 py-0.5 bg-slate-100 rounded text-xs font-medium text-slate-600">
                          {req.user_division}
                        </span>
                      )}
                      {req.learning_path_title}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span>{req.certificate_number}</span>
                      <span>·</span>
                      <span>{new Date(req.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {activeTab === 'pending' && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleAction(req.id, 'reject')}
                        disabled={acting === req.id}
                        className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                      >
                        Tolak
                      </button>
                      <button
                        onClick={() => handleAction(req.id, 'approve')}
                        disabled={acting === req.id}
                        className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                      >
                        {acting === req.id ? 'Memproses...' : 'Setujui'}
                      </button>
                    </div>
                  )}

                  {activeTab === 'issued' && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold border border-green-200">
                      <CheckCircle2 size={13} /> Disetujui
                    </span>
                  )}

                  {activeTab === 'rejected' && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold border border-red-200">
                      <XCircle size={13} /> Ditolak
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border bg-white ${
              toast.type === 'success' ? 'border-green-200' : 'border-red-200'
            }`}
          >
            {toast.type === 'success'
              ? <CheckCircle2 size={18} className="text-green-600" />
              : <AlertCircle size={18} className="text-red-600" />
            }
            <p className={`text-sm font-medium ${toast.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
              {toast.text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
