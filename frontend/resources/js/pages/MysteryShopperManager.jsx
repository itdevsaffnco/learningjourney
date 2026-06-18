import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Eye, X, ChevronDown, ChevronUp, Check, Link, Copy } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const QUESTION_TYPES = [
  { value: 'text', label: 'Short Answer' },
  { value: 'textarea', label: 'Paragraph' },
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'rating', label: 'Rating (1–5)' },
  { value: 'yes_no', label: 'Yes / No' },
]

function QuestionForm({ initial, onSave, onCancel }) {
  const [data, setData] = useState(initial || {
    question_text: '',
    type: 'text',
    options: [''],
    is_required: true,
  })

  const needsOptions = ['multiple_choice', 'checkbox'].includes(data.type)

  const setOption = (i, val) => {
    const opts = [...(data.options || [''])]
    opts[i] = val
    setData({ ...data, options: opts })
  }

  const addOption = () => setData({ ...data, options: [...(data.options || []), ''] })

  const removeOption = (i) => {
    const opts = (data.options || []).filter((_, idx) => idx !== i)
    setData({ ...data, options: opts })
  }

  const handleSave = () => {
    if (!data.question_text.trim()) return
    const payload = { ...data }
    if (!needsOptions) payload.options = null
    else payload.options = (payload.options || []).filter(o => o.trim())
    onSave(payload)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-1">Question</label>
        <input
          type="text"
          value={data.question_text}
          onChange={e => setData({ ...data, question_text: e.target.value })}
          placeholder="Type your question..."
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-1">Type</label>
          <select
            value={data.type}
            onChange={e => setData({ ...data, type: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900"
          >
            {QUESTION_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.is_required}
              onChange={e => setData({ ...data, is_required: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-slate-700"
            />
            <span className="text-sm font-medium text-slate-700">Required</span>
          </label>
        </div>
      </div>

      {needsOptions && (
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">Options</label>
          <div className="space-y-2">
            {(data.options || ['']).map((opt, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={opt}
                  onChange={e => setOption(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-sm text-slate-900"
                />
                {(data.options || []).length > 1 && (
                  <button type="button" onClick={() => removeOption(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addOption} className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 transition-colors">
              <Plus className="w-4 h-4" /> Add option
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-slate-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm">
          Cancel
        </button>
        <button type="button" onClick={handleSave} className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors text-sm">
          Save Question
        </button>
      </div>
    </div>
  )
}

function AnswerDisplay({ question, answer }) {
  const type = question?.type
  const text = answer?.answer || '-'

  if (type === 'rating') {
    const num = parseInt(text) || 0
    return (
      <div className="flex gap-1">
        {[1,2,3,4,5].map(n => (
          <span key={n} className={`text-lg ${n <= num ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
        ))}
        <span className="text-sm text-slate-600 ml-1">({num}/5)</span>
      </div>
    )
  }
  if (type === 'yes_no') {
    return <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-semibold ${text === 'Yes' ? 'bg-green-100 text-green-800' : text === 'No' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}>{text}</span>
  }
  return <p className="text-slate-700 text-sm whitespace-pre-wrap">{text}</p>
}

export default function MysteryShopperManager({ user }) {
  const [tab, setTab] = useState('questions')
  const [questions, setQuestions] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)
  const [linkCopied, setLinkCopied] = useState(false)

  const publicUrl = `${window.location.origin}/mystery-shopper/fill`

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2500)
  }

  const token = () => localStorage.getItem('token')

  useEffect(() => { fetchQuestions() }, [])
  useEffect(() => { if (tab === 'results') fetchSubmissions() }, [tab])

  const fetchQuestions = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/mystery-shopper/questions', { headers: { Authorization: `Bearer ${token()}` } })
      if (res.ok) setQuestions(await res.json())
    } finally { setLoading(false) }
  }

  const fetchSubmissions = async () => {
    try {
      const res = await fetch('/api/mystery-shopper/submissions', { headers: { Authorization: `Bearer ${token()}` } })
      if (res.ok) setSubmissions(await res.json())
    } catch {}
  }

  const showSuccess = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(null), 3000)
  }

  const handleCreate = async (data) => {
    const res = await fetch('/api/mystery-shopper/questions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, sort_order: questions.length }),
    })
    if (res.ok) {
      setShowAddForm(false)
      fetchQuestions()
      showSuccess('Question added!')
    }
  }

  const handleUpdate = async (id, data) => {
    const res = await fetch(`/api/mystery-shopper/questions/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      setEditingId(null)
      fetchQuestions()
      showSuccess('Question updated!')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this question?')) return
    const res = await fetch(`/api/mystery-shopper/questions/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token()}` },
    })
    if (res.ok) { fetchQuestions(); showSuccess('Question deleted!') }
  }

  const moveQuestion = async (index, dir) => {
    const newList = [...questions]
    const target = index + dir
    if (target < 0 || target >= newList.length) return
    ;[newList[index], newList[target]] = [newList[target], newList[index]]
    setQuestions(newList)
    await fetch('/api/mystery-shopper/questions/reorder', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: newList.map(q => q.id) }),
    })
  }

  const typeLabel = (type) => QUESTION_TYPES.find(t => t.value === type)?.label || type

  return (
    <main className="flex-1 overflow-y-auto bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 sticky top-0 z-10 bg-white">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Mystery Shopper</h1>
              <p className="text-slate-600 mt-1 text-sm">Buat form penilaian dan lihat hasil dari mystery shopper</p>
            </div>
            <button onClick={copyLink}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${linkCopied ? 'border-green-300 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-slate-700 hover:bg-gray-50'}`}
            >
              {linkCopied ? <><Check className="w-4 h-4" /> Link Copied!</> : <><Copy className="w-4 h-4" /> Copy Share Link</>}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        {/* Success */}
        {successMsg && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-white border border-green-200 rounded-lg px-6 py-4 flex items-center gap-3 shadow-sm">
            <Check className="w-5 h-5 text-green-600" />
            <p className="text-sm font-medium text-green-800">{successMsg}</p>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
          {[{ key: 'questions', label: 'Form Builder' }, { key: 'results', label: 'Hasil' }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${tab === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* FORM BUILDER TAB */}
        {tab === 'questions' && (
          <div className="space-y-4">
            {/* Questions List */}
            {loading ? (
              <div className="text-center py-12 text-slate-500">Loading...</div>
            ) : questions.length === 0 && !showAddForm ? (
              <div className="text-center py-16 text-slate-500 border border-dashed border-gray-200 rounded-xl">
                <p className="text-lg font-medium mb-1">Belum ada pertanyaan</p>
                <p className="text-sm">Klik tombol di bawah untuk menambah pertanyaan</p>
              </div>
            ) : (
              questions.map((q, idx) => (
                <motion.div key={q.id} layout className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  {editingId === q.id ? (
                    <div className="p-6">
                      <QuestionForm
                        initial={{ question_text: q.question_text, type: q.type, options: q.options || [''], is_required: q.is_required }}
                        onSave={(data) => handleUpdate(q.id, data)}
                        onCancel={() => setEditingId(null)}
                      />
                    </div>
                  ) : (
                    <div className="flex items-start gap-4 p-5">
                      {/* Order controls */}
                      <div className="flex flex-col gap-1 pt-1">
                        <button onClick={() => moveQuestion(idx, -1)} disabled={idx === 0} className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 transition-colors">
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button onClick={() => moveQuestion(idx, 1)} disabled={idx === questions.length - 1} className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 transition-colors">
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{typeLabel(q.type)}</span>
                          {q.is_required && <span className="text-xs text-red-500 font-medium">Required</span>}
                        </div>
                        <p className="text-slate-900 font-medium">{idx + 1}. {q.question_text}</p>
                        {q.options && q.options.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {q.options.map((opt, i) => (
                              <li key={i} className="text-sm text-slate-600 flex items-center gap-2">
                                <span className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0" />
                                {opt}
                              </li>
                            ))}
                          </ul>
                        )}
                        {q.type === 'rating' && (
                          <div className="flex gap-1 mt-2">{[1,2,3,4,5].map(n => <span key={n} className="text-xl text-gray-300">★</span>)}</div>
                        )}
                        {q.type === 'yes_no' && (
                          <div className="flex gap-2 mt-2">
                            <span className="px-3 py-0.5 border border-gray-200 rounded-full text-sm text-slate-500">Yes</span>
                            <span className="px-3 py-0.5 border border-gray-200 rounded-full text-sm text-slate-500">No</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => setEditingId(q.id)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(q.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))
            )}

            {/* Add Question Form */}
            {showAddForm && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-300 rounded-xl shadow-sm p-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Tambah Pertanyaan Baru</h3>
                <QuestionForm onSave={handleCreate} onCancel={() => setShowAddForm(false)} />
              </motion.div>
            )}

            {/* Add Button */}
            {!showAddForm && (
              <button onClick={() => setShowAddForm(true)}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-slate-600 hover:border-slate-400 hover:text-slate-900 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Tambah Pertanyaan
              </button>
            )}
          </div>
        )}

        {/* RESULTS TAB */}
        {tab === 'results' && (
          <div>
            {submissions.length === 0 ? (
              <div className="text-center py-16 text-slate-500 border border-dashed border-gray-200 rounded-xl">
                <p className="text-lg font-medium">Belum ada hasil submission</p>
              </div>
            ) : (
              <div className="space-y-3">
                {submissions.map(sub => (
                  <div key={sub.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex items-center justify-between hover:border-slate-300 transition-colors">
                    <div>
                      <p className="font-semibold text-slate-900">{sub.user?.name || sub.submitter_name || 'Unknown'}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-sm text-slate-500">
                        {sub.evaluated_staff_name && <span className="text-slate-700 font-medium">Staff: {sub.evaluated_staff_name}</span>}
                        {sub.evaluated_staff_name && <span>•</span>}
                        <span>{sub.store_location || 'No location'}</span>
                        <span>•</span>
                        <span>{new Date(sub.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        <span>•</span>
                        <span>{sub.answers?.length || 0} jawaban</span>
                      </div>
                    </div>
                    <button onClick={() => setSelectedSubmission(sub)}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-slate-700"
                    >
                      <Eye className="w-4 h-4" />
                      Lihat
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Submission Detail Modal */}
      <AnimatePresence>
        {selectedSubmission && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedSubmission.user?.name || selectedSubmission.submitter_name}</h3>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5 text-sm text-slate-500">
                    {selectedSubmission.evaluated_staff_name && <span className="font-medium text-slate-700">Staff: {selectedSubmission.evaluated_staff_name}</span>}
                    <span>{selectedSubmission.store_location || 'No location'}</span>
                    <span>· {new Date(selectedSubmission.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedSubmission(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              <div className="overflow-y-auto p-6 space-y-5 flex-1">
                {selectedSubmission.answers?.map((ans, idx) => (
                  <div key={ans.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <p className="text-sm font-semibold text-slate-900 mb-2">{idx + 1}. {ans.question?.question_text}</p>
                    <AnswerDisplay question={ans.question} answer={ans} />
                  </div>
                ))}

                {selectedSubmission.notes && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Notes</p>
                    <p className="text-sm text-slate-700">{selectedSubmission.notes}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  )
}
