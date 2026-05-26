import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { collection, query, onSnapshot, doc, updateDoc, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Check, Trash2, Edit2, Play, Activity, RotateCcw, Pause, Flame, Droplet, Wind, Footprints, Book, Moon, Coffee, Dumbbell, Brain, Heart, Music, Utensils, Sun, Timer, Pencil } from 'lucide-react';
import { HABIT_ICONS as icons } from '../constants';

export default function DailyRoutine() {
  const { user, profile } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [habits, setHabits] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<any | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDuration, setNewTaskDuration] = useState('');
  const [newTaskIcon, setNewTaskIcon] = useState('check');
  const [showVerification, setShowVerification] = useState<string | null>(null);
  const [activeTimerHabit, setActiveTimerHabit] = useState<any | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, `users/${user.uid}/habits`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setHabits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/habits`));
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleComplete = (habitId: string) => setShowVerification(habitId);

  const confirmCompletion = async (habitId: string, confirmed: boolean) => {
    setShowVerification(null);
    if (!confirmed || !user) return;
    try {
      const habitRef = doc(db, `users/${user.uid}/habits`, habitId);
      const habit = habits.find(h => h.id === habitId);
      const today = new Date();
      const todayStr = today.toLocaleDateString('en-CA');
      
      if (habit?.lastCompleted === todayStr) {
        return; // Already completed today
      }
      
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const yesterdayStr = yesterday.toLocaleDateString('en-CA');

      const isCompletedYesterday = habit?.lastCompleted === yesterdayStr;
      const newStreak = isCompletedYesterday ? (habit?.streak || 0) + 1 : 1;

      await updateDoc(habitRef, {
        streak: newStreak,
        lastCompleted: todayStr
      });
      await addDoc(collection(db, `users/${user.uid}/habitCompletions`), {
        habitId,
        completedAt: serverTimestamp(),
        date: todayStr
      });
      await updateDoc(doc(db, `users/${user.uid}`), { xp: (profile?.xp || 0) + 10 });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/habits/${habitId}`);
    }
  };

  const handleAddTask = async () => {
    if (!user || !newTaskTitle.trim()) return;
    const selectedIcon = icons.find(i => i.id === newTaskIcon) || icons[0];
    const duration = parseInt(newTaskDuration);
    try {
      if (editingHabit) {
        await updateDoc(doc(db, `users/${user.uid}/habits`, editingHabit.id), {
          title: newTaskTitle.trim(),
          isTimerBased: !isNaN(duration) && duration > 0,
          durationMins: !isNaN(duration) && duration > 0 ? duration : null,
          icon: selectedIcon.id,
          color: selectedIcon.color,
          bg: selectedIcon.bg,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, `users/${user.uid}/habits`), {
          uid: user.uid,
          title: newTaskTitle.trim(),
          streak: 0,
          isTimerBased: !isNaN(duration) && duration > 0,
          durationMins: !isNaN(duration) && duration > 0 ? duration : null,
          icon: selectedIcon.id,
          color: selectedIcon.color,
          bg: selectedIcon.bg,
          createdAt: serverTimestamp()
        });
      }
      setShowAddModal(false);
      setEditingHabit(null);
      setNewTaskTitle('');
      setNewTaskDuration('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/habits`);
    }
  };

  const handleDeleteTask = async (habitId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/habits`, habitId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/habits/${habitId}`);
    }
  };

  const openEditModal = (habit: any) => {
    setEditingHabit(habit);
    setNewTaskTitle(habit.title);
    setNewTaskDuration(habit.durationMins?.toString() || '');
    setNewTaskIcon(habit.icon || 'check');
    setShowAddModal(true);
  };

  const todayStr = new Date().toLocaleDateString('en-CA');
  const completedToday = habits.filter(h => h.lastCompleted === todayStr).length;
  const totalTasks = habits.length;
  const completionRate = totalTasks > 0 ? Math.round((completedToday / totalTasks) * 100) : 0;

  return (
    <div className="p-6 pt-12 min-h-screen bg-[#FDFBF7] dark:bg-gray-950 pb-36 transition-colors duration-300 overflow-y-auto relative overflow-x-hidden">
      {/* Decorative Ambient Background Gradients */}
      <div className="absolute top-0 right-0 w-[240px] h-[240px] sm:w-[500px] sm:h-[500px] bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.14)_0%,rgba(251,191,36,0.08)_30%,rgba(251,146,60,0.02)_60%,transparent_80%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.08)_0%,rgba(251,191,36,0.04)_40%,transparent_75%)] pointer-events-none z-0 transition-opacity duration-500 transform-gpu" />
      <div className="absolute top-0 left-0 w-[180px] h-[180px] sm:w-[350px] sm:h-[350px] bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.10)_0%,rgba(249,115,22,0.05)_40%,transparent_70%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.04)_0%,transparent_60%)] pointer-events-none z-0 transition-opacity duration-500 transform-gpu" />
      {/* Premium Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-1 text-[10px] font-bold text-orange-600 bg-orange-50 dark:bg-orange-950/40 rounded-full uppercase tracking-wider">
              Productivity Engine
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Daily <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">Routine</span>
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Form high-yield habit loops and monitor neural training triggers
          </p>
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="w-11 h-11 rounded-2xl border border-gray-150 dark:border-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 active:scale-95 transition-all shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* Modern Dashboard Statistics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 flex items-center gap-4 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 dark:bg-orange-500/10 rounded-full blur-2xl translate-x-4 -translate-y-4" />
          <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center text-orange-500">
            <Flame className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-xs text-gray-400 block font-medium">Core Streak Factor</span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {habits.length > 0 ? Math.max(0, ...habits.map(h => h.streak || 0)) : 0} <span className="text-xs text-gray-400 font-normal">days</span>
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 flex items-center gap-4 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-2xl translate-x-4 -translate-y-4" />
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-500">
            <Check className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="flex-1">
            <span className="text-xs text-gray-400 block font-medium">Completed Loop Rate</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{completedToday}/{totalTasks}</span>
              <span className="text-xs font-bold text-orange-500">({completionRate}%)</span>
            </div>
          </div>
        </div>

        <div className="p-5 bg-gradient-to-br from-orange-500 to-amber-505 dark:from-orange-950/20 dark:to-orange-900/10 rounded-3xl border border-orange-100/30 dark:border-orange-900/40 shadow-sm relative overflow-hidden">
          <h4 className="text-sm font-bold text-orange-950 dark:text-orange-200 mb-1.5">Daily Completion Progress</h4>
          <p className="text-xs text-orange-850 dark:text-orange-400/80 mb-3">Earn 10 XP points for each confirmed activity!</p>
          <div className="w-full h-2.5 bg-orange-100 dark:bg-orange-900/30 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              className="h-full bg-gradient-to-r from-orange-600 to-amber-500 dark:from-orange-500 dark:to-amber-400 rounded-full"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-gray-900 border border-gray-150/70 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-850 rounded-2xl flex items-center justify-center mb-4 text-gray-400 dark:text-gray-500">
              <Activity className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">No active routines configured</h3>
            <p className="text-sm text-gray-400 max-w-xs mt-1 leading-relaxed">
              Design healthy daily tasks, link timer schedules, and earn consistent cognitive sandbox credits!
            </p>
            <button
              onClick={() => {
                setEditingHabit(null);
                setNewTaskTitle('');
                setNewTaskDuration('');
                setShowAddModal(true);
              }}
              className="mt-5 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-orange-500/15 active:scale-95"
            >
              Configure First Task
            </button>
          </div>
        ) : (
          habits.map((habit) => {
            const isCompleted = habit.lastCompleted === todayStr;
            const habitIconObj = icons.find(i => i.id === habit.icon);
            const IconComponent = habitIconObj ? habitIconObj.component : Activity;

            return (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={habit.id}
                className={`bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group ${
                  isCompleted 
                    ? 'border-orange-100/30 dark:border-orange-950/10 bg-orange-500/[0.01]' 
                    : 'border-gray-100 dark:border-gray-800/30 hover:border-orange-100 dark:hover:border-orange-900/30'
                }`}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Styled Check Status Trigger */}
                  <button 
                    onClick={() => handleComplete(habit.id)}
                    className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all shrink-0 ${
                      isCompleted 
                        ? 'border-orange-500 bg-orange-500 text-white shadow-md shadow-orange-500/10' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-orange-500 hover:scale-105 bg-gray-50/50 dark:bg-gray-800/40'
                    }`}
                  >
                    <AnimatePresence>
                      {isCompleted && (
                        <motion.div
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0 }}
                        >
                          <Check className="w-4 h-4 text-white stroke-[3]" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>

                  {/* Icon Frame */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-300 ${
                    habitIconObj?.bg ? habitIconObj.bg + ' dark:bg-opacity-10' : 'bg-orange-50 dark:bg-orange-950/20'
                  } ${habitIconObj?.color || 'text-orange-500'}`}>
                    <IconComponent className="w-6 h-6 stroke-[2]" />
                  </div>

                  {/* Labels Section */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-base tracking-tight leading-snug transition-all ${
                      isCompleted 
                        ? 'text-gray-400 dark:text-gray-500 line-through' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {habit.title}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-1 ">
                      <span className="inline-flex items-center text-xs font-semibold text-orange-500 dark:text-orange-400 bg-orange-500/5 px-2 py-0.5 rounded-lg">
                        <Flame className="w-3.5 h-3.5 mr-0.5 stroke-[2.2] fill-orange-500 animate-pulse text-orange-500" />
                        {habit.streak || 0}d Streak
                      </span>
                      {habit.durationMins && (
                        <span className="inline-flex items-center text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-lg">
                          <Timer className="w-3.5 h-3.5 mr-1 text-gray-400 dark:text-gray-500" />
                          {habit.durationMins} mins
                        </span>
                      )}
                      {isCompleted && (
                        <span className="inline-flex items-center text-[10px] font-extrabold uppercase tracking-wider text-orange-600 dark:text-orange-400 px-2 py-0.5 bg-orange-500/10 rounded-lg">
                          Done Today
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Controls Area */}
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 w-full sm:w-auto h-12 border-t sm:border-t-0 border-gray-100 dark:border-gray-800/40 pt-2.5 sm:pt-0">
                  {habit.durationMins && (
                    <button 
                      onClick={() => {
                        setActiveTimerHabit(habit);
                        setTimeLeft(habit.durationMins * 60);
                        setIsTimerRunning(false);
                      }}
                      disabled={isCompleted}
                      className={`h-10 px-3.5 rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-1.5 transition-all ${
                        isCompleted
                          ? 'bg-gray-50 dark:bg-gray-850/50 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                          : 'bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100/85 active:scale-95'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 stroke-[2.5]" />
                      Launch Timer
                    </button>
                  )}
                  <button 
                    onClick={() => openEditModal(habit)}
                    className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-gray-850 dark:hover:bg-gray-800 text-gray-400 hover:text-orange-500 active:scale-95 transition-all flex items-center justify-center border border-transparent dark:border-gray-800"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteTask(habit.id)}
                    className="w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-955/20 dark:hover:bg-red-950/40 text-red-500 flex items-center justify-center hover:scale-105 active:scale-95 transition-all border border-transparent dark:border-red-950/25"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Persistent Floating Bottom Call-To-Action Container */}
      <button 
        onClick={() => {
          setEditingHabit(null);
          setNewTaskTitle('');
          setNewTaskDuration('');
          setShowAddModal(true);
        }}
        className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-orange-600 scale-100 hover:scale-105 active:scale-95 hover:shadow-orange-500/20 transition-all z-40 cursor-pointer"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Fine-Artistic Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-gray-950/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-7 max-w-md w-full shadow-2xl relative border border-gray-100 dark:border-gray-800 transition-colors duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <button 
                onClick={() => setShowAddModal(false)} 
                className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-850 text-gray-400 hover:text-gray-600 hover:rotate-90 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
              
              <h3 className="text-xl font-extrabold text-gray-905 dark:text-white mb-6 tracking-tight">
                {editingHabit ? 'Modify Routine Item' : 'Create Routine Item'}
              </h3>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-450 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Task Name
                  </label>
                  <input 
                    type="text" 
                    value={newTaskTitle} 
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="e.g. Brain Warmup Exercise" 
                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-gray-900 dark:text-white transition-all text-sm font-medium"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-gray-450 dark:text-gray-400 uppercase tracking-wider">
                      Timer Scheduling
                    </label>
                    <span className="text-[10px] text-gray-400 font-medium">Optional - triggers stopwatch layout</span>
                  </div>
                  <input 
                    type="number" 
                    value={newTaskDuration} 
                    onChange={(e) => setNewTaskDuration(e.target.value)}
                    placeholder="Duration in Minutes" 
                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-gray-900 dark:text-white transition-all text-sm font-medium animate-none"
                  />
                </div>
                
                <div className="pt-2">
                  <label className="block text-xs font-bold text-gray-455 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Atheletic Visual Icon Representation
                  </label>
                  <div className="grid grid-cols-4 gap-3 max-h-48 overflow-y-auto p-2 border border-gray-100 dark:border-gray-800/80 rounded-2xl bg-gray-50/50 dark:bg-gray-950/40 custom-scrollbar">
                    {icons.map((icon) => {
                      const IconComp = icon.component;
                      return (
                        <button
                          key={`routine-modal-${icon.id}`}
                          type="button"
                          onClick={() => setNewTaskIcon(icon.id)}
                          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                            icon.bg
                          } dark:bg-opacity-10 ${icon.color} ${
                            newTaskIcon === icon.id 
                              ? 'ring-2 ring-offset-2 ring-orange-500 scale-105 font-bold dark:ring-offset-gray-900' 
                              : 'hover:scale-105 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <IconComp className="w-5 h-5 stroke-[2]" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100 dark:border-gray-800/50">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3.5 bg-gray-50 dark:bg-gray-850 hover:bg-gray-100 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-bold transition-colors active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddTask} 
                  className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white bg-orange-500 hover:bg-orange-600 shadow-md shadow-orange-500/20 hover:shadow-orange-500/30 transition-all active:scale-95"
                >
                  {editingHabit ? 'Save' : 'Build Loop'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Verification Dialog Modal */}
      <AnimatePresence>
        {showVerification && (
          <div className="fixed inset-0 bg-gray-950/65 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-gray-100 dark:border-gray-800"
            >
              <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-100/50 dark:border-amber-900/30 shadow-sm animate-bounce">
                <Activity className="w-8 h-8 stroke-[2]" />
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2 leading-tight">
                {t('home.dontCheat')}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                {t('home.reallyCompleted')}
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => confirmCompletion(showVerification!, false)} 
                  className="flex-1 py-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-850 text-gray-500 dark:text-gray-300 rounded-xl font-bold text-sm transition-colors active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => confirmCompletion(showVerification!, true)} 
                  className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-md active:scale-95 transition-all"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Premium Circular Timer Countdown Screen Modal */}
      <AnimatePresence>
        {activeTimerHabit && (
          <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-lg z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 15 }} 
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-gray-150 dark:border-gray-850 relative"
            >
              {/* Escape Button */}
              <button 
                onClick={() => { setActiveTimerHabit(null); setIsTimerRunning(false); }} 
                className="absolute top-5 right-5 w-8 h-8 bg-gray-50 dark:bg-gray-850 hover:bg-gray-150 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:rotate-90 transition-all cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2]" />
              </button>

              {/* Task Indicator */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 dark:bg-orange-955/20 text-orange-600 dark:text-orange-400 text-xs font-bold rounded-full mb-6">
                <Timer className="w-3.5 h-3.5 animate-pulse" />
                Active Focus Session
              </div>
              
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-6">
                {activeTimerHabit.title}
              </h3>

              {/* Custom High-Contrast SVG Circular Timer Arc */}
              <div className="relative w-44 h-44 mx-auto mb-8 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle 
                    cx="88" 
                    cy="88" 
                    r="80" 
                    className="stroke-gray-100 dark:stroke-gray-800" 
                    strokeWidth="8" 
                    fill="transparent" 
                  />
                  <motion.circle 
                    cx="88" 
                    cy="88" 
                    r="80" 
                    className="stroke-orange-500" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray={2 * Math.PI * 80}
                    animate={{
                      strokeDashoffset: (2 * Math.PI * 80) * (1 - (timeLeft / (activeTimerHabit.durationMins * 60)))
                    }}
                    transition={{ duration: 0.5, ease: 'linear' }}
                  />
                </svg>

                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-mono font-extrabold text-gray-905 dark:text-white tracking-tight leading-none">
                    {formatTime(timeLeft)}
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mt-1.5">
                    Remaining
                  </span>
                </div>
              </div>

              {/* Multi-Button Responsive Action Deck */}
              <div className="flex justify-center items-center gap-4 mb-8">
                <button 
                  onClick={() => setTimeLeft(activeTimerHabit.durationMins * 60)} 
                  className="w-12 h-12 rounded-2xl bg-gray-50 hover:bg-gray-100 dark:bg-gray-850 hover:text-orange-600 flex items-center justify-center text-gray-400 transition-all active:scale-90 border border-transparent dark:border-gray-850"
                  title="Reset Stopwatch"
                >
                  <RotateCcw className="w-5 h-5 stroke-[2.2]" />
                </button>
                
                <button 
                  onClick={() => setIsTimerRunning(!isTimerRunning)} 
                  className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all active:scale-95 ${
                    isTimerRunning 
                      ? 'bg-gray-900 hover:bg-black text-white shadow-gray-900/10' 
                      : 'bg-orange-500 hover:bg-orange-605 shadow-orange-500/20'
                  }`}
                >
                  {isTimerRunning ? (
                    <Pause className="w-8 h-8 stroke-[2.5]" />
                  ) : (
                    <Play className="w-8 h-8 stroke-[2.5] ml-1" />
                  )}
                </button>
              </div>

              {/* Loop Completing Dispatch CTA */}
              <button 
                onClick={() => { 
                  confirmCompletion(activeTimerHabit.id, true); 
                  setActiveTimerHabit(null); 
                  setIsTimerRunning(false); 
                }} 
                className="w-full py-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-orange-500 to-amber-500 cursor-pointer shadow-md hover:shadow-lg hover:shadow-orange-500/20 transition-all active:scale-95"
              >
                Complete Session & Store Credits
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
