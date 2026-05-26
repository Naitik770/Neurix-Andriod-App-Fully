import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, CheckCircle2, XCircle, Type, Lightbulb } from 'lucide-react';

const WORD_LISTS: Record<number, string[]> = {
  1: ['CAT', 'DOG', 'SUN', 'MAP', 'PEN', 'BOX', 'RED', 'BLUE', 'SKY', 'RUN'],
  2: ['BRAIN', 'FOCUS', 'MEMORY', 'LOGIC', 'TRAIN', 'SPEED', 'MATCH', 'LEVEL', 'GAME', 'PLAY'],
  3: ['COGNITIVE', 'NEURON', 'SYNAPSE', 'PLASTICITY', 'ATTENTION', 'PERCEPTION', 'ANALYSIS', 'STRATEGY', 'CREATIVE', 'INSIGHT'],
};

export default function WordScramble({ onScore, isPlaying, level }: { onScore: (points: number) => void, isPlaying: boolean, level: number }) {
  const [word, setWord] = useState('');
  const [scrambled, setScrambled] = useState('');
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [hintUsed, setHintUsed] = useState(false);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getWordList = useCallback(() => {
    const difficulty = Math.min(3, Math.ceil(level / 10));
    return WORD_LISTS[difficulty] || WORD_LISTS[2];
  }, [level]);

  const scramble = (w: string) => {
    let s = w.split('').sort(() => Math.random() - 0.5).join('');
    while (s === w && w.length > 1) {
      s = w.split('').sort(() => Math.random() - 0.5).join('');
    }
    return s;
  };

  const nextWord = useCallback(() => {
    const list = getWordList();
    const newWord = list[Math.floor(Math.random() * list.length)];
    setWord(newWord);
    setScrambled(scramble(newWord));
    setGuess('');
    setHintUsed(false);
    setFeedback(null);
  }, [getWordList]);

  useEffect(() => {
    if (isPlaying) {
      nextWord();
    }
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, [isPlaying, nextWord]);

  const checkGuess = () => {
    if (!guess) return;

    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }

    if (guess.toUpperCase() === word) {
      setFeedback('correct');
      const baseScore = word.length * 5;
      const finalScore = hintUsed ? Math.floor(baseScore / 2) : baseScore;
      onScore(finalScore);
      feedbackTimeoutRef.current = setTimeout(nextWord, 1000);
    } else {
      setFeedback('incorrect');
      feedbackTimeoutRef.current = setTimeout(() => setFeedback(null), 1000);
    }
  };

  const useHint = () => {
    if (hintUsed || !isPlaying) return;
    setHintUsed(true);
    setGuess(word[0]);
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-sm">
      {/* Vibe mode indicator */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 font-bold rounded-full text-xs uppercase tracking-widest mb-2">
        <Type className="w-3.5 h-3.5" />
        Verbal Processing Challenge
      </div>

      {/* Scrambled ivory letters */}
      <div className="flex flex-wrap justify-center gap-2.5">
        {scrambled.split('').map((char, i) => (
          <motion.div
            key={`${word}-${i}`}
            initial={{ scale: 0.8, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: i * 0.05 }}
            className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl shadow-md flex items-center justify-center text-xl font-extrabold text-slate-800 dark:text-white border border-slate-100 dark:border-gray-700 select-none cursor-default transition-all hover:scale-105 hover:shadow-lg"
          >
            {char}
          </motion.div>
        ))}
      </div>

      {/* Input container */}
      <div className="relative w-full px-2">
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && checkGuess()}
          className={`w-full text-xl text-center font-bold tracking-widest p-4 rounded-2xl border transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none shadow-sm ${
            feedback === 'correct' ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20' :
            feedback === 'incorrect' ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 ring-2 ring-rose-500/20 animate-shake' :
            'border-slate-200 dark:border-gray-700 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10'
          }`}
          placeholder="Unscramble word..."
          disabled={!isPlaying || feedback === 'correct'}
          autoFocus
        />
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute right-6 top-1/2 -translate-y-1/2"
            >
              {feedback === 'correct' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              ) : (
                <XCircle className="w-6 h-6 text-rose-500" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Buttons controls */}
      <div className="flex gap-4 w-full px-2">
        <button 
          onClick={useHint}
          disabled={hintUsed || !isPlaying || feedback === 'correct'}
          className="flex-1 py-4 bg-slate-100 dark:bg-gray-800 text-slate-500 dark:text-gray-400 rounded-2xl font-extrabold flex items-center justify-center gap-2 hover:bg-slate-200/80 dark:hover:bg-gray-750/80 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer border border-slate-200/50 dark:border-gray-700/50"
        >
          <Lightbulb className="w-4 h-4 text-amber-500 animate-pulse" /> Hint
        </button>
        <button 
          onClick={checkGuess}
          disabled={!isPlaying || feedback === 'correct' || !guess}
          className="flex-[2] py-4 bg-orange-500 text-white rounded-2xl font-extrabold text-lg hover:bg-orange-600 hover:scale-[1.02] transition-all active:scale-95 shadow-lg shadow-orange-500/20 disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-1.5"
        >
          Unscramble
        </button>
      </div>
    </div>
  );
}
