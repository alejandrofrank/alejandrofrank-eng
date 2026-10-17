import { createCustomsSession, createGarmentSession, inspectRack, STAMP_LABELS } from './identity-state.mjs';

const valueLabel = value => Array.isArray(value) ? value.join(', ') || 'none' : value == null ? 'not supplied' : String(value);
const capital = word => word[0].toUpperCase() + word.slice(1);
function node(tag, text, className) {
  const element = document.createElement(tag);
  if (text != null) element.textContent = text;
  if (className) element.className = className;
  return element;
}

function initCustoms(root) {
  const session = createCustomsSession();
  const find = selector => root.querySelector(selector);
  const feedback = find('[data-customs-feedback]');
  const next = find('[data-customs-next]');
  const stampButtons = [...root.querySelectorAll('[data-customs-decision]')];
  const resultLabels = { same: 'agrees', conflict: 'CONFLICT', missing: 'MISSING', unsupported: 'UNKNOWN TERM', optional: 'optional', invalid: 'INVALID' };

  function render() {
    const state = session.getState();
    const { document: paper, stamped, finished } = state;
    find('[data-customs-progress]').textContent = `Shift ${paper.shift} / 3 · document ${paper.inShift} / 3`;
    find('[data-customs-errors]').textContent = `${state.errors} / ${state.limit} mistakes`;
    find('[data-customs-request]').textContent = paper.request;
    find('[data-customs-document-id]').textContent = paper.id;
    find('[data-customs-supplier]').textContent = paper.supplier;
    find('[data-customs-name]').textContent = paper.name;
    root.querySelectorAll('[data-shift]').forEach(step => {
      if (Number(step.dataset.shift) === paper.shift) step.setAttribute('aria-current', 'step');
      else step.removeAttribute('aria-current');
    });
    stampButtons.forEach(button => { button.disabled = Boolean(stamped || finished); });
    const impression = find('[data-customs-stamp]');
    impression.hidden = !stamped;
    feedback.hidden = !stamped;
    find('[data-customs-audit]').hidden = !stamped;
    next.hidden = !stamped || finished;
    if (stamped) {
      impression.textContent = STAMP_LABELS[stamped.decision];
      impression.dataset.decision = stamped.decision;
      feedback.dataset.correct = String(stamped.correct);
      feedback.textContent = `${stamped.correct ? 'Stamp accepted.' : 'Citation issued.'} Rules say: ${STAMP_LABELS[stamped.evidence.decision].toLowerCase()}. ${stamped.evidence.reason}.`;
      const rows = stamped.evidence.checks.map(check => {
        const row = node('tr');
        row.dataset.result = check.status;
        const heading = node('th', capital(check.key));
        heading.scope = 'row';
        row.append(heading, node('td', valueLabel(check.request)), node('td', valueLabel(check.candidate)), node('td', resultLabels[check.status]));
        return row;
      });
      find('[data-customs-checks]').replaceChildren(...rows);
      next.textContent = paper.inShift === 3 ? `Start shift ${paper.shift + 1} →` : 'Next document →';
    }
    const manifest = find('[data-customs-manifest]');
    manifest.hidden = !finished;
    if (finished) {
      const approved = state.ledger.filter(row => row.decision === 'yes');
      const wrongApprovals = approved.filter(row => row.evidence.decision !== 'yes').length;
      find('[data-customs-summary]').textContent = `${state.cleared ? 'Desk cleared.' : 'Desk closed: three citations.'} ${state.ledger.length} / ${state.total} documents processed; ${state.ledger.length - state.errors} correct decisions. You approved ${approved.length} listing${approved.length === 1 ? '' : 's'}, with ${wrongApprovals} invalid approval${wrongApprovals === 1 ? '' : 's'}.`;
      const items = approved.map(row => {
        const item = node('li');
        item.append(node('strong', `${row.id} · ${row.name}`), node('br'));
        item.append(node(row.correct ? 'span' : 'b', row.correct ? `Verified identity: ${row.request}. ${row.evidence.reason}.` : `Flagged: ${row.evidence.reason}. This should be ${STAMP_LABELS[row.evidence.decision].toLowerCase()}.`));
        return item;
      });
      if (!items.length) items.push(node('li', 'No listings were approved into your catalog.'));
      find('[data-customs-ledger]').replaceChildren(...items);
    }
  }

  stampButtons.forEach(button => button.addEventListener('click', () => {
    session.stamp(button.dataset.customsDecision);
    render();
    if (session.getState().finished) find('#customs-manifest-title').focus();
    else next.focus();
  }));
  next.addEventListener('click', () => {
    const previousShift = session.getState().document.shift;
    session.next();
    render();
    const newShift = session.getState().document.shift !== previousShift;
    find(newShift ? '[data-customs-request]' : '[data-customs-name]').focus();
  });
  find('[data-customs-restart]').addEventListener('click', () => { session.reset(); render(); find('[data-customs-request]').focus(); });
  render();
  find('[data-js-note]').hidden = true;
  find('[data-customs-controls]').hidden = false;
}

const COLORS = { blue: '#79b6d9', rose: '#dc91a5', gold: '#e4bd6d' };
const SHAPES = {
  tee: 'M27 15 13 23 5 41 20 48 25 37 25 78 65 78 65 37 70 48 85 41 77 23 63 15 56 15C55 26 35 26 34 15Z',
  jacket: 'M29 13 17 20 9 76 25 78 29 39 29 80 61 80 61 39 65 78 81 76 73 20 61 13 54 13 45 28 36 13Z',
  dress: 'M32 12 24 16 29 38 13 81 77 81 61 38 66 16 58 12 54 22 36 22Z',
};
let drawingId = 0;
function garmentDrawing(card) {
  const id = `garment-clip-${drawingId++}`;
  const path = SHAPES[card.shape];
  const stripes = [27, 39, 51, 63, 75].map(y => `<path d="M4 ${y}H86"/>`).join('');
  const dots = [28, 44, 60, 76].flatMap(y => [22, 38, 54, 70].map(x => `<circle cx="${x}" cy="${y}" r="2.3"/>`)).join('');
  const pattern = card.pattern === 'stripe' ? `<g clip-path="url(#${id})" stroke="#243440" stroke-width="3" opacity=".6">${stripes}</g>` : card.pattern === 'dot' ? `<g clip-path="url(#${id})" fill="#243440" opacity=".7">${dots}</g>` : '';
  return `<svg viewBox="0 0 90 90" aria-hidden="true" focusable="false"><defs><clipPath id="${id}"><path d="${path}"/></clipPath></defs><path d="M45 5v4M45 9 26 17M45 9 64 17" fill="none" stroke="#8d8497" stroke-width="2"/><path d="${path}" fill="${COLORS[card.color]}" stroke="#26323a" stroke-width="2" stroke-linejoin="round"/>${pattern}${card.shape === 'jacket' ? '<path d="M45 29V79M36 14 45 29 54 14" fill="none" stroke="#26323a" stroke-width="2"/>' : ''}</svg>`;
}

function garmentContents(card) {
  const art = node('span');
  // All values come from the fixed synthetic deck; no uploaded or user HTML.
  art.innerHTML = garmentDrawing(card);
  return [art, node('span', `${capital(card.color)} ${card.shape}`, 'idg-card-name'), node('span', card.pattern === 'stripe' ? 'striped' : card.pattern === 'dot' ? 'dotted' : 'plain', 'idg-card-detail')];
}

function initGarments(root) {
  const session = createGarmentSession();
  const find = selector => root.querySelector(selector);
  const options = find('[data-garment-options]');
  const checkButton = find('[data-garment-check]');
  const feedback = find('[data-garment-feedback]');
  const next = find('[data-garment-next]');
  let selected = null;
  let renderedRound = -1;

  function select(option) {
    selected = option;
    const state = session.getState();
    const slot = find('[data-garment-slot]');
    slot.dataset.selected = 'true';
    slot.replaceChildren(...garmentContents(state.round.options[option]));
    options.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.option) === option)));
    checkButton.disabled = state.resolved || state.guesses.some(guess => guess.option === selected);
  }

  function render() {
    const state = session.getState();
    find('[data-garment-progress]').textContent = `Rack ${state.index + 1} / ${state.total}`;
    find('[data-garment-score]').textContent = `${state.score} rack${state.score === 1 ? '' : 's'} cleared`;
    find('[data-garment-title]').textContent = state.round.title;
    find('[data-garment-attempts]').textContent = state.resolved ? 'Rack resolved' : `${2 - state.guesses.length} ${state.guesses.length ? 'try' : 'tries'} left`;
    if (renderedRound !== state.index) {
      selected = null;
      renderedRound = state.index;
      find('[data-garment-first]').replaceChildren(...garmentContents(state.round.pair[0]));
      find('[data-garment-second]').replaceChildren(...garmentContents(state.round.pair[1]));
      const slot = find('[data-garment-slot]');
      delete slot.dataset.selected;
      slot.replaceChildren(node('span', '?'), node('small', 'Your choice'));
      options.replaceChildren(...state.round.options.map((card, index) => {
        const button = node('button');
        button.type = 'button';
        button.dataset.option = String(index);
        button.setAttribute('aria-pressed', 'false');
        button.setAttribute('aria-label', `Choose ${index + 1}: ${card.color} ${card.shape}, ${card.pattern}`);
        button.append(node('span', String(index + 1).padStart(2, '0'), 'idg-option-number'), ...garmentContents(card));
        button.addEventListener('click', () => select(index));
        return button;
      }));
    }
    options.querySelectorAll('button').forEach(button => { button.disabled = state.resolved || state.guesses.some(guess => guess.option === Number(button.dataset.option)); });
    checkButton.disabled = selected == null || state.resolved || state.guesses.some(guess => guess.option === selected);
    feedback.hidden = !state.result;
    find('[data-garment-evidence]').hidden = !state.result;
    next.hidden = !state.resolved || state.finished;
    if (state.result) {
      feedback.dataset.correct = String(state.result.pass);
      const solution = state.round.options.findIndex(card => inspectRack([...state.round.pair, card]).pass);
      feedback.textContent = state.result.pass ? 'Rack cleared. Every attribute satisfies its own rule.' : state.resolved ? `Rack closed. Card ${solution + 1} was the fit: ${state.round.options[solution].color} ${state.round.options[solution].shape}, ${state.round.options[solution].pattern}. Inspect where your combination failed below.` : 'Not quite. Use the failed feature below to eliminate candidates, then choose again.';
      find('[data-garment-evidence]').replaceChildren(...state.result.checks.map(check => {
        const item = node('li');
        item.dataset.pass = String(check.pass);
        item.append(node('strong', `${check.pass ? '✓' : '×'} ${check.key}`), node('span', check.rule), node('small', check.values.join(' / ')));
        return item;
      }));
    }
    find('[data-garment-finish]').hidden = !state.finished;
    if (state.finished) find('[data-garment-summary]').textContent = `${state.score} / ${state.total} racks cleared. A card can look close and still fail one required attribute. This puzzle uses explicit tags; it does not run Vesti's image segmentation or retrieval.`;
  }

  checkButton.addEventListener('click', () => {
    if (selected == null) return;
    session.choose(selected);
    render();
    const state = session.getState();
    if (state.finished) find('[data-garment-finish-title]').focus();
    else if (state.resolved) next.focus();
    else options.querySelector('button:not(:disabled)')?.focus();
  });
  next.addEventListener('click', () => { session.next(); render(); find('[data-garment-title]').focus(); });
  find('[data-garment-restart]').addEventListener('click', () => { session.reset(); renderedRound = -1; render(); find('[data-garment-title]').focus(); });
  render();
  find('[data-js-note]').hidden = true;
  find('[data-garment-controls]').hidden = false;
}

export function initIdentityGames() {
  const customs = document.getElementById('identity-game');
  const garments = document.getElementById('garment-game');
  if (customs && !customs.dataset.initialized) { initCustoms(customs); customs.dataset.initialized = 'true'; }
  if (garments && !garments.dataset.initialized) { initGarments(garments); garments.dataset.initialized = 'true'; }
}
