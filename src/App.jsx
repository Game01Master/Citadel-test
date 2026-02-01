import React, { useMemo, useState, useEffect, useRef } from "react";
import TB from "./tb_data.json";

/* =========================================
   🎨 TEMA I STILOVI (ZLATNA "GAME" VERZIJA)
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
    text: "#E0E0E0",
    textDim: "#A0AEC0",
    accent: "#4299e1",
    danger: "#e53e3e",
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
   🧩 UI KOMPONENTE (POPRAVLJENI LAYOUT I Z-INDEX)
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
    // Z-index: Kada je otvoren, stavljamo ga na 100 da bude iznad svega.
    <div ref={wrapperRef} style={{ position: "relative", width: "100%", zIndex: isOpen ? 100 : 1 }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%", minHeight: "50px", padding: "8px 12px", background: "rgba(0, 0, 0, 0.6)",
          border: `1px solid ${isOpen ? THEME.colors.gold : "rgba(255,255,255,0.2)"}`,
          borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "space-between", 
          cursor: "pointer", boxSizing: "border-box"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", color: value ? "#fff" : "#888", overflow: "hidden" }}>
          {iconSrcForTroop(value) ? <img src={iconSrcForTroop(value)} width="36" height="36" style={{ borderRadius: "6px", flexShrink: 0 }} alt="" /> : <div style={{width:36, height:36, borderRadius: 6, background: "rgba(255,255,255,0.05)"}}/>}
          <span style={{ fontWeight: "600", fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value || "Select Troop"}</span>
        </div>
        <span style={{ color: THEME.colors.gold, flexShrink: 0, marginLeft: 10 }}>{isOpen ? "▲" : "▼"}</span>
      </div>

      {isOpen && (
        <div style={{
          position: "absolute", top: "55px", left: 0, right: 0, background: "#1a1a20",
          border: `1px solid ${THEME.colors.gold}`, borderRadius: "10px", maxHeight: "250px",
          overflowY: "auto", zIndex: 9999, boxShadow: "0 10px 40px rgba(0,0,0,0.95)"
        }}>
          {options.filter(o => o).map(opt => (
            <div key={opt} onClick={() => { onChange(opt); setIsOpen(false); }}
              style={{ padding: "12px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: "pointer" }}>
              <img src={iconSrcForTroop(opt)} width="40" height="40" style={{ borderRadius: "6px" }} alt="" />
              <span style={{ color: "#eee", fontSize: "14px", fontWeight: "500" }}>{opt}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const BonusInput = ({ label, color, ...props }) => (
  <div style={{ width: "100%", boxSizing: "border-box" }}>
    <label style={{ fontSize: "11px", color: color || THEME.colors.gold, fontWeight: "bold", display: "block", marginBottom: "6px", textTransform: "uppercase" }}>{label}</label>
    <div style={{ position: "relative", width: "100%", boxSizing: "border-box" }}>
      <input 
        {...props} 
        style={{ 
          width: "100%", padding: "12px", background: "rgba(0, 0, 0, 0.6)", border: `1px solid ${color || "rgba(255,255,255,0.2)"}`, 
          borderRadius: "8px", color: "#fff", fontSize: "16px", fontWeight: "bold", 
          textAlign: "center", boxSizing: "border-box", outline: "none" 
        }} 
      />
      <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#666", fontWeight: "bold" }}>%</span>
    </div>
  </div>
);

const GameCard = ({ title, children, isSpecial }) => (
  <div style={{
    // FIX: Nema overflow hidden da dropdown moze izaci van
    background: "rgba(30, 30, 35, 0.75)", 
    backdropFilter: "blur(8px)",
    border: `1px solid ${isSpecial ? THEME.colors.gold : "rgba(255,255,255,0.15)"}`,
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.5)",
    position: "relative",
    width: "100%", 
    boxSizing: "border-box"
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

const Modal = ({ open, title, onClose, children }) => {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: 15 }}>
      <div style={{ background: "#1a1a20", width: "100%", maxWidth: "500px", borderRadius: "20px", border: `1px solid ${THEME.colors.gold}`, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "15px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #333" }}>
          <span style={{ fontFamily: "'Cinzel', serif", color: THEME.colors.goldBright, fontWeight: "bold", fontSize: "16px" }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", fontSize: "28px", cursor: "pointer", padding: "0 10px", display: "flex", alignItems: "center" }}>✕</button>
        </div>
        <div style={{ padding: "20px", overflowY: "auto" }}>{children}</div>
      </div>
    </div>
  );
};

/* =========================================
   ⚙️ LOGIKA (KOPIRANA IZ APP_GEMINI.JSX)
   ========================================= */

const MODE_WITHOUT = "WITHOUT";
const MODE_WITH = "WITH";

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
  const [mode, setMode] = useState(MODE_WITHOUT);
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
  const targets = mode === MODE_WITH ? cit?.m8m9Targets : cit?.normalTargets;
  
  const poolAll = useMemo(() => (mode === MODE_WITH ? TROOPS_WITH_M8_RAW : TROOPS_WITHOUT_M8_RAW).map(r => canon.get(normName(r))).filter(Boolean), [mode, canon]);
  const wallKillerPool = useMemo(() => WALL_KILLER_NAMES_RAW.map(r => canon.get(normName(r))).filter(Boolean), [canon]);
  
  const firstAllowed = useMemo(() => {
    const rawList = mode === MODE_WITH ? TB.firstStrikerAllowed.WITH : TB.firstStrikerAllowed.WITHOUT;
    return rawList.map(r => canon.get(normName(r))).filter(Boolean);
  }, [mode, canon]);

  const normalize = (current) => {
    // Logika za resetiranje pri promjeni moda
    const next = [...current];
    // Provjere validnosti (pojednostavljeno za ovaj prikaz, ali bitno za rad)
    return next; 
  };

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
        setWarningMsg(`${STRIKER_LABELS[idx]} (${picked}) has higher BASE strength (${fmtInt(t.strength)}) and BASE health (${fmtInt(t.health)}) than your First striker (${first}, ${fmtInt(f.strength)} / ${fmtInt(f.health)}).\n\nChoose a stronger First striker troops!!`);
        return;
      }
    }
    const next = [...strikerTroops]; next[idx] = picked; setStrikerTroops(next);
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
      if (troopName && TB.additionalBonusNormal[troopName] !== undefined) effBonus += toNum(TB.additionalBonusNormal[troopName]);
      if (troopName && mode === MODE_WITH && idx === 1 && TB.phoenixExtra[troopName] !== undefined) effBonus += toNum(TB.phoenixExtra[troopName]);
      
      const baseStrength = troop ? toNum(troop.strength) : 0;
      const dmgPerTroop = baseStrength * (1 + effBonus / 100);
      const targetHP = toNum(targets[idx]);
      let required = dmgPerTroop > 0 ? Math.floor(targetHP / dmgPerTroop) : 0;
      if (idx === 0 && dmgPerTroop > 0) required += firstDeaths;
      return { idx, label, troopName, effBonus, requiredTroops: required };
    });
  }, [cit, targets, strikerTroops, strikerBonusPct, troopByName, mode, firstDeaths]);

  const calculate = () => {
    const counts = new Map();
    const add = (n, q) => { if(n) counts.set(normName(n), (counts.get(normName(n)) || 0) + q); };

    if (wallKillerTroop && wallKiller?.requiredTroops) add(wallKillerTroop, wallKiller.requiredTroops);
    for (const s of perStriker) { if (s?.troopName && s?.requiredTroops) add(s.troopName, s.requiredTroops); }

    const ordered = RESULT_ORDER.filter(n => counts.has(normName(n))).map(n => ({ troop: n, required: counts.get(normName(n)) }));
    setCalcOutput({ modeLabel: mode === MODE_WITH ? "With M8/M9" : "Without M8/M9", citadelLabel: `Elven ${citadelLevel}`, troops: ordered });
    setResultsOpen(true);
  };

  /* =========================================
     APP RENDER
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
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "600px", margin: "0 auto", padding: "20px 16px" }}>
        
        <div style={{ textAlign: "center", marginBottom: "32px", marginTop: "10px" }}>
           <h1 style={{ margin: 0, fontFamily: "'Cinzel', serif", color: THEME.colors.goldBright, fontSize: "32px", textShadow: "0 4px 10px rgba(0,0,0,0.8)" }}>
             CITADEL<br/>CALCULATOR by GM
           </h1>
        </div>

        {/* SETUP */}
        <GameCard title="⚙️ Setup">
          <button onClick={() => setHelpOpen(true)} style={{
             width:"100%", padding:"12px", marginBottom:"20px", borderRadius:"8px",
             border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.05)", color: "#ddd", cursor:"pointer",
             display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontWeight: "bold"
          }}>
             <span>ℹ️</span> Instructions
          </button>

          <div style={{ display: "grid", gap: "16px", marginBottom: "20px" }}>
             <div>
                <label style={{ fontSize: "12px", color: THEME.colors.textDim, display:"block", marginBottom:"6px", textTransform:"uppercase" }}>Do you have M8/M9 troops?</label>
                <select 
                   value={mode} onChange={(e) => handleModeChange(e.target.value)}
                   style={{ width: "100%", padding: "12px", background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", color: "#fff", fontSize:"16px", outline:"none" }}
                >
                   <option value={MODE_WITHOUT}>No</option>
                   <option value={MODE_WITH}>Yes</option>
                </select>
             </div>
             <div>
                <label style={{ fontSize: "12px", color: THEME.colors.textDim, display:"block", marginBottom:"6px", textTransform:"uppercase" }}>Citadel Level</label>
                <select 
                   value={citadelLevel} onChange={(e) => setCitadelLevel(e.target.value)}
                   style={{ width: "100%", padding: "12px", background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", color: "#fff", fontSize:"16px", outline:"none" }}
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
              
              <div style={{ background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "8px", marginTop: "10px" }}>
                 <div style={{display:"flex", justifyContent:"space-between", marginBottom:"4px"}}>
                    <span style={{color:THEME.colors.textDim, fontSize:"14px"}}>Effective Bonus</span>
                    <span style={{color:THEME.colors.accent, fontWeight:"bold"}}>{fmtInt(wallKiller.effBonus)}%</span>
                 </div>
                 <div style={{display:"flex", justifyContent:"space-between"}}>
                    <span style={{color:THEME.colors.textDim, fontSize:"14px"}}>Required Troops</span>
                    <span style={{color:THEME.colors.goldBright, fontWeight:"bold"}}>{fmtInt(wallKiller.requiredTroops)}</span>
                 </div>
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
                   <CustomTroopSelect value={strikerTroops[s.idx]} options={opts} onChange={(v) => handleTroopChange(s.idx, v)} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: isFirst ? "1fr 1fr" : "1fr", gap: "16px", marginBottom: "16px" }}>
                   {isFirst && (
                      <BonusInput label="Health Bonus (%)" color="#fc8181" value={firstHealthBonusPct} onChange={e => setFirstHealthBonusPct(e.target.value)} placeholder="0" />
                   )}
                   <BonusInput label="Strength Bonus (%)" color="#63b3ed" value={strikerBonusPct[s.idx]} onChange={e => {
                      const next = [...strikerBonusPct]; next[s.idx] = e.target.value; setStrikerBonusPct(next);
                   }} placeholder="0" />
                </div>
                
                <div style={{ background: "rgba(0,0,0,0.3)", borderRadius:"8px", padding:"12px" }}>
                   <div style={{display:"flex", justifyContent:"space-between", marginBottom:"4px"}}>
                      <span style={{color:THEME.colors.textDim, fontSize:"14px"}}>Effective Bonus</span>
                      <span style={{color:THEME.colors.accent, fontWeight:"bold"}}>{fmtInt(s.effBonus)}%</span>
                   </div>
                   <div style={{display:"flex", justifyContent:"space-between"}}>
                      <span style={{color:THEME.colors.textDim, fontSize:"14px"}}>Required Troops</span>
                      <span style={{color:THEME.colors.goldBright, fontWeight:"bold"}}>{fmtInt(s.requiredTroops)}</span>
                   </div>
                   {isFirst && (
                      <div style={{display:"flex", justifyContent:"space-between", marginTop:"8px", paddingTop:"8px", borderTop:"1px solid rgba(255,255,255,0.1)"}}>
                         <span style={{color:THEME.colors.textDim, fontSize:"13px"}}>Citadel First Strike Losses</span>
                         <span style={{color:THEME.colors.text, fontWeight:"bold"}}>{fmtInt(firstDeaths)}</span>
                      </div>
                   )}
                </div>
             </GameCard>
           );
        })}

        {/* BOTTOM BAR */}
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "16px", background: "rgba(10, 10, 12, 0.95)", borderTop: `1px solid ${THEME.colors.gold}`, backdropFilter: "blur(10px)", zIndex: 1000 }}>
           <div style={{ maxWidth: "600px", margin: "0 auto" }}>
             <button onClick={calculate} style={{
                width: "100%", padding: "16px", borderRadius: "10px", border: "none",
                background: `linear-gradient(135deg, ${THEME.colors.goldDim} 0%, ${THEME.colors.gold} 100%)`,
                color: "#000", fontWeight: "900", fontSize: "18px", letterSpacing: "1px",
                boxShadow: "0 0 20px rgba(197, 160, 89, 0.4)", cursor: "pointer", fontFamily: "'Cinzel', serif"
             }}>
                CALCULATE
             </button>
           </div>
        </div>

        {/* MODALS */}
        <Modal open={!!warningMsg} title="⚠️ Invalid Striker Order" onClose={() => setWarningMsg("")}>
          <p style={{ lineHeight: "1.6", whiteSpace: "pre-wrap", color: "#fff", fontSize: "15px" }}>{warningMsg}</p>
          <button onClick={() => setWarningMsg("")} style={{ width: "100%", padding: "14px", background: THEME.colors.gold, border: "none", borderRadius: "8px", marginTop: "20px", fontWeight: "bold", cursor: "pointer", fontSize: "16px" }}>OK</button>
        </Modal>

        <Modal open={resultsOpen} title="📋 Calculated Results" onClose={() => setResultsOpen(false)}>
          <div style={{ background: "rgba(255,255,255,0.05)", padding: "12px", borderRadius: "8px", marginBottom: "20px" }}>
             <div style={{display:"flex", justifyContent:"space-between", marginBottom:4}}>
                <span style={{color:THEME.colors.textDim}}>Mode</span><span style={{fontWeight:"bold"}}>{calcOutput?.modeLabel}</span>
             </div>
             <div style={{display:"flex", justifyContent:"space-between"}}>
                <span style={{color:THEME.colors.textDim}}>Citadel</span><span style={{fontWeight:"bold"}}>{calcOutput?.citadelLabel}</span>
             </div>
          </div>

          <button onClick={async () => {
              const list = calcOutput.troops.map(t => `${t.troop} - ${fmtInt(t.required)}`).join("\n");
              const ok = await copyToClipboard(list);
              setCopyNotice(ok ? "✅ Copied!" : "❌ Error");
              setTimeout(() => setCopyNotice(""), 1500);
           }} style={{ 
              width: "100%", padding: "14px", background: THEME.colors.accent, color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight:"bold", fontSize:"16px", marginBottom:"10px" 
           }}>
              📄 Copy List to Clipboard
           </button>
           {copyNotice && <div style={{textAlign:"center", color: THEME.colors.gold, fontWeight:"bold", marginBottom:10}}>{copyNotice}</div>}

          <div style={{ display: "grid", gap: "10px" }}>
            {calcOutput?.troops.map((t, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "rgba(20, 20, 25, 0.8)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {iconSrcForTroop(t.troop) && <img src={iconSrcForTroop(t.troop)} width="40" height="40" style={{borderRadius:6}} alt=""/>}
                  <span style={{ fontWeight: "bold", color: "#eee" }}>{t.troop}</span>
                </div>
                <span style={{ color: THEME.colors.goldBright, fontSize: "20px", fontWeight: "900" }}>{fmtInt(t.required)}</span>
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
