import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  XMarkIcon, 
  PlusIcon, 
  TrashIcon, 
  PencilIcon,
  DocumentTextIcon,
  PhotoIcon,
  ChatBubbleLeftRightIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const TEMPLATE_TYPES = [
  { id: 'imvu_feed', name: 'IMVU Feed Caption', icon: DocumentTextIcon, description: 'Caption for IMVU feed posts' },
  { id: 'ig_feed', name: 'Instagram Feed Caption', icon: PhotoIcon, description: 'Caption for Instagram posts' },
  { id: 'request', name: 'Request Message', icon: ChatBubbleLeftRightIcon, description: 'Message to send to creators' },
  { id: 'end_stream', name: 'End Stream Message', icon: CheckIcon, description: 'Message to end streams' }
]

const AVAILABLE_VARIABLES = [
  { name: 'item_name', description: 'Name of the item' },
  { name: 'creator_name', description: 'Name of the creator' },
  { name: 'product_id', description: 'IMVU product ID' },
  { name: 'agency_name', description: 'Agency name' },
  { name: 'stream_type', description: 'Type of stream (showcase, sponsored, etc.)' },
  { name: 'due_date', description: 'Due date for the stream' }
]

export default function AgencyTemplates({ isOpen, onClose, onSave }) {
  const [agencies, setAgencies] = useState([])
  const [selectedAgency, setSelectedAgency] = useState(null)
  const [templates, setTemplates] = useState({})
  const [loading, setLoading] = useState(false)
  const [showAddAgency, setShowAddAgency] = useState(false)
  const [newAgencyName, setNewAgencyName] = useState('')

  useEffect(() => {
    if (isOpen) {
      loadAgencies()
    }
  }, [isOpen])

  const loadAgencies = () => {
    // Load from localStorage for now
    const savedAgencies = localStorage.getItem('aurelius-agencies')
    if (savedAgencies) {
      setAgencies(JSON.parse(savedAgencies))
    }
  }

  const saveAgencies = (agenciesData) => {
    localStorage.setItem('aurelius-agencies', JSON.stringify(agenciesData))
    setAgencies(agenciesData)
  }

  const addAgency = () => {
    if (!newAgencyName.trim()) {
      toast.error('Please enter an agency name')
      return
    }

    const newAgency = {
      id: Date.now(),
      name: newAgencyName.trim(),
      templates: {}
    }

    const updatedAgencies = [...agencies, newAgency]
    saveAgencies(updatedAgencies)
    setSelectedAgency(newAgency)
    setNewAgencyName('')
    setShowAddAgency(false)
    toast.success('Agency added successfully! ✨')
  }

  const deleteAgency = (agencyId) => {
    const updatedAgencies = agencies.filter(agency => agency.id !== agencyId)
    saveAgencies(updatedAgencies)
    if (selectedAgency?.id === agencyId) {
      setSelectedAgency(null)
    }
    toast.success('Agency deleted successfully! ✨')
  }

  const updateTemplate = (templateType, content) => {
    if (!selectedAgency) return

    const updatedAgencies = agencies.map(agency => {
      if (agency.id === selectedAgency.id) {
        return {
          ...agency,
          templates: {
            ...agency.templates,
            [templateType]: content
          }
        }
      }
      return agency
    })

    saveAgencies(updatedAgencies)
    setSelectedAgency(updatedAgencies.find(a => a.id === selectedAgency.id))
  }

  const insertVariable = (templateType, variable) => {
    const currentContent = selectedAgency?.templates?.[templateType] || ''
    const newContent = currentContent + `{${variable}}`
    updateTemplate(templateType, newContent)
  }

  const handleSave = () => {
    if (onSave) {
      onSave(agencies)
    }
    toast.success('Agency templates saved successfully! ✨')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white/90 backdrop-blur-md rounded-2xl shadow-soft-lg border border-white/30 p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gradient">
            Agency Templates
          </h2>
          <button
            onClick={onClose}
            className="btn-ghost p-2"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agencies List */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Agencies</h3>
              <motion.button
                onClick={() => setShowAddAgency(true)}
                className="btn-primary text-sm"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Add Agency
              </motion.button>
            </div>

            {showAddAgency && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-4"
              >
                <input
                  type="text"
                  value={newAgencyName}
                  onChange={(e) => setNewAgencyName(e.target.value)}
                  className="input-field mb-3"
                  placeholder="Enter agency name"
                  onKeyPress={(e) => e.key === 'Enter' && addAgency()}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={addAgency}
                    className="btn-primary text-sm"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddAgency(false)}
                    className="btn-secondary text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}

            <div className="space-y-2">
              {agencies.map((agency) => (
                <motion.div
                  key={agency.id}
                  className={`card p-3 cursor-pointer transition-all ${
                    selectedAgency?.id === agency.id 
                      ? 'ring-2 ring-primary-500 bg-primary-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedAgency(agency)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-900">{agency.name}</h4>
                      <p className="text-sm text-gray-500">
                        {Object.keys(agency.templates || {}).length} templates
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteAgency(agency.id)
                      }}
                      className="btn-ghost text-red-600 hover:text-red-800 p-1"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Templates Editor */}
          <div className="lg:col-span-2">
            {selectedAgency ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Templates for {selectedAgency.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Create custom templates for different platforms and purposes
                  </p>
                </div>

                {TEMPLATE_TYPES.map((templateType) => {
                  const Icon = templateType.icon
                  const currentContent = selectedAgency.templates?.[templateType.id] || ''
                  
                  return (
                    <div key={templateType.id} className="card p-4">
                      <div className="flex items-center mb-3">
                        <Icon className="w-5 h-5 text-primary-600 mr-2" />
                        <div>
                          <h4 className="font-medium text-gray-900">{templateType.name}</h4>
                          <p className="text-sm text-gray-500">{templateType.description}</p>
                        </div>
                      </div>

                      <textarea
                        value={currentContent}
                        onChange={(e) => updateTemplate(templateType.id, e.target.value)}
                        className="input-field mb-3"
                        rows={4}
                        placeholder={`Enter your ${templateType.name.toLowerCase()} template...`}
                      />

                      <div className="flex flex-wrap gap-2">
                        <span className="text-sm text-gray-600 mr-2">Variables:</span>
                        {AVAILABLE_VARIABLES.map((variable) => (
                          <button
                            key={variable.name}
                            onClick={() => insertVariable(templateType.id, variable.name)}
                            className="btn-ghost text-xs px-2 py-1"
                            title={variable.description}
                          >
                            {`{${variable.name}}`}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select an Agency
                  </h3>
                  <p className="text-gray-600">
                    Choose an agency from the list to edit its templates
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn-primary"
          >
            Save Templates
          </button>
        </div>
      </motion.div>
    </div>
  )
}
