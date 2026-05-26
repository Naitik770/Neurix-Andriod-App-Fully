import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Zap, AlertCircle, Sparkles, Check, X } from 'lucide-react';

interface CognitiveLoadChallengeProps {
  onScore: (points: number) => void;
  isPlaying: boolean;
  level: number;
}

export default function CognitiveLoadChallenge({ onScore, isPlaying, level }: CognitiveLoadChallengeProps) {
  const [mathProblem, setMathProblem] = useState({ a: 0, b: 0, op: '+', answer: 0 });
  const [mathOptions, setMathOptions] = useState<number[]>([]);
  const [colorTask, setColorTask] = useState({ text: '', color: '', isMatch: false });
  const [activeTask, setActiveTask] = useState<'math' | 'color'>('math');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [distraction, setDistraction] = useState<string | null>(null);

  const distractionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const generateMath = useCallback(() => {
    const a = Math.floor(Math.random() * (10 + level));
    const b = Math.floor(Math.random() * (10 + level));
    const ops = ['+', '-'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    const answer = op === '+' ? a + b : a - b;
    setMathProblem({ a, b, op, answer });

    const optionsSet = new Set<number>([answer]);
    while (optionsSet.size < 3) {
      const offset = (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1);
      optionsSet.add(answer + offset);
    }
    setMathOptions(Array.from(optionsSet).sort(() => Math.random() - 0.5));
  }, [level]);

  const generateColor = useCallback(() => {
    const colors = ['Red', 'Blue', 'Green', 'Yellow'];
    const colorValues = ['text-red-500', 'text-blue-500', 'text-emerald-500', 'text-amber-500'];
    const textIdx = Math.floor(Math.random() * colors.length);
    const colorIdx = Math.floor(Math.random() * colors.length);
    const isMatch = textIdx === colorIdx;
    setColorTask({ 
      text: colors[textIdx], 
      color: colorValues[colorIdx],
      isMatch 
    });
  }, []);

  useEffect(() => {
    if (isPlaying) {
      generateMath();
      generateColor();
    }
    return () => {
      if (distractionTimeoutRef.current) clearTimeout(distractionTimeoutRef.current);
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    };
  }, [isPlaying, generateMath, generateColor]);

  // Distractions and switching dynamics
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      if (Math.random() > 0.70) {
        const distractions = ['FOCUS!', 'QUICK!', 'SOLVE!', 'SWITCH!'];
        setDistraction(distractions[Math.floor(Math.random() * distractions.length)]);
        if (distractionTimeoutRef.current) clearTimeout(distractionTimeoutRef.current);
        distractionTimeoutRef.current = setTimeout(() => setDistraction(null), 1000);
      }
      
      if (Math.random() > 0.75) {
        setActiveTask(prev => prev === 'math' ? 'color' : 'math');
      }
    }, 2800);
    return () => {
      clearInterval(interval);
      if (distractionTimeoutRef.current) clearTimeout(distractionTimeoutRef.current);
    };
  }, [isPlaying]);

  const handleMathAnswer = (val: number) => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);

    if (activeTask !== 'math') {
      onScore(-3);
      setFeedback('wrong');
      feedbackTimeoutRef.current = setTimeout(() => setFeedback(null), 400);
      return;
    }

    if (val === mathProblem.answer) {
      onScore(20);
      setFeedback('correct');
      generateMath();
    } else {
      onScore(-5);
      setFeedback('wrong');
    }
    feedbackTimeoutRef.current = setTimeout(() => setFeedback(null), 400);
  };

  const handleColorAnswer = (match: boolean) => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);

    if (activeTask !== 'color') {
      onScore(-3);
      setFeedback('wrong');
      feedbackTimeoutRef.current = setTimeout(() => setFeedback(null), 400);
      return;
    }

    if (match === colorTask.isMatch) {
      onScore(20);
      setFeedback('correct');
      generateColor();
    } else {
      onScore(-5);
      setFeedback('wrong');
    }
    feedbackTimeoutRef.current = setTimeout(() => setFeedback(null), 400);
  };

  if (!isPlaying) return null;

  return (
    <div className="w-full max-w-sm space-y-6 relative px-2">
      {/* Distraction Alert Overlay */}
      <AnimatePresence>
        {distraction && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1.3 }}
            exit={{ opacity: 0, scale: 1.8 }}
            className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
          >
            <span className="text-4xl font-extrabold text-indigo-500/30 uppercase tracking-widest">{distraction}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Tasks Switcher header bar */}
      <div className="flex justify-center gap-4 mb-2">
        <div className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${activeTask === 'math' ? 'bg-indigo-500 text-white scale-105 shadow-md shadow-indigo-500/20' : 'bg-slate-100 dark:bg-gray-800 text-slate-400'}`}>
          <Brain className="w-4 h-4" />
          <span className="text-xs font-extrabold uppercase tracking-wider">Math</span>
        </div>
        <div className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${activeTask === 'color' ? 'bg-purple-500 text-white scale-105 shadow-md shadow-purple-500/20' : 'bg-slate-100 dark:bg-gray-800 text-slate-400'}`}>
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-extrabold uppercase tracking-wider">Color</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {/* Math Card Panel */}
        <motion.div 
          animate={{ 
            opacity: activeTask === 'math' ? 1 : 0.40,
            scale: activeTask === 'math' ? 1 : 0.96,
            filter: activeTask === 'math' ? 'blur(0px)' : 'blur(1.5px)'
          }}
          className={`bg-white dark:bg-gray-800 p-6 rounded-3xl transition-all border duration-300 ${
            activeTask === 'math' ? 'border-indigo-400 shadow-xl scale-100' : 'border-slate-150 dark:border-gray-755 shadow-sm'
          }`}
        >
          <div className="text-center mb-5">
            <span className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block">QUANT TIME</span>
            <p className="text-3xl font-black text-slate-800 dark:text-white mt-1">
              {mathProblem.a} {mathProblem.op} {mathProblem.b} = ?
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {mathOptions.map((val, i) => (
              <button
                key={i}
                disabled={activeTask !== 'math' || !!feedback}
                onClick={() => handleMathAnswer(val)}
                className="py-3 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-extrabold rounded-xl hover:bg-indigo-100/80 transition-all cursor-pointer text-sm"
              >
                {val}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Color Card Panel */}
        <motion.div 
          animate={{ 
            opacity: activeTask === 'color' ? 1 : 0.40,
            scale: activeTask === 'color' ? 1 : 0.96,
            filter: activeTask === 'color' ? 'blur(0px)' : 'blur(1.5px)'
          }}
          className={`bg-white dark:bg-gray-800 p-6 rounded-3xl transition-all border duration-300 ${
            activeTask === 'color' ? 'border-purple-400 shadow-xl scale-100' : 'border-slate-150 dark:border-gray-755 shadow-sm'
          }`}
        >
          <div className="text-center mb-5">
            <span className="text-[10px] font-black text-purple-500 dark:text-purple-400 uppercase tracking-widest block">STROOP BLOCK</span>
            <p className={`text-4xl font-extrabold font-black mt-1 uppercase ${colorTask.color}`}>
              {colorTask.text}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              disabled={activeTask !== 'color' || !!feedback}
              onClick={() => handleColorAnswer(false)}
              className="flex-1 py-3 bg-rose-50/60 dark:bg-rose-950/20 text-rose-500 dark:text-rose-400 rounded-xl font-bold flex items-center justify-center gap-1.5 hover:bg-rose-100 transition-all cursor-pointer text-sm"
            >
              <X className="w-4 h-4 stroke-[2.5]" /> No
            </button>
            <button
              disabled={activeTask !== 'color' || !!feedback}
              onClick={() => handleColorAnswer(true)}
              className="flex-1 py-3 bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-500 dark:text-emerald-400 rounded-xl font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition-all cursor-pointer text-sm"
            >
              <Check className="w-4 h-4 stroke-[2.5]" /> Yes
            </button>
          </div>
        </motion.div>
      </div>

      {/* Correct/Wrong Dynamic Pop HUD */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
          >
            <div className={`p-5 rounded-full ${feedback === 'correct' ? 'bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-emerald-500/30' : 'bg-gradient-to-br from-rose-400 to-rose-500 shadow-rose-500/30'} text-white shadow-xl scale-110 duration-200`}>
              {feedback === 'correct' ? <Check className="w-10 h-10 stroke-[3.5]" /> : <AlertCircle className="w-10 h-10 stroke-[3]" />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guide notes */}
      <div className="bg-amber-50/60 dark:bg-amber-950/10 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30">
        <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold text-center leading-relaxed flex items-center gap-1.5 justify-center">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
          Only match the <span className="underline">Highlighted Task</span>. Misses are penalized!
        </p>
      </div>
    </div>
  );
}
