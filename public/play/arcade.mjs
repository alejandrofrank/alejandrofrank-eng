import { createSession } from './catalog-game.mjs';
import { setAppearanceProject } from '../appearance.mjs';
import { initPixelWorkshop } from './pixel-workshop.mjs';

export function initArcade() {
  const controls = document.getElementById('station-controls');
  const radios = Array.from(document.querySelectorAll('input[name="station"]'));
  const panels = Array.from(document.querySelectorAll('[data-station-panel]'));
  const defaultStation = 'catalog-match-lab';
  const player = document.getElementById('room-player');
  const strip = document.querySelector('.room-scroll');
  let currentStation = null;
  let walkTimer;
  let celebrationTimer;
  function positionPlayer(animate = true) {
    const selected = radios.find(radio => radio.checked);
    const tile = selected.closest('.station');
    const floor = document.querySelector('.arcade-floor');
    const x = tile.getBoundingClientRect().left - floor.getBoundingClientRect().left + tile.clientWidth / 2 - player.clientWidth / 2;
    const previousX = Number(player.dataset.x ?? x);
    player.dataset.facing = x < previousX ? 'left' : 'right';
    player.dataset.x = String(x);
    player.style.transform = `translateX(${x}px)`;
    clearTimeout(walkTimer);
    player.classList.toggle('is-walking', animate && x !== previousX);
    walkTimer = setTimeout(() => player.classList.remove('is-walking'), 600);
  }
  function celebrate() {
    clearTimeout(celebrationTimer);
    player.classList.add('is-celebrating');
    celebrationTimer = setTimeout(() => player.classList.remove('is-celebrating'), 1000);
  }
  function selectStation(slug) {
    const selected = radios.find(radio => radio.value === slug) || radios.find(radio => radio.value === defaultStation);
    selected.checked = true;
    panels.forEach(panel => { panel.hidden = panel.dataset.stationPanel !== selected.value; });
    setAppearanceProject(selected.value);
    document.getElementById('room-position').textContent = `${String(radios.indexOf(selected) + 1).padStart(2, '0')} / ${String(radios.length).padStart(2, '0')}`;
    const enter = document.getElementById('room-enter');
    enter.href = '#concept-' + selected.value;
    enter.textContent = ['catalog-match-lab', 'ascii-art'].includes(selected.value) ? 'Play this cabinet ↓' : 'Explore this concept ↓';
    positionPlayer(currentStation !== null);
    currentStation = selected.value;
    if (strip.scrollWidth > strip.clientWidth) {
      const tile = selected.closest('.station');
      strip.scrollLeft += tile.getBoundingClientRect().left - strip.getBoundingClientRect().left - (strip.clientWidth - tile.clientWidth) / 2;
    }
  }
  document.getElementById('arcade-room').hidden = false;
  const selectedHash = () => location.hash.slice(1).replace(/^concept-/, '');
  selectStation(selectedHash());
  controls.addEventListener('change', event => {
    if (event.target.matches('input[name="station"]')) {
      selectStation(event.target.value);
      // No page jump or history entry on every arrow-key selection.
      history.replaceState(null, '', '#' + event.target.value);
    }
  });
  window.addEventListener('hashchange', () => {
    const slug = selectedHash();
    if (radios.some(radio => radio.value === slug)) selectStation(slug);
  });
  new ResizeObserver(() => positionPlayer(false)).observe(document.querySelector('.arcade-floor'));
  initPixelWorkshop(() => {
    if (currentStation === 'ascii-art') celebrate();
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
    choices.forEach(button => {
      button.disabled = answered;
      button.dataset.picked = String(button.dataset.answer === choice);
    });
    game.querySelectorAll('.round-dots i').forEach((dot, i) => { dot.dataset.state = i < index || (i === index && answered) ? 'done' : i === index ? 'current' : 'upcoming'; });
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
    if (session.state().choice === session.state().pair.answer) celebrate();
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
