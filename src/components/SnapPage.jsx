import { useState, useRef, useCallback, useEffect } from "react";
import { useAuth } from "../auth.jsx";
import { apiGet, apiPost, API_BASE } from "../utils/api.js";
import { MEAL_FOR_HOUR, MEAL_FOR_RECOMMEND, MEAL_ICONS, TAG_COLOR, HALL_NAMES } from "../utils/constants.js";

const MEAL_OPTIONS = ["breakfast", "lunch", "dinner"];

// â”€â”€ Corner Bracket (camera viewfinder) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function CornerBracket({ style }) {
  return (
    <div style={{ position: "absolute", width: 28, height: 28, ...style }} aria-hidden="true">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M0 14 L0 0 L14 0" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// â”€â”€ Macro Pill â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function MacroPill({ label, value, unit, color }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: `${color}15`, border: `1px solid ${color}40`, borderRadius: 12, padding: "8px 14px", minWidth: 60 }}>
      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 15, fontWeight: 700, color }}>{value}{unit}</span>
      <span style={{ fontSize: 10, color: "var(--text-secondary)", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
    </div>
  );
}

// â”€â”€ Match Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function MatchCard({ item, score, onLog, confirmed, logging }) {
  const [servings, setServings] = useState(1);
  const cal  = Math.round(item.nutrition.calories  * servings);
  const prot = Math.round(item.nutrition.g_protein * servings);
  const carbs = Math.round(item.nutrition.g_carbs  * servings);
  const fat  = Math.round(item.nutrition.g_fat     * servings);
  return (
    <div style={{ background: confirmed ? "var(--bg-surface)" : "var(--bg-card)", border: confirmed ? `2px solid var(--accent)` : `1px solid var(--border)`, borderRadius: 20, padding: "18px 20px", marginBottom: 12, boxShadow: confirmed ? "0 0 32px var(--accent)30" : "none", transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)", position: "relative", overflow: "hidden" }}>
      {confirmed && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,var(--accent),var(--accent2),var(--accent))", backgroundSize: "200%", animation: "shimmer 2s linear infinite" }} aria-hidden="true" />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
          <div style={{ display: "flex", gap: 6, marginTop: 5, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "var(--text-muted)", background: "var(--bg-input)", padding: "2px 8px", borderRadius: 99 }}>{item.station}</span>
            {(item.food_tags || []).map(t => <span key={t} style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: TAG_COLOR[t] || "var(--text-secondary)", background: `${TAG_COLOR[t] || "#94a3b8"}15`, padding: "2px 8px", borderRadius: 99 }}>{t}</span>)}
          </div>
        </div>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: score > 0.7 ? "var(--accent)" : score > 0.5 ? "var(--warning)" : "var(--danger)", background: score > 0.7 ? "var(--accent)15" : score > 0.5 ? "var(--warning-bg)" : "var(--danger-bg)", padding: "3px 10px", borderRadius: 99, flexShrink: 0 }}>
          {Math.round(score * 100)}% match
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <MacroPill label="cal"     value={cal}   unit=""  color="var(--cal-color)" />
        <MacroPill label="protein" value={prot}  unit="g" color="var(--protein)" />
        <MacroPill label="carbs"   value={carbs} unit="g" color="var(--carbs-color)" />
        <MacroPill label="fat"     value={fat}   unit="g" color="var(--fat-color)" />
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--bg-input)", borderRadius: 12, padding: "4px 12px", border: "1px solid var(--border)" }}>
          <button onClick={() => setServings(s => Math.max(0.5, s - 0.5))} aria-label="Decrease servings" style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "0 2px" }}>{"\u2212"}</button>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 13, color: "var(--text-secondary)", minWidth: 28, textAlign: "center" }} aria-live="polite">{servings}{"\u00D7"}</span>
          <button onClick={() => setServings(s => Math.min(4, s + 0.5))} aria-label="Increase servings" style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "0 2px" }}>+</button>
        </div>
        <button onClick={() => onLog({ ...item, servings })} disabled={logging} aria-pressed={confirmed} style={{ flex: 1, padding: "10px 16px", borderRadius: 12, border: confirmed ? "2px solid var(--accent)" : "1px solid var(--border)", cursor: logging ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 13, background: confirmed ? "linear-gradient(135deg,var(--accent),var(--accent2))" : "var(--bg-input)", color: confirmed ? "var(--accent-contrast)" : "var(--text-secondary)", transition: "all 0.25s ease", boxShadow: confirmed ? "0 0 0 2px var(--accent)25" : "none" }}>
          {logging ? "Logging..." : confirmed ? "Logged" : "Log now"}
        </button>
      </div>
    </div>
  );
}

// â”€â”€ Snap Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function SnapPage({ onNav }) {
  const { token } = useAuth();
  const [selectedHall, setSelectedHall]   = useState("gordon-avenue-market");
  const [selectedMeal, setSelectedMeal]   = useState(() => MEAL_FOR_RECOMMEND(new Date().getHours()));
  const [diningHalls, setDiningHalls]     = useState([]);
  const [phase, setPhase]                 = useState("idle");
  const [detections, setDetections]       = useState([]);
  const [matches, setMatches]             = useState([]);
  const [confirmed, setConfirmed]         = useState({});
  const [loggingIds, setLoggingIds]       = useState(new Set());
  const [searchQuery, setSearchQuery]     = useState("");
  const [showSuccess, setShowSuccess]     = useState(false);
  const [logError, setLogError]           = useState("");
  const [loggedCalories, setLoggedCalories] = useState(0);
  const [liveMenu, setLiveMenu]           = useState([]);
  const videoRef    = useRef(null);
  const streamRef   = useRef(null);
  const fileInputRef = useRef(null);

  // Load dining halls
  useEffect(() => {
    fetch(`${API_BASE}/api/dining-halls`)
      .then(r => r.json())
      .then(d => setDiningHalls(d.dining_halls || []))
      .catch(e => console.error("Dining halls load error:", e));
  }, []);

  // Load live menu for selected hall + meal
  useEffect(() => {
    fetch(`${API_BASE}/api/menu?hall=${selectedHall}&meal=${selectedMeal}`)
      .then(r => r.json())
      .then(d => {
        if (d.items?.length > 0) {
          setLiveMenu(d.items.filter(i => i.name?.trim()).map(i => ({
            ...i,
            nutrition: { calories: i.nutrition.calories, g_protein: i.nutrition.g_protein, g_carbs: i.nutrition.g_carbs, g_fat: i.nutrition.g_fat, g_sugar: i.nutrition.g_sugar, mg_sodium: i.nutrition.mg_sodium },
            food_tags: i.food_tags || [],
          })));
        }
      })
      .catch(e => console.error("Live menu load error:", e));
  }, [selectedHall, selectedMeal]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    try {
      let stream;
      try { stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }); }
      catch { stream = await navigator.mediaDevices.getUserMedia({ video: true }); }
      streamRef.current = stream;
      setPhase("scanning");
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.error("Video play error:", e));
        }
      }, 50);
    } catch (e) {
      console.error("Camera error:", e);
    }
  }, []);

  const runAnalysis = useCallback(async (fileOrEvent) => {
    setPhase("analyzing");
    stopCamera();
    try {
      let base64Image = "";
      const file = fileOrEvent?.target?.files?.[0];
      if (file) {
        base64Image = await new Promise((res, rej) => {
          const r = new FileReader();
          r.onload = e => res(e.target.result.split(",")[1]);
          r.onerror = rej;
          r.readAsDataURL(file);
        });
      } else if (videoRef.current && videoRef.current.readyState >= 2) {
        // Guard: only capture if video is ready
        const canvas = document.createElement("canvas");
        canvas.width  = videoRef.current.videoWidth  || 640;
        canvas.height = videoRef.current.videoHeight || 480;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0);
          base64Image = canvas.toDataURL("image/jpeg", 0.8).split(",")[1];
        }
      }
      const data = await apiPost("/api/snap", token, { image: base64Image, hall: selectedHall, meal: selectedMeal });
      const results = (data.matched || []).map(item => ({
        detection_label: item.name,
        confidence: 0.9,
        candidates: [{ food_item: { ...item, food_category: "entree" }, match_score: 0.95 }],
      }));
      setDetections((data.matched || []).map(i => ({ label: i.name, confidence: 0.9 })));
      setMatches(results);
      setPhase(results.length > 0 ? "results" : "manual");
    } catch (e) {
      console.error("Snap analysis error:", e);
      setPhase("manual");
    }
  }, [stopCamera, token, selectedHall, selectedMeal]);

  const handleLogSingle = useCallback(async (key, item) => {
    if (!item || loggingIds.has(key)) return;
    setLogError("");
    setLoggingIds(p => new Set([...p, key]));
    try {
      const servings = item.servings || 1;
      const sodiumMg = item.nutrition?.mg_sodium ?? (item.nutrition?.g_sodium ? item.nutrition.g_sodium * 1000 : 0);
      const calories = Math.round((item.nutrition?.calories || 0) * servings);
      await apiPost("/api/log", token, {
        food_id:      String(item.food_id),
        food_name:    item.name,
        quantity:     servings,
        serving_size: item.serving_size || "1 serving",
        calories,
        protein_g:    Math.round((item.nutrition?.g_protein || 0) * servings),
        carbs_g:      Math.round((item.nutrition?.g_carbs   || 0) * servings),
        fat_g:        Math.round((item.nutrition?.g_fat     || 0) * servings),
        fiber_g:      Math.round((item.nutrition?.g_fiber   || 0) * servings),
        sugar_g:      Math.round((item.nutrition?.g_sugar   || 0) * servings),
        sodium_mg:    Math.round(sodiumMg * servings),
        hall:         selectedHall,
        meal_type:    selectedMeal,
      });
      setConfirmed(p => ({ ...p, [key]: item }));
      setLoggedCalories(calories);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1500);
    } catch (e) {
      console.error("Log error:", e);
      setLogError("Failed to log. Please try again.");
    } finally {
      setLoggingIds(p => { const n = new Set(p); n.delete(key); return n; });
    }
  }, [loggingIds, token, selectedHall, selectedMeal]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const currentMealLabel = selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1);
  const hallDisplayName = diningHalls.find(h => h.id === selectedHall)?.shortName
    || HALL_NAMES[selectedHall]
    || selectedHall;

  const filteredMenu = liveMenu.filter(i =>
    (i.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (i.station || "").toLowerCase().includes(searchQuery.toLowerCase())
  );
  const confirmedCount = Object.keys(confirmed).length;

  return (
    <main style={{ paddingBottom: 100, animation: "pageIn 0.35s ease" }}>
      <div style={{ position: "fixed", top: -100, left: "50%", transform: "translateX(-50%)", width: 600, height: 600, background: "radial-gradient(circle, var(--glow) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} aria-hidden="true" />

      {/* Header — meal & location dropdowns + manual on one page */}
      <div style={{ padding: "52px 24px 16px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
            Nutri<span style={{ color: "var(--accent)" }}>Snap</span>
          </h1>
          <button
            onClick={() => setPhase(p => p === "manual" ? (matches.length ? "results" : "idle") : "manual")}
            aria-label={phase === "manual" ? "Back" : "Browse menu manually"}
            style={{ background: phase === "manual" ? "var(--accent)15" : "var(--bg-input)", border: `1px solid ${phase === "manual" ? "var(--accent)40" : "var(--border)"}`, borderRadius: 12, padding: "8px 14px", cursor: "pointer", fontFamily: "'Space Mono',monospace", fontSize: 10, color: phase === "manual" ? "var(--accent)" : "var(--text-muted)", letterSpacing: "0.05em", transition: "all 0.2s" }}
          >
            {phase === "manual" ? "\u2190 BACK" : "MANUAL"}
          </button>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontFamily: "'Space Mono',monospace", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Meal</label>
            <select
              value={selectedMeal}
              onChange={e => setSelectedMeal(e.target.value)}
              aria-label="Select meal"
              style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-input)", fontSize: 13, color: "var(--text-primary)", cursor: "pointer", appearance: "auto" }}
            >
              {MEAL_OPTIONS.map(m => (
                <option key={m} value={m}>{MEAL_ICONS[m] || ""} {m.charAt(0).toUpperCase() + m.slice(1)}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontFamily: "'Space Mono',monospace", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Location</label>
            <select
              value={selectedHall}
              onChange={e => setSelectedHall(e.target.value)}
              aria-label="Select dining hall"
              style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-input)", fontSize: 13, color: "var(--text-primary)", cursor: "pointer", appearance: "auto" }}
            >
              {diningHalls.length === 0 ? (
                <option>Loading…</option>
              ) : (
                diningHalls.map(h => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      {/* IDLE phase */}
      {phase === "idle" && (
        <div style={{ padding: "0 24px", animation: "fadeSlideUp 0.5s ease", position: "relative", zIndex: 1 }}>
          <button onClick={startCamera} aria-label="Open camera to scan meal" style={{ position: "relative", borderRadius: 24, overflow: "hidden", background: "linear-gradient(135deg,var(--bg-card),var(--bg-input))", border: "1px solid var(--border-faint)", aspectRatio: "4/3", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", maxWidth: 480, maxHeight: "50vh", margin: "0 auto" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(var(--accent)03 1px,transparent 1px),linear-gradient(90deg,var(--accent)03 1px,transparent 1px)", backgroundSize: "40px 40px" }} aria-hidden="true" />
            <CornerBracket style={{ top: 16, left: 16 }} />
            <CornerBracket style={{ top: 16, right: 16, transform: "scaleX(-1)" }} />
            <CornerBracket style={{ bottom: 16, left: 16, transform: "scaleY(-1)" }} />
            <CornerBracket style={{ bottom: 16, right: 16, transform: "scale(-1)" }} />
            <div style={{ animation: "float 3s ease-in-out infinite", textAlign: "center" }}>
              <div style={{ fontSize: 52, marginBottom: 12 }} aria-hidden="true">{"\uD83C\uDF74"}</div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>Point &amp; Snap</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}>Tap to open camera</div>
            </div>
          </button>
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <button onClick={startCamera} aria-label="Open camera" style={{ flex: 2, padding: 16, borderRadius: 18, border: "none", cursor: "pointer", background: "linear-gradient(135deg,var(--accent),var(--accent2))", fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, color: "var(--accent-contrast)", boxShadow: "0 8px 32px var(--accent)40", animation: "pulse-ring 2.5s ease-in-out infinite" }}>{"\uD83D\uDCF0"} Open Camera</button>
            <button onClick={() => fileInputRef.current?.click()} aria-label="Upload photo" style={{ flex: 1, padding: 16, borderRadius: 18, cursor: "pointer", background: "var(--bg-input)", border: "1px solid var(--border)", fontWeight: 600, fontSize: 14, color: "var(--text-muted)" }}>{"\uD83D\uDCCE"} Upload</button>
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={runAnalysis} aria-hidden="true" />
          </div>
        </div>
      )}

      {/* SCANNING phase */}
      {phase === "scanning" && (
        <div style={{ padding: "0 24px", animation: "fadeSlideUp 0.4s ease", position: "relative", zIndex: 1 }}>
          <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", background: "#000", aspectRatio: "4/3", border: "1px solid var(--accent)20", boxShadow: "0 0 40px var(--accent)20", width: "100%", maxWidth: 480, maxHeight: "50vh", margin: "0 auto" }}>
            <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover" }} aria-label="Camera feed" />
            <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 24, pointerEvents: "none" }} aria-hidden="true">
              <div style={{ position: "absolute", left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,var(--accent),var(--accent2),var(--accent),transparent)", boxShadow: "0 0 20px var(--accent)", animation: "scanline 2.5s ease-in-out infinite" }} />
            </div>
            <CornerBracket style={{ top: 16, left: 16 }} />
            <CornerBracket style={{ top: 16, right: 16, transform: "scaleX(-1)" }} />
            <CornerBracket style={{ bottom: 16, left: 16, transform: "scaleY(-1)" }} />
            <CornerBracket style={{ bottom: 16, right: 16, transform: "scale(-1)" }} />
          </div>
          <button onClick={runAnalysis} style={{ width: "100%", marginTop: 16, padding: 20, borderRadius: 20, border: "none", cursor: "pointer", background: "linear-gradient(135deg,var(--accent),var(--accent2))", fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 17, color: "var(--accent-contrast)", boxShadow: "0 12px 40px var(--accent)50" }}>{"\u26A1"} ANALYZE TRAY</button>
          <button onClick={() => { stopCamera(); setPhase("idle"); }} style={{ width: "100%", marginTop: 10, padding: 12, background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--text-muted)" }}>Cancel</button>
        </div>
      )}

      {/* ANALYZING phase */}
      {phase === "analyzing" && (
        <div style={{ padding: "40px 24px 0", display: "flex", flexDirection: "column", alignItems: "center", animation: "fadeSlideUp 0.4s ease", position: "relative", zIndex: 1 }} role="status" aria-live="polite" aria-label="Analyzing your meal">
          <div style={{ position: "relative", width: 120, height: 120, marginBottom: 32 }} aria-hidden="true">
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid var(--border)", animation: "spin-slow 3s linear infinite" }} />
            <div style={{ position: "absolute", inset: 8, borderRadius: "50%", border: "2px solid transparent", borderTopColor: "var(--accent)", borderRightColor: "var(--accent2)", animation: "spin-slow 1.5s linear infinite" }} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>{"\uD83D\uDCDA"}</div>
          </div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: "var(--text-primary)", marginBottom: 8 }}>Identifying dishes...</div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "var(--text-dim)", marginBottom: 32, letterSpacing: "0.08em" }}>MATCHING MENU {"\u00B7"} COMPUTING MACROS</div>
          {[
            { label: "Analyzing image",         delay: "0s",    dur: "0.8s" },
            { label: "Matching Nutrislice menu", delay: "0.7s",  dur: "1.0s" },
            { label: "Computing macros",         delay: "1.5s",  dur: "0.6s" },
          ].map(({ label, delay, dur }) => (
            <div key={label} style={{ width: "100%", marginBottom: 16 }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</span>
              <div style={{ height: 4, background: "var(--border-faint)", borderRadius: 99, overflow: "hidden", marginTop: 6 }}>
                <div style={{ height: "100%", background: "linear-gradient(90deg,var(--accent),var(--accent2))", borderRadius: 99, width: 0, animation: `analyzing-bar ${dur} ${delay} ease forwards` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RESULTS phase */}
      {phase === "results" && (
        <div style={{ padding: "0 24px", animation: "fadeSlideUp 0.5s ease", position: "relative", zIndex: 1 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Detected in photo</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {detections.map(d => (
                <div key={d.label} style={{ background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 99, padding: "6px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: d.confidence > 0.7 ? "var(--accent)" : d.confidence > 0.5 ? "var(--warning)" : "var(--danger)" }} aria-hidden="true" />
                  <span style={{ fontSize: 13, color: "var(--text-secondary)", textTransform: "capitalize" }}>{d.label}</span>
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "var(--text-muted)" }}>{Math.round(d.confidence * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
          {matches.map(({ detection_label, candidates }) => (
            <div key={detection_label} style={{ marginBottom: 28 }}>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>"{detection_label}" {"\u2192"} best matches</div>
              {candidates.map(({ food_item, match_score }) => (
                <MatchCard key={food_item.food_id} item={food_item} score={match_score}
                  confirmed={confirmed[detection_label]?.food_id === food_item.food_id}
                  logging={loggingIds.has(`det_${detection_label}`)}
                  onLog={item => handleLogSingle(`det_${detection_label}`, item)} />
              ))}
            </div>
          ))}
          {logError && <div style={{ background: "var(--danger-bg)", border: "1px solid var(--danger-border)", borderRadius: 14, padding: "11px 16px", fontSize: 13, color: "var(--danger)", marginBottom: 12 }} role="alert">{logError}</div>}
          {confirmedCount > 0 && (
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
              {confirmedCount} dish{confirmedCount > 1 ? "es" : ""} logged
            </div>
          )}
          <button onClick={() => setPhase("manual")} style={{ width: "100%", marginTop: 8, marginBottom: 16, padding: 12, background: "none", border: "1px solid var(--border-faint)", borderRadius: 14, cursor: "pointer", fontSize: 13, color: "var(--text-muted)" }}>+ Add more manually</button>
        </div>
      )}

      {/* MANUAL phase */}
      {phase === "manual" && (
        <div style={{ padding: "0 24px", animation: "fadeSlideUp 0.4s ease", position: "relative", zIndex: 1 }}>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 20, color: "var(--text-primary)", marginBottom: 16 }}>Today's Menu</h2>
          <div style={{ position: "relative", marginBottom: 16 }}>
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search dishes or stations..."
              aria-label="Search menu items"
              style={{ width: "100%", padding: "14px 18px 14px 42px", borderRadius: 16, background: "var(--bg-input)", border: "1px solid var(--border)", fontSize: 14, color: "var(--text-primary)" }} />
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, opacity: 0.4 }} aria-hidden="true">{"\uD83D\uDD0D"}</span>
          </div>
          {liveMenu.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-dim)", fontSize: 13 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }} aria-hidden="true">{"\uD83C\uDF5D"}</div>
              Menu unavailable right now. Try the camera instead.
            </div>
          ) : filteredMenu.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-dim)", fontSize: 13 }}>No items match "{searchQuery}"</div>
          ) : (
            <div style={{ maxHeight: "55vh", overflowY: "auto" }}>
              {filteredMenu.map(item => (
                <div key={item.food_id} style={{ background: confirmed[`manual_${item.food_id}`] ? "var(--accent)06" : "var(--bg-card)", border: `2px solid ${confirmed[`manual_${item.food_id}`] ? "var(--accent)" : "var(--border-faint)"}`, borderRadius: 16, padding: "14px 16px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.2s", width: "100%" }}>
                  <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "var(--text-muted)", marginTop: 3 }}>{item.station} {"\u00B7"} {item.serving_size}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 14, fontWeight: 700, color: "var(--cal-color)" }}>{item.nutrition.calories}</div>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "var(--text-dim)" }}>kcal</div>
                  </div>
                  <button onClick={() => handleLogSingle(`manual_${item.food_id}`, item)} disabled={loggingIds.has(`manual_${item.food_id}`)} aria-pressed={!!confirmed[`manual_${item.food_id}`]} style={{ marginLeft: 12, padding: "6px 12px", borderRadius: 12, border: confirmed[`manual_${item.food_id}`] ? "2px solid var(--accent)" : "1px solid var(--border)", cursor: loggingIds.has(`manual_${item.food_id}`) ? "not-allowed" : "pointer", background: confirmed[`manual_${item.food_id}`] ? "var(--accent)15" : "var(--bg-input)", fontSize: 11, color: confirmed[`manual_${item.food_id}`] ? "var(--accent)" : "var(--text-muted)", fontWeight: 700 }}>
                    {loggingIds.has(`manual_${item.food_id}`) ? "Logging…" : confirmed[`manual_${item.food_id}`] ? "Logged" : "Log"}
                  </button>
                </div>
              ))}
            </div>
          )}
          {logError && <div style={{ background: "var(--danger-bg)", border: "1px solid var(--danger-border)", borderRadius: 14, padding: "11px 16px", fontSize: 13, color: "var(--danger)", marginBottom: 12 }} role="alert">{logError}</div>}
        </div>
      )}

      {/* Success overlay */}
      {showSuccess && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "var(--bg)", backdropFilter: "blur(20px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", animation: "fadeSlideUp 0.3s ease" }} role="alert" aria-live="assertive">
          <div style={{ fontSize: 72, animation: "waveIn 0.5s cubic-bezier(0.34,1.56,0.64,1)", marginBottom: 20 }} aria-hidden="true">{"\u2705"}</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 28, color: "var(--text-primary)", marginBottom: 8 }}>Logged!</div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: "var(--text-dim)", letterSpacing: "0.08em" }}>DIARY UPDATED</div>
          <div style={{ marginTop: 32, padding: "14px 28px", borderRadius: 16, background: "var(--accent)08", border: "1px solid var(--accent)30", fontSize: 13, color: "var(--accent)" }}>
            {loggedCalories} kcal added today
          </div>
        </div>
      )}
    </main>
  );
}

