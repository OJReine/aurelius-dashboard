import { useState } from 'react'
import { motion } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function StreamForm({ isOpen, onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    item_name: initialData?.item_name || '',
    creator_name: initialData?.creator_name || '',
    creator_id: initialData?.creator_id || '',
    agency_name: initialData?.agency_name || '',
    due_days: initialData ? Math.ceil((new Date(initialData.due_date) - new Date()) / (1000 * 60 * 60 * 24)) : 3,
    priority: initialData?.priority || 'medium',
    stream_type: initialData?.stream_type || 'showcase',
    notes: initialData?.notes || ''
  })

  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSubmit(formData)
      toast.success(initialData ? 'Stream updated successfully! ✨' : 'Stream created successfully! ✨')
      onClose()
    } catch (error) {
      console.error('Error saving stream:', error)
      toast.error('Failed to save stream')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="modal-content max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gradient">
            {initialData ? 'Edit Stream' : 'Create New Stream'}
          </h2>
          <button
            onClick={onClose}
            className="btn-ghost p-2"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-soft">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-soft">Item Name *</label>
              <input
                type="text"
                name="item_name"
                value={formData.item_name}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter item name"
                required
              />
            </div>

            <div>
              <label className="label-soft">Creator Name *</label>
              <input
                type="text"
                name="creator_name"
                value={formData.creator_name}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter creator name"
                required
              />
            </div>

            <div>
              <label className="label-soft">Creator ID</label>
              <input
                type="text"
                name="creator_id"
                value={formData.creator_id}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter creator IMVU ID"
              />
            </div>

            <div>
              <label className="label-soft">Agency Name</label>
              <input
                type="text"
                name="agency_name"
                value={formData.agency_name}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter agency name"
              />
            </div>

            <div>
              <label className="label-soft">Due Days *</label>
              <select
                name="due_days"
                value={formData.due_days}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value={1}>1 day</option>
                <option value={2}>2 days</option>
                <option value={3}>3 days</option>
                <option value={4}>4 days</option>
                <option value={5}>5 days</option>
                <option value={6}>6 days</option>
                <option value={7}>7 days</option>
              </select>
            </div>

            <div>
              <label className="label-soft">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="input-field"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="label-soft">Stream Type</label>
              <select
                name="stream_type"
                value={formData.stream_type}
                onChange={handleChange}
                className="input-field"
              >
                <option value="showcase">Showcase</option>
                <option value="sponsored">Sponsored</option>
                <option value="open">Open Shop</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label-soft">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="input-field"
              rows={3}
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : (initialData ? 'Update Stream' : 'Create Stream')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
