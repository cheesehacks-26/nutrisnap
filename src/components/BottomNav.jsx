const NAV_ITEMS = [
  { key: "home",    icon: "🏠", label: "Home"    },
  { key: "snap",    icon: "📸", label: "Snap"    },
  { key: "menu",    icon: "📋", label: "Menu"    },
  { key: "log",     icon: "📝", label: "My Log"  },
  { key: "analysis", icon: "📈", label: "Analysis" },
  { key: "profile", icon: "👤", label: "Profile" },
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
            }}
          >
            <span
              style={{
                fontSize: 20,
                filter: isActive ? "none" : "grayscale(0.4)",
                opacity: isActive ? 1 : 0.55,
                transition: "opacity 0.2s, filter 0.2s",
              }}
              aria-hidden="true"
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
