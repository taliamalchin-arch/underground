import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

const FactleFlipCard = () => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="w-full aspect-square cursor-pointer"
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
        <Card
          className="absolute inset-0 bg-[#f6afe9] rounded-[30px] border-0 p-[18px] flex flex-col"
          style={{ backfaceVisibility: "hidden" }}
        >
          <CardContent className="p-0 w-full flex flex-col h-full gap-1.5">
            <div className="[font-family:'Sora',Helvetica] font-bold text-[#f8e5f4] text-[10px] tracking-[1.00px]">
              FACTLE
            </div>
            <img
              className="flex-1 w-full object-contain"
              alt="Factle"
              src="/figmaAssets/rectangle-7.png"
            />
          </CardContent>
        </Card>
        <Card
          className="absolute inset-0 bg-[#f6afe9] rounded-[30px] border-0 p-[18px] flex flex-col items-center justify-center"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <CardContent className="p-0 w-full h-full flex items-center justify-center relative">
            <img
              className="absolute inset-0 w-full h-full object-contain"
              alt="Factle Flipped"
              src="/figmaAssets/factle-flipped.png"
            />
            <div className="relative z-10 flex flex-col items-center text-center mt-4">
              <p className="[font-family:'Satoshi-Bold',Helvetica] font-bold text-black text-[11px] tracking-[-0.44px] leading-[12px]">
                Sharks are older than trees
              </p>
              <p className="[font-family:'Satoshi-Bold',Helvetica] font-bold text-black text-[5px] tracking-[-0.2px] mt-1">
                FACTLE
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export const Mockup = (): JSX.Element => {
  return (
    <div className="bg-[#2f2f2f] min-h-screen w-full flex justify-center">
      <div className="w-full max-w-[600px] px-4 py-10 flex flex-col gap-4">
        <header className="[font-family:'Satoshi-Bold',Helvetica] font-bold text-[#f7f7f7] text-[clamp(32px,8vw,50px)] tracking-[-2.00px] leading-tight text-center mb-4">
          January 20, 2026
        </header>

        <Card className="w-full bg-[#f4ca5b] rounded-[30px] border-0 p-[18px]">
          <CardContent className="p-0 w-full flex flex-col gap-4">
            <div className="[font-family:'Sora',Helvetica] font-bold text-[#faf5e9] text-[10px] tracking-[1.00px]">
              ABOVE GROUND CHECKIN
            </div>
            <div className="[font-family:'Satoshi-Bold',Helvetica] font-bold text-black text-[clamp(18px,5vw,24px)] tracking-[-0.96px] leading-[1.2]">
              What everyone is talking about on this beautiful Tuesday
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <FactleFlipCard />
          <Card className="w-full aspect-square bg-[#b9acaa] rounded-[30px] border-0 p-[18px]">
            <CardContent className="p-0 w-full h-full flex flex-col">
              <div className="[font-family:'Sora',Helvetica] font-bold text-[#dbd3d2] text-[10px] tracking-[1.00px] mb-2">
                THOUGHT EXPERIMENT
              </div>
              <div className="[font-family:'Satoshi-Bold',Helvetica] font-bold text-black text-[clamp(12px,3vw,14px)] tracking-[-0.5px] leading-[1.3] overflow-hidden line-clamp-6">
                Imagine a world where every object slowly changes shape when no one is looking, but returns to normal the moment it's observed. Nothing ever breaks or malfunctions — it's simply different when unseen. Would the unseen version of the world feel less real, or more honest?
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="w-full bg-[#2c62c6] rounded-[30px] border-0 p-[18px]">
          <CardContent className="p-0 w-full">
            <div className="[font-family:'Sora',Helvetica] font-bold text-[#edeaff] text-[10px] tracking-[1.00px] mb-4">
              GAMES
            </div>
            <div className="flex justify-center gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-[30%] aspect-square max-w-[116px] rounded-3xl bg-gradient-to-b from-white to-transparent"
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="w-full bg-[#c1cea9] rounded-[30px] border-0 p-[18px]">
          <CardContent className="p-0 w-full flex flex-col gap-2">
            <div className="[font-family:'Sora',Helvetica] font-bold text-[#e4f0cd] text-[10px] tracking-[1.00px]">
              MICRO HISTORY
            </div>
            <div className="[font-family:'Satoshi-Bold',Helvetica] font-bold text-[clamp(18px,5vw,24px)] tracking-[-0.96px] leading-[1.2]">
              <span className="text-white">Why notebooks are usually lined </span>
              <span className="text-black">
                Early mass-produced paper varied in quality, and lines helped guide
                handwriting when ink bled easily. Over time, lined paper became
                associated with neatness and structure — even after the practical
                reason disappeared.
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="w-full aspect-square bg-[#a96424] rounded-[30px] border-0 p-[18px]">
            <CardContent className="p-0 w-full h-full flex flex-col">
              <div className="[font-family:'Sora',Helvetica] font-bold text-[10px] tracking-[1.00px] mb-2">
                <span className="text-[#d9b593]">ON THIS DAY</span>
                <span className="text-black ml-2">2007</span>
              </div>
              <div className="[font-family:'Satoshi-Bold',Helvetica] font-bold text-black text-[clamp(16px,4vw,24px)] tracking-[-0.96px] leading-[1.2] mt-auto">
                Apple announced the original iPhone.
              </div>
            </CardContent>
          </Card>
          <Card className="w-full aspect-square bg-[#967bd2] rounded-[30px] border-0 p-[18px]">
            <CardContent className="p-0 w-full h-full flex flex-col">
              <img
                className="w-full h-[8px] object-contain mb-2"
                alt="Category"
                src="/figmaAssets/category.png"
              />
              <div className="[font-family:'Satoshi-Bold',Helvetica] text-black mt-auto">
                <p className="font-bold text-[clamp(18px,5vw,24px)] tracking-[-0.96px] leading-[1.2]">
                  Inure
                </p>
                <p className="[font-family:'Sora',Helvetica] font-bold text-[10px] tracking-[-0.04px]">
                  [IN-YOOR] VERB
                </p>
                <p className="[font-family:'Sora',Helvetica] font-bold text-[10px] tracking-[-0.04px] leading-[1.4]">
                  to accustom to hardship, difficulty, or pain
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="w-full bg-[#597c3b] rounded-[30px] border-0 p-[18px]">
          <CardContent className="p-0 w-full">
            <div className="[font-family:'Sora',Helvetica] font-bold text-[#83b05d] text-[10px] tracking-[1.00px] mb-4">
              IMAGE ESSAY
            </div>
            <div className="flex justify-center gap-3">
              {[1, 2, 3].map((i) => (
                <img
                  key={i}
                  className="w-[30%] aspect-square max-w-[116px] rounded-3xl object-cover"
                  alt="Image essay"
                  src="/figmaAssets/rectangle-20.png"
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <section className="w-full mt-4 px-2">
          <h2 className="[font-family:'Sora',Helvetica] font-bold text-white text-[10px] tracking-[1.00px] mb-4">
            SEEN IT ALL?
          </h2>
          <p className="[font-family:'Satoshi-Regular',Helvetica] font-normal text-white text-base tracking-[0.32px] leading-relaxed">
            Look up. Notice the person across from you, the way light falls
            through the window, the rhythm of wheels on tracks. Each stranger
            carries a universe you'll never know. Send them a quiet thought.
            Breathe in this shared moment. Sometimes the best connection happens
            when we're disconnected from everything else.
          </p>
        </section>

        <footer className="w-full bg-[#363636] rounded-[30px] p-8 mt-8">
          <div className="[font-family:'Satoshi-Bold',Helvetica] font-bold text-[#565656] text-xl tracking-[-0.80px] leading-relaxed">
            Made by Talia, 2026
            <br />
            via Claude Code
          </div>
        </footer>
      </div>
    </div>
  );
};
