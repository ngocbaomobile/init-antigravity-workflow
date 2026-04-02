/**
 * Auto-detect module dependencies from project config files.
 * Currently supports:
 * - Flutter: reads pubspec.yaml for path dependencies
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Detect local path dependencies for a given framework.
 * @param {string} cwd       - Current working directory
 * @param {string} framework - Framework type (flutter, laravel, react, etc.)
 * @returns {{ name: string, path: string }[]} Array of detected dependencies
 */
export function detectDependencies(cwd, framework) {
    switch (framework) {
        case 'flutter':
            return detectFlutterDeps(cwd);
        default:
            return [];
    }
}

/**
 * Parse pubspec.yaml for path-based dependencies (local sub-packages).
 * Uses simple regex parsing to avoid adding a YAML dependency.
 * @param {string} cwd - Current working directory
 * @returns {{ name: string, path: string }[]}
 */
function detectFlutterDeps(cwd) {
    const pubspecPath = join(cwd, 'pubspec.yaml');
    if (!existsSync(pubspecPath)) return [];

    try {
        const content = readFileSync(pubspecPath, 'utf-8');
        const deps = [];

        // Match patterns like:
        //   some_package:
        //     path: ../some_package
        // Works for both `dependencies:` and `dev_dependencies:` sections
        const lines = content.split('\n');
        let i = 0;

        while (i < lines.length) {
            const line = lines[i];

            // Look for a dependency name (indented, ends with colon)
            const depMatch = line.match(/^\s{2,4}(\w[\w_-]*):\s*$/);
            if (depMatch) {
                const depName = depMatch[1];
                // Check if next line has `path:` (with 4-6 spaces indent)
                if (i + 1 < lines.length) {
                    const nextLine = lines[i + 1];
                    const pathMatch = nextLine.match(/^\s{4,8}path:\s*(.+)$/);
                    if (pathMatch) {
                        const depPath = pathMatch[1].trim();
                        // Extract a clean module name: capitalize first letter
                        const moduleName = depName
                            .split('_')
                            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                            .join('');
                        deps.push({ name: moduleName, path: depPath, package: depName });
                    }
                }
            }
            i++;
        }

        return deps;
    } catch {
        return [];
    }
}
