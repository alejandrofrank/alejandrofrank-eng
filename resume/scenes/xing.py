"""Xing (via CortexLabs) — on-prem Hadoop/Hive → Snowflake.

From the CV: migrated on-premise Hadoop/Hive pipelines to Snowflake with dbt,
orchestrated by Airflow / Astronomer. DRAFT.
"""

from resume.scene import Scene, Node, Flow, Beat

LEGACY = "#9a8f80"

scene = Scene(
    id="xing",
    title="Xing",
    role="Data Engineer · via CortexLabs",
    period="2024 – 2025",
    summary=(
        "Migrated Xing's on-prem Hadoop / Hive pipelines to Snowflake — rebuilt "
        "the transformations in dbt and orchestrated the whole thing with Airflow "
        "on Astronomer."
    ),
    nodes=[
        # old (top)
        Node("hadoop", "Hadoop", "source", 0.16, 0.20, "HDFS", color=LEGACY),
        Node("hive", "Hive", "source", 0.46, 0.20, "on-prem tables", color=LEGACY),
        # new (bottom)
        Node("snowflake", "Snowflake", "core", 0.12, 0.72, "new warehouse"),
        Node("dbt", "dbt", "core", 0.42, 0.72, "models + tests"),
        Node("marts", "Data marts", "sink", 0.90, 0.72, "analytics-ready"),
        Node("airflow", "Airflow", "core", 0.30, 0.94, "Astronomer"),
    ],
    flows=[
        Flow("f_old", "hadoop", "hive", color=LEGACY),
        Flow("f_model", "snowflake", "dbt", glow=True),
        Flow("f_marts", "dbt", "marts", glow=True),
        Flow("f_sched", "airflow", "dbt", glow=True),
    ],
    beats=[
        Beat(
            "On-prem Hadoop / Hive",
            "Xing's pipelines ran on-prem: Hadoop clusters feeding Hive tables.",
            nodes=["hadoop", "hive"],
            flows=["f_old"],
        ),
        Beat(
            "Rebuilt on Snowflake",
            "Everything moved to Snowflake as the new warehouse — no clusters to "
            "maintain.",
            nodes=["snowflake"],
        ),
        Beat(
            "Modeled in dbt",
            "The transformations were rebuilt in dbt — models and tests — landing "
            "clean analytics marts.",
            nodes=["dbt", "marts"],
            flows=["f_model", "f_marts"],
        ),
        Beat(
            "Orchestrated on Astronomer",
            "Airflow on Astronomer scheduled and orchestrated every run.",
            nodes=["airflow"],
            flows=["f_sched"],
        ),
    ],
)
