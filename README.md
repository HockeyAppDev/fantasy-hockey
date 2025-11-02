# NHL Fantasy Helper — GitHub Codespaces

This project fetches NHL team & player stats and line combinations (TheMorningPuck), snapshots daily via GitHub Actions, and provides a simple UI to help fantasy hockey managers identify power-play players and team strength.

## Quick overview
- Client: `index.html` (reads snapshots from `data/` or calls NHL API directly)
- Server-side fetcher/scraper: `scripts/fetch-data.js`
- Daily snapshot workflow: `.github/workflows/daily-fetch.yml`
- Dependencies: `cheerio` (for HTML parsing) — Node 18+ is required

**Important**: TheMorningPuck has no public API — the fetch script scrapes pages server-side. Respect their Terms of Service and robots.txt. Scraping is fragile; page layout changes may require updates.

## How to run (short)
1. Create a new GitHub repo and add the files in this project.
2. Open the repo in GitHub Codespaces (or clone to a local machine with Node 18+).
3. In Codespaces terminal:
   - `npm install`
   - `node scripts/fetch-data.js`  (creates `data/*.json`)
   - Serve the site: `npx http-server -c-1` and open the preview URL or open `index.html` in the Codespaces browser preview.
4. Enable GitHub Actions in the repo — the included workflow will run daily and commit `data/*.json`.

Read the full instructions in the repo for more detail.
