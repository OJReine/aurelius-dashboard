import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  XMarkIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  LinkIcon,
  KeyIcon,
  DatabaseIcon,
  CloudIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { dbHelpers } from '../lib/supabase'

export default function DatabaseSetup({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1)
  const [config, setConfig] = useState({
    url: '',
    anonKey: ''
  })
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)

  const handleInputChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const testConnection = async () => {
    if (!config.url || !config.anonKey) {
      toast.error('Please enter both URL and API Key')
      return
    }

    setTesting(true)
    setTestResult(null)

    try {
      // Temporarily save config to test
      const originalConfig = localStorage.getItem('aurelius-supabase-config')
      localStorage.setItem('aurelius-supabase-config', JSON.stringify(config))
      
      // Create temporary client to test
      const { createClient } = await import('@supabase/supabase-js')
      const testClient = createClient(config.url, config.anonKey)
      
      // Test connection by trying to get session
      const { data, error } = await testClient.auth.getSession()
      
      // Restore original config
      if (originalConfig) {
        localStorage.setItem('aurelius-supabase-config', originalConfig)
      } else {
        localStorage.removeItem('aurelius-supabase-config')
      }

      if (error) {
        setTestResult({ success: false, message: error.message })
      } else {
        setTestResult({ success: true, message: 'Connection successful!' })
        setStep(3)
      }
    } catch (error) {
      setTestResult({ success: false, message: error.message })
    } finally {
      setTesting(false)
    }
  }

  const saveConfiguration = () => {
    try {
      dbHelpers.saveConfig(config.url, config.anonKey)
      toast.success('Database configuration saved!')
      onSuccess?.()
      onClose()
    } catch (error) {
      toast.error('Failed to save configuration')
    }
  }

  const steps = [
    {
      title: 'Create Free Database',
      description: 'Set up your own free Supabase database'
    },
    {
      title: 'Get Connection Details',
      description: 'Copy your database URL and API key'
    },
    {
      title: 'Test Connection',
      description: 'Verify your database is working'
    }
  ]

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="modal-content max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gradient">
              Set Up Your Database
            </h2>
            <p className="text-soft mt-1">
              Keep your data safe and accessible across devices
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn-ghost p-2"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((stepItem, index) => (
              <div key={index} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  step > index + 1 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : step === index + 1 
                    ? 'bg-primary-500 border-primary-500 text-white' 
                    : 'border-soft-300 text-soft-400'
                }`}>
                  {step > index + 1 ? (
                    <CheckCircleIcon className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    step >= index + 1 ? 'text-gray-900' : 'text-soft-400'
                  }`}>
                    {stepItem.title}
                  </p>
                  <p className="text-xs text-soft-400">
                    {stepItem.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    step > index + 1 ? 'bg-green-500' : 'bg-soft-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="card p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <CloudIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Create a Free Supabase Account
                    </h3>
                    <p className="text-soft mb-4">
                      Supabase offers a free tier with 500MB database storage, perfect for your modeling data.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        <span className="text-sm">Free 500MB database storage</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        <span className="text-sm">Automatic backups</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        <span className="text-sm">Access from any device</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="font-medium text-blue-900 mb-2">Quick Setup Steps:</h4>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline">supabase.com</a></li>
                  <li>2. Click "Start your project" and sign up</li>
                  <li>3. Create a new project</li>
                  <li>4. Wait for the project to be ready (2-3 minutes)</li>
                </ol>
              </div>

              <div className="flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStep(2)}
                  className="btn-primary"
                >
                  Next: Get Connection Details
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="card p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <KeyIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Get Your Database Connection Details
                    </h3>
                    <p className="text-soft mb-4">
                      You need two pieces of information from your Supabase project.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="label-soft">Project URL</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-soft-400" />
                      <input
                        type="url"
                        value={config.url}
                        onChange={(e) => handleInputChange('url', e.target.value)}
                        className="input-field pl-10"
                        placeholder="https://your-project.supabase.co"
                      />
                    </div>
                    <p className="text-xs text-soft-400 mt-1">
                      Found in Settings → API → Project URL
                    </p>
                  </div>

                  <div>
                    <label className="label-soft">Anon Public Key</label>
                    <div className="relative">
                      <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-soft-400" />
                      <input
                        type="text"
                        value={config.anonKey}
                        onChange={(e) => handleInputChange('anonKey', e.target.value)}
                        className="input-field pl-10"
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      />
                    </div>
                    <p className="text-xs text-soft-400 mt-1">
                      Found in Settings → API → Project API keys
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex items-start space-x-2">
                      <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-900">Where to Find These:</h4>
                        <ol className="text-sm text-yellow-800 mt-2 space-y-1">
                          <li>1. Go to your Supabase project dashboard</li>
                          <li>2. Click "Settings" in the sidebar</li>
                          <li>3. Click "API"</li>
                          <li>4. Copy the "Project URL"</li>
                          <li>5. Copy the "anon public" key</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-start space-x-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-900">Security Note:</h4>
                        <p className="text-sm text-green-800 mt-1">
                          The "anon public" key is safe to use in frontend applications. 
                          It only allows access to data you explicitly permit.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStep(1)}
                  className="btn-secondary"
                >
                  Back
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={testConnection}
                  disabled={testing || !config.url || !config.anonKey}
                  className="btn-primary"
                >
                  {testing ? 'Testing...' : 'Test Connection'}
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {testResult && (
                <div className={`card p-6 ${
                  testResult.success 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    {testResult.success ? (
                      <CheckCircleIcon className="w-6 h-6 text-green-600" />
                    ) : (
                      <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                    )}
                    <div>
                      <h3 className={`font-semibold ${
                        testResult.success ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {testResult.success ? 'Connection Successful!' : 'Connection Failed'}
                      </h3>
                      <p className={`text-sm ${
                        testResult.success ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {testResult.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {testResult?.success && (
                <div className="card p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <DatabaseIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Ready to Save Your Data!
                      </h3>
                      <p className="text-soft mb-4">
                        Your database connection is working. Click "Save Configuration" to start syncing your data.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <CheckCircleIcon className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Your streams will be backed up automatically</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircleIcon className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Access your data from any device</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircleIcon className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Never lose your progress again</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStep(2)}
                  className="btn-secondary"
                >
                  Back
                </motion.button>
                {testResult?.success ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={saveConfiguration}
                    className="btn-primary"
                  >
                    Save Configuration
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={testConnection}
                    disabled={testing}
                    className="btn-primary"
                  >
                    {testing ? 'Testing...' : 'Try Again'}
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
