import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, X, Edit2, Trash2, ArrowLeft, Bold, Italic, List, ListOrdered, Quote, Link2, Image as ImageIcon, AlignLeft, AlignCenter, AlignRight, ChevronUp, ChevronDown, Eye, Undo2, Redo2, Underline as UnderlineIcon, Strikethrough as StrikethroughIcon, Highlighter, Palette, Minus, Table as TableIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { Highlight } from '@tiptap/extension-highlight'
import { TextStyle, Color } from '@tiptap/extension-text-style'
import { TextAlign } from '@tiptap/extension-text-align'
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table'
import './LessonManager.css'

function EditorContainer({ editor, children }) {
  const [dragOver, setDragOver] = useState(false)

  const handleDrop = async (e) => {
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    if (files.length === 0) return
    e.preventDefault()
    for (const file of files) {
      try {
        const token = localStorage.getItem('token')
        const fd = new FormData()
        fd.append('image', file)
        const res = await axios.post('/api/trainer/upload-image', fd, { headers: { Authorization: `Bearer ${token}` } })
        editor?.chain().focus().setImage({ src: res.data.url }).run()
      } catch {
        alert('Gagal upload gambar. Coba lagi.')
      }
    }
    setDragOver(false)
  }

  return (
    <div
      className={`tiptap-editor-container bg-white transition-all ${dragOver ? 'ring-2 ring-blue-400' : ''}`}
      onDrop={handleDrop}
      onDragOver={(e) => { if (e.dataTransfer.types.includes('Files')) { e.preventDefault(); setDragOver(true) } }}
      onDragLeave={() => setDragOver(false)}
    >
      {children}
    </div>
  )
}

function Toolbar({ editor, showImage = true }) {
  if (!editor) return null
  const fileInputRef = useRef(null)
  const colorInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (fileInputRef.current) fileInputRef.current.value = ''
    setUploading(true)
    try {
      const token = localStorage.getItem('token')
      const fd = new FormData()
      fd.append('image', file)
      const res = await axios.post('/api/trainer/upload-image', fd, {
        headers: { Authorization: `Bearer ${token}` },
      })
      editor.chain().focus().setImage({ src: res.data.url }).run()
    } catch {
      alert('Gagal upload gambar. Coba lagi.')
    } finally {
      setUploading(false)
    }
  }

  const setAlignment = (align) => {
    if (editor.isActive('image')) {
      editor.chain().focus().setImageAlignment(align).run()
    } else {
      editor.chain().focus().setTextAlign(align).run()
    }
  }

  const isAlignActive = (align) =>
    editor.isActive('image', { align }) || editor.isActive({ textAlign: align })

  const btn = (active) =>
    `p-1.5 rounded ${active ? 'bg-slate-700 text-white' : 'hover:bg-gray-200'}`

  const sep = <div className="w-px bg-gray-300 self-stretch mx-0.5" />

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
      <input ref={colorInputRef} type="color" className="sr-only" onChange={(e) => editor.chain().focus().setColor(e.target.value).run()} />

      {/* Undo / Redo */}
      <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30" title="Undo"><Undo2 size={15} /></button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30" title="Redo"><Redo2 size={15} /></button>
      {sep}

      {/* Headings */}
      {[1, 2, 3].map(lvl => (
        <button
          key={lvl}
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: lvl }).run()}
          className={`px-2 py-1 rounded text-xs font-bold leading-none ${editor.isActive('heading', { level: lvl }) ? 'bg-slate-700 text-white' : 'hover:bg-gray-200 text-slate-700'}`}
          title={`Heading ${lvl}`}
        >H{lvl}</button>
      ))}
      {sep}

      {/* Text formatting */}
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive('bold'))} title="Bold"><Bold size={15} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive('italic'))} title="Italic"><Italic size={15} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btn(editor.isActive('underline'))} title="Underline"><UnderlineIcon size={15} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={btn(editor.isActive('strike'))} title="Strikethrough"><StrikethroughIcon size={15} /></button>
      {sep}

      {/* Highlight + Color */}
      <button type="button" onClick={() => editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run()} className={btn(editor.isActive('highlight'))} title="Highlight"><Highlighter size={15} /></button>
      <button type="button" onClick={() => colorInputRef.current?.click()} className="p-1.5 rounded hover:bg-gray-200" title="Text Color"><Palette size={15} /></button>
      {sep}

      {/* Lists + Blockquote */}
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive('bulletList'))} title="Bullet List"><List size={15} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive('orderedList'))} title="Ordered List"><ListOrdered size={15} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btn(editor.isActive('blockquote'))} title="Blockquote"><Quote size={15} /></button>
      {sep}

      {/* Alignment */}
      <button type="button" onClick={() => setAlignment('left')} className={btn(isAlignActive('left'))} title="Align Left"><AlignLeft size={15} /></button>
      <button type="button" onClick={() => setAlignment('center')} className={btn(isAlignActive('center'))} title="Align Center"><AlignCenter size={15} /></button>
      <button type="button" onClick={() => setAlignment('right')} className={btn(isAlignActive('right'))} title="Align Right"><AlignRight size={15} /></button>
      {sep}

      {/* Link + Image */}
      <button
        type="button"
        onClick={() => {
          const url = prompt('Enter URL:')
          if (url) editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
        }}
        className={btn(editor.isActive('link'))}
        title="Link"
      ><Link2 size={15} /></button>
      {showImage && (
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-50" title="Insert Image">
          {uploading ? <span className="text-xs px-1">...</span> : <ImageIcon size={15} />}
        </button>
      )}
      {sep}

      {/* Table */}
      <button type="button" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className="p-1.5 rounded hover:bg-gray-200" title="Insert Table"><TableIcon size={15} /></button>
      {editor.isActive('table') && (
        <>
          <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()} className="px-1.5 py-1 rounded hover:bg-gray-200 text-xs font-bold text-slate-600" title="Add Row">+R</button>
          <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()} className="px-1.5 py-1 rounded hover:bg-gray-200 text-xs font-bold text-slate-600" title="Add Column">+C</button>
          <button type="button" onClick={() => editor.chain().focus().deleteRow().run()} className="px-1.5 py-1 rounded hover:bg-red-100 text-xs font-bold text-red-500" title="Delete Row">−R</button>
          <button type="button" onClick={() => editor.chain().focus().deleteColumn().run()} className="px-1.5 py-1 rounded hover:bg-red-100 text-xs font-bold text-red-500" title="Delete Column">−C</button>
          <button type="button" onClick={() => editor.chain().focus().deleteTable().run()} className="px-1.5 py-1 rounded hover:bg-red-100 text-xs font-bold text-red-500" title="Delete Table"><Trash2 size={13} /></button>
        </>
      )}

      {/* HR + Clear */}
      <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} className="p-1.5 rounded hover:bg-gray-200" title="Horizontal Rule"><Minus size={15} /></button>
      {sep}
      <button type="button" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} className="p-1.5 rounded hover:bg-gray-200 text-xs font-medium text-slate-500" title="Clear Formatting">¶</button>
    </div>
  )
}

export default function LessonManager() {
  const { moduleId } = useParams()
  const navigate = useNavigate()
  const [lessons, setLessons] = useState([])
  const [moduleName, setModuleName] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingLessonId, setEditingLessonId] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [videoFileName, setVideoFileName] = useState('')
  const [videoFile, setVideoFile] = useState(null)
  const [audioFileName, setAudioFileName] = useState('')
  const [imageFileName, setImageFileName] = useState('')
  const [imageUploading, setImageUploading] = useState(false)
  const [quizzes, setQuizzes] = useState([])
  const [reorderingLessonId, setReorderingLessonId] = useState(null)
  const [previewLesson, setPreviewLesson] = useState(null)
  const videoInputRef = useRef(null)
  const audioInputRef = useRef(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'text',
    duration: { value: '', unit: 'minutes' },
    video_url: '',
    audio_url: '',
    image_url: '',
    quiz_id: '',
    randomize_questions: false,
    num_questions_to_show: '',
  })

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: false }),
      Link.configure({ openOnClick: false }),
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Image.extend({
        draggable: true,
        addAttributes() {
          return {
            ...this.parent?.(),
            width: {
              default: 300,
              parseHTML: (element) => element.getAttribute('width') || 300,
              renderHTML: (attributes) => {
                return { width: attributes.width }
              },
            },
            align: {
              default: 'left',
              parseHTML: (element) => element.getAttribute('align') || 'left',
              renderHTML: (attributes) => {
                return { align: attributes.align }
              },
            },
          }
        },
        addPasteRules() {
          return []
        },
        addCommands() {
          return {
            setImage: (options) => ({ commands }) => {
              return commands.insertContent({
                type: this.name,
                attrs: options,
              })
            },
            setImageAlignment: (align) => ({ commands }) => {
              return commands.updateAttributes('image', { align })
            },
          }
        },
        addKeyboardShortcuts() {
          return {
            'Mod-v': () => false,
          }
        },
        addNodeView() {
          return ({ node, editor, getPos, updateAttributes }) => {
            const container = document.createElement('div')
            container.className = 'image-container'
            const align = node.attrs.align || 'left'
            container.style.textAlign = align

            const img = document.createElement('img')
            img.src = node.attrs.src
            img.style.width = `${node.attrs.width || 300}px`
            img.style.height = 'auto'
            img.draggable = false
            img.style.display = 'inline-block'

            const deleteBtn = document.createElement('button')
            deleteBtn.className = 'image-delete-btn'
            deleteBtn.innerHTML = '✕'
            deleteBtn.title = 'Delete image'
            deleteBtn.type = 'button'

            const handleDelete = (e) => {
              e.preventDefault()
              e.stopPropagation()
              const pos = getPos()
              editor.chain().deleteRange({ from: pos, to: pos + node.nodeSize }).run()
            }

            deleteBtn.onmousedown = handleDelete
            deleteBtn.onclick = handleDelete

            const dragHandle = document.createElement('div')
            dragHandle.className = 'image-drag-handle'
            dragHandle.title = 'Drag to reposition'
            dragHandle.innerHTML = '⠿'

            dragHandle.addEventListener('mousedown', () => {
              container.draggable = true
            })
            container.addEventListener('dragend', () => {
              container.draggable = false
            })
            container.addEventListener('dragstart', (e) => {
              e.stopPropagation()
            })

            const resizeHandle = document.createElement('div')
            resizeHandle.className = 'image-resize-handle'
            resizeHandle.title = 'Drag to resize'

            let isResizing = false

            resizeHandle.onmousedown = (e) => {
              e.preventDefault()
              e.stopPropagation()
              isResizing = true
              const startX = e.clientX
              const startWidth = img.offsetWidth

              const onMouseMove = (moveEvent) => {
                if (!isResizing) return
                const diff = moveEvent.clientX - startX
                const newWidth = Math.max(100, startWidth + diff)
                img.style.width = `${newWidth}px`
              }

              const onMouseUp = () => {
                isResizing = false
                updateAttributes({ width: img.offsetWidth })
                document.removeEventListener('mousemove', onMouseMove)
                document.removeEventListener('mouseup', onMouseUp)
              }

              document.addEventListener('mousemove', onMouseMove)
              document.addEventListener('mouseup', onMouseUp)
            }

            container.appendChild(dragHandle)
            container.appendChild(img)
            container.appendChild(deleteBtn)
            container.appendChild(resizeHandle)

            return { dom: container }
          }
        },
      }).configure({
        allowBase64: false,
      }),
    ],
    content: '<p></p>',
  })

  useEffect(() => {
    fetchData()
  }, [moduleId])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }

      // Fetch lessons and modules - critical, must succeed
      const [lessonsRes, modulesRes] = await Promise.all([
        axios.get(`/api/modules/${moduleId}/lessons`, { headers }),
        axios.get(`/api/trainer/modules`, { headers }),
      ])
      setLessons(lessonsRes.data.lessons || [])
      const module = modulesRes.data.modules?.find((m) => m.id === parseInt(moduleId))
      if (module) setModuleName(module.title)

      // Fetch quizzes separately - non-critical
      try {
        const quizzesRes = await axios.get(`/api/trainer/quizzes`, { headers })
        setQuizzes(quizzesRes.data.quizzes || [])
      } catch (quizErr) {
        console.error('Failed to fetch quizzes:', quizErr.response?.data)
        setQuizzes([])
      }
    } catch (err) {
      console.error('Failed to fetch data:', err)
      console.error('Error details:', err.response?.data)
    } finally {
      setLoading(false)
    }
  }


  const handleEditLesson = (lesson) => {
    setEditingLessonId(lesson.id)
    setFormData({
      title: lesson.title,
      description: lesson.description || '',
      type: lesson.type,
      duration: {
        value: lesson.duration_minutes || '',
        unit: 'minutes'
      },
      video_url: lesson.video_url || '',
      quiz_id: lesson.quiz_id || '',
      randomize_questions: lesson.randomize_questions || false,
      num_questions_to_show: lesson.num_questions_to_show || '',
    })
    if ((lesson.type === 'text' || lesson.type === 'video') && lesson.content) {
      editor?.commands.setContent(lesson.content)
    } else {
      editor?.commands.clearContent()
    }
    if (lesson.type === 'video' && lesson.video_url) {
      setVideoFileName('(Video uploaded)')
    }
    if (lesson.type === 'audio' && lesson.audio_url) {
      setAudioFileName('(Audio uploaded)')
    }
    if (lesson.type === 'image' && lesson.image_url) {
      setImageFileName('(Image uploaded)')
      setFormData(prev => ({ ...prev, image_url: lesson.image_url }))
    }
    setShowForm(true)
  }

  const handleDeleteLesson = (id) => {
    setDeleteConfirm(id)
  }

  const handleReorderLesson = async (lessonId, direction) => {
    try {
      setReorderingLessonId(lessonId)
      const token = localStorage.getItem('token')
      const lesson = lessons.find(l => l.id === lessonId)
      const currentOrder = lesson.order || 0
      const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1

      await axios.put(`/api/modules/${moduleId}/lessons/${lessonId}`, { order: newOrder }, {
        headers: { Authorization: `Bearer ${token}` },
      })

      await fetchData()
    } catch (err) {
      console.error('Failed to reorder lesson:', err)
    } finally {
      setReorderingLessonId(null)
    }
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/modules/${moduleId}/lessons/${deleteConfirm}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setLessons((prev) => prev.filter((l) => l.id !== deleteConfirm))
      setDeleteConfirm(null)
    } catch (err) {
      alert('Failed to delete lesson')
      setDeleteConfirm(null)
    }
  }

  const handleVideoSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('video/')) {
      alert('Please select a video file')
      return
    }
    setVideoFile(file)
    setVideoFileName(file.name)
  }

  const handleAudioSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('audio/')) {
      alert('Please select an audio file (MP3, WAV, etc.)')
      return
    }
    setAudioFileName(file.name)
    const reader = new FileReader()
    reader.onload = (event) => {
      setFormData(prev => ({ ...prev, audio_url: event.target?.result }))
    }
    reader.readAsDataURL(file)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'text',
      duration: { value: '', unit: 'minutes' },
      video_url: '',
      audio_url: '',
      quiz_id: '',
      randomize_questions: false,
      num_questions_to_show: '',
    })
    setVideoFileName('')
    setVideoFile(null)
    setAudioFileName('')
    setImageFileName('')
    editor?.commands.clearContent()
    setEditingLessonId(null)
    if (videoInputRef.current) videoInputRef.current.value = ''
    if (audioInputRef.current) audioInputRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      alert('Please enter a lesson title')
      return
    }
    if (formData.type === 'text' && !editor?.getHTML().includes('<p>')) {
      alert('Please enter lesson content')
      return
    }
    if (formData.type === 'video' && !videoFile && !formData.video_url) {
      alert('Please upload a video file')
      return
    }
    if (formData.type === 'audio' && !formData.audio_url.trim()) {
      alert('Please upload an audio file')
      return
    }
    if (formData.type === 'image' && !formData.image_url) {
      alert('Please upload an image')
      return
    }
    if (formData.type === 'quiz' && !formData.quiz_id) {
      alert('Please select a quiz')
      return
    }

    try {
      setSubmitting(true)
      const token = localStorage.getItem('token')

      let durationMinutes = 0
      if (formData.duration.value) {
        const value = parseInt(formData.duration.value)
        switch (formData.duration.unit) {
          case 'hours': durationMinutes = value * 60; break
          case 'days': durationMinutes = value * 24 * 60; break
          case 'weeks': durationMinutes = value * 7 * 24 * 60; break
          default: durationMinutes = value
        }
      }

      // Use FormData when uploading a video file, JSON otherwise
      if (formData.type === 'video' && videoFile) {
        const fd = new FormData()
        fd.append('title', formData.title)
        fd.append('description', formData.description || '')
        fd.append('type', 'video')
        fd.append('duration_minutes', durationMinutes)
        fd.append('content', editor?.getHTML() || '')
        fd.append('video', videoFile)
        if (editingLessonId) fd.append('_method', 'PUT')

        await axios.post(
          editingLessonId
            ? `/api/modules/${moduleId}/lessons/${editingLessonId}`
            : `/api/modules/${moduleId}/lessons`,
          fd,
          { headers: { Authorization: `Bearer ${token}` } }
        )
      } else {
        const payload = {
          title: formData.title,
          description: formData.description,
          type: formData.type,
          duration_minutes: durationMinutes,
          ...(formData.type === 'text' && { content: editor?.getHTML() }),
          ...(formData.type === 'video' && { video_url: formData.video_url, content: editor?.getHTML() }),
          ...(formData.type === 'audio' && { audio_url: formData.audio_url, content: editor?.getHTML() }),
          ...(formData.type === 'image' && { image_url: formData.image_url, content: editor?.getHTML() }),
          ...(formData.type === 'quiz' && {
            quiz_id: formData.quiz_id,
            randomize_questions: formData.randomize_questions,
            num_questions_to_show: formData.num_questions_to_show ? parseInt(formData.num_questions_to_show) : null,
          }),
        }

        if (editingLessonId) {
          await axios.put(`/api/modules/${moduleId}/lessons/${editingLessonId}`, payload, {
            headers: { Authorization: `Bearer ${token}` },
          })
        } else {
          await axios.post(`/api/modules/${moduleId}/lessons`, payload, {
            headers: { Authorization: `Bearer ${token}` },
          })
        }
      }

      resetForm()
      setEditingLessonId(null)
      setShowForm(false)
      await fetchData()
    } catch (err) {
      console.error('Submission error:', err.response?.data || err.message)
      const errorMsg = err.response?.data?.message || err.response?.data?.errors || 'Failed to save lesson'
      alert('Error: ' + (typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex-1 overflow-y-auto bg-white">
      {/* Modal Form */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                resetForm()
                setShowForm(false)
              }}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {editingLessonId ? 'Edit Lesson' : 'Add New Lesson'}
                  </h2>
                  <button
                    onClick={() => {
                      resetForm()
                      setShowForm(false)
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={24} className="text-slate-600" />
                  </button>
                </div>

                {/* Modal Content */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-3">
                      Lesson Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Introduction to Fragrance"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-slate-700 focus:ring-1 focus:ring-slate-700 focus:outline-none text-slate-900"
                    />
                  </div>

                  {/* Type Selector */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-4">
                      Lesson Type
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {['text', 'video', 'audio', 'quiz'].map((type) => (
                        <label
                          key={type}
                          className="flex items-center gap-3 cursor-pointer p-4 border rounded-lg transition-all"
                          style={{
                            borderColor: formData.type === type ? '#334155' : '#e5e7eb',
                            backgroundColor: formData.type === type ? '#f1f5f9' : 'transparent',
                          }}
                        >
                          <input
                            type="radio"
                            name="type"
                            value={type}
                            checked={formData.type === type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-5 h-5"
                          />
                          <span className="font-semibold text-slate-900 capitalize">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Quiz Selection */}
                  {formData.type === 'quiz' && (
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-3">
                          Select Quiz
                        </label>
                        <select
                          value={formData.quiz_id}
                          onChange={(e) => setFormData({ ...formData, quiz_id: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-slate-700 focus:ring-1 focus:ring-slate-700 focus:outline-none text-slate-900 bg-white"
                        >
                          <option value="">Choose a quiz...</option>
                          {quizzes.map(quiz => (
                            <option key={quiz.id} value={quiz.id}>
                              {quiz.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <input
                          type="checkbox"
                          id="randomize"
                          checked={formData.randomize_questions}
                          onChange={(e) => setFormData({ ...formData, randomize_questions: e.target.checked })}
                          className="w-5 h-5 cursor-pointer"
                        />
                        <label htmlFor="randomize" className="text-sm font-medium text-slate-900 cursor-pointer">
                          Randomize question order
                        </label>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-3">
                          Number of Questions to Show
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={formData.num_questions_to_show}
                          onChange={(e) => setFormData({ ...formData, num_questions_to_show: e.target.value })}
                          placeholder="Leave empty to show all questions"
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-slate-700 focus:ring-1 focus:ring-slate-700 focus:outline-none text-slate-900"
                        />
                        <p className="text-xs text-slate-500 mt-2">If quiz has 10 questions but you set this to 3, only 3 will be shown randomly</p>
                      </div>
                    </div>
                  )}

                  {/* Content or Video URL */}
                  {formData.type === 'text' && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-3">
                        Lesson Content
                      </label>
                      <EditorContainer editor={editor}>
                        <Toolbar editor={editor} />
                        <EditorContent editor={editor} className="tiptap-editor" />
                      </EditorContainer>
                    </div>
                  )}

                  {formData.type === 'video' && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                          Video File
                        </label>
                        <p className="text-xs text-slate-500 mb-2">MP4, MOV, AVI — maks. 100MB</p>
                        <input
                          ref={videoInputRef}
                          type="file"
                          accept="video/*"
                          onChange={handleVideoSelect}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => videoInputRef.current?.click()}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left text-slate-900 font-medium"
                        >
                          {videoFileName
                            ? `✓ ${videoFileName}`
                            : formData.video_url
                            ? '✓ Video tersimpan (klik untuk ganti)'
                            : '+ Upload Video'}
                        </button>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-3">
                          Lesson Notes / Content
                        </label>
                        <div className="tiptap-editor-container bg-white">
                          <Toolbar editor={editor} />
                          <EditorContent editor={editor} className="tiptap-editor" />
                        </div>
                      </div>
                    </>
                  )}

                  {formData.type === 'audio' && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-3">
                          Audio File (MP3, WAV, M4A, etc.)
                        </label>
                        <input
                          ref={audioInputRef}
                          type="file"
                          accept="audio/*"
                          onChange={handleAudioSelect}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => audioInputRef.current?.click()}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left text-slate-900 font-medium"
                        >
                          {audioFileName ? `✓ ${audioFileName}` : '+ Upload Audio File'}
                        </button>
                        {audioFileName && (
                          <audio
                            src={formData.audio_url}
                            controls
                            className="w-full mt-3 rounded-lg"
                          />
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-3">
                          Lesson Notes / Content
                        </label>
                        <div className="tiptap-editor-container bg-white">
                          <Toolbar editor={editor} />
                          <EditorContent editor={editor} className="tiptap-editor" />
                        </div>
                      </div>
                    </>
                  )}

                  {formData.type === 'image' && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                          Image
                        </label>
                        <p className="text-xs text-slate-500 mb-2">JPG, PNG, WebP — maks. 5MB</p>
                        <button
                          type="button"
                          disabled={imageUploading}
                          onClick={async () => {
                            const input = document.createElement('input')
                            input.type = 'file'
                            input.accept = 'image/*'
                            input.onchange = async (e) => {
                              const file = e.target.files?.[0]
                              if (!file) return
                              setImageUploading(true)
                              try {
                                const token = localStorage.getItem('token')
                                const fd = new FormData()
                                fd.append('image', file)
                                const res = await axios.post('/api/trainer/upload-image', fd, {
                                  headers: { Authorization: `Bearer ${token}` },
                                })
                                setFormData(prev => ({ ...prev, image_url: res.data.url }))
                                setImageFileName(file.name)
                              } catch {
                                alert('Gagal upload gambar. Coba lagi.')
                              } finally {
                                setImageUploading(false)
                              }
                            }
                            input.click()
                          }}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left text-slate-900 font-medium disabled:opacity-50"
                        >
                          {imageUploading ? 'Uploading...' : imageFileName ? `✓ ${imageFileName}` : formData.image_url ? '✓ Image tersimpan (klik untuk ganti)' : '+ Upload Image'}
                        </button>
                        {formData.image_url && !imageUploading && (
                          <img src={formData.image_url} alt="preview" className="mt-3 max-h-48 rounded-lg border border-gray-200 object-contain" />
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-3">
                          Deskripsi / Caption
                        </label>
                        <EditorContainer editor={editor}>
                          <Toolbar editor={editor} showImage={false} />
                          <EditorContent editor={editor} className="tiptap-editor" />
                        </EditorContainer>
                      </div>
                    </>
                  )}

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-3">
                      Duration
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="number"
                        min="1"
                        value={formData.duration.value}
                        onChange={(e) => setFormData({
                          ...formData,
                          duration: { ...formData.duration, value: e.target.value }
                        })}
                        placeholder="e.g., 15"
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:border-slate-700 focus:ring-1 focus:ring-slate-700 focus:outline-none text-slate-900"
                      />
                      <select
                        value={formData.duration.unit}
                        onChange={(e) => setFormData({
                          ...formData,
                          duration: { ...formData.duration, unit: e.target.value }
                        })}
                        className="px-4 py-3 border border-gray-200 rounded-lg focus:border-slate-700 focus:ring-1 focus:ring-slate-700 focus:outline-none text-slate-900 bg-white"
                      >
                        <option value="minutes">Minutes</option>
                        <option value="hours">Hours</option>
                        <option value="days">Days</option>
                        <option value="weeks">Weeks</option>
                      </select>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-4 pt-6 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-slate-700 hover:bg-slate-800 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                    >
                      {submitting ? (editingLessonId ? 'Updating...' : 'Creating...') : (editingLessonId ? 'Update Lesson' : 'Create Lesson')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        resetForm()
                        setShowForm(false)
                      }}
                      className="px-8 py-3 border border-gray-200 text-slate-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-md w-full">
                <div className="p-6 space-y-4">
                  <h3 className="text-lg font-bold text-slate-900">Delete Lesson?</h3>
                  <p className="text-slate-600 text-sm">
                    Are you sure you want to delete this lesson? This action cannot be undone.
                  </p>
                </div>
                <div className="flex gap-4 p-6 border-t border-gray-200">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 px-4 py-3 border border-gray-200 text-slate-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewLesson && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewLesson(null)}
              className="fixed inset-0 bg-black/60 z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                {/* Preview Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-slate-50 rounded-t-xl sticky top-0">
                  <div className="flex items-center gap-3">
                    <Eye size={20} className="text-slate-600" />
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Preview — tampilan Staff</p>
                      <h2 className="text-lg font-bold text-slate-900">{previewLesson.title}</h2>
                    </div>
                  </div>
                  <button
                    onClick={() => setPreviewLesson(null)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-slate-600" />
                  </button>
                </div>

                {/* Preview Body */}
                <div className="p-6 space-y-6">
                  {/* Video */}
                  {previewLesson.type === 'video' && previewLesson.video_url && (() => {
                    const url = previewLesson.video_url
                    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
                    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/)
                    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
                    if (ytMatch) return <iframe src={`https://www.youtube.com/embed/${ytMatch[1]}`} className="w-full aspect-video rounded-lg shadow-md" allowFullScreen />
                    if (driveMatch) return <iframe src={`https://drive.google.com/file/d/${driveMatch[1]}/preview`} className="w-full aspect-video rounded-lg shadow-md" allowFullScreen />
                    if (vimeoMatch) return <iframe src={`https://player.vimeo.com/video/${vimeoMatch[1]}`} className="w-full aspect-video rounded-lg shadow-md" allowFullScreen />
                    return <video src={url} controls className="w-full rounded-lg shadow-md" />
                  })()}

                  {/* Image */}
                  {previewLesson.type === 'image' && previewLesson.image_url && (
                    <img
                      src={previewLesson.image_url}
                      alt={previewLesson.title}
                      className="w-full rounded-xl shadow-md object-contain max-h-[500px] bg-gray-50"
                    />
                  )}

                  {/* Audio */}
                  {previewLesson.type === 'audio' && previewLesson.audio_url && (
                    <div className="bg-slate-50 rounded-xl p-6">
                      <p className="text-sm font-semibold text-slate-700 mb-3">Audio</p>
                      <audio src={previewLesson.audio_url} controls className="w-full" />
                    </div>
                  )}

                  {/* Quiz */}
                  {previewLesson.type === 'quiz' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
                      <p className="text-4xl mb-3">📝</p>
                      <p className="font-semibold text-slate-900">Quiz Lesson</p>
                      <p className="text-sm text-slate-600 mt-1">
                        {previewLesson.quiz_id ? `Quiz ID: ${previewLesson.quiz_id}` : 'No quiz linked yet'}
                      </p>
                    </div>
                  )}

                  {/* Text Content */}
                  {previewLesson.content && (
                    <div
                      className="lesson-content-preview"
                      dangerouslySetInnerHTML={{ __html: previewLesson.content }}
                    />
                  )}

                  {/* Empty state */}
                  {!previewLesson.content && previewLesson.type === 'text' && (
                    <p className="text-slate-400 italic text-center py-8">Tidak ada konten teks untuk lesson ini.</p>
                  )}

                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/trainer/modules')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} className="text-slate-900" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{moduleName || 'Lessons'}</h1>
              <p className="text-slate-600 text-sm">View and manage lessons for this module</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            disabled={showForm}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <Plus size={20} />
            Add Lesson
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Lessons List */}
        {loading ? (
          <div className="text-center py-12 text-slate-600">Loading...</div>
        ) : lessons.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-slate-600">No lessons found. Create your first lesson!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson, idx) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-all flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 truncate">{lesson.title}</h3>
                  <div className="flex gap-3 mt-2 text-sm items-center">
                    <span className="px-3 py-1 bg-gray-200 text-slate-700 rounded-full text-xs font-semibold capitalize">
                      {lesson.type}
                    </span>
                    {lesson.duration_minutes && lesson.duration_minutes > 0 && (
                      <span className="text-slate-600 text-xs">
                        {(lesson.duration_minutes / 60).toFixed(1)} hours · {lesson.duration_minutes} mins
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4 flex-shrink-0">
                  <button
                    onClick={() => handleReorderLesson(lesson.id, 'up')}
                    disabled={idx === 0 || reorderingLessonId === lesson.id}
                    className={`p-2 rounded-lg transition-colors ${reorderingLessonId === lesson.id ? 'bg-gray-100 opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 text-slate-600'} disabled:opacity-30 disabled:cursor-not-allowed`}
                    title="Move up"
                  >
                    {reorderingLessonId === lesson.id ? <span className="text-xs">...</span> : <ChevronUp size={18} />}
                  </button>
                  <button
                    onClick={() => handleReorderLesson(lesson.id, 'down')}
                    disabled={idx === lessons.length - 1 || reorderingLessonId === lesson.id}
                    className={`p-2 rounded-lg transition-colors ${reorderingLessonId === lesson.id ? 'bg-gray-100 opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 text-slate-600'} disabled:opacity-30 disabled:cursor-not-allowed`}
                    title="Move down"
                  >
                    {reorderingLessonId === lesson.id ? <span className="text-xs">...</span> : <ChevronDown size={18} />}
                  </button>
                  <button
                    onClick={() => setPreviewLesson(lesson)}
                    className="p-2 hover:bg-emerald-50 rounded-lg transition-colors text-slate-600"
                    title="Preview"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => handleEditLesson(lesson)}
                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-slate-600"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteLesson(lesson.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors text-slate-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
