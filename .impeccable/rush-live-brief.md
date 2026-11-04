# Rush Hour Dispatch: live map interaction

Mode: Experience, with a directly operated game board. This is an interaction and layout rebuild inside the existing arcade; the dark cabinet chrome remains the incumbent system. The light Madrid map, five coordination lessons, synthetic-data footer, real-agent links and other six games are preserved.

The visitor routes every order while the 50-second shift runs. Tap a pin and a lane (or drag), move bot tokens to rebalance capacity, stamp work claims, pin new facts and escalate a changed address. No settings form remains. Short deadlines and queue pressure make the first round a scheduling decision, not label matching. Tools persist into later shifts.

First viewport: fixed playback row and compact score, then a large map with queue lanes attached to its bottom. A narrow shared-notes board holds the two later tools. Dark chrome contains the warm map. At 1280×800 the map area occupies more than 65% of the board width; on phones the notes board becomes a compact lower dock. Labels and footnote are at least 14px. Results are a centered overlay in the map area, never a section below the fold.

Signature interaction: order timer rings drain while couriers move, a pin snaps into the chosen lane, and capacity can be moved during work. New facts become pinned notes that reroute current jobs. First failure pauses with a spotlight and Continue/Change rules; later failures flash without pausing. Change rules permits live repairs while paused, without discarding the current shift. Replay uses the same seed.

Motion: one requestAnimationFrame loop advances fixed model steps and moves persistent courier nodes. Geometry is cached by ResizeObserver. Actions update DOM synchronously; decorative arrivals, deltas, stamps and wasted-trip puffs are brief. Reduced motion suppresses interpolation and decorative CSS motion. Optional quiet generated sounds start off.

Verification: model and real-control tests, all five browser shifts, desktop and mobile map/result bounds, pin clusters and hit targets, failure spotlight and immediate counters, no console errors, measured handler/next-frame latency, and the existing games' regression suite. The user's rejection of the passive previous version is the main finish-review evidence.
