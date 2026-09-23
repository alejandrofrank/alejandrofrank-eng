// Homepage branding is scoped so the experience player keeps its own palette.
export const personalStyles = `
body.personal {
  --ink:#f5f6fa; --cream:#172132; --near:#172132; --orange:#4c60d9;
  --bg:#f5f6fa; --fg:#172132; --muted:#626c80; --dim:#a6afc0;
  --panel:#eef0f8; --line:#dde2ed; --accent:#4c60d9;
  --hm0:#e8ebf4; --hm1:#c9d1fa; --hm2:#9cacf1; --hm3:#7284e8; --hm4:#485dc6;
  color-scheme:light; background:#f5f6fa; color:var(--fg);
}
.personal .wrap { max-width:1160px; padding:0 36px; }
.personal .topnav { padding:28px 0; border-bottom:1px solid var(--line); }
.personal .topnav-brand { font-size:18px; letter-spacing:-.04em; }
.personal .topnav-links { gap:24px; }
.personal .topnav-links > a:not(.btn), .personal .email-pop > summary { font:500 12px var(--sans); text-transform:none; letter-spacing:0; }
.personal .chamfer { clip-path:none; border-radius:10px; }
.personal .btn { text-transform:none; letter-spacing:0; font:500 12px var(--sans); padding:12px 18px; }
.personal .btn.primary { background:#253044; color:white; }
.personal .btn.primary:hover { background:#4c60d9; }
.personal .btn.secondary { color:#35415a; background:#e9edf5; }
.personal .hero { position:relative; isolation:isolate; min-height:530px; display:flex; align-items:center; padding:75px 0 85px; }
.personal .hero-copy { width:60%; position:relative; z-index:1; }
.personal .hero-eyebrow { color:#64728a; font-size:10px; letter-spacing:.12em; }
.personal .hero h1 { font-size:clamp(46px,5.7vw,76px); max-width:680px; line-height:1.02; color:#172132; margin:24px 0; letter-spacing:-.055em; text-wrap:initial; }
.personal .hero h1 em { font-style:normal; color:#5469d7; }
.personal .hero .sub { color:#5c687d; font-size:17px; max-width:40ch; }
.hero-actions { display:flex; gap:22px; align-items:center; margin-top:28px; }
.hero-actions a { color:#344674; font-size:13px; font-weight:500; text-decoration:none; }
.hero-actions a:first-child { background:#253044; color:white; padding:13px 19px; border-radius:7px; }
.wave-field { position:absolute; z-index:0; pointer-events:none; width:68%; height:100%; right:-65px; top:0; overflow:hidden; mask-image:linear-gradient(90deg,transparent,#000 26%,#000 88%,transparent); background:radial-gradient(ellipse at 60% 55%,#dfe2ff88,transparent 67%); }
.wave-field canvas,.wave-fallback { width:100%; height:100%; position:absolute; inset:0; }
.wave-ready .wave-fallback { display:none; }
.personal .outcomes { gap:0; margin:0 0 64px; border-top:1px solid var(--line); border-bottom:1px solid var(--line); }
.personal .outcome { background:transparent; padding:24px 22px; border-radius:0; min-height:105px; }
.personal .outcome + .outcome { border-left:1px solid var(--line); }
.personal .outcome-idx { display:none; }
.personal .outcome b { font-size:27px; }
.personal .outcome .lab { font-size:9px; letter-spacing:.05em; }
.personal .sec-label { margin-bottom:22px; letter-spacing:.12em; }
.personal .sec-label svg,.personal .grip,.personal .card-idx,.personal .bracket,.personal .dotgrid { display:none; }
.personal .leader { height:1px; background:var(--line); }
.personal .grid { gap:20px; }
.personal .on-cream,.personal .on-orange { --bg:#f2eadc; --panel:#e9e1d5; --line:#e1e6ef; --fg:#172132; --muted:#606d81; --dim:#b1b9c9; --accent:#4c60d9; background:var(--bg); color:var(--fg); }
.personal .card { gap:0; border:1px solid #e0e5ef; border-radius:12px; overflow:hidden; background:#f2eadc; }
.personal .block { border-radius:0; }
.personal .block.main { padding:27px; }
.personal .block.foot { border-top:1px solid #edf0f6; height:auto; min-height:46px; padding:14px 27px; }
.personal .foot-l { white-space:normal; overflow:visible; line-height:1.7; }
.personal .card-head { margin-bottom:23px; }
.personal .card-head h3 { font-size:21px; }
.personal .card-shell.has-node::after { display:none; }
.personal .card-shell:active .card,.personal .card-shell:hover .card { transform:none; }
.personal #bakiano .block.main { background:radial-gradient(ellipse at 100% 0,#e4e8ff,transparent 60%),#fff; }
.personal #bakiano .card-head h3 { font-size:28px; }
.personal .v-headline { font-size:34px; max-width:none; }
.personal .v-blurb { max-width:75ch; font-size:14px; }
.personal .vset { border:1px solid #e0e5f1; background:#f6f8fd; }
.personal .vset-flag.live { background:#e0e7fd; color:#3e55b9; }
.personal .v-stats { gap:45px; margin-top:26px; }
.personal .vprods { gap:24px; }
.personal .media { border-radius:6px; }
.personal #jev .block.main { background:linear-gradient(115deg,#edf0ff,#fafaff 70%); padding:32px; }
.project-eyebrow { font:500 10px var(--mono); letter-spacing:.1em; text-transform:uppercase; color:#5364aa; }
.project-copy { font-size:18px; color:#54617b; max-width:55ch; margin:10px 0 0; }
.personal footer.site { color:#647086; font-size:9px; }
.personal footer.site a { color:#344674; }
.personal a:focus-visible,.personal button:focus-visible,.personal summary:focus-visible { outline:2px solid #526bda; outline-offset:4px; }
@media(max-width:760px) {
 .personal .wrap { padding:0 22px; }
 .personal .topnav { gap:18px; }
 .personal .topnav-links { gap:16px; }
 .personal .hero { min-height:640px; align-items:flex-start; padding:48px 0 250px; }
 .personal .hero-copy { width:100%; }
 .personal .hero h1 { font-size:clamp(43px,8.5vw,62px); max-width:600px; }
 .wave-field { top:auto; bottom:-12px; right:-22px; width:calc(100% + 44px); height:290px; mask-image:linear-gradient(180deg,transparent,#000 20%,#000 90%,transparent); }
 .personal .outcomes { margin-bottom:40px; }
 .personal .outcome { padding:19px 12px; }
 .personal .block.main { padding:22px; }
 .personal .v-headline { font-size:28px; }
}
@media(max-width:640px) {
 .personal .outcome:nth-child(3) { border-left:0; }
 .personal .outcome:nth-child(n+3) { border-top:1px solid var(--line); }
 .personal .sec-label > span:last-child:not(.leader) { display:none; }
 .personal .topnav-links { gap:12px; width:100%; justify-content:space-between; }
 .personal .btn { padding:10px 12px; }
}

/* Human: a quiet foreground over a saturated moving landscape. */
body.personal { background:#192822; color:#201c32; --fg:#201c32; }
.personal .wrap { position:relative; z-index:1; max-width:1100px; min-height:100svh; display:flex; flex-direction:column; }
.color-world { position:fixed; inset:0; overflow:hidden; pointer-events:none; z-index:0; background:linear-gradient(145deg,#142b24 0%,#263027 42%,#37291f 100%); }
.color-motion { position:absolute; inset:0; }
.color-motion.is-rippling { filter:url(#cursor-waves); }
.color-band {
 position:absolute; width:140%; height:140%; left:-20%; top:-20%;
 filter:blur(38px); animation:field-turn 46s ease-in-out infinite alternate;
}
.color-band i { display:block; position:absolute; inset:0; border-radius:0; will-change:transform; }
.color-band i:nth-child(1) {
 background:radial-gradient(ellipse at 28% 65%,#e98142 0%,#c76632 15%,#a6432380 30%,transparent 52%);
 animation:ember-roam 23s ease-in-out infinite alternate;
}
.color-band i:nth-child(2) {
 background:radial-gradient(ellipse at 73% 46%,#168c93 0%,#398c80 17%,#276b6170 31%,transparent 53%);
 animation:teal-roam 29s ease-in-out -8s infinite alternate;
}
.color-band i:nth-child(3) {
 background:radial-gradient(ellipse at 52% 62%,#d8b68dd9 0%,#b4bca099 15%,#b4bca030 29%,transparent 45%);
 animation:cream-roam 31s ease-in-out -4s infinite alternate;
}
@keyframes field-turn {
 0% { transform:rotate(-8deg) scale(1.04); }
 50% { transform:rotate(12deg) scale(1.12); }
 100% { transform:rotate(-18deg) scale(1.04); }
}
@keyframes ember-roam {
 0% { transform:translate(0,8%) scale(1.05); }
 35% { transform:translate(20%,-26%) scale(1.13,.95); }
 70% { transform:translate(35%,-8%) scale(.98,1.15); }
 100% { transform:translate(5%,-32%) scale(1.08); }
}
@keyframes teal-roam {
 0% { transform:translate(0,18%) scale(1.1); }
 35% { transform:translate(-22%,-12%) scale(1.08,1.2); }
 70% { transform:translate(-35%,15%) scale(1.2,.95); }
 100% { transform:translate(-8%,-24%) scale(1.05); }
}
@keyframes cream-roam {
 0% { transform:translate(8%,10%) scale(.95); }
 40% { transform:translate(-12%,-30%) scale(1.08); }
 75% { transform:translate(18%,-16%) scale(.9,1.2); }
 100% { transform:translate(-16%,12%) scale(1.1); }
}
@media(prefers-reduced-motion:reduce) { .color-band,.color-band i:nth-child(n) { animation:none; } }
.human-hero { padding:clamp(90px,16vh,160px) 0 20px; text-align:center; }
.human-location { margin:0 0 20px; font-size:16px; font-weight:500; letter-spacing:-.015em; }
.human-hero h1 { font-size:clamp(22px,3vw,30px); line-height:1.35; font-weight:400; letter-spacing:-.025em; margin:0 0 30px; color:#211b31; }
.human-hero h1 span { color:#e24938; }
.explore { display:grid; grid-template-columns:repeat(4,max-content); justify-content:center; gap:12px; padding-bottom:70px; }
.reveal { display:contents; }
.reveal::details-content { display:contents; }
.reveal:not([open]) .reveal-body { display:none; }
.color-world::after { content:""; position:absolute; inset:0; background:#10251c26; }
.reveal > summary,.explore-link { grid-row:1; list-style:none; display:flex; gap:27px; justify-content:space-between; align-items:center; padding:15px 22px; background:#f2eadc; color:#282138; border:1px solid #d9c8d3; border-radius:999px; text-decoration:none; cursor:pointer; font:500 14px var(--sans); box-shadow:0 3px 10px #41124208; transition:background .2s,transform .2s; }
.reveal > summary::-webkit-details-marker { display:none; }
.reveal-body { grid-column:1/-1; grid-row:2; width:min(100%,1000px); padding:34px; background:#f2eadc; border:1px solid #e5d9e4; border-radius:22px; margin-top:24px; box-shadow:0 18px 60px #47275619; }
.reveal-body h2 { font-size:32px; line-height:1.1; margin:0 0 20px; }
.about-copy { font-size:20px; max-width:52ch; line-height:1.5; }
.personal .reveal-body .outcomes { margin:26px 0; }
.text-link { color:#5d35a5; }
.contact-links { display:flex; flex-wrap:wrap; align-items:center; gap:24px; }
.contact-links > a { color:#482677; }
.personal .contact-links .btn.primary,.personal .contact-links .btn.secondary { background:#cbd9b7; color:#25382c; font-weight:650; justify-content:center; }
.personal .contact-links .btn:hover { background:#efbe95; color:#34271f; }
.personal .email-copy { background:#251d32; color:#f2eadc; font-weight:700; }
.personal .email-copy:hover,.personal .email-copy:focus-visible { background:#482d63; color:#fff7ed; }
.personal .contact-links .email-box { right:auto; left:0; background:#f2eadc; border:1px solid #ddd; }
.personal footer.site { margin-top:auto; padding:32px 0; justify-content:space-between; color:#251d32; font:500 11px var(--sans); text-transform:none; letter-spacing:0; }
.personal footer.site a { color:#251d32; }
.personal .projects-body { width:100%; }
.personal #bakiano .block.main { background:linear-gradient(125deg,#fff0d8,#ffe2d6); }
.personal #jev .block.main { background:linear-gradient(125deg,#f0ddff,#e2eaff); }
.personal .card { border-color:#e1cfdb; }
.personal .reveal-body .block.foot { background:#fff; }
.personal .reveal-body .vset { background:#f2eadcb8; }
@media(min-width:761px) { .explore:has(.reveal[open]) { grid-template-columns:repeat(4,1fr); } }
@media(max-width:760px) {
 .human-hero { padding-top:110px; }
 .human-location { font-size:14px; }
 .human-hero h1 { margin-bottom:20px; }
 .explore { grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }
 .reveal > summary,.explore-link { grid-row:auto; padding:14px 18px; font-size:13px; }
 .reveal:nth-child(1) > summary,.reveal:nth-child(2) > summary { grid-row:1; }
 .explore-link,.reveal:nth-child(4) > summary { grid-row:2; }
 .reveal-body { grid-row:3; padding:22px 16px; min-width:0; }
 .reveal-body h2 { font-size:27px; }
 .color-band { top:-20%; width:180%; left:-40%; height:140%; filter:blur(28px); }
 .personal .reveal-body .outcomes { grid-template-columns:1fr 1fr; }
 .personal .reveal-body .vsets { grid-template-columns:1fr 1fr; }
 .personal .reveal-body .vprods { grid-template-columns:1fr; }
}
/* Two controls at either edge, with breathing room through the middle. */
@media(min-width:761px) {
 .explore,.explore:has(.reveal[open]) { grid-template-columns:max-content max-content minmax(40px,1fr) max-content max-content; }
 #about > summary { grid-column:1; }
 #projects > summary { grid-column:2; }
 .explore-link { grid-column:4; }
 #contact > summary { grid-column:5; }
 .reveal-body { grid-row:3; width:100%; }
}
.ambient-calendar { grid-column:1/-1; grid-row:2; display:block; width:min(100%,720px); justify-self:center; margin:40px 0 0; padding:12px; border-radius:12px; text-decoration:none; color:#241c35; opacity:.42; transition:opacity .3s,background .3s,box-shadow .3s;
 --hm0:#f2eadc40; --hm1:#f6d7ec; --hm2:#d1a0e9; --hm3:#8f50b8; --hm4:#472468;
}
.calendar-caption { display:flex; justify-content:space-between; gap:12px; margin-bottom:10px; font:500 10px/1.5 var(--mono); }
.ambient-calendar .hm-d { border-radius:2px; }
.ambient-calendar:hover,.ambient-calendar:focus-visible { opacity:1; background:#f2eadcf0; box-shadow:0 8px 35px #52225212; --hm0:#e8dce8; }
.calendar-unavailable { font-size:12px; }
@media(max-width:760px) {
 #about > summary { grid-column:1; grid-row:1; }
 #projects > summary { grid-column:1; grid-row:2; }
 .explore-link { grid-column:2; grid-row:1; }
 #contact > summary { grid-column:2; grid-row:2; }
 .ambient-calendar { grid-row:3; margin-top:26px; padding:8px 0; }
 .reveal-body { grid-row:4; }
 .calendar-caption { font-size:9px; flex-wrap:wrap; gap:3px 10px; }
 .ambient-calendar .hm-col:nth-child(n) { display:flex; }
 .ambient-calendar .hm,.ambient-calendar .hm-col { gap:2px; }
}
@media(hover:none) { .ambient-calendar { opacity:.72; } }
.reveal > summary,.explore-link {
 justify-content:center; text-align:center; gap:0; min-width:145px;
 font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;
 font-size:14px; font-weight:650; letter-spacing:-.025em;
 background:linear-gradient(110deg,#cbd9b7 20%,#cbd9b7 45%,#d6d5ad 62%,#efbe95 78%,#eac39f 100%);
 background-size:300% 100%; background-position:0% 50%;
 border-color:#d6c9b6; color:#111;
 transition:background-position .7s cubic-bezier(.22,1,.36,1),box-shadow .4s,border-color .4s,transform .4s;
}
.reveal > summary:hover,.explore-link:hover,.reveal > summary:focus-visible,.explore-link:focus-visible {
 background-position:100% 50%; border-color:#aa976b; color:#111;
 box-shadow:-8px 5px 22px #d7794333,8px 5px 22px #398b7933; transform:translateY(-2px);
}
.reveal[open] > summary { background-position:100% 50%; border-color:#8b986b; color:#111; box-shadow:inset 0 0 0 1px #8b986b; }
@media(max-width:760px) { .reveal > summary,.explore-link { min-width:0; } }
/* Shared secondary pages: color around the content, opaque reading surfaces. */
.personal.experience-page .wrap { max-width:1240px; min-width:0; padding-bottom:30px; }
.personal.experience-page .subnav { margin:28px 0 34px; gap:12px; flex-wrap:wrap; }
.personal.experience-page .subnav a,.personal.experience-page .tlp-foot a { color:#111; background:#f2eadc; border:1px solid #d6c9b6; padding:12px 18px; border-radius:999px; font:700 13px var(--sans); text-transform:none; letter-spacing:0; }
.personal.experience-page .subnav a,.personal.experience-page .tlp-foot a {
 display:inline-flex; align-items:center; justify-content:center; min-width:115px; text-align:center;
 font:650 14px ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif; letter-spacing:-.025em;
 background:linear-gradient(110deg,#cbd9b7 20%,#cbd9b7 45%,#d6d5ad 62%,#efbe95 78%,#eac39f 100%);
 background-size:300% 100%; background-position:0% 50%;
 transition:background-position .7s cubic-bezier(.22,1,.36,1),box-shadow .4s,border-color .4s,transform .4s;
}
.personal.experience-page .subnav a:is(:hover,:focus-visible),.personal.experience-page .tlp-foot a:is(:hover,:focus-visible) {
 color:#111; background-position:100% 50%; border-color:#aa976b;
 box-shadow:-8px 5px 22px #d7794333,8px 5px 22px #398b7933; transform:translateY(-2px);
}
@media(prefers-reduced-motion:reduce) {
 .personal.experience-page .subnav a,.personal.experience-page .tlp-foot a { transition:none; }
 .personal.experience-page .subnav a:is(:hover,:focus-visible),.personal.experience-page .tlp-foot a:is(:hover,:focus-visible) { transform:none; }
}
.personal.experience-page .page-h1 { font-size:clamp(34px,4.8vw,62px); letter-spacing:-.045em; }
.personal.experience-page .page-lede { color:#514459; }
.personal.experience-page .tlp-scroll { background:#f2eadcf5; border:1px solid #ead6df; border-radius:22px; margin-top:24px; box-shadow:0 16px 60px #3b193514; }
.personal.experience-page .tlp { height:58vh; min-height:480px; --dim:#99889e; --muted:#68566f; }
.personal.experience-page .tlp-bar { border-radius:6px; }
.personal.experience-page .tlp-bar.job,.personal.experience-page .lg.job i { background:#a448d5; }
.personal.experience-page .tlp-bar.contract,.personal.experience-page .lg.contract i { background:#e16a3d; }
.personal.experience-page .tlp-bar.project,.personal.experience-page .lg.project i { background:#e3b52f; box-shadow:inset 0 0 0 1px #9a7616; }
.personal.experience-page .tlp-bar:hover { filter:brightness(.85); }
.personal.experience-page .tlp-legend { background:#f2eadc; padding:14px 18px; border-radius:14px; border:1px solid #ead6df; }
.personal.experience-page .tlp-foot { gap:12px; flex-wrap:wrap; margin-top:20px; }
.personal.experience-page .tlp-foot span { color:#201c32; background:#f2eadc; padding:9px 12px; border-radius:8px; }
.personal.experience-page .tlp-dialog { background:#f2eadc; border:1px solid #ead6df; border-radius:22px; box-shadow:0 25px 90px #20122a55; }
.personal.experience-page .tlp-backdrop { background:#23132d80; backdrop-filter:blur(10px); }
.personal.experience-page .media { background:#f3eaf8; }
.personal.experience-page .pp,.personal.experience-page .tab { background:#f2eadc; color:#111; font-weight:700; border-radius:999px; }
.personal.experience-page .tab.on { background:#e5d8c4; box-shadow:inset 0 0 0 2px #9a8871; }
.personal.experience-page .resume { width:100%; background:#f2eadcf5; padding:0 30px 24px; border-radius:0 0 22px 22px; }
.personal.experience-page .log-item { background:#f2eadcf5; border:1px solid #ead6df; border-radius:16px; padding:24px; }
.personal.experience-page .wrap.narrow { max-width:850px; }
@media(max-width:700px) { .personal.experience-page .resume { padding:0 14px 18px; } .personal.experience-page .tlp { min-height:430px; } }
@media(hover:hover) and (pointer:fine) {
 body.personal,body.personal * { cursor:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 18 18'%3E%3Ccircle cx='9' cy='9' r='7' fill='%23e24938'/%3E%3C/svg%3E") 9 9,auto; }
}
@media print { .color-world { display:none; } .personal.experience-page { background:white; } .personal.experience-page .resume { background:white; padding:0; } }
@media(prefers-reduced-motion:reduce) { .color-band { animation:none; } .reveal > summary,.explore-link,.ambient-calendar { transition:none; } .reveal > summary:hover,.explore-link:hover,.reveal > summary:focus-visible,.explore-link:focus-visible { transform:none; } }
/* Light lettering over the deep forest and umber background. */
.human-location,.human-hero h1 { color:#fff7e9; text-shadow:0 1px 12px #142b24,0 1px 3px #142b24; }
.personal footer.site,.personal footer.site a { color:#f2eadc; text-shadow:0 1px 5px #192822; }
.ambient-calendar { color:#24372c; --hm0:#24372c24; --hm1:#9cc9ae; --hm2:#71ad94; --hm3:#418f79; --hm4:#155b4c; }
.ambient-calendar:hover,.ambient-calendar:focus-visible { color:#24372c; --hm0:#dcdacb; }
.personal.experience-page .page-h1,.personal.experience-page .page-lede { color:#f2eadc; }
.project-list { display:flex; flex-direction:column; gap:10px; }
.project-dropdown { border:1px solid #bbc4a9; border-radius:14px; overflow:hidden; }
.project-dropdown > summary { display:flex; align-items:center; justify-content:space-between; gap:18px; padding:20px; background:#d9e0c7; color:#25382c; font-size:17px; font-weight:600; list-style:none; cursor:pointer; }
.project-dropdown > summary::-webkit-details-marker { display:none; }
.project-dropdown > summary::after { content:"+"; font-size:22px; font-weight:400; }
.project-dropdown[open] > summary::after { content:"−"; }
.project-dropdown > summary:hover { background:#eac39f; }
.project-details { padding:12px; }
.project-dropdown:not([open]) .project-details { display:none; }
.project-details .card-head { display:none; }
/* Dark reading surfaces complement the moving forest palette. */
@media screen {
 body.personal,.personal .on-cream,.personal .on-orange {
  color-scheme:dark; --bg:#24372e; --panel:#2f4439; --fg:#f1ecdf; --muted:#b8c5b8; --dim:#8b9f90; --line:#506557; --accent:#e8b286; --cream:#f1ecdf; --near:#24372e; color:var(--fg);
 }
 .personal .reveal-body,.personal .card,.personal .contact-links .email-box,
 .personal.experience-page .tlp-scroll,.personal.experience-page .tlp-dialog,
 .personal.experience-page .resume,.personal.experience-page .tlp-legend,
 .personal.experience-page .log-item { background:#24372ef5; color:#f1ecdf; border-color:#506557; box-shadow:0 18px 60px #0b171c40; }
 .personal #bakiano .block.main { background:linear-gradient(125deg,#3d372e,#283b32); }
 .personal #jev .block.main { background:linear-gradient(125deg,#2d4840,#283b32); }
 .personal .reveal-body .block.foot,.personal .reveal-body .vset,
 .personal .outcome,.personal.experience-page .media { background:#2d4137; border-color:#506557; }
 .personal .project-copy,.personal .project-eyebrow { color:#b8c5b8; }
 .personal .vset-flag.live { background:#345341; color:#d6eac8; }
 .personal .text-link,.personal .contact-links > a,.personal .email-box a { color:#e8b286; }
 .personal .project-dropdown { border-color:#506557; }
 .personal .project-dropdown > summary { background:#344a3e; color:#f1ecdf; }
 .personal .project-dropdown > summary:hover { background:#574e42; }
 .personal .reveal > summary,.personal .explore-link,
 .personal.experience-page .subnav a,.personal.experience-page .tlp-foot a {
  background-image:linear-gradient(110deg,#344a3e 20%,#344a3e 45%,#425547 62%,#604d3e 78%,#57463b 100%); color:#f1ecdf; border-color:#61735a;
 }
 .personal .reveal > summary:is(:hover,:focus-visible),.personal .explore-link:is(:hover,:focus-visible),
 .personal .reveal[open] > summary,.personal.experience-page .subnav a:is(:hover,:focus-visible),.personal.experience-page .tlp-foot a:is(:hover,:focus-visible) { color:#fff4df; border-color:#bd9876; }
 .personal .contact-links .btn.primary,.personal .contact-links .btn.secondary,
 .personal.experience-page .pp,.personal.experience-page .tab { background:#3e5948; color:#edf1df; border:1px solid #526949; }
 .personal .contact-links .btn:hover,.personal.experience-page .tab.on { background:#604d3e; color:#fff0d9; box-shadow:none; }
 .personal .email-copy { background:#425d49; color:#f1ecdf; }
 .personal .email-copy:hover { background:#604d3e; }
 .personal.experience-page .tlp { --dim:#829585; --muted:#bac8b8; }
 .personal.experience-page .tlp-foot span { color:#c8d4c2; background:#2d4137; }
 .personal .ambient-calendar { color:#eff0dc; --hm0:#bdd0b026; --hm1:#526a4b; --hm2:#7d9d6f; --hm3:#aec28d; --hm4:#e6be8c; }
 .personal .ambient-calendar:hover,.personal .ambient-calendar:focus-visible { color:#eff0dc; background:#24372eed; --hm0:#2b4233; }
 .personal :is(a,button,summary):focus-visible { outline-color:#e8b286; }
}

/* One centered, consistent set of contact actions. */
#contact .reveal-body { text-align:center; padding-block:38px; }
#contact .reveal-body h2 { margin-bottom:26px; }
.personal .contact-links { position:relative; display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:12px; max-width:640px; margin:0 auto; align-items:start; }
.personal .contact-links .contact-button {
 display:flex; align-items:center; justify-content:center; gap:10px; min-height:58px; padding:14px 18px;
 border:1px solid #61735a; border-radius:14px; background:#344a3e; color:#f1ecdf;
 font:600 14px var(--sans); letter-spacing:0; text-transform:none; text-decoration:none;
 transition:background .2s,border-color .2s,transform .2s;
}
.personal .contact-links .contact-button svg { width:21px; height:21px; flex:none; }
.personal .contact-links .contact-button:hover,.personal .contact-links .email-pop[open] > summary { background:#57463b; color:#fff4df; border-color:#bd9876; }
.personal .contact-links .contact-button:hover { transform:translateY(-2px); }
.personal .contact-links .email-pop { position:static; }
.personal .contact-links .email-box { top:calc(100% + 14px); left:50%; right:auto; transform:translateX(-50%); width:max-content; max-width:100%; justify-content:center; border-color:#506557; border-radius:12px; }
.personal .contact-links:has(.email-pop[open]) { margin-bottom:76px; }
@media(max-width:560px) { .personal .contact-links { grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; } .personal .contact-links .contact-button { padding:14px 10px; } .personal .contact-links:has(.email-pop[open]) { margin-bottom:105px; } }
@media(prefers-reduced-motion:reduce) { .personal .contact-links .contact-button { transition:none; } .personal .contact-links .contact-button:hover { transform:none; } }

.technical-details { margin-top:28px; border:1px solid #506557; border-radius:14px; background:#24372e; overflow:hidden; }
.technical-details > summary { display:flex; justify-content:space-between; align-items:center; gap:16px; padding:18px 20px; color:#f1ecdf; font-size:15px; font-weight:600; list-style:none; cursor:pointer; }
.technical-details > summary::-webkit-details-marker { display:none; }
.technical-details > summary:hover { background:#344a3e; }
.technical-toggle { font-size:22px; font-weight:400; transition:transform .2s; }
.technical-details[open] .technical-toggle { transform:rotate(45deg); }
.technical-body { padding:0 20px 24px; }
.technical-intro { color:#b8c5b8; margin:0 0 18px; font-size:14px; }
.technical-flow { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); list-style:none; counter-reset:stage; padding:0; margin:0 0 26px; gap:8px; }
.technical-flow li { counter-increment:stage; padding:13px 12px; border:1px solid #506557; border-radius:9px; color:#f1ecdf; font-size:13px; background:#2d4137; }
.technical-flow li::before { content:counter(stage,decimal-leading-zero); display:block; color:#e8b286; font:11px var(--mono); margin-bottom:8px; }
.technical-topics { display:grid; grid-template-columns:1fr 1fr; gap:24px; }
.technical-topics h4 { font-size:15px; color:#f1ecdf; margin:0 0 8px; }
.technical-topics p { font-size:14px; line-height:1.65; color:#bdcbbb; margin:0; }
@media(max-width:640px) { .technical-flow { grid-template-columns:1fr 1fr; } .technical-topics { grid-template-columns:1fr; } .technical-body { padding:0 16px 20px; } }
@media(prefers-reduced-motion:reduce) { .technical-toggle { transition:none; } }

`;
