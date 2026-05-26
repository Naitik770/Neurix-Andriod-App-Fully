import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, Eye, HelpCircle } from 'lucide-react';

export default function MemoryMatrix({ onScore, isPlaying, level }: any) {
  const [gridSize, setGridSize] = useState(3); // 3x3 initially
  const [activeTiles, setActiveTiles] = useState<number[]>([]);
  const [userTiles, setUserTiles] = useState<number[]>([]);
  const [phase, setPhase] = useState<'memorize' | 'recall' | 'result'>('memorize');

  const memorizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resultTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const generateRound = (currentGridSize: number) => {
    if (memorizeTimeoutRef.current) clearTimeout(memorizeTimeoutRef.current);
    if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current);

    const totalTiles = currentGridSize * currentGridSize;
    const numActive = Math.min(Math.floor(totalTiles * 0.4) + Math.floor(level / 2), totalTiles - 1);
    
    const newActive = new Set<number>();
    while (newActive.size < numActive) {
      newActive.add(Math.floor(Math.random() * totalTiles));
    }
    
    setActiveTiles(Array.from(newActive));
    setUserTiles([]);
    setPhase('memorize');

    memorizeTimeoutRef.current = setTimeout(() => {
      setPhase('recall');
    }, 2000 + (level * 200)); 
  };

  useEffect(() => {
    if (isPlaying) {
      const size = Math.min(3 + Math.floor((level - 1) / 3), 6);
      setGridSize(size); 
      generateRound(size);
    }
    return () => {
      if (memorizeTimeoutRef.current) clearTimeout(memorizeTimeoutRef.current);
      if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current);
    };
  }, [isPlaying, level]);

  const handleTileClick = (index: number) => {
    if (phase !== 'recall') return;
    
    if (userTiles.includes(index)) return;

    const newUserTiles = [...userTiles, index];
    setUserTiles(newUserTiles);

    if (!activeTiles.includes(index)) {
      setPhase('result');
      onScore(-10);
      if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current);
      resultTimeoutRef.current = setTimeout(() => generateRound(gridSize), 1200);
    } else if (newUserTiles.length === activeTiles.length) {
      setPhase('result');
      onScore(25);
      if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current);
      resultTimeoutRef.current = setTimeout(() => generateRound(gridSize), 1200);
    }
  };

  if (!isPlaying) return null;

  return (
    <div className="w-full flex flex-col items-center max-w-sm">
      {/* Decorative mode identifier */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 font-bold rounded-full text-xs uppercase tracking-widest mb-6">
        <Layers className="w-3.5 h-3.5" strokeWidth={2.5} />
        Memory Recall Test
      </div>

      <div className="text-center h-8 mb-8 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {phase === 'memorize' ? (
            <motion.p 
              key="memorize" 
              initial={{ opacity: 0, y: -4 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0 }}
              className="text-orange-500 font-extrabold flex items-center gap-1.5 uppercase tracking-wider text-xs"
            >
              <Eye className="w-4 h-4 animate-bounce" /> Memorize the pattern
            </motion.p>
          ) : phase === 'recall' ? (
            <motion.p 
              key="recall" 
              initial={{ opacity: 0, y: 4 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0 }}
              className="text-indigo-500 font-extrabold flex items-center gap-1.5 uppercase tracking-wider text-xs"
            >
              <HelpCircle className="w-4 h-4 animate-pulse" /> Recall and tap the tiles
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Grid container with beautiful glass padding */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-750 transition-colors duration-300">
        <div 
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: gridSize * gridSize }).map((_, i) => {
            const isActive = phase === 'memorize' ? activeTiles.includes(i) : false;
            const isSelected = userTiles.includes(i);
            const isCorrect = isSelected && activeTiles.includes(i);
            const isWrong = isSelected && !activeTiles.includes(i);
            const missed = phase === 'result' && activeTiles.includes(i) && !isSelected;

            let bgColor = 'bg-slate-100 dark:bg-gray-700/60 hover:bg-slate-200/80 dark:hover:bg-gray-600/80';
            let extraStyles = '';
            
            if (isActive) {
              bgColor = 'bg-gradient-to-br from-orange-400 to-orange-500 shadow-md shadow-orange-500/30';
              extraStyles = 'scale-[1.03]';
            } else if (isCorrect) {
              bgColor = 'bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-md shadow-emerald-500/20';
              extraStyles = 'scale-95';
            } else if (isWrong) {
              bgColor = 'bg-gradient-to-br from-rose-400 to-rose-500 shadow-md shadow-rose-500/30';
              extraStyles = 'ring-2 ring-rose-300 animate-wiggle';
            } else if (missed) {
              bgColor = 'bg-amber-100 border-2 border-dashed border-amber-400 text-amber-500 dark:bg-amber-950/20';
              extraStyles = 'opacity-80 scale-95';
            }

            return (
              <motion.button
                key={i}
                whileTap={phase === 'recall' ? { scale: 0.92 } : {}}
                onClick={() => handleTileClick(i)}
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${bgColor} ${extraStyles} transition-all duration-200 cursor-pointer outline-none shadow-sm`}
                disabled={phase !== 'recall'}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
