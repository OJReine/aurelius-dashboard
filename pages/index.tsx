import type { NextPage } from 'next'
import Head from 'next/head'
import { useState, useEffect } from 'react'
import { 
  ChartBarIcon, 
  CalendarIcon, 
  DocumentTextIcon, 
  StarIcon,
  CogIcon,
  UserIcon,
  PlusIcon,
  CheckIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import StreamForm from '../components/StreamForm'
import DatabaseSetup from '../components/DatabaseSetup'
import AccountManager from '../components/AccountManager'
import { supabase, dbHelpers } from '../lib/supabase'

interface Stream {
  id: number
  item_name: string
  creator_name: string
  creator_id?: string
  agency_name?: string
  due_date: string
  status: 'active' | 'completed' | 'overdue'
  priority: 'low' | 'medium' | 'high'
  stream_type?: 'showcase' | 'sponsored' | 'open'
  notes?: string
  created_at: string
  completed_at?: string
}

interface DashboardStats {
  activeStreams: number
  completedStreams: number
  overdueStreams: number
  thisWeekStreams: number
}

const Home: NextPage = () => {
  const [streams, setStreams] = useState<Stream[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    activeStreams: 0,
    completedStreams: 0,
    overdueStreams: 0,
    thisWeekStreams: 0
  })
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showStreamForm, setShowStreamForm] = useState(false)
  const [editingStream, setEditingStream] = useState<Stream | null>(null)
  const [showDatabaseSetup, setShowDatabaseSetup] = useState(false)
  const [showAccountManager, setShowAccountManager] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isConfigured, setIsConfigured] = useState(false)

  useEffect(() => {
    // Load streams from localStorage on component mount
    loadStreams()
    
    // Check if database is configured
    setIsConfigured(dbHelpers.isConfigured())
    
    // Check for auth success/error messages
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('auth') === 'success') {
      toast.success('Successfully signed in!')
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (urlParams.get('error') === 'auth_failed') {
      toast.error('Authentication failed. Please try again.')
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
    
    // Set up auth listener if Supabase is configured
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setUser(session?.user ?? null)
          if (session?.user) {
            // Load streams from database
            try {
              const dbStreams = await dbHelpers.getStreams(session.user.id)
              if (dbStreams.length > 0) {
                setStreams(dbStreams)
                calculateStats(dbStreams)
              }
            } catch (error) {
              console.error('Error loading streams from database:', error)
            }
          }
        }
      )
      
      return () => subscription.unsubscribe()
    }
  }, [])

  const loadStreams = () => {
    try {
      const savedStreams = localStorage.getItem('aurelius-streams')
      if (savedStreams) {
        const parsedStreams = JSON.parse(savedStreams)
        setStreams(parsedStreams)
        calculateStats(parsedStreams)
      }
    } catch (error) {
      console.error('Error loading streams:', error)
      toast.error('Failed to load streams')
    }
  }

  const saveStreams = (newStreams: Stream[]) => {
    try {
      localStorage.setItem('aurelius-streams', JSON.stringify(newStreams))
      setStreams(newStreams)
      calculateStats(newStreams)
    } catch (error) {
      console.error('Error saving streams:', error)
      toast.error('Failed to save streams')
    }
  }


  const calculateStats = (streamData: Stream[]) => {
    const now = new Date()
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
    
    const activeStreams = streamData.filter(s => s.status === 'active').length
    const completedStreams = streamData.filter(s => s.status === 'completed').length
    const overdueStreams = streamData.filter(s => s.status === 'overdue').length
    const thisWeekStreams = streamData.filter(s => 
      new Date(s.created_at) >= weekStart
    ).length

    setStats({
      activeStreams,
      completedStreams,
      overdueStreams,
      thisWeekStreams
    })
  }

  const completeStream = (streamId: number) => {
    const updatedStreams = streams.map(stream => 
      stream.id === streamId 
        ? { ...stream, status: 'completed' as const, completed_at: new Date().toISOString() }
        : stream
    )
    saveStreams(updatedStreams)
    toast.success('Stream completed successfully! ✨')
  }

  const createStream = async (streamData: any) => {
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + streamData.due_days)

    const newStream: Stream = {
      id: Date.now(), // Simple ID generation
      item_name: streamData.item_name,
      creator_name: streamData.creator_name,
      creator_id: streamData.creator_id,
      agency_name: streamData.agency_name,
      due_date: dueDate.toISOString(),
      priority: streamData.priority,
      stream_type: streamData.stream_type,
      notes: streamData.notes,
      status: 'active' as const,
      created_at: new Date().toISOString()
    }

    // Save to local storage
    const updatedStreams = [...streams, newStream]
    saveStreams(updatedStreams)

    // Save to database if user is signed in
    if (user && supabase) {
      try {
        await dbHelpers.createStream({
          ...newStream,
          user_id: user.id
        })
      } catch (error) {
        console.error('Error saving to database:', error)
        toast.error('Saved locally, but failed to sync to cloud')
        return
      }
    }

    toast.success('Stream created successfully! ✨')
  }

  const updateStream = async (streamData: any) => {
    const updatedStreams = streams.map(stream => 
      stream.id === editingStream?.id 
        ? { ...stream, ...streamData }
        : stream
    )
    saveStreams(updatedStreams)

    // Update in database if user is signed in
    if (user && supabase && editingStream) {
      try {
        await dbHelpers.updateStream(editingStream.id, streamData)
      } catch (error) {
        console.error('Error updating in database:', error)
        toast.error('Updated locally, but failed to sync to cloud')
      }
    }

    setEditingStream(null)
    toast.success('Stream updated successfully! ✨')
  }

  const deleteStream = async (streamId: number) => {
    const updatedStreams = streams.filter(stream => stream.id !== streamId)
    saveStreams(updatedStreams)

    // Delete from database if user is signed in
    if (user && supabase) {
      try {
        await dbHelpers.deleteStream(streamId)
      } catch (error) {
        console.error('Error deleting from database:', error)
        toast.error('Deleted locally, but failed to sync to cloud')
      }
    }

    toast.success('Stream deleted successfully! ✨')
  }

  const handleEditStream = (stream: Stream) => {
    setEditingStream(stream)
    setShowStreamForm(true)
  }

  const handleCloseForm = () => {
    setShowStreamForm(false)
    setEditingStream(null)
  }

  const handleDatabaseSetupSuccess = () => {
    setIsConfigured(true)
    toast.success('Database configured successfully!')
  }

  const handleSync = () => {
    loadStreams()
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-blue-600 bg-blue-100'
      case 'completed': return 'text-green-600 bg-green-100'
      case 'overdue': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate)
    const now = new Date()
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }


  return (
    <div className="min-h-screen bg-aurora relative">
      <Head>
        <title>Aurelius Dashboard - IMVU Modeling Assistant</title>
        <meta name="description" content="Manage your IMVU modeling streams with Aurelius" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-200/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-accent-200/5 rounded-full blur-3xl animate-pulse-soft"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-md shadow-soft border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center"
            >
              <div className="text-3xl mr-4 animate-float">◆</div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">Aurelius</h1>
                <p className="text-sm text-soft">IMVU Modeling Assistant</p>
              </div>
            </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-4"
              >
                <div className="text-sm text-soft">
                  {user ? `Welcome, ${user.email}` : 'Welcome to Aurelius Dashboard'}
                </div>
                <div className="flex items-center space-x-2">
                  {!isConfigured && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowDatabaseSetup(true)}
                      className="btn-ghost text-blue-600 hover:text-blue-800"
                    >
                      Set Up Database
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAccountManager(true)}
                    className="btn-ghost"
                  >
                    Account
                  </motion.button>
                  <a
                    href="/discord"
                    className="btn-ghost"
                  >
                    Discord Bot
                  </a>
                </div>
              </motion.div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="relative z-10 bg-white/60 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-2 py-2">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: ChartBarIcon },
              { id: 'streams', name: 'Streams', icon: DocumentTextIcon },
              { id: 'schedule', name: 'Schedule', icon: CalendarIcon },
              { id: 'reviews', name: 'Reviews', icon: StarIcon },
              { id: 'profile', name: 'Profile', icon: UserIcon },
              { id: 'settings', name: 'Settings', icon: CogIcon },
            ].map((tab, index) => (
              <motion.button
                key={tab.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setActiveTab(tab.id)}
                className={activeTab === tab.id ? 'nav-link-active' : 'nav-link-inactive'}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.name}
              </motion.button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-soft-lg">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Active Streams', value: stats.activeStreams, color: 'primary', icon: ClockIcon },
                { label: 'Completed', value: stats.completedStreams, color: 'success', icon: CheckIcon },
                { label: 'Overdue', value: stats.overdueStreams, color: 'error', icon: ClockIcon },
                { label: 'This Week', value: stats.thisWeekStreams, color: 'secondary', icon: CalendarIcon },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card-hover p-6"
                >
                  <div className="flex items-center">
                    <div className={`p-4 rounded-2xl bg-${stat.color}-100/80 border border-${stat.color}-200/50`}>
                      <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-soft">{stat.label}</p>
                      <p className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Recent Streams */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card"
            >
              <div className="px-6 py-5 border-b border-soft-200">
                <h2 className="text-lg font-medium text-gray-900">Recent Streams</h2>
              </div>
              <div className="divide-y divide-soft-200">
                {loading ? (
                  <div className="p-8 text-center text-soft">
                    <div className="loading-shimmer h-4 w-32 mx-auto mb-2"></div>
                    <div className="loading-shimmer h-3 w-24 mx-auto"></div>
                  </div>
                ) : streams.length === 0 ? (
                  <div className="p-8 text-center text-soft">
                    <div className="text-4xl mb-4">◇</div>
                    <p className="text-lg font-medium mb-2">No streams found</p>
                    <p className="text-sm">Create your first stream to get started!</p>
                  </div>
                ) : (
                  streams.slice(0, 5).map((stream, index) => (
                    <motion.div 
                      key={stream.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-6 hover:bg-soft-50/50 transition-colors duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-sm font-medium text-gray-900">{stream.item_name}</h3>
                            <span className={`badge badge-${stream.priority === 'high' ? 'error' : stream.priority === 'medium' ? 'warning' : 'success'}`}>
                              {stream.priority}
                            </span>
                            <span className={`badge badge-${stream.status === 'active' ? 'primary' : stream.status === 'completed' ? 'success' : 'error'}`}>
                              {stream.status}
                            </span>
                          </div>
                          <p className="text-sm text-soft mb-1">
                            Creator: {stream.creator_name} • Agency: {stream.agency_name || 'N/A'}
                          </p>
                          <p className="text-sm text-soft">
                            Due: {formatDate(stream.due_date)} ({getDaysUntilDue(stream.due_date)} days)
                          </p>
                        </div>
                          <div className="flex space-x-2">
                            {stream.status === 'active' && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => completeStream(stream.id)}
                                className="btn-primary"
                              >
                                <CheckIcon className="w-4 h-4 mr-1" />
                                Complete
                              </motion.button>
                            )}
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleEditStream(stream)}
                              className="btn-secondary"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => deleteStream(stream.id)}
                              className="btn-secondary text-red-600 hover:text-red-800"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </motion.button>
                          </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === 'streams' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-soft-lg"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gradient">All Streams</h2>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowStreamForm(true)}
                className="btn-primary"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                New Stream
              </motion.button>
            </div>
            
            <div className="card">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-soft-200">
                  <thead className="bg-soft-50/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-soft uppercase tracking-wider">Item</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-soft uppercase tracking-wider">Creator</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-soft uppercase tracking-wider">Agency</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-soft uppercase tracking-wider">Due Date</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-soft uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-soft uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-soft uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/50 divide-y divide-soft-200">
                    {streams.map((stream, index) => (
                      <motion.tr 
                        key={stream.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-soft-50/50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {stream.item_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-soft">
                          {stream.creator_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-soft">
                          {stream.agency_name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-soft">
                          {formatDate(stream.due_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`badge badge-${stream.status === 'active' ? 'primary' : stream.status === 'completed' ? 'success' : 'error'}`}>
                            {stream.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`badge badge-${stream.priority === 'high' ? 'error' : stream.priority === 'medium' ? 'warning' : 'success'}`}>
                            {stream.priority}
                          </span>
                        </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              {stream.status === 'active' && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => completeStream(stream.id)}
                                  className="text-green-600 hover:text-green-800 transition-colors duration-200"
                                >
                                  Complete
                                </motion.button>
                              )}
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleEditStream(stream)}
                                className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                              >
                                Edit
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => deleteStream(stream.id)}
                                className="text-red-600 hover:text-red-800 transition-colors duration-200"
                              >
                                Delete
                              </motion.button>
                            </div>
                          </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Placeholder tabs */}
        {['schedule', 'reviews', 'profile', 'settings'].includes(activeTab) && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-12 text-center"
          >
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-6xl mb-6 animate-float"
            >
              ✦
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-semibold text-gradient mb-4"
            >
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Coming Soon
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-soft text-lg"
            >
              This feature is currently under development. Check back soon!
            </motion.p>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8"
            >
              <p className="text-sm text-soft-lg italic">
                ❧ "Patience is the companion of wisdom." ❧
              </p>
            </motion.div>
          </motion.div>
        )}
      </main>

      {/* Stream Form Modal */}
      <StreamForm
        isOpen={showStreamForm}
        onClose={handleCloseForm}
        onSubmit={editingStream ? updateStream : createStream}
        initialData={editingStream}
      />

      {/* Database Setup Modal */}
      <DatabaseSetup
        isOpen={showDatabaseSetup}
        onClose={() => setShowDatabaseSetup(false)}
        onSuccess={handleDatabaseSetupSuccess}
      />

      {/* Account Manager Modal */}
      <AccountManager
        isOpen={showAccountManager}
        onClose={() => setShowAccountManager(false)}
        onSync={handleSync}
      />

      <Toaster />
    </div>
  )
}

export default Home
