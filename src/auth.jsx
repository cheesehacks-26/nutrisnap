import { useState, useEffect, useContext, createContext, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════════
const API = "https://badgerbite-api.onrender.com";
const TOKEN_KEY = "bb_token";

// ═══════════════════════════════════════════════════════════════════
// AUTH CONTEXT
// ═══════════════════════════════════════════════════════════════════
export const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser]   = useState(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

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

  // Validate token on load - if stale, clear it
  useEffect(() => {
    if (!token) return;
    fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => setUser(data.user || data))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      });
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, user, setUser, login, logout, isAuthed: !!token, needsOnboarding, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
}

// ═══════════════════════════════════════════════════════════════════
// API HELPER
// ═══════════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════════
// SHARED STYLES
// ═══════════════════════════════════════════════════════════════════
const s = {
  page: {
    minHeight: "100vh",
    background: "#06080f",
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
    background: "radial-gradient(circle, #00f5a00a 0%, transparent 65%)",
    pointerEvents: "none",
  },
  card: {
    width: "100%",
    maxWidth: 380,
    background: "rgba(15,20,40,0.85)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 28,
    padding: "36px 28px",
    position: "relative",
    overflow: "hidden",
  },
  topLine: {
    position: "absolute",
    top: 0, left: 0, right: 0, height: 1,
    background: "linear-gradient(90deg, transparent, #00f5a040, transparent)",
  },
  logo: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800,
    fontSize: 30,
    letterSpacing: "-0.02em",
    marginBottom: 6,
    color: "#f1f5f9",
  },
  subtitle: {
    fontSize: 13,
    color: "#475569",
    marginBottom: 30,
  },
  label: {
    display: "block",
    fontFamily: "'Space Mono', monospace",
    fontSize: 9,
    letterSpacing: "0.12em",
    color: "#334155",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: "13px 16px",
    fontSize: 14,
    color: "#f1f5f9",
    outline: "none",
    fontFamily: "'DM Sans', sans-serif",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  },
  inputFocus: {
    borderColor: "#00f5a050",
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
    background: "linear-gradient(135deg, #00f5a0, #00d9f5)",
    color: "#030912",
    boxShadow: "0 8px 32px #00f5a040",
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
    color: "#475569",
    marginTop: 22,
  },
  switchLink: {
    color: "#00f5a0",
    cursor: "pointer",
    fontWeight: 600,
    background: "none",
    border: "none",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    padding: 0,
  },
  error: {
    background: "rgba(248,113,113,0.1)",
    border: "1px solid rgba(248,113,113,0.25)",
    borderRadius: 12,
    padding: "11px 14px",
    fontSize: 13,
    color: "#f87171",
    marginBottom: 18,
    lineHeight: 1.5,
  },
};

// ═══════════════════════════════════════════════════════════════════
// INPUT COMPONENT
// ═══════════════════════════════════════════════════════════════════
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
        style={{
          ...s.input,
          ...(focused ? s.inputFocus : {}),
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// LOGIN PAGE
// ═══════════════════════════════════════════════════════════════════
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
        <div style={s.logo}>
          Nutri<span style={{ color: "#00f5a0" }}>Snap</span>
        </div>
        <div style={s.subtitle}>Sign in to track your dining hall meals 🦡</div>

        {error && <div style={s.error}>{error}</div>}

        <Field label="Email" type="email" value={email} onChange={setEmail}
          placeholder="you@wisc.edu" autoComplete="email" />
        <Field label="Password" type="password" value={password} onChange={setPassword}
          placeholder="••••••••" autoComplete="current-password" />

        <button
          onClick={handleSubmit}
          disabled={loading}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          style={{ ...s.btn, ...(loading ? s.btnDisabled : {}) }}
        >
          {loading ? "Signing in..." : "Sign in →"}
        </button>

        <div style={s.switchText}>
          No account?{" "}
          <button style={s.switchLink} onClick={onSwitch}>Create one</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// REGISTER PAGE
// ═══════════════════════════════════════════════════════════════════
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
        <div style={s.logo}>
          Nutri<span style={{ color: "#00f5a0" }}>Snap</span>
        </div>
        <div style={s.subtitle}>Create your account to get started 🌱</div>

        {error && <div style={s.error}>{error}</div>}

        <Field label="Email" type="email" value={email} onChange={setEmail}
          placeholder="you@wisc.edu" autoComplete="email" />
        <Field label="Password" type="password" value={password} onChange={setPassword}
          placeholder="Min 8 characters" autoComplete="new-password" />
        <Field label="Confirm password" type="password" value={confirm} onChange={setConfirm}
          placeholder="••••••••" autoComplete="new-password" />

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ ...s.btn, ...(loading ? s.btnDisabled : {}) }}
        >
          {loading ? "Creating account..." : "Create account →"}
        </button>

        <div style={s.switchText}>
          Already have an account?{" "}
          <button style={s.switchLink} onClick={onSwitch}>Sign in</button>
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════
// ONBOARDING PAGE
// ═══════════════════════════════════════════════════════════════════
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

  const totalHeight = parseInt(heightFt||0)*12 + parseInt(heightIn||0);

  const handleSubmit = async () => {
    if (!displayName || !sex || !age || !heightFt || !weightLbs || !goal || !activityLevel) {
      setError("Please fill in all fields."); return;
    }
    setLoading(true); setError("");
    try {
      // 1. Save profile
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
        }),
      });
      // 2. Calculate targets
      await fetch(`${API}/api/targets`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      completeOnboarding();
    } catch (e) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const OptionBtn = ({ value, current, onSelect, children }) => (
    <button onClick={() => onSelect(value)} style={{
      flex: 1, padding: "12px 8px", borderRadius: 14, cursor: "pointer",
      background: current === value ? "rgba(0,245,160,0.12)" : "rgba(255,255,255,0.03)",
      border: `1px solid ${current === value ? "rgba(0,245,160,0.4)" : "rgba(255,255,255,0.07)"}`,
      color: current === value ? "#00f5a0" : "#64748b",
      fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13,
      transition: "all 0.2s",
    }}>{children}</button>
  );

  const steps = [
    // Step 0: Name + Sex
    <div key={0}>
      <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:22,color:"#f1f5f9",marginBottom:6}}>
        What should we call you?
      </div>
      <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#475569",marginBottom:28}}>
        Step 1 of 3 — Basic info
      </div>
      <Field label="Display name" value={displayName} onChange={setDisplayName} placeholder="e.g. Badger" />
      <div style={{marginBottom:18}}>
        <label style={s.label}>Biological sex</label>
        <div style={{display:"flex",gap:10}}>
          <OptionBtn value="male" current={sex} onSelect={setSex}>Male</OptionBtn>
          <OptionBtn value="female" current={sex} onSelect={setSex}>Female</OptionBtn>
        </div>
      </div>
      <Field label="Age" type="number" value={age} onChange={setAge} placeholder="e.g. 20" />
      <button
        onClick={() => { if(!displayName||!sex||!age){setError("Fill in all fields");return;} setError("");setStep(1); }}
        style={s.btn}>Next →</button>
    </div>,

    // Step 1: Height + Weight
    <div key={1}>
      <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:22,color:"#f1f5f9",marginBottom:6}}>
        Body measurements
      </div>
      <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#475569",marginBottom:28}}>
        Step 2 of 3 — Used to calculate your calorie needs
      </div>
      <div style={{marginBottom:18}}>
        <label style={s.label}>Height</label>
        <div style={{display:"flex",gap:10}}>
          <div style={{flex:1,position:"relative"}}>
            <input type="number" value={heightFt} onChange={e=>setHeightFt(e.target.value)}
              placeholder="5" style={{...s.input,paddingRight:32}}/>
            <span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",fontFamily:"'Space Mono',monospace",fontSize:11,color:"#334155"}}>ft</span>
          </div>
          <div style={{flex:1,position:"relative"}}>
            <input type="number" value={heightIn} onChange={e=>setHeightIn(e.target.value)}
              placeholder="10" style={{...s.input,paddingRight:32}}/>
            <span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",fontFamily:"'Space Mono',monospace",fontSize:11,color:"#334155"}}>in</span>
          </div>
        </div>
      </div>
      <div style={{marginBottom:18,position:"relative"}}>
        <label style={s.label}>Weight</label>
        <input type="number" value={weightLbs} onChange={e=>setWeightLbs(e.target.value)}
          placeholder="155" style={{...s.input,paddingRight:40}}/>
        <span style={{position:"absolute",right:12,bottom:13,fontFamily:"'Space Mono',monospace",fontSize:11,color:"#334155"}}>lbs</span>
      </div>
      <div style={{display:"flex",gap:10}}>
        <button onClick={()=>setStep(0)} style={{...s.btn,background:"rgba(255,255,255,0.05)",color:"#64748b",boxShadow:"none",flex:0.6}}>← Back</button>
        <button onClick={()=>{ if(!heightFt||!weightLbs){setError("Fill in all fields");return;} setError("");setStep(2);}} style={{...s.btn,flex:1}}>Next →</button>
      </div>
    </div>,

    // Step 2: Goal + Activity
    <div key={2}>
      <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:22,color:"#f1f5f9",marginBottom:6}}>
        Your goals
      </div>
      <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#475569",marginBottom:28}}>
        Step 3 of 3 — We'll personalize your nutrition targets
      </div>
      <div style={{marginBottom:20}}>
        <label style={s.label}>Goal</label>
        <div style={{display:"flex",gap:8}}>
          <OptionBtn value="cut" current={goal} onSelect={setGoal}>🔥 Cut</OptionBtn>
          <OptionBtn value="maintain" current={goal} onSelect={setGoal}>⚖️ Maintain</OptionBtn>
          <OptionBtn value="bulk" current={goal} onSelect={setGoal}>💪 Bulk</OptionBtn>
        </div>
      </div>
      <div style={{marginBottom:24}}>
        <label style={s.label}>Activity level</label>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {[
            {v:"sedentary",l:"Sedentary",d:"Little or no exercise"},
            {v:"light",l:"Light",d:"Exercise 1–3 days/week"},
            {v:"moderate",l:"Moderate",d:"Exercise 3–5 days/week"},
            {v:"active",l:"Active",d:"Exercise 6–7 days/week"},
          ].map(({v,l,d})=>(
            <button key={v} onClick={()=>setActivityLevel(v)} style={{
              padding:"12px 16px",borderRadius:14,cursor:"pointer",textAlign:"left",
              background:activityLevel===v?"rgba(0,245,160,0.08)":"rgba(255,255,255,0.03)",
              border:`1px solid ${activityLevel===v?"rgba(0,245,160,0.35)":"rgba(255,255,255,0.06)"}`,
              transition:"all 0.2s",
            }}>
              <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:13,color:activityLevel===v?"#00f5a0":"#94a3b8"}}>{l}</div>
              <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#334155",marginTop:2}}>{d}</div>
            </button>
          ))}
        </div>
      </div>
      <div style={{display:"flex",gap:10}}>
        <button onClick={()=>setStep(1)} style={{...s.btn,background:"rgba(255,255,255,0.05)",color:"#64748b",boxShadow:"none",flex:0.6}}>← Back</button>
        <button onClick={handleSubmit} disabled={loading} style={{...s.btn,flex:1,...(loading?s.btnDisabled:{})}}>
          {loading ? "Setting up…" : "Let's go 🦡"}
        </button>
      </div>
    </div>,
  ];

  return (
    <div style={s.page}>
      <div style={s.glow}/>
      <div style={{...s.card, maxWidth:400}}>
        <div style={s.topLine}/>
        {/* Progress bar */}
        <div style={{display:"flex",gap:6,marginBottom:28}}>
          {[0,1,2].map(i=>(
            <div key={i} style={{flex:1,height:3,borderRadius:99,background:i<=step?"#00f5a0":"rgba(255,255,255,0.06)",transition:"background 0.3s"}}/>
          ))}
        </div>
        {error && <div style={s.error}>{error}</div>}
        {steps[step]}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// AUTH GATE  (renders login/register if not authed, children if authed)
// ═══════════════════════════════════════════════════════════════════
export function AuthGate({ children }) {
  const { isAuthed, needsOnboarding } = useAuth();
  const [showLogin, setShowLogin] = useState(true);

  if (!isAuthed) {
    return showLogin
      ? <LoginPage   onSwitch={() => setShowLogin(false)} />
      : <RegisterPage onSwitch={() => setShowLogin(true)}  />;
  }
  if (needsOnboarding) {
    return <OnboardingPage />;
  }
  return children;
}
