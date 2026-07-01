"""Accenture — on-prem app recreated on GCP.

Recreated four on-prem applications on GCP as an event-driven architecture.
Old: Hadoop / HDFS + Spark (Scala) + Hive, scheduled by Oozie.
New: files land in Cloud Storage -> Pub/Sub fires -> Cloud Composer (Airflow)
runs a DAG that branches into "Run Dataproc" (PySpark, which writes to BigQuery)
and "Monitor Job". One of the four apps also had an ML layer (kept vague).

Two SEPARATE architectures (no links between): old stack on top, new GCP DAG on
the bottom.
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
        "an ML layer — as an event-driven GCP architecture: files land in Cloud "
        "Storage, Pub/Sub fires, and a Cloud Composer (Airflow) DAG runs the "
        "PySpark job on Dataproc while monitoring it, writing out to BigQuery."
    ),
    nodes=[
        # --- old architecture (top band) ---
        Node("oozie", "Oozie", "source", 0.24, 0.08, "scheduler", color=LEGACY),
        Node("hdfs", "Hadoop", "source", 0.10, 0.28, "HDFS storage", color=LEGACY),
        Node("spark", "Spark", "source", 0.38, 0.28, "Scala", color=LEGACY),
        Node("hive", "Hive", "source", 0.66, 0.28, "tables", color=LEGACY),
        # --- new GCP architecture (bottom band) ---
        Node("storage", "Cloud Storage", "core", 0.05, 0.71, "files land"),
        Node("pubsub", "Pub/Sub", "core", 0.25, 0.71, "on file landing"),
        Node("composer", "Cloud Composer", "core", 0.45, 0.71, "Airflow DAG"),
        Node("dataproc", "Run Dataproc", "core", 0.65, 0.59, "PySpark · Dataproc"),
        Node("monitor", "Monitor Job", "core", 0.65, 0.83, "watch the run"),
        Node("bq", "BigQuery", "core", 0.85, 0.59, "write results"),
    ],
    flows=[
        # old (muted, internal)
        Flow("f_read", "hdfs", "spark", color=LEGACY),
        Flow("f_write", "spark", "hive", color=LEGACY),
        Flow("f_sched", "oozie", "spark", color=LEGACY),
        # new (glowing, internal)
        Flow("f_land", "storage", "pubsub", glow=True),
        Flow("f_call", "pubsub", "composer", glow=True),
        Flow("f_run", "composer", "dataproc", "run", glow=True),
        Flow("f_monitor", "composer", "monitor", "monitor", glow=True),
        Flow("f_bq", "dataproc", "bq", "write", glow=True),
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
            "We recreated it natively on GCP. Files land in Cloud Storage, and "
            "Pub/Sub fires the instant they do — no waiting on a schedule.",
            nodes=["storage", "pubsub"],
            flows=["f_land"],
        ),
        Beat(
            "Pub/Sub calls Cloud Composer",
            "Pub/Sub kicks off a Cloud Composer (Airflow) DAG — the orchestrator "
            "for the whole run.",
            nodes=["composer"],
            flows=["f_call"],
        ),
        Beat(
            "The DAG: run + monitor",
            "The DAG branches into two tasks in parallel: launch the PySpark job "
            "on Dataproc, and monitor it end to end.",
            nodes=["dataproc", "monitor"],
            flows=["f_run", "f_monitor"],
        ),
        Beat(
            "Write to BigQuery",
            "The Dataproc job writes its results to BigQuery. Four apps rebuilt — "
            "one with an ML layer — running native on GCP.",
            nodes=["bq"],
            flows=["f_bq"],
        ),
    ],
)
