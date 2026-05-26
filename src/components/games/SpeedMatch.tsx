import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Circle, Square, Triangle, Hexagon, Heart, Check, X, ShieldAlert } from 'lucide-react';

const SHAPES = [Star, Circle, Square, Triangle, Hexagon, Heart];
const COLORS = ['text-blue-500', 'text-rose-500', 'text-emerald-500', 'text-amber-500', 'text-purple-500', 'text-orange-500'];

export default function SpeedMatch({ onScore, isPlaying, level }: any) {
  const [prevShape, setPrevShape] = useState<any>(null);
  const [currShape, setCurrShape] = useState<any>(null);
  const [prevColor, setPrevColor] = useState<string>('');
  const [currColor, setCurrColor] = useState<string>('');
  const [isMatch, setIsMatch] = useState(false);
  const [firstTurn, setFirstTurn] = useState(true);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const generateRound = (previous: any, prevCol: string) => {
    const match = Math.random() > 0.5 && !firstTurn;
    setIsMatch(match);
    
    if (match && previous) {
      setCurrShape(() => previous);
      setCurrColor(prevCol);
    } else {
      let nextShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      let nextColor = COLORS[Math.floor(Math.random() * Math.min(level, COLORS.length))];
      
      while (previous && nextShape === previous && nextColor === prevCol) {
        nextShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        nextColor = COLORS[Math.floor(Math.random() * Math.min(level, COLORS.length))];
      }
      setCurrShape(() => nextShape);
      setCurrColor(nextColor);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      const initialShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      const initialColor = COLORS[0];
      setCurrShape(() => initialShape);
      setCurrColor(initialColor);
      setFirstTurn(true);
      setFeedback(null);
    }
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  const handleAnswer = (answer: boolean) => {
    if (firstTurn) {
      setFirstTurn(false);
      setPrevShape(() => currShape);
      setPrevColor(currColor);
      generateRound(currShape, currColor);
      return;
    }

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

    setPrevShape(() => currShape);
    setPrevColor(currColor);
    
    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedback(null);
      generateRound(currShape, currColor);
    }, 250);
  };

  if (!isPlaying) return null;

  const ShapeIcon = currShape;

  return (
    <div className="w-full flex flex-col items-center max-w-sm">
      {/* Decorative Mode Icon */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-bold rounded-full text-xs uppercase tracking-widest mb-6">
        <ShieldAlert className="w-3.5 h-3.5" />
        Processing Speed Test
      </div>

      <p className="text-slate-400 dark:text-gray-500 font-bold mb-4 uppercase tracking-wider text-xs text-center">
        {firstTurn ? 'Memorize this shape' : 'Does this match the PREVIOUS shape?'}
      </p>

      {/* Lumosity Shape Display Card */}
      <div className="relative w-full aspect-square max-w-[240px] bg-white dark:bg-gray-800 rounded-3xl shadow-xl flex flex-col items-center justify-center mb-10 border border-gray-100 dark:border-gray-700 p-8 transition-colors duration-300">
        <AnimatePresence mode="wait">
          <motion.div
            key={currShape?.name + currColor}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
            className="flex items-center justify-center"
          >
            {ShapeIcon && <ShapeIcon className={`w-24 h-24 ${currColor}`} strokeWidth={2.5} />}
          </motion.div>
        </AnimatePresence>

        {/* Feedback visual flash */}
        {feedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 flex items-center justify-center z-10 rounded-3xl ${
              feedback === 'correct' ? 'bg-emerald-500/15' : 'bg-rose-500/15'
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

      {/* Matching controls */}
      <div className="flex gap-4 w-full px-2">
        {!firstTurn ? (
          <>
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
          </>
        ) : (
          <button
            onClick={() => handleAnswer(true)}
            className="w-full py-5 bg-blue-500 text-white rounded-2xl font-black text-xl hover:bg-blue-600 hover:scale-[1.01] shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-6 h-6 stroke-[3]" /> Got it!
          </button>
        )}
      </div>
    </div>
  );
}
