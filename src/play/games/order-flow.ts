export function renderOrderFlowGame(): string {
 return `<section id="order-flow-game" aria-label="Order Flow puzzle" hidden>
  <header class="of-heading"><h3 id="of-title">After you</h3><span id="of-level">1 / 6</span><p id="of-caption">Clear the bot in front to open an exit.</p></header>
  <div class="of-toolbar"><button id="of-undo" type="button" disabled>Undo</button><button id="of-replay" type="button">Replay</button><span id="of-moves">0 moves · target 3</span><button id="of-sound" type="button" aria-pressed="false">Sound off</button></div>
  <p id="of-message" class="of-message" role="status" aria-live="polite" aria-atomic="true">Tap a bot with a clear arrow to begin.</p>
  <div class="of-board" id="of-board">
   <section class="of-queue" aria-label="Order queue"><div class="of-section-label"><strong>Order queue</strong><span id="of-orders">7 left</span></div><svg id="of-belt" aria-label="Orders on a U-shaped belt" role="img"></svg></section>
   <div class="of-work" id="of-work">
    <section class="of-bay" aria-label="Agent bay"><div class="of-section-label"><strong>Agent bay</strong><span id="of-bay-count">0 / 4 slots</span></div><div id="of-slots" class="of-slots"></div></section>
    <section class="of-yard" aria-label="Agent yard"><div class="of-section-label"><strong>Agent yard</strong><span>Arrow = exit · number = orders</span></div><div id="of-cells" class="of-cells"></div></section>
    <div id="of-bots" class="of-bots" aria-label="Bots"></div>
   </div>
   <section id="of-result" class="of-result" aria-labelledby="of-result-title" hidden><div class="of-result-card"><div class="of-stars" id="of-stars" aria-label="Star rating"></div><h4 id="of-result-title">All clear!</h4><p id="of-result-score"></p><div class="of-result-actions"><button id="of-again" type="button">Replay level</button><button id="of-next" type="button" class="of-primary">Next level</button></div><a id="of-real" class="of-real" href="/projects/agents-demo/?view=agents&agent=fulfillment"><strong>In the real system →</strong><span id="of-real-note"></span></a></div></section>
  </div>
  <div id="of-legend" class="of-legend" aria-label="Skill colors"></div>
  <footer class="of-footer">Original browser puzzle · synthetic orders · no AI or GCP calls.<br>Mechanic inspired by <a href="https://play.google.com/store/apps/details?id=jp.co.goodroid.hyper.busflow" target="_blank" rel="noopener">Bus Traffic Fever</a>. Original art.</footer>
 </section>`;
}
export const orderFlowStyles = `
.arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])){width:92vw;height:90dvh;max-height:90dvh;--station:#a9d4bb}
.arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])) .screen-marquee{padding:8px 20px;min-height:52px}
.arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])) .screen-marquee span{display:none}
.arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])) .screen-marquee :is(h2,a,button){font-size:16px}
.arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])) .screen-rim{display:none}
.arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])) .screen-viewport{overflow:hidden;scrollbar-gutter:auto}
.arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])) :is(.station-panels,.station-panel,.console-body,.game-content){height:100%;min-height:0;max-width:none}
.arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])) .station-brief{display:none}
#order-flow-game{height:100%;min-height:0;display:grid;grid-template-rows:auto 44px 38px minmax(0,1fr) auto auto;gap:6px;padding:10px 18px;background:#191a27;color:#f4f1e7;font:14px/1.35 var(--sans,system-ui,sans-serif)}
#order-flow-game *{box-sizing:border-box}#order-flow-game [hidden]{display:none!important}
#order-flow-game :is(button,a){font:inherit;font-size:14px}#order-flow-game button{min-height:44px;border:1px solid #7d8c83;border-radius:9px;padding:7px 14px;background:#2d3934;color:#f5f2e9;cursor:pointer;touch-action:manipulation}
#order-flow-game button:hover:not(:disabled){background:#42554a}#order-flow-game button:disabled{opacity:.5;cursor:default}
#order-flow-game :is(button,a):focus-visible{outline:3px solid #efc67b;outline-offset:3px}
#order-flow-game a{color:#c6e7cf;text-underline-offset:3px}
.of-heading{display:grid;grid-template-columns:1fr auto;gap:2px 12px;align-items:center}
#order-flow-game h3{font-size:20px;line-height:1.2;margin:0}.of-heading p{grid-column:1/-1;margin:0;color:#ccd5ce;font-size:14px}
.of-toolbar{display:flex;align-items:center;gap:8px}.of-toolbar>span{flex:1;text-align:center;font-variant-numeric:tabular-nums}
.of-message{margin:0;align-self:center;color:#d5e3d7;font-size:14px;line-height:1.25}.of-message[data-loss=true]{color:#ffd1c5;font-weight:700}
.of-board{position:relative;min-height:0;display:grid;grid-template-rows:113px minmax(0,1fr);background:#f4f0e5;color:#243e35;border-radius:14px;border:1px solid #83978a;overflow:hidden;padding:10px 18px;gap:4px}
.of-section-label{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:14px;line-height:20px}.of-section-label>span{color:#53635a}.of-section-label strong{font-size:14px;font-weight:700}
.of-queue{min-height:0;max-width:790px;width:100%;margin:auto}.of-queue svg{display:block;width:100%;height:90px;overflow:visible}
.of-work{position:relative;min-height:0;display:grid;grid-template-rows:96px minmax(0,1fr);gap:6px;width:min(620px,100%);margin:auto;height:100%}
.of-bay,.of-yard{display:grid;grid-template-rows:20px minmax(0,1fr);gap:4px;min-height:0}.of-bay{border-bottom:1px solid #c6cfc1;padding-bottom:6px}
.of-slots{display:grid;gap:8px}.of-slot{border:2px dashed #8c9f8e;border-radius:12px;background:#e3e9da;display:flex;align-items:end;justify-content:center;min-height:0}
.of-slot.is-stuck{border:3px solid #ad3d31;background:#f3d7c8}.of-cells{display:grid;gap:6px;min-height:0}.of-cell{border:1px solid #d5d7c8;border-radius:12px;background:#e9e7db}
.of-bots{position:absolute;inset:0;pointer-events:none}
#order-flow-game .of-bot{position:absolute;left:0;top:0;padding:0;min-height:44px;pointer-events:auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;border:2px solid #263e35;background:var(--bot);color:#fffdf4;border-radius:14px;box-shadow:0 3px 0 #263e3540;transition:transform 160ms ease-out,opacity 140ms ease-out;user-select:none;-webkit-user-select:none}
#order-flow-game .of-bot:hover:not(:disabled){background:var(--bot);filter:brightness(1.08)}#order-flow-game .of-bot[aria-disabled=true]{box-shadow:none;border-style:dashed}
.of-bot .of-face{width:32px;height:16px;flex:none;fill:none;stroke:currentColor;stroke-width:2.5;stroke-linecap:round}
.of-bot .of-arrow{position:absolute;width:18px;height:18px;right:-5px;top:-8px;background:#fffdf4;color:#253e34;border-radius:5px;box-shadow:0 1px 0 #263e3550;padding:2px}
.of-bot .of-arrow svg{display:block;width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}
.of-bot .of-count{display:flex;align-items:center;justify-content:space-between;width:100%;padding:0 7px;font-size:14px;line-height:18px}.of-count strong{font-size:18px}
.of-hop{position:absolute;display:grid;place-items:center;width:26px;height:26px;border:2px solid #fffdf4;border-radius:50%;background:var(--bot);color:#fffdf4;font-size:14px;font-weight:700;pointer-events:none;animation:of-hop 180ms ease-out both}
@keyframes of-hop{from{transform:translateY(-55px) scale(.75);opacity:1}to{transform:translateY(8px) scale(1);opacity:0}}
#order-flow-game .of-bot.is-blocker{outline:3px solid #ae3d30;outline-offset:2px}.of-bot[data-bay=true]{border-style:solid!important}
.of-legend{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:6px 20px;font-size:14px}.of-legend span{display:flex;align-items:center;gap:6px}.of-legend b{display:inline-grid;place-items:center;border-radius:5px;width:22px;height:22px;background:var(--bot);color:#fffdf4;font-size:14px}
.of-footer{text-align:center;font-size:14px;color:#bdcbc1;line-height:1.3}.of-footer a{font-size:14px!important}
.of-result{position:absolute;inset:0;z-index:5;background:#142b25c9;display:grid;place-items:center;padding:12px}
.of-result-card{width:min(410px,100%);padding:22px;border:1px solid #c3d0bd;border-radius:16px;background:#fffaf0;color:#243e35;text-align:center;box-shadow:0 12px 30px #14251f30}
#order-flow-game h4{font-size:24px;margin:8px 0}.of-result-card p{font-size:14px;margin:8px 0 14px}.of-stars{display:flex;justify-content:center;gap:10px}.of-stars svg{width:32px;height:32px;fill:#bd7a15;stroke:#8b5a10;stroke-width:1.5}.of-stars svg[data-empty=true]{fill:none;stroke:#768875}
.of-result-actions{display:flex;gap:8px;justify-content:center;margin:10px 0 18px}#order-flow-game .of-primary{background:#21653f;color:#fffdf4}.of-real{display:block;border-top:1px solid #bdc9b7;padding-top:14px;color:#245f3b!important;text-decoration:none}.of-real strong{display:block;font-size:18px;text-decoration:underline}.of-real span{display:block;font-size:14px;margin-top:6px}
@media(max-width:700px){
 .arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])){width:100vw;height:100dvh;max-height:100dvh}
 .arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])) .screen-marquee{min-height:48px;padding:6px 10px}
 .arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])) .screen-home{display:none}
 #order-flow-game{padding:8px;gap:5px;grid-template-rows:auto 44px 43px minmax(0,1fr) auto auto}
 #order-flow-game h3{font-size:18px}.of-toolbar{gap:5px}#order-flow-game .of-toolbar button{padding:6px 9px}
 .of-board{padding:8px;grid-template-rows:113px minmax(0,1fr);gap:2px;border-radius:12px}.of-work{grid-template-rows:88px minmax(0,1fr);gap:6px}
 .of-slots{gap:5px}.of-cells{gap:5px}.of-section-label{gap:3px}.of-section-label>span{font-size:14px}
 .of-legend{gap:4px 12px}.of-footer{font-size:14px}.of-result-card{padding:17px}.of-result-actions{margin:10px 0 12px}.of-real{padding-top:10px}
}
@media(max-height:740px){#order-flow-game{gap:3px;padding-block:6px}.of-board{padding-block:6px}.of-work{grid-template-rows:81px minmax(0,1fr)}.of-result-card{padding:14px}}
@media(prefers-reduced-motion:reduce){#order-flow-game *{transition:none!important;animation:none!important}}
`;
