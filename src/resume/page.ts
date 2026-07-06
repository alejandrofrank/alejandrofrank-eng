// ----------------------------------------------------------------------------
// /resume page — job-selector tabs + a job header + the SVG scene player.
// Reuses the site's theme tokens (styles) and ambient rain for consistency.
// ----------------------------------------------------------------------------

import { styles } from "../styles";
import { FAVICON } from "../favicon";
import { RAIN_CANVAS, RAIN_SCRIPT } from "../anim";
import { SITE } from "../content";
import { SCENES } from "./data/scenes.generated";
import { SCENE_STYLES, SCENE_ENGINE_SCRIPT } from "../scene-engine";
import { PLAYER_STYLES, PLAYER_SCRIPT } from "./player";

export function renderResumePage(): string {
  // Guard against a data payload accidentally closing the <script>.
  const data = JSON.stringify(SCENES).replace(/</g, "\\u003c");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="theme-color" content="#0a0a0b" />
${FAVICON}
<title>${SITE.name} · experience</title>
<meta name="description" content="Each role as a keynote of what I actually built." />
<style>${styles}${SCENE_STYLES}${PLAYER_STYLES}</style>
</head>
<body>
  ${RAIN_CANVAS}
  <div class="wrap resumewrap">
    <div class="resume">
      <nav class="resume-nav"><a href="/">‹ dashboard</a> &nbsp;·&nbsp; <a href="/timeline">timeline view →</a></nav>
      <h1 class="resume-h1">Experience</h1>
      <p class="resume-lede">Each role, as a keynote of the systems I actually built.</p>

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
      <details class="job-details">
        <summary class="jd-toggle"><span class="jd-caret">▸</span> Explanation</summary>
        <p class="job-summary" id="jobSummary"></p>
      </details>

      <div class="stage scene-scroll">
        <svg id="scene" class="scene-svg" viewBox="0 0 1180 560" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Systems diagram"></svg>
      </div>

      <div class="player-controls">
        <div class="beat-dots" id="beatDots"></div>
      </div>

      <div class="caption">
        <div class="caption-title" id="capTitle"></div>
        <div class="caption-text" id="capText"></div>
      </div>
    </div>
  </div>
  <script>window.__SCENES__ = ${data};</script>
  ${RAIN_SCRIPT}
  ${SCENE_ENGINE_SCRIPT}
  ${PLAYER_SCRIPT}
</body>
</html>`;
}
