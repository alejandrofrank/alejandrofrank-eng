import type { Panel } from './types';
import { card } from '../ui';
import { vestiTechnical } from './technical';

export const jev: Panel = {
  key: 'jev', title: 'Vesti · with Jev & SAM 3.1', span: 2,
  async render(_env, slot) {
    return card({key: 'jev', title: 'Vesti · with Jev &amp; SAM 3.1', n: slot.n, span2: true,
      body: `<div class="project-eyebrow">Building with Jev · Side project</div>
        <p class="v-headline">Find the outfit. Make it yours.</p>
        <p class="project-copy">AI-powered outfit search. Discover a look, find similar pieces, and swap individual items for alternatives that fit together.</p>
        <div class="v-label">How we're building it<span class="leader"></span></div>
        <ul class="vprods">
          <li><div class="vprod-head"><b>01 / Segment</b><span>SAM 3.1</span></div><p class="vprod-blurb">Separate an outfit into individual pieces of clothing.</p></li>
          <li><div class="vprod-head"><b>02 / Compare</b><span>Marqo FashionSigLIP</span></div><p class="vprod-blurb">Compare clothing visually to find similar pieces.</p></li>
          <li><div class="vprod-head"><b>03 / Match</b><span>With Jev</span></div><p class="vprod-blurb">Match the look with available options and suggest alternatives.</p></li>
        </ul>
        ${vestiTechnical()}`,
      foot: `<span class="badge"><span class="dot-live">●</span> In development</span><span class="sep">·</span><span class="badge">Alejandro + Jev</span>`});
  },
};
