import { storage } from "./storage";
import type {
  AboveGroundContent,
  FactleContent,
  ThoughtExperimentContent,
  TriviaContent,
  RiddleContent,
  MicroHistoryContent,
  OnThisDayContent,
  WordOfTheDayContent,
  WikiSummaryContent,
  ModuleType,
} from "@shared/schema";

// ── Suggestion Pools ──
// Each module has a general pool + date-specific overrides (keyed by "MM-DD").
// The `index` param cycles through available options.

const ABOVE_GROUND_POOL: AboveGroundContent[] = [
  {
    items: [
      { headline: "Apple's Vision Pro reviews are in, and they're complicated", description: "Critics praised the hardware as genuinely impressive — the passthrough is the best anyone's shipped, and the eye-tracking interface works. But the weight, the isolation, and the $3,500 price tag raised real questions about who this is actually for.", source: "The Verge / WSJ" },
      { headline: "Threads is quietly becoming the place people actually post", description: "After a chaotic launch and rapid decline, Meta's Twitter alternative has slowly built a real user base. The vibe is less combative, more casual — closer to early Instagram than late Twitter.", source: "Meta / The Atlantic" },
      { headline: "The internet is obsessed with a bear vs. man hypothetical", description: "A TikTok trend asking women whether they'd rather encounter a bear or a man alone in the woods went viral and sparked genuine, uncomfortable conversation about safety and trust.", source: "TikTok / X" },
      { headline: "Spotify wrapped its podcast bet into a $100M write-off", description: "After spending hundreds of millions on exclusive podcast deals, Spotify quietly reversed course. Most exclusives are now available everywhere. The Joe Rogan deal remains the exception.", source: "Spotify / Bloomberg" },
      { headline: "A 17-year-old built an AI that detects Parkinson's from voice", description: "Using a dataset of voice recordings and a custom neural network, a high school student created a diagnostic tool with 95% accuracy. The research was published in a peer-reviewed journal.", source: "Nature / MIT Tech Review" },
    ],
  },
  {
    items: [
      { headline: "Google's AI Overview is confidently wrong about everything", description: "The feature that puts AI-generated answers at the top of search results has been telling people to eat rocks, put glue on pizza, and that no country in Africa starts with K. Google says it's working on it.", source: "Google / X" },
      { headline: "The last Blockbuster is thriving as a tourist destination", description: "The Bend, Oregon location has leaned fully into nostalgia. It hosts movie nights, sells merch, and has an Airbnb listing. Revenue is up. The irony is not lost on anyone.", source: "CNN / Atlas Obscura" },
      { headline: "Dune Part Two might be the best blockbuster in a decade", description: "Villeneuve delivered a sequel that's somehow both more accessible and more ambitious. The sandworm riding scene alone is worth the IMAX ticket. Critics and audiences actually agree on this one.", source: "Variety / Letterboxd" },
      { headline: "NYC is banning TikTok and Instagram in public schools", description: "The city classified social media platforms as environmental hazards for children, joining a growing list of school districts taking a hard line. Students are predictably finding workarounds.", source: "NY Times / The Cut" },
      { headline: "The ocean's deepest fish was just filmed for the first time", description: "A snailfish was recorded at 8,336 meters in the Izu-Ogasawara Trench near Japan. It looks exactly how you'd expect something that lives under 8km of water to look: translucent and unbothered.", source: "Nature / BBC" },
    ],
  },
  {
    items: [
      { headline: "Notion just acquired a calendar app and nobody's mad", description: "The productivity tool bought Cron and integrated it into a unified workspace. Users are cautiously optimistic — it actually makes their workflow simpler, which is rare for an acquisition.", source: "Notion / TechCrunch" },
      { headline: "A photographer proved AI art judges can't tell the difference", description: "Boris Eldagsen won a Sony World Photography Award with an AI-generated image, then refused the prize to spark debate. The judges admitted they hadn't considered the possibility.", source: "The Guardian / PetaPixel" },
      { headline: "Japan's population dropped by 800,000 in a single year", description: "The demographic crisis is accelerating faster than projections. Entire towns are offering free houses to attract residents. Economists are calling it a preview of what's coming for most developed nations.", source: "NHK / The Economist" },
      { headline: "Beyoncé went country and the genre is having an identity crisis", description: "Cowboy Carter debuted at #1 on the Billboard Country chart, making her the first Black woman to do so. The conversation about who country music 'belongs to' got very loud, very fast.", source: "Billboard / Rolling Stone" },
      { headline: "The floppy disk icon for 'save' is finally being retired", description: "Major software companies are replacing the 30-year-old icon with alternatives — a cloud, a checkmark, or nothing at all. An entire generation of users never knew what the icon represented anyway.", source: "UX Collective / Ars Technica" },
    ],
  },
];

const FACTLE_POOL: FactleContent[] = [
  { fact: "Sharks are older than trees" },
  { fact: "Honey never expires" },
  { fact: "Octopuses have three hearts" },
  { fact: "Bananas are technically berries" },
  { fact: "Venus spins backwards" },
  { fact: "Oxford predates the Aztecs" },
  { fact: "Cleopatra lived closer to pizza than pyramids" },
  { fact: "Wombat poop is cube-shaped" },
  { fact: "A day on Venus outlasts its year" },
  { fact: "Glaciers move faster than sloths" },
  { fact: "Lobsters taste with their feet" },
  { fact: "Scotland's unicorn is its national animal" },
];

const THOUGHT_EXPERIMENT_POOL: ThoughtExperimentContent[] = [
  { text: "Imagine a world where every object slowly changes shape when no one is looking, but returns to normal the moment it's observed. Nothing ever breaks or malfunctions — it's simply different when unseen. Would the unseen version of the world feel less real, or more honest?" },
  { text: "What if you could hear the internal monologue of every person within ten feet of you, but only when they were thinking about you? You'd never know what they thought about anything else — just the unfiltered, momentary impression you made. Would you change how you move through crowds?" },
  { text: "Suppose every choice you didn't make created a parallel version of you who did. Not a universe — just a person, living somewhere, making the opposite calls. If you could meet one of them, which decision would you want to see the other side of?" },
  { text: "Imagine waking up tomorrow and discovering that everyone in the world had forgotten one specific thing about you — the same thing. You don't know what it is. You only notice it in the way people treat you slightly differently. Would you try to find out what was erased, or would you let the new version of yourself exist?" },
  { text: "What if you could pause time for everyone except yourself, but every time you did, you aged the equivalent of the paused duration? You'd gain hours of solitude at the cost of your own lifespan. How much stillness is worth growing older for?" },
  { text: "Imagine a library that contains every book that will ever be written, including your own biography — but the last chapter is blank until you live it. You can read anyone else's ending. Would you? And would it change how you write yours?" },
];

const TRIVIA_POOL: TriviaContent[] = [
  { question: "What year did the first iPhone launch?", answer: "2007" },
  { question: "What is the only planet that spins clockwise?", answer: "Venus" },
  { question: "How many bones does a shark have?", answer: "Zero" },
  { question: "What was Google's original name?", answer: "Backrub" },
  { question: "Which element makes up most of the sun?", answer: "Hydrogen" },
  { question: "What country has the most time zones?", answer: "France" },
  { question: "How many hearts does an octopus have?", answer: "Three" },
  { question: "What was the first toy advertised on TV?", answer: "Mr. Potato Head" },
  { question: "Which planet has the shortest day?", answer: "Jupiter" },
  { question: "What year was Wikipedia launched?", answer: "2001" },
  { question: "What is the rarest M&M color?", answer: "Brown" },
  { question: "How many languages is the Bible translated into?", answer: "Over 700" },
];

const RIDDLE_POOL: RiddleContent[] = [
  { riddle: "I speak without a mouth and hear without ears. I have no body, but come alive with wind. What am I?", answer: "An echo" },
  { riddle: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?", answer: "A map" },
  { riddle: "The more you take, the more you leave behind. What am I?", answer: "Footsteps" },
  { riddle: "I can be cracked, made, told, and played. What am I?", answer: "A joke" },
  { riddle: "I have keys but open no locks. I have space but no room. You can enter but can't go inside. What am I?", answer: "A keyboard" },
  { riddle: "I follow you everywhere but can't be caught. I disappear in darkness but return with light. What am I?", answer: "A shadow" },
  { riddle: "I have a head, a tail, but no body. What am I?", answer: "A coin" },
  { riddle: "I get shorter every time I'm used. I'm born tall and die small. What am I?", answer: "A candle" },
  { riddle: "I can travel around the world while staying in a corner. What am I?", answer: "A stamp" },
  { riddle: "I'm not alive, but I grow. I don't have lungs, but I need air. What am I?", answer: "Fire" },
];

const MICRO_HISTORY_POOL: MicroHistoryContent[] = [
  { title: "Why notebooks are usually lined", content: "Early mass-produced paper varied in quality, and lines helped guide handwriting when ink bled easily. The ruled lines became standard not just for aesthetics, but as a practical solution to inconsistent paper thickness and texture. Before mass production, paper was handmade and varied greatly in quality. Writers needed guides to keep their text straight and legible, especially when using fountain pens that could bleed or feather on lower-quality paper." },
  { title: "How the handshake became a greeting", content: "The handshake likely originated as a gesture of peace — extending an open right hand proved you weren't holding a weapon. Ancient Greek funerary art from the 5th century BC shows soldiers clasping hands, and the gesture appears across cultures as a way to demonstrate trust between strangers. The specific pump motion may have developed as a way to dislodge hidden daggers from sleeves. By the Middle Ages, it had evolved from a safety check into a social contract." },
  { title: "Why clocks run clockwise", content: "Before mechanical clocks existed, people in the Northern Hemisphere told time with sundials. As the sun moves across the sky from east to west, a sundial's shadow moves in the direction we now call clockwise. When the first mechanical clocks were built in medieval Europe, clockmakers simply mimicked the motion people were already familiar with from sundials. If clocks had been invented in the Southern Hemisphere, where sundial shadows move the other way, 'clockwise' would mean the opposite direction." },
  { title: "Why we say 'bless you' after a sneeze", content: "The most widely cited origin traces to Pope Gregory I during the bubonic plague of 590 AD, when sneezing was thought to be an early symptom of the disease. Saying 'God bless you' was a quick prayer for the sneezer's survival. But the practice is older than that — Romans said 'Jupiter preserve you,' and ancient Greeks considered sneezes prophetic. The superstition that a sneeze expelled the soul, leaving the body momentarily vulnerable to evil spirits, appears across dozens of unrelated cultures." },
  { title: "Why piano keys are black and white", content: "The original keyboard layout was actually reversed — natural notes were black and sharps/flats were white. This was because the dark hardwood used for the natural keys (typically ebony) was expensive, while bone or ivory was cheaper for the smaller accidentals. When piano manufacturing scaled up in the 18th century, the economics flipped. Light-colored keys became the main surface because they were cheaper to produce in large quantities, and the dark keys became the accidentals. The musical logic didn't change — just the materials." },
  { title: "Why ambulances have backwards text", content: "The word 'AMBULANCE' is written in reverse on the front of the vehicle so it reads correctly in a rearview mirror. When a driver ahead sees the mirrored text reflected, it appears normal, immediately communicating urgency. The practice started in the 1960s as traffic density increased and response times became critical. It's a remarkably simple piece of design — no technology required, just an understanding of how the person receiving the message would see it." },
];

const WORD_POOL: WordOfTheDayContent[] = [
  { word: "Inure", pronunciation: "IN-YOOR", partOfSpeech: "VERB", definition: "to accustom to hardship, difficulty, or pain" },
  { word: "Sonder", pronunciation: "SON-der", partOfSpeech: "NOUN", definition: "the realization that each passerby has a life as vivid as your own" },
  { word: "Petrichor", pronunciation: "PET-ri-kor", partOfSpeech: "NOUN", definition: "the pleasant, earthy smell after rain" },
  { word: "Limerence", pronunciation: "LIM-er-ens", partOfSpeech: "NOUN", definition: "the state of being involuntarily obsessed with another person" },
  { word: "Apricity", pronunciation: "ah-PRIS-ih-tee", partOfSpeech: "NOUN", definition: "the warmth of the sun in winter" },
  { word: "Vellichor", pronunciation: "VEL-ih-kor", partOfSpeech: "NOUN", definition: "the strange wistfulness of used bookstores" },
  { word: "Eunoia", pronunciation: "yoo-NOY-ah", partOfSpeech: "NOUN", definition: "beautiful thinking; a well-disposed mind" },
  { word: "Ineffable", pronunciation: "in-EFF-uh-bul", partOfSpeech: "ADJECTIVE", definition: "too great or extreme to be expressed in words" },
  { word: "Fernweh", pronunciation: "FERN-vay", partOfSpeech: "NOUN", definition: "an ache for distant places; the craving for travel" },
  { word: "Hiraeth", pronunciation: "HEER-eyeth", partOfSpeech: "NOUN", definition: "a deep longing for a home you can't return to, or that never was" },
  { word: "Phosphene", pronunciation: "FOS-feen", partOfSpeech: "NOUN", definition: "the light you see when you press on your closed eyes" },
  { word: "Saudade", pronunciation: "sow-DAH-djee", partOfSpeech: "NOUN", definition: "a melancholic longing for something or someone absent" },
];

const WIKI_SUMMARY_POOL: WikiSummaryContent[] = [
  { articleTitle: "The Overview Effect", summary: "Astronauts report a profound cognitive shift when they see Earth from space — a sudden, overwhelming sense that national borders are imaginary and all life is interconnected. The experience is so consistent across astronauts that it has its own name. Some describe it as the most transformative moment of their lives." },
  { articleTitle: "Phantom Time Hypothesis", summary: "A fringe theory claims that 297 years of history were fabricated — that the early Middle Ages (614-911 AD) never happened, and we're actually living in the 1700s. The evidence is thin, but the reasoning is entertainingly specific about forged documents and calendar errors." },
  { articleTitle: "The Great Emu War", summary: "In 1932, Australia deployed soldiers with Lewis guns to cull 20,000 emus destroying crops in Western Australia. The emus won. They scattered into small groups, outran the soldiers, and shrugged off bullets with surprising resilience. The military withdrew after a month." },
  { articleTitle: "Tarrare", summary: "An 18th-century French showman who could eat enormous quantities of food — entire baskets of apples, live cats, and allegedly a whole eel without chewing. Doctors studied him extensively. His appetite was never explained, and his autopsy revealed organs of unusual size." },
  { articleTitle: "The Wow! Signal", summary: "In 1977, a radio telescope in Ohio detected a 72-second signal from deep space that was 30 times louder than background noise. Astronomer Jerry Ehman circled it on the printout and wrote 'Wow!' It has never been detected again, and no natural explanation fully accounts for it." },
  { articleTitle: "Erdős Number", summary: "Mathematician Paul Erdős published more papers than anyone in history — over 1,500 with 511 collaborators. The math community invented the 'Erdős number' to measure collaborative distance from him. Erdős himself is 0, his direct coauthors are 1, their coauthors are 2, and so on. It's basically Six Degrees of Kevin Bacon for mathematicians." },
  { articleTitle: "Desire Paths", summary: "The unofficial trails worn into grass by pedestrians who ignore the designed walkways. Urban planners and architects study them as evidence of how people actually want to move through spaces versus how designers think they should. Some universities now wait for desire paths to form before paving sidewalks." },
  { articleTitle: "The Infinite Monkey Theorem", summary: "Given enough time, a monkey pressing random keys on a typewriter will almost surely type any given text, including Shakespeare. In 2003, researchers gave real monkeys a keyboard. They mostly pressed S, produced five pages of text, and attacked the keyboard with a stone." },
  { articleTitle: "Ship of Theseus", summary: "If you replace every plank of a wooden ship one by one, is the final ship still the same ship? And if you build a second ship from all the removed planks, which one is the original? The thought experiment has been debated for 2,500 years and has no consensus answer." },
  { articleTitle: "Linguistic Relativity", summary: "The idea that the language you speak shapes how you think and perceive reality. The Hopi language has no past or future tense. Russian speakers distinguish light and dark blue as separate colors and can identify shades faster than English speakers. The debate continues over how deep the effect goes." },
];

// ── On This Day — keyed by "MM-DD" ──
// Real historical events. Falls back to general pool if no date match.

const ON_THIS_DAY_BY_DATE: Record<string, OnThisDayContent[]> = {
  "01-01": [
    { year: 1983, event: "The internet officially switched to TCP/IP." },
    { year: 1959, event: "Fidel Castro overthrew the Cuban government." },
  ],
  "01-09": [
    { year: 2007, event: "Steve Jobs unveiled the original iPhone." },
  ],
  "01-27": [
    { year: 1926, event: "John Logie Baird demonstrated television for the first time." },
  ],
  "02-04": [
    { year: 2004, event: "Mark Zuckerberg launched Facebook from his Harvard dorm." },
  ],
  "02-14": [
    { year: 1876, event: "Alexander Graham Bell filed his telephone patent." },
    { year: 1990, event: "Voyager 1 took the 'Pale Blue Dot' photo of Earth." },
  ],
  "02-24": [
    { year: 1920, event: "The Nazi Party was founded in Munich." },
    { year: 2022, event: "Russia launched a full-scale invasion of Ukraine." },
  ],
  "03-12": [
    { year: 1989, event: "Tim Berners-Lee proposed the World Wide Web." },
  ],
  "03-14": [
    { year: 1879, event: "Albert Einstein was born in Ulm, Germany." },
  ],
  "04-01": [
    { year: 1976, event: "Steve Wozniak and Steve Jobs founded Apple Computer." },
  ],
  "04-12": [
    { year: 1961, event: "Yuri Gagarin became the first human in space." },
  ],
  "04-15": [
    { year: 1912, event: "The Titanic sank after hitting an iceberg." },
  ],
  "05-01": [
    { year: 2011, event: "Osama bin Laden was killed in Abbottabad, Pakistan." },
  ],
  "06-28": [
    { year: 2007, event: "The original iPhone went on sale in the US." },
  ],
  "06-29": [
    { year: 2007, event: "Apple released the first iPhone to the public." },
  ],
  "07-04": [
    { year: 1776, event: "The United States declared independence from Britain." },
  ],
  "07-20": [
    { year: 1969, event: "Neil Armstrong and Buzz Aldrin walked on the moon." },
  ],
  "08-06": [
    { year: 1991, event: "The first website went live at CERN." },
  ],
  "09-01": [
    { year: 1985, event: "The wreck of the Titanic was found on the ocean floor." },
  ],
  "10-29": [
    { year: 1969, event: "The first message was sent over ARPANET (the proto-internet)." },
  ],
  "10-31": [
    { year: 1517, event: "Martin Luther nailed the 95 Theses to the church door." },
  ],
  "11-09": [
    { year: 1989, event: "The Berlin Wall fell." },
  ],
  "12-17": [
    { year: 1903, event: "The Wright brothers made the first powered flight." },
  ],
  "12-25": [
    { year: 1990, event: "Tim Berners-Lee made the first successful HTTP communication." },
  ],
};

const ON_THIS_DAY_GENERAL: OnThisDayContent[] = [
  { year: 2007, event: "Apple announced the original iPhone." },
  { year: 1969, event: "Apollo 11 launched from Kennedy Space Center." },
  { year: 1989, event: "Tim Berners-Lee proposed the World Wide Web." },
  { year: 2004, event: "Facebook launched from a Harvard dorm room." },
  { year: 1961, event: "Yuri Gagarin became the first human in space." },
  { year: 1903, event: "The Wright brothers achieved powered flight." },
  { year: 1991, event: "The first website went live at CERN." },
  { year: 2001, event: "Wikipedia went online for the first time." },
];

// ── Date-specific overrides for holidays ──

const HOLIDAY_ABOVE_GROUND: Record<string, AboveGroundContent> = {
  "02-14": {
    items: [
      { headline: "The economics of Valentine's Day are staggering", description: "Americans spend roughly $26 billion on Valentine's Day annually — more than the GDP of some countries. The holiday industrial complex includes 145 million greeting cards, 58 million pounds of chocolate, and enough roses to circle the equator.", source: "NRF / Bloomberg" },
      { headline: "Dating apps are leaning hard into AI matchmaking", description: "Hinge, Bumble, and Tinder all shipped AI features this year. The pitch: algorithms that learn your type better than you know it yourself. Early data suggests people are swiping less but matching more meaningfully.", source: "Wired / The Verge" },
      { headline: "Japan's 'anti-Valentine's Day' movement is growing", description: "A counter-movement in Japan pushes back against obligatory gift-giving culture. Workers are opting out of 'giri-choco' (obligation chocolate) for colleagues, and social media is full of solo celebration posts.", source: "NHK / The Japan Times" },
      { headline: "The real St. Valentine was probably three different people", description: "Historians have identified at least three early Christian martyrs named Valentine. The romantic association didn't appear until Chaucer wrote about it in the 14th century. Before that, it was just another feast day.", source: "Smithsonian / History.com" },
      { headline: "Galentine's Day is now bigger than Valentine's Day for Gen Z", description: "Parks and Recreation's fictional holiday has become a real commercial force. Friend-group celebrations outpace romantic ones among 18-25 year olds, and brands are adjusting their marketing accordingly.", source: "Vox / Business Insider" },
    ],
  },
  "10-31": {
    items: [
      { headline: "The most popular Halloween costume this year is AI-generated", description: "People are using image generators to design costumes, then 3D-printing or crafting them by hand. The meta-costume — dressing as an AI-generated image, glitches and all — is its own genre.", source: "TikTok / WIRED" },
      { headline: "Horror movies are having their best box office year ever", description: "The genre has evolved far beyond jump scares. Elevated horror, A24-style psychological dread, and legacy sequels are all pulling massive audiences. Horror is now the most reliable theatrical draw.", source: "Box Office Mojo / Variety" },
      { headline: "The world's largest pumpkin weighs more than a car", description: "The current record holder, grown in Italy, weighs 2,702 pounds. Competitive pumpkin growing is a real subculture with its own seed trading economy, growth strategies, and bitter rivalries.", source: "Guinness / AP" },
      { headline: "Trick-or-treating is getting later — and adults are doing it", description: "The average trick-or-treating time has shifted from 5-7pm to 6-9pm over the past decade. Adult trick-or-treating, once a joke, is now a real trend in several cities.", source: "TODAY / Axios" },
      { headline: "The scariest thing on the internet this Halloween is deepfakes", description: "AI-generated videos of public figures saying things they never said have become indistinguishable from real footage. The technology has outpaced detection tools, and nobody has a good solution yet.", source: "MIT Tech Review / X" },
    ],
  },
};

const HOLIDAY_FACTLE: Record<string, FactleContent> = {
  "02-14": { fact: "Heart candy was invented in 1866" },
  "10-31": { fact: "Pumpkins are 90% water" },
  "12-25": { fact: "Rudolph was a marketing stunt" },
  "07-04": { fact: "Three presidents died on July 4th" },
};

const HOLIDAY_THOUGHT: Record<string, ThoughtExperimentContent> = {
  "02-14": { text: "Imagine if every person you've ever loved — however briefly, however messily — could feel the exact moment you thought of them. Not a message, not a call. Just a quiet awareness, like sunlight shifting in a room. Would knowing that change who you let yourself think about?" },
  "10-31": { text: "What if the masks we wear on Halloween briefly became our real faces, and our real faces became the masks? For one night, the version of yourself you chose to be was the one everyone recognized. Would you pick something closer to who you really are, or as far from it as possible?" },
};

// ── Suggestion Engine ──

function getDateKey(date: string): string {
  // "YYYY-MM-DD" -> "MM-DD"
  return date.slice(5);
}

function hashDate(date: string): number {
  // Simple hash to deterministically select from pool based on date
  let h = 0;
  for (let i = 0; i < date.length; i++) {
    h = ((h << 5) - h + date.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function pickFromPool<T>(pool: T[], date: string, index: number): T {
  const base = hashDate(date) % pool.length;
  return pool[(base + index) % pool.length];
}

export async function getSuggestion(
  moduleKey: ModuleType | string,
  date: string,
  index: number = 0
): Promise<any> {
  const dateKey = getDateKey(date);

  switch (moduleKey) {
    case "aboveGround": {
      const holiday = HOLIDAY_ABOVE_GROUND[dateKey];
      if (holiday && index === 0) return holiday;
      const effectiveIndex = holiday ? index - 1 : index;
      return pickFromPool(ABOVE_GROUND_POOL, date, effectiveIndex);
    }

    case "factle": {
      const holiday = HOLIDAY_FACTLE[dateKey];
      if (holiday && index === 0) return holiday;
      const effectiveIndex = holiday ? index - 1 : index;
      return pickFromPool(FACTLE_POOL, date, effectiveIndex);
    }

    case "thoughtExperiment": {
      const holiday = HOLIDAY_THOUGHT[dateKey];
      if (holiday && index === 0) return holiday;
      const effectiveIndex = holiday ? index - 1 : index;
      return pickFromPool(THOUGHT_EXPERIMENT_POOL, date, effectiveIndex);
    }

    case "trivia":
      return pickFromPool(TRIVIA_POOL, date, index);

    case "riddle":
      return pickFromPool(RIDDLE_POOL, date, index);

    case "microHistory":
      return pickFromPool(MICRO_HISTORY_POOL, date, index);

    case "onThisDay": {
      const dateSpecific = ON_THIS_DAY_BY_DATE[dateKey];
      if (dateSpecific && index < dateSpecific.length) {
        return dateSpecific[index];
      }
      const effectiveIndex = dateSpecific ? index - dateSpecific.length : index;
      return pickFromPool(ON_THIS_DAY_GENERAL, date, effectiveIndex);
    }

    case "wordOfTheDay":
      return pickFromPool(WORD_POOL, date, index);

    case "wikiSummary":
      return pickFromPool(WIKI_SUMMARY_POOL, date, index);

    case "games":
      return { games: [{ name: "Ski", description: "" }, { name: "Snake", description: "" }, { name: "Flappy Bird", description: "" }] };

    default:
      return null;
  }
}

export function getPoolSize(moduleKey: string, date: string): number {
  const dateKey = getDateKey(date);
  switch (moduleKey) {
    case "aboveGround": return ABOVE_GROUND_POOL.length + (HOLIDAY_ABOVE_GROUND[dateKey] ? 1 : 0);
    case "factle": return FACTLE_POOL.length + (HOLIDAY_FACTLE[dateKey] ? 1 : 0);
    case "thoughtExperiment": return THOUGHT_EXPERIMENT_POOL.length + (HOLIDAY_THOUGHT[dateKey] ? 1 : 0);
    case "trivia": return TRIVIA_POOL.length;
    case "riddle": return RIDDLE_POOL.length;
    case "microHistory": return MICRO_HISTORY_POOL.length;
    case "onThisDay": return ON_THIS_DAY_GENERAL.length + (ON_THIS_DAY_BY_DATE[dateKey]?.length || 0);
    case "wordOfTheDay": return WORD_POOL.length;
    case "wikiSummary": return WIKI_SUMMARY_POOL.length;
    default: return 0;
  }
}
