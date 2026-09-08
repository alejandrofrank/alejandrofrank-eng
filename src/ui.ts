// ----------------------------------------------------------------------------
// Shared markup for the design system: the numbered two-block card, the
// section label with its dotted leader, and the bracketed media panel.
// Styles for all of it live in styles.ts.
// ----------------------------------------------------------------------------

export const FONTS_LINK = `<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />`;

/** The small outlined diamond that opens every section label. */
export const DIAMOND = `<svg width="9" height="9" viewBox="0 0 10 10" aria-hidden="true"><path d="M5 .8 9.2 5 5 9.2.8 5Z" fill="none" stroke="currentColor" stroke-width="1"/></svg>`;

/** Four tiny dots in a card footer — a grip, purely ornamental. */
export const GRIP = `<span class="grip" aria-hidden="true"><i></i><i></i><i></i><i></i></span>`;

/** Corner crop brackets for a media panel. */
export const BRACKETS = `<span class="bracket tl"></span><span class="bracket tr"></span><span class="bracket bl"></span><span class="bracket br"></span>`;

/** Three-digit card index: 7 -> "007". */
export function idx(n: number): string {
  return String(n).padStart(3, "0");
}

/** Section label: diamond · text · dotted leader · optional right-hand note. */
export function sectionLabel(text: string, right = ""): string {
  return `<div class="sec-label">${DIAMOND}<span>${text}</span><span class="leader"></span>${
    right ? `<span>${right}</span>` : ""
  }</div>`;
}

/** Dotted panel with crop brackets. `square` makes it 1:1 with the inner absolutely filled. */
export function media(inner: string, square = false): string {
  return `<div class="media${square ? " square" : ""}"><div class="dotgrid"></div>${BRACKETS}<div class="media-inner">${inner}</div></div>`;
}

export interface CardOpts {
  key: string;
  title: string;
  /** Position in the cascade; also the printed index. */
  n: number;
  tone?: "cream" | "orange";
  span2?: boolean;
  /** Draw the divider node on the seam toward the right-hand neighbour. */
  node?: boolean;
  extraClass?: string;
  /** Skip the title + index row; the body starts at the top of the block. */
  noHead?: boolean;
  body: string;
  /** Left side of the footer block — one line, ellipsised. */
  foot: string;
}

/**
 * The card: a main block (title + index + body) and a footer block, both
 * chamfered, with a 6px seam between them.
 */
export function card(o: CardOpts): string {
  const tone = `on-${o.tone ?? "cream"}`;
  const cls = ["card-shell", "rise", o.span2 ? "span2" : "", o.node ? "has-node" : "", o.extraClass ?? ""]
    .filter(Boolean)
    .join(" ");
  return `<article class="${cls}" id="${o.key}" style="--i:${o.n}">
      <div class="card">
        <div class="block main chamfer ${tone}">
          ${o.noHead ? "" : `<div class="card-head"><h3>${o.title}</h3><span class="card-idx">${idx(o.n)}</span></div>`}
          ${o.body}
        </div>
        <div class="block foot chamfer ${tone}">
          <div class="foot-l">${o.foot}</div>
          ${GRIP}
        </div>
      </div>
    </article>`;
}
