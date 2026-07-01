"""Accenture — on-prem app recreated on GCP.

Accenture became a Google Cloud partner and needed its on-prem apps rebuilt on
GCP. Recreated four applications — three Hadoop / Spark-Scala / Hive pipelines
scheduled by Oozie, plus one with an ML layer (kept deliberately vague) — as a
new event-driven GCP architecture: files land in Cloud Storage, Pub/Sub fires,
Cloud Composer orchestrates PySpark on Dataproc and BigQuery.

Two SEPARATE architectures (not a 1:1 migration mapping): the old stack on top,
the new GCP stack on the bottom, each internally connected, no links between.
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
        "on-prem apps rebuilt on GCP. Recreated four applications — three "
        "Hadoop / Spark-Scala / Hive pipelines scheduled by Oozie, plus one with "
        "an ML layer — as a new event-driven GCP architecture: files land in "
        "Cloud Storage, Pub/Sub fires, and Cloud Composer orchestrates PySpark "
        "on Dataproc and BigQuery. Terabytes of data, native on GCP."
    ),
    nodes=[
        # --- old architecture (top band) ---
        Node("oozie", "Oozie", "source", 0.24, 0.08, "scheduler", color=LEGACY),
        Node("hdfs", "Hadoop", "source", 0.10, 0.28, "HDFS storage", color=LEGACY),
        Node("spark", "Spark", "source", 0.38, 0.28, "Scala", color=LEGACY),
        Node("hive", "Hive", "source", 0.66, 0.28, "tables", color=LEGACY),
        # --- new GCP architecture (bottom band) ---
        Node("storage", "Cloud Storage", "core", 0.10, 0.70, "files land"),
        Node("pubsub", "Pub/Sub", "core", 0.34, 0.70, "on file landing"),
        Node("composer", "Cloud Composer", "core", 0.56, 0.70, "Airflow"),
        Node("dataproc", "PySpark", "core", 0.80, 0.58, "Dataproc"),
        Node("bq", "BigQuery", "core", 0.80, 0.83, "warehouse"),
    ],
    flows=[
        # old (muted, internal)
        Flow("f_read", "hdfs", "spark", color=LEGACY),
        Flow("f_write", "spark", "hive", color=LEGACY),
        Flow("f_sched", "oozie", "spark", color=LEGACY),
        # new (glowing, internal)
        Flow("f_land", "storage", "pubsub", glow=True),
        Flow("f_call", "pubsub", "composer", glow=True),
        Flow("f_dataproc", "composer", "dataproc", glow=True),
        Flow("f_bq", "composer", "bq", glow=True),
    ],
    beats=[
        Beat(
            "The old architecture",
            "On-prem: Hadoop / HDFS storage and Spark in Scala writing Hive "
            "tables, all scheduled by Oozie — the shape of all four applications.",
            nodes=["oozie", "hdfs", "spark", "hive"],
            flows=["f_read", "f_write", "f_sched"],
        ),
        Beat(
            "Rebuilt on GCP: files land, Pub/Sub fires",
            "We recreated it natively on GCP. Files now land in Cloud Storage, "
            "and Pub/Sub fires the instant they do — no more waiting on a schedule.",
            nodes=["storage", "pubsub"],
            flows=["f_land"],
        ),
        Beat(
            "Composer orchestrates",
            "Pub/Sub calls Cloud Composer (Airflow), which orchestrates the whole "
            "run end to end.",
            nodes=["composer"],
            flows=["f_call"],
        ),
        Beat(
            "PySpark on Dataproc → BigQuery",
            "Composer drives the Spark work — now PySpark on Dataproc — and lands "
            "everything in BigQuery. All four apps rebuilt, one with an ML layer, "
            "running native on GCP.",
            nodes=["dataproc", "bq"],
            flows=["f_dataproc", "f_bq"],
        ),
    ],
)
