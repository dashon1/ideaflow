// Competitive pricing strategy based on market research
// Market rates: Scraping $0.001-0.005/request, GPT-4o $0.005-0.015/1k tokens
import { PLATFORM_ACCESS, hasPlatformAccess } from '../../shared/platform-access';
export { PLATFORM_ACCESS } from '../../shared/platform-access';

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

// Stage-based credit cost structure for the IdeaFlow OS
export const CREDIT_COSTS: Record<string, number> = {
  // ===========================================
  // STAGE 1: DISCOVERY (Platform Scraping)
  // ===========================================
  // Open/Easy platforms (1-2 credits)
  SCRAPE_REDDIT: 2,
  SCRAPE_HACKERNEWS: 1,
  SCRAPE_MEDIUM: 1,
  SCRAPE_GITHUB: 1,
  SCRAPE_STACKOVERFLOW: 1,
  SCRAPE_INDIEHACKERS: 2,
  SCRAPE_PRODUCTHUNT: 2,
  
  // Standard platforms (3-4 credits)
  SCRAPE_TIKTOK: 3,
  SCRAPE_YOUTUBE: 3,
  SCRAPE_QUORA: 3,
  SCRAPE_INSTAGRAM: 4,
  SCRAPE_FACEBOOK: 4,
  SCRAPE_DISCORD: 3,
  SCRAPE_SLACK: 3,
  
  // Premium platforms (5-6 credits)
  SCRAPE_LINKEDIN: 6,
  SCRAPE_TWITTER: 5,
  SCRAPE_GLASSDOOR: 5,
  SCRAPE_BLIND: 5,
  
  // Enterprise data sources (4-5 credits)
  SCRAPE_G2: 4,
  SCRAPE_CAPTERRA: 4,
  SCRAPE_TRUSTPILOT: 4,
  SCRAPE_AMAZON: 4,
  SCRAPE_APPSTORE: 4,
  SCRAPE_GOOGLEPLAY: 4,
  
  // ===========================================
  // STAGE 2: AI PROCESSING
  // ===========================================
  AI_PAIN_POINT_SUMMARY: 3,
  AI_DEEP_CLASSIFICATION: 5,
  AI_OPPORTUNITY_SCORING: 4,
  AI_TREND_DETECTION: 6,
  AI_FULL_IDEA_REPORT: 10,
  
  // ===========================================
  // STAGE 3: MVP GENERATION
  // ===========================================
  MVP_SPEC_GENERATION: 15,
  MVP_BASIC_BUILD: 75,
  MVP_FULL_BUILD: 150,
  MVP_TEMPLATE_CUSTOMIZATION: 25,
  
  // ===========================================
  // STAGE 4: CONTENT CREATION
  // ===========================================
  CONTENT_SOCIAL_POST: 3,
  CONTENT_BLOG_ARTICLE: 8,
  CONTENT_IMAGE_GENERATION: 10,
  CONTENT_SHORT_VIDEO: 25,
  CONTENT_FULL_VIDEO: 50,
  CONTENT_LANDING_PAGE: 12,
  
  // ===========================================
  // STAGE 5: DISTRIBUTION
  // ===========================================
  DISTRIBUTION_SOCIAL_PUBLISH: 2,
  DISTRIBUTION_CAMPAIGN_SETUP: 15,
  DISTRIBUTION_AB_TEST: 8,
  DISTRIBUTION_ANALYTICS_REPORT: 5,
};

// Subscription tiers - Premium positioning
export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 49,
    monthlyCredits: 750,
    creditsPerDollar: 15.3,
    platforms: PLATFORM_ACCESS.starter.length,
    features: [
      '750 credits per month',
      `${PLATFORM_ACCESS.starter.length} platforms (Reddit, Hacker News, GitHub Issues, Product Hunt, Quora, TikTok, Indie Hackers)`,
      'Pain point discovery',
      'Basic AI analysis',
      'Idea classification',
      'Email support',
      'Dashboard access',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    monthlyPrice: 99,
    monthlyCredits: 2000,
    creditsPerDollar: 20.2,
    platforms: PLATFORM_ACCESS.professional.length,
    features: [
      '2,000 credits per month',
      `${PLATFORM_ACCESS.professional.length} platforms`,
      'Full AI processing suite',
      'MVP generation (1-2 per month)',
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
    monthlyPrice: 249,
    monthlyCredits: 6000,
    creditsPerDollar: 24.1,
    platforms: PLATFORM_ACCESS.enterprise.length,
    features: [
      '6,000 credits per month',
      `All ${PLATFORM_ACCESS.enterprise.length} platforms`,
      'Unlimited AI processing',
      'Unlimited MVP generation',
      'Full content creation suite',
      'Custom integrations',
      'Dedicated account manager',
      'White-label options',
      'Priority processing queue',
    ],
  },
];

// Credit packages for pay-as-you-go
export const CREDIT_PACKAGES = [
  {
    name: 'Starter Pack',
    credits: 150,
    bonusCredits: 0,
    priceUsd: 9.99,
    stripePriceId: 'price_starter_150',
    sortOrder: 1,
  },
  {
    name: 'Popular Pack',
    credits: 600,
    bonusCredits: 75,
    priceUsd: 39.99,
    stripePriceId: 'price_popular_600',
    sortOrder: 2,
  },
  {
    name: 'Power Pack',
    credits: 1500,
    bonusCredits: 250,
    priceUsd: 89.99,
    stripePriceId: 'price_power_1500',
    sortOrder: 3,
  },
  {
    name: 'Enterprise Pack',
    credits: 6000,
    bonusCredits: 1500,
    priceUsd: 249.99,
    stripePriceId: 'price_enterprise_6000',
    sortOrder: 4,
  },
];

// Calculate credit cost for a scraping job
export function calculateJobCost(platforms: string[], painPointsExpected: number = 10): number {
  const scrapingCost = platforms.reduce((total, platform) => {
    const platformKey = `SCRAPE_${platform.toUpperCase()}`;
    return total + (CREDIT_COSTS[platformKey] || 2); // Default 2 credits per platform
  }, 0);
  
  // Add AI processing cost per expected pain point
  const aiProcessingCost = painPointsExpected * CREDIT_COSTS.AI_PAIN_POINT_SUMMARY;
  
  return scrapingCost + aiProcessingCost;
}

// Get pricing tier by ID
export function getPricingTier(tierId: string): PricingTier | undefined {
  return PRICING_TIERS.find(tier => tier.id === tierId);
}

// Check if user has access to platform based on tier
export function hasplatformAccess(userTier: string, platform: string): boolean {
  return hasPlatformAccess(userTier, platform);
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