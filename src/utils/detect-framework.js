/**
 * Auto-detect project framework from config files in the working directory.
 *
 * Detection priority:
 * 1. pubspec.yaml          → flutter
 * 2. composer.json          → laravel
 * 3. package.json + react   → react
 * 4. package.json (no react)→ nodejs
 * 5. requirements.txt / manage.py / pyproject.toml → python
 * 6. None found             → null (ask user)
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Detect the framework used in the current project directory.
 * @param {string} cwd - Current working directory
 * @returns {{ framework: string, confidence: string, reason: string } | null}
 */
export function detectFramework(cwd) {
    // 1. Flutter
    if (existsSync(join(cwd, 'pubspec.yaml'))) {
        return {
            framework: 'flutter',
            confidence: 'high',
            reason: 'Found pubspec.yaml',
        };
    }

    // 2. Laravel
    if (existsSync(join(cwd, 'composer.json'))) {
        try {
            const composer = readFileSync(join(cwd, 'composer.json'), 'utf-8');
            if (composer.includes('laravel')) {
                return {
                    framework: 'laravel',
                    confidence: 'high',
                    reason: 'Found composer.json with Laravel dependency',
                };
            }
        } catch { /* ignore */ }
        return {
            framework: 'laravel',
            confidence: 'medium',
            reason: 'Found composer.json (assumed PHP/Laravel)',
        };
    }

    // 3-4. React or Node.js
    if (existsSync(join(cwd, 'package.json'))) {
        try {
            const pkg = readFileSync(join(cwd, 'package.json'), 'utf-8');
            if (pkg.includes('"react"') || pkg.includes('"next"') || pkg.includes('"@next/')) {
                return {
                    framework: 'react',
                    confidence: 'high',
                    reason: 'Found package.json with React/Next.js dependency',
                };
            }
        } catch { /* ignore */ }
        return {
            framework: 'nodejs',
            confidence: 'medium',
            reason: 'Found package.json (Node.js project)',
        };
    }

    // 5. Python
    if (
        existsSync(join(cwd, 'requirements.txt')) ||
        existsSync(join(cwd, 'manage.py')) ||
        existsSync(join(cwd, 'pyproject.toml'))
    ) {
        const reason = existsSync(join(cwd, 'manage.py'))
            ? 'Found manage.py (Django project)'
            : existsSync(join(cwd, 'pyproject.toml'))
                ? 'Found pyproject.toml'
                : 'Found requirements.txt';
        return {
            framework: 'python',
            confidence: 'medium',
            reason,
        };
    }

    // 6. Not detected
    return null;
}
