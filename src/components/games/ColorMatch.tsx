import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, Sparkles } from 'lucide-react';

const COLORS = [
  { name: 'Red', hex: '#EF4444' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Green', hex: '#10B981' },
  { name: 'Yellow', hex: '#F59E0B' },
  { name: 'Purple', hex: '#8B5CF6' },
  { name: 'Orange', hex: '#F97316' }
];

export default function ColorMatch({ onScore, isPlaying, level }: any) {
  const [meaning, setMeaning] = useState(COLORS[0]);
  const [textColor, setTextColor] = useState(COLORS[0]);
  const [isMatch, setIsMatch] = useState(true);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const generateRound = () => {
    const match = Math.random() > 0.5;
    setIsMatch(match);
    
    const availableColors = COLORS.slice(0, Math.min(2 + Math.floor(level / 2), COLORS.length));
    const meaningColor = availableColors[Math.floor(Math.random() * availableColors.length)];
    setMeaning(meaningColor);

    if (match) {
      setTextColor(meaningColor);
    } else {
      let otherColor = availableColors[Math.floor(Math.random() * availableColors.length)];
      while (otherColor.name === meaningColor.name) {
        otherColor = availableColors[Math.floor(Math.random() * availableColors.length)];
      }
      setTextColor(otherColor);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      generateRound();
    }
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  const handleAnswer = (answer: boolean) => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }

    if (answer === isMatch) {
      onScore(15);
      setFeedback('correct');
    } else {
      onScore(-5);
      setFeedback('wrong');
    }
    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedback(null);
      generateRound();
    }, 250);
  };

  if (!isPlaying) return null;

  return (
    <div className="w-full flex flex-col items-center max-w-sm">
      {/* Decorative Vibe Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 font-bold rounded-full text-xs uppercase tracking-widest mb-6">
        <Sparkles className="w-3.5 h-3.5 animate-spin" />
        Stroop Effect Challenge
      </div>

      <div className="text-center w-full">
        <p className="text-slate-400 dark:text-gray-500 font-bold mb-4 uppercase tracking-wider text-xs">
          Does the meaning match the text color?
        </p>

        {/* Premium Stroop Card Display */}
        <div className="relative overflow-hidden w-full bg-white dark:bg-gray-800 rounded-3xl p-10 shadow-xl border border-gray-100 dark:border-gray-700 min-h-[220px] mb-10 flex flex-col items-center justify-center transition-all duration-300">
          <AnimatePresence mode="wait">
            <motion.div
              key={meaning.name + textColor.hex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="flex flex-col items-center"
            >
              <span className="text-2xl font-semibold tracking-wide text-gray-400 dark:text-gray-500 mb-2 uppercase">
                Word Meaning:
              </span>
              <h2 
                className="text-5xl font-black uppercase tracking-tight drop-shadow-sm select-none"
                style={{ color: textColor.hex }}
              >
                {meaning.name}
              </h2>
            </motion.div>
          </AnimatePresence>

          {/* Correct & Wrong Overlay Feedback */}
          {feedback && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-0 flex items-center justify-center z-10 transition-colors ${
                feedback === 'correct' ? 'bg-emerald-500/10' : 'bg-rose-500/10'
              }`}
            >
              <div className={`p-4 rounded-full ${
                feedback === 'correct' ? 'bg-emerald-500' : 'bg-rose-500'
              } text-white shadow-xl scale-110 active:scale-100`}>
                {feedback === 'correct' ? <Check className="w-8 h-8 stroke-[3]" /> : <X className="w-8 h-8 stroke-[3]" />}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Lumosity-styled Yes/No Control Buttons */}
      <div className="flex gap-4 w-full px-2">
        <button
          onClick={() => handleAnswer(false)}
          disabled={!!feedback}
          className="flex-1 py-4.5 bg-rose-50/60 dark:bg-rose-950/20 text-rose-500 dark:text-rose-400 rounded-2xl font-extrabold text-lg hover:bg-rose-100 dark:hover:bg-rose-950/40 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-2 border border-rose-100 dark:border-rose-950/40 shadow-sm shadow-rose-100/10 cursor-pointer"
        >
          <X className="w-5 h-5 stroke-[2.5]" /> No
        </button>
        <button
          onClick={() => handleAnswer(true)}
          disabled={!!feedback}
          className="flex-1 py-4.5 bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-500 dark:text-emerald-400 rounded-2xl font-extrabold text-lg hover:bg-emerald-100 dark:hover:bg-emerald-950/40 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-2 border border-emerald-100 dark:border-emerald-950/40 shadow-sm shadow-emerald-100/10 cursor-pointer"
        >
          <Check className="w-5 h-5 stroke-[2.5]" /> Yes
        </button>
      </div>
    </div>
  );
}
