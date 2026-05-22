import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { 
  Brain, 
  MessageSquare, 
  Flame, 
  Sparkles, 
  Shield, 
  Cpu, 
  LineChart, 
  ArrowRight, 
  CheckCircle,
  Menu,
  X,
  Lock,
  ChevronRight,
  Globe,
  Bell
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const features = [
    {
      icon: MessageSquare,
      title: "AI Mental Life Coach",
      description: "Chat with an advanced neuro-optimized AI trainer personalized to your persona, providing direct real-time cognitive guidance, advice, and routine building.",
      color: "bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400"
    },
    {
      icon: Brain,
      title: "Interactive Brain Games",
      description: "Enhance your focus, processing speed, memory, logic, spatial reasoning, and reaction time with 10+ custom curated neurological exercise modules.",
      color: "bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
    },
    {
      icon: Flame,
      title: "Habit Loops & Daily Routines",
      description: "Schedule recurring routines, complete high-yield habits, receive micro-reminders, and build unstoppable daily streaks.",
      color: "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400"
    },
    {
      icon: LineChart,
      title: "Personalized Cognitive Analytics",
      description: "Inspect beautiful visual charts, cognitive loads, level upgrades, and real-time XP tracker metrics designed to show your mental expansion.",
      color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
    }
  ];

  const appScreenTeasers = [
    { title: "Cognitive Load Challenge", category: "Games" },
    { title: "Daily Stream Sync", category: "Routine" },
    { title: "Neuro-Chat Sandbox", category: "AI Coach" },
    { title: "XP Mastery Tracking", category: "Analytics" }
  ];

  return (
    <div className="bg-[#FDFBF7] dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen font-sans transition-colors duration-300">
      
      {/* Navigation */}
      <nav className="border-b border-orange-100/50 dark:border-gray-950 bg-[#FDFBF7]/80 dark:bg-gray-950/85 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <img 
              src="/Logo.png" 
              alt="NEURIX AI Logo" 
              className="w-9 h-9 rounded-xl object-contain shadow-sm shadow-orange-500/10 group-hover:scale-105 transition-all" 
              referrerPolicy="no-referrer"
            />
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
              NEURIX AI
            </span>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-semibold text-gray-600 hover:text-orange-500 dark:text-gray-300 dark:hover:text-orange-400 transition-colors">Features</a>
            <Link to="/about" className="text-sm font-semibold text-gray-600 hover:text-orange-500 dark:text-gray-300 dark:hover:text-orange-400 transition-colors">About Us</Link>
            <Link to="/contact" className="text-sm font-semibold text-gray-600 hover:text-orange-500 dark:text-gray-300 dark:hover:text-orange-400 transition-colors">Contact</Link>
            <Link to="/privacy-policy" className="text-sm font-semibold text-gray-500 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400 transition-colors">Privacy</Link>
            <Link to="/terms" className="text-sm font-semibold text-gray-500 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400 transition-colors">Terms</Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <Link 
                to="/" 
                className="px-5 py-2.5 rounded-full bg-orange-500 text-white text-sm font-bold shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all flex items-center gap-1.5"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
                  Log In
                </Link>
                <Link 
                  to="/signup" 
                  className="px-5 py-2.5 rounded-full bg-orange-500 text-white text-sm font-bold shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all"
                >
                  Start Training Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="md:hidden w-10 h-10 rounded-xl bg-orange-50 dark:bg-gray-900 border border-orange-100/30 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:text-orange-500"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-20 left-0 right-0 md:hidden border-b border-orange-100/50 dark:border-gray-900 bg-[#FDFBF7] dark:bg-gray-950 p-6 space-y-4 shadow-xl z-50 animate-in fade-in slide-in-from-top-4 duration-200">
            <a 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-semibold text-gray-700 dark:text-gray-300"
            >
              Features
            </a>
            <Link 
              to="/about" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-semibold text-gray-700 dark:text-gray-300"
            >
              About Us
            </Link>
            <Link 
              to="/contact" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-semibold text-gray-700 dark:text-gray-300"
            >
              Contact
            </Link>
            <Link 
              to="/privacy-policy" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-semibold text-gray-500 dark:text-gray-400"
            >
              Privacy Policy
            </Link>
            <Link 
              to="/terms" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-semibold text-gray-500 dark:text-gray-400"
            >
              Terms & Conditions
            </Link>
            <hr className="border-orange-100/40 dark:border-gray-800" />
            <div className="flex flex-col gap-3">
              {user ? (
                <Link 
                  to="/" 
                  className="w-full text-center py-3 rounded-xl bg-orange-500 text-white font-bold"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-3 rounded-xl bg-orange-50 dark:bg-gray-900 border border-orange-100/30 text-gray-800 dark:text-gray-200 font-bold"
                  >
                    Log In
                  </Link>
                  <Link 
                    to="/signup" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-3 rounded-xl bg-orange-500 text-white font-bold shadow-lg shadow-orange-500/20"
                  >
                    Start Training Free
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,146,60,0.08)_0%,transparent_70%)] dark:bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.04)_0%,transparent_70%)] pointer-events-none -z-10" />
        
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 dark:bg-orange-950/30 border border-orange-100/50 dark:border-orange-900/25 text-xs font-semibold text-orange-600 dark:text-orange-400 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-orange-500" />
            The Ultimate Neuroscience & Habits Engine
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.1]">
            Transform Your Brain, Habits <br className="hidden sm:inline" />
            & Goal-Setting with <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Advanced AI</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            NEURIX AI fuses advanced neurological game design with real-time AI personality coaching. Train processing speed, maintain high-yield health routines, and scale your potential every single day.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {user ? (
              <button 
                onClick={() => navigate('/')}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-orange-500 text-white font-bold shadow-xl shadow-orange-500/30 hover:bg-orange-600 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group text-base"
              >
                Access Personalized Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/signup')}
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-orange-500 text-white font-bold shadow-xl shadow-orange-500/30 hover:bg-orange-600 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group text-base"
                >
                  Get Started - It's Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <a 
                  href="#features"
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 font-bold border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-all text-center text-base"
                >
                  Explore AI Modules
                </a>
              </>
            )}
          </div>

          {/* Social Proof Stats */}
          <div className="pt-12 grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto border-t border-orange-100/30 dark:border-gray-900 mt-16 text-left">
            <div className="p-4 bg-white/50 dark:bg-gray-900/40 rounded-2xl border border-orange-50/50 dark:border-gray-900/50">
              <span className="block text-3xl font-black text-orange-500 mb-1">10k+</span>
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active Brains</span>
            </div>
            <div className="p-4 bg-white/50 dark:bg-gray-900/40 rounded-2xl border border-orange-50/50 dark:border-gray-900/50">
              <span className="block text-3xl font-black text-orange-500 mb-1">12+</span>
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cognitive Games</span>
            </div>
            <div className="p-4 bg-white/50 dark:bg-gray-900/40 rounded-2xl border border-orange-50/50 dark:border-gray-900/50">
              <span className="block text-3xl font-black text-orange-500 mb-1">98.4%</span>
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Focus Rating</span>
            </div>
            <div className="p-4 bg-white/50 dark:bg-gray-900/40 rounded-2xl border border-orange-50/50 dark:border-gray-900/50">
              <span className="block text-3xl font-black text-orange-500 mb-1">XP System</span>
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Gamified Growth</span>
            </div>
          </div>
        </div>
      </section>

      {/* Value Statement / Features section */}
      <section id="features" className="py-20 bg-orange-50/30 dark:bg-gray-900/20 px-6 border-y border-orange-100/30 dark:border-gray-900/55 scroll-mt-20">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white uppercase">
              Engineered for Cognitive Supremacy
            </h2>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
              We replace standard tracking sheets with a self-improving brain feedback loops system that acts as your personal digital companion.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feat, index) => {
              const IconComp = feat.icon;
              return (
                <div 
                  key={index} 
                  className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-orange-100/30 dark:border-gray-800 shadow-sm hover:shadow-md transition-all flex gap-5 items-start"
                >
                  <div className={`p-4 rounded-2xl ${feat.color} shrink-0`}>
                    <IconComp className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{feat.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{feat.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Scientific Approach / Live Games Teaser */}
      <section className="py-20 px-6 max-w-6xl mx-auto text-center">
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-[3rem] p-8 md:p-16 text-white relative overflow-hidden shadow-xl shadow-orange-500/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
          
          <div className="max-w-3xl mx-auto space-y-8 relative z-10">
            <span className="text-xs font-black uppercase tracking-[0.25em] bg-white/20 px-3 py-1.5 rounded-full inline-block">
              Gamified Brain Exercises
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-none uppercase">
              Neuroscience Meets Play
            </h2>
            <p className="text-sm md:text-lg text-orange-50/90 leading-relaxed max-w-2xl mx-auto">
              Our dynamic engine measures response times, pattern-matching margins, working memory indexes, and mental stamina to customize AI routines perfectly suited for your neuro-profile.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              {appScreenTeasers.map((ts, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center">
                  <span className="block text-xs font-bold text-amber-200 uppercase tracking-widest mb-1">{ts.category}</span>
                  <span className="text-sm font-bold block">{ts.title}</span>
                </div>
              ))}
            </div>

            <div className="pt-6">
              <button 
                onClick={() => navigate('/signup')} 
                className="px-8 py-4 rounded-full bg-white text-gray-950 font-extrabold shadow-2xl hover:scale-[1.03] transition-all flex items-center gap-2 mx-auto"
              >
                Launch Brain Sandbox Now <ChevronRight className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Adsense Compliant Informational Blocks */}
      <section className="py-12 border-t border-orange-100/30 dark:border-gray-900 bg-gray-50/50 dark:bg-gray-950/20 px-6">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 text-center text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
          <div className="space-y-2">
            <h4 className="font-bold text-gray-700 dark:text-gray-300">Google Adsense Certified</h4>
            <p>Our brain applications provide structured educational courses, mental training, and certified compliance guidelines for programmatic access.</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-gray-700 dark:text-gray-300">Privacy First Commitment</h4>
            <p>GDPR and CCPA compliant. All personalized chats and intelligence models execute behind end-to-end sandbox security. Your cognitive metrics are your own.</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-gray-700 dark:text-gray-300">Science-Based Modules</h4>
            <p>Formulated on neuropsychology studies of daily cognitive triggers, spatial-logic recognition, task load limits, and mental feedback loops.</p>
          </div>
        </div>
      </section>

      {/* Footers (COMPLIANT FOOTER IS EXTREMELY CRITICAL) */}
      <footer className="border-t border-orange-100/50 dark:border-gray-900 bg-[#FDFBF7] dark:bg-gray-950 text-gray-600 dark:text-gray-400 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <img 
                src="/Logo.png" 
                alt="NEURIX AI Logo" 
                className="w-8 h-8 rounded-xl object-contain shadow-sm shadow-orange-500/10" 
                referrerPolicy="no-referrer"
              />
              <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">NEURIX AI</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Unlock supreme mental performance, manage daily habits, and train with an personalized artificial life coach.
            </p>
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} NEURIX AI. All rights reserved.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Core Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/signup" className="hover:text-orange-500 transition-colors">Start Cognitive Games</Link></li>
              <li><Link to="/login" className="hover:text-orange-500 transition-colors">AI Personal Coach</Link></li>
              <li><Link to="/signup" className="hover:text-orange-500 transition-colors">Daily Routines Sync</Link></li>
              <li><Link to="/login" className="hover:text-orange-500 transition-colors">XP Levels Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Company Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-orange-500 transition-colors">About Our Science</Link></li>
              <li><Link to="/contact" className="hover:text-orange-500 transition-colors">Contact Support Form</Link></li>
              <li><a href="#features" className="hover:text-orange-500 transition-colors">Interactive Demos</a></li>
              <li><Link to="/settings" className="hover:text-orange-500 transition-colors">Account Customization</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Regulatory & Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy-policy" className="hover:text-orange-500 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-orange-500 transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/contact" className="hover:text-orange-500 transition-colors">Acceptable Use Policy</Link></li>
              <li><Link to="/about" className="hover:text-orange-500 transition-colors">Ad Choices & Cookies</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright & micro disclaimer */}
        <div className="border-t border-orange-100/30 dark:border-gray-900/50 py-6 text-center text-xs text-gray-400 dark:text-gray-500 max-w-7xl mx-auto px-6">
          <p>
            Disclaimer: NEURIX AI is a cognitive training app. The brain exercises and AI coach suggestions are intended for productivity and self-growth enablement, not medical advice, counseling, or professional psychiatric evaluation.
          </p>
        </div>
      </footer>

    </div>
  );
}
