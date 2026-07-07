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

export async function scrapeTwitter(query: string): Promise<InsertPainPoint[]> {
  const token = process.env.TWITTER_BEARER_TOKEN;
  if (!token) {
    console.log('[Twitter/X] No TWITTER_BEARER_TOKEN set — skipping');
    return [];
  }
  try {
    const url = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query + ' -is:retweet lang:en')}&max_results=100&tweet.fields=created_at,public_metrics,text`;
    console.log(`[Twitter/X] Fetching recent tweets...`);
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
      console.error(`[Twitter/X] API error: ${response.status} ${await response.text()}`);
      return [];
    }
    const data = await response.json();
    const tweets = data.data || [];
    console.log(`[Twitter/X] Got ${tweets.length} results`);
    return tweets
      .filter((t: any) => t.text && (t.public_metrics?.like_count || 0) > 2)
      .map((t: any) => ({
        platform: 'Twitter/X',
        sourceLink: `https://twitter.com/i/web/status/${t.id}`,
        title: t.text.substring(0, 200),
        fullText: t.text.substring(0, 2000),
        engagementScore: (t.public_metrics?.like_count || 0) + (t.public_metrics?.retweet_count || 0) + (t.public_metrics?.reply_count || 0),
        detectedNiche: detectNiche(t.text),
        problemType: detectProblemType(t.text),
        mode: 'Discovery',
        status: 'pending',
        uniqueHash: generateHash(t.id, 'Twitter'),
      }));
  } catch (error) {
    console.error('[Twitter/X] Scraping error:', error);
    return [];
  }
}

export async function scrapeYouTube(query: string): Promise<InsertPainPoint[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.log('[YouTube] No YOUTUBE_API_KEY set — skipping');
    return [];
  }
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=25&order=relevance&key=${apiKey}`;
    console.log(`[YouTube] Searching videos...`);
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`[YouTube] API error: ${response.status} ${await response.text()}`);
      return [];
    }
    const data = await response.json();
    const items = data.items || [];
    console.log(`[YouTube] Got ${items.length} results`);
    return items
      .filter((v: any) => v.snippet?.title)
      .map((v: any) => ({
        platform: 'YouTube',
        sourceLink: `https://www.youtube.com/watch?v=${v.id?.videoId}`,
        title: v.snippet.title.substring(0, 200),
        fullText: `${v.snippet.title}. ${v.snippet.description || ''}`.substring(0, 2000),
        engagementScore: 0,
        detectedNiche: detectNiche(v.snippet.title + ' ' + (v.snippet.description || '')),
        problemType: detectProblemType(v.snippet.title + ' ' + (v.snippet.description || '')),
        mode: 'Discovery',
        status: 'pending',
        uniqueHash: generateHash(v.id?.videoId || v.snippet.title, 'YouTube'),
      }));
  } catch (error) {
    console.error('[YouTube] Scraping error:', error);
    return [];
  }
}

export async function scrapeTikTok(query: string): Promise<InsertPainPoint[]> {
  const token = process.env.TIKTOK_CLIENT_TOKEN;
  if (!token) {
    console.log('[TikTok] No TIKTOK_CLIENT_TOKEN set — skipping');
    return [];
  }
  try {
    const url = 'https://open.tiktokapis.com/v2/research/video/query/';
    console.log(`[TikTok] Searching videos...`);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: { and: [{ operation: 'IN', field_name: 'keyword', field_values: [query] }] },
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10).replace(/-/g, ''),
        end_date: new Date().toISOString().slice(0, 10).replace(/-/g, ''),
        max_count: 20,
        fields: 'id,video_description,like_count,comment_count,share_count,view_count',
      }),
    });
    if (!response.ok) {
      console.error(`[TikTok] API error: ${response.status} ${await response.text()}`);
      return [];
    }
    const data = await response.json();
    const videos = data.data?.videos || [];
    console.log(`[TikTok] Got ${videos.length} results`);
    return videos
      .filter((v: any) => v.video_description)
      .map((v: any) => ({
        platform: 'TikTok',
        sourceLink: `https://www.tiktok.com/video/${v.id}`,
        title: (v.video_description || '').substring(0, 200),
        fullText: (v.video_description || '').substring(0, 2000),
        engagementScore: (v.like_count || 0) + (v.comment_count || 0) + (v.share_count || 0),
        detectedNiche: detectNiche(v.video_description || ''),
        problemType: detectProblemType(v.video_description || ''),
        mode: 'Discovery',
        status: 'pending',
        uniqueHash: generateHash(v.id || v.video_description, 'TikTok'),
      }));
  } catch (error) {
    console.error('[TikTok] Scraping error:', error);
    return [];
  }
}

export async function scrapeLinkedIn(query: string): Promise<InsertPainPoint[]> {
  const token = process.env.LINKEDIN_ACCESS_TOKEN;
  if (!token) {
    console.log('[LinkedIn] No LINKEDIN_ACCESS_TOKEN set — skipping');
    return [];
  }
  try {
    const url = `https://api.linkedin.com/v2/search?q=content&keywords=${encodeURIComponent(query)}&count=25`;
    console.log(`[LinkedIn] Searching posts...`);
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Restli-Protocol-Version': '2.0.0',
      }
    });
    if (!response.ok) {
      console.error(`[LinkedIn] API error: ${response.status} ${await response.text()}`);
      return [];
    }
    const data = await response.json();
    const elements = data.elements || [];
    console.log(`[LinkedIn] Got ${elements.length} results`);
    return elements
      .filter((e: any) => e.commentary || e.specificContent)
      .map((e: any) => {
        const text = e.commentary || e.specificContent?.['com.linkedin.ugc.ShareContent']?.shareCommentary?.text || '';
        return {
          platform: 'LinkedIn',
          sourceLink: `https://www.linkedin.com/feed/update/${e.id}`,
          title: text.substring(0, 200),
          fullText: text.substring(0, 2000),
          engagementScore: (e.socialDetail?.totalSocialActivityCounts?.numLikes || 0) + (e.socialDetail?.totalSocialActivityCounts?.numComments || 0),
          detectedNiche: detectNiche(text),
          problemType: detectProblemType(text),
          mode: 'Discovery',
          status: 'pending',
          uniqueHash: generateHash(e.id || text, 'LinkedIn'),
        };
      });
  } catch (error) {
    console.error('[LinkedIn] Scraping error:', error);
    return [];
  }
}

export async function scrapeStackOverflow(query: string): Promise<InsertPainPoint[]> {
  try {
    const url = `https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=votes&q=${encodeURIComponent(query)}&site=stackoverflow&pagesize=25&filter=default`;
    console.log(`[StackOverflow] Fetching: ${url}`);
    
    const response = await fetch(url, {
      headers: { 'Accept-Encoding': 'identity' }
    });
    
    if (!response.ok) {
      throw new Error(`StackOverflow API error: ${response.status}`);
    }
    
    const data = await response.json();
    const items = data.items || [];
    console.log(`[StackOverflow] Got ${items.length} results`);
    
    return items
      .filter((q: any) => q.title && q.score >= 0)
      .map((q: any) => ({
        platform: 'Stack Overflow',
        sourceLink: q.link,
        title: q.title.substring(0, 200),
        fullText: `${q.title}. Tags: ${(q.tags || []).join(', ')}`.substring(0, 2000),
        engagementScore: q.score + (q.answer_count || 0) + (q.view_count || 0),
        detectedNiche: 'Development',
        problemType: detectProblemType(q.title),
        mode: 'Discovery',
        status: 'pending',
        uniqueHash: generateHash(q.title, 'StackOverflow'),
      }));
  } catch (error) {
    console.error('[StackOverflow] Scraping error:', error);
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
      
    case 'stackoverflow':
    case 'stack overflow':
      return scrapeStackOverflow(query);

    case 'twitter':
    case 'twitter/x':
      return scrapeTwitter(query);

    case 'youtube':
      return scrapeYouTube(query);

    case 'tiktok':
      return scrapeTikTok(query);

    case 'linkedin':
      return scrapeLinkedIn(query);

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
