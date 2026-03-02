import { useRef, useEffect, useState, useCallback, type TouchEvent, type MouseEvent } from 'react';

interface SnakeGameProps {
  isPlaying: boolean;
  onGameOver?: (score: number) => void;
}

type Direction = 'up' | 'down' | 'left' | 'right';

interface Point {
  x: number;
  y: number;
}

const CANVAS_W = 313;
const CANVAS_H = 308;
const CELL = 14;
const COLS = Math.floor(CANVAS_W / CELL);
const ROWS = Math.floor(CANVAS_H / CELL);
const HIGH_SCORE_KEY = 'snake_highscore';

export const SnakeGame = ({ isPlaying, onGameOver }: SnakeGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<number>();
  const dirRef = useRef<Direction>('right');
  const nextDirRef = useRef<Direction>('right');
  const snakeRef = useRef<Point[]>([]);
  const foodRef = useRef<Point>({ x: 0, y: 0 });
  const scoreRef = useRef(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try { return parseInt(localStorage.getItem(HIGH_SCORE_KEY) || '0', 10); } catch { return 0; }
  });
  const highScoreRef = useRef(highScore);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const spawnFood = useCallback((snake: Point[]) => {
    let p: Point;
    do {
      p = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    } while (snake.some(s => s.x === p.x && s.y === p.y));
    foodRef.current = p;
  }, []);

  const resetGame = useCallback(() => {
    const cx = Math.floor(COLS / 2);
    const cy = Math.floor(ROWS / 2);
    const snake = [
      { x: cx, y: cy },
      { x: cx - 1, y: cy },
      { x: cx - 2, y: cy },
    ];
    snakeRef.current = snake;
    dirRef.current = 'right';
    nextDirRef.current = 'right';
    scoreRef.current = 0;
    setGameStarted(false);
    setGameOver(false);
    setFinalScore(0);
    spawnFood(snake);
  }, [spawnFood]);

  const drawPixel = useCallback((ctx: CanvasRenderingContext2D, gx: number, gy: number, color: string, inset = 1) => {
    ctx.fillStyle = color;
    ctx.fillRect(gx * CELL + inset, gy * CELL + inset, CELL - inset * 2, CELL - inset * 2);
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#f8f8ff';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Grid dots
    ctx.fillStyle = 'rgba(200, 200, 230, 0.25)';
    for (let x = 0; x < COLS; x++) {
      for (let y = 0; y < ROWS; y++) {
        ctx.fillRect(x * CELL + CELL / 2, y * CELL + CELL / 2, 1, 1);
      }
    }

    // Food — pixel apple
    const fx = foodRef.current.x * CELL;
    const fy = foodRef.current.y * CELL;
    const px = 2;
    // apple body
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(fx + 4, fy + 4, px, px);
    ctx.fillRect(fx + 6, fy + 2, px, px);
    ctx.fillRect(fx + 8, fy + 2, px, px);
    ctx.fillRect(fx + 2, fy + 6, px, px);
    ctx.fillRect(fx + 4, fy + 6, px, px);
    ctx.fillRect(fx + 6, fy + 4, px, px);
    ctx.fillRect(fx + 8, fy + 4, px, px);
    ctx.fillRect(fx + 10, fy + 4, px, px);
    ctx.fillRect(fx + 2, fy + 8, px, px);
    ctx.fillRect(fx + 4, fy + 8, px, px);
    ctx.fillRect(fx + 6, fy + 6, px, px);
    ctx.fillRect(fx + 8, fy + 6, px, px);
    ctx.fillRect(fx + 10, fy + 6, px, px);
    ctx.fillRect(fx + 4, fy + 10, px, px);
    ctx.fillRect(fx + 6, fy + 8, px, px);
    ctx.fillRect(fx + 8, fy + 8, px, px);
    ctx.fillRect(fx + 6, fy + 10, px, px);
    ctx.fillRect(fx + 8, fy + 10, px, px);
    // stem
    ctx.fillStyle = '#228B22';
    ctx.fillRect(fx + 6, fy, px, px);
    ctx.fillRect(fx + 8, fy, px, px);

    // Snake
    const snake = snakeRef.current;
    snake.forEach((seg, i) => {
      if (i === 0) {
        // Head — brighter
        drawPixel(ctx, seg.x, seg.y, '#2196F3', 0);
        // Eyes
        const dir = dirRef.current;
        ctx.fillStyle = '#fff';
        if (dir === 'right') {
          ctx.fillRect(seg.x * CELL + 8, seg.y * CELL + 3, 3, 3);
          ctx.fillRect(seg.x * CELL + 8, seg.y * CELL + 9, 3, 3);
        } else if (dir === 'left') {
          ctx.fillRect(seg.x * CELL + 3, seg.y * CELL + 3, 3, 3);
          ctx.fillRect(seg.x * CELL + 3, seg.y * CELL + 9, 3, 3);
        } else if (dir === 'up') {
          ctx.fillRect(seg.x * CELL + 3, seg.y * CELL + 3, 3, 3);
          ctx.fillRect(seg.x * CELL + 9, seg.y * CELL + 3, 3, 3);
        } else {
          ctx.fillRect(seg.x * CELL + 3, seg.y * CELL + 9, 3, 3);
          ctx.fillRect(seg.x * CELL + 9, seg.y * CELL + 9, 3, 3);
        }
      } else {
        const shade = i % 2 === 0 ? '#1976D2' : '#1565C0';
        drawPixel(ctx, seg.x, seg.y, shade, 1);
      }
    });

    // Score
    ctx.fillStyle = '#333';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`${scoreRef.current}`, 8, 16);
    ctx.fillStyle = '#666';
    ctx.font = '10px monospace';
    ctx.fillText(`BEST: ${highScoreRef.current}`, 8, 28);
  }, [drawPixel]);

  const tick = useCallback(() => {
    dirRef.current = nextDirRef.current;
    const snake = snakeRef.current;
    const head = snake[0];
    const dir = dirRef.current;

    const next: Point = {
      x: head.x + (dir === 'right' ? 1 : dir === 'left' ? -1 : 0),
      y: head.y + (dir === 'down' ? 1 : dir === 'up' ? -1 : 0),
    };

    // Wall collision
    if (next.x < 0 || next.x >= COLS || next.y < 0 || next.y >= ROWS) {
      const score = scoreRef.current;
      setFinalScore(score);
      if (score > highScoreRef.current) {
        highScoreRef.current = score;
        setHighScore(score);
        try { localStorage.setItem(HIGH_SCORE_KEY, score.toString()); } catch {}
      }
      setGameOver(true);
      onGameOver?.(score);
      return;
    }

    // Self collision
    if (snake.some(s => s.x === next.x && s.y === next.y)) {
      const score = scoreRef.current;
      setFinalScore(score);
      if (score > highScoreRef.current) {
        highScoreRef.current = score;
        setHighScore(score);
        try { localStorage.setItem(HIGH_SCORE_KEY, score.toString()); } catch {}
      }
      setGameOver(true);
      onGameOver?.(score);
      return;
    }

    const newSnake = [next, ...snake];

    // Eat food
    if (next.x === foodRef.current.x && next.y === foodRef.current.y) {
      scoreRef.current += 1;
      spawnFood(newSnake);
    } else {
      newSnake.pop();
    }

    snakeRef.current = newSnake;
    render();
  }, [render, spawnFood, onGameOver]);

  useEffect(() => {
    if (!isPlaying) return;
    resetGame();
    // Render initial frame showing snake + food before game starts
    requestAnimationFrame(() => render());
  }, [isPlaying, resetGame, render]);

  // Start the tick loop only after user interaction
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    timerRef.current = window.setInterval(tick, 120);
    return () => clearInterval(timerRef.current);
  }, [gameStarted, gameOver, tick]);

  // Re-render on game over so overlay shows final state
  useEffect(() => {
    if (gameOver) render();
  }, [gameOver, render]);

  // Keyboard controls
  useEffect(() => {
    const opposite: Record<Direction, Direction> = { up: 'down', down: 'up', left: 'right', right: 'left' };
    const keyMap: Record<string, Direction> = {
      ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
      w: 'up', s: 'down', a: 'left', d: 'right',
    };

    const handleKey = (e: KeyboardEvent) => {
      const dir = keyMap[e.key];
      if (dir && dir !== opposite[dirRef.current]) {
        e.preventDefault();
        nextDirRef.current = dir;
        setGameStarted(true);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Touch swipe controls
  const handleTouchStart = useCallback((e: TouchEvent<HTMLCanvasElement> | MouseEvent<HTMLCanvasElement>) => {
    if (gameOver) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    touchStartRef.current = { x: clientX, y: clientY };
  }, [gameOver]);

  const handleTouchEnd = useCallback((e: TouchEvent<HTMLCanvasElement> | MouseEvent<HTMLCanvasElement>) => {
    if (gameOver || !touchStartRef.current) return;
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : e.clientY;
    const dx = clientX - touchStartRef.current.x;
    const dy = clientY - touchStartRef.current.y;
    const threshold = 10;

    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return;

    const opposite: Record<Direction, Direction> = { up: 'down', down: 'up', left: 'right', right: 'left' };
    let dir: Direction;
    if (Math.abs(dx) > Math.abs(dy)) {
      dir = dx > 0 ? 'right' : 'left';
    } else {
      dir = dy > 0 ? 'down' : 'up';
    }
    if (dir !== opposite[dirRef.current]) {
      nextDirRef.current = dir;
      setGameStarted(true);
    }
    touchStartRef.current = null;
  }, [gameOver]);

  const handleStart = useCallback(() => {
    setGameStarted(true);
  }, []);

  const handleTryAgain = () => {
    resetGame();
    requestAnimationFrame(() => render());
  };

  if (!isPlaying) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-white to-transparent rounded-[24px]">
        <div className="font-['Satoshi-Bold'] text-black text-center" style={{ fontSize: 'calc(var(--text-small) * 1.2)' }}>
          Snake
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        data-testid="snake-game-canvas"
        width={CANVAS_W}
        height={CANVAS_H}
        className="w-full h-full rounded-[24px]"
        style={{ touchAction: 'none', imageRendering: 'pixelated' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
      />
      {!gameStarted && !gameOver && (
        <div
          className="text-center z-10 absolute inset-0 flex flex-col items-center justify-center bg-white/80 cursor-pointer rounded-[24px]"
          onClick={handleStart}
          onTouchStart={handleStart}
        >
          <div className="font-['Satoshi-Bold'] text-xl text-black mb-2">
            SNAKE
          </div>
          <div className="font-['Sora'] text-xs text-gray-500 mb-3">
            Swipe to pivot
          </div>
          <div className="font-['Sora'] text-xs text-pink-400">
            Tap anywhere to start
          </div>
        </div>
      )}
      {gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[24px]" style={{ background: 'rgba(8,8,8,0.96)' }}>
          <div className="font-mono font-bold text-2xl mb-1" style={{ color: '#EE352E' }}>GAME OVER</div>
          <div className="font-mono text-base mb-1" style={{ color: '#EE352E' }}>Score: {finalScore}</div>
          {finalScore >= highScore && finalScore > 0 && (
            <div className="font-mono text-sm mb-2" style={{ color: '#EE352E', opacity: 0.7 }}>NEW HIGH SCORE!</div>
          )}
          <div className="font-mono text-xs mb-5" style={{ color: 'rgba(238,53,46,0.45)' }}>Best: {highScore}</div>
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
