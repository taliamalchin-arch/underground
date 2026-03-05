import type { Express } from "express";
import { createServer, type Server } from "http";
import { writeFile, readFile } from "fs/promises";
import { join } from "path";
import { storage } from "./storage";
import { insertDailyContentSchema, MODULE_TYPES, type ModuleType } from "@shared/schema";
import { getSuggestion, getPoolSize } from "./suggestions";
import { getAISuggestion, invalidateModuleCache } from "./ai-suggestions";

export async function registerRoutes(app: Express): Promise<Server> {

  // ── Dev-only: Animation Lab → write config to source files ──

  app.post("/api/dev/save-timing", async (req, res) => {
    try {
      const { spring, contentTiming } = req.body;
      if (!spring || !contentTiming) {
        return res.status(400).json({ error: "spring and contentTiming required" });
      }

      const fileContent = `// Animation Durations
export const DURATION = {
  INSTANT: 0.08,    // Content exit, instant transitions
  QUICK: 0.2,       // Button press, hover states
  STANDARD: 0.3,    // Content transitions, fades
  CARD: 0.55,       // Card morphing, layout changes
  SLOW: 1,          // Intro animations, emphasis
} as const;

// Easing Curves
export const EASING = {
  SHARP: [0.4, 0, 0.15, 1] as const,
  STANDARD: [0.4, 0, 0.2, 1] as const,
  SOFT: "easeOut" as const,
} as const;

// ═══════════════════════════════════════════════════════
// PARENT SPRING CONFIG — single source of truth
// Change these to adjust the feel of ALL modules at once
// ═══════════════════════════════════════════════════════

export const PARENT_SPRING = {
  expand: {
    type: "spring" as const,
    damping: ${spring.container.damping},
    mass: ${spring.container.mass},
    stiffness: ${spring.container.stiffness},
  },
  contentEnter: {
    type: "spring" as const,
    damping: 40,
    mass: 0.4,
    stiffness: 300,
  },
  contentExit: {
    type: "spring" as const,
    damping: 40,
    mass: 0.3,
    stiffness: 500,
  },
  teaserFade: {
    type: "spring" as const,
    damping: 40,
    mass: 0.4,
    stiffness: 350,
  },
  reposition: {
    type: "spring" as const,
    damping: ${spring.reposition.damping},
    mass: ${spring.reposition.mass},
    stiffness: ${spring.reposition.stiffness},
  },
  contentYOffset: ${contentTiming.enter.yOffset},
  contentStagger: 0,
} as const;

// ═══════════════════════════════════════════════════════
// PER-MODULE OVERRIDES — only specify what differs
// ═══════════════════════════════════════════════════════

export type ModuleName =
  | "aboveGround"
  | "thoughtExperiment"
  | "microHistory"
  | "wikiSummary"
  | "games";

type SpringConfig = {
  type?: "spring";
  damping?: number;
  mass?: number;
  stiffness?: number;
};

export type ModuleOverride = {
  expand?: SpringConfig;
  contentEnter?: SpringConfig;
  contentExit?: SpringConfig;
  teaserFade?: SpringConfig;
  reposition?: SpringConfig;
  contentYOffset?: number;
  contentStagger?: number;
};

export const MODULE_OVERRIDES: Record<ModuleName, ModuleOverride> = {
  aboveGround: {
    reposition: {
      type: "spring",
      damping: 60,
      mass: 0.5,
      stiffness: 410,
    },
  },
  thoughtExperiment: {},
  microHistory: {},
  wikiSummary: { contentStagger: 0.08 },
  games: {},
};

// ═══════════════════════════════════════════════════════
// HELPER — get merged config for a module
// ═══════════════════════════════════════════════════════

type SpringTransition = {
  type: "spring";
  damping: number;
  mass: number;
  stiffness: number;
};

export interface ModuleAnimationConfig {
  expand: SpringTransition;
  contentEnter: SpringTransition;
  contentExit: SpringTransition;
  teaserFade: SpringTransition;
  reposition: SpringTransition;
  contentYOffset: number;
  contentStagger: number;
}

export function getModuleConfig(moduleName: ModuleName): ModuleAnimationConfig {
  const overrides = MODULE_OVERRIDES[moduleName] || {};
  return {
    expand: { ...PARENT_SPRING.expand, ...overrides.expand },
    contentEnter: { ...PARENT_SPRING.contentEnter, ...overrides.contentEnter },
    contentExit: { ...PARENT_SPRING.contentExit, ...overrides.contentExit },
    teaserFade: { ...PARENT_SPRING.teaserFade, ...overrides.teaserFade },
    reposition: { ...PARENT_SPRING.reposition, ...overrides.reposition },
    contentYOffset: overrides.contentYOffset ?? PARENT_SPRING.contentYOffset,
    contentStagger: overrides.contentStagger ?? PARENT_SPRING.contentStagger,
  };
}

// ═══════════════════════════════════════════════════════
// LEGACY BRIDGE — keeps AnimationDialKit/AnimationLab working
// ═══════════════════════════════════════════════════════

export const SPRING = {
  CONTAINER: PARENT_SPRING.expand,
  REPOSITION: PARENT_SPRING.reposition,
} as const;

export const CONTENT_TIMING = {
  enter: {
    delay: ${contentTiming.enter.delay},
    duration: ${contentTiming.enter.duration},
    stagger: ${contentTiming.enter.stagger},
    yOffset: PARENT_SPRING.contentYOffset,
  },
  exit: {
    duration: ${contentTiming.exit.duration},
  },
  teaser: {
    fadeOut: ${contentTiming.teaser.fadeOut},
    fadeInDelay: ${contentTiming.teaser.fadeInDelay},
  },
  headlineSlide: {
    duration: ${contentTiming.headlineSlide.duration},
  },
} as const;
`;

      const timingPath = join(process.cwd(), "client/src/lib/timing.ts");
      await writeFile(timingPath, fileContent, "utf-8");
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to save timing:", error);
      res.status(500).json({ error: "Failed to save timing config" });
    }
  });

  app.post("/api/dev/save-typography", async (req, res) => {
    try {
      const { variables } = req.body;
      if (!variables || typeof variables !== "object") {
        return res.status(400).json({ error: "variables object required" });
      }

      const cssPath = join(process.cwd(), "client/src/index.css");
      let css = await readFile(cssPath, "utf-8");

      for (const [varName, def] of Object.entries(variables) as [string, { value: number; unit: string; scaled?: boolean }][]) {
        // Build the replacement value
        const newValue = def.scaled
          ? `calc(${def.value}${def.unit} * var(--scale))`
          : `${def.value}${def.unit}`;

        // Match the variable declaration in :root block — handles both calc() and plain values
        const escapedVar = varName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`(${escapedVar}:\\s*)([^;]+)(;)`, "g");
        css = css.replace(regex, `$1${newValue}$3`);
      }

      await writeFile(cssPath, css, "utf-8");
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to save typography:", error);
      res.status(500).json({ error: "Failed to save typography config" });
    }
  });

  // ── Games Config API ──

  app.get("/api/games-config", async (_req, res) => {
    try {
      const configPath = join(process.cwd(), "client/src/data/games-config.json");
      const raw = await readFile(configPath, "utf-8");
      res.json(JSON.parse(raw));
    } catch {
      res.json({ games: [], library: [] });
    }
  });

  app.put("/api/games-config", async (req, res) => {
    try {
      const { games, library } = req.body;
      if (!Array.isArray(games)) {
        return res.status(400).json({ error: "games array required" });
      }
      const configPath = join(process.cwd(), "client/src/data/games-config.json");
      const data: Record<string, any> = { games };
      if (Array.isArray(library)) data.library = library;
      else {
        // Preserve existing library if not provided
        try {
          const existing = JSON.parse(await readFile(configPath, "utf-8"));
          data.library = existing.library || [];
        } catch { data.library = []; }
      }
      await writeFile(configPath, JSON.stringify(data, null, 2), "utf-8");
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to save games config:", error);
      res.status(500).json({ error: "Failed to save games config" });
    }
  });

  app.post("/api/games/upload", async (req, res) => {
    try {
      const { filename, code } = req.body;
      if (!filename || !code) {
        return res.status(400).json({ error: "filename and code required" });
      }
      const safeName = filename.replace(/[^a-zA-Z0-9_-]/g, "") + ".tsx";
      const gamePath = join(process.cwd(), "client/src/components/games", safeName);
      await writeFile(gamePath, code, "utf-8");
      res.json({ success: true, filename: safeName });
    } catch (error) {
      console.error("Failed to upload game:", error);
      res.status(500).json({ error: "Failed to upload game" });
    }
  });

  // Daily Content API Routes

  // Get all daily content
  app.get("/api/content", async (req, res) => {
    try {
      const content = await storage.getAllDailyContent();
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content" });
    }
  });

  // Get content by date range
  app.get("/api/content/range", async (req, res) => {
    try {
      const { start, end } = req.query;
      if (typeof start !== "string" || typeof end !== "string") {
        return res.status(400).json({ error: "start and end dates required" });
      }
      const content = await storage.getDailyContentByDateRange(start, end);
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content" });
    }
  });

  // Get content by specific date
  app.get("/api/content/date/:date", async (req, res) => {
    try {
      const content = await storage.getDailyContentByDate(req.params.date);
      if (!content) {
        return res.status(404).json({ error: "Content not found for this date" });
      }
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content" });
    }
  });

  // Get content by ID
  app.get("/api/content/:id", async (req, res) => {
    try {
      const content = await storage.getDailyContent(req.params.id);
      if (!content) {
        return res.status(404).json({ error: "Content not found" });
      }
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content" });
    }
  });

  // Create new daily content
  app.post("/api/content", async (req, res) => {
    try {
      const parsed = insertDailyContentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid content data", details: parsed.error });
      }

      // Check if content already exists for this date
      const existing = await storage.getDailyContentByDate(parsed.data.date);
      if (existing) {
        return res.status(409).json({ error: "Content already exists for this date" });
      }

      const content = await storage.createDailyContent(parsed.data);
      res.status(201).json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to create content" });
    }
  });

  // Update daily content (save draft)
  app.patch("/api/content/:id", async (req, res) => {
    try {
      const content = await storage.updateDailyContent(req.params.id, req.body);
      if (!content) {
        return res.status(404).json({ error: "Content not found" });
      }
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to update content" });
    }
  });

  // Publish content (change status from draft to published)
  app.post("/api/content/:id/publish", async (req, res) => {
    try {
      const content = await storage.publishDailyContent(req.params.id);
      if (!content) {
        return res.status(404).json({ error: "Content not found" });
      }
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to publish content" });
    }
  });

  // Swap module content between two dates
  app.post("/api/content/swap", async (req, res) => {
    try {
      const { date1, date2, moduleType } = req.body;

      if (!date1 || !date2 || !moduleType) {
        return res.status(400).json({ error: "date1, date2, and moduleType are required" });
      }

      if (!MODULE_TYPES.includes(moduleType as ModuleType)) {
        return res.status(400).json({ error: "Invalid module type" });
      }

      const success = await storage.swapModuleDates(date1, date2, moduleType as ModuleType);
      if (!success) {
        return res.status(404).json({ error: "One or both dates not found" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to swap content" });
    }
  });

  // Delete daily content
  app.delete("/api/content/:id", async (req, res) => {
    try {
      const success = await storage.deleteDailyContent(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Content not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete content" });
    }
  });

  // ── Content Suggestions API ──

  app.get("/api/suggest/:moduleKey", async (req, res) => {
    try {
      const { moduleKey } = req.params;
      const date = (req.query.date as string) || new Date().toISOString().split("T")[0];
      const index = parseInt(req.query.index as string) || 0;

      try {
        const { suggestion, isAI } = await getAISuggestion(moduleKey, date, index);
        if (!suggestion) {
          return res.status(404).json({ error: "No suggestions for this module" });
        }
        res.json({ suggestion, index, isAI });
      } catch (aiError) {
        // AI failed — fall back to static pools
        console.error("AI suggestion failed, falling back to static:", aiError);
        const suggestion = await getSuggestion(moduleKey, date, index);
        if (!suggestion) {
          return res.status(404).json({ error: "No suggestions for this module" });
        }
        const poolSize = getPoolSize(moduleKey, date);
        res.json({ suggestion, poolSize, index: index % poolSize, isAI: false });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to generate suggestion" });
    }
  });

  // ── Module References API ──

  // Get all module references
  app.get("/api/references", async (req, res) => {
    try {
      const refs = await storage.getAllModuleReferences();
      res.json(refs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch references" });
    }
  });

  // Get reference for a specific module
  app.get("/api/references/:moduleKey", async (req, res) => {
    try {
      const ref = await storage.getModuleReference(req.params.moduleKey);
      if (!ref) {
        return res.status(404).json({ error: "No references for this module" });
      }
      res.json(ref);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reference" });
    }
  });

  // Upsert reference for a module (create or update)
  app.put("/api/references/:moduleKey", async (req, res) => {
    try {
      const { urls, rules } = req.body;
      const ref = await storage.upsertModuleReference(req.params.moduleKey, { urls, rules });
      // Clear suggestion cache so new rules/references take effect immediately
      invalidateModuleCache(req.params.moduleKey);
      res.json(ref);
    } catch (error) {
      res.status(500).json({ error: "Failed to save reference" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
