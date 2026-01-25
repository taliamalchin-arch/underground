import { useState, useEffect, useCallback, useRef, type MouseEvent, type TouchEvent } from 'react';

interface ReflexTapProps {
  isPlaying: boolean;
  onGameOver?: (score: number) => void;
}

export const ReflexTap = ({ isPlaying, onGameOver }: ReflexTapProps) => {
  const [score, setScore] = useState(0);
  const [targetVisible, setTargetVisible] = useState(false);
  const [targetPosition, setTargetPosition] = useState({ x: 50, y: 50 });
  const [gameActive, setGameActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [message, setMessage] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout>();
  const targetTimerRef = useRef<NodeJS.Timeout>();

  const showNewTarget = useCallback(() => {
    const x = Math.random() * 70 + 15;
    const y = Math.random() * 60 + 20;
    setTargetPosition({ x, y });
    setTargetVisible(true);
    
    targetTimerRef.current = setTimeout(() => {
      setTargetVisible(false);
      if (gameActive) {
        setTimeout(showNewTarget, 300 + Math.random() * 500);
      }
    }, 800 + Math.random() * 400);
  }, [gameActive]);

  const startGame = useCallback(() => {
    setScore(0);
    setTimeLeft(15);
    setGameActive(true);
    setMessage('');
    showNewTarget();
  }, [showNewTarget]);

  useEffect(() => {
    if (isPlaying && !gameActive) {
      startGame();
    }
  }, [isPlaying, gameActive, startGame]);

  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameActive) {
      setGameActive(false);
      setTargetVisible(false);
      setMessage(`Game Over! Score: ${score}`);
      onGameOver?.(score);
    }
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [gameActive, timeLeft, score, onGameOver]);

  useEffect(() => {
    return () => {
      if (targetTimerRef.current) clearTimeout(targetTimerRef.current);
    };
  }, []);

  const handleTap = (e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    if (!gameActive || message) return;
    
    if (targetVisible) {
      setScore(s => s + 1);
      setTargetVisible(false);
      if (targetTimerRef.current) clearTimeout(targetTimerRef.current);
      setTimeout(showNewTarget, 200);
    }
  };

  const handleTryAgain = () => {
    setMessage('');
    startGame();
  };

  if (!isPlaying) return null;

  return (
    <div 
      ref={containerRef}
      data-testid="reflex-tap-container"
      className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-white to-pink-100 rounded-[16px] relative overflow-hidden"
      onClick={handleTap}
      onTouchStart={handleTap}
      style={{ touchAction: 'none' }}
    >
      <div data-testid="reflex-score" className="absolute top-3 left-3 font-['Sora'] font-bold text-sm text-gray-600">
        Score: {score}
      </div>
      <div data-testid="reflex-timer" className="absolute top-3 right-3 font-['Sora'] font-bold text-sm text-gray-600">
        {timeLeft}s
      </div>
      
      {!gameActive && !message && (
        <div className="text-center">
          <div className="font-['Satoshi-Bold'] text-xl text-black mb-2">
            TAP REFLEX
          </div>
          <div className="font-['Sora'] text-xs text-gray-500">
            Tap the circles as fast as you can!
          </div>
          <div className="font-['Sora'] text-xs text-pink-400 mt-2">
            Tap to start
          </div>
        </div>
      )}
      
      {message && (
        <div className="text-center">
          <div className="font-['Satoshi-Bold'] text-xl text-black mb-2">
            {message}
          </div>
          <button
            data-testid="try-again-button"
            onClick={handleTryAgain}
            className="mt-4 px-6 py-2 rounded-full font-['Sora'] font-bold text-sm text-white shadow-lg"
            style={{ backgroundColor: "#F6AFE9" }}
          >
            TRY AGAIN
          </button>
        </div>
      )}
      
      {targetVisible && (
        <div
          className="absolute w-12 h-12 rounded-full bg-pink-400 shadow-lg animate-pulse cursor-pointer"
          style={{
            left: `${targetPosition.x}%`,
            top: `${targetPosition.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}
    </div>
  );
};
