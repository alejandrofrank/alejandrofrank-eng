"""Unipol — built the data platform from the ground up.

From the CV: established a comprehensive dbt infrastructure on AWS from scratch,
applying best practices, and configured Airflow to schedule the dbt runs,
automating the pipeline end to end. DRAFT — needs real specifics (warehouse,
sources, what the marts fed).
"""

from resume.scene import Scene, Node, Flow, Beat

scene = Scene(
    id="unipol",
    title="Unipol",
    role="Data Engineer",
    period="Jun 2022 – May 2023",
    summary=(
        "Unipol had no data platform — so I built one from the ground up: a full "
        "dbt setup on AWS with best practices from day one, and Airflow "
        "scheduling every run to automate the pipeline end to end."
    ),
    nodes=[
        Node("sources", "Source systems", "source", 0.06, 0.45, "operational data"),
        Node("s3", "AWS S3", "core", 0.28, 0.45, "raw landing"),
        Node("redshift", "Redshift", "core", 0.50, 0.45, "raw tables"),
        Node("dbt", "dbt", "core", 0.72, 0.30, "models + tests"),
        Node("marts", "Data marts", "sink", 0.93, 0.30, "analytics-ready"),
        Node("airflow", "Airflow", "core", 0.60, 0.78, "schedules dbt"),
    ],
    flows=[
        Flow("f_land", "sources", "s3"),
        Flow("f_load", "s3", "redshift"),
        Flow("f_read", "redshift", "dbt"),
        Flow("f_marts", "dbt", "marts", glow=True),
        Flow("f_sched", "airflow", "dbt", glow=True),
    ],
    beats=[
        Beat(
            "Built from the ground up",
            "Unipol had no data platform. Job one was building the whole thing "
            "from scratch — starting from the raw source systems.",
            nodes=["sources"],
        ),
        Beat(
            "Land it on AWS",
            "Raw operational data landed in S3 and loaded into Redshift as the "
            "warehouse.",
            nodes=["s3", "redshift"],
            flows=["f_land", "f_load"],
        ),
        Beat(
            "Model it with dbt",
            "A full dbt setup — models, tests, best practices from day one — "
            "turned the raw tables into clean, analytics-ready data marts.",
            nodes=["dbt", "marts"],
            flows=["f_read", "f_marts"],
        ),
        Beat(
            "Automated end to end",
            "Airflow scheduled every dbt run, automating the whole pipeline end "
            "to end — no manual steps left.",
            nodes=["airflow"],
            flows=["f_sched"],
        ),
    ],
)
