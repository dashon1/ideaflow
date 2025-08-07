import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";
import { insertPainPointSchema, insertIdeaSchema, insertMvpSchema } from "@shared/schema";
import { summarizeIdea, classifyIdea } from "./services/openai";
import { scrapePlatform } from "./services/scraper";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard stats
  app.get("/api/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Pain Points routes
  app.get("/api/pain-points", isAuthenticated, async (req, res) => {
    try {
      const { platform, status, niche, limit = 50, offset = 0 } = req.query;
      
      const painPoints = await storage.getPainPoints({
        platform: platform as string,
        status: status as string,
        niche: niche as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      
      res.json(painPoints);
    } catch (error) {
      console.error("Error fetching pain points:", error);
      res.status(500).json({ message: "Failed to fetch pain points" });
    }
  });

  app.post("/api/pain-points", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPainPointSchema.parse(req.body);
      const painPoint = await storage.createPainPoint(validatedData);
      res.json(painPoint);
    } catch (error) {
      console.error("Error creating pain point:", error);
      res.status(500).json({ message: "Failed to create pain point" });
    }
  });

  app.patch("/api/pain-points/:id/approve", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.updatePainPointStatus(id, "approved");
      
      // Generate idea from approved pain point
      const painPoint = await storage.getPainPointById(id);
      if (painPoint) {
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
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error approving pain point:", error);
      res.status(500).json({ message: "Failed to approve pain point" });
    }
  });

  // Ideas routes
  app.get("/api/ideas", isAuthenticated, async (req, res) => {
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

  app.patch("/api/ideas/:id/approve", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.updateIdeaStatus(id, "approved");
      res.json({ success: true });
    } catch (error) {
      console.error("Error approving idea:", error);
      res.status(500).json({ message: "Failed to approve idea" });
    }
  });

  // MVP routes
  app.get("/api/mvps", isAuthenticated, async (req, res) => {
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

  app.post("/api/mvps", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertMvpSchema.parse(req.body);
      const mvp = await storage.createMvp(validatedData);
      res.json(mvp);
    } catch (error) {
      console.error("Error creating MVP:", error);
      res.status(500).json({ message: "Failed to create MVP" });
    }
  });

  // Scraper routes
  app.post("/api/scraper/start", isAuthenticated, async (req, res) => {
    try {
      const { platforms = ["reddit", "tiktok", "quora"], mode = "discovery", niche } = req.body;
      
      const results = [];
      for (const platform of platforms) {
        try {
          const painPoints = await scrapePlatform(platform, mode, niche);
          for (const painPoint of painPoints) {
            const created = await storage.createPainPoint(painPoint);
            results.push(created);
          }
        } catch (error) {
          console.error(`Error scraping ${platform}:`, error);
        }
      }
      
      res.json({ 
        success: true, 
        message: `Successfully scraped ${results.length} pain points`,
        results: results.length 
      });
    } catch (error) {
      console.error("Error starting scraper:", error);
      res.status(500).json({ message: "Failed to start scraper" });
    }
  });

  // Settings routes
  app.get("/api/settings/:key", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { key } = req.params;
      
      const setting = await storage.getSetting(userId, key);
      res.json(setting || { settingKey: key, settingValue: null });
    } catch (error) {
      console.error("Error fetching setting:", error);
      res.status(500).json({ message: "Failed to fetch setting" });
    }
  });

  app.post("/api/settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  const httpServer = createServer(app);
  return httpServer;
}
