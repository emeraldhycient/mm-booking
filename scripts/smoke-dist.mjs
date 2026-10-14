import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';

const PORT = 3999;
const BASE = `http://localhost:${PORT}`;
const server = spawn(process.execPath, ['dist/server.js'], {
  env: { ...process.env, PORT: String(PORT), SCRIPT_URL: 'https://script.google.com/macros/s/SMOKE_TEST/exec' },
  stdio: ['ignore', 'pipe', 'inherit'],
});

function waitForListening() {
  return new Promise((resolve, reject) => {
    server.stdout.on('data', (chunk) => String(chunk).includes('"listening"') && resolve());
    server.on('exit', (code) => reject(new Error(`server exited early with code ${code}`)));
  });
}

try {
  await waitForListening();
  const page = await fetch(`${BASE}/`).then((response) => response.text());
  if (page !== readFileSync('index.html', 'utf8')) throw new Error('index.html is not served byte for byte');
  const quote = await fetch(`${BASE}/api/quote`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
  if (quote.status !== 401) throw new Error(`expected 401 without a key, got ${quote.status}`);
  const lab = await fetch(`${BASE}/pricing-lab`);
  if ((await lab.text()) !== readFileSync('pricing-lab/index.html', 'utf8')) throw new Error('pricing lab is not served byte for byte');
  if (lab.headers.get('x-robots-tag') !== 'noindex, nofollow, noarchive') throw new Error('pricing lab is missing its noindex header');
  console.log('smoke ok: index.html identical, unauthenticated quote refused, pricing lab served noindex');
} finally {
  server.kill();
}
