## Project Progress Overview

### What we accomplished

- **Google News filters**
  - Added `past24h` option to only show news from the last 24 hours.
  - Added `excludeSports` option with expanded keyword list (English + Swedish, incl. horse sports).
  - Implemented pre-query exclusions (`-word`, `-site:`) and post-fetch filters.
  - Added default sports domain blacklist (e.g., `espn.com`, `lavercup.com`, `atptour.com`, `svenskgalopp.se`, and more).
  - Switched to substring-based keyword filtering to catch inflections like “Galopptävlingar”.

- **Yahoo Finance provider and fallback**
  - Added `yahoo` provider using `yahoo-finance2`.
  - Wired fallback in usage: `get('twelvedata', symbol, { fallback: 'yahoo' })` tries Yahoo if TwelveData fails.
  - Implemented helpful aliases: `OMXS30`, `OMXS30GI`, and `NORDEA_GLOBAL_ENHANCED` → `0P0001KL37.ST` (with fallbacks).
  - Responses include `dailyChangePercent` and `ytdChangePercent` when available.
  - Updated `README.md` and `example.js` with usage examples.

- **Repository hygiene**
  - Created feature branches and PRs for each change; merged after review.
  - Cleaned up remote and local branches (including `docs/apis-readme`).

- **Render MCP**
  - Verified access to Render MCP and listed Postgres instances.
  - Confirmed database `dumb-crm-db` (Postgres 17, Frankfurt) status as Available.

### Things we tried that didn’t work (or had caveats)

- **Direct category exclusion in Google News RSS**
  - There is no official RSS parameter to “exclude sports” globally.
  - Best available method is combining search operators (`-word`, `-site:`) with client-side filtering (now implemented).

- **Cherry-picking across branches**
  - Initial cherry-pick produced conflicts in `README.md`, `example.js`, and `googlenews.js`.
  - Resolved by taking the intended feature versions and continuing the cherry-pick.

- **Yahoo Finance consent / historical API**
  - `yahoo-finance2` displays consent/crumb flows and warns that `historical()` maps to `chart()` (deprecation notice). It still works; we use it to compute YTD.

- **Default branch constraints**
  - Couldn’t delete a feature branch that was set as the default; switched default to `main` before deletion.

### Current state

- Main branch contains:
  - Enhanced Google News filtering (`past24h`, `excludeSports`, `excludeKeywords`, `excludeDomains`, domain blacklist).
  - Yahoo provider + fallback path from TwelveData, with daily/YTD returns.
  - Docs and examples updated.

### Possible next steps

- Add a config/env flag to enable Yahoo fallback automatically (no per-call option needed).
- Add default non-sports domain whitelist (optional) for even stronger filtering.
- Expose a `strictSportsFilter` mode that applies more aggressive domain and keyword rules.
- Add tests (snapshot tests for filtering and provider fallbacks).


