import { useState, useEffect, useContext, createContext, useCallback } from "react";
import { DIETARY_OPTIONS, DIETARY_PREFS, ALLERGEN_OPTIONS } from "./utils/constants.js";

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// CONFIG
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const API = import.meta.env.VITE_API_BASE || "https://nutrisnap-api.onrender.com";
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

  // When API returns 401 (invalid/expired token), clear session so user is sent to login
  useEffect(() => {
    const onSessionExpired = () => {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    };
    window.addEventListener("auth:sessionExpired", onSessionExpired);
    return () => window.removeEventListener("auth:sessionExpired", onSessionExpired);
  }, []);

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
  let res;
  try {
    res = await fetch(`${API}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Cannot reach server -- it may be waking up. Please try again in a few seconds.");
  }
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
        <div style={s.subtitle}>Sign in to track your dining hall meals</div>
        {error && <div style={s.error} role="alert">{error}</div>}
        <Field label="Email" type="email" value={email} onChange={setEmail}
          placeholder="you@wisc.edu" autoComplete="email" />
        <Field label="Password" type="password" value={password} onChange={setPassword}
          placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" autoComplete="current-password" />
        <button
          onClick={handleSubmit}
          disabled={loading}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          style={{ ...s.btn, ...(loading ? s.btnDisabled : {}) }}
          aria-label="Sign in"
        >
          {loading ? "Signing in..." : "Sign in \u2192"}
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
        <div style={s.subtitle}>Create your account to get started</div>
        {error && <div style={s.error} role="alert">{error}</div>}
        <Field label="Email" type="email" value={email} onChange={setEmail}
          placeholder="you@wisc.edu" autoComplete="email" />
        <Field label="Password" type="password" value={password} onChange={setPassword}
          placeholder="Min 8 chars, 1 uppercase, 1 number" autoComplete="new-password" />
        <Field label="Confirm password" type="password" value={confirm} onChange={setConfirm}
          placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" autoComplete="new-password" />
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ ...s.btn, ...(loading ? s.btnDisabled : {}) }}
          aria-label="Create account"
        >
          {loading ? "Creating account..." : "Create account \u2192"}
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
const cardStyle = { background: "var(--bg-card)", border: "1px solid var(--border-faint)", borderRadius: 20, padding: 20, marginBottom: 20, position: "relative", overflow: "hidden" };
const sectionTitle = { fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: "0.12em", color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 16, fontWeight: 600 };
const labelStyle = { display: "block", fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: "0.1em", color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 6 };
const inputStyle = { width: "100%", background: "var(--bg-input)", border: "1px solid var(--border-faint)", borderRadius: 12, padding: "12px 16px", fontSize: 14, color: "var(--text-primary)", boxSizing: "border-box" };

export function OnboardingPage() {
  const { token, completeOnboarding } = useAuth();
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
    <button type="button" onClick={() => onSelect(value)} style={{
      flex: 1, padding: "12px 8px", borderRadius: 12, cursor: "pointer",
      background: current === value ? "var(--accent)12" : "var(--bg-input)",
      border: `2px solid ${current === value ? "var(--accent)" : "var(--border-faint)"}`,
      color: current === value ? "var(--accent)" : "var(--text-muted)",
      fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13,
      transition: "all 0.2s",
      boxShadow: current === value ? "0 0 0 2px var(--accent)25" : "none",
    }}>{children}</button>
  );

  return (
    <div style={{ ...s.page, justifyContent: "flex-start", paddingTop: 48, paddingBottom: 48 }}>
      <div style={s.glow} />
      <div style={{ width: "100%", maxWidth: 520, margin: "0 auto", padding: "0 20px", position: "relative", zIndex: 1 }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 26, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>Complete your <span style={{ color: "var(--accent)" }}>profile</span></h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}>We'll use this to personalize your nutrition targets.</p>
        </div>
        {error && <div style={{ ...s.error, marginBottom: 16 }} role="alert">{error}</div>}

        <div style={cardStyle}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,var(--accent)50,transparent)", opacity: 0.6 }} />
          <div style={sectionTitle}>Basic info</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Display name</label>
              <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="e.g. Badger" style={inputStyle} aria-label="Display name" />
            </div>
            <div>
              <label style={labelStyle}>Biological sex</label>
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <OptionBtn value="male" current={sex} onSelect={setSex}>Male</OptionBtn>
                <OptionBtn value="female" current={sex} onSelect={setSex}>Female</OptionBtn>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Age</label>
              <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 20" style={inputStyle} aria-label="Age" />
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,var(--accent2)50,transparent)", opacity: 0.6 }} />
          <div style={sectionTitle}>Body measurements</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Height</label>
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <input type="number" value={heightFt} onChange={e => setHeightFt(e.target.value)} placeholder="5" style={{ ...inputStyle, paddingRight: 36 }} aria-label="Height feet" />
                  <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontFamily: "'Space Mono',monospace", fontSize: 11, color: "var(--text-dim)" }}>ft</span>
                </div>
                <div style={{ flex: 1, position: "relative" }}>
                  <input type="number" value={heightIn} onChange={e => setHeightIn(e.target.value)} placeholder="10" style={{ ...inputStyle, paddingRight: 36 }} aria-label="Height inches" />
                  <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontFamily: "'Space Mono',monospace", fontSize: 11, color: "var(--text-dim)" }}>in</span>
                </div>
              </div>
            </div>
            <div style={{ position: "relative" }}>
              <label style={labelStyle}>Weight</label>
              <input type="number" value={weightLbs} onChange={e => setWeightLbs(e.target.value)} placeholder="155" style={{ ...inputStyle, paddingRight: 40, marginTop: 6 }} aria-label="Weight in pounds" />
              <span style={{ position: "absolute", right: 12, bottom: 12, fontFamily: "'Space Mono',monospace", fontSize: 11, color: "var(--text-dim)" }}>lbs</span>
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,var(--warning)50,transparent)", opacity: 0.6 }} />
          <div style={sectionTitle}>Goals</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Goal</label>
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <OptionBtn value="cut" current={goal} onSelect={setGoal}>Cut</OptionBtn>
                <OptionBtn value="maintain" current={goal} onSelect={setGoal}>Maintain</OptionBtn>
                <OptionBtn value="bulk" current={goal} onSelect={setGoal}>Bulk</OptionBtn>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Activity level</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 6 }}>
                {[{ v: "sedentary", l: "Sedentary", d: "Little or no exercise" }, { v: "light", l: "Light", d: "Exercise 1\u20133 days/week" }, { v: "moderate", l: "Moderate", d: "Exercise 3\u20135 days/week" }, { v: "active", l: "Active", d: "Exercise 6\u20137 days/week" }].map(({ v, l, d }) => (
                  <button type="button" key={v} onClick={() => setActivityLevel(v)} style={{ padding: "12px 14px", borderRadius: 12, cursor: "pointer", textAlign: "left", background: activityLevel === v ? "var(--accent)08" : "var(--bg-input)", border: `2px solid ${activityLevel === v ? "var(--accent)" : "var(--border-faint)"}`, transition: "all 0.2s", boxShadow: activityLevel === v ? "0 0 0 2px var(--accent)20" : "none" }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: activityLevel === v ? "var(--accent)" : "var(--text-secondary)" }}>{l}</span>
                    <span style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2, display: "block" }}>{d}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,#4ade8050,transparent)", opacity: 0.6 }} />
          <div style={sectionTitle}>Dietary preferences (optional)</div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12, lineHeight: 1.5 }}>Lifestyle or diet type. Used to filter menu recommendations.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }} role="group" aria-label="Dietary preferences">
            {DIETARY_PREFS.map(({ key, label, icon }) => {
              const active = dietaryRestrictions.includes(key);
              return (
                <button type="button" key={key} onClick={() => toggleDiet(key)} style={{ padding: "8px 12px", borderRadius: 99, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: active ? 600 : 400, background: active ? "var(--accent)12" : "var(--bg-input)", border: `2px solid ${active ? "var(--accent)" : "var(--border-faint)"}`, color: active ? "var(--accent)" : "var(--text-secondary)", transition: "all 0.2s" }}>
                  {active && <span style={{ fontSize: 10 }}>{"\u2713"}</span>}<span>{icon}</span>{label}
                </button>
              );
            })}
          </div>

          <div style={{ ...sectionTitle, marginTop: 24, marginBottom: 4 }}>Allergens (optional)</div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12, lineHeight: 1.5 }}>Ingredients to avoid for safety or preference.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }} role="group" aria-label="Allergens to avoid">
            {ALLERGEN_OPTIONS.map(({ key, label, icon }) => {
              const active = dietaryRestrictions.includes(key);
              return (
                <button type="button" key={key} onClick={() => toggleDiet(key)} style={{ padding: "8px 12px", borderRadius: 99, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: active ? 600 : 400, background: active ? "var(--danger-bg)" : "var(--bg-input)", border: `2px solid ${active ? "var(--danger)" : "var(--border-faint)"}`, color: active ? "var(--danger)" : "var(--text-secondary)", transition: "all 0.2s" }}>
                  {active && <span style={{ fontSize: 10 }}>{"\u2713"}</span>}<span>{icon}</span>{label}
                </button>
              );
            })}
          </div>
        </div>

        <button type="button" onClick={handleSubmit} disabled={loading} style={{ width: "100%", padding: 16, borderRadius: 18, border: "none", cursor: loading ? "not-allowed" : "pointer", background: loading ? "var(--bg-input)" : "linear-gradient(135deg,var(--accent),var(--accent2))", fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, color: loading ? "var(--text-muted)" : "var(--accent-contrast)", boxShadow: loading ? "none" : "0 8px 32px var(--accent)40", transition: "all 0.2s" }}>
          {loading ? "Setting up\u2026" : "Let's go \uD83C\uDF74"}
        </button>
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

