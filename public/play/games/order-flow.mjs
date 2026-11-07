import {LEVELS,SKILLS,copyState,inYard,blocker,rating,isIncognito,visiblePassengers} from './order-flow-model.mjs';
import {SAVE_KEY,newAttempt,takeTurn,undoTurn,useHint,restoreProgress,serializeProgress,remainingTime,expireAttempt} from './order-flow-progress.mjs';
import {nextMoveHint} from './order-flow-proof.mjs';
const marks={picker:'<circle cx="0" cy="0" r="3"/>',courier:'<path d="M-3-3h6v6h-6z"/>',support:'<path d="m0-4 4 7h-8z"/>',inventory:'<path d="m0-4 4 4-4 4-4-4z"/>'};
const carArt=()=>'<svg viewBox="0 0 64 64" aria-hidden="true"><path class="of-direction" d="M32 47V17m-12 12 12-12 12 12"/></svg>';
const personArt=skill=>'<svg viewBox="0 0 26 34" aria-hidden="true"><circle cx="13" cy="7" r="5" fill="currentColor"/><path d="M5 31V20a8 8 0 0 1 16 0v11z" fill="currentColor"/><g fill="#fffaf3" transform="translate(13 22)">'+marks[skill]+'</g></svg>';
const star='<svg viewBox="0 0 32 32" aria-hidden="true"><path d="m16 3 4 8 9 1-6.5 6.5L24 28l-8-4.5L8 28l1.5-9.5L3 12l9-1z"/></svg>';
export function initOrderFlowGame(){
 const root=document.getElementById('order-flow-game');if(!root)return;
 const $=id=>document.getElementById('of-'+id),panel=root.closest('[data-station-panel]'),reduced=window.matchMedia('(prefers-reduced-motion: reduce)'),compact=window.matchMedia('(max-width: 700px)');
 let raw;try{raw=window.localStorage.getItem(SAVE_KEY);}catch{}
 let {level:index,stars,attempt}=restoreProgress(raw),level=LEVELS[index],buttons=[],focusId=1,highlight=null,hint=null,sound=false,audio,raf=0,destroyed=false;
 let effects=[],started=null,lastSecond=null;const cleanups=[];
 const on=(el,event,fn)=>{el.addEventListener(event,fn);cleanups.push(()=>el.removeEventListener(event,fn));};
 const announce=text=>{$('message').textContent=text;};
 const closeTools=()=>{if(compact.matches)$('tools').open=false;};
 const toolsMode=()=>{$('tools').open=!compact.matches;};
 const runningClock=()=>level.timeLimitSeconds&&attempt.deadline!==null&&!attempt.timedOut&&attempt.state.status==='playing';
 const queueFrame=()=>{if(!raf&&!destroyed&&!document.hidden&&!panel?.hidden&&(effects.length||runningClock()))raf=requestAnimationFrame(tick);};
 function paintClock(){
  const ms=remainingTime(level,attempt);$('timer').hidden=ms===null||attempt.state.status==='won';if(ms===null)return;
  const seconds=Math.ceil(ms/1000),clockKey=seconds+':'+(attempt.deadline===null);if(clockKey===lastSecond)return;lastSecond=clockKey;
  const label=Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');
  $('timer').textContent='Time '+label;$('timer').setAttribute('aria-label',label+' remaining'+(attempt.deadline===null?'. Starts on your first car.':''));
  $('timer').title=attempt.deadline===null?'Starts on your first car. The clock keeps running if you leave.':'Time remaining. Undo and reload do not reset it.';
  $('timer').classList.toggle('is-low',seconds<=30);
 }
 function checkClock(){
  const next=expireAttempt(level,attempt);if(!attempt.timedOut&&next.timedOut){
   attempt=next;$('levels').hidden=true;save();finishFlights();announce('Time is up.');$('loss-retry').focus();return true;
  }
  paintClock();return attempt.timedOut;
 }
 function save(){
  if(attempt.state.status==='won')stars[index]=Math.max(stars[index],rating(attempt));
  try{window.localStorage.setItem(SAVE_KEY,serializeProgress(index,stars,attempt));$('saved').textContent='Progress saved on this device';}
  catch{$('saved').textContent='Progress cannot be saved in this browser.';}
 }
 function tone(){
  if(!sound)return;
  try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;audio??=new AC();audio.resume().catch(()=>{});const o=audio.createOscillator(),g=audio.createGain();o.frequency.value=500;g.gain.setValueAtTime(.02,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.08);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+.09);}catch{}
 }
 function draw(){
  if(!buttons.length)return;
  const s=attempt.state,lost=s.status==='lost'||attempt.timedOut;root.dataset.level=String(index+1);root.dataset.status=lost?'lost':s.status;
  $('grid').inert=s.status!=='playing'||attempt.timedOut||!$('levels').hidden;
  for(const c of level.cars){
   const el=buttons[c.id-1],present=inYard(s,c.id),by=blocker(level,s,c.id),concealed=isIncognito(level,s,c.id);
   el.style.setProperty('--car',concealed?'#626b68':SKILLS[c.skill].color);el.classList.toggle('is-incognito',!!concealed);
   el.classList.toggle('is-empty',!present);el.classList.toggle('is-blocker',c.id===highlight);el.classList.toggle('is-hint',c.id===hint);
   el.tabIndex=present&&c.id===focusId?0:-1;el.disabled=!present;el.setAttribute('aria-hidden',String(!present));
   el.setAttribute('aria-label',(concealed?'Hidden-color':SKILLS[c.skill].name)+' car, row '+(c.y+1)+', column '+(c.x+1)+', arrow '+c.dir+(by?', path blocked':', clear path'));
  }
  const front=level.queue[s.cursor];
  $('front').textContent=front?'Front · '+SKILLS[front].name:'Queue cleared';
  $('waiting').textContent=(level.queue.length-s.cursor)+' waiting';
  $('passengers').innerHTML=visiblePassengers(level,s).map((skill,i)=>'<li class="of-person" style="--car:'+SKILLS[skill].color+'" aria-label="Passenger '+(i+1)+': '+SKILLS[skill].name+'" title="'+SKILLS[skill].name+'">'+personArt(skill)+'</li>').join('');
  $('passengers').setAttribute('aria-label',front?'Front passenger needs '+SKILLS[front].name+(level.hiddenQueue?'. The rest of the queue is hidden.':'. Scroll to inspect the remaining queue.'):'Every passenger has boarded.');
  $('concealed').hidden=!level.hiddenQueue||s.cursor>=level.queue.length-1;
  $('passengers').classList.toggle('is-concealed',level.hiddenQueue);
  $('passengers').scrollLeft=0;
  $('bay-count').textContent=s.bay.filter(Boolean).length+' / '+level.slots;
  $('bay').innerHTML=s.bay.map((c,i)=>'<div class="of-slot'+(s.status==='lost'?' is-stuck':'')+'" data-slot="'+i+'" aria-label="Parking space '+(i+1)+': '+(c?SKILLS[level.cars[c.id-1].skill].name+', '+(2-c.left)+' of two seats filled':'empty')+'">'+(c?'<span class="of-parked" style="--car:'+SKILLS[level.cars[c.id-1].skill].color+'">'+carArt()+'</span><span class="of-seat-status" aria-hidden="true">'+[0,1].map(n=>'<i class="'+(n<2-c.left?'is-filled':'')+'"></i>').join('')+'</span>':'<span aria-hidden="true">Park</span>')+'</div>').join('');
  $('remaining').textContent=s.yard.length+' / '+level.cars.length+' cars in yard';
  $('score').textContent=attempt.mistakes+' blocked · '+attempt.hints+(attempt.hints===1?' hint':' hints');
  $('undo').textContent='Undo '+(3-attempt.undos);$('undo').disabled=attempt.timedOut||!attempt.history.length||attempt.undos>=3;
  $('loss-undo').disabled=$('undo').disabled;$('loss-undo').hidden=attempt.timedOut;$('hint').disabled=s.status!=='playing'||attempt.timedOut;
  $('loss').hidden=!lost;
  $('loss-title').textContent=s.status==='lost'?'Out of slots':'Time is up';
  if(lost)$('loss-text').textContent=s.status==='lost'?'All '+level.slots+' spaces are full, but the front passenger needs '+SKILLS[front].name+'.':'The countdown ended before everyone boarded.';
  paintClock();
  const won=s.status==='won'&&!effects.length;$('result').hidden=!won;
  if(won){
   const score=rating(attempt);$('stars').innerHTML=Array.from({length:3},(_,i)=>star.replace('<svg ','<svg data-empty="'+(i>=score)+'" ')).join('');
   $('stars').setAttribute('aria-label',score+' of 3 stars');$('result-title').textContent=index===LEVELS.length-1?'All '+LEVELS.length+' yards cleared!':'Everyone aboard';
   $('result-score').textContent=level.queue.length+' passengers · '+attempt.mistakes+' blocked taps · '+attempt.undos+' undos';
   $('real-note').textContent=level.note;$('real').href='/projects/agents-demo/?view=agents&agent='+level.agent;
   $('next').textContent=index===LEVELS.length-1?'Back to level 1':'Next level';
  }
 }
 function finishFlights(){
  if(raf)cancelAnimationFrame(raf);raf=0;effects.forEach(e=>e.el.remove());effects=[];started=null;draw();
  if(attempt.state.status==='won')$('next').focus({preventScroll:true});
  queueFrame();
 }
 function ghost(className,skill,html){
  const el=document.createElement('span');el.className='of-boarding-ghost '+className;el.setAttribute('aria-hidden','true');el.style.setProperty('--car',SKILLS[skill].color);el.innerHTML=html;el.style.opacity='0';root.append(el);return el;
 }
 function tick(now){
  raf=0;if(destroyed)return;
  if(checkClock())return;
  if(document.hidden||panel?.hidden){if(effects.length)finishFlights();return;}
  if(reduced.matches&&effects.length){finishFlights();return;}
  if(!effects.length){queueFrame();return;}
  started??=now;const elapsed=now-started;
  for(const e of effects){
   if(elapsed>=e.end){e.el.style.opacity='0';continue;}
   if(elapsed<e.begin){e.el.style.opacity='0';continue;}
   let x=e.to.x,y=e.to.y,opacity=1;
   if(e.type==='person'){
    const p=Math.min(1,(elapsed-e.begin)/150),ease=1-(1-p)**3;
    x=e.from.x+(e.to.x-e.from.x)*ease;y=e.from.y+(e.to.y-e.from.y)*ease-16*Math.sin(p*Math.PI);
   }else{
    const p=Math.min(1,elapsed/180),ease=1-(1-p)**3;
    x=e.from.x+(e.to.x-e.from.x)*ease;y=e.from.y+(e.to.y-e.from.y)*ease;
    if(e.depart&&elapsed>e.end-100){const exit=(elapsed-(e.end-100))/100;x+=60*exit;opacity=1-exit;}
   }
   e.el.style.transform='translate('+x+'px,'+y+'px)';e.el.style.opacity=String(opacity);
  }
  if(effects.some(e=>elapsed<e.end))queueFrame();else finishFlights();
 }
 function animateTurn(before,events,origin,queueOrigin){
  if(reduced.matches||document.hidden||panel?.hidden||attempt.state.status==='lost')return;
  const parked=events[0],boarding=events.filter(e=>e.type==='board'),departed=new Set(events.filter(e=>e.type==='depart').map(e=>e.id));
  const slots=[...$('bay').children].map(el=>{const r=el.getBoundingClientRect();return {x:r.x+r.width/2-24,y:r.y+r.height/2-24};});
  const ids=new Set([parked.id,...departed]);
  for(const id of ids){
   const slot=id===parked.id?parked.slot:before.bay.findIndex(c=>c?.id===id),skill=level.cars[id-1].skill;
   const times=boarding.flatMap((e,i)=>e.id===id?[180+i*150]:[]),depart=departed.has(id);
   effects.push({type:'car',el:ghost('of-car-ghost',skill,carArt()),from:id===parked.id?origin:slots[slot],to:slots[slot],begin:0,end:depart?Math.max(180,...times)+250:180,depart});
  }
  boarding.forEach((e,i)=>effects.push({type:'person',el:ghost('of-passenger-ghost',e.skill,personArt(e.skill)),from:queueOrigin,to:{x:slots[e.slot].x+12,y:slots[e.slot].y+9},begin:180+i*150,end:330+i*150}));
  queueFrame();
 }
 function tap(id){
  if(checkClock())return;
  if(attempt.state.status!=='playing'||!inYard(attempt.state,id))return;
  const turn=takeTurn(level,attempt,id);highlight=null;hint=null;
  if(turn.error){attempt=turn.attempt;highlight=turn.blockedBy??null;save();draw();announce(turn.error);if(attempt.timedOut){finishFlights();$('loss-retry').focus();}return;}
  finishFlights();
  const before=copyState(attempt.state),r=buttons[id-1].getBoundingClientRect(),q=$('passengers').getBoundingClientRect();
  attempt=turn.attempt;focusId=attempt.state.yard.find(n=>n>id)??attempt.state.yard[0]??null;
  save();draw();animateTurn(before,turn.events,{x:r.x,y:r.y},{x:q.x,y:q.y});draw();queueFrame();tone();
  announce(attempt.state.status==='won'?'Everyone aboard. Your stars are saved.':attempt.state.status==='lost'?$('loss-text').textContent:'Match the front color. Keep a parking space free.');
  if(attempt.state.status==='lost')$('loss-undo').disabled?$('loss-retry').focus():$('loss-undo').focus();
  else if(attempt.state.status==='won'&&!effects.length)$('next').focus({preventScroll:true});
  else if(focusId)buttons[focusId-1].focus({preventScroll:true});
 }
 function loadLevel(next,resume){
  finishFlights();index=next;level=LEVELS[index];attempt=resume??newAttempt(level);lastSecond=null;highlight=null;hint=null;focusId=attempt.state.yard[0]??null;
  $('levels').hidden=true;$('title').textContent=level.title;$('caption').textContent=level.caption;$('level').textContent=(index+1)+' / '+LEVELS.length;
  $('level').setAttribute('aria-label','Level '+(index+1)+' of '+LEVELS.length+'. Choose an unlocked level.');
  root.style.setProperty('--cols',level.cols);root.style.setProperty('--rows',level.rows);root.style.setProperty('--slots',level.slots);
  $('grid').setAttribute('aria-label',level.cols+' by '+level.rows+' packed yard. Arrow keys move focus; Enter or Space sends a car to parking.');
  $('grid').innerHTML=level.cars.map(c=>'<button class="of-car" type="button" data-car="'+c.id+'" style="--angle:'+({up:0,right:90,down:180,left:270})[c.dir]+'deg">'+carArt()+'</button>').join('');
  buttons=[...$('grid').children];buttons.forEach((el,i)=>el.addEventListener('click',()=>tap(i+1)));
  save();draw();closeTools();queueFrame();announce(attempt.timedOut?'Time is up.':resume?.actions.length?'Your queue and parking are restored.':level.caption);
 }
 function undo(){
  if(checkClock())return;
  const next=undoTurn(level,attempt);if(!next)return;
  finishFlights();attempt=next;highlight=null;hint=null;focusId=attempt.state.yard[0]??null;save();draw();closeTools();
  announce('Last move restored, including its passengers. '+(3-attempt.undos)+' undos left.');buttons[focusId-1]?.focus({preventScroll:true});
 }
 function levelMenu(){
  checkClock();
  finishFlights();const first=stars.findIndex(s=>!s),unlocked=first<0?LEVELS.length-1:first;
  $('level-list').innerHTML=LEVELS.map((l,i)=>'<button type="button" data-level="'+i+'" '+(i>unlocked?'disabled':'')+' aria-label="Level '+(i+1)+', '+l.title+', '+stars[i]+' of 3 stars"'+(i===index?' aria-current="step"':'')+'><strong>'+(i+1)+'</strong><span>'+l.cols+' × '+l.rows+'</span><span>'+stars[i]+'/3 stars</span></button>').join('');
  $('levels').hidden=false;draw();$('level-list').querySelector('[data-level="'+index+'"]').focus();
 }
 on($('undo'),'click',undo);on($('loss-undo'),'click',undo);
 on($('exit'),'click',()=>root.closest('.arcade-screen')?.querySelector('.screen-exit')?.click());
 for(const id of ['replay','again','loss-retry'])on($(id),'click',()=>loadLevel(index));
 on($('next'),'click',()=>{loadLevel((index+1)%LEVELS.length);buttons[focusId-1]?.focus({preventScroll:true});});
 on($('hint'),'click',()=>{
  if(checkClock())return;
  const advice=nextMoveHint(level,attempt.state);closeTools();
  if(!advice){announce('No complete route remains. Undo or retry this level.');return;}
  attempt=useHint(attempt);hint=advice.id;highlight=null;focusId=advice.id;save();draw();announce(advice.text);buttons[hint-1]?.focus({preventScroll:true});
 });
 on($('sound'),'click',()=>{sound=!sound;$('sound').textContent='Sound '+(sound?'on':'off');$('sound').setAttribute('aria-pressed',String(sound));tone();});
 on($('level'),'click',levelMenu);
 on($('close-levels'),'click',()=>{$('levels').hidden=true;draw();$('level').focus();});
 on($('level-list'),'click',e=>{const b=e.target.closest('[data-level]');if(b&&!b.disabled)loadLevel(Number(b.dataset.level));});
 on(root,'keydown',e=>{
  const overlay=['loss','levels','result'].map($).find(el=>!el.hidden);
  if(overlay){
   if(e.key==='Escape'&&overlay===$('levels')){e.preventDefault();e.stopPropagation();$('close-levels').click();}
   else if(e.key==='Tab'){const options=[...overlay.querySelectorAll('button:not(:disabled),a[href]')],at=options.indexOf(document.activeElement);e.preventDefault();options[(at+(e.shiftKey?-1:1)+options.length)%options.length]?.focus();}
   return;
  }
  const el=e.target.closest('[data-car]'),delta={ArrowUp:[0,-1],ArrowRight:[1,0],ArrowDown:[0,1],ArrowLeft:[-1,0]}[e.key];
  if(!el||!delta)return;e.preventDefault();const c=level.cars[Number(el.dataset.car)-1],[dx,dy]=delta;
  for(let x=c.x+dx,y=c.y+dy;x>=0&&x<level.cols&&y>=0&&y<level.rows;x+=dx,y+=dy){
   const id=y*level.cols+x+1;if(inYard(attempt.state,id)){focusId=id;draw();buttons[id-1].focus();break;}
  }
 });
 on(document,'visibilitychange',()=>{if(document.hidden)finishFlights();else{checkClock();queueFrame();}});
 on(reduced,'change',()=>{if(reduced.matches)finishFlights();});
 on(compact,'change',toolsMode);on(window,'resize',finishFlights);
 const visibility=panel?new MutationObserver(()=>{if(panel.hidden)finishFlights();else{checkClock();queueFrame();}}):null;visibility?.observe(panel,{attributes:true,attributeFilter:['hidden']});
 root.hidden=false;toolsMode();loadLevel(index,attempt);
 return {snapshot:()=>({level:index,state:copyState(attempt.state),stars:[...stars],mistakes:attempt.mistakes,hints:attempt.hints,undos:attempt.undos,pendingFrames:effects.length,timedOut:attempt.timedOut,deadline:attempt.deadline}),
 destroy:()=>{destroyed=true;finishFlights();cleanups.forEach(fn=>fn());visibility?.disconnect();audio?.close();}};
}
