import { PROJECTS, projectPath } from '../projects/catalog';
import { readingShell } from '../projects/page';
import { esc } from '../panels/helpers';
import { cabinetArt, PLAYER, STATION_ART } from './art';
import { playStyles } from './styles';

const CONCEPTS: Record<string, { name: string; task: string; lesson: string; steps: string[] }> = {
  bakiano: { name: 'Market run', task: 'Build a comparable shopping basket. Catch the stale price or mismatched pack before choosing the cheapest store.', lesson: 'A useful price needs identity, currency and time context.', steps: ['Basket', 'Compare', 'Decide'] },
  'gcp-ingestion-lab': { name: 'Delivery room', task: 'A file arrives twice. Then an older observation turns up. Which rows should make it into the warehouse?', lesson: 'Event delivery and correct warehouse state are different things.', steps: ['Receive', 'Deduplicate', 'Merge'] },
  'catalog-match-lab': { name: 'Same or different?', task: 'Three pairs. One rule: don’t let a similar name fool you. Match, reject, or ask for more evidence.', lesson: 'Similar words do not establish product identity.', steps: [] },
  'bigquery-query-guard': { name: 'Query budget', task: 'Keep the answer. Lose the unnecessary reads. A game about the work hidden behind a small result.', lesson: 'Output size, scan size, billed bytes and runtime are different measures.', steps: ['Query', 'Estimate', 'Guard'] },
  'ascii-art': { name: 'Pixel workshop', task: 'A tiny canvas, four colors, one good constraint. Draw a sprite, try another palette, then take it home.', lesson: 'With fewer pixels, every decision shows.', steps: [] },
  vesti: { name: 'Outfit puzzle', task: 'Swap one garment without losing the outfit. A puzzle about context, resemblance and useful alternatives.', lesson: 'Visual resemblance and a useful replacement are separate decisions.', steps: ['Look', 'Swap', 'Compare'] },
};

const isPlayable = (slug: string) => slug === 'catalog-match-lab' || slug === 'ascii-art';

export function renderPlayPage(origin: string): string {
  return readingShell('Project arcade', 'An illustrated arcade for Alejandro Frank’s projects. Play a catalog matching challenge, draw pixel art, and explore the work behind each cabinet.', '/play', origin, `
<header class="arcade-intro"><div><p class="eyebrow">A different way into the work</p><h1>Project arcade</h1></div><p>Pick a cabinet. Try an idea.<br>Follow it back to the real project.</p></header>
<section class="arcade-room" aria-label="Project arcade floor" id="arcade-room" hidden>
  <div class="room-topline"><div class="room-sign"><b aria-hidden="true">AF</b> AFTER HOURS</div><div class="room-status"><span>2 PLAYABLE</span><b class="status-divider" aria-hidden="true"> / </b> 4 CONCEPTS</div></div>
  <fieldset id="station-controls"><legend class="sr-only">Choose a project station</legend><div class="room-scroll"><div class="arcade-floor">
    <div class="stations">${PROJECTS.map((p, i) => `<div class="station" style="--station:${STATION_ART[p.slug].color}"><input type="radio" name="station" id="station-${p.slug}" value="${p.slug}"${p.slug === 'catalog-match-lab' ? ' checked' : ''} aria-controls="concept-${p.slug}" aria-label="${esc(p.title)} — ${isPlayable(p.slug) ? 'playable' : 'game concept'}"><label for="station-${p.slug}">${cabinetArt(p.slug, String(i + 1).padStart(2, '0'))}<strong>${esc(p.title)}</strong><small${isPlayable(p.slug) ? ' data-playable' : ''}>${isPlayable(p.slug) ? '● PLAYABLE' : '◇ CONCEPT'}</small></label></div>`).join('')}</div>
    <div class="room-player" id="room-player" aria-hidden="true"><span class="player-tag">YOU</span>${PLAYER}</div>
  </div></div></fieldset>
  <div class="room-bottomline"><span><span class="desktop-tip"><kbd>←</kbd> <kbd>→</kbd> Switch cabinets · </span><span class="phone-tip">Swipe the room · </span><span class="room-position" id="room-position">03 / 06</span></span><a class="room-enter" id="room-enter" href="#concept-catalog-match-lab">Play this cabinet ↓</a></div>
</section>
<noscript><p class="arcade-note">The arcade needs JavaScript to play. All project stories and concepts are available below.</p></noscript>
<div class="station-panels">${PROJECTS.map((p, i) => {
    const concept = CONCEPTS[p.slug];
    return `<section class="station-panel" id="concept-${p.slug}" data-station-panel="${p.slug}" style="--station:${STATION_ART[p.slug].color}" aria-labelledby="concept-title-${p.slug}">
      <div class="console-header"><span class="console-slot">CABINET ${String(i + 1).padStart(2, '0')} / ${esc(p.title.toUpperCase())}</span><span class="console-lights" aria-hidden="true"><i></i><i></i><i></i></span></div>
      <div class="console-body"><div class="station-brief"><p class="eyebrow">${isPlayable(p.slug) ? 'Ready to play' : 'On the drawing board'}</p><h2 id="concept-title-${p.slug}">${esc(concept.name)}</h2><p>${esc(concept.task)}</p><p class="lesson"><span>The idea underneath</span>${esc(concept.lesson)}</p><a class="read-link" href="${projectPath(p)}">Inside ${esc(p.title)} →</a></div>
      ${p.slug === 'catalog-match-lab' ? gameMarkup() : p.slug === 'ascii-art' ? pixelMarkup() : `<div class="concept-preview"><div class="concept-diagram" aria-label="Proposed game flow">${concept.steps.map((step, index) => `${index ? '<b aria-hidden="true">→</b>' : ''}<span>${esc(step)}</span>`).join('')}</div><h3>The project is real. This game is a concept.</h3><p>For now, explore the ${p.slug === 'vesti' ? 'product in development' : 'system'} behind the cabinet. The game above describes a future interaction.</p><a class="action" href="${projectPath(p)}">Explore the project →</a></div>`}</div>
    </section>`;
  }).join('')}</div>
<div class="arcade-colophon"><span>FREE PLAY · NO ACCOUNT · NO TIMER</span><span>Here for the engineering? <a href="/tech#projects">Read the projects →</a></span></div>`, playStyles, `import { initArcade } from '/play/arcade.mjs'; initArcade();`);
}

function gameMarkup(): string {
  return `<section class="game" id="catalog-game" aria-label="Catalog identity challenge" hidden>
  <div class="game-progress"><span id="round-label"></span><span class="round-dots" aria-hidden="true"><i></i><i></i><i></i></span><span id="score-label"></span></div>
  <h3 id="round-question" tabindex="-1">Same product presentation?</h3>
  <div class="listings"><div class="listing"><span>LISTING A</span><strong id="listing-a"></strong></div><div class="listing"><span>LISTING B</span><strong id="listing-b"></strong></div></div>
  <div class="game-choices"><button class="action" type="button" data-answer="same">Same presentation</button><button class="action" type="button" data-answer="different">Different</button><button class="action" type="button" data-answer="uncertain">Not enough evidence</button></div>
  <div class="game-feedback" id="game-feedback" role="status" aria-live="polite" aria-atomic="true" hidden><strong id="feedback-title"></strong><p id="feedback-reason"></p></div>
  <table class="evidence-table" id="game-evidence" hidden><caption>THE EVIDENCE / normalized attributes</caption><thead><tr><th scope="col">Check</th><th scope="col">A</th><th scope="col">B</th></tr></thead><tbody id="evidence-rows"></tbody></table>
  <button class="action game-next" id="next-round" type="button" hidden>Next pair →</button>
  <p class="arcade-note">Three fictional pairs. A small introduction to identity decisions; no live matcher or AI runs here.</p></section>`;
}

function pixelMarkup(): string {
  return `<section class="pixel-workshop" id="pixel-workshop" aria-label="Pixel workshop" hidden>
  <div class="pixel-toolbar"><span class="eyebrow">8 × 8 / FOUR COLORS</span><label>Palette <select id="pixel-palette"><option value="orchard">Orchard</option><option value="dusk">Dusk</option><option value="pocket">Pocket console</option></select></label></div>
  <div class="pixel-desk"><div class="pixel-board" id="pixel-board" role="group" aria-label="Pixel canvas. Arrow keys move; Enter or Space paints."></div><div class="pixel-tools"><fieldset id="pixel-swatches"><legend>Ink</legend></fieldset><button type="button" class="action" id="pixel-undo" disabled>Undo</button><button type="button" class="action" id="pixel-clear">Clear</button></div></div>
  <div class="pixel-bottom"><p id="pixel-status" role="status" aria-live="polite">Your canvas. Make something small.</p><button type="button" class="action" id="pixel-export">Save PNG ↓</button></div>
  <p class="arcade-note">Click or drag to paint. Keyboard: arrows to move, Enter or Space to paint. Drawing stays here until you leave. <a href="https://raster-lab.alejandrofranks.workers.dev" target="_blank" rel="noopener noreferrer">Open the full Raster Lab ↗</a></p>
  </section>`;
}
