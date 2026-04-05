# Thailand Macro·Labor Intelligence — Project Handoff

## Files in This Package

| File | Size | Purpose |
|------|------|---------|
| `thailand-macro-analyzer.html` | 144KB | **Main application** — open in any browser |
| `mock-data.json` | 34KB | Clean mock dataset (Hormuz Crisis analysis) |
| `assessment-report-generator.js` | 52KB | Node.js script that generates the .docx assessment |
| `tmli-assessment.docx` | 26KB | The assessment report (pre-generated) |
| `README.md` | This file | Handoff notes |

---

## How to Run the App

**No server needed.** Just open `thailand-macro-analyzer.html` in Chrome, Firefox, or Safari.

- **Demo mode** (no API key needed): loads automatically with a pre-built Hormuz Crisis analysis
- **Live AI mode**: click ⚙ API KEY in the top ribbon and enter your Anthropic API key (`sk-ant-...`)

---

## Current State: MOCK_MODE = true

The app boots in demo mode. To switch to live AI:

1. Open `thailand-macro-analyzer.html` in a text editor
2. Find line ~1309: `const MOCK_MODE = true;`
3. Change to `const MOCK_MODE = false;`
4. Save and reload — it will now prompt for an API key

---

## Architecture (Single-File HTML)

```
thailand-macro-analyzer.html
├── <head>          Google Fonts (IBM Plex Mono, Libre Baskerville, Noto Sans Thai)
├── <style>         Full CSS (design tokens → layout → components → responsive → print)
├── HTML body       Ribbon → Header → Sidebar (18 events + custom) → Content area
│                   Modals: Settings, Compare panel
│                   States: Empty, Loading, Error, Results
└── <script>
    ├── S {}                State object (apiKey, lastResult, compareList, etc.)
    ├── EVENTS {}           18 event objects {tag, title, ctx} — the editorial layer
    ├── MOCK_MODE           Boolean toggle
    ├── MOCK_RESULT         JSON.parse(`...`) — pre-built Hormuz analysis
    ├── init()              Auto-selects first event in mock mode; loads saved API key
    ├── selEvent()          Handles sidebar event card clicks
    ├── runAnalysis()       Main orchestrator — mock path or API path
    ├── fetchAnalysis()     Calls Anthropic API with AbortController
    ├── parseJSON()         4-pass robust JSON parser
    ├── buildPrompt()       Constructs the full structured prompt with Thai workforce data
    ├── renderResults()     Builds all 5 tab panes from AI JSON output
    ├── buildProfCards()    18 profession cards with bars, tags, adaptation paths
    ├── buildIndCards()     10 industry cards with sub-occupation breakdowns
    ├── switchTab()         Tab navigation
    ├── filterProfs()       Filter profession cards by risk level
    ├── sortProfs()         Sort profession cards by impact score
    ├── runCompare()        Comparison mode (mock: reuses MOCK_RESULT; live: calls API)
    ├── renderCompare()     Renders side-by-side comparison table
    ├── exportCSV()         Exports professions + industries to CSV (UTF-8 BOM)
    ├── esc()               XSS sanitizer (used on all AI output → innerHTML)
    └── showToast()         Notification system
```

---

## Known Issues (Priority Order)

### P0 — Fix immediately (breaks demo)
1. **Emoji icons broken in mock data** — All profession/industry icons in MOCK_RESULT are plain English words (`"fish"`, `"truck"`, `"barrel"`) instead of emojis. They were stripped during the ASCII safety fix.
   - Fix: In the MOCK_RESULT JSON, replace icon strings with actual emojis:
     - `"fish"` → `"🎣"`, `"truck"` → `"🚛"`, `"scooter"` → `"🛺"`, `"plane"` → `"✈️"`
     - `"rice"` → `"🌾"`, `"factory"` → `"🏭"`, `"shrimp"` → `"🍤"`, `"hotel"` → `"🏨"`
     - `"construction"` → `"🏗️"`, `"circuit"` → `"🔬"`, `"hospital"` → `"💊"`, `"bank"` → `"🏦"`
     - `"cart"` → `"🛒"`, `"leaf"` → `"🌿"`, `"barrel"` → `"📦"`, `"headset"` → `"🎓"`
     - `"ship"` → `"🚢"`, `"lightning"` → `"⚡"`, `"car"` → `"🚗"`, `"wheat"` → `"🌾"`
     - `"store"` → `"🏪"`, `"box"` → `"📦"`, `"route"` → `"🔄"`, `"solar"` → `"🔋"`
     - `"fuel"` → `"⛽"`, `"money"` → `"💰"`, `"phone"` → `"📱"`, `"grad"` → `"🎓"`
     - `"fire"` → `"🔥"`, `"bolt"` → `"⚡"`, `"cycle"` → `"🔄"`, `"sprout"` → `"🌱"`
   - These are safe inside the `JSON.parse(\`...\`)` backtick string

2. **Add impact score legend** — The -100 to +100 score is shown but never explained.
   - Fix: Add a small `(?)` tooltip next to the score ring that shows: "Below -60: severe disruption | -30 to -60: high risk | -15 to -30: elevated | -15 to +15: mixed | Above +15: positive"

### P1 — High value improvements
3. **Source citations** — AI outputs have no attribution. Add a "Sources" section listing the institutional data used.
4. **Move custom event to top** — Currently buried at bottom of sidebar. Move above the Geopolitical section or add a prominent button in the empty state.
5. **Collapsible sidebar** — Add a `⟨` toggle button to collapse the 308px sidebar for laptop screens.
6. **LocalStorage caching** — Extend session-only caching to localStorage with 24hr TTL per event key. Find the line: `sessionStorage.setItem('th_ml_state', ...)` and extend to also write per-event to localStorage.

### P2 — Feature completion
7. **Test comparison feature end-to-end** — Toggle Compare mode, select 2 events, click RUN COMPARISON. Verify renderCompare() output renders correctly on mobile.
8. **Methodology disclosure** — Add a subtle note below AI outputs: "Figures are AI-estimated ranges based on Thai NSO/BOT/BIS data. Not survey-measured."

---

## Adding New Events

Events are defined in the `EVENTS` object in the `<script>` tag. Pattern:

```javascript
your_event_key: {
  tag: "CATEGORY · STATUS — DATE",
  title: "Full Event Title",
  ctx: `Dense context paragraph. Include:
    - Specific numbers (worker counts, GDP %, trade values)
    - Named Thai companies and institutions  
    - Geographic specifics (Rayong, Isan, Laem Chabang)
    - Transmission mechanisms into Thai labour market
    - Government bodies involved (BOI, BAAC, EGAT, PTT)
    Target 300-500 words for best AI output quality.`
}
```

Then add the sidebar card in the HTML:
```html
<div class="ec" onclick="selEvent(this,'your_event_key')" role="button" tabindex="0">
  <div class="ec-row t-geo"><span class="sdot c-hi"></span>HIGH · DATE</div>
  <div class="ec-title">Your Event Title</div>
  <div class="ec-meta">Key stat · Key stat · Key stat</div>
  <div class="ec-cmp" onclick="toggleCompare(event,this,'Your Event Title')" aria-label="Add to compare">✓</div>
</div>
```

Category colour classes: `t-geo` (geopolitical), `t-trd` (trade), `t-mac` (macro/energy), `t-tec` (technology), `t-env` (environmental), `t-pol` (policy)

Severity dot classes: `c-crit` (red), `c-hi` (orange), `c-med` (yellow), `c-lo` (green)

---

## Regenerating the Assessment Report

Requires Node.js with `docx` package:

```bash
npm install -g docx
node assessment-report-generator.js
# Outputs: tmli-assessment.docx
```

---

## API Cost Reference

- Model: `claude-sonnet-4-20250514`
- Typical analysis: ~3,500 input tokens + ~4,000 output tokens
- Cost per analysis: ~$0.015–$0.025
- Monthly cost for active researcher (50 analyses): ~$0.75–$1.25

---

## Design Tokens (CSS Variables)

```css
--ink: #0C0F18       /* Primary text */
--paper: #F3EDE1     /* Page background */
--surface: #FDFAF4   /* Card background */
--gold: #B8943A      /* Accent / active states */
--red: #8B1D2F       /* Critical / negative */
--green: #1A6B3C     /* Positive / opportunity */
--blue: #1B3F7A      /* Government / info */
--orange: #B84C1A    /* High risk / warning */
--muted: #7A7060     /* Secondary text */
```

---

## Session History

This project was built across two sessions:
- **Session 1** (March 6, 2026): Core app — sidebar events, 5-tab output, profession/industry cards, prompt architecture
- **Session 2** (March 6, 2026): Production upgrade — API key management, robust JSON parsing, abort controller, CSV export, filter/sort, print CSS, ARIA accessibility, mock mode, mobile bug fixes
