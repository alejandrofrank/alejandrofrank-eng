import { setAppearanceProject } from '../appearance.mjs';
import { initImageDemo } from './image-demo.mjs';
import { initMatchDemo } from './match-demo.mjs';

export function initArcade() {
  const controls = document.getElementById('station-controls');
  const radios = Array.from(document.querySelectorAll('input[name="station"]'));
  const panels = Array.from(document.querySelectorAll('[data-station-panel]'));
  const player = document.getElementById('room-player');
  const strip = document.querySelector('.room-scroll');
  const imageDemo = initImageDemo();
  initMatchDemo();
  let currentStation = null;
  let walkTimer;
  function positionPlayer(animate = true) {
    const tile = radios.find(radio => radio.checked).closest('.station');
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
  function selectStation(slug) {
    const selected = radios.find(radio => radio.value === slug) || radios.find(radio => radio.value === 'catalog-match-lab');
    selected.checked = true;
    panels.forEach(panel => { panel.hidden = panel.dataset.stationPanel !== selected.value; });
    setAppearanceProject(selected.value);
    document.getElementById('room-position').textContent = `${String(radios.indexOf(selected) + 1).padStart(2, '0')} / ${String(radios.length).padStart(2, '0')}`;
    const enter = document.getElementById('room-enter');
    enter.href = '#concept-' + selected.value;
    enter.textContent = ['catalog-match-lab', 'ascii-art'].includes(selected.value) ? 'Open the example ↓' : 'Explore the idea ↓';
    if (selected.value === 'ascii-art') imageDemo.activate();
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
    if (!event.target.matches('input[name="station"]')) return;
    selectStation(event.target.value);
    history.replaceState(null, '', '#' + event.target.value);
  });
  window.addEventListener('hashchange', () => {
    if (radios.some(radio => radio.value === selectedHash())) selectStation(selectedHash());
  });
  new ResizeObserver(() => positionPlayer(false)).observe(document.querySelector('.arcade-floor'));
}
