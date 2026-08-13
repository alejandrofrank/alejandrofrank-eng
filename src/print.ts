// ----------------------------------------------------------------------------
// Print. It's a CV site — someone will hit ctrl-P, and on screen this is a dark
// page whose content is revealed by an animation, which paper can't do.
//
// So printing /resume drops the chrome and prints the FULL TEXT of every role
// as one plain document: light palette, real headings, one role per page.
// The /timeline modal prints the single role you're looking at, diagram and all.
// ----------------------------------------------------------------------------

export const PRINT_STYLES = `
@media print {
  /* Paper is white and ink is expensive. */
  :root {
    --bg: #fff; --panel: #fff; --line: #c8c8c8;
    --fg: #111; --muted: #444; --accent: #0b6b4f;
  }
  body { background: #fff; color: #111; font-size: 11pt; }
  @page { margin: 16mm 14mm; }

  /* Chrome that means nothing on paper. */
  .rain, .mobius, .topnav, .resume-nav, .tlp-nav, .tlp-foot, .tlp-legend,
  .tabs, .timeline, .player-controls, .tlp-controls, .caption, .tlp-cap,
  .ft-toggle, .tlp-close, .tlp-backdrop, .tlp-lede, footer { display: none !important; }

  .wrap, .resume, .tlp-wrap { max-width: none; padding: 0; }
  a { color: inherit; text-decoration: none; }

  /* The dropdown is a screen affordance: on paper it's just open. */
  .fulltext { margin: 0; }
  .fulltext::details-content { content-visibility: visible !important; block-size: auto !important; }
  .ft-panel { border-left: none; padding: 0; margin: 0; max-width: none; }
  .ft-lede { font-style: italic; }
  .ft-beats { gap: 12px; margin-top: 14px; }
  .ft-beats li { break-inside: avoid; }
  .ft-h { display: block; font-size: 15pt; margin: 0 0 2px; }
  .ft-h small { display: block; font-size: 10pt; font-weight: 400; color: #444; margin-top: 2px; }

  /* /resume prints as a text CV: every role, each starting a fresh page. The
     diagram is a one-at-a-time animation — it doesn't survive the trip. */
  .resume .stage { display: none !important; }
  .resume .job-line { display: none !important; }
  .resume .ft-body[hidden] { display: block !important; }
  .resume .ft-body + .ft-body { break-before: page; }
  .resume .ft-body { padding-top: 2mm; }
  .resume-h1 { font-size: 20pt; margin-bottom: 2px; }
  .resume-lede { color: #444; margin-bottom: 18px; }
  .print-head { display: block !important; color: #444; font-size: 10pt; margin: 0 0 22px; }
  .print-head b { display: block; color: #111; font-size: 15pt; margin-bottom: 3px; }
  .print-head span + span::before { content: " · "; }

  /* /timeline: if a role is open, that role is what prints — not the chart
     behind it. Nothing open, and you get the chart you were looking at. */
  .tlp-modal:not(.open) { display: none !important; }
  .tlp-modal.open { position: static; display: block; }
  .tlp-dialog { position: static; width: auto; max-height: none; overflow: visible;
                margin: 0; padding: 0; border: none; border-radius: 0; box-shadow: none; }
  body:has(.tlp-modal.open) .tlp-wrap { display: none !important; }
  .tlp-dialog .ft-h { display: none; } /* the modal already prints role + period */

  /* A half-played diagram would print half-drawn; show the finished state, and
     drop the colour coding — most printers are black and white anyway. */
  .scene-scroll .scene-svg { min-width: 0; }
  .node .node-inner { opacity: 1 !important; transform: none !important; }
  .node-box { fill: #fff !important; stroke: #666 !important; }
  .node-label { fill: #111 !important; }
  .node-sub { fill: #555 !important; }
  .flow-path { stroke: #888 !important; stroke-dashoffset: 0 !important; opacity: 1 !important;
               filter: none !important; animation: none !important; }
  .flow-pulse { display: none; }
}
`;

// <details> content that the browser has collapsed can't be revealed by print
// CSS alone in every engine — so open it for real, then put it back.
export const PRINT_SCRIPT = `<script>
(function () {
  var reopened = [];
  function expand() {
    reopened = [];
    var ds = document.querySelectorAll('details.fulltext');
    for (var i = 0; i < ds.length; i++) {
      if (!ds[i].open) { ds[i].open = true; reopened.push(ds[i]); }
    }
  }
  function restore() {
    for (var i = 0; i < reopened.length; i++) reopened[i].open = false;
    reopened = [];
  }
  window.addEventListener('beforeprint', expand);
  window.addEventListener('afterprint', restore);
  // Safari fires neither; it does flip this media query.
  if (window.matchMedia) {
    var mq = window.matchMedia('print');
    var onChange = function (e) { if (e.matches) expand(); else restore(); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }
})();
</script>`;
