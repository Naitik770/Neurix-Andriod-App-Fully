import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import React, { useEffect, useState, createContext, useContext, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp, collection, query, onSnapshot, updateDoc, where, addDoc, increment } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { ErrorBoundary } from './components/ErrorBoundary';
import { BottomNav } from './components/BottomNav';
import { format, isSameMinute } from 'date-fns';
import { Toaster, toast } from 'sonner';

// Notification Sound Player using Web Audio API (smooth chime)
export const playNotificationSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const playNote = (freq: number, startTime: number, duration: number) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      
      gainNode.gain.setValueAtTime(0.15, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };
    
    const now = audioCtx.currentTime;
    playNote(523.25, now, 0.15); // C5
    playNote(659.25, now + 0.08, 0.15); // E5
    playNote(783.99, now + 0.16, 0.35); // G5
  } catch (e) {
    console.warn("Audio play failed or was blocked by browser", e);
  }
};

// Pages
import Home from './pages/Home';
import Coach from './pages/Coach';
import Games from './pages/Games';
import Analytics from './pages/Analytics';
import DailyRoutine from './pages/DailyRoutine';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Reminders from './pages/Reminders';
import Messages from './pages/Messages';
import Chat from './pages/Chat';
import FriendProfile from './pages/FriendProfile';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Personalization from './pages/Personalization';
import ChatHistory from './pages/ChatHistory';
import CreateUsername from './pages/CreateUsername';
import VerifyEmail from './pages/VerifyEmail';
import Landing from './pages/Landing';
import About from './pages/About';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  profile: any | null;
  theme: string;
  setTheme: (theme: string) => void;
  checkVerification: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true, 
  profile: null, 
  theme: 'light', 
  setTheme: () => {},
  checkVerification: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const getAvatarUrl = (profile: any, user?: any) => {
  if (profile && typeof profile === 'object') {
    if (profile.photoURL) return profile.photoURL;
    if (profile.avatarUrl) return profile.avatarUrl;
    
    // If the user has explicitly chosen an avatar or has preference saved
    if (profile.avatarPreferred === true || profile.photoURL === '') {
      // Skip the user.photoURL fallback and generate the vector avatar
    } else if (user && typeof user === 'object' && user.photoURL) {
      return user.photoURL;
    }
  } else if (user && typeof user === 'object' && user.photoURL) {
    return user.photoURL;
  }
  const seed = profile?.avatarSeed || user?.uid || 'Aneka';
  const style = profile?.avatarStyle || 'avataaars';
  const color = profile?.avatarColor || 'transparent';
  const backgroundColor = color === 'transparent' ? '' : `&backgroundColor=${color}`;
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}${backgroundColor}`;
};

// Initialize global variable for PWA deferred prompt
if (typeof window !== 'undefined') {
  (window as any).pwaDeferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    (window as any).pwaDeferredPrompt = e;
    window.dispatchEvent(new CustomEvent('pwa-installable'));
  });
  window.addEventListener('appinstalled', () => {
    (window as any).pwaDeferredPrompt = null;
    window.dispatchEvent(new CustomEvent('pwa-installed'));
  });
}

// Custom stylized toast renderer that matches the user's reference image perfectly!
const showCustomToast = (message: any, type: 'success' | 'error' | 'info' | 'default', options?: any) => {
  let displayMessage = typeof message === 'string' ? message : (message?.message || String(message));
  
  toast.custom((t) => (
    <div className="relative w-full max-w-[360px] bg-[#141414]/95 backdrop-blur-md border border-white/[0.08] rounded-[24px] p-4.5 pr-2.5 shadow-2xl flex items-start text-left shrink-0 pointer-events-auto select-none overflow-hidden transition-all duration-300">
      <div className="flex gap-4.5 items-start w-full relative">
        {/* App Icon Block with Orange Gradient */}
        <div className="w-11 h-11 rounded-[14px] bg-gradient-to-br from-orange-400 via-[#FF671F] to-orange-600 flex items-center justify-center shadow-md shadow-orange-500/15 shrink-0 mt-0.5 select-none">
          <svg viewBox="0 0 100 100" className="w-[23px] h-[23px] text-white" fill="none" stroke="currentColor" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="28,80 28,20 72,80 72,20" />
            <line x1="16" y1="64" x2="84" y2="36" strokeWidth="7" stroke="white" />
          </svg>
        </div>
        
        {/* Content text */}
        <div className="flex-1 min-w-0 pr-8">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <svg viewBox="0 0 24 24" className="w-[11px] h-[11px] text-white/90 fill-current shrink-0 animate-pulse" fill="currentColor">
              <path d="M12 2L14.85 9.15L22 12L14.85 14.85L12 22L9.15 14.85L2 12L9.15 9.15L12 2Z" />
            </svg>
            <span className="text-white font-extrabold text-[11px] tracking-wider uppercase">NEURIX AI</span>
          </div>
          <p className="text-white text-[13.5px] font-medium leading-normal tracking-wide">
            {displayMessage}
          </p>
          {options?.description && (
            <p className="text-white/60 text-xs mt-1 leading-relaxed font-normal">
              {options.description}
            </p>
          )}
          
          {options?.action && (
            <div className="mt-2.5 flex justify-start">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  options.action.onClick(e);
                  toast.dismiss(t);
                }}
                className="bg-white hover:bg-white/90 text-[#141414] text-[11.5px] font-black px-3.5 py-1.5 rounded-lg transition-transform active:scale-95 cursor-pointer shadow-sm select-auto"
              >
                {options.action.label}
              </button>
            </div>
          )}
        </div>

        {/* Chevron Badge */}
        <div className="absolute right-1 top-[2px] w-7 h-7 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/60 select-none">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </div>
        
        {/* Dynamic Background Glowing Sparkle */}
        <div className="absolute -right-3.5 -bottom-3.5 w-[76px] h-[76px] bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.18)_0%,transparent_70%)] rounded-full flex items-center justify-center pointer-events-none select-none">
          <div className="w-9 h-9 rounded-full border border-orange-500/10 flex items-center justify-center opacity-60">
            <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 text-orange-500/35 fill-none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2L14.85 9.15L22 12L14.85 14.85L12 22L9.15 9.15L12 2Z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  ), {
    duration: type === 'error' ? 5000 : 3500,
  });
};


// Global custom premium toast helper specifically for reminders
export const triggerPremiumToast = (message: string, description?: string) => {
  showCustomToast(message, 'success', { description });
};


function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState<any[]>([]);
  const [theme, setTheme] = useState(localStorage.getItem('appTheme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = undefined;
      }

      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        
        // Use onSnapshot for real-time profile updates
        unsubscribeProfile = onSnapshot(userRef, async (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data());
            setLoading(false);
          } else {
            setProfile(null);
            // If user is verified, createProfileIfMissing will handle loading state
            const isVerified = firebaseUser.emailVerified || firebaseUser.providerData[0]?.providerId === 'google.com';
            if (!isVerified) {
              setLoading(false);
            }
          }
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
          setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const checkVerification = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      await auth.currentUser.getIdToken(true); // Force token refresh
      setUser({ ...auth.currentUser });
    }
  };

  // Profile creation logic
  useEffect(() => {
    if (!user) return;

    const createProfileIfMissing = async () => {
      if (profile) return; // Profile already exists
      
      const isVerified = user.emailVerified || user.providerData[0]?.providerId === 'google.com';
      if (!isVerified) return;

      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);
      
      if (!docSnap.exists()) {
        setLoading(true);
        // Check for pending profile data first
        const pendingRef = doc(db, 'pendingProfiles', user.uid);
        const pendingSnap = await getDoc(pendingRef);
        const pendingData = pendingSnap.exists() ? pendingSnap.data() : null;

        const name = pendingData?.name || user.displayName || 'User';
        const username = pendingData?.username || null;
        const email = pendingData?.email || user.email || '';

        const newProfile: any = {
          uid: user.uid,
          name: name,
          username: username,
          avatarSeed: name || 'Aneka',
          avatarStyle: 'avataaars',
          avatarColor: 'transparent',
          xp: 0,
          level: 1,
          streak: 0,
          lifeScore: 50,
          role: 'user',
          createdAt: serverTimestamp(),
        };
        if (email) {
          newProfile.email = email;
        }

        try {
          // 1. Create main profile
          await setDoc(userRef, newProfile, { merge: true });
          
          // 2. Create public profile
          const publicProfileRef = doc(db, 'publicProfiles', user.uid);
          await setDoc(publicProfileRef, {
            uid: user.uid,
            name: name,
            username: username,
            avatarSeed: name || 'Aneka',
            avatarStyle: 'avataaars',
            avatarColor: 'transparent',
            createdAt: serverTimestamp()
          }, { merge: true });

          // 3. Claim username if available (remove pending flag)
          if (username) {
            const usernameRef = doc(db, 'usernames', username.toLowerCase());
            await setDoc(usernameRef, {
              uid: user.uid,
              createdAt: serverTimestamp(),
              pending: false
            }, { merge: true });
          }

          // 4. Delete pending profile
          if (pendingSnap.exists()) {
            await deleteDoc(pendingRef);
          }
        } catch (error: any) {
          if (error.code !== 'permission-denied') {
            handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
          } else {
            console.warn('Permission denied during profile creation. Token might be stale.');
          }
        } finally {
          setLoading(false);
        }
      }
    };

    createProfileIfMissing();
  }, [user, user?.emailVerified, profile]);

  // Global Presence Logic
  useEffect(() => {
    if (!user || !profile) return;

    const publicProfileRef = doc(db, 'publicProfiles', user.uid);

    const setOnline = () => {
      updateDoc(publicProfileRef, { isOnline: true, lastActive: serverTimestamp() }).catch(() => {});
    };

    const setOffline = () => {
      updateDoc(publicProfileRef, { isOnline: false, lastActive: serverTimestamp() }).catch(() => {});
    };

    // Initial set
    setOnline();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setOnline();
      } else {
        setOffline();
      }
    };

    const handleBeforeUnload = () => {
      setOffline();
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Heartbeat just in case
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        setOnline();
      }
    }, 60000);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(interval);
      setOffline();
    };
  }, [user, profile]);

  // Sync reminders
  useEffect(() => {
    if (!user) {
      setReminders([]);
      return;
    }
    const q = query(collection(db, `users/${user.uid}/reminders`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReminders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/reminders`));

    // Register Service Worker for mobile notifications
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('SW registered:', reg.scope))
        .catch(err => console.error('SW registration failed:', err));
    }

    return () => unsubscribe();
  }, [user]);

  // Global Message Notifications
  const notifiedMsgsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'modified' || change.type === 'added') {
          const chatData = change.doc.data();
          const friendId = chatData.participants.find((id: string) => id !== user.uid);
          if (!friendId) return;
          
          // Check if it's a new message from the other person
          if (chatData.lastMessageSenderId === friendId && chatData.lastMessageAt) {
            // Check if muted
            const isMuted = chatData.muted?.[user.uid] === true;
            if (isMuted) return;

            // Check if the user is currently on the chat page for THIS friend
            const isCurrentChat = window.location.pathname === `/chat/${friendId}`;
            if (isCurrentChat) return;

            // Check if the message is recent (within last 10 seconds to avoid repeating on initial load)
            const msgTime = chatData.lastMessageAt.toMillis ? chatData.lastMessageAt.toMillis() : chatData.lastMessageAt.seconds * 1000;
            const messageKey = `${friendId}_${msgTime}`;

            if (Date.now() - msgTime < 10000 && !notifiedMsgsRef.current.has(messageKey)) {
              notifiedMsgsRef.current.add(messageKey);
              if (notifiedMsgsRef.current.size > 100) {
                const arr = Array.from(notifiedMsgsRef.current);
                notifiedMsgsRef.current = new Set(arr.slice(50));
              }

              const senderName = chatData.nicknames?.[friendId] || "Friend";

              // Acoustic warning chime
              playNotificationSound();

              // 1. Browser Notification
              if ("Notification" in window) {
                const title = `✦ NEURIX AI`;
                const options = {
                  body: `✦ ${senderName}: ${chatData.lastMessage}\n\nTap to open chat in NEURIX OS`,
                  icon: 'https://i.postimg.cc/FHPqp5Sd/N-20260520-182103-0000.png',
                  badge: 'https://i.postimg.cc/FHPqp5Sd/N-20260520-182103-0000.png',
                  tag: `msg-${friendId}`,
                  renotify: true,
                  vibrate: [100, 50, 100],
                  data: { url: `/chat/${friendId}` }
                };

                if (Notification.permission === 'granted') {
                  let shownWithSW = false;
                  if ('serviceWorker' in navigator) {
                    try {
                      const reg = await navigator.serviceWorker.ready;
                      if (reg && typeof reg.showNotification === 'function') {
                        await reg.showNotification(title, options);
                        shownWithSW = true;
                      }
                    } catch (swErr) {
                      console.warn("Service Worker showNotification failed, trying fallback:", swErr);
                    }
                  }

                  if (!shownWithSW) {
                    try {
                      const notification = new Notification(title, options);
                      notification.onclick = () => {
                        window.focus();
                        window.location.href = `/chat/${friendId}`;
                      };
                    } catch (e) {
                      console.error("Standard Notification fallback failed:", e);
                    }
                  }
                }
              }

              // 2. In-app toast
              toast.info(`New Message from ${senderName}`, {
                description: chatData.lastMessage,
                duration: 5000,
                action: {
                  label: "View",
                  onClick: () => window.location.href = `/chat/${friendId}`
                }
              });
            }
          }
        }
      });
    });

    return () => unsubscribe();
  }, [user]);

  // Global Reminder Notification Logic
  useEffect(() => {
    if (!user || reminders.length === 0) return;

    // Auto-request permission on first user interaction if not already decided
    const requestPermissionOnInteraction = async () => {
      if ("Notification" in window && Notification.permission === 'default') {
        try {
          await Notification.requestPermission();
        } catch (e) {
          console.error("Failed to request permission on interaction", e);
        }
      }
      window.removeEventListener('click', requestPermissionOnInteraction);
      window.removeEventListener('touchstart', requestPermissionOnInteraction);
    };

    window.addEventListener('click', requestPermissionOnInteraction);
    window.addEventListener('touchstart', requestPermissionOnInteraction);

    const checkReminders = async () => {
      const now = new Date();
      const todayStr = format(now, 'yyyy-MM-dd');
      const currentMinuteStr = format(now, 'yyyy-MM-dd HH:mm');
      const currentDay = now.getDay();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      for (const reminder of reminders) {
        if (!reminder.time || reminder.enabled === false) continue;
        
        // Check if recurring day matches (if days specified)
        if (reminder.days?.length > 0 && !reminder.days.includes(currentDay)) {
          continue;
        }

        // Robust date parsing
        let reminderTime: Date;
        try {
          if (reminder.time && typeof reminder.time === 'string' && reminder.time.includes(':')) {
            const [hours, minutes] = reminder.time.split(':').map(Number);
            reminderTime = new Date();
            reminderTime.setHours(hours, minutes, 0, 0);
          } else if (typeof reminder.time?.toDate === 'function') {
            reminderTime = reminder.time.toDate();
          } else if (reminder.time instanceof Date) {
            reminderTime = reminder.time;
          } else if (reminder.time?.seconds) {
            reminderTime = new Date(reminder.time.seconds * 1000);
          } else {
            reminderTime = new Date(reminder.time);
          }
        } catch (e) {
          continue;
        }

        const reminderHour = reminderTime.getHours();
        const reminderMinute = reminderTime.getMinutes();

        // Match hour and minute exactly
        if (currentHour === reminderHour && currentMinute === reminderMinute) {
          // Check if already notified for THIS minute
          const reminderKey = `lastNotifiedMin_${reminder.id}`;
          const lastMin = reminder.lastNotifiedMinute;

          if (lastMin !== currentMinuteStr) {
            let notified = false;

            // Play notification ring/chime!
            playNotificationSound();

              // 1. Try Browser Notification
            if ("Notification" in window && Notification.permission === 'granted') {
              try {
                const title = `✦ NEURIX AI`; 
                const formattedTime = format(reminderTime, 'hh:mm a');
                const options = { 
                  body: `✦ Scheduled: ${reminder.title}${reminder.messageText ? `\n${reminder.messageText}` : ` (${formattedTime})`}`, 
                  icon: 'https://i.postimg.cc/FHPqp5Sd/N-20260520-182103-0000.png',
                  badge: 'https://i.postimg.cc/FHPqp5Sd/N-20260520-182103-0000.png',
                  vibrate: [200, 100, 200, 100, 300],
                  tag: `reminder-${reminder.id}-${todayStr}`,
                  renotify: true,
                  timestamp: Date.now(),
                  requireInteraction: true,
                  data: { url: '/reminders' }
                };

                try {
                  const notification = new Notification(title, options);
                  notification.onclick = () => {
                    window.focus();
                    window.location.href = '/reminders';
                    notification.close();
                  };
                  notified = true;
                } catch (e) {
                  if ('serviceWorker' in navigator) {
                    const reg = await navigator.serviceWorker.ready;
                    await reg.showNotification(title, options);
                    notified = true;
                  }
                }
              } catch (e) {
                console.error("Browser notification failed", e);
              }
            }

            // 2. In-App Premium Toast
            triggerPremiumToast(`✦ ${reminder.title}`, reminder.messageText || `Scheduled for ${format(reminderTime, 'hh:mm a')}`);

            // 3. Send Message to Friend if configured
            if (reminder.friendId && reminder.messageText) {
              const chatId = [user.uid, reminder.friendId].sort().join('_');
              try {
                const messageRef = collection(db, `chats/${chatId}/messages`);
                await addDoc(messageRef, {
                  senderId: user.uid,
                  text: reminder.messageText,
                  createdAt: serverTimestamp(),
                  type: 'text',
                  isAutoReminder: true
                });

                // Update chat metadata
                await setDoc(doc(db, 'chats', chatId), {
                  lastMessage: reminder.messageText,
                  lastMessageAt: serverTimestamp(),
                  lastMessageSenderId: user.uid,
                  [`unreadCount.${reminder.friendId}`]: increment(1),
                  [`unreadCount.${user.uid}`]: 0,
                  participants: [user.uid, reminder.friendId].sort()
                }, { merge: true });
                
                toast.success(`Auto-message sent to friend!`);
              } catch (e) {
                console.error("Error sending auto-reminder message", e);
              }
            }

            // 4. Fallback Alert
            if (!notified && window.location.pathname !== '/reminders') {
              setTimeout(() => {
                alert(`⏰ NEURIX REMINDER: ${reminder.title}\n\n${reminder.messageText || "It's time for your scheduled task!"}`);
              }, 1000);
              notified = true;
            } else if (!notified) {
              notified = true;
            }

            if (notified) {
              try {
                const updates: any = { 
                  lastNotifiedMinute: currentMinuteStr,
                  lastNotified: todayStr 
                };
                // If it's a one-time reminder (no days), disable it after firing
                if (!reminder.days || reminder.days.length === 0) {
                  updates.enabled = false;
                }
                await updateDoc(doc(db, `users/${user.uid}/reminders`, reminder.id), updates);
              } catch (e) {
                console.error("Error updating reminder state", e);
              }
            }
          }
        }
      }
    };

    // Run check every 1 second to be truly instant
    const interval = setInterval(checkReminders, 1000);
    checkReminders();

    return () => {
      clearInterval(interval);
      window.removeEventListener('click', requestPermissionOnInteraction);
      window.removeEventListener('touchstart', requestPermissionOnInteraction);
    };
  }, [user, reminders]);

  return (
    <AuthContext.Provider value={{ user, loading, profile, theme, setTheme, checkVerification }}>
      {children}
      <Toaster position="top-center" />
    </AuthContext.Provider>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, profile } = useAuth();
  const location = useLocation();

  if (loading) return <div className="flex h-screen items-center justify-center bg-[#FDFBF7]">Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  // Enforce email verification
  if (!user.emailVerified && user.providerData[0]?.providerId === 'password') {
    return <Navigate to="/verify-email" />;
  }

  // Check if username is set (mandatory for all users)
  const hasUsername = profile && profile.username;
  if (!hasUsername && location.pathname !== '/create-username') {
    // If profile is null, we might be in the middle of creating it (verified users)
    if (!profile && user?.emailVerified) {
      return <div className="flex h-screen items-center justify-center bg-[#FDFBF7]">Finalizing your profile...</div>;
    }
    return <Navigate to="/create-username" />;
  }

  if (hasUsername && location.pathname === '/create-username') {
    return <Navigate to="/" />;
  }

  // Check if profile is complete (e.g., has age set)
  const isProfileComplete = profile && profile.age !== undefined;

  if (hasUsername && !isProfileComplete && location.pathname !== '/personalization') {
    return <Navigate to="/personalization" />;
  }

  if (isProfileComplete && location.pathname === '/personalization') {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isChatPage = location.pathname.startsWith('/chat/');

  return (
    <div className={`${isChatPage ? 'h-screen h-[100dvh] overflow-hidden' : 'min-h-screen min-h-[100dvh]'} bg-[#FDFBF7] dark:bg-gray-900 ${isChatPage ? '' : 'pb-24'} font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300 relative`}>
      <div className={`relative z-10 ${isChatPage ? 'h-full' : ''}`}>
        {children}
      </div>
      {!isChatPage && <BottomNav />}
    </div>
  );
}

function RootRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FDFBF7] dark:bg-gray-900 transition-colors duration-300">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Synchronizing Brain Link...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <ProtectedRoute>
        <Layout>
          <Home />
        </Layout>
      </ProtectedRoute>
    );
  }

  return <Landing />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/welcome" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsConditions />} />
            <Route path="/create-username" element={<ProtectedRoute><CreateUsername /></ProtectedRoute>} />
            <Route path="/personalization" element={<ProtectedRoute><Personalization /></ProtectedRoute>} />
            <Route path="/" element={<RootRoute />} />
            <Route path="/coach" element={<ProtectedRoute><Layout><Coach /></Layout></ProtectedRoute>} />
            <Route path="/chat-history" element={<ProtectedRoute><Layout><ChatHistory /></Layout></ProtectedRoute>} />
            <Route path="/games" element={<ProtectedRoute><Layout><Games /></Layout></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Layout><Analytics /></Layout></ProtectedRoute>} />
            <Route path="/daily-routine" element={<ProtectedRoute><Layout><DailyRoutine /></Layout></ProtectedRoute>} />
            <Route path="/reminders" element={<ProtectedRoute><Layout><Reminders /></Layout></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Layout><Messages /></Layout></ProtectedRoute>} />
            <Route path="/chat/:friendId" element={<ProtectedRoute><Layout><Chat /></Layout></ProtectedRoute>} />
            <Route path="/profile/:userId" element={<ProtectedRoute><Layout><FriendProfile /></Layout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
