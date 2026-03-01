import { useState, useEffect } from "react";
import { useAuth } from "../auth.jsx";
import { useTheme } from "../utils/theme.jsx";
import { apiGet, API_BASE } from "../utils/api.js";
import { DIETARY_PREFS, ALLERGEN_OPTIONS } from "../utils/constants.js";

export default function ProfilePage({ onNav }) {
  const { token, logout } = useAuth();
  const { isDark, toggle: toggleTheme } = useTheme();

  const [profile,       setProfile]       = useState(null);
  const [targets,       setTargets]       = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [error,         setError]         = useState("");
  const [success,       setSuccess]       = useState("");
  const [logoutLoading, setLogoutLoading] = useState(false);

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
    Promise.all([
      apiGet("/api/profile", token).catch(() => ({})),
      apiGet("/api/targets", token).catch(() => ({})),
    ]).then(([pData, tData]) => {
      const p = pData.profile || pData || {};
      const t = tData.targets || tData || {};
      setProfile(p); setTargets(t);
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
    }).catch(e => { console.error("Profile load error:", e); }).finally(() => setLoading(false));
  }, [token]);

  const toggleDiet = (key) => setDietaryRestrictions(p =>
    p.includes(key) ? p.filter(k => k !== key) : [...p, key]
  );

  const handleSave = async () => {
    if (!displayName || !sex || !age || !heightFt || !weightLbs || !goal || !activityLevel) {
      setError("Please fill in all required fields."); return;
    }
    setSaving(true); setError(""); setSuccess("");
    try {
      const totalHeight = parseInt(heightFt || 0) * 12 + parseInt(heightIn || 0);
      await fetch(`${API_BASE}/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          display_name: displayName, sex,
          age: parseInt(age),
          height_in: totalHeight,
          weight_lbs: parseFloat(weightLbs),
          goal, activity_level: activityLevel,
          dietary_restrictions: dietaryRestrictions,
        }),
      });
      await fetch(`${API_BASE}/api/targets`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const tData = await apiGet("/api/targets", token).catch(() => ({}));
      setTargets(tData.targets || tData || {});
      setSuccess("Profile updated!");
      setTimeout(() => setSuccess(""), 3000);
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
    try {
      await logout();
      if (onNav) onNav("home");
    } finally {
      setLogoutLoading(false);
    }
  };

  const OptionBtn = ({ value, current, onSelect, children }) => (
    <button onClick={() => onSelect(value)} aria-pressed={current === value} style={{
      flex: 1, padding: "12px 8px", borderRadius: 12, cursor: "pointer",
      background: current === value ? "var(--accent)12" : "var(--bg-input)",
      border: `2px solid ${current === value ? "var(--accent)" : "var(--border-faint)"}`,
      color: current === value ? "var(--accent)" : "var(--text-muted)",
      fontWeight: 600, fontSize: 13, transition: "all 0.2s",
      boxShadow: current === value ? "0 0 0 2px var(--accent)25" : "none",
    }}>{children}</button>
  );

  const labelStyle = { display: "block", fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: "0.1em", color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 6 };
  const inputStyle = { width: "100%", background: "var(--bg-input)", border: "1px solid var(--border-faint)", borderRadius: 12, padding: "12px 16px", fontSize: 14, color: "var(--text-primary)", boxSizing: "border-box" };
  const cardStyle  = { background: "var(--bg-card)", border: "1px solid var(--border-faint)", borderRadius: 20, padding: 20, marginBottom: 20, position: "relative", overflow: "hidden" };
  const sectionTitle = { fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: "0.12em", color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 16, fontWeight: 600 };

  if (loading) return (
    <div style={{ paddingBottom: 110, animation: "pageIn 0.35s ease", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }} role="status" aria-live="polite">
      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "var(--text-dim)" }}>Loading profile...</div>
    </div>
  );

  return (
    <main style={{ paddingBottom: 110, animation: "pageIn 0.35s ease" }}>
      <div style={{ position: "fixed", top: -80, left: "50%", transform: "translateX(-50%)", width: 500, height: 500, background: "radial-gradient(circle, var(--glow) 0%, transparent 65%)", pointerEvents: "none", zIndex: 0 }} aria-hidden="true" />

      {/* Header */}
      <div style={{ padding: "52px 20px 24px", position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 26, letterSpacing: "-0.02em", color: "var(--text-primary)", lineHeight: 1.2 }}>Your <span style={{ color: "var(--accent)" }}>Profile</span></h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6, lineHeight: 1.4 }}>Update your info to recalculate nutrition targets.</p>
        </div>
        <button onClick={toggleTheme} aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"} title={isDark ? "Light mode" : "Dark mode"} style={{ width: 44, height: 44, borderRadius: 12, background: "var(--bg-input)", border: "1px solid var(--border-faint)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 18, flexShrink: 0 }} aria-hidden="true">
          {isDark ? "\u2600\uFE0F" : "\uD83C\uDF19"}
        </button>
      </div>

      <div style={{ padding: "0 20px 24px", position: "relative", zIndex: 1, maxWidth: 520, margin: "0 auto" }}>
        {error   && <div style={{ background: "var(--danger-bg)", border: "1px solid var(--danger-border)", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "var(--danger)", marginBottom: 16 }} role="alert">{error}</div>}
        {success && <div style={{ background: "var(--accent)10", border: "1px solid var(--accent)25", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "var(--accent)", marginBottom: 16 }} role="status" aria-live="polite">{success}</div>}

        {/* Basic info */}
        <div style={cardStyle}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,var(--accent)50,transparent)", opacity: 0.6 }} aria-hidden="true" />
          <div style={sectionTitle}>Basic info</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Display name</label>
              <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="e.g. Badger" style={inputStyle} aria-label="Display name" />
            </div>
            <div>
              <label style={labelStyle}>Biological sex</label>
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <OptionBtn value="male"   current={sex} onSelect={setSex}>Male</OptionBtn>
                <OptionBtn value="female" current={sex} onSelect={setSex}>Female</OptionBtn>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Age</label>
              <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 20" style={inputStyle} aria-label="Age" />
            </div>
          </div>
        </div>

        {/* Body measurements */}
        <div style={cardStyle}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,var(--accent2)50,transparent)", opacity: 0.6 }} aria-hidden="true" />
          <div style={sectionTitle}>Body measurements</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Height</label>
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <input type="number" value={heightFt} onChange={e => setHeightFt(e.target.value)} placeholder="5" style={{ ...inputStyle, paddingRight: 36 }} aria-label="Height feet" />
                  <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontFamily: "'Space Mono',monospace", fontSize: 11, color: "var(--text-dim)" }} aria-hidden="true">ft</span>
                </div>
                <div style={{ flex: 1, position: "relative" }}>
                  <input type="number" value={heightIn} onChange={e => setHeightIn(e.target.value)} placeholder="10" style={{ ...inputStyle, paddingRight: 36 }} aria-label="Height inches" />
                  <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontFamily: "'Space Mono',monospace", fontSize: 11, color: "var(--text-dim)" }} aria-hidden="true">in</span>
                </div>
              </div>
            </div>
            <div style={{ position: "relative" }}>
              <label style={labelStyle}>Weight</label>
              <input type="number" value={weightLbs} onChange={e => setWeightLbs(e.target.value)} placeholder="155" style={{ ...inputStyle, paddingRight: 40, marginTop: 6 }} aria-label="Weight in pounds" />
              <span style={{ position: "absolute", right: 12, bottom: 12, fontFamily: "'Space Mono',monospace", fontSize: 11, color: "var(--text-dim)" }} aria-hidden="true">lbs</span>
            </div>
          </div>
        </div>

        {/* Goals */}
        <div style={cardStyle}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,var(--warning)50,transparent)", opacity: 0.6 }} aria-hidden="true" />
          <div style={sectionTitle}>Goals</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Goal</label>
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <OptionBtn value="cut"      current={goal} onSelect={setGoal}>Cut</OptionBtn>
                <OptionBtn value="maintain" current={goal} onSelect={setGoal}>Maintain</OptionBtn>
                <OptionBtn value="bulk"     current={goal} onSelect={setGoal}>Bulk</OptionBtn>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Activity level</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 6 }}>
                {[
                  { v: "sedentary", l: "Sedentary", d: "Little or no exercise" },
                  { v: "light",     l: "Light",     d: "Exercise 1–3 days/week" },
                  { v: "moderate",  l: "Moderate",  d: "Exercise 3–5 days/week" },
                  { v: "active",    l: "Active",    d: "Exercise 6–7 days/week" },
                ].map(({ v, l, d }) => (
                  <button key={v} onClick={() => setActivityLevel(v)} aria-pressed={activityLevel === v} style={{ padding: "12px 14px", borderRadius: 12, cursor: "pointer", textAlign: "left", background: activityLevel === v ? "var(--accent)08" : "var(--bg-input)", border: `2px solid ${activityLevel === v ? "var(--accent)" : "var(--border-faint)"}`, transition: "all 0.2s", boxShadow: activityLevel === v ? "0 0 0 2px var(--accent)20" : "none" }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: activityLevel === v ? "var(--accent)" : "var(--text-secondary)" }}>{l}</span>
                    <span style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2, display: "block" }}>{d}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Dietary restrictions */}
        <div style={cardStyle}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,#4ade8050,transparent)", opacity: 0.6 }} aria-hidden="true" />
          <div style={sectionTitle}>Allergens &amp; dietary</div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.5 }}>Select all that apply. Used to filter menu recommendations.</p>

          <div style={{ marginBottom: 20 }}>
            <div style={{ ...labelStyle, marginBottom: 8 }}>Lifestyle</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }} role="group" aria-label="Lifestyle preferences">
            {DIETARY_PREFS.map(({ key, label, icon }) => {
              const active = dietaryRestrictions.includes(key);
              return (
                <button key={key} onClick={() => toggleDiet(key)} aria-pressed={active} style={{ padding: "8px 12px", borderRadius: 99, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: active ? 600 : 400, background: active ? "var(--accent)12" : "var(--bg-input)", border: `2px solid ${active ? "var(--accent)" : "var(--border-faint)"}`, color: active ? "var(--accent)" : "var(--text-secondary)", transition: "all 0.2s" }}>
                  {active && <span style={{ fontSize: 11 }} aria-hidden="true">{"\u2713"}</span>}
                  <span aria-hidden="true">{icon}</span>{label}
                </button>
              );
            })}
          </div>
          </div>

          {/* Allergens section */}
          <div style={{ ...labelStyle, marginBottom: 8 }}>Allergens {"\u2014"} I avoid</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }} role="group" aria-label="Food allergens">
            {ALLERGEN_OPTIONS.map(({ key, label, icon }) => {
              const active = dietaryRestrictions.includes(key);
              return (
                <button key={key} onClick={() => toggleDiet(key)} aria-pressed={active} style={{ padding: "8px 12px", borderRadius: 99, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: active ? 600 : 400, background: active ? "var(--danger-bg)" : "var(--bg-input)", border: `2px solid ${active ? "var(--danger)" : "var(--border-faint)"}`, color: active ? "var(--danger)" : "var(--text-secondary)", transition: "all 0.2s" }}>
                  {active && <span style={{ fontSize: 10 }} aria-hidden="true">{"\u2713"}</span>}
                  <span aria-hidden="true">{icon}</span>{label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Current targets */}
        {targets && (
          <div style={cardStyle}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,var(--protein)50,transparent)", opacity: 0.6 }} aria-hidden="true" />
            <div style={sectionTitle}>Current daily targets</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {[
                { l: "Cal", v: targets.calorie_target ?? "-", u: "kcal", c: "var(--cal-color)" },
                { l: "Protein", v: targets.protein_g ?? "-", u: "g", c: "var(--protein)" },
                { l: "Carbs", v: targets.carbs_g ?? "-", u: "g", c: "var(--carbs-color)" },
                { l: "Fat", v: targets.fat_g ?? "-", u: "g", c: "var(--fat-color)" },
              ].map(({ l, v, u, c }) => (
                <div key={l} style={{ background: `${c}12`, border: `1px solid ${c}25`, borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 15, fontWeight: 700, color: c }}>{v}<span style={{ fontSize: 9, opacity: 0.9 }}> {u}</span></div>
                  <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.06em" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={handleSave} disabled={saving} style={{ width: "100%", padding: 16, borderRadius: 18, border: "none", cursor: saving ? "not-allowed" : "pointer", background: saving ? "var(--bg-input)" : "linear-gradient(135deg,var(--accent),var(--accent2))", fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, color: saving ? "var(--text-muted)" : "var(--accent-contrast)", boxShadow: saving ? "none" : "0 8px 32px var(--accent)40", transition: "all 0.2s" }} aria-label="Save profile and recalculate targets">
            {saving ? "Saving..." : "Save & Recalculate Targets"}
          </button>
          <button type="button" onClick={handleLogout} disabled={logoutLoading} aria-label="Sign out" style={{ width: "100%", padding: 16, borderRadius: 18, border: "none", cursor: logoutLoading ? "not-allowed" : "pointer", background: logoutLoading ? "var(--bg-input)" : "var(--danger)", fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, color: logoutLoading ? "var(--text-muted)" : "#fff", boxShadow: logoutLoading ? "none" : "0 8px 32px var(--danger)40", transition: "all 0.2s", opacity: logoutLoading ? 0.8 : 1 }}>
            {logoutLoading ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </div>
    </main>
  );
}

