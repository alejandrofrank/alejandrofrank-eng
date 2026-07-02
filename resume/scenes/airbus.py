"""Airbus (via CortexLabs) — AWS pipelines feeding a chip-failure model.

From the CV: built AWS pipelines feeding a chip-failure prediction model,
enabling in-house scientists to run failure analysis. DRAFT — thin.
"""

from resume.scene import Scene, Node, Flow, Beat

scene = Scene(
    id="airbus",
    title="Airbus",
    role="Data Engineer",
    period="Nov 2023 – Jan 2024",
    summary=(
        "Built the AWS data pipelines feeding a chip-failure prediction model, "
        "putting reliable failure analysis in the hands of Airbus's in-house "
        "scientists."
    ),
    nodes=[
        Node("chips", "Chip test data", "source", 0.08, 0.5, "sensor / failure logs"),
        Node("pipelines", "AWS pipelines", "core", 0.37, 0.5, "ingest + prep"),
        Node("model", "Failure prediction", "science", 0.65, 0.5, "ML model"),
        Node("scientists", "Scientists", "sink", 0.92, 0.5, "run failure analysis"),
    ],
    flows=[
        Flow("f_ingest", "chips", "pipelines"),
        Flow("f_feed", "pipelines", "model", glow=True),
        Flow("f_use", "model", "scientists", glow=True),
    ],
    beats=[
        Beat(
            "Why do chips fail?",
            "Airbus needed to predict chip failures from mountains of test and "
            "sensor data.",
            nodes=["chips"],
        ),
        Beat(
            "AWS pipelines",
            "Built the pipelines on AWS to ingest and prepare that data reliably.",
            nodes=["pipelines"],
            flows=["f_ingest"],
        ),
        Beat(
            "Feed the model",
            "The clean data fed a failure-prediction model.",
            nodes=["model"],
            flows=["f_feed"],
        ),
        Beat(
            "Scientists in control",
            "Which put failure analysis directly in the hands of Airbus's "
            "in-house scientists.",
            nodes=["scientists"],
            flows=["f_use"],
        ),
    ],
)
