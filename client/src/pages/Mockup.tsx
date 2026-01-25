import { Card, CardContent } from "@/components/ui/card";

const contentCards = [
  {
    id: "above-ground",
    position: "top-[122px] left-[calc(50.00%_-_203px)]",
    width: "w-[404px]",
    height: "h-[190px]",
    bgColor: "bg-[#f4ca5b]",
    title: "ABOVE GROUND CHECKIN",
    titleColor: "text-[#faf5e9]",
    content: "What everyone is talking about on this beautiful Tuesday",
    contentColor: "text-black",
  },
  {
    id: "micro-history",
    position: "top-[734px] left-[calc(50.00%_-_202px)]",
    width: "w-[404px]",
    height: "h-[190px]",
    bgColor: "bg-[#c1cea9]",
    title: "MICRO HISTORY",
    titleColor: "text-[#e4f0cd]",
    content: (
      <>
        <span className="text-white tracking-[-0.23px]">
          Why notebooks are usually lined{" "}
        </span>
        <span className="text-black tracking-[-0.23px]">
          Early mass-produced paper varied in quality, and lines helped guide
          handwriting when ink bled easily. Over time, lined paper became
          associated with neatness and structure — even after the practical
          reason disappeared.
        </span>
      </>
    ),
    contentColor: "text-transparent",
  },
];

const smallCards = [
  {
    id: "factle",
    position: "top-[326px] left-[calc(50.00%_-_203px)]",
    width: "w-[195px]",
    height: "h-[190px]",
    bgColor: "bg-[#f6afe9]",
    title: "FACTLE",
    titleColor: "text-[#f8e5f4]",
    hasImage: true,
    imageSrc: "/figmaAssets/rectangle-7.png",
  },
  {
    id: "thought-experiment",
    position: "top-[326px] left-[calc(50.00%_+_6px)]",
    width: "w-[195px]",
    height: "h-[190px]",
    bgColor: "bg-[#b9acaa]",
    title: "THOUGHT EXPERIMENT",
    titleColor: "text-[#dbd3d2]",
    content:
      "Imagine a world where every object slowly changes shape when no one is looking, but returns to normal the moment it's observed. Nothing ever breaks or malfunctions — it's simply different when unseen. Would the unseen version of the world feel less real, or more honest?",
    contentColor: "text-black",
  },
  {
    id: "on-this-day",
    position: "top-[938px] left-[calc(50.00%_-_203px)]",
    width: "w-[195px]",
    height: "h-[190px]",
    bgColor: "bg-[#a96424]",
    title: (
      <>
        <span className="text-[#d9b593] tracking-[0.10px]">ON THIS DAY</span>
        <span className="text-[#d9b593] tracking-[0.10px]">{"   "}</span>
        <span className="text-black tracking-[0.10px] leading-[15px]">
          2007
        </span>
      </>
    ),
    titleColor: "text-transparent",
    content: "Apple announced the original iPhone.",
    contentColor: "text-black",
  },
  {
    id: "word-of-day",
    position: "top-[938px] left-[calc(50.00%_+_6px)]",
    width: "w-[195px]",
    height: "h-[190px]",
    bgColor: "bg-[#967bd2]",
    title: "",
    titleColor: "",
    hasCategory: true,
    categorySrc: "/figmaAssets/category.png",
    content: (
      <>
        <span className="font-bold tracking-[-0.23px] leading-[26px]">
          Inure
          <br />
        </span>
        <span className="[font-family:'Sora',Helvetica] font-bold text-[10px] tracking-[-0.04px] leading-[18px]">
          [IN-YOOR] VERB
          <br />
        </span>
        <span className="[font-family:'Sora',Helvetica] font-bold text-[10px] tracking-[-0.04px] leading-4">
          to accustom to hardship,{" "}
        </span>
        <span className="[font-family:'Sora',Helvetica] font-bold text-[10px] tracking-[-0.04px] leading-[14px]">
          difficulty, or pain
        </span>
      </>
    ),
    contentColor: "text-black",
  },
];

const gameBoxes = [{ id: "game-1" }, { id: "game-2" }, { id: "game-3" }];

const imageEssayImages = [
  { id: "img-1", src: "/figmaAssets/rectangle-20.png" },
  { id: "img-2", src: "/figmaAssets/rectangle-20.png" },
  { id: "img-3", src: "/figmaAssets/rectangle-20.png" },
];

export const Mockup = (): JSX.Element => {
  return (
    <div className="bg-[#2f2f2f] border-[12px] border-solid border-black w-full min-w-[440px] min-h-[1783px] relative">
      <header className="absolute top-[41px] left-[calc(50.00%_-_194px)] w-[388px] [font-family:'Satoshi-Bold',Helvetica] font-bold text-[#f7f7f7] text-[50px] tracking-[-2.00px] leading-[normal]">
        January 20, 2026
      </header>

      {contentCards.map((card) => (
        <Card
          key={card.id}
          className={`flex flex-col ${card.width} ${card.height} items-start justify-between p-[18px] absolute ${card.position} ${card.bgColor} rounded-[30px] border-0`}
        >
          <CardContent className="p-0 w-full flex flex-col justify-between h-full">
            <div
              className={`h-[17px] mt-[-1.00px] [font-family:'Sora',Helvetica] font-bold ${card.titleColor} text-[10px] tracking-[1.00px] leading-[normal] relative self-stretch`}
            >
              {card.title}
            </div>
            <div
              className={`self-stretch font-bold ${card.contentColor} leading-[26px] [-webkit-line-clamp:4] relative [display:-webkit-box] items-end justify-center [font-family:'Satoshi-Bold',Helvetica] text-2xl tracking-[-0.96px] overflow-hidden text-ellipsis [-webkit-box-orient:vertical]`}
            >
              {card.content}
            </div>
          </CardContent>
        </Card>
      ))}

      {smallCards.map((card) => (
        <Card
          key={card.id}
          className={`${card.width} ${card.height} justify-between flex flex-col items-start p-[18px] absolute ${card.position} ${card.bgColor} rounded-[30px] border-0 ${card.hasImage ? "gap-1.5" : ""}`}
        >
          <CardContent className="p-0 w-full flex flex-col justify-between h-full">
            {card.hasCategory && (
              <img
                className="w-full h-[7.71px] relative self-stretch"
                alt="Category"
                src={card.categorySrc}
              />
            )}
            {card.title && (
              <div
                className={`h-[17px] mt-[-1.00px] [font-family:'Sora',Helvetica] font-bold ${card.titleColor} text-[10px] tracking-[1.00px] ${card.id === "on-this-day" ? "leading-[10px]" : "leading-[normal]"} relative self-stretch`}
              >
                {card.title}
              </div>
            )}
            {card.hasImage && (
              <img
                className="relative self-stretch w-full h-[131px]"
                alt="Rectangle"
                src={card.imageSrc}
              />
            )}
            {card.content && !card.hasImage && (
              <div
                className={`relative [display:-webkit-box] items-end justify-center w-[150px] [font-family:'Satoshi-Bold',Helvetica] ${card.id === "word-of-day" ? "font-normal" : "font-bold"} ${card.contentColor} text-2xl tracking-[-0.96px] leading-[26px] overflow-hidden text-ellipsis ${card.id === "word-of-day" ? "[-webkit-line-clamp:5]" : "[-webkit-line-clamp:4]"} [-webkit-box-orient:vertical]`}
              >
                {card.content}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <Card className="w-[404px] gap-[21px] top-[530px] left-[18px] bg-[#2c62c6] flex flex-col h-[190px] items-start p-[18px] absolute rounded-[30px] border-0">
        <CardContent className="p-0 w-full">
          <div className="h-[17px] mt-[-1.00px] [font-family:'Sora',Helvetica] font-bold text-[#edeaff] text-[10px] tracking-[1.00px] leading-[normal] relative self-stretch">
            GAMES
          </div>
          <div className="inline-flex flex-col items-start gap-2.5 relative flex-[0_0_auto]">
            <div className="flex flex-wrap items-center gap-[9px_9px] self-stretch w-full relative flex-[0_0_auto]">
              {gameBoxes.map((box) => (
                <div
                  key={box.id}
                  className="relative w-[116px] h-[116px] rounded-3xl bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(255,255,255,0)_100%)]"
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="w-[404px] gap-[21px] top-[1142px] left-[18px] bg-[#597c3b] flex flex-col h-[190px] items-start p-[18px] absolute rounded-[30px] border-0">
        <CardContent className="p-0 w-full">
          <div className="h-[17px] mt-[-1.00px] [font-family:'Sora',Helvetica] font-bold text-[#83b05d] text-[10px] tracking-[1.00px] leading-[normal] relative self-stretch">
            IMAGE ESSAY
          </div>
          <div className="inline-flex flex-col items-start gap-2.5 bg-[#597c3b] relative flex-[0_0_auto]">
            <div className="flex flex-wrap items-center gap-[9px_9px] self-stretch w-full relative flex-[0_0_auto]">
              {imageEssayImages.map((image) => (
                <img
                  key={image.id}
                  className="relative w-[116px] h-[116px] rounded-3xl object-cover"
                  alt="Rectangle"
                  src={image.src}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="absolute top-[1385px] left-[calc(50.00%_-_185px)] w-[367px]">
        <h2 className="w-[174px] [font-family:'Sora',Helvetica] font-bold text-white text-[10px] tracking-[1.00px] leading-[normal] mb-6">
          SEEN IT ALL?
        </h2>
        <p className="[font-family:'Satoshi-Regular',Helvetica] font-normal text-white text-base tracking-[0.32px] leading-[normal]">
          Look up. Notice the person across from you, the way light falls
          through the window, the rhythm of wheels on tracks. Each stranger
          carries a universe you&#39;ll never know. Send them a quiet thought.
          Breathe in this shared moment. Sometimes the best connection happens
          when we&#39;re disconnected from everything else.
        </p>
      </section>

      <footer className="absolute top-[1612px] left-0 w-[440px] h-[171px] bg-[#363636] rounded-[30px]">
        <div className="absolute top-[52px] left-[calc(50.00%_-_184px)] w-[258px] [font-family:'Satoshi-Bold',Helvetica] font-bold text-[#565656] text-xl tracking-[-0.80px] leading-[normal]">
          Made by Talia, 2026
          <br />
          via Claude Code
        </div>
      </footer>
    </div>
  );
};
