import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb } from "drizzle-orm/pg-core";
import { z } from "zod";

// Module types for the content planner
export const MODULE_TYPES = [
  "aboveGround",
  "factle",
  "thoughtExperiment",
  "games",
  "trivia",
  "riddle",
  "microHistory",
  "onThisDay",
  "wordOfTheDay",
  "wikiSummary",
] as const;

export type ModuleType = typeof MODULE_TYPES[number];

// Content schemas for each module type
export const aboveGroundContentSchema = z.object({
  items: z.array(z.object({
    headline: z.string(),
    description: z.string(),
    source: z.string(),
  })),
});

export const factleContentSchema = z.object({
  fact: z.string(),
});

export const thoughtExperimentContentSchema = z.object({
  text: z.string(),
});

export const gamesContentSchema = z.object({
  games: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
  })),
});

export const microHistoryContentSchema = z.object({
  title: z.string(),
  content: z.string(),
});

export const onThisDayContentSchema = z.object({
  year: z.number(),
  event: z.string(),
});

export const wordOfTheDayContentSchema = z.object({
  word: z.string(),
  pronunciation: z.string(),
  partOfSpeech: z.string(),
  definition: z.string(),
});

export const triviaContentSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

export const riddleContentSchema = z.object({
  riddle: z.string(),
  answer: z.string(),
});

export const wikiSummaryContentSchema = z.object({
  articleTitle: z.string(),
  summary: z.string(),
});

export const moduleContentSchema = z.union([
  aboveGroundContentSchema,
  factleContentSchema,
  thoughtExperimentContentSchema,
  gamesContentSchema,
  triviaContentSchema,
  riddleContentSchema,
  microHistoryContentSchema,
  onThisDayContentSchema,
  wordOfTheDayContentSchema,
  wikiSummaryContentSchema,
]);

export type ModuleContent = z.infer<typeof moduleContentSchema>;
export type AboveGroundContent = z.infer<typeof aboveGroundContentSchema>;
export type FactleContent = z.infer<typeof factleContentSchema>;
export type ThoughtExperimentContent = z.infer<typeof thoughtExperimentContentSchema>;
export type GamesContent = z.infer<typeof gamesContentSchema>;
export type MicroHistoryContent = z.infer<typeof microHistoryContentSchema>;
export type OnThisDayContent = z.infer<typeof onThisDayContentSchema>;
export type WordOfTheDayContent = z.infer<typeof wordOfTheDayContentSchema>;
export type TriviaContent = z.infer<typeof triviaContentSchema>;
export type RiddleContent = z.infer<typeof riddleContentSchema>;
export type WikiSummaryContent = z.infer<typeof wikiSummaryContentSchema>;

// Daily content entry - stores all module content for a single date
export const dailyContentSchema = z.object({
  id: z.string(),
  date: z.string(), // YYYY-MM-DD format
  status: z.enum(["draft", "published"]),
  modules: z.record(z.enum(MODULE_TYPES), moduleContentSchema.optional()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type DailyContent = z.infer<typeof dailyContentSchema>;

export const insertDailyContentSchema = dailyContentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDailyContent = z.infer<typeof insertDailyContentSchema>;

// Module references for content generation
export const moduleReferenceUrlSchema = z.object({
  url: z.string().url(),
  label: z.string().optional(),
  addedAt: z.string(),
});

export const moduleReferenceSchema = z.object({
  id: z.string(),
  moduleKey: z.string(),
  urls: z.array(moduleReferenceUrlSchema),
  rules: z.string(), // freeform generation guidelines
  updatedAt: z.string(),
});

export type ModuleReferenceUrl = z.infer<typeof moduleReferenceUrlSchema>;
export type ModuleReference = z.infer<typeof moduleReferenceSchema>;

// ── Drizzle pgTable definitions ──

export const dailyContent = pgTable("daily_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: text("date").notNull().unique(),
  status: text("status").notNull().default("draft"),
  modules: jsonb("modules").notNull().default({}),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const moduleReferences = pgTable("module_references", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  moduleKey: text("module_key").notNull().unique(),
  urls: jsonb("urls").notNull().default([]),
  rules: text("rules").notNull().default(""),
  updatedAt: text("updated_at").notNull(),
});
