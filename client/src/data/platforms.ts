import { PLATFORM_ACCESS, getTierPlatforms } from "@shared/platform-access";

// Catalog labels are metadata, not authorization rules.
export const ALL_PLATFORMS = [
  // Core Platforms (Starter Tier) - Free APIs available
  { id: 'reddit', name: 'Reddit', category: 'Social', tier: 'starter', active: true },
  { id: 'hackernews', name: 'Hacker News', category: 'Tech', tier: 'starter', active: true },
  { id: 'github', name: 'GitHub Issues', category: 'Development', tier: 'starter', active: true },
  { id: 'producthunt', name: 'Product Hunt', category: 'Tech', tier: 'starter', active: true },
  { id: 'quora', name: 'Quora', category: 'Q&A', tier: 'starter', active: true },
  { id: 'tiktok', name: 'TikTok', category: 'Video', tier: 'starter', active: true },
  { id: 'indiehackers', name: 'Indie Hackers', category: 'Startup', tier: 'starter', active: true },
  
  // Professional Networks (Professional Tier)
  { id: 'linkedin', name: 'LinkedIn', category: 'Professional', tier: 'professional', active: true },
  { id: 'twitter', name: 'Twitter/X', category: 'Social', tier: 'professional', active: true },
  { id: 'facebook', name: 'Facebook', category: 'Social', tier: 'professional', active: true },
  { id: 'facebookgroups', name: 'Facebook Groups', category: 'Community', tier: 'professional', active: true },
  { id: 'instagram', name: 'Instagram', category: 'Visual', tier: 'professional', active: true },
  { id: 'youtube', name: 'YouTube', category: 'Video', tier: 'professional', active: true },
  { id: 'glassdoor', name: 'Glassdoor', category: 'Professional', tier: 'professional', active: true },
  { id: 'indeed', name: 'Indeed', category: 'Professional', tier: 'professional', active: true },
  
  // E-commerce & Reviews (Professional Tier)
  { id: 'amazon', name: 'Amazon Reviews', category: 'Reviews', tier: 'professional', active: true },
  { id: 'googleplay', name: 'Google Play Store', category: 'Reviews', tier: 'professional', active: true },
  { id: 'appstore', name: 'App Store', category: 'Reviews', tier: 'professional', active: true },
  { id: 'trustpilot', name: 'Trustpilot', category: 'Reviews', tier: 'professional', active: true },
  { id: 'g2', name: 'G2', category: 'Reviews', tier: 'professional', active: true },
  { id: 'capterra', name: 'Capterra', category: 'Reviews', tier: 'professional', active: true },
  { id: 'yelp', name: 'Yelp', category: 'Reviews', tier: 'professional', active: true },
  { id: 'bbb', name: 'Better Business Bureau', category: 'Reviews', tier: 'professional', active: true },
  { id: 'etsy', name: 'Etsy Reviews', category: 'Reviews', tier: 'professional', active: true },
  
  // Developer Communities (Professional Tier)
  { id: 'stackoverflow', name: 'Stack Overflow', category: 'Development', tier: 'professional', active: true },
  { id: 'stackexchange', name: 'Stack Exchange', category: 'Development', tier: 'professional', active: true },
  { id: 'devto', name: 'Dev.to', category: 'Development', tier: 'professional', active: true },
  { id: 'medium', name: 'Medium Tech Blogs', category: 'Content', tier: 'professional', active: true },
  
  // Content & Publishing (Elite Tier)
  { id: 'substack', name: 'Substack', category: 'Content', tier: 'elite', active: true },
  { id: 'pinterest', name: 'Pinterest', category: 'Visual', tier: 'elite', active: true },
  { id: 'tumblr', name: 'Tumblr', category: 'Blogging', tier: 'elite', active: true },
  
  // Messaging & Communities (Elite Tier)
  { id: 'discord', name: 'Discord', category: 'Community', tier: 'elite', active: true },
  { id: 'slack', name: 'Slack', category: 'Business', tier: 'elite', active: true },
  { id: 'telegram', name: 'Telegram', category: 'Messaging', tier: 'elite', active: true },
  { id: 'whatsapp', name: 'WhatsApp Communities', category: 'Messaging', tier: 'elite', active: true },
  
  // Streaming & Video (Elite Tier)
  { id: 'twitch', name: 'Twitch', category: 'Streaming', tier: 'elite', active: true },
  { id: 'kick', name: 'Kick', category: 'Streaming', tier: 'elite', active: true },
  { id: 'snapchat', name: 'Snapchat', category: 'Video', tier: 'elite', active: true },
  
  // Workplace & Professional (Elite Tier)
  { id: 'blind', name: 'Blind', category: 'Professional', tier: 'elite', active: true },
  
  // Crowdfunding & Innovation (Elite Tier)
  { id: 'kickstarter', name: 'Kickstarter', category: 'Innovation', tier: 'elite', active: true },
  { id: 'indiegogo', name: 'Indiegogo', category: 'Innovation', tier: 'elite', active: true },
  
  // Emerging Platforms (Elite Tier)
  { id: 'mastodon', name: 'Mastodon', category: 'Social', tier: 'elite', active: true },
  { id: 'bluesky', name: 'Bluesky', category: 'Social', tier: 'elite', active: true },
  { id: 'lemmy', name: 'Lemmy', category: 'Social', tier: 'elite', active: true },
  { id: 'kbin', name: 'Kbin', category: 'Social', tier: 'elite', active: true },
  
  // Specialized Technical Communities (Elite Tier)
  { id: 'superuser', name: 'Super User', category: 'Development', tier: 'elite', active: true },
  { id: 'askubuntu', name: 'Ask Ubuntu', category: 'Development', tier: 'elite', active: true },
  { id: 'serverfault', name: 'Server Fault', category: 'Development', tier: 'elite', active: true },
  
  // Audio & Voice (Elite Tier)
  { id: 'clubhouse', name: 'Clubhouse', category: 'Audio', tier: 'elite', active: true },
  { id: 'spaces', name: 'Twitter Spaces', category: 'Audio', tier: 'elite', active: true },
  
  // Niche Forums & Communities (Elite Tier)
  { id: 'productboard', name: 'ProductBoard', category: 'Product', tier: 'elite', active: true },
  { id: 'canny', name: 'Canny', category: 'Feedback', tier: 'elite', active: true },
  { id: 'uservoice', name: 'UserVoice', category: 'Feedback', tier: 'elite', active: true },
  { id: 'featureupvote', name: 'Feature Upvote', category: 'Feedback', tier: 'elite', active: true },
] as const;

export const TIER_LIMITS = {
  starter: {
    platforms: PLATFORM_ACCESS.starter,
    maxJobsPerDay: 3,
    apiQuota: 100,
    features: ['Core platform access', 'Pain point discovery', 'Simple analytics']
  },
  professional: {
    platforms: PLATFORM_ACCESS.professional,
    maxJobsPerDay: 10,
    apiQuota: 500,
    features: ['Advanced scraping', 'AI analysis', 'MVP generation', 'Content creation']
  },
  enterprise: {
    platforms: PLATFORM_ACCESS.enterprise,
    maxJobsPerDay: -1, // Unlimited
    apiQuota: -1, // Unlimited
    features: ['Full platform access', 'Unlimited scraping', 'Priority support', 'Custom integrations']
  }
} as const;

export const PLATFORM_CATEGORIES = [
  'All',
  'Social',
  'Video', 
  'Professional',
  'Tech',
  'Q&A',
  'Content',
  'Community',
  'Development',
  'Visual',
  'Streaming',
  'Reviews',
  'Messaging',
  'Innovation',
  'Audio',
  'Product',
  'Feedback',
  'Blogging',
  'Business',
  'Startup'
] as const;

export function getPlatformsByTier(tier: string) {
  const tierPlatformIds = getTierPlatforms(tier);
  return ALL_PLATFORMS.filter(p => tierPlatformIds.includes(p.id));
}

export function getPlatformsByCategory(category: string) {
  if (category === 'All') return ALL_PLATFORMS;
  return ALL_PLATFORMS.filter(platform => platform.category === category);
}