import { createContext, useContext, useState, useCallback, useLayoutEffect } from "react";

export const ThemeContext = createContext({ isDark: true, toggle: () => {} });
export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem("ns_theme") !== "light"; } catch { return true; }
  });

  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggle = useCallback(() => {
    setIsDark(d => {
      const next = !d;
      try { localStorage.setItem("ns_theme", next ? "dark" : "light"); } catch {}
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark, toggle }}>
      <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
