# Aurelius Web Dashboard

A beautiful, standalone web interface for managing IMVU modeling work. No Discord required - use this elegant dashboard to organize your modeling streams, schedules, and content creation.

## ✨ Features

- **Elegant Design**: Soft UI with glassmorphism effects and smooth animations
- **Flexible Storage**: Works offline with local storage or online with cloud sync
- **Stream Management**: Create, edit, and manage IMVU modeling streams
- **Optional Authentication**: Sign in to sync data across devices
- **User-Owned Database**: Set up your own free Supabase database
- **Responsive Design**: Works perfectly on desktop and mobile
- **Aurelius Aesthetic**: Beautiful design with the bot's elegant personality
- **Discord Integration**: Optional Discord bot invite page for users who prefer commands

## 🚀 Quick Start

### Prerequisites
- Node.js 18+

### Installation

1. **Clone and install**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/aurelius-dashboard.git
   cd aurelius-dashboard
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

3. **Open browser**:
   Navigate to `http://localhost:3000`

That's it! No database setup or authentication required.

## 🎨 Design System

### Color Palette
- **Primary**: #6B73FF (Soft blue)
- **Secondary**: #9B59B6 (Elegant purple)
- **Accent**: #ff9933 (Warm orange)
- **Soft Grays**: Custom soft gray scale

### Typography
- **Primary Font**: Inter (clean, modern)
- **Display Font**: Playfair Display (elegant, serif)

### Components
- **Soft Cards**: Translucent with backdrop blur
- **Gradient Buttons**: Smooth hover animations
- **Floating Elements**: Subtle background animations
- **Glass Effects**: Modern glassmorphism design

## 🛠️ Development

### Project Structure
```
web-dashboard/
├── components/          # React components
├── lib/                # Utilities and Supabase client
├── pages/              # Next.js pages
├── styles/             # Global styles and Tailwind config
└── public/             # Static assets
```

### Key Components
- `StreamForm.js` - Stream creation and editing modal
- `index.tsx` - Main dashboard page
- `discord.tsx` - Discord bot invite page

### Styling
- **Tailwind CSS** for utility-first styling
- **Custom CSS classes** for soft UI effects
- **Framer Motion** for smooth animations

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy!

See `DEPLOYMENT.md` for detailed instructions.

### Environment Variables
```env
NEXT_PUBLIC_APP_NAME=Aurelius
NEXT_PUBLIC_APP_DESCRIPTION=Your Personal IMVU Modeling Assistant
NEXT_PUBLIC_DISCORD_CLIENT_ID=your_discord_client_id
```

## 🔧 Configuration

### Discord Bot Integration
1. Create Discord application (optional)
2. Get Client ID for invite link
3. Update environment variables
4. Deploy to Vercel

## 📱 Features

### ✅ Implemented
- Standalone interface (works offline)
- Optional cloud sync with user-owned databases
- Stream management (create, edit, delete, complete)
- Dashboard with statistics
- Local storage for offline use
- Google OAuth authentication
- User database setup wizard
- Data synchronization
- Responsive design
- Soft UI design system
- Discord bot invite page

### 🚧 Coming Soon
- Schedule management
- Review system
- Profile settings
- Caption generation
- Export/import functionality
- Advanced data backup options

## 🎯 Usage

### For IMVU Models
1. **Open the dashboard** - works immediately offline
2. **Create streams** for your modeling work
3. **Track progress** with the dashboard
4. **Manage deadlines** and priorities
5. **Complete streams** when finished
6. **Edit or delete** streams as needed
7. **Optional**: Set up cloud sync to access data from any device
8. **Optional**: Sign in to automatically backup your data

### For Developers
1. **Fork the repository**
2. **Run locally** for development
3. **Deploy** to Vercel or your preferred platform
4. **Customize** the design and features
5. **Add new features** as needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of the Aurelius IMVU Modeling Assistant suite.
See the main repository for license information.

## 🆘 Support

- **Documentation**: Check the deployment guide
- **Issues**: Create a GitHub issue
- **Discord**: Join the Aurelius community
- **Email**: Contact the development team

---

**Aurelius Web Dashboard** - *"In the gentle guidance of structure, creativity finds its truest expression."* ❧
