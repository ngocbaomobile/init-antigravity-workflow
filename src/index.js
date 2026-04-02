/**
 * init-antigravity-workflow — Main CLI Logic
 *
 * Interactive wizard that scaffolds the 4-Round AI Workflow for any project.
 * Supports two setup modes:
 * - Global: Master Architect workspace (full knowledge access)
 * - Module: Module Owner workspace (scoped to Global + own module)
 *
 * Generates: .aiignore, .agentrules/.cursorrules, .antigravity/ directory,
 * the Constitution file (00_[PREFIX]_Agent_Workflow.md),
 * and the Context Router (00_Core_Routing.md).
 */

import { select, input, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import { writeFileSync, mkdirSync, existsSync, chmodSync } from 'node:fs';
import { resolve, join } from 'node:path';

import { getAiIgnore } from './templates/aiignore.js';
import { getAgentRules, getAgentRulesFilename } from './templates/agentrules.js';
import { getWorkflowTemplate } from './templates/workflow.js';
import { getRoutingTemplate } from './templates/routing.js';
import { detectDependencies } from './utils/detect-deps.js';
import { detectFramework } from './utils/detect-framework.js';
import { checkMcpConfig } from './utils/check-mcp.js';

// ─── Constants ───────────────────────────────────────────────────────────────
const ANTIGRAVITY_DIR = '.antigravity';

const FRAMEWORKS = [
    { name: 'Flutter (Dart)', value: 'flutter' },
    { name: 'Laravel (PHP)', value: 'laravel' },
    { name: 'React / Next.js', value: 'react' },
    { name: 'Node.js / Express', value: 'nodejs' },
    { name: 'Python / Django', value: 'python' },
    { name: 'Other', value: 'other' },
];

const SETUP_MODES = [
    { name: 'Global (Master Architect) — Full knowledge access, defines system-wide rules', value: 'global' },
    { name: 'Module (Module Owner) — Scoped to your module + Global conventions', value: 'module' },
];

const AGENT_TARGETS = [
    { name: 'Antigravity (Gemini)', value: 'antigravity' },
    { name: 'Cursor', value: 'cursor' },
    { name: 'Both', value: 'both' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Safe write: creates parent dirs if needed, skips if file exists and not forced */
function safeWrite(filePath, content, overwrite = false) {
    if (existsSync(filePath) && !overwrite) {
        console.log(chalk.yellow(`  ⚠  Skipped (exists): ${filePath}`));
        return false;
    }
    const dir = resolve(filePath, '..');
    mkdirSync(dir, { recursive: true });
    writeFileSync(filePath, content, 'utf-8');
    console.log(chalk.green(`  ✓  Created: ${filePath}`));
    return true;
}

/** Print a styled section header */
function header(text) {
    console.log('');
    console.log(chalk.cyan.bold(`━━━ ${text} ━━━`));
}

// ─── Main ────────────────────────────────────────────────────────────────────

export async function run() {
    const cwd = process.cwd();

    // ── Banner ──
    console.log('');
    console.log(chalk.bgCyan.black.bold('                                                   '));
    console.log(chalk.bgCyan.black.bold('   🚀  init-antigravity-workflow  v1.1.0            '));
    console.log(chalk.bgCyan.black.bold('   Universal AI Workflow Bootstrapper                '));
    console.log(chalk.bgCyan.black.bold('   Centralized Knowledge · Decentralized Execution   '));
    console.log(chalk.bgCyan.black.bold('                                                   '));
    console.log('');
    console.log(chalk.dim(`  Working directory: ${cwd}`));
    console.log('');

    // ── Step 1: Interactive Prompts ──
    header('Step 1 — Project Configuration');

    // 1a. Setup Mode
    const setupMode = await select({
        message: 'Select setup mode:',
        choices: SETUP_MODES,
    });

    const isModule = setupMode === 'module';

    // 1b. Module Name (only for module mode)
    let moduleName = '';
    if (isModule) {
        const rawModule = await input({
            message: 'Enter your MODULE name (e.g. Payment, Auth, Booking):',
            validate: (val) => {
                if (!val || val.trim().length === 0) return 'Module name is required.';
                if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(val.trim())) return 'Module name must start with a letter (letters, numbers, hyphens, underscores).';
                return true;
            },
        });
        // Capitalize first letter, keep the rest as-is
        const trimmed = rawModule.trim();
        moduleName = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    }

    // 1c. Framework (auto-detect or manual)
    let framework;
    const detected = detectFramework(cwd);
    if (detected) {
        const frameworkLabel = FRAMEWORKS.find(f => f.value === detected.framework)?.name || detected.framework;
        console.log('');
        console.log(chalk.cyan(`  🔍 Auto-detected: ${frameworkLabel}`));
        console.log(chalk.dim(`     ${detected.reason}`));
        console.log('');

        const useDetected = await confirm({
            message: `Use ${frameworkLabel} as your framework?`,
            default: true,
        });

        if (useDetected) {
            framework = detected.framework;
        } else {
            framework = await select({
                message: 'Select your project framework:',
                choices: FRAMEWORKS,
            });
        }
    } else {
        framework = await select({
            message: 'Select your project framework:',
            choices: FRAMEWORKS,
        });
    }

    // 1d. Project PREFIX
    const rawPrefix = await input({
        message: 'Enter your project PREFIX (e.g. LC247, MYAPP):',
        validate: (val) => {
            if (!val || val.trim().length === 0) return 'PREFIX is required.';
            if (!/^[A-Za-z0-9_-]+$/.test(val.trim())) return 'PREFIX must be alphanumeric (letters, numbers, hyphens, underscores).';
            return true;
        },
    });
    const prefix = rawPrefix.trim().toUpperCase();

    // 1e. Jira Key
    const jiraKey = await input({
        message: `Enter Jira project key (default: ${prefix}):`,
        default: prefix,
        transformer: (val) => val.toUpperCase(),
    });

    // 1f. Module Dependencies (only for module mode)
    let moduleDeps = [];
    if (isModule) {
        // Auto-detect from project config
        const detected = detectDependencies(cwd, framework);
        if (detected.length > 0) {
            console.log('');
            console.log(chalk.cyan('  📦 Auto-detected local dependencies:'));
            detected.forEach(d => console.log(chalk.dim(`     • ${d.package} → [Module-${d.name}]`)));
            console.log('');

            const useDetected = await confirm({
                message: 'Use these as module dependencies (READ-ONLY access)?',
                default: true,
            });

            if (useDetected) {
                moduleDeps = detected.map(d => d.name);
            }
        }

        // Manual input (add more or enter from scratch)
        const manualDeps = await input({
            message: `Additional module dependencies? (comma-separated, e.g. Auth,Core — or leave empty):`,
            default: '',
        });

        if (manualDeps.trim()) {
            const manual = manualDeps.split(',').map(d => {
                const t = d.trim();
                return t.charAt(0).toUpperCase() + t.slice(1);
            }).filter(d => d.length > 0 && d !== moduleName);
            moduleDeps = [...new Set([...moduleDeps, ...manual])];
        }
    }

    // 1g. Agent Target
    const agentTarget = await select({
        message: 'Select your AI agent:',
        choices: AGENT_TARGETS,
    });

    // 1h. Overwrite
    const overwrite = await confirm({
        message: 'Overwrite existing files if they exist?',
        default: false,
    });

    // ── Summary ──
    console.log('');
    console.log(chalk.dim('─'.repeat(55)));
    console.log(chalk.white.bold('  Configuration Summary:'));
    console.log(`    Setup Mode   : ${chalk.cyan(isModule ? `Module [${moduleName}]` : 'Global (Master Architect)')}`);
    if (isModule) {
        console.log(`    Module Name  : ${chalk.cyan(moduleName)}`);
        if (moduleDeps.length > 0) {
            console.log(`    Dependencies : ${chalk.cyan(moduleDeps.map(d => `[Module-${d}]`).join(', '))} ${chalk.dim('(READ-ONLY)')}`);
        }
    }
    console.log(`    Framework    : ${chalk.cyan(framework)}`);
    console.log(`    PREFIX       : ${chalk.cyan(prefix)}`);
    console.log(`    Jira Key     : ${chalk.cyan(jiraKey.toUpperCase())}`);
    console.log(`    Agent Target : ${chalk.cyan(agentTarget)}`);
    console.log(`    Overwrite    : ${chalk.cyan(overwrite ? 'Yes' : 'No')}`);
    console.log(chalk.dim('─'.repeat(55)));

    const proceed = await confirm({
        message: 'Proceed with scaffolding?',
        default: true,
    });

    if (!proceed) {
        console.log(chalk.yellow('\n  Aborted. No files were created.\n'));
        return;
    }

    // ── Step 2: Scaffolding ──
    header('Step 2 — Generating Files');

    // 2a. .aiignore
    const aiignorePath = join(cwd, '.aiignore');
    safeWrite(aiignorePath, getAiIgnore(framework), overwrite);

    // 2b. .agentrules / .cursorrules
    const rulesFilename = getAgentRulesFilename(agentTarget);
    const rulesPath = join(cwd, rulesFilename);
    safeWrite(rulesPath, getAgentRules(prefix, agentTarget, setupMode, moduleName, moduleDeps), overwrite);

    // 2c. If target is "both", also generate .cursorrules
    if (agentTarget === 'both') {
        const cursorPath = join(cwd, '.cursorrules');
        safeWrite(cursorPath, getAgentRules(prefix, 'cursor', setupMode, moduleName, moduleDeps), overwrite);
    }

    // 2d. .antigravity/ directory
    const antigravDir = join(cwd, ANTIGRAVITY_DIR);
    if (!existsSync(antigravDir)) {
        mkdirSync(antigravDir, { recursive: true });
        console.log(chalk.green(`  ✓  Created: ${ANTIGRAVITY_DIR}/`));
    } else {
        console.log(chalk.yellow(`  ⚠  Exists:  ${ANTIGRAVITY_DIR}/`));
    }

    // 2e. Constitution file: 00_[PREFIX]_Agent_Workflow.md
    const workflowFilename = `00_${prefix}_Agent_Workflow.md`;
    const workflowPath = join(antigravDir, workflowFilename);
    safeWrite(workflowPath, getWorkflowTemplate(prefix, jiraKey.toUpperCase(), setupMode, moduleName, moduleDeps), overwrite);

    // 2f. Context Router: 00_Core_Routing.md
    const routingFilename = '00_Core_Routing.md';
    const routingPath = join(antigravDir, routingFilename);
    safeWrite(routingPath, getRoutingTemplate(prefix, setupMode, moduleName, moduleDeps), overwrite);

    // ── Step 3: MCP Health Check ──
    header('Step 3 — MCP Health Check');

    const mcpStatus = checkMcpConfig(cwd, agentTarget);

    if (mcpStatus.found.length > 0) {
        mcpStatus.found.forEach(s => {
            console.log(chalk.green(`  ✅ ${s}`));
        });
    }

    if (mcpStatus.missing.length > 0) {
        mcpStatus.missing.forEach(s => {
            console.log(chalk.yellow(`  ⚠️  ${s} — not found in MCP config`));
        });
        console.log('');
        console.log(chalk.dim('  The workflow requires these MCP servers to function fully.'));
        console.log(chalk.dim('  Add them to your MCP config:'));

        if (agentTarget === 'cursor' || agentTarget === 'both') {
            console.log(chalk.dim('    Cursor:      .cursor/mcp.json'));
        }
        if (agentTarget === 'antigravity' || agentTarget === 'both') {
            console.log(chalk.dim('    Antigravity:  .gemini/settings.json'));
        }
        console.log('');
    } else {
        console.log(chalk.green.bold('\n  All MCP servers configured! 🎉'));
    }

    if (mcpStatus.configPaths.length === 0) {
        console.log(chalk.yellow('  ⚠️  No MCP config files found at all.'));
        console.log(chalk.dim('  Make sure to configure MCP servers before using the workflow.'));
        console.log('');
    }

    // ── Step 4: Success Banner ──
    header('Step 4 — Done! 🎉');

    console.log('');
    console.log(chalk.green.bold('  ✅ Antigravity Workflow initialized successfully!'));
    console.log(chalk.dim(`     Mode: ${isModule ? `Module [${moduleName}]` : 'Global (Master Architect)'}`));
    console.log('');
    console.log(chalk.white('  Generated files:'));
    console.log(chalk.dim(`    • .aiignore                      (${framework} patterns)`));
    console.log(chalk.dim(`    • ${rulesFilename}${' '.repeat(Math.max(0, 29 - rulesFilename.length))}(agent pre-flight rules)`));
    if (agentTarget === 'both') {
        console.log(chalk.dim('    • .cursorrules                   (agent pre-flight rules)'));
    }
    console.log(chalk.dim(`    • ${ANTIGRAVITY_DIR}/${workflowFilename}`));
    console.log(chalk.dim(`    • ${ANTIGRAVITY_DIR}/${routingFilename}   (context router)`));
    console.log('');

    // ── Architecture Mapping Prompt ──
    console.log(chalk.dim('═'.repeat(55)));
    console.log(chalk.yellow.bold('  📋 NEXT STEP — Architecture Mapping'));
    console.log(chalk.dim('═'.repeat(55)));
    console.log('');

    if (isModule) {
        // Module mode: generate module-scoped architecture map
        console.log(chalk.white('  Copy the prompt below and paste it into your AI agent'));
        console.log(chalk.white('  chat to auto-generate a Module Architecture Map:'));
        console.log('');
        console.log(chalk.dim('  ┌─────────────────────────────────────────────────────'));
        console.log(chalk.cyan(`  │  Scan the entire codebase of this project.`));
        console.log(chalk.cyan(`  │  This is the [Module-${moduleName}] sub-package.`));
        console.log(chalk.cyan(`  │  Identify: folder structure, entry points, key modules,`));
        console.log(chalk.cyan(`  │  state management patterns, API layers, and routing.`));
        console.log(chalk.cyan(`  │  Output a Module Architecture Map as Markdown`));
        console.log(chalk.cyan(`  │  and save it to:`));
        console.log(chalk.cyan.bold(`  │  .antigravity/${moduleName}_Architecture_Map.md`));
        console.log(chalk.dim('  └─────────────────────────────────────────────────────'));
        console.log('');
        console.log(chalk.dim('  Then upload this file to NotebookLM with the prefix:'));
        console.log(chalk.cyan.bold(`  [Module-${moduleName}] Architecture_Map.md`));
    } else {
        // Global mode: generate master architecture
        console.log(chalk.white('  Copy the prompt below and paste it into your AI agent'));
        console.log(chalk.white('  chat to auto-generate a Master Architecture Map:'));
        console.log('');
        console.log(chalk.dim('  ┌─────────────────────────────────────────────────────'));
        console.log(chalk.cyan(`  │  Scan the entire codebase of this project.`));
        console.log(chalk.cyan(`  │  Identify: folder structure, entry points, key modules,`));
        console.log(chalk.cyan(`  │  state management patterns, API layers, and routing.`));
        console.log(chalk.cyan(`  │  Output a comprehensive Master Architecture Map`));
        console.log(chalk.cyan(`  │  as Markdown and save it to:`));
        console.log(chalk.cyan.bold(`  │  .antigravity/${prefix}_Master_Architecture.md`));
        console.log(chalk.dim('  └─────────────────────────────────────────────────────'));
        console.log('');
        console.log(chalk.dim('  Then upload this file to NotebookLM with the prefix:'));
        console.log(chalk.cyan.bold(`  [Global-Convention] Master_Architecture.md`));
    }
    console.log('');
}
