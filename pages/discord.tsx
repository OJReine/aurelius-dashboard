import type { NextPage } from 'next'
import Head from 'next/head'
import { motion } from 'framer-motion'
import { 
  ChatBubbleLeftRightIcon,
  CommandLineIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

const DiscordPage: NextPage = () => {
  const features = [
    {
      icon: CommandLineIcon,
      title: 'Slash Commands',
      description: 'Use /stream, /schedule, /review commands directly in Discord'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'DM Support',
      description: 'Use Aurelius privately via direct messages'
    },
    {
      icon: SparklesIcon,
      title: 'AI-Powered',
      description: 'Generate captions and reviews with Google AI Studio'
    }
  ]

  const commands = [
    { command: '/stream', description: 'Create and manage IMVU streams' },
    { command: '/schedule', description: 'Plan your weekly modeling schedule' },
    { command: '/review', description: 'Generate detailed item reviews' },
    { command: '/caption', description: 'Create IMVU and Instagram captions' },
    { command: '/profile', description: 'Manage your modeling profile' },
    { command: '/help', description: 'Get help and see all commands' }
  ]

  return (
    <div className="min-h-screen bg-aurora relative">
      <Head>
        <title>Discord Bot - Aurelius IMVU Modeling Assistant</title>
        <meta name="description" content="Invite Aurelius Discord bot to your server for IMVU modeling assistance" />
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
              <a
                href="/"
                className="btn-ghost"
              >
                Web Dashboard
              </a>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-6xl mb-6 animate-float"
          >
            ◆
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-bold text-gradient mb-6"
          >
            Aurelius Discord Bot
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-soft max-w-3xl mx-auto mb-8"
          >
            Your personal IMVU modeling assistant, available 24/7 in Discord. 
            Manage streams, create schedules, and generate content with simple commands.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="https://discord.com/api/oauth2/authorize?client_id=1422317226710798336&permissions=2048&scope=bot%20applications.commands"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-lg px-8 py-4"
            >
              <ChatBubbleLeftRightIcon className="w-6 h-6 mr-2" />
              Invite to Server
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/"
              className="btn-secondary text-lg px-8 py-4"
            >
              Use Web Dashboard Instead
            </motion.a>
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center text-gradient mb-12">
            Why Choose Aurelius Bot?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="card-hover p-8 text-center"
              >
                <div className="p-4 rounded-2xl bg-primary-100/80 border border-primary-200/50 w-fit mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-soft">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Commands Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center text-gradient mb-12">
            Available Commands
          </h2>
          <div className="card p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {commands.map((cmd, index) => (
                <motion.div
                  key={cmd.command}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className="flex items-center p-4 bg-soft-50/50 rounded-xl border border-soft-200/50"
                >
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="ml-4">
                    <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-primary-600">
                      {cmd.command}
                    </code>
                    <p className="text-sm text-soft mt-1">
                      {cmd.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* How to Use Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center text-gradient mb-12">
            How to Get Started
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Invite the Bot',
                description: 'Click the invite button above to add Aurelius to your Discord server'
              },
              {
                step: '2',
                title: 'Set Up Profile',
                description: 'Use /profile to configure your IMVU name and preferences'
              },
              {
                step: '3',
                title: 'Start Managing',
                description: 'Create streams with /stream and manage your modeling work'
              }
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 + index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-6">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-soft">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="text-center"
        >
          <div className="card-glass p-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.3 }}
              className="text-4xl mb-6 animate-float"
            >
              ✦
            </motion.div>
            <h2 className="text-3xl font-bold text-gradient mb-6">
              Ready to Streamline Your Modeling?
            </h2>
            <p className="text-xl text-soft mb-8 max-w-2xl mx-auto">
              Join thousands of IMVU models who use Aurelius to stay organized, 
              meet deadlines, and create amazing content.
            </p>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="https://discord.com/api/oauth2/authorize?client_id=1422317226710798336&permissions=2048&scope=bot%20applications.commands"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-lg px-8 py-4"
            >
              <ChatBubbleLeftRightIcon className="w-6 h-6 mr-2" />
              Invite Aurelius Now
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </motion.a>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="mt-8"
            >
              <p className="text-sm text-soft-lg italic">
                ❧ "In the gentle guidance of structure, creativity finds its truest expression." ❧
              </p>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default DiscordPage
