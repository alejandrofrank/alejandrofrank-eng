export function renderIdentityGame(): string {
  return `<section id="identity-game" class="identity-mini" aria-labelledby="customs-title">
  <div class="idg-heading"><div><span class="idg-kicker">Catalog Match · inspection campaign</span><h3 id="customs-title">Catalog Customs</h3></div><span class="idg-badge">8 checkpoints / 35 declarations</span></div>
  <p class="idg-intro">Start at the stamp desk. Graduate to crowded shelves of almost-identical products. Find the one that actually fits — or prove that none does. Three citations close your shift.</p>
  <p data-js-note>Enable JavaScript to open the inspection desk.</p>
  <div data-customs-controls hidden>
    <div class="idg-dashboard"><span data-customs-progress></span><span data-customs-streak></span><span data-customs-errors></span></div>
    <ol class="idg-campaign-track" data-customs-track aria-label="Campaign checkpoints"></ol>
    <div class="idg-brief"><span data-customs-tier class="idg-kicker"></span><h4 data-customs-title tabindex="-1"></h4><p data-customs-brief></p></div>
    <div class="idg-desk">
      <aside class="idg-order"><div><span class="idg-paper-label">REQUESTED IDENTITY</span><strong data-customs-request tabindex="-1"></strong></div><div class="idg-order-rules"><h4>Gate rules</h4><p><b>Verified</b> means every required attribute agrees.</p><p><b>Conflict</b> means an explicit attribute differs.</p><p><b>Review</b> means evidence is missing or unsupported.</p><small>Size and pack count are separate. Never guess missing detail.</small></div></aside>
      <article class="idg-document" data-customs-document aria-labelledby="customs-document-title"><div class="idg-document-meta"><span data-customs-document-id></span><span data-customs-supplier></span></div><span class="idg-paper-label">SUPPLIER DECLARATION</span><h4 id="customs-document-title" data-customs-name tabindex="-1"></h4><div class="idg-document-lines" aria-hidden="true"><span></span><span></span><span></span></div><div class="idg-stamp-impression" data-customs-stamp hidden></div><p class="idg-document-footer">One listing. One decision.<br>The normalized audit appears after your stamp.</p></article>
      <div class="idg-lineup" data-customs-lineup hidden><p id="customs-shelf-instructions" class="idg-shelf-instructions">Select one declaration. You can change your selection until you commit.</p><div class="idg-product-shelf" data-customs-products role="group" aria-label="Product declarations"></div><button type="button" class="idg-no-match" data-customs-none aria-pressed="false">∅ No verified match</button></div>
    </div>
    <div class="idg-stamps" data-customs-stamps aria-label="Stamp the supplier document"><button type="button" data-customs-decision="yes"><span>✓</span> Approve</button><button type="button" data-customs-decision="no"><span>×</span> Reject</button><button type="button" data-customs-decision="uncertain"><span>?</span> Hold for review</button></div>
    <div class="idg-commit-bar" data-customs-commit-bar hidden><span data-customs-selection role="status">Select a declaration first.</span><button class="idg-next" type="button" data-customs-commit disabled>Commit inspection →</button></div>
    <div class="idg-hint-row"><button type="button" class="idg-hint-button" data-customs-hint>Give me a reasoning hint</button><span data-customs-hint-count></span></div><p class="idg-hint" data-customs-hint-text role="status" hidden></p>
    <div class="idg-feedback" id="customs-feedback" data-customs-feedback role="status" aria-live="polite" aria-atomic="true" tabindex="-1" hidden></div>
    <button class="idg-next" type="button" data-customs-next aria-describedby="customs-feedback" hidden>Next checkpoint →</button>
    <section class="idg-campaign-audit" data-customs-audit hidden aria-labelledby="customs-audit-title"><h4 id="customs-audit-title">Inspect every declaration</h4><p>The pinned repository matcher computed these checks. Open a declaration to see the attributes behind its verdict.</p><div data-customs-checks></div></section>
    <section class="idg-manifest" data-customs-manifest hidden aria-labelledby="customs-manifest-title"><h4 id="customs-manifest-title" tabindex="-1">End-of-shift manifest</h4><p data-customs-summary></p><ol data-customs-ledger></ol><button class="idg-next" type="button" data-customs-restart>Start a shuffled campaign</button></section>
  </div>
  <p class="idg-footnote">35 fictional declarations; real Catalog Match rules, with no cloud calls or model decisions. Replays shuffle shelf positions. Desk-inspection mechanic inspired by <a href="https://papersplea.se/presskit/" target="_blank" rel="noopener noreferrer">Papers, Please ↗</a>. Original interface and artwork.</p>
  </section>`;
}

export function renderGarmentGame(): string {
  return `<section id="garment-game" class="identity-mini" aria-labelledby="garment-title">
  <div class="idg-heading"><div><span class="idg-kicker">Vesti · attribute puzzle</span><h3 id="garment-title">Complete the rack</h3></div><span class="idg-badge">3 racks / 2 tries each</span></div>
  <p class="idg-intro">Choose the third garment. For <strong>each</strong> feature — shape, color and pattern — the three cards must be <strong>all the same or all different</strong>. Two matching and one different fails.</p>
  <p data-js-note>Enable JavaScript to complete the rack.</p>
  <div data-garment-controls hidden>
    <div class="idg-dashboard"><span data-garment-progress></span><span data-garment-score></span></div>
    <h4 class="idg-rack-title" data-garment-title tabindex="-1"></h4>
    <div class="idg-rack" aria-label="The three-card rack"><div class="idg-fixed-card" data-garment-first></div><div class="idg-fixed-card" data-garment-second></div><div class="idg-slot" data-garment-slot><span>?</span><small>Your choice</small></div></div>
    <p class="idg-pick-label">Choose one from the rail</p>
    <div class="idg-garment-options" data-garment-options role="group" aria-label="Candidate garments"></div>
    <div class="idg-garment-actions"><button type="button" class="idg-next" data-garment-check disabled>Check this rack</button><span data-garment-attempts>2 tries left</span></div>
    <div class="idg-feedback" id="garment-feedback" data-garment-feedback role="status" aria-live="polite" aria-atomic="true" hidden></div>
    <ul class="idg-attribute-results" data-garment-evidence hidden aria-label="Attribute checks"></ul>
    <button type="button" class="idg-next" data-garment-next aria-describedby="garment-feedback" hidden>Next rack →</button>
    <div class="idg-garment-finish" data-garment-finish hidden><h4 tabindex="-1" data-garment-finish-title>Rail complete</h4><p data-garment-summary></p><button type="button" class="idg-next" data-garment-restart>Try the rail again</button></div>
  </div>
  <p class="idg-footnote"><strong>Synthetic attribute puzzle — not segmentation or AI retrieval.</strong> It makes multiple constraints inspectable; Vesti's image pipeline remains in development. Feature-rule mechanic inspired by <a href="https://playmonster.com/product/set/" target="_blank" rel="noopener noreferrer">SET ↗</a>. Original garment drawings.</p>
  </section>`;
}

export const identityStyles = `
:is(#identity-game,#garment-game){--idg-green:#ace0bd;--idg-red:#f3b2a5;--idg-gold:#efcd8c;--idg-paper:#e8e3d4;--idg-ink:#253333;margin:24px 0 10px;padding:24px;border:1px solid #49534f;border-radius:12px;background:#192320;color:#e9eee7;min-width:0}
:is(#identity-game,#garment-game) [hidden]{display:none!important}
:is(#identity-game,#garment-game) .idg-heading{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
:is(#identity-game,#garment-game) h3{font-size:23px;margin:5px 0 0;letter-spacing:-.03em;color:inherit}
:is(#identity-game,#garment-game) .idg-kicker{font:10px/1.5 var(--mono,monospace);letter-spacing:.12em;text-transform:uppercase;color:#c1d0c3}
:is(#identity-game,#garment-game) .idg-badge{font:11px/1.5 var(--mono,monospace);color:#cad5c9;border:1px solid #4e5b50;border-radius:4px;padding:5px 8px}
:is(#identity-game,#garment-game) .idg-intro{font-size:14px;line-height:1.65;margin:14px 0 22px;max-width:76ch;color:#d0d9ce}
:is(#identity-game,#garment-game) .idg-dashboard{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;border-bottom:1px solid #4c5a51;padding-bottom:12px;font:11px/1.5 var(--mono,monospace);color:#d0d9ce}
:is(#identity-game,#garment-game) button{font:inherit;cursor:pointer;min-height:44px}
:is(#identity-game,#garment-game) button:disabled{cursor:default;opacity:.55}
:is(#identity-game,#garment-game) button:focus-visible,:is(#identity-game,#garment-game) a:focus-visible{outline:3px solid #f4d587;outline-offset:4px}
#identity-game .idg-shifts{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:0;margin:16px 0;list-style:none;font:11px/1.5 var(--mono,monospace)}
#identity-game .idg-shifts li{border:1px solid #47574d;padding:8px;color:#aab8ac;border-radius:4px}
#identity-game .idg-shifts li span{margin-right:7px;opacity:.7}
#identity-game .idg-shifts [aria-current=step]{border-color:#a9d4b1;background:#263d2e;color:#d8eadb}
#identity-game .idg-desk{display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);gap:26px;padding:25px 22px;background:#111b18;border:1px solid #405047;border-radius:7px}
#identity-game .idg-order{padding:16px 18px;background:#bac7b0;color:#22362a;border-top:6px solid #5f7a60;box-shadow:0 7px 0 #0c1511;align-self:start}
#identity-game .idg-paper-label{display:block;font:9px/1.5 var(--mono,monospace);letter-spacing:.12em;margin-bottom:14px}
#identity-game .idg-order strong{font-size:18px;line-height:1.4;display:block}
#identity-game .idg-order hr{border:0;border-top:1px solid #7e947e;margin:17px 0}
#identity-game .idg-order h4{font-size:13px;margin:0 0 10px;color:inherit}
#identity-game .idg-order p{font-size:11px;line-height:1.5;margin:8px 0;color:inherit}
#identity-game .idg-order small{font-size:10px;line-height:1.5;display:block;margin-top:15px;color:#354c39}
#identity-game .idg-document{position:relative;min-height:290px;padding:19px;background:var(--idg-paper);color:var(--idg-ink);box-shadow:4px 5px 0 #747f6a,8px 10px 0 #263b2d;display:flex;flex-direction:column}
#identity-game .idg-document-meta{display:flex;justify-content:space-between;gap:8px;border-bottom:1px solid #aab2a2;margin-bottom:20px;padding-bottom:9px;font:9px/1.4 var(--mono,monospace)}
#identity-game .idg-document h4{font-size:21px;line-height:1.35;letter-spacing:-.02em;color:var(--idg-ink);margin:0 0 25px;max-width:20ch;overflow-wrap:anywhere}
#identity-game .idg-document-lines{display:grid;gap:9px;max-width:80%;opacity:.4;margin-bottom:26px}
#identity-game .idg-document-lines span{border-bottom:1px solid #788875}
#identity-game .idg-document-lines span:nth-child(2){width:75%}
#identity-game .idg-document-footer{font:9px/1.6 var(--mono,monospace);color:#52634e;margin:auto 0 0}
#identity-game .idg-stamp-impression{font:bold 15px/1.4 var(--mono,monospace);text-transform:uppercase;align-self:flex-end;margin:0 0 18px;padding:5px 9px;border:3px double currentColor;transform:rotate(-7deg);color:#21613c}
#identity-game .idg-stamp-impression[data-decision=no]{color:#9d3829}
#identity-game .idg-stamp-impression[data-decision=uncertain]{color:#7d570f}
#identity-game .idg-stamps{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:20px 0}
#identity-game .idg-stamps button{border:1px solid currentColor;border-bottom-width:4px;border-radius:5px;background:#1e3024;color:var(--idg-green);padding:11px 8px;font:600 12px/1.35 var(--mono,monospace)}
#identity-game .idg-stamps button span{font-size:17px;margin-right:5px}
#identity-game .idg-stamps [data-customs-decision=no]{color:var(--idg-red);background:#352724}
#identity-game .idg-stamps [data-customs-decision=uncertain]{color:var(--idg-gold);background:#342e21}
#identity-game .idg-stamps button:not(:disabled):active{border-bottom-width:1px;transform:translateY(3px)}
:is(#identity-game,#garment-game) .idg-feedback{padding:13px 15px;margin:15px 0;border-left:3px solid var(--idg-green);background:#26362b;font-size:13px;line-height:1.65;color:#e2eddf}
:is(#identity-game,#garment-game) .idg-feedback[data-correct=false]{border-left-color:var(--idg-gold);background:#342f24}
#identity-game .idg-audit{overflow-x:auto;margin-bottom:16px}
#identity-game table{width:100%;border-collapse:collapse;font:10px/1.5 var(--mono,monospace);text-align:left}
#identity-game caption{text-align:left;font-size:11px;color:#d1decf;margin:8px 0 10px}
#identity-game th,#identity-game td{padding:7px 8px;border-bottom:1px solid #415047;vertical-align:top;overflow-wrap:anywhere}
#identity-game th{color:#bdcdbf}
#identity-game tr[data-result=conflict] td:last-child{color:var(--idg-red)}
#identity-game tr[data-result=missing] td:last-child,#identity-game tr[data-result=unsupported] td:last-child{color:var(--idg-gold)}
:is(#identity-game,#garment-game) .idg-next{display:inline-block;border:1px solid #718873;border-radius:5px;background:#314535;color:#e5efe1;padding:10px 16px;font-size:12px;font-weight:600}
:is(#identity-game,#garment-game) .idg-next:not(:disabled):hover{background:#415b46}
#identity-game .idg-manifest{padding:18px;border:1px solid #6a8069;border-radius:5px;margin-top:20px;background:#202d24}
:is(#identity-game,#garment-game) .idg-manifest h4,:is(#identity-game,#garment-game) .idg-garment-finish h4{font-size:17px;margin:0 0 8px;color:inherit}
#identity-game .idg-manifest p{font-size:13px;margin:0 0 14px}
#identity-game .idg-manifest ol{padding-left:20px;font-size:12px;line-height:1.6}
#identity-game .idg-manifest li{margin:10px 0}
#identity-game .idg-manifest li b{color:var(--idg-gold)}
:is(#identity-game,#garment-game) .idg-footnote{font-size:11px;line-height:1.7;margin:22px 0 0;color:#aabbac}
:is(#identity-game,#garment-game) .idg-footnote a{color:#d2e0cc;text-decoration:underline;text-underline-offset:3px}
#garment-game{background:#24232b;border-color:#575261}
#garment-game .idg-dashboard{border-color:#514e5d}
#garment-game .idg-rack-title{font-size:15px;color:#e7e1eb;margin:20px 0 16px}
#garment-game .idg-rack{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;border-top:5px solid #8a8195;padding-top:15px}
#garment-game .idg-fixed-card,#garment-game .idg-slot{display:flex;flex-direction:column;align-items:center;text-align:center;padding:12px 7px;background:#e2ddd5;color:#292831;border:1px solid #e2ddd5;border-radius:5px;min-height:150px}
#garment-game .idg-slot{border:1px dashed #9f94b0;background:#302c3a;color:#ddd3e9;justify-content:center}
#garment-game .idg-slot>span{font:40px/1 var(--mono,monospace);margin-bottom:15px}
#garment-game .idg-slot[data-selected=true]{border-style:solid;background:#e2ddd5;color:#292831}
#garment-game svg{width:80px;height:80px;display:block;margin:0 auto 10px}
#garment-game .idg-card-name{font-size:11px;line-height:1.4;font-weight:600;display:block}
#garment-game .idg-card-detail{font:9px/1.5 var(--mono,monospace);display:block;margin-top:3px}
#garment-game .idg-pick-label{font:11px/1.5 var(--mono,monospace);color:#c1b7cc;margin:22px 0 10px}
#garment-game .idg-garment-options{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
#garment-game .idg-garment-options button{position:relative;border:1px solid #5f586e;background:#302d3a;color:#e2dce9;padding:14px 6px 10px;border-radius:5px;text-align:center;min-width:0}
#garment-game .idg-garment-options svg{width:59px;height:59px}
#garment-game .idg-garment-options button[aria-pressed=true]{border-color:#e0c887;box-shadow:inset 0 0 0 2px #e0c887;background:#3e3846}
#garment-game .idg-garment-options button:not(:disabled):hover{background:#403b4d;border-color:#bdb1cd}
#garment-game .idg-option-number{position:absolute;left:8px;top:6px;font:9px/1.5 var(--mono,monospace);color:#beb3cc}
#garment-game .idg-garment-actions{display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin:18px 0;font:11px/1.5 var(--mono,monospace);color:#c2b7ce}
#garment-game .idg-next{background:#42394e;border-color:#8e7ca4}
#garment-game .idg-next:not(:disabled):hover{background:#554865}
#garment-game .idg-attribute-results{list-style:none;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;padding:0;margin:14px 0 18px}
#garment-game .idg-attribute-results li{border:1px solid #54745b;background:#26352b;padding:10px;border-radius:4px;font-size:11px;line-height:1.6;min-width:0}
#garment-game .idg-attribute-results li[data-pass=false]{border-color:#ae8759;background:#3b3025}
#garment-game .idg-attribute-results strong{display:block;text-transform:capitalize}
#garment-game .idg-attribute-results small{display:block;color:#d2ccd5;font:9px/1.6 var(--mono,monospace);overflow-wrap:anywhere}
#garment-game .idg-garment-finish{border-top:1px solid #7f718e;margin-top:20px;padding-top:20px;font-size:13px}
#garment-game .idg-footnote{color:#bcb1c7}
#garment-game .idg-footnote a{color:#e0d3ed}
@media(max-width:600px){:is(#identity-game,#garment-game){padding:16px 12px}:is(#identity-game,#garment-game) h3{font-size:21px}#identity-game .idg-desk{gap:16px;padding:17px 12px;grid-template-columns:1fr}#identity-game .idg-order{padding:12px 14px}#identity-game .idg-order hr{margin:12px 0}#identity-game .idg-order p{display:inline;font-size:11px;margin-right:8px}#identity-game .idg-order p:after{content:' ';white-space:pre}#identity-game .idg-order small{margin-top:10px}#identity-game .idg-document{min-height:220px}#identity-game .idg-document h4{max-width:none;font-size:20px}#identity-game .idg-document-lines{margin-bottom:20px}#identity-game .idg-stamps{gap:6px}#identity-game .idg-stamps button{font-size:10px;padding:9px 4px}#identity-game .idg-stamps button span{display:block;font-size:17px;margin:0 0 3px}#identity-game .idg-shifts{gap:5px;font-size:9px}#identity-game .idg-shifts li{padding:7px 4px}#identity-game .idg-shifts li span{margin-right:3px}#garment-game .idg-rack{gap:7px}#garment-game .idg-fixed-card,#garment-game .idg-slot{padding:9px 4px;min-height:133px}#garment-game svg{width:62px;height:62px}#garment-game .idg-card-name{font-size:10px}#garment-game .idg-card-detail{font-size:8px}#garment-game .idg-attribute-results{grid-template-columns:1fr}#garment-game .idg-attribute-results li{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}#garment-game .idg-attribute-results strong{min-width:55px}}
#identity-game .idg-campaign-track{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:6px;margin:16px 0 22px;padding:0;list-style:none}
#identity-game .idg-campaign-track li{padding:8px 4px;border:1px solid #415448;border-radius:4px;text-align:center;color:#b8c8b9}
#identity-game .idg-campaign-track li span{display:block;font:12px/1.5 var(--mono,monospace)}
#identity-game .idg-campaign-track li small{display:block;font:9px/1.5 var(--mono,monospace)}
#identity-game .idg-campaign-track [aria-current=step]{border-color:#e2cf98;background:#3a3829;color:#f0e4ba}
#identity-game .idg-campaign-track [data-result=correct]{border-bottom:3px solid #9fd1a6}
#identity-game .idg-campaign-track [data-result=incorrect]{border-bottom:3px solid #e9a491}
#identity-game .idg-brief{margin:0 0 20px}
#identity-game .idg-brief h4{font-size:20px;line-height:1.35;letter-spacing:-.02em;margin:6px 0 8px;color:#e6ecdf}
#identity-game .idg-brief p{font-size:13px;line-height:1.65;color:#bacdba;margin:0;max-width:78ch}
#identity-game .idg-order-rules{margin-top:20px;border-top:1px solid #8b9c85;padding-top:15px}
#identity-game[data-mode=lineup] .idg-desk{display:block;padding:18px;background:#121d17}
#identity-game[data-mode=lineup] .idg-order{display:grid;grid-template-columns:1fr 1fr;gap:24px;box-shadow:none;margin-bottom:22px;padding:17px 20px}
#identity-game[data-mode=lineup] .idg-order strong{font-size:21px;line-height:1.4}
#identity-game[data-mode=lineup] .idg-order-rules{border:0;border-left:1px solid #8b9c85;padding:0 0 0 20px;margin:0}
#identity-game[data-mode=lineup] .idg-order p{margin:3px 0}
#identity-game .idg-shelf-instructions{font:11px/1.6 var(--mono,monospace);color:#b8cbb9;margin:0 0 15px}
#identity-game .idg-product-shelf{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;align-items:stretch}
#identity-game .idg-product{position:relative;display:flex;flex-direction:column;align-items:center;text-align:center;border:1px solid #64705f;border-bottom:4px solid #64705f;border-radius:5px;background:#d4d4bf;color:#243429;padding:10px 9px 12px;min-width:0;min-height:220px}
#identity-game .idg-product-number{font:8px/1.5 var(--mono,monospace);letter-spacing:.06em;color:#43533e;align-self:flex-start}
#identity-game .idg-product-art svg{display:block;width:74px;height:80px;margin:8px auto 10px}
#identity-game .idg-product strong{font-size:12px;line-height:1.5;font-weight:650;overflow-wrap:anywhere}
#identity-game .idg-product small{font:8px/1.6 var(--mono,monospace);color:#4d5d47;padding-top:10px;margin-top:auto}
#identity-game .idg-product:not(:disabled):hover{background:#e5e4cf;border-color:#becba9}
#identity-game .idg-product[aria-pressed=true]{outline:3px solid #ecd49a;outline-offset:2px;border-color:#5b644b;background:#eee6c8}
#identity-game .idg-product:disabled{opacity:1}
#identity-game .idg-product[data-verdict=yes]{border-bottom-color:#387648}
#identity-game .idg-product[data-verdict=no]{border-bottom-color:#9b5140}
#identity-game .idg-product[data-verdict=uncertain]{border-bottom-color:#9b741e}
#identity-game .idg-product-verdict{display:block;font:8px/1.5 var(--mono,monospace);text-transform:uppercase;font-weight:600;border-top:1px solid #9ba68c;padding-top:8px;margin-top:8px;width:100%}
#identity-game .idg-no-match{display:block;min-height:44px;width:100%;margin-top:14px;border:1px dashed #7b927a;border-radius:4px;background:#213126;color:#d1e1cd;font:12px/1.5 var(--mono,monospace);padding:10px}
#identity-game .idg-no-match[aria-pressed=true]{outline:2px solid #ecd49a;outline-offset:2px;background:#394430;color:#f3e9c6}
#identity-game .idg-commit-bar{display:flex;justify-content:space-between;align-items:center;gap:16px;margin:18px 0}
#identity-game .idg-commit-bar>span{font-size:12px;line-height:1.6;color:#cfdec8;max-width:60ch}
#identity-game .idg-commit-bar button{flex-shrink:0;background:#b8d2a5;color:#203020;border-color:#c9e2b6}
#identity-game .idg-commit-bar button:not(:disabled):hover{background:#cde3bd}
#identity-game .idg-hint-row{display:flex;align-items:center;justify-content:space-between;gap:12px;font:10px/1.5 var(--mono,monospace);color:#aac0a9;margin:16px 0 6px}
#identity-game .idg-hint-button{border:0;border-bottom:1px solid #7d9478;border-radius:0;background:transparent;color:#ceddc5;padding:6px 0;font-size:11px;min-height:44px;text-align:left}
#identity-game .idg-hint{font-size:12px;line-height:1.7;color:#e0d8b5;background:#363326;border-left:3px solid #c4b376;padding:12px 14px;margin:10px 0 20px}
#identity-game .idg-feedback:focus-visible,#identity-game [tabindex="-1"]:focus-visible{outline:2px solid #e4cf8c;outline-offset:4px}
#identity-game .idg-campaign-audit{margin:23px 0;border-top:1px solid #49604b;padding-top:20px}
#identity-game .idg-campaign-audit>h4{font-size:15px;margin:0 0 6px;color:#e3ecda}
#identity-game .idg-campaign-audit>p{font-size:11px;line-height:1.7;margin:0 0 15px;color:#b9cdb4}
#identity-game .idg-audit-entry{border:1px solid #49604b;border-radius:4px;margin:8px 0;background:#1c2b20}
#identity-game .idg-audit-entry summary{display:flex;align-items:center;gap:12px;padding:12px;cursor:pointer;font-size:11px;line-height:1.5;min-height:44px}
#identity-game .idg-audit-entry summary:after{content:'+';margin-left:auto;font:15px/1 var(--mono,monospace)}
#identity-game .idg-audit-entry[open] summary:after{content:'−'}
#identity-game .idg-audit-entry summary:focus-visible{outline:3px solid #e4cf8c;outline-offset:2px}
#identity-game .idg-audit-entry .idg-verdict{color:#b3d9b2;flex-shrink:0;font:9px/1.5 var(--mono,monospace);width:95px;text-transform:uppercase}
#identity-game .idg-audit-entry[data-verdict=no] .idg-verdict{color:#edb3a0}
#identity-game .idg-audit-entry[data-verdict=uncertain] .idg-verdict{color:#e6cd90}
#identity-game .idg-audit-entry>p{font-size:12px;line-height:1.6;margin:0 12px 12px;color:#cadbc3}
#identity-game .idg-audit-entry .idg-audit{margin:0 12px 14px}
@media(max-width:900px){#identity-game .idg-product-shelf{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(max-width:600px){#identity-game .idg-campaign-track{grid-template-columns:repeat(4,minmax(0,1fr));gap:5px}#identity-game .idg-campaign-track li{padding:5px 3px}#identity-game .idg-campaign-track li span,#identity-game .idg-campaign-track li small{display:inline;margin:0 3px}#identity-game .idg-brief h4{font-size:18px}#identity-game[data-mode=lineup] .idg-desk{padding:12px 9px}#identity-game[data-mode=lineup] .idg-order{grid-template-columns:1fr;gap:12px;padding:14px;margin-bottom:18px}#identity-game[data-mode=lineup] .idg-order strong{font-size:18px}#identity-game[data-mode=lineup] .idg-order-rules{padding:10px 0 0;border-left:0;border-top:1px solid #8b9c85}#identity-game .idg-product-shelf{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}#identity-game .idg-product{min-height:210px;padding:9px 7px 11px}#identity-game .idg-product strong{font-size:11px}#identity-game .idg-product-art svg{width:65px;height:70px}#identity-game .idg-commit-bar{flex-direction:column;align-items:stretch;gap:10px}#identity-game .idg-commit-bar button{width:100%}#identity-game .idg-audit-entry summary{gap:8px;padding:10px}#identity-game .idg-audit-entry .idg-verdict{width:70px;font-size:8px}#identity-game .idg-audit-entry summary strong{font-size:10px}#identity-game .idg-hint-row{font-size:9px}}
`;
