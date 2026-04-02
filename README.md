# 🚀 init-antigravity-workflow

> Universal AI Workflow Bootstrapper — Scaffold the **4-Round Interactive Wizard** for any project with Jira, Confluence & NotebookLM MCP integration.

## What It Does

Running this CLI tool in your project root generates:

| File | Purpose |
|------|---------|
| `.aiignore` | Framework-specific ignore patterns (like .gitignore but for AI agents) |
| `.agentrules` / `.cursorrules` | Forces the AI agent to read the Constitution before any task |
| `.antigravity/00_[PREFIX]_Agent_Workflow.md` | The "Constitution" — 4-Round Wizard, Context Manifest, Sub-Agents |

## Quick Start

### Option 1: npx (no install)

```bash
npx init-antigravity-workflow
```

### Option 2: Global install

```bash
npm install -g init-antigravity-workflow
init-antigravity-workflow
```

### Option 3: Clone & run locally

```bash
git clone https://github.com/your-org/init-antigravity-workflow.git
cd init-antigravity-workflow
npm install
node bin/cli.js
```

## Interactive Prompts

The CLI asks 4 questions:

1. **Framework** — Flutter, Laravel, React, Node.js, Python, or Other
2. **PREFIX** — Your project code (e.g. `LC247`, `BTRACK`), auto-uppercased
3. **Jira Key** — Jira project prefix for ticket IDs (defaults to PREFIX)
4. **Agent Target** — Antigravity (Gemini), Cursor, or Both

## Generated Files

### `.aiignore`
Prevents AI agents from indexing build artifacts, dependencies, and generated files. Patterns are tailored to your chosen framework.

### `.agentrules` / `.cursorrules`
Contains mandatory pre-flight instructions that force the AI agent to:
- Read the Constitution file before ANY task
- Check `execution_status` on Jira when resuming
- Follow the 4-Round Wizard protocol
- Respond to `/pause`, `/resume`, `/handover` commands

### `.antigravity/00_[PREFIX]_Agent_Workflow.md`
The complete "Constitution" file containing:

| Part | Content |
|------|---------|
| Part 1 | Context Ingestion & Categorization Rules |
| Part 2 | 4-Round Interactive Wizard (with decision tree) |
| Part 3 | Context Manifest v2.0 (YAML template) |
| Part 4 | Execution Status Tracking + Session Resume Protocol |
| Part 5 | Sub-Agent Interview Modes (`/pause`, `/resume`, `/handover`) |

## After Setup

The CLI prints a **sample prompt** — copy and paste it into your AI agent's chat to auto-generate an Architecture Map at `.antigravity/[PREFIX]_Architecture_Map.md`.

## Requirements

- Node.js ≥ 18
- An AI agent with MCP support (Jira, Confluence, NotebookLM)

## Publishing to npm

```bash
npm login
npm publish
```

## License

MIT
