import { SHUFFLE_LEVELS, createShuffleSession, tilePixels, pictureSource } from './palette-model.mjs';

export function initPaletteGame() {
  const root=document.getElementById('palette-game');if(!root||root.dataset.initialized)return;
  root.dataset.initialized='true';const game=createShuffleSession(),q=id=>root.querySelector(`#pl-${id}`),board=q('board');
  const draw=(canvas,image)=>{canvas.width=image.width;canvas.height=image.height;canvas.getContext('2d').putImageData(new ImageData(image.data,image.width,image.height),0,0);};
  q('level').innerHTML=SHUFFLE_LEVELS.map((level,i)=>`<option value="${i}">${i+1} · ${level.title}</option>`).join('');
  function update(){
    const s=game.state;q('moves').textContent=String(s.moves);q('goal').textContent=String(s.goal);q('placed').textContent=`${s.correct} / ${s.board.length}`;q('completed').textContent=`${s.cleared.length} / 5 pictures`;
    root.dataset.won=String(s.won);q('undo').disabled=!s.canUndo;q('rotate').hidden=!s.level.turned;q('rotate').disabled=s.selected===null||s.won;
    q('next').hidden=!s.won||s.index===4;q('replay').hidden=!s.won||s.index!==4;
    const status=q('status');status.dataset.outcome=s.won?'won':'playing';
    status.textContent=s.won?`${'★'.repeat(s.stars)} Picture restored in ${s.moves} moves. ${s.cleared.length===5?'All five complete!':'Ready for the next picture.'}`:s.selected===null?`Tap two tiles to swap them.${s.level.turned?' Select a tile and use ↻ Turn if it is sideways.':''}`:`Tile selected. Tap another to swap${s.level.turned?', or ↻ Turn to rotate it':''}. Tap it again to cancel.`;
    board.querySelectorAll('button').forEach((button,i)=>{draw(button.querySelector('canvas'),tilePixels(s.image,s.level.grid,s.board[i]));button.setAttribute('aria-pressed',String(s.selected===i));button.disabled=s.won;});
  }
  function afterMove(){update();if(game.state.won)(game.state.index<4?q('next'):q('replay')).focus({preventScroll:true});}
  function load(focus=false){
    const s=game.state;q('level').value=String(s.index);q('title').textContent=s.level.title;
    q('brief').textContent=s.level.turned?'Same picture puzzle. A few pieces are sideways this time.':'Put the picture back together. Tap one tile, then another to swap.';
    board.style.setProperty('--grid',s.level.grid);board.setAttribute('aria-label',`${s.level.grid} by ${s.level.grid} picture. Arrow keys move focus; Enter selects a tile.`);
    board.replaceChildren(...s.board.map((_,i)=>{const button=document.createElement('button');button.type='button';button.dataset.tile=String(i);button.setAttribute('aria-label',`Tile row ${Math.floor(i/s.level.grid)+1}, column ${i%s.level.grid+1}`);const canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');button.append(canvas);button.addEventListener('click',()=>{game.choose(i);afterMove();});return button;}));
    draw(q('target'),s.image);draw(q('source'),pictureSource(s.index));q('evidence').textContent=`The repository renderer turns the original 96 × 96 illustration into these 48 × 48 pixels using ${s.level.palette.length} colors${s.level.method==='pixels'?'':s.level.method==='floyd'?' and error diffusion':' and ordered dithering'}. The game then scrambles the result. A win compares the actual tile pixels, so visually identical pieces are interchangeable.`;
    update();if(focus){q('title').focus({preventScroll:true});q('title').scrollIntoView?.({block:'start'});}
  }
  board.addEventListener('keydown',event=>{
    const tile=event.target.closest('[data-tile]');if(!tile)return;const s=game.state,i=Number(tile.dataset.tile),delta={ArrowLeft:-1,ArrowRight:1,ArrowUp:-s.level.grid,ArrowDown:s.level.grid}[event.key];
    if(delta!==undefined){event.preventDefault();const next=i+delta;if(next>=0&&next<s.board.length&&!(event.key==='ArrowLeft'&&i%s.level.grid===0)&&!(event.key==='ArrowRight'&&i%s.level.grid===s.level.grid-1))board.querySelector(`[data-tile="${next}"]`).focus();}
    if(event.key.toLowerCase()==='r'&&s.level.turned){event.preventDefault();if(s.selected===null)game.choose(i);game.rotate();afterMove();}
  });
  q('rotate').addEventListener('click',()=>{const selected=game.state.selected;game.rotate();afterMove();if(!game.state.won)board.querySelector(`[data-tile="${selected}"]`)?.focus({preventScroll:true});});
  q('undo').addEventListener('click',()=>{game.undo();update();if(q('undo').disabled)board.querySelector('button').focus({preventScroll:true});});
  q('reset').addEventListener('click',()=>{game.reset();load(true);});q('shuffle').addEventListener('click',()=>{game.shuffle();load(true);});
  q('next').addEventListener('click',()=>{if(game.next())load(true);});q('replay').addEventListener('click',()=>{game.restart();load(true);});
  q('level').addEventListener('change',()=>{game.select(Number(q('level').value));load(true);});
  load();root.hidden=false;
}
