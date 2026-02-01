import React, { useMemo, useState, useEffect } from "react";
import TB from "./tb_data.json";

/* =========================================
   🎨 GAME THEME DIZAJN (SAMO IZGLED)
   ========================================= */

// Učitavanje fonta za naslove (Game look)
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Roboto:wght@400;500;700&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

const THEME = {
  colors: {
    gold: "#C5A059",
    goldDim: "#8b6508",
    goldBright: "#FFD700",
    darkBg: "rgba(18, 18, 24, 0.85)", // Glavna pozadina panela
    inputBg: "rgba(0, 0, 0, 0.4)",
    text: "#E0E0E0",
    textDim: "#A0AEC0",
    accent: "#4299e1", // Plava za gumbe ili detalje
    danger: "#e53e3e",
    success: "#48bb78"
  },
  shadows: {
    card: "0 8px 32px 0 rgba(0, 0, 0, 0.5)",
    glow: "0 0 10px rgba(197, 160, 89, 0.3)"
  }
};

/* --- KOMPONENTE ZA IZGLED --- */

const GameCard = ({ title, children, isSpecial }) => (
  <div style={{
    background: THEME.colors.darkBg,
    backdropFilter: "blur(8px)",
    border: `1px solid ${isSpecial ? THEME.colors.gold : "rgba(255,255,255,0.1)"}`,
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "16px",
    boxShadow: isSpecial ? THEME.shadows.glow : THEME.shadows.card,
    position: "relative",
    overflow: "hidden"
  }}>
    {/* Ukrasna linija na vrhu */}
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0, height: "2px",
      background: isSpecial 
        ? `linear-gradient(90deg, transparent, ${THEME.colors.goldBright}, transparent)` 
        : "rgba(255,255,255,0.1)"
    }} />
    
    <div style={{
      fontFamily: "'Cinzel', serif",
      fontWeight: 700,
      fontSize: "16px",
      color: isSpecial ? THEME.colors.goldBright : THEME.colors.text,
      marginBottom: "16px",
      textTransform: "uppercase",
      letterSpacing: "1px",
      borderBottom: `1px solid ${isSpecial ? THEME.colors.goldDim : "rgba(255,255,255,0.1)"}`,
      paddingBottom: "8px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}>
      {title}
      {isSpecial && <span style={{fontSize: "12px"}}>🛡️</span>}
    </div>
    {children}
  </div>
);

const GameInput = (props) => (
  <input {...props} style={{
    width: "100%",
    padding: "10px 12px",
    background: THEME.colors.inputBg,
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "6px",
    color: "#fff",
    fontFamily: "'Roboto', sans-serif",
    fontSize: "15px",
    outline: "none",
    transition: "border-color 0.2s",
    ...props.style
  }} 
  onFocus={(e) => e.target.style.borderColor = THEME.colors.gold}
  onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.2)"}
  />
);

const GameSelect = (props) => (
  <select {...props} style={{
    width: "100%",
    padding: "10px 12px",
    background: THEME.colors.inputBg,
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "6px",
    color: "#fff",
    fontFamily: "'Roboto', sans-serif",
    fontSize: "15px",
    outline: "none",
    appearance: "none", // Sakriva default strelicu
    backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23C5A059%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px top 50%",
    backgroundSize: "12px auto",
    ...props.style
  }} />
);

// --- KONSTANTE I LOGIKA (NETAKNUTO) ---

const MODE_WITHOUT = "WITHOUT";
const MODE_WITH = "WITH";

const STRIKER_LABELS = [
  "First Striker", "Second Striker", "Third Striker", 
  "Cleanup 1", "Cleanup 2", "Cleanup 3", "Cleanup 4", "Cleanup 5", "Cleanup 6",
];

const RESULT_ORDER = [
  "Wyvern", "Warregal", "Jago", "Ariel", "Epic Monster Hunter", "Fire Phoenix II",
  "Fire Phoenix I", "Manticore", "Corax II", "Royal Lion II", "Corax I",
  "Royal Lion I", "Griffin VII", "Josephine II", "Griffin VI", "Josephine I",
  "Griffin V", "Siege Ballistae VII", "Siege Ballistae VI", "Punisher I",
  "Duelist I", "Catapult V", "Vulture VII", "Heavy Halberdier VII",
  "Heavy Knight VII", "Catapult IV", "Vulture VI", "Heavy Halberdier VI",
  "Heavy Knight VI", "Spearmen V", "Swordsmen V", "Vulture V"
];

const TROOPS_WITH_M8_RAW = [
  "Wyvern", "Warregal", "Jago", "Ariel", "Epic Monster Hunter", "Fire Phoenix II",
  "Fire Phoenix I", "Manticore", "Corax II", "Royal Lion II", "Corax I",
  "Royal Lion I", "Griffin VII", "Josephine II", "Griffin VI", "Josephine I",
  "Griffin V", "Siege Ballistae VII", "Siege Ballistae VI", "Catapult V",
  "Vulture VII", "Catapult IV", "Vulture VI", "Vulture V",
];

const TROOPS_WITHOUT_M8_RAW = [
  "Wyvern", "Warregal", "Jago", "Ariel", "Epic Monster Hunter", "Manticore",
  "Corax I", "Royal Lion I", "Griffin VII", "Josephine II", "Griffin VI",
  "Josephine I", "Griffin V", "Siege Ballistae VII", "Siege Ballistae VI",
  "Punisher I", "Duelist I", "Catapult V", "Vulture VII", "Heavy Halberdier VII",
  "Heavy Knight VII", "Catapult IV", "Vulture VI", "Heavy Halberdier VI",
  "Heavy Knight VI", "Spearmen V", "Swordsmen V", "Vulture V"
];

const WALL_KILLER_NAMES_RAW = [
  "Ariel", "Josephine II", "Josephine I", "Siege Ballistae VII", "Siege Ballistae VI", "Catapult V", "Catapult IV",
];

function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function fmtInt(n) {
  if (!Number.isFinite(n)) return "-";
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(Math.floor(n));
}
function normName(s) {
  return String(s ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}

// Icon path logic
const ICON_FILE_MAP = {
  "Corax II": "Corax II.png", "Corax I": "Corax I.png", "Griffin VII": "Griffin VII.png", 
  "Griffin VI": "Griffin VI.png", "Griffin V": "Griffin V.png", "Wyvern": "Wyvern.png", 
  "Warregal": "Warregal.png", "Jago": "Jago.png", "Epic Monster Hunter": "Epic Monster Hunter.png", 
  "Royal Lion II": "Royal Lion II.png", "Royal Lion I": "Royal Lion I.png", "Vulture VII": "Vulture VII.png", 
  "Vulture VI": "Vulture VI.png", "Vulture V": "Vulture V.png", "Fire Phoenix II": "Fire Phoenix II.png", 
  "Fire Phoenix I": "Fire Phoenix I.png", "Manticore": "Manticore.png", "Ariel": "Ariel.png", 
  "Josephine II": "Josephine II.png", "Josephine I": "Josephine I.png", "Siege Ballistae VII": "Siege Ballistae VII.png", 
  "Siege Ballistae VI": "Siege Ballistae VI.png", "Catapult V": "Catapult V.png", "Catapult IV": "Catapult IV.png", 
  "Punisher I": "Punisher I.png", "Heavy Halberdier VII": "Heavy Halberdier VII.png", "Heavy Halberdier VI": "Heavy Halberdier VI.png", 
  "Spearmen V": "Spearmen V.png", "Duelist I": "Duelist I.png", "Heavy Knight VII": "Heavy Knight VII.png", 
  "Heavy Knight VI": "Heavy Knight VI.png", "Swordsmen V": "Swordsmen V.png",
};

// Jednostavna funkcija za ikone (pretpostavlja public/icons/)
function iconSrcForTroop(name) {
  const file = ICON_FILE_MAP[name];
  if (!file) return null;
  return `./icons/${file}`; 
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed"; ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return !!ok;
    } catch { return false; }
  }
}

export default function App() {
  const citadelKeys = Object.keys(TB.citadels ?? {});
  const troops = TB.troops ?? [];

  const canon = useMemo(() => {
    const m = new Map();
    for (const t of troops) m.set(normName(t.name), t.name);
    if (m.has(normName("Royal Lion I")))
      m.set(normName("Royla Lion I"), m.get(normName("Royal Lion I")));
    return m;
  }, [troops]);

  const troopByName = useMemo(() => new Map(troops.map((t) => [t.name, t])), [troops]);

  const additionalBonus = TB.additionalBonusNormal ?? {};
  const phoenixExtra = TB.phoenixExtra ?? {};
  const firstStrikerAllowed = TB.firstStrikerAllowed ?? {};

  const [citadelLevel, setCitadelLevel] = useState(citadelKeys[0] ?? "25");
  const [mode, setMode] = useState(MODE_WITHOUT);

  const [strikerTroops, setStrikerTroops] = useState(() => Array(9).fill(""));
  const [strikerBonusPct, setStrikerBonusPct] = useState(() => Array(9).fill(""));
  const [firstHealthBonusPct, setFirstHealthBonusPct] = useState("");
  const [warningMsg, setWarningMsg] = useState("");

  const [groupBonusPct, setGroupBonusPct] = useState({});

  const getBonusGroup = (troopName) => {
    if (!troopName) return null;
    const n = normName(troopName);
    if (n === "jago") return "ROYAL_LION";
    if (n === "warregal" || n === "warregel") return "GRIFFIN";
    if (n.startsWith("corax")) return "CORAX";
    if (n.startsWith("fire phoenix")) return "PHOENIX";
    if (n.startsWith("vulture")) return "VULTURE";
    if (n.startsWith("royal lion")) return "ROYAL_LION";
    if (n.startsWith("griffin")) return "GRIFFIN";
    if (n.startsWith("punisher") || n.startsWith("heavy halberdier") || n.startsWith("spearmen")) return "PHH_SPEAR";
    if (n.startsWith("duelist") || n.startsWith("heavy knight") || n.startsWith("swordsmen")) return "DUEL_HK_SW";
    return null;
  };

  const getBaseStrength = (troopName) => {
    if (!troopName) return 0;
    const exact = canon.get(normName(troopName)) || troopName;
    const t = troopByName.get(exact);
    const v = t?.baseStrength ?? t?.base_strength ?? t?.strength ?? t?.base ?? 0;
    return Number(v) || 0;
  };

  const getBaseHealth = (troopName) => {
    if (!troopName) return 0;
    const exact = canon.get(normName(troopName)) || troopName;
    const t = troopByName.get(exact);
    const v = t?.baseHealth ?? t?.base_health ?? t?.health ?? t?.hp ?? 0;
    return Number(v) || 0;
  };

  const isFirstStrikerTroop = (troopName) => {
    if (!troopName) return false;
    const exact = canon.get(normName(troopName)) || troopName;
    const list = mode === MODE_WITH ? (firstStrikerAllowed.WITH || []) : (firstStrikerAllowed.WITHOUT || []);
    for (const n of list) {
      const nn = canon.get(normName(n)) || n;
      if (nn === exact) return true;
    }
    return false;
  };

  const [resultsOpen, setResultsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [calcOutput, setCalcOutput] = useState(null);
  const [copyNotice, setCopyNotice] = useState("");

  const cit = TB.citadels?.[citadelLevel];
  const targets = useMemo(() => {
    if (!cit) return null;
    return mode === MODE_WITH ? cit.m8m9Targets : cit.normalTargets;
  }, [cit, mode]);

  const poolAll = useMemo(() => {
    const raw = mode === MODE_WITH ? TROOPS_WITH_M8_RAW : TROOPS_WITHOUT_M8_RAW;
    const out = [];
    for (const r of raw) { const c = canon.get(normName(r)); if (c) out.push(c); }
    const seen = new Set();
    return out.filter((n) => { const k = normName(n); if (seen.has(k)) return false; seen.add(k); return true; });
  }, [mode, canon]);

  const wallKillerPool = useMemo(() => {
    const out = [];
    for (const r of WALL_KILLER_NAMES_RAW) { const c = canon.get(normName(r)); if (c) out.push(c); }
    const seen = new Set();
    return out.filter((n) => { const k = normName(n); if (seen.has(k)) return false; seen.add(k); return true; });
  }, [canon]);

  const secondAllowed = useMemo(() => {
    const manticore = canon.get(normName("Manticore"));
    const fp1 = canon.get(normName("Fire Phoenix I"));
    const fp2 = canon.get(normName("Fire Phoenix II"));
    if (mode === MODE_WITHOUT) return manticore ? [manticore] : [];
    return [fp2, fp1].filter(Boolean);
  }, [mode, canon]);

  const nonWallPool = useMemo(() => {
    const wallSet = new Set(wallKillerPool.map(normName));
    return poolAll.filter((n) => !wallSet.has(normName(n)));
  }, [poolAll, wallKillerPool]);

  const firstAllowed = useMemo(() => {
    const rawList = mode === MODE_WITH ? firstStrikerAllowed.WITH ?? [] : firstStrikerAllowed.WITHOUT ?? [];
    const allowedSet = new Set(nonWallPool.map(normName));
    const out = [];
    for (const r of rawList) {
      const c = canon.get(normName(r)); if (!c) continue;
      if (allowedSet.has(normName(c))) out.push(c);
    }
    const seen = new Set();
    return out.filter((n) => { const k = normName(n); if (seen.has(k)) return false; seen.add(k); return true; });
  }, [mode, firstStrikerAllowed, nonWallPool, canon]);

  const normalize = (current) => {
    const next = [...current];
    const secFallback = secondAllowed[0] ?? "";
    next[1] = secondAllowed.includes(next[1]) ? next[1] : secFallback;
    if (next[0] && !firstAllowed.map(normName).includes(normName(next[0]))) next[0] = "";
    for (let i = 2; i < 9; i++) { if (next[i] && !nonWallPool.map(normName).includes(normName(next[i]))) next[i] = ""; }
    const seen = new Set();
    for (let i = 0; i < 9; i++) {
      const v = next[i]; if (!v) continue; const k = normName(v);
      if (seen.has(k)) next[i] = ""; else seen.add(k);
    }
    const wallSet = new Set(wallKillerPool.map(normName));
    for (let i = 0; i < 9; i++) { if (next[i] && wallSet.has(normName(next[i]))) next[i] = i === 1 ? next[i] : ""; }
    return next;
  };

  const [wallKillerTroop, setWallKillerTroop] = useState("");
  const [wallKillerBonusPct, setWallKillerBonusPct] = useState("");

  useEffect(() => { if (!wallKillerTroop) setWallKillerTroop(wallKillerPool[0] ?? ""); }, [wallKillerTroop, wallKillerPool]);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setStrikerTroops((prev) => normalize(["", prev[1], "", "", "", "", "", "", ""]));
    setStrikerBonusPct(() => Array(9).fill(""));
    setFirstHealthBonusPct("");
    setGroupBonusPct({});
    setCalcOutput(null);
    setResultsOpen(false);
  };

  useEffect(() => {
    setStrikerTroops((prev) => normalize(prev));
    setCalcOutput(null);
    setResultsOpen(false);
  }, [mode, citadelLevel, poolAll.join("|"), wallKillerPool.join("|"), firstAllowed.join("|")]);

  const optionsForIdx = (idx) => {
    const taken = new Set(strikerTroops.filter((_, i) => i !== idx).filter(Boolean).map(normName));
    let pool;
    if (idx === 0) pool = firstAllowed;
    else if (idx === 1) pool = secondAllowed;
    else pool = nonWallPool;
    const filtered = pool.filter((n) => !taken.has(normName(n)));
    return idx !== 1 ? ["", ...filtered] : filtered;
  };

  const setTroopAt = (idx, name) => {
    setStrikerTroops((prev) => normalize(prev.map((v, i) => (i === idx ? name : v))));
    const g = getBonusGroup(name);
    if (g) {
      setStrikerBonusPct((prev) => { const next = [...prev]; next[idx] = groupBonusPct[g] ?? ""; return next; });
    } else if (!name) {
      setStrikerBonusPct((prev) => { const next = [...prev]; next[idx] = ""; return next; });
    }
    setCalcOutput(null);
    setResultsOpen(false);
  };

  const handleTroopChange = (idx, picked) => {
    if (idx >= 2) {
      const first = strikerTroops[0];
      if (first && picked && isFirstStrikerTroop(picked)) {
        const firstS = getBaseStrength(first); const firstH = getBaseHealth(first);
        const pickedS = getBaseStrength(picked); const pickedH = getBaseHealth(picked);
        if (pickedS > firstS || pickedH > firstH) {
          setWarningMsg(`Troop ${picked} has better base stats than First Striker ${first}.\nCheck your First Striker selection!`);
          setTroopAt(idx, "");
          setStrikerBonusPct((prev) => { const next = [...prev]; next[idx] = ""; return next; });
          return;
        }
      }
    }
    setTroopAt(idx, picked);
  };

  const setBonusAt = (idx, v) => {
    const raw = v;
    const troopName = strikerTroops[idx];
    const g = getBonusGroup(troopName);
    if (g) {
      setGroupBonusPct((prev) => ({ ...prev, [g]: raw }));
      setStrikerBonusPct((prev) => {
        const next = [...prev];
        for (let i = 0; i < strikerTroops.length; i++) { if (getBonusGroup(strikerTroops[i]) === g) next[i] = raw; }
        return next;
      });
    } else {
      setStrikerBonusPct((prev) => { const next = [...prev]; next[idx] = raw; return next; });
    }
    setCalcOutput(null);
    setResultsOpen(false);
  };

  const resetSelections = () => {
    const current = normalize(strikerTroops);
    setStrikerTroops(() => normalize(["", current[1], "", "", "", "", "", "", ""]));
    setStrikerBonusPct(() => Array(9).fill(""));
    setFirstHealthBonusPct("");
    setGroupBonusPct({});
    setWallKillerTroop(wallKillerPool[0] ?? "");
    setWallKillerBonusPct("");
    setCalcOutput(null);
    setResultsOpen(false);
  };

  const firstDeaths = useMemo(() => {
    if (!cit) return 0;
    const troop = troopByName.get(strikerTroops[0]);
    const baseHealth = troop ? toNum(troop.health) : 0;
    const effHealth = baseHealth * (1 + toNum(firstHealthBonusPct) / 100);
    const dmg = toNum(cit.firstStrikeDamage);
    if (effHealth <= 0) return 0;
    return Math.floor(dmg / effHealth);
  }, [cit, troopByName, strikerTroops, firstHealthBonusPct]);

  const wallKiller = useMemo(() => {
    if (!cit) return { effBonus: 0, requiredTroops: 0 };
    const troop = troopByName.get(wallKillerTroop);
    const baseStrength = troop ? toNum(troop.strength) : 0;
    const fort = troop?.fortBonus !== undefined ? toNum(troop.fortBonus) : 0;
    const effBonus = toNum(wallKillerBonusPct) + fort;
    const dmgPerTroop = baseStrength * (1 + effBonus / 100) * 20;
    const wallHP = toNum(cit.wallHP);
    const requiredTroops = dmgPerTroop > 0 ? Math.ceil(wallHP / dmgPerTroop) : 0;
    return { effBonus, requiredTroops };
  }, [cit, wallKillerTroop, wallKillerBonusPct, troopByName]);

  const perStriker = useMemo(() => {
    if (!cit || !targets || targets.length !== 9) return [];
    return STRIKER_LABELS.map((label, idx) => {
      const troopName = strikerTroops[idx];
      const troop = troopByName.get(troopName);
      let effBonus = toNum(strikerBonusPct[idx]);
      if (troopName && additionalBonus[troopName] !== undefined) effBonus += toNum(additionalBonus[troopName]);
      if (troopName && mode === MODE_WITH && idx === 1 && phoenixExtra[troopName] !== undefined) effBonus += toNum(phoenixExtra[troopName]);
      
      const baseStrength = troop ? toNum(troop.strength) : 0;
      const dmgPerTroop = baseStrength * (1 + effBonus / 100);
      const targetHP = toNum(targets[idx]);
      let required = dmgPerTroop > 0 ? Math.floor(targetHP / dmgPerTroop) : 0;
      if (idx === 0 && dmgPerTroop > 0) required += firstDeaths;
      return { idx, label, troopName, effBonus, requiredTroops: required };
    });
  }, [cit, targets, strikerTroops, strikerBonusPct, troopByName, additionalBonus, phoenixExtra, mode, firstDeaths]);

  const showResults = () => {
    const counts = new Map();
    const add = (name, n) => { if (!name || !Number.isFinite(n)) return; const k = normName(name); counts.set(k, (counts.get(k) || 0) + Math.floor(n)); };
    if (wallKillerTroop && wallKiller?.requiredTroops) add(wallKillerTroop, wallKiller.requiredTroops);
    for (const s of perStriker) { if (s?.troopName && s?.requiredTroops) add(s.troopName, s.requiredTroops); }
    
    const ordered = [];
    for (const name of RESULT_ORDER) { const k = normName(name); if (counts.has(k)) ordered.push({ troop: name, required: counts.get(k) }); }
    
    setCalcOutput({ modeLabel: mode === MODE_WITH ? "With M8/M9" : "Without M8/M9", citadelLabel: `Elven ${citadelLevel}`, troops: ordered });
    setResultsOpen(true);
  };

  /* =========================================
     RENDERING - NOVI IZGLED (GAME EDITION)
     ========================================= */
  return (
    <div style={{
      minHeight: "100vh",
      backgroundImage: `url('./bg.jpg')`, // Očekuje sliku u public/bg.jpg
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      backgroundColor: "#111", // Fallback boja
      color: THEME.colors.text,
      fontFamily: "'Roboto', sans-serif",
      paddingBottom: "120px",
      boxSizing: "border-box"
    }}>
      {/* Overlay za čitljivost */}
      <div style={{
        position: "fixed", top:0, left:0, right:0, bottom:0,
        background: "rgba(0,0,0,0.6)", pointerEvents: "none", zIndex:0
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "600px", margin: "0 auto", padding: "20px 16px" }}>
        
        {/* TITLE */}
        <div style={{ textAlign: "center", marginBottom: "32px", marginTop: "10px" }}>
           <h1 style={{ 
             margin: 0, 
             fontFamily: "'Cinzel', serif", 
             color: THEME.colors.goldBright, 
             fontSize: "32px", 
             textShadow: "0 4px 10px rgba(0,0,0,0.8)" 
           }}>
             CITADEL<br/>CALCULATOR
           </h1>
           <div style={{ color: "#aaa", fontSize: "12px", letterSpacing: "2px", marginTop: "4px" }}>
             COMMANDER'S TOOL
           </div>
        </div>

        {/* SETUP PANEL */}
        <GameCard title="Battle Settings">
          <button onClick={() => setHelpOpen(true)} style={{
             width:"100%", padding:"10px", marginBottom:"16px", borderRadius:"6px",
             border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.05)", color: "#ddd", cursor:"pointer"
          }}>
             ℹ️ Instructions
          </button>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
             <div>
                <label style={{ fontSize: "11px", color: THEME.colors.textDim, display:"block", marginBottom:"4px" }}>MODE</label>
                <GameSelect value={mode} onChange={(e) => handleModeChange(e.target.value)}>
                   <option value={MODE_WITHOUT}>Without M8/M9</option>
                   <option value={MODE_WITH}>With M8/M9</option>
                </GameSelect>
             </div>
             <div>
                <label style={{ fontSize: "11px", color: THEME.colors.textDim, display:"block", marginBottom:"4px" }}>CITADEL LEVEL</label>
                <GameSelect value={citadelLevel} onChange={(e) => setCitadelLevel(e.target.value)}>
                   {citadelKeys.map(k => <option key={k} value={k}>{k}</option>)}
                </GameSelect>
             </div>
          </div>
          <button onClick={resetSelections} style={{
             width:"100%", padding:"12px", borderRadius:"6px",
             border: "none", background: "rgba(229, 62, 62, 0.2)", color: "#fc8181", 
             fontWeight: "bold", cursor:"pointer", textTransform: "uppercase", fontSize: "12px"
          }}>
             Reset All Troops
          </button>
        </GameCard>

        {/* WALL KILLER */}
        <GameCard title="Wall Breaker" isSpecial>
           <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "12px" }}>
              {/* Ikona */}
              <div style={{ 
                 width: "56px", height: "56px", borderRadius: "8px", border: `1px solid ${THEME.colors.gold}`,
                 background: "#000", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" 
              }}>
                 {iconSrcForTroop(wallKillerTroop) ? 
                    <img src={iconSrcForTroop(wallKillerTroop)} width="100%" height="100%" style={{objectFit:"cover"}} alt="" /> 
                    : <span style={{fontSize:"24px"}}>🛡️</span>
                 }
              </div>
              
              <div style={{ flex: 1 }}>
                 <GameSelect value={wallKillerTroop} onChange={(e) => setWallKillerTroop(e.target.value)}>
                    {wallKillerPool.map(t => <option key={t} value={t}>{t}</option>)}
                 </GameSelect>
              </div>
           </div>

           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", alignItems: "end" }}>
              <div>
                 <label style={{ fontSize: "11px", color: THEME.colors.textDim, display:"block", marginBottom:"4px" }}>STRENGTH BONUS %</label>
                 <GameInput type="number" step="any" inputMode="decimal" placeholder="0" value={wallKillerBonusPct} onChange={(e) => setWallKillerBonusPct(e.target.value)} />
              </div>
              <div style={{ textAlign: "right", paddingBottom: "8px" }}>
                 <div style={{ fontSize: "11px", color: THEME.colors.textDim }}>REQUIRED</div>
                 <div style={{ fontSize: "20px", fontWeight: "bold", color: THEME.colors.goldBright }}>{fmtInt(wallKiller.requiredTroops)}</div>
              </div>
           </div>
        </GameCard>

        {/* STRIKERS */}
        {perStriker.map((s) => {
           const isFirst = s.idx === 0;
           const opts = optionsForIdx(s.idx);
           
           return (
             <GameCard key={s.idx} title={`${s.idx + 1}. ${s.label}`}>
                <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                   {/* Ikona */}
                   <div style={{ 
                      width: "50px", height: "50px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.2)",
                      background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0
                   }}>
                      {iconSrcForTroop(s.troopName) ? 
                         <img src={iconSrcForTroop(s.troopName)} width="100%" height="100%" style={{objectFit:"cover"}} alt="" /> 
                         : <span style={{fontSize:"20px", opacity:0.3}}>⚔️</span>
                      }
                   </div>
                   <div style={{ flex: 1 }}>
                      <GameSelect value={strikerTroops[s.idx]} onChange={(e) => handleTroopChange(s.idx, e.target.value)}>
                         {opts.map(o => <option key={o || "blank"} value={o}>{o || "— Select —"}</option>)}
                      </GameSelect>
                   </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: isFirst ? "1fr 1fr 1fr" : "1fr 1fr", gap: "10px" }}>
                   {isFirst && (
                      <div>
                         <label style={{ fontSize: "10px", color: "#fc8181", fontWeight:"bold", display:"block", marginBottom:"2px" }}>HP BONUS %</label>
                         <GameInput type="number" step="any" inputMode="decimal" value={firstHealthBonusPct} onChange={(e) => setFirstHealthBonusPct(e.target.value)} style={{borderColor: "rgba(252, 129, 129, 0.5)"}} />
                      </div>
                   )}
                   <div>
                      <label style={{ fontSize: "10px", color: "#63b3ed", fontWeight:"bold", display:"block", marginBottom:"2px" }}>STR BONUS %</label>
                      <GameInput type="number" step="any" inputMode="decimal" value={strikerBonusPct[s.idx]} onChange={(e) => setBonusAt(s.idx, e.target.value)} style={{borderColor: "rgba(99, 179, 237, 0.5)"}} />
                   </div>
                   
                   <div style={{ background: "rgba(255,255,255,0.05)", borderRadius:"6px", padding:"4px 8px", display:"flex", flexDirection:"column", justifyContent:"center" }}>
                      <div style={{ fontSize: "10px", color: "#aaa" }}>REQUIRED</div>
                      <div style={{ fontSize: "16px", fontWeight: "bold", color: "#fff" }}>{fmtInt(s.requiredTroops)}</div>
                      {isFirst && <div style={{ fontSize: "9px", color: "#fc8181" }}>Loss: {fmtInt(firstDeaths)}</div>}
                   </div>
                </div>
             </GameCard>
           );
        })}

        {/* BOTTOM ACTION BAR */}
        <div style={{
           position: "fixed", bottom: 0, left: 0, right: 0,
           padding: "16px",
           background: "rgba(10, 10, 12, 0.95)",
           borderTop: `1px solid ${THEME.colors.gold}`,
           backdropFilter: "blur(10px)",
           zIndex: 100
        }}>
           <div style={{ maxWidth: "600px", margin: "0 auto" }}>
             <button onClick={showResults} style={{
                width: "100%", padding: "16px", borderRadius: "8px", border: "none",
                background: `linear-gradient(135deg, ${THEME.colors.goldDim} 0%, ${THEME.colors.gold} 100%)`,
                color: "#000", fontWeight: "900", fontSize: "18px", letterSpacing: "1px",
                boxShadow: "0 0 20px rgba(197, 160, 89, 0.4)", cursor: "pointer", fontFamily: "'Cinzel', serif"
             }}>
                CALCULATE RESULTS
             </button>
           </div>
        </div>

        {/* WARNING MODAL */}
        {warningMsg && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
             <GameCard title="⚠️ Warning">
                <div style={{ whiteSpace: "pre-wrap", marginBottom: "20px", color: "#fff" }}>{warningMsg}</div>
                <button onClick={() => setWarningMsg("")} style={{ width:"100%", padding:"12px", background: THEME.colors.gold, border:"none", borderRadius:"6px", fontWeight:"bold" }}>OK</button>
             </GameCard>
          </div>
        )}

        {/* RESULTS MODAL */}
        {resultsOpen && calcOutput && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setResultsOpen(false)}>
             <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: "450px", maxHeight: "85vh", overflowY: "auto" }}>
                <GameCard title="Battle Report" isSpecial>
                   <div style={{ textAlign: "center", marginBottom: "16px", color: "#aaa", fontSize: "14px" }}>
                      {calcOutput.citadelLabel} | {calcOutput.modeLabel}
                   </div>
                   
                   <div style={{ display: "grid", gap: "8px" }}>
                      {calcOutput.troops.map((t, i) => (
                         <div key={i} style={{ 
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            background: "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "6px", borderLeft: `3px solid ${THEME.colors.gold}`
                         }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                               {iconSrcForTroop(t.troop) && <img src={iconSrcForTroop(t.troop)} width="32" height="32" style={{borderRadius:4}} alt=""/>}
                               <span style={{ fontWeight: "bold", color: "#eee" }}>{t.troop}</span>
                            </div>
                            <span style={{ fontSize: "18px", fontWeight: "bold", color: THEME.colors.goldBright }}>{fmtInt(t.required)}</span>
                         </div>
                      ))}
                   </div>
                   
                   <button onClick={async () => {
                      const text = calcOutput.troops.map(t => `${t.troop}: ${fmtInt(t.required)}`).join("\n");
                      const ok = await copyToClipboard(text);
                      setCopyNotice(ok ? "Copied!" : "Error");
                      setTimeout(() => setCopyNotice(""), 2000);
                   }} style={{ 
                      marginTop: "20px", width: "100%", padding: "12px", background: "#444", color: "#fff", border: "1px solid #666", borderRadius: "6px", cursor: "pointer" 
                   }}>
                      {copyNotice || "📋 Copy to Clipboard"}
                   </button>
                   
                   <button onClick={() => setResultsOpen(false)} style={{ marginTop: "10px", width: "100%", padding: "12px", background: "transparent", color: "#aaa", border: "none", cursor: "pointer" }}>
                      Close
                   </button>
                </GameCard>
             </div>
          </div>
        )}

        {/* HELP MODAL */}
        {helpOpen && (
           <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setHelpOpen(false)}>
              <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: "450px", maxHeight: "80vh", overflowY: "auto" }}>
                 <GameCard title="Instructions">
                    <div style={{ fontSize: "14px", lineHeight: "1.6", color: "#ccc" }}>
                       <p><strong style={{color:THEME.colors.gold}}>Goal:</strong> Calculate exact troops needed for minimal losses.</p>
                       <p><strong style={{color:THEME.colors.gold}}>Rule #1:</strong> Only the <strong>First Striker</strong> should take damage (Health Bonus is key!).</p>
                       <p><strong style={{color:THEME.colors.gold}}>How to use:</strong> Select Citadel level, choose troops for each slot, and enter your bonuses from a test report.</p>
                    </div>
                    <button onClick={() => setHelpOpen(false)} style={{ marginTop: "20px", width: "100%", padding: "10px", background: THEME.colors.gold, border: "none", borderRadius: "6px", fontWeight: "bold" }}>Got it</button>
                 </GameCard>
              </div>
           </div>
        )}

      </div>
    </div>
  );
}
