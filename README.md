# 🚀 init-antigravity-workflow

> Universal AI Workflow Bootstrapper — Scaffold the **4-Round Interactive Wizard** for any project with Jira, Confluence & NotebookLM MCP integration.
> 
> Supports **Multi-Repo Architecture**: Centralized Knowledge (NotebookLM), Decentralized Execution (IDE/Local Repo).

## What It Does

Running this CLI tool in your project root generates:

| File | Purpose |
|------|---------|
| `.aiignore` | Framework-specific ignore patterns (like .gitignore but for AI agents) |
| `.agentrules` / `.cursorrules` | Forces the AI agent to read the Constitution before any task |
| `.antigravity/00_[PREFIX]_Agent_Workflow.md` | The "Constitution" — 4-Round Wizard, Context Manifest, Sub-Agents |
| `.antigravity/00_Core_Routing.md` | Context Router — controls which NotebookLM files the agent can access |

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

## Multi-Repo Architecture

This tool supports the **"Centralized Knowledge, Decentralized Execution"** pattern for enterprise multi-repo projects.

### Setup Modes

| Mode | Role | Description |
|------|------|-------------|
| **Global** | Master Architect | Full knowledge access. Defines system-wide `[Global-Convention]` rules. |
| **Module** | Module Owner | Scoped to `[Global-Convention]` + own `[Module-Name]` files only. |

### How It Works

```
┌─────────────────────────────────────────────┐
│          NotebookLM (Single Source)          │
│                                             │
│  [Global-Convention] Master_Architecture    │
│  [Global-Convention] Clean_Architecture     │
│  [Global-ADR] ADR-001_State_Management     │
│  [Module-Payment] Convention_...            │
│  [Module-Auth] ADR-001_...                  │
│  [Module-Booking] Troubleshooting_...       │
├──────────┬──────────┬──────────┬────────────┤
│ Repo A   │ Repo B   │ Repo C   │ Repo ...   │
│ (Global) │ (Module) │ (Module) │ (Module)   │
│ Full     │ Scoped   │ Scoped   │ Scoped     │
│ Access   │ Access   │ Access   │ Access     │
└──────────┴──────────┴──────────┴────────────┘
```

### Key Principles

1. **Centralized Knowledge** — One NotebookLM workspace for the entire project
2. **Decentralized Execution** — Each repo operates independently with its own agent
3. **Context Isolation** — Module agents can ONLY read Global + their own module files
4. **Lego Architecture** — Agent auto-joins `[Global] Master Architecture` + `[Module] Architecture Map`

## Interactive Prompts

The CLI asks these questions:

1. **Setup Mode** — Global (Master Architect) or Module (Module Owner)
2. **Module Name** — *(Module mode only)* e.g. `Payment`, `Auth`, `Booking`
3. **Framework** — Flutter, Laravel, React, Node.js, Python, or Other
4. **PREFIX** — Your project code (e.g. `LC247`, `MYAPP`), auto-uppercased
5. **Jira Key** — Jira project prefix for ticket IDs (defaults to PREFIX)
6. **Agent Target** — Antigravity (Gemini), Cursor, or Both

## Generated Files

### `.aiignore`
Prevents AI agents from indexing build artifacts, dependencies, and generated files. Patterns are tailored to your chosen framework.

### `.agentrules` / `.cursorrules`
Contains mandatory pre-flight instructions that force the AI agent to:
- Read the Constitution file before ANY task
- Read the Context Router for scope rules
- Check `execution_status` on Jira when resuming
- Follow the 4-Round Wizard protocol
- Respond to `/pause`, `/resume`, `/handover` commands

### `.antigravity/00_[PREFIX]_Agent_Workflow.md`
The complete "Constitution" file containing:

| Part | Content |
|------|---------|
| Part 1 | Context Ingestion & Categorization Rules (mode-aware) |
| Part 1.5 | Lego Architecture — Join Strategy |
| Part 2 | 4-Round Interactive Wizard (with decision tree) |
| Part 3 | Context Manifest v2.0 (YAML template with knowledge layer) |
| Part 4 | Execution Status Tracking + Session Resume Protocol |
| Part 5 | Sub-Agent Interview Modes (`/pause`, `/resume`, `/handover`) |

### `.antigravity/00_Core_Routing.md`
The Context Router file that defines:
- Which NotebookLM file prefixes the agent is allowed to access
- File naming conventions for the knowledge base
- Query strategy and priority ordering
- Lego Architecture join diagram

## After Setup

The CLI prints a **sample prompt** — copy and paste it into your AI agent's chat to auto-generate:
- **Global mode**: `[PREFIX]_Master_Architecture.md`
- **Module mode**: `[Module-Name]_Architecture_Map.md`

Then upload to NotebookLM with the appropriate prefix.

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
