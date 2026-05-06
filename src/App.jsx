import { useState } from "react";
import "./App.css";
import { AuthProvider, AuthGate } from "./auth.jsx";
import { ThemeProvider } from "./utils/theme.jsx";
import BottomNav    from "./components/BottomNav.jsx";
import Dashboard    from "./components/Dashboard.jsx";
import SnapPage     from "./components/SnapPage.jsx";
import MenuBrowser  from "./components/MenuBrowser.jsx";
import MyLogPage    from "./components/MyLogPage.jsx";
import Trends       from "./components/Trends.jsx";
import ProfilePage  from "./components/ProfilePage.jsx";

const NAV_ICONS = {
  home: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  snap: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  ),
  menu: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  log: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
      <line x1="9" y1="12" x2="15" y2="12"/>
      <line x1="9" y1="16" x2="13" y2="16"/>
    </svg>
  ),
  analysis: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  profile: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
};

const NAV_ITEMS = [
  { key: "home",     label: "Home"     },
  { key: "snap",     label: "Snap"     },
  { key: "menu",     label: "Menu"     },
  { key: "log",      label: "My Log"   },
  { key: "analysis", label: "Analysis" },
  { key: "profile",  label: "Profile"  },
];

function SidebarNav({ active, onNav }) {
  return (
    <nav className="app-sidebar" aria-label="Main navigation">
      <div className="sidebar-brand">NutriSnap</div>
      {NAV_ITEMS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onNav(key)}
          aria-label={label}
          aria-current={active === key ? "page" : undefined}
          className={`sidebar-item${active === key ? " active" : ""}`}
        >
          <span className="sidebar-icon">{NAV_ICONS[key]}</span>
          <span className="sidebar-label">{label}</span>
        </button>
      ))}
    </nav>
  );
}

export default function App() {
  const [page, setPage] = useState("home");

  const pages = {
    home:    <Dashboard   onNav={setPage} />,
    snap:    <SnapPage    onNav={setPage} />,
    menu:    <MenuBrowser onNav={setPage} />,
    log:     <MyLogPage   onNav={setPage} />,
    analysis: <Trends />,
    profile: <ProfilePage onNav={setPage} />,
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="app-root">
          <AuthGate>
            <SidebarNav active={page} onNav={setPage} />
            <div className="app-content">
              <div key={page} className={"app-page" + (page === "profile" ? " app-page--profile" : "")}>
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
