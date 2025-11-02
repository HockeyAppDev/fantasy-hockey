const proxy = "https://api.allorigins.win/raw?url=";
const nhlApi = "https://statsapi.web.nhl.com/api/v1/standings";
const teamDataContainer = document.getElementById("teamData");
const lineDataContainer = document.getElementById("lineData");

async function fetchData() {
  try {
    // Fetch NHL team standings
    const response = await fetch(proxy + nhlApi);
    const data = await response.json();

    teamDataContainer.innerHTML = "";

    data.records.forEach(record => {
      record.teamRecords.forEach(team => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${team.team.name}</td>
          <td>${team.gamesPlayed}</td>
          <td>${team.leagueRecord.wins}</td>
          <td>${team.leagueRecord.losses}</td>
          <td>${team.leagueRecord.ot}</td>
          <td>${team.points}</td>
        `;
        teamDataContainer.appendChild(row);
      });
    });

    console.log("✅ NHL data loaded successfully!");
  } catch (error) {
    console.error("Error loading NHL data:", error);
    teamDataContainer.innerHTML = "<tr><td colspan='6'>Error loading data</td></tr>";
  }

  // TheMorningPuck data placeholder (real scraping later)
  try {
    const puckResponse = await fetch(proxy + "https://themorningpuck.com");
    const puckText = await puckResponse.text();

    // Just show a simplified preview for now
    lineDataContainer.textContent = "Powerplay lines loaded from TheMorningPuck (sample data)";
  } catch {
    lineDataContainer.textContent = "Could not load line data.";
  }
}

fetchData();
setInterval(fetchData, 24 * 60 * 60 * 1000); // refresh daily
