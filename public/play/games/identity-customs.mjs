import { CUSTOMS_SHIFTS, createCustomsSession, STAMP_LABELS } from './identity-campaign.mjs';

const textValue = value => Array.isArray(value) ? value.join(', ') || 'none' : value == null ? 'not supplied' : String(value);
const verdictLabels = { yes: 'Verified match', no: 'Conflict', uncertain: 'Needs review' };
const evidenceLabels = { same: 'agrees', conflict: 'CONFLICT', missing: 'MISSING', unsupported: 'UNKNOWN TERM', optional: 'optional', invalid: 'INVALID' };
function element(tag, text, className) {
  const result = document.createElement(tag);
  if (text != null) result.textContent = text;
  if (className) result.className = className;
  return result;
}

function productArt(kind) {
  const drawings = {
    milk: '<path d="M27 12h28l10 17v48H19V29z" fill="#dedfd3"/><path d="M27 12h28v13H27z" fill="#719fbd"/><path d="M19 29h46v30H19z" fill="#719fbd"/><path d="m27 12-8 17h46L55 12M42 29v48" fill="none" stroke="#394e55" stroke-width="2"/><path d="M32 43h19M32 48h13" stroke="#edf0df" stroke-width="3"/>',
    coffee: '<path d="M25 13h34l-3 15 8 48H20l8-48z" fill="#b99c81"/><path d="M25 13h34v8H25z" fill="#6b5145"/><path d="M23 39h38v25H23z" fill="#604d47"/><ellipse cx="42" cy="51" rx="8" ry="11" transform="rotate(30 42 51)" fill="#d7bca0"/><path d="M44 42c-7 7 2 10-5 18" fill="none" stroke="#604d47" stroke-width="2"/>',
    rice: '<path d="M24 13h36l-3 14 8 49H19l8-49z" fill="#c9d6bd"/><path d="M24 13h36v7H24z" fill="#6d8f65"/><path d="M23 39h38v24H23z" fill="#69875e"/><g fill="#ebead6"><ellipse cx="35" cy="48" rx="2.4" ry="6" transform="rotate(-25 35 48)"/><ellipse cx="47" cy="53" rx="2.4" ry="6" transform="rotate(25 47 53)"/><ellipse cx="40" cy="58" rx="2" ry="5"/></g>',
    flour: '<path d="M25 13h34l-3 15 8 48H20l8-48z" fill="#dfcfaa"/><path d="M25 13h34v8H25z" fill="#b79a63"/><path d="M23 37h38v27H23z" fill="#a99065"/><path d="M42 60V43m0 5-6-5m6 10 6-6m-6 10-6-6" fill="none" stroke="#f5e8c7" stroke-width="3"/>',
    chicken: '<rect x="12" y="24" width="60" height="47" rx="8" fill="#ced7ce"/><rect x="18" y="30" width="48" height="35" rx="6" fill="#dcaf99"/><path d="M31 51c-12-2-4-18 6-14l9 8 9-4 4 5-11 8c-7 7-13 4-17-3" fill="#b97f69"/><path d="m48 46 9-5 4 5-10 6" fill="#eee1c8"/><path d="M19 31h46v6H19z" fill="#f0e9d7"/>',
    broth: '<path d="M26 12h32l8 15v50H18V27z" fill="#d3c89b"/><path d="M26 12h32v10H26z" fill="#a18a51"/><path d="M18 31h48v30H18z" fill="#a38f54"/><path d="M28 47h28c-2 12-26 12-28 0" fill="#f0e7c8"/><path d="M35 42c-4-4 4-5 0-9m10 9c-4-4 4-5 0-9" fill="none" stroke="#f0e7c8" stroke-width="2"/>',
  };
  return `<svg viewBox="0 0 84 90" aria-hidden="true" focusable="false"><ellipse cx="42" cy="80" rx="28" ry="3" fill="#000" opacity=".15"/>${drawings[kind] ?? drawings.rice}</svg>`;
}

function auditTable(row) {
  const table = element('table');
  table.append(element('caption', `Normalized evidence for ${row.name}`));
  const head = element('thead');
  const headings = element('tr');
  ['Attribute', 'Requested', 'Declared', 'Evidence'].forEach(label => {
    const cell = element('th', label); cell.scope = 'col'; headings.append(cell);
  });
  head.append(headings);
  const body = element('tbody');
  row.evidence.checks.forEach(check => {
    const tr = element('tr'); tr.dataset.result = check.status;
    const key = element('th', check.key); key.scope = 'row';
    tr.append(key, element('td', textValue(check.request)), element('td', textValue(check.candidate)), element('td', evidenceLabels[check.status]));
    body.append(tr);
  });
  table.append(head, body);
  const scroll = element('div', null, 'idg-audit'); scroll.append(table);
  return scroll;
}

export function initCustoms(root) {
  const session = createCustomsSession();
  const find = selector => root.querySelector(selector);
  const feedback = find('[data-customs-feedback]');
  const next = find('[data-customs-next]');
  const productShelf = find('[data-customs-products]');
  const none = find('[data-customs-none]');
  const commit = find('[data-customs-commit]');
  const stampButtons = [...root.querySelectorAll('[data-customs-decision]')];
  let renderedIndex = -1, selected = null;

  find('[data-customs-track]').replaceChildren(...CUSTOMS_SHIFTS.map((stage, index) => {
    const step = element('li'); step.dataset.checkpoint = String(index);
    step.title = `${index + 1}. ${stage.title}`;
    step.setAttribute('aria-label', `${index + 1}. ${stage.title}`);
    step.append(element('span', String(index + 1).padStart(2, '0')), element('small', stage.mode === 'stamp' ? 'Stamp' : `${stage.documents.length} items`));
    return step;
  }));

  function select(id) {
    const state = session.getState();
    if (state.resolved || state.finished) return;
    selected = id;
    productShelf.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.customsProduct === id)));
    none.setAttribute('aria-pressed', String(id === 'none'));
    find('[data-customs-selection]').textContent = id === 'none' ? 'Selected: no verified match.' : `Selected: ${state.scenario.documents.find(row => row.id === id).name}`;
    commit.disabled = false;
  }

  function render() {
    const state = session.getState();
    const { scenario, result, finished } = state;
    root.dataset.mode = scenario.mode;
    find('[data-customs-progress]').textContent = `Checkpoint ${state.index + 1} / ${state.total}`;
    find('[data-customs-streak]').textContent = `Clean streak: ${state.streak}`;
    find('[data-customs-errors]').textContent = `${state.errors} / ${state.limit} citations`;
    find('[data-customs-title]').textContent = scenario.title;
    find('[data-customs-tier]').textContent = scenario.tier;
    find('[data-customs-brief]').textContent = scenario.brief;
    find('[data-customs-request]').textContent = scenario.request;
    root.querySelectorAll('[data-checkpoint]').forEach(step => {
      const index = Number(step.dataset.checkpoint);
      if (index === state.index) step.setAttribute('aria-current', 'step'); else step.removeAttribute('aria-current');
      const prior = state.ledger[index];
      step.dataset.result = prior ? prior.correct ? 'correct' : 'incorrect' : 'pending';
    });
    find('[data-customs-document]').hidden = scenario.mode !== 'stamp';
    find('[data-customs-stamps]').hidden = scenario.mode !== 'stamp';
    find('[data-customs-lineup]').hidden = scenario.mode !== 'lineup';
    find('[data-customs-commit-bar]').hidden = scenario.mode !== 'lineup';
    if (renderedIndex !== state.index) {
      renderedIndex = state.index; selected = null;
      none.setAttribute('aria-pressed', 'false');
      find('[data-customs-selection]').textContent = 'Select a declaration first.';
      if (scenario.mode === 'stamp') {
        const paper = scenario.documents[0];
        find('[data-customs-document-id]').textContent = paper.id;
        find('[data-customs-supplier]').textContent = paper.supplier;
        find('[data-customs-name]').textContent = paper.name;
      } else {
        productShelf.replaceChildren(...scenario.documents.map((paper, index) => {
          const button = element('button', null, 'idg-product'); button.type = 'button';
          button.dataset.customsProduct = paper.id;
          button.setAttribute('aria-pressed', 'false');
          button.setAttribute('aria-label', `Select ${paper.name}`);
          button.setAttribute('aria-describedby', 'customs-shelf-instructions');
          const art = element('span', null, 'idg-product-art'); art.innerHTML = productArt(paper.kind);
          button.append(element('span', `DECLARATION ${String(index + 1).padStart(2, '0')}`, 'idg-product-number'), art, element('strong', paper.name), element('small', paper.supplier));
          button.addEventListener('click', () => select(paper.id));
          return button;
        }));
      }
    }
    stampButtons.forEach(button => { button.disabled = state.resolved || finished; });
    productShelf.querySelectorAll('button').forEach(button => { button.disabled = state.resolved || finished; });
    none.disabled = state.resolved || finished;
    commit.disabled = selected == null || state.resolved || finished;
    const hint = find('[data-customs-hint]');
    hint.disabled = state.hintUsed || state.resolved || finished;
    hint.textContent = state.hintUsed ? 'Reasoning hint opened' : 'Give me a reasoning hint';
    find('[data-customs-hint-text]').hidden = !state.hintUsed;
    find('[data-customs-hint-text]').textContent = scenario.hint;
    find('[data-customs-hint-count]').textContent = `${state.hintsUsed} hint${state.hintsUsed === 1 ? '' : 's'} used`;
    const impression = find('[data-customs-stamp]');
    impression.hidden = !result || scenario.mode !== 'stamp';
    feedback.hidden = !result;
    find('[data-customs-audit]').hidden = !result;
    next.hidden = !result || finished;
    next.textContent = state.index === 1 ? 'Open the product shelf →' : 'Next checkpoint →';
    if (result) {
      feedback.dataset.correct = String(result.correct);
      const expected = result.audit.find(row => row.id === result.expected);
      if (scenario.mode === 'stamp') {
        impression.textContent = STAMP_LABELS[result.decision]; impression.dataset.decision = result.decision;
        feedback.textContent = `${result.correct ? 'Stamp accepted.' : 'Citation issued.'} Rules say: ${STAMP_LABELS[result.expected].toLowerCase()}. ${result.audit[0].evidence.reason}.`;
      } else {
        const matchText = expected ? `Verified fit: ${expected.name}.` : 'No declaration is a verified match.';
        const selectedReason = result.accepted && !result.correct ? ` Your choice: ${result.accepted.evidence.reason}.` : '';
        const counts = result.audit.reduce((total, row) => { total[row.evidence.decision] += 1; return total; }, { yes: 0, no: 0, uncertain: 0 });
        feedback.textContent = `${result.correct ? 'Inspection cleared.' : 'Citation issued.'} ${matchText}${selectedReason} Audit: ${counts.yes} verified, ${counts.no} conflicting, ${counts.uncertain} needing review.`;
        productShelf.querySelectorAll('button').forEach(button => {
          const row = result.audit.find(item => item.id === button.dataset.customsProduct);
          button.dataset.verdict = row.evidence.decision;
          const existing = button.querySelector('.idg-product-verdict');
          if (!existing) button.append(element('span', verdictLabels[row.evidence.decision], 'idg-product-verdict'));
        });
      }
      find('[data-customs-checks]').replaceChildren(...result.audit.map(row => {
        const detail = element('details', null, 'idg-audit-entry'); detail.dataset.verdict = row.evidence.decision;
        detail.open = scenario.mode === 'stamp';
        const summary = element('summary');
        summary.append(element('span', verdictLabels[row.evidence.decision], 'idg-verdict'), element('strong', row.name));
        detail.append(summary, element('p', row.evidence.reason), auditTable(row));
        return detail;
      }));
    }
    const manifest = find('[data-customs-manifest]'); manifest.hidden = !finished;
    if (finished) {
      const approved = state.ledger.filter(entry => entry.accepted);
      const invalid = approved.filter(entry => entry.accepted.evidence.decision !== 'yes').length;
      find('[data-customs-summary]').textContent = `${state.cleared ? 'Campaign cleared.' : 'Shift closed after three citations.'} ${state.ledger.length - state.errors} / ${state.ledger.length} inspections correct; ${state.ledger.length} / ${state.total} checkpoints completed. Best clean streak: ${state.bestStreak}. ${state.hintsUsed} hints used. Your manifest contains ${approved.length} accepted identities, ${invalid} invalid.`;
      const entries = state.ledger.map(entry => {
        const item = element('li');
        item.append(element('strong', `${entry.correct ? '✓' : '×'} ${entry.title}`), element('br'));
        const detail = entry.accepted ? `${entry.accepted.name} — ${verdictLabels[entry.accepted.evidence.decision].toLowerCase()}. ${entry.accepted.evidence.reason}.` : entry.mode === 'stamp' ? `Stamped ${STAMP_LABELS[entry.decision].toLowerCase()}. ${entry.audit[0].evidence.reason}.` : 'No product admitted.';
        item.append(element(entry.correct ? 'span' : 'b', detail));
        return item;
      });
      find('[data-customs-ledger]').replaceChildren(...entries);
    }
  }

  function focusResult() {
    if (session.getState().finished) find('#customs-manifest-title').focus();
    else feedback.focus();
  }
  stampButtons.forEach(button => button.addEventListener('click', () => { session.stamp(button.dataset.customsDecision); render(); focusResult(); }));
  none.addEventListener('click', () => select('none'));
  commit.addEventListener('click', () => { if (selected == null) return; session.choose(selected); render(); focusResult(); });
  find('[data-customs-hint]').addEventListener('click', () => {
    session.useHint(); render();
    // The hint button becomes disabled: move to the first useful decision control.
    const target = session.getState().scenario.mode === 'stamp' ? stampButtons[0] : productShelf.querySelector('button');
    target?.focus();
  });
  next.addEventListener('click', () => { session.next(); render(); find('[data-customs-title]').focus(); });
  find('[data-customs-restart]').addEventListener('click', () => { session.reset(); renderedIndex = -1; render(); find('[data-customs-title]').focus(); });
  render();
  find('[data-js-note]').hidden = true;
  find('[data-customs-controls]').hidden = false;
}
