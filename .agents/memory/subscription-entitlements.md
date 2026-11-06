---
name: Subscription entitlements
description: How to resolve conflicts between marketed platform counts and enforced paid access
---
Preserve the existing enforced server permissions and paid pricing when reconciling platform counts. Do not expand entitlements to match broader catalog labels or outdated UI claims.

**Why:** Pricing, settings and the scraper advertised different counts. The task explicitly required consistency without inventing expanded entitlements; the server's enforced platform lists were selected as the baseline rather than the broader client catalog tiers.

**How to apply:** Treat catalog categories and legacy persisted platform-access values as descriptive, not authorization. Derive advertised counts and selectable platforms from the shared permission lists, and keep server-side checks authoritative.
