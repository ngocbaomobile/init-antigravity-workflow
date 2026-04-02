/**
 * 00_Core_Routing.md — Context Router template.
 * Defines which NotebookLM files an agent is allowed to access
 * based on setup mode (global vs module).
 */

/**
 * Generate the Context Routing file content.
 * @param {string} prefix       - Project prefix, e.g. "LC247"
 * @param {'global'|'module'} setupMode - Setup mode
 * @param {string} [moduleName]  - Module name (required for module mode), e.g. "Payment"
 * @param {string[]} [moduleDeps] - Module dependencies (for module mode), e.g. ["Auth", "Core"]
 * @returns {string} Complete Markdown content
 */
export function getRoutingTemplate(prefix, setupMode, moduleName, moduleDeps = []) {
    if (setupMode === 'global') {
        return getGlobalRouting(prefix);
    }
    return getModuleRouting(prefix, moduleName, moduleDeps);
}

// ─── Global Mode Routing ─────────────────────────────────────────────────────

function getGlobalRouting(prefix) {
    return `---
name: ${prefix.toLowerCase()}-context-routing
mode: global
description: Context Router for ${prefix} Global (Master Architect) workspace.
---

# ${prefix} Context Router — Global Mode

> **Role:** You are operating as the **Master Architect** of the ${prefix} ecosystem.
> You have **full read/write access** to all NotebookLM sources.

---

## Routing Rules

### ✅ Allowed Prefixes (Full Access)

| Prefix | Description |
|--------|-------------|
| \`[Global-Convention]\` | Coding standards, folder structures, state management, architecture rules. |
| \`[Global-ADR]\` | Architecture Decision Records that apply to the entire system. |
| \`[Global-Troubleshooting]\` | System-wide post-mortems, incident reports, global bug fixes. |
| \`[Module-*]\` | All module-specific files (read access for oversight). |

### NotebookLM File Naming Convention

When creating new knowledge files, use this naming pattern:

\`\`\`
[Global-Convention] Master_Architecture.md
[Global-Convention] Clean_Architecture_Rules.md
[Global-Convention] Git_Flow_Standards.md
[Global-ADR] ADR-001_State_Management_Choice.md
[Global-Troubleshooting] Incident_2026-03_API_Timeout.md
\`\`\`

### Responsibilities

1. **Create & maintain** all \`[Global-Convention]\` files — these are the "Constitution" of the system.
2. **Review** module-level files pushed by Module Owners for consistency.
3. **Never create** files with \`[Module-*]\` prefix — that is the Module Owner's responsibility.

---

## Lego Architecture — Join Strategy

When analyzing the full system architecture, compose the view by:

1. **Read** \`[Global-Convention] Master_Architecture.md\` — the system-wide blueprint.
2. **List** all \`[Module-*] Architecture_Map.md\` files — each module's local blueprint.
3. **Join** them into a unified view without duplicating information.

\`\`\`
┌─────────────────────────────────────────────┐
│        [Global] Master Architecture         │
│  (Standards, Patterns, Cross-cutting rules) │
├──────────┬──────────┬──────────┬────────────┤
│ Module A │ Module B │ Module C │ Module ... │
│ Arch Map │ Arch Map │ Arch Map │ Arch Map   │
└──────────┴──────────┴──────────┴────────────┘
\`\`\`
`;
}

// ─── Module Mode Routing ─────────────────────────────────────────────────────

function getModuleRouting(prefix, moduleName, moduleDeps = []) {
    const moduleTag = `Module-${moduleName}`;
    const depsRows = moduleDeps.map(d =>
        `| \`[Module-${d}]\` | 🟡 READ | Dependency — interfaces and contracts only. |`
    ).join('\n');
    const depsQueryRows = moduleDeps.map((d, i) =>
        `| ${6 + i} | \`[Module-${d}] Convention\` | Dependency module conventions (READ-ONLY). |`
    ).join('\n');

    return `---
name: ${prefix.toLowerCase()}-context-routing
mode: module
module: ${moduleName}
description: Context Router for ${prefix} project — Module [${moduleName}].
---

# ${prefix} Context Router — Module Mode: ${moduleName}

> **Role:** You are operating as the **Module Owner** of \`[${moduleTag}]\` within the ${prefix} ecosystem.
> You have **scoped access** — only Global files and your own module files.

---

## 🚨 CONTEXT ISOLATION RULES (STRICT MANDATE)

### ✅ Allowed Prefixes

| Prefix | Access | Description |
|--------|--------|-------------|
| \`[Global-Convention]\` | 🟢 READ | System-wide coding standards, architecture rules. |
| \`[Global-ADR]\` | 🟢 READ | Architecture Decision Records (system-level). |
| \`[Global-Troubleshooting]\` | 🟢 READ | System-wide incident reports, post-mortems. |
| \`[${moduleTag}]\` | 🟢 READ/WRITE | Your module's conventions, ADRs, troubleshooting. |${depsRows ? `\n${depsRows}` : ''}

### ❌ Forbidden Prefixes

| Pattern | Reason |
|---------|--------|
| \`[Module-*]\` (other modules) | **Context Overload Prevention** — reading other modules' files causes hallucination and cross-contamination. |${moduleDeps.length > 0 ? `\n\n> **Exception:** Dependencies listed above (${moduleDeps.map(d => `\`[Module-${d}]\``).join(', ')}) are allowed as READ-ONLY.` : ''}

> **CRITICAL:** If a task requires knowledge from another module, you MUST escalate to the
> Master Architect or the other Module Owner. **NEVER read their files directly.**

---

## NotebookLM File Naming Convention

When creating new knowledge files for this module, use:

\`\`\`
[${moduleTag}] Convention_State_Management.md
[${moduleTag}] ADR-001_Payment_Gateway_Choice.md
[${moduleTag}] Troubleshooting_Timeout_Bug.md
[${moduleTag}] Feature-Logic_Discount_Rules.md
\`\`\`

---

## NotebookLM Query Strategy

When fetching context from NotebookLM MCP, follow this priority:

| Priority | Query Pattern | Purpose |
|----------|---------------|---------|
| 1 | \`[Global-Convention]\` | System-wide rules you MUST follow. |
| 2 | \`[${moduleTag}] Convention\` | Module-specific coding standards. |
| 3 | \`[${moduleTag}] ADR\` | Past architecture decisions for this module. |
| 4 | \`[${moduleTag}] Troubleshooting\` | Known bugs and fixes in this module. |
| 5 | \`[${moduleTag}] Feature-Logic\` | Complex business rules specific to this module. |${depsQueryRows ? `\n${depsQueryRows}` : ''}

---

## Lego Architecture — Join Strategy

When you need to understand the full architecture context, compose your view by:

1. **Read** \`[Global-Convention] Master_Architecture.md\` — the system-wide blueprint.
2. **Read** \`[${moduleTag}] Architecture_Map.md\` — your module's local blueprint.
3. **Join** them to understand where your module fits in the system.

\`\`\`
┌──────────────────────────────────────────┐
│      [Global] Master Architecture        │
│  (Standards, Patterns, Cross-cutting)    │
├──────────────────────────────────────────┤
│                    │                     │
│    ┌───────────────▼──────────────┐      │
│    │  [${moduleTag}]              │      │
│    │  Architecture Map            │      │
│    │  (Your scope of work)        │      │
│    └──────────────────────────────┘      │
└──────────────────────────────────────────┘
\`\`\`

> You see the full picture but only **act** within your module boundary.
`;
}
