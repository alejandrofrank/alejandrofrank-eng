export function renderOrderFlowGame(): string {
 return `<section id="order-flow-game" aria-label="Order Flow puzzle" hidden>
  <header class="of-heading"><button id="of-exit" type="button" aria-label="Back to arcade">Back</button><div class="of-title-group"><h3 id="of-title">Find the opening</h3><p id="of-caption">Match the front passenger. Each car seats two.</p></div><button id="of-undo" type="button" disabled>Undo 3</button><details id="of-tools"><summary aria-label="More puzzle controls"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="4" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="20" cy="12" r="2"/></svg></summary><div class="of-actions"><button id="of-replay" type="button">Retry</button><button id="of-hint" type="button" title="Show a move with a complete queue and parking solution. A hint changes the best rating to two stars.">Hint</button><button id="of-sound" type="button" aria-pressed="false">Sound off</button></div></details><button id="of-level" type="button" aria-label="Choose level">1 / 20</button></header>
  <div class="of-status-row"><p id="of-message" role="status" aria-live="polite" aria-atomic="true">Match the front color. Each car seats two.</p><span id="of-timer" role="timer" aria-live="off" hidden></span></div>
  <section class="of-queue" aria-label="Passenger queue"><div><strong id="of-front">Front · Picker</strong><span id="of-waiting">32 waiting</span></div><ol id="of-passengers" aria-label="Passengers in service order"></ol><span id="of-concealed" hidden>Next passengers hidden</span></section>
  <section class="of-parking" aria-label="Parking bay"><div class="of-bay-label"><strong>Parking</strong><span id="of-bay-count">0 / 3</span></div><div id="of-bay" aria-label="Parking spaces"></div></section>
  <div class="of-yard-viewport"><div id="of-grid" class="of-grid" role="group" aria-label="Packed yard"></div></div>
  <div class="of-summary"><span id="of-remaining">16 / 16 cars in yard</span><span id="of-score">0 blocked · 0 hints</span><span>3 stars: no hints, blocked taps or undo.</span></div>
  <footer class="of-footer">Original browser puzzle · synthetic passengers · no AI/GCP calls. Mechanic inspired by <a href="https://play.google.com/store/apps/details?id=jp.co.goodroid.hyper.busflow" target="_blank" rel="noopener">Bus Traffic Fever</a>. Original art.</footer>
  <section id="of-loss" class="of-outcome" aria-labelledby="of-loss-title" hidden><div class="of-result-card"><h4 id="of-loss-title">Out of slots</h4><p id="of-loss-text"></p><div class="of-result-actions"><button id="of-loss-undo" class="of-primary" type="button">Undo last move</button><button id="of-loss-retry" type="button">Retry</button></div></div></section>
  <section id="of-result" class="of-outcome" aria-labelledby="of-result-title" hidden><div class="of-result-card"><div id="of-stars" class="of-stars" aria-label="Star rating"></div><h4 id="of-result-title">Yard cleared</h4><p id="of-result-score"></p><div class="of-result-actions"><button id="of-next" class="of-primary" type="button">Next level</button><button id="of-again" type="button">Replay level</button></div><div class="of-reference"><p id="of-real-note"></p><a id="of-real" href="/projects/agents-demo/?view=agents&amp;agent=fulfillment" target="_blank" rel="noopener noreferrer">In the real system <span>(new tab)</span></a></div></div></section>
  <section id="of-levels" class="of-outcome" aria-labelledby="of-levels-title" hidden><div class="of-result-card"><h4 id="of-levels-title">Your yards</h4><div id="of-level-list" class="of-level-list"></div><p id="of-saved">Progress saved on this device</p><button id="of-close-levels" type="button">Back to puzzle</button></div></section>
 </section>`;
}
export const orderFlowStyles = `
.arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])){width:96vw;max-width:1100px;height:96dvh;max-height:980px;--station:#e0b15a;background:#3c2a1c;border-color:#6b4e32;color:#f6ead8}
.arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])) .screen-marquee{padding:6px 16px;min-height:48px;background:#4b3525;border-bottom:1px solid #6b4e32;color:#f6ead8}
.arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])) .screen-marquee span{display:none}
.arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])) .screen-marquee :is(h2,a,button){font-size:16px;color:#f8eedd}
.arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])) .screen-exit{background:#6b4e32;border:0;border-radius:14px}
.arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])) .screen-exit kbd{color:#f6ead8;border-color:#a07a52}
.arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])) .screen-rim{display:none}
.arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])) .screen-viewport{overflow:auto;scrollbar-gutter:stable;scrollbar-color:#947147 #f3e2c4;background:#f3e2c4}
.arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])) :is(.station-panels,.station-panel,.console-body,.game-content){height:auto;min-height:0;max-width:none;background:#f3e2c4}
.arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])) .station-brief{display:none}
#order-flow-game{--of-sand:#f3e2c4;--of-ink:#3a2918;--of-soft:#6d5640;--of-rim:#c9a56c;--of-card:#fff8ee;--cols:4;--rows:4;--cell:max(44px,min(76px,calc((100dvh - 390px)/var(--rows)),calc((100vw - 46px)/var(--cols))));display:flex;flex-direction:column;gap:6px;position:relative;padding:8px 16px 10px;background:var(--of-sand);color:var(--of-ink);font:16px/1.35 var(--sans,system-ui,sans-serif);color-scheme:light}
#order-flow-game *{box-sizing:border-box}
#order-flow-game [hidden]{display:none!important}
#order-flow-game :is(button,a){font:inherit;font-size:15px}
#order-flow-game button{min-height:44px;border:1px solid var(--of-rim);border-radius:12px;padding:8px 12px;background:var(--of-card);color:var(--of-ink);font-weight:750;cursor:pointer;touch-action:manipulation}
#order-flow-game button:hover:not(:disabled):not(.of-car){background:#fff}
#order-flow-game button:disabled{opacity:.5;cursor:default}
#order-flow-game :is(button,a):focus-visible{outline:3px solid #8a4e08;outline-offset:2px}
#order-flow-game ::selection{background:#e7c27a;color:#3a2918}
#order-flow-game a{color:#1f6b40;font-weight:700;text-underline-offset:3px}
.of-heading{display:flex;align-items:center;gap:12px}
.of-title-group{flex:1;min-width:0}
#of-exit{display:none}
#order-flow-game h3{font-size:22px;line-height:1.1;letter-spacing:-.02em;margin:0}
.of-heading p{font-size:14px;color:var(--of-soft);margin:3px 0 0}
#of-level{font-variant-numeric:tabular-nums;white-space:nowrap}
.of-actions{display:flex;gap:6px}
#of-tools{display:contents}
#of-tools summary{display:none}
#of-tools>.of-actions{display:flex}
#of-remaining{font-size:14px;font-weight:700;font-variant-numeric:tabular-nums}
#of-message{margin:0;min-height:21px;font-size:14px;color:#5c4632}
.of-status-row{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:24px}
#of-timer{flex-shrink:0;font-size:14px;font-weight:750;font-variant-numeric:tabular-nums;padding:2px 7px;border:1px solid var(--of-rim);border-radius:7px;color:var(--of-ink);background:var(--of-card)}
#of-timer.is-low{color:#8a2919;border-color:#a5482e;background:#ffeadf}
.of-yard-viewport{max-width:100%;overflow:auto;padding:6px 2px 10px;scrollbar-color:#947147 #f3e2c4}
.of-grid{display:grid;grid-template-columns:repeat(var(--cols),var(--cell));grid-template-rows:repeat(var(--rows),var(--cell));width:max-content;margin-inline:auto;position:relative;isolation:isolate;border:3px solid #a17d4d;border-radius:10px;background:#dec69e;box-shadow:0 5px 12px #69482629}
#order-flow-game .of-car{display:grid;place-items:center;position:relative;width:var(--cell);height:var(--cell);min-height:44px;padding:0;margin:0;border:1px solid #f3e2c4;border-radius:7px;background:var(--car);color:#fffaf3;box-shadow:inset 0 2px 0 #ffffff3b,inset 0 -3px 0 #00000026;opacity:1}
.of-car svg{width:100%;height:100%;rotate:var(--angle);pointer-events:none}
#order-flow-game .of-car.is-incognito{box-shadow:inset 0 2px 0 #ffffff2e,inset 0 -3px 0 #00000030}
.of-direction{fill:none;stroke:#fffaf3;stroke-width:5;stroke-linecap:round;stroke-linejoin:round}
#order-flow-game .of-car:hover:not(:disabled){filter:brightness(1.1)}
#order-flow-game .of-car:focus-visible{z-index:3;outline:3px solid #fff8ee;outline-offset:-5px}
#order-flow-game .of-car.is-empty{visibility:hidden;pointer-events:none}
#order-flow-game .of-car.is-leaving{z-index:4;pointer-events:none}
#order-flow-game .of-car.is-blocker{z-index:3;outline:4px solid #fff8ee;outline-offset:-6px;box-shadow:inset 0 0 0 8px #853221}
#order-flow-game .of-car.is-hint{z-index:3;outline:4px solid #fff8ee;outline-offset:-6px;box-shadow:inset 0 0 0 8px #764a00}
.of-summary{display:flex;justify-content:center;flex-wrap:wrap;gap:4px 18px;font-size:14px;color:var(--of-soft)}
#of-score{font-variant-numeric:tabular-nums}
.of-footer{text-align:center;font-size:14px;line-height:1.4;color:var(--of-soft)}
#order-flow-game .of-footer a{font-size:14px}
.of-queue{display:flex;gap:10px;align-items:center;min-width:0;padding:4px 8px;border:1px solid var(--of-rim);border-radius:12px;background:#ead6b1}
.of-queue>div,.of-bay-label{display:flex;flex-direction:column;flex-shrink:0;font-size:14px}
#of-passengers{display:flex;gap:5px;align-items:center;overflow-x:auto;min-width:0;flex:1;padding:3px;margin:0;list-style:none;scrollbar-width:thin;scrollbar-color:#947147 #ead6b1}
#of-passengers.is-concealed{flex:0 0 auto;overflow:visible}
#of-concealed{font-size:14px;color:var(--of-soft);margin-inline-start:4px}
.of-person{flex:0 0 26px;width:26px;height:32px;color:var(--car)}
.of-person svg{width:100%;height:100%;display:block}
.of-person:first-child{outline:2px solid var(--of-ink);outline-offset:1px;border-radius:5px}
.of-parking{display:flex;gap:10px;align-items:center}
.of-bay-label{width:80px}
#of-bay{display:grid;grid-template-columns:repeat(var(--slots,3),minmax(44px,76px));gap:6px;flex:1}
.of-slot{height:48px;border:2px dashed #ad8d5c;border-radius:9px;background:#e4cda7;display:flex;justify-content:center;align-items:center;font-size:14px;color:#694e30}
.of-parked{display:flex;align-items:center;justify-content:center;width:42px;height:38px;border:1px solid #fff8ee;border-radius:7px;background:var(--car);box-shadow:0 2px 3px #49311e33}
.of-parked svg{height:40px;width:40px;rotate:90deg}
.of-seat-status{display:flex;flex-direction:column;gap:5px;margin-left:5px}
.of-seat-status i{width:9px;height:9px;border:1px solid #694e30;border-radius:50%;background:#fff8ee}
.of-seat-status .is-filled{background:#694e30}
.of-slot.is-stuck{border-style:solid;border-color:#9e3625;background:#f3c5ae}
#order-flow-game[data-status=lost] .of-person:first-child{outline-color:#9e3625;background:#f3c5ae}
.of-boarding-ghost{position:fixed;left:0;top:0;pointer-events:none;z-index:25}
.of-car-ghost{width:48px;height:48px;border-radius:7px;background:var(--car);border:1px solid #fff8ee;box-shadow:0 3px 5px #49311e44}
.of-car-ghost svg{width:100%;height:100%;rotate:90deg}
.of-passenger-ghost{width:24px;height:30px;color:var(--car)}
.of-passenger-ghost svg{width:100%;height:100%}
.of-outcome{position:fixed;inset:14px;z-index:20;display:flex;align-items:safe center;justify-content:center;padding:16px;overflow:auto;background:#3a2918b8}
.of-result-card{width:min(440px,100%);margin:auto;padding:20px;background:var(--of-card);border:2px solid #d4bc91;border-radius:20px;box-shadow:0 12px 35px #29190d44;text-align:center}
#order-flow-game h4{font-size:24px;margin:8px 0;line-height:1.2}
.of-result-card p{font-size:15px;margin:8px 0 14px}
.of-stars{display:flex;justify-content:center;gap:8px}
.of-stars svg{width:30px;height:30px;fill:#dca13a;stroke:#8a5a16;stroke-width:1.4}
.of-stars [data-empty=true]{fill:#e5dac6;stroke:#a89980}
.of-result-actions{display:flex;justify-content:center;flex-wrap:wrap;gap:8px;margin:16px 0 24px}
#order-flow-game .of-primary{background:#236f44;color:#fffaf3;border-color:#236f44}
.of-reference{border-top:1px solid #d6bd92;padding-top:12px}
.of-reference a{display:block;padding:8px}
.of-reference a span{font-size:14px}
.of-level-list{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin:16px 0}
#order-flow-game .of-level-list button{padding:6px 2px;display:flex;flex-direction:column;gap:3px;align-items:center;font-size:14px}
.of-level-list [aria-current=step]{outline:3px solid #8a4e08}
@media(max-width:700px){
 .arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])){width:100vw;height:100dvh;max-height:100dvh}
 .arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])) .screen-marquee{display:none}
 #order-flow-game{padding:6px;gap:4px;--cell:max(44px,min(76px,calc((100dvh - 305px)/var(--rows)),calc((100vw - 46px)/var(--cols))))}
 #of-exit{display:block}
 #order-flow-game h3{font-size:16px}
 .of-heading{gap:4px}
 .of-heading p{display:none}
 #order-flow-game .of-heading>button{padding:6px 8px;font-size:14px}
 #of-tools{display:block;position:relative}
 #of-tools summary{display:grid;place-items:center;list-style:none;width:44px;height:44px;border:1px solid var(--of-rim);border-radius:12px;background:var(--of-card);cursor:pointer}
 #of-tools summary::-webkit-details-marker{display:none}
 #of-tools summary svg{width:22px;height:22px;fill:var(--of-ink)}
 #of-tools:not([open])>.of-actions{display:none}
 #of-tools[open]>.of-actions{display:flex;position:absolute;top:48px;right:0;padding:8px;background:var(--of-card);border:1px solid var(--of-rim);border-radius:12px;box-shadow:0 5px 14px #49311e44;z-index:12}
 .of-actions{gap:4px}
 #order-flow-game .of-actions button{padding:7px 9px;font-size:14px}
 .of-summary{gap:2px}
 .of-summary>span:last-child{display:none}
 .of-summary>span+span:before{content:' · '}
 .of-queue{padding:2px 5px;gap:6px}
 .of-person{height:28px;width:23px;flex-basis:23px}
 .of-bay-label{width:64px}
 #of-bay{grid-template-columns:repeat(var(--slots,3),minmax(44px,1fr))}
 .of-slot{height:44px}
 .of-yard-viewport{padding-block:3px 5px}
 .of-result-card{padding:16px}
}
@media(prefers-reduced-motion:reduce){#order-flow-game *{animation:none!important;transition:none!important}}
`;
