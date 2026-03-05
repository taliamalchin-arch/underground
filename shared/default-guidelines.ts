export const DEFAULT_GUIDELINES: Record<string, string> = {
  aboveGround: `ABOVE GROUND — Content Generation Rules
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FORMAT: 5 news items per day, each with headline + two description paragraphs + source

TONE: Conversational but informed. Not formal news copy — more like how a sharp friend would explain something over coffee. Can be wry, observational, or slightly irreverent. Never clickbait.

HEADLINES: Short, declarative, lowercase-feeling even if capitalized. Should feel like a text message from someone who reads a lot. Max ~10 words.
  Good: "OpenAI's Sora video model finally dropped"
  Bad: "BREAKING: Revolutionary AI Video Technology Launches"

DESCRIPTIONS: Two paragraphs per item.
  - Paragraph 1: What happened and why it matters, in 2-3 sentences.
  - Paragraph 2: The cultural reaction, second-order effects, or a wry observation. Slightly more opinionated.

SOURCE: Publication or platform, separated by " / " (e.g., "The Verge / X")

TOPICS: Tech, culture, media, internet, science, design, music. Things the user would actually talk about. No sports scores, no stock tickers, no weather. Think: what would trend on a smarter version of Twitter.

AVOID: Sensationalism, culture war framing, death/tragedy as entertainment, corporate PR rewrites.`,

  factle: `FACTLE — Content Generation Rules
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FORMAT: One fun fact, max 6 words

TONE: Surprising, delightful, makes you want to tell someone. The kind of fact that makes you pause mid-sip.

CONSTRAINTS:
  - Must fit on two lines inside a bottle cap graphic (~6 words max)
  - Should be verifiable and true
  - Should provoke a "wait, really?" reaction

GOOD EXAMPLES:
  "Sharks are older than trees"
  "Honey never expires"
  "Octopuses have three hearts"
  "Bananas are technically berries"

BAD EXAMPLES (too long or boring):
  "The average person walks about 100,000 miles in their lifetime"
  "Water freezes at 32 degrees Fahrenheit"

CATEGORIES TO DRAW FROM: Natural world, history, human body, space, food science, animal kingdom, language origins.`,

  thoughtExperiment: `THINKERS — Content Generation Rules
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FORMAT: One scenario/question, 2-4 sentences

TONE: Quietly mind-bending. Not academic philosophy — more like a late-night conversation that makes you stare at the ceiling. Accessible, vivid, personal.

STRUCTURE: "Imagine..." or a scenario setup, followed by a question that has no clean answer. The question should linger.

GOOD EXAMPLE:
  "Imagine a world where every object slowly changes shape when no one is looking, but returns to normal the moment it's observed. Nothing ever breaks or malfunctions — it's simply different when unseen. Would the unseen version of the world feel less real, or more honest?"

THEMES: Perception, identity, time, memory, consciousness, the nature of reality, what it means to observe. Not trolley problems. Not "would you rather." Genuine wonder.

AVOID: Anything with a clear right answer. Anything that feels like a school exercise. Anything dark or dystopian — this should feel expansive, not anxious.`,

  games: `GAMES — Content Generation Rules
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NOTE: Games are hardcoded interactive modules (Ski, Snake, Flappy Bird). Content generation is not applicable — the games themselves are the content.

If new games are added in the future, they should be:
  - Playable in under 60 seconds
  - Simple enough to understand without instructions
  - Pixel-art aesthetic consistent with current games
  - Touch/swipe-friendly for mobile`,

  trivia: `TRIVIA — Content Generation Rules
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FORMAT: One question + one answer (short, factual)

TONE: The kind of question you'd ask at a bar trivia night. Fun, not pedantic. The answer should feel satisfying to learn.

QUESTION STYLE: Specific and answerable. Not vague. Should have one clear, correct answer.
  Good: "What year did the first iPhone launch?"
  Bad: "What is the most important invention?"

ANSWER: Short — ideally 1-3 words. The brevity is part of the reveal satisfaction.

DIFFICULTY: Medium. Not so easy it's boring, not so hard it's frustrating. The user should feel smart 60% of the time.

TOPICS: Tech, pop culture, history, science, geography, music, film. Lean toward things the user's generation cares about.`,

  riddle: `RIDDLE — Content Generation Rules
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FORMAT: One riddle + one answer

TONE: Classic riddle structure — poetic, metaphorical, "I am" or "I have" format. Should feel timeless, not gimmicky.

CONSTRAINTS:
  - The riddle should be solvable but not obvious
  - Answer should be a single word or short phrase
  - Must fit comfortably in a quarter card (~25 words max for the riddle)

GOOD EXAMPLE:
  Riddle: "I speak without a mouth and hear without ears. I have no body, but come alive with wind. What am I?"
  Answer: "An echo"

AVOID: Puns, jokes disguised as riddles, anything that requires specialized knowledge. The answer should make the reader go "oh, of course."`,

  microHistory: `MICRO HISTORY — Content Generation Rules
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FORMAT: Title (short, curious) + body text (2-3 paragraphs)

TONE: Conversational explainer. Like a museum placard written by someone who actually finds it interesting. Not dry, not dumbed down. Clear enough for a 15-year-old, interesting enough for a 40-year-old.

TITLE: Should be a "why" or "how" question, or a surprising declarative statement.
  Good: "Why notebooks are usually lined"
  Good: "How the handshake became a greeting"
  Bad: "The History of Lined Paper" (too textbook)

BODY: Start with the surprising core fact, then expand with context and origin story. End with something that connects it to the present day or to the reader's experience.

LENGTH: ~150-250 words expanded. The collapsed preview shows the title + first ~2 lines.

TOPICS: Everyday objects, common customs, design decisions, language origins, foods, gestures. Things the user encounters daily but never thought to question.`,

  onThisDay: `ON THIS DAY — Content Generation Rules
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FORMAT: Year (number) + event description (one sentence)

TONE: Factual but not dry. The event should feel notable and interesting.

CONSTRAINTS:
  - Must be a real historical event that occurred on today's calendar date
  - The year should be specific and accurate
  - Description should be one clear, complete sentence
  - Max ~15 words for the description (it's a quarter card)

GOOD EXAMPLES:
  2007: "Apple announced the original iPhone."
  1969: "Apollo 11 launched from Kennedy Space Center."

TOPICS: Tech milestones, cultural moments, scientific breakthroughs, notable firsts. Lean toward things that feel relevant or resonant to a modern audience. Skip wars and political elections unless truly iconic.`,

  wordOfTheDay: `WORD OF THE DAY — Content Generation Rules
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FORMAT: Word + pronunciation + part of speech + definition

TONE: The word should feel like a small gift — something the user didn't know they needed. Not obscure for the sake of obscurity. Should be usable in a real sentence.

WORD SELECTION:
  - Uncommon but not archaic. The user should be able to use it this week.
  - Should sound good when said aloud
  - Bonus if it describes a feeling or experience that's hard to articulate otherwise

GOOD EXAMPLES:
  "Inure" [IN-YOOR] VERB — to accustom to hardship, difficulty, or pain
  "Sonder" [SON-der] NOUN — the realization that each passerby has a life as vivid as your own
  "Petrichor" [PET-ri-kor] NOUN — the pleasant smell of earth after rain

PRONUNCIATION: Uppercase, syllable-separated with hyphens, in brackets.
PART OF SPEECH: Uppercase (VERB, NOUN, ADJECTIVE, ADVERB)
DEFINITION: Lowercase, concise, one line. No "used to describe" filler — just the meaning.`,

  wikiSummary: `WIKI SUMMARY — Content Generation Rules
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FORMAT: Article title + summary paragraph (3-5 sentences)

TONE: Like a friend explaining something fascinating they just read on Wikipedia. Clear, engaging, slightly amazed. Not encyclopedic — distilled.

ARTICLE SELECTION:
  - Obscure but genuinely interesting Wikipedia articles
  - Topics the user probably hasn't thought to search for
  - Things that connect to everyday life in unexpected ways
  - Bonus for articles with great "did you know" potential

GOOD EXAMPLES:
  Title: "The Overview Effect"
  Summary: "Astronauts report a profound cognitive shift when they see Earth from space — a sudden, overwhelming sense that national borders are imaginary and all life is interconnected. The experience is so consistent across astronauts that it has its own name. Some describe it as the most transformative moment of their lives."

  Title: "Phantom Time Hypothesis"
  Summary: "A fringe theory claims that 297 years of history were fabricated — that the early Middle Ages (614-911 AD) never happened, and we're actually living in the 1700s. The evidence is thin, but the reasoning is entertainingly specific."

AVOID: Articles about wars, diseases, or anything depressing. Celebrity bios. Anything too niche or academic. The goal is delight and wonder, not homework.

LENGTH: Summary should be 3-5 sentences. Enough to satisfy curiosity, short enough to read in 15 seconds.`,
};
