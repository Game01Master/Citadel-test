import React, { useMemo, useState, useEffect } from "react";
import TB from "./tb_data.json";

// --- GAMING FONTOVI ---
const fontLink = document.createElement("link");
fontLink.href = "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;800&family=Inter:wght@300;400;600;800&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

const MODE_WITHOUT = "WITHOUT";
const MODE_WITH = "WITH";

const STRIKER_LABELS = ["First Striker", "Second Striker", "Third Striker", "Cleanup 1", "Cleanup 2", "Cleanup 3", "Cleanup 4", "Cleanup 5", "Cleanup 6"];
const RESULT_ORDER = ["Wyvern", "Warregal", "Jago", "Ariel", "Epic Monster Hunter", "Fire Phoenix II", "Fire Phoenix I", "Manticore", "Corax II", "Royal Lion II", "Corax I", "Royal Lion I", "Griffin VII", "Josephine II", "Griffin VI", "Josephine I", "Griffin V", "Siege Ballistae VII", "Siege Ballistae VI", "Punisher I", "Duelist I", "Catapult V", "Vulture VII", "Heavy Halberdier VII", "Heavy Knight VII", "Catapult IV", "Vulture VI", "Heavy Halberdier VI", "Heavy Knight VI", "Spearmen V", "Swordsmen V", "Vulture V"];
const TROOPS_WITH_M8_RAW = ["Wyvern", "Warregal", "Jago", "Ariel", "Epic Monster Hunter", "Fire Phoenix II", "Fire Phoenix I", "Manticore", "Corax II", "Royal Lion II", "Corax I", "Royal Lion I", "Griffin VII", "Josephine II", "Griffin VI", "Josephine I", "Griffin V", "Siege Ballistae VII", "Siege Ballistae VI", "Catapult V", "Vulture VII", "Catapult IV", "Vulture VI", "Vulture V"];
const TROOPS_WITHOUT_M8_RAW = ["Wyvern", "Warregal", "Jago", "Ariel", "Epic Monster Hunter", "Manticore", "Corax I", "Royal Lion I", "Griffin VII", "Josephine II", "Griffin VI", "Josephine I", "Griffin V", "Siege Ballistae VII", "Siege Ballistae VI", "Punisher I", "Duelist I", "Catapult V", "Vulture VII", "Heavy Halberdier VII", "Heavy Knight VII", "Catapult IV", "Vulture VI", "Heavy Halberdier VI", "Heavy Knight VI", "Spearmen V", "Swordsmen V", "Vulture V"];
const WALL_KILLER_NAMES_RAW = ["Ariel", "Josephine II", "Josephine I", "Siege Ballistae VII", "Siege Ballistae VI", "Catapult V", "Catapult IV"];

function toNum(v) { const n = Number(v); return Number.isFinite(n) ? n : 0; }
function fmtInt(n) { if (!Number.isFinite(n)) return "-"; return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(Math.floor(n)); }
function normName(s) { return String(s ?? "").toLowerCase().replace(/\s+/g, " ").trim(); }

const ICON_FILE_MAP = { "Corax II": "Corax II.png", "Corax I": "Corax I.png", "Griffin VII": "Griffin VII.png", "Griffin VI": "Griffin VI.png", "Griffin V": "Griffin V.png", "Wyvern": "Wyvern.png", "Warregal": "Warregal.png", "Jago": "Jago.png", "Epic Monster Hunter": "Epic Monster Hunter.png", "Royal Lion II": "Royal Lion II.png", "Royal Lion I": "Royal Lion I.png", "Vulture VII": "Vulture VII.png", "Vulture VI": "Vulture VI.png", "Vulture V": "Vulture V.png", "Fire Phoenix II": "Fire Phoenix II.png", "Fire Phoenix I": "Fire Phoenix I.png", "Manticore": "Manticore.png", "Ariel": "Ariel.png", "Josephine II": "Josephine II.png", "Josephine I": "Josephine I.png", "Siege Ballistae VII": "Siege Ballistae VII.png", "Siege Ballistae VI": "Siege Ballistae VI.png", "Catapult V": "Catapult V.png", "Catapult IV": "Catapult IV.png", "Punisher I": "Punisher I.png", "Heavy Halberdier VII": "Heavy Halberdier VII.png", "Heavy Halberdier VI": "Heavy Halberdier VI.png", "Spearmen V": "Spearmen V.png", "Duelist I": "Duelist I.png", "Heavy Knight VII": "Heavy Knight VII.png", "Heavy Knight VI": "Heavy Knight VI.png", "Swordsmen V": "Swordsmen V.png" };
const ICON_BASE = (import.meta && import.meta.env && import.meta.env.BASE_URL) ? import.meta.env.BASE_URL : "/";

function iconSrcForTroop(name) {
  const file = ICON_FILE_MAP[name];
  return file ? `${ICON_BASE}icons/${encodeURIComponent(file)}` : null;
}

async function copyToClipboard(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
}

function usePrefersDark() {
  const [isDark, setIsDark] = useState(() => (typeof window !== "undefined" && window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)").matches : false));
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setIsDark(!!e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isDark;
}

function makeTheme() {
  return {
    pageBg: "transparent", // POSTAVLJENO NA TRANSPARENT DA SE VIDI SLIKA IZA
    cardBg: "linear-gradient(180deg, rgba(20,22,28,0.98) 0%, rgba(12,13,16,0.98) 100%)",
    border: "rgba(197, 160, 89, 0.75)",
    borderSoft: "rgba(255, 255, 255, 0.08)",
    text: "#ececec",
    subtext: "#a0a0a0",
    inputBg: "linear-gradient(180deg, rgba(15,16,18,0.92) 0%, rgba(8,8,9,0.92) 100%)",
    inputBorder: "rgba(197, 160, 89, 0.55)",
    btnBg: "linear-gradient(135deg, #c5a059 0%, #9a7b3a 100%)",
    btnText: "#000000",
    btnGhostBg: "rgba(255, 255, 255, 0.05)",
    accent: "#c5a059",
    danger: "#ff4d4d",
    shadow: "0 10px 30px rgba(0,0,0,0.7)",
    cardShadow: "0 10px 28px rgba(0,0,0,0.6)",
    goldGlow: "0 0 0 1px rgba(197,160,89,0.25), 0 0 18px rgba(197,160,89,0.12)",
    goldGlowStrong: "0 0 0 1px rgba(197,160,89,0.35), 0 0 26px rgba(197,160,89,0.18)",
  };
}

// POMOĆNE KOMPONENTE (Card, TroopPicker, OptionPicker, Row, Modal ostaju iste kao u originalu)
function Card({ title, children, theme }) {
  return (
    <div style={{ border: `1.5px solid ${theme.border}`, borderRadius: 12, padding: 16, background: theme.cardBg, boxShadow: `${theme.cardShadow}, ${theme.goldGlow}`, marginBottom: 16, position: "relative" }}>
      <div style={{position: "absolute", left: 0, top: 16, bottom: 16, width: 3, background: theme.accent, borderRadius: "0 2px 2px 0"}}></div>
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, color: theme.accent, fontFamily: "'Cinzel', serif", letterSpacing: "1px", textTransform: "uppercase", paddingLeft: 12 }}>{title}</div>
      <div style={{ paddingLeft: 8 }}>{children}</div>
    </div>
  );
}

function TroopPicker({ label, value, options, onChange, theme, inputStyle }) {
  const [open, setOpen] = useState(false);
  const display = value ? value : "— Select —";
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <span style={{ color: theme.subtext, fontSize: 12, textTransform: "uppercase", fontWeight: 600 }}>{label}</span>
      <button type="button" onClick={() => setOpen((v) => !v)} style={{ ...inputStyle, textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, cursor: "pointer", background: "linear-gradient(180deg, rgba(28,30,38,0.9) 0%, rgba(14,15,18,0.95) 100%)", boxShadow: `inset 0 0 0 1px rgba(197,160,89,0.12), 0 10px 22px rgba(0,0,0,0.55)` }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          {value ? (iconSrcForTroop(value) ? <img src={iconSrcForTroop(value)} alt={value} width={36} height={36} style={{ borderRadius: 6, flexShrink: 0, border: "1px solid #333" }} loading="lazy" /> : null) : <div style={{width: 36, height: 36, borderRadius: 6, background: "rgba(255,255,255,0.05)", border: "1px dashed #444"}}></div>}
          <span style={{ color: value ? theme.text : theme.subtext, fontWeight: 700, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "'Inter', sans-serif" }}>{display}</span>
        </span>
        <span style={{ color: theme.accent, fontSize: 14 }}>▼</span>
      </button>
      <Modal open={open} title={`Select ${label}`} onClose={() => setOpen(false)} theme={theme} isDropdown={true}>
        <div style={{ display: "grid", gap: 6 }}>
          {options.map((opt) => {
            const isBlank = opt === "";
            const isSelected = opt === value;
            return (
              <button key={opt || "__blank__"} type="button" onClick={() => { onChange(opt); setOpen(false); }} style={{ width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: 8, border: isSelected ? `1px solid ${theme.accent}` : "1px solid transparent", background: isSelected ? "rgba(197, 160, 89, 0.15)" : "rgba(255, 255, 255, 0.03)", color: isSelected ? theme.accent : theme.text, fontWeight: 600, fontSize: 15, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                {!isBlank && iconSrcForTroop(opt) ? <img src={iconSrcForTroop(opt)} alt={opt} width={40} height={40} style={{ borderRadius: 6, flexShrink: 0 }} loading="lazy" /> : <div style={{ width: 40, height: 40 }} />}
                <span>{isBlank ? "— None —" : opt}</span>
              </button>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}

function OptionPicker({ label, value, options, onChange, theme, inputStyle }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <span style={{ color: theme.subtext, fontSize: 12, textTransform: "uppercase", fontWeight: 600 }}>{label}</span>
      <button type="button" onClick={() => setOpen((v) => !v)} style={{ ...inputStyle, textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, cursor: "pointer", background: "linear-gradient(180deg, rgba(28,30,38,0.9) 0%, rgba(14,15,18,0.95) 100%)", boxShadow: `inset 0 0 0 1px rgba(197,160,89,0.12), 0 10px 22px rgba(0,0,0,0.55)` }}>
        <span style={{ color: selected ? theme.text : theme.subtext, fontWeight: 800, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selected ? selected.label : "— Select —"}</span>
        <span style={{ color: theme.accent, fontSize: 14 }}>▼</span>
      </button>
      <Modal open={open} title={label} onClose={() => setOpen(false)} theme={theme} isDropdown={true}>
        <div style={{ display: "grid", gap: 6 }}>
          {options.map((opt) => (
            <button key={String(opt.value)} type="button" onClick={() => { onChange(opt.value); setOpen(false); }} style={{ width: "100%", textAlign: "left", padding: "12px 12px", borderRadius: 10, border: opt.value === value ? `1px solid ${theme.accent}` : "1px solid transparent", background: opt.value === value ? "rgba(197, 160, 89, 0.15)" : "rgba(255, 255, 255, 0.03)", color: opt.value === value ? theme.accent : theme.text, fontWeight: 800, fontSize: 18, cursor: "pointer" }}>{opt.label}</button>
          ))}
        </div>
      </Modal>
    </div>
  );
}

function Row({ label, value, theme, accent }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "8px 0", borderBottom: `1px solid ${theme.borderSoft}` }}>
      <div style={{ color: theme.subtext, fontSize: 13, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontWeight: 800, fontSize: 16, color: accent ? theme.accent : theme.text, fontFamily: "'Inter', sans-serif" }}>{value}</div>
    </div>
  );
}

function Modal({ open, title, onClose, children, theme }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 9999, backdropFilter: "blur(5px)" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 500, background: "linear-gradient(180deg, rgba(24,26,32,0.95) 0%, rgba(14,15,18,0.95) 100%)", color: theme.text, borderRadius: 16, border: `1px solid ${theme.accent}`, boxShadow: `0 0 30px rgba(197, 160, 89, 0.18)`, maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "rgba(197, 160, 89, 0.05)", borderBottom: `1px solid ${theme.borderSoft}` }}>
          <div style={{ fontWeight: 700, fontSize: 18, fontFamily: "'Cinzel', serif", color: theme.accent, textTransform: "uppercase" }}>{title}</div>
          <button onClick={onClose} style={{ border: "none", background: "transparent", color: theme.text, fontSize: 24, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ padding: 16, overflowY: "auto", flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

// GLAVNA APLIKACIJA
export default function App() {
  const isDark = usePrefersDark();
  const theme = useMemo(() => makeTheme(), []);
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
  const [strikerTroops, setStrikerTroops] = useState(() => Array(9).fill(""));
  const [strikerBonusPct, setStrikerBonusPct] = useState(() => Array(9).fill(""));
  const [firstHealthBonusPct, setFirstHealthBonusPct] = useState("");
  const [wallKillerTroop, setWallKillerTroop] = useState("");
  const [wallKillerBonusPct, setWallKillerBonusPct] = useState("");
  const [resultsOpen, setResultsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [calcOutput, setCalcOutput] = useState(null);

  const cit = TB.citadels?.[citadelLevel];
  const targets = mode === MODE_WITH ? cit?.m8m9Targets : cit?.normalTargets;

  const inputStyle = useMemo(() => ({ padding: "12px 14px", borderRadius: 10, border: `1px solid ${theme.inputBorder}`, background: theme.inputBg, color: theme.text, outline: "none", width: "100%", boxSizing: "border-box", fontSize: 16, fontWeight: 500, fontFamily: "'Inter', sans-serif" }), [theme]);

  // Logika za poolove (ostaje ista kao tvoja)
  const poolAll = useMemo(() => Array.from(new Set((mode === MODE_WITH ? TROOPS_WITH_M8_RAW : TROOPS_WITHOUT_M8_RAW).map(r => canon.get(normName(r))).filter(Boolean))), [mode, canon]);
  const wallKillerPool = useMemo(() => Array.from(new Set(WALL_KILLER_NAMES_RAW.map(r => canon.get(normName(r))).filter(Boolean))), [canon]);

  const calculate = () => {
    const counts = new Map();
    const add = (name, n) => { if (name && Number.isFinite(n)) { const k = normName(name); counts.set(k, (counts.get(k) || 0) + Math.floor(n)); } };
    
    // Wall Killer
    const wkTroop = troopByName.get(wallKillerTroop);
    const wkEff = toNum(wallKillerBonusPct) + toNum(wkTroop?.fortBonus);
    const wkDmg = toNum(wkTroop?.strength) * (1 + wkEff / 100) * 20;
    add(wallKillerTroop, wkDmg > 0 ? (Math.ceil(toNum(cit.wallHP) / wkDmg) + 2) : 0);

    // Strikers
    STRIKER_LABELS.forEach((_, idx) => {
      const name = strikerTroops[idx];
      const t = troopByName.get(name);
      if (!name || !t) return;
      let bonus = toNum(strikerBonusPct[idx]) + toNum(TB.additionalBonusNormal?.[name]);
      const dmg = toNum(t.strength) * (1 + bonus / 100);
      let req = dmg > 0 ? Math.floor(toNum(targets[idx]) / dmg) : 0;
      if (idx === 0) {
          const hp = toNum(t.health) * (1 + toNum(firstHealthBonusPct) / 100);
          req += (hp > 0 ? Math.floor(toNum(cit.firstStrikeDamage) / hp) : 0) + 10;
      }
      add(name, req);
    });

    const ordered = RESULT_ORDER.filter(n => counts.has(normName(n))).map(n => ({ troop: n, required: counts.get(normName(n)) }));
    setCalcOutput({ modeLabel: mode, citadelLabel: citadelLevel, troops: ordered });
    setResultsOpen(true);
  };

  return (
    <div style={{ width: "100%", minHeight: "100vh", color: theme.text, fontFamily: "'Inter', sans-serif", position: "relative" }}>
      <style>{`
        html, body { 
          margin: 0; 
          padding: 0; 
          min-height: 100vh;
          background-color: #050505 !important; /* Sigurnosna boja */
        }

        body {
          background-attachment: fixed !important;
          background-size: cover !important;
          background-position: center !important;
          background-repeat: no-repeat !important;
          /* KORISTIMO / ZA PUBLIC MAPU */
          background-image: url("./bg.jpg") !important; 
        }

        @media (min-width: 768px) {
          body {
            background-image: url("./bg-desktop.jpg") !important;
          }
        }

        input:focus { border-color: ${theme.accent} !important; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: ${theme.accent}; border-radius: 3px; }
      `}</style>

      {/* Overlay za čitljivost teksta preko slike */}
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 0, pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 600, margin: "0 auto", padding: "20px 16px", position: "relative", zIndex: 1 }}>
        <header style={{ textAlign: "center", marginBottom: 30 }}>
          <div style={{ fontWeight: 800, fontSize: 32, color: theme.accent, fontFamily: "'Cinzel', serif", textTransform: "uppercase", letterSpacing: 2 }}>Citadel Calculator</div>
          <div style={{ fontSize: 12, color: theme.subtext, letterSpacing: 3 }}>by GM</div>
        </header>

        <div style={{ display: "grid", gap: 16, paddingBottom: 100 }}>
          <Card title="⚙️ Setup" theme={theme}>
            <button onClick={() => setHelpOpen(true)} style={{ width: "100%", padding: "12px", borderRadius: 10, border: `1px solid ${theme.border}`, background: "rgba(255,255,255,0.05)", color: "#fff", cursor: "pointer", marginBottom: 16 }}>ℹ️ Instructions</button>
            <OptionPicker label="M8/M9 Troops?" value={mode} options={[{label: "No", value: MODE_WITHOUT}, {label: "Yes", value: MODE_WITH}]} onChange={setMode} theme={theme} inputStyle={inputStyle} />
            <div style={{height: 12}} />
            <OptionPicker label="Citadel Level" value={citadelLevel} options={citadelKeys.map(k => ({label: `Elven ${k}`, value: k}))} onChange={setCitadelLevel} theme={theme} inputStyle={inputStyle} />
          </Card>

          <Card title="🛡️ Wall Killer" theme={theme}>
            <TroopPicker label="Select Troop" value={wallKillerTroop} options={wallKillerPool} onChange={setWallKillerTroop} theme={theme} inputStyle={inputStyle} />
            <div style={{height: 12}} />
            <input type="number" placeholder="Strength Bonus %" value={wallKillerBonusPct} onChange={e => setWallKillerBonusPct(e.target.value)} style={inputStyle} />
          </Card>

          {STRIKER_LABELS.slice(0, 3).map((label, idx) => (
             <Card key={idx} title={`${idx+1}. ${label}`} theme={theme}>
                <TroopPicker label="Troop" value={strikerTroops[idx]} options={poolAll} onChange={val => { const n = [...strikerTroops]; n[idx] = val; setStrikerTroops(n); }} theme={theme} inputStyle={inputStyle} />
                <div style={{height: 12}} />
                {idx === 0 && <><input type="number" placeholder="Health Bonus %" value={firstHealthBonusPct} onChange={e => setFirstHealthBonusPct(e.target.value)} style={inputStyle} /><div style={{height: 12}} /></>}
                <input type="number" placeholder="Strength Bonus %" value={strikerBonusPct[idx]} onChange={e => { const n = [...strikerBonusPct]; n[idx] = e.target.value; setStrikerBonusPct(n); }} style={inputStyle} />
             </Card>
          ))}
        </div>

        <div style={{ position: "fixed", bottom: 16, left: "50%", transform: "translateX(-50%)", width: "calc(100% - 32px)", maxWidth: 568, zIndex: 10 }}>
          <button onClick={calculate} style={{ width: "100%", padding: 18, background: theme.btnBg, color: "#000", border: "none", borderRadius: 12, fontWeight: 900, fontFamily: "'Cinzel', serif", fontSize: 18, cursor: "pointer", boxShadow: "0 10px 20px rgba(0,0,0,0.5)" }}>CALCULATE</button>
        </div>

        <Modal open={resultsOpen} title="📋 Results" onClose={() => setResultsOpen(false)} theme={theme}>
          {calcOutput?.troops.map((t, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <span>{t.troop}</span>
              <span style={{ color: theme.accent, fontWeight: 800 }}>{fmtInt(t.required)}</span>
            </div>
          ))}
        </Modal>

        <Modal open={helpOpen} title="Help" onClose={() => setHelpOpen(false)} theme={theme}>
          <p>Maximize First Striker Health to minimize losses.</p>
        </Modal>
      </div>
    </div>
  );
}
