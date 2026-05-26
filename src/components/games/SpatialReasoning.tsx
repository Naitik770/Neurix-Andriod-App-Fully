import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Target, User, Compass, Award } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

export default function SpatialReasoning({ onScore, isPlaying, level }: { onScore: (points: number) => void, isPlaying: boolean, level: number }) {
  const [gridSize, setGridSize] = useState(4);
  const [target, setTarget] = useState<Point>({ x: 0, y: 0 });
  const [player, setPlayer] = useState<Point>({ x: 0, y: 0 });
  const [walls, setWalls] = useState<Point[]>([]);
  const [moves, setMoves] = useState(0);

  const isReachable = (start: Point, end: Point, size: number, currentWalls: Point[]) => {
    const queue: Point[] = [start];
    const visited = new Set([`${start.x},${start.y}`]);
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.x === end.x && current.y === end.y) return true;
      
      const neighbors = [
        { x: current.x + 1, y: current.y },
        { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 },
      ];
      
      for (const next of neighbors) {
        if (
          next.x >= 0 && next.x < size &&
          next.y >= 0 && next.y < size &&
          !visited.has(`${next.x},${next.y}`) &&
          !currentWalls.some(w => w.x === next.x && w.y === next.y)
        ) {
          visited.add(`${next.x},${next.y}`);
          queue.push(next);
        }
      }
    }
    return false;
  };

  const generateLevel = useCallback(() => {
    const size = Math.min(8, 4 + Math.floor(level / 5));
    setGridSize(size);
    
    let newTarget: Point;
    const newPlayer = { x: 0, y: 0 };
    let newWalls: Point[] = [];
    let attempts = 0;
    let solvable = false;

    while (!solvable && attempts < 50) {
      attempts++;
      newTarget = {
        x: Math.floor(Math.random() * size),
        y: Math.floor(Math.random() * size)
      };
      
      if (newTarget.x === 0 && newTarget.y === 0) {
        newTarget.x = size - 1;
        newTarget.y = size - 1;
      }

      newWalls = [];
      const wallCount = Math.floor((size * size) * 0.2);
      
      for (let i = 0; i < wallCount; i++) {
        const wall = {
          x: Math.floor(Math.random() * size),
          y: Math.floor(Math.random() * size)
        };
        
        const isReserved = (wall.x === newPlayer.x && wall.y === newPlayer.y) ||
                           (wall.x === newTarget.x && wall.y === newTarget.y) ||
                           newWalls.some(w => w.x === wall.x && w.y === wall.y);
        
        if (!isReserved) {
          newWalls.push(wall);
        }
      }

      if (isReachable(newPlayer, newTarget, size, newWalls)) {
        solvable = true;
        setTarget(newTarget);
        setPlayer(newPlayer);
        setWalls(newWalls);
      }
    }

    setMoves(0);
  }, [level]);

  useEffect(() => {
    if (isPlaying) {
      generateLevel();
    }
  }, [isPlaying, generateLevel]);

  const movePlayer = useCallback((dx: number, dy: number) => {
    if (!isPlaying) return;
    
    const newX = player.x + dx;
    const newY = player.y + dy;

    if (newX < 0 || newX >= gridSize || newY < 0 || newY >= gridSize) return;
    if (walls.some(w => w.x === newX && w.y === newY)) return;

    setPlayer({ x: newX, y: newY });
    setMoves(prev => prev + 1);

    if (newX === target.x && newY === target.y) {
      const minMoves = Math.abs(target.x - 0) + Math.abs(target.y - 0);
      const efficiencyBonus = Math.max(0, 10 - (moves - minMoves));
      onScore(20 + efficiencyBonus);
      setTimeout(generateLevel, 100); 
    }
  }, [isPlaying, player, gridSize, walls, target, moves, onScore, generateLevel]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      switch (e.key) {
        case 'ArrowUp': 
          e.preventDefault();
          movePlayer(0, -1); 
          break;
        case 'ArrowDown': 
          e.preventDefault();
          movePlayer(0, 1); 
          break;
        case 'ArrowLeft': 
          e.preventDefault();
          movePlayer(-1, 0); 
          break;
        case 'ArrowRight': 
          e.preventDefault();
          movePlayer(1, 0); 
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, movePlayer]);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm">
      {/* Vibe mode indicator */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 font-bold rounded-full text-xs uppercase tracking-widest mb-1 shadow-sm">
        <Compass className="w-3.5 h-3.5" />
        Spatial Orientation Lab
      </div>

      {/* Grid container with beautiful glass padding */}
      <div className="p-4 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-750 w-full transition-colors duration-300">
        <div 
          className="grid gap-1.5 w-full mx-auto"
          style={{ 
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            aspectRatio: '1/1'
          }}
        >
          {Array.from({ length: gridSize * gridSize }).map((_, i) => {
            const x = i % gridSize;
            const y = Math.floor(i / gridSize);
            const isPlayer = x === player.x && y === player.y;
            const isTarget = x === target.x && y === target.y;
            const isWall = walls.some(w => w.x === x && w.y === y);

            return (
              <div 
                key={`${x}-${y}`} 
                className={`relative rounded-xl flex items-center justify-center transition-all duration-300 aspect-square ${
                  isWall 
                    ? 'bg-slate-300 dark:bg-gray-600/80 shadow-inner' 
                    : 'bg-slate-50 dark:bg-gray-700/60'
                }`}
              >
                {isTarget && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-orange-500 z-10 w-3/4 h-3/4 flex items-center justify-center"
                  >
                    <Target className="w-full h-full drop-shadow-sm" strokeWidth={2.5} />
                  </motion.div>
                )}
                {isPlayer && (
                  <motion.div
                    layoutId="player"
                    className="absolute inset-1.5 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center text-white shadow-md z-20"
                    transition={{ type: 'spring', stiffness: 260, damping: 25 }}
                  >
                    <User className="w-3/4 h-3/4 stroke-[2.5]" />
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sleek tactical moves badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-gray-850 text-slate-500 dark:text-gray-400 font-bold rounded-lg text-xs tracking-wider transition-all">
        <Award className="w-3.5 h-3.5 text-orange-500" />
        Moves Made: <span className="text-orange-500 font-extrabold">{moves}</span>
      </div>

      {/* Control Buttons */}
      <div className="grid grid-cols-3 gap-2.5 max-w-[180px] w-full">
        <div />
        <ControlButton onClick={() => movePlayer(0, -1)} icon={ChevronUp} />
        <div />
        <ControlButton onClick={() => movePlayer(-1, 0)} icon={ChevronLeft} />
        <div className="w-12 h-12 flex items-center justify-center text-slate-300 dark:text-gray-600 font-black">PAD</div>
        <ControlButton onClick={() => movePlayer(1, 0)} icon={ChevronRight} />
        <div />
        <ControlButton onClick={() => movePlayer(0, 1)} icon={ChevronDown} />
        <div />
      </div>
      
      <p className="text-[10px] text-slate-400 dark:text-gray-500 font-black uppercase tracking-widest mt-1">
        Use arrows on keyboard or touch controls
      </p>
    </div>
  );
}

function ControlButton({ onClick, icon: Icon }: { onClick: () => void, icon: any }) {
  return (
    <button
      onClick={onClick}
      className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl shadow-md flex items-center justify-center hover:bg-slate-50 dark:hover:bg-gray-750 active:scale-95 transition-all border border-slate-100 dark:border-gray-700/55 cursor-pointer"
    >
      <Icon className="w-5 h-5 text-slate-600 dark:text-gray-300 stroke-[2.5]" />
    </button>
  );
}
