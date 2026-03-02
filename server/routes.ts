import type { Express } from "express";
import { createServer, type Server } from "http";
import { writeFile, readFile } from "fs/promises";
import { join } from "path";
import { storage } from "./storage";
import { insertDailyContentSchema, MODULE_TYPES, type ModuleType } from "@shared/schema";
import { getSuggestion, getPoolSize } from "./suggestions";

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

// ── Spring Configs (tuned in AnimationLab) ──

export const SPRING = {
  // Card open/close — the overall card resizing
  CONTAINER: {
    type: "spring" as const,
    damping: ${spring.container.damping},
    mass: ${spring.container.mass},
    stiffness: ${spring.container.stiffness},
  },
  // Title/element reposition — elements sliding within the card
  REPOSITION: {
    type: "spring" as const,
    damping: ${spring.reposition.damping},
    mass: ${spring.reposition.mass},
    stiffness: ${spring.reposition.stiffness},
  },
} as const;

// ── Content Timing (tuned in AnimationLab) ──

export const CONTENT_TIMING = {
  enter: {
    delay: ${contentTiming.enter.delay},
    duration: ${contentTiming.enter.duration},
    stagger: ${contentTiming.enter.stagger},
    yOffset: ${contentTiming.enter.yOffset},
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

// ── Framer Motion Presets ──

export const MOTION_PRESETS = {
  // Card layout animation — spring-based
  cardTransition: SPRING.CONTAINER,
  // Content fading in after card opens
  contentEnter: {
    duration: CONTENT_TIMING.enter.duration,
    delay: CONTENT_TIMING.enter.delay,
    ease: EASING.SOFT,
  },
  // Content disappearing on card close
  contentExit: {
    duration: CONTENT_TIMING.exit.duration,
  },
  // Button press feedback
  buttonPress: {
    duration: DURATION.QUICK,
    ease: EASING.STANDARD,
  },
} as const;

// CSS Variable Exports (for use in CSS files)
export const CSS_TIMING_VARS = {
  '--duration-instant': \`\${DURATION.INSTANT}s\`,
  '--duration-quick': \`\${DURATION.QUICK}s\`,
  '--duration-standard': \`\${DURATION.STANDARD}s\`,
  '--duration-card': \`\${DURATION.CARD}s\`,
  '--duration-slow': \`\${DURATION.SLOW}s\`,
  '--ease-sharp': 'cubic-bezier(0.4, 0, 0.15, 1)',
  '--ease-standard': 'cubic-bezier(0.4, 0, 0.2, 1)',
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

      const suggestion = await getSuggestion(moduleKey, date, index);
      if (!suggestion) {
        return res.status(404).json({ error: "No suggestions for this module" });
      }

      const poolSize = getPoolSize(moduleKey, date);

      res.json({ suggestion, poolSize, index: index % poolSize });
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
      res.json(ref);
    } catch (error) {
      res.status(500).json({ error: "Failed to save reference" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
