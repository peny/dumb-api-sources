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



### Additional caveats and dead-ends we explored

- Google News topic feeds and `site:news.google.com` did not enable category-level exclusion. Search operators plus client-side filters remain the most reliable.
- Full-word regex-only matching missed Swedish inflections; substring matching increased recall without noticeable false positives for sports. We keep both options but default to substring.
- Attempted aggressive `-sport` broad keyword blocks increased false negatives (e.g., tech articles mentioning "support"), so we now prefer targeted sports terms and domain filters.
- Yahoo `historical()`/`chart()` can rate-limit under heavy parallelism. We cap concurrency and reuse results when computing YTD to avoid redundant calls.
- TwelveData free tier has tighter rate limits. We avoid multi-symbol fan-out from the client and recommend batching only when necessary.
- Tried relying solely on domain blacklists for sports; too many long-tail domains slip through. Balanced approach: domain blacklist + keyword filters + optional whitelist.


### Preferences, constraints, and conventions (for future assistants)

- **Filtering philosophy**: Prefer precision over recall for excluding sports. It is better to miss a borderline news item than to show sports.
- **Language**: English and Swedish content are common. Swedish sports terms should be caught via substring forms (e.g., `galopp`, `hockey`, `trav`, `fotboll`).
- **Default time scope**: Use `past24h` for Google News unless the caller explicitly requests otherwise.
- **Keyword strategy**: Use lowercase comparison and substring includes. Maintain a curated list for sports; avoid broad terms that collide with common words.
- **Domain strategy**: Keep a conservative sports domain blacklist. Consider an optional whitelist for non-sports high-signal sources if stricter filtering is needed.
- **APIs**: Use `yahoo` as a fallback when `twelvedata` fails or lacks data. Avoid scraping behind consent walls or brittle HTML.
- **Concurrency**: Limit parallel API calls to avoid rate limits (Yahoo and TwelveData). Prefer caching within a single run when possible.
- **Error handling**: Fail soft with structured error messages. If a provider fails, attempt the configured fallback and surface which provider ultimately served the data.
- **Commit style**: Conventional commits (e.g., `feat:`, `fix:`, `chore:`). Small, focused edits and PRs.
- **Branching**: Short-lived feature branches; merge to `main` after review. Keep `main` deployable.
- **Code style**: Clear names, early returns, minimal nesting, no unnecessary comments, explain "why" when it’s non-obvious. Prefer multi-line for clarity.
- **Environment**: Node LTS. Keep dependencies light; avoid heavy frameworks for this utility repo.
- **Config**: Use env vars for API keys and provider toggles. Don’t hardcode secrets.


### Operational notes

- Running examples: `node example.js` (see `README.md` for usage and options).
- Rate limits: Avoid blasting many symbols at once; batch or serialize.
- Timezones: Treat dates as UTC; output in ISO 8601 where applicable.
- Data points: `dailyChangePercent` and `ytdChangePercent` are best-effort; unavailable fields should be omitted rather than zeroed.
- Logging: Prefer concise, structured logs that make provider selection and filters visible when debugging.


### Debug and validation checklist

- Verify Google News results contain no obvious sports from known domains (spot-check 10–20 items).
- Add a few Swedish test headlines with sports inflections to ensure substring filters catch them.
- Force TwelveData failure and confirm Yahoo fallback returns data and flags the source.
- Check that `past24h` truly restricts results by date.
- Run with a small `excludeKeywords` set that intentionally collides with common words to assert we’re not over-filtering.


### Open questions

- Should we maintain a community-editable sports domain list, or keep it project-local?
- Do we want an opt-in whitelist mode for non-sports outlets to maximize precision?
- What’s the acceptable concurrency for Yahoo/TwelveData in CI to stay under rate limits?

