// Node script: fetch NHL teams, team stats, roster, and scrape TheMorningPuck pages.
// Writes snapshots to data/*.json so the client can read local JSON (avoids CORS).
//
// Run: node scripts/fetch-data.js
// Node 18+ is required (global fetch present)

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const CONFIG = { season: process.env.SEASON || '20252026' };
const NHL_API_BASE = 'https://statsapi.web.nhl.com/api/v1';

async function fetchJSON(url){
  const r = await fetch(url, { headers: { 'User-Agent': 'nhl-fantasy-helper/1.0' } });
  if(!r.ok) throw new Error(`${r.status} ${r.statusText} ${url}`);
  return r.json();
}

async function scrapeMorningPuckTeam(teamSlug){
  const url = `https://themorningpuck.com/line-combinations/${teamSlug}`;
  try{
    const r = await fetch(url, { headers: { 'User-Agent': 'nhl-fantasy-helper/1.0' } });
    if(!r.ok) return { error: `${r.status} ${r.statusText}` };
    const html = await r.text();
    const $ = cheerio.load(html);
    // Find Power Play header
    const ppHeader = $("h2:contains('Power Play'), h3:contains('Power Play')").first();
    let ppText = '';
    if(ppHeader.length){
      let cur = ppHeader.next();
      while(cur.length && !/h[12]/i.test(cur[0].tagName)){
        ppText += $(cur).text() + '\n';
        cur = cur.next();
      }
    } else {
      // fallback: take first 1000 chars of body text
      ppText = $('body').text().slice(0, 1000);
    }
    return { htmlSnippet: ppText.trim(), fetched_at: new Date().toISOString(), source: url };
  }catch(err){
    return { error: err.message };
  }
}

(async ()=>{
  try{
    if(!fs.existsSync('data')) fs.mkdirSync('data');

    console.log('Fetching teams list...');
    const teamsResp = await fetchJSON(`${NHL_API_BASE}/teams?season=${CONFIG.season}`);
    const teams = teamsResp.teams || [];
    fs.writeFileSync(path.join('data','teams.json'), JSON.stringify({ fetched_at: new Date().toISOString(), teams }, null, 2));

    for(const team of teams){
      console.log('Processing:', team.name);
      try{
        const stats = await fetchJSON(`${NHL_API_BASE}/teams/${team.id}/stats?season=${CONFIG.season}`);
        fs.writeFileSync(path.join('data', `team_${team.id}_stats.json`), JSON.stringify({ fetched_at: new Date().toISOString(), stats }, null, 2));
      }catch(e){
        console.warn('Stats fetch failed for', team.name, e.message);
      }

      try{
        const roster = await fetchJSON(`${NHL_API_BASE}/teams/${team.id}?expand=team.roster`);
        fs.writeFileSync(path.join('data', `team_${team.id}_roster.json`), JSON.stringify({ fetched_at: new Date().toISOString(), roster }, null, 2));
      }catch(e){
        console.warn('Roster fetch failed for', team.name, e.message);
      }

      const slug = team.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      try{
        const mp = await scrapeMorningPuckTeam(slug);
        fs.writeFileSync(path.join('data', `morningpuck_${slug}.json`), JSON.stringify(mp, null, 2));
      }catch(e){
        console.warn('MorningPuck scrape failed for', slug, e.message);
      }
    }

    console.log('All done. Data files written to data/*.json');
  }catch(err){
    console.error('fetch-data fatal error', err);
    process.exit(1);
  }
})();
