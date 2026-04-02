/**
 * Quick validation script — imports all templates and verifies output.
 * Run: node test/validate.js
 */
import { getAiIgnore } from '../src/templates/aiignore.js';
import { getAgentRules, getAgentRulesFilename } from '../src/templates/agentrules.js';
import { getWorkflowTemplate } from '../src/templates/workflow.js';

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

// ── .agentrules ──
console.log('\n📄 .agentrules templates:');
const rules = getAgentRules('MYAPP', 'antigravity');
assert('Contains PREFIX "MYAPP"', rules.includes('MYAPP'));
assert('References Constitution file path', rules.includes('.antigravity/00_MYAPP_Agent_Workflow.md'));
assert('Contains MCP references', rules.includes('Jira MCP') && rules.includes('Confluence MCP') && rules.includes('NotebookLM MCP'));
assert('Contains /pause, /resume, /handover', rules.includes('/pause') && rules.includes('/resume') && rules.includes('/handover'));

assert('Filename for antigravity = .agentrules', getAgentRulesFilename('antigravity') === '.agentrules');
assert('Filename for cursor = .cursorrules', getAgentRulesFilename('cursor') === '.cursorrules');

// ── Workflow template ──
console.log('\n📄 Workflow (Constitution) template:');
const wf = getWorkflowTemplate('LC247', 'LC');
assert('Header contains "LC247 CONTEXT MANIFEST"', wf.includes('LC247 CONTEXT MANIFEST'));
assert('Contains Jira key "LC-XXX"', wf.includes('LC-XXX'));
assert('Contains Round 0', wf.includes('Round 0'));
assert('Contains Round 1', wf.includes('Round 1'));
assert('Contains Round 2', wf.includes('Round 2'));
assert('Contains Round 3', wf.includes('Round 3'));
assert('Contains execution_status YAML block', wf.includes('execution_status:'));
assert('Contains Session Resume Protocol', wf.includes('Session Resume Protocol'));
assert('Contains /pause sub-agent', wf.includes('/pause'));
assert('Contains /resume sub-agent', wf.includes('/resume'));
assert('Contains /handover sub-agent', wf.includes('/handover'));
assert('Contains handover_notes YAML', wf.includes('handover_notes:'));
assert('Contains decision tree', wf.includes('Decision Tree'));
assert('No leftover "BTRACK" literals', !wf.includes('BTRACK'));
assert('Constitution path references LC247', wf.includes('00_LC247_Agent_Workflow.md'));

// ── Summary ──
console.log(`\n━━━ Results: ${pass} passed, ${fail} failed ━━━\n`);
process.exit(fail > 0 ? 1 : 0);
