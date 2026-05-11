const NAV_ITEMS = [
  {
    key: "home", label: "Home",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    key: "snap", label: "Snap",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
        <circle cx="12" cy="13" r="4"/>
      </svg>
    ),
  },
  {
    key: "menu", label: "Menu",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="3" y1="6" x2="21" y2="6"/>
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
      </svg>
    ),
  },
  {
    key: "log", label: "My Log",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
        <line x1="9" y1="12" x2="15" y2="12"/>
        <line x1="9" y1="16" x2="13" y2="16"/>
      </svg>
    ),
  },
  {
    key: "analysis", label: "Analysis",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  {
    key: "profile", label: "Profile",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

export default function BottomNav({ active, onNav }) {
  return (
    <nav
      className="bottom-nav"
      aria-label="Main navigation"
      style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "var(--bg-nav)", backdropFilter: "blur(20px)",
        borderTop: "1px solid var(--border-faint)",
        padding: "10px 8px 24px", display: "flex", justifyContent: "space-around", zIndex: 50,
      }}
    >
      {NAV_ITEMS.map(({ key, icon, label }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            onClick={() => onNav(key)}
            aria-label={label}
            aria-current={isActive ? "page" : undefined}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              cursor: "pointer", transition: "opacity 0.2s",
              background: isActive ? "color-mix(in srgb, var(--accent) 12%, transparent)" : "none",
              border: "none",
              borderRadius: 14,
              padding: "7px 14px",
              minWidth: 52,
              color: isActive ? "var(--accent)" : "var(--text-muted)",
            }}
          >
            <span
              style={{
                display: "flex",
                opacity: isActive ? 1 : 0.55,
                transition: "opacity 0.2s",
              }}
            >
              {icon}
            </span>
            <span
              style={{
                fontFamily: "'DM Sans',sans-serif",
                fontSize: 10,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "var(--accent)" : "var(--text-muted)",
                letterSpacing: "0.01em",
                transition: "color 0.2s",
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
