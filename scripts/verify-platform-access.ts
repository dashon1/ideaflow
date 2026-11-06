import assert from 'node:assert/strict';
import { PLATFORM_ACCESS, getTierPlatforms, hasPlatformAccess } from '../shared/platform-access';
import { PRICING_TIERS, hasplatformAccess } from '../server/services/pricing';
import { ALL_PLATFORMS, TIER_LIMITS, getPlatformsByTier } from '../client/src/data/platforms';

const expected = {
  starter: { count: 7, price: 49, credits: 750 },
  professional: { count: 15, price: 99, credits: 2000 },
  enterprise: { count: 54, price: 249, credits: 6000 },
};

for (const tier of Object.keys(expected) as (keyof typeof expected)[]) {
  const access = getTierPlatforms(tier);
  const pricing = PRICING_TIERS.find(plan => plan.id === tier)!;
  assert.equal(access.length, expected[tier].count);
  assert.equal(new Set(access).size, access.length, `${tier}: duplicate entitlement`);
  assert.equal(pricing.platforms, access.length);
  assert.equal(pricing.monthlyPrice, expected[tier].price);
  assert.equal(pricing.monthlyCredits, expected[tier].credits);
  assert.ok(pricing.features.some(feature => feature.includes(`${access.length} platforms`)));
  assert.deepEqual(TIER_LIMITS[tier].platforms, access);
  assert.deepEqual(
    getPlatformsByTier(tier).map(platform => platform.id).sort(),
    [...access].sort(),
    `${tier}: catalog and enforced access differ`,
  );
  for (const platform of ALL_PLATFORMS) {
    assert.equal(hasplatformAccess(tier, platform.id), access.includes(platform.id));
    assert.equal(hasPlatformAccess(tier, platform.id.toUpperCase()), access.includes(platform.id));
  }
}

// Guard against the former UI-only expansion of Professional entitlements.
for (const platform of ['facebookgroups', 'glassdoor', 'amazon', 'devto', 'slack']) {
  assert.equal(hasplatformAccess('professional', platform), false);
  assert.equal(getPlatformsByTier('professional').some(item => item.id === platform), false);
}
assert.ok(PLATFORM_ACCESS.professional.includes('discord'));
for (const tier of ['unknown', 'elite', 'standard', 'toString', '__proto__']) {
  assert.deepEqual(getTierPlatforms(tier), []);
  assert.deepEqual(getPlatformsByTier(tier), []);
  assert.equal(hasplatformAccess(tier, 'reddit'), false);
}
assert.equal(hasplatformAccess('enterprise', 'made-up-platform'), false);
console.log('PASS: pricing, settings, scraper catalog and server permissions agree at 7/15/54; prices and credits unchanged');
