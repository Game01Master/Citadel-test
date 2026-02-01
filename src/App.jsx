import React, { useMemo, useState, useEffect } from "react";
// OVO JE KLJUČNO: Provjeri da se tvoja JSON datoteka zove točno ovako i da je u istoj mapi!
import TB_RAW from "./tb_data.json"; 

// Safety fallback u slučaju da json ne postoji ili je import failed
const TB = TB_RAW || {};

/* =========================================
   CONSTANTS & DATA
   ========================================= */

const MODE_WITHOUT = "WITHOUT";
const MODE_WITH = "WITH";

const STRIKER_LABELS = [
  "First Striker", "Second Striker", "Third Striker", 
  "Cleanup 1", "Cleanup 2", "Cleanup 3", "Cleanup 4", "Cleanup 5", "Cleanup 6"
];

const RESULT_ORDER = [
  "Wyvern", "Warregal", "Jago", "Ariel", "Epic Monster Hunter", "Fire Phoenix II", 
  "Fire Phoenix I", "Manticore", "Corax II", "Royal Lion II", "Corax I", "Royal Lion I", 
  "Griffin VII", "Josephine II", "Griffin VI", "Josephine I", "Griffin V", 
  "Siege Ballistae VII", "Siege Ballistae VI", "Punisher I", "Duelist I", "Catapult V", 
  "Vulture VII", "Heavy Halberdier VII", "Heavy Knight VII", "Catapult IV", "Vulture VI", 
  "Heavy Halberdier VI", "Heavy Knight VI", "Spearmen V", "Swordsmen V", "Vulture V"
];

const TROOPS_WITH_M8_RAW = [
  "Wyvern", "Warregal", "Jago", "Ariel", "Epic Monster Hunter", "Fire Phoenix II", "Fire Phoenix I", 
  "Manticore", "Corax II", "Royal Lion II", "Corax I", "Royal Lion I", "Griffin VII", "Josephine II", 
  "Griffin VI", "Josephine I", "Griffin V", "Siege Ballistae VII", "Siege Ballistae VI", 
  "Catapult V", "Vulture VII", "Catapult IV", "Vulture VI", "Vulture V"
];

const TROOPS_WITHOUT_M8_RAW = [
  "Wyvern", "Warregal", "Jago", "Ariel", "Epic Monster Hunter", "Manticore", "Corax I", 
  "Royal Lion I", "Griffin VII", "Josephine II", "Griffin VI", "Josephine I", "Griffin V", 
  "Siege Ballistae VII", "Siege Ballistae VI", "Punisher I", "Duelist I", "Catapult V", 
  "Vulture VII", "Heavy Halberdier VII", "Heavy Knight VII", "Catapult IV", "Vulture VI", 
  "Heavy Halberdier VI", "Heavy Knight VI", "Spearmen V", "Swordsmen V", "Vulture V"
];

const WALL_KILLER_NAMES_RAW = [
  "Ariel", "Josephine II", "Josephine I", "Siege Ballistae VII", "Siege Ballistae VI", "Catapult V", "Catapult IV"
];

/* =========================================
   HELPERS
   ========================================= */

function toNum(v) { const n = Number(v); return Number.isFinite(n) ? n : 0; }
function fmtInt(n) { if (!Number.isFinite(n)) return "-"; return Math.floor(n).toLocaleString(); }
function normName(s) { return String(s ?? "").toLowerCase().replace(/\s+/g, " ").trim(); }

const ICON_FILE_MAP = {
  "Corax II": "Corax II.png", "Corax I": "Corax I.png", "Griffin VII": "Griffin VII.png", "Griffin VI": "Griffin VI.png", 
  "Griffin V": "Griffin V.png", "Wyvern": "Wyvern.png", "Warregal": "Warregal.png", "Jago": "Jago.png", 
  "Epic Monster Hunter": "Epic Monster Hunter.png", "Royal Lion II": "Royal Lion II.png", "Royal Lion I": "Royal Lion I.png", 
  "Vulture VII": "Vulture VII.png", "Vulture VI": "Vulture VI.png", "Vulture V": "Vulture V.png", 
  "Fire Phoenix II": "Fire Phoenix II.png", "Fire Phoenix I": "Fire Phoenix I.png", "Manticore": "Manticore.png", 
  "Ariel": "Ariel.png", "Josephine II": "Josephine II.png", "Josephine I": "Josephine I.png", 
  "Siege Ballistae VII": "Siege Ballistae VII.png", "Siege Ballistae VI": "Siege Ballistae VI.png", 
  "Catapult V": "Catapult V.png", "Catapult IV": "Catapult IV.png", "Punisher I": "Punisher I.png", 
  "Heavy Halberdier VII": "Heavy Halberdier VII.png", "Heavy Halberdier VI": "Heavy Halberdier VI.png", 
  "Spearmen V": "Spearmen V.png", "Duelist I": "Duelist I.png", "Heavy Knight VII": "Heavy Knight VII.png", 
  "Heavy Knight VI": "Heavy Knight VI.png", "Swordsmen V": "Swordsmen V.png"
};
const ICON_BASE = (import.meta && import.meta.env && import.meta.env.BASE_URL) ? import.meta.env.BASE_URL : "/";

function iconSrcForTroop(name) {
  const file = ICON_FILE_MAP[name];
  if (!file) return null;
  return `${ICON_BASE}icons/${encodeURIComponent(file)}`;
}

async function copyToClipboard(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
}

/* =========================================
   THEME ENGINE
   ========================================= */

function usePrefersDark() {
  const [isDark, setIsDark] = useState(true);
  useEffect(() => {
    if (window.matchMedia) {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      setIsDark(mq.matches);
      const h = (e) => setIsDark(e.matches);
      mq.addEventListener("change", h);
      return () => mq.removeEventListener("change", h);
    }
  }, []);
  return isDark;
}

function makeTheme(isDark) {
  return {
    pageBg: isDark ? "#0b0e14" : "#f0f2f5", cardBg: isDark ? "#151b26" : "#ffffff",
    accent: isDark ? "#3b82f6" : "#2563eb", accentGlow: isDark ? "rgba(59, 130, 246, 0.3)" : "rgba(37, 99, 235, 0.2)",
    border: isDark ? "#2a3441" : "#e2e8f0", borderSoft: isDark ? "#1e2630" : "#f1f5f9",
    text: isDark ? "#f1f5f9" : "#0f172a", subtext: isDark ? "#94a3b8" : "#64748b",
    inputBg: isDark ? "#0f1116" : "#f8fafc", inputBorder: isDark ? "#2a3441" : "#cbd5e1",
    btnBg: isDark ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    btnText: "#ffffff", btnGhostBg: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
    overlay: "rgba(0,0,0,0.85)", bottomBarBg: isDark ? "#0b0e14" : "#ffffff", success: "#10b981", danger: "#ef4444"
  };
}

/* =========================================
   UI COMPONENTS
   ========================================= */

const Card = ({ title, children, theme, badge }) => (
  <div style={{ border: `1px solid ${theme.border}`, borderRadius: 16, padding: 16, background: theme.cardBg, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", marginBottom: 16 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
      <div style={{ fontWeight: 800, fontSize: 16, color: theme.text, fontFamily: "sans-serif", textTransform: "uppercase" }}>{title}</div>
      {badge && <span style={{ fontSize: 11, fontWeight: 700, background: theme.accent, color: '#fff', padding: "2px 8px", borderRadius: 10 }}>{badge}</span>}
    </div>
    {children}
  </div>
);

const TroopPicker = ({ label, value, options, onChange, theme }) => {
  const [open, setOpen] = useState(false);
  const display = value || "—";
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <span style={{ color: theme.subtext, fontSize: 13, fontWeight: 600 }}>{label}</span>
      <button type="button" onClick={() => setOpen(true)} style={{ textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px", borderRadius: 12, border: `1px solid ${theme.inputBorder}`, background: theme.inputBg, color: theme.text, height: 50, width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {value && iconSrcForTroop(value) && <img src={iconSrcForTroop(value)} width={32} height={32} style={{ borderRadius: 6 }} />}
          <span style={{ fontWeight: 700, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{display}</span>
        </div>
        <span style={{ color: theme.subtext }}>▾</span>
      </button>
      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setOpen(false)}>
          <div style={{ width: "100%", maxWidth: 400, maxHeight: "80vh", background: theme.cardBg, borderRadius: 16, overflowY: "auto", padding: 10 }}>
             {options.map(opt => (
               <button key={opt||"blank"} onClick={(e) => { e.stopPropagation(); onChange(opt); setOpen(false); }} style={{ width: "100%", textAlign: "left", padding: "12px", borderBottom: `1px solid ${theme.borderSoft}`, background: "transparent", color: theme.text, display: "flex", alignItems: "center", gap: 10 }}>
                 {opt && iconSrcForTroop(opt) && <img src={iconSrcForTroop(opt)} width={32} height={32} style={{ borderRadius: 6 }} />}
                 <b>{opt || "REMOVE"}</b>
               </button>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Modal = ({ open, title, onClose, children, theme }) => {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: theme.overlay, backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div style={{ width: "100%", maxWidth: 600, background: theme.cardBg, color: theme.text, borderRadius: "20px 20px 0 0", maxHeight: "85vh", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: 16, borderBottom: `1px solid ${theme.borderSoft}` }}>
          <b style={{ fontSize: 18 }}>{title}</b>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: theme.text, fontSize: 20 }}>✕</button>
        </div>
        <div style={{ padding: 20, overflowY: "auto" }}>{children}</div>
      </div>
    </div>
  );
};

/* =========================================
   MAIN APP LOGIC
   ========================================= */

export default function App() {
  const isDark = usePrefersDark();
  const theme = useMemo(() => makeTheme(isDark), [isDark]);

  // --- SAFETY CHECK (Spriječava bijelu stranicu) ---
  if (!TB || !TB.citadels || !TB.troops) {
    return (
      <div style={{ minHeight: "100vh", background: "#111", color: "white", padding: 30, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
        <h2 style={{ color: "#ef4444" }}>⚠️ GREŠKA UČITAVANJA</h2>
        <p>Aplikacija ne može pronaći podatke.</p>
        <div style={{ textAlign: "left", background: "#222", padding: 15, borderRadius: 10, marginTop: 20, fontSize: 14 }}>
           1. Provjeri je li datoteka <b>tb_data.json</b> u istoj mapi kao App.jsx.<br/>
           2. Provjeri ima li datoteka sadržaj (da nije prazna).
        </div>
      </div>
    );
  }

  const citadelKeys = Object.keys(TB.citadels);
  const troops = TB.troops;
  const canon = useMemo(() => { const m = new Map(); troops.forEach(t => m.set(normName(t.name), t.name)); return m; }, [troops]);
  const troopByName = useMemo(() => new Map(troops.map(t => [t.name, t])), [troops]);
  
  const [citadelLevel, setCitadelLevel] = useState(citadelKeys[0] || "25");
  const [mode, setMode] = useState(MODE_WITHOUT);
  const [strikerTroops, setStrikerTroops] = useState(Array(9).fill(""));
  const [strikerBonusPct, setStrikerBonusPct] = useState(Array(9).fill(""));
  const [firstHealthBonusPct, setFirstHealthBonusPct] = useState("");
  const [wallKillerTroop, setWallKillerTroop] = useState("");
  const [wallKillerBonusPct, setWallKillerBonusPct] = useState("");
  const [resultsOpen, setResultsOpen] = useState(false);
  const [calcOutput, setCalcOutput] = useState(null);
  const [warningMsg, setWarningMsg] = useState("");

  // Logic Helpers
  const getBaseStats = (name) => {
    const t = troopByName.get(name);
    return { str: toNum(t?.strength || t?.baseStrength || 0), hp: toNum(t?.health || t?.baseHealth || 0) };
  };

  const poolAll = useMemo(() => {
    const raw = mode === MODE_WITH ? TROOPS_WITH_M8_RAW : TROOPS_WITHOUT_M8_RAW;
    return [...new Set(raw.map(r => canon.get(normName(r))).filter(Boolean))];
  }, [mode, canon]);

  const wallKillerPool = useMemo(() => [...new Set(WALL_KILLER_NAMES_RAW.map(r => canon.get(normName(r))).filter(Boolean))], [canon]);
  
  useEffect(() => {
     setStrikerTroops(prev => { const n = [...prev]; return n.map((t, i) => (t && poolAll.includes(t)) ? t : ""); });
     if (!wallKillerPool.includes(wallKillerTroop)) setWallKillerTroop(wallKillerPool[0] || "");
  }, [mode, poolAll, wallKillerPool]);

  // Calculations
  const cit = TB.citadels[citadelLevel];
  const calculate = () => {
    if (!cit) return;
    const targets = mode === MODE_WITH ? cit.m8m9Targets : cit.normalTargets;
    
    // First striker losses
    const t1 = troopByName.get(strikerTroops[0]);
    const hp1 = toNum(t1?.health || t1?.baseHealth) * (1 + toNum(firstHealthBonusPct)/100);
    const firstLosses = hp1 > 0 ? Math.floor(toNum(cit.firstStrikeDamage) / hp1) : 0;

    // Wall
    const wk = troopByName.get(wallKillerTroop);
    const wkStr = toNum(wk?.strength || wk?.baseStrength) * (1 + (toNum(wallKillerBonusPct) + toNum(wk?.fortBonus||0))/100) * 20;
    const wkReq = wkStr > 0 ? Math.ceil(toNum(cit.wallHP) / wkStr) : 0;

    // Strikers
    const lines = [];
    if (wkReq > 0) lines.push({ troop: wallKillerTroop, required: wkReq });

    strikerTroops.forEach((name, i) => {
      if (!name) return;
      const t = troopByName.get(name);
      let bonus = toNum(strikerBonusPct[i]);
      if (TB.additionalBonusNormal?.[name]) bonus += TB.additionalBonusNormal[name];
      if (mode === MODE_WITH && i === 1 && TB.phoenixExtra?.[name]) bonus += TB.phoenixExtra[name];

      const str = toNum(t?.strength || t?.baseStrength) * (1 + bonus/100);
      let req = str > 0 ? Math.floor(toNum(targets[i]) / str) : 0;
      if (i === 0) req += firstLosses;
      
      const existing = lines.find(l => l.troop === name);
      if (existing) existing.required += req;
      else lines.push({ troop: name, required: req });
    });

    lines.sort((a,b) => RESULT_ORDER.indexOf(a.troop) - RESULT_ORDER.indexOf(b.troop));
    setCalcOutput({ lines, modeLabel: mode===MODE_WITH?"With M8":"Standard", citadelLabel: `Lvl ${citadelLevel}` });
    setResultsOpen(true);
  };

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: theme.pageBg, color: theme.text, fontFamily: "sans-serif", paddingBottom: 100 }}>
      {/* HEADER */}
      <div style={{ padding: "20px 16px", background: theme.pageBg, position: "sticky", top:0, zIndex:10, borderBottom:`1px solid ${theme.border}` }}>
        <h1 style={{ margin:0, fontSize: 22, background: `linear-gradient(90deg, ${theme.text}, ${theme.subtext})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>CITADEL CALC</h1>
      </div>

      <div style={{ padding: 16, maxWidth: 600, margin: "0 auto" }}>
        <Card title="Settings" theme={theme}>
           <div style={{ marginBottom: 10 }}>
             <span style={{ fontSize: 13, color: theme.subtext }}>Mode</span>
             <select value={mode} onChange={e => setMode(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8, background: theme.inputBg, color: theme.text, border: `1px solid ${theme.inputBorder}`, marginTop: 5 }}>
               <option value={MODE_WITHOUT}>Standard (No M8/M9)</option>
               <option value={MODE_WITH}>Advanced (With M8/M9)</option>
             </select>
           </div>
           <div>
             <span style={{ fontSize: 13, color: theme.subtext }}>Citadel Level</span>
             <select value={citadelLevel} onChange={e => setCitadelLevel(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8, background: theme.inputBg, color: theme.text, border: `1px solid ${theme.inputBorder}`, marginTop: 5 }}>
               {citadelKeys.map(k => <option key={k} value={k}>Level {k}</option>)}
             </select>
           </div>
        </Card>

        <Card title="Wall Breaker" theme={theme} badge="Essential">
          <TroopPicker label="Unit" value={wallKillerTroop} options={wallKillerPool} onChange={setWallKillerTroop} theme={theme} />
          <div style={{ marginTop: 10 }}>
            <span style={{ fontSize: 13, color: theme.subtext }}>Strength Bonus %</span>
            <input type="number" value={wallKillerBonusPct} onChange={e => setWallKillerBonusPct(e.target.value)} placeholder="0" style={{ width: "100%", padding: 10, borderRadius: 8, background: theme.inputBg, color: theme.text, border: `1px solid ${theme.inputBorder}` }} />
          </div>
        </Card>

        {STRIKER_LABELS.map((label, i) => (
          <Card key={i} title={`${i+1}. ${label}`} theme={theme} badge={i===0?"Tank":null}>
            <TroopPicker label="Select Unit" value={strikerTroops[i]} options={poolAll} onChange={(val) => {
               // Validate stats vs first striker
               if (i > 1 && val && strikerTroops[0]) {
                 const f = getBaseStats(strikerTroops[0]);
                 const c = getBaseStats(val);
                 if (c.str > f.str || c.hp > f.hp) {
                   setWarningMsg(`Warning: ${val} is stronger than your tank!`);
                   return; // Reject
                 }
               }
               const n = [...strikerTroops]; n[i] = val; setStrikerTroops(n);
            }} theme={theme} />
            
            <div style={{ display: "grid", gridTemplateColumns: i===0?"1fr 1fr":"1fr", gap: 10, marginTop: 10 }}>
              {i===0 && (
                <div>
                  <span style={{ fontSize: 12, color: theme.subtext }}>HP Bonus %</span>
                  <input type="number" value={firstHealthBonusPct} onChange={e => setFirstHealthBonusPct(e.target.value)} placeholder="0" style={{ width: "100%", padding: 10, borderRadius: 8, background: theme.inputBg, color: theme.text, border: `1px solid ${theme.inputBorder}` }} />
                </div>
              )}
              <div>
                <span style={{ fontSize: 12, color: theme.subtext }}>Str Bonus %</span>
                <input type="number" value={strikerBonusPct[i]} onChange={e => { const n=[...strikerBonusPct]; n[i]=e.target.value; setStrikerBonusPct(n); }} placeholder="0" style={{ width: "100%", padding: 10, borderRadius: 8, background: theme.inputBg, color: theme.text, border: `1px solid ${theme.inputBorder}` }} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* FOOTER ACTION */}
      <div style={{ position: "fixed", bottom:0, left:0, right:0, padding: 16, background: theme.bottomBarBg, borderTop: `1px solid ${theme.border}` }}>
        <button onClick={calculate} style={{ width: "100%", padding: 16, borderRadius: 12, background: theme.btnBg, color: "white", fontWeight: 800, border: "none", fontSize: 16 }}>CALCULATE ATTACK</button>
      </div>

      {/* MODALS */}
      <Modal open={!!warningMsg} title="Alert" onClose={() => setWarningMsg("")} theme={theme}>
        <p style={{ color: theme.danger }}>{warningMsg}</p>
        <button onClick={() => setWarningMsg("")} style={{ width: "100%", padding: 12, background: theme.text, color: theme.pageBg, border: "none", borderRadius: 8, fontWeight: "bold" }}>OK</button>
      </Modal>

      <Modal open={resultsOpen} title="Battle Plan" onClose={() => setResultsOpen(false)} theme={theme}>
        {calcOutput && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
               <div style={{ background: theme.btnGhostBg, padding: 10, borderRadius: 8, textAlign: "center", fontWeight: "bold" }}>{calcOutput.modeLabel}</div>
               <div style={{ background: theme.btnGhostBg, padding: 10, borderRadius: 8, textAlign: "center", fontWeight: "bold" }}>{calcOutput.citadelLabel}</div>
            </div>
            {calcOutput.lines.map((l, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${theme.borderSoft}` }}>
                 <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                   {iconSrcForTroop(l.troop) && <img src={iconSrcForTroop(l.troop)} width={30} height={30} style={{ borderRadius: 5 }} />}
                   <b>{l.troop}</b>
                 </div>
                 <b style={{ color: theme.accent, fontSize: 18 }}>{fmtInt(l.required)}</b>
              </div>
            ))}
            <button onClick={() => copyToClipboard(calcOutput.lines.map(l => `${l.troop} - ${l.required}`).join("\n"))} style={{ width: "100%", marginTop: 20, padding: 14, background: theme.success, color: "white", border: "none", borderRadius: 10, fontWeight: "bold" }}>COPY LIST</button>
          </div>
        )}
      </Modal>
    </div>
  );
}
