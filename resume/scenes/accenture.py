"""Accenture — on-prem → GCP migration.

Accenture became a Google Cloud partner and needed its on-prem apps moved to
GCP. Migrated four applications — three Hadoop / Spark-Scala pipelines (re-written
to PySpark, scheduled on Cloud Composer, into BigQuery + Cloud Storage) and one
that also needed an ML layer (kept deliberately vague).

Modeled as a before→after mapping: the old stack on the left, each component's
GCP equivalent on the right, with a glowing "migration beam" between them.
"""

from resume.scene import Scene, Node, Flow, Beat

LEGACY = "#9a8f80"  # muted "old world" tone for the on-prem stack

scene = Scene(
    id="accenture",
    title="Accenture",
    role="Data Engineer",
    period="Jul 2021 – May 2022",
    summary=(
        "Accenture had gone all-in as a Google Cloud partner and needed its "
        "on-prem stack moved to GCP. Migrated four applications — three "
        "Hadoop / Spark-Scala pipelines plus one with an ML layer — to Cloud "
        "Storage, PySpark, BigQuery and Cloud Composer. Terabytes of data, "
        "running natively on GCP."
    ),
    nodes=[
        # old world (left)
        Node("hdfs", "Hadoop", "source", 0.08, 0.16, "HDFS storage", color=LEGACY),
        Node("spark", "Spark", "source", 0.08, 0.38, "Scala", color=LEGACY),
        Node("hive", "Hive", "source", 0.08, 0.60, "tables", color=LEGACY),
        Node("talend", "Talend", "source", 0.08, 0.82, "orchestration", color=LEGACY),
        # GCP (right)
        Node("gcs", "Cloud Storage", "core", 0.84, 0.16, "GCS"),
        Node("dataproc", "PySpark", "core", 0.84, 0.38, "on Dataproc"),
        Node("bq", "BigQuery", "core", 0.84, 0.60, "warehouse"),
        Node("composer", "Cloud Composer", "core", 0.84, 0.82, "Airflow"),
    ],
    flows=[
        Flow("f_storage", "hdfs", "gcs", glow=True),
        Flow("f_spark", "spark", "dataproc", glow=True),
        Flow("f_hive", "hive", "bq", glow=True),
        Flow("f_orch", "talend", "composer", glow=True),
    ],
    beats=[
        Beat(
            "On-prem, four apps",
            "Accenture had become a Google Cloud partner and needed its on-prem "
            "apps moved over. The stack: Hadoop clusters, Spark in Scala, Hive "
            "tables and Talend — four applications in all.",
            nodes=["hdfs", "spark", "hive", "talend"],
        ),
        Beat(
            "Storage → Cloud Storage",
            "First, the data itself: everything on HDFS lifted into Cloud Storage "
            "as the new landing layer.",
            nodes=["gcs"],
            flows=["f_storage"],
        ),
        Beat(
            "Spark Scala → PySpark",
            "The heavy lifting: Spark jobs re-written from Scala to PySpark and "
            "run on Dataproc — refactored for maintainability along the way.",
            nodes=["dataproc"],
            flows=["f_spark"],
        ),
        Beat(
            "Hive → BigQuery",
            "The Hive tables became a BigQuery warehouse — same data, no cluster "
            "to babysit.",
            nodes=["bq"],
            flows=["f_hive"],
        ),
        Beat(
            "Orchestrated on Cloud Composer",
            "Finally, Talend's orchestration moved to Airflow on Cloud Composer. "
            "All four apps — three pipelines plus one with an ML layer — fully "
            "migrated and running natively on GCP.",
            nodes=["composer"],
            flows=["f_orch"],
        ),
    ],
)
