import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('[Login] API Response:', data)
        console.log('[Login] User Data:', data.user)
        console.log('[Login] User Role:', data.user?.role)
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('token', data.token)
        onLogin(data.token, data.user)
        navigate('/dashboard')
      } else {
        setError('Email atau password tidak valid')
      }
    } catch (err) {
      setError('Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gray-50"></div>

      {/* Decorative Elements - Subtle */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute w-96 h-96 bg-slate-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 -top-48 -left-48"
      ></motion.div>
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        className="absolute w-96 h-96 bg-slate-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 -bottom-48 -right-48"
      ></motion.div>

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex h-screen w-full md:h-auto md:max-w-6xl md:rounded-lg md:shadow-sm md:border md:border-gray-200 overflow-hidden"
      >
        {/* Left Side - Image */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-8"
          style={{
            backgroundImage: "url('/assets/sotb.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Dark Overlay for text readability */}
          <div className="absolute inset-0 bg-black/40"></div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative z-10 text-center text-white max-w-sm"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="mb-8"
            >
              <div className="text-6xl font-bold mb-4">✨</div>
            </motion.div>

            <h2 className="text-4xl font-bold mb-4">SAFF & Co.</h2>
            <h3 className="text-2xl font-light mb-6">Learning Management System</h3>
            <p className="text-white/80 text-lg leading-relaxed">
              Platform pembelajaran premium untuk mengembangkan keterampilan tim Anda dengan konten berkualitas tinggi dan tracking progres real-time.
            </p>

            <div className="mt-8 pt-8 border-t border-white/30">
              <p className="text-white/70 text-sm mb-4">Dibuat oleh tim SAFF & Co.</p>
              <div className="flex justify-center gap-4">
                <div className="w-2 h-2 rounded-full bg-white/50"></div>
                <div className="w-2 h-2 rounded-full bg-white/50"></div>
                <div className="w-2 h-2 rounded-full bg-white/50"></div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 bg-white p-8 md:p-12 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full"
          >
            {/* Header */}
            <div className="mb-10">
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Selamat Datang</h1>
              <p className="text-slate-600">Masuk ke akun SAFF & Co. Anda</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-semibold text-slate-900 mb-3">Email</label>
                <div className="relative group transition-all">
                  <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-slate-700 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:border-slate-700 focus:ring-1 focus:ring-slate-700 focus:outline-none transition-colors bg-white text-slate-900 placeholder-slate-500"
                    placeholder="nama@saffnco.com"
                    required
                  />
                </div>
              </motion.div>

              {/* Password Input */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-semibold text-slate-900 mb-3">Password</label>
                <div className="relative group transition-all">
                  <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-slate-700 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-12 pr-12 py-3 rounded-lg border border-gray-200 focus:border-slate-700 focus:ring-1 focus:ring-slate-700 focus:outline-none transition-colors bg-white text-slate-900 placeholder-slate-500"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* Sign In Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-slate-700 hover:bg-slate-800 text-white rounded-lg hover:shadow-md transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 mt-8"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Masuk...
                  </>
                ) : (
                  <>
                    Masuk
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Demo Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
