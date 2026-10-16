// Independent reading surface; existing timeline styling stays in its own module.
export const readingStyles = `
:root {
  color-scheme:dark;
  --bg:#10151c; --surface:#171f29; --line:#354352;
  --fg:#e6edf3; --muted:#b4c1d0; --accent:#8cbcff;
  --mono:'JetBrains Mono',monospace; --sans:'Inter Tight',system-ui,sans-serif;
}
* { box-sizing:border-box; }
html { scroll-padding-top:24px; }
body { margin:0; background:var(--bg); color:var(--fg); font:16px/1.65 var(--sans); -webkit-font-smoothing:antialiased; }
a { color:inherit; text-underline-offset:4px; }
a:hover { text-decoration-thickness:2px; }
button,input { font:inherit; }
:is(a,button,summary,input):focus-visible { outline:2px solid var(--accent); outline-offset:5px; }
h1,h2,h3,p { margin:0; }
h1,h2,h3 { line-height:1.25; letter-spacing:-.025em; }
h1 { font-size:30px; } h2 { font-size:23px; } h3 { font-size:18px; }
p+p { margin-top:14px; }
[hidden] { display:none!important; }
.site-wrap { max-width:1160px; margin:auto; padding:0 36px; }
.site-nav { display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:16px; padding:22px 0; border-bottom:1px solid var(--line); }
.site-name { font:500 14px var(--mono); text-decoration:none; }
.nav-links { display:flex; flex-wrap:wrap; gap:8px 24px; font-size:14px; margin-left:auto; }
.nav-links a { padding:8px 0; text-decoration:none; }
.nav-links a:hover,.nav-links [aria-current=page] { text-decoration:underline; }
.skip-link { position:absolute; top:-80px; left:20px; background:var(--fg); color:var(--bg); padding:10px; z-index:10; }
.skip-link:focus { top:8px; }
.intro { padding:38px 0 32px; max-width:730px; }
.intro p { color:var(--muted); margin-top:14px; max-width:63ch; }
.eyebrow { font:11px/1.6 var(--mono); letter-spacing:.06em; text-transform:uppercase; color:var(--muted); }
.intro .eyebrow { margin:0 0 12px; }
.section-top { display:flex; align-items:baseline; justify-content:space-between; gap:24px; margin-bottom:24px; }
.section-top p { font-size:14px; color:var(--muted); }
.work-layout { display:grid; grid-template-columns:180px minmax(0,1fr); gap:44px; }
.reading-guide { align-self:start; position:sticky; top:24px; }
.reading-guide h2 { font-size:13px; letter-spacing:0; margin-bottom:14px; }
.reading-guide ol { padding:0; margin:0; list-style:none; }
.reading-guide a { display:block; padding:7px 0; color:var(--muted); text-decoration:none; font-size:13px; }
.reading-guide a:hover { color:var(--fg); text-decoration:underline; }
.reading-guide span { font:11px var(--mono); margin-right:10px; color:var(--accent); }
.reading-guide p { color:var(--muted); font-size:12px; margin-top:20px; max-width:24ch; }
.project-index { list-style:none; margin:0; padding:0; }
.project-entry { padding:26px 0 30px; border-top:1px solid var(--line); scroll-margin-top:24px; }
.project-entry:first-child { padding-top:0; border-top:0; }
.entry-meta { display:flex; flex-wrap:wrap; align-items:center; gap:12px; margin-bottom:12px; }
.entry-meta .number { font:12px var(--mono); color:var(--muted); }
.state { display:inline-flex; align-items:center; gap:7px; font:11px/1.5 var(--mono); color:var(--muted); }
.state::before { content:''; width:6px; height:6px; border-radius:50%; background:currentColor; }
.state.live { color:#b6ddb5; } .state.building { color:var(--accent); }
.project-entry h3 { font-size:24px; margin-bottom:10px; }
.project-entry h3 a { text-decoration:none; }
.project-entry h3 a:hover { text-decoration:underline; }
.project-entry p { max-width:66ch; color:var(--muted); }
.entry-question { color:var(--fg)!important; font-size:17px; margin-bottom:8px; }
.entry-bottom { display:flex; align-items:baseline; justify-content:space-between; gap:20px; margin-top:18px; }
.stack { font:11px/1.7 var(--mono); color:var(--muted); }
.read-link { font-size:14px; white-space:nowrap; }
.site-footer { border-top:1px solid var(--line); margin-top:50px; padding:28px 0 40px; color:var(--muted); font-size:14px; }
.footer-links { display:flex; gap:20px; flex-wrap:wrap; margin-top:14px; }
.about-strip { border-top:1px solid var(--line); margin-top:22px; padding-top:28px; display:grid; grid-template-columns:180px 1fr; gap:44px; }
.about-strip h2 { font-size:18px; }
.about-strip p { max-width:66ch; color:var(--muted); }
.about-strip a { display:inline-block; margin-top:12px; font-size:14px; }
.about-strip .ambient-calendar { display:block; color:var(--muted); text-decoration:none; margin:32px 0 0; max-width:720px; --hm0:#202c3b; --hm1:#334f73; --hm2:#4c75a8; --hm3:#86b0e5; --hm4:#bad5ff; }
.calendar-caption { display:flex; justify-content:space-between; gap:16px; font:10px/1.6 var(--mono); margin-bottom:10px; }
.hm { display:flex; gap:3px; }
.hm-col { display:flex; flex-direction:column; gap:3px; flex:1; min-width:0; }
.hm-d { width:100%; aspect-ratio:1; border-radius:2px; }
.calendar-unavailable { font-size:12px; }
.breadcrumb { font-size:13px; margin-top:28px; color:var(--muted); }
.case-head { padding:26px 0 30px; border-bottom:1px solid var(--line); }
.case-head h1 { margin:12px 0; }
.case-head .question { font-size:21px; margin:0 0 12px; }
.case-head .summary { max-width:68ch; color:var(--muted); }
.actions { display:flex; gap:10px; flex-wrap:wrap; margin-top:22px; }
.action { display:inline-flex; align-items:center; justify-content:center; min-height:44px; padding:9px 16px; border:1px solid var(--line); border-radius:6px; text-decoration:none; font-size:14px; font-weight:500; }
.action:hover { background:var(--surface); }
.action.primary { background:var(--fg); color:var(--bg); border-color:var(--fg); }
.action.primary:hover { text-decoration:underline; }
.case-grid { display:grid; grid-template-columns:minmax(0,1fr) 270px; gap:54px; margin-top:30px; }
.case-copy { max-width:72ch; min-width:0; }
.case-copy section { margin-bottom:30px; }
.case-copy h2 { font-size:19px; margin-bottom:12px; }
.case-copy p,.case-copy li { color:var(--muted); }
.case-copy ul { padding-left:20px; margin:0; }
.case-copy li+li { margin-top:12px; }
.case-aside { align-self:start; border:1px solid var(--line); padding:22px; background:var(--surface); border-radius:8px; }
.case-aside h2 { font-size:14px; margin-bottom:12px; }
.case-aside p { font-size:13px; color:var(--muted); }
.flow { list-style:none; margin:0 0 24px; padding:0; }
.flow li { font-size:14px; padding:8px 0; }
.flow li+li::before { content:'↓'; display:block; color:var(--accent); font:14px var(--mono); margin-bottom:8px; }
.case-note { border-left:2px solid var(--accent); padding-left:16px; }
.run-block { overflow-x:auto; background:var(--surface); border:1px solid var(--line); padding:18px; font:12px/1.9 var(--mono); border-radius:6px; }
.run-note { font-size:13px; overflow-wrap:anywhere; }
.next-project { margin-top:40px; padding-top:24px; border-top:1px solid var(--line); display:flex; justify-content:space-between; gap:24px; flex-wrap:wrap; }
.next-project span { display:block; color:var(--muted); font-size:12px; margin-bottom:5px; }
.technical-details { border:1px solid var(--line); padding:16px 20px; border-radius:6px; }
.technical-details>summary { cursor:pointer; display:flex; justify-content:space-between; font-weight:600; list-style:none; }
.technical-details>summary::-webkit-details-marker { display:none; }
.technical-details[open] .technical-toggle { transform:rotate(45deg); }
.technical-body { padding-top:18px; }
.technical-intro { font-size:14px; }
.pipeline-stages { list-style:none!important; padding:0!important; margin-top:18px!important; }
.pipeline-stages>li { display:grid; grid-template-columns:24px 1fr; gap:12px; padding-top:12px; border-top:1px solid var(--line); }
.pipeline-number { font:11px/2 var(--mono); color:var(--accent); }
.pipeline-stage summary { cursor:pointer; display:flex; justify-content:space-between; gap:14px; }
.pipeline-stage strong { color:var(--fg); font-size:15px; }
.pipeline-tools { display:block; font:11px/1.7 var(--mono); margin:5px 0 12px; }
.pipeline-stage p { font-size:14px; padding-bottom:12px; }
.pipeline-stage[open] .pipeline-toggle { transform:rotate(45deg); }
@media(max-width:780px) {
  .site-wrap { padding:0 22px; }
  .site-nav { flex-wrap:wrap; }
  .work-layout { grid-template-columns:1fr; gap:22px; }
  .reading-guide { position:static; border-bottom:1px solid var(--line); padding-bottom:18px; }
  .reading-guide ol { display:flex; flex-wrap:wrap; gap:0 20px; }
  .reading-guide p { max-width:none; margin-top:10px; }
  .reading-guide h2 { margin-bottom:8px; }
  .about-strip { grid-template-columns:1fr; gap:12px; }
  .case-grid { grid-template-columns:1fr; gap:24px; }
  .case-aside { grid-row:1; }
  .flow { display:flex; flex-wrap:wrap; gap:12px; margin-bottom:16px; }
  .flow li { padding:0; }
  .flow li+li::before { display:inline; content:'→'; margin-right:12px; }
  .case-head h1 { font-size:28px; }
  .intro { padding-top:28px; }
}
@media(max-width:480px) {
  .site-wrap { padding:0 18px; }
  .site-nav { align-items:flex-start; flex-direction:column; gap:6px; padding:16px 0; }
  .nav-links { gap:18px; margin-left:0; }
  .intro h1 { font-size:26px; }
  .section-top { align-items:flex-start; flex-direction:column; gap:8px; margin-bottom:18px; }
  .entry-bottom { align-items:flex-start; flex-direction:column; gap:12px; }
  .project-entry h3 { font-size:22px; }
  .actions { align-items:stretch; flex-direction:column; }
  .calendar-caption { flex-direction:column; gap:2px; }
  .hm,.hm-col { gap:2px; }
}
@media print {
  :root { color-scheme:light; --bg:white; --surface:#f5f5f5; --fg:#111; --muted:#333; --line:#bbb; --accent:#444; }
  .site-nav,.reading-guide,.ambient-calendar,.next-project,.skip-link { display:none; }
  .site-wrap { max-width:none; padding:0; }
  .work-layout,.case-grid { display:block; }
  .project-entry,section,.case-aside { break-inside:avoid; }
  .intro,.case-head { padding-top:0; }
  .case-aside { margin-bottom:20px; }
}
`;
