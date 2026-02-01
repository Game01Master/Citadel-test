import React, { useMemo, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import TB from "./tb_data.json";

/* =========================================
   🎨 TEMA I DIZAJN (GOLD PRO GAMING)
   ========================================= */

// Učitavanje fontova
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Inter:wght@400;600;800&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

const THEME = {
  colors: {
    gold: "#D4AF37",        // Glavna metalik zlatna
    goldDim: "#8a6d1c",     // Tamna zlatna
    goldBright: "#FFD700",  // Sjajna zlatna za tekst
    text: "#F5F5F5",        // Svijetlo siva/bijela
    textDim: "#B0B0B0",     // Prigušeni tekst
    accent: "#4299e1",      // Plava za info
    danger: "#e53e3e",      // Crvena za greške
    cardBg: "rgba(22, 26, 34, 0.95)", // Tamna pozadina kartica
    inputBg: "rgba(0, 0, 0, 0.6)",
    btnGradient: "linear-gradient(135deg, #D4AF37 0%, #8a6d1c 100%)"
  }
};

/* =========================================
   CONSTANTS & DATA (KOMPLETNE LISTE)
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
  "Ariel", "Josephine II", "Josephine I", "Siege Ballistae VII",
  "Siege Ballistae VI", "Catapult V", "Catapult IV",
];

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

const ICON_BASE = "./";

/* =========================================
   HELPER FUNCTIONS
   ========================================= */

function toNum(v) { const n = Number(v); return Number.isFinite(n) ? n : 0; }
function fmtInt(n) { if (!Number.isFinite(n)) return "-"; return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.floor(n)); }
function normName(s) { return String(s ?? "").toLowerCase().replace(/\s+/g, " ").trim(); }

function iconSrcForTroop(name) {
  const file = ICON_FILE_MAP[name];
  if (!file) return null;
  return `${ICON_BASE}icons/${encodeURIComponent(file)}`;
}

async function copyToClipboard(text) {
  try { await navigator.clipboard.writeText(text); return true; } 
  catch { 
    try {
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.left = "-9999px";
      document.body.appendChild(ta); ta.select(); document.execCommand("copy");
      document.body.removeChild(ta); return true;
    } catch { return false; }
  }
}

/* =========================================
   🧩 UI KOMPONENTE
   ========================================= */

const Portal = ({ children }) => {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
};

const CustomSelect = ({ value, options, onChange, labelTransform }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef(null);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleScroll = () => { if(isOpen) setIsOpen(false); };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  useEffect(() => {
    const handleResize = () => setIsOpen(false);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const displayLabel = labelTransform ? labelTransform(value) : (value || "Select");
  const hasIcon = iconSrcForTroop(value);

  return (
    <>
      <div 
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%", minHeight: "54px", padding: "8px 12px", 
          background: "linear-gradient(180deg, rgba(30,30,35,0.9) 0%, rgba(10,10,15,0.95) 100%)",
          border: `1px solid ${isOpen ? THEME.colors.gold : "rgba(255,255,255,0.15)"}`,
          boxShadow: isOpen ? `0 0 15px ${THEME.colors.goldDim}` : "inset 0 2px 4px rgba(0,0,0,0.5)", 
          borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "space-between", 
          cursor: "pointer", boxSizing: "border-box", transition: "all 0.2s ease"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", color: value ? "#fff" : "#888", overflow: "hidden" }}>
          {hasIcon ? (
            <img src={hasIcon} width="38" height="38" style={{ borderRadius: "6px", border: "1px solid #444" }} alt="" /> 
          ) : null}
          <span style={{ fontWeight: "700", fontSize: "15px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: "'Inter', sans-serif", paddingLeft: hasIcon ? 0 : 4 }}>
            {displayLabel}
          </span>
        </div>
        <span style={{ color: THEME.colors.gold, fontSize: "12px", marginRight: 4 }}>{isOpen ? "▲" : "▼"}</span>
      </div>

      {isOpen && (
        <Portal>
          <div style={{position: "fixed", inset: 0, zIndex: 9998, cursor: "default"}} onClick={() => setIsOpen(false)} />
          <div style={{
            position: "absolute", top: coords.top, left: coords.left, width: coords.width,
            background: "#121214", border: `1px solid ${THEME.colors.gold}`, borderRadius: "8px",
            maxHeight: "300px", overflowY: "auto", zIndex: 9999,
            boxShadow: "0 10px 40px rgba(0,0,0,0.95), 0 0 15px rgba(197, 160, 89, 0.1)",
            display: "flex", flexDirection: "column"
          }}>
            {options.map((opt) => {
               const rawValue = typeof opt === 'object' ? opt.value : opt;
               const display = labelTransform ? labelTransform(rawValue) : (rawValue === "" ? "— None —" : rawValue);
               const isActive = value === rawValue;
               const optIcon = iconSrcForTroop(rawValue);

               return (
                <div key={rawValue || "blank"} 
                  onClick={(e) => { e.stopPropagation(); onChange(rawValue); setIsOpen(false); }}
                  style={{ 
                    padding: "12px", display: "flex", alignItems: "center", gap: "12px", 
                    borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: "pointer",
                    background: isActive ? "rgba(212, 175, 55, 0.15)" : "transparent",
                    transition: "background 0.1s"
                  }}
                  onMouseEnter={(e) => { if(!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                  onMouseLeave={(e) => { if(!isActive) e.currentTarget.style.background = "transparent"; }}
                >
                  {optIcon ? <img src={optIcon} width="40" height="40" style={{ borderRadius: "6px", border: "1px solid #333" }} alt="" /> : null}
                  <span style={{ color: isActive ? THEME.colors.gold : "#eee", fontSize: "14px", fontWeight: "600", fontFamily:"'Inter', sans-serif", paddingLeft: optIcon ? 0 : 4 }}>
                    {display}
                  </span>
                </div>
               );
            })}
          </div>
        </Portal>
      )}
    </>
  );
};

const BonusInput = ({ label, color, ...props }) => (
  <div style={{ width: "100%", boxSizing: "border-box" }}>
    <label style={{ fontSize: "11px", color: color || THEME.colors.gold, fontWeight: "800", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px", fontFamily: "'Inter', sans-serif" }}>{label}</label>
    <div style={{ position: "relative", width: "100%", boxSizing: "border-box" }}>
      <input 
        type="number"
        step="any"
        inputMode="decimal"
        {...props} 
        style={{ 
          width: "100%", padding: "12px", background: "rgba(0, 0, 0, 0.6)", 
          border: `1px solid ${color || "rgba(255,255,255,0.2)"}`, borderRadius: "8px", 
          color: "#fff", fontSize: "16px", fontWeight: "bold", textAlign: "center", 
          boxSizing: "border-box", outline: "none", fontFamily: "'Inter', sans-serif",
          transition: "border-color 0.2s, box-shadow 0.2s",
          appearance: "textfield", MozAppearance: "textfield"
        }} 
        onFocus={(e) => { e.target.style.borderColor = color || THEME.colors.gold; e.target.style.boxShadow = `0 0 10px ${color || THEME.colors.goldDim}40`; }}
        onBlur={(e) => { e.target.style.borderColor = color || "rgba(255,255,255,0.2)"; e.target.style.boxShadow = "none"; }}
      />
      <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#666", fontWeight: "bold", pointerEvents: "none" }}>%</span>
    </div>
  </div>
);

const GameCard = ({ title, children, isSpecial }) => (
  <div style={{
    background: THEME.colors.cardBg,
    backdropFilter: "blur(12px)",
    border: `1px solid ${THEME.colors.gold}`, // SVE KARTICE IMAJU ZLATNI OBRUB
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "20px",
    boxShadow: isSpecial 
      ? `0 0 25px ${THEME.colors.goldDim}30, inset 0 0 10px ${THEME.colors.goldDim}10` 
      : "0 10px 30px 0 rgba(0, 0, 0, 0.5)",
    position: "relative",
    width: "100%", 
    boxSizing: "border-box"
  }}>
    <div style={{
      position: "absolute", left: 0, top: "20px", bottom: "20px", width: "3px", 
      background: `linear-gradient(to bottom, ${THEME.colors.gold}, transparent)`,
      borderRadius: "0 3px 3px 0"
    }}></div>

    <div style={{
      fontFamily: "'Cinzel', serif", fontWeight: 800, fontSize: "18px",
      color: THEME.colors.goldBright,
      marginBottom: "20px", textTransform: "uppercase", letterSpacing: "1.5px",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      borderBottom: `1px solid rgba(255,255,255,0.1)`, paddingBottom: "12px",
      textShadow: "0 2px 4px rgba(0,0,0,0.8)"
    }}>
      <span>{title}</span>
      {isSpecial && <span style={{fontSize: "20px", filter: "drop-shadow(0 0 5px gold)"}}>🛡️</span>}
    </div>
    {children}
  </div>
);

const Row = ({ label, value, theme, accent }) => (
  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
    <span style={{ color: THEME.colors.textDim, fontSize: "14px", textTransform: "uppercase", letterSpacing:"0.5px" }}>{label}</span>
    <span style={{ fontWeight: 800, color: accent ? THEME.colors.goldBright : "#fff", fontSize: "16px" }}>{value}</span>
  </div>
);

const Modal = ({ open, title, onClose, children }) => {
  if (!open) return null;
  return (
    <Portal>
      <div style={{ 
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 10000, 
        display: "flex", alignItems: "center", justifyContent: "center", padding: 15, backdropFilter: "blur(8px)" 
      }}>
        <div style={{ 
          background: "#16181d", width: "100%", maxWidth: "500px", borderRadius: "16px", 
          border: `1px solid ${THEME.colors.gold}`, 
          boxShadow: `0 0 60px ${THEME.colors.goldDim}40`,
          maxHeight: "90vh", display: "flex", flexDirection: "column" 
        }}>
          <div style={{ 
            padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", 
            borderBottom: "1px solid rgba(255,255,255,0.1)", background: "linear-gradient(90deg, rgba(197, 160, 89, 0.1), transparent)"
          }}>
            <span style={{ fontFamily: "'Cinzel', serif", color: THEME.colors.goldBright, fontWeight: "bold", fontSize: "18px", letterSpacing: "1px" }}>{title}</span>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", fontSize: "28px", cursor: "pointer", padding: "0 5px", transition: "color 0.2s" }}
              onMouseEnter={(e) => e.target.style.color = THEME.colors.danger}
              onMouseLeave={(e) => e.target.style.color = "#fff"}
            >✕</button>
          </div>
          <div style={{ padding: "24px", overflowY: "auto", color: "#ddd" }}>{children}</div>
        </div>
      </div>
    </Portal>
  );
};

/* =========================================
   ⚙️ GLAVNA LOGIKA APP-A (100% IZ APP_GEMINI.JSX + DODACI IZ GOLD)
   ========================================= */

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
  
  // Group Bonus Logic (iz Gold verzije koja je bila dobra)
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
    // Provjera svih mogućih ključeva iz JSON-a
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
    const fort = troop?.fortBonus !== undefined && troop?.fortBonus !== null ? toNum(troop.fortBonus) : 0;
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

  return (
    <div style={{
      width: "100%", minHeight: "100vh",
      backgroundImage: `url('./bg.jpg')`, 
      backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed",
      color: THEME.colors.text, fontFamily: "'Inter', sans-serif",
      paddingBottom: "120px", boxSizing: "border-box",
      // FLEXBOX ZA CENTRIRANJE
      display: "flex", flexDirection: "column", alignItems: "center"
    }}>
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 0 }} />
      
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #C5A059; border-radius: 3px; }
        ::placeholder { color: #666; opacity: 1; }
        /* Ukloni strelice za number input */
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>

      {/* KONTEJNER ZA CENTRIRANJE - 500px */}
      <div style={{ width: "100%", maxWidth: "500px", padding: "20px 16px", position: "relative", zIndex: 1 }}>
        
        <div style={{ 
          fontFamily: "'Cinzel', serif", color: THEME.colors.goldBright, textAlign: "center", 
          fontSize: "32px", textShadow: "0 2px 10px rgba(0,0,0,0.8), 0 0 20px rgba(197, 160, 89, 0.4)",
          marginBottom: "30px", letterSpacing: "2px", textTransform: "uppercase"
        }}>
          Citadel Calculator <br/> <span style={{fontSize:"16px", color: THEME.colors.textDim}}>by GM</span>
        </div>

        {/* SETUP */}
        <GameCard title="⚙️ Setup">
          <button onClick={() => setHelpOpen(true)} style={{ 
             width: "100%", padding: "12px", borderRadius: "8px", 
             border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", 
             color: "#ddd", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", 
             gap: "8px", fontWeight: "bold", fontFamily: "'Inter', sans-serif", fontSize: "14px", marginBottom: "20px"
          }}>
             <span>ℹ️</span> Instructions
          </button>

          <div style={{ display: "grid", gap: "16px", marginBottom: "20px" }}>
             <div>
                <label style={{ fontSize: "11px", color: THEME.colors.textDim, display:"block", marginBottom:"6px", textTransform:"uppercase", fontWeight:"bold" }}>Do you have M8/M9 troops?</label>
                <CustomSelect 
                   value={mode} 
                   options={[MODE_WITHOUT, MODE_WITH]} 
                   onChange={handleModeChange}
                   labelTransform={(val) => val === MODE_WITHOUT ? "No" : "Yes"}
                />
             </div>
             <div>
                <label style={{ fontSize: "11px", color: THEME.colors.textDim, display:"block", marginBottom:"6px", textTransform:"uppercase", fontWeight:"bold" }}>Citadel Level</label>
                <CustomSelect 
                   value={citadelLevel} 
                   options={citadelKeys} 
                   onChange={(val) => { setCitadelLevel(val); setCalcOutput(null); setResultsOpen(false); }}
                   labelTransform={(val) => `Elven ${val}`}
                />
             </div>
          </div>
          
          <button onClick={resetSelections} style={{
             width: "100%", padding: "12px", borderRadius: "8px",
             border: `1px solid ${THEME.colors.danger}`, background: "rgba(229, 62, 62, 0.1)", color: "#ff6b6b", 
             fontWeight: "bold", cursor: "pointer", textTransform: "uppercase", fontSize: "13px", letterSpacing: "1px"
          }}>
             Reset Troops Selection
          </button>
        </GameCard>

        {/* WALL KILLER */}
        <GameCard title="🛡️ Wall Killer" isSpecial>
           <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "11px", color: THEME.colors.textDim, display:"block", marginBottom:"6px", textTransform:"uppercase", fontWeight:"bold" }}>Select Troop</label>
              <CustomSelect value={wallKillerTroop} options={wallKillerPool} onChange={(v) => { setWallKillerTroop(v); setCalcOutput(null); setResultsOpen(false); }} />
           </div>

           <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
              <BonusInput label="Strength Bonus (%)" value={wallKillerBonusPct} onChange={e => { setWallKillerBonusPct(e.target.value); setCalcOutput(null); setResultsOpen(false); }} placeholder="0" />
              
              <div style={{ background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                 <Row label="Effective Bonus" value={`${fmtInt(wallKiller.effBonus)}%`} theme={THEME} accent />
                 <Row label="Required Troops" value={fmtInt(wallKiller.requiredTroops)} theme={THEME} accent />
              </div>
           </div>
        </GameCard>

        {/* STRIKERS */}
        {perStriker.map((s) => {
           const isFirst = s.idx === 0;
           const opts = optionsForIdx(s.idx);
           
           return (
             <GameCard key={s.idx} title={`${s.idx + 1}. ${s.label}`}>
                <div style={{ marginBottom: "16px" }}>
                   <label style={{ fontSize: "11px", color: THEME.colors.textDim, display:"block", marginBottom:"6px", textTransform:"uppercase", fontWeight:"bold" }}>Select Troop</label>
                   <CustomSelect value={strikerTroops[s.idx]} options={opts} onChange={v => handleTroopChange(s.idx, v)} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: isFirst ? "1fr 1fr" : "1fr", gap: "16px", marginBottom: "16px" }}>
                   {isFirst && (
                      <BonusInput label="Health Bonus (%)" color="#fc8181" value={firstHealthBonusPct} onChange={e => { setFirstHealthBonusPct(e.target.value); setCalcOutput(null); setResultsOpen(false); }} placeholder="0" />
                   )}
                   <BonusInput label="Strength Bonus (%)" color="#63b3ed" value={strikerBonusPct[s.idx]} onChange={e => setBonusAt(s.idx, e.target.value)} placeholder="0" />
                </div>
                
                <div style={{ background: "rgba(0,0,0,0.3)", borderRadius:"8px", padding:"12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                   <Row label="Effective Bonus" value={`${fmtInt(s.effBonus)}%`} theme={THEME} accent />
                   <Row label="Required Troops" value={fmtInt(s.requiredTroops)} theme={THEME} accent />
                   {isFirst && (
                      <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                         <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "#fc8181", fontSize: "13px", textTransform: "uppercase" }}>Citadel First Strike Losses</span>
                            <span style={{ fontWeight: 800, color: "#fc8181", fontSize: "16px" }}>{fmtInt(firstDeaths)}</span>
                         </div>
                      </div>
                   )}
                </div>
             </GameCard>
           );
        })}

        {/* BOTTOM FLOATING BAR */}
        <div style={{ 
           position: "fixed", bottom: 0, left: 0, right: 0, padding: "16px", 
           background: "rgba(10, 10, 12, 0.98)", borderTop: `1px solid ${THEME.colors.goldDim}`, 
           zIndex: 1000, backdropFilter: "blur(10px)",
           boxShadow: "0 -10px 30px rgba(0,0,0,0.5)"
        }}>
           <div style={{ maxWidth: "500px", margin: "0 auto" }}>
             <button onClick={calculate} style={{
                width: "100%", padding: "16px", borderRadius: "10px", border: "none",
                background: THEME.colors.btnGradient,
                color: "#000", fontWeight: "900", fontSize: "18px", letterSpacing: "2px",
                boxShadow: "0 0 25px rgba(197, 160, 89, 0.3), inset 0 2px 2px rgba(255,255,255,0.4)", 
                cursor: "pointer", fontFamily: "'Cinzel', serif",
                textShadow: "0 1px 0 rgba(255,255,255,0.4)",
             }}
             >
                CALCULATE
             </button>
           </div>
        </div>

        {/* MODALS */}
        <Modal open={!!warningMsg} title="⚠️ Invalid Striker Order" onClose={() => setWarningMsg("")} theme={THEME}>
          <p style={{ lineHeight: "1.6", whiteSpace: "pre-wrap", color: "#ddd", fontSize: "15px" }}>{warningMsg}</p>
          <button onClick={() => setWarningMsg("")} style={{ width: "100%", padding: "14px", background: THEME.colors.gold, border: "none", borderRadius: "8px", marginTop: "20px", fontWeight: "bold", cursor: "pointer", fontSize: "16px" }}>OK</button>
        </Modal>

        <Modal open={resultsOpen} title="📋 Calculated Results" onClose={() => setResultsOpen(false)} theme={THEME}>
          <div style={{ background: "rgba(255,255,255,0.05)", padding: "12px", borderRadius: "8px", marginBottom: "20px", border: "1px solid rgba(255,255,255,0.1)" }}>
             <Row label="Mode" value={calcOutput?.modeLabel} theme={THEME} accent />
             <Row label="Citadel" value={calcOutput?.citadelLabel} theme={THEME} accent />
          </div>

          <button onClick={async () => {
              const list = (calcOutput?.troops || []).map(t => `${t.troop} - ${fmtInt(t.required)}`).join("\n");
              const ok = await copyToClipboard(list);
              setCopyNotice(ok ? "✅ Copied!" : "❌ Error");
              setTimeout(() => setCopyNotice(""), 2000);
           }} style={{ 
              width: "100%", padding: "14px", background: THEME.colors.btnGradient, color: "#000", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight:"bold", fontSize:"16px", marginBottom:"10px", display: "flex", alignItems:"center", justifyContent:"center", gap: "8px"
           }}>
              <span>📄</span> Copy List to Clipboard
           </button>
           {copyNotice && <div style={{textAlign:"center", color: THEME.colors.gold, fontWeight:"bold", marginBottom:10}}>{copyNotice}</div>}

          <div style={{ display: "grid", gap: "8px" }}>
            {calcOutput?.troops.map((t, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "rgba(20, 20, 25, 0.8)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 4px 6px rgba(0,0,0,0.2)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {iconSrcForTroop(t.troop) && <img src={iconSrcForTroop(t.troop)} width="42" height="42" style={{borderRadius:6, border: "1px solid #333"}} alt=""/>}
                  <span style={{ fontWeight: "bold", color: "#eee", fontSize: "15px" }}>{t.troop}</span>
                </div>
                <span style={{ color: THEME.colors.goldBright, fontSize: "18px", fontWeight: "900" }}>{fmtInt(t.required)}</span>
              </div>
            ))}
          </div>
        </Modal>

        <Modal open={helpOpen} title="ℹ️ Instructions & Help" onClose={() => setHelpOpen(false)} theme={THEME}>
          <div style={{ color: "#e0e0e0", lineHeight: 1.6, fontSize: 15, display: "grid", gap: 20 }}>
            <div>
                <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: THEME.colors.accent }}>🎯 Goal</div>
                <div style={{ color: "#bbb" }}>Use the correct troops and bonuses to minimize losses when attacking a Citadel. I took care of the proper troops selection.</div>
            </div>
            <div>
                <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: THEME.colors.danger }}>❗ Most Important Rule</div>
                <div style={{ color: "#bbb", borderLeft: `4px solid ${THEME.colors.danger}`, paddingLeft: 12 }}>Maximize <b style={{ color: "#fff" }}>First Striker Health</b>. In a proper attack, the First Striker is the only troop group that should take losses. If you are losing other troops, check your bonuses or troop counts.<br /><br />The number of <b style={{ color: "#fff" }}>FIRST STRIKER</b> troops <b style={{ color: "#fff" }}> CAN</b> be higher than calculated. All other troops <b style={{ color: "#fff" }}>MUST</b> be used in the exact number as calculated.</div></div>
            <div><div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: THEME.colors.accent }}>🦅 First Striker</div><div style={{ color: "#bbb" }}>Must be the strongest <b style={{ color: "#fff" }}>flying Guardsmen</b>: <b style={{ color: "#fff" }}> Corax</b> or <b style={{ color: "#fff" }}> Griffin</b>.</div></div>
            <div><div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: THEME.colors.accent }}>🦸 Captains</div><div style={{ color: "#bbb" }}>Recommended: <b style={{ color: "#fff" }}> Wu Zetian, Brunhild, Skadi, Beowulf, Aydae, Ramses, Sofia</b>.</div></div>
            <div><div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: THEME.colors.accent }}>✨ Artifacts</div><div style={{ color: "#bbb" }}>Use artifacts that increase Health for <b style={{ color: "#fff" }}> Flying</b>, <b style={{ color: "#fff" }}> Guardsmen</b>, or the <b style={{ color: "#fff" }}> Army</b>. (e.g., <b style={{ color: "#fff" }}>Valkyrie Diadem, Medallion, Belt, Flask</b>).</div></div>
            <div><div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: THEME.colors.accent }}>🔄 Recalculate</div><div style={{ color: "#bbb" }}>After ANY strength bonus change, enter new bonuses and press <b style={{ color: "#fff" }}> Calculate</b> again. Small changes matter!</div>
            </div>
            <div>
                <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: THEME.colors.accent }}>❓ How to find bonuses?</div><div style={{ color: "#bbb" }}>Attack a level 10 Citadel with <b style={{ color: "#fff" }}>10 of each selected troop type</b>. Copy the bonuses from the attack report into the calculator.</div>
            </div>
          </div>
        </Modal>

      </div>
    </div>
  );
}
