import {
  users,
  painPoints,
  ideas,
  mvps,
  content,
  settings,
  type User,
  type UpsertUser,
  type PainPoint,
  type InsertPainPoint,
  type Idea,
  type InsertIdea,
  type Mvp,
  type InsertMvp,
  type Content,
  type InsertContent,
  type Setting,
  type InsertSetting,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, like, inArray } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Pain Point operations
  createPainPoint(painPoint: InsertPainPoint): Promise<PainPoint>;
  getPainPoints(filters?: {
    platform?: string;
    status?: string;
    niche?: string;
    limit?: number;
    offset?: number;
  }): Promise<PainPoint[]>;
  updatePainPointStatus(id: string, status: string): Promise<void>;
  getPainPointById(id: string): Promise<PainPoint | undefined>;

  // Idea operations
  createIdea(idea: InsertIdea): Promise<Idea>;
  getIdeas(filters?: {
    status?: string;
    domain?: string;
    limit?: number;
    offset?: number;
  }): Promise<Idea[]>;
  updateIdeaStatus(id: string, status: string): Promise<void>;
  getIdeaById(id: string): Promise<Idea | undefined>;

  // MVP operations
  createMvp(mvp: InsertMvp): Promise<Mvp>;
  getMvps(limit?: number, offset?: number): Promise<Mvp[]>;
  updateMvpStatus(id: string, status: string): Promise<void>;
  getMvpById(id: string): Promise<Mvp | undefined>;

  // Content operations
  createContent(content: InsertContent): Promise<Content>;
  getContentByMvpId(mvpId: string): Promise<Content[]>;

  // Settings operations
  getSetting(userId: string, key: string): Promise<Setting | undefined>;
  setSetting(setting: InsertSetting): Promise<Setting>;

  // Analytics
  getStats(): Promise<{
    totalPainPoints: number;
    ideasGenerated: number;
    mvpsCreated: number;
    successRate: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Pain Point operations
  async createPainPoint(painPoint: InsertPainPoint): Promise<PainPoint> {
    const [created] = await db.insert(painPoints).values(painPoint).returning();
    return created;
  }

  async getPainPoints(filters?: {
    platform?: string;
    status?: string;
    niche?: string;
    limit?: number;
    offset?: number;
  }): Promise<PainPoint[]> {
    let query = db.select().from(painPoints);

    if (filters?.platform) {
      query = query.where(eq(painPoints.platform, filters.platform)) as any;
    }
    if (filters?.status) {
      query = query.where(eq(painPoints.status, filters.status)) as any;
    }
    if (filters?.niche) {
      query = query.where(like(painPoints.detectedNiche, `%${filters.niche}%`)) as any;
    }

    query = query.orderBy(desc(painPoints.createdAt)) as any;

    if (filters?.limit) {
      query = query.limit(filters.limit) as any;
    }
    if (filters?.offset) {
      query = query.offset(filters.offset) as any;
    }

    return await query;
  }

  async updatePainPointStatus(id: string, status: string): Promise<void> {
    await db.update(painPoints).set({ status }).where(eq(painPoints.id, id));
  }

  async getPainPointById(id: string): Promise<PainPoint | undefined> {
    const [painPoint] = await db.select().from(painPoints).where(eq(painPoints.id, id));
    return painPoint;
  }

  // Idea operations
  async createIdea(idea: InsertIdea): Promise<Idea> {
    const [created] = await db.insert(ideas).values(idea).returning();
    return created;
  }

  async getIdeas(filters?: {
    status?: string;
    domain?: string;
    limit?: number;
    offset?: number;
  }): Promise<Idea[]> {
    let query = db.select().from(ideas);

    if (filters?.status) {
      query = query.where(eq(ideas.status, filters.status)) as any;
    }
    if (filters?.domain) {
      query = query.where(eq(ideas.domain, filters.domain)) as any;
    }

    query = query.orderBy(desc(ideas.priorityScore)) as any;

    if (filters?.limit) {
      query = query.limit(filters.limit) as any;
    }
    if (filters?.offset) {
      query = query.offset(filters.offset) as any;
    }

    return await query;
  }

  async updateIdeaStatus(id: string, status: string): Promise<void> {
    await db.update(ideas).set({ status }).where(eq(ideas.id, id));
  }

  async getIdeaById(id: string): Promise<Idea | undefined> {
    const [idea] = await db.select().from(ideas).where(eq(ideas.id, id));
    return idea;
  }

  // MVP operations
  async createMvp(mvp: InsertMvp): Promise<Mvp> {
    const [created] = await db.insert(mvps).values(mvp).returning();
    return created;
  }

  async getMvps(limit?: number, offset?: number): Promise<Mvp[]> {
    let query = db.select().from(mvps).orderBy(desc(mvps.createdAt));

    if (limit) {
      query = query.limit(limit) as any;
    }
    if (offset) {
      query = query.offset(offset) as any;
    }

    return await query;
  }

  async updateMvpStatus(id: string, status: string): Promise<void> {
    await db.update(mvps).set({ status }).where(eq(mvps.id, id));
  }

  async getMvpById(id: string): Promise<Mvp | undefined> {
    const [mvp] = await db.select().from(mvps).where(eq(mvps.id, id));
    return mvp;
  }

  // Content operations
  async createContent(contentData: InsertContent): Promise<Content> {
    const [created] = await db.insert(content).values(contentData).returning();
    return created;
  }

  async getContentByMvpId(mvpId: string): Promise<Content[]> {
    return await db.select().from(content).where(eq(content.mvpId, mvpId));
  }

  // Settings operations
  async getSetting(userId: string, key: string): Promise<Setting | undefined> {
    const [setting] = await db
      .select()
      .from(settings)
      .where(and(eq(settings.userId, userId), eq(settings.settingKey, key)));
    return setting;
  }

  async setSetting(setting: InsertSetting): Promise<Setting> {
    const [upserted] = await db
      .insert(settings)
      .values(setting)
      .onConflictDoUpdate({
        target: [settings.userId, settings.settingKey],
        set: {
          settingValue: setting.settingValue,
          updatedAt: new Date(),
        },
      })
      .returning();
    return upserted;
  }

  // Analytics
  async getStats(): Promise<{
    totalPainPoints: number;
    ideasGenerated: number;
    mvpsCreated: number;
    successRate: number;
  }> {
    const painPointsResult = await db.select().from(painPoints);
    const ideasResult = await db.select().from(ideas);
    const mvpsResult = await db.select().from(mvps);
    const completedMvpsResult = await db.select().from(mvps).where(inArray(mvps.status, ['completed', 'deployed']));

    const totalPainPoints = painPointsResult.length;
    const ideasGenerated = ideasResult.length;
    const mvpsCreated = mvpsResult.length;
    const completedMvps = completedMvpsResult.length;

    const successRate = mvpsCreated > 0 ? Math.round((completedMvps / mvpsCreated) * 100) : 0;

    return {
      totalPainPoints,
      ideasGenerated,
      mvpsCreated,
      successRate,
    };
  }
}

export const storage = new DatabaseStorage();
