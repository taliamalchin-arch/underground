import { useState, type MouseEvent } from 'react';
import { Card, CardContent } from '../ui/card';
import { SkiGame } from './SkiGame';
import { WordScramble } from './WordScramble';
import { ReflexTap } from './ReflexTap';

const SPACING = {
  cardPadding: 18,
  cardRadius: 30,
  imageRadius: 24,
};

const GAMES = [
  { id: 'ski', name: 'Ski Game', component: SkiGame },
  { id: 'word', name: 'Word Scramble', component: WordScramble },
  { id: 'reflex', name: 'Reflex', component: ReflexTap },
];

interface GamesCardProps {
  isExpanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
}

export const GamesCard = ({
  isExpanded,
  onExpand,
  onCollapse,
}: GamesCardProps) => {
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentGame = GAMES[currentGameIndex];
  const GameComponent = currentGame.component;

  const handleClose = (e: MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(false);
    setCurrentGameIndex(0);
    onCollapse();
  };

  const handleNext = (e: MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(false);
    setCurrentGameIndex((prev) => (prev + 1) % GAMES.length);
  };

  const handleClick = () => {
    if (!isExpanded) {
      onExpand();
    }
  };

  const handlePlay = (e: MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(true);
  };

  const getAspectRatio = () => {
    if (isExpanded) return "404/380";
    return "404/190";
  };

  return (
    <Card
      className="w-full border-0 flex flex-col cursor-pointer transition-all duration-300"
      style={{
        aspectRatio: getAspectRatio(),
        borderRadius: SPACING.cardRadius,
        padding: SPACING.cardPadding,
        backgroundColor: "#F6AFE9",
      }}
      onClick={handleClick}
    >
      <CardContent className="p-0 w-full h-full flex flex-col">
        <div className="flex items-center justify-between h-[17px]">
          <div
            className="font-['Sora',Helvetica] font-bold text-[10px] tracking-[1px] uppercase whitespace-nowrap overflow-hidden"
            style={{ color: "#fce8f8" }}
          >
            GAMES
          </div>
          {isExpanded && (
            <button
              data-testid="games-close-button"
              onClick={handleClose}
              className="flex items-center justify-center rounded-full"
              style={{ 
                width: 24, 
                height: 24, 
                backgroundColor: "#f8d4f0",
                marginRight: 3
              }}
            >
              <span className="font-['Sora',Helvetica] font-bold text-[12px]" style={{ color: "#fce8f8" }}>×</span>
            </button>
          )}
        </div>

        {!isExpanded ? (
          <div className="flex-1 flex flex-row mt-2" style={{ gap: 9 }}>
            {GAMES.map((game) => (
              <div
                key={game.id}
                className="flex-1 rounded-[24px] relative flex flex-col justify-end p-[10px] overflow-hidden"
                style={{ backgroundColor: '#ffc1f4', aspectRatio: '1/1' }}
              >
                <div 
                  className="font-['Satoshi-Bold',Helvetica] font-bold text-[22px] leading-[22px] tracking-[-0.88px] overflow-hidden"
                  style={{ color: '#ffe2fa' }}
                >
                  {game.name}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-row mt-2" style={{ gap: 14 }}>
            <div 
              className="rounded-[24px] relative overflow-hidden"
              style={{
                width: 313,
                height: 308,
              }}
            >
              {!isPlaying ? (
                <div 
                  className="absolute inset-0 flex flex-col items-center justify-center rounded-[24px]"
                  style={{ background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)' }}
                >
                  <div data-testid="current-game-name" className="font-['Satoshi-Bold'] text-2xl text-black mb-4">
                    {currentGame.name}
                  </div>
                  <button
                    data-testid="play-button"
                    onClick={handlePlay}
                    className="px-8 py-3 rounded-full font-['Sora',Helvetica] font-bold text-sm text-white shadow-lg transition-opacity"
                    style={{ backgroundColor: "#F6AFE9" }}
                  >
                    PLAY
                  </button>
                </div>
              ) : (
                <GameComponent isPlaying={isPlaying} onGameOver={() => setIsPlaying(false)} />
              )}
            </div>
            
            <div className="flex flex-col justify-end">
              <button
                data-testid="next-game-button"
                onClick={handleNext}
                className="flex items-center justify-center"
                style={{
                  width: 45,
                  height: 45,
                  borderRadius: 24,
                  backgroundColor: "#ffc1f4",
                }}
              >
                <span className="text-[#ffe2fa] text-xl font-bold">→</span>
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
