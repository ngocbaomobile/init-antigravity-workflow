#!/usr/bin/env node

/**
 * CLI entry point for init-antigravity-workflow.
 * This file is referenced in package.json "bin" and runs via:
 *   npx init-antigravity-workflow
 */

import { run } from '../src/index.js';

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
