---
name: Database driver result semantics
description: Why credit transaction fixes need real-driver regression checks
---
Do not assume raw database execution results are arrays. Driver result formats differ; prefer typed ORM row selection for locking operations.

**Why:** A credit transaction compiled with an `any` cast but failed at runtime because Neon raw execution returned a query-result object rather than an iterable row array.

**How to apply:** Verify credit and refund changes against the actual database driver, including concurrent deductions and additions using disposable test records. A successful bundle build alone does not verify transaction behavior.
