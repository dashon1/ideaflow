---
name: Stripe test-key recovery
description: Scope and rationale for bypassing an expired managed sandbox credential
---
User approved a small code change to use their own Stripe test keys through a secure form after the managed sandbox connection expired and repeated connection-management instructions did not resolve it.

**Why:** Adding a secret alone would not replace the managed connector's expired credential. The approved workaround is for testing, not a migration of live payments.

**How to apply:** Keep manual test credentials limited to development. Preserve the managed production connection. Describe this as bypassing the broken sandbox connection, not repairing it, and never ask for keys in chat.
