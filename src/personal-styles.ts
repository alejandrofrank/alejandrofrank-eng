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
`;
