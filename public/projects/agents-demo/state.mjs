export function createClock(duration, rate, playing = false) {
  let time = 0, anchor = null;
  return {
    get time() { return time; }, get playing() { return playing; }, get rate() { return rate; },
    seek(value) { time = Math.max(0, Math.min(duration, Number(value) || 0)); anchor = null; },
    play(value) { playing = value; anchor = null; },
    tick(now, visible) {
      if (anchor !== null && playing && visible) time = Math.min(duration, time + Math.max(0, now - anchor) / 1000 * rate);
      anchor = visible ? now : null;
      if (time >= duration) playing = false;
      return time;
    },
  };
}
export function formatTime(seconds) { return Math.floor(seconds / 60) + ':' + String(Math.floor(seconds % 60)).padStart(2, '0'); }
export function escapeHTML(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
export function storeFrame(data, frame) { return {...frame.state, layout:data.definition.layout}; }
export function syncMotionButton(button, paused, reduced) {
  button.disabled = reduced;
  button.textContent = reduced ? 'Motion off' : paused ? 'Resume motion' : 'Pause motion';
  button.setAttribute('aria-pressed', String(reduced || paused));
  button.title = reduced ? 'Your device is set to reduce motion.' : '';
}
