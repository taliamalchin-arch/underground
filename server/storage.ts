import { type DailyContent, type InsertDailyContent, type ModuleType, type ModuleReference, dailyContent as dailyContentTable, moduleReferences as moduleReferencesTable } from "@shared/schema";
import { randomUUID } from "crypto";
import { eq, and, gte, lte, asc } from "drizzle-orm";
import { db } from "./db";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // Daily content methods
  getDailyContent(id: string): Promise<DailyContent | undefined>;
  getDailyContentByDate(date: string): Promise<DailyContent | undefined>;
  getAllDailyContent(): Promise<DailyContent[]>;
  getDailyContentByDateRange(startDate: string, endDate: string): Promise<DailyContent[]>;
  createDailyContent(content: InsertDailyContent): Promise<DailyContent>;
  updateDailyContent(id: string, content: Partial<InsertDailyContent>): Promise<DailyContent | undefined>;
  deleteDailyContent(id: string): Promise<boolean>;
  swapModuleDates(date1: string, date2: string, moduleType: ModuleType): Promise<boolean>;
  publishDailyContent(id: string): Promise<DailyContent | undefined>;

  // Module references
  getModuleReference(moduleKey: string): Promise<ModuleReference | undefined>;
  getAllModuleReferences(): Promise<ModuleReference[]>;
  upsertModuleReference(moduleKey: string, data: { urls?: ModuleReference["urls"]; rules?: string }): Promise<ModuleReference>;
}

export class MemStorage implements IStorage {
  private dailyContent: Map<string, DailyContent>;
  private moduleReferences: Map<string, ModuleReference>;

  constructor() {
    this.dailyContent = new Map();
    this.moduleReferences = new Map();
  }

  async getDailyContent(id: string): Promise<DailyContent | undefined> {
    return this.dailyContent.get(id);
  }

  async getDailyContentByDate(date: string): Promise<DailyContent | undefined> {
    return Array.from(this.dailyContent.values()).find(
      (content) => content.date === date
    );
  }

  async getAllDailyContent(): Promise<DailyContent[]> {
    return Array.from(this.dailyContent.values()).sort(
      (a, b) => a.date.localeCompare(b.date)
    );
  }

  async getDailyContentByDateRange(startDate: string, endDate: string): Promise<DailyContent[]> {
    return Array.from(this.dailyContent.values())
      .filter((content) => content.date >= startDate && content.date <= endDate)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async createDailyContent(insertContent: InsertDailyContent): Promise<DailyContent> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const content: DailyContent = {
      ...insertContent,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.dailyContent.set(id, content);
    return content;
  }

  async updateDailyContent(id: string, updates: Partial<InsertDailyContent>): Promise<DailyContent | undefined> {
    const existing = this.dailyContent.get(id);
    if (!existing) return undefined;

    const updated: DailyContent = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.dailyContent.set(id, updated);
    return updated;
  }

  async deleteDailyContent(id: string): Promise<boolean> {
    return this.dailyContent.delete(id);
  }

  async swapModuleDates(date1: string, date2: string, moduleType: ModuleType): Promise<boolean> {
    const content1 = await this.getDailyContentByDate(date1);
    const content2 = await this.getDailyContentByDate(date2);

    if (!content1 || !content2) return false;

    const module1 = content1.modules[moduleType];
    const module2 = content2.modules[moduleType];

    // Swap the modules
    const updated1Modules = { ...content1.modules };
    const updated2Modules = { ...content2.modules };

    if (module2) {
      updated1Modules[moduleType] = module2;
    } else {
      delete updated1Modules[moduleType];
    }

    if (module1) {
      updated2Modules[moduleType] = module1;
    } else {
      delete updated2Modules[moduleType];
    }

    await this.updateDailyContent(content1.id, { modules: updated1Modules });
    await this.updateDailyContent(content2.id, { modules: updated2Modules });

    return true;
  }

  async publishDailyContent(id: string): Promise<DailyContent | undefined> {
    return this.updateDailyContent(id, { status: "published" });
  }

  // Module references
  async getModuleReference(moduleKey: string): Promise<ModuleReference | undefined> {
    return this.moduleReferences.get(moduleKey);
  }

  async getAllModuleReferences(): Promise<ModuleReference[]> {
    return Array.from(this.moduleReferences.values());
  }

  async upsertModuleReference(moduleKey: string, data: { urls?: ModuleReference["urls"]; rules?: string }): Promise<ModuleReference> {
    const existing = this.moduleReferences.get(moduleKey);
    const now = new Date().toISOString();

    if (existing) {
      const updated: ModuleReference = {
        ...existing,
        ...(data.urls !== undefined && { urls: data.urls }),
        ...(data.rules !== undefined && { rules: data.rules }),
        updatedAt: now,
      };
      this.moduleReferences.set(moduleKey, updated);
      return updated;
    }

    const ref: ModuleReference = {
      id: randomUUID(),
      moduleKey,
      urls: data.urls || [],
      rules: data.rules || "",
      updatedAt: now,
    };
    this.moduleReferences.set(moduleKey, ref);
    return ref;
  }
}

export class DatabaseStorage implements IStorage {
  private db: ReturnType<typeof import("drizzle-orm/neon-http").drizzle>;

  constructor() {
    this.db = db;
  }

  async getDailyContent(id: string): Promise<DailyContent | undefined> {
    const [row] = await this.db.select().from(dailyContentTable).where(eq(dailyContentTable.id, id));
    return row ? this.rowToContent(row) : undefined;
  }

  async getDailyContentByDate(date: string): Promise<DailyContent | undefined> {
    const [row] = await this.db.select().from(dailyContentTable).where(eq(dailyContentTable.date, date));
    return row ? this.rowToContent(row) : undefined;
  }

  async getAllDailyContent(): Promise<DailyContent[]> {
    const rows = await this.db.select().from(dailyContentTable).orderBy(asc(dailyContentTable.date));
    return rows.map((r) => this.rowToContent(r));
  }

  async getDailyContentByDateRange(startDate: string, endDate: string): Promise<DailyContent[]> {
    const rows = await this.db
      .select()
      .from(dailyContentTable)
      .where(and(gte(dailyContentTable.date, startDate), lte(dailyContentTable.date, endDate)))
      .orderBy(asc(dailyContentTable.date));
    return rows.map((r) => this.rowToContent(r));
  }

  async createDailyContent(insertContent: InsertDailyContent): Promise<DailyContent> {
    const now = new Date().toISOString();
    const [row] = await this.db
      .insert(dailyContentTable)
      .values({
        id: randomUUID(),
        date: insertContent.date,
        status: insertContent.status,
        modules: insertContent.modules,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return this.rowToContent(row);
  }

  async updateDailyContent(id: string, updates: Partial<InsertDailyContent>): Promise<DailyContent | undefined> {
    const values: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (updates.date !== undefined) values.date = updates.date;
    if (updates.status !== undefined) values.status = updates.status;
    if (updates.modules !== undefined) values.modules = updates.modules;

    const [row] = await this.db.update(dailyContentTable).set(values).where(eq(dailyContentTable.id, id)).returning();
    return row ? this.rowToContent(row) : undefined;
  }

  async deleteDailyContent(id: string): Promise<boolean> {
    const result = await this.db.delete(dailyContentTable).where(eq(dailyContentTable.id, id)).returning();
    return result.length > 0;
  }

  async swapModuleDates(date1: string, date2: string, moduleType: ModuleType): Promise<boolean> {
    const content1 = await this.getDailyContentByDate(date1);
    const content2 = await this.getDailyContentByDate(date2);
    if (!content1 || !content2) return false;

    const module1 = content1.modules[moduleType];
    const module2 = content2.modules[moduleType];

    const updated1Modules = { ...content1.modules };
    const updated2Modules = { ...content2.modules };

    if (module2) {
      updated1Modules[moduleType] = module2;
    } else {
      delete updated1Modules[moduleType];
    }

    if (module1) {
      updated2Modules[moduleType] = module1;
    } else {
      delete updated2Modules[moduleType];
    }

    await this.updateDailyContent(content1.id, { modules: updated1Modules });
    await this.updateDailyContent(content2.id, { modules: updated2Modules });
    return true;
  }

  async publishDailyContent(id: string): Promise<DailyContent | undefined> {
    return this.updateDailyContent(id, { status: "published" });
  }

  async getModuleReference(moduleKey: string): Promise<ModuleReference | undefined> {
    const [row] = await this.db.select().from(moduleReferencesTable).where(eq(moduleReferencesTable.moduleKey, moduleKey));
    return row ? this.rowToRef(row) : undefined;
  }

  async getAllModuleReferences(): Promise<ModuleReference[]> {
    const rows = await this.db.select().from(moduleReferencesTable);
    return rows.map((r) => this.rowToRef(r));
  }

  async upsertModuleReference(moduleKey: string, data: { urls?: ModuleReference["urls"]; rules?: string }): Promise<ModuleReference> {
    const existing = await this.getModuleReference(moduleKey);
    const now = new Date().toISOString();

    if (existing) {
      const values: Record<string, unknown> = { updatedAt: now };
      if (data.urls !== undefined) values.urls = data.urls;
      if (data.rules !== undefined) values.rules = data.rules;

      const [row] = await this.db.update(moduleReferencesTable).set(values).where(eq(moduleReferencesTable.moduleKey, moduleKey)).returning();
      return this.rowToRef(row);
    }

    const [row] = await this.db
      .insert(moduleReferencesTable)
      .values({
        id: randomUUID(),
        moduleKey,
        urls: data.urls || [],
        rules: data.rules || "",
        updatedAt: now,
      })
      .returning();
    return this.rowToRef(row);
  }

  // Map DB row (jsonb comes back as unknown) to typed DailyContent
  private rowToContent(row: typeof dailyContentTable.$inferSelect): DailyContent {
    return {
      id: row.id,
      date: row.date,
      status: row.status as DailyContent["status"],
      modules: (row.modules as DailyContent["modules"]) || {},
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  // Map DB row to typed ModuleReference
  private rowToRef(row: typeof moduleReferencesTable.$inferSelect): ModuleReference {
    return {
      id: row.id,
      moduleKey: row.moduleKey,
      urls: (row.urls as ModuleReference["urls"]) || [],
      rules: row.rules,
      updatedAt: row.updatedAt,
    };
  }
}

export const storage: IStorage = process.env.DATABASE_URL
  ? new DatabaseStorage()
  : new MemStorage();
