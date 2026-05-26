import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, CheckCircle } from 'lucide-react';

export default function PrivacyPolicy() {
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
                alt="NAITIX AI Logo" 
                className="w-7 h-7 rounded-lg object-contain" 
                referrerPolicy="no-referrer"
              />
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
                NAITIX AI
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
            Regulatory Compliance
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Privacy Policy
          </h1>
          <p className="text-xs text-gray-400">
            Last Updated: May 20, 2026 | Effective Date: May 20, 2026
          </p>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-orange-100/30 dark:border-gray-800 flex flex-col justify-between">
            <Shield className="w-6 h-6 text-orange-500 mb-2" />
            <span className="font-bold block mb-1">Data Ownership</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Your chat transcripts and cognitive game metrics are entirely private and owned by you (held in secure sandbox).</span>
          </div>
          <div className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-orange-100/30 dark:border-gray-800 flex flex-col justify-between">
            <Lock className="w-6 h-6 text-blue-500 mb-2" />
            <span className="font-bold block mb-1">No Sale of Info</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">We do not sell, trade, or rent user data or bio-metrics to any external tracking brokers.</span>
          </div>
          <div className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-orange-100/30 dark:border-gray-800 flex flex-col justify-between">
            <Eye className="w-6 h-6 text-emerald-500 mb-2" />
            <span className="font-bold block mb-1">Adsense Compliant</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">We disclose how anonymous cookies are used for Google programmatic visual advertisements.</span>
          </div>
        </div>

        <hr className="border-orange-100/30 dark:border-gray-850" />

        <article className="prose dark:prose-invert prose-orange max-w-none text-gray-650 dark:text-gray-300 space-y-6 text-sm sm:text-base leading-relaxed">
          <p>
            At NAITIX AI, accessible from our application platform, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by NAITIX AI and how we use it.
          </p>
          <p>
            If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us at <strong><a href="mailto:help.naitix@gmail.com" className="text-orange-600 dark:text-orange-400 hover:underline">help.naitix@gmail.com</a></strong>.
          </p>

          <h2 className="text-xl font-bold text-gray-950 dark:text-white pt-4">1. Information We Collect</h2>
          <p>
            The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.
          </p>
          <ul className="list-disc pl-6 space-y-1.5">
            <li><strong>Account credentials:</strong> When you register for an Account, we collect your contact information, including items such as name, email address, username, password.</li>
            <li><strong>Biometric parameters & preferences:</strong> In order to tailor the AI responses, you may input optional parameters such as age, height, weight, personality archetype, and custom reminders.</li>
            <li><strong>Cerebral Metrics & History:</strong> Logged game scores, cognitive speeds, response accuracy margins, levels, and total earned XP.</li>
            <li><strong>Conversational dialogues:</strong> Message histories with your AI Coach which are maintained securely inside Firebase Firestore.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-950 dark:text-white pt-4">2. How We Use Your Information</h2>
          <p>We use the information we collect in various ways, including to:</p>
          <ul className="list-disc pl-6 space-y-1.5">
            <li>Provide, operate, and maintain our application platforms.</li>
            <li>Improve, personalize, and expand our application and cognitive modules.</li>
            <li>Understand and analyze how you use our application to train our cognitive neural systems.</li>
            <li>Develop new products, services, features, and functionality.</li>
            <li>Communicate with you to send critical emails (such as verification checks or password resets).</li>
            <li>Detect and prevent fraud or structural spam.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-950 dark:text-white pt-4">3. Log Files and Analytical Data</h2>
          <p>
            NAITIX AI follows a standard procedure of using log files. These files log visitors when they visit web applications. All hosting companies do this as part of hosting services' analytics. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users' movement on the website, and gathering demographic information.
          </p>

          <h2 className="text-xl font-bold text-gray-950 dark:text-white pt-4 text-orange-600 dark:text-orange-400">4. Google DoubleClick DART Cookies & AdSense Disclosure</h2>
          <p>
            Google is one of the third-party vendors on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to our web elements and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noreferrer" className="text-orange-500 font-bold hover:underline">https://policies.google.com/technologies/ads</a>.
          </p>
          <p>
            Please note that third-party ad servers or ad networks use technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on NAITIX AI, which are sent directly to users' browsers. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.
          </p>
          <p>
            NAITIX AI has no access to or control over these cookies that are used by third-party advertisers.
          </p>

          <h2 className="text-xl font-bold text-gray-950 dark:text-white pt-4">5. Third-Party Privacy Policies</h2>
          <p>
            NAITIX AI's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options.
          </p>
          <p>
            You can choose to disable cookies through your individual browser options. To know more detailed information about cookie management with specific web browsers, it can be found at the browsers' respective websites.
          </p>

          <h2 className="text-xl font-bold text-gray-950 dark:text-white pt-4">6. CCPA Privacy Rights (Do Not Sell My Personal Information)</h2>
          <p>Under the CCPA, among other rights, California consumers have the right to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Request that a business that collects a consumer's personal data disclose the categories and specific pieces of personal data that a business has collected about consumers.</li>
            <li>Request that a business delete any personal data about the consumer that a business has collected.</li>
            <li>Request that a business that sells a consumer's personal data, not sell the consumer's personal data.</li>
          </ul>
          <p>
            If you make a request under this provision, we have one month to respond to you. If you would like to exercise any of these rights, please contact us.
          </p>

          <h2 className="text-xl font-bold text-gray-950 dark:text-white pt-4">7. GDPR Data Protection Rights</h2>
          <p>We would like to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:</p>
          <ul className="list-disc pl-6 space-y-1.5">
            <li><strong>The right to access:</strong> You have the right to request copies of your personal data. We may charge you a small fee for this service.</li>
            <li><strong>The right to rectification:</strong> You have the right to request that we correct any information you believe is inaccurate or complete information you believe is incomplete.</li>
            <li><strong>The right to erasure:</strong> You have the right to request that we erase your personal data, under certain conditions.</li>
            <li><strong>The right to restrict or object to processing:</strong> You have the right to request that we restrict the processing of your personal data, or object to processing, under certain conditions.</li>
            <li><strong>The right to data portability:</strong> You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-950 dark:text-white pt-4">8. Children's Regulatory Safeguards</h2>
          <p>
            Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity.
          </p>
          <p>
            NAITIX AI does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records.
          </p>

          <h2 className="text-xl font-bold text-gray-950 dark:text-white pt-4">9. Contact Information</h2>
          <p>
            If you have structural complaints, privacy concerns, CCPA deletion requests, or other regulatory considerations relative to NAITIX AI, please send them directly to:
          </p>
          <div className="p-4 bg-orange-50/30 rounded-2xl border border-orange-100/30 text-xs sm:text-sm space-y-1">
            <p className="font-bold">NAITIX AI Privacy Coordinator</p>
            <p>Email: <strong><a href="mailto:help.naitix@gmail.com" className="text-orange-600 dark:text-orange-400 hover:underline">help.naitix@gmail.com</a></strong></p>
            <p>Address: NAITIX Tech Labs, Suite 480, San Francisco, CA 94107</p>
          </div>
        </article>

        {/* Footer links wrapper */}
        <div className="pt-8 border-t border-orange-100/30 dark:border-gray-900 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 flex-wrap gap-4">
          <span>NAITIX AI Regulatory Sandbox v1.02</span>
          <div className="flex gap-4">
            <Link to="/about" className="hover:text-orange-500">About Our Science</Link>
            <Link to="/terms" className="hover:text-orange-500">Terms of Use</Link>
            <Link to="/contact" className="hover:text-orange-500">Contact Us</Link>
          </div>
        </div>

      </main>

    </div>
  );
}
