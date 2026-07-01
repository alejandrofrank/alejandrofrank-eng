"""Adevinta (via CortexLabs) — Adobe Analytics → GA4 migration.

From the CV: during Adevinta's split into independent companies, led technical
delivery for the housing vertical (Fotocasa / Realia). Built an algorithm that
migrated every Adobe Analytics report — including bespoke report-specific logic —
into GA4, end to end, with zero loss of data or business-critical metrics.
Paired with a business analyst to interview report owners. DRAFT.
"""

from resume.scene import Scene, Node, Flow, Beat

LEGACY = "#9a8f80"

scene = Scene(
    id="adevinta",
    title="Adevinta",
    role="Data Engineer · via CortexLabs",
    period="Mar 2025 – Oct 2025",
    summary=(
        "During Adevinta's split into independent companies, led technical "
        "delivery for the housing vertical (Fotocasa / Realia). Built an "
        "algorithm that migrated every Adobe Analytics report — bespoke logic and "
        "all — into GA4, with zero loss of data or business-critical metrics."
    ),
    nodes=[
        Node("adobe", "Adobe Analytics", "source", 0.12, 0.48, "reports + logic", color=LEGACY),
        Node("owners", "Report owners", "source", 0.12, 0.84, "interviewed"),
        Node("algo", "Migration algorithm", "core", 0.48, 0.52, "bespoke logic mapped"),
        Node("ga4", "GA4", "core", 0.82, 0.52, "every report, rebuilt"),
    ],
    flows=[
        Flow("f_reports", "adobe", "algo", glow=True),
        Flow("f_reqs", "owners", "algo", glow=True),
        Flow("f_ga4", "algo", "ga4", glow=True),
    ],
    beats=[
        Beat(
            "Adobe, and a split looming",
            "Adevinta was splitting into independent companies; the housing "
            "vertical needed every Adobe Analytics report moved to GA4.",
            nodes=["adobe"],
        ),
        Beat(
            "What actually matters",
            "Paired with a business analyst to interview report owners and pin "
            "down exactly which metrics were essential.",
            nodes=["owners"],
        ),
        Beat(
            "An algorithm, not by hand",
            "Built an algorithm that migrated every report automatically — "
            "including the bespoke, report-specific logic no template covered.",
            nodes=["algo"],
            flows=["f_reports", "f_reqs"],
        ),
        Beat(
            "Into GA4, zero loss",
            "Every report rebuilt in GA4, owned end to end, with zero loss of "
            "data or business-critical metrics.",
            nodes=["ga4"],
            flows=["f_ga4"],
        ),
    ],
)
