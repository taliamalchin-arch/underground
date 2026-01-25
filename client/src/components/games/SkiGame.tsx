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

export const SkiGame = ({ isPlaying, onGameOver }: SkiGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const [gameOver, setGameOver] = useState(false);
  
  const skierRef = useRef<SkierState>({
    x: 150,
    y: 80,
    direction: 'center',
    speed: 3,
    crashed: false,
    distance: 0,
  });
  
  const obstaclesRef = useRef<Obstacle[]>([]);
  const nextObstacleIdRef = useRef(0);
  const keysRef = useRef<Set<string>>(new Set());

  const resetGame = useCallback(() => {
    skierRef.current = {
      x: 150,
      y: 80,
      direction: 'center',
      speed: 3,
      crashed: false,
      distance: 0,
    };
    obstaclesRef.current = [];
    nextObstacleIdRef.current = 0;
    setGameOver(false);
  }, []);

  const spawnObstacle = useCallback((canvasWidth: number, canvasHeight: number) => {
    const types: ('tree' | 'rock' | 'jump')[] = ['tree', 'tree', 'tree', 'rock', 'jump'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const obstacle: Obstacle = {
      id: nextObstacleIdRef.current++,
      x: Math.random() * (canvasWidth - 30) + 15,
      y: canvasHeight + 20,
      type,
      width: type === 'tree' ? 20 : type === 'rock' ? 25 : 30,
      height: type === 'tree' ? 30 : type === 'rock' ? 15 : 8,
    };
    
    obstaclesRef.current.push(obstacle);
  }, []);

  const checkCollision = useCallback((skier: SkierState, obstacle: Obstacle): boolean => {
    if (obstacle.type === 'jump') return false;
    
    const skierWidth = 16;
    const skierHeight = 24;
    
    return (
      skier.x < obstacle.x + obstacle.width &&
      skier.x + skierWidth > obstacle.x &&
      skier.y < obstacle.y + obstacle.height &&
      skier.y + skierHeight > obstacle.y
    );
  }, []);

  const drawSkier = useCallback((ctx: CanvasRenderingContext2D, skier: SkierState) => {
    ctx.save();
    ctx.translate(skier.x + 8, skier.y + 12);
    
    if (skier.crashed) {
      ctx.fillStyle = '#333';
      ctx.fillRect(-10, -5, 20, 10);
      ctx.fillStyle = '#ff6b6b';
      ctx.font = '10px Arial';
      ctx.fillText('X', -3, 3);
    } else {
      const angle = skier.direction === 'left' ? -0.3 : skier.direction === 'right' ? 0.3 : 0;
      ctx.rotate(angle);
      
      ctx.fillStyle = '#2196F3';
      ctx.beginPath();
      ctx.ellipse(0, -4, 6, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#FFE4C4';
      ctx.beginPath();
      ctx.arc(0, -12, 5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-8, 8);
      ctx.lineTo(8, 8);
      ctx.stroke();
      
      ctx.strokeStyle = '#8B4513';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-4, -2);
      ctx.lineTo(-15, -8);
      ctx.moveTo(4, -2);
      ctx.lineTo(15, -8);
      ctx.stroke();
    }
    
    ctx.restore();
  }, []);

  const drawObstacle = useCallback((ctx: CanvasRenderingContext2D, obstacle: Obstacle) => {
    ctx.save();
    
    if (obstacle.type === 'tree') {
      ctx.fillStyle = '#228B22';
      ctx.beginPath();
      ctx.moveTo(obstacle.x + 10, obstacle.y);
      ctx.lineTo(obstacle.x, obstacle.y + 25);
      ctx.lineTo(obstacle.x + 20, obstacle.y + 25);
      ctx.closePath();
      ctx.fill();
      
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(obstacle.x + 7, obstacle.y + 25, 6, 8);
    } else if (obstacle.type === 'rock') {
      ctx.fillStyle = '#696969';
      ctx.beginPath();
      ctx.ellipse(obstacle.x + 12, obstacle.y + 8, 12, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#505050';
      ctx.beginPath();
      ctx.ellipse(obstacle.x + 10, obstacle.y + 6, 4, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (obstacle.type === 'jump') {
      ctx.fillStyle = '#87CEEB';
      ctx.beginPath();
      ctx.moveTo(obstacle.x, obstacle.y + 8);
      ctx.lineTo(obstacle.x + 15, obstacle.y);
      ctx.lineTo(obstacle.x + 30, obstacle.y + 8);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#4169E1';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    ctx.restore();
  }, []);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const skier = skierRef.current;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = 'rgba(200, 200, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(
        (Math.sin(Date.now() / 1000 + i * 100) * 20 + (i * 37) % canvas.width),
        ((Date.now() / 20 + i * 50) % (canvas.height + 20)) - 10,
        1.5,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    
    if (!skier.crashed) {
      if (keysRef.current.has('ArrowLeft') || keysRef.current.has('a')) {
        skier.x -= 4;
        skier.direction = 'left';
      } else if (keysRef.current.has('ArrowRight') || keysRef.current.has('d')) {
        skier.x += 4;
        skier.direction = 'right';
      } else {
        skier.direction = 'center';
      }
      
      skier.x = Math.max(10, Math.min(canvas.width - 26, skier.x));
      skier.distance += skier.speed;
      skier.speed = Math.min(8, 3 + skier.distance / 2000);
      
      if (Math.random() < 0.03 + skier.speed / 200) {
        spawnObstacle(canvas.width, canvas.height);
      }
    }
    
    obstaclesRef.current = obstaclesRef.current.filter(obs => {
      obs.y -= skier.speed;
      
      if (!skier.crashed && checkCollision(skier, obs)) {
        skier.crashed = true;
        setGameOver(true);
        onGameOver?.(Math.floor(skier.distance / 10));
      }
      
      return obs.y > -50;
    });
    
    obstaclesRef.current.forEach(obs => drawObstacle(ctx, obs));
    drawSkier(ctx, skier);
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.font = 'bold 14px Sora, sans-serif';
    ctx.fillText(`${Math.floor(skier.distance / 10)}m`, 10, 25);
    
    if (skier.crashed) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, canvas.height / 2 - 40, canvas.width, 80);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px Sora, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CRASHED!', canvas.width / 2, canvas.height / 2 - 10);
      ctx.font = '14px Sora, sans-serif';
      ctx.fillText(`Distance: ${Math.floor(skier.distance / 10)}m`, canvas.width / 2, canvas.height / 2 + 15);
      ctx.font = '12px Sora, sans-serif';
      ctx.fillText('Tap to restart', canvas.width / 2, canvas.height / 2 + 35);
      ctx.textAlign = 'left';
    }
    
    if (isPlaying && !gameOver) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
  }, [isPlaying, gameOver, spawnObstacle, checkCollision, drawSkier, drawObstacle, onGameOver]);

  useEffect(() => {
    if (isPlaying) {
      resetGame();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isPlaying, gameLoop, resetGame]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

  const handleTouch = useCallback((e: TouchEvent<HTMLCanvasElement> | MouseEvent<HTMLCanvasElement>) => {
    if (gameOver) return;
    
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
    const canvasMiddle = canvas.width / 2;
    
    if (x < canvasMiddle - 30) {
      keysRef.current.add('ArrowLeft');
      setTimeout(() => keysRef.current.delete('ArrowLeft'), 100);
    } else if (x > canvasMiddle + 30) {
      keysRef.current.add('ArrowRight');
      setTimeout(() => keysRef.current.delete('ArrowRight'), 100);
    }
  }, [gameOver]);

  const handleTryAgain = useCallback(() => {
    resetGame();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [resetGame, gameLoop]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        data-testid="ski-game-canvas"
        width={313}
        height={308}
        className="w-full h-full rounded-[24px]"
        style={{ touchAction: 'none' }}
        onTouchStart={handleTouch}
        onMouseDown={handleTouch}
      />
      {gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 rounded-[24px]">
          <div className="font-['Satoshi-Bold'] text-2xl text-white mb-2">Game Over!</div>
          <div className="font-['Sora'] text-sm text-white mb-4">Score: {skierRef.current.distance}</div>
          <button
            data-testid="try-again-button"
            onClick={handleTryAgain}
            className="px-6 py-2 rounded-full font-['Sora'] font-bold text-sm text-white shadow-lg"
            style={{ backgroundColor: "#F6AFE9" }}
          >
            TRY AGAIN
          </button>
        </div>
      )}
    </div>
  );
};
