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
.personal .on-cream,.personal .on-orange { --bg:#fff; --panel:#f1f3fa; --line:#e1e6ef; --fg:#172132; --muted:#606d81; --dim:#b1b9c9; --accent:#4c60d9; background:var(--bg); color:var(--fg); }
.personal .card { gap:0; border:1px solid #e0e5ef; border-radius:12px; overflow:hidden; background:white; }
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
body.personal { background:#fff4ed; color:#201c32; --fg:#201c32; }
.personal .wrap { position:relative; z-index:1; max-width:1100px; min-height:100svh; display:flex; flex-direction:column; }
.color-world { position:fixed; inset:0; overflow:hidden; pointer-events:none; z-index:0; background:radial-gradient(ellipse at 45% 5%,#fffaf5 0%,#fff2ed 38%,#ffdccf 65%,#e3c5fa 100%); }
.color-band { position:absolute; width:160%; height:65%; left:-30%; top:48%; transform:rotate(-9deg); filter:blur(24px); animation:band-drift 20s ease-in-out infinite alternate; }
.color-band i { display:block; position:absolute; width:100%; height:75%; border-radius:50%; }
.color-band i:nth-child(1) { top:0; background:linear-gradient(110deg,#ff882c 5%,#ff396c 25%,#b228ee 48%,#6041f4 70%,#489fff 91%); box-shadow:0 -24px 55px #f791de; }
.color-band i:nth-child(2) { top:32%; left:-8%; background:linear-gradient(95deg,#ffe357 5%,#ff894b 25%,#f83259 47%,#ff79ba 66%,#9a84ff 90%); transform:rotate(8deg); }
.color-band i:nth-child(3) { top:66%; left:6%; background:linear-gradient(105deg,#fe743a,#ffc763 30%,#ffec9c 49%,#fd866d 74%,#cb67cf); transform:rotate(-3deg); }
.color-grain { position:absolute; inset:0; opacity:.32; mix-blend-mode:multiply; }
@keyframes band-drift { from { transform:translate(-4%,3%) rotate(-9deg) scale(1); } to { transform:translate(6%,-7%) rotate(7deg) scale(1.08); } }
.human-hero { padding:clamp(90px,16vh,160px) 0 20px; text-align:center; }
.human-location { margin:0 0 20px; font-size:16px; font-weight:500; letter-spacing:-.015em; }
.human-hero h1 { font-size:clamp(100px,17vw,210px); line-height:.95; font-weight:600; letter-spacing:-.085em; margin:0 0 30px; color:#211b31; }
.human-hero h1 span { color:#e24938; }
.explore { display:grid; grid-template-columns:repeat(4,max-content); justify-content:center; gap:12px; padding-bottom:70px; }
.reveal { display:contents; }
.reveal::details-content { display:contents; }
.reveal:not([open]) .reveal-body { display:none; }
.color-world::after { content:""; position:absolute; inset:0; background:linear-gradient(to bottom,#fff4ed 0%,#fff4edee 24%,#fff4edc9 43%,transparent 59%); }
.reveal > summary,.explore-link { grid-row:1; list-style:none; display:flex; gap:27px; justify-content:space-between; align-items:center; padding:15px 22px; background:#fffaf5; color:#282138; border:1px solid #d9c8d3; border-radius:999px; text-decoration:none; cursor:pointer; font:500 14px var(--sans); box-shadow:0 3px 10px #41124208; transition:background .2s,transform .2s; }
.reveal > summary::-webkit-details-marker { display:none; }
.reveal > summary:hover,.explore-link:hover { background:#ffe4dd; transform:translateY(-2px); }
.reveal[open] > summary { background:#292039; color:#fff8f0; border-color:#292039; }
.reveal-body { grid-column:1/-1; grid-row:2; width:min(100%,1000px); padding:34px; background:#fffaf7; border:1px solid #e5d9e4; border-radius:22px; margin-top:24px; box-shadow:0 18px 60px #47275619; }
.reveal-body h2 { font-size:32px; line-height:1.1; margin:0 0 20px; }
.about-copy { font-size:20px; max-width:52ch; line-height:1.5; }
.personal .reveal-body .outcomes { margin:26px 0; }
.text-link { color:#5d35a5; }
.contact-links { display:flex; flex-wrap:wrap; align-items:center; gap:24px; }
.contact-links > a { color:#482677; }
.personal .contact-links .btn.primary,.personal .contact-links .btn.secondary { background:#efe2ff; color:#482677; }
.personal .contact-links .email-box { right:auto; left:0; background:#fff; border:1px solid #ddd; }
.personal footer.site { margin-top:auto; padding:32px 0; justify-content:space-between; color:#251d32; font:500 11px var(--sans); text-transform:none; letter-spacing:0; }
.personal footer.site a { color:#251d32; }
.personal .projects-body { width:100%; }
.personal #bakiano .block.main { background:linear-gradient(125deg,#fff0d8,#ffe2d6); }
.personal #jev .block.main { background:linear-gradient(125deg,#f0ddff,#e2eaff); }
.personal .card { border-color:#e1cfdb; }
.personal .reveal-body .block.foot { background:#fff; }
.personal .reveal-body .vset { background:#ffffffb8; }
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
 .color-band { top:46%; width:230%; left:-65%; height:65%; }
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
 --hm0:#fff7ed40; --hm1:#f6d7ec; --hm2:#d1a0e9; --hm3:#8f50b8; --hm4:#472468;
}
.calendar-caption { display:flex; justify-content:space-between; gap:12px; margin-bottom:10px; font:500 10px/1.5 var(--mono); }
.ambient-calendar .hm-d { border-radius:2px; }
.ambient-calendar:hover,.ambient-calendar:focus-visible { opacity:1; background:#fff7eff0; box-shadow:0 8px 35px #52225212; --hm0:#e8dce8; }
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
@media(prefers-reduced-motion:reduce) { .color-band { animation:none; } .reveal > summary,.explore-link,.ambient-calendar { transition:none; } }
`;
