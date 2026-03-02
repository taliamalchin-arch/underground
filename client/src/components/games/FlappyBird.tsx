import { useState, useEffect, useCallback, useRef } from 'react';

interface Bird {
  x: number;
  y: number;
  r: number;
  vy: number;
}

interface Pipe {
  id: number;
  x: number;
  gap: number;
  scored: boolean;
}

interface FlappyBirdProps {
  isPlaying: boolean;
  onGameOver?: (score: number) => void;
}

export const FlappyBird = ({ isPlaying, onGameOver }: FlappyBirdProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const [gameStarted, setGameStarted] = useState(false);

  const gameStateRef = useRef({
    bird: { x: 80, y: 140, r: 10, vy: 0 } as Bird,
    pipes: [] as Pipe[],
    score: 0,
    gameActive: false,
    pipeTimer: 0,
  });

  const canvasWidth = 313;
  const canvasHeight = 280;
  const pipeWidth = 50;
  const gapSize = 100;
  const gravity = 900; // pixels/second²
  const flapVel = -300; // pixels/second
  const pipeSpeed = 180; // pixels/second
  const pipeInterval = 1.5; // seconds

  // App colors
  const colors = {
    background: '#f7f7f7',
    bird: '#F6AFE9', // pink
    pipeGreen: '#83b05d', // earth green
    pipeBrown: '#d9b593', // earth brown
    pipeDark: '#c2b5b3', // dark earth
  };

  const startGame = useCallback(() => {
    gameStateRef.current = {
      bird: { x: 80, y: 140, r: 10, vy: 0 },
      pipes: [],
      score: 0,
      gameActive: false,
      pipeTimer: 0,
    };
    setScore(0);
    setGameOver(false);
    setMessage('');
    setGameStarted(false);
    lastTimeRef.current = 0;
  }, []);

  useEffect(() => {
    if (isPlaying) {
      startGame();
    }
  }, [isPlaying, startGame]);

  const handleFlap = useCallback(() => {
    const state = gameStateRef.current;

    if (!gameStarted && !gameOver) {
      state.gameActive = true;
      setGameStarted(true);
    }

    if (state.gameActive && !gameOver) {
      state.bird.vy = flapVel;
    }
  }, [gameStarted, gameOver]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isPlaying) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = (timestamp: number) => {
      const state = gameStateRef.current;

      // Calculate delta time in seconds
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp;
      }
      const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = timestamp;

      // Only update physics when game is active
      if (state.gameActive) {
        // Update bird physics
        state.bird.vy += gravity * dt;
        state.bird.y += state.bird.vy * dt;

        // Spawn pipes
        state.pipeTimer += dt;
        if (state.pipeTimer > pipeInterval) {
          const gapHeight = Math.random() * 0.08 * canvasHeight + 0.22 * canvasHeight;
          const clampedGap = Math.max(80, Math.min(240, gapHeight));
          const gapStart = Math.random() * (canvasHeight - clampedGap - 40) + 20;

          state.pipes.push({
            id: Math.random(),
            x: canvasWidth,
            gap: gapStart,
            scored: false,
          });
          state.pipeTimer = 0;
        }

        // Update pipes
        state.pipes = state.pipes.filter(pipe => {
          pipe.x -= pipeSpeed * dt;

          // Check if bird passed pipe (for scoring)
          if (!pipe.scored && pipe.x + pipeWidth < state.bird.x - state.bird.r) {
            pipe.scored = true;
            state.score++;
            setScore(state.score);
          }

          // Collision detection
          const birdLeft = state.bird.x - state.bird.r;
          const birdRight = state.bird.x + state.bird.r;
          const birdTop = state.bird.y - state.bird.r;
          const birdBottom = state.bird.y + state.bird.r;

          const inX = birdRight > pipe.x && birdLeft < pipe.x + pipeWidth;
          const inYTop = birdTop < pipe.gap;
          const inYBot = birdBottom > pipe.gap + gapSize;

          if (inX && (inYTop || inYBot)) {
            state.gameActive = false;
            setGameOver(true);
            setMessage(`Score: ${state.score}`);
            onGameOver?.(state.score);
          }

          return pipe.x > -pipeWidth;
        });

        // Check ceiling/floor collision
        if (state.bird.y - state.bird.r < 0 || state.bird.y + state.bird.r > canvasHeight) {
          state.gameActive = false;
          setGameOver(true);
          setMessage(`Score: ${state.score}`);
          onGameOver?.(state.score);
        }
      }

      // Draw background
      ctx.fillStyle = colors.background;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Draw pipes with color blocks
      state.pipes.forEach((pipe, idx) => {
        const pipeColors = [colors.pipeGreen, colors.pipeBrown, colors.pipeDark];
        const color = pipeColors[idx % 3];

        // Top pipe
        ctx.fillStyle = color;
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.gap);

        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.gap + gapSize, pipeWidth, canvasHeight - (pipe.gap + gapSize));
      });

      // Draw bird (circle)
      ctx.fillStyle = colors.bird;
      ctx.beginPath();
      ctx.arc(state.bird.x, state.bird.y, state.bird.r, 0, Math.PI * 2);
      ctx.fill();

      // Add circle highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(state.bird.x - 3, state.bird.y - 3, state.bird.r * 0.4, 0, Math.PI * 2);
      ctx.fill();

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [isPlaying, onGameOver, gameOver]);

  const handleTryAgain = () => {
    setMessage('');
    startGame();
  };

  if (!isPlaying) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-white to-transparent rounded-[16px]">
        <div className="font-['Satoshi-Bold'] text-black text-center" style={{ fontSize: 'calc(var(--text-small) * 1.2)' }}>
          Flappy Circle
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-white rounded-[16px] relative overflow-hidden">
      {/* Score */}
      <div className="absolute top-3 left-0 right-0 flex justify-center px-4 z-20 pointer-events-none">
        <div className="font-['Sora'] font-bold text-sm text-gray-600">
          Score: {score}
        </div>
      </div>

      {!gameStarted && !message && (
        <div
          className="text-center z-10 absolute inset-0 flex flex-col items-center justify-center bg-white/80 cursor-pointer"
          onClick={handleFlap}
          onTouchStart={handleFlap}
        >
          <div className="font-['Satoshi-Bold'] text-xl text-black mb-2">
            FLAPPY CIRCLE
          </div>
          <div className="font-['Sora'] text-xs text-gray-500 mb-3">
            Tap to fly through the pipes!
          </div>
          <div className="font-['Sora'] text-xs text-pink-400">
            Tap anywhere to start
          </div>
        </div>
      )}

      {message && (
        <div className="text-center z-10 absolute inset-0 flex flex-col items-center justify-center" style={{ background: 'rgba(8,8,8,0.96)' }}>
          <div className="font-mono font-bold text-2xl mb-1" style={{ color: '#EE352E' }}>
            GAME OVER
          </div>
          <div className="font-mono text-base mb-5" style={{ color: 'rgba(238,53,46,0.6)' }}>
            {message}
          </div>
          <button
            onClick={handleTryAgain}
            className="px-6 py-2 font-mono font-bold text-sm"
            style={{ background: 'transparent', color: '#EE352E', border: '2px solid #EE352E', borderRadius: '4px' }}
          >
            PLAY AGAIN
          </button>
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        onClick={handleFlap}
        onTouchStart={handleFlap}
        className="cursor-pointer"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
};
