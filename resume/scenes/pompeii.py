"""Pompeii — built the data function from zero.

Every business team (sales, marketing, shop managers, PR) got a dashboard where
their KPIs were visible without understanding the data underneath. Odoo (ERP) +
Shopify (web) landed in AWS, a SQL/pandas/Spark pipeline reshaped them into a
normalized fact+dimension warehouse for non-technical users, dashboards
auto-refreshed the moment it finished, and segmentation + forecasting were
layered on the same clean model.
"""

from resume.scene import Scene, Node, Flow, Beat

scene = Scene(
    id="pompeii",
    title="Pompeii",
    role="Data Engineer / Data Analyst",
    period="May 2019 – Mar 2021",
    summary=(
        "Joined to build the data function from zero. Turned a sprawl of "
        "operational and marketing systems into one clean warehouse every "
        "business team could self-serve, then layered activation and data "
        "science on top of the same model."
    ),
    nodes=[
        # sources — operational (left, top)
        Node("odoo", "Odoo", "source", 0.06, 0.10, "ERP"),
        Node("shopify", "Shopify", "source", 0.06, 0.30, "web store"),
        # sources — marketing / social (left, bottom) — light blue
        Node("instagram", "Instagram", "source", 0.06, 0.50, "social", color="#8ecbff"),
        Node("tiktok", "TikTok", "source", 0.06, 0.70, "social", color="#8ecbff"),
        Node("ads", "Ad platforms", "source", 0.06, 0.90, "Google · Meta · +", color="#8ecbff"),
        # core pipeline (middle)
        Node("aws", "AWS ingest", "core", 0.30, 0.50, "raw landing"),
        Node("transform", "Transform", "core", 0.50, 0.50, "SQL · pandas · Spark"),
        Node("warehouse", "Warehouse", "core", 0.70, 0.50, "facts + dimensions"),
        # sinks (right)
        Node("dashboards", "Team dashboards", "sink", 0.93, 0.14, "sales · marketing · shops · PR"),
        Node("email", "Email marketing", "sink", 0.93, 0.38, "segmented campaigns"),
        # science (right)
        Node("segments", "Segmentation", "science", 0.93, 0.62, "customer clustering"),
        Node("forecast", "Forecasting", "science", 0.93, 0.86, "sales forecast"),
    ],
    flows=[
        Flow("f_odoo", "odoo", "aws"),
        Flow("f_shopify", "shopify", "aws"),
        Flow("f_instagram", "instagram", "aws", color="#8ecbff"),
        Flow("f_tiktok", "tiktok", "aws", color="#8ecbff"),
        Flow("f_ads", "ads", "aws", color="#8ecbff"),
        Flow("f_ingest", "aws", "transform"),
        Flow("f_model", "transform", "warehouse"),
        Flow("f_dash", "warehouse", "dashboards", "auto-refresh", glow=True),
        Flow("f_email", "warehouse", "email"),
        Flow("f_segments", "warehouse", "segments"),
        Flow("f_forecast", "warehouse", "forecast"),
    ],
    beats=[
        Beat(
            "Operational systems",
            "Sales and the web store ran on two operational systems — Odoo and "
            "Shopify — each holding numbers the business couldn't easily see.",
            nodes=["odoo", "shopify"],
        ),
        Beat(
            "Every marketing channel",
            "On top of that, the brand lived across Instagram, TikTok and a stack "
            "of ad platforms — each with its own dashboard and its own truth.",
            nodes=["instagram", "tiktok", "ads"],
        ),
        Beat(
            "Ingest in parallel",
            "The key move: every source — operational and marketing — pulled in "
            "concurrently, each on its own connector, all landing at once in AWS. "
            "No single feed could bottleneck the rest.",
            nodes=["aws"],
            flows=["f_odoo", "f_shopify", "f_instagram", "f_tiktok", "f_ads"],
        ),
        Beat(
            "One clean model",
            "A pipeline in SQL, pandas and Spark reshaped the mess into a "
            "normalized fact + dimension warehouse — designed for non-technical users.",
            nodes=["transform", "warehouse"],
            flows=["f_ingest", "f_model"],
        ),
        Beat(
            "KPIs, no SQL required",
            "Every team got a dashboard of their own KPIs that auto-refreshed the "
            "moment the pipeline finished. No tickets, no waiting, no data knowledge needed.",
            nodes=["dashboards"],
            flows=["f_dash"],
        ),
        Beat(
            "Everything off one model",
            "The same clean model drove email-marketing campaigns, customer "
            "clustering / segmentation, and sales forecasting — activation and "
            "science the business could act on.",
            nodes=["email", "segments", "forecast"],
            flows=["f_email", "f_segments", "f_forecast"],
        ),
    ],
)
