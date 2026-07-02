"""Loewe (via CortexLabs) — Dataform pipelines + large-scale transfers.

From the CV: set up data pipelines using Dataform and automated large-scale data
transfers in Python. DRAFT — thin.
"""

from resume.scene import Scene, Node, Flow, Beat

scene = Scene(
    id="loewe",
    title="Loewe",
    role="Data Engineer",
    period="Jun 2023 – Nov 2023",
    summary=(
        "Set up Loewe's data pipelines in Dataform and automated large-scale "
        "data transfers in Python — a clean, repeatable path from sources into "
        "the warehouse."
    ),
    nodes=[
        Node("sources", "Sources", "source", 0.08, 0.5, "operational data"),
        Node("transfers", "Python transfers", "core", 0.37, 0.5, "large-scale, automated"),
        Node("dataform", "Dataform", "core", 0.64, 0.5, "pipelines + models"),
        Node("warehouse", "Warehouse", "sink", 0.92, 0.5, "analytics-ready"),
    ],
    flows=[
        Flow("f_move", "sources", "transfers"),
        Flow("f_model", "transfers", "dataform"),
        Flow("f_load", "dataform", "warehouse", glow=True),
    ],
    beats=[
        Beat(
            "Scattered sources",
            "Loewe's data was spread across systems with no reliable path into a "
            "warehouse.",
            nodes=["sources"],
        ),
        Beat(
            "Automated transfers",
            "Automated the large-scale moves in Python — repeatable, hands-off.",
            nodes=["transfers"],
            flows=["f_move"],
        ),
        Beat(
            "Modeled in Dataform",
            "Set up the pipelines and models in Dataform.",
            nodes=["dataform"],
            flows=["f_model"],
        ),
        Beat(
            "Analytics-ready",
            "Landing clean, analytics-ready data in the warehouse.",
            nodes=["warehouse"],
            flows=["f_load"],
        ),
    ],
)
