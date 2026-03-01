import { useState, useContext, createContext, useCallback } from "react";

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

  const login = useCallback((accessToken, userData) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    setToken(accessToken);
    setUser(userData);
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

  return (
    <AuthContext.Provider value={{ token, user, setUser, login, logout, isAuthed: !!token }}>
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
// AUTH GATE  (renders login/register if not authed, children if authed)
// ═══════════════════════════════════════════════════════════════════
export function AuthGate({ children }) {
  const { isAuthed } = useAuth();
  const [showLogin, setShowLogin] = useState(true);

  if (!isAuthed) {
    return showLogin
      ? <LoginPage   onSwitch={() => setShowLogin(false)} />
      : <RegisterPage onSwitch={() => setShowLogin(true)}  />;
  }
  return children;
}
