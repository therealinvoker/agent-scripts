import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, '..', 'templates');

const FILES = [
  { template: 'AGENTS.md', dest: 'AGENTS.md' },
  { template: 'CLAUDE.md', dest: 'CLAUDE.md' },
  { template: 'ARCHITECTURE.md', dest: 'docs/ARCHITECTURE.md' },
  { template: 'CHANGELOG.md', dest: 'docs/CHANGELOG.md' },
];

const DIRS = [
  'docs',
  'docs/plans',
];

export async function init({ force = false } = {}) {
  const cwd = process.cwd();
  const projectName = basename(cwd);

  console.log(`\nScaffolding agent docs in ${cwd}...\n`);

  // Create directories
  for (const dir of DIRS) {
    const fullPath = join(cwd, dir);
    if (!existsSync(fullPath)) {
      mkdirSync(fullPath, { recursive: true });
      console.log(`  📁 Created ${dir}/`);
    }
  }

  // Copy template files
  let created = 0;
  let skipped = 0;

  for (const { template, dest } of FILES) {
    const destPath = join(cwd, dest);
    const destDir = dirname(destPath);

    if (!existsSync(destDir)) {
      mkdirSync(destDir, { recursive: true });
    }

    if (existsSync(destPath) && !force) {
      console.log(`  ⏭️  ${dest} — already exists (use --force to overwrite)`);
      skipped++;
      continue;
    }

    let content = readFileSync(join(TEMPLATES_DIR, template), 'utf-8');
    content = content.replaceAll('{{PROJECT_NAME}}', projectName);

    writeFileSync(destPath, content, 'utf-8');
    console.log(`  ✅ ${dest}`);
    created++;
  }

  console.log(`\n  Created: ${created}  Skipped: ${skipped}\n`);

  if (created > 0) {
    console.log('Next steps:');
    console.log('  1. Fill in AGENTS.md — replace <!-- comments --> with real project info');
    console.log('  2. Fill in docs/ARCHITECTURE.md — add system diagram and directory structure');
    console.log('  3. Customize CLAUDE.md — add any Claude Code-specific instructions');
    console.log('  4. Run `agent-scripts check` to verify everything is complete');
    console.log();
  }
}
