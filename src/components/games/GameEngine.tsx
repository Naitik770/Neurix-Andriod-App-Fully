import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Play, RotateCcw, Trophy, Lock, Award, CheckCircle2, Sparkles, CloudLightning } from 'lucide-react';
import ColorMatch from './ColorMatch';
import MemoryMatrix from './MemoryMatrix';
import SpeedMatch from './SpeedMatch';
import MathRush from './MathRush';
import WordScramble from './WordScramble';
import PatternRecognition from './PatternRecognition';
import SpatialReasoning from './SpatialReasoning';
import ReactionTime from './ReactionTime';
import LogicFlow from './LogicFlow';
import CognitiveLoadChallenge from './CognitiveLoadChallenge';
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../App';
import { getTargetScore } from './gameScore';

export default function GameEngine({ game, onClose, onComplete }: any) {
  const { profile } = useAuth();
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'gameover'>('intro');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);

  const maxReachedLevel = profile?.gameLevels?.[game.id] || 1;
  const [currentPlayLevel, setCurrentPlayLevel] = useState(game.level || 1);

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle');
  const [xpEarnedState, setXpEarnedState] = useState(0);
  const [passedLevelState, setPassedLevelState] = useState(false);
  const [controlsActive, setControlsActive] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (game.level) {
      setCurrentPlayLevel(game.level);
    }
  }, [game.level]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('gameover');
    }
    return () => clearTimeout(timer);
  }, [gameState, timeLeft]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setGameState('playing');
    setSaveStatus('idle');
    setXpEarnedState(0);
    setPassedLevelState(false);
    setControlsActive(false);
  };

  const handleScore = (points: number) => {
    setScore(prev => {
      const nextScore = prev + points;
      return Number(Number(nextScore).toFixed(2));
    });
  };

  const autoSaveGameResults = async () => {
    if (!profile?.uid || saveStatus !== 'idle') return;
    setSaveStatus('saving');

    const calculatedXp = Math.max(10, Math.floor(score / 5));
    setXpEarnedState(calculatedXp);

    const passingScore = getTargetScore(game.type, currentPlayLevel);
    const isPassed = score >= passingScore;
    setPassedLevelState(isPassed);

    const shouldUpgrade = isPassed && (currentPlayLevel >= maxReachedLevel);

    try {
      const userRef = doc(db, 'users', profile.uid);
      const updates: any = {
        xp: increment(calculatedXp)
      };
      if (shouldUpgrade) {
         updates[`gameLevels.${game.id}`] = increment(1);
      }
      await updateDoc(userRef, updates);

      const sessionsRef = collection(db, 'users', profile.uid, 'gameSessions');
      await addDoc(sessionsRef, {
        uid: profile.uid,
        gameId: game.id.toString(),
        gameName: game.title.split(' Lvl')[0],
        category: game.category,
        score: score,
        xpEarned: calculatedXp,
        passedLevel: isPassed,
        playedAt: serverTimestamp()
      });

      setSaveStatus('saved');
    } catch (error) {
      console.error("Error autosaving results:", error);
      setSaveStatus('failed');
    }
  };

  // Separated timer effect to prevent cleanups on autosave updates
  useEffect(() => {
    if (gameState === 'gameover') {
      setControlsActive(false);
      const timer = setTimeout(() => {
        setControlsActive(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  // Autosave when transitioning to gameover and saveStatus is idle
  useEffect(() => {
    if (gameState === 'gameover' && saveStatus === 'idle') {
      autoSaveGameResults();
    }
  }, [gameState, saveStatus]);

  const renderGame = () => {
    const commonProps = {
      onScore: handleScore,
      isPlaying: gameState === 'playing',
      level: currentPlayLevel
    };

    switch (game.type) {
      case 'Color Match':
        return <ColorMatch {...commonProps} />;
      case 'Memory Matrix':
        return <MemoryMatrix {...commonProps} />;
      case 'Speed Match':
        return <SpeedMatch {...commonProps} />;
      case 'Math Rush':
        return <MathRush {...commonProps} />;
      case 'Word Scramble':
        return <WordScramble {...commonProps} />;
      case 'Pattern Recognition':
        return <PatternRecognition {...commonProps} />;
      case 'Spatial Reasoning':
        return <SpatialReasoning {...commonProps} />;
      case 'Reaction Time':
        return <ReactionTime {...commonProps} />;
      case 'Logic Flow':
        return <LogicFlow {...commonProps} />;
      case 'Cognitive Load Challenge':
        return <CognitiveLoadChallenge {...commonProps} />;
      default:
        return <ColorMatch {...commonProps} />;
    }
  };

  if (gameState === 'gameover') {
    const calculatedXp = Math.max(10, Math.floor(score / 5));
    const targetScore = getTargetScore(game.type, currentPlayLevel);
    const isPassed = score >= targetScore;

    if (!mounted) return null;

    return createPortal(
      <div className="fixed inset-0 bg-[#FDFBF7] dark:bg-gray-950 z-[9999] overflow-y-auto pointer-events-auto transition-colors duration-300 font-sans p-4 sm:p-8">
        <div className="min-h-screen w-full flex flex-col justify-between max-w-xl mx-auto pb-20 relative">
          
          {/* Top Header section */}
          <div className="w-full flex flex-col items-center text-center pt-4 sm:pt-8 shrink-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 font-extrabold rounded-full text-[10px] uppercase tracking-widest mb-4 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-500" />
              Phase Summary
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-black text-gray-950 dark:text-white tracking-tight leading-none mb-1">
              Cognitive Report
            </h1>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-wide">
              {game.title.split(' Lvl')[0]} • Level {currentPlayLevel}
            </p>
          </div>

          {/* Central Core Stats Area */}
          <div className="w-full py-8 flex flex-col items-center my-auto">
            
            {/* Trophy/Achievement Circular Plate */}
            <div className="relative mb-8 flex items-center justify-center">
              {/* Pulsing visual halo */}
              {isPassed && (
                <>
                  <motion.div 
                    animate={{ scale: [1, 1.15, 1], rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                    className="absolute inset-0 rounded-full bg-emerald-500/10 dark:bg-emerald-400/5 filter blur-md"
                  />
                  <motion.div 
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -inset-4 rounded-full border border-dashed border-emerald-500/20 dark:border-emerald-400/10"
                  />
                </>
              )}

              <div className={`w-32 h-32 rounded-full flex items-center justify-center shadow-lg border-4 transition-all duration-300 relative z-10 ${
                isPassed 
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-500 border-white dark:border-gray-800 text-white shadow-emerald-500/20' 
                  : 'bg-gradient-to-br from-orange-400 to-amber-500 border-white dark:border-gray-800 text-white shadow-orange-500/20'
              }`}>
                <Trophy className="w-16 h-16 stroke-[1.5]" />
              </div>
              
              {/* Sparkle badge */}
              {isPassed && (
                <div className="absolute -top-1 -right-1 bg-amber-400 text-gray-950 p-2 rounded-full shadow-md z-20">
                  <Sparkles className="w-4 h-4 animate-bounce text-amber-950 animate-pulse" />
                </div>
              )}
            </div>

            {/* Level Complete / Succeeded Badges */}
            <div className="text-center mb-6">
              {isPassed ? (
                <span className="px-5 py-2 bg-emerald-500 text-white font-black text-xs uppercase tracking-widest rounded-full shadow-md shadow-emerald-500/20">
                  LEVEL UP COMPLETED!
                </span>
              ) : (
                <span className="px-5 py-2 bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-black text-xs uppercase tracking-widest rounded-full">
                  SECTION COMPLETED
                </span>
              )}
              
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-4 font-medium max-w-sm mx-auto px-4 leading-relaxed">
                {isPassed 
                  ? `Amazing work! Your performance unlocked Level ${currentPlayLevel + 1} of this training series.` 
                  : `Solid training effort! Reaching ${targetScore} points unlocks Level ${currentPlayLevel + 1}.`}
              </p>
            </div>

            {/* Visual Bento Metric Cards Grid */}
            <div className="grid grid-cols-2 gap-4 w-full px-2">
              {/* Score Card */}
              <div className="bg-white dark:bg-gray-800/80 p-5 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm transition-colors text-center">
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-1">Total Score</span>
                <span className="text-3xl font-black text-orange-500 tracking-tight block">
                  {Number(score.toFixed(2))}
                </span>
                <span className="text-[10px] font-bold text-gray-400/80 dark:text-gray-500/80 tracking-wide block mt-1">
                  Target: {targetScore} pts
                </span>
              </div>

              {/* XP Gained Card */}
              <div className="bg-white dark:bg-gray-800/80 p-5 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm transition-colors text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-1.5 opacity-10">
                  <CloudLightning className="w-12 h-12 text-amber-500" />
                </div>
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-1">XP Earned</span>
                <span className="text-3xl font-black text-indigo-500 dark:text-indigo-400 tracking-tight block flex items-center justify-center gap-1">
                  +{calculatedXp} <span className="text-xs font-bold text-indigo-400 dark:text-indigo-500 text-[10px]">XP</span>
                </span>
                
                <div className="inline-flex items-center gap-1 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-black tracking-wider uppercase text-emerald-500">
                    {saveStatus === 'saving' ? 'Syncing...' : saveStatus === 'saved' ? 'Saved Cloud' : 'Save Error'}
                  </span>
                </div>
              </div>
            </div>

            {/* Target Progress Bar */}
            <div className="w-full px-2 mt-6">
              <div className="bg-gray-100 dark:bg-gray-800 h-3 w-full rounded-full overflow-hidden border border-gray-200/20">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (score / targetScore) * 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`h-full ${isPassed ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-amber-400 to-orange-500'}`}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1.5 px-1">
                <span>0% Goal</span>
                <span>100% Target Met</span>
              </div>
            </div>
          </div>

          {/* Bottom Actions Area with Delayed Entrance */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, type: 'spring', stiffness: 100 }}
            className="w-full flex flex-col gap-3 pb-4 sm:pb-8 shrink-0 px-2"
          >
            {/* Main Claim Reward and Exit Button */}
            <button
              onClick={() => {
                if (controlsActive) {
                  onComplete(calculatedXp, isPassed);
                  onClose();
                }
              }}
              disabled={!controlsActive}
              className={`w-full py-5 rounded-2xl font-black text-lg select-none hover:scale-[1.01] transition-all cursor-pointer shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 border border-orange-400/20 dark:border-transparent ${
                controlsActive 
                  ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/25 animate-pulse' 
                  : 'bg-orange-200 dark:bg-orange-950/40 text-orange-50 dark:text-orange-900 cursor-not-allowed opacity-50 shadow-none'
              }`}
            >
              {saveStatus === 'saving' ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
              )}
              Collect XP & Close
            </button>

            {/* Sparing/Delayed Replay Button safely spaced beneath */}
            <button
              onClick={() => {
                if (controlsActive) {
                  startGame();
                }
              }}
              disabled={!controlsActive}
              className={`w-full py-4 rounded-2xl font-black text-sm select-none hover:bg-slate-100 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                controlsActive
                  ? 'bg-white dark:bg-gray-900 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-gray-700 hover:border-slate-300 dark:hover:border-gray-600'
                  : 'opacity-30 cursor-not-allowed pointer-events-none'
              }`}
            >
              <RotateCcw className="w-4 h-4" /> Replay Level {currentPlayLevel}
            </button>
          </motion.div>
        </div>
      </div>,
      document.body
    );
  }

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 bg-[#FDFBF7] dark:bg-gray-900 z-[9990] flex flex-col pointer-events-auto transition-colors duration-300">
      <header className="flex flex-col border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="flex justify-between items-center p-6">
          <button onClick={onClose} className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {game.title.split(' Lvl')[0]} <span className="text-orange-500">Lvl {currentPlayLevel}</span>
          </h2>
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Goal: {getTargetScore(game.type, currentPlayLevel)} pts
            </p>
            <p className="text-xl font-extrabold text-orange-500">
              Score: {Number(score.toFixed(2))}
            </p>
          </div>
        </div>
        {gameState === 'playing' && (
          <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 transition-colors duration-300">
            <motion.div 
              className="h-full bg-orange-500"
              initial={{ width: '100%' }}
              animate={{ width: `${(timeLeft / 60) * 100}%` }}
              transition={{ ease: 'linear', duration: 1 }}
            />
          </div>
        )}
      </header>

      <div className="flex-1 relative overflow-y-auto flex flex-col p-4 sm:p-6">
        <AnimatePresence mode="wait">
          {gameState === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="m-auto text-center max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-transparent dark:border-gray-700 transition-colors duration-300"
            >
              <div className={`w-20 h-20 rounded-2xl ${game.bg} dark:opacity-90 ${game.color} flex items-center justify-center mx-auto mb-6 transition-colors duration-300`}>
                <Play className="w-10 h-10 ml-1" />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {game.title.split(' Lvl')[0]}
              </h1>

              {/* Level Overrides selector */}
              <div className="bg-gray-50 dark:bg-gray-900/40 rounded-2xl p-4 mb-6 text-left">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-orange-500" /> Select Play Level
                  </span>
                  <span className="text-xs font-extrabold text-orange-500 px-2 py-0.5 bg-orange-50 dark:bg-orange-950/40 rounded">
                    Lvl {currentPlayLevel}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
                  {Array.from({ length: Math.max(10, maxReachedLevel + 3) }).map((_, idx) => {
                    const l = idx + 1;
                    const isUnlocked = l <= maxReachedLevel;
                    const isSelected = l === currentPlayLevel;
                    
                    return (
                      <button
                        key={l}
                        disabled={!isUnlocked}
                        onClick={() => setCurrentPlayLevel(l)}
                        className={`min-w-[42px] h-[42px] rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-all relative shrink-0 ${
                          isSelected
                            ? 'bg-orange-500 text-white shadow-md font-black scale-105'
                            : isUnlocked
                              ? 'bg-orange-100/40 text-orange-600 dark:bg-orange-950/10 hover:bg-orange-100/80 cursor-pointer'
                              : 'bg-gray-100 text-gray-350 dark:bg-gray-800 dark:text-gray-650 cursor-not-allowed'
                        }`}
                      >
                        <span>{l}</span>
                        {!isUnlocked && (
                          <div className="absolute top-0.5 right-0.5">
                            <Lock className="w-1.5 h-1.5 text-gray-400" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm leading-relaxed">
                Train your {game.category.toLowerCase()} skills at <strong>Level {currentPlayLevel}</strong>. Get as many correct answers as possible in 60 seconds.
              </p>
              
              <button
                onClick={startGame}
                className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold text-lg hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30"
              >
                Start Game
              </button>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="m-auto w-full max-w-lg flex flex-col items-center justify-center py-4"
            >
              {renderGame()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>,
    document.body
  );
}
