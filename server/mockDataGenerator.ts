import { db } from "./db";
import { 
  painPoints, 
  ideas, 
  mvps, 
  content, 
  scrapingJobs,
  type InsertPainPoint,
  type InsertIdea,
  type InsertMvp,
  type InsertContent,
  type InsertScrapingJob
} from "@shared/schema";

// Generate realistic sample data for the entire application
export async function generateComprehensiveMockData() {
  console.log("Generating comprehensive mock data for all app features...");
  
  // Clear existing data
  await db.delete(scrapingJobs);
  await db.delete(content);
  await db.delete(mvps);
  await db.delete(ideas);
  await db.delete(painPoints);

  // Helper functions
  const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);
  const createHash = (title: string, platform: string) => {
    return Buffer.from(title + platform).toString('base64').slice(0, 16);
  };

  // Step 1: Create pain points with diverse data
  const samplePainPoints: InsertPainPoint[] = [
    {
      platform: "Reddit",
      sourceLink: "https://reddit.com/r/productivity/comments/xyz",
      title: "Task management apps fail to handle recurring habits and personal workflow patterns effectively",
      fullText: "I've tried every major productivity app - Todoist, Notion, ClickUp, Asana. None handle the way I actually work. I need recurring tasks that adapt, habit tracking that connects to my calendar, and project templates that remember my preferences. Current apps are either too rigid or too chaotic.",
      engagementScore: 1247,
      detectedNiche: "Productivity",
      problemType: "Pain Point",
      mode: "discovery",
      status: "approved",
      uniqueHash: createHash("Task management apps fail", "Reddit"),
      timestamp: new Date(),
    },
    {
      platform: "TikTok",
      sourceLink: "https://tiktok.com/@startuplife/video/123",
      title: "Small business owners struggle with customer retention and repeat purchase analytics",
      fullText: "Running a small e-commerce store and I can't figure out why customers buy once then never return. Shopify analytics are basic, Google Analytics is confusing. Need simple insights on customer behavior and automated retention campaigns.",
      engagementScore: 892,
      detectedNiche: "E-commerce",
      problemType: "Opportunity",
      mode: "niche",
      status: "approved",
      uniqueHash: createHash("Small business owners struggle", "TikTok"),
      timestamp: new Date(),
    },
    {
      platform: "Quora",
      sourceLink: "https://quora.com/question/remote-work-focus",
      title: "Remote workers need better focus tools that integrate with video calls and slack notifications",
      fullText: "Working from home with constant Slack pings, Zoom calls, and distractions. Current focus apps block everything or nothing. Need smart filtering that knows when I'm in deep work vs available for quick questions.",
      engagementScore: 634,
      detectedNiche: "Remote Work",
      problemType: "Feature Gap",
      mode: "discovery",
      status: "approved",
      uniqueHash: createHash("Remote workers need better", "Quora"),
      timestamp: new Date(),
    },
    {
      platform: "LinkedIn",
      sourceLink: "https://linkedin.com/posts/ceo-insights",
      title: "Freelancers lack tools for managing multiple client projects with different billing structures",
      fullText: "Managing 5+ clients with different billing methods - hourly, project-based, retainer. Current tools like Harvest and Toggl don't handle the complexity. Need unified client management with flexible billing and automatic invoicing.",
      engagementScore: 458,
      detectedNiche: "Business Tools",
      problemType: "Pain Point",
      mode: "niche",
      status: "approved",
      uniqueHash: createHash("Freelancers lack tools", "LinkedIn"),
      timestamp: new Date(),
    },
    {
      platform: "Twitter/X",
      sourceLink: "https://twitter.com/techworker/status/123",
      title: "Developers want AI-powered code review that understands business context, not just syntax",
      fullText: "GitHub Copilot writes code but doesn't review it strategically. Current code review tools check syntax but miss business logic flaws, performance issues in context, and architectural problems. Need AI that understands the whole project.",
      engagementScore: 1156,
      detectedNiche: "Developer Tools",
      problemType: "Opportunity",
      mode: "discovery",
      status: "pending",
      uniqueHash: createHash("Developers want AI-powered", "Twitter/X"),
      timestamp: new Date(),
    },
    {
      platform: "Product Hunt",
      sourceLink: "https://producthunt.com/discussions/content-creation",
      title: "Content creators need automated video editing that preserves their unique style and brand voice",
      fullText: "Spending 8 hours editing 20-minute videos. Tools like Descript and Loom help but don't maintain my specific editing style, music choices, and brand consistency. Need AI that learns my preferences and automates the tedious parts while keeping my creative voice.",
      engagementScore: 723,
      detectedNiche: "Content Creation",
      problemType: "Feature Gap",
      mode: "discovery",
      status: "pending",
      uniqueHash: createHash("Content creators need automated", "Product Hunt"),
      timestamp: new Date(),
    }
  ];

  // Insert pain points and get their IDs
  const insertedPainPoints = [];
  for (const painPoint of samplePainPoints) {
    const [inserted] = await db.insert(painPoints).values(painPoint).returning();
    insertedPainPoints.push(inserted);
  }

  // Step 2: Generate ideas from approved pain points
  const approvedPainPoints = insertedPainPoints.filter(p => p.status === 'approved');
  const insertedIdeas = [];
  
  for (const painPoint of approvedPainPoints) {
    const ideaData: InsertIdea = {
      painPointId: painPoint.id,
      summaryText: `Smart ${painPoint.detectedNiche} solution: ${painPoint.title?.substring(0, 80)}...`,
      problemType: painPoint.problemType || "Pain Point",
      confidenceScore: (Math.random() * 0.3 + 0.7).toFixed(2),
      tags: [painPoint.detectedNiche || "General", painPoint.problemType || "Pain Point", 'validated', 'high-priority'],
      userType: ['entrepreneurs', 'small business owners', 'freelancers', 'remote workers', 'developers'][Math.floor(Math.random() * 5)],
      domain: painPoint.detectedNiche || "General",
      appType: ['SaaS platform', 'mobile app', 'web application', 'browser extension', 'API service'][Math.floor(Math.random() * 5)],
      priorityScore: (Math.random() * 2.5 + 7.5).toFixed(1),
      isWellSolved: Math.random() < 0.25, // 25% are well-solved
      status: Math.random() < 0.8 ? 'approved' : 'pending', // 80% approved
    };
    
    const [inserted] = await db.insert(ideas).values(ideaData).returning();
    insertedIdeas.push(inserted);
  }

  // Step 3: Generate MVPs from approved ideas
  const approvedIdeas = insertedIdeas.filter(i => i.status === 'approved');
  const insertedMvps = [];
  
  for (let i = 0; i < Math.min(approvedIdeas.length, 5); i++) {
    const idea = approvedIdeas[i];
    const mvpData: InsertMvp = {
      ideaId: idea.id,
      name: `${idea.domain} MVP - ${idea.appType}`,
      description: `Production-ready prototype: ${idea.summaryText?.substring(0, 100)}...`,
      platformSelected: ['Lovable', 'Base44', 'Replit', 'V0.dev', 'Cursor'][Math.floor(Math.random() * 5)],
      mvpSpec: { techStack: [
        'React + TypeScript', 'Node.js + Express', 'PostgreSQL', 'OpenAI GPT-4', 
        'Tailwind CSS', 'Drizzle ORM', 'Authentication'
      ].slice(0, Math.floor(Math.random() * 4) + 3) },
      status: ['building', 'deployed', 'testing', 'live'][Math.floor(Math.random() * 4)],
    };
    
    const [inserted] = await db.insert(mvps).values(mvpData).returning();
    insertedMvps.push(inserted);
  }

  // Step 4: Generate content for each MVP
  for (const mvp of insertedMvps) {
    const contentTypes = ['text', 'video', 'image', 'social'];
    const numContentPieces = Math.floor(Math.random() * 3) + 1; // 1-3 pieces per MVP
    
    for (let i = 0; i < numContentPieces; i++) {
      const contentData: InsertContent = {
        mvpId: mvp.id,
        contentType: contentTypes[Math.floor(Math.random() * contentTypes.length)],
        scriptText: `Compelling marketing narrative for ${mvp.name}: Transform your ${mvp.name.split(' ')[0]} workflow with our innovative solution.`,
        videoFormatSelected: ['short-form', 'long-form', 'tutorial', 'demo'][Math.floor(Math.random() * 4)],
        generationPlatformUsed: ['OpenAI GPT-4', 'Claude Sonnet', 'Gemini Pro', 'Custom AI'][Math.floor(Math.random() * 4)],
        linkToGeneratedAsset: `https://content.ideaflow.com/${mvp.id}/asset-${generateId()}`,
        isReadyForDistribution: Math.random() < 0.7, // 70% ready
        metadata: {
          targetAudience: ['entrepreneurs', 'small business', 'developers', 'freelancers'][Math.floor(Math.random() * 4)],
          platform: ['TikTok', 'LinkedIn', 'Twitter', 'Instagram', 'YouTube'][Math.floor(Math.random() * 5)],
          duration: ['15s', '30s', '60s', '3min'][Math.floor(Math.random() * 4)],
          style: ['professional', 'casual', 'educational', 'promotional'][Math.floor(Math.random() * 4)]
        },
      };
      
      await db.insert(content).values(contentData);
    }
  }

  // Step 5: Generate realistic scraping jobs history
  const scrapingJobsData: (typeof scrapingJobs.$inferInsert)[] = [
    {
      jobType: 'niche',
      targetNiche: 'AI automation tools',
      platforms: ['Reddit', 'TikTok', 'Quora'],
      status: 'completed',
      progress: 100,
      currentAgent: 'completed',
      totalTargets: 15,
      completedTargets: 15,
      foundPainPoints: 8,
      startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      completedAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000),
      metadata: { requestedBy: 'demo-user', platforms: ['Reddit', 'TikTok', 'Quora'] },
    },
    {
      jobType: 'discovery',
      targetNiche: null,
      platforms: ['Reddit', 'LinkedIn', 'Twitter/X'],
      status: 'completed',
      progress: 100,
      currentAgent: 'completed',
      totalTargets: 20,
      completedTargets: 20,
      foundPainPoints: 12,
      startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      metadata: { requestedBy: 'demo-user', platforms: ['Reddit', 'LinkedIn', 'Twitter/X'] },
    },
    {
      jobType: 'niche',
      targetNiche: 'remote work productivity',
      platforms: ['Reddit', 'TikTok'],
      status: 'running',
      progress: 67,
      currentAgent: 'filter',
      totalTargets: 10,
      completedTargets: 7,
      foundPainPoints: 4,
      startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      completedAt: null,
      metadata: { requestedBy: 'demo-user', platforms: ['Reddit', 'TikTok'] },
    },
    {
      jobType: 'discovery',
      targetNiche: null,
      platforms: ['Quora', 'Product Hunt'],
      status: 'failed',
      progress: 23,
      currentAgent: 'scraper',
      totalTargets: 15,
      completedTargets: 3,
      foundPainPoints: 0,
      startedAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      completedAt: null,
      metadata: { requestedBy: 'demo-user', platforms: ['Quora', 'Product Hunt'], error: 'Rate limit exceeded' },
    }
  ];

  for (const job of scrapingJobsData) {
    await db.insert(scrapingJobs).values(job);
  }

  console.log(`✅ Generated comprehensive mock data:
    - ${insertedPainPoints.length} pain points
    - ${insertedIdeas.length} ideas  
    - ${insertedMvps.length} MVPs
    - ${insertedMvps.length * 2} content pieces
    - ${scrapingJobsData.length} scraping jobs
  `);
  
  return {
    painPoints: insertedPainPoints.length,
    ideas: insertedIdeas.length,
    mvps: insertedMvps.length,
    content: insertedMvps.length * 2,
    jobs: scrapingJobsData.length
  };
}