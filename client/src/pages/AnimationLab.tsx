import { useState, useCallback, useRef, useEffect, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { COLORS } from "@/lib/colors";
import { CardHeader } from "@/components/ui/card-header";
import { DotNavigator } from "@/components/ui/dot-navigator";
import {
  AnimationDialKit,
  DEFAULT_CONFIG,
  buildTimingPayload,
  type AnimationConfig,
  type ModuleType,
} from "@/components/AnimationDialKit";
import {
  TypographyDialKitPanel,
  useTypographyState,
} from "@/components/TypographyDialKit";

const MODULE_OPTIONS: { id: ModuleType; label: string }[] = [
  { id: "aboveGround", label: "Above Ground" },
  { id: "wikiSummary", label: "Wiki Summary" },
  { id: "thoughtExperiment", label: "Thinkers" },
  { id: "microHistory", label: "Micro History" },
  { id: "games", label: "Games" },
  { id: "reveal", label: "Reveal" },
];

// ── Content Data ──

// Wiki Summary
const ARTICLE_TITLE = "The Amber Room";
const TEASER_TEXT =
  "A chamber made of six tonnes of amber, given to a czar, stolen by Nazis, and never seen again.";
const SECTIONS = [
  {
    heading: "A Room Made of Sunlight",
    body: "In 1701, King Frederick I of Prussia commissioned something the world had never seen: an entire chamber paneled in amber. German baroque sculptor Andreas Schl\u00FCter drew the designs, and Danish craftsman Gottfried Wolfram began the painstaking assembly\u2014fitting thousands of hand-carved amber pieces, backed with gold leaf and mirrors, into elaborate mosaics. The work took over a decade. By the time it was installed in the Berlin City Palace, the room glowed like trapped sunlight, six tonnes of fossilized resin transformed into walls.",
  },
  {
    heading: "The Gift",
    body: "In 1716, Frederick William I gave the entire room to Czar Peter the Great of Russia, cementing a Prussian-Russian alliance against Sweden. The panels were packed into eighteen large boxes, carried by horse and cart to St. Petersburg, and eventually installed in the Catherine Palace at Tsarskoye Selo. Italian architect Bartolomeo Francesco Rastrelli was tasked with expanding the room to fill a much larger hall\u2014roughly six times the original size. He added gilded carvings, mirrors, and additional amber panels. By the time the renovations were complete, the Amber Room covered more than 55 square metres and was widely called the Eighth Wonder of the World.",
  },
  {
    heading: "36 Hours",
    body: "When Nazi Germany invaded the Soviet Union in 1941, curators at the Catherine Palace attempted to disassemble the room for evacuation. The amber was too brittle\u2014it crumbled at the touch. They tried hiding it behind thin wallpaper instead. It didn\u2019t work. Soldiers from Army Group North found the room almost immediately. German troops dismantled the entire chamber in just 36 hours, packed it into 27 crates, and shipped it to K\u00F6nigsberg Castle in East Prussia, where it was reassembled and put on display for the last confirmed time.",
  },
  {
    heading: "Vanished",
    body: "By early 1944, with Allied forces closing in, the room was disassembled again and crated for safekeeping in the castle basement. In August of that year, British bombers devastated K\u00F6nigsberg. The castle burned. Soviet forces captured the ruined city in April 1945, but the crates were gone. No one has seen the original Amber Room since. The documentation simply stops. Theories abound: that the panels were destroyed in the bombing, that they were smuggled out on a ship that sank in the Baltic, that they remain hidden in a sealed mine shaft somewhere in Germany. Treasure hunters have searched for decades. None have found it.",
  },
  {
    heading: "Built Again",
    body: "In 1979, the Soviet government authorized a full reconstruction. It took 24 years. Forty Russian and German master craftsmen carved new amber panels by hand, working from black-and-white photographs and a single surviving color slide. German energy company E.ON donated $3.5 million to help finish the project. In 2003, Russian president Vladimir Putin and German chancellor Gerhard Schr\u00F6der dedicated the completed room at the Catherine Palace\u2014exactly 300 years after the city of St. Petersburg was founded. The replica glows the same warm gold. The original, wherever it is, has never been found.",
  },
];

// Above Ground — matches NEWS_ITEMS in Mockup.tsx
const AG_NEWS_ITEMS = [
  {
    headline: "OpenAI's Sora video model finally dropped",
    description: "The text-to-video tool generated immediate hype and concern. Early tests show impressive results, but discourse quickly shifted to implications for film industry jobs and AI-generated misinformation.",
    description2: "Within hours, creators were sharing everything from cinematic shorts to absurdist fever dreams. The discourse moved fast.",
  },
  {
    headline: "Barbie got snubbed at the Oscars for Best Director",
    description: "Greta Gerwig's omission from the Best Director category sparked immediate backlash. The irony wasn't lost on anyone given the film's themes about women being overlooked.",
    description2: "The Academy's voting patterns came under scrutiny once again, reigniting conversations about systemic bias in Hollywood.",
  },
  {
    headline: "Reddit's API changes killed third-party apps",
    description: "Apollo, RIF, and other beloved apps shut down after Reddit imposed unsustainable pricing. Moderators staged blackouts in protest, and thousands migrated to alternatives.",
    description2: "The platform's relationship with its most devoted users fundamentally shifted. Some subreddits never fully recovered.",
  },
  {
    headline: "Taylor Swift and Travis Kelce dominated everything",
    description: "The relationship turned NFL games into cultural events. Camera cuts to Swift in the stands became a meme format, and think pieces about the crossover audience flooded timelines.",
    description2: "Swifties learned football terminology. Football fans learned Taylor\u2019s discography. The algorithm won.",
  },
  {
    headline: "ChatGPT\u2019s voice mode felt uncomfortably human",
    description: "The new Advanced Voice feature sparked conversations about parasocial AI relationships. Users reported feeling genuinely attached to the conversational quality.",
    description2: "The line between tool and companion blurred in ways that made some people uneasy \u2014 and others deeply curious.",
  },
];

// Thought Experiment
const THOUGHT_FULL =
  "Imagine a world where every object slowly changes shape when no one is looking, but returns to normal the moment it\u2019s observed. Nothing ever breaks or malfunctions \u2014 it\u2019s simply different when unseen. Would the unseen version of the world feel less real, or more honest?";
const THOUGHT_TRUNCATED = THOUGHT_FULL.slice(0, 50) + "...";

// Micro History
const MICRO_TITLE = "Why notebooks are usually lined";
const MICRO_COLLAPSED =
  "Early mass-produced paper varied in quality, and lines helped guide handwriting when ink bled easily. The ruled lines became standard not just for aesthetics, but as a practical solution to inconsistent paper thickness and texture.";
const MICRO_FULL =
  "Early mass-produced paper varied in quality, and lines helped guide handwriting when ink bled easily. The ruled lines became standard not just for aesthetics, but as a practical solution to inconsistent paper thickness and texture. Before mass production, paper was handmade and varied greatly in quality. Writers needed guides to keep their text straight and legible, especially when using fountain pens that could bleed or feather on lower-quality paper.";

// ── Shared ──

type ViewMode = "quarter" | "half";

function buildSpring(config: AnimationConfig) {
  return {
    type: "spring" as const,
    damping: config.springDamping,
    stiffness: config.springStiffness,
    mass: config.springMass,
  };
}

// ═══════════════════════════════════════════════════
// WIKI SUMMARY PREVIEW
// ═══════════════════════════════════════════════════

function WikiSummaryPreview({
  viewMode,
  config,
}: {
  viewMode: ViewMode;
  config: AnimationConfig;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [expandedHeight, setExpandedHeight] = useState(800);

  const collapsedWidth = viewMode === "quarter" ? 195 : 404;
  const expandedWidth = 404;
  const collapsedHeight = 190;

  useLayoutEffect(() => {
    if (measureRef.current) {
      setExpandedHeight(measureRef.current.offsetHeight);
    }
  }, [viewMode]);

  const containerSpring = buildSpring(config);
  const contentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleExpand = useCallback(() => {
    setContentReady(false);
    setIsExpanded(true);
    if (contentTimer.current) clearTimeout(contentTimer.current);
    contentTimer.current = setTimeout(() => {
      setContentReady(true);
    }, config.contentDelay * 1000);
  }, [config.contentDelay]);

  const handleCollapse = useCallback(() => {
    if (contentTimer.current) clearTimeout(contentTimer.current);
    setContentReady(false);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    setIsExpanded(false);
  }, []);

  const sectionContent = SECTIONS.map((section, i) => (
    <div
      key={i}
      className="flex flex-col"
      style={{ gap: "calc(var(--card-gap) * 0.5)" }}
    >
      <div
        className="type-headline"
        style={{ color: COLORS.WIKI_SUMMARY.ACCENT }}
      >
        {section.heading}
      </div>
      <div className="type-reading text-white" style={{ lineHeight: "var(--leading-reading)" }}>
        {section.body}
      </div>
    </div>
  ));

  return (
    <>
      {/* Hidden measurement div */}
      <div
        ref={measureRef}
        aria-hidden
        style={{
          position: "absolute",
          visibility: "hidden",
          pointerEvents: "none",
          width: expandedWidth,
          padding: "var(--card-padding)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--card-gap)",
        }}
      >
        <div style={{ height: 28 }} />
        <div className="type-headline">{ARTICLE_TITLE}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "calc(var(--card-gap) * 1.5)" }}>
          {sectionContent}
        </div>
      </div>

      {/* Visible card */}
      <motion.div
        className={` ${!isExpanded ? "cursor-pointer" : ""}`}
        style={{
          width: isExpanded ? expandedWidth : collapsedWidth,
          borderRadius: "var(--card-radius)",
          padding: "var(--card-padding)",
          backgroundColor: COLORS.WIKI_SUMMARY.BACKGROUND,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        initial={false}
        animate={{ height: isExpanded ? expandedHeight : collapsedHeight }}
        transition={containerSpring}
        onClick={!isExpanded ? handleExpand : undefined}
      >
        <div style={{ flexShrink: 0 }}>
          <CardHeader
            label="WIKI SUMMARY"
            labelColor={COLORS.WIKI_SUMMARY.LABEL}
            isExpanded={isExpanded}
            onClose={isExpanded ? handleCollapse : handleExpand}
            buttonColor={COLORS.WIKI_SUMMARY.BUTTON}
          />
        </div>

        <div
          ref={scrollRef}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: isExpanded ? "flex-start" : "flex-end",
            gap: isExpanded ? "calc(var(--card-gap) * 1.5)" : "calc(var(--card-gap) * 0.4)",
            overflow: isExpanded ? "auto" : "hidden",
          }}
        >
          <motion.div
            className="type-headline text-white"
            style={{ flexShrink: 0 }}
            layout="position"
            transition={{
              type: "spring",
              damping: config.titleDamping,
              stiffness: config.titleStiffness,
              mass: config.springMass,
            }}
          >
            {ARTICLE_TITLE}
          </motion.div>

          <motion.div
            className="type-caption"
            style={{
              color: COLORS.WIKI_SUMMARY.ACCENT,
              overflow: "hidden",
              flexShrink: 0,
            }}
            initial={false}
            animate={{
              opacity: isExpanded ? 0 : 1,
              height: isExpanded ? 0 : "auto",
            }}
            transition={{
              opacity: {
                duration: config.teaserFadeOut,
                delay: isExpanded ? 0 : config.teaserFadeInDelay,
              },
              height: {
                duration: 0.2,
                delay: isExpanded ? config.teaserFadeOut : 0,
              },
            }}
          >
            {TEASER_TEXT}
          </motion.div>

          {isExpanded && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "calc(var(--card-gap) * 1.5)",
              }}
            >
              {SECTIONS.map((section, i) => (
                <motion.div
                  key={i}
                  className="flex flex-col"
                  style={{ gap: "calc(var(--card-gap) * 0.5)" }}
                  initial={{ opacity: 0, y: config.contentYOffset }}
                  animate={{
                    opacity: contentReady ? 1 : 0,
                    y: contentReady ? 0 : config.contentYOffset,
                  }}
                  transition={{
                    duration: config.contentDuration,
                    delay: contentReady ? i * config.contentStagger : 0,
                    ease: "easeOut",
                  }}
                >
                  <div
                    className="type-headline"
                    style={{ color: COLORS.WIKI_SUMMARY.ACCENT }}
                  >
                    {section.heading}
                  </div>
                  <div
                    className="type-reading text-white"
                    style={{ lineHeight: "var(--leading-reading)" }}
                  >
                    {section.body}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

// ═══════════════════════════════════════════════════
// ABOVE GROUND PREVIEW
// ═══════════════════════════════════════════════════

function AboveGroundPreview({
  viewMode,
  config,
}: {
  viewMode: ViewMode;
  config: AnimationConfig;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [didSwipe, setDidSwipe] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [startX, setStartX] = useState(0);
  const contentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoRotateRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const collapsedWidth = viewMode === "quarter" ? 195 : 404;
  const expandedWidth = 404;
  const collapsedHeight = 190;
  const expandedHeight = 380;

  const containerSpring = buildSpring(config);
  const currentNews = AG_NEWS_ITEMS[currentIndex];

  const goToIndex = useCallback((index: number, dir?: number) => {
    const totalItems = AG_NEWS_ITEMS.length;
    const newIndex = ((index % totalItems) + totalItems) % totalItems;
    if (dir !== undefined) {
      setDirection(dir);
    } else {
      setDirection(newIndex > currentIndex ? 1 : -1);
    }
    setCurrentIndex(newIndex);
  }, [currentIndex]);

  // Auto-rotate in collapsed state
  useEffect(() => {
    if (isExpanded) {
      if (autoRotateRef.current) clearInterval(autoRotateRef.current);
      return;
    }
    autoRotateRef.current = setInterval(() => {
      setDirection(1);
      setCurrentIndex(prev => (prev + 1) % AG_NEWS_ITEMS.length);
    }, 4000);
    return () => { if (autoRotateRef.current) clearInterval(autoRotateRef.current); };
  }, [isExpanded]);

  const resetAutoRotate = useCallback(() => {
    if (isExpanded) return;
    if (autoRotateRef.current) clearInterval(autoRotateRef.current);
    autoRotateRef.current = setInterval(() => {
      setDirection(1);
      setCurrentIndex(prev => (prev + 1) % AG_NEWS_ITEMS.length);
    }, 4000);
  }, [isExpanded]);

  const handleExpand = useCallback(() => {
    setContentReady(false);
    setIsExpanded(true);
    if (contentTimer.current) clearTimeout(contentTimer.current);
    contentTimer.current = setTimeout(() => {
      setContentReady(true);
    }, config.contentDelay * 1000);
  }, [config.contentDelay]);

  const handleCollapse = useCallback(() => {
    if (contentTimer.current) clearTimeout(contentTimer.current);
    setContentReady(false);
    setIsExpanded(false);
  }, []);

  // Swipe / drag handlers
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

  // Direction-aware slide variants for headline rotation
  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  const slideTransition = { duration: config.headlineSlideDuration, ease: [0.4, 0, 0.2, 1] };

  return (
    <motion.div
      className={` ${!isExpanded ? "cursor-pointer" : ""}`}
      style={{
        width: isExpanded ? expandedWidth : collapsedWidth,
        borderRadius: "var(--card-radius)",
        padding: "var(--card-padding)",
        backgroundColor: COLORS.ABOVE_GROUND.BACKGROUND,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
      initial={false}
      animate={{ height: isExpanded ? expandedHeight : collapsedHeight }}
      transition={containerSpring}
      onClick={!isExpanded ? () => { if (!didSwipe) handleExpand(); } : undefined}
      onTouchStart={!isExpanded ? handleTouchStart : undefined}
      onTouchMove={!isExpanded ? handleTouchMove : undefined}
      onTouchEnd={!isExpanded ? handleTouchEnd : undefined}
      onMouseDown={!isExpanded ? handleMouseDown : undefined}
      onMouseMove={!isExpanded ? handleMouseMove : undefined}
      onMouseUp={!isExpanded ? handleMouseUp : undefined}
      onMouseLeave={!isExpanded ? handleMouseLeave : undefined}
    >
      <div style={{ flexShrink: 0 }}>
        <CardHeader
          label="ABOVE GROUND"
          labelColor={COLORS.ABOVE_GROUND.LABEL}
          isExpanded={isExpanded}
          onClose={isExpanded ? handleCollapse : handleExpand}
          buttonColor={COLORS.ABOVE_GROUND.BUTTON}
        />
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: isExpanded ? "flex-start" : "flex-end",
          overflow: "hidden",
        }}
      >
        {/* Collapsed: single rotating headline with direction-aware slide */}
        <motion.div
          style={{ overflow: "hidden", flexShrink: 0 }}
          initial={false}
          animate={{
            opacity: isExpanded ? 0 : 1,
            height: isExpanded ? 0 : "auto",
          }}
          transition={{
            opacity: {
              duration: config.teaserFadeOut,
              delay: isExpanded ? 0 : config.teaserFadeInDelay,
            },
            height: {
              duration: 0.2,
              delay: isExpanded ? config.teaserFadeOut : 0,
            },
          }}
        >
          <div
            className="w-full relative"
            style={{
              height: "calc(var(--text-headline) * var(--leading-tight) * 3)",
              transform: isDragging ? `translateX(${dragOffset * 0.3}px)` : undefined,
              transition: isDragging ? "none" : "transform 0.3s ease-out",
            }}
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
                className="type-headline text-black overflow-hidden w-full absolute bottom-0 left-0 right-0"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {currentNews.headline}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Expanded content — staggered entry with swipe support */}
        {isExpanded && (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              marginTop: 8,
              cursor: isDragging ? "grabbing" : "grab",
              userSelect: "none",
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            <div
              className="flex-1 flex flex-col justify-end pb-4"
              style={{
                gap: "var(--card-gap)",
                transform: `translateX(${dragOffset * 0.3}px)`,
                opacity: 1 - Math.abs(dragOffset) / 500,
                transition: isDragging ? "none" : "transform 0.3s ease-out, opacity 0.3s ease-out",
              }}
            >
              <motion.div
                className="type-headline text-black"
                initial={{ opacity: 0, y: config.contentYOffset }}
                animate={{
                  opacity: contentReady ? 1 : 0,
                  y: contentReady ? 0 : config.contentYOffset,
                }}
                transition={{
                  duration: config.contentDuration,
                  ease: "easeOut",
                }}
              >
                {currentNews.headline}
              </motion.div>
              <motion.div
                className="type-reading text-black"
                initial={{ opacity: 0, y: config.contentYOffset }}
                animate={{
                  opacity: contentReady ? 1 : 0,
                  y: contentReady ? 0 : config.contentYOffset,
                }}
                transition={{
                  duration: config.contentDuration,
                  delay: contentReady ? config.contentStagger : 0,
                  ease: "easeOut",
                }}
              >
                <p>{currentNews.description}</p>
                <p className="mt-2 opacity-80">{currentNews.description2}</p>
              </motion.div>
            </div>
          </div>
        )}
      </div>

      {/* DotNavigator — always visible at bottom */}
      <div style={{ flexShrink: 0, paddingTop: 8 }}>
        {isExpanded ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: contentReady ? 1 : 0 }}
            transition={{
              duration: config.contentDuration,
              delay: contentReady ? config.contentStagger * 2 : 0,
              ease: "easeOut",
            }}
          >
            <DotNavigator
              count={AG_NEWS_ITEMS.length}
              activeIndex={currentIndex}
              onSelect={(i) => goToIndex(i)}
            />
          </motion.div>
        ) : (
          <DotNavigator
            count={AG_NEWS_ITEMS.length}
            activeIndex={currentIndex}
            onSelect={(i) => {
              goToIndex(i);
              resetAutoRotate();
            }}
          />
        )}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════
// THOUGHT EXPERIMENT PREVIEW
// ═══════════════════════════════════════════════════

function ThoughtExperimentPreview({
  viewMode,
  config,
}: {
  viewMode: ViewMode;
  config: AnimationConfig;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const measureRef = useRef<HTMLDivElement>(null);
  const [expandedHeight, setExpandedHeight] = useState(300);
  const contentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const collapsedWidth = viewMode === "quarter" ? 195 : 404;
  const expandedWidth = 404;
  const collapsedHeight = 190;

  useLayoutEffect(() => {
    if (measureRef.current) {
      setExpandedHeight(measureRef.current.offsetHeight);
    }
  }, [viewMode]);

  const containerSpring = buildSpring(config);

  const handleExpand = useCallback(() => {
    setContentReady(false);
    setIsExpanded(true);
    if (contentTimer.current) clearTimeout(contentTimer.current);
    contentTimer.current = setTimeout(() => {
      setContentReady(true);
    }, config.contentDelay * 1000);
  }, [config.contentDelay]);

  const handleCollapse = useCallback(() => {
    if (contentTimer.current) clearTimeout(contentTimer.current);
    setContentReady(false);
    setIsExpanded(false);
  }, []);

  return (
    <>
      {/* Hidden measurement */}
      <div
        ref={measureRef}
        aria-hidden
        style={{
          position: "absolute",
          visibility: "hidden",
          pointerEvents: "none",
          width: expandedWidth,
          padding: "var(--card-padding)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--card-gap)",
        }}
      >
        <div style={{ height: 28 }} />
        <div className="type-headline">{THOUGHT_FULL}</div>
      </div>

      <motion.div
        className={` ${!isExpanded ? "cursor-pointer" : ""}`}
        style={{
          width: isExpanded ? expandedWidth : collapsedWidth,
          borderRadius: "var(--card-radius)",
          padding: "var(--card-padding)",
          backgroundColor: COLORS.THOUGHT_EXPERIMENT.BACKGROUND,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        initial={false}
        animate={{ height: isExpanded ? expandedHeight : collapsedHeight }}
        transition={containerSpring}
        onClick={!isExpanded ? handleExpand : undefined}
      >
        <div style={{ flexShrink: 0 }}>
          <CardHeader
            label="THINKERS"
            labelColor={COLORS.THOUGHT_EXPERIMENT.LABEL}
            isExpanded={isExpanded}
            onClose={isExpanded ? handleCollapse : handleExpand}
            buttonColor={COLORS.THOUGHT_EXPERIMENT.BUTTON}
          />
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          {/* Truncated text — teaser-style fade out/in */}
          <motion.div
            className="type-headline text-black"
            style={{ overflow: "hidden", flexShrink: 0 }}
            initial={false}
            animate={{
              opacity: isExpanded ? 0 : 1,
              height: isExpanded ? 0 : "auto",
            }}
            transition={{
              opacity: {
                duration: config.teaserFadeOut,
                delay: isExpanded ? 0 : config.teaserFadeInDelay,
              },
              height: {
                duration: 0.2,
                delay: isExpanded ? config.teaserFadeOut : 0,
              },
            }}
          >
            {THOUGHT_TRUNCATED}
          </motion.div>

          {/* Full text — delayed fade-in */}
          {isExpanded && (
            <motion.div
              className="type-headline text-black"
              initial={{ opacity: 0, y: config.contentYOffset }}
              animate={{
                opacity: contentReady ? 1 : 0,
                y: contentReady ? 0 : config.contentYOffset,
              }}
              transition={{
                duration: config.contentDuration,
                ease: "easeOut",
              }}
            >
              {THOUGHT_FULL}
            </motion.div>
          )}
        </div>
      </motion.div>
    </>
  );
}

// ═══════════════════════════════════════════════════
// MICRO HISTORY PREVIEW
// ═══════════════════════════════════════════════════

function MicroHistoryPreview({
  viewMode,
  config,
}: {
  viewMode: ViewMode;
  config: AnimationConfig;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const measureRef = useRef<HTMLDivElement>(null);
  const [expandedHeight, setExpandedHeight] = useState(400);
  const contentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const collapsedWidth = viewMode === "quarter" ? 195 : 404;
  const expandedWidth = 404;
  const collapsedHeight = 190;

  useLayoutEffect(() => {
    if (measureRef.current) {
      setExpandedHeight(measureRef.current.offsetHeight);
    }
  }, [viewMode]);

  const containerSpring = buildSpring(config);

  const handleExpand = useCallback(() => {
    setContentReady(false);
    setIsExpanded(true);
    if (contentTimer.current) clearTimeout(contentTimer.current);
    contentTimer.current = setTimeout(() => {
      setContentReady(true);
    }, config.contentDelay * 1000);
  }, [config.contentDelay]);

  const handleCollapse = useCallback(() => {
    if (contentTimer.current) clearTimeout(contentTimer.current);
    setContentReady(false);
    setIsExpanded(false);
  }, []);

  return (
    <>
      {/* Hidden measurement */}
      <div
        ref={measureRef}
        aria-hidden
        style={{
          position: "absolute",
          visibility: "hidden",
          pointerEvents: "none",
          width: expandedWidth,
          padding: "var(--card-padding)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--card-gap)",
        }}
      >
        <div style={{ height: 28 }} />
        <div className="type-headline">
          <span>{MICRO_TITLE} </span>
          <span>{MICRO_FULL}</span>
        </div>
      </div>

      <motion.div
        className={` ${!isExpanded ? "cursor-pointer" : ""}`}
        style={{
          width: isExpanded ? expandedWidth : collapsedWidth,
          borderRadius: "var(--card-radius)",
          padding: "var(--card-padding)",
          backgroundColor: COLORS.MICRO_HISTORY.BACKGROUND,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        initial={false}
        animate={{ height: isExpanded ? expandedHeight : collapsedHeight }}
        transition={containerSpring}
        onClick={!isExpanded ? handleExpand : undefined}
      >
        <div style={{ flexShrink: 0 }}>
          <CardHeader
            label="MICRO HISTORY"
            labelColor={COLORS.MICRO_HISTORY.LABEL}
            isExpanded={isExpanded}
            onClose={isExpanded ? handleCollapse : handleExpand}
            buttonColor={COLORS.MICRO_HISTORY.BUTTON}
          />
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          {/* Collapsed text — teaser-style fade out/in */}
          <motion.div
            className="type-headline line-clamp-3"
            style={{
              overflow: "hidden",
              flexShrink: 0,
              paddingBottom: "calc(var(--text-headline) * 0.15)",
            }}
            initial={false}
            animate={{
              opacity: isExpanded ? 0 : 1,
              height: isExpanded ? 0 : "auto",
            }}
            transition={{
              opacity: {
                duration: config.teaserFadeOut,
                delay: isExpanded ? 0 : config.teaserFadeInDelay,
              },
              height: {
                duration: 0.2,
                delay: isExpanded ? config.teaserFadeOut : 0,
              },
            }}
          >
            <span className="text-white">{MICRO_TITLE} </span>
            <span className="text-black">{MICRO_COLLAPSED}</span>
          </motion.div>

          {/* Full text — delayed fade-in */}
          {isExpanded && (
            <motion.div
              className="type-headline"
              initial={{ opacity: 0, y: config.contentYOffset }}
              animate={{
                opacity: contentReady ? 1 : 0,
                y: contentReady ? 0 : config.contentYOffset,
              }}
              transition={{
                duration: config.contentDuration,
                ease: "easeOut",
              }}
            >
              <span className="text-white">{MICRO_TITLE} </span>
              <span className="text-black">{MICRO_FULL}</span>
            </motion.div>
          )}
        </div>
      </motion.div>
    </>
  );
}

// ═══════════════════════════════════════════════════
// GAMES PREVIEW
// ═══════════════════════════════════════════════════

const GAME_NAMES = ["Ski", "Snake", "Flappy Circle"];

function GamesPreview({
  viewMode,
  config,
}: {
  viewMode: ViewMode;
  config: AnimationConfig;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const contentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const collapsedWidth = viewMode === "quarter" ? 195 : 404;
  const expandedWidth = 404;
  const collapsedHeight = 190;
  const expandedHeight = 420;

  const containerSpring = buildSpring(config);

  const handleExpand = useCallback(() => {
    setContentReady(false);
    setIsExpanded(true);
    if (contentTimer.current) clearTimeout(contentTimer.current);
    contentTimer.current = setTimeout(() => {
      setContentReady(true);
    }, config.contentDelay * 1000);
  }, [config.contentDelay]);

  const handleCollapse = useCallback(() => {
    if (contentTimer.current) clearTimeout(contentTimer.current);
    setContentReady(false);
    setIsExpanded(false);
  }, []);

  return (
    <motion.div
      className={` ${!isExpanded ? "cursor-pointer" : ""}`}
      style={{
        width: isExpanded ? expandedWidth : collapsedWidth,
        borderRadius: "var(--card-radius)",
        padding: "var(--card-padding)",
        backgroundColor: COLORS.GAMES.BACKGROUND,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
      initial={false}
      animate={{ height: isExpanded ? expandedHeight : collapsedHeight }}
      transition={containerSpring}
      onClick={!isExpanded ? handleExpand : undefined}
    >
      <div style={{ flexShrink: 0 }}>
        <CardHeader
          label="GAMES"
          labelColor={COLORS.GAMES.LABEL}
          isExpanded={isExpanded}
          onClose={isExpanded ? handleCollapse : handleExpand}
          buttonColor={COLORS.GAMES.BUTTON}
        />
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: isExpanded ? "flex-start" : "flex-end",
          overflow: "hidden",
        }}
      >
        {/* Collapsed game icons — teaser-style fade out/in */}
        <motion.div
          className="flex flex-row"
          style={{ gap: "var(--card-gap)", overflow: "hidden", flexShrink: 0 }}
          initial={false}
          animate={{
            opacity: isExpanded ? 0 : 1,
            height: isExpanded ? 0 : "auto",
          }}
          transition={{
            opacity: {
              duration: config.teaserFadeOut,
              delay: isExpanded ? 0 : config.teaserFadeInDelay,
            },
            height: {
              duration: 0.2,
              delay: isExpanded ? config.teaserFadeOut : 0,
            },
          }}
        >
          {GAME_NAMES.map((name, index) => (
            <div
              key={name}
              className="flex-1 relative overflow-hidden flex items-center justify-center"
              style={{
                background: "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)",
                backgroundColor: COLORS.GAMES.BACKGROUND,
                aspectRatio: "1/1",
                borderRadius: "var(--image-radius)",
              }}
            >
              {index === 0 && (
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ width: "55%", height: "55%" }}>
                  <rect x="4" y="14" width="3" height="3" fill="#228B22" />
                  <rect x="7" y="14" width="3" height="3" fill="#228B22" />
                  <rect x="1" y="17" width="3" height="3" fill="#228B22" />
                  <rect x="4" y="17" width="3" height="3" fill="#1B5E20" />
                  <rect x="7" y="17" width="3" height="3" fill="#228B22" />
                  <rect x="10" y="17" width="3" height="3" fill="#228B22" />
                  <rect x="1" y="20" width="3" height="3" fill="#228B22" />
                  <rect x="4" y="20" width="3" height="3" fill="#1B5E20" />
                  <rect x="7" y="20" width="3" height="3" fill="#228B22" />
                  <rect x="10" y="20" width="3" height="3" fill="#1B5E20" />
                  <rect x="4" y="23" width="3" height="3" fill="#8B4513" />
                  <rect x="7" y="23" width="3" height="3" fill="#8B4513" />
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
                  <rect x="15" y="33" width="3" height="3" fill="#333" />
                  <rect x="18" y="33" width="3" height="3" fill="#333" />
                  <rect x="21" y="33" width="3" height="3" fill="#333" />
                  <rect x="24" y="33" width="3" height="3" fill="#333" />
                  <rect x="27" y="33" width="3" height="3" fill="#333" />
                  <rect x="30" y="33" width="3" height="3" fill="#333" />
                  <rect x="15" y="27" width="3" height="3" fill="#8B4513" />
                  <rect x="30" y="27" width="3" height="3" fill="#8B4513" />
                  <rect x="37" y="8" width="3" height="3" fill="#228B22" />
                  <rect x="40" y="8" width="3" height="3" fill="#228B22" />
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
              {index === 1 && (
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ width: "55%", height: "55%" }}>
                  <rect x="6" y="20" width="6" height="6" fill="#1565C0" />
                  <rect x="12" y="20" width="6" height="6" fill="#1976D2" />
                  <rect x="18" y="20" width="6" height="6" fill="#1565C0" />
                  <rect x="24" y="20" width="6" height="6" fill="#1976D2" />
                  <rect x="30" y="20" width="6" height="6" fill="#1565C0" />
                  <rect x="30" y="14" width="6" height="6" fill="#1976D2" />
                  <rect x="36" y="14" width="6" height="6" fill="#2196F3" />
                  <rect x="38" y="15" width="2" height="2" fill="#fff" />
                  <rect x="38" y="19" width="2" height="2" fill="#fff" />
                  <rect x="14" y="32" width="4" height="4" fill="#e74c3c" />
                  <rect x="18" y="32" width="4" height="4" fill="#e74c3c" />
                  <rect x="14" y="36" width="4" height="4" fill="#e74c3c" />
                  <rect x="18" y="36" width="4" height="4" fill="#e74c3c" />
                  <rect x="16" y="30" width="2" height="2" fill="#228B22" />
                </svg>
              )}
              {index === 2 && (
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ width: "55%", height: "55%" }}>
                  <circle cx="24" cy="24" r="12" fill={COLORS.GAMES.BACKGROUND} />
                  <circle cx="21" cy="21" r="4" fill="rgba(255,255,255,0.45)" />
                </svg>
              )}
            </div>
          ))}
        </motion.div>

        {/* Expanded content — delayed entry */}
        {isExpanded && (
          <motion.div
            className="flex flex-row mt-2"
            style={{ gap: "var(--card-gap)", flex: 1 }}
            initial={{ opacity: 0, y: config.contentYOffset }}
            animate={{
              opacity: contentReady ? 1 : 0,
              y: contentReady ? 0 : config.contentYOffset,
            }}
            transition={{
              duration: config.contentDuration,
              ease: "easeOut",
            }}
          >
            {/* Game area */}
            <div
              className="relative overflow-hidden flex-1"
              style={{
                borderRadius: "var(--image-radius)",
                maxWidth: 313,
                aspectRatio: "313/308",
              }}
            >
              <div
                className="absolute inset-0 flex flex-col items-center justify-center"
                style={{
                  background: "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)",
                  borderRadius: "var(--image-radius)",
                }}
              >
                <div className="type-headline text-black mb-4">
                  {GAME_NAMES[0]}
                </div>
                <div
                  className="rounded-xl type-label text-white"
                  style={{
                    backgroundColor: COLORS.GAMES.BACKGROUND,
                    padding: "calc(var(--card-padding) * 0.7) calc(var(--card-padding) * 1.5)",
                  }}
                >
                  PLAY
                </div>
              </div>
            </div>

            {/* Nav arrow */}
            <div className="flex flex-col justify-end">
              <div
                className="flex items-center justify-center"
                style={{
                  width: "var(--nav-btn-size)",
                  height: "var(--nav-btn-size)",
                  borderRadius: "var(--image-radius)",
                  backgroundColor: COLORS.GAMES.NAV_BUTTON,
                }}
              >
                <span className="font-bold" style={{ fontSize: "calc(var(--text-headline) * 0.85)", color: COLORS.GAMES.ARROW }}>→</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════
// REVEAL CARD PREVIEW
// ═══════════════════════════════════════════════════

function RevealPreview({
  config,
}: {
  viewMode: ViewMode;
  config: AnimationConfig;
}) {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <div
      style={{
        width: 195,
        height: 190,
        borderRadius: "var(--card-radius)",
        padding: "var(--card-padding)",
        backgroundColor: COLORS.TRIVIA.BACKGROUND,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Header */}
      <div
        className="type-label"
        style={{ color: COLORS.TRIVIA.LABEL }}
      >
        TRIVIA
      </div>

      {/* Question + answer area */}
      <div className="flex-1 flex flex-col gap-2">
        <div className="type-headline text-black">
          What year did the first iPhone launch?
        </div>

        <div className="relative">
          <div className="type-headline text-black">
            2007
          </div>

          <AnimatePresence>
            {!isRevealed && (
              <motion.div
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{
                  duration: config.exitDuration,
                  ease: [0.4, 0, 0.2, 1],
                }}
                onClick={() => setIsRevealed(true)}
                className="absolute inset-0 flex items-center justify-center cursor-pointer"
                style={{
                  backgroundColor: COLORS.TRIVIA.BACKGROUND,
                  borderRadius: "calc(var(--card-radius) * 0.5)",
                }}
              >
                <div
                  className="type-headline text-black text-center"
                >
                  Tap to reveal
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════

type PanelTab = "animation" | "typography";

export function AnimationLab() {
  const [selectedModule, setSelectedModule] = useState<ModuleType>(
    "aboveGround"
  );
  const [viewMode, setViewMode] = useState<ViewMode>("half");
  const [config, setConfig] = useState<AnimationConfig>({
    ...DEFAULT_CONFIG,
  });
  const [panelTab, setPanelTab] = useState<PanelTab>("animation");

  // Typography state (drives live CSS variable updates on #underground-root)
  const typo = useTypographyState();

  const handleConfigChange = useCallback(
    (key: keyof AnimationConfig, value: number) => {
      setConfig((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleAnimationReset = useCallback(() => {
    setConfig({ ...DEFAULT_CONFIG });
  }, []);

  const handleAnimationApply = useCallback(async (): Promise<boolean> => {
    try {
      const payload = buildTimingPayload(config);
      const res = await fetch("/api/dev/save-timing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return false;
      // Verify we got JSON back (not an HTML fallback from Vite)
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) return false;
      const data = await res.json();
      return !!data.success;
    } catch {
      return false;
    }
  }, [config]);

  const handleTypographyApply = useCallback(async (): Promise<boolean> => {
    try {
      return await typo.handleApply();
    } catch {
      return false;
    }
  }, [typo]);

  const renderPreview = () => {
    const props = { viewMode, config };
    switch (selectedModule) {
      case "aboveGround":
        return <AboveGroundPreview key={`ag-${viewMode}`} {...props} />;
      case "wikiSummary":
        return <WikiSummaryPreview key={`wiki-${viewMode}`} {...props} />;
      case "thoughtExperiment":
        return (
          <ThoughtExperimentPreview key={`thought-${viewMode}`} {...props} />
        );
      case "microHistory":
        return (
          <MicroHistoryPreview key={`micro-${viewMode}`} {...props} />
        );
      case "games":
        return <GamesPreview key={`games-${viewMode}`} {...props} />;
      case "reveal":
        return <RevealPreview key={`reveal-${viewMode}`} {...props} />;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: COLORS.UTILITY.BACKGROUND_DARK,
        fontFamily: "'Sora', system-ui, sans-serif",
      }}
    >
      {/* Preview Area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          overflow: "auto",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexShrink: 0,
            width: "100%",
            borderBottom: "1px solid #333",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              fontFamily:
                "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace",
              marginRight: 8,
            }}
          >
            Animation Lab
          </span>

          {/* Module tabs */}
          <div
            style={{
              display: "flex",
              background: "#2a2a2a",
              borderRadius: 6,
              overflow: "hidden",
            }}
          >
            {MODULE_OPTIONS.map((mod) => (
              <button
                key={mod.id}
                onClick={() => setSelectedModule(mod.id)}
                style={{
                  padding: "6px 10px",
                  background:
                    selectedModule === mod.id ? "#8b5cf6" : "transparent",
                  border: "none",
                  color: selectedModule === mod.id ? "#fff" : "#888",
                  fontSize: 10,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily:
                    "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace",
                  whiteSpace: "nowrap",
                }}
              >
                {mod.label}
              </button>
            ))}
          </div>

          {/* View mode toggle */}
          <div
            style={{
              display: "flex",
              background: "#2a2a2a",
              borderRadius: 6,
              overflow: "hidden",
              marginLeft: "auto",
            }}
          >
            {(["quarter", "half"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: "6px 14px",
                  background:
                    viewMode === mode ? "#8b5cf6" : "transparent",
                  border: "none",
                  color: viewMode === mode ? "#fff" : "#888",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily:
                    "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace",
                }}
              >
                {mode === "quarter" ? "Quarter" : "Half"}
              </button>
            ))}
          </div>
        </div>

        {/* Card preview area */}
        <div
          id="underground-root"
          style={{
            flex: 1,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "40px 24px",
            width: "100%",
          }}
        >
          {renderPreview()}
        </div>
      </div>

      {/* Right Panel — tabbed: Animation | Typography */}
      <div
        style={{
          width: 300,
          background: "#1a1a1a",
          borderLeft: "1px solid #333",
          display: "flex",
          flexDirection: "column",
          fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {/* Tab bar */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid #333",
            flexShrink: 0,
          }}
        >
          {(["animation", "typography"] as PanelTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setPanelTab(tab)}
              style={{
                flex: 1,
                padding: "10px 0",
                background: "none",
                border: "none",
                borderBottom: panelTab === tab ? "2px solid #8b5cf6" : "2px solid transparent",
                color: panelTab === tab ? "#fff" : "#666",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {tab === "animation" ? "Animation" : "Typography"}
            </button>
          ))}
        </div>

        {/* Panel content */}
        {panelTab === "animation" ? (
          <AnimationDialKit
            config={config}
            moduleType={selectedModule}
            onChange={handleConfigChange}
            onReset={handleAnimationReset}
            onApply={handleAnimationApply}
          />
        ) : (
          <TypographyDialKitPanel
            values={typo.values}
            onChange={typo.handleChange}
            onReset={typo.handleReset}
            onApply={handleTypographyApply}
          />
        )}
      </div>
    </div>
  );
}
