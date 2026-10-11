const explorer = document.getElementById('project-explorer');
if (explorer) {
  const choices = [...explorer.querySelectorAll('input[name="project-choice"]')];
  const panels = [...explorer.querySelectorAll('[data-preview]')];
  const list = document.querySelector('[data-project-list]');
  const viewToggle = document.getElementById('explorer-view-toggle');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const position = document.getElementById('explorer-position');
  const announcement = document.getElementById('explorer-announcement');
  const wireLengths = new Map();
  let selected = -1;
  let animations = [];
  let listMode = false;
  const resetTilt = () => explorer.querySelectorAll('.project-sketch').forEach(sketch => {
    sketch.style.removeProperty('--tilt-x');
    sketch.style.removeProperty('--tilt-y');
  });
  const cancelMotion = () => { animations.forEach(animation => animation.cancel()); animations = []; };
  const animate = (element, frames, options) => {
    if (element.animate) animations.push(element.animate(frames, { duration:450, easing:'cubic-bezier(.16,1,.3,1)', fill:'backwards', ...options }));
  };
  function select(index, updateHash = true) {
    if (index < 0 || index >= choices.length || selected === index) return;
    const direction = selected < 0 || index > selected ? 1 : -1;
    cancelMotion();
    resetTilt();
    selected = index;
    choices.forEach((choice, i) => { choice.checked = i === index; });
    panels.forEach((panel, i) => { panel.hidden = i !== index; });
    const choice = choices[index];
    const panel = panels[index];
    position.textContent = String(index + 1).padStart(2, '0');
    announcement.textContent = `${panel.querySelector('h3').firstChild.textContent}. Project ${index + 1} of ${choices.length}.`;
    document.getElementById('mode-toggle').href = '/play#' + choice.value;
    if (updateHash) history.replaceState(null, '', '#' + choice.value);
    const rail = explorer.querySelector('.project-choices');
    const tile = choice.closest('.project-choice');
    if (rail.scrollWidth > rail.clientWidth) rail.scrollTo({left:tile.offsetLeft - rail.offsetLeft - 3, behavior:motion.matches ? 'auto' : 'smooth'});
    if (motion.matches || listMode) return;
    animate(panel, [{ opacity:0, transform:`translateX(${direction * 28}px) rotateY(${direction * -3}deg) scale(.985)` }, { opacity:1, transform:'none' }], {duration:520});
    panel.querySelectorAll('.reveal-part').forEach((part, i) => animate(part, [{opacity:0,transform:'translateY(13px)'},{opacity:1,transform:'none'}], {delay:i * 35,duration:420}));
    panel.querySelectorAll('.sketch-node').forEach((node, i) => animate(node, [{opacity:0,transform:'scale(.82) translateY(8px)'},{opacity:1,transform:'none'}], {delay:90 + i * 55,duration:560}));
    panel.querySelectorAll('.sketch-wire').forEach((wire, i) => {
      const length = wireLengths.get(wire);
      animate(wire, [{strokeDasharray:`${length}`,strokeDashoffset:length},{strokeDasharray:`${length}`,strokeDashoffset:0}], {delay:200 + i * 50,duration:650});
    });
  }
  const selectHash = () => {
    const index = choices.findIndex(choice => choice.value === location.hash.slice(1));
    if (index >= 0) select(index, false);
  };
  choices.forEach((choice, i) => choice.addEventListener('change', () => select(i)));
  document.getElementById('project-next').addEventListener('click', () => select((selected + 1) % choices.length));
  document.getElementById('project-previous').addEventListener('click', () => select((selected - 1 + choices.length) % choices.length));
  viewToggle.addEventListener('click', () => {
    cancelMotion();
    listMode = !listMode;
    explorer.hidden = listMode;
    list.hidden = !listMode;
    viewToggle.textContent = listMode ? 'Use project picker ↗' : 'Read as a list ☷';
    viewToggle.setAttribute('aria-pressed', String(listMode));
  });
  // Tilt only the illustration; text and controls remain stationary.
  explorer.querySelectorAll('.project-sketch').forEach(sketch => {
    let bounds;
    sketch.addEventListener('pointerenter', () => { bounds = sketch.getBoundingClientRect(); });
    sketch.addEventListener('pointermove', event => {
      if (motion.matches || event.pointerType !== 'mouse' || !bounds) return;
      const x = Math.max(-.5, Math.min(.5, (event.clientX - bounds.left) / bounds.width - .5));
      const y = Math.max(-.5, Math.min(.5, (event.clientY - bounds.top) / bounds.height - .5));
      sketch.style.setProperty('--tilt-x', `${-y * 7}deg`);
      sketch.style.setProperty('--tilt-y', `${x * 9}deg`);
    });
    sketch.addEventListener('pointerleave', resetTilt);
  });
  motion.addEventListener('change', () => { if (motion.matches) { cancelMotion(); resetTilt(); } });
  window.addEventListener('hashchange', selectHash);
  // Publish the enhanced view only after its controls and geometry are ready.
  explorer.hidden = false;
  explorer.querySelectorAll('.sketch-wire').forEach(wire => wireLengths.set(wire, wire.getTotalLength()));
  document.getElementById('explorer-tools').hidden = false;
  list.hidden = true;
  const initial = choices.findIndex(choice => choice.value === location.hash.slice(1));
  select(initial >= 0 ? initial : 0, false);
}
