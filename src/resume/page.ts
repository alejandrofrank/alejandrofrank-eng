import { experienceAppearance, experienceNavigation } from '../experience-appearance';
import type { PortfolioView } from '../appearance';
import { styles } from '../styles';
import { FAVICON } from '../favicon';
import { FONTS_LINK } from '../ui';
import { SITE } from '../content';
import { esc } from '../panels/helpers';
import { SCENES } from './data/scenes.generated';

const listStyles = `
.experience-list-page { max-width:1050px; margin:0 auto; padding-bottom:48px; }
.experience-list-page h1 { font-size:30px; line-height:1.25; margin:12px 0; }
.experience-list-intro { color:var(--muted); line-height:1.6; margin:0 0 28px; }
.experience-list { list-style:none; padding:0; margin:0; }
.experience-entry { padding:26px 0; border-top:1px solid var(--line); scroll-margin-top:24px; }
.experience-entry:target { outline:2px solid var(--accent); outline-offset:8px; }
.experience-entry header { display:flex; flex-wrap:wrap; align-items:baseline; justify-content:space-between; gap:8px 24px; }
.experience-entry h2 { font-size:21px; line-height:1.3; margin:0; }
.experience-entry .role-dates { color:var(--muted); font-size:14px; font-variant-numeric:tabular-nums; }
.experience-entry .role-title { font-weight:600; margin:8px 0; }
.experience-entry .role-summary { max-width:72ch; line-height:1.65; margin:0 0 12px; }
.experience-entry a { display:inline-flex; align-items:center; min-height:44px; color:var(--accent); text-underline-offset:4px; }
.personal .experience-list-page { background:#24372ef5; padding:24px 30px 40px; border:1px solid #506557; border-radius:18px; }
@media (max-width:600px) { .personal .experience-list-page { padding:20px 18px; }.experience-entry header { display:block; }.role-dates { display:block; margin-top:6px; } }
@media print { body,.personal .experience-list-page { background:white!important; color:#111!important; }.experience-entry { break-inside:avoid; border-color:#bbb; }.experience-entry a,.skip-link { display:none; }.experience-entry .role-dates,.experience-list-intro { color:#444; }.personal .experience-list-page { border:0; padding:0; } }
`;

/** A complete reading path, available before scripts load. Diagrams remain optional. */
export function renderResumePage(view: PortfolioView = 'original'): string {
  const appearance = experienceAppearance(view);
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="${appearance.color}">${FAVICON}${FONTS_LINK}
<title>${esc(SITE.name)} · Experience</title><meta name="description" content="Roles, dates and engineering work by ${esc(SITE.name)}.">
<style>${styles}${appearance.styles}${listStyles}</style></head>
<body class="${appearance.bodyClass}" data-view="${view}">${appearance.background}
<a class="skip-link" href="#main">Skip to content</a><div class="wrap resumewrap">
${experienceNavigation(view, '/resume')}
<main id="main" class="experience-list-page"><h1>Experience</h1><p class="experience-list-intro">${SCENES.length} roles, most recent first. Open any role to explore the systems behind it.</p>
<ol class="experience-list">${[...SCENES].reverse().map(scene => `<li class="experience-entry" id="${esc(scene.id)}"><article aria-labelledby="role-${esc(scene.id)}"><header><h2 id="role-${esc(scene.id)}">${esc(scene.title)}</h2><span class="role-dates">${esc(scene.period)}</span></header><p class="role-title">${esc(scene.role)}</p><p class="role-summary">${esc(scene.summary)}</p><a href="/timeline#${encodeURIComponent(scene.id)}">Explore this role →</a></article></li>`).join('')}</ol>
</main></div><script type="module" src="/appearance.mjs"></script></body></html>`;
}
