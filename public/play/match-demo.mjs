import { compareNames, keywordBaseline } from './catalog-engine/match.mjs';

export const EXAMPLE_PAIRS = {
  size: ['Loma leche entera 1 L', 'Loma leche entera 200 ml'],
  units: ['Pollo entero 1 kg', 'Whole chicken 1000 g'],
  missing: ['Norte cafe molido 200 g', 'Norte cafe 200 g'],
};

export function initMatchDemo() {
  const demo = document.getElementById('match-demo');
  const requested = document.getElementById('match-request');
  const candidate = document.getElementById('match-candidate');
  const presets = [...document.querySelectorAll('[data-pair]')];
  const display = value => Array.isArray(value) ? value.join(', ') || 'None' : value == null ? 'Not stated' : String(value);
  function render() {
    const result = compareNames(requested.value.trim(), candidate.value.trim());
    document.getElementById('match-baseline').textContent = keywordBaseline(requested.value, candidate.value) ? 'Accepts: shared word' : 'Rejects: no shared word';
    document.getElementById('match-decision').textContent = { yes: 'Accepts this presentation', no: 'Rejects this presentation', uncertain: 'Needs more evidence' }[result.decision];
    document.getElementById('match-reason').textContent = result.reason;
    document.getElementById('match-identity').dataset.decision = result.decision;
    document.getElementById('match-checks').replaceChildren(...result.checks.map(check => {
      const row = document.createElement('tr');
      row.dataset.result = check.status;
      [check.key, display(check.request), display(check.candidate), check.status].forEach((value, index) => {
        const cell = document.createElement(index === 0 ? 'th' : 'td');
        if (index === 0) cell.scope = 'row';
        cell.textContent = value;
        row.append(cell);
      });
      return row;
    }));
  }
  presets.forEach(button => button.addEventListener('click', () => {
    [requested.value, candidate.value] = EXAMPLE_PAIRS[button.dataset.pair];
    presets.forEach(preset => preset.setAttribute('aria-pressed', String(preset === button)));
    render();
  }));
  document.getElementById('match-form').addEventListener('submit', event => {
    event.preventDefault();
    presets.forEach(preset => preset.setAttribute('aria-pressed', 'false'));
    render();
  });
  render();
  demo.hidden = false;
}
