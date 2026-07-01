"""Novartis (via CortexLabs) — RAG retrieval for an internal GPT tool.

From the CV: enhanced an internal GPT-based tool by building efficient embedding
and vector databases to power retrieval. DRAFT — thin, needs specifics.
"""

from resume.scene import Scene, Node, Flow, Beat

scene = Scene(
    id="novartis",
    title="Novartis",
    role="AI Engineer · via CortexLabs",
    period="2023",
    summary=(
        "Made Novartis's internal GPT tool actually useful: built an efficient "
        "embedding pipeline and vector database so it could retrieve and answer "
        "from the company's own content instead of guessing."
    ),
    nodes=[
        Node("docs", "Internal content", "source", 0.08, 0.5, "documents"),
        Node("embed", "Embeddings", "core", 0.37, 0.5, "vectorize"),
        Node("vectordb", "Vector DB", "core", 0.64, 0.5, "fast retrieval"),
        Node("gpt", "GPT tool", "science", 0.92, 0.5, "internal assistant"),
    ],
    flows=[
        Flow("f_embed", "docs", "embed"),
        Flow("f_store", "embed", "vectordb"),
        Flow("f_retrieve", "vectordb", "gpt", glow=True),
    ],
    beats=[
        Beat(
            "A GPT tool with no grounding",
            "Novartis had an internal GPT tool that needed to answer from a large "
            "body of internal content — but couldn't reach it.",
            nodes=["docs"],
        ),
        Beat(
            "Embed everything",
            "Built an efficient embedding pipeline to turn that content into "
            "vectors.",
            nodes=["embed"],
            flows=["f_embed"],
        ),
        Beat(
            "Vector retrieval",
            "Stored them in a vector database tuned for fast, relevant retrieval.",
            nodes=["vectordb"],
            flows=["f_store"],
        ),
        Beat(
            "Grounded answers",
            "Now the GPT tool pulls the right context and answers grounded in "
            "real internal data.",
            nodes=["gpt"],
            flows=["f_retrieve"],
        ),
    ],
)
