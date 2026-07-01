// ----------------------------------------------------------------------------
// /resume page — job-selector tabs + a job header + the SVG scene player.
// Reuses the site's theme tokens (styles) and ambient rain for consistency.
// ----------------------------------------------------------------------------

import { styles } from "../styles";
import { FAVICON } from "../favicon";
import { RAIN_CANVAS, RAIN_SCRIPT } from "../anim";
import { SITE } from "../content";
import { SCENES } from "./data/scenes.generated";
import { PLAYER_STYLES, PLAYER_SCRIPT } from "./player";

export function renderResumePage(): string {
  // Guard against a data payload accidentally closing the <script>.
  const data = JSON.stringify(SCENES).replace(/</g, "\\u003c");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
${FAVICON}
<title>${SITE.name} · experience</title>
<meta name="description" content="Each role as a keynote of what I actually built." />
<style>${styles}${PLAYER_STYLES}</style>
</head>
<body>
  ${RAIN_CANVAS}
  <div class="wrap">
    <div class="resume">
      <nav class="resume-nav"><a href="/">‹ dashboard</a></nav>
      <h1 class="resume-h1">Experience</h1>
      <p class="resume-lede">Each role, as a keynote of the systems I actually built.</p>

      <div class="tabs" id="jobTabs"></div>

      <div class="job-header">
        <h2 id="jobRole"></h2>
        <div class="job-meta" id="jobMeta"></div>
        <p class="job-summary" id="jobSummary"></p>
      </div>

      <div class="stage">
        <svg id="scene" viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Systems diagram"></svg>
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
  ${PLAYER_SCRIPT}
</body>
</html>`;
}
