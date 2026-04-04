/**
 * Liste les fichiers avec FlashList / FlatList / ScrollView (perf / profilage).
 * Sans dépendre de `rg` (Windows-friendly).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.git') continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (/\.(tsx|ts)$/.test(name) && (dir.includes(`${join('app')}`) || dir.includes(join('src')))) {
      acc.push(p);
    }
  }
  return acc;
}

const patterns = [
  { key: 'FlashList', re: /FlashList/ },
  { key: 'FlatList', re: /FlatList/ },
  { key: 'ScrollView', re: /ScrollView/ },
];

const files = walk(join(root, 'app')).concat(walk(join(root, 'src')));
const byPat = { FlashList: [], FlatList: [], ScrollView: [] };

for (const p of files) {
  let txt;
  try {
    txt = readFileSync(p, 'utf8');
  } catch {
    continue;
  }
  const rel = p.replace(root + '\\', '').replace(root + '/', '');
  for (const { key, re } of patterns) {
    if (re.test(txt)) byPat[key].push(rel);
  }
}

console.log('[Husko] Fichiers avec listes / scroll (priorité perf)\n');
for (const key of Object.keys(byPat)) {
  const list = [...new Set(byPat[key])].sort();
  console.log(`${key}:`, list.length ? list.join('\n  ') : '  (aucun)');
  console.log('');
}
const all = new Set([...byPat.FlashList, ...byPat.FlatList, ...byPat.ScrollView]);
console.log(`Total fichiers concernés: ${all.size}`);
console.log('\nConseil : profiler en priorité le menu client (FlashList), puis les écrans gérant / livreur.');
