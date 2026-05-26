import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Timer, Award } from 'lucide-react';

export default function ReactionTime({ onScore, isPlaying, level }: { onScore: (points: number) => void, isPlaying: boolean, level: number }) {
  const [isReady, setIsReady] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [lastTime, setLastTime] = useState<number | null>(null);
  const [lastPoints, setLastPoints] = useState<number | null>(null);
  const [clickState, setClickState] = useState<'idle' | 'early' | 'success'>('idle');

  const timeout1Ref = useRef<NodeJS.Timeout | null>(null);
  const timeout2Ref = useRef<NodeJS.Timeout | null>(null);
  const timeout3Ref = useRef<NodeJS.Timeout | null>(null);
  const timeout4Ref = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      setClickState('idle');
      setIsReady(false);
      
      const startTimer = () => {
        const delay = Math.random() * 2500 + 1500; // 1.5s to 4s delay
        if (timeout1Ref.current) clearTimeout(timeout1Ref.current);
        timeout1Ref.current = setTimeout(() => {
          setIsReady(true);
          setStartTime(Date.now());
        }, delay);
      };

      startTimer();
    }
    return () => {
      if (timeout1Ref.current) clearTimeout(timeout1Ref.current);
      if (timeout2Ref.current) clearTimeout(timeout2Ref.current);
      if (timeout3Ref.current) clearTimeout(timeout3Ref.current);
      if (timeout4Ref.current) clearTimeout(timeout4Ref.current);
    };
  }, [isPlaying]);

  const handleClick = () => {
    if (!isPlaying) return;

    if (isReady) {
      const reactionTime = Date.now() - startTime;
      const rawScore = Math.max(0, 100 - reactionTime / 10);
      const pointsEarned = Number(rawScore.toFixed(1));
      
      onScore(pointsEarned);
      setLastTime(reactionTime);
      setLastPoints(pointsEarned);
      setClickState('success');
      setIsReady(false);

      if (timeout2Ref.current) clearTimeout(timeout2Ref.current);
      if (timeout3Ref.current) clearTimeout(timeout3Ref.current);

      // Cue next round
      timeout2Ref.current = setTimeout(() => {
        if (isPlaying) {
          setClickState('idle');
          const delay = Math.random() * 2000 + 1200;
          timeout3Ref.current = setTimeout(() => {
            setIsReady(true);
            setStartTime(Date.now());
          }, delay);
        }
      }, 1200);
    } else {
      // Early click constraint
      if (clickState === 'idle') {
        setClickState('early');
        onScore(-5);
        setLastPoints(-5);
        setLastTime(null);
        setIsReady(false);
        
        if (timeout4Ref.current) clearTimeout(timeout4Ref.current);
        // Reset and try again
        timeout4Ref.current = setTimeout(() => {
          if (isPlaying) {
            setClickState('idle');
          }
        }, 1500);
      }
    }
  };

  return (
    <div className="w-full max-w-sm flex flex-col items-center">
      {/* Target prompt of the game */}
      <div className="text-center mb-10 h-12 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {clickState === 'early' ? (
            <motion.p
              key="too-early"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-rose-500 dark:text-rose-400 font-bold text-sm uppercase tracking-wider"
            >
              Too Early! Penalty Applied (-5 pts)
            </motion.p>
          ) : isReady ? (
            <motion.p
              key="go"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-emerald-500 dark:text-emerald-400 font-extrabold text-lg uppercase tracking-widest animate-pulse"
            >
              CRITICAL SPOT: CLICK NOW!
            </motion.p>
          ) : (
            <motion.p
              key="wait"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-slate-400 dark:text-gray-500 text-sm font-medium uppercase tracking-widest"
            >
              Prepare and watch carefully...
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Lumosity-style Reaction Interactive Plate */}
      <div className="relative w-56 h-56 flex items-center justify-center mb-10">
        {/* Glowing pulsing outer ring for hot reaction moments */}
        {isReady && (
          <>
            <span className="absolute inset-0 rounded-full bg-emerald-500/20 dark:bg-emerald-400/10 animate-ping duration-1000" />
            <span className="absolute -inset-4 rounded-full bg-emerald-400/5 animate-pulse duration-700" />
          </>
        )}

        <button
          onClick={handleClick}
          disabled={!isPlaying || clickState === 'early'}
          className={`w-48 h-48 rounded-full flex flex-col items-center justify-center gap-2 border-4 transition-all duration-300 relative z-10 text-center outline-none select-none active:scale-95 cursor-pointer ${
            clickState === 'early'
              ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-400 text-rose-500 shadow-lg shadow-rose-200/50 dark:shadow-none'
              : clickState === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-450 text-emerald-500 shadow-lg shadow-emerald-200/50 dark:shadow-none'
              : isReady
              ? 'bg-emerald-500 border-white text-white shadow-2xl shadow-emerald-500/40 hover:bg-emerald-650'
              : 'bg-white dark:bg-gray-800 border-slate-100 dark:border-gray-700 text-slate-700 dark:text-gray-300 shadow-xl hover:border-orange-200 dark:hover:border-orange-950/40'
          }`}
        >
          {clickState === 'early' ? (
            <>
              <Zap className="w-8 h-8 text-rose-500 animate-bounce" />
              <span className="text-xl font-extrabold uppercase tracking-tight">HOLD IT!</span>
            </>
          ) : clickState === 'success' ? (
            <>
              <CheckCircleComponent />
              <span className="text-xl font-extrabold uppercase tracking-tight">GOT IT!</span>
            </>
          ) : isReady ? (
            <>
              <Zap className="w-10 h-10 text-white animate-bounce" />
              <span className="text-3xl font-black uppercase tracking-widest">TAP!</span>
            </>
          ) : (
            <>
              <div className="w-4 h-4 border-2 border-slate-400 dark:border-gray-500 border-t-transparent rounded-full animate-spin mb-1" />
              <span className="text-sm font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">WAITING</span>
            </>
          )}
        </button>
      </div>

      {/* Speed Dial Telemetry & Statistics Display */}
      <AnimatePresence>
        {(lastPoints !== null || lastTime !== null) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-slate-50 dark:border-gray-700 flex justify-around items-center transition-colors duration-300"
          >
            {lastTime !== null && (
              <div className="text-center">
                <span className="text-[10px] font-bold text-slate-400 dark:text-gray-400 uppercase tracking-widest flex items-center gap-1 justify-center">
                  <Timer className="w-3 h-3 text-cyan-500" /> Latency
                </span>
                <span className="text-lg font-black text-cyan-600 dark:text-cyan-400 block mt-0.5">
                  {lastTime} <span className="text-xs font-normal">ms</span>
                </span>
              </div>
            )}
            
            {lastPoints !== null && (
              <div className="text-center">
                <span className="text-[10px] font-bold text-slate-400 dark:text-gray-400 uppercase tracking-widest flex items-center gap-1 justify-center">
                  <Award className="w-3 h-3 text-orange-500" /> Reward
                </span>
                <span className={`text-lg font-black block mt-0.5 ${lastPoints > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {lastPoints > 0 ? `+${lastPoints}` : lastPoints} <span className="text-xs font-normal">pts</span>
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CheckCircleComponent() {
  return (
    <svg className="w-8 h-8 text-emerald-500 animate-scale" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
