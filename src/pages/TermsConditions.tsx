import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, AlertCircle, Sparkles, Scale } from 'lucide-react';

export default function TermsConditions() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#FDFBF7] dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen font-sans pb-20 transition-colors duration-300">
      
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

      {/* Content Container */}
      <main className="max-w-4xl mx-auto px-6 pt-12 space-y-10">
        
        <div className="space-y-4">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-orange-500 bg-orange-50/10 px-3 py-1.5 rounded-full inline-block">
            Legal Framework
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Terms & Conditions
          </h1>
          <p className="text-xs text-gray-400">
            Last Updated: May 20, 2026 | Effective Date: May 20, 2026
          </p>
        </div>

        {/* Informational Cards */}
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-orange-100/30 dark:border-gray-850 flex gap-4 items-start">
            <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/30 text-orange-500 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold block mb-1 text-gray-900 dark:text-white">Acceptance of Terms</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">By creating an account or using our brain conditioning games, you consent to these binding legal criteria.</span>
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-orange-100/30 dark:border-gray-850 flex gap-4 items-start">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-500 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold block mb-1 text-gray-900 dark:text-white">Cognitive Disclaimer</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">NEURIX AI is an educational tool. We are not medical practitioners. Our feedback loops have no diagnostics validity.</span>
            </div>
          </div>
        </div>

        <hr className="border-orange-100/30 dark:border-gray-850" />

        <article className="prose dark:prose-invert prose-orange max-w-none text-gray-650 dark:text-gray-300 space-y-6 text-sm sm:text-base leading-relaxed">
          <p>
            Welcome to NEURIX AI! These Terms and Conditions outline the rules and regulations for the use of NEURIX AI's brain tracking platform and associated software tools.
          </p>
          <p>
            By accessing this web application, we assume you accept these terms and conditions in full. Do not continue to use NEURIX AI if you do not agree to take all of the terms and conditions stated on this page.
          </p>

          <h2 className="text-xl font-bold text-gray-950 dark:text-white pt-4">1. Definitions & Framework</h2>
          <p>The following terminology applies to these Terms and Conditions:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>"User", "You", and "Your"</strong> refers to you, the person logged into this software or utilizing its cognitive sandbox modules.</li>
            <li><strong>"The Company", "Ourselves", "We", "Our", and "Us"</strong> refers to NEURIX AI.</li>
            <li><strong>"Database", "Platform", and "AI Services"</strong> refers to our Firestore synchronizations, web games pages, and Gemini API proxy utilities.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-950 dark:text-white pt-4">2. Cognitive Services & API Scopes</h2>
          <p>
            NEURIX AI is an interactive platform displaying habit tracking, physical biometrics profiles, personalized artificial conversations, and 10+ custom brain conditioning games (Cognitive Load, Color Match, Memory Matrix, Reaction Time, spatial reasoning).
          </p>
          <p>
            All AI responses are generated via secure server-side proxy routes querying model providers. We do not guarantee the literal accuracy, completeness, or scientific ultimate truth of any advice or plans recommended by the automated AI Coach. Users use any schedules/routines suggested entirely at their own risk.
          </p>

          <h2 className="text-xl font-bold text-gray-950 dark:text-white pt-4">3. Registration & Account Restrictions</h2>
          <p>By creating a NEURIX AI handle/username, you agree to:</p>
          <ul className="list-disc pl-6 space-y-1.5">
            <li>Ensure your chosen username conforms to community guidelines. We reserve the absolute right to revoke or edit any usernames deemed offensive, deceitful, or squatting on public brands.</li>
            <li>Refrain from attempting brute-force queries against our server layers.</li>
            <li>Maintain control of your authentication email profile. We are not responsible for unverified accounts or loose handles security.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-950 dark:text-white pt-4">4. Virtual Brain Points, XP, & Levels</h2>
          <p>
            NEURIX AI gamifies self-improvement through "Experience Points" (XP), "Levels", and "XP Streaks". You agree that:
          </p>
          <p>
            These elements are visual self-competition motivational tools and do not represent any real-world credit, currency, digital assets, or monetary equivalent. XP cannot be transferred to other profiles or monetized in any way.
          </p>

          <h2 className="text-xl font-bold text-gray-950 dark:text-white pt-4">5. Educational & Medical Disclaimer</h2>
          <div className="bg-orange-50/40 p-4 border-l-4 border-orange-500 rounded-r-2xl text-xs sm:text-sm">
            <p className="font-bold text-orange-800">CRITICAL HEALTH DECLARATION:</p>
            <p className="text-orange-700 leading-relaxed mt-1">
              NEURIX AI is an educational, fun self-help tool. It does not contain or constitute medical advice, diagnostic checklists, therapeutic counseling, or clinical evaluations. The cognitive games are designed in the spirit of light mental gymnastics and are not cleared, verified, or recommended as therapies for neurological conditions, ADHD, memory loss, dementia, or clinical attention disorders. Always seek professional physician guidance for any underlying health complaints.
            </p>
          </div>

          <h2 className="text-xl font-bold text-gray-950 dark:text-white pt-4">6. Third-Party Ads (Google AdSense) & Cookies</h2>
          <p>
            We display context-based visual ads to offset backend server and API token costs. By using NEURIX AI, you acknowledge that our advertising partner, Google AdSense, utilizes cookies to present non-obtrusive, appropriate ads customized to your approximate locale or web history. For further information, review our <Link to="/privacy-policy" className="text-orange-500 font-bold hover:underline">Privacy Policy</Link>.
          </p>

          <h2 className="text-xl font-bold text-gray-950 dark:text-white pt-4">7. Intellectual Property & Code Restrictions</h2>
          <p>
            Unless otherwise stated, NEURIX AI and/or its licensors own the intellectual property rights for all material on NEURIX AI (including UI styling, games, logic, visual assets). All intellectual property rights are reserved. 
          </p>
          <p>You must not:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Republish material, code blocks, or custom SVGs from NEURIX AI.</li>
            <li>Sell, rent, or sub-license game mechanics or coaching dialogue modules.</li>
            <li>Reproduce, duplicate or copy material from NEURIX AI for secondary commercial resale.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-950 dark:text-white pt-4">8. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by applicable law, in no event shall NEURIX AI or its founders be liable for any direct, indirect, incidental, consequential, special, or exemplary damages arising out of or in connection with your use or inability to use the platform services, brain training modules, or AI recommendations.
          </p>

          <h2 className="text-xl font-bold text-gray-950 dark:text-white pt-4">9. Contacting Us for Arbitrations</h2>
          <p>
            If you have questions, disputes, or clarification requests regarding these terms, please contact us:
          </p>
          <div className="p-4 bg-orange-50/30 rounded-2xl border border-orange-100/30 text-xs sm:text-sm space-y-1">
            <p className="font-bold text-gray-800">NEURIX AI Representative</p>
            <p>Email Inquiry: <strong><a href="mailto:help.neurix@gmail.com" className="text-orange-600 dark:text-orange-400 hover:underline">help.neurix@gmail.com</a></strong></p>
            <p>Corporate: NEURIX Tech Labs, Suite 480, San Francisco, CA 94107</p>
          </div>
        </article>

        {/* Footer links wrapper */}
        <div className="pt-8 border-t border-orange-100/30 dark:border-gray-900 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 flex-wrap gap-4">
          <span>NEURIX AI Regulatory Sandbox v1.02</span>
          <div className="flex gap-4">
            <Link to="/about" className="hover:text-orange-500">About Our Science</Link>
            <Link to="/privacy-policy" className="hover:text-orange-500">Privacy Policy</Link>
            <Link to="/contact" className="hover:text-orange-500">Contact Us</Link>
          </div>
        </div>

      </main>

    </div>
  );
}
