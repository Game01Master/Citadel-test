import React, { useMemo, useState, useEffect, useRef } from "react";
import TB from "./tb_data.json";

/* =========================================
   🎨 TEMA I NAPREDNI STILOVI
   ========================================= */

const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Inter:wght@400;600;800&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

const THEME = {
  colors: {
    gold: "#C5A059",
    goldDim: "#8b6508",
    goldBright: "#FFD700",
    text: "#E0E0E0",
    textDim: "#A0AEC0",
    accent: "#4299e1",
    danger: "#e53e3e",
    inputBg: "rgba(0, 0, 0, 0.7)", 
  }
};

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
  return file ? `./icons/${file}` : null; 
}

/* =========================================
   🧩 UI KOMPONENTE (PRO GAMING STYLE)
   ========================================= */

const CustomTroopSelect = ({ value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClick(e) { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false); }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={wrapperRef} style={{ position: "relative", width: "100%", zIndex: isOpen ? 100 : 1 }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%", minHeight: "54px", padding: "8px 12px", 
          background: "linear-gradient(180deg, rgba(30,30,35,0.9) 0%, rgba(10,10,15,0.9) 100%)", // Gradient pozadina
          border: `1px solid ${isOpen ? THEME.colors.gold : "rgba(255,255,255,0.15)"}`,
          boxShadow: isOpen ? `0 0 10px ${THEME.colors.goldDim}` : "inset 0 2px 4px rgba(0,0,0,0.5)", // Unutarnja sjena za dubinu
          borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "space-between", 
          cursor: "pointer", boxSizing: "border-box", transition: "all 0.2s ease"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", color: value ? "#fff" : "#888", overflow: "hidden" }}>
          {iconSrcForTroop(value) ? 
            <img src={iconSrcForTroop(value)} width="38" height="38" style={{ borderRadius: "6px", border: "1px solid #444" }} alt="" /> 
            : <div style={{width:38, height:38, borderRadius: 6, background: "rgba(255,255,255,0.05)", border: "1px dashed #444"}}/>}
          <span style={{ fontWeight: "700", fontSize: "15px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: "'Inter', sans-serif" }}>{value || "Select Troop"}</span>
        </div>
        <span style={{ color: THEME.colors.gold, flexShrink: 0, marginLeft: 10, fontSize: "12px" }}>{isOpen ? "▲" : "▼"}</span>
      </div>

      {isOpen && (
        <div style={{
          position: "absolute", top: "60px", left: 0, right: 0, 
          background: "#121214",
          border: `1px solid ${THEME.colors.gold}`, borderRadius: "8px", maxHeight: "280px",
          overflowY: "auto", zIndex: 9999, 
          boxShadow: "0 10px 40px rgba(0,0,0,0.95), 0 0 15px rgba(197, 160, 89, 0.1)"
        }}>
          {options.filter(o => o).map(opt => (
            <div key={opt} onClick={() => { onChange(opt); setIsOpen(false); }}
              style={{ 
                padding: "10px 12px", display: "flex", alignItems: "center", gap: "12px", 
                borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: "pointer",
                transition: "background 0.1s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(197, 160, 89, 0.15)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <img src={iconSrcForTroop(opt)} width="40" height="40" style={{ borderRadius: "6px", border: "1px solid #333" }} alt="" />
              <span style={{ color: "#eee", fontSize: "14px", fontWeight: "600" }}>{opt}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const BonusInput = ({ label, color, ...props }) => (
  <div style={{ width: "100%", boxSizing: "border-box" }}>
    <label style={{ 
      fontSize: "11px", color: color || THEME.colors.gold, fontWeight: "800", 
      display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" 
    }}>{label}</label>
    <div style={{ position: "relative", width: "100%", boxSizing: "border-box" }}>
      <input 
        {...props} 
        style={{ 
          width: "100%", padding: "12px", 
          background: "rgba(0, 0, 0, 0.6)", 
          border: `1px solid ${color || "rgba(255,255,255,0.2)"}`, 
          borderRadius: "8px", color: "#fff", fontSize: "16px", fontWeight: "bold", 
          textAlign: "center", boxSizing: "border-box", outline: "none",
          transition: "border-color 0.2s, box-shadow 0.2s"
        }} 
        onFocus={(e) => {
          e.target.style.borderColor = color || THEME.colors.gold;
          e.target.style.boxShadow = `0 0 8px ${color || THEME.colors.goldDim}40`;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = color || "rgba(255,255,255,0.2)";
          e.target.style.boxShadow = "none";
        }}
      />
      <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#666", fontWeight: "bold", pointerEvents: "none" }}>%</span>
    </div>
  </div>
);

const GameCard = ({ title, children, isSpecial }) => (
  <div style={{
    background: "rgba(20, 22, 28, 0.85)", // Tamnija, bogatija pozadina
    backdropFilter: "blur(12px)",
    border: `1px solid ${isSpecial ? THEME.colors.gold : "rgba(255,255,255,0.1)"}`,
    borderRadius: "14px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: isSpecial 
      ? "0 0 20px rgba(197, 160, 89, 0.15), inset 0 0 20px rgba(197, 160, 89, 0.05)" // Zlatni glow za specijalne kartice
      : "0 8px 32px 0 rgba(0, 0, 0, 0.6)",
    position: "relative",
    width: "100%", 
    boxSizing: "border-box"
  }}>
    {/* Ukrasna linija lijevo */}
    <div style={{
      position: "absolute", left: 0, top: "20px", bottom: "20px", width: "3px", 
      background: isSpecial ? `linear-gradient(to bottom, ${THEME.colors.gold}, transparent)` : "rgba(255,255,255,0.2)",
      borderRadius: "0 3px 3px 0"
    }}></div>

    <div style={{
      fontFamily: "'Cinzel', serif",
      fontWeight: 800,
      fontSize: "18px",
      color: isSpecial ? THEME.colors.goldBright : "#fff",
      marginBottom: "20px",
      textTransform: "uppercase",
      letterSpacing: "1px",
      paddingLeft: "10px", // Odmak zbog linije
      textShadow: "0 2px 4px rgba(0,0,0,0.8)"
    }}>
      {title}
    </div>
    <div style={{ paddingLeft: "5px" }}>{children}</div>
  </div>
);

const Modal = ({ open, title, onClose, children }) => {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: 15, backdropFilter: "blur(5px)" }}>
      <div style={{ 
        background: "#16181d", width: "100%", maxWidth: "500px", borderRadius: "16px", 
        border: `1px solid ${THEME.colors.gold}`, 
        boxShadow: "0 0 50px rgba(197, 160, 89, 0.2)",
        maxHeight: "90vh", display: "flex", flexDirection: "column" 
      }}>
        <div style={{ 
          padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", 
          borderBottom: "1px solid rgba(255,255,255,0.1)", background: "rgba(197, 160, 89, 0.05)"
        }}>
          <span style={{ fontFamily: "'Cinzel', serif", color: THEME.colors.goldBright, fontWeight: "bold", fontSize: "18px", letterSpacing: "1px" }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", fontSize: "24px", cursor: "pointer", padding: "0 5px", transition: "color 0.2s" }}
            onMouseEnter={(e) => e.target.style.color = THEME.colors.danger}
            onMouseLeave={(e) => e.target.style.color = "#fff"}
          >✕</button>
        </div>
        <div style={{ padding: "24px", overflowY: "auto" }}>{children}</div>
      </div>
    </div>
  );
};

/* =========================================
   ⚙️ LOGIKA (100% IDENTIČNA ORIGINALU)
   ========================================= */

const STRIKER_LABELS = ["First Striker", "Second Striker", "Third Striker", "Cleanup 1", "Cleanup 2", "Cleanup 3", "Cleanup 4", "Cleanup 5", "Cleanup 6"];
const RESULT_ORDER = ["Wyvern", "Warregal", "Jago", "Ariel", "Epic Monster Hunter", "Fire Phoenix II", "Fire Phoenix I", "Manticore", "Corax II", "Royal Lion II", "Corax I", "Royal Lion I", "Griffin VII", "Josephine II", "Griffin VI", "Josephine I", "Griffin V", "Siege Ballistae VII", "Siege Ballistae VI", "Punisher I", "Duelist I", "Catapult V", "Vulture VII", "Heavy Halberdier VII", "Heavy Knight VII", "Catapult IV", "Vulture VI", "Heavy Halberdier VI", "Heavy Knight VI", "Spearmen V", "Swordsmen V", "Vulture V"];
const TROOPS_WITH_M8_RAW = ["Wyvern", "Warregal", "Jago", "Ariel", "Epic Monster Hunter", "Fire Phoenix II", "Fire Phoenix I", "Manticore", "Corax II", "Royal Lion II", "Corax I", "Royal Lion I", "Griffin VII", "Josephine II", "Griffin VI", "Josephine I", "Griffin V", "Siege Ballistae VII", "Siege Ballistae VI", "Catapult V", "Vulture VII", "Catapult IV", "Vulture VI", "Vulture V"];
const TROOPS_WITHOUT_M8_RAW = ["Wyvern", "Warregal", "Jago", "Ariel", "Epic Monster Hunter", "Manticore", "Corax I", "Royal Lion I", "Griffin VII", "Josephine II", "Griffin VI", "Josephine I", "Griffin V", "Siege Ballistae VII", "Siege Ballistae VI", "Punisher I", "Duelist I", "Catapult V", "Vulture VII", "Heavy Halberdier VII", "Heavy Knight VII", "Catapult IV", "Vulture VI", "Heavy Halberdier VI", "Heavy Knight VI", "Spearmen V", "Swordsmen V", "Vulture V"];
const WALL_KILLER_NAMES_RAW = ["Ariel", "Josephine II", "Josephine I", "Siege Ballistae VII", "Siege Ballistae VI", "Catapult V", "Catapult IV"];

function toNum(v) { const n = Number(v); return Number.isFinite(n) ? n : 0; }
function fmtInt(n) { return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(Math.floor(n || 0)); }
function normName(s) { return String(s ?? "").toLowerCase().replace(/\s+/g, " ").trim(); }
async function copyToClipboard(text) { try { await navigator.clipboard.writeText(text); return true; } catch { return false; } }

export default function App() {
  const citadelKeys = Object.keys(TB.citadels ?? {});
  const troops = TB.troops ?? [];
  const canon = useMemo(() => {
    const m = new Map();
    for (const t of troops) m.set(normName(t.name), t.name);
    return m;
  }, [troops]);

  const troopByName = useMemo(() => new Map(troops.map((t) => [t.name, t])), [troops]);
  
  const [citadelLevel, setCitadelLevel] = useState(citadelKeys[0] ?? "25");
  const [mode, setMode] = useState("WITHOUT");
  const [strikerTroops, setStrikerTroops] = useState(Array(9).fill(""));
  const [strikerBonusPct, setStrikerBonusPct] = useState(Array(9).fill(""));
  const [firstHealthBonusPct, setFirstHealthBonusPct] = useState("");
  const [wallKillerTroop, setWallKillerTroop] = useState("");
  const [wallKillerBonusPct, setWallKillerBonusPct] = useState("");
  const [warningMsg, setWarningMsg] = useState("");
  const [resultsOpen, setResultsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [calcOutput, setCalcOutput] = useState(null);
  const [copyNotice, setCopyNotice] = useState("");

  const cit = TB.citadels?.[citadelLevel];
  const targets = mode === "WITH" ? cit?.m8m9Targets : cit?.normalTargets;
  
  const poolAll = useMemo(() => (mode === "WITH" ? TROOPS_WITH_M8_RAW : TROOPS_WITHOUT_M8_RAW).map(r => canon.get(normName(r))).filter(Boolean), [mode, canon]);
  const wallKillerPool = useMemo(() => WALL_KILLER_NAMES_RAW.map(r => canon.get(normName(r))).filter(Boolean), [canon]);
  
  const firstAllowed = useMemo(() => {
    const rawList = mode === "WITH" ? TB.firstStrikerAllowed.WITH : TB.firstStrikerAllowed.WITHOUT;
    return rawList.map(r => canon.get(normName(r))).filter(Boolean);
  }, [mode, canon]);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setStrikerTroops(Array(9).fill(""));
    setStrikerBonusPct(Array(9).fill(""));
    setFirstHealthBonusPct("");
    setCalcOutput(null);
  };

  const resetSelections = () => {
    setStrikerTroops(Array(9).fill(""));
    setStrikerBonusPct(Array(9).fill(""));
    setFirstHealthBonusPct("");
    setWallKillerTroop(wallKillerPool[0] ?? "");
    setWallKillerBonusPct("");
    setCalcOutput(null);
  };

  useEffect(() => { if (!wallKillerTroop) setWallKillerTroop(wallKillerPool[0] ?? ""); }, [wallKillerTroop, wallKillerPool]);

  const handleTroopChange = (idx, picked) => {
    if (idx >= 2 && picked) {
      const first = strikerTroops[0];
      const t = troopByName.get(picked);
      const f = troopByName.get(first);
      if (f && t && (t.strength > f.strength || t.health > f.health)) {
        const label = STRIKER_LABELS[idx] || "Striker";
        setWarningMsg(`${label} (${picked}) has higher BASE strength (${fmtInt(t.strength)}) and BASE health (${fmtInt(t.health)}) than your First striker (${first}, ${fmtInt(f.strength)} / ${fmtInt(f.health)}).\n\nChoose a stronger First striker troops!!`);
        return;
      }
    }
    const next = [...strikerTroops]; next[idx] = picked; setStrikerTroops(next);
  };

  const calculate = () => {
    const counts = new Map();
    const add = (n, q) => { if(n) counts.set(normName(n), (counts.get(normName(n)) || 0) + q); };

    const wkt = troopByName.get(wallKillerTroop);
    const wDmg = (wkt?.strength || 0) * (1 + (toNum(wallKillerBonusPct) + (wkt?.fortBonus || 0))/100) * 20;
    if (wDmg > 0) add(wallKillerTroop, Math.ceil(cit.wallHP / wDmg));

    STRIKER_LABELS.forEach((_, i) => {
      const name = strikerTroops[i];
      const t = troopByName.get(name);
      if (!t) return;
      let b = toNum(strikerBonusPct[i]) + (TB.additionalBonusNormal[name] || 0);
      if (mode === "WITH" && i === 1) b += (TB.phoenixExtra[name] || 0);
      const dmg = t.strength * (1 + b/100);
      let q = dmg > 0 ? Math.floor(targets[i] / dmg) : 0;
      if (i === 0) {
        const h = t.health * (1 + toNum(firstHealthBonusPct)/100);
        q += h > 0 ? Math.floor(cit.firstStrikeDamage / h) : 0;
      }
      add(name, q);
    });

    const ordered = RESULT_ORDER.filter(n => counts.has(normName(n))).map(n => ({ troop: n, required: counts.get(normName(n)) }));
    setCalcOutput({ 
        troops: ordered, 
        modeLabel: mode === MODE_WITH ? "With M8/M9" : "Without M8/M9",
        citadelLabel: `Elven ${citadelLevel}` 
    });
    setResultsOpen(true);
  };

  const firstDeaths = useMemo(() => {
    if (!cit) return 0;
    const t = troopByName.get(strikerTroops[0]);
    const h = (t?.health || 0) * (1 + toNum(firstHealthBonusPct)/100);
    return h > 0 ? Math.floor(cit.firstStrikeDamage / h) : 0;
  }, [cit, troopByName, strikerTroops, firstHealthBonusPct]);

  const wEff = useMemo(() => {
     const t = troopByName.get(wallKillerTroop);
     return toNum(wallKillerBonusPct) + (t?.fortBonus || 0);
  }, [wallKillerTroop, wallKillerBonusPct, troopByName]);

  const wReq = useMemo(() => {
     const t = troopByName.get(wallKillerTroop);
     const d = (t?.strength || 0) * (1 + wEff/100) * 20;
     return d > 0 ? Math.ceil(cit.wallHP / d) : 0;
  }, [cit, wallKillerTroop, wEff, troopByName]);

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundImage: "url('./bg.jpg')", 
      backgroundSize: "cover", 
      backgroundPosition: "center", 
      backgroundAttachment: "fixed", 
      color: "#fff", 
      paddingBottom: "120px", 
      boxSizing: "border-box",
      fontFamily: "'Inter', sans-serif" 
    }}>
      {/* Dark Overlay */}
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 0 }} />
      
      {/* Global Styles for Scrollbar */}
      <style>{`
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #C5A059; border-radius: 3px; }
      `}</style>

      <div style={{ position: "relative", maxWidth: "600px", margin: "0 auto", padding: "20px", zIndex: 1 }}>
        <h1 style={{ 
          fontFamily: "'Cinzel', serif", 
          color: THEME.colors.goldBright, 
          textAlign: "center", 
          fontSize: "32px", 
          textShadow: "0 2px 10px rgba(0,0,0,0.8), 0 0 20px rgba(197, 160, 89, 0.4)",
          marginBottom: "30px",
          letterSpacing: "2px",
          textTransform: "uppercase"
        }}>
          Citadel Calculator <br/> <span style={{fontSize:"16px", color: THEME.colors.textDim}}>by GM</span>
        </h1>

        {/* SETUP */}
        <GameCard title="⚙️ Setup">
          <button onClick={() => setHelpOpen(true)} style={{ 
             width: "100%", padding: "12px", borderRadius: "8px", 
             border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.05)", 
             color: "#ddd", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", 
             gap: "8px", fontWeight: "bold", fontFamily: "'Inter', sans-serif", fontSize: "14px", marginBottom: "20px",
             transition: "background 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
          >
             <span>ℹ️</span> Instructions
          </button>

          <div style={{ display: "grid", gap: "16px", marginBottom: "20px" }}>
             <div>
                <label style={{ fontSize: "11px", color: THEME.colors.textDim, display:"block", marginBottom:"6px", textTransform:"uppercase", fontWeight:"bold" }}>Do you have M8/M9 troops?</label>
                <select 
                   value={mode} onChange={(e) => handleModeChange(e.target.value)}
                   style={{ 
                     width: "100%", padding: "12px", background: "rgba(0,0,0,0.6)", 
                     border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", 
                     color: "#fff", fontSize:"16px", outline:"none", appearance:"none" 
                   }}
                >
                   <option value={MODE_WITHOUT}>No</option>
                   <option value={MODE_WITH}>Yes</option>
                </select>
             </div>
             <div>
                <label style={{ fontSize: "11px", color: THEME.colors.textDim, display:"block", marginBottom:"6px", textTransform:"uppercase", fontWeight:"bold" }}>Citadel Level</label>
                <select 
                   value={citadelLevel} onChange={(e) => setCitadelLevel(e.target.value)}
                   style={{ 
                     width: "100%", padding: "12px", background: "rgba(0,0,0,0.6)", 
                     border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", 
                     color: "#fff", fontSize:"16px", outline:"none", appearance:"none" 
                   }}
                >
                   {citadelKeys.map(k => <option key={k} value={k}>Elven {k}</option>)}
                </select>
             </div>
          </div>
          
          <button onClick={resetSelections} style={{
             width:"100%", padding:"12px", borderRadius:"8px",
             border: `1px solid ${THEME.colors.danger}`, background: "rgba(229, 62, 62, 0.1)", color: "#ff6b6b", 
             fontWeight: "bold", cursor:"pointer", textTransform: "uppercase", fontSize: "13px", letterSpacing: "1px",
             transition: "background 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(229, 62, 62, 0.2)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(229, 62, 62, 0.1)"}
          >
             Reset Troops Selection
          </button>
        </GameCard>

        {/* WALL KILLER */}
        <GameCard title="Wall Killer" isSpecial>
           <div style={{ marginBottom: "16px" }}>
              <CustomTroopSelect value={wallKillerTroop} options={wallKillerPool} onChange={setWallKillerTroop} />
           </div>

           <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
              <BonusInput label="Strength Bonus (%)" value={wallKillerBonusPct} onChange={e => setWallKillerBonusPct(e.target.value)} placeholder="0" />
              
              <div style={{ background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                 <div style={{display:"flex", justifyContent:"space-between", marginBottom:"6px"}}>
                    <span style={{color:THEME.colors.textDim, fontSize:"13px", textTransform:"uppercase"}}>Effective Bonus</span>
                    <span style={{color:THEME.colors.accent, fontWeight:"bold"}}>{fmtInt(wEff)}%</span>
                 </div>
                 <div style={{display:"flex", justifyContent:"space-between"}}>
                    <span style={{color:THEME.colors.textDim, fontSize:"13px", textTransform:"uppercase"}}>Required Troops</span>
                    <span style={{color:THEME.colors.goldBright, fontWeight:"bold", fontSize:"18px"}}>{fmtInt(wReq)}</span>
                 </div>
              </div>
           </div>
        </GameCard>

        {/* STRIKERS */}
        {STRIKER_LABELS.map((lbl, idx) => {
           // Calc logic for display
           const name = strikerTroops[idx];
           const t = troopByName.get(name);
           let effB = 0, req = 0;
           if(t) {
              effB = toNum(strikerBonusPct[idx]) + (TB.additionalBonusNormal[name] || 0);
              if(mode === "WITH" && idx === 1) effB += (TB.phoenixExtra[name] || 0);
              const dmg = t.strength * (1 + effB/100);
              req = dmg > 0 ? Math.floor(targets[idx] / dmg) : 0;
              if (idx === 0) req += firstDeaths;
           }

           return (
             <GameCard key={idx} title={`${idx+1}. ${lbl}`}>
                <div style={{ marginBottom: "16px" }}>
                   <CustomTroopSelect 
                      value={strikerTroops[idx]} 
                      options={idx === 0 ? firstAllowed : (idx === 1 ? (mode === "WITH" ? ["Fire Phoenix II", "Fire Phoenix I"] : ["Manticore"]) : poolAll)} 
                      onChange={v => handleTroopChange(idx, v)} 
                   />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: idx === 0 ? "1fr 1fr" : "1fr", gap: "16px", marginBottom: "16px" }}>
                   {idx === 0 && (
                      <BonusInput label="Health Bonus (%)" color="#fc8181" value={firstHealthBonusPct} onChange={e => setFirstHealthBonusPct(e.target.value)} placeholder="0" />
                   )}
                   <BonusInput label="Strength Bonus (%)" color="#63b3ed" value={strikerBonusPct[idx]} onChange={e => {
                      const next = [...strikerBonusPct]; next[idx] = e.target.value; setStrikerBonusPct(next);
                   }} placeholder="0" />
                </div>
                
                <div style={{ background: "rgba(0,0,0,0.3)", borderRadius:"8px", padding:"12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                   <div style={{display:"flex", justifyContent:"space-between", marginBottom:"6px"}}>
                      <span style={{color:THEME.colors.textDim, fontSize:"13px", textTransform:"uppercase"}}>Effective Bonus</span>
                      <span style={{color:THEME.colors.accent, fontWeight:"bold"}}>{fmtInt(effB)}%</span>
                   </div>
                   <div style={{display:"flex", justifyContent:"space-between"}}>
                      <span style={{color:THEME.colors.textDim, fontSize:"13px", textTransform:"uppercase"}}>Required Troops</span>
                      <span style={{color:THEME.colors.goldBright, fontWeight:"bold", fontSize:"18px"}}>{fmtInt(req)}</span>
                   </div>
                   {idx === 0 && (
                      <div style={{display:"flex", justifyContent:"space-between", marginTop:"8px", paddingTop:"8px", borderTop:"1px solid rgba(255,255,255,0.1)"}}>
                         <span style={{color:THEME.colors.textDim, fontSize:"12px", textTransform:"uppercase"}}>Citadel First Strike Losses</span>
                         <span style={{color:THEME.colors.danger, fontWeight:"bold"}}>{fmtInt(firstDeaths)}</span>
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
           <div style={{ maxWidth: "600px", margin: "0 auto" }}>
             <button onClick={calculate} style={{
                width: "100%", padding: "16px", borderRadius: "10px", border: "none",
                background: `linear-gradient(135deg, ${THEME.colors.gold} 0%, #a37c35 100%)`,
                color: "#000", fontWeight: "900", fontSize: "18px", letterSpacing: "2px",
                boxShadow: "0 0 25px rgba(197, 160, 89, 0.3), inset 0 2px 2px rgba(255,255,255,0.4)", 
                cursor: "pointer", fontFamily: "'Cinzel', serif",
                textShadow: "0 1px 0 rgba(255,255,255,0.4)",
                transition: "transform 0.1s"
             }}
             onMouseDown={(e) => e.target.style.transform = "scale(0.98)"}
             onMouseUp={(e) => e.target.style.transform = "scale(1)"}
             >
                CALCULATE RESULTS
             </button>
           </div>
        </div>

        {/* MODALS */}
        <Modal open={!!warningMsg} title="⚠️ Invalid Striker Order" onClose={() => setWarningMsg("")}>
          <p style={{ lineHeight: "1.6", whiteSpace: "pre-wrap", color: "#ddd", fontSize: "15px" }}>{warningMsg}</p>
          <button onClick={() => setWarningMsg("")} style={{ width: "100%", padding: "14px", background: THEME.colors.gold, border: "none", borderRadius: "8px", marginTop: "20px", fontWeight: "bold", cursor: "pointer", fontSize: "16px" }}>OK</button>
        </Modal>

        <Modal open={resultsOpen} title="📋 Victory Plan" onClose={() => setResultsOpen(false)}>
          <div style={{ background: "rgba(255,255,255,0.05)", padding: "12px", borderRadius: "8px", marginBottom: "20px", border: "1px solid rgba(255,255,255,0.1)" }}>
             <div style={{display:"flex", justifyContent:"space-between", marginBottom:4}}>
                <span style={{color:THEME.colors.textDim}}>Mode</span><span style={{fontWeight:"bold", color: THEME.colors.goldBright}}>{calcOutput?.modeLabel}</span>
             </div>
             <div style={{display:"flex", justifyContent:"space-between"}}>
                <span style={{color:THEME.colors.textDim}}>Citadel</span><span style={{fontWeight:"bold", color: "#fff"}}>{calcOutput?.citadelLabel}</span>
             </div>
          </div>

          <button onClick={async () => {
              const list = calcOutput.troops.map(t => `${t.troop} - ${fmtInt(t.required)}`).join("\n");
              const ok = await copyToClipboard(list);
              setCopyNotice(ok ? "✅ Copied!" : "❌ Error");
              setTimeout(() => setCopyNotice(""), 2000);
           }} style={{ 
              width: "100%", padding: "14px", background: THEME.colors.accent, color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight:"bold", fontSize:"16px", marginBottom:"10px", display: "flex", alignItems:"center", justifyContent:"center", gap: "8px"
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

        <Modal open={helpOpen} title="ℹ️ Instructions & Help" onClose={() => setHelpOpen(false)}>
  <div style={{ color: "#e0e0e0", lineHeight: 1.6, fontSize: 15, display: "grid", gap: 20 }}>
    <div>
        <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: "#4299e1" }}>🎯 Goal</div>
        <div style={{ color: "#bbb" }}>
        Use the correct troops and bonuses to minimize losses when attacking a Citadel.
        I took care of the proper troops selection.
        </div>
    </div>

    <div>
        <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: "#e53e3e" }}>❗ Most Important Rule</div>
        <div style={{ color: "#bbb", borderLeft: `4px solid #e53e3e`, paddingLeft: 12 }}>
        Maximize <b style={{ color: "#fff" }}>First Striker Health</b>.
        In a proper attack, the First Striker is the only troop group that should take losses.
        If you are losing other troops, check your bonuses or troop counts.
        <br /><br />
        The number of <b style={{ color: "#fff" }}>FIRST STRIKER</b> troops
        <b style={{ color: "#fff" }}> CAN</b> be higher than calculated.
        All other troops <b style={{ color: "#fff" }}>MUST</b> be used in the exact number
        as calculated.
        </div>
    </div>

    <div>
        <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: "#4299e1" }}>🦅 First Striker</div>
        <div style={{ color: "#bbb" }}>
        Must be the strongest <b style={{ color: "#fff" }}>flying Guardsmen</b>:
        <b style={{ color: "#fff" }}> Corax</b> or <b style={{ color: "#fff" }}> Griffin</b>.
        </div>
    </div>

    <div>
        <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: "#4299e1" }}>🦸 Captains</div>
        <div style={{ color: "#bbb" }}>
        Recommended:
        <b style={{ color: "#fff" }}> Wu Zetian, Brunhild, Skadi, Beowulf, Aydae, Ramses, Sofia</b>.
        </div>
    </div>

    <div>
        <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: "#4299e1" }}>✨ Artifacts</div>
        <div style={{ color: "#bbb" }}>
        Use artifacts that increase Health for
        <b style={{ color: "#fff" }}> Flying</b>,
        <b style={{ color: "#fff" }}> Guardsmen</b>,
        or the <b style={{ color: "#fff" }}> Army</b>.
        (e.g., <b style={{ color: "#fff" }}>Valkyrie Diadem, Medallion, Belt, Flask</b>).
        </div>
    </div>

    <div>
        <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: "#4299e1" }}>🔄 Recalculate</div>
        <div style={{ color: "#bbb" }}>
        After ANY strength bonus change, enter new bonuses and press
        <b style={{ color: "#fff" }}> Calculate</b> again. Small changes matter!
        </div>
    </div>

    <div>
        <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: "#4299e1" }}>❓ How to find bonuses?</div>
        <div style={{ color: "#bbb" }}>
        Attack a level 10 Citadel with <b style={{ color: "#fff" }}>10 of each selected troop type</b>.
        Copy the bonuses from the attack report into the calculator.
        </div>
    </div>
  </div>
</Modal>

      </div>
    </div>
  );
}
