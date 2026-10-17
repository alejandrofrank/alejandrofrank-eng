import { setAppearanceProject } from '../appearance.mjs';
import { initImageDemo } from './image-demo.mjs';
import { initMatchDemo } from './match-demo.mjs';
import { initIngestionGame } from './games/ingestion.mjs';
import { initQueryGame } from './games/query.mjs';
import { initIdentityGames } from './games/identity.mjs';
import { initPaletteGame } from './games/palette.mjs';
import { initBasketGame } from './games/basket.mjs';
import { mountCabinetScreen } from './arcade-screen.mjs';

export function initArcade() {
  const controls = document.getElementById('station-controls');
  const radios = Array.from(document.querySelectorAll('input[name="station"]'));
  const panels = Array.from(document.querySelectorAll('[data-station-panel]'));
  const player = document.getElementById('room-player');
  const strip = document.querySelector('.room-scroll');
  const imageDemo = initImageDemo();
  initMatchDemo();
  initIngestionGame();
  initQueryGame();
  initIdentityGames();
  initPaletteGame();
  initBasketGame();
  document.getElementById('image-inspector').addEventListener('toggle', event => {
    if (event.target.open) imageDemo.activate();
  });
  let currentStation = null;
  let walkTimer;
  let screenHistory = false;
  const screen = mountCabinetScreen({ panels, onExit: slug => {
    if (screenHistory) { screenHistory = false; history.back(); }
    else history.replaceState(null, '', '#' + slug);
  } });
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
    setAppearanceProject(selected.value);
    document.getElementById('room-position').textContent = `${String(radios.indexOf(selected) + 1).padStart(2, '0')} / ${String(radios.length).padStart(2, '0')}`;
    const enter = document.getElementById('room-enter');
    enter.href = '#concept-' + selected.value;
    enter.textContent = 'Enter cabinet ↗';
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
  function enterCabinet(slug) {
    selectStation(slug);
    const selected = radios.find(radio => radio.checked);
    if (screen.open(selected.value, selected)) {
      history.replaceState(null, '', '#' + selected.value);
      history.pushState({ arcadeScreen: true }, '', '#concept-' + selected.value);
      screenHistory = true;
    }
  }
  controls.addEventListener('click', event => {
    const label = event.target.closest('.station label'); if (!label) return;
    event.preventDefault(); enterCabinet(document.getElementById(label.htmlFor).value);
  });
  controls.addEventListener('keydown', event => {
    if (event.target.matches('input[name="station"]') && ['Enter', ' '].includes(event.key)) { event.preventDefault(); enterCabinet(event.target.value); }
  });
  document.getElementById('room-enter').addEventListener('click', event => { event.preventDefault(); enterCabinet(currentStation); });
  controls.addEventListener('change', event => {
    if (!event.target.matches('input[name="station"]')) return;
    selectStation(event.target.value);
    history.replaceState(null, '', '#' + event.target.value);
  });
  function followRoute() {
    if (!radios.some(radio => radio.value === selectedHash())) { screen.close({ notify: false }); return; }
    selectStation(selectedHash());
    if (location.hash.startsWith('#concept-')) {
      screenHistory = Boolean(history.state?.arcadeScreen);
      if (!screen.isOpen || screen.current !== currentStation) screen.open(currentStation, radios.find(radio => radio.checked));
    } else { screenHistory = false; screen.close({ notify: false }); }
  }
  window.addEventListener('hashchange', followRoute);
  window.addEventListener('popstate', followRoute);
  followRoute();
  new ResizeObserver(() => positionPlayer(false)).observe(document.querySelector('.arcade-floor'));
}
