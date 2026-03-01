import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { AuthProvider, AuthGate, useAuth } from "./auth.jsx";

// ═══════════════════════════════════════════════════════════════════
// SHARED DATA
// ═══════════════════════════════════════════════════════════════════
const MENU = [
  { food_id: 1,  name: "Filipino Pork Sausage",   station: "1849",               food_category: "meat",      serving_size: "1 (4 oz)",  nutrition: { calories: 280, g_protein: 18, g_carbs: 4,  g_fat: 22, g_sugar: 1, mg_sodium: 620 }, food_tags: ["Gluten-Free"] },
  { food_id: 2,  name: "Scrambled Eggs",           station: "Eggcetera",          food_category: "entree",    serving_size: "0.5 cup",   nutrition: { calories: 150, g_protein: 11, g_carbs: 2,  g_fat: 11, g_sugar: 1, mg_sodium: 310 }, food_tags: ["Vegetarian","Gluten-Free"] },
  { food_id: 3,  name: "Sourdough Toast",          station: "Buckingham Bakery",  food_category: "grain",     serving_size: "2 slices",  nutrition: { calories: 180, g_protein: 6,  g_carbs: 34, g_fat: 2,  g_sugar: 2, mg_sodium: 380 }, food_tags: ["Vegan"] },
  { food_id: 4,  name: "Cheese Pizza",             station: "Capital City Pizza", food_category: "entree",    serving_size: "1 slice",   nutrition: { calories: 310, g_protein: 13, g_carbs: 38, g_fat: 12, g_sugar: 4, mg_sodium: 680 }, food_tags: ["Vegetarian"] },
  { food_id: 5,  name: "Caesar Salad",             station: "Great Greens",       food_category: "vegetable", serving_size: "1 cup",     nutrition: { calories: 120, g_protein: 4,  g_carbs: 8,  g_fat: 9,  g_sugar: 2, mg_sodium: 290 }, food_tags: ["Vegetarian"] },
  { food_id: 6,  name: "Grilled Chicken Breast",   station: "Fired Up",           food_category: "meat",      serving_size: "1 (5 oz)",  nutrition: { calories: 220, g_protein: 42, g_carbs: 0,  g_fat: 5,  g_sugar: 0, mg_sodium: 440 }, food_tags: ["Gluten-Free"] },
  { food_id: 7,  name: "Black Bean Burrito",       station: "Que Rico",           food_category: "entree",    serving_size: "1 burrito", nutrition: { calories: 420, g_protein: 16, g_carbs: 62, g_fat: 12, g_sugar: 3, mg_sodium: 780 }, food_tags: ["Vegan"] },
  { food_id: 8,  name: "Penne Bolognese",          station: "Buona Cucina",       food_category: "entree",    serving_size: "1 cup",     nutrition: { calories: 380, g_protein: 22, g_carbs: 48, g_fat: 11, g_sugar: 6, mg_sodium: 560 }, food_tags: [] },
  { food_id: 9,  name: "Chocolate Chip Cookie",    station: "Buckingham Bakery",  food_category: "dessert",   serving_size: "1 cookie",  nutrition: { calories: 210, g_protein: 2,  g_carbs: 30, g_fat: 10, g_sugar: 18, mg_sodium: 160 }, food_tags: ["Vegetarian"] },
  { food_id: 10, name: "Roasted Broccoli",         station: "Gordon Delicious",   food_category: "vegetable", serving_size: "0.5 cup",   nutrition: { calories: 55,  g_protein: 3,  g_carbs: 7,  g_fat: 2,  g_sugar: 2, mg_sodium: 130 }, food_tags: ["Vegan","Gluten-Free"] },
  { food_id: 11, name: "Brown Rice",               station: "Gordon Delicious",   food_category: "grain",     serving_size: "0.5 cup",   nutrition: { calories: 110, g_protein: 3,  g_carbs: 23, g_fat: 1,  g_sugar: 0, mg_sodium: 5   }, food_tags: ["Vegan","Gluten-Free"] },
  { food_id: 12, name: "Pepperoni Pizza",          station: "Capital City Pizza", food_category: "entree",    serving_size: "1 slice",   nutrition: { calories: 360, g_protein: 15, g_carbs: 37, g_fat: 17, g_sugar: 3, mg_sodium: 820 }, food_tags: [] },
  { food_id: 13, name: "Greek Yogurt Parfait",     station: "Eggcetera",          food_category: "other",     serving_size: "1 cup",     nutrition: { calories: 190, g_protein: 14, g_carbs: 28, g_fat: 3,  g_sugar: 20, mg_sodium: 85  }, food_tags: ["Vegetarian","Gluten-Free"] },
  { food_id: 14, name: "Chicken Tacos",            station: "Que Rico",           food_category: "entree",    serving_size: "2 tacos",   nutrition: { calories: 340, g_protein: 26, g_carbs: 32, g_fat: 11, g_sugar: 2, mg_sodium: 640 }, food_tags: [] },
  { food_id: 15, name: "Garlic Bread",             station: "Buona Cucina",       food_category: "grain",     serving_size: "1 slice",   nutrition: { calories: 160, g_protein: 4,  g_carbs: 22, g_fat: 7,  g_sugar: 1, mg_sodium: 310 }, food_tags: ["Vegetarian"] },
  { food_id: 16, name: "Beef Burger",              station: "1849",               food_category: "entree",    serving_size: "1 burger",  nutrition: { calories: 510, g_protein: 32, g_carbs: 42, g_fat: 24, g_sugar: 6, mg_sodium: 890 }, food_tags: [] },
  { food_id: 17, name: "Lentil Soup",              station: "Great Greens",       food_category: "other",     serving_size: "1 cup",     nutrition: { calories: 140, g_protein: 9,  g_carbs: 22, g_fat: 2,  g_sugar: 3, mg_sodium: 480 }, food_tags: ["Vegan","Gluten-Free"] },
  { food_id: 18, name: "BBQ Pulled Pork",          station: "Fired Up",           food_category: "meat",      serving_size: "3 oz",      nutrition: { calories: 290, g_protein: 25, g_carbs: 14, g_fat: 13, g_sugar: 10, mg_sodium: 730 }, food_tags: ["Gluten-Free"] },
];

const USER = { name: "Alex", goal: "build_muscle", calorie_goal: 2400, protein_goal: 160, carb_goal: 260, fat_goal: 80 };

const TAG_COLOR = { "Vegan": "#4ade80", "Vegetarian": "#86efac", "Gluten-Free": "#fbbf24" };
const TAG_STYLE = {
  "Vegan":       { bg: "#4ade8018", border: "#4ade8040", color: "#4ade80" },
  "Vegetarian":  { bg: "#86efac18", border: "#86efac40", color: "#86efac" },
  "Gluten-Free": { bg: "#fbbf2418", border: "#fbbf2440", color: "#fbbf24" },
};

// ═══════════════════════════════════════════════════════════════════
// GLOBAL STYLES
// ═══════════════════════════════════════════════════════════════════
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  html,body{background:#06080f;color:#f1f5f9;font-family:'DM Sans',sans-serif;min-height:100%;}
  ::-webkit-scrollbar{width:3px;height:3px;}
  ::-webkit-scrollbar-track{background:transparent;}
  ::-webkit-scrollbar-thumb{background:#1e293b;border-radius:99px;}
  input::placeholder{color:#334155;}
  input{caret-color:#00f5a0;outline:none;}
  button{font-family:'DM Sans',sans-serif;}
  @keyframes fadeSlideUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
  @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
  @keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-7px);}}
  @keyframes scanline{0%{top:-2px;}50%{top:100%;}100%{top:-2px;}}
  @keyframes shimmer{0%{background-position:0% 0;}100%{background-position:200% 0;}}
  @keyframes pulse-ring{0%{transform:scale(0.95);box-shadow:0 0 0 0 #00f5a050;}70%{transform:scale(1);box-shadow:0 0 0 16px transparent;}100%{transform:scale(0.95);box-shadow:0 0 0 0 transparent;}}
  @keyframes spin-slow{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
  @keyframes waveIn{0%{transform:scale(0.5);opacity:0;}60%{transform:scale(1.1);opacity:1;}100%{transform:scale(1);}}
  @keyframes analyzing-bar{0%{width:0%;}100%{width:100%;}}
  @keyframes pageIn{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
`;

// ═══════════════════════════════════════════════════════════════════
// BOTTOM NAV
// ═══════════════════════════════════════════════════════════════════
const NAV_ITEMS = [
  { key: "home",  icon: "🏠", label: "Home"   },
  { key: "snap",  icon: "📸", label: "Snap"   },
  { key: "menu",  icon: "📋", label: "Menu"   },
  { key: "trends",icon: "📈", label: "Trends" },
];

function BottomNav({ active, onNav }) {
  return (
    <div style={{
      position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
      width:"100%", maxWidth:420,
      background:"rgba(6,8,15,0.97)", backdropFilter:"blur(20px)",
      borderTop:"1px solid rgba(255,255,255,0.05)",
      padding:"14px 24px 28px", display:"flex", justifyContent:"space-around", zIndex:50,
    }}>
      {NAV_ITEMS.map(({key,icon,label}) => {
        const isActive = active === key;
        return (
          <div key={key} onClick={() => onNav(key)}
            style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, cursor:"pointer", opacity:isActive?1:0.32, transition:"opacity 0.2s" }}>
            <span style={{fontSize:20}}>{icon}</span>
            <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:isActive?"#00f5a0":"#475569", letterSpacing:"0.05em" }}>{label}</span>
            {isActive && <div style={{width:4,height:4,borderRadius:"50%",background:"#00f5a0"}}/>}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PAGE: DASHBOARD
// ═══════════════════════════════════════════════════════════════════
const TODAY_MEALS = [
  { meal_id:"m1", meal_type:"breakfast", logged_at:"2026-02-28T08:12:00Z",
    dishes:[
      {food_id:2,name:"Scrambled Eggs",station:"Eggcetera",servings:1,nutrition:{calories:150,g_protein:11,g_carbs:2,g_fat:11,mg_sodium:310}},
      {food_id:3,name:"Sourdough Toast",station:"Buckingham Bakery",servings:2,nutrition:{calories:360,g_protein:12,g_carbs:68,g_fat:4,mg_sodium:760}},
    ], total_nutrition:{calories:510,g_protein:23,g_carbs:70,g_fat:15} },
  { meal_id:"m2", meal_type:"lunch", logged_at:"2026-02-28T12:45:00Z",
    dishes:[
      {food_id:6,name:"Grilled Chicken Breast",station:"Fired Up",servings:1,nutrition:{calories:220,g_protein:42,g_carbs:0,g_fat:5,mg_sodium:440}},
      {food_id:5,name:"Caesar Salad",station:"Great Greens",servings:1,nutrition:{calories:120,g_protein:4,g_carbs:8,g_fat:9,mg_sodium:290}},
      {food_id:11,name:"Brown Rice",station:"Gordon Delicious",servings:1,nutrition:{calories:110,g_protein:3,g_carbs:23,g_fat:1,mg_sodium:5}},
    ], total_nutrition:{calories:450,g_protein:49,g_carbs:31,g_fat:15} },
];
const MEAL_ICONS = {breakfast:"🌅",lunch:"☀️",dinner:"🌙",snack:"🍎"};
const RECOMMENDED = [
  {food_id:8, name:"Penne Bolognese",     station:"Buona Cucina", nutrition:{calories:380,g_protein:22,g_carbs:48,g_fat:11}, food_tags:[]},
  {food_id:18,name:"BBQ Pulled Pork",     station:"Fired Up",     nutrition:{calories:290,g_protein:25,g_carbs:14,g_fat:13}, food_tags:["Gluten-Free"]},
  {food_id:13,name:"Greek Yogurt Parfait",station:"Eggcetera",    nutrition:{calories:190,g_protein:14,g_carbs:28,g_fat:3},  food_tags:["Vegetarian","Gluten-Free"]},
];

function CalorieRing({consumed,goal}) {
  const r=72,stroke=8,cx=88,circ=2*Math.PI*r,over=consumed>goal;
  const pct=Math.min(1,consumed/goal);
  const [anim,setAnim]=useState(0);
  useEffect(()=>{const t=setTimeout(()=>setAnim(pct),120);return()=>clearTimeout(t);},[pct]);
  return (
    <div style={{position:"relative",width:176,height:176,flexShrink:0}}>
      <svg width="176" height="176" style={{transform:"rotate(-90deg)"}}>
        <defs><linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={over?"#f87171":"#00f5a0"}/>
          <stop offset="100%" stopColor={over?"#fb923c":"#00d9f5"}/>
        </linearGradient></defs>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={stroke}/>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="url(#rg)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${circ*anim} ${circ}`} style={{transition:"stroke-dasharray 1.2s cubic-bezier(0.34,1.2,0.64,1)"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <div style={{fontFamily:"'Space Mono',monospace",fontSize:28,fontWeight:700,color:over?"#f87171":"#f1f5f9",lineHeight:1}}>{consumed}</div>
        <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#475569",marginTop:3}}>of {goal} kcal</div>
        <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:over?"#f87171":"#00f5a0",marginTop:6,background:over?"#f8717115":"#00f5a015",padding:"2px 10px",borderRadius:99,border:`1px solid ${over?"#f8717130":"#00f5a030"}`}}>
          {over?`+${consumed-goal} over`:`${goal-consumed} left`}
        </div>
      </div>
    </div>
  );
}

function MacroRow({label,consumed,goal,color}) {
  const pct=Math.min(100,(consumed/goal)*100);
  const [anim,setAnim]=useState(0);
  useEffect(()=>{const t=setTimeout(()=>setAnim(pct),200);return()=>clearTimeout(t);},[pct]);
  return (
    <div style={{marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
        <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#94a3b8"}}>{label}</span>
        <span style={{fontFamily:"'Space Mono',monospace",fontSize:11,color}}>{consumed}g <span style={{color:"#334155"}}>/ {goal}g</span></span>
      </div>
      <div style={{height:6,background:"rgba(255,255,255,0.04)",borderRadius:99,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${anim}%`,background:`linear-gradient(90deg,${color},${color}cc)`,borderRadius:99,transition:"width 1s cubic-bezier(0.34,1.2,0.64,1)",position:"relative"}}>
          <div style={{position:"absolute",right:0,top:-1,width:8,height:8,borderRadius:"50%",background:color,boxShadow:`0 0 8px ${color}`}}/>
        </div>
      </div>
    </div>
  );
}

function MealCard({meal}) {
  const [open,setOpen]=useState(false);
  const time=new Date(meal.logged_at).toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"});
  return (
    <div style={{background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:18,marginBottom:10,overflow:"hidden"}}>
      <div onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",cursor:"pointer"}}>
        <div style={{width:40,height:40,borderRadius:14,background:"rgba(255,255,255,0.04)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>
          {MEAL_ICONS[meal.meal_type]}
        </div>
        <div style={{flex:1}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
            <span style={{fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:15,color:"#f1f5f9",textTransform:"capitalize"}}>{meal.meal_type}</span>
            <span style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"#334155"}}>{time}</span>
          </div>
          <div style={{display:"flex",gap:10,marginTop:4}}>
            <span style={{fontFamily:"'Space Mono',monospace",fontSize:11,color:"#f472b6"}}>{meal.total_nutrition.calories} kcal</span>
            <span style={{fontFamily:"'Space Mono',monospace",fontSize:11,color:"#60a5fa"}}>{meal.total_nutrition.g_protein}g pro</span>
            <span style={{fontFamily:"'Space Mono',monospace",fontSize:11,color:"#fbbf24"}}>{meal.total_nutrition.g_carbs}g carb</span>
          </div>
        </div>
        <span style={{color:"#334155",fontSize:12,transition:"transform 0.3s",transform:open?"rotate(180deg)":"none"}}>▾</span>
      </div>
      {open && (
        <div style={{padding:"0 16px 14px",borderTop:"1px solid rgba(255,255,255,0.04)",animation:"fadeIn 0.2s ease"}}>
          {meal.dishes.map(d=>(
            <div key={d.food_id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
              <div>
                <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#cbd5e1"}}>{d.name}</div>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"#334155",marginTop:2}}>{d.station} · ×{d.servings}</div>
              </div>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:12,color:"#64748b"}}>{d.nutrition.calories} kcal</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const API_BASE = "https://badgerbite-api.onrender.com";
const MEAL_FOR_HOUR = (h) => h < 11 ? "breakfast" : h < 16 ? "lunch" : "dinner";
const TODAY = new Date().toISOString().slice(0,10);

async function apiGet(path, token) {
  const r = await fetch(`${API_BASE}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
async function apiPost(path, token, body) {
  const r = await fetch(`${API_BASE}${path}`, {
    method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
async function apiDelete(path, token) {
  const r = await fetch(`${API_BASE}${path}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

function Dashboard({onNav}) {
  const { logout, user, token } = useAuth();
  const [greeting,setGreeting]=useState("");
  const [profile,setProfile]=useState(null);
  const [todayLogs,setTodayLogs]=useState([]);
  const [todayTotals,setTodayTotals]=useState({calories:0,protein_g:0,carbs_g:0,fat_g:0});
  const [recs,setRecs]=useState([]);
  const [recsRemaining,setRecsRemaining]=useState(null);
  const [recsMeal,setRecsMeal]=useState("");
  const [recsLoading,setRecsLoading]=useState(true);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{const h=new Date().getHours();setGreeting(h<12?"Good morning":h<17?"Good afternoon":"Good evening");},[]);

  useEffect(()=>{
    const timer=setTimeout(()=>setLoading(false),8000); // safety timeout
    Promise.all([
      apiGet("/api/profile", token).catch(()=>({profile:null})),
      apiGet(`/api/log?date=${TODAY}`, token).catch(()=>({logs:[],totals:{}})),
      apiGet("/api/targets", token).catch(()=>({targets:null})),
    ]).then(([pData, lData, tData])=>{
      setProfile({...(pData.profile||{}), ...(tData.targets||{})});
      const groups={};
      (lData.logs||[]).forEach(log=>{
        const mt=log.meal_type||"snack";
        if(!groups[mt])groups[mt]={meal_id:mt,meal_type:mt,logged_at:log.logged_at,dishes:[],total_nutrition:{calories:0,g_protein:0,g_carbs:0,g_fat:0}};
        groups[mt].dishes.push({food_id:log.food_id||log.id,name:log.food_name,station:log.hall||"",servings:log.quantity||1,nutrition:{calories:log.calories||0,g_protein:log.protein_g||0,g_carbs:log.carbs_g||0,g_fat:log.fat_g||0,mg_sodium:log.sodium_mg||0}});
        groups[mt].total_nutrition.calories+=log.calories||0;
        groups[mt].total_nutrition.g_protein+=log.protein_g||0;
        groups[mt].total_nutrition.g_carbs+=log.carbs_g||0;
        groups[mt].total_nutrition.g_fat+=log.fat_g||0;
      });
      setTodayLogs(Object.values(groups));
      setTodayTotals(lData.totals||{calories:0,protein_g:0,carbs_g:0,fat_g:0});
    }).catch(()=>{}).finally(()=>{clearTimeout(timer);setLoading(false);});
  },[token]);

  useEffect(()=>{
    const meal=MEAL_FOR_HOUR(new Date().getHours());
    setRecsMeal(meal);
    apiGet(`/api/recommend?meal=${meal}`, token)
      .then(data=>{
        const all=Object.entries(data.halls||{}).flatMap(([,items])=>items);
        all.sort((a,b)=>b.score-a.score);
        setRecs(all.slice(0,5));
        setRecsRemaining(data.remaining||null);
      })
      .catch(()=>{})
      .finally(()=>setRecsLoading(false));
  },[token]);

  const calGoal  = profile?.calorie_target || 2000;
  const protGoal = profile?.protein_g       || 150;
  const carbGoal = profile?.carbs_g         || 250;
  const fatGoal  = profile?.fat_g           || 65;
  const totals = { calories:todayTotals.calories||0, g_protein:todayTotals.protein_g||0, g_carbs:todayTotals.carbs_g||0, g_fat:todayTotals.fat_g||0 };
  const displayName = profile?.display_name || user?.email?.split("@")[0] || "there";
  const goalLabel = profile?.goal ? profile.goal.replace("_"," ") : "maintain";
  const loggedMealTypes = new Set(todayLogs.map(m=>m.meal_type));
  const unloggedMeals = ["breakfast","lunch","dinner"].filter(m=>!loggedMealTypes.has(m));

  return (
    <div style={{paddingBottom:110,animation:"pageIn 0.35s ease"}}>
      <div style={{position:"fixed",top:-80,left:"50%",transform:"translateX(-50%)",width:500,height:500,background:"radial-gradient(circle,#00f5a006 0%,transparent 65%)",pointerEvents:"none",zIndex:0}}/>

      <div style={{padding:"52px 22px 20px",position:"relative",zIndex:1}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{fontFamily:"'Space Mono',monospace",fontSize:11,color:"#334155",letterSpacing:"0.1em",textTransform:"uppercase"}}>{greeting}</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:28,letterSpacing:"-0.02em",marginTop:3}}>{displayName} <span style={{color:"#00f5a0"}}>👋</span></div>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#475569",marginTop:4}}>Goal: <span style={{color:"#94a3b8",textTransform:"capitalize"}}>{goalLabel}</span></div>
          </div>
          <button onClick={logout} title="Sign out" style={{width:46,height:46,borderRadius:16,background:"linear-gradient(135deg,#00f5a020,#00d9f520)",border:"1px solid #00f5a025",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,cursor:"pointer",flexShrink:0}}>🦡</button>
        </div>
      </div>

      <div style={{padding:"0 22px",position:"relative",zIndex:1}}>
        <div style={{background:"linear-gradient(135deg,rgba(15,20,40,0.9),rgba(10,15,30,0.95))",border:"1px solid rgba(255,255,255,0.07)",borderRadius:24,padding:22,marginBottom:16,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:"linear-gradient(90deg,transparent,#00f5a040,transparent)"}}/>
          <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"#334155",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:18}}>Today · {new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"})}</div>
          {loading?(
            <div style={{height:176,display:"flex",alignItems:"center",justifyContent:"center",color:"#334155",fontFamily:"'Space Mono',monospace",fontSize:11}}>Loading…</div>
          ):(
            <>
              <div style={{display:"flex",gap:20,alignItems:"center"}}>
                <CalorieRing consumed={totals.calories} goal={calGoal}/>
                <div style={{flex:1}}>
                  <MacroRow label="Protein" consumed={totals.g_protein} goal={protGoal} color="#60a5fa"/>
                  <MacroRow label="Carbs"   consumed={totals.g_carbs}   goal={carbGoal} color="#fbbf24"/>
                  <MacroRow label="Fat"     consumed={totals.g_fat}     goal={fatGoal}  color="#f97316"/>
                </div>
              </div>
              <div style={{display:"flex",gap:10,marginTop:18,paddingTop:18,borderTop:"1px solid rgba(255,255,255,0.04)"}}>
                {[{label:"meals",value:todayLogs.length},{label:"% cal",value:`${Math.round(totals.calories/calGoal*100)}%`},{label:"protein",value:`${Math.round(totals.g_protein/protGoal*100)}%`}].map(({label,value})=>(
                  <div key={label} style={{flex:1,textAlign:"center",background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"10px 6px"}}>
                    <div style={{fontFamily:"'Space Mono',monospace",fontSize:16,fontWeight:700,color:"#f1f5f9"}}>{value}</div>
                    <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:"#334155",marginTop:2,textTransform:"uppercase",letterSpacing:"0.06em"}}>{label}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div onClick={()=>onNav("snap")} style={{background:"linear-gradient(135deg,#00f5a0,#00d9f5)",borderRadius:20,padding:"16px 20px",marginBottom:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 8px 32px #00f5a030"}}>
          <div>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:17,color:"#030912"}}>📸 Snap your meal</div>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#065f46",marginTop:2}}>Auto-detect & log in seconds</div>
          </div>
          <div style={{fontFamily:"'Space Mono',monospace",fontSize:22,color:"#030912",animation:"float 2s ease-in-out infinite"}}>→</div>
        </div>

        <div style={{marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:17}}>Today's meals</div>
            <span style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"#334155",letterSpacing:"0.1em"}}>{todayLogs.length} LOGGED</span>
          </div>
          {loading?(
            [0,1].map(i=><div key={i} style={{height:64,borderRadius:18,marginBottom:10,background:"rgba(255,255,255,0.03)",backgroundImage:"linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent)",backgroundSize:"200% 100%",animation:"shimmer 1.5s infinite"}}/>)
          ):todayLogs.length===0?(
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#334155",padding:"8px 0 12px"}}>Nothing logged yet today.</div>
          ):(
            todayLogs.map(m=><MealCard key={m.meal_id} meal={m}/>)
          )}
          {unloggedMeals.map(meal=>(
            <div key={meal} style={{border:"1px dashed rgba(255,255,255,0.07)",borderRadius:18,padding:16,display:"flex",alignItems:"center",gap:12,cursor:"pointer",marginBottom:8}} onClick={()=>onNav("snap")}>
              <div style={{width:40,height:40,borderRadius:14,background:"rgba(255,255,255,0.03)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{MEAL_ICONS[meal]}</div>
              <div>
                <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:14,color:"#334155",textTransform:"capitalize"}}>{meal} not logged yet</div>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"#1e293b",marginTop:2}}>+ TAP TO LOG</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{marginBottom:24}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:12}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:17}}>Recommended <span style={{color:"#00f5a0"}}>{recsMeal||"today"}</span></div>
            <span style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"#334155",textTransform:"uppercase"}}>{recsMeal} · All Halls</span>
          </div>
          {recsRemaining&&(
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#475569",marginBottom:14}}>
              You need <span style={{color:"#60a5fa"}}>{recsRemaining.protein_g}g more protein</span> and <span style={{color:"#f472b6"}}>{recsRemaining.calories} kcal</span> today.
            </div>
          )}
          {recsLoading?(
            <div style={{display:"flex",gap:12,overflowX:"auto",paddingBottom:8}}>
              {[0,1,2].map(i=>(
                <div key={i} style={{flexShrink:0,width:160,height:130,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:18,animation:"shimmer 1.5s infinite",backgroundImage:"linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.04) 50%,transparent 100%)",backgroundSize:"200% 100%"}}/>
              ))}
            </div>
          ):recs.length===0?(
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#334155",padding:"16px 0"}}>No recommendations available right now.</div>
          ):(
            <div style={{display:"flex",gap:12,overflowX:"auto",paddingBottom:8}}>
              {recs.map(item=>(
                <div key={item.food_id} style={{flexShrink:0,width:160,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:18,padding:14,cursor:"pointer",position:"relative"}}>
                  {item.is_saved&&<div style={{position:"absolute",top:10,right:10,fontSize:12}}>🔖</div>}
                  <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:13,color:"#f1f5f9",marginBottom:4,lineHeight:1.3,paddingRight:item.is_saved?16:0}}>{item.name}</div>
                  <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"#475569",marginBottom:8}}>{item.station}</div>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:10}}>
                    {(item.food_tags||[]).map(t=><span key={t} style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:TAG_COLOR[t]||"#94a3b8",background:`${TAG_COLOR[t]||"#94a3b8"}15`,padding:"2px 7px",borderRadius:99}}>{t}</span>)}
                  </div>
                  <div style={{borderTop:"1px solid rgba(255,255,255,0.05)",paddingTop:10,display:"flex",justifyContent:"space-between"}}>
                    <div><div style={{fontFamily:"'Space Mono',monospace",fontSize:13,color:"#f472b6"}}>{item.nutrition.calories}</div><div style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:"#334155"}}>kcal</div></div>
                    <div><div style={{fontFamily:"'Space Mono',monospace",fontSize:13,color:"#60a5fa"}}>{item.nutrition.g_protein}g</div><div style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:"#334155"}}>protein</div></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PAGE: SNAP
// ═══════════════════════════════════════════════════════════════════
const MOCK_DETECTIONS=[{label:"pizza",confidence:0.89},{label:"salad",confidence:0.74},{label:"bread",confidence:0.61}];

function CornerBracket({style}) {
  return (
    <div style={{position:"absolute",width:28,height:28,...style}}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M0 14 L0 0 L14 0" stroke="#00f5a0" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

function MacroPill({label,value,unit,color}) {
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",background:`${color}15`,border:`1px solid ${color}40`,borderRadius:12,padding:"8px 14px",minWidth:64}}>
      <span style={{fontFamily:"'Space Mono',monospace",fontSize:15,fontWeight:700,color}}>{value}{unit}</span>
      <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:"#94a3b8",marginTop:2,textTransform:"uppercase",letterSpacing:"0.08em"}}>{label}</span>
    </div>
  );
}

function MatchCard({item,score,onConfirm,confirmed}) {
  const [servings,setServings]=useState(1);
  const cal=Math.round(item.nutrition.calories*servings);
  const prot=Math.round(item.nutrition.g_protein*servings);
  const carbs=Math.round(item.nutrition.g_carbs*servings);
  const fat=Math.round(item.nutrition.g_fat*servings);
  return (
    <div style={{background:confirmed?"linear-gradient(135deg,#0f2027,#1a1a2e)":"rgba(15,20,40,0.85)",border:confirmed?"1.5px solid #00f5a0":"1px solid rgba(255,255,255,0.08)",borderRadius:20,padding:"18px 20px",marginBottom:12,boxShadow:confirmed?"0 0 32px #00f5a030":"none",transition:"all 0.35s cubic-bezier(0.34,1.56,0.64,1)",position:"relative",overflow:"hidden"}}>
      {confirmed&&<div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,#00f5a0,#00d9f5,#00f5a0)",backgroundSize:"200%",animation:"shimmer 2s linear infinite"}}/>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
        <div>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:16,color:"#f1f5f9"}}>{item.name}</div>
          <div style={{display:"flex",gap:6,marginTop:5,flexWrap:"wrap"}}>
            <span style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"#64748b",background:"rgba(100,116,139,0.15)",padding:"2px 8px",borderRadius:99}}>{item.station}</span>
            {item.food_tags.map(t=><span key={t} style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:TAG_COLOR[t]||"#94a3b8",background:`${TAG_COLOR[t]||"#94a3b8"}15`,padding:"2px 8px",borderRadius:99}}>{t}</span>)}
          </div>
        </div>
        <div style={{fontFamily:"'Space Mono',monospace",fontSize:11,color:score>0.7?"#00f5a0":score>0.5?"#fbbf24":"#f87171",background:score>0.7?"#00f5a015":score>0.5?"#fbbf2415":"#f8717115",padding:"3px 10px",borderRadius:99,border:`1px solid ${score>0.7?"#00f5a040":score>0.5?"#fbbf2440":"#f8717140"}`}}>
          {Math.round(score*100)}% match
        </div>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
        <MacroPill label="cal" value={cal} unit="" color="#f472b6"/>
        <MacroPill label="protein" value={prot} unit="g" color="#60a5fa"/>
        <MacroPill label="carbs" value={carbs} unit="g" color="#fbbf24"/>
        <MacroPill label="fat" value={fat} unit="g" color="#f97316"/>
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.04)",borderRadius:12,padding:"4px 12px",border:"1px solid rgba(255,255,255,0.08)"}}>
          <button onClick={()=>setServings(s=>Math.max(0.5,s-0.5))} style={{background:"none",border:"none",color:"#64748b",cursor:"pointer",fontSize:18,lineHeight:1,padding:"0 2px"}}>−</button>
          <span style={{fontFamily:"'Space Mono',monospace",fontSize:13,color:"#cbd5e1",minWidth:28,textAlign:"center"}}>{servings}×</span>
          <button onClick={()=>setServings(s=>Math.min(4,s+0.5))} style={{background:"none",border:"none",color:"#64748b",cursor:"pointer",fontSize:18,lineHeight:1,padding:"0 2px"}}>+</button>
        </div>
        <button onClick={()=>onConfirm({...item,servings})} style={{flex:1,padding:"10px 16px",borderRadius:12,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:13,background:confirmed?"linear-gradient(135deg,#00f5a0,#00d9f5)":"rgba(255,255,255,0.06)",color:confirmed?"#0a0a0f":"#94a3b8",transition:"all 0.25s ease"}}>
          {confirmed?"✓ Added to log":"Confirm & log"}
        </button>
      </div>
    </div>
  );
}

function SnapPage({onNav}) {
  const { token } = useAuth();
  const [phase,setPhase]=useState("idle");
  const [detections,setDetections]=useState([]);
  const [matches,setMatches]=useState([]);
  const [confirmed,setConfirmed]=useState({});
  const [searchQuery,setSearchQuery]=useState("");
  const [showSuccess,setShowSuccess]=useState(false);
  const [logError,setLogError]=useState("");
  const videoRef=useRef(null);
  const streamRef=useRef(null);
  const fileInputRef=useRef(null);

  const stopCamera=useCallback(()=>{
    if(streamRef.current)streamRef.current.getTracks().forEach(t=>t.stop());
    streamRef.current=null;
  },[]);

  const [cameraError, setCameraError] = useState("");
  const [cameraStatus, setCameraStatus] = useState("");
  const [pendingStream, setPendingStream] = useState(null);

  const startCamera=useCallback(async()=>{
    setCameraError("");
    setCameraStatus("Requesting camera...");
    try{
      let stream;
      try {
        stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});
      } catch {
        stream=await navigator.mediaDevices.getUserMedia({video:true});
      }
      setPendingStream(stream);
      setPhase("scanning");
    }catch(e){
      console.error("Camera error:", e);
      setCameraError(e.name === "NotAllowedError"
        ? "Camera permission denied. Please allow camera access in browser settings."
        : "Could not access camera: " + e.message);
    }
  },[]);

  // Apply stream to video when phase changes to scanning
  useEffect(()=>{
    if(phase==="scanning" && pendingStream && videoRef.current){
      setCameraStatus("Setting video src...");
      videoRef.current.srcObject=pendingStream;
      videoRef.current.play().then(()=>{
        setCameraStatus("Playing!");
      }).catch(e=>{
        setCameraError("Failed to play video: " + e.message);
      });
      setPendingStream(null);
    }
  },[phase, pendingStream]);

  const runAnalysis=useCallback(async(fileOrEvent)=>{
    setPhase("analyzing");stopCamera();
    try{
      // Get image from file input or video frame
      let base64Image="";
      const file=fileOrEvent?.target?.files?.[0];
      if(file){
        base64Image=await new Promise((res,rej)=>{
          const r=new FileReader();
          r.onload=e=>res(e.target.result.split(",")[1]);
          r.onerror=rej;
          r.readAsDataURL(file);
        });
      } else if(videoRef.current){
        const canvas=document.createElement("canvas");
        canvas.width=videoRef.current.videoWidth||640;
        canvas.height=videoRef.current.videoHeight||480;
        canvas.getContext("2d").drawImage(videoRef.current,0,0);
        base64Image=canvas.toDataURL("image/jpeg",0.8).split(",")[1];
      }
      const meal=MEAL_FOR_HOUR(new Date().getHours());
      const data=await apiPost("/api/snap",token,{
        image:base64Image,
        hall:"gordon-avenue-market",
        meal,
      });
      // Map matched items into our match format
      const results=(data.matched||[]).map(item=>({
        detection_label:item.name,
        confidence:0.9,
        candidates:[{food_item:{...item,food_category:"entree"},match_score:0.95}],
      }));
      setDetections((data.matched||[]).map(i=>({label:i.name,confidence:0.9})));
      setMatches(results);
      setPhase(results.length>0?"results":"manual");
    }catch(e){
      // fallback to manual
      setPhase("manual");
    }
  },[stopCamera,token]);

  const handleLog=useCallback(async()=>{
    setLogError("");
    const items=Object.values(confirmed).filter(Boolean);
    try{
      await Promise.all(items.map(item=>apiPost("/api/log",token,{
        food_id:String(item.food_id),
        food_name:item.name,
        quantity:item.servings||1,
        serving_size:item.serving_size||"1 serving",
        calories:Math.round((item.nutrition?.calories||0)*(item.servings||1)),
        protein_g:Math.round((item.nutrition?.g_protein||0)*(item.servings||1)),
        carbs_g:Math.round((item.nutrition?.g_carbs||0)*(item.servings||1)),
        fat_g:Math.round((item.nutrition?.g_fat||0)*(item.servings||1)),
        fiber_g:Math.round((item.nutrition?.g_fiber||0)*(item.servings||1)),
        sugar_g:Math.round((item.nutrition?.g_sugar||0)*(item.servings||1)),
        sodium_mg:Math.round((item.nutrition?.mg_sodium||item.nutrition?.g_sodium||0)*(item.servings||1)),
        hall:"gordon-avenue-market",
        meal_type:MEAL_FOR_HOUR(new Date().getHours()),
      })));
      setShowSuccess(true);
      setTimeout(()=>{setShowSuccess(false);setPhase("idle");setDetections([]);setMatches([]);setConfirmed({});stopCamera();},2200);
    }catch(e){setLogError("Failed to log. Try again.");}
  },[confirmed,stopCamera,token]);

  useEffect(()=>()=>stopCamera(),[stopCamera]);
  const [liveMenu,setLiveMenu]=useState(MENU);
  useEffect(()=>{
    const meal=MEAL_FOR_HOUR(new Date().getHours());
    fetch(`${API_BASE}/api/menu?hall=gordon-avenue-market&meal=${meal}`)
      .then(r=>r.json()).then(d=>{if(d.items&&d.items.length>0){
        setLiveMenu(d.items.map(i=>({...i,nutrition:{calories:i.nutrition.calories,g_protein:i.nutrition.g_protein,g_carbs:i.nutrition.g_carbs,g_fat:i.nutrition.g_fat,g_sugar:i.nutrition.g_sugar,mg_sodium:i.nutrition.mg_sodium},food_tags:i.food_tags||[]})));
      }}).catch(()=>{});
  },[]);
  const filteredMenu=liveMenu.filter(i=>(i.name||"").toLowerCase().includes(searchQuery.toLowerCase())||((i.station||"").toLowerCase().includes(searchQuery.toLowerCase())));

  return (
    <div style={{paddingBottom:100,animation:"pageIn 0.35s ease"}}>
      <div style={{position:"fixed",top:-100,left:"50%",transform:"translateX(-50%)",width:600,height:600,background:"radial-gradient(circle,#00f5a008 0%,transparent 70%)",pointerEvents:"none",zIndex:0}}/>
      <div style={{padding:"52px 24px 20px",position:"relative",zIndex:1}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:800,letterSpacing:"-0.02em"}}>Nutri<span style={{color:"#00f5a0"}}>Snap</span></div>
            <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"#334155",marginTop:2,letterSpacing:"0.1em",textTransform:"uppercase"}}>Gordon Ave · Dinner · Today</div>
          </div>
          <button onClick={()=>setPhase(p=>p==="manual"?(matches.length?"results":"idle"):"manual")} style={{background:phase==="manual"?"#00f5a015":"rgba(255,255,255,0.04)",border:`1px solid ${phase==="manual"?"#00f5a040":"rgba(255,255,255,0.08)"}`,borderRadius:12,padding:"8px 14px",cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:10,color:phase==="manual"?"#00f5a0":"#64748b",letterSpacing:"0.05em",transition:"all 0.2s"}}>
            {phase==="manual"?"← BACK":"MANUAL"}
          </button>
        </div>
      </div>

      {phase==="idle"&&(
        <div style={{padding:"0 24px",animation:"fadeSlideUp 0.5s ease",position:"relative",zIndex:1}}>
          <div onClick={startCamera} style={{position:"relative",borderRadius:24,overflow:"hidden",background:"linear-gradient(135deg,#0d1117,#0a0f1e)",border:"1px solid rgba(255,255,255,0.06)",aspectRatio:"4/3",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
            <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(0,245,160,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,160,0.03) 1px,transparent 1px)",backgroundSize:"40px 40px"}}/>
            <CornerBracket style={{top:16,left:16}}/>
            <CornerBracket style={{top:16,right:16,transform:"scaleX(-1)"}}/>
            <CornerBracket style={{bottom:16,left:16,transform:"scaleY(-1)"}}/>
            <CornerBracket style={{bottom:16,right:16,transform:"scale(-1)"}}/>
            <div style={{animation:"float 3s ease-in-out infinite",textAlign:"center"}}>
              <div style={{fontSize:52,marginBottom:12}}>🥗</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:700,color:"#f1f5f9"}}>Point & Snap</div>
              <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#475569",marginTop:6}}>Tap to open camera</div>
            </div>
          </div>
          <div style={{display:"flex",gap:12,marginTop:16}}>
            <button onClick={startCamera} style={{flex:2,padding:16,borderRadius:18,border:"none",cursor:"pointer",background:"linear-gradient(135deg,#00f5a0,#00d9f5)",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,color:"#030912",boxShadow:"0 8px 32px #00f5a040",animation:"pulse-ring 2.5s ease-in-out infinite"}}>📸 Open Camera</button>
            <button onClick={()=>fileInputRef.current?.click()} style={{flex:1,padding:16,borderRadius:18,cursor:"pointer",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:14,color:"#64748b"}}>🖼 Upload</button>
            <input ref={fileInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={runAnalysis}/>
          </div>
          {cameraError && (
            <div style={{marginTop:16,padding:12,background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.3)",borderRadius:12,color:"#f87171",fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>
              {cameraError}
            </div>
          )}
          {cameraStatus && !cameraError && (
            <div style={{marginTop:16,padding:12,background:"rgba(0,245,160,0.1)",border:"1px solid rgba(0,245,160,0.3)",borderRadius:12,color:"#00f5a0",fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>
              {cameraStatus}
            </div>
          )}
        </div>
      )}

      {phase==="scanning"&&(
        <div style={{padding:"0 24px",animation:"fadeSlideUp 0.4s ease",position:"relative",zIndex:1}}>
          <div style={{position:"relative",borderRadius:24,overflow:"hidden",background:"#000",aspectRatio:"4/3",border:"1px solid rgba(0,245,160,0.2)",boxShadow:"0 0 40px #00f5a020"}}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              onLoadedMetadata={() => console.log("Video metadata loaded:", videoRef.current?.videoWidth, "x", videoRef.current?.videoHeight)}
              onPlay={() => console.log("Video playing")}
              style={{width:"100%",height:"100%",objectFit:"cover"}}
            />
            <div style={{position:"absolute",inset:0,overflow:"hidden",borderRadius:24,pointerEvents:"none"}}>
              <div style={{position:"absolute",left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,#00f5a0,#00d9f5,#00f5a0,transparent)",boxShadow:"0 0 20px #00f5a0",animation:"scanline 2.5s ease-in-out infinite"}}/>
            </div>
            <CornerBracket style={{top:16,left:16}}/>
            <CornerBracket style={{top:16,right:16,transform:"scaleX(-1)"}}/>
            <CornerBracket style={{bottom:16,left:16,transform:"scaleY(-1)"}}/>
            <CornerBracket style={{bottom:16,right:16,transform:"scale(-1)"}}/>
          </div>
          <button onClick={runAnalysis} style={{width:"100%",marginTop:16,padding:20,borderRadius:20,border:"none",cursor:"pointer",background:"linear-gradient(135deg,#00f5a0,#00d9f5)",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:17,color:"#030912",boxShadow:"0 12px 40px #00f5a050"}}>⚡ ANALYZE TRAY</button>
          <button onClick={()=>{stopCamera();setPhase("idle");}} style={{width:"100%",marginTop:10,padding:12,background:"none",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#475569"}}>Cancel</button>
        </div>
      )}

      {phase==="analyzing"&&(
        <div style={{padding:"40px 24px 0",display:"flex",flexDirection:"column",alignItems:"center",animation:"fadeSlideUp 0.4s ease",position:"relative",zIndex:1}}>
          <div style={{position:"relative",width:120,height:120,marginBottom:32}}>
            <div style={{position:"absolute",inset:0,borderRadius:"50%",border:"2px solid rgba(0,245,160,0.15)",animation:"spin-slow 3s linear infinite"}}/>
            <div style={{position:"absolute",inset:8,borderRadius:"50%",border:"2px solid transparent",borderTopColor:"#00f5a0",borderRightColor:"#00d9f5",animation:"spin-slow 1.5s linear infinite"}}/>
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:40}}>🔬</div>
          </div>
          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:22,color:"#f1f5f9",marginBottom:8}}>Identifying dishes…</div>
          <div style={{fontFamily:"'Space Mono',monospace",fontSize:11,color:"#334155",marginBottom:32,letterSpacing:"0.08em"}}>RUNNING MOBILENET · FUZZY MATCH</div>
          {[{label:"TensorFlow.js inference",delay:"0s",dur:"0.8s"},{label:"Matching Nutrislice menu",delay:"0.7s",dur:"1.0s"},{label:"Computing macros",delay:"1.5s",dur:"0.6s"}].map(({label,delay,dur})=>(
            <div key={label} style={{width:"100%",marginBottom:16}}>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#64748b"}}>{label}</span>
              <div style={{height:4,background:"rgba(255,255,255,0.05)",borderRadius:99,overflow:"hidden",marginTop:6}}>
                <div style={{height:"100%",background:"linear-gradient(90deg,#00f5a0,#00d9f5)",borderRadius:99,width:0,animation:`analyzing-bar ${dur} ${delay} ease forwards`}}/>
              </div>
            </div>
          ))}
        </div>
      )}

      {phase==="results"&&(
        <div style={{padding:"0 24px",animation:"fadeSlideUp 0.5s ease",position:"relative",zIndex:1}}>
          <div style={{marginBottom:20}}>
            <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"#334155",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:12}}>Detected in photo</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {detections.map(d=>(
                <div key={d.label} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:99,padding:"6px 14px",display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:d.confidence>0.7?"#00f5a0":d.confidence>0.5?"#fbbf24":"#f87171"}}/>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#cbd5e1",textTransform:"capitalize"}}>{d.label}</span>
                  <span style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"#475569"}}>{Math.round(d.confidence*100)}%</span>
                </div>
              ))}
            </div>
          </div>
          {matches.map(({detection_label,candidates})=>(
            <div key={detection_label} style={{marginBottom:28}}>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"#475569",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>"{detection_label}" → best matches</div>
              {candidates.map(({food_item,match_score})=>(
                <MatchCard key={food_item.food_id} item={food_item} score={match_score}
                  confirmed={confirmed[detection_label]?.food_id===food_item.food_id}
                  onConfirm={item=>setConfirmed(p=>({...p,[detection_label]:item}))}/>
              ))}
            </div>
          ))}
          {Object.keys(confirmed).length>0&&(
            <div style={{position:"sticky",bottom:24,marginTop:8}}>
              <button onClick={handleLog} style={{width:"100%",padding:18,borderRadius:20,border:"none",cursor:"pointer",background:"linear-gradient(135deg,#00f5a0,#00d9f5)",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,color:"#030912",boxShadow:"0 12px 40px #00f5a050"}}>
                Log {Object.keys(confirmed).length} dish{Object.keys(confirmed).length>1?"es":""} to today's diary →
              </button>
            </div>
          )}
          <button onClick={()=>setPhase("manual")} style={{width:"100%",marginTop:8,padding:12,background:"none",border:"1px solid rgba(255,255,255,0.06)",borderRadius:14,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#475569"}}>+ Add more manually</button>
        </div>
      )}

      {phase==="manual"&&(
        <div style={{padding:"0 24px",animation:"fadeSlideUp 0.4s ease",position:"relative",zIndex:1}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:20,color:"#f1f5f9",marginBottom:16}}>Today's Menu</div>
          <div style={{position:"relative",marginBottom:16}}>
            <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search dishes or stations…"
              style={{width:"100%",padding:"14px 18px 14px 42px",borderRadius:16,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",fontFamily:"'DM Sans',sans-serif",fontSize:14,color:"#f1f5f9"}}/>
            <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:16,opacity:0.4}}>🔍</span>
          </div>
          <div style={{maxHeight:"55vh",overflowY:"auto"}}>
            {filteredMenu.map(item=>(
              <div key={item.food_id} onClick={()=>setConfirmed(p=>({...p,manual:item}))}
                style={{background:confirmed.manual?.food_id===item.food_id?"rgba(0,245,160,0.06)":"rgba(255,255,255,0.02)",border:`1px solid ${confirmed.manual?.food_id===item.food_id?"#00f5a030":"rgba(255,255,255,0.05)"}`,borderRadius:16,padding:"14px 16px",marginBottom:10,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",transition:"all 0.2s"}}>
                <div>
                  <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:14,color:"#f1f5f9"}}>{item.name}</div>
                  <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"#475569",marginTop:3}}>{item.station} · {item.serving_size}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontFamily:"'Space Mono',monospace",fontSize:14,fontWeight:700,color:"#f472b6"}}>{item.nutrition.calories}</div>
                  <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"#475569"}}>kcal</div>
                </div>
              </div>
            ))}
          </div>
          {confirmed.manual&&(
            <div style={{position:"sticky",bottom:24,marginTop:12}}>
              <button onClick={handleLog} style={{width:"100%",padding:18,borderRadius:20,border:"none",cursor:"pointer",background:"linear-gradient(135deg,#00f5a0,#00d9f5)",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,color:"#030912",boxShadow:"0 12px 40px #00f5a050"}}>Log {confirmed.manual.name} →</button>
            </div>
          )}
        </div>
      )}

      {showSuccess&&(
        <div style={{position:"fixed",inset:0,zIndex:100,background:"rgba(5,7,15,0.95)",backdropFilter:"blur(20px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",animation:"fadeSlideUp 0.3s ease"}}>
          <div style={{fontSize:72,animation:"waveIn 0.5s cubic-bezier(0.34,1.56,0.64,1)",marginBottom:20}}>✅</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:28,color:"#f1f5f9",marginBottom:8}}>Logged!</div>
          <div style={{fontFamily:"'Space Mono',monospace",fontSize:12,color:"#475569",letterSpacing:"0.08em"}}>DIARY UPDATED</div>
          <div style={{marginTop:32,padding:"14px 28px",borderRadius:16,background:"rgba(0,245,160,0.08)",border:"1px solid #00f5a030",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#00f5a0"}}>
            {Object.values(confirmed).reduce((s,i)=>s+(i.nutrition?.calories||0),0)} kcal added today
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PAGE: MENU BROWSER
// ═══════════════════════════════════════════════════════════════════
const STATIONS=["All",...Array.from(new Set(MENU.map(i=>i.station)))];
const DIET_TAGS=["Vegan","Vegetarian","Gluten-Free"];
const SORT_OPTIONS=[{key:"default",label:"Default"},{key:"cal_asc",label:"Cal ↑"},{key:"cal_desc",label:"Cal ↓"},{key:"protein",label:"Protein ↑"}];
const STATION_ICONS={"1849":"🏛️","Eggcetera":"🥚","Buckingham Bakery":"🥐","Capital City Pizza":"🍕","Great Greens":"🥗","Fired Up":"🔥","Que Rico":"🌮","Buona Cucina":"🍝","Gordon Delicious":"⭐"};
const CAT_COLOR={entree:"#60a5fa",meat:"#f87171",grain:"#fbbf24",vegetable:"#4ade80",dessert:"#f472b6",condiment:"#a78bfa",other:"#94a3b8"};

function FoodCard({item,saved,onSave}) {
  const [expanded,setExpanded]=useState(false);
  const {name,station,food_category,serving_size,nutrition,food_tags}=item;
  const pct=v=>Math.min(100,(v/60)*100);
  return (
    <div style={{background:expanded?"rgba(15,20,40,0.95)":"rgba(255,255,255,0.025)",border:`1px solid ${expanded?"rgba(255,255,255,0.1)":"rgba(255,255,255,0.05)"}`,borderRadius:18,marginBottom:10,overflow:"hidden",transition:"all 0.3s cubic-bezier(0.4,0,0.2,1)"}}>
      <div onClick={()=>setExpanded(e=>!e)} style={{display:"flex",alignItems:"center",padding:"14px 16px",cursor:"pointer",gap:12}}>
        <div style={{width:8,height:8,borderRadius:"50%",flexShrink:0,background:CAT_COLOR[food_category]||"#94a3b8",boxShadow:`0 0 6px ${CAT_COLOR[food_category]||"#94a3b8"}80`}}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:14,color:"#f1f5f9",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{name}</div>
          <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"#475569",marginTop:2}}>{STATION_ICONS[station]} {station}</div>
        </div>
        <div style={{display:"flex",gap:4,flexShrink:0}}>
          {food_tags.slice(0,2).map(t=><span key={t} style={{width:8,height:8,borderRadius:"50%",background:TAG_STYLE[t]?.color,display:"inline-block"}} title={t}/>)}
        </div>
        <div style={{textAlign:"right",flexShrink:0}}>
          <div style={{fontFamily:"'Space Mono',monospace",fontSize:15,fontWeight:700,color:"#f472b6"}}>{nutrition.calories}</div>
          <div style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:"#334155"}}>kcal</div>
        </div>
        <span style={{color:"#334155",fontSize:12,flexShrink:0,transition:"transform 0.3s",transform:expanded?"rotate(180deg)":"none"}}>▾</span>
      </div>
      {expanded&&(
        <div style={{padding:"0 16px 16px",borderTop:"1px solid rgba(255,255,255,0.04)",animation:"fadeIn 0.2s ease"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:12,marginBottom:14}}>
            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#475569"}}>Serving: <span style={{fontFamily:"'Space Mono',monospace",color:"#94a3b8"}}>{serving_size}</span></span>
            <div style={{display:"flex",gap:6}}>
              {food_tags.map(t=><span key={t} style={{fontFamily:"'Space Mono',monospace",fontSize:9,padding:"3px 10px",borderRadius:99,background:TAG_STYLE[t]?.bg,border:`1px solid ${TAG_STYLE[t]?.border}`,color:TAG_STYLE[t]?.color}}>{t}</span>)}
            </div>
          </div>
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            {[{l:"Protein",v:nutrition.g_protein,c:"#60a5fa"},{l:"Carbs",v:nutrition.g_carbs,c:"#fbbf24"},{l:"Fat",v:nutrition.g_fat,c:"#f97316"},{l:"Sugar",v:nutrition.g_sugar,c:"#f472b6"}].map(({l,v,c})=>(
              <div key={l} style={{flex:1,background:`${c}10`,border:`1px solid ${c}25`,borderRadius:12,padding:"8px 6px",textAlign:"center"}}>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:13,fontWeight:700,color:c}}>{v}g</div>
                <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,color:"#475569",marginTop:2,textTransform:"uppercase",letterSpacing:"0.06em"}}>{l}</div>
              </div>
            ))}
          </div>
          {nutrition.mg_sodium>700&&<div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#f87171",marginBottom:12}}>⚠️ High sodium: {nutrition.mg_sodium}mg</div>}
          <button onClick={e=>{e.stopPropagation();onSave(item.food_id);}} style={{width:"100%",padding:12,borderRadius:14,border:"none",cursor:"pointer",background:saved?"linear-gradient(135deg,#00f5a0,#00d9f5)":"rgba(255,255,255,0.05)",fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:13,color:saved?"#030912":"#64748b",transition:"all 0.25s ease"}}>
            {saved?"✓ Saved to log":"+ Add to today's log"}
          </button>
        </div>
      )}
    </div>
  );
}

function MenuBrowser() {
  const { token } = useAuth();
  const [selectedStation,setSelectedStation]=useState("All");
  const [activeTags,setActiveTags]=useState([]);
  const [sortKey,setSortKey]=useState("default");
  const [searchQuery,setSearchQuery]=useState("");
  const [mealType,setMealType]=useState(()=>{ const h=new Date().getHours(); return h<11?"breakfast":h<16?"lunch":"dinner"; });
  const [saved,setSaved]=useState({});
  const [showSaved,setShowSaved]=useState(false);
  const [recs,setRecs]=useState([]);
  const [recsLoading,setRecsLoading]=useState(true);
  const [showRecs,setShowRecs]=useState(true);

  useEffect(()=>{
    setRecsLoading(true);
    fetch(`https://badgerbite-api.onrender.com/api/recommend?meal=${mealType}`,{headers:{Authorization:`Bearer ${token}`}})
      .then(r=>r.json())
      .then(data=>{
        const all=Object.entries(data.halls||{}).flatMap(([,items])=>items);
        all.sort((a,b)=>b.score-a.score);
        setRecs(all.slice(0,6));
      })
      .catch(()=>setRecs([]))
      .finally(()=>setRecsLoading(false));
  },[mealType,token]);

  const [menuItems,setMenuItems]=useState(MENU);
  const [menuLoading,setMenuLoading]=useState(true);
  const [logLoading,setLogLoading]=useState(false);

  useEffect(()=>{
    setMenuLoading(true);
    fetch(`${API_BASE}/api/menu?hall=gordon-avenue-market&meal=${mealType}`)
      .then(r=>r.json())
      .then(d=>{
        if(d.items&&d.items.length>0){
          setMenuItems(d.items.map(i=>({...i,nutrition:{calories:i.nutrition.calories,g_protein:i.nutrition.g_protein,g_carbs:i.nutrition.g_carbs,g_fat:i.nutrition.g_fat,g_sugar:i.nutrition.g_sugar,mg_sodium:i.nutrition.mg_sodium},food_tags:i.food_tags||[]})));
        }
      }).catch(()=>{}).finally(()=>setMenuLoading(false));
  },[mealType]);

  const toggleTag=tag=>setActiveTags(p=>p.includes(tag)?p.filter(t=>t!==tag):[...p,tag]);
  const [savedFoodIds,setSavedFoodIds]=useState(new Set());
  // Load saved foods on mount
  useEffect(()=>{
    apiGet("/api/saved-foods",token)
      .then(d=>{setSavedFoodIds(new Set((d.saved_foods||[]).map(f=>String(f.food_id))));})
      .catch(()=>{});
  },[token]);

  const toggleSave=async(id)=>{
    const strId=String(id);
    const item=menuItems.find(i=>String(i.food_id)===strId);
    if(savedFoodIds.has(strId)){
      setSavedFoodIds(p=>{const n=new Set(p);n.delete(strId);return n;});
      apiDelete(`/api/saved-foods/${strId}`,token).catch(()=>{});
    } else {
      setSavedFoodIds(p=>new Set([...p,strId]));
      if(item) apiPost("/api/saved-foods",token,{
        food_id:strId,food_name:item.name,hall:"gordon-avenue-market",
        calories:item.nutrition.calories||0,protein_g:item.nutrition.g_protein||0,
        carbs_g:item.nutrition.g_carbs||0,fat_g:item.nutrition.g_fat||0,
      }).catch(()=>{});
    }
  };

  const handleLogSaved=async()=>{
    if(logLoading)return;
    setLogLoading(true);
    const items=menuItems.filter(i=>savedFoodIds.has(String(i.food_id)));
    try{
      await Promise.all(items.map(item=>apiPost("/api/log",token,{
        food_id:String(item.food_id),food_name:item.name,quantity:1,
        serving_size:item.serving_size||"1 serving",
        calories:item.nutrition.calories||0,protein_g:item.nutrition.g_protein||0,
        carbs_g:item.nutrition.g_carbs||0,fat_g:item.nutrition.g_fat||0,
        fiber_g:item.nutrition.g_fiber||0,sugar_g:item.nutrition.g_sugar||0,
        sodium_mg:item.nutrition.mg_sodium||0,
        hall:"gordon-avenue-market",meal_type:mealType,
      })));
      setSaved({});
    }catch(e){}
    setLogLoading(false);
  };

  const filtered=useMemo(()=>{
    let list=menuItems;
    if(showSaved)list=list.filter(i=>savedFoodIds.has(String(i.food_id)));
    if(selectedStation!=="All")list=list.filter(i=>i.station===selectedStation);
    if(activeTags.length)list=list.filter(i=>activeTags.every(t=>i.food_tags.includes(t)));
    if(searchQuery.trim()){const q=searchQuery.toLowerCase();list=list.filter(i=>i.name.toLowerCase().includes(q)||i.station.toLowerCase().includes(q));}
    switch(sortKey){
      case"cal_asc":return[...list].sort((a,b)=>a.nutrition.calories-b.nutrition.calories);
      case"cal_desc":return[...list].sort((a,b)=>b.nutrition.calories-a.nutrition.calories);
      case"protein":return[...list].sort((a,b)=>b.nutrition.g_protein-a.nutrition.g_protein);
      default:return list;
    }
  },[selectedStation,activeTags,sortKey,searchQuery,showSaved,saved]);

  const savedCount=savedFoodIds.size;
  const totalCal=menuItems.filter(i=>savedFoodIds.has(String(i.food_id))).reduce((s,i)=>s+i.nutrition.calories,0);

  return (
    <div style={{paddingBottom:120,animation:"pageIn 0.35s ease"}}>
      <div style={{padding:"52px 20px 0",position:"sticky",top:0,background:"linear-gradient(180deg,#06080f 70%,transparent)",zIndex:20,paddingBottom:8}}>
        <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:4}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:800,letterSpacing:"-0.02em"}}>Today's <span style={{color:"#00f5a0"}}>Menu</span></div>
          <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"#334155"}}>Gordon Ave</div>
        </div>
        <div style={{display:"flex",gap:6,marginBottom:14}}>
          {["breakfast","lunch","dinner"].map(m=>(
            <button key={m} onClick={()=>setMealType(m)} style={{flex:1,padding:"8px 0",borderRadius:12,border:`1px solid ${mealType===m?"rgba(0,245,160,0.3)":"transparent"}`,cursor:"pointer",background:mealType===m?"rgba(0,245,160,0.12)":"rgba(255,255,255,0.03)",fontFamily:"'Space Mono',monospace",fontSize:10,letterSpacing:"0.06em",textTransform:"uppercase",color:mealType===m?"#00f5a0":"#334155",transition:"all 0.2s"}}>{m}</button>
          ))}
        </div>
        <div style={{position:"relative",marginBottom:12}}>
          <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:14,opacity:0.35}}>🔍</span>
          <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search dishes or stations…"
            style={{width:"100%",padding:"12px 16px 12px 40px",borderRadius:14,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",color:"#f1f5f9",fontSize:14,fontFamily:"'DM Sans',sans-serif"}}/>
          {searchQuery&&<button onClick={()=>setSearchQuery("")} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:16,lineHeight:1}}>×</button>}
        </div>
        <div style={{display:"flex",gap:6,marginBottom:10,overflowX:"auto",paddingBottom:2}}>
          {DIET_TAGS.map(tag=>{const a=activeTags.includes(tag),s=TAG_STYLE[tag];return(
            <button key={tag} onClick={()=>toggleTag(tag)} style={{flexShrink:0,padding:"5px 12px",borderRadius:99,cursor:"pointer",background:a?s.bg:"rgba(255,255,255,0.03)",border:`1px solid ${a?s.border:"rgba(255,255,255,0.06)"}`,fontFamily:"'Space Mono',monospace",fontSize:9,letterSpacing:"0.06em",color:a?s.color:"#475569",transition:"all 0.2s"}}>{tag}</button>
          );})}
          <div style={{flexShrink:0,width:1}}/>
          {SORT_OPTIONS.map(opt=>(
            <button key={opt.key} onClick={()=>setSortKey(opt.key)} style={{flexShrink:0,padding:"5px 12px",borderRadius:99,cursor:"pointer",background:sortKey===opt.key?"rgba(96,165,250,0.12)":"rgba(255,255,255,0.03)",border:`1px solid ${sortKey===opt.key?"rgba(96,165,250,0.35)":"rgba(255,255,255,0.06)"}`,fontFamily:"'Space Mono',monospace",fontSize:9,letterSpacing:"0.06em",color:sortKey===opt.key?"#60a5fa":"#475569",transition:"all 0.2s"}}>{opt.label}</button>
          ))}
        </div>
      </div>

      <div style={{padding:"4px 20px 0",overflowX:"auto",display:"flex",gap:8}}>
        {STATIONS.map(s=>(
          <button key={s} onClick={()=>setSelectedStation(s)} style={{flexShrink:0,padding:"7px 14px",borderRadius:12,cursor:"pointer",background:selectedStation===s?"rgba(255,255,255,0.08)":"transparent",border:`1px solid ${selectedStation===s?"rgba(255,255,255,0.15)":"rgba(255,255,255,0.04)"}`,fontFamily:"'DM Sans',sans-serif",fontWeight:selectedStation===s?700:400,fontSize:12,color:selectedStation===s?"#f1f5f9":"#475569",display:"flex",alignItems:"center",gap:5,transition:"all 0.2s"}}>
            {s!=="All"&&<span style={{fontSize:13}}>{STATION_ICONS[s]}</span>}{s}
          </button>
        ))}
      </div>

      <div style={{padding:"8px 20px 4px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"#334155",letterSpacing:"0.08em"}}>{filtered.length} ITEM{filtered.length!==1?"S":""}</span>
        <button onClick={()=>setShowSaved(s=>!s)} style={{background:showSaved?"rgba(0,245,160,0.1)":"rgba(255,255,255,0.03)",border:`1px solid ${showSaved?"#00f5a030":"rgba(255,255,255,0.06)"}`,borderRadius:99,padding:"4px 12px",cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:9,letterSpacing:"0.06em",color:showSaved?"#00f5a0":"#475569",transition:"all 0.2s",display:"flex",alignItems:"center",gap:6}}>
          {savedCount>0&&<span style={{background:"#00f5a0",color:"#030912",borderRadius:"50%",width:14,height:14,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:8}}>{savedCount}</span>}
          MY LOG
        </button>
      </div>

      {/* ── RECOMMENDED SECTION ── */}
      {(recsLoading||recs.length>0)&&showRecs&&(
        <div style={{padding:"12px 20px 4px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15}}>⭐ Recommended <span style={{color:"#00f5a0"}}>for you</span></div>
            <button onClick={()=>setShowRecs(false)} style={{background:"none",border:"none",color:"#334155",cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:9,letterSpacing:"0.06em"}}>HIDE</button>
          </div>
          <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:8}}>
            {recsLoading?[0,1,2].map(i=>(
              <div key={i} style={{flexShrink:0,width:148,height:110,borderRadius:16,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.05)",backgroundImage:"linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.04) 50%,transparent 100%)",backgroundSize:"200% 100%",animation:"shimmer 1.5s infinite"}}/>
            )):recs.map(item=>(
              <div key={item.food_id} onClick={()=>{setSearchQuery(item.name);setShowRecs(false);}}
                style={{flexShrink:0,width:148,background:"rgba(0,245,160,0.04)",border:"1px solid rgba(0,245,160,0.15)",borderRadius:16,padding:12,cursor:"pointer",position:"relative",transition:"border-color 0.2s"}}>
                <div style={{position:"absolute",top:8,right:8,fontFamily:"'Space Mono',monospace",fontSize:8,color:"#00f5a0",background:"rgba(0,245,160,0.1)",padding:"2px 6px",borderRadius:99}}>{Math.round(item.score*100)}pts</div>
                <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:13,color:"#f1f5f9",lineHeight:1.3,marginBottom:4,paddingRight:32}}>{item.name}</div>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"#475569",marginBottom:8}}>{item.station}</div>
                <div style={{display:"flex",gap:8}}>
                  <div><span style={{fontFamily:"'Space Mono',monospace",fontSize:13,color:"#f472b6"}}>{item.nutrition.calories}</span><span style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:"#334155"}}> kcal</span></div>
                  <div><span style={{fontFamily:"'Space Mono',monospace",fontSize:13,color:"#60a5fa"}}>{item.nutrition.g_protein}g</span><span style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:"#334155"}}> pro</span></div>
                </div>
              </div>
            ))}
          </div>
          <div style={{height:1,background:"rgba(255,255,255,0.05)",margin:"8px 0 4px"}}/>
        </div>
      )}

      <div style={{padding:"0 20px"}}>
        {filtered.length===0?(
          <div style={{textAlign:"center",padding:"60px 0",animation:"fadeSlideUp 0.4s ease"}}>
            <div style={{fontSize:40,marginBottom:12}}>🍽️</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:18,color:"#334155"}}>Nothing found</div>
          </div>
        ):filtered.map((item,i)=>(
          <div key={item.food_id} style={{animation:`fadeSlideUp 0.35s ease ${i*0.04}s both`}}>
            <FoodCard item={item} saved={savedFoodIds.has(String(item.food_id))} onSave={toggleSave}/>
          </div>
        ))}
      </div>

      {savedCount>0&&(
        <div style={{position:"fixed",bottom:72,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 40px)",maxWidth:380,zIndex:30,background:"linear-gradient(135deg,#00f5a0,#00d9f5)",borderRadius:20,padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 12px 40px #00f5a050",animation:"fadeSlideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)"}}>
          <div>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:15,color:"#030912"}}>Log {savedCount} dish{savedCount>1?"es":""}</div>
            <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"#065f46",marginTop:1}}>{totalCal} kcal total</div>
          </div>
          <button onClick={handleLogSaved} disabled={logLoading} style={{fontFamily:"'Space Mono',monospace",fontSize:12,color:"#030912",background:"rgba(0,0,0,0.1)",padding:"6px 16px",borderRadius:12,border:"none",cursor:"pointer"}}>{logLoading?"Logging…":"CONFIRM →"}</button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PAGE: TRENDS
// ═══════════════════════════════════════════════════════════════════
const CH=160,CW=340,PL=36,PB=28,PR=12,PT=16,IW=CW-PL-PR,IH=CH-PT-PB;
const CAL_MAX=2800;
const xp=(i,len)=>PL+(i/Math.max(len-1,1))*IW;
const yp=(v,m)=>PT+IH-(v/m)*IH;

function LineChart({activeDay,onDayClick,weekData,goalsT}) {
  const pathRef=useRef(null);
  const [drawn,setDrawn]=useState(0);
  const [len,setLen]=useState(1000);
  const n=weekData.length;
  const linePath=weekData.map((d,i)=>`${i===0?"M":"L"} ${xp(i,n).toFixed(1)} ${yp(d.calories,CAL_MAX).toFixed(1)}`).join(" ");
  const areaPath=linePath+` L ${xp(n-1,n).toFixed(1)} ${(PT+IH).toFixed(1)} L ${xp(0,n).toFixed(1)} ${(PT+IH).toFixed(1)} Z`;
  const goalY=yp(goalsT.calories,CAL_MAX);
  useEffect(()=>{
    if(!pathRef.current)return;
    const l=pathRef.current.getTotalLength();
    setLen(l);setDrawn(0);
    const start=performance.now();
    const tick=now=>{const t=Math.min(1,(now-start)/900);setDrawn(l*(1-Math.pow(1-t,3)));if(t<1)requestAnimationFrame(tick);};
    requestAnimationFrame(tick);
  },[weekData]);
  return (
    <svg width="100%" viewBox={`0 0 ${CW} ${CH}`} style={{overflow:"visible"}}>
      <defs>
        <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00f5a0" stopOpacity="0.18"/><stop offset="100%" stopColor="#00f5a0" stopOpacity="0"/></linearGradient>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#00f5a0"/><stop offset="100%" stopColor="#00d9f5"/></linearGradient>
      </defs>
      {[0,0.25,0.5,0.75,1].map(f=>{const y=PT+IH*(1-f);return(<g key={f}><line x1={PL} y1={y} x2={CW-PR} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/><text x={PL-4} y={y+4} textAnchor="end" fill="#334155" fontSize="8" fontFamily="Space Mono,monospace">{Math.round(CAL_MAX*f/100)*100}</text></g>);})}
      <line x1={PL} y1={goalY} x2={CW-PR} y2={goalY} stroke="#00f5a0" strokeWidth="1" strokeDasharray="4 4" opacity="0.35"/>
      <path d={areaPath} fill="url(#ag)"/>
      <path ref={pathRef} d={linePath} fill="none" stroke="url(#lg)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len-drawn}/>
      {weekData.map((d,i)=>{
        const cx=xp(i,n),cy=yp(d.calories,CAL_MAX),isActive=activeDay===i,isToday=d.isToday,over=d.calories>goalsT.calories;
        return(<g key={i} onClick={()=>onDayClick(i)} style={{cursor:"pointer"}}>
          <circle cx={cx} cy={cy} r={isActive?7:4.5} fill={over?"#f87171":"#00f5a0"} stroke="#06080f" strokeWidth="2" style={{transition:"r 0.2s",filter:isActive?`drop-shadow(0 0 6px ${over?"#f87171":"#00f5a0"})`:"none"}}/>
          {isToday&&<circle cx={cx} cy={cy} r={11} fill="none" stroke="#00f5a0" strokeWidth="1" opacity="0.4"/>}
          <text x={cx} y={PT+IH+16} textAnchor="middle" fill={isActive?"#f1f5f9":"#334155"} fontSize="9" fontFamily="Space Mono,monospace">{isToday?"NOW":d.day}</text>
        </g>);
      })}
    </svg>
  );
}

function MacroBarChart({metric,weekData,macroMeta}) {
  const meta=macroMeta.find(m=>m.key===metric),goalY=yp(meta.goal,meta.max);
  const n=weekData.length;
  return (
    <svg width="100%" viewBox={`0 0 ${CW} ${CH}`} style={{overflow:"visible"}}>
      <line x1={PL} y1={goalY} x2={CW-PR} y2={goalY} stroke={meta.color} strokeWidth="1" strokeDasharray="4 4" opacity="0.4"/>
      {[0,0.5,1].map(f=>{const y=PT+IH*(1-f);return(<g key={f}><line x1={PL} y1={y} x2={CW-PR} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/><text x={PL-4} y={y+4} textAnchor="end" fill="#334155" fontSize="8" fontFamily="Space Mono,monospace">{Math.round(meta.max*f)}g</text></g>);})}
      {weekData.map((d,i)=>{
        const bw=(IW/n)*0.55,cx=xp(i,n),val=d[metric],bh=Math.max(0,(val/meta.max)*IH),x=cx-bw/2,y=PT+IH-bh,isToday=d.isToday,over=val>meta.goal,color=over?"#f87171":isToday?meta.color:`${meta.color}55`;
        return(<g key={i}><rect x={x} y={y} width={bw} height={bh} rx="3" fill={color} style={{animation:`fadeIn 0.4s ${i*0.07}s ease both`}}/><text x={cx} y={PT+IH+16} textAnchor="middle" fill={isToday?"#f1f5f9":"#334155"} fontSize="9" fontFamily="Space Mono,monospace">{isToday?"NOW":d.day}</text></g>);
      })}
    </svg>
  );
}

function Trends() {
  const { token } = useAuth();
  const [activeDay,setActiveDay]=useState(6);
  const [activeMetric,setActiveMetric]=useState("g_protein");
  const [tab,setTab]=useState("calories");
  const [weekData,setWeekData]=useState([]);
  const [goalsT,setGoalsT]=useState({calories:2000,g_protein:150,g_carbs:250,g_fat:65});
  const [loading,setLoading]=useState(true);

  const DAY_LABELS=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const todayStr=new Date().toISOString().slice(0,10);

  useEffect(()=>{
    apiGet("/api/history?days=7",token)
      .then(data=>{
        const targets=data.targets||{};
        setGoalsT({
          calories:targets.calorie_target||2000,
          g_protein:targets.protein_g||150,
          g_carbs:targets.carbs_g||250,
          g_fat:targets.fat_g||65,
        });
        const rows=(data.history||[]).map(d=>({
          date:new Date(d.date+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"}),
          day:DAY_LABELS[new Date(d.date+"T12:00:00").getDay()],
          isToday:d.date===todayStr,
          calories:Math.round(d.calories||0),
          g_protein:Math.round(d.protein_g||0),
          g_carbs:Math.round(d.carbs_g||0),
          g_fat:Math.round(d.fat_g||0),
          meals:d.calories>0?1:0,
        }));
        setWeekData(rows);
        setActiveDay(rows.length-1);
      })
      .catch(()=>{})
      .finally(()=>setLoading(false));
  },[token]);

  const macroMeta=[
    {key:"g_protein",label:"Protein",color:"#60a5fa",goal:goalsT.g_protein,max:Math.max(goalsT.g_protein*1.2,180)},
    {key:"g_carbs",  label:"Carbs",  color:"#fbbf24",goal:goalsT.g_carbs,  max:Math.max(goalsT.g_carbs*1.2,320)},
    {key:"g_fat",    label:"Fat",    color:"#f97316",goal:goalsT.g_fat,    max:Math.max(goalsT.g_fat*1.2,100)},
  ];
  const insights=useMemo(()=>{
    if(!weekData.length)return[];
    const ins=[];
    const lowProt=weekData.filter(d=>d.g_protein<goalsT.g_protein*0.8).length;
    if(lowProt>=3)ins.push({icon:"💪",title:`Protein low ${lowProt} days`,body:"You're consistently under your protein goal. Try adding Grilled Chicken or Eggs.",color:"#60a5fa"});
    const onGoal=weekData.filter(d=>d.calories>0&&Math.abs(d.calories-goalsT.calories)/goalsT.calories<0.1).length;
    if(onGoal>=3)ins.push({icon:"🔥",title:"Calorie streak",body:`${onGoal} out of 7 days within 10% of your goal. Keep it up!`,color:"#00f5a0"});
    const highCarb=weekData.filter(d=>d.g_carbs>goalsT.g_carbs*1.1).length;
    if(highCarb>=2)ins.push({icon:"🍞",title:"High carb days",body:`You went over your carb goal ${highCarb} days. Try swapping bread for brown rice.`,color:"#fbbf24"});
    if(!ins.length)ins.push({icon:"✅",title:"Looking good!",body:"You're hitting your goals consistently this week.",color:"#00f5a0"});
    return ins;
  },[weekData,goalsT]);

  if(loading)return(
    <div style={{paddingBottom:110,animation:"pageIn 0.35s ease",display:"flex",alignItems:"center",justifyContent:"center",minHeight:"80vh"}}>
      <div style={{fontFamily:"'Space Mono',monospace",fontSize:11,color:"#334155"}}>Loading trends…</div>
    </div>
  );

  const sel=weekData[activeDay]||{calories:0,g_protein:0,g_carbs:0,g_fat:0,date:"",meals:0};
  const avgCal=weekData.length?Math.round(weekData.reduce((s,d)=>s+d.calories,0)/weekData.length):0;
  const avgProt=weekData.length?Math.round(weekData.reduce((s,d)=>s+d.g_protein,0)/weekData.length):0;
  const daysLogged=weekData.filter(d=>d.calories>0).length;
  const daysOnGoal=weekData.filter(d=>d.calories>0&&Math.abs(d.calories-goalsT.calories)/goalsT.calories<0.1).length;

  return (
    <div style={{paddingBottom:110,animation:"pageIn 0.35s ease"}}>
      <div style={{position:"fixed",top:-80,left:"50%",transform:"translateX(-50%)",width:500,height:400,background:"radial-gradient(circle,#00d9f508 0%,transparent 65%)",pointerEvents:"none",zIndex:0}}/>
      <div style={{padding:"52px 22px 20px",position:"relative",zIndex:1}}>
        <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"#334155",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4}}>Feb 22 – 28</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:28,letterSpacing:"-0.02em"}}>Weekly <span style={{color:"#00d9f5"}}>Trends</span></div>
      </div>
      <div style={{padding:"0 22px",position:"relative",zIndex:1}}>
        <div style={{display:"flex",gap:10,marginBottom:20}}>
          {[{l:"avg cal",v:avgCal,s:`goal ${goalsT.calories}`,c:"#f472b6"},{l:"avg protein",v:`${avgProt}g`,s:`goal ${goalsT.g_protein}g`,c:"#60a5fa"},{l:"days logged",v:`${daysLogged}/7`,s:"this week",c:"#00f5a0"},{l:"on target",v:`${daysOnGoal}d`,s:"within ±10%",c:"#fbbf24"}].map(({l,v,s,c})=>(
            <div key={l} style={{flex:1,background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:16,padding:"14px 8px",textAlign:"center"}}>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:17,fontWeight:700,color:c}}>{v}</div>
              <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:"#475569",marginTop:3}}>{l}</div>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:"#334155",marginTop:4}}>{s}</div>
            </div>
          ))}
        </div>

        <div style={{display:"flex",gap:6,marginBottom:18,background:"rgba(255,255,255,0.03)",borderRadius:16,padding:5}}>
          {[{key:"calories",label:"Calories"},{key:"macros",label:"Macros"},{key:"insights",label:"Insights"}].map(t=>(
            <button key={t.key} onClick={()=>setTab(t.key)} style={{flex:1,padding:"9px 0",borderRadius:12,border:"none",cursor:"pointer",background:tab===t.key?"rgba(255,255,255,0.07)":"transparent",fontFamily:"'Space Mono',monospace",fontSize:10,letterSpacing:"0.05em",color:tab===t.key?"#f1f5f9":"#334155",transition:"all 0.2s"}}>{t.label}</button>
          ))}
        </div>

        {tab==="calories"&&(
          <div style={{animation:"fadeSlideUp 0.35s ease"}}>
            <div style={{background:"rgba(15,20,40,0.9)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:22,padding:"18px 16px 10px",marginBottom:16,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:"linear-gradient(90deg,transparent,#00d9f540,transparent)"}}/>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"#334155",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:14}}>Calories · 7 days</div>
              <LineChart activeDay={activeDay} onDayClick={setActiveDay} weekData={weekData} goalsT={goalsT}/>
            </div>
            <div style={{background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:18,padding:16,marginBottom:16,animation:"fadeIn 0.25s ease"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:12}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:16}}>{sel.date}</div>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"#334155"}}>{sel.meals} meal{sel.meals!==1?"s":""} logged</div>
              </div>
              <div style={{display:"flex",gap:10,marginBottom:12}}>
                {[{l:"calories",v:sel.calories,u:"kcal",c:"#f472b6"},{l:"protein",v:sel.g_protein,u:"g",c:"#60a5fa"},{l:"carbs",v:sel.g_carbs,u:"g",c:"#fbbf24"},{l:"fat",v:sel.g_fat,u:"g",c:"#f97316"}].map(({l,v,u,c})=>(
                  <div key={l} style={{flex:1,background:`${c}10`,border:`1px solid ${c}20`,borderRadius:14,padding:"10px 6px",textAlign:"center"}}>
                    <div style={{fontFamily:"'Space Mono',monospace",fontSize:13,fontWeight:700,color:c}}>{v}<span style={{fontSize:8}}>{u}</span></div>
                    <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,color:"#475569",marginTop:2,textTransform:"uppercase",letterSpacing:"0.06em"}}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{paddingTop:12,borderTop:"1px solid rgba(255,255,255,0.04)",display:"flex",justifyContent:"space-between"}}>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#475569"}}>vs calorie goal</span>
                <span style={{fontFamily:"'Space Mono',monospace",fontSize:12,color:sel.calories>goalsT.calories?"#f87171":"#00f5a0"}}>{sel.calories>goalsT.calories?`+${sel.calories-goalsT.calories}`:`−${goalsT.calories-sel.calories}`} kcal</span>
              </div>
            </div>
          </div>
        )}

        {tab==="macros"&&(
          <div style={{animation:"fadeSlideUp 0.35s ease"}}>
            <div style={{display:"flex",gap:8,marginBottom:14}}>
              {macroMeta.map(m=>(
              
                <button key={m.key} onClick={()=>setActiveMetric(m.key)} style={{flex:1,padding:"9px 0",borderRadius:14,border:`1px solid ${activeMetric===m.key?`${m.color}40`:"rgba(255,255,255,0.05)"}`,cursor:"pointer",background:activeMetric===m.key?`${m.color}18`:"rgba(255,255,255,0.03)",fontFamily:"'Space Mono',monospace",fontSize:9,letterSpacing:"0.05em",color:activeMetric===m.key?m.color:"#334155",transition:"all 0.2s"}}>{m.label}</button>
              ))}
            </div>
            {(()=>{const m=MACRO_META.find(x=>x.key===activeMetric);return(
              <div style={{background:"rgba(15,20,40,0.9)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:22,padding:"18px 16px 10px",marginBottom:16,position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${m.color}40,transparent)`}}/>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
                  <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"#334155",letterSpacing:"0.1em",textTransform:"uppercase"}}>{m.label} · 7 days</div>
                  <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"#334155"}}>goal <span style={{color:m.color}}>{m.goal}g</span></div>
                </div>
                <MacroBarChart metric={activeMetric} weekData={weekData} macroMeta={macroMeta}/>
              </div>
            );})()}
            <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:18,overflow:"hidden"}}>
              {weekData.map((d,i)=>{
                const meta=macroMeta.find(m=>m.key===activeMetric),val=d[activeMetric],pct=Math.min(100,(val/meta.goal)*100),over=val>meta.goal;
                return(<div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderBottom:i<6?"1px solid rgba(255,255,255,0.03)":"none",background:d.day==="Today"?"rgba(255,255,255,0.02)":"transparent"}}>
                  <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:d.day==="Today"?"#f1f5f9":"#334155",width:28,flexShrink:0}}>{d.day==="Today"?"NOW":d.day}</div>
                  <div style={{flex:1,height:5,background:"rgba(255,255,255,0.04)",borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:over?"#f87171":meta.color,borderRadius:99}}/></div>
                  <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:over?"#f87171":"#64748b",width:36,textAlign:"right",flexShrink:0}}>{val}g</div>
                </div>);
              })}
            </div>
          </div>
        )}

        {tab==="insights"&&(
          <div style={{animation:"fadeSlideUp 0.35s ease"}}>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#475569",marginBottom:18,lineHeight:1.6}}>Patterns detected over the past 7 days based on your dining hall meals.</div>
            {insights.map((ins,i)=>(
            
              <div key={i} style={{background:`${ins.color}08`,border:`1px solid ${ins.color}20`,borderRadius:18,padding:16,marginBottom:10,animation:`fadeSlideUp 0.4s ${i*0.08}s ease both`,display:"flex",gap:14,alignItems:"flex-start"}}>
                <span style={{fontSize:22,flexShrink:0}}>{ins.icon}</span>
                <div>
                  <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14,color:ins.color,marginBottom:4}}>{ins.title}</div>
                  <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#64748b",lineHeight:1.55}}>{ins.body}</div>
                </div>
              </div>
            ))}
            <div style={{marginTop:20,background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:20,padding:18}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,marginBottom:14}}>Logging streak</div>
              <div style={{display:"flex",gap:8}}>
                {WEEK_DATA.map((d,i)=>(
                  <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                    <div style={{width:"100%",aspectRatio:"1",borderRadius:10,background:d.meals>0?"linear-gradient(135deg,#00f5a0,#00d9f5)":"rgba(255,255,255,0.04)",border:d.isToday?"2px solid #00f5a0":"none",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:d.meals>0?"0 4px 12px #00f5a030":"none"}}>
                      {d.meals>0&&<span style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"#030912",fontWeight:700}}>{d.meals}</span>}
                    </div>
                    <span style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:d.day==="Today"?"#00f5a0":"#334155"}}>{d.isToday?"NOW":d.day}</span>
                  </div>
                ))}
              </div>
              <div style={{marginTop:14,fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#475569"}}>
                {daysLogged}-day logging week · <span style={{color:"#00f5a0"}}>{daysLogged>=5?"Great consistency! 🔥":"Keep logging daily for better insights."}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════
export default function App() {
  const [page, setPage] = useState("home");

  const pages = {
    home:   <Dashboard  onNav={setPage} />,
    snap:   <SnapPage   onNav={setPage} />,
    menu:   <MenuBrowser />,
    trends: <Trends />,
  };

  return (
    <AuthProvider>
      <style>{GLOBAL_CSS}</style>
      <div style={{ maxWidth:420, margin:"0 auto", minHeight:"100vh", background:"#06080f", position:"relative" }}>
        <AuthGate>
          <div key={page} style={{ minHeight:"100vh" }}>
            {pages[page]}
          </div>
          <BottomNav active={page} onNav={setPage} />
        </AuthGate>
      </div>
    </AuthProvider>
  );
}