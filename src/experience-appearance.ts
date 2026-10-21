import { appearanceStyles, type ExperiencePath, type PortfolioView } from './appearance';
import { navigationStyles, portfolioNavigation } from './navigation';
import { gradientMarkup } from './gradient';
import { personalStyles } from './personal-styles';

// Server-render the selected view so direct links, refresh and no-JS navigation
// use the saved appearance before the first paint.
export function experienceAppearance(view: PortfolioView) {
  return {
    bodyClass: `${view === 'original' ? 'personal' : 'experience-themed'} experience-page`,
    color: { original: '#192822', tech: '#10151c', arcade: '#11121b' }[view],
    background: view === 'original' ? gradientMarkup : '',
    styles: `${view === 'original' ? personalStyles : themedStyles}${appearanceStyles}${toolbarStyles}${navigationStyles}`,
  };
}

export function experienceNavigation(view: PortfolioView, path: ExperiencePath): string {
  const alternate = path === '/timeline' ? '/resume' : '/timeline';
  return `${portfolioNavigation(view, 'experience', '', path)}<nav class="experience-toolbar subnav" aria-label="Experience navigation"><a href="${alternate}">${alternate === '/resume' ? 'List view' : 'Timeline view'}</a></nav>`;
}

const toolbarStyles = `
.experience-toolbar { display:flex; align-items:center; flex-wrap:wrap; gap:12px 24px; padding:8px 0; margin:0 0 16px; }
.experience-toolbar a { display:inline-flex; align-items:center; min-height:44px; }
@media print { .experience-toolbar { display:none; } }
`;

// Screen-only tokens leave the existing readable, ink-on-white print layout intact.
const themedStyles = `
@media screen {
  .experience-themed,.experience-themed .on-cream {
    color-scheme:dark;
    --bg:#10151c; --surface:#171f29; --line:#354352;
    --fg:#e6edf3; --muted:#b4c1d0; --accent:#8cbcff;
    --panel:var(--surface); --dim:var(--line);
    --job:var(--accent); --contract:#e9b878; --project:#91cbb3;
    background:var(--bg); color:var(--fg);
  }
  .experience-themed[data-view=arcade],.experience-themed[data-view=arcade] .on-cream {
    --bg:#11121b; --surface:#1a1c28; --line:#363749;
    --fg:#f1edde; --muted:#b1afbf; --accent:#c5a2f6;
  }
  .experience-themed .on-cream {
    --bg:var(--surface); background:var(--surface);
  }
  .experience-themed .wrap { max-width:1240px; padding:0 36px; }
  .experience-themed .page-h1 { font-size:30px; line-height:1.25; margin:12px 0; }
  .experience-themed .page-lede { font-size:16px; line-height:1.65; }
  .experience-themed .subnav a:hover,.experience-themed .tlp-foot a:hover { color:var(--accent); }
  .experience-themed :is(a,button,summary):focus-visible { outline:2px solid var(--accent); outline-offset:5px; }
  .experience-themed .tlp-scroll { margin-top:22px; border:1px solid var(--line); border-radius:12px; background:var(--surface); }
  .experience-themed .tlp { height:58vh; min-height:480px; }
  .experience-themed .tlp-bar.job,.experience-themed .lg.job i { background:var(--job); }
  .experience-themed .tlp-bar.contract,.experience-themed .lg.contract i { background:var(--contract); }
  .experience-themed .tlp-bar.project,.experience-themed .lg.project i { background:transparent; box-shadow:inset 0 0 0 1px var(--project); }
  .experience-themed .tlp-bar:hover { filter:brightness(1.2); box-shadow:0 0 0 3px var(--surface),0 0 0 5px var(--fg); }
  .experience-themed .tlp-dialog { border:1px solid var(--line); border-radius:12px; clip-path:none; box-shadow:0 20px 80px #0008; }
  .experience-themed .tlp-backdrop { background:#050811b8; backdrop-filter:blur(8px); }
  .experience-themed .tlp-role { padding-right:36px; }
  .experience-themed .tlp-close { min-width:32px; min-height:32px; }
  .experience-themed .stage { border:1px solid var(--line); border-radius:10px; clip-path:none; }
  .experience-themed .tabs { justify-content:flex-start; gap:8px; }
  .experience-themed :is(.tab,.pp,.ft-toggle) { border:1px solid var(--line); border-radius:7px; clip-path:none; min-height:40px; }
  .experience-themed .tab.on { background:var(--accent); border-color:var(--accent); color:var(--bg); }
  .experience-themed .caption { padding-bottom:48px; }
  .experience-themed[data-view=arcade] :is(.tlp-scroll,.tlp-dialog,.stage) { border-radius:4px; border-top:3px solid var(--accent); }
  .experience-themed[data-view=arcade] :is(.tlp-bar-name,.page-h1,.jd-role,.tlp-role) { font-family:var(--mono); }
  .experience-themed[data-view=arcade] .page-h1 { font-size:28px; }
  .experience-themed[data-view=arcade] .tab.on { box-shadow:3px 3px 0 #080911; }
}
@media screen and (max-width:700px) {
  .experience-themed .wrap { padding:0 16px; }
  .experience-themed .tlp { height:56vh; min-height:430px; }
  .experience-themed .page-h1 { font-size:26px; }
}
`;
