import {
  users,
  painPoints,
  ideas,
  mvps,
  content,
  settings,
  scrapingJobs,
  creditTransactions,
  creditPackages,
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
  type ScrapingJob,
  type InsertScrapingJob,
  type CreditTransaction,
  type InsertCreditTransaction,
  type CreditPackage,
  type InsertCreditPackage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, like, inArray } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

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
  getPainPointByHash(uniqueHash: string): Promise<PainPoint | undefined>;

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
  getAllContent(): Promise<Content[]>;

  // Settings operations
  getSetting(userId: string, key: string): Promise<Setting | undefined>;
  setSetting(setting: InsertSetting): Promise<Setting>;

  // Credit management operations
  getUserCredits(userId: string): Promise<{ balance: number; used: number; monthlyIncluded: number }>;
  deductCredits(userId: string, amount: number, description: string, jobId?: string): Promise<boolean>;
  addCredits(userId: string, amount: number, description: string, metadata?: any): Promise<void>;
  getCreditTransactions(userId: string, limit?: number): Promise<CreditTransaction[]>;
  updateUserCredits(userId: string, creditsBalance: number): Promise<void>;
  
  // Credit package operations
  getCreditPackages(): Promise<CreditPackage[]>;
  createCreditPackage(data: InsertCreditPackage): Promise<CreditPackage>;
  getCreditPackageById(id: string): Promise<CreditPackage | undefined>;

  // Analytics
  getStats(): Promise<{
    totalPainPoints: number;
    ideasGenerated: number;
    mvpsCreated: number;
    successRate: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getAllContent(): Promise<Content[]> {
    return db.select().from(content).orderBy(desc(content.createdAt));
  }
  // User operations (IMPORTANT: mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
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
    const conditions = [];
    if (filters?.platform) {
      conditions.push(eq(painPoints.platform, filters.platform));
    }
    if (filters?.status) {
      conditions.push(eq(painPoints.status, filters.status));
    }
    if (filters?.niche) {
      conditions.push(like(painPoints.detectedNiche, `%${filters.niche}%`));
    }
    if (conditions.length) query = query.where(and(...conditions)) as any;

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

  async getPainPointByHash(uniqueHash: string): Promise<PainPoint | undefined> {
    const [painPoint] = await db.select().from(painPoints).where(eq(painPoints.uniqueHash, uniqueHash));
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

  // Scraping Jobs operations
  async createScrapingJob(jobData: InsertScrapingJob): Promise<ScrapingJob> {
    const [created] = await db.insert(scrapingJobs).values(jobData).returning();
    return created;
  }

  async getScrapingJobs(limit?: number): Promise<ScrapingJob[]> {
    let query = db.select().from(scrapingJobs).orderBy(desc(scrapingJobs.startedAt));
    
    if (limit) {
      query = query.limit(limit) as any;
    }
    
    return await query;
  }

  async updateScrapingJob(id: string, updates: Partial<ScrapingJob>): Promise<void> {
    await db.update(scrapingJobs).set(updates).where(eq(scrapingJobs.id, id));
  }

  async getActiveScrapingJob(): Promise<ScrapingJob | undefined> {
    const [job] = await db
      .select()
      .from(scrapingJobs)
      .where(eq(scrapingJobs.status, 'running'))
      .orderBy(desc(scrapingJobs.startedAt))
      .limit(1);
    return job;
  }

  // Credit management operations
  async getUserCredits(userId: string): Promise<{ balance: number; used: number; monthlyIncluded: number }> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      // Create demo user if not exists
      if (userId === 'demo-user') {
        await db.insert(users).values({
          id: userId,
          email: 'demo@example.com',
          firstName: 'Demo',
          lastName: 'User',
          subscriptionTier: 'starter',
          subscriptionStatus: 'active',
          creditsBalance: 100,
          creditsUsed: 0,
          monthlyCreditsIncluded: 500,
        });
        
        return {
          balance: 100,
          used: 0,
          monthlyIncluded: 500,
        };
      }
      throw new Error("User not found");
    }
    
    return {
      balance: user.creditsBalance || 0,
      used: user.creditsUsed || 0,
      monthlyIncluded: user.monthlyCreditsIncluded || 100,
    };
  }

  async deductCredits(userId: string, amount: number, description: string, jobId?: string): Promise<boolean> {
    if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error("Credit amount must be a positive integer");
    // Use a transaction with a row-level lock to prevent double-spend races.
    return await db.transaction(async (tx) => {
      // Lock the user row for the duration of this transaction
      const [user] = await tx.select().from(users).where(eq(users.id, userId)).for("update");

      if (!user) throw new Error("User not found");

      const balance = user.creditsBalance;
      const used = user.creditsUsed;

      if (balance < amount) return false;

      await tx.update(users)
        .set({
          creditsBalance: balance - amount,
          creditsUsed: used + amount,
        })
        .where(eq(users.id, userId));

      await tx.insert(creditTransactions).values({
        userId,
        type: "usage",
        amount: -amount,
        description,
        relatedJobId: jobId,
      });

      return true;
    });
  }

  async addCredits(userId: string, amount: number, description: string, metadata?: any): Promise<void> {
    if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error("Credit amount must be a positive integer");
    // Use a transaction with a row-level lock to prevent race conditions.
    await db.transaction(async (tx) => {
      const [user] = await tx.select().from(users).where(eq(users.id, userId)).for("update");

      if (!user) throw new Error("User not found");

      const balance = user.creditsBalance;

      await tx.update(users)
        .set({ creditsBalance: balance + amount })
        .where(eq(users.id, userId));

      await tx.insert(creditTransactions).values({
        userId,
        type: "purchase",
        amount,
        description,
        metadata,
      });
    });
  }

  async getCreditTransactions(userId: string, limit: number = 50): Promise<CreditTransaction[]> {
    return await db.select()
      .from(creditTransactions)
      .where(eq(creditTransactions.userId, userId))
      .orderBy(desc(creditTransactions.createdAt))
      .limit(limit);
  }

  async updateUserCredits(userId: string, creditsBalance: number): Promise<void> {
    await db.update(users)
      .set({ creditsBalance })
      .where(eq(users.id, userId));
  }

  async updateUser(userId: string, data: Partial<{
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    subscriptionTier: string;
    subscriptionStatus: string;
  }>): Promise<void> {
    await db.update(users)
      .set(data)
      .where(eq(users.id, userId));
  }

  async getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, stripeCustomerId));
    return user;
  }

  // Credit package operations
  async getCreditPackages(): Promise<CreditPackage[]> {
    return await db.select()
      .from(creditPackages)
      .where(eq(creditPackages.isActive, true))
      .orderBy(creditPackages.sortOrder);
  }

  async createCreditPackage(data: InsertCreditPackage): Promise<CreditPackage> {
    const [created] = await db.insert(creditPackages).values(data).returning();
    return created;
  }

  async getCreditPackageById(id: string): Promise<CreditPackage | undefined> {
    const [creditPackage] = await db.select().from(creditPackages).where(eq(creditPackages.id, id));
    return creditPackage;
  }

  async initializeCreditPackages(): Promise<void> {
    try {
      // Check if credit packages already exist
      const existingPackages = await db.select().from(creditPackages).limit(1);
      if (existingPackages.length > 0) {
        console.log("Credit packages already initialized");
        return;
      }

      // Insert credit packages from pricing config (updated pricing)
      const packages = [
        {
          name: 'Starter Pack',
          credits: 150,
          bonusCredits: 0,
          priceUsd: '9.99',
          stripePriceId: 'price_starter_150',
          isActive: true,
          sortOrder: 1,
        },
        {
          name: 'Popular Pack',
          credits: 600,
          bonusCredits: 75,
          priceUsd: '39.99',
          stripePriceId: 'price_popular_600',
          isActive: true,
          sortOrder: 2,
        },
        {
          name: 'Power Pack',
          credits: 1500,
          bonusCredits: 250,
          priceUsd: '89.99',
          stripePriceId: 'price_power_1500',
          isActive: true,
          sortOrder: 3,
        },
        {
          name: 'Enterprise Pack',
          credits: 6000,
          bonusCredits: 1500,
          priceUsd: '249.99',
          stripePriceId: 'price_enterprise_6000',
          isActive: true,
          sortOrder: 4,
        },
      ];

      await db.insert(creditPackages).values(packages);
      console.log("Initialized credit packages successfully");

      // Initialize demo user with starting credits
      const demoUserId = 'demo-user';
      try {
        await this.addCredits(demoUserId, 100, "Welcome bonus - 100 free credits");
        console.log("Added welcome bonus credits for demo user");
      } catch (error) {
        console.log("Demo user credits already initialized");
      }
    } catch (error) {
      console.error("Error initializing credit packages:", error);
    }
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

  async generateSampleData(): Promise<void> {
    // Initialize credit packages first
    await this.initializeCreditPackages();
    
    // Clear existing data
    await db.delete(scrapingJobs);
    await db.delete(content);
    await db.delete(mvps);
    await db.delete(ideas);
    await db.delete(painPoints);

    // Function to create unique hash for deduplication
    const createHash = (title: string, platform: string) => {
      return Buffer.from(title + platform).toString('base64').slice(0, 16);
    };
    
    const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

    // Create enhanced sample pain points matching SaaS Genesis quality
    const samplePainPoints = [
      // Reddit Pain Points
      {
        platform: "Reddit",
        sourceLink: "https://reddit.com/r/productivity/comments/xyz",
        title: "Users struggle to manage and track recurring tasks in most to-do list apps, leading to missed deadlines.",
        fullText: "I've tried Todoist, Notion, and TickTick but none of them handle recurring tasks well. When I complete a task, it just creates another instance without showing my completion history. I end up missing deadlines because I can't see patterns in my task completion. Need something that tracks recurring tasks intelligently.",
        engagementScore: 856,
        detectedNiche: "Productivity",
        problemType: "Pain Point",
        mode: "discovery",
        status: "pending",
        uniqueHash: createHash("Users struggle to manage and track recurring tasks in most to-do list apps, leading to missed deadlines.", "Reddit"),
      },
      {
        platform: "Reddit",
        sourceLink: "https://reddit.com/r/reviews/comments/abc",
        title: "Finding reliable, unbiased reviews for local services is difficult, as platforms are often gamed.",
        fullText: "Local service reviews on Google and Yelp seem fake. Small businesses gaming the system with fake reviews while good businesses get buried. Need a platform that verifies reviews through actual service completion.",
        engagementScore: 672,
        detectedNiche: "Local",
        problemType: "Pain Point",
        mode: "discovery",
        status: "pending",
        uniqueHash: createHash("Finding reliable, unbiased reviews for local services is difficult, as platforms are often gamed.", "Reddit"),
      },
      {
        platform: "Reddit",
        sourceLink: "https://reddit.com/r/gaming/comments/def",
        title: "Gamers want a central hub to track their backlog across different platforms (Steam, PlayStation, Xbox, Switch).",
        fullText: "I have games across Steam, PlayStation, Xbox Game Pass, and Nintendo Switch. There's no good way to track my backlog and see what I should play next. Each platform has its own library but I want a unified view.",
        engagementScore: 934,
        detectedNiche: "Gaming",
        problemType: "Opportunity",
        mode: "discovery",
        status: "approved",
        uniqueHash: createHash("Gamers want a central hub to track their backlog across different platforms (Steam, PlayStation, Xbox, Switch).", "Reddit"),
      },

      // TikTok Pain Points
      {
        platform: "TikTok",
        sourceLink: "https://tiktok.com/@productivity_hacks/video/123",
        title: "Users showcase 'life hacks' for everyday problems that could be solved with a simple product or app.",
        fullText: "Seeing all these TikTok life hacks for tracking water intake, meal planning, and daily routines. People are creating complex manual systems when these could be simple apps. There's a market for ultra-simple solutions to common daily problems.",
        engagementScore: 543,
        detectedNiche: "Life Hacks",
        problemType: "Opportunity",
        mode: "discovery",
        status: "pending",
        uniqueHash: createHash("Users showcase 'life hacks' for everyday problems that could be solved with a simple product or app.", "TikTok"),
      },
      {
        platform: "TikTok",
        sourceLink: "https://tiktok.com/@finance_tips/video/456",
        title: "A user rants about the difficulty of tracking personal expenses across various payment cards (Venmo, CashApp, Zelle).",
        fullText: "Tracking expenses across Venmo, CashApp, Zelle, Apple Pay, and credit cards is impossible. Bank apps don't categorize well and I'm spending hours each month trying to figure out where my money went. Need automatic expense categorization across all payment methods.",
        engagementScore: 789,
        detectedNiche: "Finance",
        problemType: "Pain Point",
        mode: "niche",
        status: "approved",
        uniqueHash: createHash("A user rants about the difficulty of tracking personal expenses across various payment cards (Venmo, CashApp, Zelle).", "TikTok"),
      },
      {
        platform: "TikTok",
        sourceLink: "https://tiktok.com/@workfromhome/video/789",
        title: "A user demonstrates a clever workaround for a missing feature in a popular software, indicating a feature gap.",
        fullText: "Using this weird workaround to track my work hours across different projects in Slack. Having to manually copy-paste timestamps into a spreadsheet because Slack doesn't have proper time tracking for freelancers. This should be built-in!",
        engagementScore: 456,
        detectedNiche: "Productivity",
        problemType: "Feature Gap",
        mode: "discovery",
        status: "pending",
        uniqueHash: createHash("A user demonstrates a clever workaround for a missing feature in a popular software, indicating a feature gap.", "TikTok"),
      },

      // Quora Pain Points  
      {
        platform: "Quora",
        sourceLink: "https://quora.com/question/learning-skills",
        title: "Users ask how to learn a new skill effectively online without getting lost in disorganized resources.",
        fullText: "I want to learn web development but there are thousands of courses, tutorials, and resources. How do I create a structured learning path without spending weeks just researching what to learn? Need a personalized curriculum builder.",
        engagementScore: 423,
        detectedNiche: "Education",
        problemType: "Pain Point",
        mode: "discovery",
        status: "pending",
        uniqueHash: createHash("Users ask how to learn a new skill effectively online without getting lost in disorganized resources.", "Quora"),
      },
      {
        platform: "Quora",
        sourceLink: "https://quora.com/question/workout-consistency",
        title: "People want to know why it's so hard to maintain a consistent workout routine.",
        fullText: "I start working out enthusiastically but lose motivation after 2-3 weeks. Tried apps but they're either too basic or too complicated. Need something that adapts to my real life and keeps me motivated without being annoying.",
        engagementScore: 567,
        detectedNiche: "Fitness",
        problemType: "Opportunity",
        mode: "niche",
        status: "approved",
        uniqueHash: createHash("People want to know why it's so hard to maintain a consistent workout routine.", "Quora"),
      },
      {
        platform: "Quora",
        sourceLink: "https://quora.com/question/budget-management",
        title: "Users seek solutions for managing personal finances and creating a budget that actually works.",
        fullText: "Every budgeting app I try is either too simple (just expense tracking) or too complex (like accounting software). Need something that helps me understand my spending patterns and automatically suggests realistic budget adjustments.",
        engagementScore: 712,
        detectedNiche: "Finance",
        problemType: "Pain Point",
        mode: "discovery",
        status: "approved",
        uniqueHash: createHash("Users seek solutions for managing personal finances and creating a budget that actually works.", "Quora"),
      },

      // Additional platforms
      {
        platform: "Product Hunt",
        sourceLink: "https://producthunt.com/discussions/remote-work",
        title: "Home cooks desire a tool to easily adjust recipe serving sizes without manual calculations.",
        fullText: "Recipe apps show ingredients for 4 servings but I'm cooking for 2 or 6 people. Having to calculate fractions for every ingredient is annoying. Need smart recipe scaling with automatic grocery list generation.",
        engagementScore: 345,
        detectedNiche: "Food",
        problemType: "Feature Gap",
        mode: "discovery",
        status: "pending",
        uniqueHash: createHash("Home cooks desire a tool to easily adjust recipe serving sizes without manual calculations.", "Product Hunt"),
      },
      {
        platform: "Twitter/X",
        sourceLink: "https://twitter.com/user/status/123",
        title: "Users learning a new language need practice partners but find existing platforms intimidating.",
        fullText: "Language exchange apps like HelloTalk are overwhelming. Too many people, random conversations. Need structured practice sessions with specific topics and skill levels. Like Duolingo but with real people.",
        engagementScore: 289,
        detectedNiche: "Language Learning", 
        problemType: "Opportunity",
        mode: "discovery",
        status: "pending",
        uniqueHash: createHash("Users learning a new language need practice partners but find existing platforms intimidating.", "Twitter/X"),
      },
      {
        platform: "Hacker News",
        sourceLink: "https://news.ycombinator.com/item?id=123",
        title: "There's a need for a clear, simple explanation of cryptocurrency without the marketing hype.",
        fullText: "Every crypto educational resource is either too basic (what is Bitcoin) or pushes specific coins. Developers need practical guides for integrating crypto payments without the investment/trading noise.",
        engagementScore: 178,
        detectedNiche: "Education",
        problemType: "Opportunity",
        mode: "discovery",
        status: "pending",
        uniqueHash: createHash("There's a need for a clear, simple explanation of cryptocurrency without the marketing hype.", "Hacker News"),
      },
      {
        platform: "LinkedIn",
        sourceLink: "https://linkedin.com/posts/professional",
        title: "Pet owners struggle to find pet-friendly rental housing and want a dedicated search platform.",
        fullText: "Apartment hunting with pets is a nightmare. Listings that say 'pets allowed' often have restrictions or extra fees that aren't mentioned upfront. Need a platform specifically for pet-friendly rentals with transparent policies.",
        engagementScore: 434,
        detectedNiche: "Real Estate",
        problemType: "Opportunity",
        mode: "niche",
        status: "approved",
        uniqueHash: createHash("Pet owners struggle to find pet-friendly rental housing and want a dedicated search platform.", "LinkedIn"),
      },
      {
        platform: "Indie Hackers",
        sourceLink: "https://indiehackers.com/forum/post/abc",
        title: "Solo entrepreneurs need practice partners but find existing platforms intimidating.",
        fullText: "Building a SaaS solo is lonely. Need a platform to find other indie hackers for accountability partnerships, skill exchanges, and feedback sessions. Current communities are too large and unfocused.",
        engagementScore: 567,
        detectedNiche: "Business",
        problemType: "Opportunity",
        mode: "discovery",
        status: "pending",
        uniqueHash: createHash("Solo entrepreneurs need practice partners but find existing platforms intimidating.", "Indie Hackers"),
      },
    ];

    for (const painPoint of samplePainPoints) {
      await this.createPainPoint(painPoint);
    }

    console.log("Enhanced sample data generated successfully");
  }
}

export const storage = new DatabaseStorage();
