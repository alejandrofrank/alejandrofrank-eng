import test, { afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { Window } from 'happy-dom';
import { initImageDemo } from '../public/play/image-demo.mjs';

const bundled = await build({entryPoints:['src/index.ts'],bundle:true,write:false,platform:'node',format:'esm'});
const {default:app} = await import('data:text/javascript;base64,' + Buffer.from(bundled.outputFiles[0].contents).toString('base64'));
const explorer = await build({entryPoints:['public/projects/explorer.mjs'],bundle:true,write:false,platform:'browser',format:'iife'});
const windows=[];
afterEach(async () => { mock.restoreAll(); await Promise.all(windows.splice(0).map(win=>win.happyDOM.close())); });
async function page(path) {
  const response=await app.request('https://portfolio.test'+path,{}, {GITHUB_USER:'example',GITHUB_TOKEN:'test-only'});
  const win=new Window({url:'https://portfolio.test'+path,settings:{disableCSSFileLoading:true,disableJavaScriptFileLoading:true}});
  win.document.documentElement.innerHTML=await response.text(); windows.push(win);
  return {win,response};
}

test('GitHub connection failure leaves the homepage and all project choices available', async()=>{
  mock.method(globalThis,'fetch',async()=>{ throw new TypeError('Network unavailable'); });
  const {win,response}=await page('/');
  assert.equal(response.status,200);
  assert.equal(win.document.querySelector('.human-role').textContent,'AI & Data Engineer');
  assert.equal(win.document.querySelectorAll('.project-dropdown').length,7);
  assert.match(win.document.querySelector('.ambient-calendar').textContent,/unavailable/);
});

test('an unresponsive upstream is aborted and the homepage still renders', async()=>{
  let aborted=0;
  mock.method(globalThis,'fetch',(_url,init)=>new Promise((_resolve,reject)=>{
    assert.ok(init.signal);
    init.signal.addEventListener('abort',()=>{aborted++;reject(init.signal.reason);},{once:true});
  }));
  let timeout;
  try {
    const {response}=await Promise.race([page('/'),new Promise((_resolve,reject)=>{ timeout=setTimeout(()=>reject(new Error('Homepage remained blocked')),4500); })]);
    assert.equal(response.status,200); assert.ok(aborted>=2);
  } finally {clearTimeout(timeout);}
});

test('reading layout and selected project survive a case-study round trip', async()=>{
  mock.method(globalThis,'fetch',async()=>new Response('',{status:503}));
  const {win}=await page('/tech#catalog-match-lab');
  // Exercise navigation without Happy DOM's unfinished animation promises.
  mock.method(win,'matchMedia',()=>({matches:true,addEventListener(){}}));
  const init=()=>{
    win.document.querySelectorAll('.sketch-wire').forEach(wire=>{wire.getTotalLength=()=>10;});
    win.eval(explorer.outputFiles[0].text);
  };
  const html=win.document.documentElement.innerHTML;
  init();
  win.document.getElementById('explorer-view-toggle').click();
  assert.equal(win.document.querySelector('[data-project-list]').hidden,false);
  assert.equal(win.sessionStorage.getItem('portfolio-project-layout'),'list');
  win.document.documentElement.innerHTML=html;
  init();
  assert.equal(win.document.getElementById('project-explorer').hidden,true);
  assert.equal(win.document.querySelector('[data-project-list]').hidden,false);
  assert.equal(win.document.querySelector('input[name="project-choice"]:checked').value,'catalog-match-lab');
  win.document.getElementById('explorer-view-toggle').click();
  assert.equal(win.document.getElementById('project-explorer').hidden,false);
});

test('failed image rendering exposes a working Retry and full-tool link', async()=>{
  const {win}=await page('/play');
  const oldDocument=globalThis.document, oldWorker=globalThis.Worker;
  let attempts=0;
  globalThis.document=win.document;
  globalThis.Worker=class {constructor(){attempts++;throw new Error('Worker unavailable');}};
  try {
    initImageDemo().activate();
    const evidence=win.document.getElementById('image-evidence');
    const retry=win.document.getElementById('image-repeat');
    assert.equal(evidence.hidden,false); assert.equal(retry.disabled,false);
    assert.match(retry.textContent,/Retry/); assert.ok(evidence.querySelector('a[href^="https:"]'));
    retry.click(); assert.equal(attempts,2);
  } finally {globalThis.document=oldDocument;globalThis.Worker=oldWorker;}
});

test('clipboard denial gives visitors a manual-copy recovery instruction', async()=>{
  mock.method(globalThis,'fetch',async()=>new Response('',{status:503}));
  const {win}=await page('/');
  mock.method(win.navigator.clipboard,'writeText',async()=>{throw new Error('Denied');});
  for (const script of win.document.querySelectorAll('script:not([src]):not([type=module])')) win.eval(script.textContent);
  win.document.querySelector('.email-copy').click();
  await new Promise(resolve=>setTimeout(resolve,0));
  assert.match(win.document.querySelector('.email-status').textContent,/copy it manually/);
});
