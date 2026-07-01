"""Making Science — short, sharp GCP engagement.

From the CV: developed cost-effective data pipelines on Google Cloud that cut a
client's ad spend by 30%. DRAFT — refine keynote-style with real specifics.
"""

from resume.scene import Scene, Node, Flow, Beat

scene = Scene(
    id="making_science",
    title="Making Science",
    role="Data Engineer",
    period="Mar 2021 – Jul 2021",
    summary=(
        "A short, sharp engagement: cost-efficient data pipelines on Google "
        "Cloud that unified a client's ad channels and cut their ad spend by 30%."
    ),
    nodes=[
        # ad channels (left) — light blue like the marketing convention
        Node("google_ads", "Google Ads", "source", 0.06, 0.22, "spend", color="#8ecbff"),
        Node("meta_ads", "Meta Ads", "source", 0.06, 0.50, "spend", color="#8ecbff"),
        Node("analytics", "Analytics", "source", 0.06, 0.78, "GA / measurement", color="#8ecbff"),
        # pipelines on GCP (middle)
        Node("gcp", "GCP ingest", "core", 0.34, 0.50, "cost-efficient pipelines"),
        Node("bq", "BigQuery", "core", 0.58, 0.50, "unified model"),
        # analysis + payoff (right)
        Node("optimize", "Spend optimization", "science", 0.87, 0.30, "find the waste"),
        Node("report", "Client reporting", "sink", 0.87, 0.72, "−30% ad spend"),
    ],
    flows=[
        Flow("f_gads", "google_ads", "gcp", color="#8ecbff"),
        Flow("f_mads", "meta_ads", "gcp", color="#8ecbff"),
        Flow("f_ga", "analytics", "gcp", color="#8ecbff"),
        Flow("f_bq", "gcp", "bq"),
        Flow("f_opt", "bq", "optimize"),
        Flow("f_report", "optimize", "report", "−30%", glow=True),
    ],
    beats=[
        Beat(
            "Spend across every channel",
            "The client was spending across Google, Meta and more — with no "
            "unified view of what each euro was actually buying.",
            nodes=["google_ads", "meta_ads", "analytics"],
        ),
        Beat(
            "Pipelines on GCP",
            "Cost-efficient data pipelines on Google Cloud pulled every channel "
            "into one BigQuery model — one place to see all spend and performance.",
            nodes=["gcp", "bq"],
            flows=["f_gads", "f_mads", "f_ga", "f_bq"],
        ),
        Beat(
            "Find the waste",
            "Analysis on top of the unified model surfaced exactly where budget "
            "was being burned for little to no return.",
            nodes=["optimize"],
            flows=["f_opt"],
        ),
        Beat(
            "−30% ad spend",
            "The payoff: a 30% cut in ad spend, with the savings and the reasoning "
            "handed straight back to the client.",
            nodes=["report"],
            flows=["f_report"],
        ),
    ],
)
