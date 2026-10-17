import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { render } from '../public/play/image-engine/core.mjs';
import {
  WORKSHOP_LEVELS, WORKSHOP_INK, WORKSHOP_PALETTE, createWorkshopSession,
  workshopSource, workshopRecipe, applyWorkshopTool, compareWorkshopImages, toolUnavailable,
} from '../public/play/games/palette-model.mjs';

test('all five authored jobs are solvable with genuine geometry and renderer operations', () => {
  const game = createWorkshopSession();
  for (let index=0;index<WORKSHOP_LEVELS.length;index++) {
    const level = WORKSHOP_LEVELS[index];
    assert.equal(game.state.index,index);
    assert.equal(game.check().won,false,'a job must not start solved');
    for (const operation of level.solution) assert.equal(game.apply(operation),true);
    const result = game.check();
    assert.equal(result.won,true); assert.equal(result.stars,3);
    assert.equal(result.matching,result.total);
    assert.equal(game.state.best[index],level.par);
    if (index<WORKSHOP_LEVELS.length-1) assert.equal(game.next(),true);
  }
  assert.deepEqual(game.state.cleared,[0,1,2,3,4]);
  assert.equal(game.next(),false);
});

test('no job can be solved with fewer operations than its authored par', () => {
  for (let index=0;index<WORKSHOP_LEVELS.length;index++) {
    const level = WORKSHOP_LEVELS[index], target = workshopRecipe(index,level.solution);
    let frontier = [workshopSource(index)];
    const seen = new Set();
    for (let depth=0;depth<level.par;depth++) {
      const next = [];
      for (const image of frontier) {
        assert.equal(compareWorkshopImages(image,target).exact,false,`job ${index + 1} should need ${level.par} moves`);
        if (depth===level.par-1) continue;
        for (const operation of level.tools) {
          if (toolUnavailable(image,operation)) continue;
          const candidate = applyWorkshopTool(image,operation);
          const key = `${candidate.width}:${candidate.height}:${createHash('sha256').update(candidate.data).digest('hex')}`;
          if (seen.has(key)) continue;
          seen.add(key); next.push(candidate);
        }
      }
      frontier = next;
    }
  }
});

test('reversing crop/print, sampling/print and spatial operations produces wrong pixels', () => {
  const wrong = [
    ['turn','mirror'],
    ['turn','right'],
    ['right','diffuse'],
    ['ordered','small','turn'],
    ['right','turn','diffuse','small','mirror'],
  ];
  wrong.forEach((recipe,index) => {
    const target = workshopRecipe(index,WORKSHOP_LEVELS[index].solution);
    assert.equal(compareWorkshopImages(workshopRecipe(index,recipe),target).exact,false,`order must matter in job ${index + 1}`);
  });
  const target = workshopRecipe(3,WORKSHOP_LEVELS[3].solution);
  assert.equal(compareWorkshopImages(workshopRecipe(3,['small','turn','ordered']),target).exact,false);
});

test('printing and shrinking execute the pinned renderer without substituted scoring', () => {
  const source = workshopSource(4);
  for (const operation of ['small','ink','diffuse','ordered']) {
    const expected = render(source,{ columns: operation==='small'?16:source.width,
      palette: operation==='small'?WORKSHOP_PALETTE:WORKSHOP_INK,
      mode:['small','ink'].includes(operation)?'pixels':'dither',
      algorithm:operation==='ordered'?'bayer':'floyd',strength:1,noise:0,seed:42 });
    const actual = applyWorkshopTool(source,operation);
    assert.deepEqual(actual.data,expected.data);
    assert.equal(actual.width,expected.width); assert.equal(actual.height,expected.height);
    assert.deepEqual(applyWorkshopTool(source,operation),actual,'repeated operations on identical input must reproduce exactly');
  }
});

test('budget limits, undo, invalid tools and progress guards preserve the puzzle state', () => {
  const game = createWorkshopSession();
  assert.equal(game.next(),false); assert.equal(game.undo(),false);
  assert.equal(game.apply('diffuse'),false,'locked tools cannot be injected into a job');
  const source = game.state.source;
  game.apply('turn'); game.apply('turn'); game.apply('turn');
  assert.equal(game.state.remaining,0); assert.equal(game.apply('mirror'),false);
  assert.equal(game.check().won,false); assert.equal(game.next(),false);
  assert.equal(game.undo(),true); assert.equal(game.state.remaining,1);
  game.undo(); game.undo(); assert.deepEqual(game.state.image,source);
  game.apply('mirror'); game.apply('turn'); game.check();
  assert.equal(game.apply('mirror'),false,'completed jobs are stable until undo/reset');
  const snapshot = game.state; snapshot.verdict.won=false; snapshot.image.data.fill(0); snapshot.level.budget=999;
  assert.equal(game.state.verdict.won,true); assert.equal(game.state.level.budget,3);
  game.reset(); assert.equal(game.state.operations.length,0); assert.equal(game.state.best[0],2);
  game.select(4); assert.deepEqual(game.state.cleared,[0],'direct selection is not completion');
  game.restart(); assert.deepEqual(game.state.cleared,[]);
});

test('pixels, alpha and dimensions determine success rather than the operation names', () => {
  const source = workshopSource(0);
  let equivalent = source;
  for(let i=0;i<4;i++) equivalent=applyWorkshopTool(equivalent,'turn');
  assert.equal(compareWorkshopImages(equivalent,source).exact,true);
  const alpha = structuredClone(source); alpha.data[3]=0;
  assert.equal(compareWorkshopImages(alpha,source).matching,source.width*source.height-1);
  assert.equal(compareWorkshopImages({...source,width:16,height:64},source).exact,false);
  assert.throws(()=>workshopRecipe(0,['unknown']),TypeError);
  assert.throws(()=>workshopSource(-1),RangeError);
  const narrow = applyWorkshopTool(source,'right');
  assert.ok(toolUnavailable(narrow,'right'));
  assert.throws(()=>applyWorkshopTool(narrow,'right'),RangeError);
});
