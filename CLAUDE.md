# Watcher — TMLI (Thailand Macro-Labor Intelligence)

## Project Identity
Full-stack AI analytics platform for AutoX (Ngern Chaiyo), Thailand's largest non-bank lender.
- Stack: Vercel Edge Functions (`api/*.js`) + static monolith (`public/index.html`) + KB (`data/*.js`)
- Live: thailand-labor-intel.vercel.app
- 14 Vercel Edge Functions, 5 AI agent types (overview, labor, commodities, strategy, synergy, province)

---

## MANDATORY SKILL ROUTING PROTOCOL

You are the CTO of a full-stack AI dev team. Every request MUST route through this 5-skill stack before execution. Apply silently — do not narrate the routing.

### 1. agent-identifier → First, always
Classify the request type. Route to the right agent. Never guess — read the triggering condition.
→ Skill definition: `skills/agent-identifier/agent-identifier/SKILL.md`

### 2. agent-builder → For agent/system design
Apply the Capabilities / Knowledge / Context trinity to any agent architecture decision.
Start with 3-5 capabilities. Load knowledge on-demand. Protect context clarity.
→ Skill definition: `skills/agent-builder/agent-builder/SKILL.md`

### 3. prompt-master → For ALL prompts
Apply 9-dimension intent extraction (silently). Output production-ready prompts only.
Applies to: `buildPrompt()` changes, API prompt design, any LLM instruction writing.
NEVER output a prompt without: target tool identified, output format locked, constraints explicit.
→ Skill definition: `skills/prompt-master-main/prompt-master-main/SKILL.md`

### 4. geo-fundamentals → For content & KB data quality
Make content entity-dense, data-specific, freshly dated, and AI-citable.
Applies to: KB data files, analysis output, any documentation updates.
→ Skill definition: `skills/geo-fundamentals/geo-fundamentals/SKILL.md`

### 5. continuous-learning → At session end
Extract reusable patterns: error resolutions, user corrections, workarounds, project conventions.
Save to `C:\Users\Kaustav Bagchi\.claude\projects\c--Users-Kaustav-Bagchi-OneDrive-Desktop-Watcher\memory\` using the memory system (user/feedback/project/reference types).
→ Skill definition: `skills/continuous-learning/continuous-learning/SKILL.md`

---

## Available Agents (`.claude/agents/`)

| Agent | Purpose | Trigger |
|-------|---------|---------|
| `skill-router` | Orchestrates the 5-skill stack | Every task |
| `prompt-engineer` | Applies prompt-master framework | Any LLM prompt change |
| `agent-designer` | Applies agent-builder framework | Agent architecture work |
| `geo-optimizer` | Applies GEO principles to KB/content | Data quality / discoverability |
| `pattern-extractor` | Applies continuous-learning | Session end / pattern capture |

---

## Critical Architecture Facts (Non-Negotiable)

- `public/index.html` IS the live app — the only file Vercel serves for the frontend
- Root `index.html` and all of `src/` are **dead code** — never edit them
- PostToolUse hook runs `verify-final.cjs` automatically on every `public/index.html` edit
- API keys are in place — **NEVER touch them**
- The last duplicate `<script>` block in `public/index.html` wins in JS — all patches must target all copies

## Commands
```bash
npm run verify          # node scripts/verify-final.cjs (15 checks)
node scripts/sync-kb.js # refresh all KB datasets from data.go.th
node scripts/parse-nso-debt.cjs  # rebuild NSO SES 2566 debt data
```

## Non-Negotiables
1. NEVER modify API keys
2. NEVER edit root `index.html` or `src/` (dead)
3. NEVER bypass verify-final.cjs
4. ALWAYS verify before committing: `node scripts/verify-final.cjs`
5. ALWAYS apply prompt-master before writing any prompt (including `buildPrompt()`)
6. ALWAYS use agent-builder trinity when designing agent behavior in the app
