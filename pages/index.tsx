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
  EyeIcon,
  CloudIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import StreamForm from '../components/StreamForm'
import DatabaseSetup from '../components/DatabaseSetup'
import AccountManager from '../components/AccountManager'
import AgencyTemplates from '../components/AgencyTemplates'
import CaptionGenerator from '../components/CaptionGenerator'
import { supabase, dbHelpers } from '../lib/supabase'

interface Stream {
  id: number
  agency_name?: string
  due_date: string
  status: 'active' | 'completed' | 'overdue'
  priority: 'low' | 'medium' | 'high'
  stream_type?: 'showcase' | 'sponsored' | 'open'
  notes?: string
  created_at: string
  completed_at?: string
  items: StreamItem[]
}

interface StreamItem {
  id: number
  item_name: string
  creator_name: string
  creator_id?: string
  product_url?: string
  product_id?: string
  notes?: string
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
  const [showAgencyTemplates, setShowAgencyTemplates] = useState(false)
  const [showCaptionGenerator, setShowCaptionGenerator] = useState(false)
  const [selectedStreamForCaptions, setSelectedStreamForCaptions] = useState<Stream | null>(null)
  const [user, setUser] = useState<any>(null)
  const [isConfigured, setIsConfigured] = useState(false)
  const [agencies, setAgencies] = useState([])

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

        // Load streams from localStorage on component mount
        loadStreams()
        
        // Load agencies from localStorage
        loadAgencies()
        
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
    if (typeof window === 'undefined') return
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

  const loadAgencies = () => {
    if (typeof window === 'undefined') return
    try {
      const savedAgencies = localStorage.getItem('aurelius-agencies')
      if (savedAgencies) {
        setAgencies(JSON.parse(savedAgencies))
      }
    } catch (error) {
      console.error('Error loading agencies:', error)
    }
  }

  const saveStreams = (newStreams: Stream[]) => {
    if (typeof window === 'undefined') return
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
      agency_name: streamData.agency_name,
      due_date: dueDate.toISOString(),
      priority: streamData.priority,
      stream_type: streamData.stream_type,
      notes: streamData.notes,
      status: 'active' as const,
      created_at: new Date().toISOString(),
      items: streamData.items || []
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

  const handleCaptionGeneration = (stream: Stream) => {
    setSelectedStreamForCaptions(stream)
    setShowCaptionGenerator(true)
  }

  const handleAgencyTemplatesSave = (savedAgencies: any[]) => {
    setAgencies(savedAgencies)
    toast.success('Agency templates saved! ✨')
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
    <div className="min-h-screen bg-star-pattern relative">
      <Head>
        <title>Aurelius Dashboard - IMVU Modeling Assistant</title>
        <meta name="description" content="Manage your IMVU modeling streams with Aurelius" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-mocha-200/5 rounded-full blur-2xl animate-float"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent-200/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-32 h-32 bg-primary-200/3 rounded-full blur-2xl animate-pulse-soft"></div>
        <div className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-mocha-100/4 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
        {/* Abstract star patterns */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-mocha-400/20 rounded-full animate-pulse-soft"></div>
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-accent-400/30 rounded-full animate-float" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-primary-400/25 rounded-full animate-pulse-soft" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/6 right-1/6 w-1 h-1 bg-mocha-500/20 rounded-full animate-float" style={{ animationDelay: '2.5s' }}></div>
        <div className="absolute bottom-1/3 left-1/6 w-2 h-2 bg-accent-300/15 rounded-full animate-pulse-soft" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/90 backdrop-blur-md shadow-soft border-b border-white/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center"
            >
              <div className="text-2xl mr-3 animate-float text-primary-600">◆</div>
              <div>
                <h1 className="text-xl font-bold text-gradient">Aurelius</h1>
                <p className="text-xs text-soft">IMVU Modeling Assistant</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="text-xs text-soft hidden sm:block">
                {user ? `Welcome, ${user.email}` : 'Welcome to Aurelius Dashboard'}
              </div>
              <div className="flex items-center space-x-2">
                {!isConfigured && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDatabaseSetup(true)}
                    className="btn-ghost text-xs px-3 py-1 text-blue-600 hover:text-blue-800"
                  >
                    Set Up Database
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAccountManager(true)}
                  className="btn-ghost text-xs px-3 py-1"
                >
                  Account
                </motion.button>
                <a
                  href="/discord"
                  className="btn-ghost text-xs px-3 py-1"
                >
                  Discord Bot
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="relative z-10 bg-white/70 backdrop-blur-sm border-b border-white/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 py-3">
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
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === tab.id 
                    ? 'bg-primary-100/80 text-primary-700 border border-primary-200/50 shadow-soft' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">{tab.name}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <h2 className="text-3xl font-bold text-gradient mb-2">Welcome to Aurelius</h2>
              <p className="text-soft text-lg">Your elegant IMVU modeling assistant</p>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  className="card-hover p-4"
                >
                  <div className="flex items-center">
                    <div className={`p-3 rounded-xl bg-${stat.color}-100/80 border border-${stat.color}-200/50`}>
                      <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                    </div>
                    <div className="ml-3">
                      <p className="text-xs font-medium text-soft">{stat.label}</p>
                      <p className={`text-xl font-bold text-${stat.color}-600`}>{stat.value}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowStreamForm(true)}
                  className="btn-primary flex items-center justify-center p-4"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Create New Stream
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab('streams')}
                  className="btn-secondary flex items-center justify-center p-4"
                >
                  <DocumentTextIcon className="w-5 h-5 mr-2" />
                  View All Streams
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAccountManager(true)}
                  className="btn-secondary flex items-center justify-center p-4"
                >
                  <UserIcon className="w-5 h-5 mr-2" />
                  Manage Account
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAgencyTemplates(true)}
                  className="btn-secondary flex items-center justify-center p-4"
                >
                  <DocumentTextIcon className="w-5 h-5 mr-2" />
                  Agency Templates
                </motion.button>
              </div>
            </motion.div>

            {/* Recent Streams */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="card"
            >
              <div className="px-6 py-4 border-b border-soft-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Recent Streams</h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('streams')}
                    className="text-sm text-primary-600 hover:text-primary-800"
                  >
                    View All →
                  </motion.button>
                </div>
              </div>
              <div className="divide-y divide-soft-200">
                {loading ? (
                  <div className="p-6 text-center text-soft">
                    <div className="loading-shimmer h-4 w-32 mx-auto mb-2"></div>
                    <div className="loading-shimmer h-3 w-24 mx-auto"></div>
                  </div>
                ) : streams.length === 0 ? (
                  <div className="p-8 text-center text-soft">
                    <div className="text-3xl mb-3 text-primary-400">◇</div>
                    <p className="text-lg font-medium mb-2">No streams found</p>
                    <p className="text-sm mb-4">Create your first stream to get started!</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowStreamForm(true)}
                      className="btn-primary"
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Create Stream
                    </motion.button>
                  </div>
                ) : (
                  streams.slice(0, 3).map((stream, index) => (
                    <motion.div 
                      key={stream.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 hover:bg-soft-50/50 transition-colors duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-sm font-medium text-gray-900">
                              {stream.items?.length > 0 ? stream.items[0].item_name : 'Untitled Stream'}
                            </h3>
                            <span className={`badge badge-${stream.priority === 'high' ? 'error' : stream.priority === 'medium' ? 'warning' : 'success'}`}>
                              {stream.priority}
                            </span>
                            <span className={`badge badge-${stream.status === 'active' ? 'primary' : stream.status === 'completed' ? 'success' : 'error'}`}>
                              {stream.status}
                            </span>
                          </div>
                          <p className="text-xs text-soft mb-1">
                            Creator: {stream.items?.length > 0 ? stream.items[0].creator_name : 'N/A'} • Agency: {stream.agency_name || 'N/A'}
                          </p>
                          <p className="text-xs text-soft">
                            Due: {formatDate(stream.due_date)} ({getDaysUntilDue(stream.due_date)} days)
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          {stream.status === 'active' && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => completeStream(stream.id)}
                              className="btn-primary text-xs px-2 py-1"
                            >
                              <CheckIcon className="w-3 h-3 mr-1" />
                              Complete
                            </motion.button>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleEditStream(stream)}
                            className="btn-secondary text-xs px-2 py-1"
                          >
                            <PencilIcon className="w-3 h-3" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleCaptionGeneration(stream)}
                            className="btn-secondary text-xs px-2 py-1"
                          >
                            <DocumentTextIcon className="w-3 h-3" />
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
            className="space-y-6"
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
                          {stream.items?.length > 0 ? stream.items[0].item_name : 'Untitled Stream'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-soft">
                          {stream.items?.length > 0 ? stream.items[0].creator_name : 'N/A'}
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

        {activeTab === 'schedule' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gradient">Weekly Schedule</h2>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowStreamForm(true)}
                className="btn-primary"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add to Schedule
              </motion.button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                <motion.div
                  key={day}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card p-4"
                >
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 text-center">{day}</h3>
                  <div className="space-y-2">
                    {streams
                      .filter(stream => {
                        const streamDate = new Date(stream.due_date)
                        const dayOfWeek = streamDate.getDay()
                        const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Convert Sunday=0 to Sunday=6
                        return adjustedDay === index
                      })
                      .map(stream => (
                        <div key={stream.id} className="p-2 bg-soft-50 rounded-lg">
                          <p className="text-xs font-medium text-gray-900 truncate">{stream.items?.length > 0 ? stream.items[0].item_name : 'Untitled Stream'}</p>
                          <p className="text-xs text-soft">{stream.items?.length > 0 ? stream.items[0].creator_name : 'N/A'}</p>
                        </div>
                      ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'reviews' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gradient">Item Reviews</h2>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                New Review
              </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {streams
                .filter(stream => stream.status === 'completed')
                .map((stream, index) => (
                  <motion.div
                    key={stream.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="card p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{stream.items?.length > 0 ? stream.items[0].item_name : 'Untitled Stream'}</h3>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIcon key={star} className="w-4 h-4 text-accent-400 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-soft mb-2">by {stream.items?.length > 0 ? stream.items[0].creator_name : 'Unknown Creator'}</p>
                    <p className="text-sm text-gray-700 mb-4">
                      "This item exceeded my expectations! The quality is outstanding and the design is perfect for my style."
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-soft">Completed {formatDate(stream.completed_at || stream.due_date)}</span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn-ghost text-xs"
                      >
                        Edit Review
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
            </div>

            {streams.filter(stream => stream.status === 'completed').length === 0 && (
              <div className="card p-8 text-center">
                <div className="text-4xl mb-4 text-accent-400">✦</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
                <p className="text-soft mb-4">Complete some streams to start writing reviews!</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab('streams')}
                  className="btn-primary"
                >
                  View Streams
                </motion.button>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'profile' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gradient">Profile Settings</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="label-soft">IMVU Name</label>
                    <input type="text" className="input-field" placeholder="Your IMVU username" />
                  </div>
                  <div>
                    <label className="label-soft">Instagram Handle</label>
                    <input type="text" className="input-field" placeholder="@your_instagram" />
                  </div>
                  <div>
                    <label className="label-soft">Preferred Agencies</label>
                    <input type="text" className="input-field" placeholder="Agency names (comma separated)" />
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
                <div className="space-y-4">
                  <div>
                    <label className="label-soft">Caption Style</label>
                    <select className="input-field">
                      <option value="elegant">Elegant</option>
                      <option value="casual">Casual</option>
                      <option value="professional">Professional</option>
                      <option value="creative">Creative</option>
                    </select>
                  </div>
                  <div>
                    <label className="label-soft">Timezone</label>
                    <select className="input-field">
                      <option value="UTC">UTC</option>
                      <option value="EST">Eastern Time</option>
                      <option value="PST">Pacific Time</option>
                      <option value="GMT">Greenwich Mean Time</option>
                    </select>
                  </div>
                  <div>
                    <label className="label-soft">Default Stream Type</label>
                    <select className="input-field">
                      <option value="showcase">Showcase</option>
                      <option value="sponsored">Sponsored</option>
                      <option value="open">Open</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">{stats.activeStreams}</div>
                  <div className="text-sm text-soft">Active Streams</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success-600">{stats.completedStreams}</div>
                  <div className="text-sm text-soft">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-error-600">{stats.overdueStreams}</div>
                  <div className="text-sm text-soft">Overdue</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary-600">{stats.thisWeekStreams}</div>
                  <div className="text-sm text-soft">This Week</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gradient">Settings</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Stream Reminders</div>
                      <div className="text-sm text-soft">Get notified about upcoming streams</div>
                    </div>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Overdue Alerts</div>
                      <div className="text-sm text-soft">Alert when streams are overdue</div>
                    </div>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Weekly Summary</div>
                      <div className="text-sm text-soft">Receive weekly progress reports</div>
                    </div>
                    <input type="checkbox" className="rounded" />
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>
                <div className="space-y-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDatabaseSetup(true)}
                    className="btn-secondary w-full"
                  >
                    <CloudIcon className="w-4 h-4 mr-2" />
                    Configure Database
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAccountManager(true)}
                    className="btn-secondary w-full"
                  >
                    <UserIcon className="w-4 h-4 mr-2" />
                    Account Settings
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-secondary w-full text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Clear All Data
                  </motion.button>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About Aurelius</h3>
              <div className="space-y-2 text-soft">
                <p>Version: 1.0.0</p>
                <p>Built with Next.js, React, and Tailwind CSS</p>
                <p>Database: {isConfigured ? 'Supabase (Cloud)' : 'Local Storage'}</p>
                <p>AI Features: {process.env.NEXT_PUBLIC_GEMINI_API_KEY ? 'Enabled' : 'Disabled'}</p>
              </div>
            </div>
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

      {/* Agency Templates Modal */}
      <AgencyTemplates
        isOpen={showAgencyTemplates}
        onClose={() => setShowAgencyTemplates(false)}
        onSave={handleAgencyTemplatesSave}
      />

      {/* Caption Generator Modal */}
      <CaptionGenerator
        isOpen={showCaptionGenerator}
        onClose={() => {
          setShowCaptionGenerator(false)
          setSelectedStreamForCaptions(null)
        }}
        streamData={selectedStreamForCaptions}
        agencies={agencies}
      />

      <Toaster />
    </div>
  )
}

export default Home
