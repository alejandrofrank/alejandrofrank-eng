import { matchMarkup, imageMarkup } from '../projects/inspectors';
import { PROJECTS, projectPath } from '../projects/catalog';
import { readingShell } from '../projects/page';
import type { PortfolioView } from '../appearance';
import { esc } from '../panels/helpers';
import { cabinetArt, PLAYER, STATION_ART } from './art';
import { playStyles } from './styles';
import { renderIngestionGame, ingestionStyles } from './games/ingestion';
import { renderQueryGame, queryStyles } from './games/query';
import { renderIdentityGame, renderGarmentGame, identityStyles } from './games/identity';
import { renderPaletteGame, miniStyles } from './games/palette';
import { renderBasketGame, basketStyles } from './games/basket';
import { renderOrderFlowGame, orderFlowStyles } from './games/order-flow';

const ARCADE_PROJECTS = PROJECTS.filter(project => project.arcade !== false);

const GAMES: Record<string, { name: string; task: string; lesson: string; evidence: string; render: () => string }> = {
  'madrid-delivery-sim': {name:'Order Flow',task:'Clear a path into parking. Each car takes two passengers of its color, starting at the front of the queue. Twenty puzzles add hidden colors from level 6, a hidden queue from 7, a countdown from 13 and just two parking spaces from 19. Progress and stars are saved.',lesson:'Agents need both a clear dependency path and capacity for the next queued task.',evidence:'Verified puzzle layouts',render:renderOrderFlowGame},
  bakiano: { name: 'Basket Run', task: 'Move groceries into a limited basket. Solve four markets with pack sizes, stock, delivery fees and dated prices.', lesson: 'Comparable prices depend on units, dates and traceable conversion.', evidence: 'Fictional market puzzle', render: renderBasketGame },
  'gcp-ingestion-lab': { name: 'Packet Factory', task: 'Build a working conveyor line. Place machines, branch duplicate packets and keep every delivery safe through five shifts.', lesson: 'Receipt placement and observation time decide whether retries are safe.', evidence: 'Executable pipeline simulation', render: renderIngestionGame },
  'catalog-match-lab': { name: 'Catalog Customs', task: 'Find the verified match in increasingly crowded product lineups. Sometimes none qualifies. Three mistakes close the desk.', lesson: 'Shared words do not establish product identity. Missing evidence deserves a hold.', evidence: 'Runs the repository’s matcher', render: renderIdentityGame },
  'bigquery-query-guard': { name: 'Partition Sweep', task: 'Select the data blocks that produce the requested answer. Deliver every required row without exceeding the scan budget.', lesson: 'Projection and partitions reduce reads. A small output alone does not.', evidence: 'Executable scan simulation', render: renderQueryGame },
  'ascii-art': { name: 'Pixel Shuffle', task: 'Put the picture back together. Tap two tiles to swap; later pictures add a few sideways pieces. Aim for fewer moves.', lesson: 'The repository renderer creates every pixel picture. The puzzle checks the image itself, accepting visually identical pieces.', evidence: 'Pictures made by the repository’s renderer', render: renderPaletteGame },
  vesti: { name: 'Complete the rack', task: 'Choose a third garment so each attribute is either all the same or all different across the rack.', lesson: 'Separate attributes let you reason about an item instead of its whole scene.', evidence: 'Synthetic attribute puzzle', render: renderGarmentGame },
};

export function renderPlayPage(origin: string, view: PortfolioView = 'arcade'): string {
  return readingShell('Project arcade', 'Seven compact games about the engineering behind the projects: solve a problem, inspect the result and follow the code.', '/play', origin, `
<header class="arcade-intro"><div><h1>Project arcade</h1></div><p>Seven small games.<br>Each built around a real engineering decision.</p></header>
<section class="arcade-room" aria-label="Project demo floor" id="arcade-room" hidden>
  <div class="room-topline"><div class="room-sign"><b aria-hidden="true">AF</b> INSIDE THE WORK</div><div class="room-status"><span>${ARCADE_PROJECTS.length} PLAYABLE</span></div></div>
  <fieldset id="station-controls"><legend class="sr-only">Choose a project station</legend><div class="room-scroll"><div class="arcade-floor">
    <div class="stations">${ARCADE_PROJECTS.map((p, i) => `<div class="station" style="--station:${STATION_ART[p.slug].color}"><input type="radio" name="station" id="station-${p.slug}" value="${p.slug}"${p.slug === 'catalog-match-lab' ? ' checked' : ''} aria-controls="concept-${p.slug}" aria-label="${esc(p.title)} — ${esc(GAMES[p.slug].name)}"><label for="station-${p.slug}">${cabinetArt(p.slug, String(i + 1).padStart(2, '0'))}<strong>${esc(p.title)}</strong><small data-playable>● PLAY</small></label></div>`).join('')}</div>
    <div class="room-player" id="room-player" aria-hidden="true"><span class="player-tag">YOU</span>${PLAYER}</div>
  </div></div></fieldset>
  <div class="room-bottomline"><span><span class="desktop-tip"><kbd>←</kbd> <kbd>→</kbd> Choose · <kbd>Enter</kbd> Play · </span><span class="phone-tip">Tap a cabinet to play · </span><span class="room-position" id="room-position">04 / 07</span></span><a class="room-enter" id="room-enter" href="#concept-catalog-match-lab">Enter cabinet ↗</a></div>
</section>
<noscript><p class="arcade-note">The interactive examples need JavaScript. All project descriptions and reading links are available below.</p></noscript>
<div class="station-panels">${ARCADE_PROJECTS.map((p, i) => {
    const experiment = GAMES[p.slug];
    return `<section class="station-panel" id="concept-${p.slug}" data-station-panel="${p.slug}" style="--station:${STATION_ART[p.slug].color}" aria-labelledby="concept-title-${p.slug}">
      <div class="console-header"><span class="console-slot">${String(i + 1).padStart(2, '0')} / ${esc(p.title.toUpperCase())}</span><span class="console-lights" aria-hidden="true"><i></i><i></i><i></i></span></div>
      <div class="console-body"><div class="station-brief"><p class="eyebrow">${esc(experiment.evidence)}</p><h2 id="concept-title-${p.slug}">${esc(experiment.name)}</h2><p>${esc(experiment.task)}</p><p class="lesson"><span>What it demonstrates</span>${esc(experiment.lesson)}</p><a class="read-link" href="${projectPath(p)}">Inside ${esc(p.title)} →</a></div>
      <div class="game-content">${experiment.render()}${p.slug === 'catalog-match-lab' ? `<details class="game-inspector"><summary>Free inspection: try your own product names</summary>${matchMarkup()}</details>` : p.slug === 'ascii-art' ? `<details class="game-inspector" id="image-inspector"><summary>Free inspection: compare rendering methods</summary>${imageMarkup()}</details>` : ''}</div></div>
    </section>`;
  }).join('')}</div>
<div class="arcade-colophon"><span>PLAY → INSPECT → READ THE CODE</span><span><a href="/tech#projects">Read all projects →</a></span></div>`, playStyles + miniStyles + basketStyles + ingestionStyles + queryStyles + identityStyles + orderFlowStyles, `import { initArcade } from '/play/arcade.mjs'; initArcade();`, view);
}
