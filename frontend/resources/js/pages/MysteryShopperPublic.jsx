import { useState, useEffect } from 'react'
import { CheckCircle, Loader } from 'lucide-react'
import { motion } from 'framer-motion'
import logoSaff from '../../../assets/logosaff.jpg'

function QuestionInput({ question, value, onChange }) {
  const { type, options } = question

  if (type === 'text') {
    return (
      <input type="text" value={value || ''} onChange={e => onChange(e.target.value)}
        placeholder="Jawaban kamu..."
        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900"
      />
    )
  }

  if (type === 'textarea') {
    return (
      <textarea value={value || ''} onChange={e => onChange(e.target.value)}
        rows={4} placeholder="Jawaban kamu..."
        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900 resize-none"
      />
    )
  }

  if (type === 'multiple_choice') {
    return (
      <div className="space-y-2">
        {(options || []).map((opt, i) => (
          <label key={i} className="flex items-center gap-3 cursor-pointer group">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${value === opt ? 'border-slate-700 bg-slate-700' : 'border-gray-300 group-hover:border-slate-400'}`}>
              {value === opt && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
            <input type="radio" name={`q-${question.id}`} value={opt} checked={value === opt} onChange={() => onChange(opt)} className="sr-only" />
            <span className="text-slate-800 text-sm">{opt}</span>
          </label>
        ))}
      </div>
    )
  }

  if (type === 'checkbox') {
    const selected = Array.isArray(value) ? value : []
    const toggle = (opt) => {
      const next = selected.includes(opt) ? selected.filter(v => v !== opt) : [...selected, opt]
      onChange(next)
    }
    return (
      <div className="space-y-2">
        {(options || []).map((opt, i) => (
          <label key={i} className="flex items-center gap-3 cursor-pointer group">
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${selected.includes(opt) ? 'border-slate-700 bg-slate-700' : 'border-gray-300 group-hover:border-slate-400'}`}>
              {selected.includes(opt) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
            </div>
            <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} className="sr-only" />
            <span className="text-slate-800 text-sm">{opt}</span>
          </label>
        ))}
      </div>
    )
  }

  if (type === 'rating') {
    const num = parseInt(value) || 0
    return (
      <div className="flex gap-2">
        {[1,2,3,4,5].map(n => (
          <button key={n} type="button" onClick={() => onChange(String(n))}
            className={`text-3xl transition-transform hover:scale-110 ${n <= num ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-300'}`}
          >★</button>
        ))}
        {num > 0 && <span className="text-sm text-slate-500 self-end ml-1">{num}/5</span>}
      </div>
    )
  }

  if (type === 'yes_no') {
    return (
      <div className="flex gap-3">
        {['Yes', 'No'].map(opt => (
          <button key={opt} type="button" onClick={() => onChange(opt)}
            className={`px-8 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all ${value === opt
              ? opt === 'Yes' ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-400 bg-red-50 text-red-700'
              : 'border-gray-200 text-slate-600 hover:border-slate-300'}`}
          >
            {opt}
          </button>
        ))}
      </div>
    )
  }

  return null
}

export default function MysteryShopperPublic() {
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [storeLocation, setStoreLocation] = useState('')
  const [evaluatedStaff, setEvaluatedStaff] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetch('/api/mystery-shopper/public/questions')
      .then(r => r.json())
      .then(data => setQuestions(data))
      .finally(() => setLoading(false))
  }, [])

  const setAnswer = (qId, val) => setAnswers(prev => ({ ...prev, [qId]: val }))

  const validate = () => {
    const errs = {}
    if (!name.trim()) errs['_name'] = 'Nama wajib diisi'
    questions.forEach(q => {
      if (q.is_required) {
        const ans = answers[q.id]
        if (!ans || (Array.isArray(ans) && ans.length === 0) || (typeof ans === 'string' && !ans.trim())) {
          errs[q.id] = 'Wajib diisi'
        }
      }
    })
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setSubmitting(true)
    const payload = {
      submitter_name: name,
      submitter_email: email || null,
      store_location: storeLocation || null,
      evaluated_staff_name: evaluatedStaff || null,
      notes: notes || null,
      answers: questions.map(q => ({
        question_id: q.id,
        answer: answers[q.id] ?? null,
      })),
    }

    try {
      const res = await fetch('/api/mystery-shopper/public/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-12 max-w-md bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Terima kasih, {name}!</h2>
          <p className="text-slate-600">Laporan mystery shopper kamu berhasil dikirim.</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-5 flex items-center gap-3">
          <img src={logoSaff} alt="SAFF" className="w-8 h-8 object-contain" />
          <div>
            <h1 className="text-xl font-bold text-slate-900">Mystery Shopper</h1>
            <p className="text-xs text-slate-500">SAFF & Co.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        {/* Identitas */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h2 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wide">Identitas</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">Nama <span className="text-red-500">*</span></label>
              <input type="text" value={name} onChange={e => { setName(e.target.value); setErrors(err => ({ ...err, _name: null })) }}
                placeholder="Nama lengkap kamu"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900"
              />
              {errors['_name'] && <p className="text-xs text-red-500 mt-1">{errors['_name']}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">Email <span className="text-slate-400 font-normal">(opsional)</span></label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="email@contoh.com"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">Store Location <span className="text-slate-400 font-normal">(opsional)</span></label>
              <input type="text" value={storeLocation} onChange={e => setStoreLocation(e.target.value)}
                placeholder="Nama & lokasi toko yang dikunjungi"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">Nama Staff yang Dinilai <span className="text-slate-400 font-normal">(opsional)</span></label>
              <input type="text" value={evaluatedStaff} onChange={e => setEvaluatedStaff(e.target.value)}
                placeholder="Nama staff yang kamu nilai"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Questions */}
        {questions.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-gray-200">
            Belum ada pertanyaan. Coba lagi nanti.
          </div>
        ) : (
          questions.map((q, idx) => (
            <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
            >
              <p className="font-semibold text-slate-900 mb-1">
                {idx + 1}. {q.question_text}
                {q.is_required && <span className="text-red-500 ml-1">*</span>}
              </p>
              <p className="text-xs text-slate-400 mb-4 capitalize">{q.type.replace('_', ' ')}</p>
              <QuestionInput question={q} value={answers[q.id]} onChange={val => { setAnswer(q.id, val); setErrors(e => ({ ...e, [q.id]: null })) }} />
              {errors[q.id] && <p className="text-xs text-red-500 mt-2">{errors[q.id]}</p>}
            </motion.div>
          ))
        )}

        {/* Notes */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <label className="block text-sm font-semibold text-slate-900 mb-2">Catatan Tambahan <span className="text-slate-400 font-normal">(opsional)</span></label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            rows={3} placeholder="Tambahkan catatan jika ada..."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900 resize-none"
          />
        </div>

        <button type="submit" disabled={submitting || questions.length === 0}
          className="w-full py-3.5 bg-slate-700 hover:bg-slate-800 text-white rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? <><Loader className="w-4 h-4 animate-spin" /> Mengirim...</> : 'Kirim Laporan'}
        </button>

        <p className="text-center text-xs text-slate-400 pb-4">SAFF & Co. Learning Management System</p>
      </form>
    </div>
  )
}
