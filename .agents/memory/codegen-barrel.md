---
name: Orval codegen barrel file conflict fix
description: Prevents TS2308 duplicate export errors from orval's auto-generated barrel.
---

When orval generates both the main API file and a zod schemas file in the same output, it also auto-generates a barrel `index.ts` that re-exports both. If the workspace also has a handwritten `index.ts`, the codegen barrel overwrites it and creates conflicts.

**Fix applied:**
1. Zod output in `orval.config.ts` uses `mode: "single"` (not "split") and no `schemas` option.
2. `api-spec/package.json` codegen script has a postscript: after orval runs, overwrite `lib/api-zod/src/index.ts` with the correct barrel content using a node one-liner.

**Why:** orval's "split" mode generates a barrel that conflicts with the workspace barrel when both export the same names.
