import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { ArrowLeft, Mail, Phone, MapPin, Send, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function Contact() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    let firestoreSuccess = false;
    let mailTriggerSuccess = false;

    // 1. Send via local Firestore /contacts collection for secure storage/records
    try {
      await addDoc(collection(db, 'contacts'), {
        name: formData.name,
        email: formData.email,
        subject: formData.subject || 'General Inquiry',
        message: formData.message,
        createdAt: serverTimestamp(),
        status: 'new'
      });
      firestoreSuccess = true;
    } catch (error) {
      console.error('Error submitting contact form to contacts collection:', error);
    }

    // 2. Direct 100% Free FormSubmit.co AJAX Dispatch
    try {
      const subjectStr = formData.subject || 'General Inquiry';
      const formPayload = {
        name: formData.name,
        email: formData.email,
        _replyto: formData.email,
        _subject: `[NAITIX AI Contact Inquiry] ${subjectStr}`,
        message: formData.message,
        _captcha: 'false', // Disables captcha for seamless API integration
        _template: 'box'   // High-contrast card email template
      };

      const response = await fetch('https://formsubmit.co/ajax/help.naitix@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formPayload)
      });

      if (response.ok) {
        mailTriggerSuccess = true;
      } else {
        const errorText = await response.text();
        console.warn('FormSubmit.co fell back with warning:', errorText);
      }
    } catch (error) {
      console.error('Error submitting FormSubmit.co free dispatch:', error);
    }

    if (firestoreSuccess || mailTriggerSuccess) {
      setCompleted(true);
      toast.success('Your message has been received! Our support dispatch service is routing it to help.naitix@gmail.com.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } else {
      toast.error('Form submission failed. Please verify your internet connection or email help.naitix@gmail.com directly.');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="bg-[#FDFBF7] dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen font-sans pb-16 transition-colors duration-300">
      
      {/* Header */}
      <header className="border-b border-orange-100/50 dark:border-gray-900 bg-white dark:bg-gray-900 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
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

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 pt-12">
        <div className="text-center space-y-4 mb-12">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-orange-500 bg-orange-500/10 px-3 py-1.5 rounded-full inline-block">
            Get In Touch
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Contact Support & Media
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Have questions about our brain training exercises, Google Ads partnership, or API scopes? Let us know, and a dedicated technician or partner will reach out in under 24 hours.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* Informational Cards Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-orange-100/30 dark:border-gray-800 space-y-6">
              
              <h3 className="text-xl font-bold text-gray-950 dark:text-white">Contact Channels</h3>
              
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-50 dark:bg-orange-950/30 text-orange-500 rounded-xl shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-500 dark:text-gray-400">General Support</h4>
                  <p className="text-sm font-medium dark:text-orange-300">
                    <a href="mailto:help.naitix@gmail.com" className="text-orange-600 dark:text-orange-400 hover:underline">
                      help.naitix@gmail.com
                    </a>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Responses within 12-24 business hours.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 text-blue-500 rounded-xl shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-500 dark:text-gray-400">Media & Advertising Partnerships</h4>
                  <p className="text-sm font-medium">
                    <a href="mailto:help.naitix@gmail.com" className="text-orange-600 dark:text-orange-400 hover:underline">
                      help.naitix@gmail.com
                    </a>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Google AdSense partner relations.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 rounded-xl shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-500 dark:text-gray-400">Fictional Labs Headquarters</h4>
                  <p className="text-sm leading-relaxed">NAITIX Tech Labs, Suite 480<br />San Francisco, CA 94107</p>
                </div>
              </div>

              <hr className="border-orange-100/30 dark:border-gray-800" />

              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="w-4 h-4 text-orange-500 shrink-0" />
                <span>Operating hours: Monday to Friday (9:00 AM – 6:00 PM UTC)</span>
              </div>

            </div>

            {/* Micro FAQ Teaser Card */}
            <div className="bg-orange-50/40 dark:bg-gray-900/30 p-6 rounded-3xl border border-orange-100/30 dark:border-gray-800/80">
              <h4 className="font-bold text-sm mb-2 text-orange-600 dark:text-orange-400">Google Adsense Questions?</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                If you are looking to audit our cookies compliance, report an inappropriate banner ad, or discuss advertising space inventory on our Cognitive Platform, please direct your message specifically to <strong><a href="mailto:help.naitix@gmail.com" className="text-orange-600 dark:text-orange-400 hover:underline">help.naitix@gmail.com</a></strong>.
              </p>
            </div>

          </div>

          {/* Contact Form Column */}
          <div className="lg:col-span-7 bg-white dark:bg-gray-900 p-8 rounded-3xl border border-orange-100/30 dark:border-gray-800 shadow-sm">
            
            {completed ? (
              <div className="text-center py-12 space-y-6">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black">Message Dispatched!</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                    Thank you for contacting NAITIX AI. An on-duty life coach coordinator or system administrator will evaluate your inquiry and email you back shortly.
                  </p>
                </div>
                <button 
                  onClick={() => setCompleted(false)} 
                  className="px-6 py-2.5 bg-orange-500 text-white text-xs font-bold rounded-full hover:bg-orange-600"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-xl font-bold">Write Us a Message</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Your Name <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 outline-none border border-orange-100/10 focus:border-orange-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Your Email <span className="text-red-500">*</span></label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. name@domain.com"
                      className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 outline-none border border-orange-100/10 focus:border-orange-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subject</label>
                  <input 
                    type="text" 
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="How can we assist you?"
                    className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 outline-none border border-orange-100/10 focus:border-orange-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Message Description <span className="text-red-500">*</span></label>
                  <textarea 
                    rows={5}
                    required
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Enter details of your feedback or inquiry here..."
                    className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 outline-none border border-orange-100/10 focus:border-orange-500 transition-colors resize-none"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-4 bg-orange-500 text-white rounded-full font-bold shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span className="animate-pulse">Dispatching Inquiry...</span>
                  ) : (
                    <>
                      <Send className="w-5 h-5" /> Send Message
                    </>
                  )}
                </button>

              </form>
            )}

          </div>

        </div>
      </main>

    </div>
  );
}
