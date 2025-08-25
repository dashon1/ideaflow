// Real platform API integrations for live scraping
import { InsertPainPoint } from "@shared/schema";

export interface PlatformConfig {
  name: string;
  apiKey?: string;
  baseUrl: string;
  rateLimit: number; // requests per minute
  costCredits: number;
  endpoints: {
    search?: string;
    trends?: string;
    posts?: string;
    videos?: string;
    questions?: string;
  };
}

// Platform configurations with real API endpoints
export const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  reddit: {
    name: 'Reddit',
    baseUrl: 'https://oauth.reddit.com',
    rateLimit: 60, // Reddit allows 60 requests per minute
    costCredits: 2,
    endpoints: {
      search: '/api/search',
      posts: '/r/{subreddit}/new',
    }
  },
  twitter: {
    name: 'Twitter/X',
    baseUrl: 'https://api.twitter.com/2',
    rateLimit: 300, // Depends on tier
    costCredits: 4,
    endpoints: {
      search: '/tweets/search/recent',
      trends: '/trends/place',
    }
  },
  tiktok: {
    name: 'TikTok',
    baseUrl: 'https://open-api.tiktok.com',
    rateLimit: 100,
    costCredits: 3,
    endpoints: {
      search: '/research/video/query',
    }
  },
  linkedin: {
    name: 'LinkedIn',
    baseUrl: 'https://api.linkedin.com/v2',
    rateLimit: 60,
    costCredits: 3,
    endpoints: {
      search: '/posts',
    }
  },
  youtube: {
    name: 'YouTube',
    baseUrl: 'https://www.googleapis.com/youtube/v3',
    rateLimit: 100,
    costCredits: 2,
    endpoints: {
      search: '/search',
      videos: '/videos',
    }
  },
  github: {
    name: 'GitHub',
    baseUrl: 'https://api.github.com',
    rateLimit: 5000, // GitHub has generous limits
    costCredits: 1,
    endpoints: {
      search: '/search/issues',
    }
  },
  stackoverflow: {
    name: 'Stack Overflow',
    baseUrl: 'https://api.stackexchange.com/2.3',
    rateLimit: 300,
    costCredits: 1,
    endpoints: {
      search: '/search/advanced',
      questions: '/questions',
    }
  },
  medium: {
    name: 'Medium',
    baseUrl: 'https://api.medium.com/v1',
    rateLimit: 60,
    costCredits: 1,
    endpoints: {
      search: '/posts',
    }
  },
  producthunt: {
    name: 'Product Hunt',
    baseUrl: 'https://api.producthunt.com/v2/api/graphql',
    rateLimit: 60,
    costCredits: 2,
    endpoints: {
      search: '/graphql',
    }
  },
  hackernews: {
    name: 'Hacker News',
    baseUrl: 'https://hacker-news.firebaseio.com/v0',
    rateLimit: 60,
    costCredits: 1,
    endpoints: {
      search: 'https://hn.algolia.com/api/v1/search',
    }
  }
};

// Rate limiting state management
const rateLimits = new Map<string, { count: number; resetTime: number }>();

export class PlatformAPI {
  private config: PlatformConfig;
  
  constructor(platform: string) {
    this.config = PLATFORM_CONFIGS[platform.toLowerCase()];
    if (!this.config) {
      throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  // Check rate limits before making requests
  private async checkRateLimit(): Promise<boolean> {
    const now = Date.now();
    const minuteStart = Math.floor(now / 60000) * 60000;
    const key = `${this.config.name}-${minuteStart}`;
    
    const current = rateLimits.get(key) || { count: 0, resetTime: minuteStart + 60000 };
    
    if (now > current.resetTime) {
      // Reset counter for new minute
      rateLimits.set(key, { count: 1, resetTime: minuteStart + 60000 });
      return true;
    }
    
    if (current.count >= this.config.rateLimit) {
      return false; // Rate limit exceeded
    }
    
    current.count++;
    rateLimits.set(key, current);
    return true;
  }

  // Make API request with rate limiting and error handling
  private async makeRequest(endpoint: string, params: Record<string, any> = {}): Promise<any> {
    if (!(await this.checkRateLimit())) {
      throw new Error(`Rate limit exceeded for ${this.config.name}`);
    }

    const url = new URL(endpoint, this.config.baseUrl);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value.toString());
    });

    try {
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': this.getAuthHeader(),
          'User-Agent': 'IdeaFlow-Bot/1.0',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching from ${this.config.name}:`, error);
      throw error;
    }
  }

  private getAuthHeader(): string {
    // Return appropriate auth header based on platform
    switch (this.config.name) {
      case 'Reddit':
        return `Bearer ${process.env.REDDIT_ACCESS_TOKEN}`;
      case 'Twitter/X':
        return `Bearer ${process.env.TWITTER_BEARER_TOKEN}`;
      case 'GitHub':
        return `token ${process.env.GITHUB_TOKEN || ''}`;
      case 'YouTube':
        return `Bearer ${process.env.YOUTUBE_API_KEY || ''}`;
      default:
        return '';
    }
  }

  // Platform-specific scraping implementations
  async scrapeReddit(subreddit: string, query?: string): Promise<InsertPainPoint[]> {
    try {
      const endpoint = `/r/${subreddit}/search`;
      const params = {
        q: query || 'problem frustration need want',
        restrict_sr: 'true',
        sort: 'relevance',
        limit: 25,
        t: 'week'
      };

      const data = await this.makeRequest(endpoint, params);
      return this.parseRedditData(data);
    } catch (error) {
      console.error('Reddit scraping error:', error);
      return [];
    }
  }

  async scrapeTwitter(query: string): Promise<InsertPainPoint[]> {
    try {
      const endpoint = '/tweets/search/recent';
      const params = {
        query: `${query} -is:retweet lang:en`,
        max_results: 100,
        'tweet.fields': 'created_at,public_metrics,context_annotations'
      };

      const data = await this.makeRequest(endpoint, params);
      return this.parseTwitterData(data);
    } catch (error) {
      console.error('Twitter scraping error:', error);
      return [];
    }
  }

  async scrapeGitHub(query: string): Promise<InsertPainPoint[]> {
    try {
      const endpoint = '/search/issues';
      const params = {
        q: `${query} is:issue state:open`,
        sort: 'reactions',
        order: 'desc',
        per_page: 50
      };

      const data = await this.makeRequest(endpoint, params);
      return this.parseGitHubData(data);
    } catch (error) {
      console.error('GitHub scraping error:', error);
      return [];
    }
  }

  async scrapeHackerNews(query: string): Promise<InsertPainPoint[]> {
    try {
      const params = {
        query,
        tags: 'story',
        hitsPerPage: 50,
        numericFilters: 'created_at_i>=' + (Date.now()/1000 - 7*24*3600) // Last 7 days
      };

      const data = await this.makeRequest(this.config.endpoints.search!, params);
      return this.parseHackerNewsData(data);
    } catch (error) {
      console.error('Hacker News scraping error:', error);
      return [];
    }
  }

  // Data parsing methods for each platform
  private parseRedditData(data: any): InsertPainPoint[] {
    if (!data.data?.children) return [];

    return data.data.children.map((post: any) => ({
      platform: 'Reddit',
      sourceLink: `https://reddit.com${post.data.permalink}`,
      title: post.data.title,
      fullText: `${post.data.title}. ${post.data.selftext || ''}`.substring(0, 2000),
      engagementScore: post.data.score + post.data.num_comments,
      detectedNiche: this.detectNiche(post.data.title),
      problemType: this.detectProblemType(post.data.title + ' ' + post.data.selftext),
      mode: 'discovery',
      status: 'pending',
      uniqueHash: this.generateHash(post.data.title, 'Reddit'),
    }));
  }

  private parseTwitterData(data: any): InsertPainPoint[] {
    if (!data.data) return [];

    return data.data.map((tweet: any) => ({
      platform: 'Twitter/X',
      sourceLink: `https://twitter.com/i/web/status/${tweet.id}`,
      title: tweet.text.substring(0, 200),
      fullText: tweet.text,
      engagementScore: (tweet.public_metrics?.like_count || 0) + 
                      (tweet.public_metrics?.retweet_count || 0) + 
                      (tweet.public_metrics?.reply_count || 0),
      detectedNiche: this.detectNiche(tweet.text),
      problemType: this.detectProblemType(tweet.text),
      mode: 'discovery',
      status: 'pending',
      uniqueHash: this.generateHash(tweet.text, 'Twitter/X'),
    }));
  }

  private parseGitHubData(data: any): InsertPainPoint[] {
    if (!data.items) return [];

    return data.items.map((issue: any) => ({
      platform: 'GitHub',
      sourceLink: issue.html_url,
      title: issue.title,
      fullText: `${issue.title}. ${issue.body || ''}`.substring(0, 2000),
      engagementScore: (issue.reactions?.total_count || 0) + (issue.comments || 0),
      detectedNiche: 'Development',
      problemType: this.detectProblemType(issue.title + ' ' + issue.body),
      mode: 'discovery',
      status: 'pending',
      uniqueHash: this.generateHash(issue.title, 'GitHub'),
    }));
  }

  private parseHackerNewsData(data: any): InsertPainPoint[] {
    if (!data.hits) return [];

    return data.hits.map((story: any) => ({
      platform: 'Hacker News',
      sourceLink: story.url || `https://news.ycombinator.com/item?id=${story.objectID}`,
      title: story.title,
      fullText: story.title,
      engagementScore: story.points + story.num_comments,
      detectedNiche: 'Technology',
      problemType: this.detectProblemType(story.title),
      mode: 'discovery',
      status: 'pending',
      uniqueHash: this.generateHash(story.title, 'Hacker News'),
    }));
  }

  // Utility methods
  private detectNiche(text: string): string {
    const niches = {
      'Productivity': ['productivity', 'task', 'time', 'organize', 'workflow'],
      'SaaS': ['saas', 'software', 'platform', 'service'],
      'Finance': ['money', 'finance', 'budget', 'payment', 'crypto'],
      'Health': ['health', 'fitness', 'medical', 'wellness'],
      'Education': ['learn', 'education', 'course', 'student', 'teach'],
      'E-commerce': ['shop', 'store', 'ecommerce', 'marketplace', 'sell'],
      'Social': ['social', 'community', 'network', 'friend'],
      'Development': ['code', 'programming', 'developer', 'api', 'framework'],
    };

    const lowercaseText = text.toLowerCase();
    for (const [niche, keywords] of Object.entries(niches)) {
      if (keywords.some(keyword => lowercaseText.includes(keyword))) {
        return niche;
      }
    }
    return 'General';
  }

  private detectProblemType(text: string): string {
    const lowercaseText = text.toLowerCase();
    
    if (lowercaseText.includes('problem') || lowercaseText.includes('frustrat') || 
        lowercaseText.includes('annoying') || lowercaseText.includes('struggle')) {
      return 'Pain Point';
    }
    
    if (lowercaseText.includes('wish') || lowercaseText.includes('want') || 
        lowercaseText.includes('would love') || lowercaseText.includes('need')) {
      return 'Opportunity';
    }
    
    if (lowercaseText.includes('missing') || lowercaseText.includes('lacks') || 
        lowercaseText.includes('should have') || lowercaseText.includes('feature')) {
      return 'Feature Gap';
    }
    
    return 'Pain Point';
  }

  private generateHash(text: string, platform: string): string {
    return Buffer.from(text + platform).toString('base64').slice(0, 16);
  }
}

// Factory function to create platform API instances
export function createPlatformAPI(platform: string): PlatformAPI {
  return new PlatformAPI(platform);
}

// Batch scraping across multiple platforms
export async function scrapeMultiplePlatforms(
  platforms: string[], 
  query: string = 'problem need frustration',
  mode: string = 'discovery'
): Promise<InsertPainPoint[]> {
  const results: InsertPainPoint[] = [];
  
  for (const platform of platforms) {
    try {
      const api = createPlatformAPI(platform);
      let platformResults: InsertPainPoint[] = [];
      
      switch (platform.toLowerCase()) {
        case 'reddit':
          // Scrape multiple subreddits for better coverage
          const subreddits = ['productivity', 'entrepreneur', 'SaaS', 'startups'];
          for (const subreddit of subreddits) {
            const subredditResults = await api.scrapeReddit(subreddit, query);
            platformResults.push(...subredditResults);
          }
          break;
          
        case 'twitter':
          platformResults = await api.scrapeTwitter(query);
          break;
          
        case 'github':
          platformResults = await api.scrapeGitHub(query);
          break;
          
        case 'hackernews':
          platformResults = await api.scrapeHackerNews(query);
          break;
          
        default:
          console.warn(`Scraping not implemented for platform: ${platform}`);
      }
      
      results.push(...platformResults);
      
      // Add delay between platforms to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`Error scraping ${platform}:`, error);
      // Continue with other platforms even if one fails
    }
  }
  
  return results;
}