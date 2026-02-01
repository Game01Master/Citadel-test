import React, { useMemo, useState, useEffect } from "react";
import TB from "./tb_data.json";

// --- ERROR BOUNDARY (Da spriječi bijeli ekran i prikaže grešku) ---
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error: error, errorInfo: errorInfo });
    console.error("App Crash:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: "red", background: "#fff" }}>
          <h2>⚠️ Došlo je do greške (App Crashed)</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {this.state.error && this.state.error.toString()}
          </pre>
          <br />
          <p>Osvježi stranicu. Ako se greška ponavlja, pošalji mi tekst iznad.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- KONSTANTE I POMOĆNE FUNKCIJE ---

const MODE_WITHOUT = "WITHOUT";
const MODE_WITH = "WITH";

const STRIKER_LABELS = [
  "First Striker",
  "Second Striker",
  "Third Striker",
  "Cleanup 1",
  "Cleanup 2",
  "Cleanup 3",
  "Cleanup 4",
  "Cleanup 5",
  "Cleanup 6",
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

// Mapiranje ikona
const ICON_FILE_MAP = {
  "Corax II": "Corax II.png",
  "Corax I": "Corax I.png",
  "Griffin VII": "Griffin VII.png",
  "Griffin VI": "Griffin VI.png",
  "Griffin V": "Griffin V.png",
  "Wyvern": "Wyvern.png",
  "Warregal": "Warregal.png",
  "Jago": "Jago.png",
  "Epic Monster Hunter": "Epic Monster Hunter.png",
  "Royal Lion II": "Royal Lion II.png",
  "Royal Lion I": "Royal Lion I.png",
  "Vulture VII": "Vulture VII.png",
  "Vulture VI": "Vulture VI.png",
  "Vulture V": "Vulture V.png",
  "Fire Phoenix II": "Fire Phoenix II.png",
  "Fire Phoenix I": "Fire Phoenix I.png",
  "Manticore": "Manticore.png",
  "Ariel": "Ariel.png",
  "Josephine II": "Josephine II.png",
  "Josephine I": "Josephine I.png",
  "Siege Ballistae VII": "Siege Ballistae VII.png",
  "Siege Ballistae VI": "Siege Ballistae VI.png",
  "Catapult V": "Catapult V.png",
  "Catapult IV": "Catapult IV.png",
  "Punisher I": "Punisher I.png",
  "Heavy Halberdier VII": "Heavy Halberdier VII.png",
  "Heavy Halberdier VI": "Heavy Halberdier VI.png",
  "Spearmen V": "Spearmen V.png",
  "Duelist I": "Duelist I.png",
  "Heavy Knight VII": "Heavy Knight VII.png",
  "Heavy Knight VI": "Heavy Knight VI.png",
  "Swordsmen V": "Swordsmen V.png",
};

// -- FUNKCIJE ZA OBRADU PODATAKA --
function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function fmtInt(n) {
  if (!Number.isFinite(n)) return "-";
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.floor(n));
}
function normName(s) {
  return String(s ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}

// Putanja do ikona - OVDJE JE PROMJENA
// Budući da imaš vite.config.js s base: '/Citadel-test/', slike u public/icons
// su dostupne na /Citadel-test/icons/...
// Ako koristiš custom domenu ili nešto drugo, ovo se automatski prilagođava relativno.
function iconSrcForTroop(name) {
  const file = ICON_FILE_MAP[name];
  if (!file) return null;
  // Pokušaj s relativnom putanjom koja poštuje base URL
  return `./icons/${file}`; 
}

// -- STILOVI I TEMA --
function usePrefersDark() {
  const [isDark, setIsDark] = useState(true); // Default na dark za sigurnost
  useEffect(() => {
    if (window.matchMedia) {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      setIsDark(mq.matches);
      const handler = (e) => setIsDark(!!e.matches);
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, []);
  return isDark;
}

function makeTheme(isDark) {
  return {
    pageBg: isDark ? "#121212" : "#f5f7fa",
    cardBg: isDark ? "#1e1e1e" : "#ffffff",
    border: isDark ? "#333333" : "#e0e4e8",
    borderSoft: isDark ? "#2c2c2c" : "#ebeff3",
    text: isDark ? "#e0e0e0" : "#2d3748",
    subtext: isDark ? "#a0aec0" : "#718096",
    inputBg: isDark ? "#2d2d2d" : "#edf2f7",
    inputBorder: isDark ? "#4a4a4a" : "#cbd5e0",
    btnBg: isDark ? "#4a90e2" : "#3182ce",
    btnText: "#ffffff",
    accent: isDark ? "#63b3ed" : "#4299e1",
    danger: "#e53e3e",
    shadow: isDark ? "0 4px 6px rgba(0,0,0,0.4)" : "0 4px 6px rgba(0,0,0,0.1)",
    overlay: isDark ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.6)",
    bottomBarBg: isDark ? "rgba(30,30,30,0.95)" : "rgba(255,255,255,0.95)",
  };
}

// -- UI KOMPONENTE --

function Card({ title, children, theme }) {
  return (
    <div style={{
      border: `1px solid ${theme.border}`, borderRadius: 16, padding: 16,
      background: theme.cardBg, boxShadow: theme.shadow, marginBottom: 16
    }}>
      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 12, color: theme.text }}>{title}</div>
      {children}
    </div>
  );
}

function TroopPicker({ label, value, options, onChange, theme }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ color: theme.subtext, fontSize: 13, marginBottom: 4, fontWeight: 600 }}>{label}</div>
      <div style={{ position: "relative" }}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%", padding: "12px", borderRadius: 10,
            border: `1px solid ${theme.inputBorder}`,
            background: theme.inputBg, color: theme.text,
            fontSize: 16, appearance: "none", outline: "none"
          }}
        >
          {options.map(opt => (
            <option key={opt || "blank"} value={opt}>{opt || "— Select —"}</option>
          ))}
        </select>
        {/* Prikaz ikone ako je odabrana */}
        {value && iconSrcForTroop(value) && (
          <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
            <img src={iconSrcForTroop(value)} alt="" width={30} height={30} style={{ borderRadius: 6 }} />
          </div>
        )}
      </div>
    </div>
  );
}

function InputRow({ label, value, onChange, theme }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ color: theme.subtext, fontSize: 13, marginBottom: 4, fontWeight: 600 }}>{label}</div>
      <input
        type="number" step="any" inputMode="decimal"
        placeholder="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%", padding: "12px", borderRadius: 10,
          border: `1px solid ${theme.inputBorder}`,
          background: theme.inputBg, color: theme.text,
          fontSize: 16, outline: "none"
        }}
        onFocus={(e) => e.target.select()}
      />
    </div>
  );
}

function InfoRow({ label, value, theme, highlight }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${theme.borderSoft}` }}>
      <span style={{ color: theme.subtext, fontSize: 14 }}>{label}</span>
      <span style={{ fontWeight: 700, color: highlight ? theme.accent : theme.text }}>{value}</span>
    </div>
  );
}

function Modal({ open, title, onClose, children, theme }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, background: theme.overlay, zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: theme.cardBg, width: "100%", maxWidth: 480, borderRadius: 20,
        maxHeight: "85vh", display: "flex", flexDirection: "column", overflow: "hidden"
      }}>
        <div style={{ padding: 16, borderBottom: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 700, fontSize: 18, color: theme.text }}>{title}</span>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: theme.text, fontSize: 24 }}>✕</button>
        </div>
        <div style={{ padding: 16, overflowY: "auto" }}>{children}</div>
      </div>
    </div>
  );
}

// --- GLAVNA APLIKACIJA ---

function AppContent() {
  const isDark = usePrefersDark();
  const theme = useMemo(() => makeTheme(isDark), [isDark]);

  // SAFEGUARD: Provjera podataka
  if (!TB || !TB.troops) {
    return <div style={{ padding: 20, color: "red" }}>Error: tb_data.json nije ispravno učitan.</div>;
  }

  const citadelKeys = Object.keys(TB.citadels ?? {});
  const troops = TB.troops ?? [];
  const additionalBonus = TB.additionalBonusNormal ?? {};
  const phoenixExtra = TB.phoenixExtra ?? {};
  const firstStrikerAllowed = TB.firstStrikerAllowed ?? {};

  // Canonical mapping
  const canon = useMemo(() => {
    const m = new Map();
    for (const t of troops) m.set(normName(t.name), t.name);
    if (m.has(normName("Royal Lion I"))) m.set(normName("Royla Lion I"), m.get(normName("Royal Lion I")));
    return m;
  }, [troops]);

  const troopByName = useMemo(() => new Map(troops.map((t) => [t.name, t])), [troops]);

  // State
  const [citadelLevel, setCitadelLevel] = useState(citadelKeys[0] ?? "25");
  const [mode, setMode] = useState(MODE_WITHOUT);

  const [strikerTroops, setStrikerTroops] = useState(Array(9).fill(""));
  const [strikerBonusPct, setStrikerBonusPct] = useState(Array(9).fill(""));
  const [firstHealthBonusPct, setFirstHealthBonusPct] = useState("");
  
  const [wallKillerTroop, setWallKillerTroop] = useState("");
  const [wallKillerBonusPct, setWallKillerBonusPct] = useState("");

  const [resultsOpen, setResultsOpen] = useState(false);
  const [calcOutput, setCalcOutput] = useState(null);
  const [warningMsg, setWarningMsg] = useState("");

  // Helpers
  const getBaseStrength = (name) => {
    const t = troopByName.get(name);
    return t ? Number(t.baseStrength || t.base_strength || t.strength || 0) : 0;
  };
  const getBaseHealth = (name) => {
    const t = troopByName.get(name);
    return t ? Number(t.baseHealth || t.base_health || t.health || 0) : 0;
  };

  // Pools
  const poolAll = useMemo(() => {
    const raw = mode === MODE_WITH ? TROOPS_WITH_M8_RAW : TROOPS_WITHOUT_M8_RAW;
    return [...new Set(raw.map(r => canon.get(normName(r))).filter(Boolean))];
  }, [mode, canon]);

  const wallKillerPool = useMemo(() => {
    return [...new Set(WALL_KILLER_NAMES_RAW.map(r => canon.get(normName(r))).filter(Boolean))];
  }, [canon]);

  const nonWallPool = useMemo(() => {
    const wallSet = new Set(wallKillerPool.map(normName));
    return poolAll.filter(n => !wallSet.has(normName(n)));
  }, [poolAll, wallKillerPool]);

  const secondAllowed = useMemo(() => {
    const manticore = canon.get(normName("Manticore"));
    const fp1 = canon.get(normName("Fire Phoenix I"));
    const fp2 = canon.get(normName("Fire Phoenix II"));
    if (mode === MODE_WITHOUT) return manticore ? [manticore] : [];
    return [fp2, fp1].filter(Boolean);
  }, [mode, canon]);

  const firstAllowed = useMemo(() => {
    const rawList = mode === MODE_WITH ? firstStrikerAllowed.WITH : firstStrikerAllowed.WITHOUT;
    const allowedSet = new Set(nonWallPool.map(normName));
    return (rawList || []).map(r => canon.get(normName(r))).filter(Boolean).filter(n => allowedSet.has(normName(n)));
  }, [mode, firstStrikerAllowed, nonWallPool, canon]);

  // Normalizacija i inicijalizacija
  useEffect(() => {
     // Postavi wall killera ako je prazan
     if (!wallKillerTroop && wallKillerPool.length > 0) {
       setWallKillerTroop(wallKillerPool[0]);
     }
     
     // Prisilno postavi 2. strikera ako nije validan
     setStrikerTroops(prev => {
        const next = [...prev];
        const secFallback = secondAllowed[0] || "";
        if (!next[1] || !secondAllowed.includes(next[1])) {
           next[1] = secFallback;
           return next;
        }
        return prev;
     });
  }, [mode, wallKillerPool, secondAllowed, wallKillerTroop]);


  const handleTroopChange = (idx, picked) => {
    // Validacija
    if (idx >= 2 && picked) {
       const first = strikerTroops[0];
       const allowedInFirst = firstAllowed.includes(picked);
       if (first && allowedInFirst) {
          const fs = getBaseStrength(first);
          const fh = getBaseHealth(first);
          const ps = getBaseStrength(picked);
          const ph = getBaseHealth(picked);
          if (ps > fs || ph > fh) {
            setWarningMsg(`Cannot use ${picked} here! It is stronger than your First Striker.`);
            return;
          }
       }
    }
    
    // Set troop and remove duplicates
    setStrikerTroops(prev => {
      const next = [...prev];
      // Ako troop već postoji negdje drugdje, brišemo ga tamo
      for(let i=0; i<9; i++) {
        if (i !== idx && next[i] === picked) next[i] = "";
      }
      next[idx] = picked;
      return next;
    });
    setCalcOutput(null);
  };

  const handleBonusChange = (idx, val) => {
    setStrikerBonusPct(prev => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
    setCalcOutput(null);
  };

  const cit = TB.citadels?.[citadelLevel];
  const targets = mode === MODE_WITH ? cit?.m8m9Targets : cit?.normalTargets;

  // Izračun wall killera
  const wallCalc = useMemo(() => {
     if (!cit) return { troops: 0, bonus: 0 };
     const t = troopByName.get(wallKillerTroop);
     const bs = t ? toNum(t.strength) : 0;
     const fort = t ? toNum(t.fortBonus || 0) : 0;
     const effBonus = toNum(wallKillerBonusPct) + fort;
     const dmg = bs * (1 + effBonus/100) * 20;
     return {
       bonus: effBonus,
       troops: dmg > 0 ? Math.ceil(toNum(cit.wallHP) / dmg) : 0
     };
  }, [cit, wallKillerTroop, wallKillerBonusPct, troopByName]);

  // Izračun strikera
  const calculate = () => {
    if (!cit || !targets) return;
    
    // First striker deaths
    const t1 = troopByName.get(strikerTroops[0]);
    const hp1 = t1 ? toNum(t1.health) : 0;
    const effHp1 = hp1 * (1 + toNum(firstHealthBonusPct)/100);
    const deaths = effHp1 > 0 ? Math.floor(toNum(cit.firstStrikeDamage)/effHp1) : 0;

    const lines = STRIKER_LABELS.map((lbl, idx) => {
       const name = strikerTroops[idx];
       if (!name) return { name: "", req: 0, bonus: 0 };
       
       const t = troopByName.get(name);
       let b = toNum(strikerBonusPct[idx]);
       if (additionalBonus[name]) b += toNum(additionalBonus[name]);
       if (mode === MODE_WITH && idx === 1 && phoenixExtra[name]) b += toNum(phoenixExtra[name]);
       
       const s = t ? toNum(t.strength) : 0;
       const dmg = s * (1 + b/100);
       let req = dmg > 0 ? Math.floor(toNum(targets[idx]) / dmg) : 0;
       if (idx === 0) req += deaths;
       
       return { name, req, bonus: b, idx };
    });

    // Grupiranje za prikaz
    const counts = {};
    if (wallKillerTroop) counts[wallKillerTroop] = (counts[wallKillerTroop]||0) + wallCalc.troops;
    lines.forEach(l => {
      if (l.name && l.req > 0) counts[l.name] = (counts[l.name]||0) + l.req;
    });

    const finalOrder = RESULT_ORDER.filter(n => counts[n] > 0).map(n => ({
      troop: n, required: counts[n]
    }));

    setCalcOutput({
       lines, finalOrder, 
       citadel: `Elven ${citadelLevel}`, 
       modeStr: mode === MODE_WITH ? "With M8/M9" : "Without M8/M9"
    });
    setResultsOpen(true);
  };
  
  const resetAll = () => {
     setStrikerTroops(Array(9).fill(""));
     setStrikerBonusPct(Array(9).fill(""));
     setFirstHealthBonusPct("");
     setWallKillerBonusPct("");
     setCalcOutput(null);
     // Trigger useEffect za setiranje defaulta
     setMode(mode === MODE_WITH ? MODE_WITHOUT : MODE_WITH);
     setTimeout(() => setMode(mode), 50); 
  };

  return (
    <div style={{ background: theme.pageBg, minHeight: "100vh", padding: "20px 16px", paddingBottom: 100, color: theme.text, fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center", color: theme.accent, marginTop: 0 }}>Citadel Calc</h1>
      
      {/* Setup Card */}
      <Card title="⚙️ Setup" theme={theme}>
         <div style={{display:"grid", gap:12}}>
            <div>
               <div style={{fontSize:13, color:theme.subtext}}>Mode</div>
               <select style={{width:"100%", padding:10, background:theme.inputBg, color:theme.text, border:`1px solid ${theme.inputBorder}`, borderRadius:8}} 
                  value={mode} onChange={e => setMode(e.target.value)}>
                  <option value={MODE_WITHOUT}>Without M8/M9</option>
                  <option value={MODE_WITH}>With M8/M9</option>
               </select>
            </div>
            <div>
               <div style={{fontSize:13, color:theme.subtext}}>Citadel Level</div>
               <select style={{width:"100%", padding:10, background:theme.inputBg, color:theme.text, border:`1px solid ${theme.inputBorder}`, borderRadius:8}}
                  value={citadelLevel} onChange={e => setCitadelLevel(e.target.value)}>
                  {citadelKeys.map(k => <option key={k} value={k}>Elven {k}</option>)}
               </select>
            </div>
            <button onClick={resetAll} style={{padding:10, background: theme.inputBg, border:`1px solid ${theme.danger}`, color:theme.danger, borderRadius:8, fontWeight:"bold"}}>
               Reset All
            </button>
         </div>
      </Card>

      {/* Wall Killer */}
      <Card title="🛡️ Wall Killer" theme={theme}>
         <TroopPicker label="Troop" value={wallKillerTroop} options={wallKillerPool} onChange={setWallKillerTroop} theme={theme} />
         <InputRow label="Strength Bonus (%)" value={wallKillerBonusPct} onChange={setWallKillerBonusPct} theme={theme} />
         <div style={{background:theme.inputBg, padding:10, borderRadius:8, marginTop:8}}>
            <InfoRow label="Required" value={fmtInt(wallCalc.troops)} theme={theme} highlight />
         </div>
      </Card>

      {/* Strikers */}
      {STRIKER_LABELS.map((lbl, idx) => {
         const isFirst = idx === 0;
         const currentLine = calcOutput?.lines[idx];
         // Opcije - filtriraj već odabrane osim trenutnog
         const usedElsewhere = new Set(strikerTroops.filter((_, i) => i !== idx));
         
         let pool = nonWallPool;
         if (idx === 0) pool = firstAllowed;
         if (idx === 1) pool = secondAllowed;
         
         const opts = idx === 1 
            ? pool 
            : ["", ...pool.filter(n => !usedElsewhere.has(n))];

         return (
            <Card key={idx} title={`${idx+1}. ${lbl}`} theme={theme}>
               <TroopPicker label="Select Troop" value={strikerTroops[idx]} options={opts} onChange={v => handleTroopChange(idx, v)} theme={theme} />
               
               {isFirst && (
                 <InputRow label="Health Bonus (%)" value={firstHealthBonusPct} onChange={setFirstHealthBonusPct} theme={theme} />
               )}
               
               <InputRow label="Strength Bonus (%)" value={strikerBonusPct[idx]} onChange={v => handleBonusChange(idx, v)} theme={theme} />
               
               {currentLine && (
                  <div style={{background:theme.inputBg, padding:10, borderRadius:8, marginTop:8}}>
                     <InfoRow label="Required" value={fmtInt(currentLine.req)} theme={theme} highlight />
                     <InfoRow label="Eff. Bonus" value={`${fmtInt(currentLine.bonus)}%`} theme={theme} />
                  </div>
               )}
            </Card>
         );
      })}

      {/* Calculate Button */}
      <div style={{position:"fixed", bottom:0, left:0, right:0, padding:16, background: theme.bottomBarBg, borderTop:`1px solid ${theme.border}`}}>
         <button onClick={calculate} style={{
            width:"100%", padding:16, borderRadius:12, border:"none", 
            background:theme.accent, color:"#fff", fontSize:18, fontWeight:800,
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
         }}>
            CALCULATE
         </button>
      </div>

      {/* Modals */}
      <Modal open={!!warningMsg} title="Warning" onClose={() => setWarningMsg("")} theme={theme}>
         <div style={{color:theme.text}}>{warningMsg}</div>
         <button onClick={() => setWarningMsg("")} style={{marginTop:20, width:"100%", padding:10, background:theme.accent, color:"white", border:"none", borderRadius:8}}>OK</button>
      </Modal>

      <Modal open={resultsOpen} title="Results" onClose={() => setResultsOpen(false)} theme={theme}>
         {calcOutput && (
           <div>
             <div style={{textAlign:"center", marginBottom:16, color:theme.subtext}}>
                {calcOutput.citadel} | {calcOutput.modeStr}
             </div>
             {calcOutput.finalOrder.map((item, i) => (
               <div key={i} style={{
                  display:"flex", alignItems:"center", justifyContent:"space-between", 
                  padding:12, marginBottom:8, background:theme.inputBg, borderRadius:10
               }}>
                  <div style={{display:"flex", alignItems:"center", gap:10}}>
                     {iconSrcForTroop(item.troop) && <img src={iconSrcForTroop(item.troop)} width={40} height={40} style={{borderRadius:8}} />}
                     <span style={{fontWeight:600, color:theme.text}}>{item.troop}</span>
                  </div>
                  <span style={{fontWeight:800, fontSize:18, color:theme.accent}}>{fmtInt(item.required)}</span>
               </div>
             ))}
             {calcOutput.finalOrder.length === 0 && <div style={{textAlign:"center"}}>No troops required or invalid selection.</div>}
           </div>
         )}
      </Modal>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
