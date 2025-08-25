// Competitive pricing strategy based on market research
// Market rates: Scraping $0.001-0.005/request, GPT-4o $0.005-0.015/1k tokens

export interface PricingTier {
  id: string;
  name: string;
  monthlyPrice: number;
  monthlyCredits: number;
  creditsPerDollar: number;
  platforms: number;
  features: string[];
  isPopular?: boolean;
}

export interface CreditCost {
  operation: string;
  credits: number;
  description: string;
}

// Credit cost structure (competitive with market)
export const CREDIT_COSTS: Record<string, number> = {
  // Scraping operations (competitive with $0.002/request market rate)
  SCRAPE_REDDIT: 2,
  SCRAPE_TIKTOK: 3, // Higher cost due to complexity
  SCRAPE_TWITTER: 4, // Higher cost due to API fees
  SCRAPE_QUORA: 2,
  SCRAPE_LINKEDIN: 3,
  SCRAPE_INSTAGRAM: 3,
  SCRAPE_YOUTUBE: 2,
  SCRAPE_FACEBOOK: 3,
  SCRAPE_MEDIUM: 1,
  SCRAPE_HACKERNEWS: 1,
  SCRAPE_PRODUCTHUNT: 2,
  SCRAPE_INDIEHACKERS: 2,
  SCRAPE_GITHUB: 1,
  SCRAPE_STACKOVERFLOW: 1,
  SCRAPE_DISCORD: 2,
  SCRAPE_SLACK: 2,
  
  // AI processing operations (based on GPT-4o costs)
  AI_SUMMARIZE_PAIN_POINT: 5, // ~$0.01 in GPT-4o costs
  AI_CLASSIFY_IDEA: 3,
  AI_GENERATE_MVP_SPEC: 15,
  AI_CONTENT_GENERATION: 10,
  
  // Platform operations
  MVP_GENERATION: 50, // External service costs
  CONTENT_VIDEO_GENERATION: 25,
  CONTENT_IMAGE_GENERATION: 8,
  MARKETING_CAMPAIGN: 20,
};

// Subscription tiers (competitive with market standards)
export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 29, // Competitive with ScraperAPI $49 but with more value
    monthlyCredits: 500,
    creditsPerDollar: 17.2, // 500 credits / $29
    platforms: 5, // Reddit, TikTok, Quora, Product Hunt, Indie Hackers
    features: [
      '500 credits per month',
      '5 social platforms',
      'AI-powered pain point analysis',
      'Basic idea classification',
      'Email support',
      'Basic dashboard',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    monthlyPrice: 79,
    monthlyCredits: 1500,
    creditsPerDollar: 19.0, // Better value per credit
    platforms: 15, // Major platforms
    features: [
      '1,500 credits per month',
      '15 social platforms',
      'Advanced AI processing',
      'MVP generation (2 per month)',
      'Content creation tools',
      'Priority support',
      'Advanced analytics',
      'API access',
    ],
    isPopular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 199,
    monthlyCredits: 5000,
    creditsPerDollar: 25.1, // Best value per credit
    platforms: 50, // All platforms
    features: [
      '5,000 credits per month',
      'All 50+ platforms',
      'Unlimited AI processing',
      'Unlimited MVP generation',
      'Advanced content suite',
      'Custom integrations',
      'Dedicated support',
      'White-label options',
      'Priority processing',
    ],
  },
];

// Credit packages for pay-as-you-go (competitive pricing)
export const CREDIT_PACKAGES = [
  {
    name: 'Starter Pack',
    credits: 100,
    bonusCredits: 0,
    priceUsd: 6.99, // $0.0699 per credit
    stripePriceId: 'price_starter_100',
    sortOrder: 1,
  },
  {
    name: 'Popular Pack',
    credits: 500,
    bonusCredits: 50, // 10% bonus
    priceUsd: 29.99, // $0.0545 per credit (better value)
    stripePriceId: 'price_popular_500',
    sortOrder: 2,
  },
  {
    name: 'Power Pack',
    credits: 1000,
    bonusCredits: 150, // 15% bonus
    priceUsd: 49.99, // $0.0435 per credit (best value)
    stripePriceId: 'price_power_1000',
    sortOrder: 3,
  },
  {
    name: 'Enterprise Pack',
    credits: 5000,
    bonusCredits: 1000, // 20% bonus
    priceUsd: 199.99, // $0.0333 per credit (enterprise rate)
    stripePriceId: 'price_enterprise_5000',
    sortOrder: 4,
  },
];

// Platform access by tier
export const PLATFORM_ACCESS = {
  starter: [
    'reddit', 'tiktok', 'quora', 'producthunt', 'indiehackers'
  ],
  professional: [
    'reddit', 'tiktok', 'quora', 'producthunt', 'indiehackers',
    'linkedin', 'twitter', 'facebook', 'instagram', 'youtube',
    'medium', 'hackernews', 'github', 'stackoverflow', 'discord'
  ],
  enterprise: [
    // All 50+ platforms
    'reddit', 'tiktok', 'quora', 'producthunt', 'indiehackers',
    'linkedin', 'twitter', 'facebook', 'facebookgroups', 'instagram', 'youtube',
    'glassdoor', 'indeed', 'amazon', 'googleplay', 'appstore', 
    'trustpilot', 'g2', 'capterra', 'yelp', 'bbb', 'etsy',
    'github', 'stackoverflow', 'stackexchange', 'devto', 'medium', 'hackernews',
    'substack', 'pinterest', 'tumblr', 'discord', 'slack', 'telegram', 'whatsapp',
    'twitch', 'kick', 'snapchat', 'blind', 'kickstarter', 'indiegogo',
    'mastodon', 'bluesky', 'lemmy', 'kbin', 'superuser', 'askubuntu', 'serverfault',
    'clubhouse', 'spaces', 'productboard', 'canny', 'uservoice', 'featureupvote'
  ]
};

// Calculate credit cost for a scraping job
export function calculateJobCost(platforms: string[], painPointsExpected: number = 10): number {
  const scrapingCost = platforms.reduce((total, platform) => {
    const platformKey = `SCRAPE_${platform.toUpperCase()}`;
    return total + (CREDIT_COSTS[platformKey] || 2); // Default 2 credits per platform
  }, 0);
  
  // Add AI processing cost per expected pain point
  const aiProcessingCost = painPointsExpected * CREDIT_COSTS.AI_SUMMARIZE_PAIN_POINT;
  
  return scrapingCost + aiProcessingCost;
}

// Get pricing tier by ID
export function getPricingTier(tierId: string): PricingTier | undefined {
  return PRICING_TIERS.find(tier => tier.id === tierId);
}

// Check if user has access to platform based on tier
export function hasplatformAccess(userTier: string, platform: string): boolean {
  const tierPlatforms = PLATFORM_ACCESS[userTier as keyof typeof PLATFORM_ACCESS] || [];
  return tierPlatforms.includes(platform.toLowerCase());
}

// Calculate subscription upgrade cost
export function calculateUpgradeCost(fromTier: string, toTier: string, daysRemaining: number): number {
  const fromTierData = getPricingTier(fromTier);
  const toTierData = getPricingTier(toTier);
  
  if (!fromTierData || !toTierData) return 0;
  
  const priceDiff = toTierData.monthlyPrice - fromTierData.monthlyPrice;
  const proratedCost = (priceDiff * daysRemaining) / 30;
  
  return Math.max(0, proratedCost);
}