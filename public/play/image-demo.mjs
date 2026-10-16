import { identicalPixels } from './image-comparison.mjs';

export function initImageDemo() {
  const demo = document.getElementById('image-demo');
  const controls = document.getElementById('image-demo-controls');
  const status = document.getElementById('image-demo-status');
  const repeat = document.getElementById('image-repeat');
  const evidence = document.getElementById('image-evidence');
  const sourceCanvas = document.getElementById('image-source');
  const plainCanvas = document.getElementById('image-plain');
  const ditherCanvas = document.getElementById('image-dithered');
  let active = false;
  let worker;
  let previous;
  const paint = (canvas, raster) => {
    canvas.width = raster.width;
    canvas.height = raster.height;
    canvas.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(raster.data), raster.width, raster.height), 0, 0);
  };
  const summary = result => `${result.width} × ${result.height} · ${result.width * result.height} cells · ${result.counts.filter(count => count > 0).length}/${result.counts.length} colors used`;
  function render(verify = false) {
    worker?.terminate();
    status.textContent = 'Rendering both methods on your device…';
    repeat.disabled = true;
    demo.setAttribute('aria-busy', 'true');
    const settings = { sample: document.getElementById('image-sample').value, columns: Number(document.getElementById('image-columns').value), palette: document.getElementById('image-palette').value };
    const baseline = verify ? previous : null;
    function fail() {
      status.textContent = 'The preview could not run. Open the full image tool using the link below.';
      demo.setAttribute('aria-busy', 'false');
      worker?.terminate();
      previous = null;
      repeat.disabled = false;
      repeat.textContent = 'Retry rendering';
    }
    try {
      const currentWorker = new Worker('/play/image-demo-worker.mjs', { type: 'module' });
      worker = currentWorker;
      currentWorker.onerror = () => { if (worker === currentWorker) fail(); };
      currentWorker.onmessage = ({ data }) => {
        if (worker !== currentWorker) return;
        if (data.error) { fail(); return; }
        const result = data.result;
        paint(sourceCanvas, result.source);
        paint(plainCanvas, result.plain);
        paint(ditherCanvas, result.dithered);
        document.getElementById('image-plain-meta').textContent = summary(result.plain);
        document.getElementById('image-dither-meta').textContent = summary(result.dithered);
        const sampleName = document.getElementById('image-sample').selectedOptions[0].textContent;
        sourceCanvas.setAttribute('aria-label', `Original ${sampleName.toLowerCase()}, ${result.source.width} by ${result.source.height} pixels`);
        plainCanvas.setAttribute('aria-label', `${sampleName}: nearest palette color, ${summary(result.plain)}`);
        ditherCanvas.setAttribute('aria-label', `${sampleName}: Floyd–Steinberg error diffusion, ${summary(result.dithered)}`);
        status.textContent = baseline
          ? (identicalPixels(baseline.plain, result.plain) && identicalPixels(baseline.dithered, result.dithered) ? 'Both images reproduced exactly, pixel for pixel.' : 'The repeated outputs differ. Inspect the settings and renderer.')
          : 'Same source, grid and palette. Only the conversion method changes.';
        evidence.hidden = false;
        previous = result;
        repeat.disabled = false;
        repeat.textContent = 'Check repeatability';
        demo.setAttribute('aria-busy', 'false');
        currentWorker.terminate();
      };
      currentWorker.postMessage(settings);
    } catch { fail(); }
  }
  controls.addEventListener('change', () => render());
  repeat.addEventListener('click', () => render(Boolean(previous)));
  demo.hidden = false;
  return { activate() { if (!active) { active = true; render(); } } };
}
