import { useRef, useEffect, useState, useCallback, type TouchEvent, type MouseEvent } from 'react';

interface SkierState {
  x: number;
  y: number;
  direction: 'left' | 'center' | 'right';
  speed: number;
  crashed: boolean;
  distance: number;
}

interface Obstacle {
  id: number;
  x: number;
  y: number;
  type: 'tree' | 'rock' | 'jump';
  width: number;
  height: number;
}

interface SkiGameProps {
  isPlaying: boolean;
  onGameOver?: (score: number) => void;
}

const HIGH_SCORE_KEY = 'skifree_highscore';

export const SkiGame = ({ isPlaying, onGameOver }: SkiGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      const saved = localStorage.getItem(HIGH_SCORE_KEY);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });
  const highScoreRef = useRef(highScore);
  
  const skierRef = useRef<SkierState>({
    x: 156,
    y: 80,
    direction: 'center',
    speed: 3,
    crashed: false,
    distance: 0,
  });
  
  const obstaclesRef = useRef<Obstacle[]>([]);
  const nextObstacleIdRef = useRef(0);
  const keysRef = useRef<Set<string>>(new Set());
  const touchHoldRef = useRef<'left' | 'right' | null>(null);

  const resetGame = useCallback(() => {
    skierRef.current = {
      x: 156,
      y: 80,
      direction: 'center',
      speed: 3,
      crashed: false,
      distance: 0,
    };
    obstaclesRef.current = [];
    nextObstacleIdRef.current = 0;
    setGameStarted(false);
    setGameOver(false);
    setFinalScore(0);
  }, []);

  const spawnObstacle = useCallback((canvasWidth: number, canvasHeight: number) => {
    const types: ('tree' | 'rock' | 'jump')[] = ['tree', 'tree', 'tree', 'rock', 'jump'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const obstacle: Obstacle = {
      id: nextObstacleIdRef.current++,
      x: Math.random() * (canvasWidth - 40) + 20,
      y: canvasHeight + 20,
      type,
      width: type === 'tree' ? 16 : type === 'rock' ? 20 : 24,
      height: type === 'tree' ? 24 : type === 'rock' ? 12 : 6,
    };
    
    obstaclesRef.current.push(obstacle);
  }, []);

  const checkCollision = useCallback((skier: SkierState, obstacle: Obstacle): boolean => {
    if (obstacle.type === 'jump') return false;
    
    const skierWidth = 10;
    const skierHeight = 10;
    const skierLeft = skier.x + 3;
    const skierTop = skier.y + 4;
    
    let obsLeft: number, obsTop: number, obsWidth: number, obsHeight: number;
    
    if (obstacle.type === 'tree') {
      obsLeft = obstacle.x + 4;
      obsTop = obstacle.y + 2;
      obsWidth = 10;
      obsHeight = 14;
    } else {
      obsLeft = obstacle.x + 2;
      obsTop = obstacle.y + 2;
      obsWidth = 14;
      obsHeight = 6;
    }
    
    return (
      skierLeft < obsLeft + obsWidth &&
      skierLeft + skierWidth > obsLeft &&
      skierTop < obsTop + obsHeight &&
      skierTop + skierHeight > obsTop
    );
  }, []);

  const drawPixel = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), size, size);
  }, []);

  const drawSkier = useCallback((ctx: CanvasRenderingContext2D, skier: SkierState) => {
    const px = 2;
    const sx = Math.floor(skier.x);
    const sy = Math.floor(skier.y);
    
    if (skier.crashed) {
      drawPixel(ctx, sx + 2, sy + 6, px, '#8B4513');
      drawPixel(ctx, sx + 12, sy + 6, px, '#8B4513');
      drawPixel(ctx, sx + 4, sy + 8, px, '#FFE4C4');
      drawPixel(ctx, sx + 6, sy + 8, px, '#FFE4C4');
      drawPixel(ctx, sx + 8, sy + 8, px, '#FFE4C4');
      drawPixel(ctx, sx + 10, sy + 8, px, '#FFE4C4');
      drawPixel(ctx, sx + 2, sy + 10, px, '#2196F3');
      drawPixel(ctx, sx + 12, sy + 10, px, '#2196F3');
      drawPixel(ctx, sx + 4, sy + 10, px, '#2196F3');
      drawPixel(ctx, sx + 6, sy + 10, px, '#2196F3');
      drawPixel(ctx, sx + 8, sy + 10, px, '#2196F3');
      drawPixel(ctx, sx + 10, sy + 10, px, '#2196F3');
      drawPixel(ctx, sx, sy + 14, px, '#333');
      drawPixel(ctx, sx + 14, sy + 14, px, '#333');
    } else if (skier.direction === 'left') {
      drawPixel(ctx, sx, sy + 4, px, '#8B4513');
      drawPixel(ctx, sx + 2, sy + 2, px, '#8B4513');
      drawPixel(ctx, sx + 6, sy, px, '#FFE4C4');
      drawPixel(ctx, sx + 8, sy, px, '#FFE4C4');
      drawPixel(ctx, sx + 6, sy + 2, px, '#FFE4C4');
      drawPixel(ctx, sx + 8, sy + 2, px, '#FFE4C4');
      drawPixel(ctx, sx + 4, sy + 4, px, '#2196F3');
      drawPixel(ctx, sx + 6, sy + 4, px, '#2196F3');
      drawPixel(ctx, sx + 8, sy + 4, px, '#2196F3');
      drawPixel(ctx, sx + 4, sy + 6, px, '#2196F3');
      drawPixel(ctx, sx + 6, sy + 6, px, '#2196F3');
      drawPixel(ctx, sx + 8, sy + 6, px, '#2196F3');
      drawPixel(ctx, sx + 10, sy + 6, px, '#2196F3');
      drawPixel(ctx, sx + 4, sy + 8, px, '#1976D2');
      drawPixel(ctx, sx + 6, sy + 8, px, '#1976D2');
      drawPixel(ctx, sx + 8, sy + 8, px, '#1976D2');
      drawPixel(ctx, sx + 2, sy + 10, px, '#333');
      drawPixel(ctx, sx + 4, sy + 10, px, '#333');
      drawPixel(ctx, sx + 6, sy + 10, px, '#333');
      drawPixel(ctx, sx + 8, sy + 10, px, '#333');
      drawPixel(ctx, sx + 10, sy + 10, px, '#333');
      drawPixel(ctx, sx + 12, sy + 8, px, '#8B4513');
    } else if (skier.direction === 'right') {
      drawPixel(ctx, sx + 14, sy + 4, px, '#8B4513');
      drawPixel(ctx, sx + 12, sy + 2, px, '#8B4513');
      drawPixel(ctx, sx + 6, sy, px, '#FFE4C4');
      drawPixel(ctx, sx + 8, sy, px, '#FFE4C4');
      drawPixel(ctx, sx + 6, sy + 2, px, '#FFE4C4');
      drawPixel(ctx, sx + 8, sy + 2, px, '#FFE4C4');
      drawPixel(ctx, sx + 6, sy + 4, px, '#2196F3');
      drawPixel(ctx, sx + 8, sy + 4, px, '#2196F3');
      drawPixel(ctx, sx + 10, sy + 4, px, '#2196F3');
      drawPixel(ctx, sx + 4, sy + 6, px, '#2196F3');
      drawPixel(ctx, sx + 6, sy + 6, px, '#2196F3');
      drawPixel(ctx, sx + 8, sy + 6, px, '#2196F3');
      drawPixel(ctx, sx + 10, sy + 6, px, '#2196F3');
      drawPixel(ctx, sx + 6, sy + 8, px, '#1976D2');
      drawPixel(ctx, sx + 8, sy + 8, px, '#1976D2');
      drawPixel(ctx, sx + 10, sy + 8, px, '#1976D2');
      drawPixel(ctx, sx + 4, sy + 10, px, '#333');
      drawPixel(ctx, sx + 6, sy + 10, px, '#333');
      drawPixel(ctx, sx + 8, sy + 10, px, '#333');
      drawPixel(ctx, sx + 10, sy + 10, px, '#333');
      drawPixel(ctx, sx + 12, sy + 10, px, '#333');
      drawPixel(ctx, sx + 2, sy + 8, px, '#8B4513');
    } else {
      drawPixel(ctx, sx + 6, sy, px, '#FFE4C4');
      drawPixel(ctx, sx + 8, sy, px, '#FFE4C4');
      drawPixel(ctx, sx + 6, sy + 2, px, '#FFE4C4');
      drawPixel(ctx, sx + 8, sy + 2, px, '#FFE4C4');
      drawPixel(ctx, sx + 4, sy + 4, px, '#2196F3');
      drawPixel(ctx, sx + 6, sy + 4, px, '#2196F3');
      drawPixel(ctx, sx + 8, sy + 4, px, '#2196F3');
      drawPixel(ctx, sx + 10, sy + 4, px, '#2196F3');
      drawPixel(ctx, sx + 4, sy + 6, px, '#2196F3');
      drawPixel(ctx, sx + 6, sy + 6, px, '#2196F3');
      drawPixel(ctx, sx + 8, sy + 6, px, '#2196F3');
      drawPixel(ctx, sx + 10, sy + 6, px, '#2196F3');
      drawPixel(ctx, sx + 4, sy + 8, px, '#1976D2');
      drawPixel(ctx, sx + 6, sy + 8, px, '#1976D2');
      drawPixel(ctx, sx + 8, sy + 8, px, '#1976D2');
      drawPixel(ctx, sx + 10, sy + 8, px, '#1976D2');
      drawPixel(ctx, sx + 2, sy + 10, px, '#333');
      drawPixel(ctx, sx + 4, sy + 10, px, '#333');
      drawPixel(ctx, sx + 6, sy + 10, px, '#333');
      drawPixel(ctx, sx + 8, sy + 10, px, '#333');
      drawPixel(ctx, sx + 10, sy + 10, px, '#333');
      drawPixel(ctx, sx + 12, sy + 10, px, '#333');
      drawPixel(ctx, sx, sy + 4, px, '#8B4513');
      drawPixel(ctx, sx + 14, sy + 4, px, '#8B4513');
    }
  }, [drawPixel]);

  const drawObstacle = useCallback((ctx: CanvasRenderingContext2D, obstacle: Obstacle) => {
    const px = 2;
    const ox = Math.floor(obstacle.x);
    const oy = Math.floor(obstacle.y);
    
    if (obstacle.type === 'tree') {
      drawPixel(ctx, ox + 6, oy, px, '#228B22');
      drawPixel(ctx, ox + 8, oy, px, '#228B22');
      drawPixel(ctx, ox + 4, oy + 2, px, '#228B22');
      drawPixel(ctx, ox + 6, oy + 2, px, '#1B5E20');
      drawPixel(ctx, ox + 8, oy + 2, px, '#228B22');
      drawPixel(ctx, ox + 10, oy + 2, px, '#228B22');
      drawPixel(ctx, ox + 2, oy + 4, px, '#228B22');
      drawPixel(ctx, ox + 4, oy + 4, px, '#1B5E20');
      drawPixel(ctx, ox + 6, oy + 4, px, '#228B22');
      drawPixel(ctx, ox + 8, oy + 4, px, '#1B5E20');
      drawPixel(ctx, ox + 10, oy + 4, px, '#228B22');
      drawPixel(ctx, ox + 12, oy + 4, px, '#228B22');
      drawPixel(ctx, ox + 4, oy + 6, px, '#228B22');
      drawPixel(ctx, ox + 6, oy + 6, px, '#1B5E20');
      drawPixel(ctx, ox + 8, oy + 6, px, '#228B22');
      drawPixel(ctx, ox + 10, oy + 6, px, '#1B5E20');
      drawPixel(ctx, ox, oy + 8, px, '#228B22');
      drawPixel(ctx, ox + 2, oy + 8, px, '#1B5E20');
      drawPixel(ctx, ox + 4, oy + 8, px, '#228B22');
      drawPixel(ctx, ox + 6, oy + 8, px, '#1B5E20');
      drawPixel(ctx, ox + 8, oy + 8, px, '#228B22');
      drawPixel(ctx, ox + 10, oy + 8, px, '#1B5E20');
      drawPixel(ctx, ox + 12, oy + 8, px, '#228B22');
      drawPixel(ctx, ox + 14, oy + 8, px, '#228B22');
      drawPixel(ctx, ox + 2, oy + 10, px, '#228B22');
      drawPixel(ctx, ox + 4, oy + 10, px, '#1B5E20');
      drawPixel(ctx, ox + 6, oy + 10, px, '#228B22');
      drawPixel(ctx, ox + 8, oy + 10, px, '#1B5E20');
      drawPixel(ctx, ox + 10, oy + 10, px, '#228B22');
      drawPixel(ctx, ox + 12, oy + 10, px, '#1B5E20');
      drawPixel(ctx, ox + 6, oy + 12, px, '#8B4513');
      drawPixel(ctx, ox + 8, oy + 12, px, '#8B4513');
      drawPixel(ctx, ox + 6, oy + 14, px, '#6D4C41');
      drawPixel(ctx, ox + 8, oy + 14, px, '#6D4C41');
    } else if (obstacle.type === 'rock') {
      drawPixel(ctx, ox + 6, oy, px, '#696969');
      drawPixel(ctx, ox + 8, oy, px, '#696969');
      drawPixel(ctx, ox + 10, oy, px, '#808080');
      drawPixel(ctx, ox + 4, oy + 2, px, '#696969');
      drawPixel(ctx, ox + 6, oy + 2, px, '#505050');
      drawPixel(ctx, ox + 8, oy + 2, px, '#696969');
      drawPixel(ctx, ox + 10, oy + 2, px, '#808080');
      drawPixel(ctx, ox + 12, oy + 2, px, '#696969');
      drawPixel(ctx, ox + 2, oy + 4, px, '#696969');
      drawPixel(ctx, ox + 4, oy + 4, px, '#505050');
      drawPixel(ctx, ox + 6, oy + 4, px, '#696969');
      drawPixel(ctx, ox + 8, oy + 4, px, '#505050');
      drawPixel(ctx, ox + 10, oy + 4, px, '#696969');
      drawPixel(ctx, ox + 12, oy + 4, px, '#808080');
      drawPixel(ctx, ox + 14, oy + 4, px, '#696969');
      drawPixel(ctx, ox + 4, oy + 6, px, '#696969');
      drawPixel(ctx, ox + 6, oy + 6, px, '#505050');
      drawPixel(ctx, ox + 8, oy + 6, px, '#696969');
      drawPixel(ctx, ox + 10, oy + 6, px, '#505050');
      drawPixel(ctx, ox + 12, oy + 6, px, '#696969');
    } else if (obstacle.type === 'jump') {
      drawPixel(ctx, ox + 2, oy + 4, px, '#87CEEB');
      drawPixel(ctx, ox + 4, oy + 4, px, '#87CEEB');
      drawPixel(ctx, ox + 6, oy + 2, px, '#ADD8E6');
      drawPixel(ctx, ox + 8, oy + 2, px, '#ADD8E6');
      drawPixel(ctx, ox + 10, oy + 2, px, '#87CEEB');
      drawPixel(ctx, ox + 12, oy + 2, px, '#87CEEB');
      drawPixel(ctx, ox + 14, oy + 4, px, '#87CEEB');
      drawPixel(ctx, ox + 16, oy + 4, px, '#87CEEB');
      drawPixel(ctx, ox + 18, oy + 4, px, '#ADD8E6');
      drawPixel(ctx, ox + 20, oy + 4, px, '#87CEEB');
    }
  }, [drawPixel]);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const skier = skierRef.current;
    
    ctx.fillStyle = '#f8f8ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = 'rgba(200, 200, 255, 0.4)';
      ctx.fillRect(
        Math.floor((Math.sin(Date.now() / 800 + i * 50) * 15 + (i * 41) % canvas.width)),
        Math.floor(((Date.now() / 25 + i * 40) % (canvas.height + 10)) - 5),
        2,
        2
      );
    }
    
    if (!skier.crashed) {
      const isMovingLeft = keysRef.current.has('ArrowLeft') || keysRef.current.has('a') || touchHoldRef.current === 'left';
      const isMovingRight = keysRef.current.has('ArrowRight') || keysRef.current.has('d') || touchHoldRef.current === 'right';
      
      if (isMovingLeft) {
        skier.x -= 3;
        skier.direction = 'left';
      } else if (isMovingRight) {
        skier.x += 3;
        skier.direction = 'right';
      } else {
        skier.direction = 'center';
      }
      
      skier.x = Math.max(10, Math.min(canvas.width - 26, skier.x));
      skier.distance += skier.speed;
      skier.speed = Math.min(6, 3 + skier.distance / 3000);
      
      if (Math.random() < 0.025 + skier.speed / 300) {
        spawnObstacle(canvas.width, canvas.height);
      }
    }
    
    obstaclesRef.current = obstaclesRef.current.filter(obs => {
      obs.y -= skier.speed;
      
      if (!skier.crashed && checkCollision(skier, obs)) {
        skier.crashed = true;
        const score = Math.floor(skier.distance / 10);
        setFinalScore(score);
        if (score > highScoreRef.current) {
          highScoreRef.current = score;
          setHighScore(score);
          try {
            localStorage.setItem(HIGH_SCORE_KEY, score.toString());
          } catch {}
        }
        setGameOver(true);
        onGameOver?.(score);
      }
      
      return obs.y > -50;
    });
    
    obstaclesRef.current.forEach(obs => drawObstacle(ctx, obs));
    drawSkier(ctx, skier);
    
    ctx.fillStyle = '#333';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`${Math.floor(skier.distance / 10)} yds`, 8, 20);
    
    ctx.fillStyle = '#666';
    ctx.font = '10px monospace';
    ctx.fillText(`BEST: ${highScoreRef.current} yds`, 8, 34);
    
    if (isPlaying && !gameOver) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
  }, [isPlaying, gameOver, spawnObstacle, checkCollision, drawSkier, drawObstacle, onGameOver]);

  const renderInitialFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#f8f8ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawSkier(ctx, skierRef.current);
  }, [drawSkier]);

  useEffect(() => {
    if (!isPlaying) return;
    resetGame();
    requestAnimationFrame(renderInitialFrame);
  }, [isPlaying, resetGame, renderInitialFrame]);

  useEffect(() => {
    if (!isPlaying || !gameStarted || gameOver) return;
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [isPlaying, gameStarted, gameOver, gameLoop]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'a', 'd', 'w', 's'].includes(e.key)) {
        e.preventDefault();
        setGameStarted(true);
      }
      keysRef.current.add(e.key);
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleStart = useCallback(() => {
    setGameStarted(true);
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent<HTMLCanvasElement> | MouseEvent<HTMLCanvasElement>) => {
    if (gameOver) return;
    setGameStarted(true);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let clientX: number;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }

    const x = clientX - rect.left;
    const canvasMiddle = rect.width / 2;

    if (x < canvasMiddle) {
      touchHoldRef.current = 'left';
    } else {
      touchHoldRef.current = 'right';
    }
  }, [gameOver]);

  const handleTouchMove = useCallback((e: TouchEvent<HTMLCanvasElement>) => {
    if (gameOver) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches[0].clientX;
    const x = clientX - rect.left;
    const canvasMiddle = rect.width / 2;
    
    if (x < canvasMiddle) {
      touchHoldRef.current = 'left';
    } else {
      touchHoldRef.current = 'right';
    }
  }, [gameOver]);

  const handleTouchEnd = useCallback(() => {
    touchHoldRef.current = null;
  }, []);

  const handleTryAgain = useCallback(() => {
    resetGame();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [resetGame, gameLoop]);

  if (!isPlaying) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-white to-transparent rounded-[24px]">
        <div className="font-['Satoshi-Bold'] text-black text-center" style={{ fontSize: 'calc(var(--text-small) * 1.2)' }}>
          Ski
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        data-testid="ski-game-canvas"
        width={313}
        height={308}
        className="w-full h-full rounded-[24px]"
        style={{ touchAction: 'none', imageRendering: 'pixelated' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
      />
      {!gameStarted && !gameOver && (
        <div
          className="text-center z-10 absolute inset-0 flex flex-col items-center justify-center bg-white/80 cursor-pointer rounded-[24px]"
          onClick={handleStart}
          onTouchStart={handleStart}
        >
          <div className="font-['Satoshi-Bold'] text-xl text-black mb-2">
            SKI
          </div>
          <div className="font-['Sora'] text-xs text-gray-500 mb-3">
            Hold left or right to steer
          </div>
          <div className="font-['Sora'] text-xs text-pink-400">
            Tap anywhere to start
          </div>
        </div>
      )}
      {gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[24px]" style={{ background: 'rgba(8,8,8,0.96)' }}>
          <div className="font-mono font-bold text-2xl mb-1" style={{ color: '#EE352E' }}>CRASHED!</div>
          <div className="font-mono text-base mb-1" style={{ color: '#EE352E' }}>{finalScore} yards</div>
          {finalScore >= highScore && finalScore > 0 && (
            <div className="font-mono text-sm mb-2" style={{ color: '#EE352E', opacity: 0.7 }}>NEW HIGH SCORE!</div>
          )}
          <div className="font-mono text-xs mb-5" style={{ color: 'rgba(238,53,46,0.45)' }}>Best: {highScore} yds</div>
          <button
            data-testid="try-again-button"
            onClick={handleTryAgain}
            className="px-6 py-2 font-mono font-bold text-sm"
            style={{ background: 'transparent', color: '#EE352E', border: '2px solid #EE352E', borderRadius: '4px' }}
          >
            TRY AGAIN
          </button>
        </div>
      )}
    </div>
  );
};
