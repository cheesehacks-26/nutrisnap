import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../auth.jsx";
import { apiGet, apiPost, apiDelete, API_BASE } from "../utils/api.js";
import { TAG_STYLE, STATION_ICONS, CAT_COLOR, TODAY, MEAL_FOR_HOUR, MEAL_FOR_RECOMMEND } from "../utils/constants.js";

const DIET_TAGS    = ["Vegan", "Vegetarian", "Gluten-Free"];
const SORT_OPTIONS = [
  { key: "default",   label: "Default"   },
  { key: "station",   label: "Station"   },
  { key: "cal_asc",   label: "Cal \u2191"     },
  { key: "cal_desc",  label: "Cal \u2193"     },
  { key: "protein",   label: "Protein \u2191" },
];

// â”€â”€ Food Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function FoodCard({ item, saved, servings, logging, removing, onServingsChange, onSave, onRemove }) {
  const [expanded, setExpanded] = useState(false);
  const { name, station, food_category, serving_size, nutrition = {}, food_tags = [] } = item;
  const [localServings, setLocalServings] = useState(servings || 1);
  useEffect(() => { setLocalServings(servings || 1); }, [servings]);
  const updateServings = (next) => {
    const clamped = Math.max(0.5, Math.min(4, Math.round(next * 2) / 2));
    setLocalServings(clamped);
    if (onServingsChange) onServingsChange(item.food_id, clamped);
  };
  return (
    <div style={{ background: expanded ? "var(--bg-surface)" : "var(--bg-card)", border: `1px solid ${expanded ? "var(--border)" : "var(--border-faint)"}`, borderRadius: 18, marginBottom: 10, overflow: "hidden", transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)" }}>
      <button onClick={() => setExpanded(e => !e)} aria-expanded={expanded} style={{ display: "flex", alignItems: "center", padding: "14px 16px", cursor: "pointer", gap: 12, width: "100%", background: "none", border: "none", textAlign: "left" }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: CAT_COLOR[food_category] || "var(--text-secondary)", boxShadow: `0 0 6px ${CAT_COLOR[food_category] || "#94a3b8"}80` }} aria-hidden="true" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{STATION_ICONS[station] ?? ""} {station ?? ""}</div>
        </div>
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          {food_tags.slice(0, 2).map(t => (
            <div key={t} style={{ width: 8, height: 8, borderRadius: "50%", background: TAG_STYLE[t]?.color }} title={t} aria-label={t} />
          ))}
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 15, fontWeight: 700, color: "var(--cal-color)" }}>{nutrition.calories ?? "—"}</div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "var(--text-dim)" }}>kcal</div>
        </div>
        <span style={{ color: "var(--text-dim)", fontSize: 12, flexShrink: 0, transition: "transform 0.3s", transform: expanded ? "rotate(180deg)" : "none" }} aria-hidden="true">{"\u25BC"}</span>
      </button>
      {expanded && (
        <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--border-faint)", animation: "fadeIn 0.2s ease" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, marginBottom: 14 }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Serving: <span style={{ fontFamily: "'Space Mono',monospace", color: "var(--text-secondary)" }}>{serving_size}</span></span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
              {food_tags.map(t => <span key={t} style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, padding: "3px 10px", borderRadius: 99, background: TAG_STYLE[t]?.bg, border: `1px solid ${TAG_STYLE[t]?.border}`, color: TAG_STYLE[t]?.color }}>{t}</span>)}
            </div>
          </div>
          {/* Macro pills â€” flexWrap so they don't overflow on small screens */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            {[
              { l: "Protein", v: nutrition.g_protein ?? 0, c: "var(--protein)" },
              { l: "Carbs",   v: nutrition.g_carbs ?? 0,   c: "var(--carbs-color)" },
              { l: "Fat",     v: nutrition.g_fat ?? 0,     c: "var(--fat-color)" },
              { l: "Sugar",   v: nutrition.g_sugar ?? 0,   c: "var(--cal-color)" },
            ].map(({ l, v, c }) => (
              <div key={l} style={{ flex: "1 1 60px", background: `${c}10`, border: `1px solid ${c}25`, borderRadius: 12, padding: "8px 6px", textAlign: "center" }}>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 13, fontWeight: 700, color: c }}>{v}g</div>
                <div style={{ fontSize: 9, color: "var(--text-muted)", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.06em" }}>{l}</div>
              </div>
            ))}
          </div>
          {(nutrition.mg_sodium || 0) > 700 && (
            <div style={{ fontSize: 12, color: "var(--danger)", marginBottom: 12 }}>{"\u26A0\uFE0F"} High sodium: {nutrition.mg_sodium}mg</div>
          )}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Servings</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--bg-input)", borderRadius: 12, padding: "4px 10px", border: "1px solid var(--border-faint)" }}>
              <button onClick={(e) => { e.stopPropagation(); updateServings(localServings - 0.5); }} aria-label="Decrease servings" style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: "0 2px" }}>{"\u2212"}</button>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: "var(--text-secondary)", minWidth: 30, textAlign: "center" }} aria-live="polite">{localServings}{"\u00D7"}</span>
              <button onClick={(e) => { e.stopPropagation(); updateServings(localServings + 0.5); }} aria-label="Increase servings" style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: "0 2px" }}>+</button>
            </div>
          </div>
          {saved ? (
            <button onClick={e => { e.stopPropagation(); onRemove?.(item.food_id); }} disabled={removing} aria-label="Remove from log" style={{ width: "100%", padding: 12, borderRadius: 14, border: "1.75px solid var(--danger-border)", cursor: removing ? "not-allowed" : "pointer", background: "var(--danger-bg)", fontWeight: 700, fontSize: 13, color: "var(--danger)", transition: "all 0.25s ease", opacity: removing ? 0.6 : 1 }}>
              {removing ? "Removing..." : "Remove from log"}
            </button>
          ) : (
            <button onClick={e => { e.stopPropagation(); onSave(item.food_id, localServings); }} disabled={logging} aria-pressed={false} style={{ width: "100%", padding: 12, borderRadius: 14, border: "1.75px solid var(--border)", cursor: logging ? "not-allowed" : "pointer", background: "var(--bg-input)", fontWeight: 700, fontSize: 13, color: "var(--text-secondary)", transition: "all 0.25s ease", boxShadow: "none", opacity: logging ? 0.9 : 1 }}>
              {logging ? "Logging..." : <>Log {localServings}{"\u00D7"}</>}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// â”€â”€ Menu Browser Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function MenuBrowser() {
  const { token } = useAuth();
  const [selectedStation, setSelectedStation] = useState("All");
  const [activeTags, setActiveTags]           = useState([]);
  const [sortKey, setSortKey]                 = useState("default");
  const [searchQuery, setSearchQuery]         = useState("");
  const [mealType, setMealType]               = useState(() => { const h = new Date().getHours(); return MEAL_FOR_RECOMMEND(h); });
  const [showSaved, setShowSaved]             = useState(false);
  const [recs, setRecs]                       = useState([]);
  const [recsLoading, setRecsLoading]         = useState(true);
  const [showRecs, setShowRecs]               = useState(true);
  const [diningHalls, setDiningHalls]         = useState([]);
  const [selectedHall, setSelectedHall]       = useState("gordon-avenue-market");
  const [showHallPicker, setShowHallPicker]   = useState(false);
  const [menuItems, setMenuItems]             = useState([]);
  const [menuLoading, setMenuLoading]         = useState(true);
  const [menuError, setMenuError]             = useState(false);
  const [savedFoodIds, setSavedFoodIds]       = useState(new Set());
  const [savedServings, setSavedServings]     = useState({});
  const [loggingIds, setLoggingIds]           = useState(new Set());
  const [removingIds, setRemovingIds]         = useState(new Set());

  const stations = useMemo(() => ["All", ...Array.from(new Set(menuItems.map(i => i.station).filter(Boolean)))], [menuItems]);

  useEffect(() => {
    fetch(`${API_BASE}/api/dining-halls`)
      .then(r => r.json())
      .then(d => setDiningHalls(d.dining_halls || []))
      .catch(e => console.error("Dining halls error:", e));
  }, []);

  // When dining is closed, use next meal for recommendations
  const effectiveMealForRecs = MEAL_FOR_HOUR(new Date().getHours()) === "CLOSED" ? MEAL_FOR_RECOMMEND(new Date().getHours()) : mealType;
  useEffect(() => {
    setRecsLoading(true);
    fetch(`${API_BASE}/api/recommend?meal=${effectiveMealForRecs}&hall=${selectedHall}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        const all = Object.entries(data.halls || {}).flatMap(([, items]) => items || []).filter(i => i && i.name?.trim());
        all.sort((a, b) => (b?.score ?? 0) - (a?.score ?? 0));
        setRecs(all.slice(0, 6));
      })
      .catch(e => { console.error("Recs error:", e); setRecs([]); })
      .finally(() => setRecsLoading(false));
  }, [effectiveMealForRecs, selectedHall, token]);

  useEffect(() => {
    setMenuLoading(true);
    setMenuError(false);
    fetch(`${API_BASE}/api/menu?hall=${selectedHall}&meal=${mealType}`)
      .then(r => r.json())
      .then(d => {
        const raw = (d && Array.isArray(d.items)) ? d.items : [];
        if (raw.length > 0) {
          setMenuItems(raw.filter(i => i?.name?.trim()).map(i => {
            const nut = i.nutrition || {};
            return {
              ...i,
              nutrition: {
                calories: nut.calories ?? 0,
                g_protein: nut.g_protein ?? 0,
                g_carbs: nut.g_carbs ?? 0,
                g_fat: nut.g_fat ?? 0,
                g_sugar: nut.g_sugar ?? 0,
                mg_sodium: nut.mg_sodium ?? 0,
                g_fiber: nut.g_fiber ?? 0,
              },
              food_tags: i.food_tags || [],
            };
          }));
        } else {
          setMenuItems([]);
        }
      })
      .catch(e => { console.error("Menu load error:", e); setMenuError(true); })
      .finally(() => setMenuLoading(false));
  }, [mealType, selectedHall]);

  useEffect(() => {
    apiGet("/api/saved-foods", token)
      .then(d => setSavedFoodIds(new Set((d.saved_foods || []).map(f => String(f.food_id)))))
      .catch(e => console.error("Saved foods error:", e));
  }, [token]);

  const toggleTag = tag => setActiveTags(p => p.includes(tag) ? p.filter(t => t !== tag) : [...p, tag]);

  const updateServings = (id, servings) => {
    const strId = String(id);
    setSavedServings(p => ({ ...p, [strId]: servings }));
  };

  const submitOneItem = async (id, servings = 1) => {
    const strId = String(id);
    const item = menuItems.find(i => String(i.food_id) === strId);
    if (!item) return;
    const qty = servings || 1;
    await apiPost("/api/log", token, {
      food_id: String(item.food_id), food_name: item.name, quantity: qty,
      serving_size: item.serving_size || "1 serving",
      calories: Math.round((item.nutrition?.calories ?? 0) * qty),
      protein_g: Math.round((item.nutrition?.g_protein ?? 0) * qty),
      carbs_g: Math.round((item.nutrition?.g_carbs ?? 0) * qty),
      fat_g: Math.round((item.nutrition?.g_fat ?? 0) * qty),
      fiber_g: Math.round((item.nutrition?.g_fiber ?? 0) * qty),
      sugar_g: Math.round((item.nutrition?.g_sugar ?? 0) * qty),
      sodium_mg: Math.round((item.nutrition?.mg_sodium ?? 0) * qty),
      hall: selectedHall, meal_type: mealType,
    });
  };

  const handleLogFromCard = async (id, servings = 1) => {
    const strId = String(id);
    if (savedFoodIds.has(strId)) return;
    setLoggingIds(p => new Set([...p, strId]));
    try {
      await submitOneItem(id, servings || 1);
      setSavedFoodIds(p => new Set([...p, strId]));
      setSavedServings(p => ({ ...p, [strId]: servings || 1 }));
    } catch (e) {
      console.error("Log item error:", e);
    } finally {
      setLoggingIds(p => { const n = new Set(p); n.delete(strId); return n; });
    }
  };

  const handleRemoveLog = async (foodId) => {
    const strId = String(foodId);
    if (!savedFoodIds.has(strId)) return;
    setRemovingIds(p => new Set([...p, strId]));
    try {
      const lData = await apiGet(`/api/log?date=${TODAY}`, token);
      const logs = lData.logs || [];
      let match = logs.find(l => String(l.food_id) === strId && (l.meal_type || "") === mealType);
      if (!match) match = logs.find(l => String(l.food_id) === strId);
      if (match && match.id) {
        await apiDelete(`/api/log/${match.id}`, token);
        setSavedFoodIds(p => { const n = new Set(p); n.delete(strId); return n; });
        setSavedServings(p => { const o = { ...p }; delete o[strId]; return o; });
      }
    } catch (e) {
      console.error("Remove log error:", e);
    } finally {
      setRemovingIds(p => { const n = new Set(p); n.delete(strId); return n; });
    }
  };

  const filtered = useMemo(() => {
    let list = menuItems;
    if (showSaved)           list = list.filter(i => savedFoodIds.has(String(i.food_id)));
    if (selectedStation !== "All") list = list.filter(i => i.station === selectedStation);
    if (activeTags.length)   list = list.filter(i => activeTags.every(t => i.food_tags.includes(t)));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(i => (i.name || "").toLowerCase().includes(q) || (i.station || "").toLowerCase().includes(q));
    }
    switch (sortKey) {
      case "station":  return [...list].sort((a, b) => (a.station || "").localeCompare(b.station || ""));
      case "cal_asc":  return [...list].sort((a, b) => (a.nutrition?.calories ?? 0) - (b.nutrition?.calories ?? 0));
      case "cal_desc": return [...list].sort((a, b) => (b.nutrition?.calories ?? 0) - (a.nutrition?.calories ?? 0));
      case "protein":  return [...list].sort((a, b) => (b.nutrition?.g_protein ?? 0) - (a.nutrition?.g_protein ?? 0));
      default: return list;
    }
  }, [selectedStation, activeTags, sortKey, searchQuery, showSaved, menuItems, savedFoodIds]);

  const savedCount = savedFoodIds.size;
  const totalCal = menuItems
    .filter(i => savedFoodIds.has(String(i.food_id)))
    .reduce((s, i) => s + (i.nutrition?.calories ?? 0) * (savedServings[String(i.food_id)] || 1), 0);

  return (
    <main style={{ paddingBottom: 120, animation: "pageIn 0.35s ease" }}>
      {/* Sticky header — solid background so menu doesn't show through when scrolling */}
      <div style={{ padding: "52px 20px 0", position: "sticky", top: 0, background: "var(--bg)", zIndex: 20, paddingBottom: 8, borderBottom: "1px solid var(--border-faint)" }}>

        {/* Title row + hall picker */}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>Today's <span style={{ color: "var(--accent)" }}>Menu</span></h1>
          <button onClick={() => setShowHallPicker(p => !p)} aria-label="Change dining hall" aria-expanded={showHallPicker} style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "var(--accent)", background: "var(--accent)08", border: "1px solid var(--accent)20", borderRadius: 99, padding: "4px 10px", cursor: "pointer" }}>
            {diningHalls.find(h => h.id === selectedHall)?.shortName || "Gordon"} {"\u25BC"}
          </button>
        </div>

        {showHallPicker && (
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 8, marginBottom: 10, zIndex: 50, position: "relative" }} role="listbox" aria-label="Select dining hall">
            {diningHalls.map(h => (
              <button key={h.id} role="option" aria-selected={selectedHall === h.id} onClick={() => { setSelectedHall(h.id); setShowHallPicker(false); setSelectedStation("All"); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: 12, border: "none", cursor: "pointer", background: selectedHall === h.id ? "var(--accent)10" : "transparent", fontSize: 13, color: selectedHall === h.id ? "var(--accent)" : "var(--text-secondary)", fontWeight: selectedHall === h.id ? 700 : 400, transition: "all 0.15s" }}>
                {h.name}
              </button>
            ))}
          </div>
        )}

        {/* Meal tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 12 }} role="tablist" aria-label="Select meal">
          {["breakfast", "lunch", "dinner"].map(m => (
            <button key={m} role="tab" aria-selected={mealType === m} onClick={() => setMealType(m)} style={{ flex: 1, padding: "8px 0", borderRadius: 12, border: `1.5px solid ${mealType === m ? "var(--accent)" : "transparent"}`, cursor: "pointer", background: mealType === m ? "var(--accent)20" : "var(--bg-input)", fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: mealType === m ? 700 : 400, color: mealType === m ? "var(--accent)" : "var(--text-dim)", transition: "all 0.2s" }}>{m}</button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 10 }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 14, opacity: 0.35 }} aria-hidden="true">{"\uD83D\uDD0D"}</span>
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search dishes or stations..."
            aria-label="Search menu"
            style={{ width: "100%", padding: "12px 16px 12px 40px", borderRadius: 14, background: "var(--bg-input)", border: "1px solid var(--border-faint)", color: "var(--text-primary)", fontSize: 14 }} />
          {searchQuery && <button onClick={() => setSearchQuery("")} aria-label="Clear search" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 16, lineHeight: 1 }}>{"\u00D7"}</button>}
        </div>

        {/* Diet filters row */}
        <div style={{ marginBottom: 6 }}>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "var(--text-dim)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>Dietary</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {DIET_TAGS.map(tag => { const a = activeTags.includes(tag), s = TAG_STYLE[tag]; return (
              <button key={tag} onClick={() => toggleTag(tag)} aria-pressed={a} style={{ flexShrink: 0, padding: "5px 12px", borderRadius: 99, cursor: "pointer", background: a ? s.bg : "var(--bg-input)", border: `2px solid ${a ? s.color : "var(--border-faint)"}`, fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: "0.06em", fontWeight: a ? 700 : 400, color: a ? s.color : "var(--text-muted)", transition: "all 0.2s", boxShadow: a ? `0 0 0 2px ${s.color}25` : "none" }}>{a ? "\u2713 " : ""}{tag}</button>
            ); })}
          </div>
        </div>

        {/* Sort row */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "var(--text-dim)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>Sort by</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {SORT_OPTIONS.map(opt => (
              <button key={opt.key} onClick={() => setSortKey(opt.key)} aria-pressed={sortKey === opt.key} style={{ flexShrink: 0, padding: "5px 12px", borderRadius: 99, cursor: "pointer", background: sortKey === opt.key ? "color-mix(in srgb,var(--protein) 18%,transparent)" : "var(--bg-input)", border: `2px solid ${sortKey === opt.key ? "var(--protein)" : "var(--border-faint)"}`, fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: "0.06em", fontWeight: sortKey === opt.key ? 700 : 400, color: sortKey === opt.key ? "var(--protein)" : "var(--text-muted)", transition: "all 0.2s", boxShadow: sortKey === opt.key ? "0 0 0 2px var(--protein)20" : "none" }}>{opt.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Station filter scroll */}
      <div style={{ padding: "4px 20px 0", overflowX: "auto", display: "flex", gap: 8 }} role="group" aria-label="Filter by station">
        {stations.map(s => (
          <button key={s} onClick={() => setSelectedStation(s)} aria-pressed={selectedStation === s} style={{ flexShrink: 0, padding: "7px 14px", borderRadius: 12, cursor: "pointer", background: selectedStation === s ? "color-mix(in srgb,var(--accent) 15%,transparent)" : "transparent", border: `2px solid ${selectedStation === s ? "var(--accent)" : "var(--border-faint)"}`, fontWeight: selectedStation === s ? 700 : 400, fontSize: 12, color: selectedStation === s ? "var(--accent)" : "var(--text-muted)", display: "flex", alignItems: "center", gap: 5, transition: "all 0.2s", boxShadow: selectedStation === s ? "0 0 0 2px var(--accent)20" : "none" }}>
            {s !== "All" && STATION_ICONS[s] && <span aria-hidden="true">{STATION_ICONS[s]}</span>}{s}
          </button>
        ))}
      </div>

      {/* Count + saved toggle */}
      <div style={{ padding: "8px 20px 4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.08em" }}>{filtered.length} ITEM{filtered.length !== 1 ? "S" : ""}</span>
        <button onClick={() => setShowSaved(s => !s)} aria-pressed={showSaved} style={{ background: showSaved ? "var(--accent)10" : "var(--bg-input)", border: `1px solid ${showSaved ? "var(--accent)30" : "var(--border-faint)"}`, borderRadius: 99, padding: "4px 12px", cursor: "pointer", fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: "0.06em", color: showSaved ? "var(--accent)" : "var(--text-muted)", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 6 }}>
          {savedCount > 0 && <span style={{ background: "var(--accent)", color: "var(--accent-contrast)", borderRadius: "50%", width: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 8 }}>{savedCount}</span>}
          MY LOG
        </button>
      </div>

      {/* Recommended strip */}
      {(recsLoading || recs.length > 0) && showRecs && (
        <div style={{ padding: "12px 20px 4px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: MEAL_FOR_HOUR(new Date().getHours()) === "CLOSED" ? 4 : 10 }}>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15 }}>{"\u2022"} Recommended <span style={{ color: "var(--accent)" }}>for you</span></div>
              {MEAL_FOR_HOUR(new Date().getHours()) === "CLOSED" && <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>Dining closed — showing next: {effectiveMealForRecs}</div>}
            </div>
            <button onClick={() => setShowRecs(false)} aria-label="Hide recommendations" style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: "0.06em" }}>HIDE</button>
          </div>
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8 }}>
            {recsLoading ? [0, 1, 2].map(i => (
              <div key={i} style={{ flexShrink: 0, width: 148, height: 110, borderRadius: 16, background: "var(--bg-card)", border: "1px solid var(--border-faint)", backgroundImage: "linear-gradient(90deg,transparent 0%,var(--border-faint) 50%,transparent 100%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
            )) : recs.map(item => (
              <button key={item.food_id} onClick={() => { setSearchQuery(item.name); setShowRecs(false); }} style={{ flexShrink: 0, width: 148, background: "var(--accent)04", border: "1px solid var(--accent)15", borderRadius: 16, padding: 12, cursor: "pointer", position: "relative", transition: "border-color 0.2s", textAlign: "left" }}>
                <div style={{ position: "absolute", top: 8, right: 8, fontFamily: "'Space Mono',monospace", fontSize: 8, color: "var(--accent)", background: "var(--accent)10", padding: "2px 6px", borderRadius: 99 }}>{Math.round(item.score * 100)}pts</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)", lineHeight: 1.3, marginBottom: 4, paddingRight: 32, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name ?? ""}</div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "var(--text-muted)", marginBottom: 8 }}>{item.station ?? ""}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <div><span style={{ fontFamily: "'Space Mono',monospace", fontSize: 13, color: "var(--cal-color)" }}>{item.nutrition?.calories ?? "—"}</span><span style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "var(--text-dim)" }}> kcal</span></div>
                  <div><span style={{ fontFamily: "'Space Mono',monospace", fontSize: 13, color: "var(--protein)" }}>{item.nutrition?.g_protein ?? "—"}g</span><span style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "var(--text-dim)" }}> pro</span></div>
                </div>
              </button>
            ))}
          </div>
          <div style={{ height: 1, background: "var(--border-faint)", margin: "8px 0 4px" }} />
        </div>
      )}

      {/* Menu list */}
      <div style={{ padding: "0 20px" }}>
        {menuLoading ? (
          [0, 1, 2, 3].map(i => <div key={i} style={{ height: 52, borderRadius: 18, marginBottom: 10, background: "var(--bg-card)", backgroundImage: "linear-gradient(90deg,transparent,var(--border-faint),transparent)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />)
        ) : menuError ? (
          <div style={{ textAlign: "center", padding: "60px 0", animation: "fadeSlideUp 0.4s ease" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }} aria-hidden="true">{"\uD83D\uDCE1"}</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 18, color: "var(--text-dim)", marginBottom: 8 }}>Menu unavailable</div>
            <div style={{ fontSize: 13, color: "var(--text-dim)" }}>Could not reach the dining hall data. Try again later.</div>
            <button onClick={() => {
            setMenuError(false);
            setMenuLoading(true);
            fetch(`${API_BASE}/api/menu?hall=${selectedHall}&meal=${mealType}`)
              .then(r => r.json())
              .then(d => {
                const raw = (d && Array.isArray(d.items)) ? d.items : [];
                if (raw.length > 0) {
                  setMenuItems(raw.filter(i => i?.name?.trim()).map(i => {
                    const nut = i.nutrition || {};
                    return {
                      ...i,
                      nutrition: { calories: nut.calories ?? 0, g_protein: nut.g_protein ?? 0, g_carbs: nut.g_carbs ?? 0, g_fat: nut.g_fat ?? 0, g_sugar: nut.g_sugar ?? 0, mg_sodium: nut.mg_sodium ?? 0, g_fiber: nut.g_fiber ?? 0 },
                      food_tags: i.food_tags || [],
                    };
                  }));
                } else setMenuItems([]);
              })
              .catch(() => setMenuError(true))
              .finally(() => setMenuLoading(false));
          }} style={{ marginTop: 16, padding: "10px 24px", borderRadius: 14, border: "1px solid var(--border)", background: "var(--bg-input)", cursor: "pointer", fontSize: 13, color: "var(--text-secondary)" }}>Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", animation: "fadeSlideUp 0.4s ease" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }} aria-hidden="true">{"\uD83C\uDF5D"}</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 18, color: "var(--text-dim)" }}>Nothing found</div>
          </div>
        ) : filtered.map((item, i) => (
          <div key={item.food_id} style={{ animation: `fadeSlideUp 0.35s ease ${i * 0.04}s both` }}>
            <FoodCard
              item={item}
              saved={savedFoodIds.has(String(item.food_id))}
              servings={savedServings[String(item.food_id)] || 1}
              onServingsChange={updateServings}
              onSave={handleLogFromCard}
            onRemove={handleRemoveLog}
            logging={loggingIds.has(String(item.food_id))}
            removing={removingIds.has(String(item.food_id))}
            />
          </div>
        ))}
      </div>

    </main>
  );
}











