"""Declarative "scene" DSL — the source of truth for a job's keynote animation.

A Scene is a small graph of Nodes (systems) and Flows (data movement) plus a
timeline of Beats that reveal them step by step. `python -m resume.build`
compiles each Scene to JSON for the in-page SVG player to animate.
"""

from __future__ import annotations

from dataclasses import dataclass, field, asdict
from typing import List, Literal

# Where a node sits in the story. Drives colour + rough x placement.
#   source  = upstream systems (left)
#   core    = the pipeline / warehouse you built (middle)
#   sink     = things people consume (right)
#   science = ML / analytics layered on top (right)
Kind = Literal["source", "core", "sink", "science"]


@dataclass
class Node:
    id: str
    label: str
    kind: Kind
    x: float  # normalized 0..1, left→right
    y: float  # normalized 0..1, top→bottom
    sublabel: str = ""
    color: str = ""  # optional override of the kind's default colour


@dataclass
class Flow:
    id: str
    src: str  # Node.id
    dst: str  # Node.id
    label: str = ""
    glow: bool = False  # a highlighted "magic light" beam
    color: str = ""  # optional line colour (else neutral)


@dataclass
class Beat:
    """One step of the keynote: reveal these nodes, animate these flows."""

    title: str
    caption: str
    nodes: List[str] = field(default_factory=list)  # Node.ids revealed this beat
    flows: List[str] = field(default_factory=list)  # Flow.ids animated this beat


@dataclass
class Scene:
    id: str
    title: str
    role: str
    period: str
    summary: str
    nodes: List[Node]
    flows: List[Flow]
    beats: List[Beat]

    def validate(self) -> "Scene":
        """Fail loudly if any flow/beat points at a node/flow that doesn't exist."""
        node_ids = [n.id for n in self.nodes]
        node_set = set(node_ids)
        if len(node_set) != len(node_ids):
            raise ValueError(f"scene '{self.id}': duplicate node ids")

        flow_ids = [f.id for f in self.flows]
        flow_set = set(flow_ids)
        if len(flow_set) != len(flow_ids):
            raise ValueError(f"scene '{self.id}': duplicate flow ids")

        for f in self.flows:
            if f.src not in node_set:
                raise ValueError(f"scene '{self.id}': flow '{f.id}' src '{f.src}' is not a node")
            if f.dst not in node_set:
                raise ValueError(f"scene '{self.id}': flow '{f.id}' dst '{f.dst}' is not a node")

        for i, b in enumerate(self.beats):
            for nid in b.nodes:
                if nid not in node_set:
                    raise ValueError(f"scene '{self.id}': beat {i} references missing node '{nid}'")
            for fid in b.flows:
                if fid not in flow_set:
                    raise ValueError(f"scene '{self.id}': beat {i} references missing flow '{fid}'")

        return self

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "role": self.role,
            "period": self.period,
            "summary": self.summary,
            "nodes": [asdict(n) for n in self.nodes],
            "flows": [asdict(f) for f in self.flows],
            "beats": [asdict(b) for b in self.beats],
        }
