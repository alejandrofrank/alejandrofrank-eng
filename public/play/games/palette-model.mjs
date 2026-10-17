import { render } from '../image-engine/core.mjs';

export const SHUFFLE_LEVELS = [
  { title: 'Launch pad', grid: 2, mixed: 3, turned: 0, scene: 'rocket', method: 'pixels', palette: ['#172636','#54748d','#91b9b0','#f0c77c','#f6edd8','#d47566'] },
  { title: 'Coast at dusk', grid: 3, mixed: 5, turned: 0, scene: 'coast', method: 'floyd', palette: ['#23334c','#637c96','#9db8bc','#e8be91','#f4e8cc','#b97272'] },
  { title: 'Robot repair', grid: 3, mixed: 5, turned: 2, scene: 'robot', method: 'pixels', palette: ['#202c35','#436c72','#8ca792','#e6cf91','#e7e7cb','#d17b64'] },
  { title: 'Mountain signal', grid: 4, mixed: 8, turned: 3, scene: 'mountain', method: 'bayer', palette: ['#202c42','#515478','#87949c','#bfbea5','#f0dec0','#d8957a'] },
  { title: 'Deep blue', grid: 4, mixed: 12, turned: 4, scene: 'fish', method: 'floyd', palette: ['#142c42','#295875','#679b9c','#a9ccc0','#f2d591','#df916c'] },
];
export const pictureSettings = level => ({ columns: 48, palette: level.palette, mode: level.method === 'pixels' ? 'pixels' : 'dither', algorithm: level.method === 'bayer' ? 'bayer' : 'floyd', strength: level.method === 'bayer' ? .25 : .55, noise: 0, seed: 42 });
const rgb = hex => [1,3,5].map(i => parseInt(hex.slice(i,i+2),16));

// Original illustrations, drawn as pixels. The puzzle never downloads an image.
export function pictureSource(index) {
  const level = SHUFFLE_LEVELS[index]; if (!level) throw new RangeError('Unknown picture');
  const width = 96, height = 96, data = new Uint8ClampedArray(width * height * 4), colors = level.palette.map(rgb);
  const set = (x,y,color) => { if(x>=0&&x<width&&y>=0&&y<height) data.set([...color,255],(y*width+x)*4); };
  const rect = (x,y,w,h,c) => { for(let py=y;py<y+h;py++)for(let px=x;px<x+w;px++)set(px,py,colors[c]); };
  const circle = (cx,cy,r,c) => { for(let y=cy-r;y<=cy+r;y++)for(let x=cx-r;x<=cx+r;x++)if((x-cx)**2+(y-cy)**2<=r*r)set(x,y,colors[c]); };
  const triangle = (cx,top,half,bottom,c) => { for(let y=top;y<bottom;y++){const w=Math.floor(half*(y-top)/(bottom-top));rect(cx-w,y,w*2+1,1,c);} };
  for(let y=0;y<height;y++)for(let x=0;x<width;x++) {
    const t=.15+.62*y/height+.08*Math.sin(x/17);
    set(x,y,colors[0].map((v,k)=>Math.round(v+(colors[1][k]-v)*t)));
  }
  if(level.scene==='rocket') {
    [[12,13],[73,9],[82,37],[17,42],[67,64],[10,79]].forEach(([x,y],i)=>{rect(x,y,2+i%2,2,4);if(i%2)rect(x+1,y-1,1,4,4);});
    circle(77,21,9,3);circle(81,18,8,1);
    triangle(46,10,14,31,5);rect(32,30,29,35,4);rect(32,60,29,6,1);
    circle(46,40,8,1);circle(46,40,5,2);rect(44,36,3,3,4);
    triangle(29,46,9,70,5);triangle(64,46,8,70,5);rect(30,62,7,9,5);rect(58,62,8,9,5);
    triangle(47,65,9,89,3);rect(43,66,7,13,4);rect(22,91,50,3,1);
  } else if(level.scene==='coast') {
    circle(72,23,12,3);rect(0,56,96,40,1);
    for(let y=63;y<96;y+=9)for(let x=(y%17);x<96;x+=23)rect(x,y,13,2,y%2?2:4);
    triangle(29,60,32,96,0);rect(23,25,17,44,4);rect(23,37,17,7,5);rect(23,54,17,7,5);
    rect(20,21,23,6,0);rect(24,15,15,7,3);triangle(31,7,14,16,5);rect(29,28,5,6,0);rect(30,58,5,11,0);
    rect(3,43,14,2,2);rect(8,40,12,2,2);rect(64,43,20,2,4);
  } else if(level.scene==='robot') {
    for(let i=0;i<6;i++){rect(5+i*16,8+(i%3)*9,6,2,1);rect(7+i*16,13+(i%3)*9,2,6,2);}
    rect(26,22,45,31,2);rect(22,30,4,13,3);rect(71,30,4,13,3);rect(46,12,4,10,4);circle(48,10,4,5);
    rect(33,31,11,9,0);rect(53,31,11,9,0);rect(36,32,4,4,4);rect(55,32,4,4,4);rect(37,45,22,3,0);
    rect(31,56,35,23,1);rect(36,60,25,13,3);rect(40,63,4,4,5);rect(48,63,9,3,0);
    rect(19,57,8,21,2);rect(70,56,8,14,2);rect(75,51,10,7,3);
    rect(33,79,9,9,2);rect(56,79,9,9,2);rect(28,88,16,5,4);rect(55,88,16,5,4);
  } else if(level.scene==='mountain') {
    circle(75,17,9,4);rect(10,14,15,2,2);rect(5,18,25,2,2);
    triangle(30,21,39,87,1);triangle(67,32,40,90,2);triangle(30,21,10,40,4);triangle(67,32,9,49,3);
    rect(0,83,96,13,0);triangle(15,57,10,86,0);triangle(84,63,10,91,0);
    rect(50,68,20,16,5);triangle(60,58,17,70,0);rect(54,72,5,6,4);rect(63,73,4,11,0);
    rect(70,52,2,15,3);rect(72,52,10,6,5);rect(32,89,28,3,3);
  } else {
    for(let i=0;i<9;i++){const x=8+(i*23)%84,y=8+(i*31)%77;circle(x,y,3,2);circle(x,y,1,0);}
    for(let x=8;x<96;x+=21)for(let y=70;y<96;y++)rect(x+Math.round(3*Math.sin(y/5)),y,3,1,2);
    for(let y=28;y<69;y++)for(let x=19;x<74;x++)if(((x-46)/27)**2+((y-48)/20)**2<1)set(x,y,colors[3]);
    for(let y=28;y<68;y++){const length=Math.floor(Math.abs(y-48)*.8);rect(74,y,length,1,5);}
    rect(39,31,5,35,5);rect(56,33,5,31,5);circle(28,43,5,0);rect(27,41,2,2,4);triangle(45,17,10,31,5);
    rect(3,92,90,4,3);
  }
  return {width,height,data};
}
export function renderPicture(index) { return render(pictureSource(index),pictureSettings(SHUFFLE_LEVELS[index])); }
export function tilePixels(image,grid,tile) {
  const side=image.width/grid, data=new Uint8ClampedArray(side*side*4), ox=tile.id%grid*side, oy=Math.floor(tile.id/grid)*side;
  for(let y=0;y<side;y++)for(let x=0;x<side;x++) {
    let sx=x,sy=y;
    for(let turn=0;turn<tile.turns;turn++) [sx,sy]=[sy,side-1-sx];
    const offset=((oy+sy)*image.width+ox+sx)*4;
    data.set(image.data.subarray(offset,offset+4),(y*side+x)*4);
  }
  return {width:side,height:side,data};
}
const equal = (a,b) => a.length===b.length&&a.every((value,i)=>value===b[i]);
export function inspectBoard(image,grid,board) {
  const correct=board.map((tile,i)=>equal(tilePixels(image,grid,tile).data,tilePixels(image,grid,{id:i,turns:0}).data));
  return {correct:correct.filter(Boolean).length,won:correct.every(Boolean)};
}
function shuffledBoard(level,seed) {
  let value=(seed+1)>>>0;
  const random = () => {value=(Math.imul(value,1664525)+1013904223)>>>0;return value/4294967296;};
  const count=level.grid**2, order=Array.from({length:count},(_,i)=>i), board=order.map(id=>({id,turns:0}));
  for(let i=count-1;i>0;i--){const j=Math.floor(random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
  const positions=order.slice(0,level.mixed);
  positions.forEach((position,i)=>{board[position].id=positions[(i+1)%positions.length];});
  for(let i=0;i<level.turned;i++)board[order[i]].turns=3;
  return board;
}

export function createShuffleSession() {
  let index=0,seed=0,board=[],image,history=[],moves=0,selected=null;
  const awards=new Map();
  function load(next,nextSeed=0) {if(!Number.isInteger(next)||!SHUFFLE_LEVELS[next])throw new RangeError('Unknown picture');index=next;seed=nextSeed;image=renderPicture(index);board=shuffledBoard(SHUFFLE_LEVELS[index],seed);history=[];moves=0;selected=null;}
  const result = () => inspectBoard(image,SHUFFLE_LEVELS[index].grid,board);
  const goal = () => SHUFFLE_LEVELS[index].mixed-1+SHUFFLE_LEVELS[index].turned;
  function save(){history.push(structuredClone({board,moves,selected}));moves++;}
  function finish(){if(result().won){const stars=moves<=goal()?3:moves<=goal()+3?2:1;awards.set(index,Math.max(stars,awards.get(index)||0));selected=null;}}
  load(0);
  return {
    get state(){const status=result();return {index,level:structuredClone(SHUFFLE_LEVELS[index]),board:structuredClone(board),image:structuredClone(image),moves,goal:goal(),selected,canUndo:history.length>0,...status,stars:status.won?(moves<=goal()?3:moves<=goal()+3?2:1):0,cleared:[...awards.keys()],awards:Object.fromEntries(awards)};},
    choose(position){if(!Number.isInteger(position)||!board[position]||result().won)return false;if(selected===null){selected=position;return true;}if(selected===position){selected=null;return true;}save();[board[selected],board[position]]=[board[position],board[selected]];selected=null;finish();return true;},
    rotate(){if(selected===null||!SHUFFLE_LEVELS[index].turned||result().won)return false;save();board[selected].turns=(board[selected].turns+1)%4;finish();return true;},
    undo(){const last=history.pop();if(!last)return false;({board,moves,selected}=last);return true;},
    next(){if(!result().won||index===SHUFFLE_LEVELS.length-1)return false;load(index+1);return true;},
    select:load,
    reset(){load(index,seed);},
    shuffle(){load(index,seed+1);},
    restart(){awards.clear();load(0);},
  };
}
