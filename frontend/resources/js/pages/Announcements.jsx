import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Bell, Calendar, Plus, X, Edit, Trash2,
  CheckCircle, AlertCircle,
  Bold, Italic, List, ListOrdered, Quote, Link2,
  Image as ImageIcon, AlignLeft, AlignCenter, AlignRight,
} from 'lucide-react'
import axios from 'axios'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import './LessonManager.css'

// ── TipTap extensions ──────────────────────────────────────────────────────────
const ImagePaste = Extension.create({
  name: 'imagePaste',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('imagePaste'),
        props: {
          handlePaste: (view, event) => {
            const items = (event.clipboardData || event.dataTransfer)?.items
            if (!items) return false
            let handled = false
            for (let item of items) {
              if (item.type.indexOf('image') !== -1) {
                event.preventDefault()
                handled = true
                const file = item.getAsFile()
                if (!file) continue
                const reader = new FileReader()
                reader.onload = (e) => {
                  const src = e.target?.result
                  view.dispatch(view.state.tr.insertContent({ type: 'image', attrs: { src } }))
                }
                reader.readAsDataURL(file)
              }
            }
            return handled
          },
        },
      }),
    ]
  },
})

const ImageAlignExtension = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: { default: null, renderHTML: (a) => a.align ? { style: `display:block;margin:${a.align === 'center' ? '0 auto' : a.align === 'right' ? '0 0 0 auto' : '0 auto 0 0'}` } : {} },
    }
  },
  addCommands() {
    return {
      setImage: (options) => ({ commands }) => commands.insertContent({ type: this.name, attrs: options }),
      setImageAlignment: (align) => ({ commands }) => commands.updateAttributes('image', { align }),
    }
  },
})

// ── Toolbar ───────────────────────────────────────────────────────────────────
function Toolbar({ editor }) {
  const fileInputRef = useRef(null)
  if (!editor) return null

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      editor.chain().focus().setImage({ src: ev.target?.result }).run()
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
    reader.readAsDataURL(file)
  }

  const btn = (active, onClick, title, children) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded ${active ? 'bg-slate-700 text-white' : 'hover:bg-gray-200'}`}
    >
      {children}
    </button>
  )
  const sep = <div className="w-px bg-gray-300" />

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden"
        onKeyDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()} />
      {btn(editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), 'Bold', <Bold size={16} />)}
      {btn(editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), 'Italic', <Italic size={16} />)}
      {sep}
      {btn(editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run(), 'Bullet List', <List size={16} />)}
      {btn(editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), 'Ordered List', <ListOrdered size={16} />)}
      {btn(editor.isActive('blockquote'), () => editor.chain().focus().toggleBlockquote().run(), 'Quote', <Quote size={16} />)}
      {sep}
      {btn(editor.isActive('link'), () => {
        const url = prompt('Enter URL:')
        if (url) editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
      }, 'Link', <Link2 size={16} />)}
      {sep}
      <button type="button" title="Insert Image" onClick={(e) => { e.preventDefault(); fileInputRef.current?.click() }}
        className="p-2 rounded hover:bg-gray-200">
        <ImageIcon size={16} />
      </button>
      {btn(editor.isActive('image', { align: 'left' }), () => editor.chain().focus().setImageAlignment('left').run(), 'Align Left', <AlignLeft size={16} />)}
      {btn(editor.isActive('image', { align: 'center' }), () => editor.chain().focus().setImageAlignment('center').run(), 'Align Center', <AlignCenter size={16} />)}
      {btn(editor.isActive('image', { align: 'right' }), () => editor.chain().focus().setImageAlignment('right').run(), 'Align Right', <AlignRight size={16} />)}
    </div>
  )
}

// ── Form modal with its own editor instance ───────────────────────────────────
function AnnouncementFormModal({ editingId, initialTitle, initialContent, onSave, onClose, saving }) {
  const [title, setTitle] = useState(initialTitle || '')

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      ImagePaste,
      ImageAlignExtension,
    ],
    content: initialContent || '',
    editorProps: {
      attributes: { class: 'prose max-w-none min-h-[180px] px-4 py-3 focus:outline-none text-slate-900' },
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    const html = editor?.getHTML() || ''
    if (html === '<p></p>' || !html.trim()) return
    onSave({ title, content: html })
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-40"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
      >
        <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-2xl max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 shrink-0">
            <h2 className="text-lg font-bold text-slate-900">
              {editingId ? 'Edit Announcement' : 'New Announcement'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={20} className="text-slate-600" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Announcement title..."
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-slate-700 focus:border-slate-700 focus:outline-none text-slate-900"
                />
              </div>

              {/* Rich text content */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Content</label>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <Toolbar editor={editor} />
                  <EditorContent editor={editor} />
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end p-6 border-t border-gray-200 shrink-0">
              <button type="button" onClick={onClose}
                className="px-5 py-2.5 border border-gray-200 text-slate-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="px-5 py-2.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : editingId ? 'Update' : 'Publish'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Announcements() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const [modalState, setModalState] = useState(null) // null | { editingId, title, content }
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [message, setMessage] = useState({ show: false, type: 'success', text: '' })

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}') } catch { return {} }
  })()
  const isTrainer = user?.role === 'Trainer' || user?.role?.name === 'Trainer'

  useEffect(() => { fetchAnnouncements() }, [])

  const fetchAnnouncements = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const endpoint = isTrainer ? '/api/trainer/announcements' : '/api/announcements'
      const res = await axios.get(endpoint, { headers: { Authorization: `Bearer ${token}` } })
      setAnnouncements(isTrainer ? (res.data.announcements || []) : (res.data || []))
    } catch (e) {
      console.error('Failed to fetch announcements:', e)
    } finally {
      setLoading(false)
    }
  }

  const showMsg = (type, text) => {
    setMessage({ show: true, type, text })
    setTimeout(() => setMessage({ show: false, type: 'success', text: '' }), 2500)
  }

  const handleSave = async ({ title, content }) => {
    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      if (modalState?.editingId) {
        const res = await axios.put(`/api/announcements/${modalState.editingId}`, { title, content }, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setAnnouncements(prev => prev.map(a => a.id === modalState.editingId ? res.data.announcement : a))
        showMsg('success', 'Announcement updated!')
      } else {
        const res = await axios.post('/api/announcements', { title, content }, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setAnnouncements(prev => [res.data.announcement, ...prev])
        showMsg('success', 'Announcement published!')
      }
      setModalState(null)
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/announcements/${deleteConfirm.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setAnnouncements(prev => prev.filter(a => a.id !== deleteConfirm.id))
      setDeleteConfirm(null)
      showMsg('success', 'Announcement deleted.')
    } catch {
      showMsg('error', 'Failed to delete')
    }
  }

  const filtered = useMemo(() =>
    announcements.filter(a =>
      (a.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.content || '').toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [searchQuery, announcements]
  )

  return (
    <main className="flex-1 overflow-y-auto bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-1">Announcements</h1>
            <p className="text-slate-600 text-sm">
              {isTrainer ? 'Manage your announcements to staff' : 'Stay updated with latest announcements'}
            </p>
          </div>
          {isTrainer && (
            <button
              onClick={() => setModalState({ editingId: null, title: '', content: '' })}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors"
            >
              <Plus size={18} />
              New Announcement
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Cari pengumuman..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-slate-900"
            />
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-12 text-slate-600">Loading announcements...</div>
        ) : filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map((ann, idx) => (
              <motion.div
                key={ann.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="text-xl font-bold text-slate-900">{ann.title}</h3>
                  {isTrainer && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setModalState({ editingId: ann.id, title: ann.title, content: ann.content })}
                        className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(ann)}
                        className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Render HTML content from TipTap */}
                <div
                  className="prose max-w-none text-slate-600 mb-4"
                  dangerouslySetInnerHTML={{ __html: ann.content }}
                />

                <div className="flex flex-wrap gap-6 text-sm text-slate-500 border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={15} />
                    <span>Posted: <strong>{new Date(ann.published_at || ann.created_at).toLocaleDateString()}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bell size={15} />
                    <span>By: <strong>{ann.creator?.name || user?.name || 'Trainer'}</strong></span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Bell size={48} className="mx-auto text-slate-400 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Announcements</h3>
            <p className="text-slate-600">
              {isTrainer ? 'Create your first announcement for staff.' : 'No announcements match your search'}
            </p>
          </div>
        )}
      </div>

      {/* Create / Edit Modal — separate component so editor mounts fresh each time */}
      <AnimatePresence>
        {modalState && (
          <AnnouncementFormModal
            key={modalState.editingId ?? 'new'}
            editingId={modalState.editingId}
            initialTitle={modalState.title}
            initialContent={modalState.content}
            onSave={handleSave}
            onClose={() => setModalState(null)}
            saving={saving}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-md w-full p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Announcement?</h3>
                <p className="text-slate-600 text-sm mb-6">
                  Are you sure you want to delete "<strong>{deleteConfirm.title}</strong>"? This cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteConfirm(null)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 text-slate-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleDelete}
                    className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {message.show && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border ${
              message.type === 'success' ? 'bg-white border-green-200' : 'bg-white border-red-200'
            }`}
          >
            {message.type === 'success'
              ? <CheckCircle size={18} className="text-green-600" />
              : <AlertCircle size={18} className="text-red-600" />
            }
            <p className={`text-sm font-medium ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
              {message.text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
