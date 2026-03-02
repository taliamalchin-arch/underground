import { useState, useEffect, useRef, type MouseEvent, type TouchEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SkiGame } from './SkiGame';
import { SnakeGame } from './SnakeGame';
import { FlappyBird } from './FlappyBird';
import { COLORS } from '@/lib/colors';
import { getModuleConfig } from '@/lib/timing';
import { CardHeader } from '../ui/card-header';

const anim = getModuleConfig("games");

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center:               ({  x: 0,                              opacity: 1 }),
  exit:  (dir: number) => ({ x: dir > 0 ? '-100%' : '100%',  opacity: 0 }),
};

const GAMES = [
  { id: 'ski',    name: 'Ski',          component: SkiGame    },
  { id: 'snake',  name: 'Snake',        component: SnakeGame  },
  { id: 'flappy', name: 'Flappy Circle',component: FlappyBird },
];

interface GamesCardProps {
  isExpanded: boolean;
  onExpand:   () => void;
  onCollapse: () => void;
}

export const GamesCard = ({ isExpanded, onExpand, onCollapse }: GamesCardProps) => {
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [slideDir, setSlideDir] = useState(1);
  const touchStartX = useRef(0);

  // Scale-compensate heights so the visual card size matches desktop (scale=1)
  // regardless of the transform:scale applied by Mockup.tsx on smaller screens.
  const [rootScale, setRootScale] = useState(1);
  useEffect(() => {
    const root = document.getElementById('underground-root');
    if (!root) return;
    setRootScale(Math.min(root.clientWidth / 428, 1));
  }, []);

  const collapsedHeight = Math.round(200 / rootScale);
  const expandedHeight  = Math.round(420 / rootScale);

  const currentGame   = GAMES[currentGameIndex];
  const GameComponent = currentGame.component;

  const handleClose = () => {
    setCurrentGameIndex(0);
    onCollapse();
  };

  const handleNext = (e: MouseEvent) => {
    e.stopPropagation();
    setSlideDir(1);
    setCurrentGameIndex((prev) => (prev + 1) % GAMES.length);
  };

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) {
      const dir = delta > 0 ? 1 : -1;
      setSlideDir(dir);
      setCurrentGameIndex((prev) => (prev + dir + GAMES.length) % GAMES.length);
    }
  };

  const handleGameClick = (e: MouseEvent, index: number) => {
    e.stopPropagation();
    setCurrentGameIndex(index);
    onExpand();
  };

  return (
    <motion.div
      className={`card-neumorphic ${!isExpanded ? 'cursor-pointer' : ''}`}
      style={{
        width: '100%',
        borderRadius: 'var(--card-radius)',
        padding: 'var(--card-padding)',
        backgroundColor: COLORS.THEME.CARD_BG,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
      initial={false}
      animate={{ height: isExpanded ? expandedHeight : collapsedHeight }}
      transition={anim.expand}
      onClick={!isExpanded ? onExpand : undefined}
    >
      <div style={{ flexShrink: 0 }}>
        <CardHeader
          label="GAMES"
          labelColor={COLORS.THEME.LABEL_TEXT}
          accentColor={COLORS.GAMES.BACKGROUND}
          isExpanded={isExpanded}
          onClose={isExpanded ? handleClose : onExpand}
          buttonColor={COLORS.GAMES.BUTTON}
        />
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: isExpanded ? 'flex-start' : 'flex-end',
          overflow: 'hidden',
        }}
      >
        {/* Collapsed: game icon grid */}
        <motion.div
          className="flex flex-row mt-2"
          style={{ gap: 'var(--card-gap)', overflow: 'hidden', flexShrink: 0 }}
          initial={false}
          animate={{ opacity: isExpanded ? 0 : 1, height: isExpanded ? 0 : 'auto' }}
          transition={anim.teaserFade}
        >
          {GAMES.map((game, index) => (
            <div
              key={game.id}
              onClick={(e) => handleGameClick(e, index)}
              className="flex-1 relative overflow-hidden cursor-pointer flex items-center justify-center"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 100%)',
                backgroundColor: COLORS.THEME.CARD_BG_ELEVATED,
                aspectRatio: '1/1',
                borderRadius: 'var(--image-radius)',
              }}
            >
              {game.id === 'ski' && (
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ width: '55%', height: '55%' }}>
                  <rect x="4"  y="14" width="3" height="3" fill="#228B22" />
                  <rect x="7"  y="14" width="3" height="3" fill="#228B22" />
                  <rect x="1"  y="17" width="3" height="3" fill="#228B22" />
                  <rect x="4"  y="17" width="3" height="3" fill="#1B5E20" />
                  <rect x="7"  y="17" width="3" height="3" fill="#228B22" />
                  <rect x="10" y="17" width="3" height="3" fill="#228B22" />
                  <rect x="1"  y="20" width="3" height="3" fill="#228B22" />
                  <rect x="4"  y="20" width="3" height="3" fill="#1B5E20" />
                  <rect x="7"  y="20" width="3" height="3" fill="#228B22" />
                  <rect x="10" y="20" width="3" height="3" fill="#1B5E20" />
                  <rect x="4"  y="23" width="3" height="3" fill="#8B4513" />
                  <rect x="7"  y="23" width="3" height="3" fill="#8B4513" />
                  <rect x="21" y="24" width="3" height="3" fill="#FFE4C4" />
                  <rect x="24" y="24" width="3" height="3" fill="#FFE4C4" />
                  <rect x="18" y="27" width="3" height="3" fill="#2196F3" />
                  <rect x="21" y="27" width="3" height="3" fill="#2196F3" />
                  <rect x="24" y="27" width="3" height="3" fill="#2196F3" />
                  <rect x="27" y="27" width="3" height="3" fill="#2196F3" />
                  <rect x="18" y="30" width="3" height="3" fill="#2196F3" />
                  <rect x="21" y="30" width="3" height="3" fill="#1976D2" />
                  <rect x="24" y="30" width="3" height="3" fill="#1976D2" />
                  <rect x="27" y="30" width="3" height="3" fill="#2196F3" />
                  <rect x="15" y="33" width="3" height="3" fill="#333"    />
                  <rect x="18" y="33" width="3" height="3" fill="#333"    />
                  <rect x="21" y="33" width="3" height="3" fill="#333"    />
                  <rect x="24" y="33" width="3" height="3" fill="#333"    />
                  <rect x="27" y="33" width="3" height="3" fill="#333"    />
                  <rect x="30" y="33" width="3" height="3" fill="#333"    />
                  <rect x="15" y="27" width="3" height="3" fill="#8B4513" />
                  <rect x="30" y="27" width="3" height="3" fill="#8B4513" />
                  <rect x="37" y="8"  width="3" height="3" fill="#228B22" />
                  <rect x="40" y="8"  width="3" height="3" fill="#228B22" />
                  <rect x="34" y="11" width="3" height="3" fill="#228B22" />
                  <rect x="37" y="11" width="3" height="3" fill="#1B5E20" />
                  <rect x="40" y="11" width="3" height="3" fill="#228B22" />
                  <rect x="43" y="11" width="3" height="3" fill="#228B22" />
                  <rect x="34" y="14" width="3" height="3" fill="#228B22" />
                  <rect x="37" y="14" width="3" height="3" fill="#1B5E20" />
                  <rect x="40" y="14" width="3" height="3" fill="#228B22" />
                  <rect x="43" y="14" width="3" height="3" fill="#1B5E20" />
                  <rect x="37" y="17" width="3" height="3" fill="#8B4513" />
                  <rect x="40" y="17" width="3" height="3" fill="#8B4513" />
                </svg>
              )}
              {game.id === 'snake' && (
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ width: '55%', height: '55%' }}>
                  <rect x="6"  y="20" width="6" height="6" fill="#1565C0" />
                  <rect x="12" y="20" width="6" height="6" fill="#1976D2" />
                  <rect x="18" y="20" width="6" height="6" fill="#1565C0" />
                  <rect x="24" y="20" width="6" height="6" fill="#1976D2" />
                  <rect x="30" y="20" width="6" height="6" fill="#1565C0" />
                  <rect x="30" y="14" width="6" height="6" fill="#1976D2" />
                  <rect x="36" y="14" width="6" height="6" fill="#2196F3" />
                  <rect x="38" y="15" width="2" height="2" fill="#fff"    />
                  <rect x="38" y="19" width="2" height="2" fill="#fff"    />
                  <rect x="14" y="32" width="4" height="4" fill="#e74c3c" />
                  <rect x="18" y="32" width="4" height="4" fill="#e74c3c" />
                  <rect x="14" y="36" width="4" height="4" fill="#e74c3c" />
                  <rect x="18" y="36" width="4" height="4" fill="#e74c3c" />
                  <rect x="16" y="30" width="2" height="2" fill="#228B22" />
                </svg>
              )}
              {game.id === 'flappy' && (
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ width: '55%', height: '55%' }}>
                  <circle cx="24" cy="24" r="12" fill={COLORS.GAMES.BACKGROUND} />
                  <circle cx="21" cy="21" r="4"  fill="rgba(255,255,255,0.45)" />
                </svg>
              )}
            </div>
          ))}
        </motion.div>

        {/* Expanded: game + next button */}
        {isExpanded && (
          <motion.div
            className="flex flex-row mt-2"
            style={{ gap: 'var(--card-gap)', flex: 1 }}
            initial={{ opacity: 0, y: anim.contentYOffset }}
            animate={{ opacity: 1, y: 0 }}
            transition={anim.contentEnter}
          >
            {/* Game area — starts immediately, game handles its own start/game-over/retry */}
            <div
              className="relative overflow-hidden flex-1"
              style={{
                borderRadius: 'var(--image-radius)',
                aspectRatio: '313/308',
              }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <AnimatePresence initial={false} custom={slideDir}>
                <motion.div
                  key={currentGameIndex}
                  custom={slideDir}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: 'spring', stiffness: 320, damping: 32, mass: 1 }}
                  style={{ position: 'absolute', inset: 0 }}
                >
                  <GameComponent isPlaying={true} />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Next button */}
            <div className="flex flex-col justify-end">
              <button
                data-testid="next-game-button"
                onClick={handleNext}
                className="flex items-center justify-center"
                style={{
                  width: 'var(--nav-btn-size)',
                  height: 'var(--nav-btn-size)',
                  borderRadius: 'var(--image-radius)',
                  backgroundColor: COLORS.GAMES.NAV_BUTTON,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <span
                  className="font-bold"
                  style={{ fontSize: 'calc(var(--text-headline) * 0.85)', color: COLORS.GAMES.ARROW }}
                >
                  →
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
