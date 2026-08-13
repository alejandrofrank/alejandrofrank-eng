// ----------------------------------------------------------------------------
// "Full text" — each role's keynote written out as prose, behind one dropdown,
// for readers who'd rather take a role in at once than beat by beat.
//
// Rendered on the server for EVERY role up front (only the active one is
// visible) so the copy is real HTML: crawlable, findable with ctrl-F,
// printable, and still there with JS off. /resume and /timeline share it.
// ----------------------------------------------------------------------------

/** The slice of a compiled scene this module needs (see resume/scene.py). */
export interface FullTextScene {
  id: string;
  title: string;
  role: string;
  period: string;
  summary: string;
  beats: { title: string; caption: string }[];
}

function esc(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * One <details> holding every role's prose; `activeId` picks the visible body
 * (the rest are `hidden` and swapped in by FullText.show on the client).
 */
export function renderFullText(scenes: readonly FullTextScene[], activeId?: string): string {
  const active = activeId ?? scenes[0]?.id;
  const bodies = scenes
    .map((s) => {
      const beats = s.beats
        .map(
          (b) =>
            `<li><h3 class="ft-beat-title">${esc(b.title)}</h3>` +
            `<p class="ft-beat-text">${esc(b.caption)}</p></li>`
        )
        .join("");
      return (
        `<article class="ft-body" data-scene="${esc(s.id)}"${s.id === active ? "" : " hidden"}>` +
        // Named on paper (where all roles print at once) and for crawlers; on
        // screen the company is already in the header right above.
        `<h2 class="ft-h">${esc(s.title)}<small>${esc(s.role)} · ${esc(s.period)}</small></h2>` +
        `<p class="ft-lede">${esc(s.summary)}</p>` +
        `<ol class="ft-beats">${beats}</ol>` +
        `</article>`
      );
    })
    .join("");

  return `<details class="fulltext">
        <summary class="ft-toggle"><span class="ft-caret" aria-hidden="true">▸</span> Full text <span class="ft-hint">read it in one go</span></summary>
        <div class="ft-panel">${bodies}</div>
      </details>`;
}

export const FULLTEXT_STYLES = `
  .fulltext { margin: 0 0 14px; }
  .ft-toggle { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; list-style: none; font-size: 13px; color: var(--fg); background: var(--panel); border: 1px solid var(--line); border-radius: 999px; padding: 5px 14px; width: fit-content; }
  .ft-toggle::-webkit-details-marker { display: none; }
  .ft-toggle:hover, .fulltext[open] .ft-toggle { border-color: var(--accent); color: var(--accent); }
  .ft-caret { display: inline-block; transition: transform .2s ease; }
  .fulltext[open] .ft-caret { transform: rotate(90deg); }
  .ft-hint { color: var(--muted); font-size: 11px; }
  .fulltext[open] .ft-hint { display: none; }
  .ft-panel { border-left: 1px solid var(--line); margin: 14px 0 2px; padding: 2px 0 2px 18px; max-width: 76ch; }
  .ft-body[hidden] { display: none; }
  .ft-h { display: none; } /* print only — see print.ts */
  .ft-lede { color: var(--fg); margin: 0; line-height: 1.6; }
  .ft-beats { list-style: none; counter-reset: ft; margin: 20px 0 0; padding: 0; display: flex; flex-direction: column; gap: 18px; }
  .ft-beats li { counter-increment: ft; position: relative; padding-left: 34px; }
  .ft-beats li::before { content: counter(ft); position: absolute; left: 0; top: 2px; width: 22px; height: 22px; border-radius: 50%; border: 1px solid var(--line); color: var(--muted); font-size: 11px; display: flex; align-items: center; justify-content: center; }
  .ft-beat-title { margin: 0 0 4px; font-size: 14px; font-weight: 600; color: var(--fg); }
  .ft-beat-text { margin: 0; color: var(--muted); font-size: 14px; line-height: 1.6; }
  /* Progressive enhancement: browsers that can interpolate to height:auto get a
     real slide-down; everywhere else the dropdown just opens. */
  @supports (interpolate-size: allow-keywords) {
    .fulltext { interpolate-size: allow-keywords; }
    .fulltext::details-content { block-size: 0; overflow: clip; transition: block-size .32s ease, content-visibility .32s allow-discrete; }
    .fulltext[open]::details-content { block-size: auto; }
  }
  @media (prefers-reduced-motion: reduce) {
    .ft-caret { transition: none; }
    .fulltext::details-content { transition: none; }
  }
  @media (pointer: coarse) { .ft-toggle { padding: 8px 15px; } }
`;

export const FULLTEXT_SCRIPT = `<script>
window.FullText = (function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Show the body for scene \`id\`, hide the rest. */
  function show(root, id) {
    if (!root) return;
    var bodies = root.querySelectorAll('.ft-body');
    for (var i = 0; i < bodies.length; i++) {
      bodies[i].hidden = bodies[i].getAttribute('data-scene') !== id;
    }
  }

  // Opening it means "I'd rather read" — hand control back (onOpen pauses the
  // animation) and bring the text into view once it has finished expanding.
  function wire(root, onOpen) {
    if (!root) return;
    root.addEventListener('toggle', function () {
      if (!root.open) return;
      if (onOpen) onOpen();
      var panel = root.querySelector('.ft-panel');
      setTimeout(function () {
        if (panel && panel.scrollIntoView) {
          panel.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
        }
      }, reduce ? 0 : 340);
    });
  }

  return { show: show, wire: wire };
})();
</script>`;
