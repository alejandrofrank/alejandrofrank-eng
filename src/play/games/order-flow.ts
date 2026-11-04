export function renderOrderFlowGame(): string {
 return `<section id="order-flow-game" aria-label="Order Flow puzzle" hidden>
  <header class="of-heading"><div><h3 id="of-title">Front first</h3><p id="of-caption">Match the front. Full bots leave.</p></div><button id="of-level" type="button" aria-label="Choose level">1 / 10</button></header>
  <div class="of-toolbar"><button id="of-undo" type="button" disabled>Undo 3</button><button id="of-replay" type="button">Retry</button><div class="of-budget"><strong id="of-moves">0 / 4 moves</strong><span id="of-target">2 moves for 3 stars</span></div><button id="of-sound" type="button" aria-pressed="false">Sound off</button></div>
  <div class="of-feedback"><p id="of-message" role="status" aria-live="polite" aria-atomic="true">Tap a bot with a clear arrow.</p><button id="of-fast" type="button" aria-pressed="false" disabled>Hold to speed up</button><span id="of-queued" role="status"></span></div>
  <div class="of-board" id="of-board">
   <section class="of-queue" aria-label="Order queue"><div class="of-section-label"><strong>Order queue</strong><span id="of-orders"></span></div><svg id="of-belt" role="img" aria-label="Order belt"></svg><div class="of-belt-caption"><strong id="of-front"></strong><span id="of-memory-state" hidden></span></div></section>
   <section class="of-handoff" id="of-handoff" aria-label="Courier belt" hidden><div><strong>Courier belt</strong><span id="of-bags-count">0 / 4 bags</span></div><div id="of-bag-slots" class="of-bag-slots"></div><span class="of-collect">C collects</span></section>
   <div class="of-work" id="of-work">
    <section class="of-bay" aria-label="Agent bay"><div class="of-section-label"><strong>Agent bay</strong><span id="of-bay-count"></span></div><div id="of-slots" class="of-slots"></div></section>
    <section class="of-yard" aria-label="Agent yard"><div class="of-section-label"><strong>Agent yard</strong><span>Arrow = exit · number = orders</span></div><div id="of-cells" class="of-cells"></div></section>
    <div id="of-bots" class="of-bots" aria-label="Bots"></div><span id="of-hop" class="of-hop" aria-hidden="true" hidden></span>
   </div>
   <section id="of-result" class="of-outcome" aria-labelledby="of-result-title" hidden><div class="of-result-card">
    <div class="of-stars" id="of-stars" aria-label="Star rating"></div><h4 id="of-result-title">Plan complete</h4><p id="of-result-score"></p>
    <div class="of-result-actions"><button id="of-next" type="button" class="of-primary">Next level</button><button id="of-again" type="button">Replay level</button></div>
    <div class="of-reference"><p id="of-real-note"></p><a id="of-real" href="/projects/agents-demo/?view=agents&amp;agent=fulfillment" target="_blank" rel="noopener noreferrer">In the real system <span>(new tab)</span></a></div>
   </div></section>
   <section id="of-loss" class="of-outcome of-loss" aria-labelledby="of-loss-title" hidden><div class="of-result-card">
    <h4 id="of-loss-title">Out of slots</h4><div id="of-loss-cause" class="of-loss-cause"></div><p id="of-loss-text"></p>
    <div class="of-result-actions"><button id="of-retry" class="of-primary" type="button">Retry level</button><button id="of-loss-undo" type="button">Undo last move</button></div><p class="of-loss-note">Undo keeps spent moves and earns one star.</p>
   </div></section>
   <section id="of-levels" class="of-outcome" aria-labelledby="of-levels-title" hidden><div class="of-result-card"><h4 id="of-levels-title">Your progress</h4><div id="of-level-list" class="of-level-list"></div><p id="of-saved">Progress saved on this device</p><button id="of-close-levels" type="button">Back to puzzle</button></div></section>
  </div>
  <div id="of-legend" class="of-legend" aria-label="Skill colors"></div>
  <footer class="of-footer">Original browser puzzle · synthetic orders · no AI or GCP calls.<br>Mechanic inspired by <a href="https://play.google.com/store/apps/details?id=jp.co.goodroid.hyper.busflow" target="_blank" rel="noopener">Bus Traffic Fever</a>. Original art.</footer>
 </section>`;
}
export const orderFlowStyles = `
.arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])){width:92vw;height:90dvh;max-height:90dvh;--station:#a9d4bb}
.arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])) .screen-marquee{padding:8px 20px;min-height:50px}
.arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])) .screen-marquee span{display:none}
.arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])) .screen-marquee :is(h2,a,button){font-size:16px}
.arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])) .screen-rim{display:none}
.arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])) .screen-viewport{overflow:hidden;scrollbar-gutter:auto}
.arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])) :is(.station-panels,.station-panel,.console-body,.game-content){height:100%;min-height:0;max-width:none}
.arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])) .station-brief{display:none}
#order-flow-game{height:100%;min-height:0;display:grid;grid-template-rows:auto 46px 44px minmax(0,1fr) auto auto;gap:6px;padding:8px 18px;background:#191a27;color:#f4f1e7;font:14px/1.3 var(--sans,system-ui,sans-serif);color-scheme:dark}
#order-flow-game *{box-sizing:border-box}
#order-flow-game [hidden]{display:none!important}
#order-flow-game :is(button,a){font:inherit;font-size:14px}
#order-flow-game button{min-height:44px;border:1px solid #7d8c83;border-radius:9px;padding:6px 12px;background:#2d3934;color:#f5f2e9;cursor:pointer;touch-action:manipulation}
#order-flow-game button:hover:not(:disabled){background:#42554a}
#order-flow-game button:disabled{opacity:.55;cursor:default}
#order-flow-game :is(button,a):focus-visible{outline:3px solid #efc67b;outline-offset:2px}
#order-flow-game ::selection{background:#c4dfa9;color:#172c24}
#order-flow-game a{color:#c6e7cf;text-underline-offset:3px}
.of-heading{display:flex;justify-content:space-between;gap:12px;align-items:center}
#order-flow-game h3{font-size:20px;line-height:1.1;margin:0 0 3px}
.of-heading p{margin:0;color:#ccd5ce;font-size:14px}
.of-heading button{flex:none;font-variant-numeric:tabular-nums}
.of-toolbar{display:flex;align-items:center;gap:8px}
.of-budget{flex:1;text-align:center;display:flex;flex-direction:column;gap:2px;font-variant-numeric:tabular-nums}
.of-budget span{color:#d0d7ce;font-size:14px}
.of-feedback{display:flex;align-items:center;gap:10px;position:relative}
.of-feedback p{margin:0;flex:1;color:#d5e3d7;font-size:14px;line-height:1.25}
#order-flow-game .of-feedback button{font-size:14px;white-space:nowrap;background:transparent}
#of-queued:not(:empty){position:absolute;right:0;bottom:-2px;background:#191a27;color:#efc67b;font-size:14px}
.of-board{position:relative;min-height:0;display:flex;flex-direction:column;background:#f4f0e5;color:#243e35;border-radius:14px;border:1px solid #83978a;overflow:hidden;padding:8px 18px;gap:6px;color-scheme:light}
.of-section-label{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:14px;line-height:18px}
.of-section-label>span{color:#4f6054}.of-section-label strong{font-size:14px;font-weight:700}
.of-queue{flex:none;width:100%;max-width:790px;margin:0 auto}
.of-queue svg{display:block;width:100%;height:76px;overflow:visible}
.of-belt-caption{display:flex;align-items:center;justify-content:space-between;gap:4px;line-height:18px;min-height:18px;font-size:14px}
.of-belt-caption span{color:#704055}
.of-handoff{flex:none;display:flex;align-items:center;justify-content:space-between;gap:12px;width:min(620px,100%);margin:0 auto;padding:4px 10px;background:#e2eaf0;border:1px solid #9baebc;border-radius:9px}
.of-handoff>div:first-child{display:flex;flex-direction:column;font-size:14px;white-space:nowrap}
.of-bag-slots{display:flex;gap:5px}.of-bag-slot{width:30px;height:30px;border:1px dashed #637c8c;border-radius:6px;display:grid;place-items:center}.of-bag-slot.is-filled{background:#3275ac;border:1px solid #245078;color:#fff}
.of-bag-slot svg{width:23px;height:23px;fill:none;stroke:currentColor;stroke-width:1.8}.of-collect{font-size:14px}
.of-work{position:relative;min-height:0;flex:1;display:grid;grid-template-rows:88px minmax(0,1fr);gap:6px;width:min(620px,100%);margin:0 auto}
.of-bay,.of-yard{display:grid;grid-template-rows:18px minmax(0,1fr);gap:5px;min-height:0}
.of-bay{border-bottom:1px solid #c6cfc1;padding-bottom:6px}
.of-slots{display:grid;gap:10px}
.of-slot{border:2px dashed #819580;border-radius:12px;background:#e3e9da;min-height:0}
.of-slot.is-stuck{border:3px solid #ad3d31;background:#f3d7c8}
.of-cells{display:grid;gap:6px;min-height:0}
.of-cell{border:1px solid #d5d7c8;border-radius:10px;background:#e9e7db}
.of-bots{position:absolute;inset:0;pointer-events:none}
#order-flow-game .of-bot{position:absolute;left:0;top:0;padding:0;min-height:44px;pointer-events:auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;border:2px solid #263e35;background:var(--bot);color:#fffdf4;border-radius:13px;box-shadow:0 3px 6px #263e352b;transition:transform 150ms ease-out;user-select:none;-webkit-user-select:none}
#order-flow-game .of-bot:hover:not(:disabled){background:var(--bot);filter:brightness(1.08)}
#order-flow-game .of-bot[aria-disabled=true]{border-style:dashed}
#order-flow-game .of-bot.is-queued{outline:3px solid #b36a13;outline-offset:2px}
.of-bot .of-face{width:32px;height:14px;flex:none;fill:none;stroke:currentColor;stroke-width:2.5;stroke-linecap:round}
.of-bot .of-arrow,.of-bot .of-lock{position:absolute;width:20px;height:20px;right:-5px;top:-7px;background:#fffdf4;color:#253e34;border:1px solid #60766a;border-radius:5px;padding:1px}
.of-bot .of-lock{left:-7px;right:auto;background:var(--lock);color:#fffdf4;border-color:#243e35}
.of-arrow svg,.of-lock svg{display:block;width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.of-bot .of-count{display:flex;align-items:center;justify-content:space-between;width:100%;padding:0 6px;font-size:14px;line-height:18px}
.of-count strong{font-size:17px}
.of-hop{position:absolute;top:0;left:0;display:grid;place-items:center;width:22px;height:22px;border:2px solid #fffdf4;border-radius:50%;background:var(--bot);color:#fffdf4;font-size:14px;font-weight:700;pointer-events:none;z-index:2;animation-duration:150ms;animation-timing-function:ease-out;animation-fill-mode:both}
@keyframes of-hop-a{from{transform:translateY(-16px);opacity:1}to{transform:translateY(16px);opacity:0}}
@keyframes of-hop-b{from{transform:translateY(-16px);opacity:1}to{transform:translateY(16px);opacity:0}}
#order-flow-game .of-bot.is-blocker{outline:3px solid #ae3d30;outline-offset:2px}.of-bot[data-bay=true]{border-style:solid!important}
.of-legend{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:3px 16px;font-size:14px;min-height:22px}
.of-legend span{display:flex;align-items:center;gap:5px}.of-legend b{display:inline-grid;place-items:center;border-radius:5px;width:21px;height:21px;background:var(--bot);color:#fffdf4;font-size:14px}
.of-footer{text-align:center;font-size:14px;color:#bdcbc1;line-height:1.25}
.of-outcome{position:absolute;inset:0;z-index:5;background:#142b25b8;display:grid;place-items:center;padding:12px}
.of-result-card{width:min(420px,100%);padding:20px;border:1px solid #c3d0bd;border-radius:14px;background:#fffaf0;color:#243e35;text-align:center;box-shadow:0 12px 30px #14251f30}
#order-flow-game h4{font-size:24px;margin:6px 0 10px}.of-result-card p{font-size:14px;line-height:1.35;margin:8px 0 12px}
.of-stars{display:flex;justify-content:center;gap:9px}.of-stars svg{width:28px;height:28px;fill:#bd7a15;stroke:#8b5a10;stroke-width:1.5}.of-stars svg[data-empty=true]{fill:none;stroke:#768875}
.of-result-actions{display:flex;gap:10px;justify-content:center;margin:14px 0 24px}
#order-flow-game .of-primary{background:#21653f;color:#fffdf4;border-color:#21653f;font-weight:700}
.of-reference{padding-top:14px;border-top:1px solid #bdc9b7}
.of-reference p{margin:0 0 8px}
#order-flow-game .of-reference a{color:#245f3b;font-size:16px;display:block;padding:10px}
.of-reference a span{display:block;font-size:14px}
.of-loss-cause{padding:10px;background:#f2d9cc;color:#792d22;border:2px solid #ac5142;border-radius:8px;font-weight:700;font-size:14px}
.of-loss .of-result-card{border:2px solid #b55946}
.of-loss-note{color:#5c5146}
#order-flow-game .is-overflow{outline:3px solid #ae3d30;outline-offset:2px}
.of-level-list{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin:12px 0}
#order-flow-game .of-level-list button{padding:8px 2px;display:flex;flex-direction:column;gap:4px;align-items:center}
.of-level-list button strong{font-size:18px}.of-level-list button span{font-size:14px}
.of-level-list [aria-current=step]{outline:3px solid #b07823}
@media(max-width:700px){
 .arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])){width:100vw;height:100dvh;max-height:100dvh}
 .arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])) .screen-marquee{min-height:44px;padding:4px 10px}
 .arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])) .screen-home{display:none}
 #order-flow-game{padding:6px 8px;gap:4px;grid-template-rows:auto 44px 44px minmax(0,1fr) auto auto}
 #order-flow-game h3{font-size:18px}.of-heading{gap:6px}.of-heading p{line-height:1.15}
 .of-toolbar{gap:5px}#order-flow-game .of-toolbar button{padding:5px 8px}
 .of-feedback{gap:6px}.of-feedback p{line-height:1.15}
 #order-flow-game .of-feedback button{padding:3px 6px;max-width:104px;white-space:normal}
 .of-board{padding:6px 8px;gap:4px;border-radius:11px}
 .of-work{grid-template-rows:77px minmax(0,1fr);gap:4px}
 .of-queue svg{height:65px}
 .of-belt-caption{flex-wrap:wrap;line-height:16px}
 .of-slots{gap:6px}.of-cells{gap:5px}
 .of-handoff{padding:3px 5px;gap:5px}
 .of-bag-slot{width:27px;height:28px}.of-collect{max-width:60px}
 .of-legend{gap:3px 10px}.of-legend b{width:19px;height:19px}
 .of-result-card{padding:14px}.of-result-actions{margin:10px 0 20px}
 .of-reference{padding-top:10px}.of-reference p{line-height:1.2}
}
@media(max-height:740px){#order-flow-game{gap:3px}.of-work{grid-template-rows:72px minmax(0,1fr)}.of-board{padding-block:4px}.of-queue svg{height:60px}.of-result-card{padding:12px}.of-stars svg{width:24px;height:24px}}
@media(prefers-reduced-motion:reduce){#order-flow-game *{transition:none!important;animation:none!important}}
`;
