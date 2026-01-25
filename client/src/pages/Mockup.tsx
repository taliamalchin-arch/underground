import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

// Design System Constants
const SPACING = {
  cardPadding: 18,
  cardRadius: 30,
  imageRadius: 24,
  imageGap: 9,
  cardGap: 14,
  containerPadding: 18,
};

// Dynamic Date Header Component
const DateHeader = () => {
  const now = new Date();
  
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

  return (
    <header className="w-full py-4">
      <div
        className="font-['Satoshi-Bold',Helvetica] font-bold text-[#f7f7f7] tracking-[-0.04em] w-full"
        style={{ fontSize: 'calc((100vw - 36px) / 11)' }}
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
    source: "OpenAI / X",
  },
  {
    headline: "Barbie got snubbed at the Oscars for Best Director",
    description: "Greta Gerwig's omission from the Best Director category sparked immediate backlash. The irony wasn't lost on anyone given the film's themes about women being overlooked.",
    source: "Academy / Variety",
  },
  {
    headline: "Reddit's API changes killed third-party apps",
    description: "Apollo, RIF, and other beloved apps shut down after Reddit imposed unsustainable pricing. Moderators staged blackouts in protest, and thousands migrated to alternatives.",
    source: "Reddit / The Verge",
  },
  {
    headline: "Taylor Swift and Travis Kelce dominated everything",
    description: "The relationship turned NFL games into cultural events. Camera cuts to Swift in the stands became a meme format, and think pieces about the crossover audience flooded timelines.",
    source: "X / ESPN",
  },
  {
    headline: "ChatGPT's voice mode felt uncomfortably human",
    description: "The new Advanced Voice feature sparked conversations about parasocial AI relationships. Users reported feeling genuinely attached to the conversational quality.",
    source: "OpenAI / X",
  },
];

// Above Ground Checkin - Interactive expandable card
const AboveGroundCard = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : NEWS_ITEMS.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev < NEWS_ITEMS.length - 1 ? prev + 1 : 0));
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(false);
    setCurrentIndex(0);
  };

  const currentNews = NEWS_ITEMS[currentIndex];
  const pageDisplay = `${String(currentIndex + 1).padStart(2, '0')} / ${String(NEWS_ITEMS.length).padStart(2, '0')}`;

  return (
    <Card
      className="w-full border-0 flex flex-col cursor-pointer transition-all duration-300"
      style={{
        aspectRatio: isExpanded ? "404/380" : "404/190",
        borderRadius: SPACING.cardRadius,
        padding: SPACING.cardPadding,
        backgroundColor: "#f4ca5b",
      }}
      onClick={() => !isExpanded && setIsExpanded(true)}
    >
      <CardContent className="p-0 w-full h-full flex flex-col">
        {/* Category label - always visible */}
        <div
          className="font-['Sora',Helvetica] font-bold text-[10px] tracking-[1px] uppercase h-[17px]"
          style={{ color: "#feeaae" }}
        >
          ABOVE GROUND CHECKIN
        </div>

        {!isExpanded ? (
          /* Collapsed state */
          <div className="flex-1 flex items-end">
            <div className="font-['Satoshi-Bold',Helvetica] font-bold text-black text-[24px] tracking-[-0.96px] leading-[26px]">
              What everyone is talking about on this beautiful Tuesday
            </div>
          </div>
        ) : (
          /* Expanded state */
          <div className="flex-1 flex flex-col justify-between mt-2">
            {/* Headline - small text */}
            <div className="font-['Sora',Helvetica] font-bold text-black text-[10px] tracking-[-0.4px] leading-[16px]">
              {currentNews.headline}
            </div>

            {/* Description - large text */}
            <div className="font-['Satoshi-Bold',Helvetica] font-bold text-black text-[24px] tracking-[-0.96px] leading-[26px] flex-1 flex items-end pb-4">
              {currentNews.description}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-end justify-between gap-[9px]">
              {/* Prev button */}
              <button
                onClick={handlePrev}
                className="flex items-center justify-center"
                style={{
                  width: 116,
                  height: 116,
                  borderRadius: SPACING.imageRadius,
                  backgroundColor: "#ffd967",
                }}
              >
                <span className="text-black text-[24px]">←</span>
              </button>

              {/* Close button with page count */}
              <button
                onClick={handleClose}
                className="flex flex-col items-center justify-end pb-4"
                style={{
                  width: 116,
                  height: 116,
                  borderRadius: SPACING.imageRadius,
                  backgroundColor: "#ffd967",
                }}
              >
                <span
                  className="font-['Sora',Helvetica] font-bold text-[10px] tracking-[-0.4px] leading-[16px] mb-2"
                  style={{ color: "#d9ae2f" }}
                >
                  {pageDisplay}
                </span>
                <span
                  className="font-['Sora',Helvetica] font-bold text-[10px] tracking-[1px] uppercase"
                  style={{ color: "#d9ae2f" }}
                >
                  CLOSE
                </span>
              </button>

              {/* Next button */}
              <button
                onClick={handleNext}
                className="flex items-center justify-center"
                style={{
                  width: 116,
                  height: 116,
                  borderRadius: SPACING.imageRadius,
                  backgroundColor: "#ffd967",
                }}
              >
                <span className="text-black text-[24px]">→</span>
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const FactleFlipCard = () => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <Card
      className="w-full border-0 flex flex-col"
      style={{
        aspectRatio: "195/190",
        borderRadius: SPACING.cardRadius,
        padding: SPACING.cardPadding,
        backgroundColor: "#f6afe9",
      }}
    >
      <CardContent className="p-0 w-full flex flex-col h-full gap-[6px]">
        <div className="font-['Sora',Helvetica] font-bold text-[#f8e5f4] text-[10px] tracking-[1px] uppercase h-[17px]">
          FACTLE
        </div>
        {/* Flip container - only the cap flips */}
        <div
          className="flex-1 w-full cursor-pointer"
          style={{ perspective: "1000px" }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div
            className="relative w-full h-full transition-transform duration-500"
            style={{
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* Front - Cap image */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ backfaceVisibility: "hidden" }}
            >
              <img
                className="w-full h-full object-contain"
                alt="Factle"
                src="/figmaAssets/rectangle-7.png"
                style={{ borderRadius: SPACING.imageRadius }}
              />
            </div>
            {/* Back - Flipped cap with fact */}
            <div
              className="absolute inset-0 flex items-center justify-center overflow-visible"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <div className="relative flex items-center justify-center" style={{ width: "140%", height: "140%" }}>
                <img
                  className="w-full h-full object-contain"
                  alt="Factle Flipped"
                  src="/figmaAssets/factle-flipped.png"
                  style={{ borderRadius: SPACING.imageRadius }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-[25%] pt-2">
                  <p className="font-['Satoshi-Bold',Helvetica] font-bold text-black text-[9px] tracking-[-0.3px] leading-[11px] max-w-[60px]">
                    Sharks are older than trees
                  </p>
                  <p className="font-['Satoshi-Bold',Helvetica] font-bold text-black text-[5px] tracking-[-0.2px] mt-1">
                    FACTLE
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Quarter Card - Text variant (195x190 in Figma, scaled proportionally)
const QuarterTextCard = ({
  category,
  categoryColor,
  content,
  bgColor,
  contentElement,
}: {
  category: string | React.ReactNode;
  categoryColor: string;
  content?: string;
  bgColor: string;
  contentElement?: React.ReactNode;
}) => (
  <Card
    className="w-full border-0 flex flex-col justify-between"
    style={{
      aspectRatio: "195/190",
      borderRadius: SPACING.cardRadius,
      padding: SPACING.cardPadding,
      backgroundColor: bgColor,
    }}
  >
    <CardContent className="p-0 w-full h-full flex flex-col justify-between">
      <div
        className="font-['Sora',Helvetica] font-bold text-[10px] tracking-[1px] uppercase h-[17px]"
        style={{ color: categoryColor }}
      >
        {category}
      </div>
      {contentElement || (
        <div className="font-['Satoshi-Bold',Helvetica] font-bold text-black text-[24px] tracking-[-0.96px] leading-[26px] overflow-hidden line-clamp-4">
          {content}
        </div>
      )}
    </CardContent>
  </Card>
);

// Half Card - Text variant (404x190 in Figma)
const HalfTextCard = ({
  category,
  categoryColor,
  content,
  bgColor,
}: {
  category: string;
  categoryColor: string;
  content: React.ReactNode;
  bgColor: string;
}) => (
  <Card
    className="w-full border-0 flex flex-col justify-between"
    style={{
      aspectRatio: "404/190",
      borderRadius: SPACING.cardRadius,
      padding: SPACING.cardPadding,
      backgroundColor: bgColor,
    }}
  >
    <CardContent className="p-0 w-full h-full flex flex-col justify-between">
      <div
        className="font-['Sora',Helvetica] font-bold text-[10px] tracking-[1px] uppercase h-[17px]"
        style={{ color: categoryColor }}
      >
        {category}
      </div>
      <div className="font-['Satoshi-Bold',Helvetica] font-bold text-[24px] tracking-[-0.96px] leading-[26px] overflow-hidden line-clamp-4">
        {content}
      </div>
    </CardContent>
  </Card>
);

// Half Card - Images variant (404x190 in Figma)
const HalfImagesCard = ({
  category,
  categoryColor,
  bgColor,
  images,
  placeholders,
}: {
  category: string;
  categoryColor: string;
  bgColor: string;
  images?: string[];
  placeholders?: boolean;
}) => (
  <Card
    className="w-full border-0 flex flex-col"
    style={{
      aspectRatio: "404/190",
      borderRadius: SPACING.cardRadius,
      padding: SPACING.cardPadding,
      backgroundColor: bgColor,
    }}
  >
    <CardContent className="p-0 w-full h-full flex flex-col" style={{ gap: 21 }}>
      <div
        className="font-['Sora',Helvetica] font-bold text-[10px] tracking-[1px] uppercase h-[17px]"
        style={{ color: categoryColor }}
      >
        {category}
      </div>
      <div
        className="flex flex-1 justify-center items-center"
        style={{ gap: SPACING.imageGap }}
      >
        {placeholders
          ? [1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex-1 max-w-[116px] aspect-square bg-gradient-to-b from-white to-transparent"
                style={{ borderRadius: SPACING.imageRadius }}
              />
            ))
          : images?.map((src, i) => (
              <img
                key={i}
                className="flex-1 max-w-[116px] aspect-square object-cover"
                alt={`Image ${i + 1}`}
                src={src}
                style={{ borderRadius: SPACING.imageRadius }}
              />
            ))}
      </div>
    </CardContent>
  </Card>
);

export const Mockup = (): JSX.Element => {
  return (
    <div className="bg-[#2f2f2f] min-h-screen w-full flex justify-center">
      <div
        className="w-full max-w-[600px] flex flex-col"
        style={{
          padding: SPACING.containerPadding,
          gap: SPACING.cardGap,
        }}
      >
        {/* Header - Dynamic Date */}
        <DateHeader />

        {/* Above Ground Checkin - Interactive expandable card */}
        <AboveGroundCard />

        {/* Factle & Thought Experiment - Quarter Cards */}
        <div className="flex w-full" style={{ gap: SPACING.cardGap }}>
          <div className="flex-1">
            <FactleFlipCard />
          </div>
          <div className="flex-1">
            <QuarterTextCard
              category="THOUGHT EXPERIMENT"
              categoryColor="#dbd3d2"
              bgColor="#b9acaa"
              content="Imagine a world where every object slowly changes shape when no one is looking, but returns to normal the moment it's observed."
            />
          </div>
        </div>

        {/* Games - Half Images (placeholders) */}
        <HalfImagesCard
          category="GAMES"
          categoryColor="#edeaff"
          bgColor="#2c62c6"
          placeholders
        />

        {/* Micro History - Half Text */}
        <HalfTextCard
          category="MICRO HISTORY"
          categoryColor="#e4f0cd"
          bgColor="#c1cea9"
          content={
            <>
              <span className="text-white">Why notebooks are usually lined </span>
              <span className="text-black">
                Early mass-produced paper varied in quality, and lines helped guide
                handwriting when ink bled easily....
              </span>
            </>
          }
        />

        {/* On This Day & Word of the Day - Quarter Cards */}
        <div className="flex w-full" style={{ gap: SPACING.cardGap }}>
          <div className="flex-1">
            <QuarterTextCard
              category={
                <>
                  <span className="text-[#d9b593]">ON THIS DAY</span>
                  <span className="text-black ml-2">2007</span>
                </>
              }
              categoryColor="#d9b593"
              bgColor="#a96424"
              content="Apple announced the original iPhone."
            />
          </div>
          <div className="flex-1">
            <Card
              className="w-full border-0 flex flex-col"
              style={{
                aspectRatio: "195/190",
                borderRadius: SPACING.cardRadius,
                padding: SPACING.cardPadding,
                backgroundColor: "#967bd2",
              }}
            >
              <CardContent className="p-0 w-full h-full flex flex-col justify-between">
                <img
                  className="w-full h-[8px] object-contain"
                  alt="Category"
                  src="/figmaAssets/category.png"
                />
                <div className="font-['Satoshi-Bold',Helvetica] text-black">
                  <p className="font-bold text-[24px] tracking-[-0.96px] leading-[26px]">
                    Inure
                  </p>
                  <p className="font-['Sora',Helvetica] font-bold text-[10px] tracking-[-0.04px]">
                    [IN-YOOR] VERB
                  </p>
                  <p className="font-['Sora',Helvetica] font-bold text-[10px] tracking-[-0.04px] leading-[14px]">
                    to accustom to hardship, difficulty, or pain
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Image Essay - Half Images */}
        <HalfImagesCard
          category="IMAGE ESSAY"
          categoryColor="#83b05d"
          bgColor="#597c3b"
          images={[
            "/figmaAssets/rectangle-20.png",
            "/figmaAssets/rectangle-20.png",
            "/figmaAssets/rectangle-20.png",
          ]}
        />

        {/* Seen It All Section */}
        <section
          className="w-full"
          style={{ padding: SPACING.cardPadding, paddingTop: SPACING.cardPadding * 2 }}
        >
          <h2 className="font-['Sora',Helvetica] font-bold text-white text-[10px] tracking-[1px] uppercase mb-6">
            SEEN IT ALL?
          </h2>
          <p className="font-['Satoshi-Regular',Helvetica] font-normal text-white text-base tracking-[0.32px] leading-relaxed">
            Look up. Notice the person across from you, the way light falls
            through the window, the rhythm of wheels on tracks. Each stranger
            carries a universe you'll never know. Send them a quiet thought.
            Breathe in this shared moment. Sometimes the best connection happens
            when we're disconnected from everything else.
          </p>
        </section>

        {/* Footer */}
        <footer
          className="w-full bg-[#363636]"
          style={{
            borderRadius: SPACING.cardRadius,
            padding: SPACING.cardPadding * 2,
            marginTop: SPACING.cardGap,
          }}
        >
          <div className="font-['Satoshi-Bold',Helvetica] font-bold text-[#565656] text-xl tracking-[-0.80px] leading-relaxed">
            Made by Talia, 2026
            <br />
            via Claude Code
          </div>
        </footer>
      </div>
    </div>
  );
};
