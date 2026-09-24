# v2 — Adaptive Coach

The v2 version of the tracker gives the coach real authority — the ability to modify the programme, not just talk about it. This document is the scope Michael landed on before starting the v2 build. Priority order matters; resist adding a fifth item until 1–4 are shipped.

## Principle: mid-block changes are constrained, not free

The value of a block is that it's run consistently enough to produce clean signal for the next one. v2 must enable helpful in-session flexibility (equipment taken, one lift feels off, time-crunched) without letting the programme drift into "whatever felt right this week."

**Three-tier rule for changes:**

- **In-session swaps** (equipment taken, feeling off): coach handles. Constraint: same muscle group, similar rep range. Cable row taken → dumbbell row ✅. Cable row taken → bicep curls ❌.
- **Weight adjustments:** double-progression rule automated. One-off deload of a lift because it felt heavy is fine as an exception, dangerous as a habit — log it as an exception, not a new baseline.
- **Programme changes** (dropping an exercise entirely, changing rep ranges, restructuring sessions): wait for the block boundary. Non-negotiable.

## Feature 1 — Coach-executed in-session swaps

**Trigger:** user opens an exercise mid-session, says "cable row machine is taken" (or "shoulder feels off today", etc.) either through a swap button on the exercise card or via the coach.

**Flow:**
1. Coach proposes 2–3 alternatives that hit the same muscle group at a similar rep range
2. User picks one (or dismisses)
3. Selected exercise replaces the original in today's session, with a swap-reason logged
4. Original planned exercise remains in the plan for future weeks — this swap is per-session, not persistent

**Constraint enforcement:** the coach's proposals must pass validation before being offered. Same primary muscle group, rep range within ±2 of original. If nothing valid, coach says so rather than proposing a bad swap.

## Feature 2 — Automated progression prompts

**Trigger:** user opens a session for the first time in a given week.

**Flow:**
1. Coach reads last week's log for each exercise
2. For any exercise where all sets hit the top of the rep range, coach proactively suggests the weight increment (+2.5kg upper, +5kg lower)
3. Suggestion appears as a one-tap "accept +2.5kg" on the exercise card
4. Accepted increments write into today's plan as the working weight

**Not automated:** deloading a lift because last week felt hard. That's a judgment call the user makes with the coach in conversation, and it logs as an exception.

## Feature 3 — Planned vs actual in the data model

**Current state:** the log records what was done. The plan is a static constant in code.

**v2 state:** each session has both a `planned` object (what the block prescribed for this week) and an `actual` object (what was logged). Swaps and progression writes update the planned object *for this session only* — the next week reverts to the block plan unless a persistent change happens at the block boundary.

**Why it matters:** at review time, the coach can see "you did dumbbell row 12 times when the plan was cable row, because the cable was taken 8 of those" — a much better input to Block 2 than just seeing what was logged.

**UI implication:** exercise cards should show the plan clearly, with any swap or progression change flagged (small "swapped from cable row" tag under the exercise name).

## Feature 4 — End-of-block review flow

**Trigger:** on the last day of a block (Week 4, Session D or equivalent), the coach becomes available in "review mode."

**Flow:**
1. Coach reads the full block: all sessions, all logs, all swaps, all exceptions, all session-feel notes
2. Coach produces a Block N+1 draft — what to keep, what to change, what to drop, what to add
3. User reviews with the coach in conversation, iterates
4. When accepted, the draft becomes the new block

**Not autonomous:** the coach drafts, the user (with input from a chat like this one) confirms. The coach doesn't get to unilaterally rewrite the programme.

## Open question — authority level

**The choice:** every write from the coach either requires user confirmation (safer, more friction) or executes and can be undone (faster, occasional cleanup).

Michael's initial lean: probably confirmation for swaps and progression, undo for one-tap accepts. But this shapes the whole UI and should be decided before building, not during.

## Out of scope for v2

- Charts, progress graphs (nice to have; Block 3 territory)
- Cloud backup (export/import is fine for now)
- Multi-user or sharing
- Automatic exercise library expansion (v2 works from a fixed pool of alternatives per muscle group; adding new exercises is a manual code change)
- Anything that lets the coach change the programme structure mid-block

## Development approach

- Work on a `v2-adaptive-coach` branch — v1 stays running in production
- Iterate through the four features in priority order — ship 1 before starting 2
- Each feature: local test → PR → review → merge → deploy → try in a real gym session before starting the next one
- Real-use feedback between features is the whole point of the sequence

## Handover state

At the moment the v2 project starts:
- Block 1 is complete
- `block1-results.json` is exported from the phone app and saved in the repo
- Block 2 has been built from the review with a Claude chat, incorporating Block 1 feedback (heavier presses, warm-ups added, 3-session rule baked in, winter cardio session added)
- v2 development starts on the branch; Block 2 runs on v1 in the meantime
