import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Share2, 
  Brain, 
  Activity, 
  Award, 
  Calendar, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  Target, 
  ArrowLeft, 
  Search, 
  TrendingUp, 
  SlidersHorizontal 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell,
  AreaChart,
  Area
} from 'recharts';

export default function Analytics() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<any[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [completions, setCompletions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'cognitive' | 'routines'>('cognitive');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState<'all' | '7days' | '30days'>('all');

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

  // Helper date parsing
  const getLocalDateStr = (timestamp: any) => {
    if (!timestamp) return '';
    const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    if (!d || isNaN(d.getTime())) return typeof timestamp === 'string' ? timestamp : '';
    return d.toLocaleDateString('en-CA');
  };

  // Dynamic filter based on Time Range Selection
  const filteredSessionsByTime = sessions.filter(session => {
    if (timeRange === 'all') return true;
    const date = session.playedAt?.toDate ? session.playedAt.toDate() : new Date(session.playedAt);
    if (!date || isNaN(date.getTime())) return true;
    const diffTime = Math.abs(new Date().getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (timeRange === '7days') return diffDays <= 7;
    if (timeRange === '30days') return diffDays <= 30;
    return true;
  });

  const filteredCompletionsByTime = completions.filter(c => {
    if (timeRange === 'all') return true;
    const date = c.completedAt?.toDate ? c.completedAt.toDate() : new Date(c.completedAt);
    if (!date || isNaN(date.getTime())) return true;
    const diffTime = Math.abs(new Date().getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (timeRange === '7days') return diffDays <= 7;
    if (timeRange === '30days') return diffDays <= 30;
    return true;
  });

  // Accurate summary metrics
  const totalScoreInTimeRange = filteredSessionsByTime.reduce((sum, s) => sum + s.score, 0);
  const averageScoreInTimeRange = filteredSessionsByTime.length > 0 ? Math.round(totalScoreInTimeRange / filteredSessionsByTime.length) : 0;
  const bestSingleScoreInTimeRange = filteredSessionsByTime.length > 0 ? Math.max(...filteredSessionsByTime.map(s => s.score)) : 0;

  // Search filter logic
  const searchedSessions = filteredSessionsByTime.filter(session => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (session.gameTitle || '').toLowerCase().includes(q) ||
      (session.category || '').toLowerCase().includes(q) ||
      String(session.score).toLowerCase().includes(q)
    );
  });

  const searchedHabits = habits.filter(habit => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const status = habit.lastCompleted === new Date().toLocaleDateString('en-CA') ? 'satisfied' : 'pending';
    return (
      (habit.title || '').toLowerCase().includes(q) ||
      String(habit.streak || 0).toLowerCase().includes(q) ||
      status.includes(q)
    );
  });

  // Calculate Cognitive Core Strengths based on active session filtering
  const categoryData = filteredSessionsByTime.reduce((acc, session) => {
    acc[session.category] = (acc[session.category] || 0) + session.score;
    return acc;
  }, {} as Record<string, number>);

  const categoryMetas: Record<string, { desc: string; focus: string }> = {
    'Focus': { desc: 'Reaction speed, attention span under stress', focus: 'Latency, sustained vigil' },
    'Memory': { desc: 'Visual recognition and recall durability', focus: 'Recall retention, sequence span' },
    'Logic': { desc: 'Relational synthesis, rule deduction speed', focus: 'Deductive leaps, spatial layout' },
    'Math': { desc: 'Mental calculus efficiency and accuracy rate', focus: 'Numerical fluidity, speed rules' },
    'Language': { desc: 'Linguistic parsing and word retrieval', focus: 'Vocabulary access, syntax mapping' }
  };

  const categories = ['Focus', 'Memory', 'Logic', 'Math', 'Language'];
  const maxScoreAchieved = Math.max(...(Object.values(categoryData) as number[]), 100);

  // Recharts specific data structures for dynamic attributes graph
  const rechartsBarData = categories.map((cat, i) => {
    const score = categoryData[cat] || 0;
    const value = Math.round((score / maxScoreAchieved) * 100);
    return {
      name: cat,
      score,
      value: value || 8,
      color: ['#F97316', '#8B5CF6', '#F59E0B', '#3B82F6', '#10B981'][i % 5],
      textColor: ['text-orange-600 dark:text-orange-400', 'text-purple-600 dark:text-purple-400', 'text-amber-600 dark:text-amber-400', 'text-blue-600 dark:text-blue-400', 'text-emerald-600 dark:text-emerald-400'][i % 5],
      bgColor: ['bg-orange-50 dark:bg-orange-950/20', 'bg-purple-50 dark:bg-purple-950/20', 'bg-amber-50 dark:bg-amber-950/20', 'bg-blue-50 dark:bg-blue-950/20', 'bg-emerald-50 dark:bg-emerald-950/20'][i % 5],
      meta: categoryMetas[cat]
    };
  });

  // Dynamic Performance Coefficient
  const calculatedPerformanceCoefficient = totalScoreInTimeRange > 0 ? Math.min(99, Math.round(50 + totalScoreInTimeRange / 55)) : 0;

  // Calculate Daily Task Completion Consistency Charts
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString('en-CA');
  });

  const formattedWeeklyData = last7Days.map(date => {
    const count = filteredCompletionsByTime.filter(c => getLocalDateStr(c.completedAt) === date || c.date === date).length;
    const parsedDate = new Date(date);
    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][parsedDate.getDay()];
    const displayLabel = `${dayName} ${parsedDate.getDate()}`;
    return {
      date: displayLabel,
      unformattedDate: date,
      completions: count,
    };
  });

  // Task Consistency Summary Indicators
  const todayStr = new Date().toLocaleDateString('en-CA');
  const completedToday = habits.filter(h => h.lastCompleted === todayStr).length;
  const totalTasks = habits.length;
  const taskCompletionRate = totalTasks > 0 ? (completedToday / totalTasks) * 100 : 0;

  const handleShare = async () => {
    const shareData = {
      title: 'My NAITIX Progress Card',
      text: `I've reached brain Training Level ${profile?.level || 1} with ${profile?.xp || 0} XP and completed ${completedToday}/${totalTasks} of my daily loops on NAITIX!`,
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
        try {
          await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
          toast.success('Your cognitive metrics card copied successfully!');
        } catch {
          toast.error('Could not copy card details to clipboard');
        }
      }
    }
  };

  const formatSessionDate = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    if (!d || isNaN(d.getTime())) return 'Recently completed';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-3.5 shadow-xl border-0 text-left">
          <p className="text-gray-450 dark:text-gray-400 text-[10px] uppercase font-bold tracking-wider">{payload[0].payload.name || payload[0].payload.date}</p>
          <p className="text-[#FF7A00] font-black text-sm mt-0.5">{payload[0].name}: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 pt-12 min-h-screen bg-[#FDFBF7] dark:bg-gray-950 pb-36 transition-colors duration-300 overflow-y-auto relative overflow-x-hidden">
      {/* Dynamic Aura Background */}
      <div className="absolute top-0 right-0 w-[240px] h-[240px] sm:w-[500px] sm:h-[500px] bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.12)_0%,rgba(251,191,36,0.06)_35%,transparent_85%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.06)_0%,transparent_80%)] pointer-events-none z-0 transform-gpu" />

      {/* Premium Header Layout */}
      <header className="flex justify-between items-center mb-8 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-[9px] font-extrabold text-[#F97316] bg-orange-100/60 dark:bg-orange-950/40 rounded-full uppercase tracking-widest">
              Verified Telemetry Logs
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Performance <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">Insights</span>
          </h1>
        </div>
        
        <button 
          onClick={() => navigate(-1)}
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all shadow-sm shrink-0 bg-white dark:bg-gray-900 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 shrink-0 stroke-[2.2]" />
        </button>
      </header>

      {/* Profile Overview Widget */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.015)] mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-orange-500/8 to-amber-500/4 rounded-full blur-3xl translate-x-12 -translate-y-12" />
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-[22px] bg-orange-500/5 text-[#FF7A00] flex items-center justify-center">
              <Brain className="w-9 h-9 stroke-[2.2] animate-pulse" />
            </div>
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#FF7A00]">COGNITIVE RANK</span>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white leading-tight mt-0.5">
                Level {profile?.level || 1} <span className="text-sm font-bold text-gray-450 dark:text-gray-500">Active</span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5 font-medium">Synced securely with verified Firestore databases</p>
            </div>
          </div>

          <div className="flex text-left md:text-right gap-6 md:gap-12 border-t md:border-t-0 border-gray-105 dark:border-gray-805 pt-4 md:pt-0">
            <div>
              <span className="text-[10px] text-gray-450 dark:text-gray-400 font-bold uppercase tracking-wider block">XP Vault</span>
              <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">
                {profile?.xp || 0} <span className="text-xs font-bold text-orange-500">XP</span>
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-450 dark:text-gray-400 font-bold uppercase tracking-wider block">Active Records</span>
              <span className="text-3xl font-black text-gray-900 dark:text-white">
                {sessions.length + completions.length} <span className="text-xs font-bold text-gray-400">runs</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Search & Time Filter Module */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.015)] mb-6 flex flex-col md:flex-row items-center justify-between gap-4 relative z-15">
        <div className="relative w-full md:max-w-md">
          <input 
            type="text" 
            placeholder={activeTab === 'cognitive' ? "Search cognitive trials, categories, scores..." : "Search routines, strengths, streaks..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FDFBF7] dark:bg-gray-950 rounded-2xl py-3.5 pl-11 pr-10 outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400 border border-orange-500/10 dark:border-orange-500/5 focus:border-orange-500 transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-650"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto shrink-0 select-none">
          {(['all', '7days', '30days'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`flex-1 md:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                timeRange === range
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/10'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-150'
              } cursor-pointer`}
            >
              {range === 'all' && 'All Time'}
              {range === '7days' && 'Last 7 Days'}
              {range === '30days' && 'Last 30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Select Controller */}
      <div className="flex bg-gray-100/70 dark:bg-gray-950 p-1.5 rounded-2xl mb-8 max-w-md relative z-10">
        <button
          onClick={() => setActiveTab('cognitive')}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
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
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'routines'
              ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-950'
          }`}
        >
          <Calendar className="w-4 h-4 stroke-[2.2]" />
          Task Consistency
        </button>
      </div>

      {/* Main Tab Views */}
      <AnimatePresence mode="wait">
        {activeTab === 'cognitive' ? (
          <motion.div
            key="cognitive-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Cognitive Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-900 p-4.5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.015)]">
                <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider mb-1">Average Score</span>
                <span className="text-2xl font-black text-gray-900 dark:text-white">{averageScoreInTimeRange} <span className="text-xs font-bold text-gray-400">pts</span></span>
              </div>
              <div className="bg-white dark:bg-gray-900 p-4.5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.015)]">
                <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider mb-1">Single Best</span>
                <span className="text-2xl font-black text-[#F97316]">{bestSingleScoreInTimeRange} <span className="text-xs font-bold text-gray-400">pts</span></span>
              </div>
              <div className="bg-[#FF7A00]/5 p-4.5 rounded-2xl col-span-2 sm:col-span-1 shadow-[0_8px_30px_rgba(0,0,0,0.015)]">
                <span className="text-[10px] font-bold text-[#FF7A00] block uppercase tracking-wider mb-1">Active Sessions</span>
                <span className="text-2xl font-black text-[#FF7A00]">{filteredSessionsByTime.length} <span className="text-xs text-[#FF7A00]/70 font-bold">trials</span></span>
              </div>
            </div>

            {/* Cognitive Attribute Strengths graph - Utilizing Recharts */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-950 dark:text-white">Brain Attribute Strengths</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Scoring index distribution across {sessions.length} sessions</p>
                </div>
                <div className="px-3 py-1 bg-orange-500/5 text-[#F97316] text-xs font-extrabold rounded-lg">
                  Performance Coefficient: {calculatedPerformanceCoefficient}%
                </div>
              </div>

              {/* High Fidelity Interactive Recharts BarChart */}
              <div className="h-72 w-full pt-2 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={rechartsBarData}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: -10, bottom: 5 }}
                  >
                    <XAxis type="number" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(249,115,22,0.02)' }} />
                    <Bar dataKey="score" name="Points" radius={[0, 8, 8, 0]} barSize={16}>
                      {rechartsBarData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed Cognitive Dissection Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {rechartsBarData.map((item, index) => (
                <div 
                  key={`bento-${index}`} 
                  className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.015)] flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className={`text-[10px] font-extrabold tracking-widest uppercase block ${item.textColor}`}>
                        {item.name} Area
                      </span>
                      <h4 className="text-base font-bold text-gray-950 dark:text-white mt-1">
                        {item.meta.desc}
                      </h4>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-black rounded-lg ${item.bgColor} ${item.textColor}`}>
                      {item.score} pt
                    </span>
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-800/30 pt-3 mt-4 text-xs flex justify-between text-gray-400 font-medium">
                    <span>Variables Tracked:</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{item.meta.focus}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Trial Feed with Dynamic Live Instant Filter */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold text-lg text-gray-955 dark:text-white">Recent Cog Training Trials</h3>
                  <p className="text-xs text-gray-400">Total trials matching: {searchedSessions.length} sessions</p>
                </div>
                <Award className="w-5 h-5 text-amber-500" />
              </div>

              {searchedSessions.length === 0 ? (
                <div className="text-center py-12 bg-gray-50/50 dark:bg-gray-900/30 rounded-2xl">
                  <p className="text-sm font-semibold text-gray-500">No training trials match your search query</p>
                  <p className="text-xs text-gray-450 mt-1">Try resetting the search terms or try another training tag!</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {searchedSessions.map((session, i) => (
                    <div 
                      key={`session-${session.id || i}`} 
                      className="p-4 rounded-2xl bg-[#FDFBF7] dark:bg-gray-900/45 flex justify-between items-center group transition-all shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-orange-500/5 text-[#FF7A00] flex items-center justify-center">
                          <Activity className="w-4.5 h-4.5 stroke-[2.2]" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-gray-900 dark:text-white leading-tight">
                            {session.gameTitle || 'Cognitive Challenge'}
                          </h4>
                          <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1.5 mt-0.5">
                            <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-900 rounded-md font-bold text-orange-600 dark:text-orange-400">
                              {session.category}
                            </span>
                            • {formatSessionDate(session.playedAt)}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-extrabold text-[#FF7A00]">
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
            {/* Task Performance Row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.015)] text-center">
                <span className="text-[10px] font-bold text-gray-450 block uppercase tracking-wider mb-1">Satisfied Loop</span>
                <span className="text-2xl font-black text-gray-900 dark:text-white">{completedToday}/{totalTasks}</span>
              </div>
              <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.015)] text-center">
                <span className="text-[10px] font-bold text-gray-450 block uppercase tracking-wider mb-1">Completion Rate</span>
                <span className="text-2xl font-black text-orange-500">{Math.round(taskCompletionRate)}%</span>
              </div>
              <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.015)] text-center">
                <span className="text-[10px] font-bold text-gray-450 block uppercase tracking-wider mb-1">Peak Streak</span>
                <span className="text-2xl font-black text-amber-500">
                  {habits.length > 0 ? Math.max(0, ...habits.map(h => h.streak || 0)) : 0}d
                </span>
              </div>
            </div>

            {/* Weekly Consistency Progress AreaChart */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-lg text-gray-950 dark:text-white">Weekly Task Consistency</h3>
                  <p className="text-xs text-gray-400">Total task completions logged across this period</p>
                </div>
                <span className="text-xs font-bold text-orange-500">{completedToday} loops logged today</span>
              </div>

               {/* Smooth interactive Recharts AreaChart with sunset orange gradient */}
               <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={formattedWeeklyData}
                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="sunsetOrangeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF7A00" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#FF7A00" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="completions" 
                      name="Completions" 
                      stroke="#FF7A00" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#sunsetOrangeGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>            {/* Habit Streaks Filtered Row listing */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
              <h3 className="font-bold text-lg text-gray-950 dark:text-white mb-1.5">Routine Consistency Factors</h3>
              <p className="text-xs text-gray-400 mb-5">Current matching habits list: {searchedHabits.length} elements</p>

              {searchedHabits.length === 0 ? (
                <div className="text-center py-10 bg-gray-50/50 dark:bg-gray-900/30 rounded-2xl">
                  <p className="text-sm font-semibold text-gray-500">No routines match your search terms</p>
                  <p className="text-xs text-gray-450 mt-1">Try searching by "satisfied", "pending", or a routine keyword!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {searchedHabits.map((habit, i) => (
                    <div 
                      key={`habit-${habit.id || i}`} 
                      className="p-4 rounded-2xl bg-[#FDFBF7] dark:bg-gray-900/40 flex justify-between items-center transition-all shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-100/40 dark:bg-orange-955/20 text-orange-600 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-gray-900 dark:text-white leading-tight">{habit.title}</h4>
                          <span className="text-[10px] text-gray-400 mt-0.5 block font-semibold">↗ Streak Rate: {habit.streak || 0}d</span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {habit.lastCompleted === todayStr ? (
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

            {/* Interactive Neural Milestones Panel */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
              <h3 className="font-bold text-lg text-gray-950 dark:text-white mb-1">Neural Unlocks & Milestones</h3>
              <p className="text-xs text-gray-405 mb-5">Advance your skills to unlock persistent status indicators</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-gray-950/45 flex gap-3 relative">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/5 flex items-center justify-center text-[#FF7A00] self-start shrink-0 animate-pulse">
                     <Award className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white font-sans">First Step Loop</h4>
                    <p className="text-xs text-gray-400 leading-normal mt-0.5">Satisfie your first routine loop commitment.</p>
                    <span className="inline-block mt-2 text-[9px] font-extrabold uppercase text-emerald-500">Unlocked ✓</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50/30 dark:bg-gray-900/10 flex gap-3 relative opacity-60">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-gray-400 self-start shrink-0">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Neural Optimizer</h4>
                    <p className="text-xs text-gray-400 leading-normal mt-0.5">Maintain a 5-day consecutive streak factor.</p>
                    <span className="inline-block mt-2 text-[9px] font-bold uppercase text-gray-405">Locked</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Progress Trigger */}
      <div className="mt-8 relative z-10">
        <button 
          onClick={handleShare}
          className="w-full bg-[#F97316] text-white py-4 rounded-2xl font-bold text-base hover:bg-orange-600 active:scale-95 hover:shadow-lg hover:shadow-orange-500/15 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-orange-500/10 border-none"
        >
          <Share2 className="w-5 h-5" />
          Export Intelligence Telemetry Card
        </button>
      </div>
    </div>
  );
}
