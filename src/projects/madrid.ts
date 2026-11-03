const repo = 'https://github.com/alejandrofrank/madrid-delivery-sim';
const doc = (path: string) => repo + '/blob/main/' + path;

export function madridDemo(): string {
  return '<section class="madrid-demo" id="demo" aria-labelledby="demo-title">'
    + '<h2 id="demo-title">The example: a delivery simulation in Madrid</h2><p>Nine agent roles put these building blocks to work: checking stock, picking orders, coordinating couriers and handling problems. Watch the recorded city and store journeys. No cloud services run when you press play.</p>'
    + '<figure><video controls playsinline preload="none" poster="/projects/madrid/city-poster.jpg" aria-label="Recorded Madrid delivery map and order flow" aria-describedby="city-description"><source src="/projects/madrid/city-demo.mp4" type="video/mp4">Your browser cannot play this video. <a href="/projects/madrid/city-demo.mp4">Download the city recording</a>.</video>'
    + '<figcaption id="city-description">City recording · Couriers move across Madrid while the page explains stock checks, picking and delivery. Synthetic data; recorded playback, not a live fleet.</figcaption></figure>'
    + '<details class="store-recording"><summary>Watch the shelf-to-doorstep recording</summary><figure><video controls playsinline preload="none" poster="/projects/madrid/store-poster.jpg" aria-label="Recorded 3D store picking and courier handoff" aria-describedby="store-description"><source src="/projects/madrid/store-demo.mp4" type="video/mp4">Your browser cannot play this video. <a href="/projects/madrid/store-demo.mp4">Download the store recording</a>.</video>'
    + '<figcaption id="store-description">Store recording · A reserved basket is picked from shelves, packed and moved to the loading dock for courier pickup. A picker failure tests physical handover and recovery.</figcaption></figure></details>'
    + '<p class="madrid-credit">Map data © OpenStreetMap contributors; OpenFreeMap / OpenMapTiles. Store assets: NVIDIA SimReady, converted by codepawl, simplified for the browser, CC BY 4.0. <a href="' + doc('THIRD-PARTY-NOTICES.md') + '">Asset credits and licenses</a>.</p></section>';
}

export function madridGuide(): string {
  const parts = [
    ['Role and personality', 'A mission defines the job; persona instructions shape how the agent communicates. A restaurant and a customer-service agent have different responsibilities and voices.'],
    ['Tools and permissions', 'Each role gets the actions it needs. Inventory reserves stock, the dispatcher assigns couriers, and customer service handles refunds within policy. Permission checks sit outside the model.'],
    ['Memory and context', 'Choose what the agent remembers, for how long, and within which order or role. Selectable memory profiles include structured records and semantic recall, with scope and expiry checks.'],
    ['Models and spending limits', 'Choose when to use a model, which model tier to route to, and how much it may spend. Routine policies can run without a model call.'],
    ['Communication and tests', 'A2A messages connect the agents; MCP exposes approved read-only facts. Traces and evaluations show whether individual decisions and the team’s recovery obey the rules.'],
  ];
  const layers = [
    ['Google ADK + Vertex AI', 'Scoped tools turn decisions into proposed effects. Native restaurant turns and a private recovery judge were exercised on Vertex AI; default runs use offline fixtures.', 'docs/ADK-RESTAURANT.md'],
    ['Cloud Run + Artifact Registry', 'A digest-pinned replay image was deployed, checked over HTTP and in a browser, and removed. Terraform owns the start/verify/stop lifecycle.', 'docs/production/DEPLOYMENT.md'],
    ['IAM + Workload Identity Federation', 'Separate service accounts per role, audience-bound ID tokens between cloud services, and short-lived GitHub identity instead of JSON keys.', 'docs/production/TRUST-MODEL.md'],
    ['Cloud SQL + Vertex AI Vector Search', 'SQL owns scope, expiry and audit. Local pgvector recall is tested. The optional private cloud tier still needs safe controller provisioning and live qualification.', 'docs/production/SEMANTIC-MEMORY.md'],
    ['Cloud Trace + BigQuery + Cloud Monitoring', 'Traces explain decisions; SQL views define cost per order, recovery time and token spend. Dashboard and SLO setup are documented; the private production analytics path remains unqualified.', 'docs/production/DASHBOARDS.md'],
  ];
  return '<section id="agent-parts" aria-labelledby="agent-parts-title"><h2 id="agent-parts-title">What goes into each agent</h2><p>I combine these parts around the job an agent needs to do. The Madrid simulation makes the differences visible within one working project.</p>'
    + '<dl class="madrid-layers">' + parts.map(([name, detail]) => '<div><dt>' + name + '</dt><dd>' + detail + '</dd></div>').join('') + '</dl><a href="' + doc('docs/AGENT-ANATOMY.md') + '">Inspect the agent anatomy and configuration</a></section>'
    + '<section id="gcp" aria-labelledby="gcp-title"><h2 id="gcp-title">Built for Google Cloud</h2><p>Google ADK provides the agent framework, with Vertex AI for optional model calls and Cloud Run for deployment. The portfolio itself only serves this page and its recordings.</p>'
    + '<ol class="madrid-cloud-flow" aria-label="Google Cloud release flow"><li>Verified GitHub revision</li><li>Workload Identity Federation</li><li>Artifact Registry</li><li>Cloud Run</li></ol>'
    + '<dl class="madrid-layers">' + layers.map(([name, detail, path]) => '<div><dt>' + name + '</dt><dd>' + detail + ' <a href="' + doc(path) + '">Inspect the implementation</a>.</dd></div>').join('') + '</dl></section>'
    + '<section><h2>Different jobs in the Madrid example</h2><p>The household requests a meal. A restaurant checks recipes and sources ingredients from the market. Inventory reserves store stock, fulfillment picks and packs it, and the dispatcher assigns a courier. Customer service handles problems; the recovery judge reviews failed delivery attempts.</p><p>These roles use different combinations of tools, context and decision rules. A2A carries their requests, while durable queues and SQL tools enforce the effects. The same approach to designing roles can be applied to a different project by changing its tools, data and policies.</p></section>'
    + '<section><h2>Evidence, with its limits</h2><ul><li><a href="' + repo + '/actions/workflows/ci.yml">Continuous verification</a> covers Python, browser, movement, infrastructure and evaluation checks.</li>'
    + '<li><a href="' + doc('docs/evidence/heldout-release.json') + '">72 held-out cases, five attempts each</a>: 360/360 passed. These scripted ADK checks measure contracts and policy, not live-model intelligence.</li>'
    + '<li><a href="' + doc('docs/GCP-VERIFICATION.md') + '">The Vertex judge failed before it passed</a>: initial 4/6 toy cases, then 6/6 after policy preflight. The final result includes one model decision and five deterministic denials.</li>'
    + '<li><a href="' + doc('docs/evidence/production-verification.json') + '">Cloud Run deployment and teardown</a> have a dated receipt. Optional private services are not presented as a running production fleet.</li></ul></section>'
    + '<section><h2>Run it in your own environment</h2><p>Use Bash, Git, GNU Make and Docker Compose v2. The default demo needs no API key or Google Cloud account.</p><pre class="run-block"><code>git clone https://github.com/alejandrofrank/madrid-delivery-sim.git\ncd madrid-delivery-sim\nmake setup</code></pre><p>Open <code>http://localhost:8010</code>. Stop the stack with <code>make down</code>.</p><p>For a GCP deployment, supply your own project, identities and billing. Paid inference is opt-in. The <a href="' + doc('docs/production/DEPLOYMENT.md') + '">runbook</a> explains verification, teardown and the unfinished private-tier requirements.</p><p>MIT-licensed code, with separate terms for third-party assets. A portfolio project you can study and run; no hosted-service or support SLA.</p></section>';
}

export const madridStyles = `
.madrid-demo { padding:30px 0; border-bottom:1px solid var(--line); }
.madrid-demo h2 { font-size:23px; margin-bottom:12px; }
.madrid-demo>p { max-width:70ch; color:var(--muted); }
.madrid-demo figure { margin:22px 0 0; }
.madrid-demo video { display:block; width:100%; max-height:65vh; background:var(--surface); border:1px solid var(--line); border-radius:8px; }
.madrid-demo figcaption { max-width:75ch; font-size:14px; color:var(--muted); margin-top:12px; }
.store-recording { margin-top:24px; }
.store-recording>summary { cursor:pointer; min-height:44px; padding:10px 0; }
.madrid-demo .madrid-credit { font-size:12px; margin-top:20px; }
.madrid-layers { margin:24px 0; }
.madrid-layers>div { border-top:1px solid var(--line); padding:18px 0; }
.madrid-layers dt { font-weight:600; margin-bottom:6px; }
.madrid-layers dd { margin:0; color:var(--muted); }
.madrid-cloud-flow { padding:0; margin:22px 0; list-style:none; display:flex; flex-wrap:wrap; gap:10px; }
.madrid-cloud-flow li { border:1px solid var(--line); border-radius:6px; padding:8px 12px; font-size:14px; }
.madrid-cloud-flow li+li { margin-top:0; }
@media print { .madrid-demo video { max-height:220px; }.store-recording { display:none; } }
`;
