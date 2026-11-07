import {LEVELS,SKILLS,DIRECTIONS,initialState,copyState,inYard,blocker,legalMoves,rating} from './order-flow-model.mjs';
import {SAVE_KEY,newAttempt,takeTurn,undoTurn,useHint,restoreProgress,serializeProgress} from './order-flow-progress.mjs';
import {inspectPosition,nextMoveHint} from './order-flow-proof.mjs';
const carArt='<svg viewBox="0 0 64 64" aria-hidden="true"><path class="of-wheel" d="M7 18v10m0 14v7M57 18v10m0 14v7"/><rect class="of-seat" x="20" y="47" width="9" height="8" rx="2"/><rect class="of-seat" x="35" y="47" width="9" height="8" rx="2"/><path class="of-direction" d="M32 43V13m-12 12 12-12 12 12"/></svg>';
const star='<svg viewBox="0 0 32 32" aria-hidden="true"><path d="m16 3 4 8 9 1-6.5 6.5L24 28l-8-4.5L8 28l1.5-9.5L3 12l9-1z"/></svg>';
export function initOrderFlowGame(){
 const root=document.getElementById('order-flow-game');if(!root)return;
 const $=id=>document.getElementById('of-'+id),panel=root.closest('[data-station-panel]'),reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 let raw;try{raw=window.localStorage.getItem(SAVE_KEY);}catch{}
 let {level:index,stars,attempt}=restoreProgress(raw),level=LEVELS[index],buttons=[],focusId=1,highlight=null,hint=null,sound=false,audio,raf=0,destroyed=false;
 const flights=new Map(),cleanups=[];
 const on=(el,event,fn)=>{el.addEventListener(event,fn);cleanups.push(()=>el.removeEventListener(event,fn));};
 const announce=text=>{$('message').textContent=text;};
 function save(){
  if(attempt.state.status==='won')stars[index]=Math.max(stars[index],rating(attempt));
  try{window.localStorage.setItem(SAVE_KEY,serializeProgress(index,stars,attempt));$('saved').textContent='Progress saved on this device';}
  catch{$('saved').textContent='Progress cannot be saved in this browser.';}
 }
 function tone(){
  if(!sound)return;
  try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;audio??=new AC();audio.resume().catch(()=>{});const o=audio.createOscillator(),g=audio.createGain();o.frequency.value=500;g.gain.setValueAtTime(.02,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.08);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+.09);}catch{}
 }
 function controls(){
  $('remaining').textContent=attempt.state.yard.length+' / '+level.cars.length+' cars';
  $('score').textContent=attempt.mistakes+' blocked · '+attempt.hints+(attempt.hints===1?' hint':' hints');
  $('undo').textContent='Undo '+(3-attempt.undos);$('undo').disabled=!attempt.history.length||attempt.undos>=3;
  $('hint').disabled=attempt.state.status!=='playing';
 }
 function draw(){
  const s=attempt.state;root.dataset.level=String(index+1);root.dataset.status=s.status;
  $('grid').inert=s.status==='won';
  for(const c of level.cars){
   const el=buttons[c.id-1],present=inYard(s,c.id),by=blocker(level,s,c.id);
   el.classList.toggle('is-empty',!present&&!flights.has(c.id));
   el.classList.toggle('is-leaving',flights.has(c.id));el.classList.toggle('is-blocker',c.id===highlight);el.classList.toggle('is-hint',c.id===hint);
   el.tabIndex=present&&c.id===focusId?0:-1;el.disabled=!present;el.setAttribute('aria-hidden',String(!present));
   el.setAttribute('aria-label',SKILLS[c.skill].name+' car, row '+(c.y+1)+', column '+(c.x+1)+', arrow '+c.dir+(by?', path blocked':', clear path'));
  }
  controls();
  const won=s.status==='won'&&!flights.size;$('result').hidden=!won;
  if(won){
   const score=rating(attempt);$('stars').innerHTML=Array.from({length:3},(_,i)=>star.replace('<svg ','<svg data-empty="'+(i>=score)+'" ')).join('');
   $('stars').setAttribute('aria-label',score+' of 3 stars');$('result-title').textContent=index===LEVELS.length-1?'All ten yards cleared!':'Yard cleared';
   $('result-score').textContent=level.cars.length+' cars · '+attempt.mistakes+' blocked taps · '+attempt.undos+' undos';
   $('real-note').textContent=level.note;$('real').href='/projects/agents-demo/?view=agents&agent='+level.agent;
   $('next').textContent=index===LEVELS.length-1?'Back to level 1':'Next level';
  }
 }
 function finishFlights(){
  if(raf)cancelAnimationFrame(raf);raf=0;
  for(const [id] of flights){buttons[id-1].style.transform='';buttons[id-1].style.opacity='';}
  flights.clear();if(!buttons.length)return;draw();
  if(attempt.state.status==='won'){$('next').focus({preventScroll:true});announce('Yard cleared. Your stars are saved.');}
 }
 function tick(now){
  raf=0;if(destroyed)return;
  if(document.hidden||panel?.hidden||reduced.matches){finishFlights();return;}
  for(const [id,f] of flights){
   f.start??=now;const t=Math.min(1,(now-f.start)/180),ease=1-(1-t)**3,el=buttons[id-1];
   el.style.transform='translate('+f.dx*ease+'px,'+f.dy*ease+'px)';el.style.opacity=String(1-Math.max(0,(t-.65)/.35));
   if(t===1){el.style.transform='';el.style.opacity='';flights.delete(id);el.classList.remove('is-leaving');el.classList.add('is-empty');}
  }
  if(flights.size)raf=requestAnimationFrame(tick);else finishFlights();
 }
 function fly(id){
  if(reduced.matches||document.hidden||panel?.hidden)return;
  const el=buttons[id-1],c=level.cars[id-1],r=el.getBoundingClientRect(),g=$('grid').getBoundingClientRect(),[dx,dy]=DIRECTIONS[c.dir];
  const distance=dx>0?g.right-r.left+8:dx<0?r.right-g.left+8:dy>0?g.bottom-r.top+8:r.bottom-g.top+8;
  flights.set(id,{dx:dx*distance,dy:dy*distance,start:null});
  if(!raf)raf=requestAnimationFrame(tick);
 }
 function tap(id){
  if(attempt.state.status!=='playing'||!inYard(attempt.state,id))return;
  const turn=takeTurn(level,attempt,id);attempt=turn.attempt;highlight=null;hint=null;
  if(turn.error){highlight=turn.blockedBy??null;save();draw();announce(turn.error);return;}
  fly(id);focusId=attempt.state.yard.find(n=>n>id)??attempt.state.yard[0]??null;
  save();draw();tone();
  announce(attempt.state.yard.length?'Car cleared. Follow the next open arrow.':'Yard cleared. Your stars are saved.');
  if(attempt.state.status==='won'&&!flights.size)$('next').focus({preventScroll:true});
  else if(focusId)buttons[focusId-1].focus({preventScroll:true});
 }
 function loadLevel(next,resume){
  finishFlights();index=next;level=LEVELS[index];attempt=resume??newAttempt(level);highlight=null;hint=null;focusId=attempt.state.yard[0]??null;
  $('levels').hidden=true;$('title').textContent=level.title;$('caption').textContent=level.caption;$('level').textContent=(index+1)+' / '+LEVELS.length;
  $('level').setAttribute('aria-label','Level '+(index+1)+' of '+LEVELS.length+'. Choose an unlocked level.');
  root.style.setProperty('--cols',level.cols);root.style.setProperty('--rows',level.rows);
  $('grid').setAttribute('aria-label',level.cols+' by '+level.rows+' packed yard. Use arrow keys to move between cars; Enter or Space to release one.');
  $('grid').innerHTML=level.cars.map(c=>'<button class="of-car" type="button" data-car="'+c.id+'" style="--car:'+SKILLS[c.skill].color+';--angle:'+({up:0,right:90,down:180,left:270})[c.dir]+'deg">'+carArt+'</button>').join('');
  buttons=[...$('grid').children];
  buttons.forEach((el,i)=>el.addEventListener('click',()=>tap(i+1)));
  save();draw();announce(resume?.actions.length?'Your saved yard is ready.':'Every car seats two. Tap a car whose arrow is clear.');
 }
 function undo(){
  const next=undoTurn(level,attempt);if(!next)return;
  finishFlights();attempt=next;highlight=null;hint=null;focusId=attempt.state.yard[0]??null;save();draw();
  announce('Last car restored. '+(3-attempt.undos)+' undos left.');buttons[focusId-1]?.focus({preventScroll:true});
 }
 function levelMenu(){
  finishFlights();const first=stars.findIndex(s=>!s),unlocked=first<0?LEVELS.length-1:first;
  $('level-list').innerHTML=LEVELS.map((l,i)=>'<button type="button" data-level="'+i+'" '+(i>unlocked?'disabled':'')+' aria-label="Level '+(i+1)+', '+l.title+', '+stars[i]+' of 3 stars"'+(i===index?' aria-current="step"':'')+'><strong>'+(i+1)+'</strong><span>'+l.cols+' × '+l.rows+'</span><span>'+stars[i]+'/3 stars</span></button>').join('');
  $('levels').hidden=false;$('grid').inert=true;$('level-list').querySelector('[data-level="'+index+'"]').focus();
 }
 on($('undo'),'click',undo);
 on($('exit'),'click',()=>root.closest('.arcade-screen')?.querySelector('.screen-exit')?.click());
 for(const id of ['replay','again'])on($(id),'click',()=>loadLevel(index));
 on($('next'),'click',()=>{loadLevel((index+1)%LEVELS.length);buttons[focusId-1]?.focus({preventScroll:true});});
 on($('hint'),'click',()=>{
  const advice=nextMoveHint(level,attempt.state);if(!advice){announce('This board could not be verified. Retry the level.');return;}
  attempt=useHint(attempt);hint=advice.id;highlight=null;focusId=advice.id;save();draw();announce(advice.text);buttons[hint-1]?.focus({preventScroll:true});
 });
 on($('sound'),'click',()=>{sound=!sound;$('sound').textContent='Sound '+(sound?'on':'off');$('sound').setAttribute('aria-pressed',String(sound));tone();});
 on($('level'),'click',levelMenu);
 on($('close-levels'),'click',()=>{$('levels').hidden=true;draw();$('level').focus();});
 on($('level-list'),'click',e=>{const b=e.target.closest('[data-level]');if(b&&!b.disabled)loadLevel(Number(b.dataset.level));});
 on(root,'keydown',e=>{
  if(!$('levels').hidden){
   if(e.key==='Escape'){e.preventDefault();e.stopPropagation();$('close-levels').click();}
   else if(e.key==='Tab'){const options=[...$('levels').querySelectorAll('button:not(:disabled)')],at=options.indexOf(document.activeElement);e.preventDefault();options[(at+(e.shiftKey?-1:1)+options.length)%options.length]?.focus();}
   return;
  }
  const el=e.target.closest('[data-car]'),direction={ArrowUp:'up',ArrowRight:'right',ArrowDown:'down',ArrowLeft:'left'}[e.key];
  if(!el||!direction)return;e.preventDefault();
  const c=level.cars[Number(el.dataset.car)-1],[dx,dy]=DIRECTIONS[direction];
  for(let x=c.x+dx,y=c.y+dy;x>=0&&x<level.cols&&y>=0&&y<level.rows;x+=dx,y+=dy){
   const id=y*level.cols+x+1;if(inYard(attempt.state,id)){focusId=id;draw();buttons[id-1].focus();break;}
  }
 });
 on(document,'visibilitychange',()=>{if(document.hidden)finishFlights();});
 on(reduced,'change',()=>{if(reduced.matches)finishFlights();});
 const visibility=panel?new MutationObserver(()=>{if(panel.hidden)finishFlights();}):null;visibility?.observe(panel,{attributes:true,attributeFilter:['hidden']});
 root.hidden=false;loadLevel(index,attempt);
 return {snapshot:()=>({level:index,state:copyState(attempt.state),stars:[...stars],mistakes:attempt.mistakes,hints:attempt.hints,undos:attempt.undos,pendingFrames:flights.size,proof:inspectPosition(level,attempt.state)}),
 destroy:()=>{destroyed=true;finishFlights();cleanups.forEach(fn=>fn());visibility?.disconnect();audio?.close();}};
}
