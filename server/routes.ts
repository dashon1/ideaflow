import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";
import { insertPainPointSchema, insertIdeaSchema, insertMvpSchema } from "@shared/schema";
import { summarizeIdea, classifyIdea } from "./services/openai";
import { scrapeAllPlatforms } from "./services/scraper";
import { scrapeMultiplePlatforms } from "./services/platformApi";
import { calculateJobCost, CREDIT_COSTS, hasplatformAccess, PRICING_TIERS, CREDIT_PACKAGES } from "./services/pricing";
import { getOrCreateCsrfToken, verifyCsrf } from "./csrf";
import { scraperLimiter, aiLimiter } from "./rateLimiters";

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

  // Middleware: require a valid session
  const requireAuth = (req: any, res: any, next: any) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    next();
  };

  // Middleware: require admin role
  // Set ADMIN_USER_IDS env var to a comma-separated list of Replit user IDs.
  const requireAdmin = (req: any, res: any, next: any) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const adminIds = (process.env.ADMIN_USER_IDS || "").split(",").map(s => s.trim()).filter(Boolean);
    if (adminIds.length === 0 || !adminIds.includes(userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
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
      
      // Ensure a CSRF token exists in the session and return it to the client
      const csrfToken = getOrCreateCsrfToken(req);

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
        csrfToken,
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Failed to fetch user data' });
    }
  });

  // Tier changes must go through Stripe checkout — no self-upgrade endpoint.

  // Dashboard stats
  app.get("/api/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Pain Points routes
  app.get("/api/pain-points", requireAuth, async (req, res) => {
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

  app.post("/api/pain-points", requireAuth, async (req, res) => {
    try {
      const validatedData = insertPainPointSchema.parse(req.body);
      const painPoint = await storage.createPainPoint(validatedData);
      res.json(painPoint);
    } catch (error) {
      console.error("Error creating pain point:", error);
      res.status(500).json({ message: "Failed to create pain point" });
    }
  });

  app.patch("/api/pain-points/:id/approve", requireAuth, aiLimiter, async (req, res) => {
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
          console.error("OpenAI API error during idea generation:", error);
          // Do not generate mock ideas - require real AI processing
        }
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error approving pain point:", error);
      res.status(500).json({ message: "Failed to approve pain point" });
    }
  });

  // Ideas routes
  app.get("/api/ideas", requireAuth, async (req, res) => {
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

  app.post("/api/ideas", requireAuth, async (req, res) => {
    try {
      const validatedData = insertIdeaSchema.parse(req.body);
      const idea = await storage.createIdea(validatedData);
      res.json(idea);
    } catch (error) {
      console.error("Error creating idea:", error);
      res.status(500).json({ message: "Failed to create idea" });
    }
  });

  app.patch("/api/ideas/:id/approve", requireAuth, async (req, res) => {
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
  app.get("/api/content", requireAuth, async (req, res) => {
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

  app.post("/api/content", requireAuth, async (req, res) => {
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
  app.get("/api/mvps", requireAuth, async (req, res) => {
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

  app.post("/api/mvps", requireAuth, async (req, res) => {
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
  app.get('/api/scraping-jobs', requireAuth, async (req, res) => {
    try {
      const jobs = await storage.getScrapingJobs(10); // Get last 10 jobs
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching scraping jobs:", error);
      res.status(500).json({ message: "Failed to fetch scraping jobs" });
    }
  });

  app.post('/api/scraper/start', scraperLimiter, async (req, res) => {
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
          
          // Use real platform APIs only - no mock data
          console.log(`[Scraper] Starting LIVE scraping for platforms: ${platforms.join(', ')}`);
          
          try {
            foundPainPoints = await scrapeMultiplePlatforms(platforms, query, jobType);
            console.log(`[Scraper] Live APIs returned ${foundPainPoints.length} results`);
          } catch (scrapingError) {
            console.error('[Scraper] Live scraping error:', scrapingError);
            foundPainPoints = [];
          }
          
          if (foundPainPoints.length === 0) {
            console.log('[Scraper] No results from live APIs - job completing with 0 pain points');
          }
          
          // Save all pain points to database (deduplicating by uniqueHash)
          let savedCount = 0;
          let duplicateCount = 0;
          for (const painPoint of foundPainPoints) {
            try {
              // Check for duplicates by uniqueHash
              if (painPoint.uniqueHash) {
                const existing = await storage.getPainPointByHash(painPoint.uniqueHash);
                if (existing) {
                  duplicateCount++;
                  continue;
                }
              }
              await storage.createPainPoint(painPoint);
              savedCount++;
            } catch (saveError) {
              console.error('[Scraper] Failed to save pain point:', saveError);
            }
          }
          console.log(`[Scraper] Saved ${savedCount} new, skipped ${duplicateCount} duplicates`);
          
          await storage.updateScrapingJob(job.id, {
            progress: 60,
            currentAgent: 'analyzer',
            foundPainPoints: savedCount
          });
          
          // Process with AI if we have pain points
          if (savedCount > 0) {
            await storage.updateScrapingJob(job.id, {
              progress: 80,
              currentAgent: 'ai_processor'
            });
          }
          
          await storage.updateScrapingJob(job.id, {
            status: 'completed',
            progress: 100,
            completedTargets: jobData.totalTargets,
            foundPainPoints: savedCount,
            completedAt: new Date(),
            metadata: {
              ...jobData.metadata,
              liveApiOnly: true,
              savedToDB: savedCount,
              duplicatesSkipped: duplicateCount
            }
          });
          
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
  app.get("/api/pipeline/status", requireAuth, async (req, res) => {
    try {
      // Get recent scraping jobs for pipeline status
      const recentJobs = await storage.getScrapingJobs(5);
      
      const allPainPoints = await storage.getPainPoints();
      const allIdeas = await storage.getIdeas();
      const pipelineData = {
        totalJobs: recentJobs.length,
        activeJobs: recentJobs.filter(job => job.status === 'running').length,
        completedJobs: recentJobs.filter(job => job.status === 'completed').length,
        failedJobs: recentJobs.filter(job => job.status === 'failed').length,
        totalPainPoints: allPainPoints.length,
        totalIdeas: allIdeas.length,
        currentTasks: recentJobs.filter(job => job.status === 'running').map(job => ({
          id: job.id,
          agent: job.currentAgent,
          status: job.status,
          progress: job.progress || 0,
          estimatedTimeRemaining: Math.max(0, Math.round((100 - (job.progress || 0)) * 0.3)) + " minutes"
        })),
        agents: [
          { name: "Scraper Agent", status: recentJobs.some(j => j.status === 'running') ? "active" : "idle", tasksProcessed: recentJobs.filter(j => j.status === 'completed').length },
          { name: "Pain Point Summarizer", status: allPainPoints.some(p => p.status === 'pending') ? "active" : "idle", tasksProcessed: allPainPoints.filter(p => p.status === 'approved').length },
          { name: "Content Agent", status: "idle", tasksProcessed: 0 },
          { name: "Template Discovery Agent", status: "idle", tasksProcessed: 0 },
          { name: "Marketing Agent", status: "idle", tasksProcessed: 0 }
        ]
      };
      
      res.json(pipelineData);
    } catch (error) {
      console.error("Error fetching pipeline status:", error);
      res.status(500).json({ message: "Failed to fetch pipeline status" });
    }
  });

  // Agent management routes
  app.get("/api/agents", requireAuth, async (req, res) => {
    try {
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

  app.patch("/api/agents/:id", requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const configuration = req.body;
      // Agent configurations are stored as user settings in the DB
      const userId = getUserId(req);
      await storage.setSetting({ userId: userId!, settingKey: `agent_config_${id}`, settingValue: JSON.stringify(configuration) });
      res.json({ message: `Agent ${id} configuration updated successfully`, configuration });
    } catch (error) {
      console.error("Error updating agent configuration:", error);
      res.status(500).json({ message: "Failed to update agent configuration" });
    }
  });

  // User management routes for CRM (admin only)
  app.get("/api/users", requireAdmin, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      res.json(allUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch("/api/users/:id/features", requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const features = req.body;
      // Store feature overrides as a setting keyed by admin-set user-specific config
      const adminId = getUserId(req);
      await storage.setSetting({ userId: id, settingKey: 'feature_overrides', settingValue: JSON.stringify(features) });
      res.json({ message: `User ${id} features updated successfully`, features });
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

  // Direct credit purchase is disabled — credits are only added by the Stripe webhook
  // after a verified payment. Use /api/stripe/checkout/credits to initiate a purchase.
  app.post("/api/credits/purchase", (_req, res) => {
    res.status(410).json({ message: "Use /api/stripe/checkout/credits to purchase credits." });
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

  // Global settings routes (admin only)
  app.get("/api/global-settings", requireAdmin, async (req, res) => {
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

  app.patch("/api/global-settings", requireAdmin, async (req: any, res) => {
    try {
      const settings = req.body;
      const adminId = getUserId(req);
      await storage.setSetting({ userId: adminId!, settingKey: 'global_settings', settingValue: JSON.stringify(settings) });
      res.json({ message: "Global settings updated successfully", settings });
    } catch (error) {
      console.error("Error updating global settings:", error);
      res.status(500).json({ message: "Failed to update global settings" });
    }
  });

  // Platform API keys — GET returns which keys are configured (not the values)
  app.get("/api/platform-keys", async (req: any, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    res.json({
      TWITTER_BEARER_TOKEN: !!process.env.TWITTER_BEARER_TOKEN,
      YOUTUBE_API_KEY: !!process.env.YOUTUBE_API_KEY,
      TIKTOK_CLIENT_TOKEN: !!process.env.TIKTOK_CLIENT_TOKEN,
      LINKEDIN_ACCESS_TOKEN: !!process.env.LINKEDIN_ACCESS_TOKEN,
      REDDIT_CLIENT_ID: !!process.env.REDDIT_CLIENT_ID,
    });
  });

  // Platform API keys — POST saves to process.env (admin only; add to Replit Secrets for persistence)
  app.post("/api/platform-keys", requireAdmin, async (req: any, res) => {
    const allowed = ['TWITTER_BEARER_TOKEN', 'YOUTUBE_API_KEY', 'TIKTOK_CLIENT_TOKEN', 'LINKEDIN_ACCESS_TOKEN', 'REDDIT_CLIENT_ID'];
    const updated: string[] = [];
    for (const key of allowed) {
      if (req.body[key] !== undefined && req.body[key] !== '') {
        process.env[key] = req.body[key];
        updated.push(key);
      }
    }
    res.json({ message: `Updated ${updated.length} key(s)`, updated });
  });

  // Admin: list all users
  app.get("/api/admin/users", requireAdmin, async (req: any, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      res.json(allUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Admin: change any user's subscription tier
  app.patch("/api/admin/users/:userId/tier", requireAdmin, async (req: any, res) => {
    try {

      const { userId } = req.params;
      const { tier } = req.body;

      if (!['starter', 'professional', 'enterprise'].includes(tier)) {
        return res.status(400).json({ message: "Invalid tier. Must be starter, professional, or enterprise." });
      }

      const tierConfigs = {
        starter:      { apiQuota: 100,  maxJobsPerDay: 3,  platforms: ['reddit', 'hackernews', 'github', 'producthunt', 'quora', 'tiktok', 'indiehackers'] },
        professional: { apiQuota: 500,  maxJobsPerDay: 10, platforms: ['reddit', 'hackernews', 'github', 'producthunt', 'quora', 'tiktok', 'indiehackers', 'linkedin', 'twitter', 'facebook', 'facebookgroups', 'instagram', 'youtube', 'glassdoor', 'indeed', 'amazon', 'googleplay', 'appstore', 'trustpilot', 'g2', 'capterra', 'yelp', 'bbb', 'etsy', 'stackoverflow', 'stackexchange', 'devto', 'medium'] },
        enterprise:   { apiQuota: -1,   maxJobsPerDay: -1, platforms: [] }, // all platforms
      };

      const target = await storage.getUser(userId);
      if (!target) return res.status(404).json({ message: "User not found" });

      await storage.updateUser(userId, { subscriptionTier: tier });

      const updated = await storage.getUser(userId);
      res.json(updated);
    } catch (error) {
      console.error("Error changing user tier:", error);
      res.status(500).json({ message: "Failed to change user tier" });
    }
  });

  // Sample data regeneration route (admin only)
  app.post("/api/admin/regenerate-sample-data", requireAdmin, async (req: any, res) => {
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
