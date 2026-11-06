export function renderOrderFlowGame(): string {
 return `<section id="order-flow-game" aria-label="Order Flow puzzle" hidden>
  <header class="of-heading"><button id="of-exit" class="of-exit" type="button" aria-label="Back to arcade">Back</button><div class="of-titleblock"><h3 id="of-title">Front first</h3><p id="of-caption">Match the front. Full bots leave.</p></div><div class="of-budget"><strong id="of-moves" aria-label="0 of 4 moves">0 / 4</strong><span id="of-target">2 moves for 3 stars</span></div><button id="of-level" type="button" aria-label="Choose level">1 / 10</button></header>
  <div class="of-toolbar"><button id="of-undo" type="button" disabled>Undo 3</button><button id="of-replay" type="button">Retry</button><button id="of-sound" type="button" aria-pressed="false">Sound off</button><div class="of-overflow"><button id="of-more" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="of-menu" aria-label="More options">⋯</button><div id="of-menu" class="of-menu" role="region" aria-label="Planning tools" hidden><p id="of-proof" aria-live="polite"></p><button id="of-hint" type="button">Next move?</button><button id="of-fast" type="button" aria-pressed="false" disabled>Hold to speed up</button><p class="of-menu-note">Hints are optional and do not change stars.</p></div></div></div>
  <div class="of-feedback"><p id="of-message" role="status" aria-live="polite" aria-atomic="true">Tap a bot with a clear arrow.</p><span id="of-queued" role="status"></span></div>
  <div class="of-board" id="of-board">
   <section class="of-queue" aria-label="Order queue"><div class="of-section-label"><strong id="of-front">Order queue</strong><span id="of-orders"></span></div><svg id="of-belt" role="img" aria-label="Order belt" viewBox="0 0 360 118"></svg><span id="of-memory-state" class="of-memory-description" hidden></span></section>
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
   <section id="of-risk" class="of-outcome" role="dialog" aria-modal="true" aria-labelledby="of-risk-title" aria-describedby="of-risk-text" hidden><div class="of-result-card"><h4 id="of-risk-title">That move is a dead end</h4><p id="of-risk-text"></p><p>No move spent. Your board is unchanged.</p><div class="of-result-actions"><button id="of-risk-cancel" class="of-primary" type="button">Keep planning</button><button id="of-risk-play" type="button">Play anyway</button></div></div></section>
  </div>
  <div id="of-legend" class="of-legend" aria-label="Skill colors"></div>
  <footer class="of-footer">Original puzzle · synthetic orders · no AI/GCP calls.<br>Mechanic inspired by <a href="https://play.google.com/store/apps/details?id=jp.co.goodroid.hyper.busflow" target="_blank" rel="noopener">Bus Traffic Fever</a>. Original art.</footer>
 </section>`;
}
export const orderFlowStyles = `
.arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])){width:96vw;max-width:1280px;height:96dvh;max-height:960px;--station:#e0b15a;background:#3c2a1c;border-color:#6b4e32;color:#f6ead8}
.arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])) .screen-marquee{padding:8px 16px;min-height:48px;background:linear-gradient(180deg,#5c4332,#3f2c1e);border-bottom:1px solid #6b4e32;color:#f6ead8}
.arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])) .screen-marquee span{display:none}
.arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])) .screen-marquee h2{color:#f8eedd;font-weight:800}
.arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])) .screen-marquee :is(h2,a,button){font-size:16px}
.arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])) .screen-exit{background:#6b4e32;color:#f8eedd;border:0;border-radius:999px;box-shadow:0 2px 0 #2a1c12}
.arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])) .screen-exit kbd{color:#f6ead8;border-color:#a07a52}
.arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])) .screen-home{color:#f6ead8;background:transparent;box-shadow:none}
.arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])) .screen-rim{display:none}
.arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])) .screen-viewport{overflow:hidden;scrollbar-gutter:auto;scrollbar-color:#c9a56c #f3e2c4;background:#f3e2c4}
.arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])) :is(.station-panels,.station-panel,.console-body,.game-content){height:100%;min-height:0;max-width:none;background:#f3e2c4}
.arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])) .station-brief{display:none}
#order-flow-game{--of-sand:#f3e2c4;--of-tray:#e8d4b0;--of-ink:#3a2918;--of-ink-soft:#6d5640;--of-rim:#c9a56c;--of-card:#fff8ee;--of-gold:#e0b15a;height:100%;min-height:0;display:grid;grid-template-rows:auto auto auto minmax(0,1fr) auto auto;gap:6px;padding:8px 14px 10px;background:radial-gradient(1100px 420px at 50% -8%,#f8edd8,transparent 55%),var(--of-sand);color:var(--of-ink);font:16px/1.3 var(--sans,system-ui,sans-serif);color-scheme:light}
#order-flow-game *{box-sizing:border-box}
#order-flow-game [hidden]{display:none!important}
#order-flow-game :is(button,a){font:inherit;font-size:15px}
#order-flow-game button{min-height:44px;border:0;border-radius:999px;padding:8px 14px;background:var(--of-card);color:var(--of-ink);font-weight:800;cursor:pointer;touch-action:manipulation;box-shadow:0 3px 0 var(--of-rim);white-space:nowrap}
#order-flow-game button:hover:not(:disabled):not(.of-bot){background:#fff}
#order-flow-game button:disabled{opacity:.5;cursor:default}
#order-flow-game :is(button,a):focus-visible{outline:3px solid var(--of-gold);outline-offset:2px}
#order-flow-game ::selection{background:#e7c27a;color:#3a2918}
#order-flow-game a{color:#1f6b40;font-weight:700;text-underline-offset:3px}
.of-heading{display:grid;grid-template-columns:minmax(0,1fr) auto auto;align-items:center;gap:4px 14px}
.of-exit{display:none}
.of-titleblock{min-width:0}
#order-flow-game h3{font-size:clamp(20px,2.4vw,28px);font-weight:800;letter-spacing:-.03em;line-height:1.05;margin:0}
.of-heading p{margin:3px 0 0;color:var(--of-ink-soft);font-size:14px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.of-budget{text-align:right;font-variant-numeric:tabular-nums}
.of-budget strong{display:block;font-size:clamp(28px,4vw,40px);font-weight:800;letter-spacing:-.04em;line-height:.9}
.of-budget span{display:block;margin-top:3px;color:var(--of-ink-soft);font-size:14px;font-weight:700}
#of-moves.is-overflow{color:#9d341f}
#of-level{min-width:68px;padding-inline:12px;font-variant-numeric:tabular-nums;font-size:16px}
.of-toolbar{display:flex;align-items:center;gap:8px;position:relative;z-index:4}
.of-overflow{position:relative;margin-left:auto;flex:none}
#of-more{width:44px;padding:0;font-size:22px;line-height:1}
.of-menu{position:absolute;top:calc(100% + 8px);right:0;z-index:2;width:min(280px,78vw);display:flex;flex-direction:column;gap:8px;padding:12px;background:var(--of-card);border-radius:18px;box-shadow:0 16px 36px #3a291844,inset 0 0 0 2px #ead7b4}
.of-menu button{width:100%;border-radius:12px;text-align:left}
#of-proof{margin:0;padding:8px 10px;border-radius:12px;background:#f3e6cc;color:var(--of-ink);font-size:14px;font-weight:800;line-height:1.3}
#of-proof:empty{display:none}
#of-proof[data-kind=deadend],#of-proof[data-kind=budget]{background:#f6d2c4;color:#7a2e22}
.of-menu-note{margin:0;color:var(--of-ink-soft);font-size:14px;line-height:1.3}
.of-feedback{display:flex;align-items:flex-start;gap:8px;min-width:0;position:relative}
#of-message{flex:1;min-width:0;margin:0;color:#5c4632;font-size:15px;font-weight:700;line-height:1.3}
#of-queued:empty{display:none}
#of-queued:not(:empty){flex:none;background:var(--of-ink);color:#f8eedd;border-radius:999px;padding:4px 10px;font-size:14px;font-weight:800}
.of-board{position:relative;min-height:0;display:flex;flex-direction:column;gap:8px;background:transparent;border:0;overflow:hidden;color:var(--of-ink);color-scheme:light}
.of-section-label{display:flex;justify-content:space-between;align-items:baseline;gap:8px;min-height:20px;font-size:14px;font-weight:700;color:var(--of-ink-soft)}
.of-section-label strong{font-size:14px;font-weight:800;color:var(--of-ink)}
.of-queue,.of-handoff,.of-work{width:min(900px,100%);margin-inline:auto}
.of-queue{flex:none;padding:8px 12px 6px;background:var(--of-tray);border-radius:22px;box-shadow:inset 0 0 0 3px var(--of-rim),0 8px 16px #6b4c2414}
.of-queue svg{display:block;width:100%;height:108px;overflow:visible}
.of-queue svg[data-layout="straight"]{height:80px}
.of-memory-description{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
.of-handoff{flex:none;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 12px;background:var(--of-tray);border-radius:18px;box-shadow:inset 0 0 0 3px var(--of-rim)}
.of-handoff>div:first-child{display:flex;flex-direction:column;font-size:14px;font-weight:800;white-space:nowrap}
.of-bag-slots{display:flex;gap:6px;padding:6px;background:#5c4636;border-radius:14px;box-shadow:inset 0 2px 4px #2a1c1255}
.of-bag-slot{width:36px;height:36px;border-radius:9px;background:#3f3126;box-shadow:inset 0 3px 5px #2a1c1288;display:grid;place-items:center;color:#fffaf3}
.of-bag-slot.is-filled{background:linear-gradient(180deg,#79b7e4,#3275ac);box-shadow:inset 0 1px 0 #fff8,0 3px 0 #1d4d76}
.of-bag-slot svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.8}
.of-collect{font-size:14px;font-weight:800;color:var(--of-ink-soft)}
.of-work{position:relative;min-height:0;flex:1;display:grid;grid-template-rows:auto minmax(0,1fr);gap:8px;align-items:stretch}
.of-bay,.of-yard{display:grid;grid-template-rows:20px minmax(0,1fr);gap:4px;min-height:0;background:transparent}
.of-slots{height:124px;display:grid;grid-template-columns:repeat(var(--slot-count),1fr);gap:8px;padding:8px;background:var(--of-tray);border-radius:22px;box-shadow:inset 0 0 0 3px var(--of-rim),0 8px 16px #6b4c2418}
.of-slot{position:relative;border:0;border-radius:18px;min-height:0;background:linear-gradient(180deg,#dcc6a0,#cbb488);box-shadow:inset 0 7px 12px #7a5a3033,inset 0 -3px 0 #f8efdc}
.of-slot.is-stuck{background:#f0cbbd;box-shadow:inset 0 0 0 3px #c44832,inset 0 7px 12px #c4483226}
.of-socket{position:absolute;left:50%;top:54%;width:48%;height:62%;transform:translate(-50%,-50%);border-radius:16px;background:linear-gradient(180deg,#f4e6cc,#d9c29a);box-shadow:inset 0 7px 8px #8a684048,inset 0 0 0 2px #c9b08a,0 1px 0 #fff6}
.of-cells{min-height:calc(var(--yard-rows, 2) * 60px + 8px);max-height:calc(var(--yard-rows, 2) * 140px);display:grid;gap:8px;padding:8px;background:var(--of-tray);border-radius:22px;box-shadow:inset 0 0 0 3px var(--of-rim),0 8px 16px #6b4c2418}
.of-cell{position:relative;border:0;border-radius:16px;background:linear-gradient(180deg,#fbf4e4,#f0e2c8);box-shadow:inset 0 2px 0 #fffaf0,inset 0 -4px 8px #b0895524}
.of-cell::after{content:"";position:absolute;inset:18% 14%;border-radius:18px;background:linear-gradient(180deg,#f7ecd4,#e4cfae);box-shadow:inset 0 7px 8px #a7845544,inset 0 0 0 2px #e7d5b4,0 1px 0 #fff8}
.of-bots{position:absolute;inset:0;pointer-events:none}
#order-flow-game .of-bot{position:absolute;left:0;top:0;padding:0;min-height:44px;pointer-events:auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;overflow:visible;border:0;border-radius:22px;background:var(--bot);background:linear-gradient(180deg,color-mix(in srgb,#fff 34%,var(--bot)) 0%,var(--bot) 46%,color-mix(in srgb,#000 22%,var(--bot)) 100%);color:#fffaf3;box-shadow:inset 0 2px 0 #fff6,inset 0 -3px 0 #00000022,0 5px 0 color-mix(in srgb,#000 28%,var(--bot)),0 9px 14px #3a291840;user-select:none;-webkit-user-select:none}
#order-flow-game .of-bot::before{content:"";position:absolute;left:12%;right:12%;top:7%;height:26%;border-radius:999px;background:linear-gradient(#ffffff8c,#fff0);pointer-events:none}
#order-flow-game .of-bot[data-skill="picker"]{border-radius:18%}
#order-flow-game .of-bot[data-skill="support"]{border-radius:28%}
#order-flow-game .of-bot[data-skill="courier"]{border-radius:42% 42% 18% 18%}
#order-flow-game .of-bot[data-skill="inventory"]{border-radius:12%}
#order-flow-game .of-bot[data-skill="memory"]{border-radius:50%}
#order-flow-game .of-bot:hover:not(:disabled){filter:brightness(1.06)}
#order-flow-game .of-bot[aria-disabled="true"][data-bay="false"]{filter:saturate(.82)}
#order-flow-game .of-bot.is-queued{outline:3px solid #b36a13;outline-offset:3px}
#order-flow-game .of-bot[data-bay="true"]{box-shadow:inset 0 2px 0 #fff6,inset 0 -3px 0 #00000022,0 2px 0 color-mix(in srgb,#000 32%,var(--bot)),0 4px 8px #3a291830}
.of-bot .of-face{width:48%;height:22%;flex:none;fill:none;stroke:currentColor;stroke-width:2.6;stroke-linecap:round;filter:drop-shadow(0 1px 0 #0003)}
.of-bot .of-arrow,.of-bot .of-lock{position:absolute;width:clamp(24px,calc(var(--piece-size) * .28),34px);height:clamp(24px,calc(var(--piece-size) * .28),34px);right:-4px;top:-4px;display:grid;place-items:center;background:#fffaf3;color:#3a2918;border:0;border-radius:50%;padding:4px;box-shadow:0 2px 0 var(--of-rim),0 3px 6px #3a291833}
.of-bot .of-lock{left:-4px;right:auto;background:var(--lock);color:#fffaf3;box-shadow:0 2px 0 #2a1c12aa}
.of-arrow svg,.of-lock svg{display:block;width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
.of-bot .of-count{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;width:100%;padding:0;font-size:clamp(14px,calc(var(--piece-size) * .2),18px);font-weight:800;line-height:1;text-shadow:0 1px 0 #0003}
.of-letter{display:inline-flex;align-items:center;gap:3px}
.of-shape{width:.68em;height:.68em;flex:none;background:#fffaf3;box-shadow:inset 0 0 0 1px #0002}
.of-bot[data-skill="picker"] .of-shape,.of-legend [data-skill="picker"] .of-shape{border-radius:2px}
.of-bot[data-skill="support"] .of-shape,.of-legend [data-skill="support"] .of-shape{border-radius:50%}
.of-bot[data-skill="courier"] .of-shape,.of-legend [data-skill="courier"] .of-shape{border-radius:2px 2px 46% 46%}
.of-bot[data-skill="inventory"] .of-shape,.of-legend [data-skill="inventory"] .of-shape{width:.9em;height:.5em;border-radius:2px}
.of-bot[data-skill="memory"] .of-shape,.of-legend [data-skill="memory"] .of-shape{border-radius:50%;background:transparent;box-shadow:inset 0 0 0 2px #fffaf3}
.of-count strong{font-size:clamp(18px,calc(var(--piece-size) * .34),36px);font-variant-numeric:tabular-nums}
.of-release{position:absolute;left:10%;right:10%;bottom:8%;background:#fffaf3;color:#3a2918;border-radius:999px;font-size:14px;font-weight:800;line-height:1.15;padding:2px 0;text-align:center;text-shadow:none;box-shadow:0 2px 0 #0002}
#order-flow-game .of-bot[data-skill="memory"][data-bay="true"]{justify-content:flex-start;padding-top:4px}
.of-bot[data-skill="memory"][data-bay="true"] .of-count strong{display:none}
.of-bot[data-skill="memory"][data-bay="true"] .of-face{height:18%}
.of-release{left:50%;right:auto;transform:translateX(-50%);width:max-content;padding-inline:4px}
#order-flow-game .of-bot.is-hint{outline:4px solid #c47a12;outline-offset:4px}
.of-hop{position:absolute;top:0;left:0;display:grid;place-items:center;width:26px;height:26px;border:2px solid #fffaf3;border-radius:7px;background:var(--bot);color:#fffaf3;font-size:14px;font-weight:800;pointer-events:none;z-index:2;box-shadow:0 3px 0 #0003;animation-duration:150ms;animation-timing-function:ease-out;animation-fill-mode:both}
@keyframes of-hop-a{from{transform:translateY(-16px);opacity:1}to{transform:translateY(16px);opacity:0}}
@keyframes of-hop-b{from{transform:translateY(-16px);opacity:1}to{transform:translateY(16px);opacity:0}}
#order-flow-game .of-bot.is-blocker{outline:3px solid #c44832;outline-offset:3px}
.of-legend{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:6px 16px;min-height:28px;color:var(--of-ink-soft);font-size:15px;font-weight:700}
.of-legend span{display:flex;align-items:center;gap:6px}
.of-legend b{display:inline-flex;align-items:center;justify-content:center;gap:3px;min-width:28px;height:28px;padding:0 7px;border-radius:9px;background:var(--bot);color:#fffaf3;font-size:14px;box-shadow:inset 0 1px 0 #fff7,0 2px 0 #0002}
.of-legend [data-skill="memory"]{border-radius:999px}
.of-legend [data-skill="courier"]{border-radius:11px 11px 7px 7px}
.of-legend [data-skill="picker"]{border-radius:6px}
.of-footer{text-align:center;font-size:14px;color:#5c4632;line-height:1.35}
.of-outcome{position:absolute;inset:0;z-index:5;background:#3a2918cc;display:grid;place-items:center;padding:12px}
.of-result-card{width:min(440px,100%);padding:22px;border:0;border-radius:22px;background:var(--of-card);color:var(--of-ink);text-align:center;box-shadow:0 18px 40px #2a1c1266,inset 0 0 0 3px #ead7b4}
#order-flow-game h4{font-size:26px;font-weight:800;letter-spacing:-.03em;margin:6px 0 8px}
.of-result-card p{font-size:15px;line-height:1.35;margin:8px 0 12px}
.of-stars{display:flex;justify-content:center;gap:8px}
.of-stars svg{width:32px;height:32px;fill:#d0891c;stroke:#8b5a10;stroke-width:1.5}
.of-stars svg[data-empty="true"]{fill:none;stroke:#b09774}
.of-result-actions{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin:14px 0 20px}
#order-flow-game .of-primary{background:linear-gradient(180deg,#3d9d64,#1f6b40);color:#fffaf3;box-shadow:0 4px 0 #145232;border-radius:14px}
.of-reference{padding-top:14px;border-top:1px solid #ead7b4}
.of-reference p{margin:0 0 8px}
#order-flow-game .of-reference a{color:#1f6b40;font-size:16px;display:block;padding:8px}
.of-reference a span{display:block;font-size:14px}
.of-loss-cause{padding:10px;background:#f6d2c4;color:#7a2e22;border-radius:12px;font-weight:800;font-size:15px}
.of-loss .of-result-card{box-shadow:0 18px 40px #2a1c1266,inset 0 0 0 3px #c44832}
.of-loss-note{color:#6d5640}
#order-flow-game .is-overflow{outline:3px solid #c44832;outline-offset:2px}
#order-flow-game #of-moves.is-overflow{outline:0}
.of-level-list{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin:12px 0}
#order-flow-game .of-level-list button{padding:8px 2px;border-radius:12px;display:flex;flex-direction:column;gap:2px;align-items:center;white-space:normal}
.of-level-list button strong{font-size:18px}
.of-level-list button span{font-size:14px;font-weight:700}
.of-level-list [aria-current="step"]{outline:3px solid #c47a12}
@media(min-width:701px){
 .of-work{grid-template-columns:minmax(160px,.72fr) minmax(0,3fr);grid-template-rows:minmax(0,1fr);gap:16px}
 .of-slots{height:auto;max-height:calc(var(--slot-count) * 112px);grid-template-columns:1fr;grid-template-rows:repeat(var(--slot-count),minmax(0,1fr))}
}
@media(max-width:700px){
 .arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])){width:100vw;height:100dvh;max-height:100dvh}
 .arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])) .screen-marquee{display:none}
 .arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])) .screen-home{display:none}
 #order-flow-game{padding:4px 8px;gap:3px}
 .of-heading{grid-template-columns:auto minmax(0,1fr) auto;grid-template-areas:"exit title level" "budget budget budget"}
 .of-exit{display:block;grid-area:exit;padding-inline:12px}
 .of-titleblock{grid-area:title}
 .of-budget{grid-area:budget;display:flex;align-items:baseline;justify-content:flex-start;gap:10px;text-align:left}
 .of-budget strong{font-size:24px}
 .of-budget span{margin-top:0}
 #of-level{grid-area:level}
 #order-flow-game h3{font-size:18px}
 #order-flow-game .of-toolbar button{padding:6px 10px;font-size:14px}
 .of-queue{padding:6px 8px 4px;border-radius:18px}
 .of-queue svg{height:108px}
 .of-slots{height:68px;gap:6px;padding:6px;border-radius:18px}
 .of-cells{gap:6px;padding:6px;border-radius:18px}
 .of-handoff{padding:6px 8px;gap:6px}
 .of-bag-slot{width:32px;height:32px}
 .of-legend{gap:3px 2px;font-size:14px}
 .of-legend span{gap:2px}.of-legend b{min-width:18px;height:22px;padding:0 2px}.of-legend .of-shape{display:none}
 .of-result-card{padding:16px}
 .of-result-actions{margin:10px 0 16px}
}
@media(max-height:740px){
 .arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])) .screen-marquee{padding-block:4px}
 #order-flow-game{gap:4px}
 .of-board{gap:6px}
 .of-queue svg{height:104px}
 .of-stars svg{width:26px;height:26px}
 .of-result-card{padding:14px}
}
@media(max-height:740px) and (min-width:701px){
 .of-budget strong{font-size:30px}
 #order-flow-game h3{font-size:22px}
}
@media(min-width:360px) and (max-width:700px){
 .of-work{grid-template-columns:84px minmax(0,1fr);grid-template-rows:minmax(0,1fr)}
 .of-bay,.of-yard{grid-template-rows:42px minmax(0,1fr)}
 .of-work .of-section-label{flex-direction:column;justify-content:flex-start;gap:0}
 .of-work .of-section-label span{font-size:14px;line-height:20px}
 .of-slots{height:auto;max-height:calc(var(--slot-count) * 92px);grid-template-columns:1fr;grid-template-rows:repeat(var(--slot-count),minmax(0,1fr))}
}
@media(max-width:359px){
 .of-board{overflow:auto}
 .of-work{flex:none;min-height:calc(124px + var(--yard-rows, 3) * 60px)}
 .of-outcome{position:fixed;inset:12px;overflow:auto}
}
@media(max-height:620px){
 .arcade-screen:has([data-station-panel="madrid-delivery-sim"]:not([hidden])) .screen-viewport{overflow:auto}
 #order-flow-game{min-height:600px}
 .of-outcome{position:fixed;inset:12px;overflow:auto}
 .of-result-card{margin:auto}
}
@media(prefers-reduced-motion:reduce){#order-flow-game *{transition:none!important;animation:none!important}}
`;
