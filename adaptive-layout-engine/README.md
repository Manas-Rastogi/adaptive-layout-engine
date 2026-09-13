Architecture

The project is built as a pure TypeScript layout resolution engine that separates core coordinate calculations from UI rendering. It takes an abstract AdSpec and SurfaceProfile, processes them through a deterministic resolution pipeline, and outputs concrete coordinates, widths, heights, and font sizes consumed by AdRenderer.tsx for DOM placement[cite: 1].

Algorithm

Mode Detection: Analyzes surface aspect ratio and height constraints to categorize the canvas into wide, portrait, or balanced modes.
Sequence and Priority Control: Preserves the original element array sequence for wide surfaces (critical for broadcast lower-thirds to prevent arbitrary reordering) while sorting by priority for standard displays.
Iterative Downscaling: Evaluates elements through a scaling loop from 1.0 down to 0.4 to find the largest fitting size without boundary collisions.
Grid Wrapping: Enforces automatic multi-row wrapping with explicit row limits (MAX_ITEMS_PER_ROW) on balanced and kiosk surfaces to prevent horizontal cramping and ensure consistent spacing (GAP = 16 standard, WIDE_GAP = 32 wide).

Degradation Strategy

Graceful Hiding: If space runs out after exhausting scale steps, non-critical elements are marked as visible: false and pushed to warnings.
Hard Failures: High-priority elements (priority <= 2) trigger an explicit layout error (success: false) if they cannot fit within safe bounds.
Text Overflow Safeguards: Calculates a dynamic minimum width proportional to the font size (fontSize * 5) to guarantee that text strings never spill out of their bounding boxes during browser rendering.

TypeScript Design

Implements strict typing using explicit interfaces (AdSpec, SurfaceProfile, ResolvedElement, AdElement)[cite: 1].
Core layout computations are structured as pure, side-effect-free functions (getMode, getSize, generatePositions, tryPlace) ensuring clean component decoupling and predictable state rendering inside AdRenderer.tsx[cite: 1].

Limitations

Relies on heuristic grid-wrapping and discrete downscaling steps rather than an advanced continuous constraint-satisfaction solver (like Cassowary).
Assumes static element aspect ratios during the initial placement pass.

Time Spent

Approximately 5 hours, split between designing the core resolution math, fixing broadcast lower-third alignment bugs, resolving text clipping issues, and tuning multi-row grid wrapping for square kiosk screens.
