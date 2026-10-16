import { createPixelCanvas, PALETTES } from './pixel-canvas.mjs';

export function initPixelWorkshop(onPaint) {
  const workshop = document.getElementById('pixel-workshop');
  const board = document.getElementById('pixel-board');
  const swatches = document.getElementById('pixel-swatches');
  const palette = document.getElementById('pixel-palette');
  const undo = document.getElementById('pixel-undo');
  const status = document.getElementById('pixel-status');
  const model = createPixelCanvas();
  const inkNames = ['Background / eraser', 'Primary', 'Secondary', 'Highlight'];
  let ink = 1;
  let pointer = null;
  let activeIndex = 0;
  const cells = Array.from({ length: 64 }, (_, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.pixel = index;
    button.tabIndex = index === 0 ? 0 : -1;
    board.append(button);
    return button;
  });
  const inks = inkNames.map((name, index) => {
    const label = document.createElement('label');
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'pixel-ink';
    radio.value = index;
    radio.checked = index === ink;
    radio.setAttribute('aria-label', name);
    const chip = document.createElement('span');
    chip.setAttribute('aria-hidden', 'true');
    chip.textContent = index === 0 ? '×' : String(index);
    label.append(radio, chip);
    swatches.append(label);
    return chip;
  });
  function render() {
    const colors = PALETTES[palette.value];
    const { pixels, canUndo } = model.state();
    cells.forEach((cell, index) => {
      cell.style.backgroundColor = colors[pixels[index]];
      cell.setAttribute('aria-label', `Row ${Math.floor(index / 8) + 1}, column ${index % 8 + 1}: ${inkNames[pixels[index]].toLowerCase()}`);
    });
    inks.forEach((chip, index) => {
      chip.style.backgroundColor = colors[index];
      chip.style.color = index === 0 ? colors[3] : colors[0];
    });
    undo.disabled = !canUndo;
  }
  function announce(message = '') {
    status.textContent = `${message}${model.state().painted} / 64 pixels filled.`;
  }
  function focusCell(index) {
    cells[activeIndex].tabIndex = -1;
    activeIndex = index;
    cells[index].tabIndex = 0;
    cells[index].focus({ preventScroll: true });
  }
  function paintAt(event) {
    const rect = board.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / rect.width * 8);
    const y = Math.floor((event.clientY - rect.top) / rect.height * 8);
    if (x < 0 || x > 7 || y < 0 || y > 7) return;
    model.paint(y * 8 + x, ink);
    render();
  }
  board.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    const cell = event.target.closest('[data-pixel]');
    if (!cell) return;
    event.preventDefault();
    pointer = event.pointerId;
    focusCell(Number(cell.dataset.pixel));
    model.beginStroke();
    board.setPointerCapture(pointer);
    paintAt(event);
  });
  board.addEventListener('pointermove', event => { if (event.pointerId === pointer) paintAt(event); });
  function finishStroke(event) {
    if (event.pointerId !== pointer) return;
    pointer = null;
    model.endStroke();
    render();
    announce();
    onPaint();
  }
  board.addEventListener('pointerup', finishStroke);
  board.addEventListener('pointercancel', finishStroke);
  board.addEventListener('lostpointercapture', finishStroke);
  board.addEventListener('click', event => {
    // Pointer painting is handled above. A zero-detail click covers keyboard and assistive input.
    const cell = event.target.closest('[data-pixel]');
    if (event.detail !== 0 || !cell) return;
    model.paint(Number(cell.dataset.pixel), ink);
    render();
    announce();
    onPaint();
  });
  board.addEventListener('keydown', event => {
    const index = Number(event.target.dataset.pixel);
    if (!Number.isInteger(index)) return;
    const row = Math.floor(index / 8), column = index % 8;
    const next = { ArrowLeft: row * 8 + (column + 7) % 8, ArrowRight: row * 8 + (column + 1) % 8, ArrowUp: (index + 56) % 64, ArrowDown: (index + 8) % 64, Home: row * 8, End: row * 8 + 7 }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    focusCell(next);
  });
  swatches.addEventListener('change', event => { ink = Number(event.target.value); });
  palette.addEventListener('change', () => { render(); announce('Palette changed. '); });
  undo.addEventListener('click', () => {
    model.undo(); render(); announce('Undone. ');
    // If the button becomes disabled, retain a useful keyboard destination.
    if (undo.disabled) focusCell(activeIndex);
  });
  document.getElementById('pixel-clear').addEventListener('click', () => { model.clear(); render(); announce('Canvas cleared. '); });
  document.getElementById('pixel-export').addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 512;
    const context = canvas.getContext('2d');
    const colors = PALETTES[palette.value];
    model.state().pixels.forEach((value, index) => {
      context.fillStyle = colors[value];
      context.fillRect(index % 8 * 64, Math.floor(index / 8) * 64, 64, 64);
    });
    canvas.toBlob(blob => {
      if (!blob) { status.textContent = 'The image could not be saved. Try again.'; return; }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `after-hours-${palette.value}.png`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      status.textContent = 'PNG ready — 512 × 512, with every pixel intact.';
    }, 'image/png');
  });
  render();
  workshop.hidden = false;
}
