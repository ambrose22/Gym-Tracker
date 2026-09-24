# Gym Tracker — Project Brief

## What this is

A personal-use PWA that replaces a personal trainer's programming and logging for hypertrophy training. Built by Michael (talent acquisition lead, technical enough to work with AI but not a software developer) as a side project. Live and in daily use — Block 1 runs Sept–Oct 2026, currently in the deload week.

## Origin

Michael trained with a PT for 18 months, mostly heavy low-rep strength work. Moved off the PT to self-programme in September 2026, preferring 8–12 reps at ~75% intensity for hypertrophy and enjoyment ("feel good, look good" goal). Originally logged in an Excel spreadsheet, then built two artifact versions (one preferred, kept), then deployed as a real PWA on Vercel so it could be installed on the phone as a proper app.

## Architecture

- **Frontend:** Vite + React, single-page app, deployed on Vercel
- **PWA layer:** vite-plugin-pwa, service worker for offline, installable on Android home screen
- **Storage:** localStorage (with export/import to JSON for backup)
- **Coach:** Claude Sonnet via a Vercel serverless function at `/api/coach`, gated by an APP_KEY shared secret. The system prompt gives the coach full read access to the programme and every logged set.
- **Repo:** github.com/ambrose22/Gym-Tracker

## What Block 1 (v1) looks like

Four upper-focused sessions per week with leg work distributed (no skippable leg day), swim at the weekend, cycling commute counted as leg + cardio volume. Two long sessions (45–60 min) and two short (30 min, supersets). Rules: 2 reps in reserve on every set, double progression (top of range on all sets → +2.5kg upper / +5kg lower), no AMRAP, no grinders (trains without a spotter). Week 4 is deload — same weights, one set fewer.

Session structure and starting weights are calibrated from Michael's PT history (18 months in a spreadsheet) plus first-session feedback.

## Block 1 feedback (input for Block 2)

Collected across weeks 1–4:

- **Rep-range preference on presses:** wants 5–8 reps at higher weight on Incline DB Press and Shoulder Press specifically (enjoys the "pushing it out" feel). Applied to those two lifts, not bench (bench stays 8–10 in the rack for safety without a spotter).
- **Schedule reality:** 4x/week is aspirational; 3x/week happens. Rule: drop Session D first. A and B are non-negotiable.
- **Warm-up gap:** Block 1 was missing warm-up guidance entirely. Block 2 needs 5-min session warm-up (bike/rower + dynamic mobility) plus 2 warm-up sets on the first main compound lift of each session.
- **Cardio:** cycling commute + occasional 30-min walks are enough in summer. Winter (Dec+) needs a replacement — 1× stationary bike session, 30–45 min, heart-rate-zone based (Power Zone style, Zone 3 amber sustained). Not a rower — bad rowing PTSD from school.
- **Ab work:** 2x per week is enough. Hanging knee raise (Session A), cable crunch (Session C). Progression via tempo before reps.
- **Actual Block 1 data:** exported JSON from the app at end of Week 4, saved as `block1-results.json` in the repo.

## Review cadence (this is the meta-process)

- **Daily:** log in the app, one line in the session note
- **Weekly:** two lines in the session-feel textbox — energy, niggles, what was skipped and why
- **Every 4 weeks (block boundary):** upload the exported JSON to Claude, review against feedback, build the next block
- **Quarterly (every 3 blocks):** revisit whether "feel good, look good" is still the goal — that's the only thing that changes the programme's architecture rather than its weights

**No mid-block programme changes.** Weights adjust via the progression rule (this is running the programme, not changing it). Exercise selection, session structure, rep ranges are locked until deload. The one exception is genuine injury or persistent pain — swap immediately, that's a safety call.

## Why v2 exists

The current coach can talk about the programme but can't touch it. Every suggestion requires the user to remember it and manually enter it. v2 bridges that gap — the coach becomes a real programming assistant, not a chatbot.

## v2 scope (in priority order)

See V2_SPEC.md for detail. Summary:

1. Coach can propose and execute in-session exercise swaps (equipment taken, feeling off) with same-muscle-group / similar-rep-range constraint
2. Coach automates the double-progression call — proactive "add 2.5kg to bench today" when opening a session
3. Data model separates *planned* from *actual* so divergence is visible at review time
4. End-of-block review flow: coach reads the divergence log and drafts the next block

## Working preferences

- Michael is a thinking partner, not an executor — walk through decisions and trade-offs, then let him act. Don't take actions without checking first.
- Direct and concise. Skip preamble.
- When reviewing code, explain what changed in plain language, flag security or architectural concerns as blockers, draft review comments to post.
- Don't edit code files directly — give Michael a prompt to paste into Claude Code (in VS Code).
- Works through GitHub PRs — expect git workflow guidance, code review, testing.
- Technical but not a software developer by background. Explains-what-it-does documentation over jargon.

## Repo state at handover

- On `main`: deployed Block 1 tracker, coach proxy working, PWA installed on phone
- Deployed at Vercel — URL known to Michael
- Environment variables set: `ANTHROPIC_API_KEY`, `APP_KEY`
- Personal Anthropic account (separated from work account) owns the API key
- `block1-tracker.jsx` in the repo root is the original artifact source, kept for reference
- v2 development should happen on a `v2-adaptive-coach` branch, not fresh — keep the working v1 alive in parallel
