import { PROJECTS, projectPath } from '../projects/catalog';
import { readingShell } from '../projects/page';
import { esc } from '../panels/helpers';
import { cabinetArt, PLAYER, STATION_ART } from './art';
import { playStyles } from './styles';
import { renderIngestionGame, ingestionStyles } from './games/ingestion';
import { renderQueryGame, queryStyles } from './games/query';
import { renderIdentityGame, renderGarmentGame, identityStyles } from './games/identity';
import { renderPaletteGame, miniStyles } from './games/palette';
import { renderBasketGame, basketStyles } from './games/basket';

const GAMES: Record<string, { name: string; task: string; lesson: string; evidence: string; render: () => string }> = {
  bakiano: { name: 'Basket Run', task: 'Move groceries into a limited basket. Solve four markets with pack sizes, stock, delivery fees and dated prices.', lesson: 'Comparable prices depend on units, dates and traceable conversion.', evidence: 'Fictional market puzzle', render: renderBasketGame },
  'gcp-ingestion-lab': { name: 'Packet Factory', task: 'Build a working conveyor line. Place machines, branch duplicate packets and keep every delivery safe through five shifts.', lesson: 'Receipt placement and observation time decide whether retries are safe.', evidence: 'Executable pipeline simulation', render: renderIngestionGame },
  'catalog-match-lab': { name: 'Catalog Customs', task: 'Find the verified match in increasingly crowded product lineups. Sometimes none qualifies. Three mistakes close the desk.', lesson: 'Shared words do not establish product identity. Missing evidence deserves a hold.', evidence: 'Runs the repository’s matcher', render: renderIdentityGame },
  'bigquery-query-guard': { name: 'Partition Sweep', task: 'Select the data blocks that produce the requested answer. Deliver every required row without exceeding the scan budget.', lesson: 'Projection and partitions reduce reads. A small output alone does not.', evidence: 'Executable scan simulation', render: renderQueryGame },
  'ascii-art': { name: 'Pixel Shuffle', task: 'Put the picture back together. Tap two tiles to swap; later pictures add a few sideways pieces. Aim for fewer moves.', lesson: 'The repository renderer creates every pixel picture. The puzzle checks the image itself, accepting visually identical pieces.', evidence: 'Pictures made by the repository’s renderer', render: renderPaletteGame },
  vesti: { name: 'Complete the rack', task: 'Choose a third garment so each attribute is either all the same or all different across the rack.', lesson: 'Separate attributes let you reason about an item instead of its whole scene.', evidence: 'Synthetic attribute puzzle', render: renderGarmentGame },
};

export function renderPlayPage(origin: string): string {
  return readingShell('Project arcade', 'Six compact games about the engineering behind the projects: solve a problem, inspect the result and follow the code.', '/play', origin, `
<header class="arcade-intro"><div><p class="eyebrow">Play the problem. Inspect the result.</p><h1>Project arcade</h1></div><p>Six small games.<br>Each built around a real engineering decision.</p></header>
<section class="arcade-room" aria-label="Project demo floor" id="arcade-room" hidden>
  <div class="room-topline"><div class="room-sign"><b aria-hidden="true">AF</b> INSIDE THE WORK</div><div class="room-status"><span>6 PLAYABLE</span></div></div>
  <fieldset id="station-controls"><legend class="sr-only">Choose a project station</legend><div class="room-scroll"><div class="arcade-floor">
    <div class="stations">${PROJECTS.map((p, i) => `<div class="station" style="--station:${STATION_ART[p.slug].color}"><input type="radio" name="station" id="station-${p.slug}" value="${p.slug}"${p.slug === 'catalog-match-lab' ? ' checked' : ''} aria-controls="concept-${p.slug}" aria-label="${esc(p.title)} — ${esc(GAMES[p.slug].name)}"><label for="station-${p.slug}">${cabinetArt(p.slug, String(i + 1).padStart(2, '0'))}<strong>${esc(p.title)}</strong><small data-playable>● PLAY</small></label></div>`).join('')}</div>
    <div class="room-player" id="room-player" aria-hidden="true"><span class="player-tag">YOU</span>${PLAYER}</div>
  </div></div></fieldset>
  <div class="room-bottomline"><span><span class="desktop-tip"><kbd>←</kbd> <kbd>→</kbd> Choose · <kbd>Enter</kbd> Play · </span><span class="phone-tip">Tap a cabinet to play · </span><span class="room-position" id="room-position">03 / 06</span></span><a class="room-enter" id="room-enter" href="#concept-catalog-match-lab">Enter cabinet ↗</a></div>
</section>
<noscript><p class="arcade-note">The interactive examples need JavaScript. All project descriptions and reading links are available below.</p></noscript>
<div class="station-panels">${PROJECTS.map((p, i) => {
    const experiment = GAMES[p.slug];
    return `<section class="station-panel" id="concept-${p.slug}" data-station-panel="${p.slug}" style="--station:${STATION_ART[p.slug].color}" aria-labelledby="concept-title-${p.slug}">
      <div class="console-header"><span class="console-slot">${String(i + 1).padStart(2, '0')} / ${esc(p.title.toUpperCase())}</span><span class="console-lights" aria-hidden="true"><i></i><i></i><i></i></span></div>
      <div class="console-body"><div class="station-brief"><p class="eyebrow">${esc(experiment.evidence)}</p><h2 id="concept-title-${p.slug}">${esc(experiment.name)}</h2><p>${esc(experiment.task)}</p><p class="lesson"><span>What it demonstrates</span>${esc(experiment.lesson)}</p><a class="read-link" href="${projectPath(p)}">Inside ${esc(p.title)} →</a></div>
      <div class="game-content">${experiment.render()}${p.slug === 'catalog-match-lab' ? `<details class="game-inspector"><summary>Free inspection: try your own product names</summary>${matchMarkup()}</details>` : p.slug === 'ascii-art' ? `<details class="game-inspector" id="image-inspector"><summary>Free inspection: compare rendering methods</summary>${imageMarkup()}</details>` : ''}</div></div>
    </section>`;
  }).join('')}</div>
<div class="arcade-colophon"><span>PLAY → INSPECT → READ THE CODE</span><span><a href="/tech#projects">Read all projects →</a></span></div>`, playStyles + miniStyles + basketStyles + ingestionStyles + queryStyles + identityStyles, `import { initArcade } from '/play/arcade.mjs'; initArcade();`);
}

function matchMarkup(): string {
  return `<section class="match-demo" id="match-demo" aria-label="Product identity comparison" hidden>
  <div class="match-presets" role="group" aria-label="Example pairs"><button type="button" data-pair="size" aria-pressed="true">Size conflict</button><button type="button" data-pair="units" aria-pressed="false">Aliases + units</button><button type="button" data-pair="missing" aria-pressed="false">Missing detail</button></div>
  <form id="match-form"><div class="match-inputs"><label>Requested product<input id="match-request" maxlength="160" required value="Loma leche entera 1 L"></label><label>Candidate listing<input id="match-candidate" maxlength="160" required value="Loma leche entera 200 ml"></label></div><button class="action" type="submit">Inspect pair →</button></form>
  <div class="match-results" aria-live="polite" aria-atomic="true"><div><span>A / SHARED WORDS</span><strong id="match-baseline"></strong><p>A deliberately simple reference rule.</p></div><div id="match-identity"><span>B / IDENTITY CHECKS</span><strong id="match-decision"></strong><p id="match-reason"></p></div></div>
  <div class="match-table-wrap"><table class="evidence-table"><caption>ACTUAL MATCHER OUTPUT / normalized attributes</caption><thead><tr><th scope="col">Check</th><th scope="col">Requested</th><th scope="col">Candidate</th><th scope="col">Result</th></tr></thead><tbody id="match-checks"></tbody></table></div>
  <p class="arcade-note">Fictional names. These offline rules support a small vocabulary; unfamiliar details stay uncertain. This is not a trained model or Bakiano’s production matcher. <a href="https://github.com/alejandrofrank/catalog-match-lab/blob/2a7ce8a3e4330bfb7d284b878ff9833693fa32b8/src/match.js" target="_blank" rel="noopener noreferrer">Inspect the exact code ↗</a></p>
  </section>`;
}

function imageMarkup(): string {
  return `<section class="image-demo" id="image-demo" aria-label="Image conversion comparison" hidden>
  <div class="image-demo-controls" id="image-demo-controls"><label>Source<select id="image-sample"><option value="still-life">Still life</option><option value="terrain">Landscape</option><option value="signal">Signal</option></select></label><label>Grid columns<select id="image-columns"><option>16</option><option>32</option><option selected>64</option><option>128</option></select></label><label>Color budget<select id="image-palette"><option value="gray">4 grays</option><option value="ink">2 colors</option><option value="moss">4 greens</option></select></label></div>
  <figure class="image-source"><canvas id="image-source" width="640" height="480" role="img" aria-label="Original image"></canvas><figcaption><strong>Original / 640 × 480</strong><span>An original procedural sample from the repo. Both methods receive exactly these pixels.</span></figcaption></figure>
  <div class="image-results"><figure><figcaption>A / Nearest color</figcaption><canvas id="image-plain" width="64" height="48" role="img" aria-label="Nearest color result"></canvas><p id="image-plain-meta"></p><span>Choose the closest available color for each cell.</span></figure><figure><figcaption>B / Error diffusion</figcaption><canvas id="image-dithered" width="64" height="48" role="img" aria-label="Dithered result"></canvas><p id="image-dither-meta"></p><span>Spread color error to nearby cells to retain shading.</span></figure></div>
  <div class="image-evidence" id="image-evidence" hidden><p>Both outputs obey the same color budget. Dithering trades a patterned texture for shading; it is not automatically better for every image.</p><button type="button" class="action" id="image-repeat" disabled>Check repeatability</button></div>
  <p class="image-demo-status" id="image-demo-status" role="status" aria-live="polite">Select this project to render the comparison.</p>
  <p class="arcade-note">Runs a pinned copy of the real renderer in a browser worker. <a href="https://github.com/alejandrofrank/art_exploring/blob/ff13495892fdf732da4120fd1bda1a54a37f6c9c/studio/core.mjs" target="_blank" rel="noopener noreferrer">Inspect the code ↗</a> · <a href="https://raster-lab.alejandrofranks.workers.dev" target="_blank" rel="noopener noreferrer">Open Image to Pixels ↗</a></p>
  </section>`;
}
