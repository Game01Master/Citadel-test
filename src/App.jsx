import React, { useMemo, useState, useEffect, useRef } from "react";
import TB from "./tb_data.json";

/* =========================================
   🎨 TEMA I STILOVI
   ========================================= */

const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Roboto:wght@400;500;700&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

const THEME = {
  colors: {
    gold: "#C5A059",
    goldDim: "#8b6508",
    goldBright: "#FFD700",
    darkBg: "rgba(18, 18, 24, 0.90)",
    cardBg: "rgba(30, 30, 35, 0.8)",
    inputBg: "rgba(0, 0, 0, 0.5)",
    text: "#E0E0E0",
    textDim: "#A0AEC0",
    accent: "#4299e1",
    danger: "#e53e3e",
  },
  shadows: {
    card: "0 8px 32px 0 rgba(0, 0, 0, 0.6)",
    glow: "0 0 15px rgba(197, 160, 89, 0.25)"
  }
};

/* =========================================
   🧩 CUSTOM KOMPONENTE (Dropdown s ikonama)
   ========================================= */

// Logika za ikone
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

function iconSrcForTroop(name) {
  const file = ICON_FILE_MAP[name];
  if (!file) return null;
  return `./icons/${file}`; 
}

// Custom Select Component (Da možemo imati slike u dropdownu)
const CustomTroopSelect = ({ value, options, onChange, placeholder = "Select Troop" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Zatvori ako se klikne izvan
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const selectedIcon = iconSrcForTroop(value);

  return (
    <div ref={wrapperRef} style={{ position: "relative", width: "100%" }}>
      {/* Trigger Button */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          minHeight: "48px",
          padding: "8px 12px",
          background: THEME.colors.inputBg,
          border: `1px solid ${isOpen ? THEME.colors.gold : "rgba(255,255,255,0.2)"}`,
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          transition: "all 0.2s"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: value ? THEME.colors.text : THEME.colors.textDim }}>
          {selectedIcon ? (
            <img src={selectedIcon} width="32" height="32" style={{ borderRadius: "4px" }} alt="" />
          ) : (
            <div style={{ width: 32, height: 32, borderRadius: 4, background: "rgba(255,255,255,0.1)" }} />
          )}
          <span style={{ fontWeight: value ? "bold" : "normal", fontSize: "15px" }}>{value || placeholder}</span>
        </div>
        <span style={{ color: THEME.colors.gold }}>▼</span>
      </div>

      {/* Dropdown List */}
      {isOpen && (
        <div style={{
          position: "absolute",
          top: "110%",
          left: 0,
          right: 0,
          background: "#1a1a20",
          border: `1px solid ${THEME.colors.goldDim}`,
          borderRadius: "8px",
          maxHeight: "300px",
          overflowY: "auto",
          zIndex: 1000,
          boxShadow: "0 10px 30px rgba(0,0,0,0.8)"
        }}>
          {options.map((opt) => {
            if (!opt) return null; // Skip blank options in visual list
            const icon = iconSrcForTroop(opt);
            return (
              <div
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                style={{
                  padding: "10px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  background: value === opt ? "rgba(197, 160, 89, 0.2)" : "transparent"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                onMouseLeave={(e) => e.currentTarget.style.background = value === opt ? "rgba(197, 160, 89, 0.2)" : "transparent"}
              >
                {icon && <img src={icon} width="40" height="40" style={{ borderRadius: "6px" }} alt="" />}
                <span style={{ color: "#fff", fontWeight: "500" }}>{opt}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const GameCard = ({ title, children, isSpecial }) => (
  <div style={{
    background: THEME.colors.cardBg,
    backdropFilter: "blur(12px)",
    border: `1px solid ${isSpecial ? THEME.colors.gold : "rgba(255,255,255,0.1)"}`,
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: isSpecial ? THEME.shadows.glow : THEME.shadows.card,
    position: "relative"
  }}>
    <div style={{
      fontFamily: "'Cinzel', serif",
      fontWeight: 700,
      fontSize: "18px",
      color: isSpecial ? THEME.colors.goldBright : THEME.colors.text,
      marginBottom: "20px",
      textTransform: "uppercase",
      letterSpacing: "1px",
      borderBottom: `1px solid ${isSpecial ? THEME.colors.goldDim : "rgba(255,255,255,0.1)"}`,
      paddingBottom: "10px",
      display: "flex", justifyContent: "space-between", alignItems: "center"
    }}>
      {title}
      {isSpecial && <span>🛡️</span>}
    </div>
    {children}
  </div>
);

// Novi stilizirani input za bonuse
const BonusInput = (props) => (
  <div style={{ position: "relative" }}>
    <input 
      {...props} 
      type="number"
      step="any" 
      inputMode="decimal"
      style={{
        width: "100%",
        padding: "12px",
        paddingRight: "30px", // Mjesto za % znak
        background: THEME.colors.inputBg,
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: "8px",
        color: "#fff",
        fontSize: "16px",
        fontWeight: "bold",
        fontFamily: "'Roboto', sans-serif",
        textAlign: "center",
        outline: "none",
        ...props.style
      }}
      onFocus={(e) => {
         e.target.style.borderColor = THEME.colors.gold;
         e.target.style.background = "rgba(0,0,0,0.8)";
         if(props.onFocus) props.onFocus(e);
      }}
      onBlur={(e) => {
         e.target.style.borderColor = "rgba(255,255,255,0.2)";
         e.target.style.background = THEME.colors.inputBg;
      }}
    />
    <span style={{ 
      position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", 
      color: THEME.colors.textDim, fontSize: "14px", pointerEvents: "none" 
    }}>%</span>
  </div>
);


/* =========================================
   ⚙️ LOGIKA KALKULATORA (ORIGINALNA)
   ========================================= */

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

function toNum(v) { const n = Number(v); return Number.isFinite(n) ? n : 0; }
function fmtInt(n) { if (!Number.isFinite(n)) return "-"; return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(Math.floor(n)); }
function normName(s) { return String(s ?? "").toLowerCase().replace(/\s+/g, " ").trim(); }
async function copyToClipboard(text) { try { await navigator.clipboard.writeText(text); return true; } catch { return false; } }

export default function App() {
  const citadelKeys = Object.keys(TB.citadels ?? {});
  const troops = TB.troops ?? [];

  const canon = useMemo(() => {
    const m = new Map();
    for (const t of troops) m.set(normName(t.name), t.name);
    if (m.has(normName("Royal Lion I"))) m.set(normName("Royla Lion I"), m.get(normName("Royal Lion I")));
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
    return Number(t?.baseStrength ?? t?.base_strength ?? t?.strength ?? t?.base ?? 0) || 0;
  };

  const getBaseHealth = (troopName) => {
    if (!troopName) return 0;
    const exact = canon.get(normName(troopName)) || troopName;
    const t = troopByName.get(exact);
    return Number(t?.baseHealth ?? t?.base_health ?? t?.health ?? t?.hp ?? 0) || 0;
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
           // WARNING PORUKA - KOPIRANA OD TEBE
          const label = STRIKER_LABELS[idx] || "Striker";
          setWarningMsg(
            `${label} (${picked}) has higher BASE strength (${fmtInt(pickedS)}) and BASE health (${fmtInt(pickedH)}) than your First striker (${first}, ${fmtInt(firstS)} / ${fmtInt(firstH)}).\n\nChoose a stronger First striker troops!!`
          );
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
     APP RENDER (VISUALS)
     ========================================= */
  return (
    <div style={{
      minHeight: "100vh",
      backgroundImage: `url('./bg.jpg')`, 
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      backgroundColor: "#111", 
      color: THEME.colors.text,
      fontFamily: "'Roboto', sans-serif",
      paddingBottom: "120px",
      boxSizing: "border-box"
    }}>
      <div style={{ position: "fixed", top:0, left:0, right:0, bottom:0, background: "rgba(0,0,0,0.6)", pointerEvents: "none", zIndex:0 }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "600px", margin: "0 auto", padding: "20px 16px" }}>
        
        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: "32px", marginTop: "10px" }}>
           <h1 style={{ margin: 0, fontFamily: "'Cinzel', serif", color: THEME.colors.goldBright, fontSize: "32px", textShadow: "0 4px 10px rgba(0,0,0,0.8)" }}>
             CITADEL<br/>CALCULATOR
           </h1>
        </div>

        {/* SETTINGS CARD */}
        <GameCard title="Battle Settings">
          <button onClick={() => setHelpOpen(true)} style={{
             width:"100%", padding:"12px", marginBottom:"20px", borderRadius:"8px",
             border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.05)", color: "#ddd", cursor:"pointer",
             display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontWeight: "bold"
          }}>
             <span>ℹ️</span> Instructions
          </button>

          <div style={{ display: "grid", gap: "16px", marginBottom: "20px" }}>
             <div>
                <label style={{ fontSize: "12px", color: THEME.colors.textDim, display:"block", marginBottom:"6px", textTransform:"uppercase" }}>Mode</label>
                <select 
                   value={mode} onChange={(e) => handleModeChange(e.target.value)}
                   style={{ width: "100%", padding: "12px", background: THEME.colors.inputBg, border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", color: "#fff", fontSize:"16px", outline:"none" }}
                >
                   <option value={MODE_WITHOUT}>Without M8/M9</option>
                   <option value={MODE_WITH}>With M8/M9</option>
                </select>
             </div>
             <div>
                <label style={{ fontSize: "12px", color: THEME.colors.textDim, display:"block", marginBottom:"6px", textTransform:"uppercase" }}>Citadel Level</label>
                <select 
                   value={citadelLevel} onChange={(e) => setCitadelLevel(e.target.value)}
                   style={{ width: "100%", padding: "12px", background: THEME.colors.inputBg, border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", color: "#fff", fontSize:"16px", outline:"none" }}
                >
                   {citadelKeys.map(k => <option key={k} value={k}>Elven {k}</option>)}
                </select>
             </div>
          </div>
          
          <button onClick={resetSelections} style={{
             width:"100%", padding:"14px", borderRadius:"8px",
             border: `1px solid ${THEME.colors.danger}`, background: "rgba(229, 62, 62, 0.15)", color: "#fc8181", 
             fontWeight: "bold", cursor:"pointer", textTransform: "uppercase", fontSize: "13px"
          }}>
             Reset All Troops
          </button>
        </GameCard>

        {/* WALL KILLER CARD */}
        <GameCard title="Wall Breaker" isSpecial>
           <div style={{ marginBottom: "16px" }}>
              <CustomTroopSelect value={wallKillerTroop} options={wallKillerPool} onChange={setWallKillerTroop} />
           </div>

           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", alignItems: "end" }}>
              <div>
                 <label style={{ fontSize: "11px", color: THEME.colors.textDim, display:"block", marginBottom:"6px", fontWeight:"bold" }}>STRENGTH BONUS</label>
                 <BonusInput value={wallKillerBonusPct} onChange={(e) => setWallKillerBonusPct(e.target.value)} placeholder="0" />
              </div>
              <div style={{ textAlign: "right", paddingBottom: "10px", background:"rgba(0,0,0,0.3)", padding:"10px", borderRadius:"8px" }}>
                 <div style={{ fontSize: "11px", color: THEME.colors.textDim }}>REQUIRED</div>
                 <div style={{ fontSize: "22px", fontWeight: "bold", color: THEME.colors.goldBright }}>{fmtInt(wallKiller.requiredTroops)}</div>
              </div>
           </div>
        </GameCard>

        {/* STRIKERS CARDS */}
        {perStriker.map((s) => {
           const isFirst = s.idx === 0;
           const opts = optionsForIdx(s.idx);
           
           return (
             <GameCard key={s.idx} title={`${s.idx + 1}. ${s.label}`}>
                <div style={{ marginBottom: "16px" }}>
                   <CustomTroopSelect value={strikerTroops[s.idx]} options={opts} onChange={(v) => handleTroopChange(s.idx, v)} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: isFirst ? "1fr 1fr" : "1fr", gap: "16px", marginBottom: "16px" }}>
                   {isFirst && (
                      <div>
                         <label style={{ fontSize: "11px", color: "#fc8181", fontWeight:"bold", display:"block", marginBottom:"6px" }}>HP BONUS</label>
                         <BonusInput value={firstHealthBonusPct} onChange={(e) => setFirstHealthBonusPct(e.target.value)} placeholder="0" style={{borderColor: "rgba(252, 129, 129, 0.5)"}} />
                      </div>
                   )}
                   <div>
                      <label style={{ fontSize: "11px", color: "#63b3ed", fontWeight:"bold", display:"block", marginBottom:"6px" }}>STR BONUS</label>
                      <BonusInput value={strikerBonusPct[s.idx]} onChange={(e) => setBonusAt(s.idx, e.target.value)} placeholder="0" style={{borderColor: "rgba(99, 179, 237, 0.5)"}} />
                   </div>
                </div>
                
                <div style={{ background: "rgba(255,255,255,0.05)", borderRadius:"8px", padding:"12px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                   <div>
                      <div style={{ fontSize: "11px", color: THEME.colors.textDim }}>EFFECTIVE BONUS</div>
                      <div style={{ fontSize: "14px", fontWeight: "bold", color: "#fff" }}>{fmtInt(s.effBonus)}%</div>
                   </div>
                   <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "11px", color: THEME.colors.textDim }}>REQUIRED</div>
                      <div style={{ fontSize: "20px", fontWeight: "bold", color: THEME.colors.goldBright }}>{fmtInt(s.requiredTroops)}</div>
                      {isFirst && <div style={{ fontSize: "10px", color: "#fc8181", marginTop: "2px" }}>Losses: {fmtInt(firstDeaths)}</div>}
                   </div>
                </div>
             </GameCard>
           );
        })}

        {/* BOTTOM BAR */}
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "16px", background: "rgba(10, 10, 12, 0.95)", borderTop: `1px solid ${THEME.colors.gold}`, backdropFilter: "blur(10px)", zIndex: 100 }}>
           <div style={{ maxWidth: "600px", margin: "0 auto" }}>
             <button onClick={showResults} style={{
                width: "100%", padding: "16px", borderRadius: "10px", border: "none",
                background: `linear-gradient(135deg, ${THEME.colors.goldDim} 0%, ${THEME.colors.gold} 100%)`,
                color: "#000", fontWeight: "900", fontSize: "18px", letterSpacing: "1px",
                boxShadow: "0 0 20px rgba(197, 160, 89, 0.4)", cursor: "pointer", fontFamily: "'Cinzel', serif"
             }}>
                CALCULATE RESULTS
             </button>
           </div>
        </div>

        {/* WARNING MODAL (TEXT IDENTICAL TO ORIGINAL) */}
        {warningMsg && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
             <GameCard title="⚠️ Invalid Striker Order">
                <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, color: "#fff", marginBottom: "24px" }}>{warningMsg}</div>
                <button onClick={() => setWarningMsg("")} style={{ width:"100%", padding:"14px", background: THEME.colors.gold, border:"none", borderRadius:"8px", fontWeight:"bold", fontSize: "16px" }}>OK</button>
             </GameCard>
          </div>
        )}

        {/* RESULTS MODAL */}
        {resultsOpen && calcOutput && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setResultsOpen(false)}>
             <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: "450px", maxHeight: "85vh", overflowY: "auto" }}>
                <GameCard title="Battle Report" isSpecial>
                   <div style={{ textAlign: "center", marginBottom: "20px", background: "rgba(255,255,255,0.05)", padding:"10px", borderRadius:"8px" }}>
                      <div style={{color: THEME.colors.textDim, fontSize:"12px"}}>SCENARIO</div>
                      <div style={{fontWeight:"bold", color:"#fff"}}>{calcOutput.citadelLabel} | {calcOutput.modeLabel}</div>
                   </div>
                   
                   <div style={{ display: "grid", gap: "10px" }}>
                      {calcOutput.troops.map((t, i) => (
                         <div key={i} style={{ 
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            background: "rgba(20, 20, 25, 0.8)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)",
                            boxShadow: "0 2px 5px rgba(0,0,0,0.3)"
                         }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                               {iconSrcForTroop(t.troop) && <img src={iconSrcForTroop(t.troop)} width="40" height="40" style={{borderRadius:6}} alt=""/>}
                               <span style={{ fontWeight: "bold", color: "#eee" }}>{t.troop}</span>
                            </div>
                            <span style={{ fontSize: "20px", fontWeight: "bold", color: THEME.colors.goldBright }}>{fmtInt(t.required)}</span>
                         </div>
                      ))}
                   </div>
                   
                   <button onClick={async () => {
                      const text = calcOutput.troops.map(t => `${t.troop}: ${fmtInt(t.required)}`).join("\n");
                      const ok = await copyToClipboard(text);
                      setCopyNotice(ok ? "✅ Copied!" : "❌ Error");
                      setTimeout(() => setCopyNotice(""), 2000);
                   }} style={{ 
                      marginTop: "24px", width: "100%", padding: "14px", background: THEME.colors.accent, color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight:"bold", fontSize:"16px" 
                   }}>
                      {copyNotice || "📄 Copy List to Clipboard"}
                   </button>
                </GameCard>
             </div>
          </div>
        )}

        {/* HELP MODAL (TEXT IDENTICAL TO ORIGINAL) */}
        {helpOpen && (
           <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setHelpOpen(false)}>
              <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: "500px", maxHeight: "85vh", overflowY: "auto" }}>
                 <GameCard title="ℹ️ Instructions & Help">
                    <div style={{ color: THEME.colors.text, lineHeight: 1.6, fontSize: 15, display: "grid", gap: 20 }}>
                        <div>
                            <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: THEME.colors.accent }}>🎯 Goal</div>
                            <div style={{ color: THEME.colors.textDim }}>
                            Use the correct troops and bonuses to minimize losses when attacking a Citadel.
                            I took care of the proper troops selection.
                            </div>
                        </div>

                        <div>
                            <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: THEME.colors.danger }}>❗ Most Important Rule</div>
                            <div style={{ color: THEME.colors.textDim, borderLeft: `4px solid ${THEME.colors.danger}`, paddingLeft: 12 }}>
                            Maximize <b style={{ color: THEME.colors.text }}>First Striker Health</b>.
                            In a proper attack, the First Striker is the only troop group that should take losses.
                            If you are losing other troops, check your bonuses or troop counts.
                            <br /><br />
                            The number of <b style={{ color: THEME.colors.text }}>FIRST STRIKER</b> troops
                            <b style={{ color: THEME.colors.text }}> CAN</b> be higher than calculated.
                            All other troops <b style={{ color: THEME.colors.text }}>MUST</b> be used in the exact number
                            as calculated.
                            </div>
                        </div>

                        <div>
                            <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: THEME.colors.accent }}>🦅 First Striker</div>
                            <div style={{ color: THEME.colors.textDim }}>
                            Must be the strongest <b style={{ color: THEME.colors.text }}>flying Guardsmen</b>:
                            <b style={{ color: THEME.colors.text }}> Corax</b> or <b style={{ color: THEME.colors.text }}> Griffin</b>.
                            </div>
                        </div>

                        <div>
                            <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: THEME.colors.accent }}>🦸 Captains</div>
                            <div style={{ color: THEME.colors.textDim }}>
                            Recommended:
                            <b style={{ color: THEME.colors.text }}> Wu Zetian, Brunhild, Skadi, Beowulf, Aydae, Ramses, Sofia</b>.
                            </div>
                        </div>

                        <div>
                            <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: THEME.colors.accent }}>✨ Artifacts</div>
                            <div style={{ color: THEME.colors.textDim }}>
                            Use artifacts that increase Health for
                            <b style={{ color: THEME.colors.text }}> Flying</b>,
                            <b style={{ color: THEME.colors.text }}> Guardsmen</b>,
                            or the <b style={{ color: THEME.colors.text }}> Army</b>.
                            (e.g., <b style={{ color: THEME.colors.text }}>Valkyrie Diadem, Medallion, Belt, Flask</b>).
                            </div>
                        </div>

                        <div>
                            <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: THEME.colors.accent }}>🔄 Recalculate</div>
                            <div style={{ color: THEME.colors.textDim }}>
                            After ANY strength bonus change, enter new bonuses and press
                            <b style={{ color: THEME.colors.text }}> Calculate</b> again. Small changes matter!
                            </div>
                        </div>

                        <div>
                            <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: THEME.colors.accent }}>❓ How to find bonuses?</div>
                            <div style={{ color: THEME.colors.textDim }}>
                            Attack a level 10 Citadel with <b style={{ color: THEME.colors.text }}>10 of each selected troop type</b>.
                            Copy the bonuses from the attack report into the calculator.
                            </div>
                        </div>
                    </div>
                 </GameCard>
              </div>
           </div>
        )}
      </div>
    </div>
  );
}
