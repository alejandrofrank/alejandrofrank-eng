import { personalStyles } from "../personal-styles";
import { gradientMarkup } from "../gradient";
// ----------------------------------------------------------------------------
// /resume page — job-selector tabs + a job header + the SVG scene player.
// Reuses the site's theme tokens (styles) and card language for consistency.
// ----------------------------------------------------------------------------

import { styles } from "../styles";
import { FAVICON } from "../favicon";
import { FONTS_LINK, sectionLabel, media } from "../ui";
import { SITE, LINKS } from "../content";
import { PRINT_STYLES, PRINT_SCRIPT } from "../print";
import { SCENES } from "./data/scenes.generated";
import { SCENE_STYLES, SCENE_ENGINE_SCRIPT, playButton } from "../scene-engine";
import { PLAYER_STYLES, PLAYER_SCRIPT } from "./player";
import { renderFullText, FULLTEXT_STYLES, FULLTEXT_SCRIPT } from "./fulltext";

export function renderResumePage(): string {
  // Guard against a data payload accidentally closing the <script>.
  const data = JSON.stringify(SCENES).replace(/</g, "\\u003c");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="theme-color" content="#fff4ed" />
${FAVICON}
${FONTS_LINK}
<title>${SITE.name} · experience</title>
<meta name="description" content="Each role as a keynote of what I actually built." />
<style>${styles}${SCENE_STYLES}${FULLTEXT_STYLES}${PLAYER_STYLES}${personalStyles}${PRINT_STYLES}</style>
</head>
<body class="personal experience-page">
  ${gradientMarkup}
  <div class="wrap resumewrap">
    <div class="resume">
      <nav class="subnav"><a href="/">← home</a><a href="/timeline">timeline view →</a></nav>
      <div class="print-head">
        <b>${SITE.name}</b>
        ${[`<span>${SITE.location}</span>`]
          .concat(
            LINKS.filter((l) => !l.href.startsWith("/")).map(
              (l) => `<span>${l.href.replace(/^mailto:/, "").replace(/^https?:\/\//, "")}</span>`
            )
          )
          .join("\n        ")}
      </div>
      ${sectionLabel("Experience", `${SCENES.length} roles`)}
      <h1 class="page-h1">Experience</h1>
      <p class="page-lede">Each role, as a keynote of the systems I actually built.</p>

      <div class="timeline">
        <button class="tl-arrow" id="tlPrev" aria-label="previous role"><svg class="tl-ico" viewBox="0 0 24 24" aria-hidden="true"><polygon points="3,12 19,3 13,12 19,21"/></svg></button>
        <span class="tl-year" id="tlStart"></span>
        <div class="tl-track" id="tlTrack"></div>
        <span class="tl-year" id="tlEnd"></span>
        <button class="tl-arrow" id="tlNext" aria-label="next role"><svg class="tl-ico" viewBox="0 0 24 24" aria-hidden="true"><polygon points="21,12 5,3 11,12 5,21"/></svg></button>
      </div>

      <div class="tabs" id="jobTabs"></div>

      <div class="job-line">
        <span class="jd-role" id="jobRole"></span>
        <span class="jd-meta" id="jobMeta"></span>
      </div>
      ${renderFullText(SCENES)}

      <div class="stage on-cream chamfer">
        ${media(
          `<div class="scene-scroll"><svg id="scene" class="scene-svg" viewBox="0 0 1180 560" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Systems diagram"></svg></div>`
        )}
      </div>

      <div class="player-controls">
        ${playButton("playBtn")}
        <div class="beat-dots" id="beatDots"></div>
      </div>

      <div class="caption" aria-live="polite">
        <div class="caption-title" id="capTitle"></div>
        <div class="caption-text" id="capText"></div>
      </div>
    </div>
  </div>
  <script>window.__SCENES__ = ${data};</script>
  ${SCENE_ENGINE_SCRIPT}
  ${FULLTEXT_SCRIPT}
  ${PRINT_SCRIPT}
  ${PLAYER_SCRIPT}
</body>
</html>`;
}
