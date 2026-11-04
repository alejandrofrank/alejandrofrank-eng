import {SKILLS,LEVELS,copyState,inYard,blocker,locked,legalMoves,visibleOrders,memoryParked,lossInfo,rating} from './order-flow-model.mjs';
import {SAVE_KEY,newAttempt,takeTurn,undoTurn,restoreProgress,serializeProgress} from './order-flow-progress.mjs';
const NS='http://www.w3.org/2000/svg';
const face='<svg class="of-face" viewBox="0 0 32 16" aria-hidden="true"><path d="M8 4v3m16-3v3M12 12q4 3 8 0"/></svg>';
const arrow='<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 17V3m-5 5 5-5 5 5"/></svg>';
const lockIcon='<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6 8V5a4 4 0 0 1 8 0v3M4 8h12v10H4z"/></svg>';
const star='<svg viewBox="0 0 32 32" aria-hidden="true"><path d="m16 3 4 8 9 1-6.5 6.5L24 28l-8-4.5L8 28l1.5-9.5L3 12l9-1z"/></svg>';
export function initOrderFlowGame(){
 const root=document.getElementById('order-flow-game');if(!root)return;
 const $=id=>document.getElementById('of-'+id),panel=root.closest('[data-station-panel]');
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 let saved;try{saved=window.localStorage.getItem(SAVE_KEY);}catch{}
 let {level:levelIndex,stars,attempt}=restoreProgress(saved),level=LEVELS[levelIndex],shown=attempt.state;
 let buttons=[],geometry={yard:[],bay:[],size:54,width:360,beltHeight:76},raf=0,frames=[],frameAt=0,lastTime=null,elapsed=0,pending=[],fast=false,blockedFocus=null,sound=false,audio,storageFailed=false,destroyed=false;
 const on=(el,type,fn,options)=>{el.addEventListener(type,fn,options);cleanups.push(()=>el.removeEventListener(type,fn,options));};
 const cleanups=[];
 function announce(text){$('message').textContent=text;}
 function save(){
  if(attempt.state.status==='won')stars[levelIndex]=Math.max(stars[levelIndex],rating(level,attempt.state.moves,attempt.undos));
  try{window.localStorage.setItem(SAVE_KEY,serializeProgress(levelIndex,stars,attempt));storageFailed=false;}catch{storageFailed=true;}
  $('saved').textContent=storageFailed?'Progress cannot be saved in this browser.':'Progress saved on this device';
 }
 function tone(){
  if(!sound)return;
  try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;audio??=new AC();if(audio.state==='suspended')audio.resume().catch(()=>{});const o=audio.createOscillator(),g=audio.createGain();o.frequency.value=540;g.gain.setValueAtTime(.025,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.09);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+.1);}catch{}
 }
 function stop(){if(raf)cancelAnimationFrame(raf);raf=0;frames=[];lastTime=null;elapsed=0;fast=false;$('fast').setAttribute('aria-pressed','false');$('hop').hidden=true;}
 function updateInput(){
  $('queued').textContent=pending.length?pending.length+' tap'+(pending.length===1?'':'s')+' queued':'';
  $('fast').disabled=!frames.length;
  buttons.forEach(b=>b.classList.toggle('is-queued',pending.includes(Number(b.dataset.bot))));
 }
 function updateControls(){
  $('moves').textContent=attempt.state.moves+' / '+level.budget+' moves';
  $('target').textContent=level.par+' moves for 3 stars';
  $('undo').textContent='Undo '+(3-attempt.undos);
  const disabled=!attempt.history.length||attempt.undos>=3||attempt.state.moves>level.budget;
  $('undo').disabled=disabled;$('loss-undo').disabled=disabled;
  $('loss-undo').textContent=attempt.undos>=3?'No undos left':attempt.state.moves>level.budget?'Move budget spent':'Undo last move';
  $('undo').title='Three undos per attempt. Spent moves stay spent; using Undo earns one star.';
  updateInput();
 }
 function queuePoint(i,count){
  const n=Math.ceil(count/2),spacing=Math.min(38,(geometry.width-72)/Math.max(1,n-1)),start=(geometry.width-(n-1)*spacing)/2;
  return i<n?{x:start+i*spacing,y:geometry.beltHeight-16}:{x:start+(2*n-1-i)*spacing,y:16};
 }
 function drawBelt(s){
  const visible=visibleOrders(level,s),display=visible.slice(0,12),hidden=s.queue.length-display.length;
  $('orders').textContent=s.queue.length+' left'+(hidden?' · '+hidden+(level.limited?' hidden':' more'):'');
  const front=s.queue[0],frontText=front?'Pickup · '+SKILLS[front.skill].name+(front.retry?' · retry':''):'Order belt clear';
  $('front').textContent=frontText;
  $('belt').setAttribute('aria-label',frontText+'. Next orders: '+(display.map(o=>SKILLS[o.skill].name+(o.retry?' retry':'')).join(', ')||'none')+(hidden?'. '+hidden+' hidden.':'.'));
  const first=queuePoint(0,Math.max(4,display.length)),last=queuePoint(Math.ceil(Math.max(4,display.length)/2)-1,Math.max(4,display.length));
  const right=Math.min(geometry.width-18,last.x+15);
  const bottom=geometry.beltHeight-16,middle=geometry.beltHeight/2;
  let html='<defs><pattern id="of-stripes" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="2" height="6" fill="#fff" opacity=".65"/></pattern></defs><path d="M '+first.x+' 16 H '+right+' Q '+(right+18)+' 16 '+(right+18)+' '+middle+' Q '+(right+18)+' '+bottom+' '+right+' '+bottom+' H '+first.x+'" fill="none" stroke="#d4dccb" stroke-width="27" stroke-linecap="round"/>';
  display.forEach((o,i)=>{const p=queuePoint(i,Math.max(4,display.length)),skill=SKILLS[o.skill];html+='<g transform="translate('+p.x+' '+p.y+')"><circle r="12" fill="'+skill.color+'" stroke="'+(i===0?'#233c32':'#fffdf4')+'" stroke-width="'+(i===0?3:2)+'"/>'+(o.retry?'<circle r="11" fill="url(#of-stripes)"/>':'')+'<text text-anchor="middle" y="5" fill="#fffdf4" font-size="14" font-weight="700" stroke="'+skill.color+'" stroke-width=".6">'+skill.letter+'</text></g>';});
  $('belt').innerHTML=html;
  $('memory-state').hidden=!level.limited;
  $('memory-state').textContent=memoryParked(level,s)?'Memory on · next 8 visible':'Next 4 visible · M reveals 8';
  $('handoff').hidden=!level.handoff;
  $('bags-count').textContent=s.bags.length+' / 4 bags';
  $('bag-slots').innerHTML=Array.from({length:Math.max(4,s.bags.length)},(_,i)=>'<span class="of-bag-slot'+(i<s.bags.length?' is-filled':'')+'" aria-label="'+(i<s.bags.length?'Bag waiting for Courier':'Empty bag slot')+'">'+(i<s.bags.length?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14v14H5zM9 7V4h6v3"/></svg>':'')+'</span>').join('');
  $('handoff').setAttribute('aria-label','Courier belt: '+s.bags.length+' of 4 bags. Only Couriers collect bags.');
 }
 function draw(s,event){
  shown=s;root.dataset.status=s.status;root.dataset.level=String(levelIndex+1);
  drawBelt(s);$('bay-count').textContent=s.bay.filter(Boolean).length+' / '+level.slots+' slots';
  $('slots').querySelectorAll('.of-slot').forEach(el=>el.classList.toggle('is-stuck',s.cause==='slots'));
  $('handoff').classList.toggle('is-overflow',s.cause==='overflow');$('moves').classList.toggle('is-overflow',s.cause==='moves');
  for(const b of level.bots){
   const el=buttons[b.id-1],yard=inYard(s,b.id),slot=s.bay.findIndex(p=>p?.id===b.id),parked=slot>=0?s.bay[slot]:null;
   const p=yard?geometry.yard[b.y*level.cols+b.x]:geometry.bay[slot];
   // Departed bots really leave the DOM paint/hit-testing tree; no orphan markers.
   el.hidden=!yard&&!parked;el.style.width=geometry.size+'px';el.style.height=geometry.size+'px';
   if(p)el.style.transform='translate('+p.x+'px,'+p.y+'px)';
   const release=!!parked&&b.skill==='memory',by=blocker(level,s,b.id),isLocked=locked(level,s,b.id);
   const canTap=s.status==='playing'&&(yard||release);
   el.tabIndex=canTap?0:-1;el.style.pointerEvents=canTap?'auto':'none';el.dataset.bay=String(!!parked);
   el.setAttribute('aria-disabled',String(!canTap||yard&&(!!by||isLocked)));
   el.classList.toggle('is-blocker',yard&&b.id===blockedFocus);
   el.querySelector('.of-arrow').hidden=!yard;el.querySelector('.of-lock').hidden=!yard||!isLocked;
   el.querySelector('.of-count strong').textContent=b.skill==='memory'?(release?'−':'+4'):String(parked?.remaining??b.capacity);
   const description=release?'Memory bot '+b.id+', reveal active. Tap to release for one move.':SKILLS[b.skill].name+' bot '+b.id+', '+(b.skill==='memory'?'reveals four more orders':(parked?.remaining??b.capacity)+' orders')+(yard?', exit '+b.dir+(by?', blocked by bot '+by:', clear path')+(isLocked?', locked until '+SKILLS[b.lock].name+' finishes':''):', parked');
   el.setAttribute('aria-label',description);
  }
  const hop=$('hop');hop.hidden=true;
  if(event?.kind==='serve'&&!reduced.matches&&geometry.bay[event.slot]){
   const p=geometry.bay[event.slot];hop.style.left=(p.x+geometry.size/2-10)+'px';hop.style.top=(p.y-18)+'px';hop.style.animationName=s.served%2?'of-hop-a':'of-hop-b';
   hop.style.setProperty('--bot',SKILLS[level.bots[event.id-1].skill].color);hop.textContent=event.source==='bags'?'C':event.retry?'R':SKILLS[level.bots[event.id-1].skill].letter;hop.hidden=false;
  }
  updateInput();showOutcome(s);
 }
 function showOutcome(s){
  const ended=s.status!=='playing';$('work').inert=ended;$('result').hidden=s.status!=='won';$('loss').hidden=s.status!=='lost';
  if(s.status==='won'){
   const score=rating(level,s.moves,attempt.undos);
   $('stars').innerHTML=Array.from({length:3},(_,i)=>star.replace('<svg ','<svg data-empty="'+(i>=score)+'" ')).join('');$('stars').setAttribute('aria-label',score+' of 3 stars');
   $('result-title').textContent=levelIndex===LEVELS.length-1?'All ten cleared!':'Plan complete';
   $('result-score').textContent=s.moves+' moves · '+attempt.undos+' undos · best '+stars[levelIndex]+'/3 stars';
   $('real-note').textContent=level.note;$('real').href='/projects/agents-demo/?view=agents&agent='+level.agent+(level.part?'&part='+level.part:'');
   $('next').textContent=levelIndex===9?'Back to level 1':'Next level';
  }else if(s.status==='lost'){
   const info=lossInfo(level,s);$('loss-title').textContent=info.title;$('loss-text').textContent=info.text;
   $('loss-cause').textContent=info.area==='bay'?'Stuck bay: '+s.bay.filter(Boolean).map(p=>SKILLS[level.bots[p.id-1].skill].name).join(' + '):info.area==='handoff'?s.bags.length+' bags → only 4 spaces':s.moves+' moves → limit '+level.budget;
   $('loss').dataset.cause=s.cause;
  }
 }
 function endTrace(){
  if(raf)cancelAnimationFrame(raf);raf=0;frames=[];draw(attempt.state);updateControls();
  if(attempt.state.status!=='playing'){pending=[];updateInput();announce(attempt.state.status==='won'?'Level cleared. Your stars are saved.':lossInfo(level,attempt.state).text);(attempt.state.status==='won'?$('next'):$('retry')).focus({preventScroll:true});return;}
  while(pending.length){const id=pending.shift();if(startTurn(id))return;}
  const front=attempt.state.queue[0];announce(attempt.state.bags.length?attempt.state.bags.length+' bags waiting. Only Couriers collect them.':front?'Front needs '+SKILLS[front.skill].name+'. Choose the next clear arrow.':'Release Memory to finish.');
  const id=legalMoves(level,attempt.state)[0];if(id&&(document.activeElement===document.body||document.activeElement?.classList.contains('of-bot')))buttons[id-1].focus({preventScroll:true});
 }
 function tick(now){
  raf=0;if(destroyed)return;
  if(document.hidden||panel?.hidden||reduced.matches){endTrace();return;}
  if(lastTime===null)lastTime=now;elapsed+=Math.max(0,now-lastTime)*(fast?6:1);lastTime=now;
  const at=Math.floor(elapsed/150);
  if(at>=frames.length){endTrace();return;}
  if(at!==frameAt){frameAt=at;const event=frames[at];draw(event.state,event);}
  raf=requestAnimationFrame(tick);
 }
 function startTurn(id){
  const turn=takeTurn(level,attempt,id);blockedFocus=null;
  if(turn.error){blockedFocus=turn.blockedBy??null;draw(attempt.state);announce(turn.error);return false;}
  attempt=turn.attempt;save();updateControls();tone();
  frames=turn.events.filter(e=>e.kind!=='settled');frameAt=0;elapsed=0;lastTime=null;
  if(reduced.matches||!frames.length||document.hidden){endTrace();}
  else{draw(frames[0].state,frames[0]);if(!raf)raf=requestAnimationFrame(tick);announce('Working. Tap another bot to queue it.');}
  return true;
 }
 function tap(id){
  if(attempt.state.status!=='playing'&&!frames.length)return;
  if(frames.length){if(!pending.includes(id)||level.bots[id-1]?.skill==='memory'&&pending.filter(n=>n===id).length<2){pending.push(id);updateInput();announce('Bot '+id+' queued. '+pending.length+' waiting.');}return;}
  startTurn(id);
 }
 function measure(){
  const base=$('work').getBoundingClientRect();if(!base.width)return;
  const sx=base.width/($('work').clientWidth||base.width),sy=base.height/($('work').clientHeight||base.height);
  const rect=el=>{const r=el.getBoundingClientRect();return {x:(r.left-base.left)/sx,y:(r.top-base.top)/sy,width:r.width/sx,height:r.height/sy};};
  const cells=[...$('cells').children].map(rect),slots=[...$('slots').children].map(rect);
  const size=Math.max(44,Math.min(62,...cells.map(r=>Math.min(r.width-10,r.height-6)),...slots.map(r=>Math.min(r.width-8,r.height-6))));
  const center=r=>({x:r.x+(r.width-size)/2,y:r.y+(r.height-size)/2});
  geometry={size,yard:cells.map(center),bay:slots.map(center),width:$('belt').clientWidth||360,beltHeight:$('belt').clientHeight||76};
  $('belt').setAttribute('viewBox','0 0 '+geometry.width+' '+geometry.beltHeight);draw(shown);
 }
 function levelMenu(){
  const unlocked=Math.min(9,stars.findIndex(s=>!s)<0?9:stars.findIndex(s=>!s));
  $('level-list').innerHTML=LEVELS.map((l,i)=>'<button type="button" data-level="'+i+'" '+(i>unlocked?'disabled':'')+' aria-label="Level '+(i+1)+', '+l.title+', '+stars[i]+' of 3 stars"'+(i===levelIndex?' aria-current="step"':'')+'><strong>'+(i+1)+'</strong><span>'+stars[i]+'/3 stars</span></button>').join('');
  $('levels').hidden=false;$('level-list').querySelector('[data-level="'+levelIndex+'"]').focus();
 }
 function loadLevel(index,resume){
  stop();pending=[];levelIndex=index;level=LEVELS[index];attempt=resume??newAttempt(level);shown=attempt.state;blockedFocus=null;
  $('levels').hidden=true;$('title').textContent=level.title;$('caption').textContent=level.caption;$('level').textContent=(index+1)+' / 10';
  $('level').setAttribute('aria-label','Level '+(index+1)+' of 10. Choose an unlocked level.');
  $('slots').style.gridTemplateColumns='repeat('+level.slots+',1fr)';$('slots').innerHTML=Array.from({length:level.slots},(_,i)=>'<div class="of-slot" aria-label="Bay slot '+(i+1)+'"></div>').join('');
  $('cells').style.gridTemplateColumns='repeat('+level.cols+',1fr)';$('cells').style.gridTemplateRows='repeat('+level.rows+',1fr)';$('cells').innerHTML=Array.from({length:level.cols*level.rows},()=>'<div class="of-cell" aria-hidden="true"></div>').join('');
  $('bots').innerHTML=level.bots.map(b=>'<button type="button" class="of-bot" data-bot="'+b.id+'" style="--bot:'+SKILLS[b.skill].color+'">'+face+'<span class="of-count"><span>'+SKILLS[b.skill].letter+'</span><strong>'+b.capacity+'</strong></span><span class="of-arrow" style="rotate:'+({up:0,right:90,down:180,left:270})[b.dir]+'deg">'+arrow+'</span><span class="of-lock" style="--lock:'+(b.lock?SKILLS[b.lock].color:'#243e35')+'" hidden>'+lockIcon+'</span></button>').join('');
  buttons=[...$('bots').children];buttons.forEach((b,i)=>b.addEventListener('click',()=>tap(i+1)));
  const skills=new Set(level.bots.map(b=>b.skill));
  $('legend').innerHTML=Object.entries(SKILLS).filter(([key])=>skills.has(key)).map(([,s])=>'<span><b style="--bot:'+s.color+'">'+s.letter+'</b>'+s.name+'</span>').join('');
  $('board').dataset.handoff=String(level.handoff);$('board').dataset.rows=String(level.rows);
  save();updateControls();draw(shown);measure();
  announce(attempt.state.status==='playing'?'Tap clear arrows. Three undos; spent moves stay spent.':attempt.state.status==='won'?'This level is complete. Your stars are saved.':lossInfo(level,attempt.state).text);
 }
 function undo(){
  const next=undoTurn(level,attempt);if(!next)return;
  stop();pending=[];attempt=next;blockedFocus=null;save();updateControls();draw(attempt.state);
  announce('Undone. '+(3-attempt.undos)+' undos left; spent moves stay spent.');
  buttons[legalMoves(level,attempt.state)[0]-1]?.focus({preventScroll:true});
 }
 on($('undo'),'click',undo);on($('loss-undo'),'click',undo);
 for(const id of ['replay','again','retry'])on($(id),'click',()=>loadLevel(levelIndex));
 on($('next'),'click',()=>{loadLevel((levelIndex+1)%10);buttons[legalMoves(level,attempt.state)[0]-1]?.focus({preventScroll:true});});
 on($('level'),'click',levelMenu);on($('close-levels'),'click',()=>{$('levels').hidden=true;$('level').focus();});
 on($('level-list'),'click',e=>{const button=e.target.closest('[data-level]');if(button&&!button.disabled)loadLevel(Number(button.dataset.level));});
 on(root,'keydown',e=>{if($('levels').hidden)return;if(e.key==='Escape'){e.preventDefault();e.stopPropagation();$('levels').hidden=true;$('level').focus();}else if(e.key==='Tab'){const choices=[...$('levels').querySelectorAll('button:not(:disabled)')],at=choices.indexOf(document.activeElement);e.preventDefault();choices[(at+(e.shiftKey?-1:1)+choices.length)%choices.length]?.focus();}});
 on($('sound'),'click',()=>{sound=!sound;$('sound').textContent='Sound '+(sound?'on':'off');$('sound').setAttribute('aria-pressed',String(sound));tone();});
 const speed=value=>{fast=value;$('fast').setAttribute('aria-pressed',String(value));};
 on($('fast'),'pointerdown',e=>{if(!frames.length)return;e.preventDefault();speed(true);$('fast').setPointerCapture?.(e.pointerId);});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])on($('fast'),type,()=>speed(false));
 on($('fast'),'keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();speed(true);}});
 on($('fast'),'keyup',()=>speed(false));on($('fast'),'blur',()=>speed(false));on(window,'blur',()=>speed(false));
 on(document,'visibilitychange',()=>{if(document.hidden&&frames.length)endTrace();});
 on(reduced,'change',()=>{if(reduced.matches&&frames.length)endTrace();});
 root.hidden=false;loadLevel(levelIndex,attempt);
 const observer=new ResizeObserver(measure);observer.observe($('work'));
 const visibility=panel?new MutationObserver(()=>{if(panel.hidden&&frames.length)endTrace();else measure();}):null;
 visibility?.observe(panel,{attributes:true,attributeFilter:['hidden']});
 return {snapshot:()=>({level:levelIndex,state:copyState(attempt.state),shown:copyState(shown),undos:attempt.undos,stars:[...stars],queued:[...pending],pendingFrames:frames.length}),destroy:()=>{destroyed=true;stop();cleanups.forEach(fn=>fn());observer.disconnect();visibility?.disconnect();audio?.close();}};
}
