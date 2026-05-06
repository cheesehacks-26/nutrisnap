import { useState, useEffect } from "react";
import { useAuth } from "../auth.jsx";
import { apiGet, apiDelete } from "../utils/api.js";
import { MEAL_ICONS } from "../utils/constants.js";
import { parseLogs } from "../utils/parseLogs.js";

const today = () => new Date().toISOString().slice(0, 10);

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
        <span style={{ color: "var(--text-dim)", fontSize: 12, transition: "transform 0.3s", transform: open ? "rotate(180deg)" : "none", flexShrink: 0 }} aria-hidden="true">{"\u25BE"}</span>
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
                  >{deletingLogId === d.log_id ? "Removing\u2026" : "Remove"}</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MyLogPage({ onNav }) {
  const { token } = useAuth();
  const [todayLogs, setTodayLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingLogId, setDeletingLogId] = useState(null);

  const loadLogs = () => {
    setLoading(true);
    setError("");
    apiGet(`/api/log?date=${today()}`, token)
      .then(lData => {
        setTodayLogs(parseLogs(lData.logs));
      })
      .catch(e => {
        console.error("Log load error:", e);
        setError("Could not load your log.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { document.title = "NutriSnap — My Log"; }, []);
  useEffect(() => { loadLogs(); }, [token]);

  const handleDeleteLog = async (logId) => {
    if (deletingLogId != null) return;
    setDeletingLogId(logId);
    try {
      await apiDelete(`/api/log/${logId}`, token);
      const lData = await apiGet(`/api/log?date=${today()}`, token);
      setTodayLogs(parseLogs(lData.logs));
    } catch (e) {
      console.error("Delete log error:", e);
      setError("Could not remove item. Try again.");
    } finally {
      setDeletingLogId(null);
    }
  };

  const loggedMealTypes = new Set(todayLogs.map(m => m.meal_type));
  const unloggedMeals = ["breakfast", "lunch", "dinner"].filter(m => !loggedMealTypes.has(m));

  return (
    <main className="mylog-page" style={{ paddingBottom: 110, animation: "pageIn 0.35s ease" }}>
      <div style={{ position: "fixed", top: -80, left: "50%", transform: "translateX(-50%)", width: 500, height: 500, background: "radial-gradient(circle, var(--glow) 0%, transparent 65%)", pointerEvents: "none", zIndex: 0 }} aria-hidden="true" />

      <div style={{ padding: "52px 22px 20px", position: "relative", zIndex: 1 }}>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 26, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
          My <span style={{ color: "var(--accent)" }}>Log</span>
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
        </p>
      </div>

      <div style={{ padding: "0 22px", position: "relative", zIndex: 1 }}>
        {error && <div style={{ background: "var(--danger-bg)", border: "1px solid var(--danger-border)", borderRadius: 14, padding: "11px 16px", fontSize: 13, color: "var(--danger)", marginBottom: 16 }} role="alert">{error}</div>}

        {/* Meals */}
        <section style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 17, color: "var(--text-primary)" }}>Logged meals</h2>
            {!loading && <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.1em" }}>{todayLogs.length} MEAL{todayLogs.length !== 1 ? "S" : ""}</span>}
          </div>
          {loading ? (
            [0, 1, 2].map(i => <div key={i} style={{ height: 64, borderRadius: 18, marginBottom: 10, background: "var(--bg-card)", backgroundImage: "linear-gradient(90deg,transparent,var(--border-faint),transparent)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />)
          ) : todayLogs.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text-muted)", padding: "16px 0" }}>Nothing logged yet today — tap a meal below or browse the menu to get started.</p>
          ) : (
            todayLogs.map(m => <MealCard key={m.meal_id} meal={m} onDelete={handleDeleteLog} deletingLogId={deletingLogId} />)
          )}
          {!loading && unloggedMeals.length > 0 && (
            <>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 16, marginBottom: 8 }}>Add a meal</div>
              {unloggedMeals.map(meal => (
                <button key={meal} onClick={() => onNav("snap")} aria-label={`Log ${meal}`} style={{ border: "1px dashed var(--border)", borderRadius: 18, padding: 16, display: "flex", alignItems: "center", gap: 12, cursor: "pointer", marginBottom: 8, width: "100%", background: "none" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 14, background: "var(--bg-input)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{MEAL_ICONS[meal]}</div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-secondary)", textTransform: "capitalize" }}>{meal} not logged yet</div>
                    <div style={{ fontSize: 10, color: "var(--accent)", marginTop: 2, fontWeight: 600 }}>+ Snap to log</div>
                  </div>
                </button>
              ))}
            </>
          )}
        </section>

        <button onClick={() => onNav("menu")} style={{ width: "100%", padding: 14, borderRadius: 16, border: "1px solid var(--border)", background: "linear-gradient(135deg, color-mix(in srgb, var(--accent) 8%, transparent), color-mix(in srgb, var(--accent2) 6%, transparent))", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <span>Browse menu</span><span style={{ color: "var(--accent)" }}>{"→"}</span>
        </button>
      </div>
    </main>
  );
}
