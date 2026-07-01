"""Sanofi (via CortexLabs) — AWS → Snowflake migration, zero downtime.

From the CV: led the migration of data infrastructure from AWS to Snowflake,
designing the new architecture, with automated bidirectional transfer between
AWS and Snowflake to keep legacy systems running — zero operational downtime.
DRAFT — needs real specifics.
"""

from resume.scene import Scene, Node, Flow, Beat

LEGACY = "#9a8f80"

scene = Scene(
    id="sanofi",
    title="Sanofi",
    role="Data Engineer · via CortexLabs",
    period="Dec 2023 – Oct 2024",
    summary=(
        "Led Sanofi's migration from AWS to Snowflake — designing the new "
        "architecture and engineering an automated, bidirectional transfer layer "
        "so legacy systems on AWS kept running throughout. Zero operational "
        "downtime, reporting never interrupted."
    ),
    nodes=[
        Node("aws", "AWS", "source", 0.09, 0.34, "S3 + warehouse", color=LEGACY),
        Node("legacy", "Legacy systems", "source", 0.09, 0.74, "stay on AWS", color=LEGACY),
        Node("sync", "Bidirectional sync", "core", 0.42, 0.52, "zero downtime"),
        Node("snowflake", "Snowflake", "core", 0.72, 0.52, "new warehouse"),
        Node("reporting", "Reporting", "sink", 0.93, 0.52, "uninterrupted"),
    ],
    flows=[
        Flow("f_out", "aws", "sync", glow=True),
        Flow("f_legacy", "legacy", "sync", glow=True),
        Flow("f_in", "sync", "snowflake", glow=True),
        Flow("f_report", "snowflake", "reporting", glow=True),
    ],
    beats=[
        Beat(
            "Infrastructure on AWS",
            "Sanofi's data infrastructure lived on AWS, with legacy systems "
            "depending on it — nothing could go dark during a move.",
            nodes=["aws", "legacy"],
        ),
        Beat(
            "A bidirectional bridge",
            "The key move: an automated, bidirectional transfer layer between AWS "
            "and Snowflake, keeping both sides in step in real time.",
            nodes=["sync"],
            flows=["f_out", "f_legacy"],
        ),
        Beat(
            "New home: Snowflake",
            "Data migrated into a new Snowflake architecture, while the bridge "
            "kept the AWS legacy systems working both ways.",
            nodes=["snowflake"],
            flows=["f_in"],
        ),
        Beat(
            "Reporting never stopped",
            "Reporting ran uninterrupted through the entire transition — zero "
            "operational downtime.",
            nodes=["reporting"],
            flows=["f_report"],
        ),
    ],
)
