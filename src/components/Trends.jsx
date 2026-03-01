import { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "../auth.jsx";
import { apiGet } from "../utils/api.js";

const CH = 160, CW = 340, PL = 36, PB = 28, PR = 12, PT = 16, IW = CW - PL - PR, IH = CH - PT - PB;
const CAL_MAX = 2800;
const xp = (i, len) => PL + (i / Math.max(len - 1, 1)) * IW;
const yp = (v, m) => PT + IH - (v / m) * IH;

function LineChart({ activeDay, onDayClick, weekData, goalsT }) {
  const pathRef = useRef(null);
  const [drawn, setDrawn] = useState(0);
  const [len, setLen] = useState(1000);
  const n = weekData.length;
  const linePath = weekData.map((d, i) => `${i === 0 ? "M" : "L"} ${xp(i, n).toFixed(1)} ${yp(d.calories, CAL_MAX).toFixed(1)}`).join(" ");
  const areaPath = linePath + ` L ${xp(n - 1, n).toFixed(1)} ${(PT + IH).toFixed(1)} L ${xp(0, n).toFixed(1)} ${(PT + IH).toFixed(1)} Z`;
  const goalY = yp(goalsT.calories, CAL_MAX);

  useEffect(() => {
    if (!pathRef.current) return;
    const l = pathRef.current.getTotalLength();
    setLen(l); setDrawn(0);
    const start = performance.now();
    const tick = now => { const t = Math.min(1, (now - start) / 900); setDrawn(l * (1 - Math.pow(1 - t, 3))); if (t < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }, [weekData]);

  return (
    <svg width="100%" viewBox={`0 0 ${CW} ${CH}`} style={{ overflow: "visible" }} aria-label="Calorie trend chart" role="img">
      <defs>
        <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="var(--accent2)" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map(f => { const y = PT + IH * (1 - f); return (
        <g key={f}>
          <line x1={PL} y1={y} x2={CW - PR} y2={y} stroke="var(--border-faint)" strokeWidth="1" />
          <text x={PL - 4} y={y + 4} textAnchor="end" fill="var(--text-dim)" fontSize="8" fontFamily="Space Mono,monospace">{Math.round(CAL_MAX * f / 100) * 100}</text>
        </g>
      ); })}
      <line x1={PL} y1={goalY} x2={CW - PR} y2={goalY} stroke="var(--accent)" strokeWidth="1" strokeDasharray="4 4" opacity="0.35" />
      <path d={areaPath} fill="url(#ag)" />
      <path ref={pathRef} d={linePath} fill="none" stroke="url(#lg)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len - drawn} />
      {weekData.map((d, i) => {
        const cx = xp(i, n), cy = yp(d.calories, CAL_MAX), isActive = activeDay === i, over = d.calories > goalsT.calories;
        return (
          <g key={i} onClick={() => onDayClick(i)} style={{ cursor: "pointer" }} role="button" aria-label={`${d.day}: ${d.calories} kcal`}>
            <circle cx={cx} cy={cy} r={isActive ? 7 : 4.5} fill={over ? "var(--danger)" : "var(--accent)"} stroke="var(--bg)" strokeWidth="2" style={{ transition: "r 0.2s", filter: isActive ? `drop-shadow(0 0 6px ${over ? "var(--danger)" : "var(--accent)"})` : "none" }} />
            {d.isToday && <circle cx={cx} cy={cy} r={11} fill="none" stroke="var(--accent)" strokeWidth="1" opacity="0.4" />}
            <text x={cx} y={PT + IH + 16} textAnchor="middle" fill={isActive ? "var(--text-primary)" : "var(--text-dim)"} fontSize="9" fontFamily="Space Mono,monospace">{d.isToday ? "NOW" : d.day}</text>
          </g>
        );
      })}
    </svg>
  );
}

function MacroBarChart({ metric, weekData, macroMeta }) {
  const meta = macroMeta.find(m => m.key === metric);
  const goalY = yp(meta.goal, meta.max);
  const n = weekData.length;
  return (
    <svg width="100%" viewBox={`0 0 ${CW} ${CH}`} style={{ overflow: "visible" }} aria-label={`${meta.label} bar chart`} role="img">
      <line x1={PL} y1={goalY} x2={CW - PR} y2={goalY} stroke={meta.color} strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
      {[0, 0.5, 1].map(f => { const y = PT + IH * (1 - f); return (
        <g key={f}>
          <line x1={PL} y1={y} x2={CW - PR} y2={y} stroke="var(--border-faint)" strokeWidth="1" />
          <text x={PL - 4} y={y + 4} textAnchor="end" fill="var(--text-dim)" fontSize="8" fontFamily="Space Mono,monospace">{Math.round(meta.max * f)}g</text>
        </g>
      ); })}
      {weekData.map((d, i) => {
        const bw = (IW / n) * 0.55, cx = xp(i, n), val = d[metric];
        const bh = Math.max(0, (val / meta.max) * IH), x = cx - bw / 2, y = PT + IH - bh;
        const over = val > meta.goal, color = over ? "var(--danger)" : d.isToday ? meta.color : `${meta.color}55`;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={bh} rx="3" fill={color} style={{ animation: `fadeIn 0.4s ${i * 0.07}s ease both` }} />
            <text x={cx} y={PT + IH + 16} textAnchor="middle" fill={d.isToday ? "var(--text-primary)" : "var(--text-dim)"} fontSize="9" fontFamily="Space Mono,monospace">{d.isToday ? "NOW" : d.day}</text>
          </g>
        );
      })}
    </svg>
  );
}

export default function Trends() {
  const { token } = useAuth();
  const [activeDay, setActiveDay]       = useState(6);
  const [activeMetric, setActiveMetric] = useState("g_protein");
  const [tab, setTab]                   = useState("calories");
  const [weekData, setWeekData]         = useState([]);
  const [goalsT, setGoalsT]             = useState({ calories: 2000, g_protein: 150, g_carbs: 250, g_fat: 65 });
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");

  const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const todayStr = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    apiGet("/api/history?days=7", token)
      .then(data => {
        const targets = data.targets || {};
        setGoalsT({
          calories:  targets.calorie_target || 2000,
          g_protein: targets.protein_g      || 150,
          g_carbs:   targets.carbs_g        || 250,
          g_fat:     targets.fat_g          || 65,
        });
        const history = data.history || [];
        const rows = history.map(d => ({
          date:      new Date(d.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          day:       DAY_LABELS[new Date(d.date + "T12:00:00").getDay()],
          isToday:   d.date === todayStr,
          calories:  Math.round(d.calories  || 0),
          g_protein: Math.round(d.protein_g || 0),
          g_carbs:   Math.round(d.carbs_g   || 0),
          g_fat:     Math.round(d.fat_g     || 0),
          meals:     d.meal_count || d.meals || (d.calories > 0 ? 1 : 0),
        }));
        if (!rows.length) {
          const fallback = Array.from({ length: 7 }).map((_, i) => {
            const day = new Date();
            day.setDate(day.getDate() - (6 - i));
            const dateStr = day.toISOString().slice(0, 10);
            return {
              date: day.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
              day: DAY_LABELS[day.getDay()],
              isToday: dateStr === todayStr,
              calories: 0,
              g_protein: 0,
              g_carbs: 0,
              g_fat: 0,
              meals: 0,
            };
          });
          setWeekData(fallback);
          setActiveDay(fallback.length - 1);
        } else {
          setWeekData(rows);
          setActiveDay(Math.max(0, rows.length - 1));
        }
      })
      .catch(e => { console.error("Trends load error:", e); setError("Failed to load trends."); })
      .finally(() => setLoading(false));
  }, [token]);

  const macroMeta = [
    { key: "g_protein", label: "Protein", color: "var(--protein)",     goal: goalsT.g_protein, max: Math.max(goalsT.g_protein * 1.2, 180) },
    { key: "g_carbs",   label: "Carbs",   color: "var(--carbs-color)", goal: goalsT.g_carbs,   max: Math.max(goalsT.g_carbs   * 1.2, 320) },
    { key: "g_fat",     label: "Fat",     color: "var(--fat-color)",   goal: goalsT.g_fat,     max: Math.max(goalsT.g_fat     * 1.2, 100) },
  ];

  const insights = useMemo(() => {
    if (!weekData.length) return [];
    const ins = [];
    const lowProt = weekData.filter(d => d.g_protein < goalsT.g_protein * 0.8).length;
    if (lowProt >= 3) ins.push({ icon: "\uD83C\uDF4A", title: `Protein low ${lowProt} days`, body: "You're consistently under your protein goal. Try adding Grilled Chicken or Eggs.", color: "var(--protein)" });
    const onGoal = weekData.filter(d => d.calories > 0 && Math.abs(d.calories - goalsT.calories) / goalsT.calories < 0.1).length;
    if (onGoal >= 3) ins.push({ icon: "\uD83D\uDCA5", title: "Calorie streak", body: `${onGoal} out of 7 days within 10% of your goal. Keep it up!`, color: "var(--accent)" });
    const highCarb = weekData.filter(d => d.g_carbs > goalsT.g_carbs * 1.1).length;
    if (highCarb >= 2) ins.push({ icon: "\uD83C\uDF5F", title: "High carb days", body: `You went over your carb goal ${highCarb} days.`, color: "var(--warning)" });
    if (!ins.length) ins.push({ icon: "\u2705", title: "Looking good!", body: "You're hitting your goals consistently this week.", color: "var(--accent)" });
    return ins;
  }, [weekData, goalsT]);

  if (loading) return (
    <div style={{ paddingBottom: 110, animation: "pageIn 0.35s ease", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }} role="status" aria-live="polite">
      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "var(--text-dim)" }}>Loading trends...</div>
    </div>
  );

  if (error) return (
    <div style={{ paddingBottom: 110, animation: "pageIn 0.35s ease", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }} aria-hidden="true">{"\uD83D\uDCE1"}</div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 18, color: "var(--text-dim)", marginBottom: 8 }}>Could not load trends</div>
        <div style={{ fontSize: 13, color: "var(--text-dim)" }}>{error}</div>
      </div>
    </div>
  );

  const sel = weekData[activeDay] || { calories: 0, g_protein: 0, g_carbs: 0, g_fat: 0, date: "", meals: 0 };
  const avgCal   = weekData.length ? Math.round(weekData.reduce((s, d) => s + d.calories,  0) / weekData.length) : 0;
  const avgProt  = weekData.length ? Math.round(weekData.reduce((s, d) => s + d.g_protein, 0) / weekData.length) : 0;
  const daysLogged  = weekData.filter(d => d.calories > 0).length;
  const daysOnGoal  = weekData.filter(d => d.calories > 0 && Math.abs(d.calories - goalsT.calories) / goalsT.calories < 0.1).length;

  return (
    <main className="trends-page" style={{ paddingBottom: 110, animation: "pageIn 0.35s ease" }}>
      <div style={{ position: "fixed", top: -80, left: "50%", transform: "translateX(-50%)", width: 500, height: 400, background: "radial-gradient(circle,var(--accent2)08 0%,transparent 65%)", pointerEvents: "none", zIndex: 0 }} aria-hidden="true" />
      <div className="trends-inner" style={{ padding: "52px 22px 20px", position: "relative", zIndex: 1 }}>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>
          {weekData.length >= 2 ? `${weekData[0].date} \u2013 ${weekData[weekData.length - 1].date}` : "This week"}
        </div>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 28, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>Weekly <span style={{ color: "var(--accent2)" }}>Trends</span></h1>
      </div>

      <div className="trends-inner" style={{ padding: "0 22px", position: "relative", zIndex: 1 }}>
        {/* Summary stats */}
        <div className="trends-stats" style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          {[
            { l: "avg cal",     v: avgCal,          s: `goal ${goalsT.calories}`,  c: "var(--cal-color)" },
            { l: "avg protein", v: `${avgProt}g`,    s: `goal ${goalsT.g_protein}g`, c: "var(--protein)" },
            { l: "days logged", v: `${daysLogged}/7`, s: "this week",               c: "var(--accent)" },
            { l: "on target",   v: `${daysOnGoal}d`, s: "within Â±10%",             c: "var(--warning)" },
          ].map(({ l, v, s, c }) => (
            <div key={l} style={{ flex: "1 1 80px", background: "var(--bg-card)", border: "1px solid var(--border-faint)", borderRadius: 16, padding: "14px 8px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 17, fontWeight: 700, color: c }}>{v}</div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 3 }}>{l}</div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "var(--text-dim)", marginTop: 4 }}>{s}</div>
            </div>
          ))}
        </div>

        {/* Tab selector */}
        <div style={{ display: "flex", gap: 6, marginBottom: 18, background: "var(--bg-input)", borderRadius: 16, padding: 5 }} role="tablist">
          {[{ key: "calories", label: "Calories" }, { key: "macros", label: "Macros" }, { key: "insights", label: "Insights" }].map(t => (
            <button key={t.key} role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)} style={{ flex: 1, padding: "9px 0", borderRadius: 12, border: tab === t.key ? "2px solid var(--accent)" : "1px solid transparent", cursor: "pointer", background: tab === t.key ? "var(--bg-card)" : "transparent", fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: "0.05em", color: tab === t.key ? "var(--text-primary)" : "var(--text-dim)", transition: "all 0.2s", boxShadow: tab === t.key ? "0 0 0 2px var(--accent)20" : "none" }}>{t.label}</button>
          ))}
        </div>

        {/* Calories tab */}
        {tab === "calories" && (
          <div style={{ animation: "fadeSlideUp 0.35s ease" }}>
            <div className="trends-chart-wrap" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 22, padding: "18px 16px 10px", marginBottom: 16, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,var(--accent2)40,transparent)" }} aria-hidden="true" />
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>Calories {"\u00B7"} 7 days</div>
              <LineChart activeDay={activeDay} onDayClick={setActiveDay} weekData={weekData} goalsT={goalsT} />
            </div>
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-faint)", borderRadius: 18, padding: 16, marginBottom: 16, animation: "fadeIn 0.25s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>{sel.date}</div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "var(--text-dim)" }}>{sel.meals} meal{sel.meals !== 1 ? "s" : ""} logged</div>
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
                {[
                  { l: "calories", v: sel.calories, u: "kcal", c: "var(--cal-color)" },
                  { l: "protein",  v: sel.g_protein, u: "g",   c: "var(--protein)" },
                  { l: "carbs",    v: sel.g_carbs,   u: "g",   c: "var(--carbs-color)" },
                  { l: "fat",      v: sel.g_fat,     u: "g",   c: "var(--fat-color)" },
                ].map(({ l, v, u, c }) => (
                  <div key={l} style={{ flex: "1 1 60px", background: `${c}10`, border: `1px solid ${c}20`, borderRadius: 14, padding: "10px 6px", textAlign: "center" }}>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 13, fontWeight: 700, color: c }}>{v}<span style={{ fontSize: 8 }}>{u}</span></div>
                    <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.06em" }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ paddingTop: 12, borderTop: "1px solid var(--border-faint)", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>vs calorie goal</span>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: sel.calories > goalsT.calories ? "var(--danger)" : "var(--accent)" }}>
                  {sel.calories > goalsT.calories ? `+${sel.calories - goalsT.calories}` : `-${goalsT.calories - sel.calories}`} kcal
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Macros tab */}
        {tab === "macros" && (
          <div style={{ animation: "fadeSlideUp 0.35s ease" }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {macroMeta.map(m => (
                <button key={m.key} onClick={() => setActiveMetric(m.key)} aria-pressed={activeMetric === m.key} style={{ flex: 1, padding: "9px 0", borderRadius: 14, border: `2px solid ${activeMetric === m.key ? m.color : "var(--border-faint)"}`, cursor: "pointer", background: activeMetric === m.key ? `${m.color}18` : "var(--bg-input)", fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: "0.05em", color: activeMetric === m.key ? m.color : "var(--text-dim)", transition: "all 0.2s", boxShadow: activeMetric === m.key ? `0 0 0 2px ${m.color}20` : "none" }}>{m.label}</button>
              ))}
            </div>
            {(() => { const m = macroMeta.find(x => x.key === activeMetric); return (
              <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 22, padding: "18px 16px 10px", marginBottom: 16, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${m.color}40,transparent)` }} aria-hidden="true" />
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{m.label} {"\u00B7"} 7 days</div>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "var(--text-dim)" }}>goal <span style={{ color: m.color }}>{m.goal}g</span></div>
                </div>
                <MacroBarChart metric={activeMetric} weekData={weekData} macroMeta={macroMeta} />
              </div>
            ); })()}
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-faint)", borderRadius: 18, overflow: "hidden" }}>
              {weekData.map((d, i) => {
                const meta = macroMeta.find(m => m.key === activeMetric), val = d[activeMetric];
                const pct = Math.min(100, (val / meta.goal) * 100), over = val > meta.goal;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: i < 6 ? "1px solid var(--border-faint)" : "none", background: d.isToday ? "var(--bg-input)" : "transparent" }}>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: d.isToday ? "var(--text-primary)" : "var(--text-dim)", width: 28, flexShrink: 0 }}>{d.isToday ? "NOW" : d.day}</div>
                    <div style={{ flex: 1, height: 5, background: "var(--border-faint)", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: over ? "var(--danger)" : meta.color, borderRadius: 99 }} />
                    </div>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: over ? "var(--danger)" : "var(--text-muted)", width: 36, textAlign: "right", flexShrink: 0 }}>{val}g</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Insights tab */}
        {tab === "insights" && (
          <div style={{ animation: "fadeSlideUp 0.35s ease" }}>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 18, lineHeight: 1.6 }}>Patterns detected over the past 7 days based on your dining hall meals.</p>
            {insights.map((ins, i) => (
              <div key={i} style={{ background: `${ins.color}08`, border: `1px solid ${ins.color}20`, borderRadius: 18, padding: 16, marginBottom: 10, animation: `fadeSlideUp 0.4s ${i * 0.08}s ease both`, display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span style={{ fontSize: 22, flexShrink: 0 }} aria-hidden="true">{ins.icon}</span>
                <div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: ins.color, marginBottom: 4 }}>{ins.title}</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.55 }}>{ins.body}</div>
                </div>
              </div>
            ))}
            <div style={{ marginTop: 20, background: "var(--bg-card)", border: "1px solid var(--border-faint)", borderRadius: 20, padding: 18 }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 14, color: "var(--text-primary)" }}>Logging streak</div>
              <div style={{ display: "flex", gap: 8 }} role="list">
                {weekData.map((d, i) => (
                  <div key={i} role="listitem" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{ width: "100%", aspectRatio: "1", borderRadius: 10, background: d.meals > 0 ? "linear-gradient(135deg,var(--accent),var(--accent2))" : "var(--bg-input)", border: d.isToday ? "2px solid var(--accent)" : "none", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: d.meals > 0 ? "0 4px 12px var(--accent)30" : "none" }}>
                      {d.meals > 0 && <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "var(--accent-contrast)", fontWeight: 700 }}>{d.meals}</span>}
                    </div>
                    <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: d.isToday ? "var(--accent)" : "var(--text-dim)" }}>{d.isToday ? "NOW" : d.day}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14, fontSize: 12, color: "var(--text-muted)" }}>
                {daysLogged}-day logging week {"\u00B7"} <span style={{ color: "var(--accent)" }}>{daysLogged >= 5 ? <>Great consistency! {"\uD83D\uDCA5"}</> : "Keep logging daily for better insights."}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

