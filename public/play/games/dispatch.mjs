import {QUEUES,STORES,ZONES,HUB,ROUNDS,rulesFor,createShift,workerPosition} from './dispatch-model.mjs';
const COLORS={normal:'#087c43',urgent:'#a85219',problem:'#365d9c'},cap=s=>s[0].toUpperCase()+s.slice(1);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const robot=(x,y,color,offline=false)=>`<g transform="translate(${x} ${y})"><rect x="-10" y="-8" width="20" height="17" rx="5" fill="${offline?'#7c7c73':color}" stroke="#fffdf6" stroke-width="2.5"/><path d="M-5-1h2m6 0h2" stroke="#fffdf6" stroke-width="3" stroke-linecap="round"/>${offline?'<path d="m-7-6 14 13" stroke="#8c301d" stroke-width="3"/>':''}</g>`;
function city(){return `<rect width="720" height="450" fill="#eeeade"/><path d="M0 5C115 38 63 116 112 163S80 253 144 306 76 389 177 450" stroke="#c1d7d2" stroke-width="24" fill="none"/><path d="M582 183q65-10 86 45l-15 96-73-13-20-72z" fill="#d7dfbd"/><path d="M190 30 150 120 218 198 145 281 230 355 211 440M341 10 310 87 359 165 299 230 356 306 309 439M475 15 491 94 456 180 513 242 470 319 512 450M610 10 575 99 620 160M72 107 176 140 315 120 435 140 548 121 690 158M111 226 251 199 401 222 558 205M161 333 282 305 400 344 541 350 690 378" fill="none" stroke="#fffdf6" stroke-width="8" stroke-linejoin="round"/><path d="M180 48 671 345M100 371 583 48M231 12 664 421M98 185 585 427" fill="none" stroke="#d9d8c8" stroke-width="2"/><path d="M192 60Q380-25 597 96T652 360Q388 499 170 333T192 60Z" fill="none" stroke="#ddd8c7" stroke-width="5"/><text x="57" y="319" transform="rotate(-65 57 319)" fill="#527b72" font-size="12">Manzanares</text><text x="593" y="248" fill="#68744d" font-size="14">El Retiro</text>${ZONES.filter(z=>z.name!=='Retiro').map(z=>`<text x="${z.x}" y="${z.y-30}" text-anchor="middle" fill="#687461" font-size="14">${z.name}</text>`).join('')}<g transform="translate(${HUB.x} ${HUB.y})"><circle r="24" fill="#fffdf6" stroke="#b8c7b4"/><path d="M-13 5h26M-9 5V-5h18V5M-6-5v-6h12v6" stroke="#52665b" fill="none" stroke-width="2"/><text y="42" text-anchor="middle" fill="#52665b" font-size="12">Dispatch</text></g>`;}
export function initDispatchGame(root=document.getElementById('dispatch-game')){
 if(!root)return null;root.hidden=false;const doc=root.ownerDocument,win=doc.defaultView,$=id=>root.querySelector('#rd-'+id),form=$('form'),settings=$('settings'),media=win.matchMedia('(prefers-reduced-motion: reduce)'),panel=root.closest('[data-station-panel]');
 let round=0,plan=rulesFor(0),shift=null,playing=false,raf=0,last=null,acc=0,pausedFailure=false,selectedFailure=null,lastEvent=0,completed=new Set();
 const totalStaff=()=>QUEUES.reduce((n,q)=>n+plan.staff[q],0);
 function focusControl(control,toTop=false){
  if(!control)return;control.focus({preventScroll:true});
  const viewport=root.closest('.screen-viewport'),dialog=root.closest('dialog');
  if(viewport)viewport.scrollTop=toTop?0:Math.max(0,viewport.scrollTop+control.getBoundingClientRect().top-viewport.getBoundingClientRect().top-20);
  if(dialog)dialog.scrollTop=0;
 }
 function syncRules(){
  for(const q of QUEUES){form.elements.namedItem('route-'+q).value=plan.routing[q];$('staff-'+q).value=plan.staff[q];}
  for(const key of ['claims','milk','offline'])form.elements.namedItem(key).checked=plan[key];form.elements.namedItem('escalate').value=plan.escalate;
  $('budget').textContent=totalStaff()+' / 6';root.querySelectorAll('[data-staff]').forEach(b=>{b.disabled=(b.dataset.delta==='1'?totalStaff()>=6:plan.staff[b.dataset.staff]===0);});
  ['capacity','memory','human'].forEach((id,i)=>{$(id+'-section').hidden=round<[1,2,4][i];});$('milk-setting').hidden=round<3;$('offline-setting').hidden=round<4;
 }
 function loadRound(){
  stop();shift=null;plan=rulesFor(round);pausedFailure=false;selectedFailure=null;lastEvent=0;
  $('title').textContent=ROUNDS[round].title;$('brief').textContent=ROUNDS[round].brief;$('round').textContent=(round+1)+' / 5';
  ['routing','capacity','memory','human'].forEach((id,i)=>{$(id+'-section').open=i===(round===0?0:round===1?1:round<4?2:3);});
  syncRules();message('Set your rules, then run the shift. Orders arrive on their own.');render();
 }
 function message(text,failure=false){$('message').textContent=text;$('message').dataset.failure=String(failure);}
 function controls(){const done=shift?.state.finished;$('launch').hidden=!!shift;settings.disabled=!!shift;$('run').textContent=playing?'Pause':done?'Replay shift':shift?'Continue':'Run shift';$('step').disabled=!!done;$('edit').hidden=!shift;$('next').hidden=!done||!shift.state.result.won||round===4;$('rule-status').textContent=shift?'Rules are fixed for this run. Change rules to retry the same shift.':'Same orders and timing on every retry.';}
 function renderMap(fraction=0){
  const s=shift?.state,orders=s?.orders||[],workers=s?.workers||QUEUES.flatMap(q=>Array.from({length:plan.staff[q]},(_,i)=>({queue:q,x:HUB.x+(i-1)*22,y:HUB.y+(QUEUES.indexOf(q)-1)*22,job:null})));
  const routes=workers.filter(w=>w.job&&!w.offline).map(w=>{const j=w.job;return `<path d="M${j.from.x} ${j.from.y}H${j.to.x}V${j.to.y}" fill="none" stroke="${COLORS[w.queue]}" stroke-width="3" stroke-opacity=".55" stroke-dasharray="6 5"/>`;}).join('');
  const stores=STORES.map(st=>`<g class="rd-store" transform="translate(${st.x} ${st.y})"><rect x="-17" y="-15" width="34" height="30" rx="5" fill="#fffdf6" stroke="#203c31" stroke-width="2.5"/><path d="M-12-4h24M-8-4v12m8-12v12m8-12v12" stroke="#203c31" stroke-width="2"/><text y="31" text-anchor="middle" fill="#203c31" font-size="13" font-weight="600">${st.name}</text>${s?.stockOut&&st.id==='sol'?'<rect x="-46" y="-41" width="92" height="20" rx="4" fill="#fffdf6"/><text y="-27" text-anchor="middle" fill="#8c301d" font-size="12">Milk sold out</text>':''}</g>`).join('');
  const pins=orders.filter(o=>o.status!=='future').sort((a,b)=>Number(!!a.failures.length)-Number(!!b.failures.length)).map(o=>{const failed=o.failures.length>0,done=o.status==='delivered',c=failed?'#b33729':done?'#087c43':COLORS[o.type];return `<g class="rd-pin" transform="translate(${o.x} ${o.y})"><circle r="${done?10:15}" fill="${done?'#d6e8d0':'#fffdf6'}" stroke="${c}" stroke-width="${failed?4:2.5}"/><text y="4.5" text-anchor="middle" font-size="13" font-weight="700" fill="${c}">${failed?'!':done?'✓':o.id}</text>${!done&&!failed?`<path d="M-7 21h14" stroke="${c}" stroke-width="3" opacity="${o.status==='waiting'?.9:.3}"/>`:''}</g>`;}).join('');
  const bots=workers.map((w,i)=>{const p=workerPosition(w);return `<g data-worker="${i}" transform="translate(${p.x} ${p.y})">${robot(0,0,COLORS[w.queue],w.offline)}</g>`;}).join('');
  $('map').innerHTML=`<svg viewBox="0 0 720 320" aria-hidden="true" focusable="false">${city()}${s?.rain?'<g class="rd-weather" transform="translate(16 260)" fill="#365b67"><path d="M0 0h44q15 0 15 12t-15 12H-2q-14 0-14-11T0 0" fill="#bbd0d2"/><path d="m1 31-5 9m18-9-5 9m18-9-5 9m18-9-5 9" stroke="#557b8a" stroke-width="2"/><text x="65" y="20" font-size="12">Rain: slower routes</text></g>':''}${routes}${stores}${pins}${bots}</svg>`;
  // Compress geography, not symbols: pins and labels stay circular and readable.
  const svg=$('map').firstElementChild;
  svg.querySelectorAll(':scope > path').forEach(p=>p.setAttribute('transform','scale(1 .7)'));
  svg.querySelector('rect')?.setAttribute('height','320');
  svg.querySelectorAll(':scope > text').forEach(t=>{t.classList.add('rd-district');const y=Number(t.getAttribute('y'));t.setAttribute('y',String(y*.7));if(t.getAttribute('transform'))t.setAttribute('transform','rotate(-65 57 223)');});
  svg.querySelectorAll(':scope > g[transform]').forEach(g=>{const match=/^translate\(([\d.]+) ([\d.]+)\)$/.exec(g.getAttribute('transform'));if(match&&!g.getAttribute('transform').includes('16 260'))g.setAttribute('transform',`translate(${match[1]} ${Number(match[2])*.7})`);});
  svg.querySelectorAll(':scope > path[stroke-dasharray]').forEach(p=>p.setAttribute('transform','scale(1 .7)'));
 }
 function moveWorkers(fraction){
  if(!shift)return;
  if(!media.matches)$('map').querySelectorAll('[data-worker]').forEach(node=>{const w=shift.state.workers[Number(node.dataset.worker)],p=workerPosition(w,fraction/(shift.state.rain?1.35:1));node.setAttribute('transform',`translate(${p.x} ${p.y*.7})`);});
  $('time').value=shift.state.time+fraction;
 }
 function render(){
  const s=shift?.state,score=s?.score||{onTime:0,wasted:0,escalations:0};$('on-time').textContent=score.onTime+' / '+ROUNDS[round].count;$('waste').textContent=score.wasted;$('human').textContent=score.escalations;
  $('time').value=s?.time||0;$('clock').textContent=s?Math.floor(s.time)+'s · '+(s.finished?'Shift ended':playing?'Running':'Paused'):'Ready for the shift';
  $('queues').innerHTML=QUEUES.map(q=>{const n=s?.queues[q].length||0,busy=s?.workers.filter(w=>w.queue===q&&w.job&&!w.offline).length||0;return `<div class="rd-queue" data-overload="${n>plan.staff[q]}" style="--queue:${COLORS[q]}"><div><span>${cap(q)}</span><b>${n} waiting</b></div><div class="rd-bars" aria-hidden="true">${Array.from({length:6},(_,i)=>`<i data-full="${i<n}"></i>`).join('')}</div><small>${plan.staff[q]} ${plan.staff[q]===1?'agent':'agents'} · ${busy} busy</small></div>`;}).join('');
  $('notes').innerHTML=s?.notes.length?s.notes.map(n=>`<p>${esc(n.text)}</p>`).join(''):'<p>No shared notes yet.</p>';
  $('orders').innerHTML=s?s.orders.filter(o=>o.status!=='future').sort((a,b)=>Number(!!a.failures.length)-Number(!!b.failures.length)).map(o=>`<li data-failed="${o.failures.length>0}">Order ${o.id} · ${cap(o.type)} · ${esc(o.zone)} · ${o.status}${o.failures.length?' — '+esc(s.failures.find(f=>f.order===o.id)?.text):''}</li>`).join(''):'';
  $('result').hidden=!s?.finished;
  if(s?.finished){const r=s.result;$('result-title').textContent=r.won?(round===4?'Madrid is moving. Five shifts complete.':'Every order arrived on time.'):'The network needs a better handoff.';$('result-copy').textContent=r.onTime+' of '+r.total+' on time · '+r.wasted+' wasted trips · '+r.escalations+' human escalations. '+(r.won?(r.stars===3?'Three-star shift.':'Try fewer human checks for three stars.'):'Change your rules and retry the same orders.');$('real').innerHTML='In the real system: '+esc(ROUNDS[round].note)+' <a href="/projects/agents-demo/?view=agents&agent='+ROUNDS[round].agent+'">Meet the '+(ROUNDS[round].agent==='customer_service'?'customer service agent':ROUNDS[round].agent)+' →</a>';if(r.won)completed.add(round);}
  controls();renderMap();
 }
 function stop(){playing=false;if(raf)win.cancelAnimationFrame(raf);raf=0;last=null;acc=0;}
 function begin(){shift=createShift(round,plan,17);selectedFailure=null;pausedFailure=false;lastEvent=0;}
 function tick(){
  if(!shift||shift.state.finished)return;const before=shift.state.failures.length,stepFocused=doc.activeElement===$('step');shift.advance();
  const s=shift.state,e=s.events.at(-1);if(e&&e.id!==lastEvent){lastEvent=e.id;message(e.text);}
  if(s.failures.length>before){selectedFailure=s.failures.at(-1);message(selectedFailure.text,true);if(!pausedFailure){pausedFailure=true;stop();}}
  if(s.finished){stop();if(s.failures.length){selectedFailure=s.failures[0];message(selectedFailure.text,true);}else message('The shift is complete. See what held the network together.');}
  render();if(s.finished&&stepFocused)focusControl(s.result.won&&round<4?$('next'):$('run'),true);
 }
 function frame(now){
  raf=0;if(!playing)return;if(doc.hidden||panel?.hidden){stop();render();return;}
  if(last!==null)acc+=Math.min(80,Math.max(0,now-last))/1000*1.5;last=now;
  while(acc>=.25&&playing){acc-=.25;tick();}
  if(playing){moveWorkers(acc);raf=win.requestAnimationFrame(frame);}
 }
 function pause(){if(!playing)return;stop();if(shift?.state.failures.length)message(shift.state.failures.at(-1).text,true);render();}
 function edit(){
  const rule=selectedFailure?.rule;stop();shift=null;selectedFailure=null;pausedFailure=false;syncRules();render();message('Adjust the rule, then replay the same shift.');
  const section=rule==='routing'?'routing':rule==='capacity'?'capacity':rule==='escalate'?'human':'memory';
  if(rule)$(section+'-section').open=true;const control=rule==='routing'?form.elements.namedItem('route-problem'):rule==='capacity'?root.querySelector('[data-staff][data-delta="-1"]:not(:disabled)'):form.elements.namedItem(rule||'route-normal');focusControl(control);
 }
 $('run').addEventListener('click',()=>{if(playing){pause();return;}if(!shift||shift.state.finished)begin();playing=true;last=null;acc=0;message('Shift running. Watch the queues and the handoffs.');render();raf=win.requestAnimationFrame(frame);});
 $('step').addEventListener('click',()=>{stop();if(!shift)begin();tick();});$('edit').addEventListener('click',edit);
 $('next').addEventListener('click',()=>{if(!shift?.state.result?.won||round>=4)return;round++;loadRound();focusControl($('run'),true);});$('reset').addEventListener('click',()=>{round=0;completed=new Set();loadRound();focusControl($('run'),true);});
 $('rules-link').addEventListener('click',()=>{if(shift)edit();const section=$(['routing','capacity','memory','memory','human'][round]+'-section');section.open=true;focusControl(section.querySelector('select,input,button:not(:disabled)'));});
 $('launch').addEventListener('click',()=>{$('run').click();focusControl($('run'),true);});
 form.addEventListener('submit',e=>e.preventDefault());form.addEventListener('change',e=>{if(shift)return;const name=e.target.name;if(name?.startsWith('route-'))plan.routing[name.slice(6)]=e.target.value;else if(['claims','milk','offline'].includes(name))plan[name]=e.target.checked;else if(name==='escalate')plan.escalate=e.target.value;syncRules();renderMap();});
 form.addEventListener('click',e=>{const b=e.target.closest('[data-staff]');if(!b||shift)return;const n=plan.staff[b.dataset.staff]+Number(b.dataset.delta);if(n<0||n>6||totalStaff()+Number(b.dataset.delta)>6)return;plan.staff[b.dataset.staff]=n;syncRules();render();});
 const observer=new win.MutationObserver(()=>{if(panel?.hidden)pause();});if(panel)observer.observe(panel,{attributes:true,attributeFilter:['hidden']});
 win.addEventListener('blur',pause);doc.addEventListener('visibilitychange',pause);media.addEventListener('change',pause);loadRound();
 return {get state(){return {round,plan:structuredClone(plan),shift:shift?.state,playing,completed:[...completed]};},destroy(){stop();observer.disconnect();win.removeEventListener('blur',pause);doc.removeEventListener('visibilitychange',pause);media.removeEventListener('change',pause);}};
}
