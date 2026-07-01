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
        "Joined to build the data function from zero. Turned two operational "
        "systems into one clean warehouse every business team could self-serve, "
        "then layered data science on top of the same model."
    ),
    nodes=[
        # sources (left)
        Node("odoo", "Odoo", "source", 0.06, 0.30, "ERP"),
        Node("shopify", "Shopify", "source", 0.06, 0.66, "web store"),
        # core pipeline (middle)
        Node("aws", "AWS ingest", "core", 0.30, 0.48, "raw landing"),
        Node("transform", "Transform", "core", 0.50, 0.48, "SQL · pandas · Spark"),
        Node("warehouse", "Warehouse", "core", 0.70, 0.48, "facts + dimensions"),
        # sinks (right)
        Node("dashboards", "Team dashboards", "sink", 0.93, 0.20, "sales · marketing · shops · PR"),
        # science (right)
        Node("segments", "Segmentation", "science", 0.93, 0.56, "customer clustering"),
        Node("forecast", "Forecasting", "science", 0.93, 0.82, "sales forecast"),
    ],
    flows=[
        Flow("f_odoo", "odoo", "aws"),
        Flow("f_shopify", "shopify", "aws"),
        Flow("f_ingest", "aws", "transform"),
        Flow("f_model", "transform", "warehouse"),
        Flow("f_dash", "warehouse", "dashboards", "auto-refresh", glow=True),
        Flow("f_segments", "warehouse", "segments"),
        Flow("f_forecast", "warehouse", "forecast"),
    ],
    beats=[
        Beat(
            "Two systems, zero visibility",
            "Sales, marketing, shop managers and PR each had questions the data "
            "could answer — but everything lived locked inside Odoo and Shopify.",
            nodes=["odoo", "shopify"],
        ),
        Beat(
            "Land the raw data",
            "First move: pull both systems into AWS as a raw landing zone — one "
            "place where all the operational data arrives.",
            nodes=["aws"],
            flows=["f_odoo", "f_shopify"],
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
            "Then, the science",
            "On the same clean model: customer clustering / segmentation and sales "
            "forecasting — analytics the business could actually act on.",
            nodes=["segments", "forecast"],
            flows=["f_segments", "f_forecast"],
        ),
    ],
)
