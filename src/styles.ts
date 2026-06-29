// ----------------------------------------------------------------------------
// All CSS for the site lives here as one string, injected into the page <head>.
// ----------------------------------------------------------------------------

export const styles = `
  :root {
    --bg: #0a0a0b; --panel: #141417; --line: #232327;
    --fg: #ededef; --muted: #8a8a93; --accent: #6ee7b7;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: var(--bg); color: var(--fg);
    font: 16px/1.6 ui-monospace, "SF Mono", "JetBrains Mono", Menlo, monospace;
    -webkit-font-smoothing: antialiased;
  }
  .wrap { max-width: 920px; margin: 0 auto; padding: 0 24px; }
  header.hero { padding: 96px 0 56px; }
  .tag { color: var(--accent); font-size: 13px; letter-spacing: .08em; text-transform: uppercase; }
  h1 { font-size: clamp(34px, 6vw, 56px); line-height: 1.1; margin: 14px 0 18px; letter-spacing: -0.02em; }
  .sub { color: var(--muted); max-width: 60ch; font-size: 17px; }
  .outcomes { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin: 44px 0 0; }
  .outcome { background: var(--panel); border: 1px solid var(--line); border-radius: 12px; padding: 16px; }
  .outcome b { display: block; font-size: 22px; color: var(--fg); }
  .outcome span { color: var(--muted); font-size: 12px; }
  section { padding: 24px 0 80px; }
  .sec-head { display: flex; align-items: baseline; justify-content: space-between; margin: 0 0 18px; }
  .sec-head h2 { font-size: 15px; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); margin: 0; font-weight: 600; }
  .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
  .panel { background: var(--panel); border: 1px solid var(--line); border-radius: 14px; padding: 20px; min-height: 130px; display: flex; flex-direction: column; }
  .panel h3 { margin: 0 0 4px; font-size: 16px; }
  .panel .note { color: var(--muted); font-size: 13px; flex: 1; }
  .badge { align-self: flex-start; margin-top: 14px; font-size: 11px; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); border: 1px solid var(--line); border-radius: 999px; padding: 3px 10px; }
  footer { color: var(--muted); font-size: 13px; padding: 0 0 60px; }
  footer a { color: var(--accent); text-decoration: none; }
  @media (max-width: 640px) { .outcomes, .grid { grid-template-columns: 1fr 1fr; } }
`;
