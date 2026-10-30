// Usage : node build-notes.mjs notesIE1.xlsx [dossier_data=_data] [--sans-code]
// Produit  <dossier_data>/notesIE1.json  (à committer : notes chiffrées + stats de classe)
// et       codes_IE1.csv                 (à garder PRIVÉ : numéro ; code personnel)
// npm i -D exceljs
import ExcelJS from 'exceljs';
import { randomBytes, createHash, webcrypto } from 'node:crypto';
import { writeFileSync, mkdirSync } from 'node:fs';

const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
const [file = 'notesIE1.xlsx', dataDir = '_data'] = args;
const SANS_CODE = process.argv.includes('--sans-code');
const AFFICHER_RANG = true;
const ITER = 600_000;
const ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // sans O/0/I/1/L

const wb = new ExcelJS.Workbook();
await wb.xlsx.readFile(file);
const ws = wb.worksheets[0];
const val = (r, c) => { const v = ws.getCell(r, c).value; return v && typeof v === 'object' && 'result' in v ? v.result : v; };

// Questions : libellé "ExN…" en ligne 3 (note /4 dans cette colonne, points dans la suivante), coef en ligne 2
const qs = [];
for (let c = 1; c <= ws.columnCount; c++) {
  const l = ws.getCell(3, c).isMerged && ws.getCell(3, c).master.address !== ws.getCell(3, c).address ? null : val(3, c);
  if (typeof l === 'string' && /^Ex\d/.test(l.trim()))
    qs.push({ col: c, id: l.trim().slice(2), ex: +l.trim().match(/^Ex(\d+)/)[1], max: val(2, c + 1) });
}

// Étudiants : lignes à partir de 5 tant que la colonne A est un numéro
const eleves = [];
for (let r = 5; typeof val(r, 1) === 'number'; r++) {
  const items = qs.map(q => {
    const raw = val(r, q.col), s = typeof raw === 'number' ? raw : null;
    return { s, p: (s ?? 0) / 4 * q.max };
  });
  eleves.push({ n: String(val(r, 1)), items, note: items.reduce((a, i) => a + i.p, 0) });
}

const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
const med = a => { const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const stats = a => ({ mean: mean(a), median: med(a), min: Math.min(...a), max: Math.max(...a) });
const r4 = o => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, Math.round(v * 1e4) / 1e4]));

const exos = [...new Set(qs.map(q => q.ex))].map(ex => {
  const idx = qs.flatMap((q, i) => q.ex === ex ? [i] : []);
  const tot = e => idx.reduce((a, i) => a + e.items[i].p, 0);
  return { ...r4(stats(eleves.map(tot))), ex, max: idx.reduce((a, i) => a + qs[i].max, 0) };
});
const questions = qs.map((q, i) => ({
  ...r4(stats(eleves.map(e => e.items[i].p))),
  id: q.id, ex: q.ex, max: q.max,
  traite: eleves.filter(e => e.items[i].s !== null).length,
}));
const total = qs.reduce((a, q) => a + q.max, 0);
const notes = eleves.map(e => e.note);
const hist = Array(10).fill(0);
notes.forEach(n => hist[Math.min(9, Math.floor(n / 2))]++);

// Chiffrement : clé = PBKDF2(numéro:code, sel propre à chaque étudiant) -> AES-GCM
const tagSalt = randomBytes(8).toString('hex');
const b64 = b => Buffer.from(b).toString('base64');
const codes = [];
const out = [];
for (const e of eleves) {
  const code = SANS_CODE ? '' : Array.from(randomBytes(8), b => ALPHA[b % ALPHA.length]).join('');
  codes.push(`${e.n};${code.replace(/(.{4})(.{4})/, '$1-$2')}`);
  const salt = randomBytes(16), iv = randomBytes(12);
  const base = await webcrypto.subtle.importKey('raw', new TextEncoder().encode(`${e.n}:${code}`), 'PBKDF2', false, ['deriveKey']);
  const key = await webcrypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: ITER, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
  const payload = { n: e.n, note: e.note, items: e.items };
  if (AFFICHER_RANG) payload.rang = 1 + notes.filter(x => x > e.note + 1e-9).length;
  const ct = await webcrypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(payload)));
  out.push({
    tag: createHash('sha256').update(tagSalt + e.n).digest('hex').slice(0, 8),
    salt: b64(salt), iv: b64(iv), ct: b64(new Uint8Array(ct)),
  });
}

const d = val(1, 4);
const data = {
  titre: String(val(1, 1)).trim(),
  date: d instanceof Date ? d.toISOString().slice(0, 10) : null,
  effectif: eleves.length, total, avecCode: !SANS_CODE, iter: ITER, tagSalt,
  global: { ...r4(stats(notes)), hist },
  exercices: exos, questions, eleves: out.sort(() => Math.random() - .5), // ordre mélangé
};
mkdirSync(dataDir, { recursive: true });
writeFileSync(`${dataDir}/notesIE1.json`, JSON.stringify(data));
if (!SANS_CODE) writeFileSync('codes_IE1.csv', 'numero;code\n' + codes.join('\n') + '\n');
console.log(`${eleves.length} étudiants, ${qs.length} questions, barème ${total}.`);
