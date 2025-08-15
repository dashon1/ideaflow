// Complete list of 22+ social media and content platforms for scraping
export const ALL_PLATFORMS = [
  // Core Social Media
  { id: 'reddit', name: 'Reddit', category: 'Social', tier: 'standard', active: true },
  { id: 'tiktok', name: 'TikTok', category: 'Video', tier: 'standard', active: true },
  { id: 'quora', name: 'Quora', category: 'Q&A', tier: 'standard', active: true },
  { id: 'linkedin', name: 'LinkedIn', category: 'Professional', tier: 'pro', active: true },
  { id: 'twitter', name: 'Twitter/X', category: 'Social', tier: 'pro', active: true },
  { id: 'facebook', name: 'Facebook', category: 'Social', tier: 'pro', active: true },
  { id: 'instagram', name: 'Instagram', category: 'Visual', tier: 'pro', active: true },
  { id: 'youtube', name: 'YouTube', category: 'Video', tier: 'pro', active: true },
  
  // Professional & Business
  { id: 'producthunt', name: 'Product Hunt', category: 'Tech', tier: 'standard', active: true },
  { id: 'indiehackers', name: 'Indie Hackers', category: 'Startup', tier: 'standard', active: true },
  { id: 'hackernews', name: 'Hacker News', category: 'Tech', tier: 'pro', active: true },
  { id: 'medium', name: 'Medium', category: 'Content', tier: 'pro', active: true },
  { id: 'substack', name: 'Substack', category: 'Content', tier: 'elite', active: true },
  
  // Specialized Communities
  { id: 'discord', name: 'Discord', category: 'Community', tier: 'elite', active: true },
  { id: 'slack', name: 'Slack', category: 'Business', tier: 'elite', active: true },
  { id: 'telegram', name: 'Telegram', category: 'Messaging', tier: 'elite', active: true },
  { id: 'whatsapp', name: 'WhatsApp', category: 'Messaging', tier: 'elite', active: false },
  
  // Tech & Development
  { id: 'github', name: 'GitHub', category: 'Development', tier: 'pro', active: true },
  { id: 'stackoverflow', name: 'Stack Overflow', category: 'Q&A', tier: 'pro', active: true },
  { id: 'devto', name: 'Dev.to', category: 'Development', tier: 'pro', active: true },
  
  // Video & Streaming
  { id: 'twitch', name: 'Twitch', category: 'Streaming', tier: 'elite', active: true },
  { id: 'snapchat', name: 'Snapchat', category: 'Video', tier: 'elite', active: true },
  
  // Emerging & Niche
  { id: 'clubhouse', name: 'Clubhouse', category: 'Audio', tier: 'elite', active: false },
  { id: 'pinterest', name: 'Pinterest', category: 'Visual', tier: 'pro', active: true },
  { id: 'tumblr', name: 'Tumblr', category: 'Blogging', tier: 'elite', active: true },
] as const;

export const TIER_LIMITS = {
  standard: {
    platforms: ALL_PLATFORMS.filter(p => p.tier === 'standard').map(p => p.id),
    maxJobsPerDay: 3,
    apiQuota: 100,
    features: ['Basic scraping', 'Pain point discovery', 'Simple analytics']
  },
  pro: {
    platforms: ALL_PLATFORMS.filter(p => ['standard', 'pro'].includes(p.tier)).map(p => p.id),
    maxJobsPerDay: 10,
    apiQuota: 500,
    features: ['Advanced scraping', 'AI analysis', 'MVP generation', 'Content creation']
  },
  elite: {
    platforms: ALL_PLATFORMS.map(p => p.id), // All platforms
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
  'Streaming'
] as const;

export function getPlatformsByTier(tier: 'standard' | 'pro' | 'elite') {
  return ALL_PLATFORMS.filter(platform => {
    if (tier === 'standard') return platform.tier === 'standard';
    if (tier === 'pro') return ['standard', 'pro'].includes(platform.tier);
    if (tier === 'elite') return true;
    return false;
  });
}

export function getPlatformsByCategory(category: string) {
  if (category === 'All') return ALL_PLATFORMS;
  return ALL_PLATFORMS.filter(platform => platform.category === category);
}