import { useState, useRef, useEffect, useCallback, useLayoutEffect, useMemo } from "react";
import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { GamesCard } from "@/components/games/GamesCard";
import { IntroAnimation } from "@/components/IntroAnimation";
import { COLORS } from "@/lib/colors";
import { getModuleConfig, CONTENT_TIMING } from "@/lib/timing";
import { CardHeader } from "@/components/ui/card-header";
import { DotNavigator } from "@/components/ui/dot-navigator";
import type { DailyContent } from "@shared/schema";

// Dynamic Date Header Component
const DateHeader = ({ dateStr }: { dateStr?: string }) => {
  const now = dateStr ? new Date(dateStr + "T12:00:00") : new Date();
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(48);

  const month = now.toLocaleDateString('en-US', { month: 'long' });
  const day = now.getDate();
  const year = now.getFullYear();
  
  // Add ordinal suffix
  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };
  
  const dateLine = `${month} ${getOrdinal(day)}, ${year}`;

  useEffect(() => {
    const adjustFontSize = () => {
      const container = containerRef.current;
      const text = textRef.current;
      if (!container || !text) return;

      const containerWidth = container.offsetWidth;
      let currentSize = 100;
      
      text.style.fontSize = `${currentSize}px`;
      
      while (text.scrollWidth > containerWidth && currentSize > 20) {
        currentSize -= 2;
        text.style.fontSize = `${currentSize}px`;
      }
      
      setFontSize(currentSize);
    };

    adjustFontSize();
    window.addEventListener('resize', adjustFontSize);
    return () => window.removeEventListener('resize', adjustFontSize);
  }, [dateLine]);

  return (
    <header ref={containerRef} className="w-full" style={{ marginBottom: -4 }}>
      <div
        ref={textRef}
        className="type-display"
        style={{ fontSize: `${fontSize}px`, color: COLORS.UTILITY.DATE_TEXT }}
      >
        {dateLine}
      </div>
    </header>
  );
};

// News data for Above Ground module
const NEWS_ITEMS = [
  {
    headline: "OpenAI's Sora video model finally dropped",
    description: "The text-to-video tool generated immediate hype and concern. Early tests show impressive results, but discourse quickly shifted to implications for film industry jobs and AI-generated misinformation.",
    description2: "Within hours, creators were sharing everything from cinematic shorts to absurdist fever dreams. The discourse moved fast.",
    source: "OpenAI / X",
  },
  {
    headline: "Barbie got snubbed at the Oscars for Best Director",
    description: "Greta Gerwig's omission from the Best Director category sparked immediate backlash. The irony wasn't lost on anyone given the film's themes about women being overlooked.",
    description2: "The Academy's voting patterns came under scrutiny once again, reigniting conversations about systemic bias in Hollywood.",
    source: "Academy / Variety",
  },
  {
    headline: "Reddit's API changes killed third-party apps",
    description: "Apollo, RIF, and other beloved apps shut down after Reddit imposed unsustainable pricing. Moderators staged blackouts in protest, and thousands migrated to alternatives.",
    description2: "The platform's relationship with its most devoted users fundamentally shifted. Some subreddits never fully recovered.",
    source: "Reddit / The Verge",
  },
  {
    headline: "Taylor Swift and Travis Kelce dominated everything",
    description: "The relationship turned NFL games into cultural events. Camera cuts to Swift in the stands became a meme format, and think pieces about the crossover audience flooded timelines.",
    description2: "Swifties learned football terminology. Football fans learned Taylor's discography. The algorithm won.",
    source: "X / ESPN",
  },
  {
    headline: "ChatGPT's voice mode felt uncomfortably human",
    description: "The new Advanced Voice feature sparked conversations about parasocial AI relationships. Users reported feeling genuinely attached to the conversational quality.",
    description2: "The line between tool and companion blurred in ways that made some people uneasy — and others deeply curious.",
    source: "OpenAI / X",
  },
];

// Trivia & Riddle data
const TRIVIA_DATA = {
  question: "What year did the first iPhone launch?",
  answer: "2007"
};

const RIDDLE_DATA = {
  question: "The more you take, the more you leave behind. What am I?",
  answer: "Footsteps"
};

// Above Ground Checkin - Interactive expandable card (matches AnimationLab pattern exactly)
const AboveGroundCard = ({
  isExpanded,
  forcedQuarter,
  onExpand,
  onCollapse,
  items,
  expandedHeight: expandedHeightProp,
}: {
  isExpanded: boolean;
  forcedQuarter?: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  items?: typeof NEWS_ITEMS;
  expandedHeight?: number;
}) => {
  const anim = getModuleConfig("aboveGround");
  const newsItems = items || NEWS_ITEMS;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [isDragging, setIsDragging] = useState(false);
  const [didSwipe, setDidSwipe] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [startX, setStartX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoRotateRef = useRef<ReturnType<typeof setInterval>>(null);

  const isQuarter = forcedQuarter || false;
  const collapsedHeight = 190;
  const expandedHeight = expandedHeightProp || 380;

  const handleClose = () => {
    onCollapse();
  };

  const handleClick = () => {
    if (!isExpanded && !didSwipe) {
      onExpand();
    }
  };

  const goToIndex = useCallback((index: number, dir?: number) => {
    const totalItems = newsItems.length;
    const newIndex = ((index % totalItems) + totalItems) % totalItems;
    if (dir !== undefined) {
      setDirection(dir);
    } else {
      setDirection(newIndex > currentIndex ? 1 : -1);
    }
    setCurrentIndex(newIndex);
  }, [currentIndex]);

  // Auto-rotate in collapsed state only (disabled on expand)
  useEffect(() => {
    if (isExpanded) {
      if (autoRotateRef.current) clearInterval(autoRotateRef.current);
      return;
    }
    autoRotateRef.current = setInterval(() => {
      setDirection(1);
      setCurrentIndex(prev => (prev + 1) % newsItems.length);
    }, 4000);
    return () => { if (autoRotateRef.current) clearInterval(autoRotateRef.current); };
  }, [isExpanded, newsItems.length]);

  // Reset auto-rotate timer on manual navigation
  const resetAutoRotate = useCallback(() => {
    if (isExpanded) return;
    if (autoRotateRef.current) clearInterval(autoRotateRef.current);
    autoRotateRef.current = setInterval(() => {
      setDirection(1);
      setCurrentIndex(prev => (prev + 1) % newsItems.length);
    }, 4000);
  }, [isExpanded]);

  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setDidSwipe(false);
    setStartX(clientX);
    setDragOffset(0);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    const offset = clientX - startX;
    setDragOffset(offset);
    if (Math.abs(offset) > 10) setDidSwipe(true);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const threshold = 50;
    if (dragOffset > threshold) {
      goToIndex(currentIndex - 1, -1);
      resetAutoRotate();
    } else if (dragOffset < -threshold) {
      goToIndex(currentIndex + 1, 1);
      resetAutoRotate();
    }
    setDragOffset(0);
  };

  const handleTouchStart = (e: React.TouchEvent) => handleDragStart(e.touches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) => handleDragMove(e.touches[0].clientX);
  const handleTouchEnd = () => handleDragEnd();
  const handleMouseDown = (e: React.MouseEvent) => { e.preventDefault(); handleDragStart(e.clientX); };
  const handleMouseMove = (e: React.MouseEvent) => handleDragMove(e.clientX);
  const handleMouseUp = () => handleDragEnd();
  const handleMouseLeave = () => { if (isDragging) handleDragEnd(); };

  const currentNews = newsItems[currentIndex];

  // Swipe animation variants for headline rotation
  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  const slideTransition = { duration: CONTENT_TIMING.headlineSlide.duration, ease: [0.4, 0, 0.2, 1] };

  // Quarter mode: parent controls size, no animation on card itself
  if (isQuarter) {
    return (
      <Card
        className="w-full h-full border-0 flex flex-col cursor-pointer card-neumorphic"
        style={{
          borderRadius: 'var(--card-radius)',
          padding: 'var(--card-padding)',
          backgroundColor: COLORS.THEME.CARD_BG,
          overflow: 'hidden',
        }}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <CardContent className="p-0 w-full h-full flex flex-col justify-between">
          <CardHeader
            label="ABOVE GROUND"
            labelColor={COLORS.THEME.LABEL_TEXT}
            accentColor={COLORS.ABOVE_GROUND.BACKGROUND}
            isExpanded={false}
            onClose={onExpand}
          />
          <div className="flex-1 flex items-end overflow-hidden">
            <div className="w-full relative" style={{ height: 'calc(var(--text-headline) * var(--leading-tight) * 2)' }}>
              <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={slideTransition}
                  className="type-headline overflow-hidden w-full absolute bottom-0 left-0 right-0"
                  style={{
                    color: COLORS.THEME.HEADLINE_TEXT,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {currentNews.headline}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Normal mode: explicit height animation (like MicroHistoryCard)
  return (
    <motion.div
      className={`card-neumorphic ${!isExpanded ? 'cursor-pointer' : ''}`}
      style={{
        width: '100%',
        borderRadius: 'var(--card-radius)',
        padding: 'var(--card-padding)',
        paddingBottom: 'calc(var(--card-padding) - 5px)',
        backgroundColor: COLORS.THEME.CARD_BG,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
      initial={false}
      animate={{ height: isExpanded ? expandedHeight : collapsedHeight }}
      transition={anim.expand}
      onClick={handleClick}
      onTouchStart={!isExpanded ? handleTouchStart : undefined}
      onTouchMove={!isExpanded ? handleTouchMove : undefined}
      onTouchEnd={!isExpanded ? handleTouchEnd : undefined}
      onMouseDown={!isExpanded ? handleMouseDown : undefined}
      onMouseMove={!isExpanded ? handleMouseMove : undefined}
      onMouseUp={!isExpanded ? handleMouseUp : undefined}
      onMouseLeave={!isExpanded ? handleMouseLeave : undefined}
    >
      <div style={{ flexShrink: 0, position: 'relative', zIndex: 1 }}>
        <CardHeader
          label="ABOVE GROUND"
          labelColor={COLORS.THEME.LABEL_TEXT}
          accentColor={COLORS.ABOVE_GROUND.BACKGROUND}
          isExpanded={isExpanded}
          onClose={isExpanded ? handleClose : onExpand}
        />
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          gap: isExpanded ? 'var(--card-gap)' : 'calc(var(--card-gap) * 0.5)',
          overflow: 'hidden',
          flex: 1,
          marginTop: undefined,
        }}
      >
        {/* Title — container handles layout positioning (expand/collapse), content swipes (navigation) */}
        <motion.div
          className="type-headline overflow-hidden"
          style={{
            color: COLORS.THEME.HEADLINE_TEXT,
            flexShrink: 0,
          }}
          layout="position"
          transition={anim.reposition}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTransition}
            >
              {currentNews.headline}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Expanded: body copy */}
        <AnimatePresence mode="popLayout">
          {isExpanded && (
            <div
              ref={containerRef}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--card-gap)',
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            >
              {/* Body copy with swipe animation and delayed entrance */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.075 }}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                >
                  <AnimatePresence initial={false} custom={direction} mode="popLayout">
                    <motion.div
                      key={currentIndex}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={slideTransition}
                      className="type-reading overflow-hidden"
                      style={{ color: COLORS.THEME.BODY_TEXT }}
                    >
                      <p>{currentNews.description}</p>
                      <p className="mt-2 opacity-80">{currentNews.description2}</p>
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Scroll indicator — always visible, pinned to bottom */}
        <motion.div
          style={{ flexShrink: 0, marginTop: 8 }}
          animate={{ opacity: isExpanded ? 1 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <DotNavigator count={newsItems.length} activeIndex={currentIndex} onSelect={goToIndex} />
        </motion.div>
      </div>
    </motion.div>
  );
};

// Calculate day number since app launch (starting from day 001)
const getFactleDayNumber = (): string => {
  const launchDate = new Date('2026-01-01'); // Set your launch date here
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - launchDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return String(diffDays).padStart(3, '0');
};

// SVG Bottle Cap Component - Front (navy blue with Factle script) - From Figma
const BottleCapFront = () => (
  <svg viewBox="0 0 900 900" style={{ width: '125%', height: '125%', filter: `drop-shadow(-2px 3px 4px ${COLORS.INTERACTIVE.SHADOW})` }}>
    {/* PNG image for front cap */}
    <image href={`${import.meta.env.BASE_URL}figmaAssets/factle-front.svg`} width="900" height="900" />
  </svg>
);

// SVG Bottle Cap Component - Back (cream colored with metallic edge) - From Figma
const BottleCapBack = ({ fact, dayNumber }: { fact: string; dayNumber: string }) => {
  // Split fact into lines that fit nicely - narrower width
  const words = fact.split(' ');
  const line1 = words.slice(0, 2).join(' ');
  const line2 = words.slice(2).join(' ');

  return (
    <svg viewBox="0 0 900 900" style={{ width: '125%', height: '125%', filter: 'drop-shadow(-2px 3px 4px rgba(0,0,0,0.2))' }}>
      <defs>
        {/* Arc path for curved text at BOTTOM - curves downward, inside the white ring with padding */}
        <path
          id="bottomArcPath"
          d="M 200 550 A 260 260 0 0 0 700 550"
          fill="none"
        />
      </defs>

      {/* PNG image for back cap background */}
      <image href={`${import.meta.env.BASE_URL}figmaAssets/factle-back.svg`} width="900" height="900" />

      {/* Center fact text - body copy style (type-reading) */}
      <text
        x="450"
        y="360"
        textAnchor="middle"
        fill={COLORS.FACTLE.CAP_TEXT_DARK}
        fontSize="80"
        fontFamily="Satoshi, Satoshi-Regular, Helvetica, sans-serif"
        fontWeight="400"
        letterSpacing="-0.7"
      >
        <tspan x="450" dy="0">{line1}</tspan>
        <tspan x="450" dy="88">{line2}</tspan>
      </text>

      {/* Curved text at BOTTOM - UNDERGROUND FACT # */}
      <text
        fill={COLORS.FACTLE.CAP_TEXT_MEDIUM}
        fontSize="24"
        fontFamily="Sora, sans-serif"
        fontWeight="700"
        letterSpacing="4"
      >
        <textPath xlinkHref="#bottomArcPath" startOffset="50%" textAnchor="middle">
          UNDERGROUND FACT #{dayNumber}
        </textPath>
      </text>
    </svg>
  );
};

const FactleFlipCard = ({ fact: factProp }: { fact?: string }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const fact = factProp || "Sharks are older than trees";
  const dayNumber = getFactleDayNumber();

  return (
    <Card
      className="w-full h-full border-0 flex flex-col overflow-visible card-neumorphic"
      style={{
        borderRadius: 'var(--card-radius)',
        padding: 'var(--card-padding)',
        backgroundColor: COLORS.THEME.CARD_BG,
      }}
    >
      <CardContent className="p-0 w-full h-full flex flex-col justify-between">
        <div className="flex items-center" style={{ height: 'var(--close-btn-size)', gap: 'calc(var(--text-label) * 0.6)' }}>
          <div
            className="rounded-full flex-shrink-0"
            style={{
              width: 'calc(var(--text-label) * 0.8)',
              height: 'calc(var(--text-label) * 0.8)',
              backgroundColor: COLORS.FACTLE.BACKGROUND,
            }}
          />
          <div
            className="type-label"
            style={{ color: COLORS.THEME.LABEL_TEXT }}
          >
            FACTLE
          </div>
        </div>
        {/* Flip container - the cap flips */}
        <div
          className="flex-1 w-full cursor-pointer flex items-center justify-center"
          style={{ perspective: "1000px" }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div
            className="relative flip-card-inner"
            style={{
              width: '90%',
              height: '90%',
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              transformStyle: "preserve-3d",
            }}
          >
            {/* Front - Navy cap with Factle script */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ backfaceVisibility: "hidden" }}
            >
              <BottleCapFront />
            </div>
            {/* Back - Cream cap with fact */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <BottleCapBack fact={fact} dayNumber={dayNumber} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Thought Experiment Card - single render path, wrapper handles size animation
const ThoughtExperimentCard = ({
  isExpanded,
  onExpand,
  onCollapse,
  text,
}: {
  isExpanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  text?: string;
}) => {
  const fullText = text || "Imagine a world where every object slowly changes shape when no one is looking, but returns to normal the moment it's observed. Nothing ever breaks or malfunctions — it's simply different when unseen. Would the unseen version of the world feel less real, or more honest?";

  return (
    <div
      className={`card-neumorphic ${!isExpanded ? 'cursor-pointer' : ''}`}
      style={{
        width: '100%',
        height: isExpanded ? 'auto' : '100%',
        borderRadius: 'var(--card-radius)',
        padding: 'var(--card-padding)',
        backgroundColor: COLORS.THEME.CARD_BG,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--card-gap)',
      }}
      onClick={!isExpanded ? onExpand : undefined}
    >
      <div style={{ flexShrink: 0 }}>
        <CardHeader
          label="THINKERS"
          labelColor={COLORS.THEME.LABEL_TEXT}
          accentColor={COLORS.THOUGHT_EXPERIMENT.BACKGROUND}
          isExpanded={isExpanded}
          onClose={isExpanded ? onCollapse : onExpand}
        />
      </div>

      <div
        style={{
          flex: isExpanded ? '0 0 auto' : 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: isExpanded ? 'flex-start' : 'flex-end',
          overflow: 'hidden',
        }}
      >
        <div
          className="type-headline"
          style={{
            color: COLORS.THEME.HEADLINE_TEXT,
            ...(!isExpanded && {
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical' as const,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }),
          }}
        >
          {fullText}
        </div>
      </div>
    </div>
  );
};

// Micro History Card - Expandable (matches AnimationLab pattern exactly)
const MicroHistoryCard = ({
  isExpanded,
  onExpand,
  onCollapse,
  titleProp,
  contentProp,
}: {
  isExpanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  titleProp?: string;
  contentProp?: string;
}) => {
  const anim = getModuleConfig("microHistory");
  const title = titleProp || "Why notebooks are usually lined";
  const fullText = contentProp || "Early mass-produced paper varied in quality, and lines helped guide handwriting when ink bled easily. The ruled lines became standard not just for aesthetics, but as a practical solution to inconsistent paper thickness and texture. Before mass production, paper was handmade and varied greatly in quality. Writers needed guides to keep their text straight and legible, especially when using fountain pens that could bleed or feather on lower-quality paper.";

  const measureRef = useRef<HTMLDivElement>(null);
  const [expandedHeight, setExpandedHeight] = useState(400);
  const collapsedHeight = 190;

  useLayoutEffect(() => {
    const measure = () => {
      if (measureRef.current && measureRef.current.offsetHeight > 0) {
        setExpandedHeight(measureRef.current.offsetHeight);
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (measureRef.current) observer.observe(measureRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Hidden measurement div */}
      <div
        ref={measureRef}
        aria-hidden
        style={{
          position: 'absolute',
          visibility: 'hidden',
          pointerEvents: 'none',
          width: '100%',
          padding: 'var(--card-padding)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--card-gap)',
        }}
      >
        <div style={{ height: 28 }} />
        <div className="type-headline">{title}</div>
        <div className="type-reading">{fullText}</div>
      </div>

      {/* Visible card — explicit height animation with spring */}
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
            label="MICRO HISTORY"
            labelColor={COLORS.THEME.LABEL_TEXT}
            accentColor={COLORS.MICRO_HISTORY.BACKGROUND}
            isExpanded={isExpanded}
            onClose={isExpanded ? onCollapse : onExpand}
          />
        </div>

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            gap: 'calc(var(--card-gap) * 0.4)',
            overflow: 'hidden',
          }}
        >
          {/* Title — stays pinned to bottom, glides up as body appears */}
          <motion.div
            className="type-headline"
            style={{ flexShrink: 0, color: COLORS.THEME.HEADLINE_TEXT }}
            layout="position"
            transition={{ ...anim.reposition, damping: 50 }}
          >
            {title}
          </motion.div>

          {/* Body copy — fast exit (0.075s), delayed entrance (0.35s) */}
          <AnimatePresence mode="popLayout">
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.075 }}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="type-reading"
                  style={{ color: COLORS.THEME.BODY_TEXT }}
                >
                  {fullText}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

// Wiki Summary Card - Expandable (matches AnimationLab pattern exactly)
const WikiSummaryCard = ({
  isExpanded,
  onExpand,
  onCollapse,
  articleTitleProp,
  summaryProp,
}: {
  isExpanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  articleTitleProp?: string;
  summaryProp?: string;
}) => {
  const anim = getModuleConfig("wikiSummary");
  const articleTitle = articleTitleProp || "The Amber Room";
  const scrollRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [expandedHeight, setExpandedHeight] = useState(800);
  const collapsedHeight = 190;
  const titleY = useMotionValue(0);
  const yOffsetRef = useRef(0);

  const defaultSections = [
    {
      heading: "A Room Made of Sunlight",
      body: "In 1701, King Frederick I of Prussia commissioned something the world had never seen: an entire chamber paneled in amber. German baroque sculptor Andreas Schl\u00FCter drew the designs, and Danish craftsman Gottfried Wolfram began the painstaking assembly\u2014fitting thousands of hand-carved amber pieces, backed with gold leaf and mirrors, into elaborate mosaics. The work took over a decade. By the time it was installed in the Berlin City Palace, the room glowed like trapped sunlight, six tonnes of fossilized resin transformed into walls."
    },
    {
      heading: "The Gift",
      body: "In 1716, Frederick William I gave the entire room to Czar Peter the Great of Russia, cementing a Prussian-Russian alliance against Sweden. The panels were packed into eighteen large boxes, carried by horse and cart to St. Petersburg, and eventually installed in the Catherine Palace at Tsarskoye Selo. Italian architect Bartolomeo Francesco Rastrelli was tasked with expanding the room to fill a much larger hall\u2014roughly six times the original size. He added gilded carvings, mirrors, and additional amber panels. By the time the renovations were complete, the Amber Room covered more than 55 square metres and was widely called the Eighth Wonder of the World."
    },
    {
      heading: "36 Hours",
      body: "When Nazi Germany invaded the Soviet Union in 1941, curators at the Catherine Palace attempted to disassemble the room for evacuation. The amber was too brittle\u2014it crumbled at the touch. They tried hiding it behind thin wallpaper instead. It didn\u2019t work. Soldiers from Army Group North found the room almost immediately. German troops dismantled the entire chamber in just 36 hours, packed it into 27 crates, and shipped it to K\u00F6nigsberg Castle in East Prussia, where it was reassembled and put on display for the last confirmed time."
    },
    {
      heading: "Vanished",
      body: "By early 1944, with Allied forces closing in, the room was disassembled again and crated for safekeeping in the castle basement. In August of that year, British bombers devastated K\u00F6nigsberg. The castle burned. Soviet forces captured the ruined city in April 1945, but the crates were gone. No one has seen the original Amber Room since. The documentation simply stops. Theories abound: that the panels were destroyed in the bombing, that they were smuggled out on a ship that sank in the Baltic, that they remain hidden in a sealed mine shaft somewhere in Germany. Treasure hunters have searched for decades. None have found it."
    },
    {
      heading: "Built Again",
      body: "In 1979, the Soviet government authorized a full reconstruction. It took 24 years. Forty Russian and German master craftsmen carved new amber panels by hand, working from black-and-white photographs and a single surviving color slide. German energy company E.ON donated $3.5 million to help finish the project. In 2003, Russian president Vladimir Putin and German chancellor Gerhard Schr\u00F6der dedicated the completed room at the Catherine Palace\u2014exactly 300 years after the city of St. Petersburg was founded. The replica glows the same warm gold. The original, wherever it is, has never been found."
    },
  ];

  const sections = summaryProp
    ? [{ heading: "", body: summaryProp }]
    : defaultSections;

  // Measure expanded height + compute collapsed title y-offset
  useLayoutEffect(() => {
    if (measureRef.current) {
      setExpandedHeight(measureRef.current.offsetHeight);
    }
    if (scrollRef.current && titleRef.current) {
      // Content area height (collapsed) minus title height = exact offset to pin title at bottom
      const offset = scrollRef.current.offsetHeight - titleRef.current.offsetHeight;
      yOffsetRef.current = offset;
      if (!isExpanded) {
        titleY.set(offset); // snap to collapsed position without animation
      }
    }
  }, []);

  // Animate title y when expand/collapse state changes
  useEffect(() => {
    const target = isExpanded ? 0 : yOffsetRef.current;
    const transition = isExpanded ? anim.reposition : anim.expand;
    const controls = animate(titleY, target, transition);
    return () => controls.stop();
  }, [isExpanded]);

  // Reset scroll position on collapse
  useEffect(() => {
    if (!isExpanded && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [isExpanded]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Hidden measurement div — same width, measures expanded height */}
      <div
        ref={measureRef}
        aria-hidden
        style={{
          position: 'absolute',
          visibility: 'hidden',
          pointerEvents: 'none',
          width: '100%',
          padding: 'var(--card-padding)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--card-gap)',
        }}
      >
        <div style={{ height: 28 }} />
        <div className="type-headline">{articleTitle}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'calc(var(--card-gap) * 1.5)', overflow: 'hidden' }}>
          {sections.map((section, i) => (
            <div key={i} className="flex flex-col" style={{ gap: 'calc(var(--card-gap) * 0.5)' }}>
              <div className="type-headline" style={{ color: COLORS.WIKI_SUMMARY.BACKGROUND }}>{section.heading}</div>
              <div className="type-reading text-white">{section.body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Visible card — explicit height animation with spring */}
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
          gap: 'var(--card-gap)',
        }}
        initial={false}
        animate={{ height: isExpanded ? expandedHeight : collapsedHeight }}
        transition={anim.expand}
        onClick={!isExpanded ? onExpand : undefined}
      >
        <div style={{ flexShrink: 0 }}>
          <CardHeader
            label="WIKI SUMMARY"
            labelColor={COLORS.THEME.LABEL_TEXT}
            accentColor={COLORS.WIKI_SUMMARY.BACKGROUND}
            isExpanded={isExpanded}
            onClose={isExpanded ? onCollapse : onExpand}
          />
        </div>

        <div
          ref={scrollRef}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Title + sections share a column with gap */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'calc(var(--card-gap) * 0.4)' }}>
            {/* Title — y driven by useMotionValue, synced with card spring */}
            <motion.div
              ref={titleRef}
              className="type-headline text-white"
              style={{ flexShrink: 0, y: titleY }}
            >
              {articleTitle}
            </motion.div>

            {/* Sections — stagger entry */}
            {isExpanded && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'calc(var(--card-gap) * 1.5)' }}>
                {sections.map((section, i) => (
                  <motion.div
                    key={i}
                    className="flex flex-col"
                    style={{ gap: 'calc(var(--card-gap) * 0.5)' }}
                    initial={{ opacity: 0, y: anim.contentYOffset }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      ...anim.contentEnter,
                      delay: 0.35 + i * anim.contentStagger,
                    }}
                  >
                    <div className="type-headline" style={{ color: COLORS.WIKI_SUMMARY.BACKGROUND }}>
                      {section.heading}
                    </div>
                    <div className="type-reading text-white">
                      {section.body}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Quarter Card - Text variant (195x190 in Figma, scaled proportionally)
const QuarterTextCard = ({
  category,
  categoryColor,
  accentColor,
  content,
  bgColor,
  contentElement,
}: {
  category: string | React.ReactNode;
  categoryColor: string;
  accentColor?: string;
  content?: string;
  bgColor: string;
  contentElement?: React.ReactNode;
}) => (
  <Card
    className="w-full h-full border-0 flex flex-col justify-between card-neumorphic"
    style={{
      borderRadius: 'var(--card-radius)',
      padding: 'var(--card-padding)',
      backgroundColor: bgColor,
    }}
  >
    <CardContent className="p-0 w-full h-full flex flex-col justify-between">
      <div className="flex items-center" style={{ height: 'var(--close-btn-size)', gap: 'calc(var(--text-label) * 0.6)' }}>
        {accentColor && (
          <div
            className="rounded-full flex-shrink-0"
            style={{
              width: 'calc(var(--text-label) * 0.8)',
              height: 'calc(var(--text-label) * 0.8)',
              backgroundColor: accentColor,
            }}
          />
        )}
        <div
          className="type-label"
          style={{ color: categoryColor }}
        >
          {category}
        </div>
      </div>
      {contentElement || (
        <div
          className="type-headline line-clamp-4"
          style={{ color: COLORS.THEME.HEADLINE_TEXT }}
        >
          {content}
        </div>
      )}
    </CardContent>
  </Card>
);

// Scratch-off brush config
const SCRATCH_BRUSH_W = 14;
const SCRATCH_BRUSH_H = Math.round(SCRATCH_BRUSH_W * (67 / 87));
// No auto-reveal — user must scratch to uncover, canvas never auto-clears
const SCRATCH_BRUSH_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="87" height="67" viewBox="0 0 87 67" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M84.8043 6.81621L84.5137 7.93432L84.514 7.93544L83.9566 10.1173L83.8711 10.4514L83.0477 12.7679L82.9737 12.9753L82.1385 14.9309L81.9189 15.4712L82.5593 15.8821L85.6983 19.7517L83.7092 22.0426L83.722 22.0994L83.8544 22.7034L83.81 25.8288L83.243 28.3889L82.0824 33.917L80.6083 34.4411L80.5062 34.7603L80.1094 35.9977L79.405 39.7123L78.5229 47.3806L76.9459 45.8932L76.9119 46.5788L76.9043 46.7273L77.1822 47.314L76.9669 48.9438L77.2442 51.317L76.5637 52.0009L76.5417 52.1692L76.3036 52.7733L76.7419 53.922L75.9006 58.7975L75.5322 59.6221L75.421 59.8695C75.3265 60.584 75.1269 61.3137 74.82 61.9828C74.327 63.0576 73.6601 61.756 73.0028 61.9953L73.1772 66.5471L68.1652 66.5346L66.8832 65.4167L65.9353 64.7816L65.8253 64.7074L65.1816 64.0875L63.6339 66.0898L62.7348 64.4899L62.277 64.3831L61.1855 64.2908L61.0737 64.2818L60.9662 64.2519L59.6827 63.9004L58.9131 63.4696L58.4166 63.5973L56.5392 64.7585L55.4272 64.1701L52.0324 64.8576L51.3764 63.3495L50.4109 63.0681L50.3541 63.052L50.2996 63.0301L49.1894 62.588L49.0207 62.5202L48.8926 62.4224L46.2938 64.6192L44.9166 62.5249L44.3124 62.5519L43.1844 61.1944L42.5141 61.0085L41.5939 60.846L40.5891 60.9678L39.1429 61.1696L38.9333 61.1276L37.7816 60.8934L37.7447 60.8867L36.5693 60.5725L35.7562 60.367L34.6195 60.6631L34.4048 60.6481L33.3576 60.5724L31.6019 60.8028L30.8051 59.934L30.4649 60.103L29.8383 60.4128L28.9471 60.0168L27.6683 61.0706L25.8756 60.541L24.7837 60.3434L24.7609 60.3396L24.7388 60.335L24.6435 60.3139L22.9755 61.2805L22.1936 60.4481L21.9363 60.5523L20.9798 60.9364L19.8057 59.4609L18.6493 60.6291L16.0262 61.2352L15.5818 59.626L14.3297 61.1229L12.6237 59.3282L12.4129 59.3557L10.8112 60.379L9.08561 59.7979L8.84249 59.7332L7.16052 61.5335L5.48812 60.1969L5.2038 60.2422L1.73915 62.6443L1.49375 57.0868L0.800835 58.1609L0.0176614 52.9861L-0.000539105 52.8666L1.1682 51.6854L0.35496 49.9639L1.40699 45.438L0.209537 42.3939L2.73781 36.6464L2.59991 36.6007L2.97126 36.1153L3.57255 34.749L3.5039 34.0616L3.80717 34.215L3.88059 34.0481L4.14393 34.3859L4.25334 34.4412L6.91622 30.964L7.10199 30.7208L6.82123 30.6075L5.64529 27.8971L5.23989 25.5438L5.2111 25.3783L5.19282 25.2057L4.14893 15.4661L8.35431 17.1808L8.37148 17.1876L8.12877 16.4416L10.7316 9.83467L12.4574 10.57L12.9594 10.785L13.0402 10.7489L11.0176 6.21116L15.3063 7.51419L15.6936 8.71752L16.1362 7.8054C16.1548 7.64021 16.1785 7.47283 16.2089 7.30502L16.2538 6.95296L16.3136 6.47905L16.433 6.01351L16.4587 5.91267C17.0288 3.6834 18.4463 2.2277 19.6245 2.66213C20.0484 2.81849 20.3829 3.19947 20.6118 3.72531L21.2798 3.52945L21.8957 3.34765L22.3878 -0.000170555L26.0273 4.20402L26.998 4.2365L28.0606 5.84058L28.4743 5.95894L29.0134 5.9016L31.1209 2.38784L31.9789 3.42588L32.0858 3.55465L32.2253 3.44858L32.8755 2.94896L34.5677 3.24483L35.6572 3.269L36.1108 3.27804L37.3466 4.34562L37.8104 4.54432L38.5782 4.28092L38.7767 4.2123L40.177 4.1321L40.291 4.12588L40.4025 4.13895L41.393 4.25895L43.0055 3.99735L43.9348 4.75558L44.5001 4.56311L45.2708 4.29928L46.5449 5.49785L46.9117 5.54177L47.8145 5.11824L47.8875 5.08464L47.9601 5.05824L49.6597 4.4337L51.0029 4.77695L52.0171 4.72586L52.579 4.69626L53.2548 5.36463L53.5829 5.16182L54.3439 4.68969L55.9046 5.49542L56.8577 5.62423L57.0588 5.65092L57.9785 6.1071L58.7867 5.96683L58.8131 5.96196L58.8398 5.9582L60.0513 5.79344L60.1827 5.77632L61.0023 5.82804L62.5797 4.78397L64.3266 5.71019L65.2052 6.01705L65.2982 6.01894L65.8135 5.3315L66.4037 4.54212L69.1425 3.60821L69.6545 4.16918L70.6819 2.83012L72.3009 3.72212L73.4068 3.05902L74.633 3.42867L75.7842 2.81993L77.1456 3.02114L78.0895 2.76046L78.33 2.69338L78.8613 2.73751L80.7643 4.3524L82.4495 6.09382L86.3538 4.83649L84.8043 6.81621ZM48.0322 12.0482L47.5724 13.1838L47.7077 13.2206L48.9389 12.8631L48.6092 12.7791L48.0322 12.0482ZM58.0261 14.1524L57.7702 14.1964L58.1816 14.3737L58.2331 14.4231L58.4691 14.0915L58.0261 14.1524Z" fill="black"/></svg>`;

function createScratchBrush(): Promise<HTMLCanvasElement> {
  return new Promise((resolve) => {
    const stamp = document.createElement("canvas");
    const dpr = window.devicePixelRatio || 1;
    stamp.width = SCRATCH_BRUSH_W * dpr;
    stamp.height = SCRATCH_BRUSH_H * dpr;
    const ctx = stamp.getContext("2d")!;
    const img = new Image();
    const blob = new Blob([SCRATCH_BRUSH_SVG], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      ctx.drawImage(img, 0, 0, stamp.width, stamp.height);
      URL.revokeObjectURL(url);
      resolve(stamp);
    };
    img.src = url;
  });
}

// Quarter Card - Scratch-off reveal
const RevealCard = ({
  category,
  categoryColor,
  accentColor,
  question,
  answer,
  bgColor,
}: {
  category: string;
  categoryColor: string;
  accentColor?: string;
  question: string;
  answer: string;
  bgColor: string;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const brushRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const [healing, setHealing] = useState(false);
  const [hasScratched, setHasScratched] = useState(false);

  useEffect(() => {
    createScratchBrush().then((stamp) => { brushRef.current = stamp; });
  }, []);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Use offsetWidth/Height (CSS pixels), NOT getBoundingClientRect (visual/zoomed pixels).
    // With CSS zoom on the parent, gBCR returns the zoomed size which would make
    // canvas text render larger than DOM text at the same font-size.
    const cssW = container.offsetWidth;
    const cssH = container.offsetHeight;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(dpr, dpr);

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, cssW, cssH);

    // ══ CANVAS MODULE CHECK ════════════════════════════════════════════════
    // These constants mirror .type-headline in index.css exactly.
    // To verify: search MEMORY.md for "canvas module check".
    // DO NOT change these to "standard" canvas defaults — they are intentional.
    //   CSS source                        Canvas constant
    //   --text-headline: 18px * scale  →  TYPE_HEADLINE_BASE_PX  = 18
    //   --tracking-tight: -0.04em      →  TYPE_HEADLINE_TRACKING = -0.04
    //   --leading-headline: 1.15       →  TYPE_HEADLINE_LEADING  = 1.15
    // ═══════════════════════════════════════════════════════════════════════
    const TYPE_HEADLINE_BASE_PX  = 18;   // --text-headline base (before scale)
    const TYPE_HEADLINE_TRACKING = -0.04; // --tracking-tight in em
    const TYPE_HEADLINE_LEADING  = 1.15;  // --leading-headline

    const scale = parseFloat(
      getComputedStyle(document.getElementById("underground-root")!).getPropertyValue("--scale") || "1"
    );
    const fontSize = TYPE_HEADLINE_BASE_PX * scale;

    ctx.fillStyle = COLORS.THEME.HEADLINE_TEXT;
    ctx.font = `700 ${fontSize}px 'Satoshi', 'Satoshi-Bold', Helvetica, sans-serif`;
    ctx.letterSpacing = `${TYPE_HEADLINE_TRACKING * fontSize}px`; // -0.04em in px
    ctx.textBaseline = "top";

    // Word-wrap — full width, no internal padding (card-padding is on outer div)
    const maxWidth = cssW;
    const words = question.split(" ");
    const lines: string[] = [];
    let currentLine = words[0];
    for (let i = 1; i < words.length; i++) {
      const testLine = currentLine + " " + words[i];
      if (ctx.measureText(testLine).width > maxWidth) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);

    // Clamp to 4 lines with ellipsis — matches line-clamp-4 on other quarter cards
    const MAX_LINES = 4;
    if (lines.length > MAX_LINES) {
      lines.splice(MAX_LINES);
      let last = lines[MAX_LINES - 1];
      while (ctx.measureText(last + "…").width > maxWidth && last.length > 0) {
        const spaceIdx = last.lastIndexOf(" ");
        last = spaceIdx > 0 ? last.slice(0, spaceIdx) : last.slice(0, -1);
      }
      lines[MAX_LINES - 1] = last + "…";
    }

    const lineHeight = fontSize * TYPE_HEADLINE_LEADING; // 1.15, NOT 1.2
    // (n-1)*lineHeight + fontSize — last line's em-square flush to canvas bottom.
    // DO NOT use n*lineHeight: that adds a trailing gap making text sit too high
    // relative to adjacent DOM quarter cards (On This Day, Word of Day, etc).
    const textBlockHeight = (lines.length - 1) * lineHeight + fontSize;

    // ── BOTTOM-PIN ───────────────────────────────────────────────────────────
    // startY pins text block to canvas bottom. Descenders fit exactly at cssH.
    // ────────────────────────────────────────────────────────────────────────
    const startY = Math.max(0, cssH - textBlockHeight);
    lines.forEach((line, i) => {
      ctx.fillText(line, 0, startY + i * lineHeight);
    });

  }, [bgColor, question]);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  useEffect(() => {
    const handleResize = () => { if (!healing) initCanvas(); };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [initCanvas, healing]);

  const getPos = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const r = canvas.getBoundingClientRect();
    // Convert visual (screen) coords to CSS pixel coords for the canvas.
    // With CSS zoom, gBCR returns zoomed size but canvas is sized in CSS pixels.
    const scaleX = canvas.offsetWidth / r.width;
    const scaleY = canvas.offsetHeight / r.height;
    if ("touches" in e) {
      return { x: (e.touches[0].clientX - r.left) * scaleX, y: (e.touches[0].clientY - r.top) * scaleY };
    }
    return { x: ((e as React.MouseEvent).clientX - r.left) * scaleX, y: ((e as React.MouseEvent).clientY - r.top) * scaleY };
  };

  const scratch = (x: number, y: number) => {
    const canvas = canvasRef.current;
    const brush = brushRef.current;
    if (!canvas || !brush) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "destination-out";

    const halfW = SCRATCH_BRUSH_W / 2;
    const halfH = SCRATCH_BRUSH_H / 2;
    const stampAt = (sx: number, sy: number) => {
      ctx.drawImage(brush, sx - halfW, sy - halfH, SCRATCH_BRUSH_W, SCRATCH_BRUSH_H);
    };

    if (lastPoint.current) {
      const lp = lastPoint.current;
      const dist = Math.sqrt((x - lp.x) ** 2 + (y - lp.y) ** 2);
      const steps = Math.max(Math.ceil(dist / 3), 1);
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        stampAt(lp.x + (x - lp.x) * t, lp.y + (y - lp.y) * t);
      }
    } else {
      stampAt(x, y);
    }

    ctx.restore();
    lastPoint.current = { x, y };
  };

  // No auto-reveal check — scratching only removes what the user touches

  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    isDrawing.current = true;
    lastPoint.current = null;
    if (!hasScratched) setHasScratched(true);
    const pos = getPos(e);
    scratch(pos.x, pos.y);
  };

  const handleMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    const pos = getPos(e);
    scratch(pos.x, pos.y);
  };

  const handleEnd = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    lastPoint.current = null;
  };

  const healAnimRef = useRef(0);
  const heal = useCallback(() => {
    setHealing(true);
    setHasScratched(false);
    lastPoint.current = null;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) { setHealing(false); return; }
    const ctx = canvas.getContext("2d");
    if (!ctx) { setHealing(false); return; }

    const dpr = window.devicePixelRatio || 1;
    const cssW = container.offsetWidth;
    const cssH = container.offsetHeight;

    const wipe1Duration = 350;
    const wipe2Duration = 400;
    const start = performance.now();
    const scratchedData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    cancelAnimationFrame(healAnimRef.current);

    const step = (now: number) => {
      const elapsed = now - start;

      if (elapsed < wipe1Duration) {
        const t = elapsed / wipe1Duration;
        const ease = 1 - (1 - t) * (1 - t);
        const wipeY = cssH * (1 - ease);
        ctx.putImageData(scratchedData, 0, 0);
        ctx.save();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, wipeY, cssW, cssH - wipeY);
        ctx.restore();
        healAnimRef.current = requestAnimationFrame(step);
      } else if (elapsed < wipe1Duration + wipe2Duration) {
        const t2 = (elapsed - wipe1Duration) / wipe2Duration;
        const ease2 = 1 - (1 - t2) * (1 - t2);
        const wipeY2 = cssH * (1 - ease2);
        ctx.save();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, cssW, cssH);
        ctx.restore();
        initCanvas();
        ctx.save();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, cssW, wipeY2);
        ctx.restore();
        healAnimRef.current = requestAnimationFrame(step);
      } else {
        initCanvas();
        setHealing(false);
      }
    };

    healAnimRef.current = requestAnimationFrame(step);
  }, [initCanvas, bgColor]);

  const handleRevealedTap = () => {
    if (healing) return;
  };

  return (
    <div
      onClick={handleRevealedTap}
      className="card-neumorphic"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: "var(--card-radius)",
        overflow: "hidden",
        padding: "var(--card-padding)",
        backgroundColor: bgColor,
        display: "flex",
        flexDirection: "column",
        touchAction: "none",
      }}
    >
      {/* Label header — real DOM, above scratch area */}
      <div
        className="flex items-center"
        style={{
          height: 'var(--close-btn-size)',
          gap: 'calc(var(--text-label) * 0.6)',
          flexShrink: 0,
        }}
      >
        {accentColor && (
          <div
            className="rounded-full flex-shrink-0"
            style={{
              width: 'calc(var(--text-label) * 0.8)',
              height: 'calc(var(--text-label) * 0.8)',
              backgroundColor: accentColor,
            }}
          />
        )}
        <div className="type-label" style={{ color: categoryColor }}>
          {category}
        </div>
      </div>

      {/* Scratch area — inset below label */}
      <div
        ref={containerRef}
        style={{
          position: "relative",
          flex: 1,
          overflow: "hidden",
          cursor: "crosshair",
          backgroundColor: bgColor,
        }}
      >
        {/* Bottom layer: answer on accent-colored surface — inset so edges always show bgColor */}
        <div
          style={{
            position: "absolute",
            inset: 4,
            borderRadius: 6,
            backgroundColor: accentColor || COLORS.THEME.CARD_BG_ELEVATED,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "var(--card-padding)",
          }}
        >
          <div
            className="type-headline"
            style={{ color: "#FFFFFF", textAlign: "center" }}
          >
            {answer}
          </div>
        </div>

        {/* Scratch canvas */}
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: healing ? "none" : "auto",
          }}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />

      </div>

      {/* Top-right icon: hand hint or reset — card-level, same position as other module buttons */}
      <button
        style={{
          position: "absolute",
          top: "var(--card-padding)",
          right: "var(--card-padding)",
          width: "var(--close-btn-size)",
          height: "var(--close-btn-size)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
          background: "none",
          border: "none",
          padding: 0,
          pointerEvents: hasScratched ? "auto" : "none",
          cursor: hasScratched ? "pointer" : "default",
        }}
        onClick={(e) => {
          if (hasScratched) {
            e.stopPropagation();
            if (!healing) heal();
          }
        }}
      >
        <AnimatePresence mode="wait">
          {!hasScratched ? (
            <motion.div
              key="finger"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.2 }}
            >
              <motion.svg
                width="24"
                height="28"
                viewBox="0 0 24 28"
                fill="none"
                style={{ width: "calc(var(--close-btn-size) * 0.45)", height: "auto" }}
                animate={{
                  x: [0, 3, -3, 3, 0, 0],
                  y: [0, -3, 3, -3, 0, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 5,
                  ease: "easeInOut",
                  times: [0, 0.15, 0.35, 0.55, 0.7, 1],
                }}
              >
                <path
                  d="M0.267182 5.15433L4.51495 15.7295L3.26176 16.2379C1.8673 16.8049 0.799594 18.0101 0.40461 19.4641C-0.234476 21.8292 0.996606 24.3058 3.26753 25.2245L7.94572 27.1168C9.32856 27.6761 10.8889 27.5888 12.2007 26.8787L21.0889 22.0676C23.3237 20.8579 24.2957 18.1644 23.3483 15.8064L20.4931 8.69958C19.8011 6.97453 18.0847 6.09134 16.4298 6.59492L10.571 8.25703C10.0789 8.39663 9.5608 8.14238 9.37014 7.66774L7.23563 2.35389C6.84545 1.3842 6.06125 0.614417 5.08388 0.243459C4.10843 -0.126539 3.01093 -0.0736822 2.07488 0.394341C0.337338 1.26119 -0.456475 3.3524 0.267182 5.15433ZM2.95327 2.15495C3.40495 1.93103 3.9143 1.90508 4.38521 2.08384C4.85707 2.26259 5.2213 2.62009 5.40967 3.08811L7.86815 9.21016C8.24943 10.1596 9.28579 10.6682 10.2701 10.3889L16.9853 8.48335C17.6638 8.27481 18.3586 8.66595 18.6671 9.43285L21.2 15.7389C21.9576 17.625 21.1801 19.7795 19.3926 20.7473L12.0796 24.7066C10.7678 25.4168 9.20742 25.5042 7.8245 24.9449L4.0056 23.4005C2.65631 22.8546 1.92496 21.3833 2.30457 19.9783C2.53906 19.1153 3.17335 18.3983 4.00175 18.062L5.24918 17.5565L6.02985 19.5411C6.22805 20.045 6.79374 20.2968 7.30076 20.1068C7.82216 19.9114 8.08056 19.3251 7.873 18.8084L2.09314 4.42011C1.74909 3.56286 2.12678 2.5682 2.95327 2.15495Z"
                  fill={categoryColor}
                />
              </motion.svg>
            </motion.div>
          ) : (
            <motion.div
              key="reset"
              initial={{ opacity: 0, scale: 0.6, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              style={{ transformOrigin: "top right" }}
            >
              <svg
                viewBox="0 0 16 16"
                fill="none"
                style={{
                  width: "calc(var(--close-btn-size) * 0.42)",
                  height: "calc(var(--close-btn-size) * 0.42)",
                }}
              >
                <path
                  d="M2.5 2.5v4h4"
                  stroke={categoryColor}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2.8 6.5A5.5 5.5 0 1 1 3 10"
                  stroke={categoryColor}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
};

export const Mockup = (): JSX.Element => {
  // Optional ?date= param to load content from API (for ContentPlanner preview)
  const dateParam = useMemo(() => new URLSearchParams(window.location.search).get("date"), []);

  const { data: apiContent } = useQuery<DailyContent>({
    queryKey: ["content", dateParam],
    queryFn: async () => {
      const res = await fetch(`/api/content/date/${dateParam}`);
      if (!res.ok) throw new Error("Failed to fetch content");
      return res.json();
    },
    enabled: !!dateParam,
  });

  const modules = apiContent?.modules;

  // Global expand state: null = none expanded, 'aboveGround' = Above Ground expanded, 'thoughtExperiment' = Thought Experiment expanded, 'games' = Games expanded, 'microHistory' = Micro History expanded, 'wikiSummary' = Wiki Summary expanded
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(!dateParam);
  const [scale, setScale] = useState(1);

  const isThoughtExperimentExpanded = expandedCard === 'thoughtExperiment';
  const isAboveGroundExpanded = expandedCard === 'aboveGround';
  const isGamesExpanded = expandedCard === 'games';
  const isMicroHistoryExpanded = expandedCard === 'microHistory';
  const isWikiSummaryExpanded = expandedCard === 'wikiSummary';

  // ─── Layout measurements for absolute-position card animation ───
  const teLayoutRef = useRef<HTMLDivElement>(null);
  const teMeasureRef = useRef<HTMLDivElement>(null);
  const agMeasureRef = useRef<HTMLDivElement>(null);
  const [teLayoutWidth, setTeLayoutWidth] = useState(392);
  const [layoutGap, setLayoutGap] = useState(14);
  const [teFullHeight, setTeFullHeight] = useState(280);
  const [agExpandedHeight, setAgExpandedHeight] = useState(380);

  useLayoutEffect(() => {
    const measure = () => {
      const el = teLayoutRef.current;
      if (!el) return;
      setTeLayoutWidth(el.clientWidth);
      // Read computed gap from parent flex container
      const parent = el.parentElement;
      if (parent) {
        const g = parseFloat(getComputedStyle(parent).gap);
        if (g > 0) setLayoutGap(g);
      }
      if (teMeasureRef.current && teMeasureRef.current.offsetHeight > 0) {
        setTeFullHeight(teMeasureRef.current.offsetHeight);
      }
      // Measure tallest AG expanded item
      if (agMeasureRef.current) {
        const itemEls = agMeasureRef.current.children;
        let maxH = 0;
        for (let i = 0; i < itemEls.length; i++) {
          const h = (itemEls[i] as HTMLElement).offsetHeight;
          if (h > maxH) maxH = h;
        }
        if (maxH > 0) setAgExpandedHeight(maxH);
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (teLayoutRef.current) observer.observe(teLayoutRef.current);
    if (teMeasureRef.current) observer.observe(teMeasureRef.current);
    return () => observer.disconnect();
  }, []);

  // Computed positions for absolute-position card layout
  const halfW = (teLayoutWidth - layoutGap) / 2;
  const qH = 190;
  const agExpandedH = agExpandedHeight;
  const teSpring = getModuleConfig("thoughtExperiment").expand;

  const agH = isAboveGroundExpanded ? agExpandedH : qH;

  const agPos = isThoughtExperimentExpanded
    ? { left: 0, top: 0, width: halfW, height: qH }
    : { left: 0, top: 0, width: teLayoutWidth, height: agH };

  const factlePos = isThoughtExperimentExpanded
    ? { left: halfW + layoutGap, top: 0, width: halfW, height: qH }
    : { left: 0, top: agH + layoutGap, width: halfW, height: qH };

  const tePos = isThoughtExperimentExpanded
    ? { left: 0, top: qH + layoutGap, width: teLayoutWidth, height: teFullHeight }
    : { left: halfW + layoutGap, top: agH + layoutGap, width: halfW, height: qH };

  const sectionHeight = isThoughtExperimentExpanded
    ? qH + layoutGap + teFullHeight
    : agH + layoutGap + qH;

  // Measure #underground-root's constrained width and compute zoom scale
  useEffect(() => {
    const root = document.getElementById('underground-root');
    if (!root) return;

    const updateScale = () => {
      // clientWidth respects overflow:hidden, so it returns the constrained width
      const availableWidth = root.clientWidth;
      const newScale = Math.min(availableWidth / 428, 1);
      setScale(newScale);
    };

    const observer = new ResizeObserver(updateScale);
    observer.observe(root);
    updateScale();

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <AnimatePresence>
        {showIntro && <IntroAnimation onComplete={() => setShowIntro(false)} />}
      </AnimatePresence>
      <div
        style={{
          width: '100%',
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundColor: COLORS.UTILITY.BACKGROUND_DARK,
        }}
      >
        <div
          style={{
            width: '428px',
            zoom: scale,
          }}
        >
      <div
        className="w-full flex flex-col"
        style={{
          padding: 'var(--container-padding)',
          gap: 'var(--card-gap)',
        }}
      >
        {/* Header - Dynamic Date */}
        <DateHeader dateStr={dateParam || undefined} />

        {/* AboveGround / Factle / ThoughtExperiment — absolute-position layout */}
        <div ref={teLayoutRef} style={{ position: 'relative', width: '100%' }}>
          {/* Hidden measurement for TE expanded height */}
          <div
            ref={teMeasureRef}
            aria-hidden
            style={{
              position: 'absolute',
              visibility: 'hidden',
              width: '100%',
              pointerEvents: 'none',
            }}
          >
            <ThoughtExperimentCard
              isExpanded={true}
              onExpand={() => {}}
              onCollapse={() => {}}
              text={modules?.thoughtExperiment ? (modules.thoughtExperiment as any).text : undefined}
            />
          </div>

          {/* Hidden measurement for AG expanded height — renders each item to find tallest */}
          <div
            ref={agMeasureRef}
            aria-hidden
            style={{
              position: 'absolute',
              visibility: 'hidden',
              width: '100%',
              pointerEvents: 'none',
            }}
          >
            {(modules?.aboveGround ? (modules.aboveGround as any).items?.map((item: any) => ({
              headline: item.headline,
              description: item.description,
              description2: item.description || "",
              source: item.source,
            })) : NEWS_ITEMS).map((item: any, i: number) => (
              <div
                key={i}
                style={{
                  padding: 'var(--card-padding)',
                  paddingBottom: 'calc(var(--card-padding) - 5px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--card-gap)',
                }}
              >
                <div style={{ flexShrink: 0 }}>
                  <CardHeader
                    label="ABOVE GROUND"
                    labelColor={COLORS.THEME.LABEL_TEXT}
                    accentColor={COLORS.ABOVE_GROUND.BACKGROUND}
                    isExpanded={true}
                    onClose={() => {}}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--card-gap)' }}>
                  <div className="type-headline" style={{ flexShrink: 0 }}>
                    {item.headline}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--card-gap)' }}>
                    <div className="type-reading">
                      <p>{item.description}</p>
                      <p className="mt-2 opacity-80">{item.description2}</p>
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, marginTop: 8 }}>
                    <DotNavigator count={5} activeIndex={0} onSelect={() => {}} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <motion.div
            initial={false}
            animate={{ height: sectionHeight }}
            transition={teSpring}
            style={{ position: 'relative', width: '100%' }}
          >
            {/* AboveGround */}
            <motion.div
              initial={false}
              animate={agPos}
              transition={teSpring}
              className="card-neumorphic"
              style={{
                position: 'absolute',
                overflow: 'hidden',
                borderRadius: 'var(--card-radius)',
                zIndex: 1,
              }}
            >
              <AboveGroundCard
                isExpanded={isAboveGroundExpanded}
                forcedQuarter={isThoughtExperimentExpanded}
                onExpand={() => setExpandedCard('aboveGround')}
                onCollapse={() => setExpandedCard(null)}
                expandedHeight={agExpandedHeight}
                items={modules?.aboveGround ? (modules.aboveGround as any).items?.map((item: any) => ({
                  headline: item.headline,
                  description: item.description,
                  description2: item.description || "",
                  source: item.source,
                })) : undefined}
              />
            </motion.div>

            {/* Factle */}
            <motion.div
              initial={false}
              animate={factlePos}
              transition={teSpring}
              className="card-neumorphic"
              style={{
                position: 'absolute',
                overflow: 'hidden',
                borderRadius: 'var(--card-radius)',
                zIndex: 2,
              }}
            >
              <FactleFlipCard fact={modules?.factle ? (modules.factle as any).fact : undefined} />
            </motion.div>

            {/* ThoughtExperiment */}
            <motion.div
              initial={false}
              animate={tePos}
              transition={teSpring}
              className="card-neumorphic"
              style={{
                position: 'absolute',
                overflow: 'hidden',
                borderRadius: 'var(--card-radius)',
                zIndex: 3,
              }}
            >
              <ThoughtExperimentCard
                isExpanded={isThoughtExperimentExpanded}
                onExpand={() => setExpandedCard('thoughtExperiment')}
                onCollapse={() => setExpandedCard(null)}
                text={modules?.thoughtExperiment ? (modules.thoughtExperiment as any).text : undefined}
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Games - Interactive Module */}
        <GamesCard
          isExpanded={isGamesExpanded}
          onExpand={() => setExpandedCard('games')}
          onCollapse={() => setExpandedCard(null)}
        />

        {/* Trivia & On This Day - Quarter Cards */}
        <div className="grid grid-cols-2" style={{ gap: 'var(--card-gap)' }}>
          <div className="card-neumorphic" style={{ aspectRatio: "195/190", borderRadius: 'var(--card-radius)' }}>
            <RevealCard
              category="TRIVIA"
              categoryColor={COLORS.THEME.LABEL_TEXT}
              accentColor={COLORS.TRIVIA.BACKGROUND}
              question={modules?.trivia ? (modules.trivia as any).question : TRIVIA_DATA.question}
              answer={modules?.trivia ? (modules.trivia as any).answer : TRIVIA_DATA.answer}
              bgColor={COLORS.THEME.CARD_BG}
            />
          </div>
          <div className="card-neumorphic" style={{ aspectRatio: "195/190", borderRadius: 'var(--card-radius)' }}>
            <QuarterTextCard
              category={
                <>
                  <span style={{ color: COLORS.THEME.LABEL_TEXT }}>ON THIS DAY</span>
                  <span style={{ color: COLORS.THEME.CAPTION_TEXT }} className="ml-2">{modules?.onThisDay ? (modules.onThisDay as any).year : "2007"}</span>
                </>
              }
              categoryColor={COLORS.THEME.LABEL_TEXT}
              accentColor={COLORS.ON_THIS_DAY.BACKGROUND}
              bgColor={COLORS.THEME.CARD_BG}
              contentElement={<div className="type-headline line-clamp-4" style={{ color: COLORS.THEME.HEADLINE_TEXT }}>{modules?.onThisDay ? (modules.onThisDay as any).event : "Apple announced the original iPhone."}</div>}
            />
          </div>
        </div>

        {/* Micro History - Expandable */}
        <MicroHistoryCard
          isExpanded={isMicroHistoryExpanded}
          onExpand={() => setExpandedCard('microHistory')}
          onCollapse={() => setExpandedCard(null)}
          titleProp={modules?.microHistory ? (modules.microHistory as any).title : undefined}
          contentProp={modules?.microHistory ? (modules.microHistory as any).content : undefined}
        />

        {/* Word of the Day & Riddle - Quarter Cards */}
        <div className="grid grid-cols-2" style={{ gap: 'var(--card-gap)' }}>
          <div className="card-neumorphic" style={{ aspectRatio: "195/190", borderRadius: 'var(--card-radius)' }}>
            <Card
              className="w-full h-full border-0 flex flex-col card-neumorphic"
              style={{
                borderRadius: 'var(--card-radius)',
                padding: 'var(--card-padding)',
                backgroundColor: COLORS.THEME.CARD_BG,
              }}
            >
              <CardContent className="p-0 w-full h-full flex flex-col justify-between">
                <div className="flex items-center" style={{ height: 'var(--close-btn-size)', gap: 'calc(var(--text-label) * 0.6)' }}>
                  <div
                    className="rounded-full flex-shrink-0"
                    style={{
                      width: 'calc(var(--text-label) * 0.8)',
                      height: 'calc(var(--text-label) * 0.8)',
                      backgroundColor: COLORS.WORD_OF_THE_DAY.BACKGROUND,
                    }}
                  />
                  <div className="type-label" style={{ color: COLORS.THEME.LABEL_TEXT }}>
                    WORD OF THE DAY
                  </div>
                </div>
                <div>
                  <div className="type-headline" style={{ color: COLORS.THEME.HEADLINE_TEXT }}>
                    {modules?.wordOfTheDay ? (modules.wordOfTheDay as any).word : "Inure"}
                  </div>
                  <div
                    className="type-caption"
                    style={{ marginTop: 'calc(var(--text-label) * 0.15)', opacity: 0.7, color: COLORS.THEME.CAPTION_TEXT }}
                  >
                    {modules?.wordOfTheDay
                      ? (modules.wordOfTheDay as any).partOfSpeech?.toUpperCase()
                      : "VERB"}
                  </div>
                  <div className="type-reading" style={{ fontSize: 'calc(16px * var(--scale))', lineHeight: 1.25, color: COLORS.THEME.BODY_TEXT }}>
                    {modules?.wordOfTheDay ? (modules.wordOfTheDay as any).definition : "to accustom to hardship, difficulty, or pain"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="card-neumorphic" style={{ aspectRatio: "195/190", borderRadius: 'var(--card-radius)' }}>
            <RevealCard
              category="RIDDLE"
              categoryColor={COLORS.THEME.LABEL_TEXT}
              accentColor={COLORS.RIDDLE.BACKGROUND}
              question={modules?.riddle ? (modules.riddle as any).riddle : RIDDLE_DATA.question}
              answer={modules?.riddle ? (modules.riddle as any).answer : RIDDLE_DATA.answer}
              bgColor={COLORS.THEME.CARD_BG}
            />
          </div>
        </div>

        {/* Wiki Summary - Expandable */}
        <WikiSummaryCard
          isExpanded={isWikiSummaryExpanded}
          onExpand={() => setExpandedCard('wikiSummary')}
          onCollapse={() => setExpandedCard(null)}
          articleTitleProp={modules?.wikiSummary ? (modules.wikiSummary as any).articleTitle : undefined}
          summaryProp={modules?.wikiSummary ? (modules.wikiSummary as any).summary : undefined}
        />

        {/* Seen It All Section */}
        <section
          className="w-full"
          style={{ padding: 'var(--card-padding)', paddingTop: 'calc(var(--card-padding) * 2)' }}
        >
          <h2
            className="type-label text-white"
            style={{ marginBottom: 'var(--card-padding)' }}
          >
            SEEN IT ALL?
          </h2>
          <p className="type-reading text-white">
            Look up. Notice the person across from you, the way light falls
            through the window, the rhythm of wheels on tracks. Each stranger
            carries a universe you'll never know. Send them a quiet thought.
            Breathe in this shared moment. Sometimes the best connection happens
            when we're disconnected from everything else.
          </p>
        </section>

      </div>

      {/* Footer - Full Width Tab */}
      <footer
        className="w-full flex items-center justify-center"
        style={{
          padding: 'calc(var(--card-padding) * 2)',
          marginTop: 'calc(var(--card-gap) * 2)',
          borderTopLeftRadius: 'var(--card-radius)',
          borderTopRightRadius: 'var(--card-radius)',
          backgroundColor: COLORS.UTILITY.FOOTER_DARK,
        }}
      >
        <div
          className="type-label text-center"
          style={{ color: COLORS.UTILITY.FOOTER_TEXT }}
        >
          Designed and developed
          <br />
          by Talia Malchin · 2026
        </div>
      </footer>
    </div>
      </div>
    </>
  );
};
