import Anthropic from "@anthropic-ai/sdk";
import { storage } from "./storage";
import { getSuggestion as getStaticSuggestion } from "./suggestions";
import { DEFAULT_GUIDELINES } from "../shared/default-guidelines";
import type { ModuleType } from "@shared/schema";

// ── Session Cache ──
// Key: `${moduleKey}::${date}`, Value: array of generated suggestions
// When user clicks "Reroll", we check if index < cache.length and return
// the cached value; otherwise we generate a new one via Claude.

const suggestionCache = new Map<string, any[]>();

function getCacheKey(moduleKey: string, date: string): string {
  return `${moduleKey}::${date}`;
}

/** Clear cached suggestions for a module when its references/rules change */
export function invalidateModuleCache(moduleKey: string): void {
  for (const key of suggestionCache.keys()) {
    if (key.startsWith(`${moduleKey}::`)) {
      suggestionCache.delete(key);
    }
  }
}

// ── Anthropic Client ──

let client: Anthropic | null = null;
function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

// ── Output format instructions per module ──

function getOutputFormat(moduleKey: ModuleType, date: string): string {
  switch (moduleKey) {
    case "aboveGround":
      return `Return a JSON object: { "items": [{ "headline": "...", "description": "...", "source": "..." }, ...] } with exactly 5 items. Each headline should be max ~10 words. Each description should be 2-3 sentences. Source format: "Publication / Platform".`;
    case "factle":
      return `Return a JSON object: { "fact": "..." } — the fact must be max 6 words. It must be verifiable and true.`;
    case "thoughtExperiment":
      return `Return a JSON object: { "text": "..." } — 2-4 sentences, a mind-bending scenario with a lingering question.`;
    case "trivia":
      return `Return a JSON object: { "question": "...", "answer": "..." } — the answer should be 1-3 words.`;
    case "riddle":
      return `Return a JSON object: { "riddle": "...", "answer": "..." } — the answer should be a single word or short phrase.`;
    case "microHistory":
      return `Return a JSON object: { "title": "...", "content": "..." } — title is a curious "why/how" question, content is 150-250 words.`;
    case "onThisDay":
      return `Return a JSON object: { "year": <number>, "event": "..." } — a real historical event that happened on the calendar date ${date.slice(5)} (MM-DD). The year must be a number, not a string. The event should be one sentence, max 15 words.`;
    case "wordOfTheDay":
      return `Return a JSON object: { "word": "...", "pronunciation": "...", "partOfSpeech": "...", "definition": "..." } — pronunciation in UPPERCASE syllable format (e.g. "PET-ri-kor"), partOfSpeech in UPPERCASE (e.g. "NOUN").`;
    case "wikiSummary":
      return `Return a JSON object: { "articleTitle": "...", "summary": "..." } — an obscure but fascinating topic, summary 3-5 sentences.`;
    default:
      return `Return a JSON object matching the module schema.`;
  }
}

// ── Prompt Assembly ──

async function buildPrompt(
  moduleKey: ModuleType,
  date: string,
  alreadyGenerated: any[]
): Promise<string> {
  // 1. Get rules and reference URLs from DB
  const ref = await storage.getModuleReference(moduleKey);
  const rules = ref?.rules || DEFAULT_GUIDELINES[moduleKey] || "";
  const urls = ref?.urls || [];

  // 2. Get committed content history for this module (last 20 entries)
  const allContent = await storage.getAllDailyContent();
  const committedExamples = allContent
    .filter((c) => c.modules[moduleKey as keyof typeof c.modules])
    .slice(-20)
    .map((c) => ({
      date: c.date,
      content: c.modules[moduleKey as keyof typeof c.modules],
    }));

  // 3. Assemble prompt
  const parts: string[] = [];

  parts.push(`You are a content generator for a daily content app called Underground.`);
  parts.push(`Today's date: ${date}`);
  parts.push(`Module: ${moduleKey}`);
  parts.push(``);

  parts.push(`=== CONTENT RULES ===`);
  parts.push(rules);
  parts.push(``);

  if (urls.length > 0) {
    parts.push(`=== REFERENCE SOURCES ===`);
    parts.push(`Use these as thematic and topical inspiration for the content you generate:`);
    urls.forEach((u) => {
      parts.push(`- ${u.url}${u.label ? ` (${u.label})` : ""}`);
    });
    parts.push(``);
  }

  if (committedExamples.length > 0) {
    parts.push(`=== PREVIOUSLY COMMITTED CONTENT (learn from the style, tone, and topics — do NOT repeat any of these) ===`);
    committedExamples.forEach((ex) => {
      parts.push(`[${ex.date}]: ${JSON.stringify(ex.content)}`);
    });
    parts.push(``);
  }

  if (alreadyGenerated.length > 0) {
    parts.push(`=== ALREADY SUGGESTED THIS SESSION (do NOT repeat any of these) ===`);
    alreadyGenerated.forEach((s, i) => {
      parts.push(`[${i}]: ${JSON.stringify(s)}`);
    });
    parts.push(``);
  }

  parts.push(`=== OUTPUT FORMAT ===`);
  parts.push(getOutputFormat(moduleKey, date));
  parts.push(``);
  parts.push(`Respond ONLY with valid JSON matching the format above. No markdown code fences, no explanation, no wrapping.`);

  return parts.join("\n");
}

// ── Response Parser ──

function parseResponse(text: string): any {
  let cleaned = text.trim();
  // Strip markdown code fences if present
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  }
  return JSON.parse(cleaned);
}

// ── Main Export ──

export async function getAISuggestion(
  moduleKey: string,
  date: string,
  index: number
): Promise<{ suggestion: any; isAI: boolean }> {
  // Games are always static
  if (moduleKey === "games") {
    const suggestion = await getStaticSuggestion(moduleKey, date, index);
    return { suggestion, isAI: false };
  }

  const anthropic = getClient();

  // Fallback to static if no API key
  if (!anthropic) {
    const suggestion = await getStaticSuggestion(moduleKey, date, index);
    return { suggestion, isAI: false };
  }

  // Check cache first
  const cacheKey = getCacheKey(moduleKey, date);
  const cached = suggestionCache.get(cacheKey) || [];
  if (index < cached.length) {
    return { suggestion: cached[index], isAI: true };
  }

  // Generate fresh via Claude
  const prompt = await buildPrompt(moduleKey as ModuleType, date, cached);

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const suggestion = parseResponse(text);

  // Cache the result
  cached.push(suggestion);
  suggestionCache.set(cacheKey, cached);

  return { suggestion, isAI: true };
}
