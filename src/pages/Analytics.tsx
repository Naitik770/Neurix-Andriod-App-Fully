import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { X, Share2, Brain, Activity, Award, Flame, Calendar, Clock, BarChart3, TrendingUp, Sparkles, Check, CheckCircle2, ChevronRight, Zap, Target, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Analytics() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<any[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [completions, setCompletions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'cognitive' | 'routines'>('cognitive');

  useEffect(() => {
    if (!profile?.uid) return;
    
    // Fetch Game Sessions
    const qGames = query(collection(db, 'users', profile.uid, 'gameSessions'), orderBy('playedAt', 'desc'));
    const unsubscribeGames = onSnapshot(qGames, (snapshot) => {
      setSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${profile.uid}/gameSessions`));

    // Fetch Habits (Tasks)
    const qHabits = query(collection(db, 'users', profile.uid, 'habits'));
    const unsubscribeHabits = onSnapshot(qHabits, (snapshot) => {
      setHabits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${profile.uid}/habits`));

    // Fetch Habit Completions
    const qCompletions = query(collection(db, 'users', profile.uid, 'habitCompletions'), orderBy('completedAt', 'desc'));
    const unsubscribeCompletions = onSnapshot(qCompletions, (snapshot) => {
      setCompletions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${profile.uid}/habitCompletions`));

    return () => {
      unsubscribeGames();
      unsubscribeHabits();
      unsubscribeCompletions();
    };
  }, [profile?.uid]);

  const categoryData = sessions.reduce((acc, session) => {
    acc[session.category] = (acc[session.category] || 0) + session.score;
    return acc;
  }, {} as Record<string, number>);

  // Mapped sub-texts for individual focus areas to look incredibly detailed
  const categoryMetas: Record<string, { desc: string; focus: string }> = {
    'Focus': { desc: 'Reaction speed, attention span under stress', focus: 'Latency, sustained vigil' },
    'Memory': { desc: 'Visual recognition and recall durability', focus: 'Recall retention, sequence span' },
    'Logic': { desc: 'Relational synthesis, rule deduction speed', focus: 'Deductive leaps, spatial layout' },
    'Math': { desc: 'Mental calculus efficiency and accuracy rate', focus: 'Numerical fluidity, speed rules' }
  };

  const categories = ['Focus', 'Memory', 'Logic', 'Math'];
  const maxScoreAchieved = Math.max(...(Object.values(categoryData) as number[]), 100);
  const chartData = categories.map((cat, i) => {
    const score = categoryData[cat] || 0;
    const value = (score / maxScoreAchieved) * 100;
    return {
      label: cat,
      score,
      value: value || 0,
      color: ['bg-orange-500', 'bg-purple-550', 'bg-amber-500', 'bg-blue-500'][i],
      textColor: ['text-orange-600 dark:text-orange-400', 'text-purple-600 dark:text-purple-400', 'text-amber-600 dark:text-amber-400', 'text-blue-600 dark:text-blue-400'][i],
      bgColor: ['bg-orange-50 dark:bg-orange-950/20', 'bg-purple-50 dark:bg-purple-950/20', 'bg-amber-50 dark:bg-amber-950/20', 'bg-blue-50 dark:bg-blue-950/20'][i],
      meta: categoryMetas[cat]
    };
  });

  // Calculate overall performance coefficient
  const totalRawGameScore = (Object.values(categoryData) as number[]).reduce((a: number, b: number) => a + b, 0);
  const calculatedPerformanceCoefficient = totalRawGameScore > 0 ? Math.min(99, Math.round(50 + totalRawGameScore / 55)) : 0;

  // Calculate Weekly Task Completion Data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const weeklyTaskData = last7Days.map(date => {
    const count = completions.filter(c => c.date === date).length;
    return { date, count };
  });

  const maxCompletions = Math.max(...weeklyTaskData.map(d => d.count), 1);
  const weeklyTaskChart = weeklyTaskData.map(d => ({
    ...d,
    height: (d.count / maxCompletions) * 100
  }));

  // Calculate Task Stats
  const today = new Date().toISOString().split('T')[0];
  const completedToday = habits.filter(h => h.lastCompleted === today).length;
  const totalTasks = habits.length;
  const taskCompletionRate = totalTasks > 0 ? (completedToday / totalTasks) * 100 : 0;

  const handleShare = async () => {
    const shareData = {
      title: 'My NEURIX Progress',
      text: `I've earned ${profile?.xp || 0} XP and completed ${completedToday}/${totalTasks} tasks today on NEURIX! Check out my brain training progress.`,
      url: window.location.origin
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        throw new Error('Web Share API not supported');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing:', err);
        try {
          await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
          toast.success('Your cognitive stats copied to clipboard!');
        } catch (clipErr) {
          toast.error('Could not copy to clipboard');
        }
      }
    }
  };

  const formatSessionDate = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-6 pt-12 min-h-screen bg-[#FDFBF7] dark:bg-gray-950 pb-36 transition-colors duration-300 overflow-y-auto">
      {/* Premium Navigation Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-[9px] font-extrabold text-orange-650 bg-orange-100/60 dark:bg-orange-950/40 rounded-full uppercase tracking-widest">
              Cognitive Telemetry
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Performance <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">Insights</span>
          </h1>
        </div>
        
        <button 
          onClick={() => navigate(-1)}
          className="w-11 h-11 rounded-2xl border border-gray-150 dark:border-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 active:scale-95 transition-all shadow-sm shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </header>

      {/* Hero Intelligence Overview Widget */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800/30 shadow-sm mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-br from-orange-500/10 to-amber-500/5 rounded-full blur-3xl translate-x-8 -translate-y-8" />
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-950/30 text-orange-500 flex items-center justify-center border border-orange-100/30">
              <Brain className="w-9 h-9 stroke-[2.2] animate-pulse" />
            </div>
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-orange-500">Overall Sandbox IQ IQ-Level</span>
              <h2 className="text-3xl font-black text-gray-905 dark:text-white leading-tight mt-0.5">
                Level {profile?.level || 1} <span className="text-sm font-medium text-gray-400 dark:text-gray-500">Active</span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5 font-medium">Accumulating cognitive neural points daily</p>
            </div>
          </div>

          <div className="flex text-left md:text-right gap-6 md:gap-12 border-t md:border-t-0 border-gray-100 dark:border-gray-800 pt-4 md:pt-0">
            <div>
              <span className="text-[10px] text-gray-450 dark:text-gray-400 font-bold uppercase tracking-wider block">XP Vault</span>
              <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">
                {profile?.xp || 0} <span className="text-xs font-bold text-orange-500">XP</span>
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-450 dark:text-gray-400 font-bold uppercase tracking-wider block">Completed Exercises</span>
              <span className="text-3xl font-black text-gray-900 dark:text-white">
                {sessions.length + completions.length} <span className="text-xs font-bold text-gray-400">runs</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Segmented Controller (Professional Tabs) */}
      <div className="flex bg-gray-100/70 dark:bg-gray-950 p-1.5 rounded-2xl border border-gray-150/40 dark:border-gray-800 mb-8 max-w-md">
        <button
          onClick={() => setActiveTab('cognitive')}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'cognitive'
              ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-950'
          }`}
        >
          <Zap className="w-4 h-4 stroke-[2.2]" />
          Cognitive Analytics
        </button>
        <button
          onClick={() => setActiveTab('routines')}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'routines'
              ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-950'
          }`}
        >
          <Calendar className="w-4 h-4 stroke-[2.2]" />
          Task Consistency
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'cognitive' ? (
          <motion.div
            key="cognitive-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Cognitive Strengths Bar Chart */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800/30 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-950 dark:text-white">Brain Attribute Strengths</h3>
                  <p className="text-xs text-gray-450 mt-0.5">Normalized index scoring across verified trials</p>
                </div>
                <div className="px-3 py-1 bg-orange-500/5 text-orange-650 dark:text-orange-400 text-xs font-extrabold rounded-lg">
                  Performance Coeff: {calculatedPerformanceCoefficient}%
                </div>
              </div>

              {/* Enhanced Chart Columns */}
              <div className="flex justify-between items-end h-64 mb-4 px-2.5 pt-6 bg-gray-50/50 dark:bg-gray-950/20 rounded-3xl border border-gray-100/50 dark:border-gray-900/30">
                {chartData.map((item, index) => (
                  <div key={index} className="flex flex-col items-center gap-2.5 w-16">
                    <div className="w-4.5 h-44 bg-gray-150 dark:bg-gray-800 rounded-full relative overflow-hidden flex flex-col justify-end">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${item.value || 8}%` }}
                        transition={{ duration: 1, delay: index * 0.1, type: 'spring' }}
                        className={`w-full rounded-full ${item.color} relative cursor-pointer`}
                        title={`${item.label}: ${item.score} Points`}
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-805 dark:text-gray-300 leading-none">{item.label}</span>
                    <span className="text-[10px] font-bold text-gray-400 mb-2">{item.score} pt</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bento Strength Dissection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {chartData.map((item, index) => (
                <div 
                  key={`bento-${index}`} 
                  className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800/30 shadow-sm flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className={`text-[10px] font-extrabold tracking-widest uppercase block ${item.textColor}`}>
                        {item.label} Area
                      </span>
                      <h4 className="text-base font-bold text-gray-905 dark:text-white mt-1">
                        {item.meta.desc}
                      </h4>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-black rounded-lg ${item.bgColor} ${item.textColor}`}>
                      {Math.round(item.value)}%
                    </span>
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-800/60 pt-3 mt-4 text-xs flex justify-between text-gray-450 font-medium">
                    <span>Variables Tracked:</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-400">{item.meta.focus}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Game Logs Feed Logs */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800/30 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold text-lg text-gray-905 dark:text-white">Recent Cog Training Trials</h3>
                  <p className="text-xs text-gray-400">Real-time chronicle of individual training runs</p>
                </div>
                <Award className="w-5 h-5 text-amber-500 animate-bounce" />
              </div>

              {sessions.length === 0 ? (
                <div className="text-center py-10 opacity-60">
                  <p className="text-sm text-gray-450">No cognitive sessions launched yet</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {sessions.slice(0, 5).map((session, i) => (
                    <div 
                      key={`session-${session.id || i}`} 
                      className="p-4 rounded-2xl bg-[#FDFBF7] dark:bg-gray-950 border border-gray-100 dark:border-gray-900 flex justify-between items-center group hover:border-orange-100 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-955/20 text-orange-600 flex items-center justify-center">
                          <Activity className="w-4.5 h-4.5 stroke-[2.2]" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-gray-900 dark:text-white leading-tight">
                            {session.gameTitle || 'Sandbox Excercise'}
                          </h4>
                          <span className="text-[10px] text-gray-405 font-medium flex items-center gap-1.5 mt-0.5">
                            <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-900 rounded-md font-bold text-orange-600">
                              {session.category}
                            </span>
                            • {formatSessionDate(session.playedAt)}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-extrabold text-orange-600">
                          +{session.score} XP
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="routines-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Task Stats Row */}
            <div className="grid grid-cols-3 gap-5">
              <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800/30 shadow-sm text-center">
                <span className="text-[10px] font-bold text-gray-405 block uppercase tracking-wider mb-1">Satisfied Loop</span>
                <span className="text-2xl font-black text-gray-900 dark:text-white">{completedToday}/{totalTasks}</span>
              </div>
              <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800/30 shadow-sm text-center">
                <span className="text-[10px] font-bold text-gray-455 block uppercase tracking-wider mb-1">Completion rate</span>
                <span className="text-2xl font-black text-orange-550">{Math.round(taskCompletionRate)}%</span>
              </div>
              <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800/30 shadow-sm text-center">
                <span className="text-[10px] font-bold text-gray-450 block uppercase tracking-wider mb-1">Peak Streak</span>
                <span className="text-2xl font-black text-amber-550">
                  {habits.length > 0 ? Math.max(0, ...habits.map(h => h.streak || 0)) : 0}d
                </span>
              </div>
            </div>

            {/* Weekly Task Consistency Bar-Chart */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800/30 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-lg text-gray-950 dark:text-white">Weekly Task Consistency</h3>
                  <p className="text-xs text-gray-405">Historic habit completions over the last 7 calendar days</p>
                </div>
                <span className="text-xs font-bold text-orange-500">{completedToday} loops logged today</span>
              </div>

              <div className="flex justify-between items-end h-28 gap-2.5 pt-4">
                {weeklyTaskChart.map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-gray-50 dark:bg-gray-950 rounded-xl h-20 relative overflow-hidden flex flex-col justify-end border border-gray-100 dark:border-gray-900">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${day.height}%` }}
                        className={`w-full rounded-b-lg ${
                          i === 6 
                            ? 'bg-gradient-to-t from-orange-600 to-orange-400' 
                            : 'bg-orange-300 dark:bg-orange-900/40'
                        }`}
                      />
                    </div>
                    <span className="text-[9px] font-black text-gray-400 uppercase">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'][(new Date(day.date).getDay())]}
                    </span>
                    <span className="text-[8px] font-bold text-gray-450">{day.count} loop</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Habit Streak Table */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800/30 shadow-sm">
              <h3 className="font-bold text-lg text-gray-905 dark:text-white mb-1.5">Active Routine Consistency Factors</h3>
              <p className="text-xs text-gray-405 mb-5">Ongoing task commitments and satisfied values</p>

              {habits.length === 0 ? (
                <div className="text-center py-8 text-gray-450 text-sm">
                  Configure tasks inside the Daily Routine deck to populate streaks!
                </div>
              ) : (
                <div className="space-y-3">
                  {habits.map((habit, i) => (
                    <div 
                      key={`habit-${habit.id || i}`} 
                      className="p-4 rounded-2xl bg-[#FDFBF7] dark:bg-gray-950 border border-gray-100 dark:border-gray-900 flex justify-between items-center"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-100/40 dark:bg-orange-955/20 text-orange-600 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-gray-900 dark:text-white leading-tight">{habit.title}</h4>
                          <span className="text-[10px] text-gray-400 mt-0.5 block font-medium">↗ Streak coefficient: {habit.streak || 0}d</span>
                        </div>
                      </div>

                      <div>
                        {habit.lastCompleted === today ? (
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-extrabold uppercase rounded-lg">
                            Satisfied
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-orange-500/5 text-orange-500 text-[9px] font-extrabold uppercase rounded-lg">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Locked Achievements & Cognitive Milestones */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800/30 shadow-sm">
              <h3 className="font-bold text-lg text-gray-955 dark:text-white mb-1">Neural Unlocks & Milestones</h3>
              <p className="text-xs text-gray-405 mb-5">Advance to unlock unique visual achievements and multipliers</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-950/20 flex gap-3 relative opacity-100">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-955/20 flex items-center justify-center text-orange-500 self-start">
                    <Award className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white font-sans">First Step Loop</h4>
                    <p className="text-xs text-gray-400 leading-normal mt-0.5">Satisfy your first task on the routine board.</p>
                    <span className="inline-block mt-2 text-[9px] font-extrabold uppercase text-emerald-500">Unlocked ✓</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-850 bg-gray-50/25 dark:bg-gray-955/5 flex gap-3 relative opacity-60">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-gray-400 self-start">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Neural Optimizer</h4>
                    <p className="text-xs text-gray-400 leading-normal mt-0.5">Trigger a 5-day continuous streak coefficient.</p>
                    <span className="inline-block mt-2 text-[9px] font-bold uppercase text-gray-405">Locked</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Progress Button */}
      <div className="mt-8">
        <button 
          onClick={handleShare}
          className="w-full bg-[#F97316] text-white py-4 rounded-2xl font-bold text-base hover:bg-orange-600 active:scale-95 hover:shadow-lg hover:shadow-orange-500/15 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          <Share2 className="w-5 h-5" />
          Export Intelligence Telemetry Card
        </button>
      </div>
    </div>
  );
}
