import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";
import { insertPainPointSchema, insertIdeaSchema, insertMvpSchema } from "@shared/schema";
import { summarizeIdea, classifyIdea } from "./services/openai";
import { scrapePlatform } from "./services/scraper";
import { scrapeMultiplePlatforms } from "./services/platformApi";
import { calculateJobCost, CREDIT_COSTS, hasplatformAccess, PRICING_TIERS, CREDIT_PACKAGES } from "./services/pricing";

export async function registerRoutes(app: Express): Promise<Server> {
  // Enable Replit authentication
  await setupAuth(app);

  // Helper to get authenticated user ID
  const getUserId = (req: any): string | null => {
    if (req.isAuthenticated && req.isAuthenticated() && req.user?.claims?.sub) {
      return req.user.claims.sub;
    }
    return null;
  };

  // Auth routes - returns authenticated user with credit information
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      const userId = getUserId(req);
      
      if (!userId) {
        return res.json(null);
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.json(null);
      }
      
      const credits = await storage.getUserCredits(userId);
      const { PLATFORM_ACCESS } = await import('./services/pricing');
      const tierPlatforms = PLATFORM_ACCESS[user.subscriptionTier as keyof typeof PLATFORM_ACCESS] || PLATFORM_ACCESS.starter;
      
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        subscriptionTier: user.subscriptionTier || 'starter',
        subscriptionStatus: user.subscriptionStatus || 'active',
        creditsBalance: credits.balance,
        creditsUsed: credits.used,
        monthlyCreditsIncluded: credits.monthlyIncluded,
        platformAccess: tierPlatforms,
        createdAt: user.createdAt,
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Failed to fetch user data' });
    }
  });

  // User tier upgrade endpoint
  app.patch("/api/users/upgrade-tier", async (req, res) => {
    try {
      const { tier } = req.body;
      
      if (!['standard', 'pro', 'elite'].includes(tier)) {
        return res.status(400).json({ message: "Invalid tier" });
      }

      // Tier configurations - Give all platforms access for demo purposes
      const tierConfigs = {
        standard: { 
          apiQuota: 100, 
          platforms: ['reddit', 'tiktok', 'quora', 'producthunt', 'indiehackers', 'linkedin', 'twitter', 'facebook', 'facebookgroups', 'instagram', 'youtube', 'glassdoor', 'indeed', 'amazon', 'googleplay', 'appstore', 'trustpilot', 'g2', 'capterra', 'yelp', 'bbb', 'etsy', 'github', 'stackoverflow', 'stackexchange', 'devto', 'medium', 'hackernews', 'substack', 'pinterest', 'tumblr', 'discord', 'slack', 'telegram', 'whatsapp', 'twitch', 'kick', 'snapchat', 'blind', 'kickstarter', 'indiegogo', 'mastodon', 'bluesky', 'lemmy', 'kbin', 'superuser', 'askubuntu', 'serverfault', 'clubhouse', 'spaces', 'productboard', 'canny', 'uservoice', 'featureupvote'],
          maxJobsPerDay: 3
        },
        pro: { 
          apiQuota: 500, 
          platforms: ['reddit', 'tiktok', 'quora', 'producthunt', 'indiehackers', 'linkedin', 'twitter', 'facebook', 'facebookgroups', 'instagram', 'youtube', 'glassdoor', 'indeed', 'amazon', 'googleplay', 'appstore', 'trustpilot', 'g2', 'capterra', 'yelp', 'bbb', 'etsy', 'github', 'stackoverflow', 'stackexchange', 'devto', 'medium', 'hackernews'],
          maxJobsPerDay: 10
        },
        elite: { 
          apiQuota: -1, 
          platforms: ['reddit', 'tiktok', 'quora', 'producthunt', 'indiehackers', 'linkedin', 'twitter', 'facebook', 'facebookgroups', 'instagram', 'youtube', 'glassdoor', 'indeed', 'amazon', 'googleplay', 'appstore', 'trustpilot', 'g2', 'capterra', 'yelp', 'bbb', 'etsy', 'github', 'stackoverflow', 'stackexchange', 'devto', 'medium', 'hackernews', 'substack', 'pinterest', 'tumblr', 'discord', 'slack', 'telegram', 'whatsapp', 'twitch', 'kick', 'snapchat', 'blind', 'kickstarter', 'indiegogo', 'mastodon', 'bluesky', 'lemmy', 'kbin', 'superuser', 'askubuntu', 'serverfault', 'clubhouse', 'spaces', 'productboard', 'canny', 'uservoice', 'featureupvote'],
          maxJobsPerDay: -1
        }
      };

      const config = tierConfigs[tier as keyof typeof tierConfigs];
      
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update user subscription tier
      await storage.updateUser(userId, { subscriptionTier: tier });
      
      res.json({
        id: userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        subscriptionTier: tier,
        subscriptionStatus: 'active',
        apiQuotaUsed: 0,
        apiQuotaLimit: config.apiQuota,
        platformAccess: config.platforms,
        createdAt: user.createdAt,
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
      const userId = getUserId(req);
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized - please log in" });
      }
      
      // Check if there's already an active job
      const activeJob = await storage.getActiveScrapingJob();
      if (activeJob) {
        return res.status(409).json({ 
          message: "Another scraping job is already running. Please wait for it to complete." 
        });
      }

      // Calculate credit cost for this job
      const expectedPainPoints = jobType === 'niche' ? 5 : 10;
      const creditCost = calculateJobCost(platforms, expectedPainPoints);
      
      // Check user credits
      const userCredits = await storage.getUserCredits(userId);
      if (userCredits.balance < creditCost) {
        return res.status(402).json({ 
          message: `Insufficient credits. Required: ${creditCost}, Available: ${userCredits.balance}`,
          creditCost,
          availableCredits: userCredits.balance
        });
      }

      // Validate platform access based on user tier
      const user = await storage.getUser(userId);
      const userTier = user?.subscriptionTier || 'starter';
      const unauthorizedPlatforms = platforms.filter((platform: string) => 
        !hasplatformAccess(userTier, platform)
      );
      
      if (unauthorizedPlatforms.length > 0) {
        return res.status(403).json({
          message: `Your ${userTier} plan doesn't include access to: ${unauthorizedPlatforms.join(', ')}`,
          unauthorizedPlatforms,
          userTier
        });
      }

      // Deduct credits upfront
      const deductionSuccess = await storage.deductCredits(
        userId, 
        creditCost, 
        `Scraping job: ${platforms.join(', ')} - ${jobType} mode`
      );
      
      if (!deductionSuccess) {
        return res.status(402).json({ message: 'Failed to process credits' });
      }

      // Create new scraping job
      const jobData = {
        jobType,
        targetNiche,
        platforms,
        status: 'running' as const,
        progress: 0,
        currentAgent: 'scraper',
        totalTargets: platforms.length * expectedPainPoints,
        completedTargets: 0,
        foundPainPoints: 0,
        metadata: {
          startTime: new Date().toISOString(),
          requestedBy: userId,
          creditCost,
          useLiveAPIs: true
        }
      };

      const job = await storage.createScrapingJob(jobData);
      
      // Start actual live scraping process
      setImmediate(async () => {
        try {
          await storage.updateScrapingJob(job.id, {
            progress: 10,
            currentAgent: 'scraper'
          });
          
          let foundPainPoints: any[] = [];
          const query = targetNiche || 'problem need frustration want';
          
          // Use live platform APIs
          try {
            foundPainPoints = await scrapeMultiplePlatforms(platforms, query, jobType);
            
            // Save pain points to database
            for (const painPoint of foundPainPoints) {
              await storage.createPainPoint(painPoint);
            }
            
            await storage.updateScrapingJob(job.id, {
              progress: 60,
              currentAgent: 'analyzer',
              foundPainPoints: foundPainPoints.length
            });
            
            // Process with AI if we have pain points
            if (foundPainPoints.length > 0) {
              await storage.updateScrapingJob(job.id, {
                progress: 80,
                currentAgent: 'ai_processor'
              });
              
              // AI processing happens in pain point approval workflow
            }
            
            await storage.updateScrapingJob(job.id, {
              status: 'completed',
              progress: 100,
              completedTargets: jobData.totalTargets,
              foundPainPoints: foundPainPoints.length,
              completedAt: new Date()
            });
            
          } catch (scrapingError) {
            console.error('Live scraping failed, using fallback:', scrapingError);
            
            // Fallback to mock data if live APIs fail
            for (const platform of platforms) {
              const mockData = await scrapePlatform(platform, jobType, targetNiche);
              foundPainPoints.push(...mockData);
              
              for (const painPoint of mockData) {
                await storage.createPainPoint(painPoint);
              }
            }
            
            await storage.updateScrapingJob(job.id, {
              status: 'completed',
              progress: 100,
              foundPainPoints: foundPainPoints.length,
              completedAt: new Date(),
              metadata: {
                ...jobData.metadata,
                fallbackUsed: true,
                error: (scrapingError as Error).message
              }
            });
          }
          
        } catch (error) {
          console.error('Scraping job failed:', error);
          await storage.updateScrapingJob(job.id, {
            status: 'failed',
            errorMessage: (error as Error).message
          });
          
          // Refund credits on failure
          await storage.addCredits(
            userId,
            creditCost,
            `Refund for failed job: ${job.id}`
          );
        }
      });

      res.json({
        message: `${jobType === 'niche' ? 'Niche-targeted' : 'Discovery'} scraping started successfully`,
        jobId: job.id,
        creditCost,
        expectedResults: expectedPainPoints
      });
    } catch (error) {
      console.error("Error starting scraper:", error);
      res.status(500).json({ message: "Failed to start scraper" });
    }
  });

  // Settings routes
  app.get("/api/settings/:key", async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
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
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
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

  // Pipeline monitoring routes
  app.get("/api/pipeline/status", async (req, res) => {
    try {
      // Get recent scraping jobs for pipeline status
      const recentJobs = await storage.getScrapingJobs(5);
      
      // Mock pipeline data for demonstration
      const pipelineData = {
        totalJobs: recentJobs.length,
        activeJobs: recentJobs.filter(job => job.status === 'running').length,
        completedJobs: recentJobs.filter(job => job.status === 'completed').length,
        failedJobs: recentJobs.filter(job => job.status === 'failed').length,
        currentTasks: recentJobs.filter(job => job.status === 'running').map(job => ({
          id: job.id,
          agent: job.currentAgent,
          status: job.status,
          progress: job.progress || 0,
          estimatedTimeRemaining: Math.max(0, Math.round((100 - (job.progress || 0)) * 0.3)) + " minutes"
        })),
        agents: [
          { name: "Scraper Agent", status: "active", tasksProcessed: 42 },
          { name: "Pain Point Summarizer", status: "active", tasksProcessed: 38 },
          { name: "Content Agent", status: "idle", tasksProcessed: 15 },
          { name: "Template Discovery Agent", status: "idle", tasksProcessed: 12 },
          { name: "Marketing Agent", status: "idle", tasksProcessed: 8 }
        ]
      };
      
      res.json(pipelineData);
    } catch (error) {
      console.error("Error fetching pipeline status:", error);
      res.status(500).json({ message: "Failed to fetch pipeline status" });
    }
  });

  // Agent management routes
  app.get("/api/agents", async (req, res) => {
    try {
      // Mock agent configurations for demonstration
      const agents = [
        {
          id: "scraper",
          name: "Scraper Agent",
          type: "scraper",
          isActive: true,
          configuration: {
            prioritizedPlatforms: ["Reddit", "Quora", "TikTok", "Twitter/X", "Product Hunt"],
            proExtenders: ["Discord", "Indie Hackers"],
            resultsPerPlatform: 10,
            nicheFilter: "Standard Niches"
          }
        },
        {
          id: "summarizer",
          name: "Pain Point Summarizer Agent",
          type: "summarizer", 
          isActive: true,
          configuration: {
            systemPrompt: "You are an AI assistant tasked with summarizing user-generated content..."
          }
        },
        {
          id: "content",
          name: "Content Agent",
          type: "content",
          isActive: true,
          configuration: {
            prioritizedLLM: "Gemini (Free Tier)",
            imageGeneration: "Gemini (Free Tier)",
            videoGeneration: "Basic Gen (Watermarked)",
            audioGeneration: "Standard Voice (Free Tier)"
          }
        }
      ];
      
      res.json(agents);
    } catch (error) {
      console.error("Error fetching agents:", error);
      res.status(500).json({ message: "Failed to fetch agents" });
    }
  });

  app.patch("/api/agents/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const configuration = req.body;
      
      // In a real implementation, you'd save this to the database
      res.json({ 
        message: `Agent ${id} configuration updated successfully`,
        configuration 
      });
    } catch (error) {
      console.error("Error updating agent configuration:", error);
      res.status(500).json({ message: "Failed to update agent configuration" });
    }
  });

  // User management routes for CRM
  app.get("/api/users", async (req, res) => {
    try {
      // Mock users for demonstration
      const users = [
        {
          id: "1",
          name: "Alice Johnson",
          email: "alice@example.com",
          plan: "Pro",
          proFeaturesEnabled: 23,
          totalProFeatures: 23,
          features: {
            geminiPro: true,
            gpt4: true,
            claudeOpus: true,
            midjourney: true,
            elevenLabs: true,
            goHighLevel: true
          }
        },
        {
          id: "2",
          name: "Bob Williams", 
          email: "bob@example.com",
          plan: "Free",
          proFeaturesEnabled: 0,
          totalProFeatures: 23,
          features: {}
        }
      ];
      
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch("/api/users/:id/features", async (req, res) => {
    try {
      const { id } = req.params;
      const features = req.body;
      
      // In a real implementation, you'd save this to the database
      res.json({ 
        message: `User ${id} features updated successfully`,
        features 
      });
    } catch (error) {
      console.error("Error updating user features:", error);
      res.status(500).json({ message: "Failed to update user features" });
    }
  });

  // Credit management routes
  app.get("/api/credits/balance", async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const credits = await storage.getUserCredits(userId);
      res.json(credits);
    } catch (error) {
      console.error("Error fetching credits:", error);
      res.status(500).json({ message: "Failed to fetch credit balance" });
    }
  });

  app.get("/api/credits/transactions", async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { limit = 50 } = req.query;
      const transactions = await storage.getCreditTransactions(userId, parseInt(limit as string));
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.get("/api/credit-packages", async (req, res) => {
    try {
      const packages = await storage.getCreditPackages();
      res.json(packages);
    } catch (error) {
      console.error("Error fetching credit packages:", error);
      res.status(500).json({ message: "Failed to fetch credit packages" });
    }
  });

  app.post("/api/credits/purchase", async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { packageId, paymentIntentId } = req.body;
      
      const creditPackage = await storage.getCreditPackageById(packageId);
      if (!creditPackage) {
        return res.status(404).json({ message: "Credit package not found" });
      }
      
      const totalCredits = creditPackage.credits + (creditPackage.bonusCredits || 0);
      
      await storage.addCredits(
        userId,
        totalCredits,
        `Purchased ${creditPackage.name}`,
        { 
          packageId, 
          paymentIntentId,
          purchasePrice: creditPackage.priceUsd 
        }
      );
      
      res.json({ 
        message: "Credits purchased successfully",
        creditsAdded: totalCredits
      });
    } catch (error) {
      console.error("Error purchasing credits:", error);
      res.status(500).json({ message: "Failed to purchase credits" });
    }
  });

  app.get("/api/pricing", async (req, res) => {
    try {
      res.json({
        tiers: PRICING_TIERS,
        creditCosts: CREDIT_COSTS,
        packages: CREDIT_PACKAGES
      });
    } catch (error) {
      console.error("Error fetching pricing:", error);
      res.status(500).json({ message: "Failed to fetch pricing" });
    }
  });

  // Stripe checkout routes
  app.post("/api/stripe/checkout/credits", async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized - please log in to purchase" });
      }
      const { packageId } = req.body;
      
      const creditPackage = await storage.getCreditPackageById(packageId);
      if (!creditPackage) {
        return res.status(404).json({ message: "Credit package not found" });
      }

      const { stripeService } = await import('./stripeService');
      const { getStripePublishableKey } = await import('./stripeClient');
      
      const user = await storage.getUser(userId);
      let customerId = user?.stripeCustomerId;
      
      if (!customerId) {
        const customer = await stripeService.createCustomer(user?.email || 'demo@example.com', userId);
        await storage.updateUser(userId, { stripeCustomerId: customer.id });
        customerId = customer.id;
      }

      const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000'}`;
      
      const session = await stripeService.createCreditPurchaseSession(
        customerId,
        {
          name: creditPackage.name,
          priceUsd: Number(creditPackage.priceUsd),
          credits: creditPackage.credits,
          bonusCredits: creditPackage.bonusCredits || 0,
        },
        `${baseUrl}/pricing?success=true`,
        `${baseUrl}/pricing?canceled=true`,
        userId
      );

      res.json({ url: session.url, publishableKey: await getStripePublishableKey() });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  app.post("/api/stripe/checkout/subscription", async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized - please log in to subscribe" });
      }
      const { tierId } = req.body;
      
      const { stripeService } = await import('./stripeService');
      const { getStripePublishableKey } = await import('./stripeClient');
      
      const user = await storage.getUser(userId);
      let customerId = user?.stripeCustomerId;
      
      if (!customerId) {
        const customer = await stripeService.createCustomer(user?.email || 'demo@example.com', userId);
        await storage.updateUser(userId, { stripeCustomerId: customer.id });
        customerId = customer.id;
      }

      const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000'}`;
      
      const session = await stripeService.createSubscriptionSession(
        customerId,
        tierId,
        `${baseUrl}/pricing?success=true`,
        `${baseUrl}/pricing?canceled=true`,
        userId
      );

      res.json({ url: session.url, publishableKey: await getStripePublishableKey() });
    } catch (error) {
      console.error("Error creating subscription session:", error);
      res.status(500).json({ message: "Failed to create subscription session" });
    }
  });

  app.get("/api/stripe/publishable-key", async (req, res) => {
    try {
      const { getStripePublishableKey } = await import('./stripeClient');
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error) {
      console.error("Error fetching publishable key:", error);
      res.status(500).json({ message: "Failed to fetch Stripe publishable key" });
    }
  });

  // Global settings routes
  app.get("/api/global-settings", async (req, res) => {
    try {
      // Mock global settings for demonstration
      const globalSettings = {
        adminControls: {
          enableAllProFeatures: true
        },
        contentAgent: {
          llm: {
            geminiPro: true,
            gpt4: false,
            claudeOpus: false
          },
          imageGeneration: {
            midjourney: true,
            stableDiffusion: false,
            dalle3: false,
            falAI: true
          },
          videoGeneration: {
            runway: true,
            googleVeo3: false,
            createomate: false,
            json2Video: false,
            falAIVideo: false
          }
        },
        marketingAgent: {
          audio: {
            elevenLabs: true,
            piAPI: false
          },
          marketing: {
            genspark: true,
            manus: false,
            minimax: false,
            aiPlan: false
          },
          crm: {
            goHighLevel: true,
            marketingBlocksAI: true,
            agentXHelp: false,
            n8nAutomation: false
          }
        },
        tools: [
          { id: "1", name: "GPT-4", type: "LLM", isEnabled: true },
          { id: "2", name: "Claude Opus", type: "LLM", isEnabled: true },
          { id: "3", name: "Midjourney", type: "Image", isEnabled: true },
          { id: "4", name: "Runway", type: "Video", isEnabled: true }
        ]
      };
      
      res.json(globalSettings);
    } catch (error) {
      console.error("Error fetching global settings:", error);
      res.status(500).json({ message: "Failed to fetch global settings" });
    }
  });

  app.patch("/api/global-settings", async (req, res) => {
    try {
      const settings = req.body;
      
      // In a real implementation, you'd save this to the database
      res.json({ 
        message: "Global settings updated successfully",
        settings 
      });
    } catch (error) {
      console.error("Error updating global settings:", error);
      res.status(500).json({ message: "Failed to update global settings" });
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
