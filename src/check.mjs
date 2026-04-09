import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const REQUIRED_FILES = [
  { path: 'AGENTS.md', label: 'Agent instructions (cross-tool)' },
  { path: 'CLAUDE.md', label: 'Claude Code wrapper' },
  { path: 'docs/ARCHITECTURE.md', label: 'Architecture reference' },
  { path: 'docs/CHANGELOG.md', label: 'Changelog' },
];

const OPTIONAL_FILES = [
  { path: 'docs/plans', label: 'Build plans directory', isDir: true },
  { path: '.claude/rules', label: 'Claude path-scoped rules directory', isDir: true },
];

export async function check() {
  const cwd = process.cwd();
  let missing = 0;
  let warnings = 0;

  console.log('Checking agent docs...\n');

  // Required files
  for (const { path, label } of REQUIRED_FILES) {
    const fullPath = join(cwd, path);
    if (existsSync(fullPath)) {
      const content = readFileSync(fullPath, 'utf-8');
      const hasPlaceholders = content.includes('<!--') && content.includes('-->');
      if (hasPlaceholders) {
        console.log(`  ⚠️  ${path} — exists but still has <!-- comment --> placeholders`);
        warnings++;
      } else {
        console.log(`  ✅ ${path} — ${label}`);
      }
    } else {
      console.log(`  ❌ ${path} — missing (${label})`);
      missing++;
    }
  }

  // Optional files
  for (const { path, label } of OPTIONAL_FILES) {
    const fullPath = join(cwd, path);
    if (existsSync(fullPath)) {
      console.log(`  ✅ ${path} — ${label}`);
    } else {
      console.log(`  💡 ${path} — not found (optional: ${label})`);
    }
  }

  // CLAUDE.md imports check
  const claudePath = join(cwd, 'CLAUDE.md');
  if (existsSync(claudePath)) {
    const content = readFileSync(claudePath, 'utf-8');
    if (!content.includes('@AGENTS.md')) {
      console.log(`\n  ⚠️  CLAUDE.md does not import @AGENTS.md — Claude Code won't read your agent instructions`);
      warnings++;
    }
  }

  console.log();
  if (missing > 0) {
    console.log(`${missing} required file(s) missing. Run \`agent-scripts init\` to scaffold them.`);
    process.exit(1);
  } else if (warnings > 0) {
    console.log(`All files present, but ${warnings} warning(s). Fill in placeholder comments.`);
  } else {
    console.log('All agent docs look good!');
  }
}
