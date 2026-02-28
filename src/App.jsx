import { useState, useRef, useCallback, useEffect, useMemo } from "react";

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

function Dashboard({onNav}) {
  const [nudges,setNudges]=useState([{nudge_id:"n1",type:"low_protein",message:"Low protein 3 days in a row — try adding eggs from Eggcetera tonight",dismissed_at:null}]);
  const [greeting,setGreeting]=useState("");
  useEffect(()=>{const h=new Date().getHours();setGreeting(h<12?"Good morning":h<17?"Good afternoon":"Good evening");},[]);
  const totals=TODAY_MEALS.reduce((a,m)=>({calories:a.calories+m.total_nutrition.calories,g_protein:a.g_protein+m.total_nutrition.g_protein,g_carbs:a.g_carbs+m.total_nutrition.g_carbs,g_fat:a.g_fat+m.total_nutrition.g_fat}),{calories:0,g_protein:0,g_carbs:0,g_fat:0});

  return (
    <div style={{paddingBottom:110,animation:"pageIn 0.35s ease"}}>
      <div style={{position:"fixed",top:-80,left:"50%",transform:"translateX(-50%)",width:500,height:500,background:"radial-gradient(circle,#00f5a006 0%,transparent 65%)",pointerEvents:"none",zIndex:0}}/>

      <div style={{padding:"52px 22px 20px",position:"relative",zIndex:1}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{fontFamily:"'Space Mono',monospace",fontSize:11,color:"#334155",letterSpacing:"0.1em",textTransform:"uppercase"}}>{greeting}</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:28,letterSpacing:"-0.02em",marginTop:3}}>{USER.name} <span style={{color:"#00f5a0"}}>👋</span></div>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#475569",marginTop:4}}>Goal: <span style={{color:"#94a3b8",textTransform:"capitalize"}}>{USER.goal.replace("_"," ")}</span></div>
          </div>
          <div style={{width:46,height:46,borderRadius:16,background:"linear-gradient(135deg,#00f5a020,#00d9f520)",border:"1px solid #00f5a025",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🦡</div>
        </div>
      </div>

      <div style={{padding:"0 22px",position:"relative",zIndex:1}}>
        {nudges.filter(n=>!n.dismissed_at).map(n=>(
          <div key={n.nudge_id} style={{background:"linear-gradient(135deg,rgba(251,191,36,0.1),rgba(251,191,36,0.05))",border:"1px solid rgba(251,191,36,0.25)",borderRadius:18,padding:"14px 16px",marginBottom:16,display:"flex",gap:12,alignItems:"flex-start",animation:"fadeSlideUp 0.4s ease"}}>
            <span style={{fontSize:22,flexShrink:0}}>💪</span>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:13,color:"#fbbf24",marginBottom:3}}>Heads up</div>
              <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#94a3b8",lineHeight:1.5}}>{n.message}</div>
            </div>
            <button onClick={()=>setNudges(p=>p.map(x=>x.nudge_id===n.nudge_id?{...x,dismissed_at:new Date().toISOString()}:x))} style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:18,lineHeight:1,padding:0,marginTop:-2}}>×</button>
          </div>
        ))}

        <div style={{background:"linear-gradient(135deg,rgba(15,20,40,0.9),rgba(10,15,30,0.95))",border:"1px solid rgba(255,255,255,0.07)",borderRadius:24,padding:22,marginBottom:16,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:"linear-gradient(90deg,transparent,#00f5a040,transparent)"}}/>
          <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"#334155",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:18}}>Today · Feb 28</div>
          <div style={{display:"flex",gap:20,alignItems:"center"}}>
            <CalorieRing consumed={totals.calories} goal={USER.calorie_goal}/>
            <div style={{flex:1}}>
              <MacroRow label="Protein" consumed={totals.g_protein} goal={USER.protein_goal} color="#60a5fa"/>
              <MacroRow label="Carbs"   consumed={totals.g_carbs}   goal={USER.carb_goal}    color="#fbbf24"/>
              <MacroRow label="Fat"     consumed={totals.g_fat}     goal={USER.fat_goal}      color="#f97316"/>
            </div>
          </div>
          <div style={{display:"flex",gap:10,marginTop:18,paddingTop:18,borderTop:"1px solid rgba(255,255,255,0.04)"}}>
            {[{label:"meals",value:TODAY_MEALS.length},{label:"% cal",value:`${Math.round(totals.calories/USER.calorie_goal*100)}%`},{label:"protein",value:`${Math.round(totals.g_protein/USER.protein_goal*100)}%`}].map(({label,value})=>(
              <div key={label} style={{flex:1,textAlign:"center",background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"10px 6px"}}>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:16,fontWeight:700,color:"#f1f5f9"}}>{value}</div>
                <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:"#334155",marginTop:2,textTransform:"uppercase",letterSpacing:"0.06em"}}>{label}</div>
              </div>
            ))}
          </div>
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
            <span style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"#334155",letterSpacing:"0.1em"}}>{TODAY_MEALS.length} LOGGED</span>
          </div>
          {TODAY_MEALS.map(m=><MealCard key={m.meal_id} meal={m}/>)}
          <div style={{border:"1px dashed rgba(255,255,255,0.07)",borderRadius:18,padding:16,display:"flex",alignItems:"center",gap:12,cursor:"pointer"}} onClick={()=>onNav("snap")}>
            <div style={{width:40,height:40,borderRadius:14,background:"rgba(255,255,255,0.03)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🌙</div>
            <div>
              <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:14,color:"#334155"}}>Dinner not logged yet</div>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"#1e293b",marginTop:2}}>+ TAP TO LOG</div>
            </div>
          </div>
        </div>

        <div style={{marginBottom:24}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:12}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:17}}>Recommended <span style={{color:"#00f5a0"}}>tonight</span></div>
            <span style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"#334155"}}>GORDON · DINNER</span>
          </div>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#475569",marginBottom:14}}>
            You need <span style={{color:"#60a5fa"}}>{USER.protein_goal-totals.g_protein}g more protein</span> today.
          </div>
          <div style={{display:"flex",gap:12,overflowX:"auto",paddingBottom:8}}>
            {RECOMMENDED.map(item=>(
              <div key={item.food_id} style={{flexShrink:0,width:160,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:18,padding:14,cursor:"pointer"}}>
                <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:13,color:"#f1f5f9",marginBottom:6,lineHeight:1.3}}>{item.name}</div>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"#475569",marginBottom:10}}>{item.station}</div>
                <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:10}}>
                  {item.food_tags.map(t=><span key={t} style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:TAG_COLOR[t],background:`${TAG_COLOR[t]}15`,padding:"2px 7px",borderRadius:99}}>{t}</span>)}
                </div>
                <div style={{borderTop:"1px solid rgba(255,255,255,0.05)",paddingTop:10,display:"flex",justifyContent:"space-between"}}>
                  <div><div style={{fontFamily:"'Space Mono',monospace",fontSize:13,color:"#f472b6"}}>{item.nutrition.calories}</div><div style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:"#334155"}}>kcal</div></div>
                  <div><div style={{fontFamily:"'Space Mono',monospace",fontSize:13,color:"#60a5fa"}}>{item.nutrition.g_protein}g</div><div style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:"#334155"}}>protein</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:20,padding:18,marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15}}>7-day streak</div>
            <span onClick={()=>onNav("trends")} style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"#334155",cursor:"pointer"}}>SEE TRENDS →</span>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"flex-end"}}>
            {[1420,1980,2210,1760,2100,2300,totals.calories].map((cal,i)=>{
              const isToday=i===6;
              const h=Math.max(16,(cal/2800)*60);
              return (
                <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                  <div style={{width:"100%",height:h,borderRadius:6,background:isToday?"linear-gradient(180deg,#00f5a0,#00d9f5)":"rgba(255,255,255,0.06)",boxShadow:isToday?"0 4px 16px #00f5a040":"none"}}/>
                  <span style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:isToday?"#00f5a0":"#334155"}}>{"MTWTFSS"[i]}</span>
                </div>
              );
            })}
          </div>
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
  const [phase,setPhase]=useState("idle");
  const [detections,setDetections]=useState([]);
  const [matches,setMatches]=useState([]);
  const [confirmed,setConfirmed]=useState({});
  const [searchQuery,setSearchQuery]=useState("");
  const [showSuccess,setShowSuccess]=useState(false);
  const videoRef=useRef(null);
  const streamRef=useRef(null);
  const fileInputRef=useRef(null);

  const stopCamera=useCallback(()=>{
    if(streamRef.current)streamRef.current.getTracks().forEach(t=>t.stop());
    streamRef.current=null;
  },[]);

  const startCamera=useCallback(async()=>{
    try{
      const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});
      streamRef.current=stream;
      if(videoRef.current)videoRef.current.srcObject=stream;
    }catch{}
    setPhase("scanning");
  },[]);

  const runAnalysis=useCallback(()=>{
    setPhase("analyzing");stopCamera();
    setTimeout(()=>{
      const results=MOCK_DETECTIONS.filter(d=>d.confidence>=0.25).map(det=>{
        const candidates=MENU.map(item=>({food_item:item,match_score:
          det.label==="pizza"&&item.name.toLowerCase().includes("pizza")?0.92:
          det.label==="salad"&&item.name.toLowerCase().includes("salad")?0.85:
          det.label==="bread"&&item.name.toLowerCase().includes("toast")?0.78:
          Math.random()*0.35})).sort((a,b)=>b.match_score-a.match_score).slice(0,3);
        return{detection_label:det.label,confidence:det.confidence,candidates};
      });
      setDetections(MOCK_DETECTIONS);setMatches(results);setPhase("results");
    },2800);
  },[stopCamera]);

  const handleLog=useCallback(()=>{
    setShowSuccess(true);
    setTimeout(()=>{setShowSuccess(false);setPhase("idle");setDetections([]);setMatches([]);setConfirmed({});stopCamera();},2200);
  },[stopCamera]);

  useEffect(()=>()=>stopCamera(),[stopCamera]);
  const filteredMenu=MENU.filter(i=>i.name.toLowerCase().includes(searchQuery.toLowerCase())||i.station.toLowerCase().includes(searchQuery.toLowerCase()));

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
        </div>
      )}

      {phase==="scanning"&&(
        <div style={{padding:"0 24px",animation:"fadeSlideUp 0.4s ease",position:"relative",zIndex:1}}>
          <div style={{position:"relative",borderRadius:24,overflow:"hidden",background:"#000",aspectRatio:"4/3",border:"1px solid rgba(0,245,160,0.2)",boxShadow:"0 0 40px #00f5a020"}}>
            <video ref={videoRef} autoPlay playsInline muted style={{width:"100%",height:"100%",objectFit:"cover"}}/>
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
  const [selectedStation,setSelectedStation]=useState("All");
  const [activeTags,setActiveTags]=useState([]);
  const [sortKey,setSortKey]=useState("default");
  const [searchQuery,setSearchQuery]=useState("");
  const [mealType,setMealType]=useState("dinner");
  const [saved,setSaved]=useState({});
  const [showSaved,setShowSaved]=useState(false);

  const toggleTag=tag=>setActiveTags(p=>p.includes(tag)?p.filter(t=>t!==tag):[...p,tag]);
  const toggleSave=id=>setSaved(p=>({...p,[id]:!p[id]}));

  const filtered=useMemo(()=>{
    let list=MENU;
    if(showSaved)list=list.filter(i=>saved[i.food_id]);
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

  const savedCount=Object.values(saved).filter(Boolean).length;
  const totalCal=MENU.filter(i=>saved[i.food_id]).reduce((s,i)=>s+i.nutrition.calories,0);

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

      <div style={{padding:"0 20px"}}>
        {filtered.length===0?(
          <div style={{textAlign:"center",padding:"60px 0",animation:"fadeSlideUp 0.4s ease"}}>
            <div style={{fontSize:40,marginBottom:12}}>🍽️</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:18,color:"#334155"}}>Nothing found</div>
          </div>
        ):filtered.map((item,i)=>(
          <div key={item.food_id} style={{animation:`fadeSlideUp 0.35s ease ${i*0.04}s both`}}>
            <FoodCard item={item} saved={!!saved[item.food_id]} onSave={toggleSave}/>
          </div>
        ))}
      </div>

      {savedCount>0&&(
        <div style={{position:"fixed",bottom:72,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 40px)",maxWidth:380,zIndex:30,background:"linear-gradient(135deg,#00f5a0,#00d9f5)",borderRadius:20,padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 12px 40px #00f5a050",animation:"fadeSlideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)"}}>
          <div>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:15,color:"#030912"}}>Log {savedCount} dish{savedCount>1?"es":""}</div>
            <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"#065f46",marginTop:1}}>{totalCal} kcal total</div>
          </div>
          <div style={{fontFamily:"'Space Mono',monospace",fontSize:12,color:"#030912",background:"rgba(0,0,0,0.1)",padding:"6px 16px",borderRadius:12}}>CONFIRM →</div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PAGE: TRENDS
// ═══════════════════════════════════════════════════════════════════
const WEEK_DATA=[
  {date:"Feb 22",day:"Sat",  calories:1420,g_protein:68, g_carbs:180,g_fat:44,meals:2},
  {date:"Feb 23",day:"Sun",  calories:1980,g_protein:95, g_carbs:240,g_fat:61,meals:3},
  {date:"Feb 24",day:"Mon",  calories:2210,g_protein:112,g_carbs:270,g_fat:72,meals:3},
  {date:"Feb 25",day:"Tue",  calories:1760,g_protein:78, g_carbs:220,g_fat:55,meals:2},
  {date:"Feb 26",day:"Wed",  calories:2100,g_protein:103,g_carbs:255,g_fat:68,meals:3},
  {date:"Feb 27",day:"Thu",  calories:2300,g_protein:118,g_carbs:280,g_fat:74,meals:3},
  {date:"Feb 28",day:"Today",calories:960, g_protein:72, g_carbs:101,g_fat:30,meals:2},
];
const GOALS_T={calories:2400,g_protein:160,g_carbs:260,g_fat:80};
const CAL_MAX=2800,CH=160,CW=340,PL=36,PB=28,PR=12,PT=16,IW=CW-PL-PR,IH=CH-PT-PB;
const MACRO_META=[
  {key:"g_protein",label:"Protein",color:"#60a5fa",goal:160,max:180},
  {key:"g_carbs",  label:"Carbs",  color:"#fbbf24",goal:260,max:320},
  {key:"g_fat",    label:"Fat",    color:"#f97316",goal:80, max:100},
];
const INSIGHTS=[
  {icon:"💪",title:"Protein low 3 days",body:"You hit your protein goal only once this week. Try Fired Up's Grilled Chicken tonight.",color:"#60a5fa"},
  {icon:"🔥",title:"Calorie streak",body:"4 out of 7 days within 10% of your goal. Keep it up!",color:"#00f5a0"},
  {icon:"🍞",title:"Carb-heavy Thursdays",body:"You consistently go over carbs mid-week. Try swapping bread for brown rice.",color:"#fbbf24"},
];
const xp=i=>PL+(i/(WEEK_DATA.length-1))*IW;
const yp=(v,m)=>PT+IH-(v/m)*IH;

function LineChart({activeDay,onDayClick}) {
  const pathRef=useRef(null);
  const [drawn,setDrawn]=useState(0);
  const [len,setLen]=useState(1000);
  const linePath=WEEK_DATA.map((d,i)=>`${i===0?"M":"L"} ${xp(i).toFixed(1)} ${yp(d.calories,CAL_MAX).toFixed(1)}`).join(" ");
  const areaPath=linePath+` L ${xp(6).toFixed(1)} ${(PT+IH).toFixed(1)} L ${xp(0).toFixed(1)} ${(PT+IH).toFixed(1)} Z`;
  const goalY=yp(GOALS_T.calories,CAL_MAX);
  useEffect(()=>{
    if(!pathRef.current)return;
    const l=pathRef.current.getTotalLength();
    setLen(l);setDrawn(0);
    const start=performance.now();
    const tick=now=>{const t=Math.min(1,(now-start)/900);setDrawn(l*(1-Math.pow(1-t,3)));if(t<1)requestAnimationFrame(tick);};
    requestAnimationFrame(tick);
  },[]);
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
      {WEEK_DATA.map((d,i)=>{
        const cx=xp(i),cy=yp(d.calories,CAL_MAX),isActive=activeDay===i,isToday=d.day==="Today",over=d.calories>GOALS_T.calories;
        return(<g key={i} onClick={()=>onDayClick(i)} style={{cursor:"pointer"}}>
          <circle cx={cx} cy={cy} r={isActive?7:4.5} fill={over?"#f87171":"#00f5a0"} stroke="#06080f" strokeWidth="2" style={{transition:"r 0.2s",filter:isActive?`drop-shadow(0 0 6px ${over?"#f87171":"#00f5a0"})`:"none"}}/>
          {isToday&&<circle cx={cx} cy={cy} r={11} fill="none" stroke="#00f5a0" strokeWidth="1" opacity="0.4"/>}
          <text x={cx} y={PT+IH+16} textAnchor="middle" fill={isActive?"#f1f5f9":"#334155"} fontSize="9" fontFamily="Space Mono,monospace">{d.day==="Today"?"NOW":d.day}</text>
        </g>);
      })}
    </svg>
  );
}

function MacroBarChart({metric}) {
  const meta=MACRO_META.find(m=>m.key===metric),goalY=yp(meta.goal,meta.max);
  return (
    <svg width="100%" viewBox={`0 0 ${CW} ${CH}`} style={{overflow:"visible"}}>
      <line x1={PL} y1={goalY} x2={CW-PR} y2={goalY} stroke={meta.color} strokeWidth="1" strokeDasharray="4 4" opacity="0.4"/>
      {[0,0.5,1].map(f=>{const y=PT+IH*(1-f);return(<g key={f}><line x1={PL} y1={y} x2={CW-PR} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/><text x={PL-4} y={y+4} textAnchor="end" fill="#334155" fontSize="8" fontFamily="Space Mono,monospace">{Math.round(meta.max*f)}g</text></g>);})}
      {WEEK_DATA.map((d,i)=>{
        const bw=(IW/WEEK_DATA.length)*0.55,cx=xp(i),val=d[metric],bh=(val/meta.max)*IH,x=cx-bw/2,y=PT+IH-bh,isToday=d.day==="Today",over=val>meta.goal,color=over?"#f87171":isToday?meta.color:`${meta.color}55`;
        return(<g key={i}><rect x={x} y={y} width={bw} height={bh} rx="3" fill={color} style={{animation:`fadeIn 0.4s ${i*0.07}s ease both`}}/><text x={cx} y={PT+IH+16} textAnchor="middle" fill={isToday?"#f1f5f9":"#334155"} fontSize="9" fontFamily="Space Mono,monospace">{d.day==="Today"?"NOW":d.day}</text></g>);
      })}
    </svg>
  );
}

function Trends() {
  const [activeDay,setActiveDay]=useState(6);
  const [activeMetric,setActiveMetric]=useState("g_protein");
  const [tab,setTab]=useState("calories");
  const sel=WEEK_DATA[activeDay];
  const avgCal=Math.round(WEEK_DATA.reduce((s,d)=>s+d.calories,0)/WEEK_DATA.length);
  const avgProt=Math.round(WEEK_DATA.reduce((s,d)=>s+d.g_protein,0)/WEEK_DATA.length);
  const daysLogged=WEEK_DATA.filter(d=>d.meals>0).length;
  const daysOnGoal=WEEK_DATA.filter(d=>Math.abs(d.calories-GOALS_T.calories)/GOALS_T.calories<0.1).length;

  return (
    <div style={{paddingBottom:110,animation:"pageIn 0.35s ease"}}>
      <div style={{position:"fixed",top:-80,left:"50%",transform:"translateX(-50%)",width:500,height:400,background:"radial-gradient(circle,#00d9f508 0%,transparent 65%)",pointerEvents:"none",zIndex:0}}/>
      <div style={{padding:"52px 22px 20px",position:"relative",zIndex:1}}>
        <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"#334155",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4}}>Feb 22 – 28</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:28,letterSpacing:"-0.02em"}}>Weekly <span style={{color:"#00d9f5"}}>Trends</span></div>
      </div>
      <div style={{padding:"0 22px",position:"relative",zIndex:1}}>
        <div style={{display:"flex",gap:10,marginBottom:20}}>
          {[{l:"avg cal",v:avgCal,s:`goal ${GOALS_T.calories}`,c:"#f472b6"},{l:"avg protein",v:`${avgProt}g`,s:`goal ${GOALS_T.g_protein}g`,c:"#60a5fa"},{l:"days logged",v:`${daysLogged}/7`,s:"this week",c:"#00f5a0"},{l:"on target",v:`${daysOnGoal}d`,s:"within ±10%",c:"#fbbf24"}].map(({l,v,s,c})=>(
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
              <LineChart activeDay={activeDay} onDayClick={setActiveDay}/>
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
                <span style={{fontFamily:"'Space Mono',monospace",fontSize:12,color:sel.calories>GOALS_T.calories?"#f87171":"#00f5a0"}}>{sel.calories>GOALS_T.calories?`+${sel.calories-GOALS_T.calories}`:`−${GOALS_T.calories-sel.calories}`} kcal</span>
              </div>
            </div>
          </div>
        )}

        {tab==="macros"&&(
          <div style={{animation:"fadeSlideUp 0.35s ease"}}>
            <div style={{display:"flex",gap:8,marginBottom:14}}>
              {MACRO_META.map(m=>(
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
                <MacroBarChart metric={activeMetric}/>
              </div>
            );})()}
            <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:18,overflow:"hidden"}}>
              {WEEK_DATA.map((d,i)=>{
                const meta=MACRO_META.find(m=>m.key===activeMetric),val=d[activeMetric],pct=Math.min(100,(val/meta.goal)*100),over=val>meta.goal;
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
            {INSIGHTS.map((ins,i)=>(
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
                    <div style={{width:"100%",aspectRatio:"1",borderRadius:10,background:d.meals>0?"linear-gradient(135deg,#00f5a0,#00d9f5)":"rgba(255,255,255,0.04)",border:d.day==="Today"?"2px solid #00f5a0":"none",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:d.meals>0?"0 4px 12px #00f5a030":"none"}}>
                      {d.meals>0&&<span style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"#030912",fontWeight:700}}>{d.meals}</span>}
                    </div>
                    <span style={{fontFamily:"'Space Mono',monospace",fontSize:8,color:d.day==="Today"?"#00f5a0":"#334155"}}>{d.day==="Today"?"NOW":d.day}</span>
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
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ maxWidth:420, margin:"0 auto", minHeight:"100vh", background:"#06080f", position:"relative" }}>
        <div key={page} style={{ minHeight:"100vh" }}>
          {pages[page]}
        </div>
        <BottomNav active={page} onNav={setPage} />
      </div>
    </>
  );
}