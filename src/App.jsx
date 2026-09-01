import React, { useState, useEffect, useRef, useCallback } from "react";
import storage from "./storage.js";

/* ------------------------------------------------------------------ */
/* PROGRAMME DATA — Hypertrophy Block 1 (4 weeks)                      */
/* ------------------------------------------------------------------ */

const SS_COLORS = {
  ss1: "#FF6B6B", // red 25 plate
  ss2: "#4D96FF", // blue 20 plate
  ss3: "#FFD93D", // yellow 15 plate
  ss0: "#8B97A5", // straight sets
};

// Base session templates. sets = [W1, W2, W3, W4(deload)]
const SESSIONS = {
  A: {
    name: "Session A",
    focus: "Deadlift + bench",
    time: "45–60 min",
    exercises: [
      { id: "a1", nameByWeek: ["Trap Bar Deadlift", "Conventional Deadlift", "Trap Bar Deadlift", "Conventional Deadlift"], sets: [3, 3, 3, 2], target: "8", startByWeek: ["95", "90", "95", "90"], ss: "ss0", note: "Hinge alternates weekly" },
      { id: "a2", name: "Barbell Bench Press", sets: [3, 3, 3, 2], target: "8–10", start: "60", ss: "ss0", note: "In rack, safeties just below chest. No AMRAP." },
      { id: "a3", name: "Chest-Supported / Incline DB Row", sets: [3, 3, 3, 2], target: "10–12", start: "20 /hand", ss: "ss0" },
      { id: "a4", name: "DB Lateral Raise", sets: [3, 3, 3, 2], target: "12–15", start: "7 /hand", ss: "ss0" },
      { id: "a5", name: "SS: Cable Triceps Pushdown", sets: [2, 2, 2, 1], target: "12", start: "pick @ 2 RIR", ss: "ss1", note: "Superset with curls, 60s rest" },
      { id: "a6", name: "SS: DB Bicep Curl", sets: [2, 2, 2, 1], target: "12", start: "12.5 /hand", ss: "ss1" },
      { id: "a7", name: "Hanging Knee Raise", sets: [3, 3, 3, 2], target: "10–12", start: "BW", ss: "ss0", note: "Finisher. Slow tempo before adding reps." },
    ],
  },
  B: {
    name: "Session B",
    focus: "Back extension + press",
    time: "45–60 min",
    exercises: [
      { id: "b1", name: "Weighted Back Extension", sets: [3, 3, 3, 2], target: "10–12", start: "15–20 DB", ss: "ss0", note: "Glutes + hams, DB held to chest" },
      { id: "b2", name: "Barbell Overhead Press", sets: [3, 3, 3, 2], target: "8–10", start: "40", ss: "ss0" },
      { id: "b3", name: "Lat Pulldown (underhand)", sets: [3, 3, 3, 2], target: "8–12", start: "50", ss: "ss0" },
      { id: "b4", name: "DB Split Squat (FFE)", sets: [3, 3, 3, 2], target: "10 /leg", start: "15 /hand", ss: "ss0" },
      { id: "b5", name: "SS: Bent Over Reverse Fly", sets: [2, 2, 2, 1], target: "12–15", start: "6 /hand", ss: "ss1", note: "Superset, 60s rest" },
      { id: "b6", name: "SS: DB Hammer Curl", sets: [2, 2, 2, 1], target: "12–15", start: "12.5 /hand", ss: "ss1" },
    ],
  },
  C: {
    name: "Session C",
    focus: "Supersets",
    time: "30 min",
    exercises: [
      { id: "c1", name: "SS1: Incline DB Press", sets: [3, 3, 3, 2], target: "10–12", start: "17.5 /hand", ss: "ss1" },
      { id: "c2", name: "SS1: Seated Cable Row", sets: [3, 3, 3, 2], target: "10–12", start: "pick @ 2 RIR", ss: "ss1" },
      { id: "c3", name: "SS2: Seated Leg Curl", sets: [3, 3, 3, 2], target: "12", start: "30–35", ss: "ss2" },
      { id: "c4", name: "SS2: DB Seated Shoulder Press", sets: [3, 3, 3, 2], target: "10–12", start: "15 /hand", ss: "ss2" },
      { id: "c5", name: "Cable Face Pull", sets: [2, 2, 2, 1], target: "15", start: "40", ss: "ss0" },
      { id: "c6", name: "Cable Crunch (kneeling)", sets: [2, 2, 2, 1], target: "12–15", start: "pick @ 2 RIR", ss: "ss0", note: "Finisher — progressible like any muscle" },
    ],
  },
  D: {
    name: "Session D",
    focus: "Supersets",
    time: "30 min",
    exercises: [
      { id: "d1", name: "SS1: Dips / Close-Grip Bench", sets: [3, 3, 3, 2], target: "8–12", start: "BW / 50", ss: "ss1", note: "Dips first choice — no spotter needed" },
      { id: "d2", name: "SS1: DB Single-Arm Row", sets: [3, 3, 3, 2], target: "10 /arm", start: "25", ss: "ss1" },
      { id: "d3", name: "SS2: Standing Calf Raise", sets: [3, 3, 3, 2], target: "12–15", start: "12.5 /hand", ss: "ss2" },
      { id: "d4", name: "SS2: Lat Pulldown (wide)", sets: [3, 3, 3, 2], target: "10–12", start: "40", ss: "ss2" },
      { id: "d5", name: "SS3: Cable Curl", sets: [2, 2, 2, 1], target: "12–15", start: "12.5 (incline DB ok)", ss: "ss3" },
      { id: "d6", name: "SS3: DB Overhead Triceps Extension", sets: [2, 2, 2, 1], target: "12–15", start: "17.5", ss: "ss3" },
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
  "Every working set ends ~2 reps in reserve. Could've done 5 more? Too light.",
  "Double progression: top of rep range on ALL sets → +2.5kg upper / +5kg lower next session.",
  "No AMRAP / grinder sets. No spotter: a rep you're not sure about is a rep you don't take.",
  "Bench always inside the rack, safeties just below chest height.",
  "Week 4 = deload: same weights, one set fewer. Block 2 starts at W4 weights.",
  "Lower-body work is spread across all sessions — no skippable leg day.",
];

const SESSION_ORDER = ["A", "B", "C", "D", "S"];
const DAY_LABEL = { A: "Mon", B: "Wed", C: "Thu", D: "Fri", S: "Wknd" };
const STORAGE_KEY = "block1_tracker_v1";
const APP_KEY_STORAGE = "block1_app_key";

/* Seed: W1 Session D as logged in the spreadsheet (1 Sep 2026).
   Reps in [] were stated; the rest completed at target. */
const SEED = {
  logs: {
    "1-d1": { weight: "50", reps: [8, 8, 12], rir: 1, note: "CG bench. Tough at the end of the last set." },
    "1-d2": { weight: "25", reps: [10, 10, 10], rir: 2, note: "Felt good" },
    "1-d3": { weight: "10 /hand", reps: [14, 14, 14], rir: 2, note: "About right — nudge up to 12.5" },
    "1-d4": { weight: "40", reps: [10, 10, 10], rir: 2, note: "45 was too much on set 1, dropped to 40" },
    "1-d5": { weight: "12.5 /hand", reps: [10, 10], rir: 2, note: "Cable unavailable — did seated incline DB curls" },
    "1-d6": { weight: "17.5", reps: [12, 12], rir: 0, note: "Right on the limit" },
  },
  sessionNotes: { "1-D": { feel: null, note: "" } },
  chat: [],
};

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
          return `  ${exName(ex, w - 1)} [target ${ex.target} × ${ex.sets[w - 1]} sets, plan ${exStart(ex, w - 1)}]: ${l.weight || "?"}kg, reps [${reps}]${l.rir != null ? `, RIR ${l.rir}` : ""}${l.note ? ` — "${l.note}"` : ""}`;
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
/* Coach — posts to /api/coach (backend arrives in Phase 2)            */
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
  } catch {
    // Silently fail — user will be prompted again next time
  }
}

async function askCoach(history, logs, sessionNotes) {
  // Check network connectivity first
  if (!navigator.onLine) {
    throw new Error("offline");
  }

  const appKey = getAppKey();
  if (!appKey) {
    throw new Error("no-app-key");
  }

  const planSummary = SESSION_ORDER.map((sk) => {
    const s = SESSIONS[sk];
    return `${s.name} (${DAY_LABEL[sk]}, ${s.time}, ${s.focus}): ` + s.exercises.map((ex) => `${exName(ex, 0)} ${ex.sets[0]}×${ex.target} @ ${exStart(ex, 0)}`).join("; ");
  }).join("\n");

  const system = `You are the coach inside Michael's gym tracker (Hypertrophy Block 1, 4 weeks, W4 = deload with one set fewer at same weights).

PROGRAMME:
${planSummary}

RULES:
${RULES.map((r, i) => `${i + 1}. ${r}`).join("\n")}

MICHAEL'S LOG SO FAR:
${buildCoachContext(logs, sessionNotes)}

You are read on a phone mid-workout. Be concise: 2-5 short sentences unless asked for more. Give concrete numbers (kg, reps, sets). Apply double progression and the 2-RIR rule. Never suggest grinder/AMRAP sets — Michael trains without a spotter. If suggesting a substitution, prefer dumbbell/bodyweight options (cable machines vary by gym).`;

  const messages = [
    { role: "user", content: system + "\n\nAcknowledge silently; respond only to the conversation that follows." },
    { role: "assistant", content: "Understood — I have the programme and log." },
    ...history.map((m) => ({ role: m.role, content: m.content })),
  ];

  const res = await fetch("/api/coach", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-app-key": appKey,
    },
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

function ExerciseCard({ ex, weekIdx, log, prev, onLog }) {
  const [open, setOpen] = useState(false);
  const nSets = ex.sets[weekIdx];
  const name = exName(ex, weekIdx);
  const start = exStart(ex, weekIdx);
  const reps = log?.reps || Array(nSets).fill(null);
  const doneSets = reps.filter((r) => r != null).length;
  const complete = doneSets >= nSets;

  const update = (patch) => onLog({ weight: log?.weight ?? "", reps, rir: log?.rir ?? null, note: log?.note ?? "", ...patch });

  const prevReps = prev && (prev.log.reps || []).filter((r) => r != null);

  return (
    <div style={{ background: C.surface, borderRadius: 12, borderLeft: `4px solid ${SS_COLORS[ex.ss]}`, overflow: "hidden" }}>
      <div onClick={() => setOpen(!open)} style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.25 }}>{name}</div>
          <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>
            {nSets} × {ex.target} · plan {start}
            {log?.weight ? <span style={{ color: C.amber, fontWeight: 700 }}> · did {log.weight}kg</span> : null}
          </div>
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
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, color: C.muted, width: 52 }}>Weight</span>
            <input
              value={log?.weight ?? ""}
              onChange={(e) => update({ weight: e.target.value })}
              placeholder={prev ? prev.log.weight || start : start}
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
          {ex.note && <div style={{ fontSize: 12, color: C.muted }}>{ex.note}</div>}
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
  a.download = `block1-backup-${date}.json`;
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
        reject(new Error("File isn't valid JSON — are you sure this is a Block 1 backup?"));
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
  const [state, setState] = useState(null); // { logs, sessionNotes, chat }
  const [week, setWeek] = useState(1);
  const [session, setSession] = useState(null); // "A".."S" or null = overview
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

  // Track online/offline for coach button state
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
        const loaded = r ? JSON.parse(r.value) : SEED;
        stateRef.current = loaded;
        setState(loaded);
      } catch {
        stateRef.current = SEED;
        setState(SEED);
      }
    })();
  }, []);

  /* Accepts a value OR an updater function — always applied against the
     latest state, so a slow coach reply can't overwrite gym edits. */
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

  /* Most recent earlier week with real data for this exercise */
  const prevFor = (exId) => {
    for (let w = week - 1; w >= 1; w--) {
      const l = state.logs[`${w}-${exId}`];
      if (l && (l.weight || (l.reps || []).some((r) => r != null))) return { week: w, log: l };
    }
    return null;
  };

  const sendChat = async (text) => {
    const msg = text.trim();
    if (!msg || thinking) return;

    // Prompt for app key if missing
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
        errorMsg = `Couldn't reach the coach (${e.message}). The backend isn't deployed yet — this will work after Phase 2.`;
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
      // Basic shape check
      if (!data.logs || !data.sessionNotes) {
        setImportMsg("This doesn't look like a Block 1 backup (missing logs or sessionNotes).");
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
    // Reset file input so the same file can be picked again
    e.target.value = "";
    setTimeout(() => setImportMsg(""), 4000);
  };

  const sessionProgress = (w, sk) => {
    const sess = SESSIONS[sk];
    let done = 0, total = 0;
    sess.exercises.forEach((ex) => {
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
    return (
      <div style={{ padding: "0 14px", display: "flex", flexDirection: "column", gap: 10 }}>
        <button onClick={() => setSession(null)} style={{ alignSelf: "flex-start", background: "none", border: "none", color: C.amber, fontSize: 14, fontWeight: 700, padding: "8px 0", cursor: "pointer" }}>
          ‹ Week {week}
        </button>
        <div>
          <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.5 }}>{sess.name}</div>
          <div style={{ fontSize: 13.5, color: C.muted, marginTop: 2 }}>
            {sess.time} · {sess.focus}{week === 4 ? " · DELOAD — one set fewer, same weights" : ""}
          </div>
        </div>
        {sess.exercises.map((ex) => (
          <ExerciseCard
            key={ex.id}
            ex={ex}
            weekIdx={weekIdx}
            log={state.logs[`${week}-${ex.id}`]}
            prev={prevFor(ex.id)}
            onLog={(l) => persist((s) => ({ ...s, logs: { ...s.logs, [`${week}-${ex.id}`]: l } }))}
          />
        ))}

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
      {week === 4 && <div style={{ fontSize: 13, color: C.amber, fontWeight: 700 }}>Deload week — same weights, one set fewer on everything.</div>}
      {SESSION_ORDER.map((sk) => {
        const sess = SESSIONS[sk];
        const { done, total } = sessionProgress(week, sk);
        const started = done > 0;
        const complete = done >= total;
        return (
          <div key={sk} onClick={() => setSession(sk)}
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
          {/* App key */}
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

          {/* Export / Import */}
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
          <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.4 }}>Block 1</div>
          <div style={{ fontSize: 13, color: C.muted }}>Hypertrophy · 4 weeks</div>
          <div style={{ marginLeft: "auto", fontSize: 12, color: saveStatus.startsWith("Save failed") ? "#E0526B" : C.green, fontWeight: 700 }}>{saveStatus}</div>
        </div>
        {session ? renderSession() : renderOverview()}
        {!session && renderSettings()}
      </div>

      {/* Coach FAB — shows offline state when no network */}
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
