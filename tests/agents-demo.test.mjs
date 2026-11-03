import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {createRequire} from 'node:module';
import {createClock,escapeHTML,storeFrame,syncMotionButton} from '../public/projects/agents-demo/state.mjs';
import {Window} from 'happy-dom';
import {frameAt} from '../public/projects/agents-demo/story-playback.js';
const root=new URL('../public/projects/agents-demo/',import.meta.url);
const read=name=>readFileSync(new URL(name,root),'utf8');
const city=JSON.parse(read('city.json')),store=JSON.parse(read('store.json')),agents=JSON.parse(read('agents.json'));
test('motion control follows system preference changes and stays paused until explicit resume',async()=>{
 const window=new Window(),button=window.document.createElement('button');
 try {
  syncMotionButton(button,false,false);assert.equal(button.textContent,'Pause motion');assert.equal(button.disabled,false);
  syncMotionButton(button,true,true);assert.equal(button.textContent,'Motion off');assert.equal(button.disabled,true);assert.equal(button.getAttribute('aria-pressed'),'true');assert.match(button.title,/reduce motion/);
  syncMotionButton(button,true,false);assert.equal(button.textContent,'Resume motion');assert.equal(button.disabled,false);assert.equal(button.getAttribute('aria-pressed'),'true');
  syncMotionButton(button,false,false);assert.equal(button.textContent,'Pause motion');assert.equal(button.getAttribute('aria-pressed'),'false');
 } finally {await window.happyDOM.close();}
});
test('replay clock moves between recorded seconds and never catches up hidden time',()=>{
 const clock=createClock(7200,120,true);clock.tick(1000,true);assert.equal(clock.tick(1008,true),.96);
 clock.tick(1008,false);assert.equal(clock.tick(90000,true),.96);assert.equal(clock.tick(90008,true),1.92);
 clock.play(false);assert.equal(clock.tick(100000,true),1.92);clock.seek(300);assert.equal(clock.tick(101000,true),300);
 clock.play(true);clock.tick(200000,true);assert.equal(clock.tick(200100,true),312);
 clock.seek(10000);assert.equal(clock.time,7200);clock.tick(210000,true);assert.equal(clock.playing,false);
});
test('recorded courier motion changes within one second rather than stepping snapshots',()=>{
 const motion=createRequire(import.meta.url)('../public/projects/agents-demo/courier_motion.js').createReplayMotion({duration:city.clock.duration,couriers:city.couriers.map(c=>c.id),routes:city.routes,frames:city.frames.map(f=>({time:f.time,positions:f.couriers.map(c=>[c[0],c[1],c[3]])}))});
 let moved=0;for(const courier of city.couriers){const a=motion.position(courier.id,5),b=motion.position(courier.id,5.008);if(Math.hypot(a[0]-b[0],a[1]-b[1])>0)moved++;}
 assert.ok(moved>0,'couriers move on animation frames');
});
test('public recordings have no model calls and retain genuine results and store recovery',()=>{
 assert.equal(city.source.paid_model_calls,0);assert.equal(store.recording.paid_model_calls,0);
 assert.equal(city.orders.filter(o=>o.delivered!=null&&o.delivered<=o.due).length,city.outcomes.on_time);
 assert.equal(store.frames.at(-1).time,600);assert.equal(store.frames.length,61);
 const broken=frameAt(store.frames,60);assert.ok(broken.state.conditions.broken.includes('picker-1'));
 const end=store.frames.at(-1).state.orders.find(o=>o.order_id===store.order);assert.ok(end.delivered_sim<=600);
 const state=storeFrame(store,broken);assert.equal(state.layout,store.definition.layout);assert.ok(state.shelves.length>0);
 const slots=new Set(state.layout.slots.map(s=>s.id));assert.ok(state.shelves.every(s=>slots.has(s.slot)));
});
test('nine agents retain all eleven real parts and readable labels',()=>{
 assert.equal(agents.agents.length,9);for(const agent of agents.agents){assert.equal(agent.panels.length,11);for(const p of agent.panels){assert.ok(p.label&&p.technical_label&&p.summary&&p.headline.text);assert.ok(p.sources.length);}}
 assert.equal(escapeHTML('<script>"&'), '&lt;script&gt;&quot;&amp;');
});
test('demo is self contained, defers 3D, and keeps source and license evidence',()=>{
 const index=read('index.html'),main=read('demo.mjs');assert.ok(index.includes('<noscript>'));
 assert.ok(index.includes('for="courier"'));assert.ok(index.includes('for="part"'));
 assert.ok(main.includes("await import('./store-3d.js')"));assert.ok(main.includes("await import('./agent-anatomy-3d.js')"));
 assert.ok(main.includes('IntersectionObserver'));assert.ok(main.includes('prefers-reduced-motion'));
 assert.doesNotMatch(main,/fetch\(['"]https?:|\/api\/|WebSocket|EventSource/);
 assert.doesNotMatch(read('store-3d.js'),/\/static\//);
 const provenance=JSON.parse(read('provenance.json'));assert.match(provenance.source_revision,/^[a-f0-9]{40}$/);assert.ok(Object.keys(provenance.inputs).length>20);
 for(const name of ['LICENSE','THIRD-PARTY-NOTICES.md','vendor/three/LICENSE','vendor/simready/NOTICE.txt'])assert.ok(read(name).length>100);
 assert.ok(statSync(new URL('city.json',root)).size<750000);assert.ok(statSync(new URL('store.json',root)).size<1100000);
});

test('all shipped renderer imports and global symbol dependencies resolve locally',()=>{
 const modules=['store-3d.js','agent-anatomy-3d.js','vendor/three/GLTFLoader.js','vendor/three/OrbitControls.js','vendor/three/SkeletonUtils.js','vendor/three/BufferGeometryUtils.js','vendor/three/three.module.js'];
 for(const name of modules){for(const match of read(name).matchAll(/from\s+['"](\.[^'"]+)['"]/g)){assert.ok(statSync(new URL(match[1],new URL(name,root))).isFile(),name+' imports '+match[1]);}}
 assert.ok(read('index.html').includes('src="agent-role-symbols.js"'));
 assert.ok(read('agent-role-symbols.js').includes('AgentRoleSymbols'));
});
