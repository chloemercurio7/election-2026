// 2026 U.S. Midterm Elections - Interactive Application Logic

let activeChart = null;

document.addEventListener("DOMContentLoaded", function () {
  renderNationalMap();
  initDropdown();
  initSearch();
  initMapInteractivity();
  initBattlegroundCards();
  initQuickButtons();

  // Default selection: North Carolina (with verified NCSBE results)
  selectState("NC", false);
});

function renderNationalMap() {
  const svg = document.getElementById("nationalMapSvg");
  if (!svg || !window.STATES_DATA) return;

  let html = "";
  for (const [code, data] of Object.entries(window.STATES_DATA)) {
    if (data.svg_path) {
      html += `<path id="map-state-${code.toLowerCase()}" data-code="${code}" class="us-state-path" d="${data.svg_path}"><title>${data.name} (${code})</title></path>`;
    }
  }
  svg.innerHTML = html;
}

function initDropdown() {
  const select = document.getElementById("stateSelect");
  if (!select || !window.STATES_DATA) return;

  select.innerHTML = '<option value="">-- Select a State or Territory --</option>';

  const stateEntries = Object.entries(window.STATES_DATA).sort((a, b) =>
    a[1].name.localeCompare(b[1].name)
  );

  stateEntries.forEach(([code, data]) => {
    const opt = document.createElement("option");
    opt.value = code;
    opt.textContent = `${data.name} (${code})`;
    select.appendChild(opt);
  });

  select.addEventListener("change", function () {
    if (this.value) {
      selectState(this.value, true);
    }
  });
}

function initSearch() {
  const searchInput = document.getElementById("stateSearch");
  const select = document.getElementById("stateSelect");
  if (!searchInput || !select || !window.STATES_DATA) return;

  searchInput.addEventListener("input", function () {
    const query = this.value.trim().toLowerCase();
    if (!query) return;

    // Check for exact code match
    const upperQuery = query.toUpperCase();
    if (window.STATES_DATA[upperQuery]) {
      selectState(upperQuery, true);
      return;
    }

    // Check for prefix match in state name
    const match = Object.entries(window.STATES_DATA).find(([code, data]) =>
      data.name.toLowerCase().startsWith(query) || data.name.toLowerCase().includes(query)
    );

    if (match) {
      select.value = match[0];
    }
  });

  searchInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      const query = this.value.trim().toLowerCase();
      const match = Object.entries(window.STATES_DATA).find(
        ([code, data]) =>
          code.toLowerCase() === query ||
          data.name.toLowerCase().includes(query)
      );
      if (match) {
        selectState(match[0], true);
      }
    }
  });
}

function initMapInteractivity() {
  const paths = document.querySelectorAll(".us-state-path");
  const tooltip = document.getElementById("mapTooltip");
  const mapWrapper = document.getElementById("svgMapWrapper");

  paths.forEach((path) => {
    const code = path.getAttribute("data-code");
    const stateData = window.STATES_DATA ? window.STATES_DATA[code] : null;

    path.addEventListener("mouseenter", function (e) {
      if (stateData && tooltip) {
        tooltip.innerHTML = `<strong>${stateData.name} (${stateData.code})</strong><br><span style="font-size:0.75rem; color:#93c5fd;">${stateData.key_race_title}</span>`;
        tooltip.style.display = "block";
      }
    });

    path.addEventListener("mousemove", function (e) {
      if (tooltip && mapWrapper) {
        const rect = mapWrapper.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
      }
    });

    path.addEventListener("mouseleave", function () {
      if (tooltip) {
        tooltip.style.display = "none";
      }
    });

    path.addEventListener("click", function () {
      if (code) {
        selectState(code, true);
      }
    });
  });
}

function initBattlegroundCards() {
  document.querySelectorAll(".bg-card").forEach((card) => {
    card.addEventListener("click", function () {
      const code = this.getAttribute("data-code");
      if (code) selectState(code, true);
    });
  });
}

function initQuickButtons() {
  document.querySelectorAll(".quick-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const code = this.getAttribute("data-code");
      if (code) selectState(code, true);
    });
  });
}

function selectState(code, shouldScroll = false) {
  if (!window.STATES_DATA || !window.STATES_DATA[code]) return;
  const state = window.STATES_DATA[code];

  // 1. Update dropdown
  const select = document.getElementById("stateSelect");
  if (select) select.value = code;

  // 2. Update Map highlighting
  document.querySelectorAll(".us-state-path").forEach((p) => {
    p.classList.remove("selected");
  });
  const mapPath = document.getElementById(`map-state-${code.toLowerCase()}`);
  if (mapPath) {
    mapPath.classList.add("selected");
  }

  // 3. Render State Picture & Facts Card
  renderStatePictureCard(state);

  // 4. Render Election Graph Card
  renderElectionGraphCard(state);

  // 5. Render Bullet Points / State Intelligence
  renderStateIntelCard(state);

  // 6. Smooth scroll if user initiated
  if (shouldScroll) {
    const dashboard = document.getElementById("stateDashboard");
    if (dashboard) {
      dashboard.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
}

function renderStatePictureCard(state) {
  const nameEl = document.getElementById("stateNameDisplay");
  const codeEl = document.getElementById("stateCodeDisplay");
  const svgFrame = document.getElementById("stateSvgFrame");

  if (nameEl) nameEl.textContent = state.name;
  if (codeEl) codeEl.textContent = state.code;

  if (svgFrame) {
    svgFrame.innerHTML = `
      <svg viewBox="${state.svg_viewbox}" xmlns="http://www.w3.org/2000/svg">
        <path d="${state.svg_path}" />
      </svg>
    `;
  }

  // Update Facts Pills
  const capitalEl = document.getElementById("factCapital");
  const popEl = document.getElementById("factPopulation");
  const evEl = document.getElementById("factEV");
  const senateEl = document.getElementById("factSenate");
  const houseEl = document.getElementById("factHouse");
  const govEl = document.getElementById("factGov");

  if (capitalEl) capitalEl.textContent = state.capital;
  if (popEl) popEl.textContent = state.population;
  if (evEl) evEl.textContent = `${state.electoral_votes} Votes`;
  if (senateEl) senateEl.textContent = state.senate_seats;
  if (houseEl) houseEl.textContent = state.house_seats;
  if (govEl) govEl.textContent = state.governor;
}

function renderElectionGraphCard(state) {
  const raceTitleEl = document.getElementById("raceHeadlineTitle");
  const raceBadgeEl = document.getElementById("raceStatusBadge");
  const barsListEl = document.getElementById("candidateBarsList");

  if (raceTitleEl) raceTitleEl.textContent = state.key_race_title;

  if (raceBadgeEl) {
    const isOfficial = state.race_status.toLowerCase().includes("official");
    raceBadgeEl.textContent = state.race_status;
    raceBadgeEl.className = "race-status-badge " + (isOfficial ? "status-official" : "status-projection");
  }

  // Update candidate bars list
  if (barsListEl) {
    barsListEl.innerHTML = "";
    state.candidates.forEach((cand) => {
      const partyClass =
        cand.party.toLowerCase().includes("dem")
          ? "party-dem"
          : cand.party.toLowerCase().includes("rep")
          ? "party-rep"
          : "party-ind";

      const formattedVotes = cand.votes ? cand.votes.toLocaleString() + " votes" : "";

      const row = document.createElement("div");
      row.className = "candidate-row";
      row.innerHTML = `
        <div class="candidate-row-header">
          <div class="cand-name-party">
            <span>${cand.name}</span>
            <span class="party-badge ${partyClass}">${cand.party}</span>
          </div>
          <div>
            <strong>${cand.pct.toFixed(1)}%</strong>
            <span style="font-size:0.75rem; color:#64748b; margin-left:6px;">${formattedVotes}</span>
          </div>
        </div>
        <div class="cand-bar-track">
          <div class="cand-bar-fill" style="width: ${cand.pct}%; background-color: ${cand.color};"></div>
        </div>
      `;
      barsListEl.appendChild(row);
    });
  }

  // Render or Update Chart.js
  renderChart(state);
}

function renderChart(state) {
  const canvas = document.getElementById("stateElectionChart");
  if (!canvas || !window.Chart) return;

  if (activeChart) {
    activeChart.destroy();
  }

  const labels = state.candidates.map((c) => c.name);
  const data = state.candidates.map((c) => c.pct);
  const colors = state.candidates.map((c) => c.color);
  const votes = state.candidates.map((c) => (c.votes ? c.votes.toLocaleString() : "N/A"));

  const ctx = canvas.getContext("2d");
  activeChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Vote / Polling Percentage (%)",
          data: data,
          backgroundColor: colors,
          borderRadius: 6,
          borderSkipped: false,
          barThickness: 24,
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const idx = context.dataIndex;
              return ` ${context.parsed.x}% (${votes[idx]} votes)`;
            },
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          max: Math.max(...data) > 70 ? 100 : 70,
          grid: {
            color: "#f1f5f9",
          },
          ticks: {
            callback: function (val) {
              return val + "%";
            },
            font: {
              family: "-apple-system, BlinkMacSystemFont, sans-serif",
            },
          },
        },
        y: {
          grid: {
            display: false,
          },
          ticks: {
            font: {
              weight: "600",
              family: "-apple-system, BlinkMacSystemFont, sans-serif",
            },
          },
        },
      },
      animation: {
        duration: 400,
      },
    },
  });
}

function renderStateIntelCard(state) {
  const issuesList = document.getElementById("stateIssuesList");
  const votingList = document.getElementById("stateVotingInfoList");

  if (issuesList) {
    issuesList.innerHTML = "";
    state.issues.forEach((issue) => {
      const item = document.createElement("div");
      item.className = "issue-tag-item";
      item.innerHTML = `<span class="issue-icon">✦</span><span>${issue}</span>`;
      issuesList.appendChild(item);
    });
  }

  if (votingList) {
    const v = state.voting_info;
    votingList.innerHTML = `
      <div class="voting-info-row">
        <span class="voting-info-label">2026 Primary Election</span>
        <span class="voting-info-val">${v.primary}</span>
      </div>
      <div class="voting-info-row">
        <span class="voting-info-label">General Election Day</span>
        <span class="voting-info-val">${v.general}</span>
      </div>
      <div class="voting-info-row">
        <span class="voting-info-label">Voter Identification Requirement</span>
        <span class="voting-info-val">${v.id_req}</span>
      </div>
      <div class="voting-info-row">
        <span class="voting-info-label">Early Voting / Vote-by-Mail</span>
        <span class="voting-info-val">${v.early}</span>
      </div>
    `;
  }
}
