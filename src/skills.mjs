import { execSync } from 'node:child_process';
import { createReadStream } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as p from '@clack/prompts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REGISTRY_PATH = join(__dirname, 'skills-registry.json');

function loadRegistry() {
  // Stream parse to avoid loading 1900+ entries into memory at once
  const raw = new URL(`file://${REGISTRY_PATH}`);
  return JSON.parse(
    new TextDecoder().decode(
      (() => {
        const { readFileSync } = await import('node:fs').catch(() => require('fs'));
        return readFileSync(REGISTRY_PATH);
      })()
    )
  );
}

function loadRegistrySync() {
  const { readFileSync } = await import('node:fs');
  return JSON.parse(readFileSync(REGISTRY_PATH, 'utf-8'));
}

import { readFileSync } from 'node:fs';

function getRegistry() {
  return JSON.parse(readFileSync(REGISTRY_PATH, 'utf-8'));
}

function formatInstalls(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return String(n);
}

export async function skills({ query } = {}) {
  const registry = getRegistry();

  p.intro('agent-scripts / skills');

  // Search or browse
  const searchTerm = query ?? await p.text({
    message: 'Search skills (or press Enter to browse top skills):',
    placeholder: 'e.g. typescript, design, testing',
  });

  if (p.isCancel(searchTerm)) {
    p.cancel('Cancelled.');
    process.exit(0);
  }

  const term = (searchTerm || '').toLowerCase().trim();
  const filtered = term
    ? registry.filter(s =>
        s.name.toLowerCase().includes(term) ||
        s.source.toLowerCase().includes(term)
      )
    : registry.slice(0, 50);

  if (filtered.length === 0) {
    p.outro(`No skills found matching "${term}".`);
    return;
  }

  const options = filtered.slice(0, 50).map(s => ({
    value: s.id,
    label: `${s.name}`,
    hint: `${s.source}  ${formatInstalls(s.installs)} installs`,
  }));

  const selected = await p.multiselect({
    message: `Select skills to install (${filtered.length} found${filtered.length > 50 ? ', showing top 50' : ''}):`,
    options,
    required: false,
  });

  if (p.isCancel(selected) || selected.length === 0) {
    p.cancel('No skills selected.');
    process.exit(0);
  }

  const toInstall = registry.filter(s => selected.includes(s.id));

  p.log.step(`Installing ${toInstall.length} skill(s)...`);

  let installed = 0;
  let failed = 0;

  for (const skill of toInstall) {
    try {
      execSync(`npx -y skills add ${skill.source} --skill ${skill.skillId} -y --agent '*'`, {
        stdio: 'pipe',
      });
      p.log.step(`✓ ${skill.name}`);
      installed++;
    } catch {
      p.log.warn(`✗ ${skill.name} — failed`);
      failed++;
    }
  }

  p.outro(
    failed > 0
      ? `Installed ${installed}, failed ${failed}.`
      : `${installed} skill(s) installed.`
  );
}
