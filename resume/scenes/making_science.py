"""Making Science — high-load ad bid-optimization pipeline.

Built the pipeline for a very high-load project: ~1.4 TB/day of ad data (~1000
same-structure files, keyed by bid_id) landing in a GCS bucket. A watcher fanned
out ~1000 Cloud Functions in parallel (processing until they hit the function
time limit, then spawning the next wave) into BigQuery, then a curated datamart.
A bid algorithm read the datamart against the business team's Excel threshold
mappings and set each ad's next bid — cutting spend from high-CPC / low-ROI ads
and pushing it toward winners — placing the optimized bids back on the platforms.
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
        "feeding a bid algorithm that reallocated spend from losing ads to winners."
    ),
    nodes=[
        # inputs (left)
        Node("gcs", "Ad data bucket", "source", 0.06, 0.28, "~1000 files/day · 1.4 TB", color="#8ecbff"),
        Node("mappings", "Bid mappings", "source", 0.06, 0.74, "thresholds (Excel)"),
        # pipeline (middle)
        Node("functions", "Cloud Functions", "core", 0.30, 0.28, "GCS-triggered · ~1000 parallel"),
        Node("bq", "BigQuery", "core", 0.50, 0.28, "ingested"),
        Node("datamart", "Datamart", "core", 0.70, 0.28, "curated layer"),
        # decision + output (right)
        Node("bidder", "Bid algorithm", "science", 0.82, 0.72, "picks bid prices"),
        Node("ads", "Ad platforms", "sink", 0.95, 0.48, "optimized bids placed", color="#8ecbff"),
    ],
    flows=[
        Flow("f_load", "gcs", "functions", color="#8ecbff"),
        Flow("f_ingest", "functions", "bq"),
        Flow("f_curate", "bq", "datamart"),
        Flow("f_pick", "datamart", "bidder"),
        Flow("f_map", "mappings", "bidder"),
        Flow("f_place", "bidder", "ads", "optimized bids", glow=True),
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
            "whole load in waves.",
            nodes=["functions"],
            flows=["f_load"],
        ),
        Beat(
            "Into BigQuery, then a datamart",
            "Processed records streamed into BigQuery — where analysts built their "
            "own models on top — and settled into a curated datamart, the clean "
            "source of truth for bidding.",
            nodes=["bq", "datamart"],
            flows=["f_ingest", "f_curate"],
        ),
        Beat(
            "The bid algorithm",
            "A pricing algorithm read the datamart against the business "
            "thresholds and set each ad's next bid: gut budget from high-CPC, "
            "low-ROI ads, push it toward the winners.",
            nodes=["bidder"],
            flows=["f_pick", "f_map"],
        ),
        Beat(
            "Place the bids, optimize the spend",
            "Every optimized bid went straight back onto its ad platform — a "
            "closed cost-optimization loop running over 1.4 TB a day for the whole "
            "marketing operation.",
            nodes=["ads"],
            flows=["f_place"],
        ),
    ],
)
