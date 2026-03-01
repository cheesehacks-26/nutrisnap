import { useState, useEffect, useContext, createContext, useCallback } from "react";
import { DIETARY_OPTIONS, DIETARY_PREFS, ALLERGEN_OPTIONS } from "./utils/constants.js";

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// CONFIG
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const API = import.meta.env.VITE_API_BASE || "https://badgerbite-api.onrender.com";
const TOKEN_KEY = "bb_token";

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// AUTH CONTEXT
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser]   = useState(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [isValidating, setIsValidating] = useState(!!localStorage.getItem(TOKEN_KEY));

  const login = useCallback((accessToken, userData, isNew = false) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    setToken(accessToken);
    setUser(userData);
    if (isNew) setNeedsOnboarding(true);
  }, []);

  const completeOnboarding = useCallback(() => {
    setNeedsOnboarding(false);
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, [token]);

  // Validate stored token on load â€” prevents auth flash
  useEffect(() => {
    if (!token) { setIsValidating(false); return; }
    setIsValidating(true);
    fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => setUser(data.user || data))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => setIsValidating(false));
  }, [token]);

  return (
    <AuthContext.Provider value={{
      token, user, setUser, login, logout,
      isAuthed: !!token, isValidating,
      needsOnboarding, completeOnboarding,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// API HELPER
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
async function authRequest(path, body) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || data?.message || "Something went wrong");
  return data;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// SHARED STYLES
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const s = {
  page: {
    minHeight: "100vh",
    background: "var(--bg)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 24px",
    fontFamily: "'DM Sans', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  glow: {
    position: "absolute",
    top: -120,
    left: "50%",
    transform: "translateX(-50%)",
    width: 500,
    height: 500,
    background: "radial-gradient(circle, var(--glow) 0%, transparent 65%)",
    pointerEvents: "none",
  },
  card: {
    width: "100%",
    maxWidth: 380,
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: 28,
    padding: "36px 28px",
    position: "relative",
    overflow: "hidden",
  },
  topLine: {
    position: "absolute",
    top: 0, left: 0, right: 0, height: 1,
    background: "linear-gradient(90deg, transparent, var(--accent)40, transparent)",
  },
  logo: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800,
    fontSize: 30,
    letterSpacing: "-0.02em",
    marginBottom: 6,
    color: "var(--text-primary)",
  },
  subtitle: {
    fontSize: 13,
    color: "var(--text-muted)",
    marginBottom: 30,
  },
  label: {
    display: "block",
    fontFamily: "'Space Mono', monospace",
    fontSize: 9,
    letterSpacing: "0.12em",
    color: "var(--text-dim)",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    background: "var(--bg-input)",
    border: "1px solid var(--border)",
    borderRadius: 14,
    padding: "13px 16px",
    fontSize: 14,
    color: "var(--text-primary)",
    outline: "none",
    fontFamily: "'DM Sans', sans-serif",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  },
  inputFocus: {
    borderColor: "var(--accent)50",
  },
  btn: {
    width: "100%",
    padding: "15px",
    borderRadius: 16,
    border: "none",
    cursor: "pointer",
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    fontSize: 15,
    background: "linear-gradient(135deg, var(--accent), var(--accent2))",
    color: "var(--accent-contrast)",
    boxShadow: "0 8px 32px var(--accent)40",
    transition: "opacity 0.2s, transform 0.15s",
    marginTop: 8,
  },
  btnDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
    transform: "none",
  },
  switchText: {
    textAlign: "center",
    fontSize: 13,
    color: "var(--text-muted)",
    marginTop: 22,
  },
  switchLink: {
    color: "var(--accent)",
    cursor: "pointer",
    fontWeight: 600,
    background: "none",
    border: "none",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    padding: 0,
  },
  error: {
    background: "var(--danger-bg)",
    border: "1px solid var(--danger-border)",
    borderRadius: 12,
    padding: "11px 14px",
    fontSize: 13,
    color: "var(--danger)",
    marginBottom: 18,
    lineHeight: 1.5,
  },
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// INPUT COMPONENT
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function Field({ label, type = "text", value, onChange, placeholder, autoComplete }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={s.label}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ ...s.input, ...(focused ? s.inputFocus : {}) }}
      />
    </div>
  );
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// LOGIN PAGE
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
export function LoginPage({ onSwitch }) {
  const { login } = useAuth();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) { setError("Please fill in both fields."); return; }
    setLoading(true); setError("");
    try {
      const data = await authRequest("/auth/login", { email, password });
      login(data.session.access_token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.glow} />
      <div style={s.card}>
        <div style={s.topLine} />
        <div style={s.logo}>Nutri<span style={{ color: "var(--accent)" }}>Snap</span></div>
        <div style={s.subtitle}>Sign in to track your dining hall meals \uD83C\uDF74</div>
        {error && <div style={s.error} role="alert">{error}</div>}
        <Field label="Email" type="email" value={email} onChange={setEmail}
          placeholder="you@wisc.edu" autoComplete="email" />
        <Field label="Password" type="password" value={password} onChange={setPassword}
          placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" autoComplete="current-password" />
        <button
          onClick={handleSubmit}
          disabled={loading}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          style={{ ...s.btn, ...(loading ? s.btnDisabled : {}) }}
          aria-label="Sign in"
        >
          {loading ? "Signing in..." : "Sign in â†’"}
        </button>
        <div style={s.switchText}>
          No account?{" "}
          <button style={s.switchLink} onClick={onSwitch}>Create one</button>
        </div>
      </div>
    </div>
  );
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// REGISTER PAGE
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
export function RegisterPage({ onSwitch }) {
  const { login } = useAuth();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) { setError("Please fill in all fields."); return; }
    if (password !== confirm)  { setError("Passwords don't match."); return; }
    if (password.length < 8)   { setError("Password must be at least 8 characters."); return; }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError("Password must contain at least one uppercase letter and one number."); return;
    }
    setLoading(true); setError("");
    try {
      const data = await authRequest("/auth/register", { email, password });
      login(data.session.access_token, data.user, true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.glow} />
      <div style={s.card}>
        <div style={s.topLine} />
        <div style={s.logo}>Nutri<span style={{ color: "var(--accent)" }}>Snap</span></div>
        <div style={s.subtitle}>Create your account to get started \uD83C\uDF31</div>
        {error && <div style={s.error} role="alert">{error}</div>}
        <Field label="Email" type="email" value={email} onChange={setEmail}
          placeholder="you@wisc.edu" autoComplete="email" />
        <Field label="Password" type="password" value={password} onChange={setPassword}
          placeholder="Min 8 chars, 1 uppercase, 1 number" autoComplete="new-password" />
        <Field label="Confirm password" type="password" value={confirm} onChange={setConfirm}
          placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" autoComplete="new-password" />
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ ...s.btn, ...(loading ? s.btnDisabled : {}) }}
          aria-label="Create account"
        >
          {loading ? "Creating account..." : "Create account â†’"}
        </button>
        <div style={s.switchText}>
          Already have an account?{" "}
          <button style={s.switchLink} onClick={onSwitch}>Sign in</button>
        </div>
      </div>
    </div>
  );
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ONBOARDING PAGE
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
export function OnboardingPage() {
  const { token, completeOnboarding } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [sex, setSex] = useState("");
  const [age, setAge] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [weightLbs, setWeightLbs] = useState("");
  const [goal, setGoal] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [dietaryRestrictions, setDietaryRestrictions] = useState([]);

  const totalHeight = parseInt(heightFt || 0) * 12 + parseInt(heightIn || 0);

  const toggleDiet = (key) => setDietaryRestrictions(p =>
    p.includes(key) ? p.filter(k => k !== key) : [...p, key]
  );

  const handleSubmit = async () => {
    if (!displayName || !sex || !age || !heightFt || !weightLbs || !goal || !activityLevel) {
      setError("Please fill in all required fields."); return;
    }
    setLoading(true); setError("");
    try {
      await fetch(`${API}/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          display_name: displayName,
          sex,
          age: parseInt(age),
          height_in: totalHeight,
          weight_lbs: parseFloat(weightLbs),
          goal,
          activity_level: activityLevel,
          dietary_restrictions: dietaryRestrictions,
        }),
      });
      await fetch(`${API}/api/targets`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      completeOnboarding();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const OptionBtn = ({ value, current, onSelect, children }) => (
    <button onClick={() => onSelect(value)} style={{
      flex: 1, padding: "12px 8px", borderRadius: 14, cursor: "pointer",
      background: current === value ? "var(--accent)18" : "var(--bg-input)",
      border: `2px solid ${current === value ? "var(--accent)" : "var(--border)"}`,
      color: current === value ? "var(--accent)" : "var(--text-muted)",
      fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13,
      transition: "all 0.2s",
      boxShadow: current === value ? "0 0 0 2px var(--accent)25" : "none",
    }}>{children}</button>
  );

  const TOTAL_STEPS = 4;

  const steps = [
    // Step 0: Name + Sex
    <div key={0}>
      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: "var(--text-primary)", marginBottom: 6 }}>
        What should we call you?
      </div>
      <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 28 }}>Step 1 of {TOTAL_STEPS} â€” Basic info</div>
      <Field label="Display name" value={displayName} onChange={setDisplayName} placeholder="e.g. Badger" />
      <div style={{ marginBottom: 18 }}>
        <label style={s.label}>Biological sex</label>
        <div style={{ display: "flex", gap: 10 }}>
          <OptionBtn value="male"   current={sex} onSelect={setSex}>Male</OptionBtn>
          <OptionBtn value="female" current={sex} onSelect={setSex}>Female</OptionBtn>
        </div>
      </div>
      <Field label="Age" type="number" value={age} onChange={setAge} placeholder="e.g. 20" />
      <button onClick={() => { if (!displayName || !sex || !age) { setError("Fill in all fields"); return; } setError(""); setStep(1); }} style={s.btn}>Next â†’</button>
    </div>,

    // Step 1: Height + Weight
    <div key={1}>
      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: "var(--text-primary)", marginBottom: 6 }}>
        Body measurements
      </div>
      <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 28 }}>Step 2 of {TOTAL_STEPS} â€” Used to calculate your calorie needs</div>
      <div style={{ marginBottom: 18 }}>
        <label style={s.label}>Height</label>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <input type="number" value={heightFt} onChange={e => setHeightFt(e.target.value)} placeholder="5" style={{ ...s.input, paddingRight: 32 }} />
            <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontFamily: "'Space Mono',monospace", fontSize: 11, color: "var(--text-dim)" }}>ft</span>
          </div>
          <div style={{ flex: 1, position: "relative" }}>
            <input type="number" value={heightIn} onChange={e => setHeightIn(e.target.value)} placeholder="10" style={{ ...s.input, paddingRight: 32 }} />
            <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontFamily: "'Space Mono',monospace", fontSize: 11, color: "var(--text-dim)" }}>in</span>
          </div>
        </div>
      </div>
      <div style={{ marginBottom: 18, position: "relative" }}>
        <label style={s.label}>Weight</label>
        <input type="number" value={weightLbs} onChange={e => setWeightLbs(e.target.value)} placeholder="155" style={{ ...s.input, paddingRight: 40 }} />
        <span style={{ position: "absolute", right: 12, bottom: 13, fontFamily: "'Space Mono',monospace", fontSize: 11, color: "var(--text-dim)" }}>lbs</span>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => setStep(0)} style={{ ...s.btn, background: "var(--bg-input)", color: "var(--text-muted)", boxShadow: "none", flex: 0.6 }}>â† Back</button>
        <button onClick={() => { if (!heightFt || !weightLbs) { setError("Fill in all fields"); return; } setError(""); setStep(2); }} style={{ ...s.btn, flex: 1 }}>Next â†’</button>
      </div>
    </div>,

    // Step 2: Goal + Activity
    <div key={2}>
      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: "var(--text-primary)", marginBottom: 6 }}>Your goals</div>
      <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 28 }}>Step 3 of {TOTAL_STEPS} â€” We'll personalize your nutrition targets</div>
      <div style={{ marginBottom: 20 }}>
        <label style={s.label}>Goal</label>
        <div style={{ display: "flex", gap: 8 }}>
          <OptionBtn value="cut"      current={goal} onSelect={setGoal}>{"\uD83D\uDCA5"} Cut</OptionBtn>
          <OptionBtn value="maintain" current={goal} onSelect={setGoal}>{"\u2705"} Maintain</OptionBtn>
          <OptionBtn value="bulk"     current={goal} onSelect={setGoal}>{"\uD83C\uDF4A"} Bulk</OptionBtn>
        </div>
      </div>
      <div style={{ marginBottom: 24 }}>
        <label style={s.label}>Activity level</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { v: "sedentary", l: "Sedentary", d: "Little or no exercise" },
            { v: "light",     l: "Light",     d: "Exercise 1â€“3 days/week" },
            { v: "moderate",  l: "Moderate",  d: "Exercise 3â€“5 days/week" },
            { v: "active",    l: "Active",    d: "Exercise 6â€“7 days/week" },
          ].map(({ v, l, d }) => (
            <button key={v} onClick={() => setActivityLevel(v)} style={{
              padding: "12px 16px", borderRadius: 14, cursor: "pointer", textAlign: "left",
              background: activityLevel === v ? "var(--accent)08" : "var(--bg-input)",
              border: `2px solid ${activityLevel === v ? "var(--accent)" : "var(--border-faint)"}`,
              transition: "all 0.2s",
              boxShadow: activityLevel === v ? "0 0 0 2px var(--accent)20" : "none",
            }}>
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 13, color: activityLevel === v ? "var(--accent)" : "var(--text-secondary)" }}>{l}</div>
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>{d}</div>
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => setStep(1)} style={{ ...s.btn, background: "var(--bg-input)", color: "var(--text-muted)", boxShadow: "none", flex: 0.6 }}>â† Back</button>
        <button onClick={() => { if (!goal || !activityLevel) { setError("Select a goal and activity level"); return; } setError(""); setStep(3); }} style={{ ...s.btn, flex: 1 }}>Next â†’</button>
      </div>
    </div>,

    // Step 3: Dietary Restrictions
    <div key={3}>
      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: "var(--text-primary)", marginBottom: 6 }}>Dietary needs</div>
      <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 6 }}>Step 4 of {TOTAL_STEPS} â€” Optional, helps filter the menu</div>
      <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 20 }}>Select all that apply</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 28 }}>
        {DIETARY_OPTIONS.map(({ key, label, icon }) => {
          const active = dietaryRestrictions.includes(key);
          return (
            <button key={key} onClick={() => toggleDiet(key)} style={{
              padding: "10px 16px", borderRadius: 14, cursor: "pointer",
              background: active ? "var(--accent)15" : "var(--bg-input)",
              border: `2px solid ${active ? "var(--accent)" : "var(--border)"}`,
              color: active ? "var(--accent)" : "var(--text-secondary)",
              fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 13,
              display: "flex", alignItems: "center", gap: 6,
              transition: "all 0.2s",
              boxShadow: active ? "0 0 0 2px var(--accent)25" : "none",
            }}>
              <span>{icon}</span> {label}
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => setStep(2)} style={{ ...s.btn, background: "var(--bg-input)", color: "var(--text-muted)", boxShadow: "none", flex: 0.6 }}>â† Back</button>
        <button onClick={handleSubmit} disabled={loading} style={{ ...s.btn, flex: 1, ...(loading ? s.btnDisabled : {}) }}>
          {loading ? "Setting upâ€¦" : "Let's go \uD83C\uDF74"}
        </button>
      </div>
    </div>,
  ];

  return (
    <div style={s.page}>
      <div style={s.glow} />
      <div style={{ ...s.card, maxWidth: 400 }}>
        <div style={s.topLine} />
        <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= step ? "var(--accent)" : "var(--border-faint)", transition: "background 0.3s" }} />
          ))}
        </div>
        {error && <div style={s.error} role="alert">{error}</div>}
        {steps[step]}
      </div>
    </div>
  );
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// AUTH GATE
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
export function AuthGate({ children }) {
  const { isAuthed, needsOnboarding, isValidating } = useAuth();
  const [showLogin, setShowLogin] = useState(true);

  if (isValidating) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "var(--text-dim)" }}>Loadingâ€¦</div>
      </div>
    );
  }

  if (!isAuthed) {
    return showLogin
      ? <LoginPage onSwitch={() => setShowLogin(false)} />
      : <RegisterPage onSwitch={() => setShowLogin(true)} />;
  }
  if (needsOnboarding) return <OnboardingPage />;
  return children;
}

