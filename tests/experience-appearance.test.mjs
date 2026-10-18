import test, { afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { Window } from 'happy-dom';

// Actual routes and templates, with only unrelated external service calls stubbed.
mock.method(globalThis, 'fetch', async () => new Response('', { status: 503 }));
const { outputFiles } = await build({
  entryPoints: [fileURLToPath(new URL('../src/index.ts', import.meta.url))],
  bundle: true, write: false, platform: 'node', format: 'esm',
});
const { default: app } = await import(`data:text/javascript;base64,${Buffer.from(outputFiles[0].contents).toString('base64')}`);

const windows = [];
afterEach(async () => { await Promise.all(windows.splice(0).map(win => win.happyDOM.close())); });

function visitor(initialCookie = '') {
  let cookie = initialCookie;
  return {
    get cookie() { return cookie; },
    async request(path) {
      const response = await app.request(`https://portfolio.test${path}`, { headers: { Cookie: cookie } }, { GITHUB_USER: 'example' });
      const setCookie = response.headers.get('set-cookie');
      if (setCookie) cookie = setCookie.split(';')[0];
      return response;
    },
    async open(path) {
      let response;
      for (let redirects = 0; redirects < 5; redirects++) {
        response = await this.request(path);
        if (response.status !== 302) break;
        path = response.headers.get('location');
      }
      assert.equal(response.status, 200, 'navigation must finish without a redirect loop');
      assert.equal(response.headers.get('cache-control'), 'private, no-store');
      assert.equal(response.headers.get('vary'), 'Cookie');
      const win = new Window({ url: `https://portfolio.test${path}`, settings: { disableCSSFileLoading: true, disableJavaScriptFileLoading: true } });
      win.document.documentElement.innerHTML = await response.text();
      win.document.cookie = cookie + '; Path=/';
      windows.push(win);
      return win;
    },
  };
}

function assertAppearance(win, view) {
  assert.equal(win.document.body.dataset.view, view);
  assert.equal(win.document.querySelector('.view-choice[aria-current=page]').dataset.view, view);
  assert.equal(Boolean(win.document.querySelector('.color-world')), view === 'original');
  assert.equal(win.getComputedStyle(win.document.body).getPropertyValue('--fg'), {
    original: '#f1ecdf', tech: '#e6edf3', arcade: '#f1edde',
  }[view], 'the visible palette must match the selected picker, not just the page metadata');
}

for (const view of ['original', 'tech', 'arcade']) {
  test(`${view}: a saved choice survives every page and every Experience entry without query parameters`, async () => {
    const browser = visitor();
    await browser.open(`/timeline?view=${view}`);
    for (const path of ['/', '/tech', '/play', '/projects/bakiano', '/projects/vesti', '/timeline', '/resume']) {
      const win = await browser.open(path);
      assertAppearance(win, view);
      for (const link of win.document.querySelectorAll('a[href^="/timeline"]:not(.view-choice),a[href^="/resume"]:not(.view-choice)')) {
        const href = link.getAttribute('href');
        assert.ok(!href.includes('view='), 'ordinary links must not override the preference');
        assertAppearance(await browser.open(href), view);
      }
      assertAppearance(await browser.open(win.location.pathname), view); // refresh
      assert.equal(browser.cookie, `portfolio_view=${view}`);
    }
  });
}

test('only an explicit picker choice changes the preference, including switching back to Original', async () => {
  const browser = visitor();
  let win = await browser.open('/play?view=arcade');
  for (const view of ['tech', 'original', 'arcade']) {
    win = await browser.open(win.document.querySelector(`.view-choice[data-view="${view}"]`).getAttribute('href'));
    assertAppearance(win, view);
    assert.equal(win.location.search, '', 'consume the choice so old history URLs cannot reselect it');
    win = await browser.open('/timeline');
    assertAppearance(win, view);
    assertAppearance(await browser.open('/resume'), view);
    assertAppearance(await browser.open('/'), view);
  }
});

test('case study and Experience pickers keep the current page when changing appearance', async () => {
  const browser = visitor('portfolio_view=arcade');
  for (const path of ['/projects/bakiano', '/timeline', '/resume']) {
    const start = await browser.open(path);
    for (const view of ['original', 'tech', 'arcade']) {
      const win = await browser.open(start.document.querySelector(`.view-choice[data-view="${view}"]`).getAttribute('href'));
      assert.equal(win.location.pathname, path);
      assertAppearance(win, view);
    }
  }
});

test('a first visit establishes a default, but subsequent routes cannot silently change it', async () => {
  for (const [path, view] of [['/', 'original'], ['/tech', 'tech'], ['/play', 'arcade']]) {
    const browser = visitor();
    assertAppearance(await browser.open(path), view);
    assertAppearance(await browser.open('/timeline'), view);
    assertAppearance(await browser.open('/projects/bakiano'), view);
  }
});

test('choice cookie lasts across visits and remains isolated between visitors', async () => {
  const first = visitor();
  const response = await first.request('/timeline?view=arcade');
  assert.equal(response.status, 302);
  assert.match(response.headers.get('set-cookie'), /Max-Age=31536000/i);
  assert.match(response.headers.get('set-cookie'), /Path=\//i);
  assert.match(response.headers.get('set-cookie'), /Secure/i);
  assert.match(response.headers.get('set-cookie'), /SameSite=Lax/i);
  const returning = visitor(first.cookie);
  const separate = visitor('portfolio_view=tech');
  assertAppearance(await returning.open('/timeline'), 'arcade');
  assertAppearance(await separate.open('/timeline'), 'tech');
  assertAppearance(await returning.open('/resume'), 'arcade');
});

test('invalid cookie and picker values never become appearance markup or erase a valid choice', async () => {
  const invalid = encodeURIComponent('"><script>unexpected()</script>');
  const valid = visitor('portfolio_view=arcade');
  assertAppearance(await valid.open(`/timeline?view=${invalid}`), 'arcade');
  const unknown = visitor(`portfolio_view=${invalid}`);
  const win = await unknown.open('/timeline');
  assertAppearance(win, 'original');
  assert.ok(!win.document.documentElement.innerHTML.includes('unexpected()'));
});

for (const view of ['tech', 'arcade']) {
  test(`${view}: role walkthroughs still work with a saved appearance`, async () => {
    const browser = visitor(`portfolio_view=${view}`);
    const timeline = await browser.open('/timeline');
    const list = await browser.open('/resume');
    for (const win of [timeline, list]) {
      for (const script of win.document.querySelectorAll('script:not([src])')) win.eval(script.textContent);
      const expectedText = view === 'tech' ? '#e6edf3' : '#f1edde';
      assert.equal(win.getComputedStyle(win.document.body).getPropertyValue('--fg'), expectedText);
      assert.equal(win.getComputedStyle(win.document.querySelector('.on-cream')).getPropertyValue('--fg'), expectedText);
    }
    const firstRole = timeline.document.querySelector('.tlp-bar');
    firstRole.focus(); firstRole.click();
    assert.equal(timeline.document.querySelector('#tlpModal').getAttribute('aria-hidden'), 'false');
    assert.ok(timeline.document.querySelectorAll('#tlpScene .node').length > 0);
    timeline.document.dispatchEvent(new timeline.KeyboardEvent('keydown', { key: 'Escape' }));
    assert.equal(timeline.document.querySelector('#tlpModal').getAttribute('aria-hidden'), 'true');
    assert.equal(timeline.document.activeElement, firstRole);
    list.document.querySelectorAll('.tab')[1].click();
    assert.equal(list.document.querySelectorAll('.tab')[1].getAttribute('aria-pressed'), 'true');
    assertAppearance(await browser.open('/resume' + list.location.hash), view);
  });
}

test('restoring a stale history page reloads its skin; matching pages keep live state', async () => {
  const browser = visitor('portfolio_view=tech');
  const win = await browser.open('/timeline');
  globalThis.window = win; globalThis.document = win.document;
  try {
    const { syncAppearance, setAppearanceProject } = await import('../public/appearance.mjs');
    let reloads = 0;
    const restored = { document: win.document, location: { reload: () => reloads++ } };
    syncAppearance(restored);
    assert.equal(reloads, 0);
    win.document.cookie = 'portfolio_view=arcade; Path=/';
    syncAppearance(restored);
    assert.equal(reloads, 1);
    // The arcade controller updates project hashes, but must retain picker intent.
    setAppearanceProject('bakiano');
    assert.equal(win.document.querySelector('[data-view="original"].view-choice').getAttribute('href'), '/?view=original#bakiano');
    assert.equal(win.document.querySelector('[data-view="tech"].view-choice').getAttribute('href'), '/tech?view=tech#bakiano');
  } finally { delete globalThis.window; delete globalThis.document; }
});
