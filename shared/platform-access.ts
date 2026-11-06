// Preserve the enforced server entitlements. Display counts must be derived
// from these lists, never from catalog categories or separate marketing totals.
export const PLATFORM_ACCESS = {
  starter: [
    'reddit', 'hackernews', 'github', 'producthunt', 'quora', 'tiktok', 'indiehackers',
  ],
  professional: [
    'reddit', 'hackernews', 'github', 'producthunt', 'quora', 'tiktok', 'indiehackers',
    'linkedin', 'twitter', 'facebook', 'instagram', 'youtube',
    'medium', 'stackoverflow', 'discord',
  ],
  enterprise: [
    'reddit', 'tiktok', 'quora', 'producthunt', 'indiehackers',
    'linkedin', 'twitter', 'facebook', 'facebookgroups', 'instagram', 'youtube',
    'glassdoor', 'indeed', 'amazon', 'googleplay', 'appstore',
    'trustpilot', 'g2', 'capterra', 'yelp', 'bbb', 'etsy',
    'github', 'stackoverflow', 'stackexchange', 'devto', 'medium', 'hackernews',
    'substack', 'pinterest', 'tumblr', 'discord', 'slack', 'telegram', 'whatsapp',
    'twitch', 'kick', 'snapchat', 'blind', 'kickstarter', 'indiegogo',
    'mastodon', 'bluesky', 'lemmy', 'kbin', 'superuser', 'askubuntu', 'serverfault',
    'clubhouse', 'spaces', 'productboard', 'canny', 'uservoice', 'featureupvote',
  ],
} as const;

export type SubscriptionTier = keyof typeof PLATFORM_ACCESS;

export function getTierPlatforms(tier: string): readonly string[] {
  return Object.prototype.hasOwnProperty.call(PLATFORM_ACCESS, tier)
    ? PLATFORM_ACCESS[tier as SubscriptionTier]
    : [];
}

export function hasPlatformAccess(tier: string, platform: string): boolean {
  return getTierPlatforms(tier).includes(platform.toLowerCase());
}
