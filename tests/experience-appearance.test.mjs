import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { Window } from 'happy-dom';

// Bundle the real route handlers with the same bundler used by Wrangler.
const { outputFiles } = await build({
  stdin: {
    contents: `export { default as app } from './src/index';
      export { renderProjectIndex, renderProjectPage } from './src/projects/page';
      export { PROJECTS } from './src/projects/catalog';`,
    resolveDir: fileURLToPath(new URL('..', import.meta.url)),
    loader: 'ts',
  },
  bundle: true, write: false, platform: 'node', format: 'esm',
});
const { app, renderProjectIndex, renderProjectPage, PROJECTS } = await import(
  `data:text/javascript;base64,${Buffer.from(outputFiles[0].contents).toString('base64')}`
);

function documentFor(html, path = '/') {
  const win = new Window({
    url: `https://portfolio.test${path}`,
    settings: { disableCSSFileLoading: true, disableJavaScriptFileLoading: true },
  });
  // Inert parsing lets navigation checks run without JavaScript or network access.
  win.document.documentElement.innerHTML = html;
  return win;
}

async function page(path) {
  const response = await app.request(path);
  assert.equal(response.status, 200);
  return documentFor(await response.text(), path);
}

const target = (path, view) => view === 'original' ? path : `${path}?view=${view}`;
const home = { original: '/', tech: '/tech', arcade: '/play' };

for (const view of ['original', 'tech', 'arcade']) {
  test(`${view}: timeline, list, refresh and Home preserve the selected appearance`, async () => {
    const windows = [];
    try {
      let path = target('/timeline', view);
      for (const expectedPath of ['/timeline', '/resume', '/timeline']) {
        const win = await page(path); windows.push(win);
        const doc = win.document;
        assert.equal(doc.body.dataset.view, view);
        assert.equal(doc.body.classList.contains('personal'), view === 'original');
        assert.equal(Boolean(doc.querySelector('.color-world')), view === 'original');
        assert.equal(doc.querySelector('.view-choice[aria-current=page]').dataset.view, view);
        assert.equal(doc.querySelector('.subnav a').getAttribute('href'), home[view]);
        for (const choice of doc.querySelectorAll('.view-choice')) {
          assert.equal(choice.getAttribute('href'), target(expectedPath, choice.dataset.view));
        }
        path = doc.querySelector('.subnav a:last-child').getAttribute('href');
        const otherPage = expectedPath === '/timeline' ? '/resume' : '/timeline';
        for (const link of doc.querySelectorAll(`a[href^="${otherPage}"]`)) {
          assert.equal(link.getAttribute('href'), target(otherPage, view));
        }
        const refreshed = await page(win.location.pathname + win.location.search);
        windows.push(refreshed);
        assert.equal(refreshed.document.body.dataset.view, view);
      }
    } finally { await Promise.all(windows.map(win => win.happyDOM.close())); }
  });
}

test('every Experience entry from Tech, its case studies and Arcade carries its view', async () => {
  const windows = [
    [documentFor(renderProjectIndex('https://portfolio.test', '')), 'tech'],
    ...PROJECTS.map(project => [documentFor(renderProjectPage(project.slug, 'https://portfolio.test')), 'tech']),
    [await page('/play'), 'arcade'],
  ];
  try {
    for (const [win, view] of windows) {
      const links = [...win.document.querySelectorAll('a[href^="/timeline"]')];
      assert.ok(links.length, 'each entry surface must link to Experience');
      for (const link of links) assert.equal(link.getAttribute('href'), target('/timeline', view));
    }
  } finally { await Promise.all(windows.map(([win]) => win.happyDOM.close())); }
});

test('appearance choices change the skin on the current Experience page', async () => {
  for (const path of ['/timeline', '/resume']) {
    const start = await page(`${path}?view=arcade`);
    try {
      for (const choice of start.document.querySelectorAll('.view-choice')) {
        const next = await page(choice.getAttribute('href'));
        try {
          assert.equal(next.location.pathname, path);
          assert.equal(next.document.body.dataset.view, choice.dataset.view);
          assert.equal(next.document.querySelectorAll('.ft-body').length, start.document.querySelectorAll('.ft-body').length);
        } finally { await next.happyDOM.close(); }
      }
    } finally { await start.happyDOM.close(); }
  }
});

test('unrecognized appearance values fall back to Original without entering the HTML', async () => {
  const invalid = '"><script>unexpected()</script>';
  for (const path of ['/timeline', '/resume']) {
    const win = await page(`${path}?view=${encodeURIComponent(invalid)}`);
    try {
      assert.equal(win.document.body.dataset.view, 'original');
      assert.ok(!win.document.documentElement.innerHTML.includes('unexpected()'));
    } finally { await win.happyDOM.close(); }
  }
});

for (const view of ['tech', 'arcade']) {
  test(`${view}: role walkthroughs still open, close and change roles`, async () => {
    const timeline = await page(`/timeline?view=${view}`);
    const list = await page(`/resume?view=${view}`);
    try {
      for (const win of [timeline, list]) {
        for (const script of win.document.querySelectorAll('script:not([src])')) win.eval(script.textContent);
        const expectedText = view === 'tech' ? '#e6edf3' : '#f1edde';
        assert.equal(win.getComputedStyle(win.document.body).getPropertyValue('--fg'), expectedText);
        assert.equal(win.getComputedStyle(win.document.querySelector('.on-cream')).getPropertyValue('--fg'), expectedText);
      }
      const firstRole = timeline.document.querySelector('.tlp-bar');
      assert.ok(firstRole);
      firstRole.focus(); firstRole.click();
      assert.equal(timeline.document.querySelector('#tlpModal').getAttribute('aria-hidden'), 'false');
      assert.ok(timeline.document.querySelectorAll('#tlpScene .node').length > 0);
      timeline.document.dispatchEvent(new timeline.KeyboardEvent('keydown', { key: 'Escape' }));
      assert.equal(timeline.document.querySelector('#tlpModal').getAttribute('aria-hidden'), 'true');
      assert.equal(timeline.document.activeElement, firstRole);
      list.document.querySelectorAll('.tab')[1].click();
      assert.equal(list.document.querySelectorAll('.tab')[1].getAttribute('aria-pressed'), 'true');
      assert.ok(list.document.querySelectorAll('#scene .node').length > 0);
      assert.equal(list.location.search, `?view=${view}`, 'role deep links must keep the appearance query');
    } finally { await Promise.all([timeline.happyDOM.close(), list.happyDOM.close()]); }
  });
}
