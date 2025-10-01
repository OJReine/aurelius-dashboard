import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  XMarkIcon, 
  SparklesIcon,
  DocumentTextIcon,
  PhotoIcon,
  ClipboardDocumentIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const PLATFORMS = [
  { id: 'imvu_feed', name: 'IMVU Feed', icon: DocumentTextIcon },
  { id: 'ig_feed', name: 'Instagram Feed', icon: PhotoIcon },
  { id: 'request', name: 'Request Message', icon: DocumentTextIcon },
  { id: 'end_stream', name: 'End Stream Message', icon: CheckIcon }
]

export default function CaptionGenerator({ isOpen, onClose, streamData, agencies = [] }) {
  const [selectedPlatform, setSelectedPlatform] = useState('imvu_feed')
  const [selectedAgency, setSelectedAgency] = useState('')
  const [generatedCaptions, setGeneratedCaptions] = useState({})
  const [loading, setLoading] = useState(false)
  const [customTemplate, setCustomTemplate] = useState('')

  useEffect(() => {
    if (isOpen && streamData) {
      generateCaptions()
    }
  }, [isOpen, streamData, selectedAgency, selectedPlatform])

  const generateCaptions = async () => {
    if (!streamData || !streamData.items) return

    setLoading(true)
    try {
      // For IMVU and IG feeds, generate a single caption for all items
      if (selectedPlatform === 'imvu_feed' || selectedPlatform === 'ig_feed') {
        const singleCaption = await generateSingleCaptionForAllItems()
        setGeneratedCaptions({ all_items: singleCaption })
      } else {
        // For other platforms, generate individual captions
        const captions = {}
        
        for (const item of streamData.items) {
          const caption = await generateCaptionForItem(item)
          captions[item.id] = caption
        }
        
        setGeneratedCaptions(captions)
      }
    } catch (error) {
      console.error('Error generating captions:', error)
      toast.error('Failed to generate captions')
    } finally {
      setLoading(false)
    }
  }

  const generateCaptionForItem = async (item) => {
    // Get template from selected agency or use default
    let template = ''
    
    if (selectedAgency) {
      const agency = agencies.find(a => a.id === parseInt(selectedAgency))
      template = agency?.templates?.[selectedPlatform] || ''
    }
    
    if (!template) {
      template = getDefaultTemplate(selectedPlatform)
    }

    // Replace variables in template
    const variables = {
      item_name: item.item_name || 'Item',
      creator_name: item.creator_name || 'Creator',
      creator_imvu_avatar: item.creator_imvu_avatar || 'Creator',
      creator_ig_handle: item.creator_ig_handle || '',
      creator_ig_shop_handle: item.creator_ig_shop_handle || '',
      product_id: item.product_id || '',
      agency_name: streamData.agency_name || 'Agency',
      stream_type: streamData.stream_type || 'showcase',
      due_date: streamData.due_date ? new Date(streamData.due_date).toLocaleDateString() : ''
    }

    let caption = template
    Object.entries(variables).forEach(([key, value]) => {
      caption = caption.replace(new RegExp(`{${key}}`, 'g'), value)
    })

    return caption
  }

  const generateSingleCaptionForAllItems = async () => {
    if (!streamData || !streamData.items) return ''

    // Get template from selected agency or use default
    let template = ''
    
    if (selectedAgency) {
      const agency = agencies.find(a => a.id === parseInt(selectedAgency))
      template = agency?.templates?.[selectedPlatform] || ''
    }
    
    if (!template) {
      template = getDefaultTemplate(selectedPlatform)
    }

    // For IMVU and IG feeds, create a single caption with all items
    if (selectedPlatform === 'imvu_feed' || selectedPlatform === 'ig_feed') {
      let caption = template
      
      // Replace basic variables
      const basicVariables = {
        agency_name: streamData.agency_name || 'Agency',
        stream_type: streamData.stream_type || 'showcase',
        due_date: streamData.due_date ? new Date(streamData.due_date).toLocaleDateString() : ''
      }

      Object.entries(basicVariables).forEach(([key, value]) => {
        caption = caption.replace(new RegExp(`{${key}}`, 'g'), value)
      })

      // Handle multiple items
      if (caption.includes('{item_name}') || caption.includes('{creator_name}') || caption.includes('{product_id}')) {
        // Create a list of all items
        const itemsList = streamData.items.map(item => {
          let itemText = caption
          
          const itemVariables = {
            item_name: item.item_name || 'Item',
            creator_name: item.creator_name || 'Creator',
            creator_imvu_avatar: item.creator_imvu_avatar || 'Creator',
            creator_ig_handle: item.creator_ig_handle || '',
            creator_ig_shop_handle: item.creator_ig_shop_handle || '',
            product_id: item.product_id || ''
          }

          Object.entries(itemVariables).forEach(([key, value]) => {
            itemText = itemText.replace(new RegExp(`{${key}}`, 'g'), value)
          })

          return itemText
        }).join('\n\n')

        return itemsList
      }
    }

    return caption
  }

  const getDefaultTemplate = (platform) => {
    const templates = {
      imvu_feed: '✨ {item_name} by @{creator_imvu_avatar} ✨\n\n{product_id}\n\n#IMVU #Fashion #Modeling',
      ig_feed: '✨ {item_name} ✨\n\nAvailable on IMVU!\nProduct ID: {product_id}\n\n#IMVU #Fashion #Modeling #VirtualFashion',
      request: 'Hi @{creator_imvu_avatar}! I\'d love to showcase {item_name} in my next stream. Product ID: {product_id}',
      end_stream: 'Thank you for watching! Don\'t forget to check out {item_name} by @{creator_imvu_avatar} - {product_id}'
    }
    return templates[platform] || ''
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard! ✨')
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error('Failed to copy to clipboard')
    }
  }

  const copyAllCaptions = async () => {
    const allCaptions = Object.values(generatedCaptions).join('\n\n---\n\n')
    await copyToClipboard(allCaptions)
  }

  if (!isOpen || !streamData) return null

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
            Generate Captions
          </h2>
          <button
            onClick={onClose}
            className="btn-ghost p-2"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="label-soft">Platform</label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="input-field"
            >
              {PLATFORMS.map((platform) => {
                const Icon = platform.icon
                return (
                  <option key={platform.id} value={platform.id}>
                    {platform.name}
                  </option>
                )
              })}
            </select>
          </div>

          <div>
            <label className="label-soft">Agency Template</label>
            <select
              value={selectedAgency}
              onChange={(e) => setSelectedAgency(e.target.value)}
              className="input-field"
            >
              <option value="">Default Template</option>
              {agencies.map((agency) => (
                <option key={agency.id} value={agency.id}>
                  {agency.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <motion.button
              onClick={generateCaptions}
              disabled={loading}
              className="btn-primary w-full"
            >
              <SparklesIcon className="w-4 h-4 mr-2" />
              {loading ? 'Generating...' : 'Regenerate'}
            </motion.button>
          </div>
        </div>

        {/* Generated Captions */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Generated Captions
            </h3>
            {Object.keys(generatedCaptions).length > 0 && (
              <button
                onClick={copyAllCaptions}
                className="btn-secondary text-sm"
              >
                <ClipboardDocumentIcon className="w-4 h-4 mr-1" />
                Copy All
              </button>
            )}
          </div>

          {/* Single caption for IMVU/IG feeds */}
          {(selectedPlatform === 'imvu_feed' || selectedPlatform === 'ig_feed') && generatedCaptions.all_items && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {selectedPlatform === 'imvu_feed' ? 'IMVU Feed Caption' : 'Instagram Feed Caption'}
                  </h4>
                  <p className="text-sm text-gray-500">
                    All {streamData.items?.length || 0} items included
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(generatedCaptions.all_items || '')}
                  className="btn-ghost text-sm"
                >
                  <ClipboardDocumentIcon className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                  {generatedCaptions.all_items || 'Generating caption...'}
                </pre>
              </div>
            </motion.div>
          )}

          {/* Individual captions for other platforms */}
          {selectedPlatform !== 'imvu_feed' && selectedPlatform !== 'ig_feed' && streamData.items?.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {item.item_name} by {item.creator_name}
                  </h4>
                  {item.product_id && (
                    <p className="text-sm text-gray-500">
                      Product ID: {item.product_id}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => copyToClipboard(generatedCaptions[item.id] || '')}
                  className="btn-ghost text-sm"
                >
                  <ClipboardDocumentIcon className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                  {generatedCaptions[item.id] || 'Generating caption...'}
                </pre>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  )
}
