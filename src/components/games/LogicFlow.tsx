import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Power, ToggleLeft, ToggleRight, Sparkles, AlertCircle } from 'lucide-react';

export default function LogicFlow({ onScore, isPlaying, level }: { onScore: (points: number) => void, isPlaying: boolean, level: number }) {
  const [sequence, setSequence] = useState([true, false, true]);
  const [solved, setSolved] = useState(false);
  const solvedTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      setSequence(Array.from({ length: 3 + Math.min(3, Math.floor(level / 2)) }, () => Math.random() > 0.5));
      setSolved(false);
    }
    return () => {
      if (solvedTimeoutRef.current) {
        clearTimeout(solvedTimeoutRef.current);
      }
    };
  }, [isPlaying, level]);

  const toggle = (index: number) => {
    if (!isPlaying || solved) return;
    const newSequence = [...sequence];
    newSequence[index] = !newSequence[index];
    setSequence(newSequence);

    if (newSequence.every(val => val === true)) {
      setSolved(true);
      onScore(35);
      
      if (solvedTimeoutRef.current) {
        clearTimeout(solvedTimeoutRef.current);
      }
      solvedTimeoutRef.current = setTimeout(() => {
        setSequence(Array.from({ length: 3 + Math.min(3, Math.floor(level / 2)) }, () => Math.random() > 0.5));
        setSolved(false);
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-sm">
      {/* Visual Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-50 dark:bg-cyan-950/20 text-cyan-600 dark:text-cyan-400 font-bold rounded-full text-xs uppercase tracking-widest mb-2">
        <Power className="w-3.5 h-3.5" />
        Circuit Logic Flow
      </div>

      <div className="text-center">
        <p className="text-slate-400 dark:text-gray-500 font-bold mb-2 uppercase tracking-wider text-xs">
          Toggle all switches to ENABLE (ON / Cyan)
        </p>
      </div>

      {/* Switch circuit board card */}
      <div className="relative w-full bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-750 shadow-xl flex flex-wrap justify-center gap-4 transition-all pb-10">
        <AnimatePresence>
          {solved && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-emerald-500/10 rounded-3xl flex items-center justify-center z-10"
            >
              <div className="bg-emerald-500 text-white font-extrabold px-5 py-2.5 rounded-full flex items-center gap-1.5 shadow-lg scale-110 active:scale-100 uppercase tracking-widest text-xs">
                <Sparkles className="w-4 h-4 animate-spin" /> Link Connected!
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {sequence.map((val, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => toggle(i)}
            disabled={!isPlaying || solved}
            className={`w-20 h-24 rounded-2xl flex flex-col items-center justify-between p-3.5 border transition-all cursor-pointer relative shadow-sm ${
              val
                ? 'bg-gradient-to-b from-cyan-400 to-cyan-500 border-cyan-300 text-white shadow-md shadow-cyan-400/20'
                : 'bg-slate-50 dark:bg-gray-700/60 border-slate-200 dark:border-gray-700 text-slate-400 dark:text-gray-500 hover:border-slate-300 dark:hover:border-gray-600'
            }`}
          >
            <span className="text-[10px] font-black uppercase tracking-wider opacity-60">SW-{i + 1}</span>
            <div className="p-2 rounded-full">
              {val ? <ToggleRight className="w-8 h-8 stroke-[2.5]" /> : <ToggleLeft className="w-8 h-8 stroke-[2.5]" />}
            </div>
            <span className="text-[10px] font-black tracking-widest uppercase">
              {val ? 'ON' : 'OFF'}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
