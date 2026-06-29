// ----------------------------------------------------------------------------
// Site content. This is the file you edit most — copy, numbers, panels, links.
// No HTML/CSS here; just data.
// ----------------------------------------------------------------------------

export const SITE = {
  name: "Alejandro Frank",
  location: "Madrid",
  thesis: "The wall is never the code.",
  subtitle:
    "Forward-deployed engineer. I take ambiguous problems and ship the ambitious version — live systems other people can depend on.",
};

// Outcomes header — frames the live activity below as "senior builder in motion".
export const OUTCOMES: { value: string; label: string }[] = [
  { value: "7 yrs", label: "shipping production systems" },
  { value: "8+", label: "enterprise clients" },
  { value: "AI + data", label: "agents, RAG, MCP, pipelines" },
  { value: "OSS", label: "MCP server, in the ecosystem" },
];

// Dashboard panels now live as modules under src/panels/ (see panels/index.ts).

export const LINKS: { label: string; href: string }[] = [
  { label: "GitHub", href: "https://github.com/alejandrofrank" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/alejandrofrank" },
  { label: "Email", href: "mailto:alejandrofranks@gmail.com" },
];
