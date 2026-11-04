# Order Flow

Replace only the Agents in GCP arcade game. Preserve the other six cabinets and the shared dark arcade shell. This is an original toy-like, turn-based board: U-shaped order belt, limited agent bay and blocked agent yard. No map, streets, districts, route animation, timers or live simulation. No identity redesign.

The user supplied the exact layout and mechanics. Every tap is a complete deterministic turn, with unlimited Undo. Six authored levels teach front-of-queue ordering, dependencies, concurrency and scaling. A BFS solver verifies solvability and minimum move targets. Plain labels and skill letters supplement colors. Minimum label size 14px; native keyboard buttons; reduced-motion skips transitions. Sound starts off.

Current scope: user play-testing found the first two puzzles too easy and requested their removal as the first improvement. Start with the original blocked-bot puzzle, renumber the six remaining levels and preserve their mechanics. Verify the solver, campaign progression, Inventory legend and final-screen restart. The broader UI revision remains separate from this trim.

Original verification, 4 November 2026: all eight original levels played through browser controls; original level 4 deliberately lost and recovered with Undo. Captures covered desktop start/loss/win and the final mobile board/win at 390×700. That browser run had no console errors. All 147 tests and TypeScript checks passed. One source detector pass returned no regex findings (parsed-page rules unavailable). The original finish review and documentation check preceded the user's subsequent visual feedback. No global identity or system files were introduced. After removing the tutorials, the six BFS minimum targets are 3, 5, 5, 5, 4, 10.
