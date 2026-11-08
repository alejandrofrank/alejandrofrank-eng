import { SITE, LINKS } from '../content';
import { esc } from '../panels/helpers';
import { SCENES } from '../resume/data/scenes.generated';
import { PROJECTS, projectPath } from './catalog';
import { readingShell, projectState } from './page';

const homeStyles = `
.tech-home-intro { padding:28px 0 32px; }
.tech-home-intro h1 { font-size:28px; }
.tech-home-location { margin-top:8px; color:var(--muted); font-size:15px; }
.tech-home-intro>p:last-of-type { max-width:65ch; margin-top:20px; }
.tech-home-choices { display:flex; flex-wrap:wrap; align-items:start; gap:8px 24px; margin-top:22px; }
.tech-home-choices>a,.tech-home-choices summary { display:flex; align-items:center; min-height:44px; cursor:pointer; color:var(--accent); text-decoration:underline; text-underline-offset:4px; }
.tech-home-choices details { display:contents; }
.tech-home-choices summary { list-style:none; }
.tech-home-choices summary::-webkit-details-marker { display:none; }
.tech-home-choices summary::after { content:'+'; margin-left:10px; text-decoration:none; }
.tech-home-choices details[open] summary::after { content:'−'; }
.tech-home-reveal { order:1; flex-basis:100%; padding:20px; background:var(--surface); border:1px solid var(--line); border-radius:6px; }
.tech-home-reveal p { max-width:70ch; }
.tech-home-reveal .footer-links { margin:0; }
.tech-home-reveal a { display:inline-flex; align-items:center; min-height:44px; }
.tech-home-work { border-top:1px solid var(--line); padding-top:28px; }
.tech-home-heading { display:flex; flex-wrap:wrap; align-items:baseline; justify-content:space-between; gap:12px; margin-bottom:12px; }
.tech-home-heading h2 { font-size:21px; }
.tech-home-heading>a { display:inline-flex; align-items:center; min-height:44px; font-size:14px; }
.tech-work-list { list-style:none; padding:0; margin:0; }
.tech-work-list li { border-bottom:1px solid var(--line); }
.tech-work-list article { display:grid; grid-template-columns:210px minmax(0,1fr) auto; align-items:start; gap:16px 28px; padding:24px 0; }
.tech-work-list h3 { font-size:18px; margin:0 0 8px; }
.tech-work-list p { color:var(--muted); font-size:15px; max-width:65ch; }
.tech-work-list .stack { display:block; margin-top:8px; }
.tech-work-list .read-link { display:inline-flex; align-items:center; min-height:44px; }
.tech-recent { padding-top:36px; }
.tech-recent-list { list-style:none; padding:0; margin:0; display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:28px; }
.tech-recent-list li { padding:18px 0; }
.tech-recent-list h3 { font-size:17px; }
.tech-recent-list .role-period { display:block; color:var(--muted); font:12px/1.6 var(--mono); margin-top:8px; }
.tech-recent-list p { font-size:14px; color:var(--muted); margin:12px 0; }
.tech-recent-list a { display:inline-flex; align-items:center; min-height:44px; font-size:14px; }
@media (max-width:780px) { .tech-work-list article { grid-template-columns:1fr auto; gap:8px 20px; }.tech-work-list article>div:nth-child(2) { grid-column:1; }.tech-work-list .read-link { grid-column:2; grid-row:1 / 3; align-self:center; }.tech-recent-list { grid-template-columns:1fr; gap:0; }.tech-recent-list li+li { border-top:1px solid var(--line); } }
@media (max-width:480px) { .tech-home-intro h1 { font-size:25px; }.tech-home-choices { gap:8px 20px; }.tech-work-list article { display:block; }.tech-work-list article>div:nth-child(2) { margin-top:12px; }.tech-work-list .read-link { margin-top:8px; }.tech-home-reveal { padding:16px; } }
`;

/** The Tech landing page is entirely local content, available before JavaScript. */
export function renderTechHome(origin: string): string {
  const recent = [...SCENES].reverse().slice(0, 3);
  return readingShell(SITE.role, SITE.subtitle, '/', origin, `
<header class="tech-home-intro"><h1>${esc(SITE.role)}</h1><p class="tech-home-location">Based in ${esc(SITE.location)}</p><p>I build data platforms, automation and AI products. Here are the systems, the decisions behind them, and the parts you can try.</p>
<nav class="tech-home-choices" aria-label="Explore the portfolio">
<details name="tech-home-info" id="about"><summary>About me</summary><div class="tech-home-reveal"><p>${esc(SITE.subtitle)} My work spans market intelligence, data ingestion, product matching and agent coordination.</p><a href="/resume">Read my experience →</a></div></details>
<a href="#work">Projects</a><a href="/timeline">Experience</a>
<details name="tech-home-info"><summary>Say hello</summary><div class="tech-home-reveal"><nav class="footer-links" aria-label="Say hello">${LINKS.filter(link => ['Email', 'LinkedIn', 'GitHub'].includes(link.label)).map(link => `<a href="${esc(link.href)}"${link.href.startsWith('https:') ? ' target="_blank" rel="noopener noreferrer"' : ''}>${esc(link.label)}${link.href.startsWith('https:') ? ' ↗' : ''}</a>`).join('')}</nav></div></details>
</nav></header>
<section class="tech-home-work" id="work" aria-labelledby="tech-work-title"><div class="tech-home-heading"><h2 id="tech-work-title">Projects</h2><a href="/tech">Open project explorer →</a></div>
<ol class="tech-work-list">${PROJECTS.map(project => `<li><article><div><h3><a href="${projectPath(project)}">${esc(project.title)}</a></h3>${projectState(project)}</div><div><p>${esc(project.summary)}</p><span class="stack">${project.stack.map(esc).join(' · ')}</span></div><a class="read-link" href="${projectPath(project)}" aria-label="Inside ${esc(project.title)}">Inside the project →</a></article></li>`).join('')}</ol></section>
<section class="tech-recent" aria-labelledby="tech-recent-title"><div class="tech-home-heading"><h2 id="tech-recent-title">Recent experience</h2><a href="/resume">All ${SCENES.length} roles →</a></div><ol class="tech-recent-list">${recent.map(scene => `<li><h3>${esc(scene.title)}</h3><span class="role-period">${esc(scene.period)}</span><p>${esc(scene.role)}</p><a href="/resume#${encodeURIComponent(scene.id)}">Read this role →</a></li>`).join('')}</ol></section>`, homeStyles, '', 'tech');
}
