import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  subscriptionTier: varchar("subscription_tier").notNull().default("standard"), // standard, pro, elite
  subscriptionStatus: varchar("subscription_status").notNull().default("active"), // active, cancelled, expired
  apiQuotaUsed: integer("api_quota_used").notNull().default(0),
  apiQuotaLimit: integer("api_quota_limit").notNull().default(100), // Standard: 100, Pro: 500, Elite: unlimited
  platformAccess: text("platform_access").array().notNull().default(['Reddit', 'TikTok', 'Quora']), // Tier-based platform access
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Pain points discovered from scraping
export const painPoints = pgTable("pain_points", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  platform: varchar("platform").notNull(), // Reddit, TikTok, Quora, etc.
  sourceLink: text("source_link"),
  title: text("title"),
  fullText: text("full_text").notNull(),
  engagementScore: integer("engagement_score").default(0),
  detectedNiche: varchar("detected_niche"),
  problemType: varchar("problem_type").default("Pain Point"), // Pain Point, Opportunity, Feature Gap
  timestamp: timestamp("timestamp").defaultNow(),
  mode: varchar("mode").notNull(), // Discovery or Niche
  status: varchar("status").default("pending"), // pending, approved, rejected
  uniqueHash: varchar("unique_hash"), // for deduplication
  createdAt: timestamp("created_at").defaultNow(),
});

// Scraping jobs and pipeline tracking
export const scrapingJobs = pgTable("scraping_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobType: varchar("job_type").notNull(), // discovery, niche
  targetNiche: varchar("target_niche"),
  platforms: text("platforms").array(),
  status: varchar("status").default("pending"), // pending, running, completed, failed
  progress: integer("progress").default(0), // 0-100
  currentAgent: varchar("current_agent"), // scraper, analyzer, filter
  totalTargets: integer("total_targets").default(0),
  completedTargets: integer("completed_targets").default(0),
  foundPainPoints: integer("found_pain_points").default(0),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  errorMessage: text("error_message"),
  metadata: jsonb("metadata"),
});

// AI-summarized ideas from pain points
export const ideas = pgTable("ideas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  painPointId: varchar("pain_point_id").references(() => painPoints.id),
  summaryText: text("summary_text").notNull(),
  problemType: varchar("problem_type"), // Pain Point, Opportunity, Feature Gap
  confidenceScore: decimal("confidence_score", { precision: 3, scale: 2 }),
  tags: text("tags").array(),
  userType: varchar("user_type"),
  domain: varchar("domain"),
  appType: varchar("app_type"),
  priorityScore: decimal("priority_score", { precision: 3, scale: 1 }),
  isWellSolved: boolean("is_well_solved").default(false),
  status: varchar("status").default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow(),
});

// MVP projects generated from approved ideas
export const mvps = pgTable("mvps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ideaId: varchar("idea_id").references(() => ideas.id),
  name: varchar("name").notNull(),
  description: text("description"),
  platformSelected: varchar("platform_selected"), // Lovable, Base44, Replit
  mvpSpec: jsonb("mvp_spec"),
  estimatedEffortScore: integer("estimated_effort_score"),
  isReadyForUserTest: boolean("is_ready_for_user_test").default(false),
  generatedLink: text("generated_link"),
  status: varchar("status").default("draft"), // draft, building, completed, deployed
  createdAt: timestamp("created_at").defaultNow(),
});

// Content generated for MVPs
export const content = pgTable("content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mvpId: varchar("mvp_id").references(() => mvps.id),
  contentType: varchar("content_type").notNull(), // video, script, image, etc.
  scriptText: text("script_text"),
  videoFormatSelected: varchar("video_format_selected"),
  generationPlatformUsed: varchar("generation_platform_used"),
  linkToGeneratedAsset: text("link_to_generated_asset"),
  isReadyForDistribution: boolean("is_ready_for_distribution").default(false),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Agent configurations and status
export const agents = pgTable("agents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // scraper, summarizer, classifier, storage, mvp_designer, app_builder, content_designer, video_generator, marketing, market_tester
  status: varchar("status").default("queued"), // queued, processing, completed, failed
  isActive: boolean("is_active").default(true),
  configuration: jsonb("configuration"),
  lastRunAt: timestamp("last_run_at"),
  processingTime: integer("processing_time"), // in milliseconds
  tasksCompleted: integer("tasks_completed").default(0),
  tasksQueued: integer("tasks_queued").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Agent task queue
export const agentTasks = pgTable("agent_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id").references(() => agents.id),
  type: varchar("type").notNull(),
  status: varchar("status").default("queued"), // queued, processing, completed, failed
  priority: integer("priority").default(1),
  inputData: jsonb("input_data"),
  outputData: jsonb("output_data"),
  processingTime: integer("processing_time"),
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User feature permissions (individual controls)
export const userFeatures = pgTable("user_features", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  featureType: varchar("feature_type").notNull(), // llm, image_generation, video_generation, audio_generation, marketing_tools, crm_integration
  featureName: varchar("feature_name").notNull(), // gemini_pro, gpt4, midjourney, runway, elevenlabs, etc.
  isEnabled: boolean("is_enabled").default(false),
  usageQuota: integer("usage_quota").default(0),
  usageCount: integer("usage_count").default(0),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Global system tools and models
export const globalTools = pgTable("global_tools", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // LLM, Image, Video, Audio, Marketing, CRM
  isEnabled: boolean("is_enabled").default(true),
  apiEndpoint: text("api_endpoint"),
  configuration: jsonb("configuration"),
  tier: varchar("tier").notNull(), // standard, pro, elite
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// System settings and configurations
export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  settingKey: varchar("setting_key").notNull(),
  settingValue: text("setting_value"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertPainPointSchema = createInsertSchema(painPoints).omit({
  id: true,
  createdAt: true,
});
export type InsertPainPoint = z.infer<typeof insertPainPointSchema>;
export type PainPoint = typeof painPoints.$inferSelect;

export const insertIdeaSchema = createInsertSchema(ideas).omit({
  id: true,
  createdAt: true,
});
export type InsertIdea = z.infer<typeof insertIdeaSchema>;
export type Idea = typeof ideas.$inferSelect;

export const insertMvpSchema = createInsertSchema(mvps).omit({
  id: true,
  createdAt: true,
});
export type InsertMvp = z.infer<typeof insertMvpSchema>;
export type Mvp = typeof mvps.$inferSelect;

export const insertContentSchema = createInsertSchema(content).omit({
  id: true,
  createdAt: true,
});
export type InsertContent = z.infer<typeof insertContentSchema>;
export type Content = typeof content.$inferSelect;

export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
});
export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Setting = typeof settings.$inferSelect;

export const insertScrapingJobSchema = createInsertSchema(scrapingJobs).omit({
  id: true,
  startedAt: true,
});
export type InsertScrapingJob = z.infer<typeof insertScrapingJobSchema>;
export type ScrapingJob = typeof scrapingJobs.$inferSelect;

export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agents.$inferSelect;

export const insertAgentTaskSchema = createInsertSchema(agentTasks).omit({
  id: true,
  createdAt: true,
});
export type InsertAgentTask = z.infer<typeof insertAgentTaskSchema>;
export type AgentTask = typeof agentTasks.$inferSelect;

export const insertUserFeatureSchema = createInsertSchema(userFeatures).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertUserFeature = z.infer<typeof insertUserFeatureSchema>;
export type UserFeature = typeof userFeatures.$inferSelect;

export const insertGlobalToolSchema = createInsertSchema(globalTools).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertGlobalTool = z.infer<typeof insertGlobalToolSchema>;
export type GlobalTool = typeof globalTools.$inferSelect;
