// ── Constants ──
const AIRTABLE_BASE = "appbjYzgDlfEGeR6C";
const AIRTABLE_TABLE = "tblXXcTrlbPnPbq4u";
const CLOSER_RATE = 0.10;
const SETTER_RATE = 0.05;
const AIRTABLE_KEY = "patbp5tDrcNixuTni.10847fca116a7c68f17be6b4281e709079cf44446d9710195e7e6b5bc671ed6c";
const WORKER_URL = "https://cowboy-closers-api.connor-56d.workers.dev";

// ── Airtable URL builder (fixes fields[] array serialisation) ──
function airtableUrl(tableId, { filter, fields, pageSize, offset } = {}) {
  const parts = [`https://api.airtable.com/v0/${AIRTABLE_BASE}/${tableId}?`];
  const qs = [];
  if (filter) qs.push(`filterByFormula=${encodeURIComponent(filter)}`);
  if (fields) fields.forEach(f => qs.push(`fields%5B%5D=${encodeURIComponent(f)}`));
  if (pageSize) qs.push(`pageSize=${pageSize}`);
  if (offset) qs.push(`offset=${encodeURIComponent(offset)}`);
  return parts[0] + qs.join("&");
}

async function airtableFetch(tableId, options) {
  let records = [], offset = null;
  do {
    const res = await fetch(airtableUrl(tableId, { ...options, offset }), {
      headers: { "Authorization": `Bearer ${AIRTABLE_KEY}` }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || `Airtable error ${res.status}`);
    }
    const data = await res.json();
    records = records.concat(data.records || []);
    offset = data.offset || null;
  } while (offset);
  return records;
}

// Status IDs
const STATUS = {
  CLOSED:    "recrqoQYB7k6WykpD",
  NO_CLOSE:  "recBbYcejh6spT7ji",
  NO_SHOW:   "recmYy2z3Z8Y9ZCii",
  CANCELLED: "recTb4bMUb31Gf8he",
  DEPOSIT:   "recbaBBGhbDAS4Bw5",
  NEW:       "recEGgHNpog4RfYYK",
};

// ── Init ──
function init() {
  show("app");
  loadDashboard();
}

// ── Tab Switching ──
function switchTab(name, btn) {
  document.querySelectorAll(".tab-content").forEach(el => el.classList.add("hidden"));
  document.querySelectorAll(".tab-btn").forEach(el => el.classList.remove("active"));
  document.getElementById("tab-" + name).classList.remove("hidden");
  btn.classList.add("active");
  if (name === "review") loadCallList();
  if (name === "commissions") loadCommissions();
  if (name === "insights") document.getElementById("insights-output").innerHTML = "";
}

// ── Dashboard ──
async function loadDashboard() {
  const days = parseInt(document.getElementById("dash-period").value);
  show("dash-loading");
  hide("dash-error");
  hide("dash-output");

  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString();

    const [callRecs, closerRecs, dialerRecs] = await Promise.all([
      airtableFetch(AIRTABLE_TABLE, {
        filter: `IS_AFTER({Date of Info Added}, '${cutoffStr}')`,
        fields: ["Status", "Revenue", "Cash Collected", "Raw Text (Closer Assigned)", "Raw Text (Set By)", "Date of Info Added"],
        pageSize: 100,
      }),
      airtableFetch(CLOSER_REPORTS_TABLE, {
        filter: `IS_AFTER({Date}, '${cutoff.toISOString().slice(0,10)}')`,
        fields: ["Rep Name", "Total Live Calls", "On Call Closes", "No Closes", "No Shows",
                 "Cancelled Calls", "Follow-up Closes", "Revenue Generated", "Cash Collected",
                 "What objections are coming up that are preventing closes?"],
        pageSize: 100,
      }),
      airtableFetch(DIALER_REPORTS_TABLE, {
        filter: `IS_AFTER({Date}, '${cutoff.toISOString().slice(0,10)}')`,
        fields: ["Rep Name", "Work Hours", "Total Calls", "Pickups", "Sets", "Qualified But Not Set"],
        pageSize: 100,
      }),
    ]);

    renderDashboard(callRecs, closerRecs, dialerRecs);
    show("dash-output");
  } catch (err) {
    document.getElementById("dash-error").textContent = "Error: " + err.message;
    show("dash-error");
  } finally {
    hide("dash-loading");
  }
}

function statusId(rec) {
  return (rec.fields["Status"] || [])[0] || "";
}

function renderDashboard(callRecs, closerRecs, dialerRecs) {
  // Aggregate from Sales Calls Tracking
  let totalRev = 0, totalCash = 0, totalBooked = 0, totalClosed = 0,
      totalNoShow = 0, totalCancelled = 0, totalNoClose = 0;

  for (const rec of callRecs) {
    const f = rec.fields;
    const sid = statusId(rec);
    const cash = parseFloat(f["Cash Collected"] || 0);
    const rev = parseFloat(f["Revenue"] || 0);
    totalBooked++;
    if (sid === STATUS.CLOSED || sid === STATUS.DEPOSIT) { totalClosed++; totalCash += cash; totalRev += rev; }
    if (sid === STATUS.NO_SHOW) totalNoShow++;
    if (sid === STATUS.CANCELLED) totalCancelled++;
    if (sid === STATUS.NO_CLOSE) totalNoClose++;
  }

  const cashPerCall = totalBooked > 0 ? totalCash / totalBooked : 0;
  const closeRate = totalBooked > 0 ? ((totalClosed / totalBooked) * 100).toFixed(1) : 0;
  const noShowRate = totalBooked > 0 ? ((totalNoShow / totalBooked) * 100).toFixed(1) : 0;

  // Hero
  document.getElementById("d-cash-per-call").textContent = fmt(cashPerCall);
  document.getElementById("d-total-cash").textContent = fmt(totalCash);
  document.getElementById("d-total-rev-sub").textContent = fmt(totalRev) + " contract revenue";
  document.getElementById("d-total-closes").textContent = totalClosed;
  document.getElementById("d-close-rate-sub").textContent = closeRate + "% close rate";

  // Key metrics
  const metrics = [
    { label: "Booked Calls", value: totalBooked, bench: null },
    { label: "Close Rate", value: closeRate + "%", bench: 25, higher: true, val: parseFloat(closeRate) },
    { label: "No-Show Rate", value: noShowRate + "%", bench: 20, higher: false, val: parseFloat(noShowRate) },
    { label: "No Closes", value: totalNoClose, bench: null },
    { label: "Cancelled", value: totalCancelled, bench: null },
    { label: "Total Revenue", value: fmt(totalRev), bench: null },
  ];

  document.getElementById("metrics-grid").innerHTML = metrics.map(m => {
    let cls = "";
    if (m.bench !== null) {
      cls = m.higher
        ? (m.val >= 30 ? "good" : m.val >= 20 ? "warn" : "bad")
        : (m.val <= 10 ? "good" : m.val <= 20 ? "warn" : "bad");
    }
    return `
      <div class="metric-card ${cls}">
        <div class="metric-label">${m.label}</div>
        <div class="metric-value">${m.value}</div>
        ${m.bench ? `<div class="metric-bench">Benchmark: ${m.higher ? m.bench + "%+" : "under " + m.bench + "%"}</div>` : ""}
      </div>`;
  }).join("");

  // Closer cards from Closer Reports
  const closers = aggregateClosers(closerRecs);
  document.getElementById("closer-rep-grid").innerHTML = Object.entries(closers).map(([name, r]) => `
    <div class="rep-stat-card">
      <div class="rep-stat-header">
        <span class="rep-stat-name">${name}</span>
        <span class="rep-stat-role">Closer</span>
      </div>
      <div class="rep-stat-body">
        <div class="rep-stat-item">
          <div class="rep-stat-item-label">Live Calls</div>
          <div class="rep-stat-item-val">${r.liveCalls}</div>
        </div>
        <div class="rep-stat-item">
          <div class="rep-stat-item-label">Close Rate</div>
          <div class="rep-stat-item-val ${parseFloat(r.closeRate) >= 30 ? 'good' : parseFloat(r.closeRate) >= 20 ? 'warn' : 'bad'}">${r.closeRate}</div>
        </div>
        <div class="rep-stat-item">
          <div class="rep-stat-item-label">No-Show Rate</div>
          <div class="rep-stat-item-val ${parseFloat(r.noShowRate) <= 10 ? 'good' : parseFloat(r.noShowRate) <= 20 ? 'warn' : 'bad'}">${r.noShowRate}</div>
        </div>
        <div class="rep-stat-item">
          <div class="rep-stat-item-label">Cash Collected</div>
          <div class="rep-stat-item-val">${fmt(r.cash)}</div>
        </div>
        <div class="rep-stat-item">
          <div class="rep-stat-item-label">Closes</div>
          <div class="rep-stat-item-val">${r.closes}</div>
        </div>
        <div class="rep-stat-item">
          <div class="rep-stat-item-label">No Closes</div>
          <div class="rep-stat-item-val">${r.noCloses}</div>
        </div>
        ${r.topObjections.length ? `<div class="rep-stat-item" style="grid-column:1/-1"><div class="rep-stat-item-label">Top Objections</div><div style="font-size:12px;color:var(--muted);margin-top:.2rem">${r.topObjections.join(" · ")}</div></div>` : ""}
      </div>
    </div>
  `).join("") || '<p style="color:var(--muted)">No closer reports for this period.</p>';

  // Setter cards
  const setters = aggregateDialers(dialerRecs);
  document.getElementById("setter-rep-grid").innerHTML = Object.entries(setters).map(([name, r]) => `
    <div class="rep-stat-card">
      <div class="rep-stat-header">
        <span class="rep-stat-name">${name}</span>
        <span class="rep-stat-role">Setter</span>
      </div>
      <div class="rep-stat-body">
        <div class="rep-stat-item">
          <div class="rep-stat-item-label">Total Dials</div>
          <div class="rep-stat-item-val">${r.calls}</div>
        </div>
        <div class="rep-stat-item">
          <div class="rep-stat-item-label">Sets</div>
          <div class="rep-stat-item-val">${r.sets}</div>
        </div>
        <div class="rep-stat-item">
          <div class="rep-stat-item-label">Pickup Rate</div>
          <div class="rep-stat-item-val">${r.pickupRate}</div>
        </div>
        <div class="rep-stat-item">
          <div class="rep-stat-item-label">Set Rate</div>
          <div class="rep-stat-item-val ${parseFloat(r.setRate) >= 5 ? 'good' : parseFloat(r.setRate) >= 3 ? 'warn' : 'bad'}">${r.setRate}</div>
        </div>
        <div class="rep-stat-item">
          <div class="rep-stat-item-label">Hours Worked</div>
          <div class="rep-stat-item-val">${r.hours}</div>
        </div>
        <div class="rep-stat-item">
          <div class="rep-stat-item-label">Dials / Hour</div>
          <div class="rep-stat-item-val ${parseFloat(r.callsPerHour) >= 15 ? 'good' : parseFloat(r.callsPerHour) >= 10 ? 'warn' : 'bad'}">${r.callsPerHour}</div>
        </div>
        ${r.topObjections.length ? `<div class="rep-stat-item" style="grid-column:1/-1"><div class="rep-stat-item-label">Top Objections</div><div style="font-size:12px;color:var(--muted);margin-top:.2rem">${r.topObjections.join(" · ")}</div></div>` : ""}
      </div>
    </div>
  `).join("") || '<p style="color:var(--muted)">No setter reports for this period.</p>';
}

// ── Utility ──
function show(id) { document.getElementById(id).classList.remove("hidden"); }
function hide(id) { document.getElementById(id).classList.add("hidden"); }
function fmt(n) { return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

function getMonthFilter() {
  const period = document.getElementById("period-select").value;
  if (period === "all") return null;
  const now = new Date();
  if (period === "current") return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, "0")}`;
}

function parseMonth(dateStr) {
  if (!dateStr) return null;
  return dateStr.slice(0, 7);
}

// ── Commissions ──
async function fetchDeals() {
  return airtableFetch(AIRTABLE_TABLE, {
    filter: "AND({Cash Collected} > 0, {Raw Text (Closer Assigned)} != '')",
    fields: ["Revenue", "Cash Collected", "Date of Info Added", "Raw Text (Closer Assigned)", "Raw Text (Set By)", "Lead Name"],
    pageSize: 100,
  });
}

function buildSummary(records, monthFilter) {
  const closers = {}, setters = {};

  for (const rec of records) {
    const f = rec.fields || {};
    const closer = (f["Raw Text (Closer Assigned)"] || "").trim();
    const setter = (f["Raw Text (Set By)"] || "").trim();
    const revenue = parseFloat(f["Revenue"] || 0);
    const cash = parseFloat(f["Cash Collected"] || 0);
    const lead = f["Lead Name"] || "Unknown";
    const month = parseMonth(f["Date of Info Added"]) || "Unknown";

    if (monthFilter && month !== monthFilter) continue;

    if (closer) {
      if (!closers[closer]) closers[closer] = { revenue: 0, cash: 0, commission: 0, deals: [] };
      closers[closer].revenue += revenue;
      closers[closer].cash += cash;
      closers[closer].commission += cash * CLOSER_RATE;
      closers[closer].deals.push({ lead, revenue, cash, commission: cash * CLOSER_RATE });
    }
    if (setter) {
      if (!setters[setter]) setters[setter] = { revenue: 0, cash: 0, commission: 0, deals: [] };
      setters[setter].revenue += revenue;
      setters[setter].cash += cash;
      setters[setter].commission += cash * SETTER_RATE;
      setters[setter].deals.push({ lead, revenue, cash, commission: cash * SETTER_RATE });
    }
  }

  return { closers, setters };
}

function renderRepCards(data, containerId) {
  const container = document.getElementById(containerId);
  const reps = Object.keys(data).sort();

  if (!reps.length) {
    container.innerHTML = '<p style="color:var(--muted);padding:.5rem 0">No records for this period.</p>';
    return;
  }

  container.innerHTML = reps.map(rep => {
    const d = data[rep];
    const dealsHtml = d.deals.map(deal => `
      <div class="deal-row">
        <span class="deal-lead">${deal.lead}</span>
        <div class="deal-nums">
          <span>Rev ${fmt(deal.revenue)}</span>
          <span>Collected ${fmt(deal.cash)}</span>
          <span class="deal-commission">Commission ${fmt(deal.commission)}</span>
        </div>
      </div>
    `).join("");

    return `
      <div class="rep-card">
        <div class="rep-header" onclick="toggleDeals(this)">
          <div>
            <div class="rep-name">${rep}</div>
            <div class="rep-meta" style="margin-top:.25rem">
              <span>${d.deals.length} deal${d.deals.length !== 1 ? "s" : ""}</span>
              <span>Rev ${fmt(d.revenue)}</span>
              <span>Collected ${fmt(d.cash)}</span>
            </div>
          </div>
          <div class="rep-owed">${fmt(d.commission)} owed</div>
        </div>
        <div class="rep-deals hidden">${dealsHtml}</div>
      </div>
    `;
  }).join("");
}

function toggleDeals(header) {
  header.nextElementSibling.classList.toggle("hidden");
}

async function loadCommissions() {
  const monthFilter = getMonthFilter();
  show("commissions-loading");
  hide("commissions-error");
  hide("totals-bar");

  try {
    const records = await fetchDeals();
    const { closers, setters } = buildSummary(records, monthFilter);

    let totalRevenue = 0, totalCash = 0, totalCloserComm = 0, totalSetterComm = 0;
    for (const d of Object.values(closers)) { totalRevenue += d.revenue; totalCash += d.cash; totalCloserComm += d.commission; }
    for (const d of Object.values(setters)) { totalSetterComm += d.commission; }

    document.getElementById("total-revenue").textContent = fmt(totalRevenue);
    document.getElementById("total-cash").textContent = fmt(totalCash);
    document.getElementById("total-closer-comm").textContent = fmt(totalCloserComm);
    document.getElementById("total-setter-comm").textContent = fmt(totalSetterComm);
    document.getElementById("total-payroll").textContent = fmt(totalCloserComm + totalSetterComm);

    show("totals-bar");
    renderRepCards(closers, "closers-table");
    renderRepCards(setters, "setters-table");
  } catch (err) {
    document.getElementById("commissions-error").textContent = "Error: " + err.message;
    show("commissions-error");
  } finally {
    hide("commissions-loading");
  }
}

// ── Call List (for review tab) ──
let callRecords = [];

async function loadCallList() {
  const select = document.getElementById("call-select");
  select.innerHTML = '<option value="">Loading calls...</option>';

  try {
    callRecords = await airtableFetch(AIRTABLE_TABLE, {
      filter: "{Raw Text (Closer Assigned)} != ''",
      fields: ["Lead Name", "Raw Text (Closer Assigned)", "Call Recording Link", "Date of Info Added"],
      pageSize: 100,
    });

    callRecords.sort((a, b) => {
      const da = a.fields["Date of Info Added"] || "";
      const db = b.fields["Date of Info Added"] || "";
      return db.localeCompare(da);
    });

    select.innerHTML = '<option value="">Select a call...</option>' + callRecords.map((rec, i) => {
      const f = rec.fields;
      const lead = f["Lead Name"] || "Unknown";
      const closer = f["Raw Text (Closer Assigned)"] || "";
      const date = (f["Date of Info Added"] || "").slice(0, 10);
      return `<option value="${i}">${date} — ${lead} (${closer})</option>`;
    }).join("");
  } catch (err) {
    select.innerHTML = `<option value="">Failed to load: ${err.message}</option>`;
  }
}

function selectCall() {
  const idx = document.getElementById("call-select").value;
  if (idx === "") return;

  const rec = callRecords[idx];
  if (!rec) return;

  const f = rec.fields;
  const closer = (f["Raw Text (Closer Assigned)"] || "").trim();
  const recordingLink = (f["Call Recording Link"] || "").trim();

  document.getElementById("closer-name").value = closer;
  document.getElementById("transcript-input").value = "";
  document.getElementById("transcript-input").placeholder = "Open the recording above, copy the Fathom transcript, and paste it here.";

  const linkEl = document.getElementById("recording-link");
  if (recordingLink) {
    linkEl.dataset.url = recordingLink;
    linkEl.innerHTML = `<a href="${recordingLink}" target="_blank">Open Recording / Transcript</a>`;
    show("recording-link");
  } else {
    linkEl.dataset.url = "";
    hide("recording-link");
  }
}

// ── Call Review ──
const SCORING_PROMPT = `You are a sales call coach reviewing a closing call for a high-ticket offer ($3,000–$30,000+).

Closer name: {closer}

Call notes / transcript:
---
{transcript}
---

Score the closer 1–10 on each category. Be direct and specific — this is for coaching, not flattery.

Categories:
1. Opener & Rapport — Did they build connection quickly and set the right frame?
2. Discovery — Did they uncover real pain, urgency, and budget? Did they listen?
3. Pitch & Bridge — Did they clearly connect the prospect's pain to the offer?
4. Objection Handling — How did they handle pushback? Did they address root causes?
5. Close Attempt — Did they ask for the sale confidently? Did they re-close after objections?
6. Overall — Big picture: was this a good call?

Format EXACTLY as:

## Call Scorecard — {closer}

### Scores
| Category | Score | Summary |
|---|---|---|
| Opener & Rapport | X/10 | ... |
| Discovery | X/10 | ... |
| Pitch & Bridge | X/10 | ... |
| Objection Handling | X/10 | ... |
| Close Attempt | X/10 | ... |
| Overall | X/10 | ... |

**Total: XX/60**

---

### What They Did Well
- (specific moments)

### What to Fix
- (specific problems with quotes where possible)

### Line Rewrites
**What they said:** "..."
**Better version:** "..."
**Why:** one sentence

(repeat for each weak moment)

### Verdict
One paragraph: coaching priority for this rep.`;

async function reviewCall() {
  const closer = document.getElementById("closer-name").value.trim() || "Unknown";
  let transcript = document.getElementById("transcript-input").value.trim();
  const recordingEl = document.getElementById("recording-link");
  const recordingUrl = recordingEl.dataset.url || "";

  hide("review-error");
  show("review-loading");
  document.getElementById("review-output").innerHTML = "";

  try {
    // Auto-fetch Fathom transcript if none pasted and recording is a Fathom link
    if (!transcript && recordingUrl.includes("fathom.video")) {
      document.getElementById("review-loading").textContent = "Fetching transcript from Fathom...";
      transcript = await fetchFathomTranscript(recordingUrl);
      if (transcript) document.getElementById("transcript-input").value = transcript;
    }

    if (!transcript) {
      throw new Error("No transcript found. Paste it manually from the recording.");
    }

    document.getElementById("review-loading").textContent = "Reviewing call...";
    const prompt_text = SCORING_PROMPT.replace(/{closer}/g, closer).replace("{transcript}", transcript);
    const result = await callClaude(prompt_text);
    document.getElementById("review-output").innerHTML = markdownToHtml(result);
  } catch (err) {
    document.getElementById("review-error").textContent = err.message;
    show("review-error");
  } finally {
    hide("review-loading");
    document.getElementById("review-loading").textContent = "Reviewing call...";
  }
}

// ── Minimal Markdown Renderer ──
function markdownToHtml(md) {
  return md
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\|(.+)\|\n\|[-| :]+\|\n((?:\|.+\|\n?)*)/g, (_, header, body) => {
      const ths = header.split("|").filter(s => s.trim()).map(s => `<th>${s.trim()}</th>`).join("");
      const rows = body.trim().split("\n").map(row => {
        const tds = row.split("|").filter(s => s.trim()).map(s => `<td>${s.trim()}</td>`).join("");
        return `<tr>${tds}</tr>`;
      }).join("");
      return `<table><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table>`;
    })
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h2>$1</h2>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^---$/gm, "<hr>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, s => `<ul>${s}</ul>`)
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/^(?!<[htup])(.+)$/gm, "$1")
    .replace(/^(.+)$/, "<p>$1</p>");
}

// ── Team Insights ──
const CLOSER_REPORTS_TABLE = "tblXfEy6PBxVPXHs4";
const DIALER_REPORTS_TABLE = "tblmHasxFoWvV876K";

async function generateInsights() {
  const days = parseInt(document.getElementById("insights-period").value);
  show("insights-loading");
  hide("insights-error");
  document.getElementById("insights-output").innerHTML = "";

  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().slice(0, 10);

    const [closerRecs, dialerRecs] = await Promise.all([
      airtableFetch(CLOSER_REPORTS_TABLE, {
        filter: `IS_AFTER({Date}, '${cutoffStr}')`,
        fields: ["Rep Name", "Date", "Total Live Calls", "On Call Closes", "No Closes", "No Shows",
                 "Cancelled Calls", "Deposits", "Follow-up Closes", "Revenue Generated", "Cash Collected",
                 "Close Rate", "No Show Rate", "Follow-up Close Rate",
                 "What objections are coming up that are preventing closes?",
                 "What did you do good today?", "What could you do better tomorrow?"],
        pageSize: 100,
      }),
      airtableFetch(DIALER_REPORTS_TABLE, {
        filter: `IS_AFTER({Date}, '${cutoffStr}')`,
        fields: ["Rep Name", "Date", "Work Hours", "Total Calls", "Pickups", "Sets",
                 "Qualified But Not Set", "Pickup Rate", "Set Rate",
                 "What objections are coming up that are preventing sets?"],
        pageSize: 100,
      }),
    ]);

    const closerStats = aggregateClosers(closerRecs);
    const dialerStats = aggregateDialers(dialerRecs);

    const reportData = buildReportPayload(closerStats, dialerStats, days);
    const report = await callClaude(insightsPrompt(reportData));
    document.getElementById("insights-output").innerHTML = markdownToHtml(report);
  } catch (err) {
    document.getElementById("insights-error").textContent = err.message;
    show("insights-error");
  } finally {
    hide("insights-loading");
  }
}

function aggregateClosers(records) {
  const reps = {};
  for (const rec of records) {
    const f = rec.fields;
    const name = f["Rep Name"] || "Unknown";
    if (!reps[name]) reps[name] = {
      days: 0, liveCalls: 0, closes: 0, noCloses: 0, noShows: 0,
      cancelled: 0, deposits: 0, followupCloses: 0, revenue: 0, cash: 0,
      objections: {}, goodNotes: [], improvNotes: [],
    };
    const r = reps[name];
    r.days++;
    r.liveCalls += f["Total Live Calls"] || 0;
    r.closes += (f["On Call Closes"] || 0) + (f["Follow-up Closes"] || 0);
    r.noCloses += f["No Closes"] || 0;
    r.noShows += f["No Shows"] || 0;
    r.cancelled += f["Cancelled Calls"] || 0;
    r.deposits += f["Deposits"] || 0;
    r.followupCloses += f["Follow-up Closes"] || 0;
    r.revenue += f["Revenue Generated"] || 0;
    r.cash += f["Cash Collected"] || 0;
    (f["What objections are coming up that are preventing closes?"] || []).forEach(o => {
      r.objections[o] = (r.objections[o] || 0) + 1;
    });
    if (f["What did you do good today?"]) r.goodNotes.push(f["What did you do good today?"]);
    if (f["What could you do better tomorrow?"]) r.improvNotes.push(f["What could you do better tomorrow?"]);
  }

  // Compute derived metrics
  for (const r of Object.values(reps)) {
    r.closeRate = r.liveCalls > 0 ? ((r.closes / r.liveCalls) * 100).toFixed(1) + "%" : "N/A";
    r.noShowRate = (r.liveCalls + r.noShows) > 0
      ? ((r.noShows / (r.liveCalls + r.noShows)) * 100).toFixed(1) + "%" : "N/A";
    r.topObjections = Object.entries(r.objections).sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0]);
  }
  return reps;
}

function aggregateDialers(records) {
  const reps = {};
  for (const rec of records) {
    const f = rec.fields;
    const name = f["Rep Name"] || "Unknown";
    if (!reps[name]) reps[name] = { days: 0, hours: 0, calls: 0, pickups: 0, sets: 0, qualNotSet: 0, objections: {} };
    const r = reps[name];
    r.days++;
    r.hours += f["Work Hours"] || 0;
    r.calls += f["Total Calls"] || 0;
    r.pickups += f["Pickups"] || 0;
    r.sets += f["Sets"] || 0;
    r.qualNotSet += f["Qualified But Not Set"] || 0;
    (f["What objections are coming up that are preventing sets?"] || []).forEach(o => {
      r.objections[o] = (r.objections[o] || 0) + 1;
    });
  }
  for (const r of Object.values(reps)) {
    r.pickupRate = r.calls > 0 ? ((r.pickups / r.calls) * 100).toFixed(1) + "%" : "N/A";
    r.setRate = r.calls > 0 ? ((r.sets / r.calls) * 100).toFixed(1) + "%" : "N/A";
    r.callsPerHour = r.hours > 0 ? (r.calls / r.hours).toFixed(1) : "N/A";
    r.topObjections = Object.entries(r.objections).sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0]);
  }
  return reps;
}

function buildReportPayload(closerStats, dialerStats, days) {
  const lines = [`Period: Last ${days} days\n`];

  lines.push("=== CLOSERS ===");
  for (const [name, r] of Object.entries(closerStats)) {
    lines.push(`\n${name}:`);
    lines.push(`  Live calls: ${r.liveCalls} | Closes: ${r.closes} | Close rate: ${r.closeRate}`);
    lines.push(`  No-shows: ${r.noShows} | No-show rate: ${r.noShowRate}`);
    lines.push(`  No closes: ${r.noCloses} | Deposits: ${r.deposits} | Follow-up closes: ${r.followupCloses}`);
    lines.push(`  Revenue: $${r.revenue.toLocaleString()} | Cash collected: $${r.cash.toLocaleString()}`);
    if (r.topObjections.length) lines.push(`  Top objections: ${r.topObjections.join(", ")}`);
    if (r.improvNotes.length) lines.push(`  Self-identified improvements: ${[...new Set(r.improvNotes)].slice(0,3).join("; ")}`);
  }

  lines.push("\n=== SETTERS / DIALERS ===");
  for (const [name, r] of Object.entries(dialerStats)) {
    lines.push(`\n${name}:`);
    lines.push(`  Total calls: ${r.calls} | Pickups: ${r.pickups} | Sets: ${r.sets}`);
    lines.push(`  Pickup rate: ${r.pickupRate} | Set rate: ${r.setRate} | Calls/hour: ${r.callsPerHour}`);
    lines.push(`  Qualified but not set: ${r.qualNotSet}`);
    if (r.topObjections.length) lines.push(`  Top objections: ${r.topObjections.join(", ")}`);
  }

  return lines.join("\n");
}

function insightsPrompt(data) {
  return `You are a high-ticket sales coach analysing a sales team's performance data. Be direct, specific, and ruthless — this is for the team manager, not the reps.

Industry benchmarks for high-ticket sales ($3k–$30k offers):
- Closer close rate: 20–25% average, 30%+ good, 40%+ elite
- No-show rate: under 20% acceptable, under 10% excellent
- Setter pickup rate: 30–50% of dials
- Setter set rate: 3–8% of total dials
- Calls per hour (setter): 15–25 dials/hr
- Deposit rate: 10–20% of closes (healthy pipeline)
- Follow-up close rate: signals whether closers are leaving money on the table

Team data:
${data}

Write a concise report in this exact format:

## Team Performance Report

### Overall Assessment
2–3 sentences: is this team performing well, average, or below standard? Be direct.

### Closer Breakdown
For each closer — one section:
**[Name]** — [close rate] close rate vs 20–30% benchmark
- Strength: one specific thing they're doing well based on the numbers
- Priority fix: the single most impactful change they need to make
- Action step: one concrete, specific action this week (not generic advice)

### Setter Breakdown
For each setter — one section:
**[Name]** — [set rate] set rate vs 3–8% benchmark
- Strength: one specific thing
- Priority fix: the single biggest lever
- Action step: one concrete action this week

### Team-Wide Issues
Top 3 patterns across the whole team with specific fixes. Reference the actual objection data.

### This Week's Focus
One priority for the manager to address with the team. One sentence.`;
}

async function callClaude(prompt) {
  let res;
  try {
    res = await fetch(`${WORKER_URL}/review`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }],
      }),
    });
  } catch (networkErr) {
    throw new Error(`Network error: ${networkErr.message}`);
  }
  if (!res.ok) {
    let body; try { body = await res.json(); } catch (_) { body = {}; }
    throw new Error(`HTTP ${res.status}: ${body.error?.message || res.statusText}`);
  }
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

async function fetchFathomTranscript(url) {
  const res = await fetch(`${WORKER_URL}/transcript?url=${encodeURIComponent(url)}`);
  if (!res.ok) throw new Error("Could not fetch transcript");
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.transcript || "";
}

// ── Boot ──
init();
