import { useState } from "react";
import { AuthProvider, AuthGate } from "./auth.jsx";
import { ThemeProvider, useTheme } from "./utils/theme.jsx";
import BottomNav    from "./components/BottomNav.jsx";
import Dashboard    from "./components/Dashboard.jsx";
import SnapPage     from "./components/SnapPage.jsx";
import MenuBrowser  from "./components/MenuBrowser.jsx";
import Trends       from "./components/Trends.jsx";
import ProfilePage  from "./components/ProfilePage.jsx";

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// SIDEBAR NAV â€” desktop only (hidden on mobile via CSS)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const NAV_ITEMS = [
  { key: "home",    icon: "\uD83C\uDFE0", label: "Home"    },
  { key: "snap",    icon: "\uD83D\uDCF8", label: "Snap"    },
  { key: "menu",    icon: "\uD83D\uDCCB", label: "Menu"    },
  { key: "trends",  icon: "\uD83D\uDCC8", label: "Trends"  },
  { key: "profile", icon: "\uD83D\uDC64", label: "Profile" },
];

function SidebarNav({ active, onNav }) {
  const { isDark, toggle } = useTheme();
  return (
    <nav className="app-sidebar" aria-label="Main navigation">
      <div className="sidebar-brand">NutriSnap</div>
      {NAV_ITEMS.map(({ key, icon, label }) => (
        <button
          key={key}
          onClick={() => onNav(key)}
          aria-label={label}
          aria-current={active === key ? "page" : undefined}
          className={`sidebar-item${active === key ? " active" : ""}`}
        >
          <span className="sidebar-icon" aria-hidden="true">{icon}</span>
          <span className="sidebar-label">{label}</span>
        </button>
      ))}
      <button
        onClick={toggle}
        className="sidebar-theme-toggle"
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        <span className="sidebar-icon" aria-hidden="true">{isDark ? "\u2600\uFE0F" : "\uD83C\uDF19"}</span>
        <span className="sidebar-label">{isDark ? "Light" : "Dark"}</span>
      </button>
    </nav>
  );
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// GLOBAL CSS â€” CSS variables for dark/light themes + animations
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');

/* â”€â”€ DARK THEME (default) â”€â”€ */
:root, [data-theme="dark"] {
  --bg:           #070a12;
  --bg-surface:   rgba(16,22,40,0.94);
  --bg-card:      rgba(255,255,255,0.04);
  --bg-input:     rgba(255,255,255,0.06);
  --bg-nav:       rgba(7,10,18,0.98);
  --border:       rgba(255,255,255,0.12);
  --border-faint: rgba(255,255,255,0.08);
  --text-primary:   #f8fafc;
  --text-secondary: #cbd5e1;
  --text-muted:     #94a3b8;
  --text-dim:       #64748b;
  --accent:           #00f0a4;
  --accent2:          #00cdee;
  --accent-contrast:  #041016;
  --danger:    #f87171;
  --danger-bg:  rgba(248,113,113,0.1);
  --danger-border: rgba(248,113,113,0.25);
  --warning:   #fbbf24;
  --warning-bg: rgba(251,191,36,0.15);
  --protein:       #60a5fa;
  --carbs-color:   #fbbf24;
  --fat-color:     #f97316;
  --cal-color:     #f472b6;
  --glow:  rgba(0,245,160,0.06);
}

/* â”€â”€ LIGHT THEME â”€â”€ */
[data-theme="light"] {
  --bg:           #f4f7fb;
  --bg-surface:   rgba(255,255,255,0.98);
  --bg-card:      rgba(255,255,255,0.92);
  --bg-input:     rgba(15,23,42,0.06);
  --bg-nav:       rgba(244,247,251,0.98);
  --border:       rgba(15,23,42,0.12);
  --border-faint: rgba(15,23,42,0.08);
  --text-primary:   #0b1220;
  --text-secondary: #1f2937;
  --text-muted:     #475569;
  --text-dim:       #64748b;
  --accent:           #039b6f;
  --accent2:          #0284a2;
  --accent-contrast:  #ffffff;
  --danger:    #dc2626;
  --danger-bg:  rgba(220,38,38,0.1);
  --danger-border: rgba(220,38,38,0.25);
  --warning:   #d97706;
  --warning-bg: rgba(217,119,6,0.15);
  --protein:       #2563eb;
  --carbs-color:   #d97706;
  --fat-color:     #ea580c;
  --cal-color:     #db2777;
  --glow:  rgba(0,163,104,0.04);
}

/* â”€â”€ RESETS â”€â”€ */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body {
  background: var(--bg);
  color: var(--text-primary);
  font-family: 'DM Sans', sans-serif;
  min-height: 100%;
  -webkit-tap-highlight-color: transparent;
}

/* â”€â”€ SCROLLBAR â”€â”€ */
::-webkit-scrollbar { width: 3px; height: 3px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }

/* â”€â”€ INPUTS â”€â”€ */
input::placeholder { color: var(--text-dim); }
input { caret-color: var(--accent); outline: none; color: var(--text-primary); }
button { font-family: 'DM Sans', sans-serif; }

/* â”€â”€ THEME FADE â”€â”€ */
body, .app-root, .app-content, .app-page, .app-sidebar, .bottom-nav {
  transition: background-color 0.25s ease, color 0.25s ease;
}
button, input, select, textarea {
  transition: background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}

/* â”€â”€ LAYOUT â”€â”€ */
.app-root    { width: 100%; min-height: 100vh; background: var(--bg); }
.app-content { min-height: 100vh; display: flex; flex-direction: column; }
.app-page    { flex: 1; width: 100%; }

/* â”€â”€ SIDEBAR (desktop) â”€â”€ */
.app-sidebar { display: none; }

@media (min-width: 768px) {
  .app-sidebar {
    display: flex; flex-direction: column;
    position: fixed; top: 0; left: 0;
    width: 220px; height: 100vh;
    background: var(--bg-surface);
    border-right: 1px solid var(--border);
    padding: 28px 12px; gap: 4px;
    z-index: 200; overflow-y: auto;
  }
  .app-content       { margin-left: 220px; }
  .bottom-nav        { display: none !important; }
  .app-content main  { padding-bottom: 48px !important; }
  .app-page         { max-width: 1040px; margin: 0 auto; }
}

@media (min-width: 1024px) and (max-width: 1440px) {
  body { font-size: 15px; }
  .app-page { max-width: 980px; }
}

/* Trends page: comfortable width and larger components on big screens */
@media (min-width: 1024px) {
  .trends-page .trends-inner { max-width: 640px; margin-left: auto; margin-right: auto; padding-left: 28px; padding-right: 28px; }
  .trends-page .trends-stats > div { flex: 1 1 140px; padding: 18px 12px; }
  .trends-page .trends-chart-wrap { min-height: 220px; }
  .trends-page [role="tablist"] { padding: 8px; }
}

/* Icon-only sidebar on small landscape screens (phones in landscape) */
@media (min-width: 768px) and (max-height: 520px) {
  .app-sidebar  { width: 64px; padding: 16px 8px; align-items: center; }
  .app-content  { margin-left: 64px; }
  .sidebar-label, .sidebar-brand { display: none; }
  .sidebar-item { justify-content: center; }
}

/* â”€â”€ SIDEBAR ITEM STYLES â”€â”€ */
.sidebar-brand {
  font-family: 'Syne', sans-serif; font-weight: 800; font-size: 17px;
  color: var(--accent); padding: 4px 12px 20px; letter-spacing: -0.02em;
}
.sidebar-item {
  display: flex; align-items: center; gap: 11px;
  padding: 11px 14px; border-radius: 14px; cursor: pointer;
  font-family: 'DM Sans', sans-serif; font-weight: 500; font-size: 14px;
  color: var(--text-secondary); background: none; border: none;
  width: 100%; text-align: left; transition: background 0.15s, color 0.15s;
}
.sidebar-item:hover  { background: var(--bg-card); color: var(--text-primary); }
.sidebar-item.active { background: color-mix(in srgb, var(--accent) 12%, transparent); color: var(--accent); font-weight: 600; }
.sidebar-icon { font-size: 18px; flex-shrink: 0; width: 24px; text-align: center; }
.sidebar-theme-toggle {
  margin-top: auto; display: flex; align-items: center; gap: 11px;
  padding: 11px 14px; border-radius: 14px; cursor: pointer;
  font-family: 'DM Sans', sans-serif; font-size: 13px;
  color: var(--text-muted); background: none; border: none;
  width: 100%; text-align: left; transition: background 0.15s;
}
.sidebar-theme-toggle:hover { background: var(--bg-card); }

@media (max-width: 360px) { .app-root { font-size: 14px; } }

/* â”€â”€ ANIMATIONS â”€â”€ */
@keyframes fadeSlideUp    { from { opacity:0; transform:translateY(16px); }  to { opacity:1; transform:translateY(0); } }
@keyframes fadeIn         { from { opacity:0; }                              to { opacity:1; } }
@keyframes float          { 0%,100%{transform:translateY(0);}               50%{transform:translateY(-7px);} }
@keyframes scanline       { 0%{top:-2px;} 50%{top:100%;} 100%{top:-2px;} }
@keyframes shimmer        { 0%{background-position:0% 0;} 100%{background-position:200% 0;} }
@keyframes pulse-ring     { 0%{transform:scale(0.95);box-shadow:0 0 0 0 rgba(0,245,160,0.4);} 70%{transform:scale(1);box-shadow:0 0 0 16px transparent;} 100%{transform:scale(0.95);box-shadow:0 0 0 0 transparent;} }
@keyframes spin-slow      { from{transform:rotate(0deg);}                   to{transform:rotate(360deg);} }
@keyframes waveIn         { 0%{transform:scale(0.5);opacity:0;} 60%{transform:scale(1.1);opacity:1;} 100%{transform:scale(1);} }
@keyframes analyzing-bar  { 0%{width:0%;} 100%{width:100%;} }
@keyframes pageIn         { from{opacity:0;transform:translateY(10px);}      to{opacity:1;transform:translateY(0);} }
`;

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// ROOT APP
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
export default function App() {
  const [page, setPage] = useState("home");

  const pages = {
    home:    <Dashboard   onNav={setPage} />,
    snap:    <SnapPage    onNav={setPage} />,
    menu:    <MenuBrowser />,
    trends:  <Trends />,
    profile: <ProfilePage onNav={setPage} />,
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <style>{GLOBAL_CSS}</style>
        <div className="app-root">
          <AuthGate>
            <SidebarNav active={page} onNav={setPage} />
            <div className="app-content">
              <div key={page} className="app-page">
                {pages[page]}
              </div>
              <BottomNav active={page} onNav={setPage} />
            </div>
          </AuthGate>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}







