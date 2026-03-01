import { useState, useEffect } from "react";
import { useAuth } from "../auth.jsx";
import { apiGet, apiDelete } from "../utils/api.js";
import { MEAL_ICONS, MEAL_FOR_HOUR, MEAL_FOR_RECOMMEND, TODAY, TAG_COLOR } from "../utils/constants.js";

// ── Calorie Ring ────────────────────────────────────────────────────
function CalorieRing({ consumed, goal }) {
  const size = 160, stroke = 10, r = (size - stroke) / 2, cx = size / 2, circ = 2 * Math.PI * r;
  const over = consumed > goal;
  const pct = goal > 0 ? Math.min(1, consumed / goal) : 0;
  const [anim, setAnim] = useState(0);
  useEffect(() => { const t = setTimeout(() => setAnim(pct), 120); return () => clearTimeout(t); }, [pct]);
  const grade = pct >= 0.9 ? "A" : pct >= 0.7 ? "B" : pct >= 0.5 ? "C" : "D";
  const gradeColor = over ? "var(--danger)" : pct >= 0.7 ? "var(--accent)" : pct >= 0.5 ? "var(--warning)" : "var(--text-dim)";

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", filter: anim > 0.5 ? `drop-shadow(0 0 12px ${over ? "var(--danger)" : "var(--accent)"})` : "none", transition: "filter 1s ease" }} aria-hidden="true">
        <defs>
          <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={over ? "var(--danger)" : "var(--accent)"} />
            <stop offset="50%" stopColor={over ? "#ef4444" : "var(--accent2)"} />
            <stop offset="100%" stopColor={over ? "var(--danger)" : "#a78bfa"} />
          </linearGradient>
        </defs>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--border-faint)" strokeWidth={stroke - 4} opacity="0.5" />
        {anim > 0 && (
          <circle cx={cx} cy={cx} r={r} fill="none" stroke="url(#rg)" strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={`${circ * anim} ${circ}`}
            style={{ transition: "stroke-dasharray 1.4s cubic-bezier(0.34,1.56,0.64,1)" }} />
        )}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 32, fontWeight: 800, color: over ? "var(--danger)" : "var(--text-primary)", lineHeight: 1, letterSpacing: "-0.02em" }}>{consumed}</div>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "var(--text-dim)", marginTop: 4, letterSpacing: "0.05em" }}>/ {goal} kcal</div>
      </div>
      <div style={{ position: "absolute", top: 4, right: 4, width: 28, height: 28, borderRadius: "50%", background: `${gradeColor}20`, border: `2px solid ${gradeColor}`, display: "flex", alignItems: "center", justifyContent: "center", animation: pct >= 0.9 && !over ? "pulse-ring 2s infinite" : "none" }}>
        <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 12, color: gradeColor }}>{over ? "!" : grade}</span>
      </div>
    </div>
  );
}

// ── Macro Progress Row ───────────────────────────────────────────────
function MacroRow({ label, consumed, goal, color, delay }) {
  const rawPct = goal > 0 ? (consumed / goal) * 100 : 0;
  const over = rawPct > 100;
  const barPct = Math.min(100, rawPct);
  const [anim, setAnim] = useState(0);
  useEffect(() => { const t = setTimeout(() => setAnim(barPct), delay || 200); return () => clearTimeout(t); }, [barPct, delay]);
  const barColor = over ? "var(--danger)" : color;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
        <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600 }}>{label}</span>
        <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, fontWeight: 700, color: over ? "var(--danger)" : color }}>
          {consumed}<span style={{ color: "var(--text-dim)", fontWeight: 400 }}>/{goal}g</span>
        </span>
      </div>
      <div style={{ height: 8, background: "var(--border-faint)", borderRadius: 99, overflow: "hidden", position: "relative" }} role="progressbar" aria-valuenow={consumed} aria-valuemax={goal} aria-label={label}>
        <div style={{ height: "100%", width: `${anim}%`, background: `linear-gradient(90deg, ${barColor}, ${barColor}dd)`, borderRadius: 99, transition: "width 1.2s cubic-bezier(0.34,1.56,0.64,1)", boxShadow: `0 0 10px ${barColor}50`, position: "relative" }}>
          {anim > 2 && <div style={{ position: "absolute", right: -1, top: "50%", transform: "translateY(-50%)", width: 12, height: 12, borderRadius: "50%", background: barColor, boxShadow: `0 0 8px ${barColor}`, border: "2px solid var(--bg-surface)" }} />}
        </div>
      </div>
      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: over ? "var(--danger)" : "var(--text-dim)", marginTop: 4, textAlign: "right" }}>
        {over ? `+${Math.round(consumed - goal)}g over` : `${Math.round(rawPct)}%`}
      </div>
    </div>
  );
}

// ── Meal Card ──────────────────────────────────────────────────────
function MealCard({ meal, onDelete, deletingLogId }) {
  const [open, setOpen] = useState(false);
  const time = new Date(meal.logged_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-faint)", borderRadius: 18, marginBottom: 10, overflow: "hidden" }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", cursor: "pointer", width: "100%", background: "none", border: "none", textAlign: "left" }}
      >
        <div style={{ width: 40, height: 40, borderRadius: 14, background: "var(--bg-input)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
          {MEAL_ICONS[meal.meal_type]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text-primary)", textTransform: "capitalize" }}>{meal.meal_type}</span>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "var(--text-dim)", flexShrink: 0 }}>{time}</span>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 4, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "var(--cal-color)" }}>{meal.total_nutrition.calories} kcal</span>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "var(--protein)" }}>{meal.total_nutrition.g_protein}g pro</span>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "var(--carbs-color)" }}>{meal.total_nutrition.g_carbs}g carb</span>
          </div>
        </div>
        <span style={{ color: "var(--text-dim)", fontSize: 12, transition: "transform 0.3s", transform: open ? "rotate(180deg)" : "none", flexShrink: 0 }} aria-hidden="true">▾</span>
      </button>
      {open && (
        <div style={{ padding: "0 16px 14px", borderTop: "1px solid var(--border-faint)", animation: "fadeIn 0.2s ease" }}>
          {meal.dishes.map(d => (
            <div key={d.food_id || d.log_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border-faint)" }}>
              <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "var(--text-dim)", marginTop: 2 }}>{d.station} {"\u00B7"} {"\u00D7"}{d.servings}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: "var(--text-muted)" }}>{d.nutrition.calories} kcal</div>
                {onDelete && d.log_id != null && (
                  <button
                    onClick={e => { e.stopPropagation(); onDelete(d.log_id); }}
                    disabled={deletingLogId === d.log_id}
                    aria-label={`Remove ${d.name} from log`}
                    style={{ background: "var(--danger-bg)", border: "1px solid var(--danger-border)", borderRadius: 10, padding: "6px 10px", cursor: deletingLogId === d.log_id ? "not-allowed" : "pointer", fontFamily: "'Space Mono',monospace", fontSize: 10, fontWeight: 600, color: "var(--danger)", opacity: deletingLogId === d.log_id ? 0.7 : 1 }}
                  >{deletingLogId === d.log_id ? "Removing…" : "Remove"}</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Dashboard Page ─────────────────────────────────────────────────
export default function Dashboard({ onNav }) {
  const { user, token } = useAuth();
  const [greeting, setGreeting]           = useState("");
  const [profile, setProfile]             = useState(null);
  const [todayLogs, setTodayLogs]         = useState([]);
  const [todayTotals, setTodayTotals]     = useState({ calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 });
  const [recs, setRecs]                   = useState([]);
  const [recsRemaining, setRecsRemaining] = useState(null);
  const [recsMeal, setRecsMeal]           = useState("");
  const [recsLoading, setRecsLoading]     = useState(true);
  const [showRecs, setShowRecs]           = useState(true);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [deletingLogId, setDeletingLogId] = useState(null);

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
  }, []);

  const parseLogs = (logs) => {
    const groups = {};
    (logs || []).forEach(log => {
      const mt = log.meal_type || "snack";
      if (!groups[mt]) groups[mt] = { meal_id: mt, meal_type: mt, logged_at: log.logged_at, dishes: [], total_nutrition: { calories: 0, g_protein: 0, g_carbs: 0, g_fat: 0 } };
      groups[mt].dishes.push({ log_id: log.id ?? log.log_id, food_id: log.food_id || log.id, name: log.food_name, station: log.hall || "", servings: log.quantity || 1, nutrition: { calories: log.calories || 0, g_protein: log.protein_g || 0, g_carbs: log.carbs_g || 0, g_fat: log.fat_g || 0, mg_sodium: log.sodium_mg || 0 } });
      groups[mt].total_nutrition.calories  += log.calories || 0;
      groups[mt].total_nutrition.g_protein += log.protein_g || 0;
      groups[mt].total_nutrition.g_carbs   += log.carbs_g || 0;
      groups[mt].total_nutrition.g_fat     += log.fat_g || 0;
    });
    return Object.values(groups);
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 8000);
    Promise.all([
      apiGet("/api/profile", token).catch(() => ({ profile: null })),
      apiGet(`/api/log?date=${TODAY}`, token).catch(() => ({ logs: [], totals: {} })),
      apiGet("/api/targets", token).catch(() => ({ targets: null })),
    ]).then(([pData, lData, tData]) => {
      setProfile({ ...(pData.profile || {}), ...(tData.targets || {}) });
      setTodayLogs(parseLogs(lData.logs));
      setTodayTotals(lData.totals || { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 });
    }).catch(e => {
      console.error("Dashboard load error:", e);
      setError("Failed to load your data. Pull to retry.");
    }).finally(() => { clearTimeout(timer); setLoading(false); });
  }, [token]);

  useEffect(() => {
    const h = new Date().getHours();
    const meal = MEAL_FOR_RECOMMEND(h); // when closed, use next meal (breakfast) for recs
    setRecsMeal(meal);
    apiGet(`/api/recommend?meal=${meal}`, token)
      .then(data => {
        const all = Object.entries(data.halls || {}).flatMap(([, items]) => items).filter(i => i.name?.trim());
        all.sort((a, b) => b.score - a.score);
        setRecs(all.slice(0, 5));
        setRecsRemaining(data.remaining || null);
      })
      .catch(e => console.error("Recs load error:", e))
      .finally(() => setRecsLoading(false));
  }, [token]);

  const handleDeleteLog = async (logId) => {
    if (deletingLogId != null) return;
    setDeletingLogId(logId);
    try {
      await apiDelete(`/api/log/${logId}`, token);
      const lData = await apiGet(`/api/log?date=${TODAY}`, token);
      setTodayLogs(parseLogs(lData.logs));
      setTodayTotals(lData.totals || { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 });
    } catch (e) {
      console.error("Delete log error:", e);
      setError("Could not remove item. Try again.");
    } finally {
      setDeletingLogId(null);
    }
  };

  const calGoal  = profile?.calorie_target || 2000;
  const protGoal = profile?.protein_g      || 150;
  const carbGoal = profile?.carbs_g        || 250;
  const fatGoal  = profile?.fat_g          || 65;
  const totals = { calories: todayTotals.calories || 0, g_protein: todayTotals.protein_g || 0, g_carbs: todayTotals.carbs_g || 0, g_fat: todayTotals.fat_g || 0 };
  const displayName = profile?.display_name || user?.email?.split("@")[0] || "there";
  const goalLabel = profile?.goal ? profile.goal.replace("_", " ") : "maintain";
  const loggedMealTypes = new Set(todayLogs.map(m => m.meal_type));
  const unloggedMeals = ["breakfast", "lunch", "dinner"].filter(m => !loggedMealTypes.has(m));

  return (
    <main style={{ paddingBottom: 110, animation: "pageIn 0.35s ease" }}>
      <div style={{ position: "fixed", top: -80, left: "50%", transform: "translateX(-50%)", width: 500, height: 500, background: "radial-gradient(circle, var(--glow) 0%, transparent 65%)", pointerEvents: "none", zIndex: 0 }} aria-hidden="true" />

      {/* Header */}
      <div style={{ padding: "52px 22px 20px", position: "relative", zIndex: 1 }}>
        <div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "var(--text-dim)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{greeting}</div>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 28, letterSpacing: "-0.02em", marginTop: 3, color: "var(--text-primary)" }}>{displayName} <span style={{ color: "var(--accent)" }}>👋</span></h1>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Goal: <span style={{ color: "var(--text-secondary)", textTransform: "capitalize" }}>{goalLabel}</span></div>
          </div>
      </div>

      <div style={{ padding: "0 22px", position: "relative", zIndex: 1 }}>
        {error && <div style={{ background: "var(--danger-bg)", border: "1px solid var(--danger-border)", borderRadius: 14, padding: "11px 16px", fontSize: 13, color: "var(--danger)", marginBottom: 16 }} role="alert">{error}</div>}

        {/* Nutrition card */}
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 24, padding: "22px 20px", marginBottom: 16, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, var(--accent), var(--accent2), transparent)", opacity: 0.6 }} aria-hidden="true" />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, var(--border), transparent)" }} aria-hidden="true" />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Today {"\u00B7"} {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "var(--accent)", background: "var(--accent)12", padding: "3px 10px", borderRadius: 99, border: "1px solid var(--accent)25", letterSpacing: "0.05em" }}>
              {todayLogs.length} meal{todayLogs.length !== 1 ? "s" : ""} logged
            </div>
          </div>
          {loading ? (
            <div style={{ height: 176, display: "flex", alignItems: "center", justifyContent: "center" }} role="status" aria-live="polite">
              <div style={{ width: 24, height: 24, border: "3px solid var(--border-faint)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            </div>
          ) : (
            <>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <CalorieRing consumed={totals.calories} goal={calGoal} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <MacroRow label="Protein" consumed={totals.g_protein} goal={protGoal} color="var(--protein)" delay={200} />
                  <MacroRow label="Carbs"   consumed={totals.g_carbs}   goal={carbGoal} color="var(--carbs-color)" delay={350} />
                  <MacroRow label="Fat"     consumed={totals.g_fat}     goal={fatGoal}  color="var(--fat-color)" delay={500} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--border-faint)" }}>
                {(() => {
                  const calPct = calGoal > 0 ? Math.round(totals.calories / calGoal * 100) : 0;
                  const protPct = protGoal > 0 ? Math.round(totals.g_protein / protGoal * 100) : 0;
                  const calLeft = Math.max(0, calGoal - totals.calories);
                  const calOver = totals.calories > calGoal;
                  const protOver = totals.g_protein > protGoal;
                  return [
                    { label: calOver ? "over" : "left", value: calOver ? `+${totals.calories - calGoal}` : `${calLeft}`, unit: "kcal", c: calOver ? "var(--danger)" : "var(--cal-color)" },
                    { label: "cal %", value: `${calPct}`, unit: "%", c: calPct > 100 ? "var(--danger)" : "var(--accent)" },
                    { label: "protein", value: `${protPct}`, unit: "%", c: protOver ? "var(--danger)" : "var(--protein)" },
                  ];
                })().map(({ label, value, unit, c }) => (
                  <div key={label} style={{ flex: 1, textAlign: "center", background: `${c}08`, borderRadius: 14, padding: "10px 6px", border: `1px solid ${c}15` }}>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 17, fontWeight: 700, color: c }}>{value}<span style={{ fontSize: 10, opacity: 0.7 }}>{unit}</span></div>
                    <div style={{ fontSize: 9, color: "var(--text-dim)", marginTop: 3, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{label}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* CTA button */}
        <button onClick={() => onNav("snap")} aria-label="Snap your meal" style={{ background: "linear-gradient(135deg, var(--accent), var(--accent2))", borderRadius: 20, padding: "16px 20px", marginBottom: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 8px 32px var(--accent)30", width: "100%", border: "none" }}>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 17, color: "var(--accent-contrast)" }}>📸 Snap your meal</div>
            <div style={{ fontSize: 12, color: "var(--accent-contrast)", marginTop: 2, opacity: 0.7 }}>Auto-detect &amp; log in seconds</div>
          </div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 22, color: "var(--accent-contrast)", animation: "float 2s ease-in-out infinite" }} aria-hidden="true">→</div>
        </button>

        {/* Today's meals */}
        <section style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 17, color: "var(--text-primary)" }}>Today's meals</h2>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.1em" }}>{todayLogs.length} LOGGED</span>
          </div>
          {loading ? (
            [0, 1].map(i => <div key={i} style={{ height: 64, borderRadius: 18, marginBottom: 10, background: "var(--bg-card)", backgroundImage: "linear-gradient(90deg,transparent,var(--border-faint),transparent)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />)
          ) : todayLogs.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text-dim)", padding: "8px 0 12px" }}>Nothing logged yet today.</p>
          ) : (
            todayLogs.map(m => <MealCard key={m.meal_id} meal={m} onDelete={handleDeleteLog} deletingLogId={deletingLogId} />)
          )}
          {!loading && unloggedMeals.map(meal => (
            <button key={meal} onClick={() => onNav("snap")} aria-label={`Log ${meal}`} style={{ border: "1px dashed var(--border)", borderRadius: 18, padding: 16, display: "flex", alignItems: "center", gap: 12, cursor: "pointer", marginBottom: 8, width: "100%", background: "none" }}>
              <div style={{ width: 40, height: 40, borderRadius: 14, background: "var(--bg-input)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{MEAL_ICONS[meal]}</div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-dim)", textTransform: "capitalize" }}>{meal} not logged yet</div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "var(--text-dim)", marginTop: 2, opacity: 0.6 }}>+ TAP TO LOG</div>
              </div>
            </button>
          ))}
        </section>

        {/* Recommendations — dropdown arrow to show/hide list */}
        <section style={{ marginBottom: 24 }}>
          <button
            onClick={() => setShowRecs(s => !s)}
            aria-expanded={showRecs}
            aria-label={showRecs ? "Collapse recommendations" : "Expand recommendations"}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", width: "100%", padding: 0, marginBottom: showRecs ? 12 : 0, background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
          >
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 17, color: "var(--text-primary)", margin: 0 }}>Recommended <span style={{ color: "var(--accent)" }}>{recsMeal || "today"}</span>{MEAL_FOR_HOUR(new Date().getHours()) === "CLOSED" ? " (next)" : ""}</h2>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "var(--text-dim)", textTransform: "uppercase" }}>{recsMeal} {"\u00B7"} All Halls</span>
              <span style={{ color: "var(--text-dim)", fontSize: 14, transition: "transform 0.2s", transform: showRecs ? "rotate(0deg)" : "rotate(-90deg)" }} aria-hidden="true">{"\u25BC"}</span>
            </span>
          </button>
          {showRecs && (
            <>
              {recsRemaining && (
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>
                  You need <span style={{ color: "var(--protein)" }}>{recsRemaining.protein_g}g more protein</span> and <span style={{ color: "var(--cal-color)" }}>{recsRemaining.calories} kcal</span> today.
                </p>
              )}
              {recsLoading ? (
                <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
                  {[0, 1, 2].map(i => <div key={i} style={{ flexShrink: 0, width: 160, height: 130, background: "var(--bg-card)", border: "1px solid var(--border-faint)", borderRadius: 18, animation: "shimmer 1.5s infinite", backgroundImage: "linear-gradient(90deg,transparent 0%,var(--border-faint) 50%,transparent 100%)", backgroundSize: "200% 100%" }} />)}
                </div>
              ) : recs.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--text-dim)", padding: "16px 0" }}>No recommendations available right now.</p>
              ) : (
                <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }} role="list">
                  {recs.map(item => (
                    <div key={item.food_id} role="listitem" style={{ flexShrink: 0, width: 160, background: "var(--bg-card)", border: "1px solid var(--border-faint)", borderRadius: 18, padding: 14, cursor: "pointer", position: "relative" }}>
                      {item.is_saved && <div style={{ position: "absolute", top: 10, right: 10, fontSize: 12 }} aria-label="Saved">🔖</div>}
                      <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)", marginBottom: 4, lineHeight: 1.3, paddingRight: item.is_saved ? 16 : 0 }}>{item.name}</div>
                      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "var(--text-muted)", marginBottom: 8 }}>{item.station}</div>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
                        {(item.food_tags || []).map(t => <span key={t} style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: TAG_COLOR[t] || "var(--text-secondary)", background: `${TAG_COLOR[t] || "#94a3b8"}15`, padding: "2px 7px", borderRadius: 99 }}>{t}</span>)}
                      </div>
                      <div style={{ borderTop: "1px solid var(--border-faint)", paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
                        <div><div style={{ fontFamily: "'Space Mono',monospace", fontSize: 13, color: "var(--cal-color)" }}>{item.nutrition.calories}</div><div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "var(--text-dim)" }}>kcal</div></div>
                        <div><div style={{ fontFamily: "'Space Mono',monospace", fontSize: 13, color: "var(--protein)" }}>{item.nutrition.g_protein}g</div><div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "var(--text-dim)" }}>protein</div></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
