import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";
import { insertPainPointSchema, insertIdeaSchema, insertMvpSchema } from "@shared/schema";
import { summarizeIdea, classifyIdea } from "./services/openai";
import { scrapePlatform } from "./services/scraper";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware - disabled for demo
  // await setupAuth(app);

  // Auth routes - demo mode with tier information
  app.get('/api/auth/user', async (req: any, res) => {
    // Return demo user with CRM tier data
    res.json({
      id: 'demo-user',
      email: 'demo@example.com',
      firstName: 'Demo',
      lastName: 'User',
      subscriptionTier: 'standard',
      subscriptionStatus: 'active',
      apiQuotaUsed: 23,
      apiQuotaLimit: 100,
      platformAccess: ['reddit', 'tiktok', 'quora'],
      createdAt: new Date().toISOString(),
    });
  });

  // User tier upgrade endpoint
  app.patch("/api/users/upgrade-tier", async (req, res) => {
    try {
      const { tier } = req.body;
      
      if (!['standard', 'pro', 'elite'].includes(tier)) {
        return res.status(400).json({ message: "Invalid tier" });
      }

      // Tier configurations
      const tierConfigs = {
        standard: { 
          apiQuota: 100, 
          platforms: ['reddit', 'tiktok', 'quora'],
          maxJobsPerDay: 3
        },
        pro: { 
          apiQuota: 500, 
          platforms: ['reddit', 'tiktok', 'quora', 'linkedin', 'twitter', 'facebook', 'instagram', 'youtube', 'producthunt', 'indiehackers', 'hackernews', 'medium', 'github', 'stackoverflow', 'devto', 'pinterest'],
          maxJobsPerDay: 10
        },
        elite: { 
          apiQuota: -1, 
          platforms: ['reddit', 'tiktok', 'quora', 'linkedin', 'twitter', 'facebook', 'instagram', 'youtube', 'producthunt', 'indiehackers', 'hackernews', 'medium', 'substack', 'discord', 'slack', 'telegram', 'whatsapp', 'github', 'stackoverflow', 'devto', 'twitch', 'snapchat', 'clubhouse', 'pinterest', 'tumblr'],
          maxJobsPerDay: -1
        }
      };

      const config = tierConfigs[tier as keyof typeof tierConfigs];
      
      // Return upgraded user
      res.json({
        id: 'demo-user',
        email: 'demo@example.com',
        firstName: 'Demo',
        lastName: 'User',
        subscriptionTier: tier,
        subscriptionStatus: 'active',
        apiQuotaUsed: 0,
        apiQuotaLimit: config.apiQuota,
        platformAccess: config.platforms,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error upgrading user tier:", error);
      res.status(500).json({ message: "Failed to upgrade tier" });
    }
  });

  // Dashboard stats
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Pain Points routes
  app.get("/api/pain-points", async (req, res) => {
    try {
      const { platform, status, niche, limit = 50, offset = 0 } = req.query;
      
      const painPoints = await storage.getPainPoints({
        platform: platform && platform !== 'all' ? platform as string : undefined,
        status: status && status !== 'all' ? status as string : undefined,
        niche: niche && niche !== 'all' ? niche as string : undefined,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      
      res.json(painPoints);
    } catch (error) {
      console.error("Error fetching pain points:", error);
      res.status(500).json({ message: "Failed to fetch pain points" });
    }
  });

  app.post("/api/pain-points", async (req, res) => {
    try {
      const validatedData = insertPainPointSchema.parse(req.body);
      const painPoint = await storage.createPainPoint(validatedData);
      res.json(painPoint);
    } catch (error) {
      console.error("Error creating pain point:", error);
      res.status(500).json({ message: "Failed to create pain point" });
    }
  });

  app.patch("/api/pain-points/:id/approve", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.updatePainPointStatus(id, "approved");
      
      // Generate idea from approved pain point (with fallback mock data)
      const painPoint = await storage.getPainPointById(id);
      if (painPoint) {
        try {
          const summary = await summarizeIdea(painPoint.fullText);
          const classification = await classifyIdea(summary.summaryText);
          
          await storage.createIdea({
            painPointId: id,
            summaryText: summary.summaryText,
            problemType: summary.problemType,
            confidenceScore: summary.confidenceScore.toString(),
            tags: classification.tags,
            userType: classification.userType,
            domain: classification.domain,
            appType: classification.appType,
            priorityScore: classification.priorityScore.toString(),
            isWellSolved: classification.isWellSolved,
            status: "pending",
          });
        } catch (error) {
          console.log("OpenAI API not available, using mock data for idea generation");
          // Fallback to mock idea generation
          await storage.createIdea({
            painPointId: id,
            summaryText: `AI-generated solution for: ${(painPoint.title || "Unknown problem").substring(0, 80)}...`,
            problemType: painPoint.problemType || "Pain Point",
            confidenceScore: (Math.random() * 40 + 60).toFixed(1),
            tags: [painPoint.detectedNiche || "General", painPoint.problemType || "Pain Point", 'validated'],
            userType: ['entrepreneurs', 'small business', 'consumers', 'professionals'][Math.floor(Math.random() * 4)],
            domain: painPoint.detectedNiche || "General",
            appType: ['web', 'mobile', 'saas', 'marketplace'][Math.floor(Math.random() * 4)],
            priorityScore: (Math.random() * 30 + 70).toFixed(1),
            isWellSolved: Math.random() < 0.3,
            status: "pending",
          });
        }
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error approving pain point:", error);
      res.status(500).json({ message: "Failed to approve pain point" });
    }
  });

  // Ideas routes
  app.get("/api/ideas", async (req, res) => {
    try {
      const { status, domain, limit = 50, offset = 0 } = req.query;
      
      const ideas = await storage.getIdeas({
        status: status as string,
        domain: domain as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      
      res.json(ideas);
    } catch (error) {
      console.error("Error fetching ideas:", error);
      res.status(500).json({ message: "Failed to fetch ideas" });
    }
  });

  app.patch("/api/ideas/:id/approve", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.updateIdeaStatus(id, "approved");
      res.json({ success: true });
    } catch (error) {
      console.error("Error approving idea:", error);
      res.status(500).json({ message: "Failed to approve idea" });
    }
  });

  // Content routes
  app.get("/api/content", async (req, res) => {
    try {
      const { mvpId } = req.query;
      
      let contentList: any[];
      if (mvpId) {
        contentList = await storage.getContentByMvpId(mvpId as string);
      } else {
        // Get all content - we need to add this method
        contentList = [];
      }
      
      res.json(contentList);
    } catch (error) {
      console.error("Error fetching content:", error);
      res.status(500).json({ message: "Failed to fetch content" });
    }
  });

  app.post("/api/content", async (req, res) => {
    try {
      const { mvpId, contentType, scriptText, metadata } = req.body;
      
      const contentData = {
        mvpId,
        contentType,
        scriptText,
        videoFormatSelected: 'short-form',
        generationPlatformUsed: 'OpenAI GPT-4',
        linkToGeneratedAsset: null,
        isReadyForDistribution: false,
        metadata
      };
      
      const content = await storage.createContent(contentData);
      res.json(content);
    } catch (error) {
      console.error("Error creating content:", error);
      res.status(500).json({ message: "Failed to create content" });
    }
  });

  // MVP routes
  app.get("/api/mvps", async (req, res) => {
    try {
      const { limit = 50, offset = 0 } = req.query;
      
      const mvps = await storage.getMvps(
        parseInt(limit as string),
        parseInt(offset as string)
      );
      
      res.json(mvps);
    } catch (error) {
      console.error("Error fetching MVPs:", error);
      res.status(500).json({ message: "Failed to fetch MVPs" });
    }
  });

  app.post("/api/mvps", async (req, res) => {
    try {
      const validatedData = insertMvpSchema.parse(req.body);
      const mvp = await storage.createMvp(validatedData);
      res.json(mvp);
    } catch (error) {
      console.error("Error creating MVP:", error);
      res.status(500).json({ message: "Failed to create MVP" });
    }
  });

  // Scraping Jobs routes
  app.get('/api/scraping-jobs', async (req, res) => {
    try {
      const jobs = await storage.getScrapingJobs(10); // Get last 10 jobs
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching scraping jobs:", error);
      res.status(500).json({ message: "Failed to fetch scraping jobs" });
    }
  });

  app.post('/api/scraper/start', async (req, res) => {
    try {
      const { jobType, platforms, targetNiche } = req.body;
      
      // Check if there's already an active job
      const activeJob = await storage.getActiveScrapingJob();
      if (activeJob) {
        return res.status(409).json({ 
          message: "Another scraping job is already running. Please wait for it to complete." 
        });
      }

      // Create new scraping job
      const jobData = {
        jobType,
        targetNiche,
        platforms,
        status: 'running' as const,
        progress: 0,
        currentAgent: 'scraper',
        totalTargets: platforms.length * (jobType === 'niche' ? 5 : 10),
        completedTargets: 0,
        foundPainPoints: 0,
        metadata: {
          startTime: new Date().toISOString(),
          requestedBy: 'demo-user'
        }
      };

      const job = await storage.createScrapingJob(jobData);
      
      // Simulate scraping process with realistic pipeline progression
      setTimeout(async () => {
        try {
          await storage.updateScrapingJob(job.id, {
            progress: 25,
            currentAgent: 'analyzer',
            completedTargets: Math.floor(jobData.totalTargets * 0.25)
          });
          
          setTimeout(async () => {
            try {
              await storage.updateScrapingJob(job.id, {
                progress: 60,
                currentAgent: 'filter',
                completedTargets: Math.floor(jobData.totalTargets * 0.6),
                foundPainPoints: Math.floor(Math.random() * 5) + 3
              });
              
              setTimeout(async () => {
                try {
                  await storage.updateScrapingJob(job.id, {
                    status: 'completed',
                    progress: 100,
                    completedTargets: jobData.totalTargets,
                    foundPainPoints: Math.floor(Math.random() * 8) + 5,
                    completedAt: new Date()
                  });
                } catch (error) {
                  console.error("Error completing scraping job:", error);
                }
              }, 3000);
            } catch (error) {
              console.error("Error updating scraping job:", error);
            }
          }, 2000);
        } catch (error) {
          console.error("Error updating scraping job:", error);
        }
      }, 1000);

      res.json({
        message: `${jobType === 'niche' ? 'Niche-targeted' : 'Discovery'} scraping started successfully`,
        jobId: job.id
      });
    } catch (error) {
      console.error("Error starting scraper:", error);
      res.status(500).json({ message: "Failed to start scraper" });
    }
  });

  // Settings routes
  app.get("/api/settings/:key", async (req: any, res) => {
    try {
      const userId = 'demo-user';
      const { key } = req.params;
      
      const setting = await storage.getSetting(userId, key);
      res.json(setting || { settingKey: key, settingValue: null });
    } catch (error) {
      console.error("Error fetching setting:", error);
      res.status(500).json({ message: "Failed to fetch setting" });
    }
  });

  app.post("/api/settings", async (req: any, res) => {
    try {
      const userId = 'demo-user';
      const { key, value } = req.body;
      
      const setting = await storage.setSetting({
        userId,
        settingKey: key,
        settingValue: value,
      });
      
      res.json(setting);
    } catch (error) {
      console.error("Error saving setting:", error);
      res.status(500).json({ message: "Failed to save setting" });
    }
  });

  // Sample data regeneration route
  app.post("/api/admin/regenerate-sample-data", async (req: any, res) => {
    try {
      const { generateComprehensiveMockData } = await import("./mockDataGenerator");
      const stats = await generateComprehensiveMockData();
      res.json({ 
        message: "Comprehensive mock data generated successfully",
        stats 
      });
    } catch (error) {
      console.error("Error generating sample data:", error);
      res.status(500).json({ message: "Failed to generate sample data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
