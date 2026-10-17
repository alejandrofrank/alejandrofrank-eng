import test from 'node:test';
import assert from 'node:assert/strict';
import { render } from '../public/play/image-engine/core.mjs';
import { SHUFFLE_LEVELS,createShuffleSession,pictureSource,pictureSettings,renderPicture,tilePixels,inspectBoard } from '../public/play/games/palette-model.mjs';

function solve(game){
  for(let i=0;i<game.state.board.length;i++){
    let s=game.state;if(s.won)break;
    if(s.board[i].id!==i){const from=s.board.findIndex(tile=>tile.id===i);game.choose(i);game.choose(from);}
  }
  for(let i=0;i<game.state.board.length;i++){
    let s=game.state;if(s.won)break;
    if(s.board[i].turns){game.choose(i);while(game.state.board[i].turns&&!game.state.won)game.rotate();if(game.state.selected!==null)game.choose(i);}
  }
}
test('five distinct pictures start scrambled and solve automatically within their move goals',()=>{
  const game=createShuffleSession();
  for(let i=0;i<SHUFFLE_LEVELS.length;i++){
    assert.equal(game.state.index,i);assert.equal(game.state.won,false);solve(game);
    assert.equal(game.state.won,true);assert.ok(game.state.moves<=game.state.goal);assert.equal(game.state.stars,3);
    assert.equal(game.next(),i<4);
  }
  assert.equal(game.state.cleared.length,5);
});
test('reshuffles preserve every piece, stay solvable and leave progress honest',()=>{
  const game=createShuffleSession();game.select(4);assert.deepEqual(game.state.cleared,[]);
  let previous=JSON.stringify(game.state.board);
  for(let seed=0;seed<12;seed++){
    game.shuffle();const s=game.state;
    assert.notEqual(JSON.stringify(s.board),previous);previous=JSON.stringify(s.board);
    assert.equal(s.won,false);assert.deepEqual(s.board.map(t=>t.id).sort((a,b)=>a-b),Array.from({length:16},(_,i)=>i));
    solve(game);assert.equal(game.state.won,true);assert.ok(game.state.moves<=game.state.goal);
  }
});
test('selection is free, swaps and rotations cost one move, undo restores exact play state',()=>{
  const game=createShuffleSession();const start=game.state.board;
  assert.equal(game.choose(-1),false);assert.equal(game.choose(.5),false);assert.equal(game.rotate(),false);assert.equal(game.next(),false);
  game.choose(0);assert.equal(game.state.moves,0);game.choose(0);assert.equal(game.state.selected,null);
  game.choose(0);game.choose(1);assert.equal(game.state.moves,1);game.undo();assert.deepEqual(game.state.board,start);assert.equal(game.state.moves,0);
  game.select(2);game.choose(0);const before=game.state;game.rotate();assert.equal(game.state.moves,1);game.undo();assert.deepEqual(game.state.board,before.board);assert.equal(game.state.selected,0);
  const snapshot=game.state;snapshot.board[0].id=99;snapshot.image.data.fill(0);assert.notEqual(game.state.board[0].id,99);
  game.reset();assert.equal(game.state.moves,0);assert.equal(game.state.canUndo,false);
  game.restart();assert.deepEqual(game.state.cleared,[]);assert.throws(()=>game.select(99),RangeError);
});
test('going over the goal never locks the player out and solved boards remain stable',()=>{
  const game=createShuffleSession();for(let i=0;i<10;i++){game.choose(0);game.choose(1);}
  assert.ok(game.state.moves>game.state.goal);solve(game);assert.equal(game.state.won,true);assert.equal(game.state.stars,1);assert.equal(game.choose(0),false);
  game.reset();solve(game);assert.equal(game.state.awards[0],3);
});
test('the unchanged renderer produces every puzzle and tile pixels reassemble without loss',()=>{
  SHUFFLE_LEVELS.forEach((level,i)=>{
    const picture=renderPicture(i),expected=render(pictureSource(i),pictureSettings(level));assert.deepEqual(picture.data,expected.data);assert.equal(picture.width,48);
    const board=Array.from({length:level.grid**2},(_,id)=>({id,turns:0}));assert.equal(inspectBoard(picture,level.grid,board).won,true);
    const tile=tilePixels(picture,level.grid,{id:0,turns:0});assert.equal(tile.width,48/level.grid);
    assert.deepEqual(tilePixels(picture,level.grid,{id:0,turns:4}).data,tile.data);
    const palette=new Set(level.palette.map(hex=>hex.toLowerCase()));for(let p=0;p<picture.data.length;p+=4){const color='#'+[...picture.data.slice(p,p+3)].map(n=>n.toString(16).padStart(2,'0')).join('');assert.ok(palette.has(color));}
  });
});
test('a visually identical tile is accepted, while a pixel difference is not',()=>{
  const uniform={width:4,height:4,data:new Uint8ClampedArray(64).fill(255)},board=[{id:1,turns:1},{id:0,turns:2},{id:3,turns:3},{id:2,turns:0}];
  assert.equal(inspectBoard(uniform,2,board).won,true);uniform.data[0]=0;assert.equal(inspectBoard(uniform,2,board).won,false);
});
