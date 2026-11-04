import {QUEUES,STORES,ROUNDS,createShift,workerPosition,pinLayout} from './dispatch-live-model.mjs';
const COLORS={normal:'#287b53',urgent:'#b76b19',problem:'#527fc2'};
const robot='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v3M4 10H2m20 0h-2M7 21v-3m10 3v-3"/><rect x="4" y="6" width="16" height="13" rx="4"/><path d="M8 11h1m6 0h1M9 15h6"/></svg>';
const star='<svg viewBox="0 0 30 30" aria-hidden="true"><path d="m15 2 4 8 9 1-6.5 6.5L23 27l-8-4.5L7 27l1.5-9.5L2 11l9-1z"/></svg>';
const name=o=>o.needsHuman?'Address?':o.kind==='cold'?'Cold bag':o.kind==='problem'?'Check?':'Groceries';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function initDispatchGame(root=document.getElementById('dispatch-game')){
 if(!root)return null;
 root.hidden=false;
 const doc=root.ownerDocument,win=doc.defaultView,$=id=>root.querySelector('#rd-'+id),panel=root.closest('[data-station-panel]');
 const media=win.matchMedia('(prefers-reduced-motion: reduce)'),narrow=win.matchMedia('(max-width:700px)');
 let round=0,carry={},shift=createShift(),playing=false,started=false,firstFailure=false,focusFailure=null,selection=null,raf=0,last=null,acc=0,seen=0,finishedShown=false,sound=false,audio=null,lastHud=-1,drag=null,suppressClick=0,inputAt=null;
 let bounds={width:800,height:350};
 const pinNodes=new Map(),botNodes=new Map(),courierNodes=new Map(),routeNodes=new Map(),memo=new Map();
 function html(node,value){if(memo.get(node)!==value){node.innerHTML=value;memo.set(node,value);}}
 function text(node,value){value=String(value);if(node.textContent!==value)node.textContent=value;}
 function message(value,failure=false){text($('message'),value);$('message').dataset.failure=String(failure);}
 function beep(kind){
  if(!sound)return;
  try{audio??=new (win.AudioContext||win.webkitAudioContext)();if(audio.state==='suspended')audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.value=kind==='failure'?180:kind==='delivery'?540:370;g.gain.setValueAtTime(.035,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.12);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+.13);}catch{sound=false;text($('sound'),'Sound unavailable');}
 }
 function setSelection(kind,id){selection={kind,id};message(kind==='bot'?'Bot '+id+' selected. Tap the lane it should join.':'Order '+id+' selected. Tap a lane'+(round===4?' or Human.':'.'));sync();}
 function stop(){playing=false;if(raf)win.cancelAnimationFrame(raf);raf=0;last=null;acc=0;}
 function pause(){if(!playing)return;stop();message('Paused. You can still route pins, move bots and pin notes.');sync();}
 function controls(){
  text($('run'),playing?'Pause':shift.state.finished?'Replay shift':started?'Continue':'Run shift');$('edit').hidden=!firstFailure||shift.state.finished;
  text($('clock'),Math.max(0,Math.ceil(50-shift.state.time))+'s');$('time').value=shift.state.time;
  text($('claim'),round<2?'Claim · shift 3':shift.state.claims?'Claim stamped':'Stamp Claim');$('claim').disabled=round<2||shift.state.finished;$('claim').setAttribute('aria-pressed',String(shift.state.claims));
  text($('human'),round<4?'Human · shift 5':'Send to Human');$('human').disabled=round<4||shift.state.finished;
  $('welcome').hidden=started;$('world').inert=shift.state.finished;$('lanes').inert=shift.state.finished;$('board').inert=shift.state.finished;
 }
 function focus(node){node?.focus({preventScroll:true});}
 function reset(next=false){
  stop();if(next){carry=shift.carry();round++;}else carry=shift.carry();
  shift=createShift(round,carry);started=false;firstFailure=false;focusFailure=null;selection=null;seen=0;finishedShown=false;lastHud=-1;
  pinNodes.forEach(n=>n.remove());pinNodes.clear();botNodes.forEach(n=>n.remove());botNodes.clear();courierNodes.forEach(n=>n.remove());courierNodes.clear();routeNodes.forEach(n=>n.remove());routeNodes.clear();$('effects').replaceChildren();
  text($('title'),ROUNDS[round].title);text($('round'),(round+1)+' / 5');text($('brief'),ROUNDS[round].brief);text($('budget'),shift.state.workers.length+' bots');
  html($('team-tip'),robot+(round?'Tap a bot, then a lane to move it. A busy bot finishes its bag first.':'Four bots, fixed this shift. Use the free lanes.'));
  message('Tap Run shift. Then tap a pin and a lane, or drag it there.');sync();focus($('run'));
 }
 function start(){if(shift.state.finished)reset();started=true;playing=true;focusFailure=null;last=null;acc=0;message('Tap a pin → tap a lane. Use spare capacity before its ring runs out.');sync();if(!raf)raf=win.requestAnimationFrame(frame);}
 function result(){
  const s=shift.state,r=s.result;$('result').hidden=!s.finished;if(!s.finished||finishedShown)return;
  finishedShown=true;
  text($('result-title'),r.won?(round===4?'Madrid is moving!':'Shift delivered.'):'The queues got away.');
  html($('stars'),Array.from({length:3},(_,i)=>star.replace('<svg','<svg data-empty="'+(i>=r.stars)+'"')).join(''));$('stars').setAttribute('aria-label',r.stars+' of 3 stars');
  html($('result-score'),[['On time',r.onTime+'/'+r.total],['Late',r.late],['Wasted',r.wasted],['Human',r.escalations]].map(([label,value])=>'<div><strong>'+value+'</strong>'+label+'</div>').join(''));
  text($('result-copy'),r.won?(round===4?'All five shifts complete. You kept the agents coordinated.':'Keep the tools you unlocked. The next shift adds a new challenge.'):'Deliver 70% on time with at most 3 wasted trips to advance.');
  $('next').hidden=!r.won||round===4;$('real').href='/projects/agents-demo/?view=agents&agent='+ROUNDS[round].agent;text($('real-copy'),ROUNDS[round].note);focus($('replay'));
 }
 function syncPins(){
  const s=shift.state,groups=pinLayout(s.orders.map(o=>o.id===focusFailure?.order?{...o,status:'new'}:o),narrow.matches),keep=new Set();
  for(const group of groups){
   const o=group.items.find(o=>o.id===focusFailure?.order)||group.items[0],key=group.slot;keep.add(key);let b=pinNodes.get(key);
   if(!b){b=doc.createElement('button');b.type='button';b.className='rd-pin';b.dataset.new='true';b.innerHTML='<svg class="rd-ring" viewBox="0 0 66 66" aria-hidden="true"><circle class="rd-ring-bg" cx="33" cy="33" r="30"/><circle class="rd-ring-value" cx="33" cy="33" r="30"/></svg><strong></strong><small></small><span class="rd-count" hidden></span>';pinNodes.set(key,b);$('pins').append(b);}
   b.dataset.order=o.id;b.dataset.kind='order';b.dataset.late=String(o.late);b.style.left=group.x+'%';b.style.top=group.y+'%';b.style.setProperty('--pin',o.needsHuman||o.kind==='problem'?COLORS.problem:o.kind==='cold'?COLORS.urgent:COLORS.normal);
   b.setAttribute('aria-pressed',String(selection?.kind==='order'&&selection.id===o.id));b.classList.toggle('is-focus',focusFailure?.order===o.id);text(b.querySelector('strong'),o.needsHuman?'Address':o.kind==='cold'?'Cold':o.kind==='problem'?'Check':'Bag '+o.id);
   const seconds=Math.max(0,Math.ceil(o.due-s.time));text(b.querySelector('small'),seconds+'s');b.setAttribute('aria-label','Order '+o.id+', '+name(o)+', '+seconds+' seconds'+(group.items.length>1?', '+group.items.length+' orders here':''));
   const badge=b.querySelector('.rd-count');badge.hidden=group.items.length<2;text(badge,group.items.length);b.querySelector('.rd-ring-value').style.strokeDashoffset=String(188.5*(1-Math.max(0,(o.due-s.time)/o.window)));
  }
  for(const [key,node] of pinNodes)if(!keep.has(key)){node.remove();pinNodes.delete(key);}
 }
 function syncBots(){
  const s=shift.state;
  for(const w of s.workers){
   let b=botNodes.get(w.id);if(!b){b=doc.createElement('button');b.type='button';b.className='rd-bot';b.dataset.bot=w.id;b.dataset.kind='bot';b.innerHTML=robot+'<span>'+w.id+'</span>';botNodes.set(w.id,b);}
   const lane=$('bots-'+w.lane);if(b.parentNode!==lane)lane.append(b);b.disabled=round===0||w.offline;b.dataset.offline=String(w.offline);b.dataset.busy=String(!!w.job);b.setAttribute('aria-label','Bot '+w.id+', '+w.lane+(w.offline?', offline':w.job?', delivering':', free'));b.setAttribute('aria-pressed',String(selection?.kind==='bot'&&selection.id===w.id));
   let actor=courierNodes.get(w.id);if(!actor){actor=doc.createElement('div');actor.className='rd-courier';actor.innerHTML=robot;courierNodes.set(w.id,actor);$('couriers').append(actor);const path=doc.createElementNS('http://www.w3.org/2000/svg','path');$('routes').append(path);routeNodes.set(w.id,path);}
   actor.style.setProperty('--bot',COLORS[w.lane]);actor.dataset.offline=String(w.offline);
   const path=routeNodes.get(w.id),j=w.job;path.setAttribute('stroke',COLORS[w.lane]);path.setAttribute('d',j?'M'+j.from.x+' '+j.from.y+'H'+j.to.x+'V'+j.to.y:'');
  }
 }
 function sync(){
  const s=shift.state;controls();root.dataset.focusFailure=String(!!focusFailure);root.dataset.round=round;root.dataset.state=s.finished?'finished':playing?'running':started?'paused':'ready';
  for(const key of ['onTime','late','wasted','escalations'])text($(key),s.score[key]);
  for(const q of QUEUES){
   text($('waiting-'+q),s.queues[q].length+' waiting');html($('queue-'+q),s.queues[q].slice(0,8).map(t=>'<span class="rd-queue-token">'+t.orderId+'</span>').join('')+(s.queues[q].length>8?'<span class="rd-queue-token">+'+(s.queues[q].length-8)+'</span>':''));
   root.querySelector('[data-lane-zone="'+q+'"]').classList.toggle('is-focus',focusFailure?.lane===q);
  }
  html($('note-inbox'),s.notes.filter(n=>!n.pinned).map(n=>'<button type="button" class="rd-note" data-note="'+n.id+'" data-kind="note"><strong>Pin note →</strong>'+esc(n.text)+'</button>').join(''));
  html($('notes'),s.notes.some(n=>n.pinned)?s.notes.filter(n=>n.pinned).map(n=>'<div class="rd-pinned">'+esc(n.text)+'</div>').join(''):'<p>'+(round<3?'Facts unlock in shift 4.':'No shared facts yet. Pin new notes as they arrive.')+'</p>');
  $('weather').hidden=!s.rain;root.querySelector('[data-store="sol"]').dataset.empty=String(s.stockOut);
  syncPins();syncBots();move();result();
 }
 function move(){
  for(const w of shift.state.workers){const extra=playing&&!media.matches?acc:0,p=w.job?workerPosition(w,extra/(shift.state.rain&&w.job.phase==='deliver'?1.4:1)):w.offline?workerPosition(w):{x:45+Math.sin((shift.state.time+extra)*.25+w.id)*18,y:79+Math.cos((shift.state.time+extra)*.3+w.id)*7};courierNodes.get(w.id)?.style.setProperty('transform','translate3d('+(p.x/100*bounds.width)+'px,'+(p.y/100*bounds.height)+'px,0)');}
  $('time').value=shift.state.time;
 }
 function process(){
  const s=shift.state;let pauseFailure=null;
  for(const e of s.events.slice(seen)){
   if(e.delta){const d=doc.createElement('span');d.textContent='+1';$("delta-"+e.delta).replaceChildren(d);}
   if(e.kind==='failure'){
    message(e.text,true);beep('failure');
    if(!firstFailure){firstFailure=true;pauseFailure={...e,lane:e.lane||(s.orders.find(o=>o.id===e.order)?.kind==='cold'?'urgent':s.orders.find(o=>o.id===e.order)?.kind==='problem'?'problem':'normal')};}
    const pin=[...pinNodes.values()].find(p=>Number(p.dataset.order)===e.order);if(pin){pin.classList.remove('is-flash');pin.classList.add('is-flash');pin.addEventListener('animationend',()=>pin.classList.remove('is-flash'),{once:true});}
    if(e.delta==='wasted'){const puff=doc.createElement('span');puff.className='rd-puff';puff.style.left=(e.x??46)+'%';puff.style.top=(e.y??50)+'%';puff.dataset.expires=String(s.time+1);puff.textContent='+1 wasted';$('effects').append(puff);puff.addEventListener('animationend',()=>puff.remove(),{once:true});}
   }else if(['note','address','offline','weather','retry','memory','claim','capacity','human'].includes(e.kind))message(e.text);
   if(e.kind==='delivery')beep('delivery');
  }
  seen=s.events.length;for(const puff of $('effects').children)if(Number(puff.dataset.expires)<s.time)puff.remove();
  if(pauseFailure){stop();focusFailure=pauseFailure;message(pauseFailure.text,true);focus($('run'));}
  if(s.finished)stop();
 }
 function frame(now){
  raf=0;if(!playing)return;if(doc.hidden||panel?.hidden){pause();return;}
  if(last!==null){const elapsed=Math.max(0,(now-last)/1000);if(elapsed>2){pause();message('Paused while the page was inactive. Continue when you are ready.');return;}acc+=elapsed;}last=now;
  let changed=false;
  while(acc>=.05&&playing){acc-=.05;shift.advance(.05);process();changed=true;}
  if(changed&&(now-lastHud>=100||!playing)){sync();lastHud=now;}else if(!media.matches)move();
  if(inputAt!==null){root.dataset.paintLatencyMs=String(Math.max(0,now-inputAt).toFixed(2));inputAt=null;}
  if(playing)raf=win.requestAnimationFrame(frame);
 }
 function input(action){const before=win.performance.now();inputAt=before;const ok=action();if(ok){focusFailure=null;process();sync();beep('action');}root.dataset.inputLatencyMs=String((win.performance.now()-before).toFixed(2));return ok;}
 function send(lane){
  if(!selection){message('Tap an order pin or a bot first, then this lane.');return;}
  const chosen=selection;selection=null;
  if(input(()=>chosen.kind==='bot'?shift.moveBot(chosen.id,lane):shift.route(chosen.id,lane))){message(chosen.kind==='bot'?'Bot '+chosen.id+' joins '+lane+'.':'Order '+chosen.id+' sent to '+lane+'. Keep routing.');focus(root.querySelector('[data-lane="'+lane+'"]'));}
 }
 function click(e){
  if(win.performance.now()<suppressClick)return;const b=e.target.closest('button');if(!b||b.disabled)return;
  if(b.dataset.order){setSelection('order',Number(b.dataset.order));return;}
  if(b.dataset.bot){setSelection('bot',Number(b.dataset.bot));return;}
  if(b.dataset.lane){send(b.dataset.lane);return;}
  if(b.dataset.note){input(()=>shift.pin(b.dataset.note));return;}
  if(b.id==='rd-run'){playing?pause():start();return;}
  if(b.id==='rd-edit'){stop();focusFailure=null;message('Make the repair on the map, then Continue. The shift stays paused.');sync();return;}
  if(b.id==='rd-claim'){input(()=>shift.claiming());return;}
  if(b.id==='rd-human'){if(selection?.kind==='order'){const id=selection.id;selection=null;input(()=>shift.escalate(id));}else message('Tap the changed-address pin first, then Human.');return;}
  if(b.id==='rd-sound'){sound=!sound;text(b,sound?'Sound on':'Sound off');b.setAttribute('aria-pressed',String(sound));b.setAttribute('aria-label',sound?'Sound on':'Sound off');if(sound)beep('action');return;}
  if(b.id==='rd-replay'||b.id==='rd-reset'){reset();return;}
  if(b.id==='rd-next'&&shift.state.result?.won&&round<4){reset(true);return;}
 }
 function key(e){if(['1','2','3'].includes(e.key)&&selection){e.preventDefault();send(QUEUES[Number(e.key)-1]);}}
 function down(e){const b=e.target.closest('[data-kind]');if(!b||b.disabled||e.button>0)return;drag={node:b,kind:b.dataset.kind,id:b.dataset.order||b.dataset.bot||b.dataset.note,x:e.clientX,y:e.clientY,moved:false,ghost:null};}
 function pointerMove(e){if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.moved&&Math.hypot(dx,dy)<8)return;e.preventDefault();if(!drag.moved){drag.moved=true;drag.ghost=drag.node.cloneNode(true);drag.ghost.removeAttribute('id');drag.ghost.classList.add('rd-drag-ghost');drag.ghost.style.left=drag.x+'px';drag.ghost.style.top=drag.y+'px';drag.ghost.setAttribute('aria-hidden','true');root.append(drag.ghost);}drag.ghost.style.setProperty('transform','translate3d('+dx+'px,'+dy+'px,0)','important');}
 function up(e){if(!drag)return;const d=drag;drag=null;if(d.moved){d.ghost?.remove();suppressClick=win.performance.now()+350;const target=doc.elementFromPoint(e.clientX,e.clientY);const lane=target?.closest('[data-lane-zone]')?.dataset.laneZone;if(lane&&d.kind!=='note'){selection={kind:d.kind,id:Number(d.id)};send(lane);}else if(d.kind==='note'&&target?.closest('[data-board]'))input(()=>shift.pin(d.id));else if(d.kind==='order'&&target?.closest('[data-human]'))input(()=>shift.escalate(Number(d.id)));}}
 function cancel(){drag?.ghost?.remove();drag=null;}
 const observer=new win.MutationObserver(()=>{if(panel?.hidden)pause();});if(panel)observer.observe(panel,{attributes:true,attributeFilter:['hidden']});
 const measure=()=>{bounds={width:$('world').clientWidth||800,height:$('world').clientHeight||350};move();};
 const resize=win.ResizeObserver?new win.ResizeObserver(measure):null;resize?.observe($('world'));
 $('stores').innerHTML=STORES.map(s=>'<div class="rd-store" data-store="'+s.id+'" style="left:'+s.x+'%;top:'+s.y+'%"><svg viewBox="0 0 30 24" aria-hidden="true"><rect x="2" y="2" width="26" height="20" rx="3"/><path d="M5 8h20M8 8v11m7-11v11m7-11v11"/></svg>'+s.name+'</div>').join('');
 root.addEventListener('click',click);root.addEventListener('keydown',key);root.addEventListener('pointerdown',down);doc.addEventListener('pointermove',pointerMove,{passive:false});doc.addEventListener('pointerup',up);doc.addEventListener('pointercancel',cancel);
 win.addEventListener('blur',pause);doc.addEventListener('visibilitychange',pause);media.addEventListener('change',pause);narrow.addEventListener('change',sync);win.addEventListener('resize',measure);reset();
 return {get state(){return {round,shift:shift.state,playing,selection,carry:shift.carry()};},destroy(){stop();observer.disconnect();resize?.disconnect();cancel();audio?.close();root.removeEventListener('click',click);root.removeEventListener('keydown',key);root.removeEventListener('pointerdown',down);doc.removeEventListener('pointermove',pointerMove);doc.removeEventListener('pointerup',up);doc.removeEventListener('pointercancel',cancel);win.removeEventListener('blur',pause);doc.removeEventListener('visibilitychange',pause);media.removeEventListener('change',pause);narrow.removeEventListener('change',sync);win.removeEventListener('resize',measure);}};
}
