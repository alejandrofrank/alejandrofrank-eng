import { PROJECTS, projectPath } from '../projects/catalog';
import { readingShell } from '../projects/page';
import { esc } from '../panels/helpers';
import { cabinetArt, PLAYER, STATION_ART } from './art';
import { playStyles } from './styles';

const EXPERIMENTS: Record<string, { name: string; task: string; lesson: string; steps: string[]; inspect?: string }> = {
  bakiano: { name: 'Trace a comparable price', task: 'Start with a listing. Follow its source price, observation time, currency conversion and product identity into the comparison.', lesson: 'A useful comparison needs a traceable price, not just a number.', steps: ['Source', 'Normalize', 'Compare'], inspect: 'Select an observation and inspect its provenance, dated exchange rate and identity decision. Use explicitly synthetic fixtures unless the production data is cleared for publication.' },
  'gcp-ingestion-lab': { name: 'Send it twice', task: 'Deliver the same file again. Compare the actual archive reads, merge calls and final rows with the receipt rule on and off.', lesson: 'The same correct rows can require very different amounts of work.', steps: ['Deliver', 'Replay', 'Inspect'], inspect: 'One receipt toggle, two runs on the same input. Show measured in-memory adapter calls beside the resulting rows. Then try a late event and check which observation survives.' },
  'catalog-match-lab': { name: 'Inspect a product match', task: 'Change a name and compare shared words with product identity checks. See the exact attribute that accepts, rejects or defers the match.', lesson: 'Similar names can hide different sizes, variants and packs.', steps: [] },
  'bigquery-query-guard': { name: 'Same rows, fewer reads', task: 'Compare two recorded queries that return the same captured rows. Inspect how resolving the date first changes the scan.', lesson: 'Returned rows, scanned bytes, billed bytes and elapsed time measure different things.', steps: ['SQL', 'Recorded run', 'Output'], inspect: 'Keep both SQL variants visible, show their recorded scan and execution evidence, and verify the captured outputs agree. Include the separate date lookup; never label a recording as a live query.' },
  'ascii-art': { name: 'Keep shading with fewer colors', task: 'Convert the same image two ways. Change the grid or palette and inspect what each method preserves.', lesson: 'Dithering changes where colors go; it does not add more colors.', steps: [] },
  vesti: { name: 'Select one garment', task: 'Select a garment in a reference image. Inspect the mask and the alternatives returned for that selected region.', lesson: 'A useful result should respond to the selected piece, not the entire photograph.', steps: ['Select', 'Inspect mask', 'Compare'], inspect: 'Show a real saved segmentation and retrieval result with its source and limitations. Keep this as a proposed experiment until those outputs exist.' },
};
const isInteractive = (slug: string) => slug === 'catalog-match-lab' || slug === 'ascii-art';

export function renderPlayPage(origin: string): string {
  return readingShell('Project demos', 'Short engineering experiments: change an input, inspect the result, and follow the evidence into the repository.', '/play', origin, `
<header class="arcade-intro"><div><p class="eyebrow">Change an input. Inspect the result.</p><h1>Project demos</h1></div><p>Small interactions that explain<br>the engineering behind each project.</p></header>
<section class="arcade-room" aria-label="Project demo floor" id="arcade-room" hidden>
  <div class="room-topline"><div class="room-sign"><b aria-hidden="true">AF</b> INSIDE THE WORK</div><div class="room-status"><span>2 DEMOS</span><b class="status-divider" aria-hidden="true"> / </b> 4 IDEAS</div></div>
  <fieldset id="station-controls"><legend class="sr-only">Choose a project station</legend><div class="room-scroll"><div class="arcade-floor">
    <div class="stations">${PROJECTS.map((p, i) => `<div class="station" style="--station:${STATION_ART[p.slug].color}"><input type="radio" name="station" id="station-${p.slug}" value="${p.slug}"${p.slug === 'catalog-match-lab' ? ' checked' : ''} aria-controls="concept-${p.slug}" aria-label="${esc(p.title)} — ${isInteractive(p.slug) ? 'interactive demo' : 'proposed experiment'}"><label for="station-${p.slug}">${cabinetArt(p.slug, String(i + 1).padStart(2, '0'))}<strong>${esc(p.title)}</strong><small${isInteractive(p.slug) ? ' data-playable' : ''}>${isInteractive(p.slug) ? '● INTERACTIVE' : '◇ PROPOSED'}</small></label></div>`).join('')}</div>
    <div class="room-player" id="room-player" aria-hidden="true"><span class="player-tag">YOU</span>${PLAYER}</div>
  </div></div></fieldset>
  <div class="room-bottomline"><span><span class="desktop-tip"><kbd>←</kbd> <kbd>→</kbd> Switch projects · </span><span class="phone-tip">Swipe the room · </span><span class="room-position" id="room-position">03 / 06</span></span><a class="room-enter" id="room-enter" href="#concept-catalog-match-lab">Open the example ↓</a></div>
</section>
<noscript><p class="arcade-note">The interactive examples need JavaScript. All project descriptions and reading links are available below.</p></noscript>
<div class="station-panels">${PROJECTS.map((p, i) => {
    const experiment = EXPERIMENTS[p.slug];
    return `<section class="station-panel" id="concept-${p.slug}" data-station-panel="${p.slug}" style="--station:${STATION_ART[p.slug].color}" aria-labelledby="concept-title-${p.slug}">
      <div class="console-header"><span class="console-slot">${String(i + 1).padStart(2, '0')} / ${esc(p.title.toUpperCase())}</span><span class="console-lights" aria-hidden="true"><i></i><i></i><i></i></span></div>
      <div class="console-body"><div class="station-brief"><p class="eyebrow">${isInteractive(p.slug) ? 'Runs the repository’s code' : 'Proposed experiment'}</p><h2 id="concept-title-${p.slug}">${esc(experiment.name)}</h2><p>${esc(experiment.task)}</p><p class="lesson"><span>What it demonstrates</span>${esc(experiment.lesson)}</p><a class="read-link" href="${projectPath(p)}">Inside ${esc(p.title)} →</a></div>
      ${p.slug === 'catalog-match-lab' ? matchMarkup() : p.slug === 'ascii-art' ? imageMarkup() : `<div class="concept-preview"><div class="concept-diagram" aria-label="Proposed experiment flow">${experiment.steps.map((step, index) => `${index ? '<b aria-hidden="true">→</b>' : ''}<span>${esc(step)}</span>`).join('')}</div><h3>What the experiment would show</h3><p>${esc(experiment.inspect ?? '')}</p><p class="arcade-note">This compact demo is proposed. Read the project for what is available today.</p><a class="action" href="${projectPath(p)}">Explore the project →</a></div>`}</div>
    </section>`;
  }).join('')}</div>
<div class="arcade-colophon"><span>INPUT → RESULT → EVIDENCE</span><span><a href="/tech#projects">Read all projects →</a></span></div>`, playStyles, `import { initArcade } from '/play/arcade.mjs'; initArcade();`);
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
