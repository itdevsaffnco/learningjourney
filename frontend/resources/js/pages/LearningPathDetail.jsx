import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Star, BookOpen, CheckCircle2, Play } from 'lucide-react'
import { motion } from 'framer-motion'

export default function LearningPathDetail() {
  const { pathId } = useParams()
  const navigate = useNavigate()
  const [pathData, setPathData] = useState(null)
  const [selectedModule, setSelectedModule] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [pathId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const mockPath = {
        id: pathId,
        title: 'AI Engineer',
        description: 'Alur belajar komprehensif untuk menjadi seorang AI Engineer profesional. Lulusan dipersiapkan untuk menguasai pengembangan machine learning hingga mahir, serta mampu merancang solusi AI yang efektif.',
        modules: [
          { id: 1, stage: 1, title: 'Belajar Dasar AI', duration: 10, lessons: 39, level: 'Dasar', description: 'Belajar konsep dasar AI, penerapannya di industri, dan dampaknya dalam kehidupan sehari-hari sebagai fondasi awal.', completed: true, rating: 4.86 },
          { id: 2, stage: 2, title: 'Menguasai Python', duration: 60, lessons: 91, level: 'Dasar', description: 'Pelajari Python sebagai tools utama AI: sintaks, struktur data, dan library populer untuk pemrograman data dan machine learning.', completed: true, rating: 4.83 },
          { id: 3, stage: 3, title: 'Machine Learning Fundamentals', duration: 75, lessons: 68, level: 'Menengah', description: 'Pahami algoritma machine learning, supervised vs unsupervised learning, model evaluation, dan best practices dalam ML development.', completed: false, rating: 4.79 },
          { id: 4, stage: 4, title: 'Deep Learning & Neural Networks', duration: 90, lessons: 85, level: 'Menengah', description: 'Explore neural networks, deep learning architectures seperti CNN dan RNN, serta aplikasi praktis dalam computer vision dan NLP.', completed: false, rating: 4.75 }
        ]
      }
      setPathData(mockPath)
      setSelectedModule(mockPath.modules[0])
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return <main className="flex-1 overflow-y-auto bg-white"><div className="text-center py-12 text-slate-600">Loading...</div></main>
  }

  const totalProgress = pathData?.modules.filter(m => m.completed).length || 0
  const progressPercentage = Math.round((totalProgress / pathData?.modules.length) * 100)

  return (
    <main className="flex-1 overflow-y-auto bg-white">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <button onClick={() => navigate('/my-learning')} className="flex items-center gap-2 text-slate-700 hover:text-slate-900 mb-4 font-semibold">
            <ArrowLeft size={20} /> Back
          </button>
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">{pathData?.title}</h1>
            <p className="text-slate-600 max-w-2xl">{pathData?.description}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2">
            <div className="mb-12">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-slate-900">Your Progress</h3>
                <span className="text-sm font-bold text-slate-700">{progressPercentage}%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div animate={{ width: `${progressPercentage}%` }} transition={{ duration: 0.5 }} className="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full" />
              </div>
            </div>

            <div className="space-y-8">
              {pathData?.modules.map((module, idx) => (
                <motion.div key={module.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="relative">
                  {idx < pathData.modules.length - 1 && <div className="absolute left-8 top-20 w-1 h-12 bg-gradient-to-b from-teal-500 to-gray-200"></div>}
                  
                  <button onClick={() => setSelectedModule(module)} className={`w-full p-6 rounded-lg border-2 transition-all text-left ${selectedModule?.id === module.id ? 'border-teal-500 bg-teal-50 shadow-lg' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center pt-1">
                        <motion.div whileHover={{ scale: 1.1 }} className={`w-4 h-4 rounded-full border-2 flex items-center justify-center relative z-10 ${module.completed ? 'bg-teal-500 border-teal-500' : 'bg-white border-gray-300'}`}>
                          {module.completed && <CheckCircle2 size={16} className="text-white" />}
                        </motion.div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-bold text-slate-500 uppercase">Langkah {module.stage}</h4>
                          {module.completed && <CheckCircle2 size={18} className="text-teal-500" />}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">{module.title}</h3>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-1 text-slate-600"><Clock size={16} /><span>{module.duration} Jam</span></div>
                          <div className="flex items-center gap-1 text-slate-600"><Star size={16} className="text-yellow-500" /><span>{module.rating}</span></div>
                          <div className="flex items-center gap-1 text-slate-600"><BookOpen size={16} /><span>{module.lessons} Modul</span></div>
                          <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">{module.level}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          {selectedModule && (
            <motion.div key={selectedModule.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="col-span-1 sticky top-32">
              <div className="bg-gradient-to-br from-slate-50 to-white border border-gray-200 rounded-lg p-8 space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-slate-500 uppercase mb-2">Langkah {selectedModule.stage}</h4>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">{selectedModule.title}</h2>
                  <p className="text-slate-600 leading-relaxed">{selectedModule.description}</p>
                </div>
                <div className="border-t border-gray-200 pt-6 space-y-3">
                  <div className="flex items-center justify-between"><span className="text-slate-600 text-sm">Durasi Belajar</span><span className="font-semibold text-slate-900">{selectedModule.duration} Jam</span></div>
                  <div className="flex items-center justify-between"><span className="text-slate-600 text-sm">Total Modul</span><span className="font-semibold text-slate-900">{selectedModule.lessons} Modul</span></div>
                  <div className="flex items-center justify-between"><span className="text-slate-600 text-sm">Level Kesulitan</span><span className="font-semibold text-slate-900">{selectedModule.level}</span></div>
                  <div className="flex items-center justify-between"><span className="text-slate-600 text-sm">Rating</span><div className="flex items-center gap-1"><Star size={16} className="text-yellow-500 fill-yellow-500" /><span className="font-semibold text-slate-900">{selectedModule.rating}</span></div></div>
                </div>
                <button onClick={() => navigate(`/learning-path/${pathId}/lessons`)} className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${selectedModule.completed ? 'bg-gray-100 text-slate-600 hover:bg-gray-200' : 'bg-teal-500 hover:bg-teal-600 text-white'}`}>
                  <Play size={18} /> {selectedModule.completed ? 'Buka Modul' : 'Mulai Belajar'}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  )
}
