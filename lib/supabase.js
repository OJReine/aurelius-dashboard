import { createClient } from '@supabase/supabase-js'

// Get Supabase configuration from environment or user settings
const getSupabaseConfig = () => {
  // Only access localStorage on client side
  if (typeof window !== 'undefined') {
    // Check if user has configured their own Supabase
    const userConfig = localStorage.getItem('aurelius-supabase-config')
    if (userConfig) {
      try {
        return JSON.parse(userConfig)
      } catch (error) {
        console.error('Invalid Supabase configuration:', error)
        localStorage.removeItem('aurelius-supabase-config')
      }
    }
  }
  
  // Fallback to environment variables (for demo/development)
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  }
}

// Create Supabase client
const createSupabaseClient = () => {
  const config = getSupabaseConfig()
  
  if (!config.url || !config.anonKey) {
    return null
  }
  
  return createClient(config.url, config.anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  })
}

export const supabase = createSupabaseClient()

// Database helper functions
export const dbHelpers = {
  // Check if Supabase is configured
  isConfigured: () => {
    const config = getSupabaseConfig()
    return !!(config.url && config.anonKey)
  },

  // Save Supabase configuration
  saveConfig: (url, anonKey) => {
    if (typeof window === 'undefined') return
    const config = { url, anonKey }
    localStorage.setItem('aurelius-supabase-config', JSON.stringify(config))
    // Reload the page to reinitialize Supabase client
    window.location.reload()
  },

  // Clear Supabase configuration
  clearConfig: () => {
    if (typeof window === 'undefined') return
    localStorage.removeItem('aurelius-supabase-config')
    window.location.reload()
  },

  // Stream operations
  async getStreams(userId) {
    if (!supabase) return []
    
    const { data, error } = await supabase
      .from('streams')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching streams:', error)
      return []
    }
    return data || []
  },

  async createStream(streamData) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('streams')
      .insert(streamData)
      .select()
    
    if (error) throw error
    return data
  },

  async updateStream(id, updates) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { data, error } = await supabase
      .from('streams')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data
  },

  async deleteStream(id) {
    if (!supabase) throw new Error('Supabase not configured')
    
    const { error } = await supabase
      .from('streams')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  },

  // Sync local data to database
  async syncLocalData(userId, localStreams) {
    if (!supabase) return
    
    try {
      // Get existing streams from database
      const dbStreams = await this.getStreams(userId)
      const dbStreamIds = new Set(dbStreams.map(s => s.id))
      
      // Upload new local streams
      for (const stream of localStreams) {
        if (!dbStreamIds.has(stream.id)) {
          await this.createStream({
            ...stream,
            user_id: userId
          })
        }
      }
      
      console.log('Data synced successfully')
    } catch (error) {
      console.error('Error syncing data:', error)
    }
  }
}
