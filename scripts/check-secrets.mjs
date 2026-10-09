#!/usr/bin/env node
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// Common secret patterns
const PATTERNS = [
  {
    name: 'AWS Access Key ID',
    regex: /\bAKIA[0-9A-Z]{16}\b/,
  },
  {
    name: 'GitHub Personal Access Token',
    regex: /\bgh[pousr]_[A-Za-z0-9_]{36,}\b/,
  },
  {
    name: 'OpenAI Secret Key',
    regex: /\bsk-[A-Za-z0-9]{20,}\b/,
  },
  {
    name: 'Private Key Header',
    regex: /-----BEGIN(?:[ A-Z0-9_-]*)PRIVATE KEY-----/,
  },
  {
    name: 'Generic API Key / Secret / Token / Password Assignment',
    // Matches variable/property assignments of long sensitive tokens
    regex: /(?:(?:api[_-]?key|secret[_-]?key|auth[_-]?token|access[_-]?token|password|passwd|private[_-]?key))\s*[:=]\s*['"`]([A-Za-z0-9_./+=~-]{20,})['"`]/i,
  },
];

// Files to skip from secret scanning (binary assets, locks, self script)
const IGNORED_FILES = new Set([
  'package-lock.json',
  'scripts/check-secrets.mjs',
]);

const BINARY_EXTENSIONS = new Set([
  '.woff',
  '.woff2',
  '.ttf',
  '.otf',
  '.eot',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.ico',
  '.svg',
  '.pdf',
]);

function getTrackedFiles() {
  try {
    const stdout = execSync('git ls-files', { encoding: 'utf8' });
    return stdout
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);
  } catch (err) {
    console.error('Failed to get tracked git files:', err);
    process.exit(1);
  }
}

function scanFile(filePath) {
  if (IGNORED_FILES.has(filePath)) return [];
  const ext = path.extname(filePath).toLowerCase();
  if (BINARY_EXTENSIONS.has(ext)) return [];
  if (!fs.existsSync(filePath)) return [];

  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch {
    return [];
  }

  const lines = content.split('\n');
  const findings = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip comments that describe the rules or documentation references
    if (line.includes('check-secrets') || line.includes('secret patterns')) {
      continue;
    }

    for (const pattern of PATTERNS) {
      if (pattern.regex.test(line)) {
        findings.push({
          file: filePath,
          line: i + 1,
          rule: pattern.name,
          snippet: line.trim().slice(0, 80),
        });
      }
    }
  }

  return findings;
}

function main() {
  const files = getTrackedFiles();
  let allFindings = [];

  for (const file of files) {
    const findings = scanFile(file);
    if (findings.length > 0) {
      allFindings = allFindings.concat(findings);
    }
  }

  if (allFindings.length > 0) {
    console.error('\n❌ Secret scan failed! Detected potential secrets in tracked files:\n');
    for (const finding of allFindings) {
      console.error(
        `  ${finding.file}:${finding.line} [${finding.rule}]\n    Preview: ${finding.snippet}\n`
      );
    }
    console.error('Please remove or rotate any detected secrets before committing.\n');
    process.exit(1);
  }

  console.log('✅ Secret scan passed: no secrets detected in tracked files.');
  process.exit(0);
}

main();
