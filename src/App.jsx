import React, { useMemo, useState, useEffect, useRef } from "react";
import TB from "./tb_data.json";

/* =========================================
   🎨 TEMA I KONFIGURACIJA
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
    darkBg: "rgba(18, 18, 24, 0.95)",
    cardBg: "rgba(30, 30, 35, 0.85)",
    inputBg: "#000000",
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
   🧩 UI KOMPONENTE (S FIXEVIMA ZA ŠIRINU I Z-INDEX)
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
    <div ref={wrapperRef} style={{ position: "relative", width: "100%", zIndex: isOpen ? 9999 : 10, boxSizing: "border-box" }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%", minHeight: "50px", padding: "8px 12px", background: "#000",
          border: `1px solid ${isOpen ? THEME.colors.gold : "rgba(255,255,255,0.2)"}`,
          borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "space-between", 
          cursor: "pointer", boxSizing: "border-box"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", color: value ? "#fff" : "#777", overflow: "hidden" }}>
          {iconSrcForTroop(value) ? <img src={iconSrcForTroop(value)} width="36" height="36" style={{ borderRadius: "6px", flexShrink: 0 }} alt="" /> : <div style={{width:36, height:36, background: "rgba(255,255,255,0.05)", borderRadius: 6}}/>}
          <span style={{ fontWeight: "600", fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value || "Select Troop"}</span>
        </div>
        <span style={{ color: THEME.colors.gold, flexShrink: 0, marginLeft: 10 }}>{isOpen ? "▲" : "▼"}</span>
      </div>

      {isOpen && (
        <div style={{
          position: "absolute", top: "55px", left: 0, right: 0, background: "#15151a",
          border: `1px solid ${THEME.colors.gold}`, borderRadius: "10px", maxHeight: "250px",
          overflowY: "auto", zIndex: 10000, boxShadow: "0 10px 40px rgba(0,0,0,0.9)"
        }}>
          {options.filter(o => o).map(opt => (
            <div key={opt} onClick={() => { onChange(opt); setIsOpen(false); }}
              style={{ padding: "10px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid #222", cursor: "pointer" }}>
              <img src={iconSrcForTroop(opt)} width="40" height="40" style={{ borderRadius: "6px" }} alt="" />
              <span style={{ color: "#eee", fontSize: "14px" }}>{opt}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

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

const BonusInput = ({ label, color, ...props }) => (
  <div style={{ width: "100%", boxSizing: "border-box" }}>
    <label style={{ fontSize: "11px", color: color || THEME.colors.gold, fontWeight: "bold", display: "block", marginBottom: "6px", textTransform: "uppercase" }}>{label}</label>
    <div style={{ position: "relative", width: "100%", boxSizing: "border-box" }}>
      <input 
        {...props} 
        style={{ 
          width: "100%", padding: "12px", background: "#000", border: `1px solid ${color || "#444"}`, 
          borderRadius: "8px", color: "#fff", fontSize: "16px", fontWeight: "bold", 
          textAlign: "center", boxSizing: "border-box", outline: "none" 
        }} 
      />
      <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#666", fontWeight: "bold" }}>%</span>
    </div>
  </div>
);

/* =========================================
   ⚙️ LOGIKA KALKULATORA (ORIGINALNA IZ APP_GEMINI)
   ========================================= */

const STRIKER_LABELS = ["First Striker", "Second Striker", "Third Striker", "Cleanup 1", "Cleanup 2", "Cleanup 3", "Cleanup 4", "Cleanup 5", "Cleanup 6"];
const RESULT_ORDER = ["Wyvern", "Warregal", "Jago", "Ariel", "Epic Monster Hunter", "Fire Phoenix II", "Fire Phoenix I", "Manticore", "Corax II", "Royal Lion II", "Corax I", "Royal Lion I", "Griffin VII", "Josephine II", "Griffin VI", "Josephine I", "Griffin V", "Siege Ballistae VII", "Siege Ballistae VI", "Punisher I", "Duelist I", "Catapult V", "Vulture VII", "Heavy Halberdier VII", "Heavy Knight VII", "Catapult IV", "Vulture VI", "Heavy Halberdier VI", "Heavy Knight VI", "Spearmen V", "Swordsmen V", "Vulture V"];
const TROOPS_WITH_M8_RAW = ["Wyvern", "Warregal", "Jago", "Ariel", "Epic Monster Hunter", "Fire Phoenix II", "Fire Phoenix I", "Manticore", "Corax II", "Royal Lion II", "Corax I", "Royal Lion I", "Griffin VII", "Josephine II", "Griffin VI", "Josephine I", "Griffin V", "Siege Ballistae VII", "Siege Ballistae VI", "Catapult V", "Vulture VII", "Catapult IV", "Vulture VI", "Vulture V"];
const TROOPS_WITHOUT_M8_RAW = ["Wyvern", "Warregal", "Jago", "Ariel", "Epic Monster Hunter", "Manticore", "Corax I", "Royal Lion I", "Griffin VII", "Josephine II", "Griffin VI", "Josephine I", "Griffin V", "Siege Ballistae VII", "Siege Ballistae VI", "Punisher I", "Duelist I", "Catapult V", "Vulture VII", "Heavy Halberdier VII", "Heavy Knight VII", "Catapult IV", "Vulture VI", "Heavy Halberdier VI", "Heavy Knight VI", "Spearmen V", "Swordsmen V", "Vulture V"];
const WALL_KILLER_NAMES_RAW = ["Ariel", "Josephine II", "Josephine I", "Siege Ballistae VII", "Siege Ballistae VI", "Catapult V", "Catapult IV"];

function toNum(v) { const n = Number(v); return Number.isFinite(n) ? n : 0; }
function fmtInt(n) { return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(Math.floor(n || 0)); }
function normName(s) { return String(s ?? "").toLowerCase().replace(/\s+/g, " ").trim(); }

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

  const cit = TB.citadels?.[citadelLevel];
  const targets = mode === "WITH" ? cit?.m8m9Targets : cit?.normalTargets;
  
  const poolAll = useMemo(() => (mode === "WITH" ? TROOPS_WITH_M8_RAW : TROOPS_WITHOUT_M8_RAW).map(r => canon.get(normName(r))).filter(Boolean), [mode, canon]);
  const wallKillerPool = useMemo(() => WALL_KILLER_NAMES_RAW.map(r => canon.get(normName(r))).filter(Boolean), [canon]);
  
  const firstAllowed = useMemo(() => {
    const rawList = mode === "WITH" ? TB.firstStrikerAllowed.WITH : TB.firstStrikerAllowed.WITHOUT;
    return rawList.map(r => canon.get(normName(r))).filter(Boolean);
  }, [mode, canon]);

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

  const calculate = () => {
    const counts = new Map();
    const add = (n, q) => { if(n) counts.set(normName(n), (counts.get(normName(n)) || 0) + q); };

    // Wall Killer Logic
    const wkt = troopByName.get(wallKillerTroop);
    const wDmg = (wkt?.strength || 0) * (1 + (toNum(wallKillerBonusPct) + (wkt?.fortBonus || 0))/100) * 20;
    if (wDmg > 0) add(wallKillerTroop, Math.ceil(cit.wallHP / wDmg));

    // Strikers Logic
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
    setCalcOutput({ troops: ordered, citadel: citadelLevel, mode });
    setResultsOpen(true);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundImage: "url('./bg.jpg')", backgroundSize: "cover", backgroundAttachment: "fixed", color: "#fff", paddingBottom: "120px", boxSizing: "border-box" }}>
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 0 }} />
      
      <div style={{ position: "relative", maxWidth: "600px", margin: "0 auto", padding: "20px", zIndex: 1 }}>
        <h1 style={{ fontFamily: "'Cinzel', serif", color: THEME.colors.goldBright, textAlign: "center", fontSize: "28px", textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>CITADEL CALCULATOR</h1>

        {/* SETUP */}
        <div style={{ background: THEME.colors.cardBg, borderRadius: "15px", padding: "20px", marginBottom: "20px", border: "1px solid rgba(255,255,255,0.1)", boxSizing: "border-box" }}>
          <button onClick={() => setHelpOpen(true)} style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "#333", color: "#fff", border: "none", marginBottom: "15px", fontWeight: "bold", cursor: "pointer" }}>ℹ️ INSTRUCTIONS</button>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <select value={mode} onChange={e => setMode(e.target.value)} style={{ padding: "12px", background: "#000", color: "#fff", borderRadius: "8px", border: "1px solid #444", width: "100%" }}>
              <option value="WITHOUT">No M8/M9</option><option value="WITH">With M8/M9</option>
            </select>
            <select value={citadelLevel} onChange={e => setCitadelLevel(e.target.value)} style={{ padding: "12px", background: "#000", color: "#fff", borderRadius: "8px", border: "1px solid #444", width: "100%" }}>
              {citadelKeys.map(k => <option key={k} value={k}>Elven {k}</option>)}
            </select>
          </div>
        </div>

        {/* WALL BREAKER */}
        <div style={{ background: THEME.colors.cardBg, borderRadius: "15px", padding: "20px", marginBottom: "20px", border: `1px solid ${THEME.colors.goldDim}`, boxSizing: "border-box" }}>
          <div style={{ fontFamily: "'Cinzel', serif", color: THEME.colors.goldBright, marginBottom: "15px", fontSize: "16px" }}>🛡️ WALL BREAKER</div>
          <CustomTroopSelect value={wallKillerTroop} options={wallKillerPool} onChange={setWallKillerTroop} />
          <div style={{ marginTop: "15px" }}>
             <BonusInput label="STRENGTH BONUS" value={wallKillerBonusPct} onChange={e => setWallKillerBonusPct(e.target.value)} placeholder="0" />
          </div>
        </div>

        {/* STRIKERS */}
        {STRIKER_LABELS.map((lbl, idx) => (
          <div key={idx} style={{ background: THEME.colors.cardBg, borderRadius: "15px", padding: "20px", marginBottom: "20px", border: "1px solid rgba(255,255,255,0.1)", boxSizing: "border-box" }}>
            <div style={{ fontFamily: "'Cinzel', serif", marginBottom: "15px", fontSize: "14px", color: THEME.colors.goldBright }}>{idx+1}. {lbl}</div>
            <CustomTroopSelect 
               value={strikerTroops[idx]} 
               options={idx === 0 ? firstAllowed : (idx === 1 ? (mode === "WITH" ? ["Fire Phoenix II", "Fire Phoenix I"] : ["Manticore"]) : poolAll)} 
               onChange={v => handleTroopChange(idx, v)} 
            />
            
            <div style={{ display: "grid", gridTemplateColumns: idx === 0 ? "1fr 1fr" : "1fr", gap: "15px", marginTop: "15px" }}>
               {idx === 0 && (
                 <BonusInput label="HP BONUS" color="#fc8181" value={firstHealthBonusPct} onChange={e => setFirstHealthBonusPct(e.target.value)} placeholder="0" />
               )}
               <BonusInput label="STR BONUS" color="#63b3ed" value={strikerBonusPct[idx]} onChange={e => {
                  const next = [...strikerBonusPct]; next[idx] = e.target.value; setStrikerBonusPct(next);
               }} placeholder="0" />
            </div>
          </div>
        ))}

        {/* FOOTER ACTION */}
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "16px", background: "rgba(0,0,0,0.95)", borderTop: `2px solid ${THEME.colors.gold}`, zIndex: 1000 }}>
          <button onClick={calculate} style={{ width: "100%", maxWidth: "560px", margin: "0 auto", display: "block", padding: "16px", borderRadius: "12px", background: `linear-gradient(to right, ${THEME.colors.goldDim}, ${THEME.colors.gold})`, border: "none", color: "#000", fontWeight: "900", fontSize: "18px", fontFamily: "'Cinzel', serif", cursor: "pointer" }}>⚔️ CALCULATE RESULTS ⚔️</button>
        </div>

        {/* MODALS */}
        <Modal open={!!warningMsg} title="⚠️ INVALID STRIKER ORDER" onClose={() => setWarningMsg("")}>
          <p style={{ lineHeight: "1.6", whiteSpace: "pre-wrap", color: "#fff", fontSize: "15px" }}>{warningMsg}</p>
          <button onClick={() => setWarningMsg("")} style={{ width: "100%", padding: "14px", background: THEME.colors.gold, border: "none", borderRadius: "8px", marginTop: "20px", fontWeight: "bold", cursor: "pointer", fontSize: "16px" }}>OK</button>
        </Modal>

        <Modal open={resultsOpen} title="📋 VICTORY PLAN" onClose={() => setResultsOpen(false)}>
          <div style={{ display: "grid", gap: "10px" }}>
            {calcOutput?.troops.map((t, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "rgba(255,255,255,0.05)", borderRadius: "10px", borderLeft: `4px solid ${THEME.colors.gold}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <img src={iconSrcForTroop(t.troop)} width="40" height="40" style={{borderRadius:6}} alt=""/>
                  <span style={{ fontWeight: "bold", color: "#eee" }}>{t.troop}</span>
                </div>
                <span style={{ color: THEME.colors.goldBright, fontSize: "20px", fontWeight: "900" }}>{fmtInt(t.required)}</span>
              </div>
            ))}
          </div>
        </Modal>

        <Modal open={helpOpen} title="ℹ️ INSTRUCTIONS & HELP" onClose={() => setHelpOpen(false)}>
           <div style={{ fontSize: "14px", lineHeight: "1.6", display: "grid", gap: "15px", color: "#ccc" }}>
              <p><b style={{color: THEME.colors.accent}}>🎯 Goal:</b> Minimize losses by using correct troops and bonuses. Selection rules are enforced automatically.</p>
              <p><b style={{color: THEME.colors.danger}}>❗ Important Rule:</b> Only First Striker should take losses. Maximize their Health. All other troops MUST be used in the exact number as calculated.</p>
              <p><b>🔄 Recalculate:</b> Small bonus changes matter! Enter precise values from your reports and hit Calculate again.</p>
              <hr style={{opacity:0.1}}/>
              <p style={{fontSize: "12px", fontStyle: "italic"}}>Recommended Captains: Wu Zetian, Brunhild, Skadi, Beowulf, Aydae, Ramses, Sofia.</p>
           </div>
        </Modal>

      </div>
    </div>
  );
}
