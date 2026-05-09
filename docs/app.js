const STORAGE_KEY = "crux-static-demo-v1";

const seed = {
  participants: [
    { lane: "for", name: "Maya", reason: "X is already where ideas are discovered first. CruX could add a second layer for deeper understanding.", change: "I would reconsider if people clearly preferred fast replies over structured rooms." },
    { lane: "for", name: "Ravi", reason: "X is brilliant at surfacing what people care about. Some posts deserve a space where people explain why they care.", change: "Evidence that users do not want structured follow-up after high-signal posts." },
    { lane: "for", name: "Elena", reason: "X helps ideas travel quickly. CruX could help the best conversations travel more thoughtfully.", change: "If the added friction stopped people from participating." },
    { lane: "for", name: "Jon", reason: "Creators often get likes and quotes but not a clear map of what their audience actually thinks.", change: "If existing replies already gave creators enough structured insight." },
    { lane: "for", name: "Noor", reason: "X creates the spark. CruX could organise the heat around that spark into arguments, questions and common ground.", change: "A better native X feature that already does this." },
    { lane: "for", name: "Daniel", reason: "X is unmatched for discovery, but discovery often needs a second step: collective sense-making.", change: "If people treated CruX as a replacement for replies rather than an enhancement." },
    { lane: "for", name: "Ava", reason: "The best posts often create multiple interpretations. CruX could show those interpretations clearly.", change: "If the final map did not make the conversation easier to understand." },

    { lane: "against", name: "Sam", reason: "Adding rooms might make a simple post feel too heavy. Not every high-signal post needs structure.", change: "If activation stayed fully optional and creator-controlled." },
    { lane: "against", name: "Priya", reason: "I worry it could pull energy away from the public thread where everyone can see the conversation.", change: "If the final CruX Map came back to X clearly." },
    { lane: "against", name: "Theo", reason: "X works because it is low-friction. Asking people for reasons could reduce participation.", change: "If the room made contribution feel easier rather than academic." },
    { lane: "against", name: "Aisha", reason: "CruX may work best for serious posts, but it should not become a default expectation for every popular post.", change: "Clear limits around 50 likes, creator activation and 5-day closure." },
    { lane: "against", name: "Iris", reason: "The best part of X is spontaneous conversation. Too much structure could make it feel artificial.", change: "If the structure only appeared after clear signal and creator intent." },

    { lane: "still", name: "Luca", reason: "The idea is promising, but the key is whether people use it for understanding rather than winning.", change: "A demo showing reasoning weight rather than vote count." },
    { lane: "still", name: "Grace", reason: "I need to understand whether CruX is a debate room, a reflection room, or a map of what people think.", change: "Clear room types or adaptive labels." },
    { lane: "still", name: "Omar", reason: "Structured discussion is valuable only if it feels native to how people already use X.", change: "A lightweight join flow." },
    { lane: "still", name: "Mei", reason: "The question is whether CruX strengthens X conversations or creates a separate destination people forget.", change: "A shareable final result back to X." }
  ],
  contributions: [
    { lane: "for", type: "Evidence", name: "Maya", body: "High-like posts already show public interest. CruX simply asks whether that interest deserves structured follow-up." },
    { lane: "for", type: "Counterargument", name: "Ravi", body: "Against is right that X is powerful because it is low-friction, but CruX only activates after signal and creator consent." },
    { lane: "against", type: "Counterargument", name: "Sam", body: "The For side should avoid assuming deeper is always better. Sometimes the value of X is speed and spontaneity." },
    { lane: "against", type: "Assumption check", name: "Aisha", body: "The Against side assumes added structure may reduce participation by making people feel they are entering a formal debate." },
    { lane: "still", type: "Question", name: "Luca", body: "What is the minimum structure needed to improve understanding without making X feel less spontaneous?" },
    { lane: "still", type: "Change mind", name: "Mei", body: "I would move For if the final CruX Map clearly brought value back to X instead of moving conversation away." }
  ],
  tab: "join"
};

const laneMeta = {
  for: { label: "For", colour: "var(--blue)" },
  against: { label: "Against", colour: "var(--orange)" },
  still: { label: "Still Thinking", colour: "var(--teal)" }
};

let state = loadState();
let selectedLane = null;

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return structuredClone(seed);
  try {
    return JSON.parse(raw);
  } catch {
    return structuredClone(seed);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function resetState() {
  state = structuredClone(seed);
  selectedLane = null;
  saveState();
  render();
}

function counts() {
  return state.participants.reduce((acc, p) => {
    acc[p.lane] = (acc[p.lane] || 0) + 1;
    return acc;
  }, { for: 0, against: 0, still: 0 });
}

function contributionCounts() {
  return state.contributions.reduce((acc, c) => {
    acc[c.lane] = (acc[c.lane] || 0) + 1;
    return acc;
  }, { for: 0, against: 0, still: 0 });
}

function weights() {
  const c = counts();
  const cc = contributionCounts();
  return {
    for: Math.min(100, 48 + c.for * 3 + cc.for * 5),
    against: Math.min(100, 46 + c.against * 3 + cc.against * 5),
    still: Math.min(100, 52 + c.still * 4 + cc.still * 6)
  };
}

function strongestLane() {
  const w = weights();
  return Object.entries(w).sort((a, b) => b[1] - a[1])[0][0];
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setTab(tab) {
  state.tab = tab;
  saveState();
  render();
}

function renderRoomState() {
  const c = counts();
  const totalMax = Math.max(8, c.for, c.against, c.still);
  const rows = ["for", "against", "still"].map(lane => {
    const pct = Math.round((c[lane] / totalMax) * 100);
    return `
      <div class="state-row">
        <span>${laneMeta[lane].label}</span>
        <div class="progress" aria-label="${laneMeta[lane].label}: ${c[lane]}">
          <i style="width:${pct}%; background:${laneMeta[lane].colour};"></i>
        </div>
        <b>${c[lane]}</b>
      </div>
    `;
  }).join("");

  document.querySelector("#roomStateBars").innerHTML = rows;
  document.querySelector("#participantCount").textContent = state.participants.length;
}

function renderTabs() {
  document.querySelectorAll(".tab").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === state.tab);
  });

  const tabContent = document.querySelector("#tabContent");
  if (state.tab === "join") tabContent.innerHTML = renderJoin();
  if (state.tab === "insights") tabContent.innerHTML = renderInsights();
  if (state.tab === "arguments") tabContent.innerHTML = renderArguments();
  if (state.tab === "final") tabContent.innerHTML = renderFinal();

  bindTabEvents();
}

function renderJoin() {
  return `
    <section class="panel">
      <h3>Choose a lane</h3>
      <p class="notice">
        CruX is not a poll. Your lane is only the starting point. The reason is what matters.
      </p>

      <div class="choice-grid">
        ${["for", "against", "still"].map(lane => `
          <button class="choice ${selectedLane === lane ? "selected" : ""}" data-choice="${lane}" type="button">
            <h3>${laneMeta[lane].label}</h3>
            <p>${lane === "for" ? "I broadly agree with the direction." : lane === "against" ? "I challenge or disagree with it." : "I need more context before deciding."}</p>
          </button>
        `).join("")}
      </div>

      <form id="joinForm" class="form-grid ${selectedLane ? "" : "hidden"}">
        <label>Name <span class="muted">(optional)</span></label>
        <input id="joinName" placeholder="Your name" />

        <label>Your reason</label>
        <textarea id="joinReason" required placeholder="I am taking this position because..."></textarea>

        <label>What would change your mind?</label>
        <textarea id="joinChange" placeholder="Better evidence, a stronger example, or clearer framing..."></textarea>

        <button class="button primary" type="submit">Enter CruX</button>
      </form>
    </section>
  `;
}

function renderInsights() {
  const w = weights();
  const strong = strongestLane();

  return `
    <section class="panel insight-hero">
      <p class="eyebrow small">Reasoning weight</p>
      <h3>${laneMeta[strong].label} has the strongest reasoning so far</h3>
      <p class="notice">
        This is not a vote count. It reflects clarity, evidence, assumption-checking,
        counterarguments and openness to revision.
      </p>
    </section>

    <div class="weight-grid">
      ${["for", "against", "still"].map(lane => `
        <article class="weight-card">
          <div class="score">${w[lane]}</div>
          <h3>${laneMeta[lane].label}</h3>
          <p>${insightReason(lane)}</p>
        </article>
      `).join("")}
    </div>

    <div class="split-grid">
      <section class="panel">
        <h3>The current crux</h3>
        <p class="notice">
          Can CruX add deeper sense-making to X without reducing the speed and spontaneity
          that make X useful?
        </p>
      </section>

      <section class="panel">
        <h3>Evidence gaps</h3>
        <ul>
          <li>Would creators share final CruX Maps back to X?</li>
          <li>Would users join rooms after high-signal posts?</li>
          <li>Which posts deserve structure, and which should stay as normal replies?</li>
        </ul>
      </section>
    </div>

    <section class="panel">
      <h3>Common ground</h3>
      <ul>
        <li>X is powerful for discovery and public conversation.</li>
        <li>CruX should enhance X rather than replace native replies.</li>
        <li>The feature should remain creator-controlled and optional.</li>
      </ul>
    </section>
  `;
}

function insightReason(lane) {
  if (lane === "for") return "Strong creator use case: likes and quotes rarely show a clear map of audience reasoning.";
  if (lane === "against") return "Strong friction concern: X works because it is fast, open and low effort.";
  return "Strongest product questions: how to add depth without making conversation feel heavy.";
}

function renderArguments() {
  return `
    <section class="panel">
      <h3>Strengthen a side</h3>
      <p class="notice">Add a clearer reason, example, question or counterargument.</p>

      <form id="contributionForm" class="argument-tools">
        <select id="contribLane">
          <option value="for">For</option>
          <option value="against">Against</option>
          <option value="still">Still Thinking</option>
        </select>

        <select id="contribType">
          <option>Reasoning</option>
          <option>Evidence</option>
          <option>Counterargument</option>
          <option>Question</option>
          <option>Change mind</option>
        </select>

        <textarea id="contribBody" required placeholder="Add reasoning here..."></textarea>

        <button class="button primary" type="submit">Add</button>
      </form>
    </section>

    <div class="argument-lanes">
      ${["for", "against", "still"].map(lane => renderLane(lane)).join("")}
    </div>
  `;
}

function renderLane(lane) {
  const people = state.participants.filter(p => p.lane === lane).slice(0, 4);
  const contribs = state.contributions.filter(c => c.lane === lane).slice(-4).reverse();

  return `
    <section class="argument-lane">
      <h3>${laneMeta[lane].label}</h3>
      ${people.map(p => `
        <article class="argument-card">
          <strong>${escapeHtml(p.name || "Anonymous")}</strong>
          <p>${escapeHtml(p.reason)}</p>
          <small>Would change mind: ${escapeHtml(p.change || "Better evidence or clearer framing.")}</small>
        </article>
      `).join("")}

      ${contribs.map(c => `
        <article class="argument-card">
          <strong>${escapeHtml(c.type)} · ${escapeHtml(c.name)}</strong>
          <p>${escapeHtml(c.body)}</p>
        </article>
      `).join("")}
    </section>
  `;
}

function renderFinal() {
  const c = counts();
  const w = weights();
  const strong = strongestLane();

  return `
    <section class="final-card">
      <p class="eyebrow small">Final CruX Map</p>
      <h3>The real crux is whether CruX can add depth to X without reducing its speed and spontaneity.</h3>
      <p class="notice">
        This final map separates participation split from reasoning weight.
        The room does not declare a winner; it shows where the strongest reasoning currently sits.
      </p>

      <div class="split-grid">
        <section class="panel">
          <h3>Participation split</h3>
          <p>For: ${c.for}</p>
          <p>Against: ${c.against}</p>
          <p>Still Thinking: ${c.still}</p>
        </section>

        <section class="panel">
          <h3>Reasoning weight</h3>
          <p>For: ${w.for}</p>
          <p>Against: ${w.against}</p>
          <p>Still Thinking: ${w.still}</p>
        </section>
      </div>

      <section class="panel">
        <h3>Strongest reasoning</h3>
        <p class="notice">${laneMeta[strong].label}: ${insightReason(strong)}</p>
      </section>

      <div class="final-actions">
        <button class="button primary" id="copyShare" type="button">Copy share text</button>
        <button class="button ghost" id="downloadSummary" type="button">Download summary</button>
      </div>
    </section>
  `;
}

function bindTabEvents() {
  document.querySelectorAll(".choice").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedLane = btn.dataset.choice;
      renderTabs();
    });
  });

  const joinForm = document.querySelector("#joinForm");
  if (joinForm) {
    joinForm.addEventListener("submit", event => {
      event.preventDefault();
      const reason = document.querySelector("#joinReason").value.trim();
      if (!selectedLane || !reason) return;

      state.participants.push({
        lane: selectedLane,
        name: document.querySelector("#joinName").value.trim() || "Demo visitor",
        reason,
        change: document.querySelector("#joinChange").value.trim() || "Better evidence or clearer framing."
      });

      state.tab = "insights";
      selectedLane = null;
      saveState();
      render();
    });
  }

  const contributionForm = document.querySelector("#contributionForm");
  if (contributionForm) {
    contributionForm.addEventListener("submit", event => {
      event.preventDefault();
      const body = document.querySelector("#contribBody").value.trim();
      if (!body) return;

      state.contributions.push({
        lane: document.querySelector("#contribLane").value,
        type: document.querySelector("#contribType").value,
        name: "Demo visitor",
        body
      });

      state.tab = "insights";
      saveState();
      render();
    });
  }

  const copyShare = document.querySelector("#copyShare");
  if (copyShare) {
    copyShare.addEventListener("click", async () => {
      const text = "CruX feature request MVP: X helps ideas spread. CruX helps them go deeper. 50 likes unlock the lobby. 15 people open the room. 5 days reveal the crux.";
      await navigator.clipboard.writeText(text);
      copyShare.textContent = "Copied";
      setTimeout(() => copyShare.textContent = "Copy share text", 1400);
    });
  }

  const downloadSummary = document.querySelector("#downloadSummary");
  if (downloadSummary) {
    downloadSummary.addEventListener("click", () => {
      const blob = new Blob([summaryText()], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "crux-demo-summary.txt";
      a.click();
      URL.revokeObjectURL(url);
    });
  }
}

function summaryText() {
  const c = counts();
  const w = weights();
  return `CruX Final Map

Question:
Could X help people move from discovering ideas to understanding them more deeply?

Participation split:
For: ${c.for}
Against: ${c.against}
Still Thinking: ${c.still}

Reasoning weight:
For: ${w.for}
Against: ${w.against}
Still Thinking: ${w.still}

Current crux:
Can CruX add deeper sense-making to X without reducing the speed and spontaneity that make X useful?

Prototype concept · not affiliated with X
`;
}

function render() {
  renderRoomState();
  renderTabs();
}

document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => setTab(btn.dataset.tab));
});

document.querySelector("#resetDemo").addEventListener("click", resetState);

render();
