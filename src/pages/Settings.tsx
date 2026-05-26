import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, updateDoc, serverTimestamp, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { ChevronLeft, Save, Moon, Sun, Bell, Globe, User, Pencil, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export default function Settings() {
  const { user, profile, theme, setTheme } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    age: profile?.age || 0,
    height: profile?.height || 0,
    weight: profile?.weight || 0,
    personality: profile?.personality || '',
  });
  const [username, setUsername] = useState(profile?.username || '');
  const [checking, setChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [language, setLanguage] = useState(localStorage.getItem('appLanguage') || 'en');
  const [notifications, setNotifications] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);

  const renderSettingsRow = (
    id: string,
    label: string,
    displayValue: React.ReactNode,
    isEditing: boolean,
    renderInput: () => React.ReactNode
  ) => {
    return (
      <div key={id} className="group flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-850 last:border-0 transition-colors">
        {isEditing ? (
          <div className="w-full flex items-center justify-between">
            <div className="flex-1 mr-4">
              <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-1.5">{label}</span>
              {renderInput()}
            </div>
            <button 
              type="button"
              onClick={() => setEditingField(null)} 
              className="p-2 ml-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-full transition-all shadow-sm shrink-0"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="w-full flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-0.5">{label}</span>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{displayValue}</span>
            </div>
            <button 
              type="button"
              onClick={() => setEditingField(id)} 
              className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-gray-700/60 rounded-full transition-all shrink-0"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        age: profile.age || 0,
        height: profile.height || 0,
        weight: profile.weight || 0,
        personality: profile.personality || '',
      });
      if (profile.username) {
        setUsername(profile.username);
      }
    }
  }, [profile]);

  const checkUsername = async (val: string) => {
    const clean = val.trim().toLowerCase();
    if (clean.length < 3) {
      setIsAvailable(null);
      return;
    }
    // If it's matching current username, it is always available
    if (profile?.username && clean === profile.username.toLowerCase()) {
      setIsAvailable(true);
      return;
    }
    setChecking(true);
    try {
      const usernameRef = doc(db, 'usernames', clean);
      const docSnap = await getDoc(usernameRef);
      if (docSnap.exists()) {
        if (docSnap.data().uid === user?.uid) {
          setIsAvailable(true);
        } else {
          setIsAvailable(false);
        }
      } else {
        setIsAvailable(true);
      }
    } catch (error) {
      console.error('Error checking username:', error);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (username) {
        checkUsername(username);
      } else {
        setIsAvailable(null);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [username, profile]);

  const handleSave = async () => {
    if (!user) return;

    const currentUsername = (profile?.username || '').toLowerCase();
    const targetUsername = username.trim().toLowerCase();

    if (targetUsername !== currentUsername) {
      if (targetUsername.length < 3) {
        toast.error(t('settings.usernameInvalid'));
        return;
      }
      if (isAvailable === false) {
        toast.error(t('settings.usernameTaken'));
        return;
      }
      if (isAvailable === null || checking) {
        toast.error(t('settings.usernameCheck'));
        return;
      }
    }

    setSaving(true);
    try {
      if (targetUsername !== currentUsername) {
        const oldUsernameRef = doc(db, 'usernames', currentUsername);
        const newUsernameRef = doc(db, 'usernames', targetUsername);

        // 1. Claim new username
        await setDoc(newUsernameRef, {
          uid: user.uid,
          createdAt: serverTimestamp()
        });

        // 2. Delete old username doc from usernames collection
        if (currentUsername) {
          await deleteDoc(oldUsernameRef).catch(err => {
            console.warn('Failed to delete old username:', err);
          });
        }
      }

      // Update primary user document
      const userRef = doc(db, 'users', user.uid);
      const updates: any = {
        ...formData,
        updatedAt: serverTimestamp()
      };

      if (targetUsername !== currentUsername) {
        updates.username = targetUsername;
      }

      await updateDoc(userRef, updates);

      // Update public profile if it exists
      const publicProfileRef = doc(db, 'publicProfiles', user.uid);
      try {
        const publicSnap = await getDoc(publicProfileRef);
        if (publicSnap.exists()) {
          const publicUpdates: any = {
            name: formData.name,
            updatedAt: serverTimestamp()
          };
          if (targetUsername !== currentUsername) {
            publicUpdates.username = targetUsername;
          }
          await updateDoc(publicProfileRef, publicUpdates);
        }
      } catch (err) {
        console.warn('Could not update public profile:', err);
      }

      localStorage.setItem('appLanguage', language);
      i18n.changeLanguage(language);
      localStorage.setItem('appTheme', theme);
      toast.success(t('settings.success'));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setSaving(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('appTheme', newTheme);
  };

  return (
    <div className="p-6 pt-12 min-h-screen bg-[#FDFBF7] dark:bg-gray-900 pb-32 transition-colors duration-300">
      <header className="flex items-center mb-10">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white ml-4">{t('settings.title')}</h1>
      </header>

      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm transition-colors duration-300">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-orange-500" /> {t('settings.personalData')}
          </h2>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {/* Name Row */}
            {renderSettingsRow(
              'name',
              t('settings.name'),
              formData.name || '---',
              editingField === 'name',
              () => (
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder={t('settings.name')} 
                  className="w-full bg-gray-50 dark:bg-gray-700/60 dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none border border-orange-500/10 focus:border-orange-500 transition-colors" 
                  autoFocus
                />
              )
            )}

            {/* Username Row */}
            {renderSettingsRow(
              'username',
              t('settings.username'),
              username ? `@${username}` : '---',
              editingField === 'username',
              () => {
                const isUsernameChanged = username.trim().toLowerCase() !== (profile?.username || '').toLowerCase();
                return (
                  <div className="relative">
                    <input 
                      type="text" 
                      value={username} 
                      onChange={(e) => {
                        const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                        setUsername(val);
                      }} 
                      placeholder={t('settings.username')} 
                      className="w-full bg-gray-50 dark:bg-gray-700/60 dark:text-white rounded-xl pl-4 pr-24 py-2.5 text-sm outline-none border border-orange-500/10 focus:border-orange-500 transition-colors font-medium" 
                      autoFocus
                    />
                    {isUsernameChanged && username.trim().length >= 3 && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                        {checking ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-yellow-50 dark:bg-yellow-950/20 text-[10px] font-bold text-yellow-600 dark:text-yellow-400 rounded-lg animate-pulse">
                            <span className="w-1 h-1 bg-yellow-500 rounded-full animate-ping" />
                            Checking
                          </span>
                        ) : isAvailable === true ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 rounded-lg uppercase tracking-wider">
                            <span className="w-1 h-1 bg-emerald-500 rounded-full" />
                            Available
                          </span>
                        ) : isAvailable === false ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-rose-50 dark:bg-rose-950/25 text-[10px] font-extrabold text-rose-600 dark:text-rose-450 rounded-lg uppercase tracking-wider">
                            <span className="w-1 h-1 bg-rose-500 rounded-full" />
                            Taken
                          </span>
                        ) : null}
                      </div>
                    )}
                    {username.length > 0 && username.length < 3 && (
                      <p className="text-[10px] text-red-500 font-medium px-1 mt-1">
                        {t('settings.usernameInvalid')}
                      </p>
                    )}
                  </div>
                );
              }
            )}

            {/* Age Row */}
            {renderSettingsRow(
              'age',
              t('settings.age'),
              formData.age ? `${formData.age} years` : '---',
              editingField === 'age',
              () => (
                <input 
                  type="number" 
                  value={formData.age || ''} 
                  onChange={(e) => setFormData({...formData, age: Number(e.target.value)})} 
                  placeholder={t('settings.age')} 
                  className="w-full bg-gray-50 dark:bg-gray-700/60 dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none border border-orange-500/10 focus:border-orange-500 transition-colors" 
                  autoFocus
                />
              )
            )}

            {/* Height Row */}
            {renderSettingsRow(
              'height',
              t('settings.height'),
              formData.height ? `${formData.height} cm` : '---',
              editingField === 'height',
              () => (
                <input 
                  type="number" 
                  value={formData.height || ''} 
                  onChange={(e) => setFormData({...formData, height: Number(e.target.value)})} 
                  placeholder={t('settings.height')} 
                  className="w-full bg-gray-50 dark:bg-gray-700/60 dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none border border-orange-500/10 focus:border-orange-500 transition-colors" 
                  autoFocus
                />
              )
            )}

            {/* Weight Row */}
            {renderSettingsRow(
              'weight',
              t('settings.weight'),
              formData.weight ? `${formData.weight} kg` : '---',
              editingField === 'weight',
              () => (
                <input 
                  type="number" 
                  value={formData.weight || ''} 
                  onChange={(e) => setFormData({...formData, weight: Number(e.target.value)})} 
                  placeholder={t('settings.weight')} 
                  className="w-full bg-gray-50 dark:bg-gray-700/60 dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none border border-orange-500/10 focus:border-orange-500 transition-colors" 
                  autoFocus
                />
              )
            )}

            {/* Personality Row */}
            {renderSettingsRow(
              'personality',
              t('settings.personality'),
              formData.personality || '---',
              editingField === 'personality',
              () => (
                <select 
                  value={formData.personality} 
                  onChange={(e) => setFormData({...formData, personality: e.target.value})} 
                  className="w-full bg-gray-50 dark:bg-gray-700/60 dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none border border-orange-500/10 focus:border-orange-500 transition-colors"
                  autoFocus
                >
                  <option value="">Select Personality...</option>
                  <option value="Analytical">Analytical</option>
                  <option value="Creative">Creative</option>
                  <option value="Adventurous">Adventurous</option>
                  <option value="Calm">Calm</option>
                  <option value="Energetic">Energetic</option>
                </select>
              )
            )}
          </div>
        </div>

        {/* Language Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm transition-colors duration-300">
          {editingField === 'language' ? (
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-4">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-sky-500" /> {t('settings.language')}
                </h2>
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)} 
                  className="w-full bg-gray-50 dark:bg-gray-700/60 dark:text-white rounded-xl px-4 py-2.5 text-sm outline-none border border-orange-500/10 focus:border-orange-500 transition-colors"
                  autoFocus
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi (हिंदी)</option>
                </select>
              </div>
              <button 
                onClick={() => setEditingField(null)} 
                className="p-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-full transition-all shadow-sm shrink-0"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-sky-500" /> {t('settings.language')}
                </h2>
                <span className="text-xs text-gray-400 dark:text-gray-500 block mt-0.5">
                  {language === 'en' ? 'English' : 'Hindi (हिंदी)'}
                </span>
              </div>
              <button 
                onClick={() => setEditingField('language')} 
                className="p-2.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-gray-700/60 rounded-full transition-all shrink-0"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Theme Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm flex justify-between items-center transition-colors duration-300">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              {theme === 'light' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-orange-400" />} {t('settings.theme')}
            </h2>
            <span className="text-xs text-gray-400 dark:text-gray-500 block mt-0.5">
              {theme === 'light' ? t('settings.light') : t('settings.dark')}
            </span>
          </div>
          <button 
            onClick={toggleTheme} 
            className="p-2.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-gray-700/60 rounded-full transition-all shrink-0"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Notifications Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm flex justify-between items-center transition-colors duration-300">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-orange-500" /> {t('settings.notifications')}
            </h2>
            <span className="text-xs text-gray-400 dark:text-gray-500 block mt-0.5">
              {notifications ? t('settings.on') : t('settings.off')}
            </span>
          </div>
          <button 
            onClick={() => setNotifications(!notifications)} 
            className="p-2.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-gray-700/60 rounded-full transition-all shrink-0"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Support Section */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm transition-colors duration-300">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-orange-500" /> Help & Support
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => navigate('/about')} 
              className="p-3 text-left bg-gray-50 hover:bg-orange-50/50 dark:bg-gray-700/50 dark:hover:bg-gray-650 rounded-2xl transition-all"
            >
              <span className="block text-sm font-bold text-gray-800 dark:text-gray-250">About Us</span>
              <span className="text-[10px] text-gray-400">Our mission & science</span>
            </button>
            <button 
              onClick={() => navigate('/contact')} 
              className="p-3 text-left bg-gray-50 hover:bg-orange-50/50 dark:bg-gray-700/50 dark:hover:bg-gray-650 rounded-2xl transition-all"
            >
              <span className="block text-sm font-bold text-gray-800 dark:text-gray-250">Contact</span>
              <span className="text-[10px] text-gray-400">Write inquiries to us</span>
            </button>
            <button 
              onClick={() => navigate('/privacy-policy')} 
              className="p-3 text-left bg-gray-50 hover:bg-orange-50/50 dark:bg-gray-700/50 dark:hover:bg-gray-650 rounded-2xl transition-all"
            >
              <span className="block text-sm font-bold text-gray-800 dark:text-gray-250">Privacy Policy</span>
              <span className="text-[10px] text-gray-400">How cookies & data are used</span>
            </button>
            <button 
              onClick={() => navigate('/terms')} 
              className="p-3 text-left bg-gray-50 hover:bg-orange-50/50 dark:bg-gray-700/50 dark:hover:bg-gray-650 rounded-2xl transition-all"
            >
              <span className="block text-sm font-bold text-gray-800 dark:text-gray-250">Terms of Use</span>
              <span className="text-[10px] text-gray-400">Legal agreements</span>
            </button>
          </div>
        </div>

        <button 
          onClick={handleSave} 
          disabled={saving || (username.length > 0 && username.length < 3) || checking}
          className="w-full bg-orange-500 text-white py-4 rounded-full font-semibold text-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" /> {saving ? 'Saving...' : t('settings.saveChanges')}
        </button>
      </div>
    </div>
  );
}
