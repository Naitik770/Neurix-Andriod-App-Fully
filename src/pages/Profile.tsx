import { useState, useEffect, useRef } from 'react';
import { useAuth, getAvatarUrl } from '../App';
import { logout, db, handleFirestoreError, OperationType } from '../firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { User, Settings, LogOut, Award, Flame, Target, Edit3, Plus, X, Upload, Camera, Check, Trash2, Smartphone, Monitor, ExternalLink, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Profile() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  // Custom Avatar / Photo Customizer States
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [modalTab, setModalTab] = useState<'photo' | 'avatar'>('photo');
  const [avatarSeed, setAvatarSeed] = useState(profile?.avatarSeed || user?.uid || 'Aneka');
  const [avatarStyle, setAvatarStyle] = useState(profile?.avatarStyle || 'avataaars');
  const [avatarColor, setAvatarColor] = useState(profile?.avatarColor || 'transparent');

  // Interactive File Picker & WhatsApp/Instagram Cropper state
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [cropZoom, setCropZoom] = useState(1);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // PWA Install State & manual step guide
  const [deferredPrompt, setDeferredPrompt] = useState<any>((window as any).pwaDeferredPrompt);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem('naitix_pwa_install_dismissed') === 'true';
  });
  const [showGuide, setShowGuide] = useState(false);
  const [guideTab, setGuideTab] = useState<'ios' | 'android' | 'desktop'>(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) return 'ios';
    if (/android/.test(ua)) return 'android';
    return 'desktop';
  });

  useEffect(() => {
    // Check if running in standalone mode (i.e. already installed and launched from home screen)
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches || 
        (navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    const handleInstallable = () => {
      setDeferredPrompt((window as any).pwaDeferredPrompt);
    };

    const handleInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
    };

    window.addEventListener('pwa-installable', handleInstallable);
    window.addEventListener('pwa-installed', handleInstalled);

    // Deep Link to automatic PWA Install Flow
    const params = new URLSearchParams(window.location.search);
    if (params.get('install') === 'true') {
      params.delete('install');
      const newQuery = params.toString();
      const newPath = window.location.pathname + (newQuery ? '?' + newQuery : '');
      window.history.replaceState({}, '', newPath);

      setTimeout(() => {
        const promptEvent = (window as any).pwaDeferredPrompt;
        if (promptEvent && window.self === window.top) {
          try {
            promptEvent.prompt();
            promptEvent.userChoice.then(({ outcome }: any) => {
              if (outcome === 'accepted') {
                (window as any).pwaDeferredPrompt = null;
                setDeferredPrompt(null);
              }
            });
          } catch (err) {
            console.error('PWA prompt custom handler error:', err);
          }
        } else {
          setShowGuide(true);
        }
      }, 700);
    }

    return () => {
      window.removeEventListener('pwa-installable', handleInstallable);
      window.removeEventListener('pwa-installed', handleInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    // If inside an iframe, browsers block programmatic PWA prompt
    const isInIFrame = window.self !== window.top;
    if (isInIFrame) {
      setShowGuide(true);
      return;
    }

    const promptEvent = deferredPrompt || (window as any).pwaDeferredPrompt;
    if (promptEvent) {
      try {
        promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        if (outcome === 'accepted') {
          setDeferredPrompt(null);
          (window as any).pwaDeferredPrompt = null;
        }
      } catch (err) {
        console.error('Error during PWA installation prompt:', err);
      }
    } else {
      setShowGuide(true);
    }
  };

  const handleDismissCard = () => {
    localStorage.setItem('naitix_pwa_install_dismissed', 'true');
    setIsDismissed(true);
    toast.success('Recommendation dismissed. You can install anytime later.', { duration: 3000 });
  };

  const AVATAR_STYLES = [
    { id: 'avataaars', name: 'Human' },
    { id: 'bottts', name: 'Robot' },
    { id: 'pixel-art', name: 'Pixel' },
    { id: 'adventurer', name: 'Adventurer' },
    { id: 'big-smile', name: 'Smile' },
    { id: 'miniavs', name: 'Minimal' }
  ];

  const AVATAR_COLORS = [
    'transparent', 'FF6B6B', '4ECDC4', '45B7D1', '96CEB4', 'FFEEAD', 'D4A5A5', '9B59B6', '34495E'
  ];

  const AVATAR_OPTIONS = [
    'Aneka', 'Bandit', 'Bear', 'Boots', 'Cali', 'Charlie', 'Chester', 'Chloe', 
    'Cleo', 'Coco', 'Cookie', 'Daisy', 'Felix', 'Garfield', 'Gizmo', 'Harley', 
    'Jack', 'Jasper', 'Loki', 'Luna', 'Maggie', 'Max', 'Milo', 'Misty', 
    'Mochi', 'Oliver', 'Oscar', 'Pepper', 'Rocky', 'Sadie', 'Simba', 'Sophie', 
    'Tigger', 'Toby', 'Willow', 'Zoe', 'Abby', 'Bella', 'Buddy', 'Cooper',
    'Duke', 'Emma', 'Finn', 'Ginger', 'Hank', 'Ivy', 'Jake', 'Kobe',
    'Leo', 'Lucy', 'Mia', 'Nala', 'Oreo', 'Piper', 'Quinn', 'Riley',
    'Sam', 'Teddy', 'Uma', 'Vera', 'Winston', 'Xena', 'Yara', 'Zeus'
  ];

  useEffect(() => {
    if (profile) {
      setAvatarSeed(profile.avatarSeed || user?.uid || 'Aneka');
      setAvatarStyle(profile.avatarStyle || 'avataaars');
      setAvatarColor(profile.avatarColor || 'transparent');
      setModalTab(profile.photoURL ? 'photo' : 'avatar');
    }
  }, [profile, user]);

  // Handle uploaded image file transformation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024 * 5) { // 5 Megabytes maximum
        toast.error('Image is too large. Choose a photo under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedFile(reader.result as string);
        setCropOffset({ x: 0, y: 0 });
        setCropZoom(1);
      };
      reader.readAsDataURL(file);
    }
  };

  // Image load: Adjust width and height to automatically fill the containment box
  const onImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    const containerSize = 240;
    const aspect = naturalWidth / naturalHeight;
    let w = containerSize;
    let h = containerSize;
    if (aspect > 1) {
      w = containerSize * aspect;
    } else {
      h = containerSize / aspect;
    }
    setImgSize({ width: w, height: h });
  };

  // Drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setDragStart({ x: e.clientX - cropOffset.x, y: e.clientY - cropOffset.y });
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch (_) {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragStart) return;
    setCropOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setDragStart(null);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_) {}
  };

  // Save the custom cropped photo or selected avatar
  const handleSavePhotoOrAvatar = async () => {
    if (!user) return;
    try {
      let finalPhotoURL = profile?.photoURL || '';

      if (modalTab === 'photo') {
        if (selectedFile) {
          // Offscreen HTML Canvas for extremely high fidelity cropped image creation
          const canvas = document.createElement('canvas');
          canvas.width = 320;
          canvas.height = 320;
          const ctx = canvas.getContext('2d');
          const imageElement = imgRef.current;
          
          if (ctx && imageElement) {
            // Fill background with elegant solid white
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 320, 320);

            // Translate & scale context matching the visually displayed coordinates
            ctx.scale(320 / 240, 320 / 240);
            ctx.translate(120, 120);
            ctx.translate(cropOffset.x, cropOffset.y);
            ctx.scale(cropZoom, cropZoom);

            const w = imgSize.width;
            const h = imgSize.height;
            ctx.drawImage(imageElement, -w / 2, -h / 2, w, h);

            // Export high-quality custom base64 string
            finalPhotoURL = canvas.toDataURL('image/jpeg', 0.95);
          } else {
            toast.error('Could not construct image crop context.');
            return;
          }
        }
      } else {
        // Clear photoURL if user explicitly selects an avatar
        finalPhotoURL = '';
      }

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        photoURL: finalPhotoURL,
        avatarSeed,
        avatarStyle,
        avatarColor,
        avatarPreferred: modalTab === 'avatar',
        updatedAt: serverTimestamp()
      });

      const publicProfileRef = doc(db, 'publicProfiles', user.uid);
      await updateDoc(publicProfileRef, {
        photoURL: finalPhotoURL,
        avatarSeed,
        avatarStyle,
        avatarColor,
        avatarPreferred: modalTab === 'avatar',
        updatedAt: serverTimestamp()
      }).catch(() => {
        // Ignore if public profile doesn't exist
      });

      toast.success('Your profile picture has been saved!');
      setShowAvatarModal(false);
      setSelectedFile(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const handleDeletePhoto = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        photoURL: '',
        avatarPreferred: true
      });

      const publicProfileRef = doc(db, 'publicProfiles', user.uid);
      await updateDoc(publicProfileRef, {
        photoURL: '',
        avatarPreferred: true
      }).catch(() => {});

      toast.success('Custom photograph cleared. Reset to default avatar.');
      setModalTab('avatar');
    } catch (error) {
      toast.error('Failed to clear photo.');
    }
  };

  return (
    <div className="p-6 pt-12 min-h-screen bg-[#FDFBF7] dark:bg-gray-900 pb-48 transition-colors duration-300">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Profile</h1>
        <button onClick={() => navigate('/settings')} className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* Profile Header Block */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-24 h-24 rounded-full bg-orange-100 dark:bg-orange-900/30 overflow-hidden border-4 border-white dark:border-gray-850 shadow-lg mb-4 relative transition-all duration-300">
          <img src={getAvatarUrl(profile, user)} alt="Avatar" className="w-full h-full object-cover" />
          <button onClick={() => setShowAvatarModal(true)} className="absolute bottom-0 right-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white border-2 border-white dark:border-gray-850 transition-colors duration-300 cursor-pointer hover:scale-105 active:scale-95 shadow">
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{profile?.name || 'User'}</h2>
        {profile?.username && (
          <p className="text-orange-500 font-medium text-sm mb-1">@{profile.username}</p>
        )}
        <p className="text-gray-500 dark:text-gray-400 text-sm">{user?.email}</p>
      </div>

      {/* WhatsApp / Instagram like Cropping + Vector Avatar Editor Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-md w-full shadow-2xl flex flex-col max-h-[90vh] transition-colors duration-300"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Profile Photo</h3>
              <button 
                onClick={() => {
                  setShowAvatarModal(false);
                  setSelectedFile(null);
                }} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Premium Segmented Switch Tab Controls */}
            <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl mb-6">
              <button
                onClick={() => setModalTab('photo')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  modalTab === 'photo'
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Custom Photo
              </button>
              <button
                onClick={() => setModalTab('avatar')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  modalTab === 'avatar'
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Generated Avatar
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
              
              {/* TAB 1: CUSTOM PHOTO UPLOADING & INSTAGRAM-LIKE CROPPER */}
              {modalTab === 'photo' && (
                <div className="space-y-6 flex flex-col items-center">
                  {!selectedFile ? (
                    <div className="w-full space-y-4">
                      {/* Photo Placeholder Card */}
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full aspect-square max-w-[260px] mx-auto rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20 hover:border-orange-500/50 hover:bg-orange-50/5 dark:hover:bg-orange-950/5 flex flex-col items-center justify-center p-6 gap-3 cursor-pointer transition-all duration-300 text-center"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-orange-100/60 dark:bg-orange-955/20 text-orange-500 flex items-center justify-center">
                          <Camera className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">Upload Profile Picture</p>
                          <p className="text-xs text-gray-400 mt-1">Supports PNG, JPG, or SVG up to 5MB</p>
                        </div>
                      </div>

                      <input 
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />

                      {profile?.photoURL && (
                        <div className="flex justify-center">
                          <button
                            onClick={handleDeletePhoto}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-150 text-red-600 dark:bg-red-500/10 dark:text-red-400 rounded-xl text-xs font-bold transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Remove Custom Photo
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* The Professional WhatsApp / Instagram Cropper Interface */
                    <div className="w-full flex flex-col items-center gap-6">
                      <div className="text-center">
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Reposition image</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Drag to move • Slider to zoom</p>
                      </div>

                      {/* Circular Crop Frame with Huge Black Mask Layer */}
                      <div 
                        ref={containerRef}
                        className="w-[240px] h-[240px] relative bg-neutral-950 overflow-hidden select-none touch-none rounded-3xl shadow-lg border border-gray-200 dark:border-gray-750 flex items-center justify-center"
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                      >
                        <img
                          ref={imgRef}
                          src={selectedFile || undefined}
                          onLoad={onImgLoad}
                          alt="Cropper Source"
                          className="absolute max-w-none origin-center pointer-events-none"
                          style={{
                            width: imgSize.width ? `${imgSize.width}px` : '100%',
                            height: imgSize.height ? `${imgSize.height}px` : '100%',
                            left: imgSize.width ? `calc(50% - ${imgSize.width / 2}px)` : '0%',
                            top: imgSize.height ? `calc(50% - ${imgSize.height / 2}px)` : '0%',
                            transform: `translate(${cropOffset.x}px, ${cropOffset.y}px) scale(${cropZoom})`
                          }}
                        />

                        {/* Beautiful circular overlay outline utilizing generous outer shade (Instagram style) */}
                        <div className="absolute inset-0 rounded-full border-2 border-orange-500 pointer-events-none z-10 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)]" />
                      </div>

                      {/* Premium Slider Frame */}
                      <div className="w-full max-w-[280px] space-y-2">
                        <div className="flex justify-between text-[10px] uppercase font-bold text-gray-400">
                          <span>Zoom</span>
                          <span>{Math.round(cropZoom * 100)}%</span>
                        </div>
                        <input 
                          type="range"
                          min="1"
                          max="3"
                          step="0.02"
                          value={cropZoom}
                          onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                          className="w-full accent-orange-500 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      <button
                        onClick={() => setSelectedFile(null)}
                        className="text-xs text-orange-500 hover:text-orange-600 font-bold tracking-tight"
                      >
                        Choose Different Photo
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: PROCEDURAL DICEBEAR AVATAR CREATOR */}
              {modalTab === 'avatar' && (
                <div className="space-y-6">
                  {/* Preview avatar */}
                  <div className="flex justify-center">
                    <div className="w-32 h-32 rounded-3xl bg-gray-50 dark:bg-gray-750 p-2 border border-orange-500/10">
                      <img src={getAvatarUrl({ avatarSeed, avatarStyle, avatarColor })} alt="Preview" className="w-full h-full object-contain" />
                    </div>
                  </div>

                  {/* Style Selection */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2.5">Style</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {AVATAR_STYLES.map((style) => (
                        <button
                          key={style.id}
                          onClick={() => setAvatarStyle(style.id)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border-2 ${
                            avatarStyle === style.id 
                              ? 'bg-orange-500 text-white border-orange-500' 
                              : 'bg-gray-50 dark:bg-gray-700/50 text-gray-650 dark:text-gray-305 border-transparent hover:border-orange-200'
                          }`}
                        >
                          {style.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Background Color Selection */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2.5">Background Color</h4>
                    <div className="flex flex-wrap gap-2">
                      {AVATAR_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setAvatarColor(color)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            avatarColor === color 
                              ? 'border-orange-500 scale-110 ring-2 ring-orange-500/20' 
                              : 'border-white dark:border-gray-850'
                          }`}
                          style={{ backgroundColor: color === 'transparent' ? 'transparent' : `#${color}` }}
                        >
                          {color === 'transparent' && <X className="w-4 h-4 mx-auto text-gray-400" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Seed Choice Grid */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Character Selection</h4>
                    <div className="grid grid-cols-4 gap-3 max-h-56 overflow-y-auto pr-1 select-scrollbar">
                      {AVATAR_OPTIONS.map((seed) => (
                        <button 
                          key={seed}
                          onClick={() => setAvatarSeed(seed)}
                          className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all bg-gray-50 dark:bg-gray-750/30 ${
                            avatarSeed === seed ? 'border-orange-500 scale-105 shadow-md' : 'border-transparent hover:border-orange-200'
                          }`}
                        >
                          <img src={getAvatarUrl({ avatarSeed: seed, avatarStyle, avatarColor })} alt={seed} className="w-full h-full object-contain" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>

            <div className="flex gap-4 pt-6 mt-6 border-t border-gray-100 dark:border-gray-700 transition-colors duration-300">
              <button 
                onClick={() => {
                  setShowAvatarModal(false);
                  setSelectedFile(null);
                }} 
                className="flex-1 py-3 bg-gray-50 hover:bg-gray-105 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white rounded-xl text-sm font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleSavePhotoOrAvatar} 
                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition-colors cursor-pointer"
              >
                Save Photo
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Streak and levels widget stats grid */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-center shadow-sm transition-colors duration-300">
          <div className="w-10 h-10 mx-auto bg-orange-100 dark:bg-orange-500/20 text-orange-500 rounded-full flex items-center justify-center mb-2 transition-colors duration-300">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{profile?.streak || 0}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Day Streak</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-center shadow-sm transition-colors duration-300">
          <div className="w-10 h-10 mx-auto bg-purple-100 dark:bg-purple-500/20 text-purple-500 rounded-full flex items-center justify-center mb-2 transition-colors duration-300">
            <Award className="w-5 h-5" />
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">Lvl {profile?.level || 1}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{profile?.xp || 0} XP</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-center shadow-sm transition-colors duration-300">
          <div className="w-10 h-10 mx-auto bg-green-100 dark:bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-2 transition-colors duration-300">
            <Target className="w-5 h-5" />
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{Math.min(100, Math.floor((profile?.xp || 0) / 10) + ((profile?.streak || 0) * 2))}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Life Score</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm mb-8 transition-colors duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Data</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700 transition-colors duration-300">
            <span className="text-gray-500 dark:text-gray-400">Age</span>
            <span className="font-medium text-gray-900 dark:text-white">{profile?.age || 'Not set'}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700 transition-colors duration-300">
            <span className="text-gray-500 dark:text-gray-400">Height</span>
            <span className="font-medium text-gray-900 dark:text-white">{profile?.height ? `${profile.height} cm` : 'Not set'}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700 transition-colors duration-300">
            <span className="text-gray-500 dark:text-gray-400">Weight</span>
            <span className="font-medium text-gray-900 dark:text-white">{profile?.weight ? `${profile.weight} kg` : 'Not set'}</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-gray-500 dark:text-gray-400">Personality</span>
            <span className="font-medium text-gray-900 dark:text-white">{profile?.personality || 'Not set'}</span>
          </div>
        </div>
      </div>

      <button 
        onClick={logout}
        className="w-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 py-4 rounded-full font-semibold text-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 cursor-pointer mb-6"
      >
        <LogOut className="w-5 h-5" />
        Log Out
      </button>

      {/* PWA Download/Installation recommendation Card */}
      {!isStandalone && !isDismissed && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-gradient-to-r from-orange-500/10 to-amber-500/10 dark:from-orange-500/20 dark:to-amber-500/20 border border-orange-500/20 dark:border-orange-500/30 rounded-3xl p-6 relative overflow-hidden transition-all duration-300 shadow-sm"
        >
          {/* Dismiss button */}
          <button 
            onClick={handleDismissCard}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-650 dark:hover:text-gray-200 transition-colors"
            title="Dismiss suggestions"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex gap-4">
            {/* Beautiful App Icon container */}
            <div className="relative shrink-0 select-none">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border border-orange-500/20 shadow-md">
                <img 
                  referrerPolicy="no-referrer"
                  src="https://i.postimg.cc/FHPqp5Sd/N-20260520-182103-0000.png" 
                  alt="NAITIX Icon" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-[10px] border border-white dark:border-gray-800">
                ✨
              </div>
            </div>

            <div className="text-left flex-1 min-w-0 pr-6">
              <h4 className="text-base font-bold text-gray-900 dark:text-white truncate">Download NAITIX App</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Add to your home screen for a seamless full-screen layout. Keeps standard Chrome search/URL bars hidden!
              </p>
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              onClick={handleInstallClick}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 px-5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow shadow-orange-500/20 cursor-pointer active:scale-95"
            >
              <Smartphone className="w-4 h-4" />
              Download App
            </button>
            <button
              onClick={handleDismissCard}
              className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-600 dark:text-gray-300 py-3 px-4 rounded-2xl text-xs font-semibold transition-all cursor-pointer"
            >
              Hide suggestion
            </button>
          </div>
        </motion.div>
      )}

      {/* Manual Installation Guide Modal */}
      <AnimatePresence>
        {showGuide && (
          <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
            {/* Backdrop click closer */}
            <div className="absolute inset-0" onClick={() => setShowGuide(false)} />
            
            <motion.div
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0.1, bottom: 0.8 }}
              onDragEnd={(e, info) => {
                if (info.offset.y > 100 || info.velocity.y > 400) {
                  setShowGuide(false);
                }
              }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full sm:max-w-md bg-white dark:bg-gray-900 rounded-t-[32px] sm:rounded-[32px] shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col z-10 max-h-[60vh]"
            >
              {/* Close Handle on mobile / Drag Indicator */}
              <div className="flex justify-center my-3 shrink-0 cursor-row-resize">
                <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-750 rounded-full" />
              </div>

              {/* Scrollable Container Wrapper */}
              <div className="flex-1 overflow-y-auto px-6 pb-6 select-none scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">Install NAITIX Live</h3>
                      <p className="text-xs text-gray-550 dark:text-gray-400">Run naturally on your device screen</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setShowGuide(false)}
                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Warning Alert if running in Iframe */}
                {window.self !== window.top && (
                  <div className="mb-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-4 flex gap-3 text-left">
                    <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-amber-800 dark:text-amber-400">Inside Sandboxed Preview Mode</p>
                      <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed">
                        Browsers block app downloads inside preview margins. Please tap the <strong>"Open in New Tab"</strong> button in the top right, then trigger this download card to install perfectly!
                      </p>
                    </div>
                  </div>
                )}

                {/* Select Platform Tabs */}
                <div className="flex bg-gray-100 dark:bg-gray-800/80 p-1 rounded-2xl mb-5">
                  {(['ios', 'android', 'desktop'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setGuideTab(tab)}
                      className={`flex-1 py-2.5 text-xs font-bold rounded-xl capitalize transition-all duration-200 cursor-pointer ${
                        guideTab === tab 
                          ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                          : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                      }`}
                    >
                      {tab === 'ios' ? 'iPhone / iOS' : tab === 'android' ? 'Android' : 'Desktop'}
                    </button>
                  ))}
                </div>

                {/* Guides Contents */}
                <div className="space-y-4 text-left">
                  {guideTab === 'ios' && (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                          Open the <strong>Safari</strong> browser and navigate to the direct, un-sandboxed URL of NAITIX OS.
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                          Tap the <strong>Share</strong> button (square icon containing an arrow pointing up) at the bottom of Safari.
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                          Scroll down through the shared options and tap <strong>"Add to Home Screen"</strong>.
                        </p>
                      </div>
                    </div>
                  )}

                  {guideTab === 'android' && (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                          Visit the direct URL on your <strong>Google Chrome</strong> browser.
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                          Tap the <strong>Menu icon</strong> (the three vertical dots) in the top right corner of Chrome.
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                          Tap <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong> from the popup list to install the app instantly.
                        </p>
                      </div>
                    </div>
                  )}

                  {guideTab === 'desktop' && (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                          Make sure you are on <strong>Google Chrome</strong>, <strong>Microsoft Edge</strong>, or <strong>Brave</strong>.
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                          Look at the right side of the main address bar at the top of your window.
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                          Click on the <strong>Install / Download App icon</strong> (displays as a clean monitor with an arrow, or overlapping squares symbol) to mount NAITIX onto your local dock!
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Action Button */}
                {(window.self !== window.top || (deferredPrompt || (window as any).pwaDeferredPrompt)) && (
                  <div className="mt-6 pt-4 border-t border-gray-150 dark:border-gray-800">
                    <button
                      onClick={() => {
                        if (window.self !== window.top) {
                          const installUrl = `${window.location.origin}${window.location.pathname}?install=true`;
                          window.open(installUrl, '_blank');
                          setShowGuide(false);
                          toast.success('Launching direct PWA environment...', { duration: 2500 });
                        } else {
                          const promptEvent = deferredPrompt || (window as any).pwaDeferredPrompt;
                          if (promptEvent) {
                            setShowGuide(false);
                            handleInstallClick();
                          } else {
                            toast.error('PWA install prompt is not ready/supported on this browser. Try manual steps below.', { duration: 4000 });
                          }
                        }
                      }}
                      className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-sm"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      {window.self !== window.top ? 'Open in New Tab to Install' : 'Install PWA Now'}
                    </button>
                  </div>
                )}

                {/* Bottom Navigation Spacer (safeguard) */}
                <div className="h-20 select-none pointer-events-none" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
