/**
 * Check if IDE has MCP servers configured (Jira, Confluence, NotebookLM).
 *
 * Checks common config file locations:
 * - Cursor: .cursor/mcp.json (project) or ~/.cursor/mcp.json (global)
 * - Antigravity/Gemini: .gemini/settings.json (project)
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const MCP_SERVERS = ['notebooklm', 'jira', 'confluence'];

/**
 * Check MCP server configuration for the given agent target.
 * @param {string} cwd         - Current working directory
 * @param {string} agentTarget - "antigravity" | "cursor" | "both"
 * @returns {{ found: string[], missing: string[], configPaths: string[] }}
 */
export function checkMcpConfig(cwd, agentTarget) {
    const results = { found: [], missing: [...MCP_SERVERS], configPaths: [] };

    const configPaths = getConfigPaths(cwd, agentTarget);

    for (const configPath of configPaths) {
        if (!existsSync(configPath)) continue;

        try {
            const content = readFileSync(configPath, 'utf-8').toLowerCase();
            results.configPaths.push(configPath);

            for (const server of MCP_SERVERS) {
                if (content.includes(server) && !results.found.includes(server)) {
                    results.found.push(server);
                    results.missing = results.missing.filter(s => s !== server);
                }
            }
        } catch { /* ignore unreadable files */ }
    }

    return results;
}

/**
 * Get list of config file paths to check based on agent target.
 * @param {string} cwd
 * @param {string} agentTarget
 * @returns {string[]}
 */
function getConfigPaths(cwd, agentTarget) {
    const home = homedir();
    const paths = [];

    if (agentTarget === 'cursor' || agentTarget === 'both') {
        paths.push(
            join(cwd, '.cursor', 'mcp.json'),
            join(home, '.cursor', 'mcp.json'),
        );
    }

    if (agentTarget === 'antigravity' || agentTarget === 'both') {
        paths.push(
            join(cwd, '.gemini', 'settings.json'),
            join(home, '.gemini', 'settings.json'),
        );
    }

    return paths;
}
