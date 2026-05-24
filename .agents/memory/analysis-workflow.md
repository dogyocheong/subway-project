---
name: Station map analysis workflow
description: How to run the 269-image Claude vision analysis persistently.
---

The analysis script (`pnpm --filter @workspace/scripts run analyze-station-maps`) takes ~45 minutes to process 269 station floor plan images through Claude vision API.

**Rule:** Run it as a Replit workflow (`configureWorkflow`), not a bash background process. Bash background processes (`nohup ... &`) get killed when the shell session ends.

**Result:** Workflow named "Station Map Analysis" with `outputType: "console"`. It runs to completion and then the workflow goes to FINISHED state. Since the script exits early if all images are already processed, restart loops are harmless (immediate exit).

**Output:** `artifacts/api-server/src/routes/indoor-nav-data.json` — 235 stations out of 269 (34 failed due to images exceeding Claude's 8000px dimension limit).

**Why:** Replit workflows survive across shell sessions and are managed by the platform.
