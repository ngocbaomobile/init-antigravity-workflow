#!/usr/bin/env node

/**
 * CLI entry point for init-antigravity-workflow.
 * This file is referenced in package.json "bin" and runs via:
 *   npx init-antigravity-workflow          (init — default)
 *   npx init-antigravity-workflow clean    (remove generated files)
 *   npx init-antigravity-workflow clean --force  (skip confirmation)
 */

const args = process.argv.slice(2);
const command = args[0];

if (command === 'clean') {
    const force = args.includes('--force') || args.includes('-f');

    import('../src/clean.js')
        .then(({ clean }) => clean({ force }))
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
} else {
    import('../src/index.js')
        .then(({ run }) => run())
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
}
