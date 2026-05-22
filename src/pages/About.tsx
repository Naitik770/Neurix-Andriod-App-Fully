import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, ArrowLeft, Target, Eye, Users, ShieldCheck } from 'lucide-react';

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#FDFBF7] dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen font-sans pb-16 transition-colors duration-300">
      
      {/* Header */}
      <header className="border-b border-orange-100/50 dark:border-gray-900 bg-white dark:bg-gray-900 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/')} 
              className="p-2 rounded-xl bg-orange-50 dark:bg-gray-800 text-orange-600 dark:text-orange-400 hover:bg-orange-100 transition-all mr-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <img 
                src="/Logo.png" 
                alt="NEURIX AI Logo" 
                className="w-7 h-7 rounded-lg object-contain" 
                referrerPolicy="no-referrer"
              />
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
                NEURIX AI
              </span>
            </div>
          </div>
          <Link 
            to="/" 
            className="text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors"
          >
            Go to Platform
          </Link>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-4xl mx-auto px-6 pt-12 space-y-12">
        
        {/* Intro */}
        <div className="space-y-4">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-orange-500 bg-orange-500/10 px-3 py-1.5 rounded-full inline-block">
            Our Mission & Science
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            About NEURIX AI
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            NEURIX AI is a comprehensive life-management and neuro-productivity platform designed for high-performing students, professionals, and lifelong learners. We blend computational neuroscience with cutting-edge artificial intelligence to deliver customized feedback loops that elevate human focus, daily routines, and mental resilience.
          </p>
        </div>

        {/* Pillars / Values Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-orange-100/30 dark:border-gray-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">The Core Mission</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              We aim to replace distracting apps and static trackers with a consolidated, responsive, and gamified life operating system that inspires healthy, productive habits.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-orange-100/30 dark:border-gray-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">Scientific Vision</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Our training suites are designed based on modern working-memory studies, cognitive load theories, and psychological habit loop triggers for effortless habit adaptation.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-orange-100/30 dark:border-gray-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">Community Integration</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              With username search systems, shared scores, and support networks, users can maintain high performance with their friends and teams transparently.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-orange-100/30 dark:border-gray-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">Privacy-Preserving AI</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              We leverage safe API routing with state-of-the-art authentication so your personal coach logs and analytics remain secure, isolated, and visible only to you.
            </p>
          </div>
        </div>

        {/* Detailed About section (needed to provide high-quality read material for adsense bots) */}
        <article className="prose dark:prose-invert prose-orange max-w-none text-gray-600 dark:text-gray-300 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Why NEURIX AI?</h2>
          <p>
            In today's digital landscape, keeping track of tasks, physical health logs, and mental wellness is fragmented across multiple disjointed mobile and web tools. This results in software fatigue and fragmented attention. NEURIX AI resolves this by serving as a single-screen dashboard framework merging five pillars of daily self-optimization:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>AI Cognitive Coaching:</strong> Uses Google's Gemini models natively to answer open-ended productivity questions, assist with scheduling conflicts, and break down complex ambitions into bitesize, achievable targets.</li>
            <li><strong>Cognitive Conditioning Sandbox:</strong> Formulated using classic cognitive neuropsychology tests, including memory-matrix charts, logic flow grids, reaction time tasks, and spatial visualization challenges.</li>
            <li><strong>Habit Loop Architecture:</strong> Encourages users to build sustainable positive streaks, receive real-time, interactive audio-visual alarms, and monitor daily progress points in real-time.</li>
            <li><strong>Biometric & Personality Profiling:</strong> Tailors AI coach feedback to your distinct personality parameters, height/weight biometric parameters or age criteria to produce accurate response vectors.</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white pt-4">Google AdSense Partnership</h2>
          <p>
            We are dedicated to providing free, high-tier educational and cerebral training utilities. To support our ongoing server operations, model API token costs, and rule deployments, we partner with premium ad exchanges, including Google AdSense. 
          </p>
          <p>
            Our advertisements comply strictly with the Better Ads Standards, ensuring that your core learning screens are accessible and non-intrusive. To learn more about how cookies, interest-based advertising, and profile analytics are managed, please review our comprehensive <Link to="/privacy-policy" className="text-orange-500 font-bold hover:underline">Privacy Policy</Link>.
          </p>
        </article>

        {/* Footer info wrapper */}
        <div className="pt-8 border-t border-orange-100/30 dark:border-gray-900 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 flex-wrap gap-4">
          <span>NEURIX AI Cognitive Training Framework v1.02</span>
          <div className="flex gap-4">
            <Link to="/privacy-policy" className="hover:text-orange-500">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-orange-500">Terms of Use</Link>
            <Link to="/contact" className="hover:text-orange-500">Contact Us</Link>
          </div>
        </div>

      </main>

    </div>
  );
}
