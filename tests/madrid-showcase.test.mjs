import test, { mock } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { Window } from 'happy-dom';

mock.method(globalThis, 'fetch', async () => new Response('', { status: 503 }));

const { outputFiles } = await build({ entryPoints: [fileURLToPath(new URL('../src/index.ts', import.meta.url))], bundle: true, write: false, platform: 'node', format: 'esm' });
const { default: app } = await import('data:text/javascript;base64,' + Buffer.from(outputFiles[0].contents).toString('base64'));

for (const view of ['original', 'tech', 'arcade']) {
  test('Agents in GCP case study works without JavaScript in ' + view, async () => {
    const response = await app.request('https://portfolio.test/projects/madrid-delivery-sim', { headers: { Cookie: 'portfolio_view=' + view } });
    assert.equal(response.status, 200);
    const win = new Window({ settings: { disableJavaScriptFileLoading: true, disableCSSFileLoading: true } });
    try {
      win.document.documentElement.innerHTML = await response.text();
      const doc = win.document;
      assert.equal(doc.body.dataset.view, view);
      assert.equal(doc.querySelector('h1').textContent, 'Agents in GCP');
      assert.equal(doc.querySelectorAll('video').length, 0);
      const demo = doc.querySelector('iframe');
      assert.equal(demo.getAttribute('src'), '/projects/agents-demo/index.html');
      assert.equal(demo.getAttribute('loading'), 'lazy');
      assert.match(demo.title, /interactive city, store and agent anatomy/);
      assert.ok(existsSync(new URL('../public' + demo.getAttribute('src'), import.meta.url)));
      assert.ok(doc.querySelector('a[href="/projects/agents-demo/index.html"]'));
      assert.equal(doc.querySelector('a[href="#demo"]').getAttribute('target'), null);
      assert.match(doc.body.textContent, /Built for Google Cloud/);
      assert.match(doc.body.textContent, /make setup/);
      assert.match(doc.body.textContent, /still needs qualification/);
      assert.ok(!doc.querySelector('a[href*="/play#concept-madrid"]'));
      assert.match(doc.body.textContent, /No live models or cloud queries/);
    } finally { await win.happyDOM.close(); }
  });
}

test('adding an interactive replay project preserves the six playable games', async () => {
  const response = await app.request('https://portfolio.test/play');
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.equal((html.match(/data-station-panel=/g) || []).length, 6);
  assert.ok(!html.includes('id="station-madrid-delivery-sim"'));
});

test('tech explorer offers the replay instead of a nonexistent game', async () => {
  const response = await app.request('https://portfolio.test/tech', {}, { GITHUB_USER: 'example' });
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.ok(html.includes('id="preview-madrid-delivery-sim"'));
  assert.ok(html.includes('href="/projects/madrid-delivery-sim#demo"'));
  assert.ok(!html.includes('/play#concept-madrid-delivery-sim'));
  assert.ok(!html.includes('--project-color:undefined'));
});

test('recordings retain source provenance and stay below 1 MB each', () => {
  const records = JSON.parse(readFileSync(new URL('../public/projects/madrid/recordings.json', import.meta.url)));
  assert.equal(records.length, 2);
  for (const record of records) {
    assert.match(record.source_sha256, /^[a-f0-9]{64}$/);
    assert.ok(record.bytes < 1024 * 1024);
    assert.ok(readFileSync(new URL('../public/projects/madrid/' + record.video, import.meta.url)).includes(Buffer.from('ftyp')));
  }
});
