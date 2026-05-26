import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, CheckCircle2, RotateCcw, AlertTriangle, Compass } from 'lucide-react';

export default function PatternRecognition({ onScore, isPlaying, level }: { onScore: (points: number) => void, isPlaying: boolean, level: number }) {
  const [pattern, setPattern] = useState<number[]>([]);
  const [userPattern, setUserPattern] = useState<number[]>([]);
  const [isShowingPattern, setIsShowingPattern] = useState(false);
  const [activeSquare, setActiveSquare] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  const sequenceIdRef = useRef(0);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const generatePattern = useCallback(() => {
    const length = Math.min(8, 3 + Math.floor(level / 5));
    return Array.from({ length }, () => Math.floor(Math.random() * 9));
  }, [level]);

  const showPattern = useCallback(async (newPattern: number[]) => {
    const currentId = ++sequenceIdRef.current;
    setIsShowingPattern(true);
    setUserPattern([]);
    setActiveSquare(null);
    
    for (const squareIndex of newPattern) {
      if (currentId !== sequenceIdRef.current) return;
      setActiveSquare(squareIndex);
      await new Promise(resolve => setTimeout(resolve, 600));
      
      if (currentId !== sequenceIdRef.current) return;
      setActiveSquare(null);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    if (currentId === sequenceIdRef.current) {
      setIsShowingPattern(false);
    }
  }, []);

  const startNewRound = useCallback(() => {
    const newPattern = generatePattern();
    setPattern(newPattern);
    showPattern(newPattern);
  }, [generatePattern, showPattern]);

  useEffect(() => {
    if (isPlaying) {
      startNewRound();
    } else {
      sequenceIdRef.current++; // cancel any running sequences
      setPattern([]);
      setUserPattern([]);
      setIsShowingPattern(false);
      setActiveSquare(null);
    }
    return () => {
      sequenceIdRef.current++; // trigger cancellation on unmount
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    };
  }, [isPlaying, startNewRound]);

  const handleSquareClick = (index: number) => {
    if (!isPlaying || isShowingPattern || feedback) return;

    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);

    const newUserPattern = [...userPattern, index];
    setUserPattern(newUserPattern);
    setActiveSquare(index);
    clickTimeoutRef.current = setTimeout(() => {
      setActiveSquare(null);
    }, 200);

    if (index !== pattern[userPattern.length]) {
      setFeedback('incorrect');
      feedbackTimeoutRef.current = setTimeout(() => {
        setFeedback(null);
        showPattern(pattern); 
      }, 1000);
      return;
    }

    if (newUserPattern.length === pattern.length) {
      setFeedback('correct');
      onScore(40);
      feedbackTimeoutRef.current = setTimeout(() => {
        setFeedback(null);
        startNewRound();
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 max-w-sm w-full">
      {/* Vibe Mode Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 dark:text-yellow-400 font-bold rounded-full text-xs uppercase tracking-widest mb-2">
        <Compass className="w-3.5 h-3.5" />
        Pattern Sequencing
      </div>

      <div className="text-center h-8 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isShowingPattern ? (
            <motion.p 
              key="watch" 
              initial={{ opacity: 0, y: -4 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0 }} 
              className="text-amber-500 font-extrabold text-sm uppercase tracking-wider flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4 animate-bounce" /> Watch the pattern...
            </motion.p>
          ) : feedback === 'correct' ? (
            <motion.p 
              key="correct" 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="text-emerald-500 font-extrabold text-sm uppercase tracking-wider flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 animate-pulse" /> Perfect Sequence!
            </motion.p>
          ) : feedback === 'incorrect' ? (
            <motion.p 
              key="incorrect" 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="text-rose-500 font-extrabold text-sm uppercase tracking-wider flex items-center gap-1.5"
            >
              <AlertTriangle className="w-4 h-4 animate-shake" /> Try Again! Showing pattern...
            </motion.p>
          ) : (
            <motion.p 
              key="repeat" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="text-slate-400 dark:text-gray-500 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" /> Repeat the pattern
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Grid wrapper */}
      <div className="p-5 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-750 transition-colors duration-300">
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => {
            const isActive = activeSquare === i;
            const isWrong = feedback === 'incorrect' && userPattern[userPattern.length - 1] === i;

            return (
              <motion.button
                key={i}
                whileTap={!isShowingPattern ? { scale: 0.92 } : {}}
                onClick={() => handleSquareClick(i)}
                className={`w-20 h-20 rounded-2xl transition-all duration-200 cursor-pointer outline-none ${
                  isWrong
                    ? 'bg-gradient-to-br from-rose-400 to-rose-500 shadow-md shadow-rose-500/30'
                    : isActive
                    ? 'bg-gradient-to-br from-amber-400 to-amber-500 shadow-md shadow-amber-500/30 scale-[1.03]'
                    : 'bg-slate-100 dark:bg-gray-700/60 hover:bg-slate-200/80 dark:hover:bg-gray-650/80 shadow-inner'
                }`}
                disabled={!isPlaying || isShowingPattern}
              />
            );
          })}
        </div>
      </div>

      {/* Interactive round progress bulbs */}
      <div className="flex gap-2.5">
        {pattern.map((_, i) => (
          <div 
            key={i} 
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i < userPattern.length 
                ? 'bg-amber-500 scale-110 shadow-sm' 
                : 'bg-neutral-200 dark:bg-gray-700'
            }`} 
          />
        ))}
      </div>
    </div>
  );
}
