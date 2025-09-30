# Aurelius Web Dashboard - Deployment Guide

## 🚀 Vercel Deployment

### Prerequisites
- GitHub account
- Vercel account
- Discord application (optional, for bot invite link)

### Step 1: Push to GitHub

1. **Initialize Git repository** (if not already done):
   ```bash
   cd web-dashboard
   git init
   git add .
   git commit -m "Initial commit: Aurelius web dashboard"
   ```

2. **Create GitHub repository**:
   - Go to GitHub and create a new repository named `aurelius-dashboard`
   - Don't initialize with README

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/aurelius-dashboard.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy to Vercel

1. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your `aurelius-dashboard` repository

2. **Configure Environment Variables** (optional):
   In Vercel dashboard, go to Project Settings → Environment Variables and add:

   ```
   NEXT_PUBLIC_APP_NAME=Aurelius
   NEXT_PUBLIC_APP_DESCRIPTION=Your Personal IMVU Modeling Assistant
   NEXT_PUBLIC_DISCORD_CLIENT_ID=1422317226710798336
   ```

   Note: These are optional. The dashboard works without any environment variables.

3. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete
   - Your dashboard will be available at `https://aurelius-dashboard.vercel.app`

### Step 3: Configure Discord Bot (Optional)

1. **Update Discord Application**:
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Select your Aurelius application
   - Go to OAuth2 → General
   - Copy the Client ID
   - Add it to Vercel environment variables as `NEXT_PUBLIC_DISCORD_CLIENT_ID`

2. **Test Bot Invite**:
   - Visit `https://your-domain.vercel.app/discord`
   - Click the invite button to test the Discord bot integration

## 🛠️ Local Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup

1. **Install dependencies**:
   ```bash
   cd web-dashboard
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

3. **Open browser**:
   Navigate to `http://localhost:3000`

That's it! No environment variables or database setup required.

## 📁 Project Structure

```
web-dashboard/
├── components/          # React components
│   └── StreamForm.js   # Stream creation and editing form
├── pages/              # Next.js pages
│   ├── index.tsx       # Main dashboard page
│   └── discord.tsx     # Discord bot invite page
├── styles/             # Global styles
│   └── globals.css     # Tailwind CSS styles
├── .env.example        # Environment variables template
├── .env.local          # Local environment variables
├── vercel.json         # Vercel configuration
├── tailwind.config.js  # Tailwind CSS configuration
├── next.config.js      # Next.js configuration
└── package.json        # Dependencies and scripts
```

## 🎨 Features

### ✅ Implemented
- **Standalone Interface**: No authentication required
- **Dashboard**: Overview with stats and recent streams
- **Stream Management**: Create, edit, delete, and complete streams
- **Local Storage**: Data persistence in browser
- **Responsive Design**: Works on desktop and mobile
- **Soft UI**: Elegant design with glassmorphism effects
- **Discord Integration**: Optional bot invite page

### 🚧 Coming Soon
- **Schedule Management**: Weekly planning interface
- **Review System**: Item review generation and management
- **Profile Settings**: User preferences and customization
- **Caption Generation**: AI-powered caption creation
- **Export/Import**: Data backup and migration

## 🔧 Customization

### Colors
Edit `tailwind.config.js` to customize the color palette:

```javascript
colors: {
  primary: {
    500: '#6B73FF', // Main brand color
    // ... other shades
  },
  secondary: {
    500: '#9B59B6', // Secondary brand color
    // ... other shades
  }
}
```

### Fonts
Update `styles/globals.css` to change fonts:

```css
@import url('https://fonts.googleapis.com/css2?family=YourFont:wght@300;400;500;600;700&display=swap');

body {
  font-family: 'YourFont', system-ui, sans-serif;
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Build errors**:
   - Check Node.js version (requires 18+)
   - Clear `.next` folder and rebuild
   - Verify all dependencies are installed

2. **Local storage issues**:
   - Check browser permissions
   - Clear browser cache
   - Try incognito mode

3. **Styling issues**:
   - Verify Tailwind CSS is properly configured
   - Check for CSS conflicts
   - Ensure all dependencies are installed

### Support
- Check the [Discord Bot Repository](https://github.com/OJReine/aurelius-bot) for related issues
- Create an issue in the GitHub repository
- Contact the development team

## 📝 License

This project is part of the Aurelius IMVU Modeling Assistant suite.
See the main repository for license information.
