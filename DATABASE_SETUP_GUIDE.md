# Database Setup Guide for Aurelius Dashboard

This guide will help you set up your own free database to keep your IMVU modeling data safe and accessible across devices.

## 🎯 Why Set Up a Database?

- **Data Safety**: Never lose your streams, schedules, or progress
- **Cross-Device Access**: Access your data from any device
- **Automatic Backups**: Your data is automatically backed up
- **Privacy**: Your data is stored in your own database
- **Control**: You own and control all your data

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with Google, GitHub, or email
4. Verify your email if required

### Step 2: Create New Project

1. Click "New Project"
2. Choose your organization (or create one)
3. Enter project details:
   - **Name**: `Aurelius-IMVU-Data` (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your location
4. Click "Create new project"
5. Wait 2-3 minutes for setup to complete

### Step 3: Get Connection Details

1. In your project dashboard, go to **Settings** → **API**
2. Copy the **Project URL** (looks like: `https://your-project.supabase.co`)
3. Copy the **anon public** key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### Step 4: Configure Aurelius Dashboard

1. Open your Aurelius dashboard
2. Click "Set Up Database" in the header
3. Paste your Project URL and API key
4. Click "Test Connection"
5. Click "Save Configuration"

### Step 5: Sign In (Optional)

1. Click "Account" in the header
2. Click "Sign In" to create an account
3. Use Google, GitHub, or email
4. Your data will now sync automatically!

## 📊 What You Get

### Free Tier Includes:
- **500MB** database storage
- **2GB** bandwidth per month
- **50,000** monthly active users
- **Automatic backups**
- **Real-time updates**

### For Most Users:
- 500MB can store **thousands** of streams
- 2GB bandwidth is plenty for normal use
- Free tier is sufficient for personal use

## 🔧 Advanced Configuration

### Custom Database Schema

If you want to customize your database, you can run this SQL in the Supabase SQL Editor:

```sql
-- Create streams table
CREATE TABLE IF NOT EXISTS streams (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  item_name TEXT NOT NULL,
  creator_name TEXT NOT NULL,
  creator_id VARCHAR(255),
  agency_name TEXT,
  due_date TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  notes TEXT,
  priority VARCHAR(10) DEFAULT 'medium',
  stream_type VARCHAR(20) DEFAULT 'showcase'
);

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) PRIMARY KEY,
  imvu_name TEXT,
  instagram_handle TEXT,
  preferred_agencies JSON,
  caption_style VARCHAR(20) DEFAULT 'elegant',
  timezone VARCHAR(50) DEFAULT 'UTC',
  reminder_settings JSON,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own streams" ON streams
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own streams" ON streams
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own streams" ON streams
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own streams" ON streams
  FOR DELETE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid()::text = user_id);
```

### Environment Variables

For developers who want to deploy their own version:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## 🛠️ Troubleshooting

### Common Issues

**"Connection Failed" Error:**
- Double-check your Project URL and API key
- Make sure your project is fully set up (wait 2-3 minutes)
- Try copying the values again

**"Authentication Failed" Error:**
- Make sure you're using the "anon public" key, not the "service_role" key
- Check that Row Level Security is enabled
- Verify your database policies

**"Permission Denied" Error:**
- Make sure you're signed in to your account
- Check that your user ID matches the database records
- Verify your RLS policies

### Getting Help

1. **Check Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
2. **Join Supabase Discord**: [discord.supabase.com](https://discord.supabase.com)
3. **Create GitHub Issue**: For Aurelius-specific problems

## 🔒 Security & Privacy

### Your Data is Safe
- **Encrypted**: All data is encrypted in transit and at rest
- **Private**: Only you can access your data
- **Backed Up**: Automatic daily backups
- **Compliant**: GDPR and SOC 2 compliant

### What We Don't See
- Your database credentials
- Your personal data
- Your usage patterns
- Any information about your streams

### What You Control
- Your database
- Your data
- Your privacy settings
- Your backup schedule

## 💡 Tips & Best Practices

### Data Management
- **Regular Backups**: Supabase handles this automatically
- **Monitor Usage**: Check your usage in the Supabase dashboard
- **Clean Up**: Delete old completed streams to save space

### Performance
- **Indexes**: Supabase automatically creates indexes for common queries
- **Caching**: Data is cached for fast access
- **CDN**: Global CDN for fast worldwide access

### Cost Optimization
- **Free Tier**: Most users never exceed the free tier limits
- **Monitoring**: Set up usage alerts in Supabase
- **Optimization**: Use efficient queries and data structures

## 🎉 You're All Set!

Once you've completed the setup:

1. ✅ Your data is safely stored in the cloud
2. ✅ You can access it from any device
3. ✅ Your progress is automatically backed up
4. ✅ You have full control over your data

**Welcome to the future of IMVU modeling management!** ✨

---

*Need help? Check the [Aurelius Discord](https://discord.gg/aurelius) or create an issue on GitHub.*
