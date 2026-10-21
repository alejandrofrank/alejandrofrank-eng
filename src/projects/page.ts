import { SITE, LINKS } from '../content';
import { FAVICON } from '../favicon';
import { FONTS_LINK } from '../ui';
import { esc } from '../panels/helpers';
import { bakianoTechnical, vestiTechnical } from '../panels/technical';
import { PROJECTS, projectPath, type Project } from './catalog';
import { readingStyles } from './styles';
import { appearanceStyles, type PortfolioView } from '../appearance';
import { navigationStyles, portfolioNavigation, portfolioProjects } from '../navigation';
import { readingAppearance } from './appearance';
import { renderProjectExplorer } from './explorer';
import { explorerStyles } from './explorer-styles';

export function projectState(project: Project): string {
  const state = project.category === 'Product' ? ' live' : project.category === 'In development' ? ' building' : '';
  return `<span class="state${state}">${esc(project.status)}</span>`;
}

export function readingShell(title: string, description: string, path: string, origin: string, body: string, extraStyles = '', script = '', view: PortfolioView = path === '/play' ? 'arcade' : 'tech'): string {
  const currentProject = PROJECTS.find(project => projectPath(project) === path);
  const appearance = readingAppearance(view);
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="${appearance.color}">${FAVICON}${FONTS_LINK}
<title>${esc(title)} · ${SITE.name}</title><meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(origin + path)}">
<meta property="og:type" content="website"><meta property="og:title" content="${esc(title)} · ${SITE.name}">
<meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${esc(origin + path)}">
<meta property="og:image" content="${esc(origin)}/og-forest.png"><meta name="twitter:card" content="summary_large_image">
<style>${readingStyles}${appearanceStyles}${extraStyles}${appearance.styles}${navigationStyles}</style></head><body class="${appearance.bodyClass}" data-view="${view}">
${appearance.background}
<a class="skip-link" href="#main">Skip to content</a><div class="site-wrap">
${portfolioNavigation(view, path === '/tech' ? 'home' : 'projects', currentProject?.slug, currentProject ? path : undefined)}<main id="main">${body}</main>
<footer class="site-footer" id="contact"><p>Have a problem worth working on? Get in touch.</p><nav class="footer-links" aria-label="Contact">${LINKS.filter(l => ['Email', 'GitHub', 'LinkedIn'].includes(l.label)).map(l => `<a href="${esc(l.href)}"${l.href.startsWith('https:') ? ' target="_blank" rel="noopener noreferrer"' : ''}>${esc(l.label)}${l.href.startsWith('https:') ? ' ↗' : ''}</a>`).join('')}</nav></footer>
</div><script type="module" src="/appearance.mjs"></script>${script ? `<script type="module">${script}</script>` : ''}</body></html>`;
}

export function renderProjectIndex(origin: string, calendar: string, view: PortfolioView = 'tech'): string {
  return readingShell('Projects', 'Engineering projects by Alejandro Frank: Bakiano, runnable data labs, visual experiments and work in progress.', '/tech', origin, `
<header class="intro explorer-intro"><div><p class="eyebrow">Engineer · Madrid</p><h1>Project explorer</h1></div><p>Products, systems and experiments. Pick one to look inside.</p></header>
<section id="projects" aria-labelledby="projects-title"><h2 id="projects-title" class="explorer-section-title">Selected work</h2>${renderProjectExplorer()}
<div class="work-layout" data-project-list><aside class="reading-guide"><nav aria-label="Project reading order"><h2>A suggested reading order</h2><ol>${PROJECTS.map((p, i) => `<li><a href="#${p.slug}"><span>${String(i + 1).padStart(2, '0')}</span>${esc(p.title)}</a></li>`).join('')}</ol></nav><p>Each story covers the problem, the approach, and what you can inspect.</p></aside>
<ol class="project-index">${PROJECTS.map((p, i) => `<li class="project-entry" id="${p.slug}"><article aria-labelledby="title-${p.slug}"><div class="entry-meta"><span class="number">${String(i + 1).padStart(2, '0')} / ${esc(p.category)}</span>${projectState(p)}</div><h3 id="title-${p.slug}"><a href="${projectPath(p)}">${esc(p.title)} <span aria-hidden="true">→</span></a></h3><p class="entry-question">${esc(p.question)}</p><p>${esc(p.summary)}</p><div class="entry-bottom"><span class="stack">${p.stack.map(esc).join(' · ')}</span><a class="read-link" href="${projectPath(p)}" aria-label="Read ${esc(p.title)}">Read project →</a></div></article></li>`).join('')}</ol></div></section>
<section class="about-strip" id="about" aria-labelledby="about-title"><h2 id="about-title">About me</h2><div><p>${esc(SITE.subtitle)} Based in Madrid, with experience across data platforms, automation and product development.</p><a href="/timeline">Explore my experience →</a>${calendar}</div></section>`, explorerStyles, `import '/projects/explorer.mjs';`, view);
}

export function renderProjectPage(slug: string, origin: string, view: PortfolioView = 'tech'): string | undefined {
  const index = PROJECTS.findIndex(p => p.slug === slug);
  if (index < 0) return undefined;
  const project = PROJECTS[index];
  const next = PROJECTS[index + 1];
  const technical = project.slug === 'bakiano' ? bakianoTechnical() : project.slug === 'vesti' ? vestiTechnical() : '';
  const run = project.repo ? `<section aria-labelledby="run-title"><h2 id="run-title">Run it locally</h2><p>Node.js 22 or newer. The default lab needs no API key or cloud account.</p><pre class="run-block"><code>git clone https://github.com/alejandrofrank/${esc(project.repo)}.git
cd ${esc(project.repo)}
npm run dev</code></pre><p class="run-note">Then open <code>http://127.0.0.1:${project.port}</code>. Follow the repository for optional integrations and verification commands.</p></section>` : '';
  return readingShell(project.title, project.summary, projectPath(project), origin, `
<nav class="breadcrumb" aria-label="Breadcrumb"><a href="${portfolioProjects(view, project.slug)}">← All projects</a> / ${String(index + 1).padStart(2, '0')}</nav>
<header class="case-head"><div class="entry-meta"><span class="eyebrow">${esc(project.category)}</span>${projectState(project)}</div><h1>${esc(project.title)}</h1><p class="question">${esc(project.question)}</p><p class="summary">${esc(project.summary)}</p>${project.links.length ? `<div class="actions">${project.links.map((link, i) => `<a class="action${i === 0 ? ' primary' : ''}" href="${esc(link.href)}" target="_blank" rel="noopener noreferrer">${esc(link.label)} ↗</a>`).join('')}</div>` : ''}</header>
<div class="case-grid"><div class="case-copy"><section><h2>The problem</h2><p>${esc(project.problem)}</p></section><section><h2>The approach</h2><ul>${project.approach.map(p => `<li>${esc(p)}</li>`).join('')}</ul></section><section><h2>What you can inspect</h2><p>${esc(project.evidence)}</p></section><section class="case-note"><h2>Scope & limitations</h2><p>${esc(project.boundary)}</p></section>${run}${technical}</div>
<aside class="case-aside" aria-label="Project at a glance"><h2>System at a glance</h2><ol class="flow">${project.flow.map(p => `<li>${esc(p)}</li>`).join('')}</ol><h2>Working with</h2><p>${project.stack.map(esc).join(' · ')}</p></aside></div>
<nav class="next-project" aria-label="Continue reading"><a href="${portfolioProjects(view, project.slug)}">Back to projects</a><a href="/play#concept-${project.slug}">Play this project →</a>${next ? `<a href="${projectPath(next)}"><span>Next in the reading path</span>${esc(next.title)} →</a>` : '<a href="/timeline">Explore my experience →</a>'}</nav>`, '', '', view);
}
