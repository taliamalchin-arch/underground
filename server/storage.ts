import { type User, type InsertUser, type DailyContent, type InsertDailyContent, type ModuleType, type ModuleReference } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

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
  private users: Map<string, User>;
  private dailyContent: Map<string, DailyContent>;
  private moduleReferences: Map<string, ModuleReference>;

  constructor() {
    this.users = new Map();
    this.dailyContent = new Map();
    this.moduleReferences = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Daily content methods
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

export const storage = new MemStorage();
