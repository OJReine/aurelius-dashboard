import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  UserIcon, 
  CloudIcon, 
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CogIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { supabase, dbHelpers } from '../lib/supabase'

export default function AccountManager({ isOpen, onClose, onSync }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [localStreams, setLocalStreams] = useState([])

  useEffect(() => {
    if (isOpen) {
      // Get local streams
      const savedStreams = localStorage.getItem('aurelius-streams')
      if (savedStreams) {
        setLocalStreams(JSON.parse(savedStreams))
      }

      // Get current user
      if (supabase) {
        supabase.auth.getUser().then(({ data: { user } }) => {
          setUser(user)
        })
      }
    }
  }, [isOpen])

  const signIn = async () => {
    if (!supabase) {
      toast.error('Database not configured. Please set up your database first.')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) throw error
    } catch (error) {
      console.error('Sign in error:', error)
      toast.error('Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    if (!supabase) return

    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setUser(null)
      toast.success('Signed out successfully')
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Failed to sign out')
    } finally {
      setLoading(false)
    }
  }

  const syncData = async () => {
    if (!user || !supabase) return

    setSyncing(true)
    try {
      // Upload local streams to database
      if (localStreams.length > 0) {
        await dbHelpers.syncLocalData(user.id, localStreams)
        toast.success('Data synced successfully!')
      }

      // Download streams from database
      const dbStreams = await dbHelpers.getStreams(user.id)
      if (dbStreams.length > 0) {
        localStorage.setItem('aurelius-streams', JSON.stringify(dbStreams))
        toast.success('Data downloaded successfully!')
      }

      onSync?.()
    } catch (error) {
      console.error('Sync error:', error)
      toast.error('Failed to sync data')
    } finally {
      setSyncing(false)
    }
  }

  const clearLocalData = () => {
    if (confirm('Are you sure you want to clear all local data? This cannot be undone.')) {
      localStorage.removeItem('aurelius-streams')
      setLocalStreams([])
      toast.success('Local data cleared')
    }
  }

  const isConfigured = dbHelpers.isConfigured()

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
          <div>
            <h2 className="text-2xl font-bold text-gradient">
              Account & Data Management
            </h2>
            <p className="text-soft mt-1">
              Manage your account and sync your data
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn-ghost p-2"
          >
            <CogIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Database Status */}
          <div className="card p-6">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl ${
                isConfigured ? 'bg-green-100' : 'bg-yellow-100'
              }`}>
                <CloudIcon className={`w-6 h-6 ${
                  isConfigured ? 'text-green-600' : 'text-yellow-600'
                }`} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  Database Status
                </h3>
                <p className="text-soft">
                  {isConfigured 
                    ? 'Your database is configured and ready' 
                    : 'No database configured - data is stored locally only'
                  }
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                isConfigured 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {isConfigured ? 'Connected' : 'Local Only'}
              </div>
            </div>
          </div>

          {/* User Status */}
          {isConfigured && (
            <div className="card p-6">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl ${
                  user ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <UserIcon className={`w-6 h-6 ${
                    user ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Account Status
                  </h3>
                  <p className="text-soft">
                    {user 
                      ? `Signed in as ${user.email}` 
                      : 'Not signed in - data is stored locally only'
                    }
                  </p>
                </div>
                <div className="flex space-x-2">
                  {user ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={signOut}
                      disabled={loading}
                      className="btn-secondary"
                    >
                      {loading ? 'Signing out...' : 'Sign Out'}
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={signIn}
                      disabled={loading}
                      className="btn-primary"
                    >
                      {loading ? 'Signing in...' : 'Sign In'}
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Data Sync */}
          {isConfigured && user && (
            <div className="card p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <ArrowPathIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Data Synchronization
                  </h3>
                  <p className="text-soft">
                    Sync your local data with the cloud database
                  </p>
                  <div className="mt-2 text-sm text-soft">
                    Local streams: {localStreams.length}
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={syncData}
                  disabled={syncing}
                  className="btn-primary"
                >
                  {syncing ? 'Syncing...' : 'Sync Data'}
                </motion.button>
              </div>
            </div>
          )}

          {/* Local Data Management */}
          <div className="card p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <TrashIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  Local Data
                </h3>
                <p className="text-soft">
                  Manage data stored in your browser
                </p>
                <div className="mt-2 text-sm text-soft">
                  {localStreams.length} streams stored locally
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearLocalData}
                className="btn-secondary text-red-600 hover:text-red-800"
              >
                Clear Local Data
              </motion.button>
            </div>
          </div>

          {/* Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start space-x-2">
              <CheckCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">How It Works:</h4>
                <ul className="text-sm text-blue-800 mt-2 space-y-1">
                  <li>• <strong>Local Storage:</strong> Data is saved in your browser</li>
                  <li>• <strong>Cloud Sync:</strong> Sign in to backup and sync across devices</li>
                  <li>• <strong>Privacy:</strong> Your data is stored in your own database</li>
                  <li>• <strong>Control:</strong> You own and control all your data</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="btn-secondary"
          >
            Close
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
