import { createSession } from './catalog-game.mjs';

export function initArcade() {
  const controls = document.getElementById('station-controls');
  const radios = Array.from(document.querySelectorAll('input[name="station"]'));
  const panels = Array.from(document.querySelectorAll('[data-station-panel]'));
  const defaultStation = 'catalog-match-lab';
  function selectStation(slug) {
    const selected = radios.find(radio => radio.value === slug) || radios.find(radio => radio.value === defaultStation);
    selected.checked = true;
    panels.forEach(panel => { panel.hidden = panel.dataset.stationPanel !== selected.value; });
    document.getElementById('mode-toggle').href = '/tech#' + selected.value;
    const strip = controls.querySelector('.stations');
    if (strip.scrollWidth > strip.clientWidth) {
      const tile = selected.closest('.station');
      strip.scrollLeft += tile.getBoundingClientRect().left - strip.getBoundingClientRect().left - (strip.clientWidth - tile.clientWidth) / 2;
    }
  }
  controls.hidden = false;
  selectStation(location.hash.slice(1));
  controls.addEventListener('change', event => {
    if (event.target.matches('input[name="station"]')) {
      selectStation(event.target.value);
      // No page jump or history entry on every arrow-key selection.
      history.replaceState(null, '', '#' + event.target.value);
    }
  });
  window.addEventListener('hashchange', () => {
    const slug = location.hash.slice(1);
    if (radios.some(radio => radio.value === slug)) selectStation(slug);
  });

  const session = createSession();
  const game = document.getElementById('catalog-game');
  const choices = Array.from(game.querySelectorAll('[data-answer]'));
  const feedback = document.getElementById('game-feedback');
  const evidence = document.getElementById('game-evidence');
  const next = document.getElementById('next-round');
  function render() {
    const { index, total, score, choice, pair, last } = session.state();
    const answered = choice !== null;
    document.getElementById('round-label').textContent = `Pair ${index + 1} of ${total}`;
    document.getElementById('score-label').textContent = `${score} / ${total} correct`;
    document.getElementById('listing-a').textContent = pair.a;
    document.getElementById('listing-b').textContent = pair.b;
    choices.forEach(button => { button.disabled = answered; });
    feedback.hidden = !answered;
    evidence.hidden = !answered;
    next.hidden = !answered;
    if (answered) {
      const correct = choice === pair.answer;
      feedback.dataset.correct = String(correct);
      const labels = { same: 'Same presentation', different: 'Different presentations', uncertain: 'Not enough evidence' };
      document.getElementById('feedback-title').textContent = `${correct ? 'Correct' : 'Look again'}: ${labels[pair.answer]}.${last ? ` Challenge complete — ${score} of ${total} correct.` : ''}`;
      document.getElementById('feedback-reason').textContent = pair.reason;
      const rows = document.getElementById('evidence-rows');
      rows.replaceChildren(...pair.checks.map(check => {
        const row = document.createElement('tr');
        check.forEach((value, i) => {
          const cell = document.createElement(i === 0 ? 'th' : 'td');
          if (i === 0) cell.scope = 'row';
          cell.textContent = value;
          row.append(cell);
        });
        return row;
      }));
      next.textContent = last ? 'Play again' : 'Next pair →';
      // Disabling the selected answer must not strand keyboard focus.
      next.focus({ preventScroll: true });
    }
  }
  choices.forEach(button => button.addEventListener('click', () => {
    session.answer(button.dataset.answer);
    render();
  }));
  next.addEventListener('click', () => {
    if (session.state().last) session.reset(); else session.next();
    render();
    document.getElementById('round-question').focus({ preventScroll: true });
  });
  render();
  game.hidden = false;
}
