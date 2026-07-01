"""Making Science — high-load ad bid-optimization pipeline.

~1.4 TB/day of ad data (~1000 same-structure files, keyed by bid_id) lands in a
GCS bucket. A watcher fans out ~1000 Cloud Functions in parallel (processing
until they hit the function time limit, then spawning the next wave) into
BigQuery. In BigQuery the data is crossed and transformed against the business
team's Excel threshold mappings; a smaller curated cut drops into a datamart for
the analysts, and the optimized bids go straight from BigQuery back onto the ad
platforms — cutting spend from high-CPC / low-ROI ads and pushing it to winners.
"""

from resume.scene import Scene, Node, Flow, Beat

scene = Scene(
    id="making_science",
    title="Making Science",
    role="Data Engineer",
    period="Mar 2021 – Jul 2021",
    summary=(
        "Built the pipeline for a very high-load ad-optimization system: ~1.4 TB "
        "of ad data a day fanned out across ~1000 Cloud Functions into BigQuery, "
        "crossed against the business team's threshold mappings, then written "
        "straight back to the ad platforms as optimized bids."
    ),
    nodes=[
        # inputs (left)
        Node("gcs", "Ad data bucket", "source", 0.06, 0.28, "~1000 files/day · 1.4 TB", color="#8ecbff"),
        Node("mappings", "Bid mappings", "source", 0.06, 0.72, "thresholds (Excel)"),
        # pipeline (middle) — BigQuery is the hub
        Node("functions", "Cloud Functions", "core", 0.34, 0.28, "GCS-triggered · ~1000 parallel"),
        Node("bq", "BigQuery", "core", 0.60, 0.48, "cross + transform w/ mappings"),
        # outputs (right)
        Node("datamart", "Datamart", "science", 0.92, 0.25, "smaller cut · for analysts"),
        Node("ads", "Ad platforms", "sink", 0.92, 0.70, "optimized bids placed", color="#8ecbff"),
    ],
    flows=[
        Flow("f_load", "gcs", "functions", color="#8ecbff"),
        Flow("f_ingest", "functions", "bq"),
        Flow("f_map", "mappings", "bq"),
        Flow("f_mart", "bq", "datamart"),
        Flow("f_place", "bq", "ads", "optimized bids", glow=True),
    ],
    beats=[
        Beat(
            "1.4 TB, every day",
            "Every day the project dropped ~1000 files of ad data into a GCS "
            "bucket — same structure, keyed by bid_id, about 1.4 TB per load.",
            nodes=["gcs"],
        ),
        Beat(
            "The business playbook",
            "The marketing team's rules lived in Excel mappings: thresholds that "
            "said, as an ad's return moved up or down, how much to raise or cut "
            "its spend.",
            nodes=["mappings"],
        ),
        Beat(
            "Watch, then fan out to ~1000 functions",
            "A watcher on the bucket fired the instant files landed, fanning out "
            "~1000 Cloud Functions in parallel. They processed until they hit the "
            "function time limit, then spawned the next 1000 — chewing through the "
            "whole load in waves, straight into BigQuery.",
            nodes=["functions"],
            flows=["f_load"],
        ),
        Beat(
            "Cross it in BigQuery",
            "In BigQuery the ad data is crossed and transformed against the "
            "mappings — every bid scored against the business thresholds to decide "
            "where spend should move.",
            nodes=["bq"],
            flows=["f_ingest", "f_map"],
        ),
        Beat(
            "A cut for the analysts",
            "A smaller, curated version drops into a datamart — the layer the "
            "analysts dig into for their own models.",
            nodes=["datamart"],
            flows=["f_mart"],
        ),
        Beat(
            "Bids back to the platforms",
            "And the optimized bids go straight from BigQuery back onto the ad "
            "platforms — spend gutted from high-CPC, low-ROI ads and pushed toward "
            "the winners. A closed loop, 1.4 TB a day.",
            nodes=["ads"],
            flows=["f_place"],
        ),
    ],
)
