import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as p from '@clack/prompts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, '..', 'templates');
const AGENTS_DIR = join(__dirname, '..', 'agents');

function getAgentTypes() {
  return readdirSync(AGENTS_DIR)
    .filter(f => f.endsWith('.md'))
    .map(file => {
      const content = readFileSync(join(AGENTS_DIR, file), 'utf-8');
      const raw = file.replace(/_SETUP\.md$/, '').replace(/_/g, ' ').toLowerCase();
      const name = raw.charAt(0).toUpperCase() + raw.slice(1);
      const match = content.match(/## Purpose\s*\n+([^\n]+)/);
      const hint = match ? match[1].trim() : '';
      return { file, name, hint, value: file };
    });
}

const DIRS = [
  'docs',
  'docs/plans',
];

const UNINSTALL_PATHS = [
  'AGENTS.md',
  'CLAUDE.md',
  'docs/AGENT_SETUP.md',
  'docs/ARCHITECTURE.md',
  'docs/CHANGELOG.md',
  'docs/plans',
  'docs',
];

export async function init({ force = false } = {}) {
  const cwd = process.cwd();
  const projectName = basename(cwd);

  p.intro('agent-scripts');

  const action = await p.select({
    message: 'What would you like to do?',
    options: [
      { value: 'install', label: 'Install', hint: 'Scaffold agent docs in this directory' },
      { value: 'uninstall', label: 'Uninstall', hint: 'Remove agent docs from this directory' },
    ],
  });

  if (p.isCancel(action)) {
    p.cancel('Cancelled.');
    process.exit(0);
  }

  if (action === 'uninstall') {
    let removed = 0;
    for (const rel of UNINSTALL_PATHS) {
      const fullPath = join(cwd, rel);
      if (existsSync(fullPath)) {
        rmSync(fullPath, { recursive: true, force: true });
        p.log.step(`Removed ${rel}`);
        removed++;
      }
    }
    p.outro(removed > 0 ? `Removed ${removed} item(s).` : 'Nothing to remove.');
    return;
  }

  // Install flow
  const agentTypes = getAgentTypes();
  const selected = await p.select({
    message: 'Select an agent type:',
    options: agentTypes.map(t => ({
      value: t.value,
      label: `${t.name}  ${t.hint}`,
    })),
    initialValue: agentTypes[0]?.value,
  });

  if (p.isCancel(selected)) {
    p.cancel('Cancelled.');
    process.exit(0);
  }

  const agentType = agentTypes.find(t => t.value === selected);

  p.note(
    `You are installing into: ${cwd}\n\nMake sure this is the right directory.\nFor developers, this should be your git root.`,
    'Heads up'
  );

  const FILES = [
    { src: join(TEMPLATES_DIR, 'AGENTS.md'), dest: 'AGENTS.md', isTemplate: true },
    { src: join(TEMPLATES_DIR, 'CLAUDE.md'), dest: 'CLAUDE.md', isTemplate: true },
    { src: join(TEMPLATES_DIR, 'ARCHITECTURE.md'), dest: 'docs/ARCHITECTURE.md', isTemplate: true },
    { src: join(TEMPLATES_DIR, 'CHANGELOG.md'), dest: 'docs/CHANGELOG.md', isTemplate: true },
    { src: join(AGENTS_DIR, agentType.file), dest: 'docs/AGENT_SETUP.md', isTemplate: false },
  ];

  // Create directories
  for (const dir of DIRS) {
    const fullPath = join(cwd, dir);
    if (!existsSync(fullPath)) {
      mkdirSync(fullPath, { recursive: true });
    }
  }

  // Copy template files
  let created = 0;
  let skipped = 0;

  for (const { src, dest, isTemplate } of FILES) {
    const destPath = join(cwd, dest);
    const destDir = dirname(destPath);

    if (!existsSync(destDir)) {
      mkdirSync(destDir, { recursive: true });
    }

    if (existsSync(destPath) && !force) {
      p.log.warn(`${dest} — already exists (use --force to overwrite)`);
      skipped++;
      continue;
    }

    let content = readFileSync(src, 'utf-8');
    if (isTemplate) content = content.replaceAll('{{PROJECT_NAME}}', projectName);

    writeFileSync(destPath, content, 'utf-8');
    p.log.step(`${dest}`);
    created++;
  }

  if (created > 0) {
    p.outro(`Done! Restart Claude (or your agent) in this directory and your AGENTS.md will be read every session.`);
  } else {
    p.outro(`${skipped} file(s) skipped — all already exist. Use --force to overwrite.`);
  }
}
