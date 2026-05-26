import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, Check, X, Orbit } from 'lucide-react';

export default function MathRush({ onScore, isPlaying, level }: any) {
  const [equation, setEquation] = useState('');
  const [options, setOptions] = useState<number[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const generateRound = () => {
    const ops = ['+', '-', '*'];
    const availableOps = level < 3 ? ['+', '-'] : ops;
    const op = availableOps[Math.floor(Math.random() * availableOps.length)];
    
    let a, b, ans;
    const maxNum = 10 * level;

    if (op === '+') {
      a = Math.floor(Math.random() * maxNum) + 1;
      b = Math.floor(Math.random() * maxNum) + 1;
      ans = a + b;
    } else if (op === '-') {
      a = Math.floor(Math.random() * maxNum) + 5;
      b = Math.floor(Math.random() * a); 
      ans = a - b;
    } else {
      a = Math.floor(Math.random() * (5 + level)) + 2;
      b = Math.floor(Math.random() * 9) + 2;
      ans = a * b;
    }

    setEquation(`${a} ${op} ${b}`);
    setCorrectAnswer(ans);

    const newOptions = new Set<number>([ans]);
    while (newOptions.size < 4) {
      const offset = Math.floor(Math.random() * 10) - 5;
      if (offset !== 0 && ans + offset >= 0) {
        newOptions.add(ans + offset);
      } else {
        newOptions.add(ans + Math.floor(Math.random() * 10) + 1);
      }
    }
    
    setOptions(Array.from(newOptions).sort(() => Math.random() - 0.5));
  };

  useEffect(() => {
    if (isPlaying) {
      generateRound();
      setFeedback(null);
    }
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, [isPlaying, level]);

  const handleAnswer = (answer: number) => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }

    if (answer === correctAnswer) {
       onScore(20);
       setFeedback('correct');
    } else {
      onScore(-5);
      setFeedback('wrong');
    }
    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedback(null);
      generateRound();
    }, 3000 / 12); // speedy transitions
  };

  if (!isPlaying) return null;

  return (
    <div className="w-full flex flex-col items-center max-w-sm">
      {/* Game category display */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-bold rounded-full text-xs uppercase tracking-widest mb-6">
        <Calculator className="w-3.5 h-3.5" />
        Mathematical Reasoning
      </div>

      <p className="text-slate-400 dark:text-gray-500 font-bold mb-4 uppercase tracking-wider text-xs transition-colors duration-300">
        Solve the equation
      </p>

      {/* Premium chalkboard style display */}
      <div className="relative w-full bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 min-h-[160px] mb-8 flex flex-col items-center justify-center transition-colors duration-300">
        <AnimatePresence mode="wait">
          <motion.div 
            key={equation}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="text-5xl font-black text-gray-900 dark:text-white tracking-tight select-none"
          >
            {equation} = ?
          </motion.div>
        </AnimatePresence>

        {/* Dynamic score feed overlay */}
        {feedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 flex items-center justify-center z-10 rounded-3xl ${
              feedback === 'correct' ? 'bg-emerald-500/10' : 'bg-rose-500/10'
            }`}
          >
            <div className={`p-4 rounded-full ${
              feedback === 'correct' ? 'bg-emerald-500' : 'bg-rose-500'
            } text-white shadow-xl scale-110`}>
              {feedback === 'correct' ? <Check className="w-8 h-8 stroke-[3]" /> : <X className="w-8 h-8 stroke-[3]" />}
            </div>
          </motion.div>
        )}
      </div>

      {/* High-quality Lumosity numbered tiles */}
      <div className="grid grid-cols-2 gap-4 w-full px-2">
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(opt)}
            disabled={!!feedback}
            className="py-5.5 bg-indigo-50/50 dark:bg-indigo-950/10 text-indigo-700 dark:text-indigo-400 font-black text-2xl rounded-2xl hover:bg-indigo-100/80 dark:hover:bg-indigo-950/30 hover:scale-[1.03] transition-all active:scale-95 border border-indigo-100 dark:border-indigo-900/30 shadow-md shadow-indigo-100/10 cursor-pointer text-center"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
