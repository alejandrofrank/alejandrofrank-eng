import type { PortfolioView } from '../appearance';
import { personalStyles } from '../personal-styles';
import { gradientMarkup } from '../gradient';

export function readingAppearance(view: PortfolioView) {
  return {
    bodyClass: view === 'original' ? 'personal portfolio-reading' : 'portfolio-reading',
    color: { original: '#192822', tech: '#10151c', arcade: '#11121b' }[view],
    background: view === 'original' ? gradientMarkup : '',
    styles: (view === 'original' ? personalStyles : '') + readingThemeStyles,
  };
}

// A case study or game is content, not an implicit appearance switch.
const readingThemeStyles = `
@media screen {
  body.portfolio-reading[data-view=tech] {
    --bg:#10151c; --surface:#171f29; --line:#354352;
    --fg:#e6edf3; --muted:#b4c1d0; --accent:#8cbcff;
  }
  body.portfolio-reading[data-view=arcade] {
    --bg:#11121b; --surface:#1a1c28; --line:#363749;
    --fg:#f1edde; --muted:#b1afbf; --accent:#c5a2f6;
  }
  body.portfolio-reading[data-view=original] { --surface:#2f4439; }
  .portfolio-reading .site-wrap { position:relative; z-index:1; }
  .portfolio-reading[data-view=arcade] :is(.case-head h1,.intro h1) { font-family:var(--mono); }
}
`;
