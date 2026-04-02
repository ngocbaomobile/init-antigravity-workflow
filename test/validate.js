/**
 * Quick validation script — imports all templates and verifies output.
 * Run: node test/validate.js
 */
import { getAiIgnore } from '../src/templates/aiignore.js';
import { getAgentRules, getAgentRulesFilename } from '../src/templates/agentrules.js';
import { getWorkflowTemplate } from '../src/templates/workflow.js';
import { getRoutingTemplate } from '../src/templates/routing.js';

let pass = 0;
let fail = 0;

function assert(label, condition) {
    if (condition) {
        console.log(`  ✅ ${label}`);
        pass++;
    } else {
        console.log(`  ❌ ${label}`);
        fail++;
    }
}

console.log('\n━━━ Template Validation ━━━\n');

// ── .aiignore ──
console.log('📄 .aiignore templates:');
const flutterIgnore = getAiIgnore('flutter');
assert('Flutter: contains .dart_tool/', flutterIgnore.includes('.dart_tool/'));
assert('Flutter: contains build/', flutterIgnore.includes('build/'));
assert('Flutter: contains common .DS_Store', flutterIgnore.includes('.DS_Store'));

const laravelIgnore = getAiIgnore('laravel');
assert('Laravel: contains vendor/', laravelIgnore.includes('vendor/'));

const reactIgnore = getAiIgnore('react');
assert('React: contains node_modules/', reactIgnore.includes('node_modules/'));
assert('React: contains .next/', reactIgnore.includes('.next/'));

// ── .agentrules (Global Mode) ──
console.log('\n📄 .agentrules (Global Mode):');
const globalRules = getAgentRules('MYAPP', 'antigravity', 'global');
assert('Global: contains PREFIX "MYAPP"', globalRules.includes('MYAPP'));
assert('Global: references Constitution file', globalRules.includes('.antigravity/00_MYAPP_Agent_Workflow.md'));
assert('Global: references Context Router', globalRules.includes('00_Core_Routing.md'));
assert('Global: contains Master Architect role', globalRules.includes('Master Architect'));
assert('Global: contains [Global-Convention]', globalRules.includes('[Global-Convention]'));
assert('Global: contains [Module-*] read access', globalRules.includes('[Module-*]'));
assert('Global: contains MCP references', globalRules.includes('Jira MCP') && globalRules.includes('Confluence MCP') && globalRules.includes('NotebookLM MCP'));
assert('Global: contains /pause, /resume, /handover', globalRules.includes('/pause') && globalRules.includes('/resume') && globalRules.includes('/handover'));

// ── .agentrules (Module Mode) ──
console.log('\n📄 .agentrules (Module Mode):');
const moduleRules = getAgentRules('MYAPP', 'antigravity', 'module', 'Payment');
assert('Module: contains PREFIX "MYAPP"', moduleRules.includes('MYAPP'));
assert('Module: contains Module-Payment scope', moduleRules.includes('Module-Payment'));
assert('Module: contains Context Isolation', moduleRules.includes('Context Isolation'));
assert('Module: contains Forbidden section', moduleRules.includes('Forbidden'));
assert('Module: contains escalation warning', moduleRules.includes('Escalate') || moduleRules.includes('escalate'));
assert('Module: does NOT say Master Architect role', !moduleRules.includes('operating as the **Master Architect**'));

assert('Filename for antigravity = .agentrules', getAgentRulesFilename('antigravity') === '.agentrules');
assert('Filename for cursor = .cursorrules', getAgentRulesFilename('cursor') === '.cursorrules');

// ── Workflow template (Global Mode) ──
console.log('\n📄 Workflow (Global Mode):');
const wfGlobal = getWorkflowTemplate('LC247', 'LC', 'global');
assert('Global WF: header contains "LC247"', wfGlobal.includes('LC247 Agent Workflow'));
assert('Global WF: contains Master Architect', wfGlobal.includes('Master Architect'));
assert('Global WF: contains [Global-Convention] prefix', wfGlobal.includes('[Global-Convention]'));
assert('Global WF: contains [Global-ADR] prefix', wfGlobal.includes('[Global-ADR]'));
assert('Global WF: contains Lego Architecture', wfGlobal.includes('Lego Architecture'));
assert('Global WF: contains knowledge_layer global', wfGlobal.includes('knowledge_layer: "global"'));
assert('Global WF: contains Round 0-3', wfGlobal.includes('Round 0') && wfGlobal.includes('Round 1') && wfGlobal.includes('Round 2') && wfGlobal.includes('Round 3'));
assert('Global WF: contains execution_status', wfGlobal.includes('execution_status:'));
assert('Global WF: contains Session Resume Protocol', wfGlobal.includes('Session Resume Protocol'));
assert('Global WF: contains /pause, /resume, /handover', wfGlobal.includes('/pause') && wfGlobal.includes('/resume') && wfGlobal.includes('/handover'));
assert('Global WF: contains Decision Tree', wfGlobal.includes('Decision Tree'));
assert('Global WF: references Context Router', wfGlobal.includes('00_Core_Routing.md'));

// ── Workflow template (Module Mode) ──
console.log('\n📄 Workflow (Module Mode):');
const wfModule = getWorkflowTemplate('LC247', 'LC', 'module', 'Payment');
assert('Module WF: contains Module-Payment scope', wfModule.includes('Module-Payment'));
assert('Module WF: contains Context Isolation', wfModule.includes('Context Isolation'));
assert('Module WF: contains Forbidden prefixes', wfModule.includes('Forbidden'));
assert('Module WF: contains knowledge_layer module', wfModule.includes('knowledge_layer: "module"'));
assert('Module WF: contains Lego Architecture', wfModule.includes('Lego Architecture'));
assert('Module WF: NEVER fetch from other modules warning', wfModule.includes('NEVER'));
assert('Module WF: does NOT use Master Architect role', !wfModule.includes('operating as the **Master Architect**'));

// ── Routing template (Global Mode) ──
console.log('\n📄 Routing (Global Mode):');
const routeGlobal = getRoutingTemplate('LC247', 'global');
assert('Global Route: contains Master Architect', routeGlobal.includes('Master Architect'));
assert('Global Route: contains [Global-Convention]', routeGlobal.includes('[Global-Convention]'));
assert('Global Route: contains [Module-*] access', routeGlobal.includes('[Module-*]'));
assert('Global Route: contains Lego diagram', routeGlobal.includes('Module A'));

// ── Routing template (Module Mode) ──
console.log('\n📄 Routing (Module Mode):');
const routeModule = getRoutingTemplate('LC247', 'module', 'Payment');
assert('Module Route: contains Module-Payment', routeModule.includes('Module-Payment'));
assert('Module Route: contains Module Owner role', routeModule.includes('Module Owner'));
assert('Module Route: contains Forbidden section', routeModule.includes('Forbidden'));
assert('Module Route: contains context overload warning', routeModule.includes('Context Overload'));
assert('Module Route: contains NotebookLM query strategy', routeModule.includes('Query Strategy'));

// ── Cross-mode isolation check ──
console.log('\n📄 Cross-mode Isolation Checks:');
assert('No leftover "MYAPP" in LC247 global workflow', !wfGlobal.includes('MYAPP'));
assert('No leftover "MYAPP" in LC247 module workflow', !wfModule.includes('MYAPP'));
assert('Constitution path references LC247', wfGlobal.includes('00_LC247_Agent_Workflow.md'));

// ── Summary ──
console.log(`\n━━━ Results: ${pass} passed, ${fail} failed ━━━\n`);
process.exit(fail > 0 ? 1 : 0);
