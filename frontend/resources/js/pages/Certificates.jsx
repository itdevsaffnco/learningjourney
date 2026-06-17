import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Award, CheckCircle2, AlertCircle, Loader2, Layers, ArrowRight } from 'lucide-react'
import axios from 'axios'

const STATUS = {
  pending:  { label: 'Sedang Direview', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  issued:   { label: 'Disetujui',       color: 'bg-green-100 text-green-700 border-green-200' },
  rejected: { label: 'Ditolak',         color: 'bg-red-100 text-red-700 border-red-200' },
}

export default function Certificates() {
  const navigate = useNavigate()
  const [paths, setPaths] = useState([])
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }
      const [pathsRes, certRes] = await Promise.all([
        axios.get('/api/user/learning-paths', { headers }),
        axios.get('/api/certificates', { headers }),
      ])
      const allPaths = [
        ...(pathsRes.data.in_progress || []),
        ...(pathsRes.data.completed || []),
      ]
      setPaths(allPaths)
      setCertificates(certRes.data || [])
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

  const handleRequest = async (path) => {
    setRequesting(path.id)
    try {
      const token = localStorage.getItem('token')
      const res = await axios.post('/api/certificates/request', { learning_path_id: path.id }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setCertificates(prev => [...prev, {
        learning_path_id: path.id,
        learning_path_title: path.title,
        status: 'pending',
        certificate_number: res.data.certificate?.certificate_number,
        created_at: new Date().toISOString(),
      }])
      showToast('success', 'Request sertifikat berhasil dikirim ke trainer!')
    } catch (e) {
      showToast('error', e.response?.data?.message || 'Gagal mengirim request')
    } finally {
      setRequesting(null)
    }
  }

  const certMap = Object.fromEntries(certificates.map(c => [c.learning_path_id, c]))

  return (
    <main className="flex-1 overflow-y-auto bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
          <h1 className="text-3xl font-bold text-slate-900">Sertifikat</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Selesaikan learning path 100% untuk mengajukan request sertifikat
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        {/* Info banner */}
        <div className="flex items-start gap-3 p-4 mb-6 bg-blue-50 border border-blue-200 rounded-xl">
          <Award size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800">Cara mendapatkan sertifikat</p>
            <p className="text-sm text-blue-700 mt-0.5">
              Selesaikan semua modul dalam satu learning path hingga <strong>100%</strong>, lalu klik
              tombol <strong>"Request Sertifikat"</strong> untuk mengajukan ke trainer. Trainer akan
              mereview dan menyetujui request kamu.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-500">Loading...</div>
        ) : paths.length === 0 ? (
          <div className="text-center py-16">
            <Layers size={40} className="mx-auto text-slate-200 mb-3" />
            <p className="text-slate-500 font-medium mb-4">Belum ada learning path yang ditugaskan</p>
            <button
              onClick={() => navigate('/learning-path')}
              className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Lihat Learning Path
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {paths.map((path, idx) => {
              const cert = certMap[path.id]
              const isComplete = path.progress >= 100
              const isRequesting = requesting === path.id

              return (
                <motion.div
                  key={path.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className={`p-5 border rounded-xl transition-shadow ${
                    isComplete
                      ? 'border-teal-200 bg-white hover:shadow-md'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isComplete ? 'bg-teal-50' : 'bg-gray-200'
                    }`}>
                      {isComplete
                        ? <Award size={20} className="text-teal-600" />
                        : <Layers size={18} className="text-slate-400" />
                      }
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`font-semibold truncate ${isComplete ? 'text-slate-900' : 'text-slate-600'}`}>
                          {path.title}
                        </p>
                        {isComplete && (
                          <span className="flex items-center gap-1 text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full flex-shrink-0">
                            <CheckCircle2 size={11} /> Selesai
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 mb-3">
                        {path.modules_count ?? 0} modul
                        {path.modules_completed != null && ` · ${path.modules_completed} selesai`}
                      </p>

                      {/* Progress bar */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${path.progress}%` }}
                            transition={{ duration: 0.6, delay: idx * 0.06 }}
                            className={`h-full rounded-full ${
                              isComplete
                                ? 'bg-gradient-to-r from-teal-500 to-teal-400'
                                : 'bg-gradient-to-r from-teal-400 to-teal-300'
                            }`}
                          />
                        </div>
                        <span className={`text-sm font-bold flex-shrink-0 ${
                          isComplete ? 'text-teal-600' : 'text-slate-500'
                        }`}>
                          {path.progress}%
                        </span>
                      </div>
                    </div>

                    {/* Right action */}
                    <div className="flex-shrink-0 ml-2">
                      {isComplete ? (
                        cert ? (
                          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${STATUS[cert.status]?.color}`}>
                            {STATUS[cert.status]?.label}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleRequest(path)}
                            disabled={isRequesting}
                            className="flex items-center gap-1.5 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 whitespace-nowrap"
                          >
                            {isRequesting ? (
                              <><Loader2 size={14} className="animate-spin" /> Mengirim...</>
                            ) : (
                              <><Award size={14} /> Request Sertifikat</>
                            )}
                          </button>
                        )
                      ) : (
                        <button
                          onClick={() => navigate(`/learning-path/${path.id}`)}
                          className="flex items-center gap-1 px-4 py-2 border border-gray-200 bg-white text-slate-600 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors whitespace-nowrap"
                        >
                          Lanjutkan <ArrowRight size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Cert number if issued */}
                  {cert?.certificate_number && (
                    <p className="mt-3 ml-14 text-xs text-slate-400 font-mono">{cert.certificate_number}</p>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
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
