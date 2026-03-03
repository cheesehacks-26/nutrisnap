const NAV_ITEMS = [
  { key: "home",    icon: "\uD83C\uDFE0", label: "Home"    },
  { key: "snap",    icon: "\uD83D\uDCF8", label: "Snap"    },
  { key: "menu",    icon: "\uD83D\uDCCB", label: "Menu"    },
  { key: "log",     icon: "\uD83D\uDCDD", label: "My Log"  },
  { key: "analysis", icon: "\uD83D\uDCC8", label: "Analysis" },
  { key: "profile", icon: "\uD83D\uDC64", label: "Profile" },
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
        padding: "14px 24px 28px", display: "flex", justifyContent: "space-around", zIndex: 50,
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
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              cursor: "pointer", opacity: isActive ? 1 : 0.32, transition: "opacity 0.2s",
              background: "none", border: "none", padding: 0,
            }}
          >
            <span style={{ fontSize: 20 }} aria-hidden="true">{icon}</span>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: isActive ? "var(--accent)" : "var(--text-muted)", letterSpacing: "0.05em" }}>{label}</span>
            {isActive && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--accent)" }} aria-hidden="true" />}
          </button>
        );
      })}
    </nav>
  );
}
