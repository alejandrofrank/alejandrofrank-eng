"""Permira (via CortexLabs) — LLM analytics agent on Snowflake.

From the CV: built an LLM-powered analytics agent on Snowflake letting
non-technical stakeholders self-serve financial metrics in natural language,
querying real production tables. Collapsed a 6-role, multi-week request pipeline
into a single real-time query; v2 grounds every answer in the finance team's real
source files (source attribution). DRAFT.
"""

from resume.scene import Scene, Node, Flow, Beat

scene = Scene(
    id="permira",
    title="Permira",
    role="Data / AI Engineer",
    period="Oct 2025 – Jul 2026",
    summary=(
        "Built an LLM analytics agent on Snowflake that lets non-technical "
        "stakeholders self-serve financial metrics in plain English, querying "
        "real production tables. Collapsed a 6-role, multi-week request pipeline "
        "into one real-time query, grounded in the finance team's real source "
        "files for full auditability."
    ),
    nodes=[
        Node("user", "Stakeholder", "source", 0.07, 0.5, "plain-English question"),
        Node("agent", "LLM agent", "science", 0.37, 0.5, "natural language → query"),
        Node("snowflake", "Snowflake", "core", 0.66, 0.5, "real production tables"),
        Node("answer", "Answer + sources", "sink", 0.93, 0.5, "grounded · auditable"),
    ],
    flows=[
        Flow("f_ask", "user", "agent", glow=True),
        Flow("f_query", "agent", "snowflake"),
        Flow("f_answer", "snowflake", "answer", glow=True),
    ],
    beats=[
        Beat(
            "Six roles, weeks of waiting",
            "A single financial metric used to run a 6-role, multi-week pipeline: "
            "analyst → scrum → engineering → product → QA → production.",
            nodes=["user"],
        ),
        Beat(
            "Just ask",
            "I built an LLM agent that takes the question in plain English — "
            "e.g. 'what was Adevinta's EBITDA in 2025?' — no SQL, no ticket.",
            nodes=["agent"],
            flows=["f_ask"],
        ),
        Beat(
            "Query the real tables",
            "The agent queries real production tables in Snowflake, live — not a "
            "sample, not a cache.",
            nodes=["snowflake"],
            flows=["f_query"],
        ),
        Beat(
            "Grounded and auditable",
            "A v2 grounds every answer in the finance team's real source files "
            "with source attribution — the difference between a demo and a "
            "production-trusted system. One query, real time.",
            nodes=["answer"],
            flows=["f_answer"],
        ),
    ],
)
