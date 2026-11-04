// Only facts that affect future legal turns belong in the position key.
// Spent moves are checked separately, so Undo cannot reset the budget proof.
export function positionKey(s){
 return [s.status,s.cause||'',s.yard,s.bay.map(b=>b?b.id+':'+b.remaining:'-').join(','),s.queue.map(o=>o.id+(o.retry?'r':'')).join(','),s.bags.join(','),[...s.departed].sort().join(',')].join('|');
}
export function levelSignature(l){return JSON.stringify({slots:l.slots,rows:l.rows,cols:l.cols,bagLimit:l.bagLimit,handoff:l.handoff,limited:l.limited,bots:l.bots,queue:l.queue});}
