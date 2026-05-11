import { useState, useEffect } from "react";

const ACTIVITY_LEVELS = [
  { v: "sedentary", l: "Sedentary", desc: "Desk job or very little movement day-to-day" },
  { v: "light",     l: "Light",     desc: "Light walks or gym 1–3 days/week"            },
  { v: "moderate",  l: "Moderate",  desc: "Cardio or strength training 3–5 days/week"    },
  { v: "active",    l: "Active",    desc: "Hard training or physical job 6–7 days/week"  },
];
import { useAuth } from "../auth.jsx";
import { apiGet, API_BASE } from "../utils/api.js";
import { DIETARY_PREFS, ALLERGEN_OPTIONS } from "../utils/constants.js";
import { useTheme } from "../utils/theme.jsx";

// ── Compact toggle button ─────────────────────────────────────────────
function OptionBtn({ value, current, onSelect, children }) {
  const active = current === value;
  return (
    <button
      onClick={() => onSelect(value)}
      aria-pressed={active}
      style={{
        flex: 1, padding: "7px 6px", borderRadius: 10, cursor: "pointer",
        background: active ? "color-mix(in srgb, var(--accent) 12%, transparent)" : "var(--bg-input)",
        border: `2px solid ${active ? "var(--accent)" : "var(--border-faint)"}`,
        color: active ? "var(--accent)" : "var(--text-muted)",
        fontWeight: active ? 700 : 500, fontSize: 12, transition: "all 0.18s",
        boxShadow: active ? "0 0 0 2px color-mix(in srgb, var(--accent) 20%, transparent)" : "none",
      }}
    >{children}</button>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────
function Spin() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.7s linear infinite", flexShrink: 0 }} aria-hidden="true">
      <circle cx="12" cy="12" r="10" opacity="0.2"/>
      <path d="M12 2a10 10 0 0 1 10 10"/>
    </svg>
  );
}

export default function ProfilePage({ onNav }) {
  const { token, logout } = useAuth();
  const { isDark, toggle } = useTheme();

  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [error,         setError]         = useState("");
  const [success,       setSuccess]       = useState("");
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [targets,       setTargets]       = useState(null);

  const [displayName,   setDisplayName]   = useState("");
  const [sex,           setSex]           = useState("");
  const [age,           setAge]           = useState("");
  const [heightFt,      setHeightFt]      = useState("");
  const [heightIn,      setHeightIn]      = useState("");
  const [weightLbs,     setWeightLbs]     = useState("");
  const [goal,          setGoal]          = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [dietaryRestrictions, setDietaryRestrictions] = useState([]);

  useEffect(() => {
    document.title = "NutriSnap — Profile";
    Promise.all([
      apiGet("/api/profile", token).catch(() => ({})),
      apiGet("/api/targets", token).catch(() => ({})),
    ]).then(([pData, tData]) => {
      const p = pData.profile || pData || {};
      const t = tData.targets || tData || {};
      setTargets(t);
      setDisplayName(p.display_name || "");
      setSex(p.sex || "");
      setAge(p.age ? String(p.age) : "");
      const totalIn = p.height_in || 0;
      setHeightFt(totalIn ? String(Math.floor(totalIn / 12)) : "");
      setHeightIn(totalIn ? String(totalIn % 12) : "");
      setWeightLbs(p.weight_lbs ? String(p.weight_lbs) : "");
      setGoal(p.goal || "");
      setActivityLevel(p.activity_level || "");
      setDietaryRestrictions(p.dietary_restrictions || []);
    }).catch(e => console.error("Profile load error:", e))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(""), 3000);
    return () => clearTimeout(t);
  }, [success]);

  const toggleDiet = (key) =>
    setDietaryRestrictions(p => p.includes(key) ? p.filter(k => k !== key) : [...p, key]);

  const handleSave = async () => {
    if (!displayName || !sex || !age || !heightFt || !weightLbs || !goal || !activityLevel) {
      setError("Please fill in all required fields."); return;
    }
    setSaving(true); setError(""); setSuccess("");
    try {
      const totalHeight = Math.max(0, parseInt(heightFt || 0, 10) * 12 + parseInt(heightIn || 0, 10));
      const res = await fetch(`${API_BASE}/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          display_name: displayName, sex,
          age: Math.max(1, Math.min(120, parseInt(age, 10) || 0)),
          height_in: totalHeight,
          weight_lbs: Math.max(0, parseFloat(weightLbs) || 0),
          goal, activity_level: activityLevel,
          dietary_restrictions: dietaryRestrictions,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) { setError(json.error || "Failed to save profile."); return; }
      if (json.targets_error) setError(json.targets_error);
      if (json.targets) {
        setTargets(json.targets);
      } else {
        const tData = await apiGet("/api/targets", token).catch(() => ({}));
        setTargets(tData.targets ?? tData ?? null);
      }
      setSuccess("Profile saved!");
    } catch (e) {
      console.error("Profile save error:", e);
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (logoutLoading) return;
    setLogoutLoading(true);
    try { await logout(); if (onNav) onNav("home"); }
    finally { setLogoutLoading(false); }
  };

  const clamp = (v, min, max) => {
    const n = parseInt(v, 10);
    if (v === "" || Number.isNaN(n)) return v;
    return String(Math.max(min, Math.min(max, n)));
  };
  const clampWeight = (v) => {
    const n = parseFloat(v);
    if (v === "" || Number.isNaN(n)) return v;
    return n < 0 ? "0" : n > 999 ? "999" : v;
  };

  // ── Shared styles ──
  const lbl = {
    display: "block",
    fontFamily: "'Space Mono',monospace",
    fontSize: 8,
    letterSpacing: "0.1em",
    color: "var(--text-dim)",
    textTransform: "uppercase",
    marginBottom: 5,
  };
  const inp = {
    width: "100%",
    background: "var(--bg-input)",
    border: "1px solid var(--border-faint)",
    borderRadius: 10,
    padding: "8px 11px",
    fontSize: 13,
    color: "var(--text-primary)",
    boxSizing: "border-box",
  };
  const card = {
    background: "var(--bg-card)",
    border: "1px solid var(--border-faint)",
    borderRadius: 16,
    padding: "14px 16px",
    position: "relative",
    overflow: "hidden",
  };
  const sec = {
    fontFamily: "'Space Mono',monospace",
    fontSize: 10,
    letterSpacing: "0.1em",
    color: "var(--text-dim)",
    textTransform: "uppercase",
    marginBottom: 10,
    fontWeight: 600,
  };

  if (loading) return (
    <main className="profile-page" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid var(--border-faint)", borderTopColor: "var(--accent)", animation: "spin 0.8s linear infinite" }} />
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "var(--text-muted)" }}>Loading…</div>
      </div>
    </main>
  );

  return (
    <main className="profile-page" style={{ display: "flex", flexDirection: "column", animation: "pageIn 0.35s ease" }}>

      {/* ── Compact header row ── */}
      <header style={{ padding: "16px 24px 12px", flexShrink: 0, borderBottom: "1px solid var(--border-faint)", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: "-0.02em", color: "var(--text-primary)", lineHeight: 1 }}>
            Your <span style={{ color: "var(--accent)" }}>Profile</span>
          </h1>
        </div>

        {/* Status badge */}
        {(error || success) && (
          <div role="alert" aria-live="polite" style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, padding: "6px 12px", borderRadius: 10, flexShrink: 0, background: error ? "var(--danger-bg)" : "color-mix(in srgb, var(--accent) 12%, transparent)", border: `1px solid ${error ? "var(--danger-border)" : "color-mix(in srgb, var(--accent) 30%, transparent)"}`, color: error ? "var(--danger)" : "var(--accent)" }}>
            {error || `✓ ${success}`}
          </div>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ padding: "8px 18px", borderRadius: 12, border: "none", cursor: saving ? "not-allowed" : "pointer", background: saving ? "var(--bg-input)" : "linear-gradient(135deg,var(--accent),var(--accent2))", fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: saving ? "var(--text-muted)" : "var(--accent-contrast)", boxShadow: saving ? "none" : "0 4px 16px color-mix(in srgb, var(--accent) 35%, transparent)", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}
          aria-label="Save profile and recalculate targets"
        >
          {saving ? <><Spin />Saving…</> : "Save & Recalculate"}
        </button>

        {/* Sign out */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={logoutLoading}
          style={{ padding: "8px 14px", borderRadius: 12, border: "1px solid var(--danger-border)", cursor: logoutLoading ? "not-allowed" : "pointer", background: "transparent", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 13, color: logoutLoading ? "var(--text-dim)" : "var(--danger)", transition: "all 0.2s", flexShrink: 0 }}
          aria-label="Sign out"
        >
          {logoutLoading ? "…" : "Sign out"}
        </button>
      </header>

      {/* ── Two-column body ── */}
      <div style={{ flex: 1, minHeight: 0, overflow: "hidden", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, padding: "14px 24px 16px" }}>

        {/* ── Left column ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, overflow: "hidden" }}>

          {/* Personal info & body card */}
          <div style={card}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,var(--accent),transparent)", opacity: 0.5 }} aria-hidden="true" />
            <div style={sec}>Personal info</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

              {/* Name */}
              <div>
                <label style={lbl}>Display name</label>
                <input
                  className="profile-input"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="e.g. Badger"
                  style={inp}
                  aria-label="Display name"
                />
              </div>

              {/* Sex + Age (2-col) */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: 10 }}>
                <div>
                  <label style={lbl}>Biological sex</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    <OptionBtn value="male"   current={sex} onSelect={setSex}>Male</OptionBtn>
                    <OptionBtn value="female" current={sex} onSelect={setSex}>Female</OptionBtn>
                  </div>
                </div>
                <div>
                  <label style={lbl}>Age</label>
                  <input type="number" min={1} max={120} value={age} onChange={e => setAge(clamp(e.target.value, 1, 120))} placeholder="20" style={inp} aria-label="Age" />
                </div>
              </div>

              {/* Height ft + in + Weight (3-col) */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {[
                  { lbl: "Height (ft)", val: heightFt, set: v => setHeightFt(clamp(v, 0, 8)),  ph: "5",   unit: "ft",  max: 8  },
                  { lbl: "Height (in)", val: heightIn, set: v => setHeightIn(clamp(v, 0, 11)), ph: "10",  unit: "in",  max: 11 },
                  { lbl: "Weight",      val: weightLbs,set: v => setWeightLbs(clampWeight(v)), ph: "155", unit: "lbs", max: null },
                ].map(({ lbl: l, val, set, ph, unit }) => (
                  <div key={l} style={{ position: "relative" }}>
                    <label style={lbl}>{l}</label>
                    <input
                      type="number"
                      value={val}
                      onChange={e => set(e.target.value)}
                      placeholder={ph}
                      style={{ ...inp, paddingRight: unit === "lbs" ? 34 : 26 }}
                      aria-label={l}
                    />
                    <span style={{ position: "absolute", right: 9, bottom: 9, fontFamily: "'Space Mono',monospace", fontSize: 9, color: "var(--text-dim)", pointerEvents: "none" }}>{unit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Goals card */}
          <div style={card}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,var(--warning),transparent)", opacity: 0.5 }} aria-hidden="true" />
            <div style={sec}>Goals</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

              {/* Goal */}
              <div>
                <label style={lbl}>Goal</label>
                <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                  <OptionBtn value="cut"      current={goal} onSelect={setGoal}>Cut</OptionBtn>
                  <OptionBtn value="maintain" current={goal} onSelect={setGoal}>Maintain</OptionBtn>
                  <OptionBtn value="bulk"     current={goal} onSelect={setGoal}>Bulk</OptionBtn>
                </div>
              </div>

              {/* Activity — horizontal chips + description of selected */}
              <div>
                <label style={lbl}>Activity level</label>
                <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                  {ACTIVITY_LEVELS.map(({ v, l }) => {
                    const on = activityLevel === v;
                    return (
                      <button key={v} onClick={() => setActivityLevel(v)} aria-pressed={on} style={{ flex: 1, padding: "7px 4px", borderRadius: 10, cursor: "pointer", textAlign: "center", background: on ? "color-mix(in srgb, var(--accent) 12%, transparent)" : "var(--bg-input)", border: `2px solid ${on ? "var(--accent)" : "var(--border-faint)"}`, fontSize: 11, fontWeight: on ? 700 : 500, color: on ? "var(--accent)" : "var(--text-muted)", transition: "all 0.18s", boxShadow: on ? "0 0 0 2px color-mix(in srgb, var(--accent) 20%, transparent)" : "none" }}>
                        {l}
                      </button>
                    );
                  })}
                </div>
                {activityLevel && (() => {
                  const found = ACTIVITY_LEVELS.find(a => a.v === activityLevel);
                  return found ? (
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "var(--accent)", marginTop: 8, paddingLeft: 2, animation: "fadeIn 0.2s ease" }}>
                      {found.desc}
                    </div>
                  ) : null;
                })()}
              </div>
            </div>
          </div>

        </div>

        {/* ── Right column ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, overflow: "hidden" }}>

          {/* Dietary card — grows to fill */}
          <div style={{ ...card, flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,#4ade80,transparent)", opacity: 0.5 }} aria-hidden="true" />
            <div style={sec}>Allergens &amp; dietary</div>

            {/* Lifestyle */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ ...lbl, marginBottom: 6 }}>Lifestyle</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }} role="group" aria-label="Lifestyle preferences">
                {DIETARY_PREFS.map(({ key, label, icon }) => {
                  const active = dietaryRestrictions.includes(key);
                  return (
                    <button key={key} onClick={() => toggleDiet(key)} aria-pressed={active}
                      style={{ padding: "6px 11px", borderRadius: 99, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: active ? 700 : 400, background: active ? "color-mix(in srgb, var(--accent) 12%, transparent)" : "var(--bg-input)", border: `2px solid ${active ? "var(--accent)" : "var(--border-faint)"}`, color: active ? "var(--accent)" : "var(--text-secondary)", transition: "all 0.18s" }}>
                      {active && <span aria-hidden="true" style={{ fontSize: 10 }}>✓</span>}
                      <span aria-hidden="true">{icon}</span>{label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ height: 1, background: "var(--border-faint)", margin: "0 0 10px" }} aria-hidden="true" />

            {/* Allergens */}
            <div>
              <div style={{ ...lbl, marginBottom: 6 }}>Allergens — I avoid</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }} role="group" aria-label="Food allergens">
                {ALLERGEN_OPTIONS.map(({ key, label, icon }) => {
                  const active = dietaryRestrictions.includes(key);
                  return (
                    <button key={key} onClick={() => toggleDiet(key)} aria-pressed={active}
                      style={{ padding: "6px 11px", borderRadius: 99, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: active ? 700 : 400, background: active ? "var(--danger-bg)" : "var(--bg-input)", border: `2px solid ${active ? "var(--danger)" : "var(--border-faint)"}`, color: active ? "var(--danger)" : "var(--text-secondary)", transition: "all 0.18s" }}>
                      {active && <span aria-hidden="true" style={{ fontSize: 10 }}>✓</span>}
                      <span aria-hidden="true">{icon}</span>{label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Daily targets — anchored above appearance */}
          {targets && (
            <div style={card}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,var(--protein),transparent)", opacity: 0.5 }} aria-hidden="true" />
              <div style={sec}>Daily targets <span style={{ fontWeight: 400, opacity: 0.6, fontSize: 9 }}>— save to recalculate</span></div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {[
                  { l: "Calories", v: targets.calorie_target ?? "—", u: "kcal", c: "var(--cal-color)"   },
                  { l: "Protein",  v: targets.protein_g      ?? "—", u: "g",    c: "var(--protein)"     },
                  { l: "Carbs",    v: targets.carbs_g        ?? "—", u: "g",    c: "var(--carbs-color)" },
                  { l: "Fat",      v: targets.fat_g          ?? "—", u: "g",    c: "var(--fat-color)"   },
                ].map(({ l, v, u, c }) => (
                  <div key={l} style={{ background: `color-mix(in srgb, ${c} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${c} 20%, transparent)`, borderRadius: 10, padding: "9px 6px", textAlign: "center" }}>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 14, fontWeight: 700, color: c }}>{v}<span style={{ fontSize: 9, opacity: 0.8 }}> {u}</span></div>
                    <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Appearance — slim row at bottom */}
          <div style={card}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,var(--accent2),transparent)", opacity: 0.5 }} aria-hidden="true" />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Dark mode</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{isDark ? "Dark theme active" : "Light theme active"}</div>
              </div>
              <button
                onClick={toggle}
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                style={{ width: 48, height: 26, borderRadius: 99, border: "none", cursor: "pointer", position: "relative", background: isDark ? "var(--accent)" : "var(--border-faint)", transition: "background 0.2s", flexShrink: 0 }}
              >
                <span style={{ position: "absolute", top: 2, left: isDark ? 24 : 2, width: 22, height: 22, borderRadius: "50%", background: isDark ? "var(--accent-contrast)" : "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.25)", transition: "left 0.2s", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>
                  {isDark ? "🌙" : "☀️"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
