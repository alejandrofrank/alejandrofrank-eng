import {SKILLS,LEVELS,initialState,copyState,inYard,blocker,legalMoves,move,rating} from './order-flow-model.mjs';

const svgNS='http://www.w3.org/2000/svg';
const face='<svg class="of-face" viewBox="0 0 32 16" aria-hidden="true"><path d="M8 4v3m16-3v3M12 12q4 3 8 0"/></svg>';
const arrow='<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 17V3m-5 5 5-5 5 5"/></svg>';
const star='<svg viewBox="0 0 32 32" aria-hidden="true"><path d="m16 3 4 8 9 1-6.5 6.5L24 28l-8-4.5L8 28l1.5-9.5L3 12l9-1z"/></svg>';
export function initOrderFlowGame(){
 const root=document.getElementById('order-flow-game');if(!root)return;
 const $=id=>document.getElementById('of-'+id);
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 let levelIndex=0,level=LEVELS[0],state,shown,history=[],moves=0,undos=0,sound=false,audio;
 let buttons=[],tokens=[],geometry={yard:[],bay:[],size:56,width:360},raf=0,frames=[],frameAt=-1,startedAt=0,step=80;
 let beltPath,beltLabel,blockedFocus=null;
 const panel=root.closest('[data-station-panel]');
 function announce(text){$('message').textContent=text;}
 function tone(){
  if(!sound)return;
  try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;audio??=new AC();if(audio.state==='suspended')audio.resume().catch(()=>{});const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.setValueAtTime(440,audio.currentTime);o.frequency.exponentialRampToValueAtTime(660,audio.currentTime+.08);g.gain.setValueAtTime(.035,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.1);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+.11);}catch{/* Sound is optional. */}
 }
 function stopFrames(){if(raf)cancelAnimationFrame(raf);raf=0;frames=[];}
 function flush(){stopFrames();$('bots').querySelector('.of-hop')?.remove();if(state)draw(state);}
 function stats(){
  root.dataset.status=state.status;root.dataset.level=String(levelIndex+1);root.dataset.moves=String(moves);root.dataset.front=String(state.front);
  $('moves').textContent=moves+' moves · target '+level.par;
  $('undo').disabled=history.length===0;
  $('message').dataset.loss=String(state.status==='lost');
  $('result').hidden=state.status!=='won';
  $('work').inert=state.status==='won';
  if(state.status==='lost')announce('Out of slots: no parked bot can serve the front '+SKILLS[level.queue[state.front]].name+' order — Undo to make room.');
  else if(state.status==='won'){
   const stars=rating(level,moves,undos);$('stars').innerHTML=Array.from({length:3},(_,i)=>star.replace('<svg ','<svg data-empty="'+(i>=stars)+'" ')).join('');$('stars').setAttribute('aria-label',stars+' of 3 stars');
   $('result-title').textContent=levelIndex===LEVELS.length-1?'All '+LEVELS.length+' cleared!':'All clear!';
   $('result-score').textContent=moves+' moves · '+undos+' undos · '+level.par+' moves for 3 stars';
   $('real-note').textContent=level.note;$('real').href='/projects/agents-demo/?view=agents&agent='+level.agent;
   $('next').textContent=levelIndex===LEVELS.length-1?'Play from level 1':'Next level';
   announce('Level '+(levelIndex+1)+' cleared. '+stars+' stars.');
  }
 }
 function queuePoint(index){
  const n=Math.ceil(level.queue.length/2),pad=22,w=geometry.width-2*pad,spacing=Math.min(44,w/Math.max(1,n-1));
  const start=(geometry.width-spacing*(n-1))/2;
  return index<n?{x:start+index*spacing,y:62}:{x:start+(2*n-1-index)*spacing,y:20};
 }
 function draw(s,event){
  shown=s;
  $('orders').textContent=(level.queue.length-s.front)+' left';$('bay-count').textContent=s.bay.filter(Boolean).length+' / '+level.slots+' slots';
  const current=level.queue[s.front];beltLabel.textContent=current?'Pickup · '+SKILLS[current].name+' first':'Queue clear';
  tokens.forEach((el,i)=>{const visible=i>=s.front;el.style.opacity=visible?'1':'0';el.querySelector('circle').setAttribute('stroke',i===s.front?'#243e35':'#fffdf4');if(visible){const p=queuePoint(i-s.front);el.setAttribute('transform','translate('+p.x+' '+p.y+')');}});
  Array.from($('slots').children).forEach(el=>el.classList.toggle('is-stuck',state.status==='lost'));
  for(const b of level.bots){
   const el=buttons[b.id-1],inGrid=inYard(s,b.id),slot=s.bay.findIndex(p=>p?.id===b.id),parked=slot>=0?s.bay[slot]:null;
   const leaving=event?.kind==='leave'&&event.id===b.id;
   const p=inGrid?geometry.yard[b.y*level.cols+b.x]:geometry.bay[slot>=0?slot:event?.slot??0];
   el.style.width=geometry.size+'px';el.style.height=geometry.size+'px';
   if(p)el.style.transform='translate('+p.x+'px,'+(p.y-(leaving?16:0))+'px) scale('+(leaving?.8:1)+')';
   el.style.opacity=inGrid||parked?'1':'0';el.style.pointerEvents=inGrid?'auto':'none';
   el.tabIndex=inGrid&&state.status==='playing'?0:-1;
   el.setAttribute('aria-hidden',String(!inGrid&&!parked));
   el.dataset.bay=String(!!parked);el.querySelector('.of-arrow').hidden=!inGrid;
   el.querySelector('.of-count strong').textContent=String(parked?.remaining??b.capacity);
   const by=blocker(level,state,b.id),available=inYard(state,b.id)&&!by&&state.status==='playing';
   el.setAttribute('aria-disabled',String(!available));el.classList.toggle('is-blocker',b.id===blockedFocus);
   el.setAttribute('aria-label',SKILLS[b.skill].name+' bot '+b.id+', '+(parked?.remaining??b.capacity)+' orders, exit '+b.dir+(by?', blocked by bot '+by:inGrid?', clear exit':', parked'));
  }
  if(event?.kind==='serve'&&!reduced.matches){
   $('bots').querySelector('.of-hop')?.remove();const hop=document.createElement('span'),p=geometry.bay[event.slot],skill=SKILLS[level.bots[event.id-1].skill];
   hop.className='of-hop';hop.setAttribute('aria-hidden','true');hop.textContent=skill.letter;hop.style.cssText='--bot:'+skill.color+';left:'+(p?.x??0)+'px;top:'+(p?.y??0)+'px';$('bots').append(hop);
  }
 }
 function tick(now){
  raf=0;if(document.hidden||panel?.hidden||reduced.matches){flush();return;}
  // A callback's frame timestamp can precede an input handled in that frame.
  const at=Math.max(0,Math.floor((now-startedAt)/step));
  if(at>=frames.length){flush();return;}
  if(at!==frameAt){frameAt=at;const event=frames[at];draw(event.state,event);}
  raf=requestAnimationFrame(tick);
 }
 function playTurn(id){
  flush();blockedFocus=null;
  const result=move(level,state,id);
  if(result.error){blockedFocus=result.blockedBy??null;draw(state);announce(result.error);return;}
  history.push(copyState(state));state=result.state;moves++;tone();
  announce(state.front===level.queue.length?'Orders served.':result.state.bay.some(b=>b?.id===id)?SKILLS[level.bots[id-1].skill].name+' parked. The front now needs '+SKILLS[level.queue[state.front]].name+'.':'Bot finished. Choose the next clear arrow.');
  stats();
  // State commits synchronously. A second tap or Undo skips the visual trace,
  // so a slow frame can never block the next decision.
  if(reduced.matches||state.status!=='playing'||document.hidden){draw(state);}
  else{frames=result.events;frameAt=0;step=Math.min(100,650/frames.length);startedAt=performance.now();draw(frames[0].state,frames[0]);raf=requestAnimationFrame(tick);}
  const next=legalMoves(level,state)[0];
  if(state.status==='won')$('next').focus({preventScroll:true});
  else if(state.status==='lost')$('undo').focus({preventScroll:true});
  else if(document.activeElement===buttons[id-1]&&next)buttons[next-1].focus({preventScroll:true});
 }
 function measure(){
  flush();const base=$('work').getBoundingClientRect();if(!base.width)return;
  // The cabinet scales briefly while opening. Convert viewport rectangles back
  // to board coordinates so that opening animation cannot offset the bots.
  const sx=base.width/($('work').clientWidth||base.width),sy=base.height/($('work').clientHeight||base.height);
  const local=el=>{const r=el.getBoundingClientRect();return {left:(r.left-base.left)/sx,top:(r.top-base.top)/sy,width:r.width/sx,height:r.height/sy};};
  const cells=Array.from($('cells').children).map(local),slots=Array.from($('slots').children).map(local);
  const size=Math.max(44,Math.min(68,...cells.map(r=>Math.min(r.width-10,r.height-8)),...slots.map(r=>Math.min(r.width-8,r.height-6))));
  const center=r=>({x:r.left+(r.width-size)/2,y:r.top+(r.height-size)/2});
  geometry={size,yard:cells.map(center),bay:slots.map(center),width:$('belt').clientWidth||360};
  $('belt').setAttribute('viewBox','0 0 '+geometry.width+' 90');
  const first=queuePoint(0),last=queuePoint(Math.ceil(level.queue.length/2)-1),right=Math.min(last.x+12,geometry.width-20),bend=Math.min(right+21,geometry.width-8);
  beltPath.setAttribute('d','M '+first.x+' 20 H '+right+' Q '+bend+' 20 '+bend+' 41 Q '+bend+' 62 '+right+' 62 H '+first.x);
  beltLabel.setAttribute('x',first.x);beltLabel.setAttribute('y','88');draw(state);
 }
 function loadLevel(index){
  stopFrames();levelIndex=index;level=LEVELS[index];state=initialState(level);shown=state;history=[];moves=0;undos=0;blockedFocus=null;
  $('title').textContent=level.title;$('caption').textContent=level.caption;$('level').textContent=(index+1)+' / '+LEVELS.length;
  $('slots').style.gridTemplateColumns='repeat('+level.slots+',1fr)';$('slots').innerHTML=Array.from({length:level.slots},(_,i)=>'<div class="of-slot" aria-label="Bay slot '+(i+1)+'"></div>').join('');
  $('cells').style.gridTemplateColumns='repeat('+level.cols+',1fr)';$('cells').style.gridTemplateRows='repeat('+level.rows+',1fr)';$('cells').innerHTML=Array.from({length:level.cols*level.rows},()=>'<div class="of-cell" aria-hidden="true"></div>').join('');
  $('bots').innerHTML=level.bots.map(b=>'<button type="button" class="of-bot" data-bot="'+b.id+'" style="--bot:'+SKILLS[b.skill].color+'">'+face+'<span class="of-count"><span>'+SKILLS[b.skill].letter+'</span><strong>'+b.capacity+'</strong></span><span class="of-arrow" style="rotate:'+({up:0,right:90,down:180,left:270})[b.dir]+'deg">'+arrow+'</span></button>').join('');
  buttons=Array.from($('bots').children);buttons.forEach((el,i)=>el.addEventListener('click',()=>playTurn(i+1)));
  $('belt').replaceChildren();beltPath=document.createElementNS(svgNS,'path');beltPath.setAttribute('fill','none');beltPath.setAttribute('stroke','#d8dccd');beltPath.setAttribute('stroke-width','30');beltPath.setAttribute('stroke-linecap','round');$('belt').append(beltPath);
  tokens=level.queue.map(skill=>{const g=document.createElementNS(svgNS,'g');g.innerHTML='<circle r="13" fill="'+SKILLS[skill].color+'" stroke="#fffdf4" stroke-width="2"/><text text-anchor="middle" dy="5" fill="#fffdf4" font-size="14" font-weight="700">'+SKILLS[skill].letter+'</text>';g.style.transition='transform 100ms ease-out, opacity 100ms ease-out';$('belt').append(g);return g;});
  beltLabel=document.createElementNS(svgNS,'text');beltLabel.setAttribute('font-size','14');beltLabel.setAttribute('font-weight','700');beltLabel.setAttribute('fill','#243e35');$('belt').append(beltLabel);
  const unlockedSkills=new Set(LEVELS.slice(0,index+1).flatMap(l=>l.bots.map(b=>b.skill)));
  $('legend').innerHTML=Object.entries(SKILLS).filter(([key])=>unlockedSkills.has(key)).map(([,s])=>'<span><b style="--bot:'+s.color+'">'+s.letter+'</b>'+s.name+'</span>').join('');
  announce('Tap a bot with a clear arrow. Only the front order can be served.');stats();measure();draw(state);
 }
 $('undo').addEventListener('click',()=>{if(!history.length)return;stopFrames();state=history.pop();undos++;blockedFocus=null;stats();draw(state);announce('Move undone. Try a different clear arrow.');});
 $('replay').addEventListener('click',()=>loadLevel(levelIndex));$('again').addEventListener('click',()=>loadLevel(levelIndex));
 $('next').addEventListener('click',()=>{loadLevel((levelIndex+1)%LEVELS.length);buttons[legalMoves(level,state)[0]-1]?.focus({preventScroll:true});});
 $('sound').addEventListener('click',()=>{sound=!sound;$('sound').textContent='Sound '+(sound?'on':'off');$('sound').setAttribute('aria-pressed',String(sound));tone();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)flush();});reduced.addEventListener('change',flush);
 root.hidden=false;loadLevel(0);new ResizeObserver(measure).observe($('work'));
 if(panel)new MutationObserver(()=>{if(panel.hidden)flush();else measure();}).observe(panel,{attributes:true,attributeFilter:['hidden']});
 // Read-only inspection for tests and diagnostics; no alternate gameplay path.
 return {snapshot:()=>({level:levelIndex,state:copyState(state),moves,undos,pendingFrames:frames.length}),destroy:()=>{stopFrames();audio?.close();}};
}
