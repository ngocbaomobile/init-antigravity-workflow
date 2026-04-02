/**
 * 00_[PREFIX]_Agent_Workflow.md — The "Constitution" template.
 * This is the core knowledge file that governs all AI agent behavior.
 * Contains: 4-Round Wizard, Context Manifest v2.0, Status Tracking, Sub-Agents.
 *
 * Supports two setup modes:
 * - global: Master Architect workspace (full access to all knowledge)
 * - module: Module Owner workspace (scoped to Global + own module)
 */

/**
 * Generate the full Agent Workflow Constitution file.
 * @param {string} prefix       - Project prefix, e.g. "LC247"
 * @param {string} jiraKey      - Jira project key, e.g. "LC" (defaults to prefix)
 * @param {'global'|'module'} setupMode - Setup mode
 * @param {string} [moduleName] - Module name (for module mode), e.g. "Payment"
 * @returns {string} Complete Markdown content
 */
export function getWorkflowTemplate(prefix, jiraKey, setupMode = 'global', moduleName = '') {
  const key = jiraKey || prefix;
  const isModule = setupMode === 'module';
  const moduleTag = isModule ? `Module-${moduleName}` : '';

  // ── Mode-specific sections ──
  const modeHeader = isModule
    ? `You are an autonomous AI agent operating within the **${prefix}** project ecosystem, scoped to the **[${moduleTag}]** domain.`
    : `You are an autonomous AI agent operating as the **Master Architect** of the **${prefix}** project ecosystem.`;

  const contextRulesSection = isModule
    ? getModuleContextRules(moduleTag)
    : getGlobalContextRules();

  const legoSection = isModule
    ? getModuleLegoSection(moduleTag)
    : getGlobalLegoSection();

  const manifestKnowledgeLayer = isModule
    ? `  knowledge_layer: "module"
  module: "${moduleName}"`
    : `  knowledge_layer: "global"`;

  const scopeField = isModule
    ? `  scope: "[${moduleTag}]"`
    : `  scope: "[Global | specify module scope]"`;

  const notebookLMStep = isModule
    ? `| 3 | **NotebookLM MCP** → Fetch \\\`[Global-Convention]\\\` files AND \\\`[${moduleTag}]\\\` files relevant to the task. **NEVER** fetch files from other modules. |`
    : `| 3 | **NotebookLM MCP** → Fetch \\\`[Global-Convention]\\\`, \\\`[Global-ADR]\\\`, \\\`[Global-Troubleshooting]\\\` files relevant to the task scope. |`;

  const knowledgeClosureStep = isModule
    ? `| 4 | Report completion. Ask: **"Shall I generate a [${moduleTag}] ADR or Troubleshooting summary for NotebookLM?"** |`
    : `| 4 | Report completion. Ask: **"Shall I generate a [Global-ADR] or [Global-Troubleshooting] summary for NotebookLM?"** |`;

  return `---
name: ${prefix.toLowerCase()}-agent-workflow
description: Strict 4-round interactive wizard workflow for ${prefix} project.
setup_mode: ${setupMode}${isModule ? `\nmodule: ${moduleName}` : ''}
---

# ${prefix} Agent Workflow & Context Rules

${modeHeader}

For ALL tasks, you MUST strictly adhere to the "4-Round Interactive Wizard" defined below.

---

## PART 1: Context Ingestion & Categorization Rules

${contextRulesSection}

---

${legoSection}

---

## PART 2: The 4-Round Interactive Wizard (STRICT MANDATE)

> **CRITICAL:** The Agent MUST NOT write code immediately. Proceed step-by-step through
> the rounds below. Only advance after the User explicitly approves ("Yes", "Ok", or "Approved").

### Decision Tree

\\\`\\\`\\\`
User Request
    │
    ├── Has Jira Ticket ID? ──── YES ──→ Jump to Round 1
    │
    └── NO ──→ Round 0 (Auto-Ticket)
                    │
                    └── Ticket Created ──→ Round 1
                                              │
                                              └── Context Approved ──→ Round 2
                                                                          │
                                                                          └── Plan Approved ──→ Round 3
                                                                                                  │
                                                                                                  └── Done ──→ Knowledge Closure
\\\`\\\`\\\`

---

### Round 0: Task Initialization (IF NO JIRA TICKET)

**Trigger:** User describes a bug/feature WITHOUT a Jira Ticket ID.

| Step | Action |
|------|--------|
| 1 | Act as PM. Interview user for: Title, Type (Bug/Feature/Refactor), detailed Description, Acceptance Criteria. |
| 2 | Draft a Jira ticket summary. Ask: **"Do you approve me to create this Jira ticket?"** |
| 3 | ⏸️ **Wait for Approval.** |
| 4 | Use **Jira MCP** → \\\`POST /rest/api/3/issue\\\` to create the ticket. Output Ticket ID (e.g., \\\`${key}-XXX\\\`). |
| 5 | Append empty Context Manifest to the ticket description. Proceed to Round 1. |

---

### Round 1: Context Gathering & Manifest Creation

**Trigger:** User provides a Jira Ticket ID OR Round 0 completes.

| Step | Action |
|------|--------|
| 1 | **Jira MCP** → Read ticket details, acceptance criteria, linked issues. |
| 2 | **Confluence MCP** → Search for related PRDs, API contracts, design docs. |
${notebookLMStep}
| 4 | Fill out the **Context Manifest v2.0** (see Part 3). |
| 5 | Print the full Manifest. Ask: **"Is this context complete and accurate?"** |
| 6 | ⏸️ **Wait for Approval.** |

---

### Round 2: Execution Planning

**Trigger:** Round 1 Manifest is approved.

| Step | Action |
|------|--------|
| 1 | Generate a step-by-step Execution Plan from the approved Manifest. |
| 2 | List all files to create/modify, API endpoints to call, and cite \\\`[Convention]\\\` rules. |
| 3 | Estimate effort and risk areas. |
| 4 | Ask: **"Do you approve this execution plan?"** |
| 5 | ⏸️ **Wait for Approval.** |

---

### Round 3: Execution, Verification & Knowledge Closure

**Trigger:** Round 2 Plan is approved.

| Step | Action |
|------|--------|
| 1 | Execute code changes following the approved plan. |
| 2 | Run linters/analyzers (e.g., \\\`flutter analyze\\\`, \\\`eslint\\\`, \\\`phpstan\\\`). Auto-fix errors using context. |
| 3 | Update \\\`execution_status\\\` on the Jira ticket (see Part 4). |
${knowledgeClosureStep}
| 5 | If yes → generate Markdown summary → use **NotebookLM MCP** to add as a new source. |

---

## PART 3: Context Manifest Template v2.0 (YAML)

\\\`\\\`\\\`yaml
---
# ═══════════════════════════════════════════════════════════
# ${prefix} CONTEXT MANIFEST v2.0
# ═══════════════════════════════════════════════════════════

task_info:
  id: "${key}-XXX"
  type: "[new_feature | bugfix | refactor]"
${scopeField}
${manifestKnowledgeLayer}

context_sources:
  - priority: 1  # Source of Truth (PRD / API Contract)
    source: "[Confluence / Jira]"
    query: "[Specific PRD name or link]"
  - priority: 2  # Core Technical Constraints
    source: "NotebookLM"
    query: "[Global-Convention] [Target_File.md]"${isModule ? `
  - priority: 3  # Module-specific conventions
    source: "NotebookLM"
    query: "[${moduleTag}] Convention [Target_File.md]"
  - priority: 4  # Historical Context
    source: "NotebookLM"
    query: "[${moduleTag}] ADR or Troubleshooting [Target_File.md]"` : `
  - priority: 3  # Historical Context
    source: "NotebookLM"
    query: "[Global-ADR] or [Global-Troubleshooting] [Target_File.md]"`}

execution_status:
  current_round: "0"            # 0 | 1 | 2 | 3 | done
  round_status: "pending"       # pending | in_progress | approved | blocked
  last_action: ""               # Short description of last action
  timestamp: ""                 # YYYY-MM-DD HH:mm
  completed_steps: []           # Progress checklist
  blockers: []                  # Active blockers (if any)

definition_of_done:
  - "Code compiles without errors."
  - "Linter passes (0 issues)."
  - "Code aligns with fetched [Convention]."
  - "Jira ticket status updated to Done."
---
\\\`\\\`\\\`

---

## PART 4: Execution Status Update Rules (STRICT MANDATE)

### 4.1 — When to Update \\\`execution_status\\\`

Agent MUST update \\\`execution_status\\\` on the **Jira ticket description** when:

| Trigger | Action |
|---------|--------|
| **Round transition** | Update \\\`current_round\\\`, \\\`round_status\\\`, append to \\\`completed_steps\\\`. |
| **Step completion**  | Update \\\`last_action\\\` and \\\`timestamp\\\`. |
| **Blocker encountered** | Append to \\\`blockers\\\`, set \\\`round_status: "blocked"\\\`. |
| **Task done** | Set \\\`current_round: "done"\\\`, \\\`round_status: "approved"\\\`. |

**Example of an in-progress status:**

\\\`\\\`\\\`yaml
execution_status:
  current_round: "3"
  round_status: "in_progress"
  last_action: "Created domain/entities/room.dart and room_repository.dart"
  timestamp: "2026-04-01 17:30"
  completed_steps:
    - "✅ Round 0: Jira ticket ${key}-180 created"
    - "✅ Round 1: Context Manifest approved"
    - "✅ Round 2: Execution Plan approved (7 files)"
    - "🔄 Round 3: Coding in progress (3/7 files done)"
  blockers: []
\\\`\\\`\\\`

### 4.2 — Session Resume Protocol

When starting a **new session**, the Agent MUST:

1. Fetch \\\`execution_status\\\` from the Jira ticket description.
2. Print: \\\`"🔄 Resuming from Round [X] — Last action: [last_action] at [timestamp]."\\\`
3. List \\\`completed_steps\\\` and \\\`blockers\\\` for User confirmation before continuing.
4. **NEVER restart from Round 0 if progress already exists.**

---

## PART 5: State Management Sub-Agents (INTERVIEW MODE)

When the user types \\\`/pause\\\`, \\\`/resume\\\`, or \\\`/handover\\\`, the Agent MUST:
- **Stop all current tasks immediately.**
- **Enter Interview Mode** — ask questions sequentially, wait for each answer.

---

### 5.1 — Trigger: \\\`/pause\\\`

**Goal:** Save current state to the Jira Manifest.

**Interview Questions (ask one at a time):**

1. *"I'm pausing this task. Please briefly tell me: what items have you completed so far?"*
2. *"Are there any code files left unfinished, or any linter errors intentionally left unfixed?"*
3. *"What is the next step to take when you return to this task?"*

**Action:** Synthesize answers → update \\\`execution_status\\\` → push to Jira via MCP.

---

### 5.2 — Trigger: \\\`/resume\\\`

**Goal:** Restore state and restart work.

**Action:** Fetch Manifest from Jira → read \\\`execution_status\\\` → then ask:

1. *"Welcome back! According to the Manifest, we were stuck at step: [pending_steps]. Do you want me to continue coding, or review the plan first?"*

---

### 5.3 — Trigger: \\\`/handover\\\`

**Goal:** Prepare a transfer package for another developer.

**Interview Questions (ask one at a time):**

1. *"Who will be taking over this task from you?"*
2. *"Besides the progress listed in \\\`pending_steps\\\`, do you have any warnings, risk notes, or API/Logic caveats specifically for that person?"*

**Action:** Add \\\`handover_notes\\\` block to Manifest → push to Jira via MCP.

\\\`\\\`\\\`yaml
# Appended to Context Manifest
handover_notes:
  recipient: "[Name]"
  warnings: "[Free-text notes from the original developer]"
  handover_date: "[YYYY-MM-DD]"
\\\`\\\`\\\`

---

## CRITICAL INSTRUCTION

> Before executing **any** user request:
> 1. Fetch and read this file: \\\`.antigravity/00_${prefix}_Agent_Workflow.md\\\`
> 2. Fetch and read the routing file: \\\`.antigravity/00_Core_Routing.md\\\`
> 3. When resuming a session, FIRST read \\\`execution_status\\\` from the Jira ticket.
> 4. **Never proceed with code until all prerequisite rounds are approved step-by-step.**
`;
}

// ─── Helper: Global Context Rules ────────────────────────────────────────────

function getGlobalContextRules() {
  return `When retrieving context from NotebookLM, the Agent MUST prioritize files by these prefixes:

| Priority | Prefix                     | Description                                             |
|----------|----------------------------|---------------------------------------------------------|
| 1        | \\\`[Global-Convention]\\\`      | Coding standards, folder structures, state management.  |
| 2        | \\\`[Global-ADR]\\\`             | Architecture Decision Records (system-wide decisions).  |
| 3        | \\\`[Global-Troubleshooting]\\\` | System-wide post-mortems, bug logs, required fixes.     |
| 4        | \\\`[Module-*]\\\`               | Module-specific files (read access for oversight).      |

**Scope:** As Master Architect, you have full visibility across all modules.`;
}

// ─── Helper: Module Context Rules ────────────────────────────────────────────

function getModuleContextRules(moduleTag) {
  return `When retrieving context from NotebookLM, the Agent MUST follow **Context Isolation** rules:

### ✅ Allowed Prefixes

| Priority | Prefix                     | Description                                             |
|----------|----------------------------|---------------------------------------------------------|
| 1        | \\\`[Global-Convention]\\\`      | System-wide coding standards (MANDATORY compliance).    |
| 2        | \\\`[Global-ADR]\\\`             | System-wide architecture decisions.                     |
| 3        | \\\`[Global-Troubleshooting]\\\` | System-wide post-mortems and fixes.                     |
| 4        | \\\`[${moduleTag}]\\\`           | Your module's conventions, ADRs, troubleshooting, feature logic. |

### ❌ Forbidden Prefixes

| Pattern              | Reason                                                  |
|----------------------|---------------------------------------------------------|
| \\\`[Module-*]\\\` (others) | Context Overload Prevention — causes hallucination.     |

> **CRITICAL:** If a task requires knowledge from another module, escalate to the Master Architect. NEVER read other module files.`;
}

// ─── Helper: Global Lego Architecture ────────────────────────────────────────

function getGlobalLegoSection() {
  return `## PART 1.5: Lego Architecture — Join Strategy

As **Master Architect**, compose the full system view by joining all knowledge layers:

1. **Read** \\\`[Global-Convention] Master_Architecture.md\\\` — the system-wide blueprint.
2. **List** all \\\`[Module-*] Architecture_Map.md\\\` files from NotebookLM.
3. **Join** them into a unified architecture view.

\\\`\\\`\\\`
┌─────────────────────────────────────────────┐
│        [Global] Master Architecture         │
│  (Standards, Patterns, Cross-cutting rules) │
├──────────┬──────────┬──────────┬────────────┤
│ Module A │ Module B │ Module C │ Module ... │
│ Arch Map │ Arch Map │ Arch Map │ Arch Map   │
└──────────┴──────────┴──────────┴────────────┘
\\\`\\\`\\\``;
}

// ─── Helper: Module Lego Architecture ────────────────────────────────────────

function getModuleLegoSection(moduleTag) {
  return `## PART 1.5: Lego Architecture — Join Strategy

To understand the full context of your module, compose a **dual-layer** view:

1. **Read** \\\`[Global-Convention] Master_Architecture.md\\\` — the system-wide blueprint.
2. **Read** \\\`[${moduleTag}] Architecture_Map.md\\\` — your module's local blueprint.
3. **Join** them to understand where your module fits in the system.

\\\`\\\`\\\`
┌──────────────────────────────────────────┐
│      [Global] Master Architecture        │
│  (Standards, Patterns, Cross-cutting)    │
├──────────────────────────────────────────┤
│                    │                     │
│    ┌───────────────▼──────────────┐      │
│    │  [${moduleTag}]${' '.repeat(Math.max(0, 24 - moduleTag.length))}│      │
│    │  Architecture Map            │      │
│    │  (Your scope of work)        │      │
│    └──────────────────────────────┘      │
└──────────────────────────────────────────┘
\\\`\\\`\\\`

> You see the full Global picture but only **act** within \\\`[${moduleTag}]\\\` boundaries.`;
}
