import React, { useState, useEffect, useRef, useCallback } from "react";
import storage from "./storage.js";

/* ------------------------------------------------------------------ */
/* PROGRAMME DATA — Hypertrophy Block 2 (4 weeks)                      */
/* ------------------------------------------------------------------ */

const SS_COLORS = {
  ss1: "#FF6B6B",
  ss2: "#4D96FF",
  ss3: "#FFD93D",
  ss0: "#8B97A5",
};

const SESSIONS = {
  A: {
    name: "Session A",
    focus: "Hinge + Bench",
    time: "45–60 min",
    exercises: [
      { id: "a1", nameByWeek: ["Trap Bar Deadlift", "Conventional Deadlift", "Trap Bar Deadlift", "Conventional Deadlift"], targetByWeek: ["8", "5", "8", "5"], startByWeek: ["95", "90", "95", "90"], sets: [3, 3, 3, 3], zone: "Floor", ss: "ss0" },
      { id: "a2", name: "Barbell Bench Press", target: "8–10", start: "62.5", sets: [3, 3, 3, 3], zone: "Rack", ss: "ss0", note: "In rack, safeties just below chest. No AMRAP." },
      { id: "a3", name: "Seated Cable Row", target: "10–12", start: "45", sets: [3, 3, 3, 3], zone: "Station", ss: "ss0" },
      { id: "a4", name: "Incline DB Curl", target: "10–12", start: "12.5 /hand", sets: [3, 3, 3, 3], zone: "Bench", ss: "ss1", note: "Superset with overhead extension, 60s rest" },
      { id: "a5", name: "Overhead DB Triceps Extension", target: "10–12", start: "17.5", sets: [3, 3, 3, 3], zone: "Bench", ss: "ss1" },
      { id: "a6", name: "Lying Leg Raise", target: "10–12", start: "BW", sets: [2, 2, 2, 2], zone: "Floor", ss: "ss0", note: "Slow tempo before adding reps", pushOption: { name: "Hanging Knee Raise", target: "10–12", start: "BW", note: "Push-day option — only if the station is free" } },
    ],
  },
  B: {
    name: "Session B",
    focus: "Press + Pull",
    time: "45–60 min",
    exercises: [
      { id: "b1", nameByWeek: ["Strict Press", "Push Press", "Strict Press", "Push Press"], targetByWeek: ["6–8", "5–6", "6–8", "5–6"], startByWeek: ["40", "45", "40", "45"], sets: [3, 3, 3, 3], zone: "Rack", ss: "ss0", note: "2 RIR — no grinders" },
      { id: "b2", name: "Lat Pulldown (underhand)", target: "8–12", start: "55", sets: [3, 3, 3, 3], zone: "Station", ss: "ss0", note: "Stack jumps 45→55: add reps before weight" },
      { id: "b3", name: "DB Romanian Deadlift", target: "10", start: "22.5 /hand", sets: [3, 3, 3, 3], zone: "Bench", ss: "ss0" },
      { id: "b4", name: "Leg Press", target: "10–12", start: "pick @ 2 RIR", sets: [3, 3, 3, 3], zone: "Leg press", ss: "ss0" },
      { id: "b5", name: "DB Hammer Curl", target: "10–12", start: "12.5 /hand", sets: [3, 3, 3, 3], zone: "Station", ss: "ss1", note: "If left elbow flares, switch to rope hammer curl" },
      { id: "b6", name: "Cable Triceps Pushdown", target: "12", start: "50", sets: [3, 3, 3, 3], zone: "Station", ss: "ss1" },
      { id: "b7", name: "DB Split Squat (FFE)", target: "8 /leg", start: "12.5 /hand", sets: [2, 2, 2, 2], zone: "Bench", ss: "ss0", bonus: true, note: "Only if feeling strong" },
    ],
  },
  C: {
    name: "Session C",
    focus: "Chest supersets",
    time: "30–40 min",
    exercises: [
      { id: "c1", name: "Incline DB Press", target: "5–8", start: "22.5 /hand", sets: [3, 3, 3, 3], zone: "Bench", ss: "ss1" },
      { id: "c2", name: "Swiss Ball Leg Curl", target: "12", start: "BW", sets: [3, 3, 3, 3], zone: "Bench", ss: "ss1" },
      { id: "c3", name: "Wide Lat Pulldown", target: "10–12", start: "45", sets: [3, 3, 3, 3], zone: "Station", ss: "ss2" },
      { id: "c4", name: "Cable Crunch (kneeling)", target: "12–15", start: "40", sets: [2, 2, 2, 2], zone: "Station", ss: "ss2" },
      { id: "c5", name: "Dips", target: "8–12", start: "BW", sets: [3, 3, 3, 3], zone: "Dip station", ss: "ss0" },
    ],
  },
  D: {
    name: "Session D",
    focus: "Arms & chest (optional)",
    time: "30 min",
    exercises: [
      { id: "d1", name: "DB Fly", target: "12–15", start: "pick @ 2 RIR", sets: [3, 3, 3, 3], zone: "Bench", ss: "ss1" },
      { id: "d2", name: "DB Lateral Raise", target: "12–15", start: "8 /hand", sets: [3, 3, 3, 3], zone: "Bench", ss: "ss1" },
      { id: "d3", name: "Cable Curl", target: "12–15", start: "pick @ 2 RIR", sets: [3, 3, 3, 3], zone: "Station", ss: "ss2" },
      { id: "d4", name: "Rope Pushdown", target: "12–15", start: "pick @ 2 RIR", sets: [3, 3, 3, 3], zone: "Station", ss: "ss2" },
      { id: "d5", name: "Standing Calf Raise", target: "12–15", start: "15 /hand", sets: [3, 3, 3, 3], zone: "Floor", ss: "ss0" },
    ],
  },
  S: {
    name: "Swim",
    focus: "Recovery",
    time: "30 min",
    exercises: [
      { id: "s1", nameByWeek: ["30 min continuous easy swim", "30 min continuous easy swim", "10 min easy + 8×50m moderate (30s rest) + 5 min easy", "10 min easy + 8×50m moderate (30s rest) + 5 min easy"], sets: [1, 1, 1, 1], target: "any stroke", start: "—", ss: "ss0" },
    ],
  },
};

const RULES = [
  "Every working set ends ~2 reps in reserve. No AMRAP, no grinders — no spotter.",
  "Double progression: top of rep range on ALL sets → +2.5kg upper / +5kg lower next time you do that same lift.",
  "Rotating lifts (deadlift, overhead press) progress against the last time you did the same variant.",
  "Bench always inside the rack, safeties just below chest.",
  "3 sessions a week is the plan: A, B, C. D is optional — drop it first.",
  "Bonus exercises are optional. Skipping them is fine.",
  "Week 4 = deload: same sets, ~10% less weight, 3–4 RIR.",
];

const SESSION_ORDER = ["A", "B", "C", "D", "S"];
const DAY_LABEL = { A: "Mon", B: "Wed", C: "Thu", D: "Optional", S: "Wknd" };
const STORAGE_KEY = "block2_tracker_v1";
const APP_KEY_STORAGE = "block1_app_key";

const EMPTY_STATE = { logs: {}, sessionNotes: {}, chat: [], block: 2 };

/* ------------------------------------------------------------------ */

const C = {
  bg: "#151A21",
  surface: "#1F2630",
  surface2: "#2A3441",
  line: "#333F4E",
  text: "#EDF1F5",
  muted: "#8B97A5",
  amber: "#FFB454",
  green: "#57C785",
};

const font = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

function exName(ex, weekIdx) {
  return ex.nameByWeek ? ex.nameByWeek[weekIdx] : ex.name;
}
function exStart(ex, weekIdx) {
  return ex.startByWeek ? ex.startByWeek[weekIdx] : ex.start;
}
function exTarget(ex, weekIdx) {
  return ex.targetByWeek ? ex.targetByWeek[weekIdx] : ex.target;
}

function effectiveName(ex, weekIdx, option) {
  if (option === "push" && ex.pushOption) return ex.pushOption.name;
  return exName(ex, weekIdx);
}
function effectiveTarget(ex, weekIdx, option) {
  if (option === "push" && ex.pushOption) return ex.pushOption.target;
  return exTarget(ex, weekIdx);
}
function effectiveStart(ex, weekIdx, option) {
  if (option === "push" && ex.pushOption) return ex.pushOption.start;
  return exStart(ex, weekIdx);
}

function deloadWeight(raw) {
  if (!raw) return null;
  const m = raw.match(/^([\d.]+)(\s*\/hand)?$/);
  if (!m) return null;
  const num = parseFloat(m[1]);
  if (isNaN(num)) return null;
  const deloaded = Math.round((num * 0.9) / 2.5) * 2.5;
  return `${deloaded}${m[2] ? " /hand" : ""}`;
}

function planWeight(ex, weekIdx, logs, week, option) {
  const start = effectiveStart(ex, weekIdx, option);
  if (weekIdx !== 3) return { weight: start, isDeload: false };

  const currentName = exName(ex, weekIdx);
  for (let w = week - 1; w >= 1; w--) {
    if (ex.nameByWeek && exName(ex, w - 1) !== currentName) continue;
    const l = logs[`${w}-${ex.id}`];
    if (!l || !l.weight) continue;
    if (ex.pushOption && (l.option || "standard") !== (option || "standard")) continue;
    const dw = deloadWeight(l.weight);
    if (dw) return { weight: dw, isDeload: true };
    return { weight: start, isDeload: false };
  }
  const dw = deloadWeight(start);
  if (dw) return { weight: dw, isDeload: true };
  return { weight: start, isDeload: false };
}

function buildCoachContext(logs, sessionNotes) {
  const lines = [];
  for (let w = 1; w <= 4; w++) {
    for (const sk of SESSION_ORDER) {
      const sess = SESSIONS[sk];
      const logged = sess.exercises
        .map((ex) => {
          const l = logs[`${w}-${ex.id}`];
          if (!l || (!l.weight && !(l.reps || []).some((r) => r != null) && !l.note)) return null;
          const reps = (l.reps || []).map((r) => (r == null ? "–" : r)).join(", ");
          const target = l.option === "push" && ex.pushOption ? ex.pushOption.target : exTarget(ex, w - 1);
          const displayName = l.option === "push" && ex.pushOption ? ex.pushOption.name : exName(ex, w - 1);
          const bonusTag = ex.bonus ? " [BONUS]" : "";
          const optionTag = ex.pushOption && l.option ? ` [${l.option}]` : "";
          return `  ${displayName}${bonusTag}${optionTag} [target ${target} × ${ex.sets[w - 1]} sets, plan ${exStart(ex, w - 1)}]: ${l.weight || "?"}kg, reps [${reps}]${l.rir != null ? `, RIR ${l.rir}` : ""}${l.note ? ` — "${l.note}"` : ""}`;
        })
        .filter(Boolean);
      const sn = sessionNotes[`${w}-${sk}`];
      if (logged.length || (sn && (sn.feel || sn.note))) {
        lines.push(`W${w} ${sess.name}:`);
        lines.push(...logged);
        if (sn && (sn.feel || sn.note)) lines.push(`  Session feel: ${sn.feel || "—"}${sn.note ? ` — "${sn.note}"` : ""}`);
      }
    }
  }
  return lines.length ? lines.join("\n") : "(nothing logged yet)";
}

/* ------------------------------------------------------------------ */
/* Coach — posts to /api/coach                                         */
/* ------------------------------------------------------------------ */

function getAppKey() {
  try {
    return localStorage.getItem(APP_KEY_STORAGE) || "";
  } catch {
    return "";
  }
}

function setAppKey(key) {
  try {
    localStorage.setItem(APP_KEY_STORAGE, key);
  } catch {}
}

async function askCoach(history, logs, sessionNotes) {
  if (!navigator.onLine) throw new Error("offline");
  const appKey = getAppKey();
  if (!appKey) throw new Error("no-app-key");

  const planSummary = SESSION_ORDER.map((sk) => {
    const s = SESSIONS[sk];
    const exSummaries = s.exercises.map((ex) => {
      const bonusTag = ex.bonus ? " [BONUS]" : "";
      if (ex.nameByWeek) {
        const variants = [];
        const seen = new Set();
        for (let w = 0; w < 4; w++) {
          const vName = ex.nameByWeek[w];
          if (seen.has(vName)) continue;
          seen.add(vName);
          const weeks = ex.nameByWeek.map((n, i) => n === vName ? `W${i + 1}` : null).filter(Boolean).join("/");
          const target = ex.targetByWeek ? ex.targetByWeek[w] : ex.target;
          const start = ex.startByWeek ? ex.startByWeek[w] : ex.start;
          variants.push(`${vName} ${ex.sets[w]}×${target} @${start} (${weeks})`);
        }
        return variants.join(" / ") + bonusTag;
      }
      let line = `${ex.name} ${ex.sets[0]}×${exTarget(ex, 0)} @${exStart(ex, 0)}${bonusTag}`;
      if (ex.pushOption) {
        line += ` [push option: ${ex.pushOption.name} ${ex.pushOption.target} @${ex.pushOption.start}]`;
      }
      return line;
    });
    const dayNote = sk === "D" ? " (OPTIONAL)" : "";
    return `${s.name} (${DAY_LABEL[sk]}, ${s.time}, ${s.focus})${dayNote}: ${exSummaries.join("; ")}`;
  }).join("\n");

  const system = `You are the coach inside Michael's gym tracker (Hypertrophy Block 2, 4 weeks. W4 = deload: same sets, ~10% less weight, 3–4 RIR).

Michael's focus this block is arms and chest. Gym has one combined pulldown/cable-row station, so keep supersets in one zone.

PROGRAMME:
${planSummary}

RULES:
${RULES.map((r, i) => `${i + 1}. ${r}`).join("\n")}

MICHAEL'S LOG SO FAR:
${buildCoachContext(logs, sessionNotes)}

You are read on a phone mid-workout. Be concise: 2-5 short sentences unless asked for more. Give concrete numbers (kg, reps, sets). Apply double progression and the 2-RIR rule. Never suggest grinder/AMRAP sets — Michael trains without a spotter. If suggesting a substitution, prefer dumbbell/bodyweight options (cable machines vary by gym). Bonus exercises are optional — skipping them is expected, not a miss. Session D is optional — drop it first if the week is busy.`;

  const messages = [
    { role: "user", content: system + "\n\nAcknowledge silently; respond only to the conversation that follows." },
    { role: "assistant", content: "Understood — I have the programme and log." },
    ...history.map((m) => ({ role: m.role, content: m.content })),
  ];

  const res = await fetch("/api/coach", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-app-key": appKey },
    body: JSON.stringify({ messages }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Server error (${res.status})`);
  }

  const data = await res.json();
  if (data.error) throw new Error(data.error.message || data.error || "API error");
  return data.content.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
}

/* ------------------------------------------------------------------ */
/* Small components                                                    */
/* ------------------------------------------------------------------ */

function Stepper({ value, onChange, step = 1, min = 0, width = 40 }) {
  const btn = {
    width: 34, height: 34, borderRadius: 8, border: `1px solid ${C.line}`,
    background: C.surface2, color: C.text, fontSize: 18, fontWeight: 700,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <button style={btn} onClick={() => onChange(Math.max(min, (value ?? 0) - step))}>−</button>
      <div style={{ width, textAlign: "center", fontSize: 17, fontWeight: 800, fontVariantNumeric: "tabular-nums", color: value == null ? C.muted : C.text }}>
        {value == null ? "–" : value}
      </div>
      <button style={btn} onClick={() => onChange((value ?? 0) + step)}>+</button>
    </div>
  );
}

function WarmUpCard() {
  return (
    <div style={{ background: C.surface, borderRadius: 12, borderLeft: `4px solid ${C.amber}`, padding: "12px 14px" }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: C.amber, marginBottom: 4 }}>Warm-up</div>
      <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>
        5 min easy bike + dynamic mobility (arm circles, hip openers, band pull-aparts). Then 2 warm-up sets on the first main lift: ~50% × 8, ~75% × 4.
      </div>
    </div>
  );
}

function ExerciseCard({ ex, weekIdx, log, prev, onLog, week, logs }) {
  const [open, setOpen] = useState(false);
  const nSets = ex.sets[weekIdx];
  const option = log?.option || "standard";
  const name = effectiveName(ex, weekIdx, option);
  const target = effectiveTarget(ex, weekIdx, option);
  const { weight: planW, isDeload } = planWeight(ex, weekIdx, logs, week, option);
  const reps = log?.reps || Array(nSets).fill(null);
  const doneSets = reps.filter((r) => r != null).length;
  const complete = doneSets >= nSets;

  const update = (patch) => onLog({ weight: log?.weight ?? "", reps, rir: log?.rir ?? null, note: log?.note ?? "", option, ...patch });

  const prevReps = prev && (prev.log.reps || []).filter((r) => r != null);
  const activeNote = option === "push" && ex.pushOption?.note ? ex.pushOption.note : ex.note;

  return (
    <div style={{ background: C.surface, borderRadius: 12, borderLeft: `4px solid ${SS_COLORS[ex.ss]}`, overflow: "hidden", ...(ex.bonus ? { opacity: 0.7 } : {}) }}>
      <div onClick={() => setOpen(!open)} style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.25, display: "flex", alignItems: "center", gap: 6 }}>
            {name}
            {ex.bonus && <span style={{ fontSize: 10, fontWeight: 800, color: C.amber, background: C.surface2, padding: "1px 5px", borderRadius: 4, flexShrink: 0 }}>BONUS</span>}
          </div>
          <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>
            {nSets} × {target} · plan {planW}
            {isDeload && <span style={{ color: C.amber }}> (deload −10%)</span>}
            {log?.weight ? <span style={{ color: C.amber, fontWeight: 700 }}> · did {log.weight}kg</span> : null}
          </div>
          {ex.zone && <div style={{ fontSize: 11.5, color: C.muted, marginTop: 1 }}>{ex.zone}</div>}
          {prev && (
            <div style={{ fontSize: 12.5, color: C.green, marginTop: 2, fontVariantNumeric: "tabular-nums" }}>
              Last (W{prev.week}): <span style={{ fontWeight: 800 }}>{prev.log.weight || "?"}kg</span>
              {prevReps && prevReps.length ? ` × ${prevReps.join(", ")}` : ""}
            </div>
          )}
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: complete ? C.green : C.muted, fontVariantNumeric: "tabular-nums" }}>
          {complete ? "✓" : `${doneSets}/${nSets}`}
        </div>
      </div>

      {open && (
        <div style={{ padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
          {ex.pushOption && (
            <div style={{ display: "flex", gap: 6 }}>
              {["standard", "push"].map((opt) => (
                <button key={opt} onClick={() => update({ option: opt })}
                  style={{
                    flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 13, fontWeight: 700,
                    border: `1px solid ${option === opt ? C.amber : C.line}`,
                    background: option === opt ? C.amber : C.surface2,
                    color: option === opt ? "#151A21" : C.text,
                  }}>{opt === "standard" ? "Standard" : "Push"}</button>
              ))}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, color: C.muted, width: 52 }}>Weight</span>
            <input
              value={log?.weight ?? ""}
              onChange={(e) => update({ weight: e.target.value })}
              placeholder={isDeload ? planW : (prev ? prev.log.weight || planW : planW)}
              inputMode="decimal"
              style={{ flex: 1, background: C.surface2, border: `1px solid ${C.line}`, borderRadius: 8, padding: "9px 10px", color: C.text, fontSize: 16, fontWeight: 700 }}
            />
            <span style={{ fontSize: 13, color: C.muted }}>kg</span>
          </div>

          {reps.map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 13, color: C.muted, width: 52 }}>Set {i + 1}</span>
              <Stepper value={r} onChange={(v) => { const next = [...reps]; next[i] = v; update({ reps: next }); }} />
              <span style={{ fontSize: 13, color: C.muted }}>reps</span>
            </div>
          ))}

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, color: C.muted, width: 52 }}>RIR</span>
            <div style={{ display: "flex", gap: 6 }}>
              {[0, 1, 2, 3, 4].map((v) => (
                <button key={v} onClick={() => update({ rir: log?.rir === v ? null : v })}
                  style={{
                    width: 36, height: 32, borderRadius: 8, fontSize: 14, fontWeight: 700,
                    border: `1px solid ${log?.rir === v ? C.amber : C.line}`,
                    background: log?.rir === v ? C.amber : C.surface2,
                    color: log?.rir === v ? "#151A21" : C.text,
                  }}>{v}</button>
              ))}
            </div>
          </div>

          <input
            value={log?.note ?? ""}
            onChange={(e) => update({ note: e.target.value })}
            placeholder="Notes — how it felt, subs, form cues…"
            style={{ background: C.surface2, border: `1px solid ${C.line}`, borderRadius: 8, padding: "9px 10px", color: C.text, fontSize: 14 }}
          />
          {activeNote && <div style={{ fontSize: 12, color: C.muted }}>{activeNote}</div>}
        </div>
      )}
    </div>
  );
}

const FEELS = [
  { key: "rough", label: "😫 Rough" },
  { key: "ok", label: "😐 OK" },
  { key: "strong", label: "💪 Strong" },
  { key: "great", label: "🔥 Great" },
];

/* ------------------------------------------------------------------ */
/* Export / Import helpers                                              */
/* ------------------------------------------------------------------ */

function exportData(state) {
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `block2-backup-${date}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function readFileAsJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result));
      } catch {
        reject(new Error("File isn't valid JSON — are you sure this is a Block 2 backup?"));
      }
    };
    reader.onerror = () => reject(new Error("Couldn't read the file."));
    reader.readAsText(file);
  });
}

/* ------------------------------------------------------------------ */
/* Main app                                                            */
/* ------------------------------------------------------------------ */

export default function App() {
  const [state, setState] = useState(null);
  const [week, setWeek] = useState(1);
  const [session, setSession] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [feedbackSaved, setFeedbackSaved] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [importMsg, setImportMsg] = useState("");
  const [appKeyInput, setAppKeyInput] = useState(() => getAppKey());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const saveTimer = useRef(null);
  const stateRef = useRef(null);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const r = await storage.get(STORAGE_KEY);
        const loaded = r ? JSON.parse(r.value) : EMPTY_STATE;
        stateRef.current = loaded;
        setState(loaded);
      } catch {
        stateRef.current = EMPTY_STATE;
        setState(EMPTY_STATE);
      }
    })();
  }, []);

  const persist = useCallback((updater) => {
    setState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      stateRef.current = next;
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        try {
          await storage.set(STORAGE_KEY, JSON.stringify(stateRef.current));
          setSaveStatus("Saved");
          setTimeout(() => setSaveStatus(""), 1500);
        } catch {
          setSaveStatus("Save failed — will retry on next edit");
        }
      }, 600);
      return next;
    });
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state?.chat, thinking, chatOpen]);

  if (!state) {
    return <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontFamily: font }}>Loading your block…</div>;
  }

  const weekIdx = week - 1;

  const prevFor = (ex, option) => {
    const currentName = exName(ex, weekIdx);
    for (let w = week - 1; w >= 1; w--) {
      if (ex.nameByWeek && exName(ex, w - 1) !== currentName) continue;
      const l = state.logs[`${w}-${ex.id}`];
      if (!l || (!l.weight && !(l.reps || []).some((r) => r != null))) continue;
      if (ex.pushOption && (l.option || "standard") !== (option || "standard")) continue;
      return { week: w, log: l };
    }
    return null;
  };

  const sendChat = async (text) => {
    const msg = text.trim();
    if (!msg || thinking) return;

    if (!getAppKey()) {
      const key = prompt("Enter your app key to use the coach:");
      if (!key) return;
      setAppKey(key);
      setAppKeyInput(key);
    }

    const history = [...state.chat, { role: "user", content: msg }];
    persist((s) => ({ ...s, chat: [...s.chat, { role: "user", content: msg }] }));
    setChatInput("");
    setThinking(true);
    try {
      const reply = await askCoach(history, stateRef.current.logs, stateRef.current.sessionNotes);
      persist((s) => ({ ...s, chat: [...s.chat, { role: "assistant", content: reply }] }));
    } catch (e) {
      let errorMsg;
      if (e.message === "offline") {
        errorMsg = "You're offline — the coach needs an internet connection. Your workout data is safe.";
      } else if (e.message === "no-app-key") {
        errorMsg = "No app key set. Open Settings at the bottom and enter your app key.";
      } else {
        errorMsg = `Couldn't reach the coach (${e.message}).`;
      }
      persist((s) => ({ ...s, chat: [...s.chat, { role: "assistant", content: errorMsg }] }));
    } finally {
      setThinking(false);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await readFileAsJSON(file);
      if (!data.logs || !data.sessionNotes) {
        setImportMsg("This doesn't look like a valid backup (missing logs or sessionNotes).");
        return;
      }
      if (data.block !== 2) {
        setImportMsg("This looks like a Block 1 backup — Block 2 needs a file with block: 2.");
        return;
      }
      if (!window.confirm("This will replace all your current data with the backup. Continue?")) {
        setImportMsg("Import cancelled.");
        return;
      }
      persist(data);
      setImportMsg("Imported successfully ✓");
    } catch (err) {
      setImportMsg(err.message);
    }
    e.target.value = "";
    setTimeout(() => setImportMsg(""), 4000);
  };

  const sessionProgress = (w, sk) => {
    const sess = SESSIONS[sk];
    let done = 0, total = 0;
    sess.exercises.forEach((ex) => {
      if (ex.bonus) return;
      const n = ex.sets[w - 1];
      total += n;
      const l = state.logs[`${w}-${ex.id}`];
      if (l) done += (l.reps || []).filter((r) => r != null).length;
    });
    return { done, total };
  };

  /* ---- styles ---- */
  const page = { background: C.bg, minHeight: "100vh", color: C.text, fontFamily: font, maxWidth: 460, margin: "0 auto", paddingBottom: 90 };
  const chip = (active) => ({
    flex: 1, padding: "9px 0", borderRadius: 10, fontSize: 14, fontWeight: 800, textAlign: "center",
    border: `1px solid ${active ? C.amber : C.line}`,
    background: active ? C.amber : "transparent",
    color: active ? "#151A21" : C.muted, cursor: "pointer",
  });

  /* ---- session view ---- */
  const renderSession = () => {
    const sess = SESSIONS[session];
    const sn = state.sessionNotes[`${week}-${session}`] || { feel: null, note: "" };
    const setSN = (patch) => persist((s) => ({ ...s, sessionNotes: { ...s.sessionNotes, [`${week}-${session}`]: { ...(s.sessionNotes[`${week}-${session}`] || { feel: null, note: "" }), ...patch } } }));
    const saveSessionNow = async () => {
      clearTimeout(saveTimer.current);
      try {
        await storage.set(STORAGE_KEY, JSON.stringify(stateRef.current));
        setFeedbackSaved(true);
        setTimeout(() => setFeedbackSaved(false), 2000);
      } catch {
        setSaveStatus("Save failed — will retry on next edit");
      }
    };
    const showWarmUp = ["A", "B", "C", "D"].includes(session);
    return (
      <div style={{ padding: "0 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        <button onClick={() => setSession(null)} style={{ alignSelf: "flex-start", background: "none", border: "none", color: C.amber, fontSize: 14, fontWeight: 700, padding: "8px 0", cursor: "pointer" }}>
          ‹ Week {week}
        </button>
        <div>
          <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.5 }}>{sess.name}</div>
          <div style={{ fontSize: 13.5, color: C.muted, marginTop: 2 }}>
            {sess.time} · {sess.focus}{week === 4 ? " · DELOAD — same sets, ~10% less weight" : ""}
          </div>
        </div>
        {showWarmUp && <WarmUpCard />}
        {sess.exercises.map((ex) => {
          const option = state.logs[`${week}-${ex.id}`]?.option || "standard";
          return (
            <ExerciseCard
              key={ex.id}
              ex={ex}
              weekIdx={weekIdx}
              log={state.logs[`${week}-${ex.id}`]}
              prev={prevFor(ex, option)}
              onLog={(l) => persist((s) => ({ ...s, logs: { ...s.logs, [`${week}-${ex.id}`]: l } }))}
              week={week}
              logs={state.logs}
            />
          );
        })}

        <div style={{ background: C.surface, borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
          <div style={{ fontSize: 14, fontWeight: 800 }}>How did it feel?</div>
          <div style={{ display: "flex", gap: 6 }}>
            {FEELS.map((f) => (
              <button key={f.key} onClick={() => setSN({ feel: sn.feel === f.key ? null : f.key })}
                style={{
                  flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 12.5, fontWeight: 700,
                  border: `1px solid ${sn.feel === f.key ? C.amber : C.line}`,
                  background: sn.feel === f.key ? C.amber : C.surface2,
                  color: sn.feel === f.key ? "#151A21" : C.text,
                }}>{f.label}</button>
            ))}
          </div>
          <textarea
            value={sn.note}
            onChange={(e) => setSN({ note: e.target.value })}
            placeholder="What was enjoyable? What dragged? Anything to change?"
            rows={2}
            style={{ background: C.surface2, border: `1px solid ${C.line}`, borderRadius: 8, padding: "9px 10px", color: C.text, fontSize: 14, resize: "vertical", fontFamily: font }}
          />
          <button onClick={saveSessionNow}
            style={{
              padding: "12px 0", borderRadius: 10, border: "none",
              background: feedbackSaved ? C.green : C.amber, color: "#151A21",
              fontSize: 15, fontWeight: 900, cursor: "pointer", transition: "background 0.2s",
            }}>
            {feedbackSaved ? "Saved ✓" : "Save session"}
          </button>
        </div>
      </div>
    );
  };

  /* ---- overview ---- */
  const renderOverview = () => (
    <div style={{ padding: "0 14px", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 6 }}>
        {[1, 2, 3, 4].map((w) => (
          <div key={w} style={chip(week === w)} onClick={() => setWeek(w)}>
            W{w}{w === 4 ? " ↓" : ""}
          </div>
        ))}
      </div>
      {week === 4 && <div style={{ fontSize: 13, color: C.amber, fontWeight: 700 }}>Deload week — same sets, ~10% less weight, 3–4 RIR.</div>}
      {SESSION_ORDER.map((sk) => {
        const sess = SESSIONS[sk];
        const { done, total } = sessionProgress(week, sk);
        const started = done > 0;
        const complete = done >= total;
        return (
          <div key={sk}>
            <div onClick={() => setSession(sk)}
              style={{ background: C.surface, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10, background: complete ? C.green : started ? C.amber : C.surface2,
                color: complete || started ? "#151A21" : C.muted,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, flexShrink: 0,
              }}>{sk === "S" ? "~" : sk}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15.5, fontWeight: 800 }}>{sess.name}</div>
                <div style={{ fontSize: 12.5, color: C.muted, marginTop: 1 }}>{DAY_LABEL[sk]} · {sess.time} · {sess.focus}</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: complete ? C.green : started ? C.amber : C.muted, fontVariantNumeric: "tabular-nums" }}>
                {complete ? "Done" : started ? `${done}/${total}` : ""}
              </div>
            </div>
            {sk === "D" && <div style={{ fontSize: 12, color: C.muted, marginTop: 4, marginLeft: 58 }}>Optional — drop this first if the week is busy.</div>}
          </div>
        );
      })}
      <div style={{ background: C.surface, borderRadius: 12, padding: "12px 16px", fontSize: 12.5, color: C.muted, lineHeight: 1.55 }}>
        <div style={{ fontWeight: 800, color: C.text, fontSize: 13, marginBottom: 4 }}>The rules</div>
        {RULES.map((r, i) => <div key={i}>{i + 1}. {r}</div>)}
      </div>
    </div>
  );

  /* ---- chat sheet ---- */
  const QUICK = ["Suggest next weights", "How's my progression?", "Swap an exercise for me"];
  const renderChat = () => (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(9,12,16,0.72)", zIndex: 40,
      display: "flex", flexDirection: "column", justifyContent: "flex-end",
    }} onClick={() => setChatOpen(false)}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: C.surface, borderRadius: "18px 18px 0 0", maxWidth: 460, width: "100%", margin: "0 auto",
        height: "78vh", display: "flex", flexDirection: "column",
      }}>
        <div style={{ padding: "14px 16px 10px", display: "flex", alignItems: "center", borderBottom: `1px solid ${C.line}` }}>
          <div style={{ fontSize: 16, fontWeight: 900, flex: 1 }}>Coach</div>
          <button onClick={() => setChatOpen(false)} style={{ background: "none", border: "none", color: C.muted, fontSize: 22, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          {state.chat.length === 0 && (
            <div style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.5 }}>
              Ask anything — the coach can see your full programme and everything you've logged. It applies your rules: 2 RIR, double progression, no grinders.
            </div>
          )}
          {state.chat.map((m, i) => (
            <div key={i} style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "85%", padding: "10px 13px", borderRadius: 14, fontSize: 14.5, lineHeight: 1.5, whiteSpace: "pre-wrap",
              background: m.role === "user" ? C.amber : C.surface2,
              color: m.role === "user" ? "#151A21" : C.text,
            }}>{m.content}</div>
          ))}
          {thinking && <div style={{ alignSelf: "flex-start", padding: "10px 13px", borderRadius: 14, background: C.surface2, color: C.muted, fontSize: 14 }}>Thinking…</div>}
          <div ref={chatEndRef} />
        </div>
        <div style={{ padding: "8px 14px 0", display: "flex", gap: 6, flexWrap: "wrap" }}>
          {QUICK.map((q) => (
            <button key={q} onClick={() => sendChat(q)} disabled={thinking}
              style={{ padding: "7px 11px", borderRadius: 999, border: `1px solid ${C.line}`, background: C.surface2, color: C.text, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
              {q}
            </button>
          ))}
        </div>
        <div style={{ padding: 12, display: "flex", gap: 8 }}>
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendChat(chatInput)}
            placeholder="Message the coach…"
            style={{ flex: 1, background: C.surface2, border: `1px solid ${C.line}`, borderRadius: 12, padding: "11px 13px", color: C.text, fontSize: 15 }}
          />
          <button onClick={() => sendChat(chatInput)} disabled={thinking || !chatInput.trim()}
            style={{ padding: "0 18px", borderRadius: 12, border: "none", background: C.amber, color: "#151A21", fontSize: 15, fontWeight: 900, cursor: "pointer", opacity: thinking || !chatInput.trim() ? 0.5 : 1 }}>
            Send
          </button>
        </div>
      </div>
    </div>
  );

  /* ---- settings footer ---- */
  const renderSettings = () => (
    <div style={{ padding: "0 14px", marginTop: 16 }}>
      <button onClick={() => setSettingsOpen(!settingsOpen)}
        style={{ background: "none", border: "none", color: C.muted, fontSize: 12.5, cursor: "pointer", padding: "8px 0", width: "100%", textAlign: "center" }}>
        {settingsOpen ? "▾ Settings" : "▸ Settings"}
      </button>
      {settingsOpen && (
        <div style={{ background: C.surface, borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", gap: 12, marginTop: 4 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 6 }}>Coach app key</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="password"
                value={appKeyInput}
                onChange={(e) => setAppKeyInput(e.target.value)}
                placeholder="Enter your app key"
                style={{ flex: 1, background: C.surface2, border: `1px solid ${C.line}`, borderRadius: 8, padding: "9px 10px", color: C.text, fontSize: 14 }}
              />
              <button onClick={() => { setAppKey(appKeyInput); setSaveStatus("Key saved"); setTimeout(() => setSaveStatus(""), 1500); }}
                style={{ padding: "0 14px", borderRadius: 8, border: "none", background: C.amber, color: "#151A21", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
                Save
              </button>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 6 }}>Data backup</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => exportData(state)}
                style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: `1px solid ${C.line}`, background: C.surface2, color: C.text, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                Export data
              </button>
              <button onClick={() => fileInputRef.current?.click()}
                style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: `1px solid ${C.line}`, background: C.surface2, color: C.text, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                Import data
              </button>
              <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} style={{ display: "none" }} />
            </div>
            {importMsg && <div style={{ fontSize: 12, color: importMsg.includes("✓") ? C.green : C.amber, marginTop: 6 }}>{importMsg}</div>}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <div style={page}>
        <div style={{ padding: "18px 14px 12px", display: "flex", alignItems: "baseline", gap: 8 }}>
          <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.4 }}>Block 2</div>
          <div style={{ fontSize: 13, color: C.muted }}>Hypertrophy · 4 weeks</div>
          <div style={{ marginLeft: "auto", fontSize: 12, color: saveStatus.startsWith("Save failed") ? "#E0526B" : C.green, fontWeight: 700 }}>{saveStatus}</div>
        </div>
        {session ? renderSession() : renderOverview()}
        {!session && renderSettings()}
      </div>

      <button onClick={() => isOnline ? setChatOpen(true) : null}
        style={{
          position: "fixed", bottom: 18, right: "max(18px, calc(50% - 212px))", zIndex: 30,
          padding: "13px 20px", borderRadius: 999, border: "none",
          background: isOnline ? C.amber : C.surface2, color: isOnline ? "#151A21" : C.muted,
          fontSize: 15, fontWeight: 900,
          boxShadow: "0 6px 20px rgba(0,0,0,0.45)", cursor: isOnline ? "pointer" : "default",
        }}>
        {isOnline ? "Ask coach" : "Coach needs signal"}
      </button>

      {chatOpen && renderChat()}
    </div>
  );
}
