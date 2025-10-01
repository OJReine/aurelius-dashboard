import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  XMarkIcon, 
  PlusIcon, 
  TrashIcon, 
  LinkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import IMVULinkParser from '../lib/imvuLinkParser'

export default function StreamForm({ isOpen, onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    agency_name: initialData?.agency_name || '',
    due_days: initialData ? Math.ceil((new Date(initialData.due_date) - new Date()) / (1000 * 60 * 60 * 24)) : 3,
    priority: initialData?.priority || 'medium',
    stream_type: initialData?.stream_type || 'showcase',
    notes: initialData?.notes || ''
  })

  const [items, setItems] = useState([
    {
      id: 1,
      item_name: '',
      creator_name: '',
      creator_id: '',
      product_url: '',
      product_id: '',
      notes: ''
    }
  ])

  const [loading, setLoading] = useState(false)
  const [parsingUrls, setParsingUrls] = useState(false)
  const linkParser = new IMVULinkParser()

  useEffect(() => {
    if (initialData && initialData.items) {
      setItems(initialData.items)
    }
  }, [initialData])

  const addItem = () => {
    const newItem = {
      id: Date.now(),
      item_name: '',
      creator_name: '',
      creator_id: '',
      product_url: '',
      product_id: '',
      notes: ''
    }
    setItems(prev => [...prev, newItem])
  }

  const removeItem = (itemId) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== itemId))
    }
  }

  const updateItem = (itemId, field, value) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    ))
  }

  const parseProductUrls = async () => {
    setParsingUrls(true)
    try {
      const urlsToParse = items
        .filter(item => item.product_url && !item.product_id)
        .map(item => item.product_url)

      if (urlsToParse.length === 0) {
        toast.info('No URLs to parse')
        return
      }

      const results = await linkParser.parseMultipleUrls(urlsToParse)
      
      // Update items with parsed information
      results.forEach((result, index) => {
        if (result.success) {
          const itemIndex = items.findIndex(item => item.product_url === result.url)
          if (itemIndex !== -1) {
            updateItem(items[itemIndex].id, 'product_id', result.productId)
            if (result.productName) {
              updateItem(items[itemIndex].id, 'item_name', result.productName)
            }
            if (result.creatorName) {
              updateItem(items[itemIndex].id, 'creator_name', result.creatorName)
            }
          }
        }
      })

      toast.success(`Parsed ${results.filter(r => r.success).length} product URLs! ✨`)
    } catch (error) {
      console.error('Error parsing URLs:', error)
      toast.error('Failed to parse product URLs')
    } finally {
      setParsingUrls(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate that all items have required fields
      const validItems = items.filter(item => 
        item.item_name.trim() && item.creator_name.trim()
      )

      if (validItems.length === 0) {
        toast.error('Please add at least one valid item')
        return
      }

      const submitData = {
        ...formData,
        items: validItems
      }

      await onSubmit(submitData)
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
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white/90 backdrop-blur-md rounded-2xl shadow-soft-lg border border-white/30 p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Stream Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div>
              <label className="label-soft">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="input-field"
                rows={2}
                placeholder="Additional notes..."
              />
            </div>
          </div>

          {/* Items Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Stream Items</h3>
              <div className="flex space-x-2">
                <motion.button
                  type="button"
                  onClick={parseProductUrls}
                  disabled={parsingUrls}
                  className="btn-secondary text-sm"
                >
                  <SparklesIcon className="w-4 h-4 mr-1" />
                  {parsingUrls ? 'Parsing...' : 'Parse URLs'}
                </motion.button>
                <motion.button
                  type="button"
                  onClick={addItem}
                  className="btn-primary text-sm"
                >
                  <PlusIcon className="w-4 h-4 mr-1" />
                  Add Item
                </motion.button>
              </div>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card p-4"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-900">Item {index + 1}</h4>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="btn-ghost text-red-600 hover:text-red-800 p-1"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="label-soft">Item Name *</label>
                      <input
                        type="text"
                        value={item.item_name}
                        onChange={(e) => updateItem(item.id, 'item_name', e.target.value)}
                        className="input-field"
                        placeholder="Enter item name"
                        required
                      />
                    </div>

                    <div>
                      <label className="label-soft">Creator Name *</label>
                      <input
                        type="text"
                        value={item.creator_name}
                        onChange={(e) => updateItem(item.id, 'creator_name', e.target.value)}
                        className="input-field"
                        placeholder="Enter creator name"
                        required
                      />
                    </div>

                    <div>
                      <label className="label-soft">Creator ID</label>
                      <input
                        type="text"
                        value={item.creator_id}
                        onChange={(e) => updateItem(item.id, 'creator_id', e.target.value)}
                        className="input-field"
                        placeholder="Enter creator IMVU ID"
                      />
                    </div>

                    <div>
                      <label className="label-soft">Product URL</label>
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="url"
                          value={item.product_url}
                          onChange={(e) => updateItem(item.id, 'product_url', e.target.value)}
                          className="input-field pl-10"
                          placeholder="https://www.imvu.com/shop/product.php?products_id=..."
                        />
                      </div>
                      {item.product_id && (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ Product ID: {item.product_id}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="label-soft">Item Notes</label>
                      <textarea
                        value={item.notes}
                        onChange={(e) => updateItem(item.id, 'notes', e.target.value)}
                        className="input-field"
                        rows={2}
                        placeholder="Additional notes for this item..."
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
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