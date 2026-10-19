import { SITE, LINKS, OUTCOMES } from '../content';
import { FAVICON } from '../favicon';
import { FONTS_LINK } from '../ui';
import { esc } from '../panels/helpers';
import type { Env } from '../panels';
import { getContributionCalendar, type Calendar } from '../panels/github';
import { appearanceStyles, appearanceSwitch } from '../appearance';
import { PLAYER } from './art';
import { arcadeHomeStyles } from './home-styles';

const COLORS = ['#263b3e', '#426b5b', '#628c68', '#96bd81', '#c6e5a4'];
const level = (count: number) => count <= 0 ? 0 : count <= 2 ? 1 : count <= 4 ? 2 : count <= 7 ? 3 : 4;

/** A projection of the real week/day cells, not a procedural contribution chart. */
function floor(calendar: Calendar | null): string {
  const columns = calendar?.weeks.length || 53;
  const point = (x: number, y: number) => {
    const depth = y / 7;
    const width = 540 + depth * 620;
    return `${(500 + (x / columns - .5) * width).toFixed(1)},${(200 + depth * 340).toFixed(1)}`;
  };
  const cells: string[] = [];
  for (let week = 0; week < columns; week++) {
    const days = calendar?.weeks[week].days;
    for (let row = 0; row < (days?.length ?? 7); row++) {
      const day = days?.[row];
      const weekday = day ? new Date(day.date + 'T00:00:00Z').getUTCDay() : row;
      const points = [point(week + .08, weekday + .08), point(week + .92, weekday + .08), point(week + .92, weekday + .92), point(week + .08, weekday + .92)].join(' ');
      cells.push(`<polygon points="${points}" fill="${day ? COLORS[level(day.count)] : '#26343e'}"${day ? ` data-date="${esc(day.date)}" data-count="${day.count}"` : ''}/>`);
    }
  }
  return `<svg class="range-floor" viewBox="0 0 1000 540" preserveAspectRatio="none" aria-hidden="true"><path d="M0 170H1000M0 110H1000M230 0V200M770 0V200" stroke="#2c3148" fill="none"/><path d="M230 200H770L1080 540H-80Z" fill="#141f29" stroke="#628c68"/>${cells.join('')}</svg>`;
}

function activity(calendar: Calendar | null): string {
  if (!calendar) return '<p>GitHub activity is temporarily unavailable. The range uses a neutral practice floor.</p>';
  return `<details class="activity-details"><summary>Read the contribution graph</summary><div class="activity-scroll"><div class="activity-grid">${calendar.weeks.map(week => `<div>${week.days.map(day => `<span style="--cell:${COLORS[level(day.count)]};grid-row:${new Date(day.date + 'T00:00:00Z').getUTCDay() + 1}" title="${esc(day.date)}: ${day.count} contributions"><span class="sr-only">${esc(day.date)}: ${day.count} contributions</span></span>`).join('')}</div>`).join('')}</div></div><p>One tile per day, oldest weeks on the left. Brighter tiles mean more contributions. Shots do not change this data.</p></details>`;
}

const ICONS = {
  projects: '<rect x="5" y="3" width="22" height="21" rx="2"/><path d="M9 7h14v10H9zM10 21h.01M21 21h.01M5 24l-2 5h26l-2-5"/>',
  experience: '<path d="M2 27h28M4 22h8M13 16h7M21 9h9M9 3v9m-3-6 3-3 3 3"/>',
  contact: '<path d="M4 5h24v18H17l-6 6v-6H4zM9 11h14M9 16h9"/>',
};
const icon = (name: keyof typeof ICONS) => `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

export async function renderArcadeHome(env: Env, origin: string): Promise<string> {
  const { user, calendar } = await getContributionCalendar(env);
  const github = `https://github.com/${encodeURIComponent(user)}`;
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#11121b">
${FAVICON}${FONTS_LINK}<title>${SITE.name} · Arcade</title><meta name="description" content="Explore Alejandro Frank's projects and experience, or play a quick aim-training round on his GitHub contribution grid."><link rel="canonical" href="${esc(origin)}/">
<style>${arcadeHomeStyles}${appearanceStyles}</style></head><body data-view="arcade" class="arcade-home">
<a class="skip-link" href="#main">Skip to content</a><div class="lobby-wrap">
<header class="lobby-header"><a class="lobby-name" href="/">${SITE.name}</a>${appearanceSwitch('arcade')}</header>
<main id="main"><div class="lobby-intro"><div><h1>Engineer based in Madrid</h1><p>Pick a destination. Or warm up your aim.</p></div><span class="lobby-tag">ARCADE / LOBBY</span></div>
<div class="lobby-menu" aria-label="Explore the portfolio">
<details class="lobby-panel" name="lobby" id="about"><summary class="lobby-card"><span class="menu-icon">${PLAYER}</span><span><b>About me</b><small>Meet the player</small></span><span class="menu-arrow" aria-hidden="true">+</span></summary><section class="lobby-panel-body"><h2>Player profile</h2><p>${esc(SITE.subtitle)}</p><dl>${OUTCOMES.map(outcome => `<div><dt>${esc(outcome.label)}</dt><dd>${esc(outcome.value)}</dd></div>`).join('')}</dl><a href="/timeline">Explore my experience →</a></section></details>
<a class="lobby-card" href="/play"><span class="menu-icon">${icon('projects')}</span><span><b>Projects</b><small>Enter the game room</small></span><span class="menu-arrow" aria-hidden="true">↗</span></a>
<a class="lobby-card" href="/timeline"><span class="menu-icon">${icon('experience')}</span><span><b>Experience</b><small>Explore the timeline</small></span><span class="menu-arrow" aria-hidden="true">↗</span></a>
<details class="lobby-panel" name="lobby" id="contact"><summary class="lobby-card"><span class="menu-icon">${icon('contact')}</span><span><b>Say hello</b><small>Open a channel</small></span><span class="menu-arrow" aria-hidden="true">+</span></summary><section class="lobby-panel-body"><h2>Let’s talk.</h2><p>Have a problem worth working on?</p><nav aria-label="Contact">${LINKS.filter(link => ['Email', 'GitHub', 'LinkedIn'].includes(link.label)).map(link => `<a href="${esc(link.href)}"${link.href.startsWith('https:') ? ' target="_blank" rel="noopener noreferrer"' : ''}>${esc(link.label)} ↗</a>`).join('')}</nav></section></details>
</div>
<section class="aim-range" aria-labelledby="range-title" data-aim-range>
<header class="range-header"><div><span class="range-kicker">01 / WARM-UP</span><h2 id="range-title">Commit range</h2></div><div class="range-metrics" aria-label="Round statistics"><div><span>Time</span><b data-stat="time">30.0</b></div><div><span>Score</span><b data-stat="score">00000</b></div><div><span>Accuracy</span><b data-stat="accuracy">—</b></div><div><span>Combo</span><b data-stat="combo">×0</b></div></div></header>
<div class="range-board" tabindex="-1" aria-label="Aim-training range. Click or tap the round targets. Escape pauses." data-range-board>
${floor(calendar)}<span class="range-wall-label" aria-hidden="true">GITHUB / ${esc(user.toUpperCase())}</span>
<div class="range-stage" aria-hidden="true"><span data-stage>READY</span><span data-stage-hint>30 SECOND ROUND</span></div>
<div class="range-targets" data-targets></div><div class="range-feedback" aria-hidden="true" data-feedback></div>
<div class="range-overlay" data-overlay><div class="range-overlay-card"><span class="range-kicker" data-overlay-kicker>AIM TRAINING</span><h3 data-overlay-title>30-second warm-up</h3><p data-overlay-copy>Hit targets before their rings run out. Misses cost 25 points. Every ten seconds, the range gets harder.</p><div class="range-options" data-options><label for="aim-input">Controls</label><select id="aim-input"><option value="pointer">Mouse / touch</option><option value="keyboard">Keyboard practice</option></select></div><button class="range-primary" data-start disabled>Start round →</button><p class="range-loading" data-loading>Loading range…</p><noscript><p>Enable JavaScript to play. The portfolio menu and contribution graph work without it.</p></noscript></div></div>
</div>
<div class="range-toolbar"><p data-instructions>Click / tap to shoot · Esc to pause · 30 seconds</p><div><button data-pause hidden>Pause</button><button data-stop hidden>Exit range</button></div></div>
<div class="range-progress" aria-hidden="true"><span data-progress></span></div>
<p class="sr-only" role="status" aria-live="polite" data-announcement></p>
<footer class="range-caption"><a href="${github}" target="_blank" rel="noopener noreferrer">GitHub · ${esc(user)} ↗</a><span>${calendar ? `${calendar.total.toLocaleString()} contributions in the last year · real activity, playable floor` : 'Practice floor · GitHub activity unavailable'}</span></footer>
${activity(calendar)}
</section>
<p class="lobby-footnote">The menu is always open. No high score required.</p>
</main></div><script type="module" src="/appearance.mjs"></script><script type="module">import { initAimRange } from '/play/aim-range.mjs'; initAimRange();</script></body></html>`;
}
