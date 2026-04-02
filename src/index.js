/**
 * init-antigravity-workflow — Main CLI Logic
 *
 * Interactive wizard that scaffolds the 4-Round AI Workflow for any project.
 * Generates: .aiignore, .agentrules/.cursorrules, .antigravity/ directory,
 * and the Constitution file (00_[PREFIX]_Agent_Workflow.md).
 */

import { select, input, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import { writeFileSync, mkdirSync, existsSync, chmodSync } from 'node:fs';
import { resolve, join } from 'node:path';

import { getAiIgnore } from './templates/aiignore.js';
import { getAgentRules, getAgentRulesFilename } from './templates/agentrules.js';
import { getWorkflowTemplate } from './templates/workflow.js';

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
    console.log(chalk.bgCyan.black.bold('   🚀  init-antigravity-workflow  v1.0.0            '));
    console.log(chalk.bgCyan.black.bold('   Universal AI Workflow Bootstrapper                '));
    console.log(chalk.bgCyan.black.bold('                                                   '));
    console.log('');
    console.log(chalk.dim(`  Working directory: ${cwd}`));
    console.log('');

    // ── Step 1: Interactive Prompts ──
    header('Step 1 — Project Configuration');

    const framework = await select({
        message: 'Select your project framework:',
        choices: FRAMEWORKS,
    });

    const rawPrefix = await input({
        message: 'Enter your project PREFIX (e.g. LC247, BTRACK):',
        validate: (val) => {
            if (!val || val.trim().length === 0) return 'PREFIX is required.';
            if (!/^[A-Za-z0-9_-]+$/.test(val.trim())) return 'PREFIX must be alphanumeric (letters, numbers, hyphens, underscores).';
            return true;
        },
    });
    const prefix = rawPrefix.trim().toUpperCase();

    const jiraKey = await input({
        message: `Enter Jira project key (default: ${prefix}):`,
        default: prefix,
        transformer: (val) => val.toUpperCase(),
    });

    const agentTarget = await select({
        message: 'Select your AI agent:',
        choices: AGENT_TARGETS,
    });

    const overwrite = await confirm({
        message: 'Overwrite existing files if they exist?',
        default: false,
    });

    // ── Summary ──
    console.log('');
    console.log(chalk.dim('─'.repeat(55)));
    console.log(chalk.white.bold('  Configuration Summary:'));
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
    safeWrite(rulesPath, getAgentRules(prefix, agentTarget), overwrite);

    // 2c. If target is "both", also generate .cursorrules
    if (agentTarget === 'both') {
        const cursorPath = join(cwd, '.cursorrules');
        safeWrite(cursorPath, getAgentRules(prefix, 'cursor'), overwrite);
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
    safeWrite(workflowPath, getWorkflowTemplate(prefix, jiraKey.toUpperCase()), overwrite);

    // ── Step 3: Make bin executable ──
    // (Only relevant when developing the tool locally)

    // ── Step 4: Success Banner ──
    header('Step 3 — Done! 🎉');

    console.log('');
    console.log(chalk.green.bold('  ✅ Antigravity Workflow initialized successfully!'));
    console.log('');
    console.log(chalk.white('  Generated files:'));
    console.log(chalk.dim(`    • .aiignore                      (${framework} patterns)`));
    console.log(chalk.dim(`    • ${rulesFilename}${' '.repeat(Math.max(0, 29 - rulesFilename.length))}(agent pre-flight rules)`));
    if (agentTarget === 'both') {
        console.log(chalk.dim('    • .cursorrules                   (agent pre-flight rules)'));
    }
    console.log(chalk.dim(`    • ${ANTIGRAVITY_DIR}/${workflowFilename}`));
    console.log('');

    // ── Architecture Mapping Prompt ──
    console.log(chalk.dim('═'.repeat(55)));
    console.log(chalk.yellow.bold('  📋 NEXT STEP — Architecture Mapping'));
    console.log(chalk.dim('═'.repeat(55)));
    console.log('');
    console.log(chalk.white('  Copy the prompt below and paste it into your AI agent'));
    console.log(chalk.white('  chat to auto-generate an Architecture Map:'));
    console.log('');
    console.log(chalk.dim('  ┌─────────────────────────────────────────────────────'));
    console.log(chalk.cyan(`  │  Scan the entire codebase of this project.`));
    console.log(chalk.cyan(`  │  Identify: folder structure, entry points, key modules,`));
    console.log(chalk.cyan(`  │  state management patterns, API layers, and routing.`));
    console.log(chalk.cyan(`  │  Output a comprehensive Architecture Map as Markdown`));
    console.log(chalk.cyan(`  │  and save it to:`));
    console.log(chalk.cyan.bold(`  │  .antigravity/${prefix}_Architecture_Map.md`));
    console.log(chalk.dim('  └─────────────────────────────────────────────────────'));
    console.log('');
    console.log(chalk.dim('  The agent will analyze your codebase and generate a'));
    console.log(chalk.dim(`  detailed map at ${ANTIGRAVITY_DIR}/${prefix}_Architecture_Map.md`));
    console.log('');
}
