import { InsertPainPoint } from "@shared/schema";
import crypto from "crypto";

function generateHash(text: string, platform: string): string {
  return crypto.createHash('md5').update(`${platform}:${text}`).digest('hex');
}

function detectNiche(text: string): string {
  const niches: Record<string, string[]> = {
    'Productivity': ['productivity', 'workflow', 'efficiency', 'time management', 'automation', 'task', 'organize'],
    'Finance': ['money', 'budget', 'invest', 'finance', 'income', 'expense', 'tax', 'payment', 'billing'],
    'Health': ['health', 'fitness', 'workout', 'diet', 'wellness', 'medical', 'exercise'],
    'Education': ['learn', 'study', 'course', 'education', 'student', 'teach', 'school'],
    'Business': ['business', 'startup', 'entrepreneur', 'company', 'customer', 'client', 'revenue'],
    'Development': ['code', 'programming', 'developer', 'software', 'api', 'bug', 'deploy'],
    'Design': ['design', 'ui', 'ux', 'graphic', 'visual', 'layout', 'interface'],
    'Marketing': ['marketing', 'seo', 'ads', 'content', 'social media', 'brand', 'campaign'],
  };

  const lowerText = text.toLowerCase();
  for (const [niche, keywords] of Object.entries(niches)) {
    if (keywords.some(kw => lowerText.includes(kw))) {
      return niche;
    }
  }
  return 'General';
}

function detectProblemType(text: string): string {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('need') || lowerText.includes('want') || lowerText.includes('wish')) {
    return 'Feature Gap';
  }
  if (lowerText.includes('frustrat') || lowerText.includes('annoying') || lowerText.includes('hate') || lowerText.includes('problem')) {
    return 'Pain Point';
  }
  if (lowerText.includes('opportunity') || lowerText.includes('could') || lowerText.includes('should')) {
    return 'Opportunity';
  }
  return 'Pain Point';
}

export async function scrapeHackerNews(query: string): Promise<InsertPainPoint[]> {
  try {
    const searchUrl = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=20`;
    
    console.log(`[HackerNews] Fetching: ${searchUrl}`);
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      throw new Error(`HackerNews API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`[HackerNews] Got ${data.hits?.length || 0} results`);
    
    if (!data.hits || data.hits.length === 0) {
      return [];
    }
    
    return data.hits
      .filter((hit: any) => hit.title && hit.points > 5)
      .map((hit: any) => ({
        platform: 'Hacker News',
        sourceLink: `https://news.ycombinator.com/item?id=${hit.objectID}`,
        title: hit.title,
        fullText: `${hit.title}. ${hit.story_text || hit.url || ''}`.substring(0, 2000),
        engagementScore: hit.points + (hit.num_comments || 0),
        detectedNiche: detectNiche(hit.title),
        problemType: detectProblemType(hit.title),
        mode: 'Discovery',
        status: 'pending',
        uniqueHash: generateHash(hit.title, 'HackerNews'),
      }));
  } catch (error) {
    console.error('[HackerNews] Scraping error:', error);
    throw error;
  }
}

export async function scrapeGitHub(query: string): Promise<InsertPainPoint[]> {
  try {
    const searchUrl = `https://api.github.com/search/issues?q=${encodeURIComponent(query)}+is:issue+state:open&sort=reactions&order=desc&per_page=20`;
    
    console.log(`[GitHub] Fetching: ${searchUrl}`);
    const response = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'IdeaFlow-Bot/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`[GitHub] Got ${data.items?.length || 0} results`);
    
    if (!data.items || data.items.length === 0) {
      return [];
    }
    
    return data.items
      .filter((issue: any) => issue.title && issue.reactions && issue.reactions.total_count > 0)
      .map((issue: any) => ({
        platform: 'GitHub',
        sourceLink: issue.html_url,
        title: issue.title.substring(0, 200),
        fullText: `${issue.title}. ${issue.body || ''}`.substring(0, 2000),
        engagementScore: issue.reactions.total_count + issue.comments,
        detectedNiche: detectNiche(issue.title + ' ' + (issue.body || '')),
        problemType: detectProblemType(issue.title + ' ' + (issue.body || '')),
        mode: 'Discovery',
        status: 'pending',
        uniqueHash: generateHash(issue.title, 'GitHub'),
      }));
  } catch (error) {
    console.error('[GitHub] Scraping error:', error);
    throw error;
  }
}

export async function scrapeReddit(subreddit: string, query: string): Promise<InsertPainPoint[]> {
  try {
    const searchUrl = `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(query)}&restrict_sr=1&sort=relevance&limit=20&t=week`;
    
    console.log(`[Reddit] Fetching: ${searchUrl}`);
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'IdeaFlow-Bot/1.0 (by /u/ideaflow)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status}`);
    }
    
    const data = await response.json();
    const posts = data.data?.children || [];
    console.log(`[Reddit] Got ${posts.length} results from r/${subreddit}`);
    
    if (posts.length === 0) {
      return [];
    }
    
    return posts
      .filter((post: any) => post.data.title && post.data.score > 5)
      .map((post: any) => ({
        platform: 'Reddit',
        sourceLink: `https://reddit.com${post.data.permalink}`,
        title: post.data.title.substring(0, 200),
        fullText: `${post.data.title}. ${post.data.selftext || ''}`.substring(0, 2000),
        engagementScore: post.data.score + post.data.num_comments,
        detectedNiche: detectNiche(post.data.title + ' ' + (post.data.selftext || '')),
        problemType: detectProblemType(post.data.title + ' ' + (post.data.selftext || '')),
        mode: 'Discovery',
        status: 'pending',
        uniqueHash: generateHash(post.data.title, 'Reddit'),
      }));
  } catch (error) {
    console.error('[Reddit] Scraping error:', error);
    throw error;
  }
}

export async function scrapeProductHunt(): Promise<InsertPainPoint[]> {
  try {
    const url = 'https://www.producthunt.com/frontend/graphql';
    console.log('[ProductHunt] Fetching recent discussions...');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'IdeaFlow-Bot/1.0'
      },
      body: JSON.stringify({
        query: `query { posts(first: 20, order: VOTES) { edges { node { id name tagline votesCount commentsCount url } } } }`
      })
    });
    
    if (!response.ok) {
      throw new Error(`ProductHunt API error: ${response.status}`);
    }
    
    const data = await response.json();
    const posts = data.data?.posts?.edges || [];
    console.log(`[ProductHunt] Got ${posts.length} results`);
    
    return posts.map((edge: any) => ({
      platform: 'Product Hunt',
      sourceLink: edge.node.url,
      title: edge.node.name,
      fullText: `${edge.node.name}: ${edge.node.tagline}`,
      engagementScore: edge.node.votesCount + edge.node.commentsCount,
      detectedNiche: detectNiche(edge.node.name + ' ' + edge.node.tagline),
      problemType: 'Opportunity',
      mode: 'Discovery',
      status: 'pending',
      uniqueHash: generateHash(edge.node.name, 'ProductHunt'),
    }));
  } catch (error) {
    console.error('[ProductHunt] Scraping error:', error);
    throw error;
  }
}

export async function scrapePlatform(
  platform: string,
  mode: string = "discovery",
  niche?: string
): Promise<InsertPainPoint[]> {
  const query = niche || 'problem frustration need want help';
  
  switch (platform.toLowerCase()) {
    case 'hackernews':
    case 'hacker news':
      return scrapeHackerNews(query);
      
    case 'github':
      return scrapeGitHub(query);
      
    case 'reddit':
      const subreddits = ['entrepreneur', 'startups', 'SaaS', 'smallbusiness'];
      const allResults: InsertPainPoint[] = [];
      for (const sub of subreddits) {
        try {
          const results = await scrapeReddit(sub, query);
          allResults.push(...results);
          await new Promise(r => setTimeout(r, 1000));
        } catch (e) {
          console.error(`[Reddit] Failed to scrape r/${sub}:`, e);
        }
      }
      return allResults;
      
    case 'producthunt':
    case 'product hunt':
      return scrapeProductHunt();
      
    default:
      console.warn(`[Scraper] Platform "${platform}" not yet implemented for live scraping`);
      return [];
  }
}

export async function scrapeAllPlatforms(
  platforms: string[] = ["hackernews", "github"],
  mode: string = "discovery",
  niche?: string
): Promise<InsertPainPoint[]> {
  const results: InsertPainPoint[] = [];
  
  for (const platform of platforms) {
    try {
      console.log(`[Scraper] Starting live scrape for: ${platform}`);
      const painPoints = await scrapePlatform(platform, mode, niche);
      console.log(`[Scraper] Got ${painPoints.length} results from ${platform}`);
      results.push(...painPoints);
      
      await new Promise(r => setTimeout(r, 1000));
    } catch (error) {
      console.error(`[Scraper] Error scraping ${platform}:`, error);
    }
  }
  
  console.log(`[Scraper] Total results: ${results.length}`);
  return results;
}
