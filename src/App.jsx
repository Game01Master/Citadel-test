import React, { useMemo, useState, useEffect } from "react";
import TB_RAW from "./tb_data.json"; 

// Safety fallback
const TB = TB_RAW || {};

/* =========================================
   1. AUTOMATSKA TEMA & DIZAJN
   ========================================= */

function usePrefersDark() {
  // Pokušava detektirati postavke mobitela
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false; // Default na light ako ne može otkriti
  });

  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setIsDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isDark;
}

function makeTheme(isDark) {
  // Vraća boje ovisno o tome je li mobitel u Dark ili Light modu
  if (isDark) {
    return {
      pageBg: "#0b0e14", cardBg: "#151b26", accent: "#3b82f6", 
      text: "#f1f5f9", subtext: "#94a3b8", border: "#2a3441",
      inputBg: "#0f1116", borderSoft: "#1e2630",
      btnBg: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
      overlay: "rgba(0,0,0,0.85)", bottomBarBg: "#0b0e14"
    };
  } else {
    // Light mode boje
    return {
      pageBg: "#f0f2f5", cardBg: "#ffffff", accent: "#2563eb", 
      text: "#0f172a", subtext: "#64748b", border: "#e2e8f0",
      inputBg: "#f8fafc", borderSoft: "#cbd5e1",
      btnBg: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
      overlay: "rgba(0,0,0,0.4)", bottomBarBg: "#ffffff"
    };
  }
}

/* =========================================
   2. PODACI & KONSTANTE
   ========================================= */

const STRIKER_LABELS = ["First Striker", "Second Striker", "Third Striker", "Cleanup 1", "Cleanup 2", "Cleanup 3", "Cleanup 4", "Cleanup 5", "Cleanup 6"];
const RESULT_ORDER = ["Wyvern", "Warregal", "Jago", "Ariel", "Epic Monster Hunter", "Fire Phoenix II", "Fire Phoenix I", "Manticore", "Corax II", "Royal Lion II", "Corax I", "Royal Lion I", "Griffin VII", "Josephine II", "Griffin VI", "Josephine I", "Griffin V", "Siege Ballistae VII", "Siege Ballistae VI", "Punisher I", "Duelist I", "Catapult V", "Vulture VII", "Heavy Halberdier VII", "Heavy Knight VII", "Catapult IV", "Vulture VI", "Heavy Halberdier VI", "Heavy Knight VI", "Spearmen V", "Swordsmen V", "Vulture V"];
const TROOPS_Simple = ["Wyvern", "Warregal", "Jago", "Ariel", "Epic Monster Hunter", "Manticore", "Corax I", "Royal Lion I", "Griffin VII", "Josephine II", "Griffin VI", "Josephine I", "Griffin V", "Siege Ballistae VII", "Siege Ballistae VI", "Punisher I", "Duelist I", "Catapult V", "Vulture VII", "Heavy Halberdier VII", "Heavy Knight VII", "Catapult IV", "Vulture VI", "Heavy Halberdier VI", "Heavy Knight VI", "Spearmen V", "Swordsmen V", "Vulture V"];
const WALL_KILLERS = ["Ariel", "Josephine II", "Josephine I", "Siege Ballistae VII", "Siege Ballistae VI", "Catapult V", "Catapult IV"];

// Helpers
function toNum(v) { const n = Number(v); return Number.isFinite(n) ? n : 0; }
function fmtInt(n) { if (!Number.isFinite(n)) return "-"; return Math.floor(n).toLocaleString(); }
function normName(s) { return String(s ?? "").toLowerCase().replace(/\s+/g, " ").trim(); }

// Icons setup (ostavljamo path, ako nema slike prikazat će samo tekst)
const ICON_BASE = (import.meta && import.meta.env && import.meta.env.BASE_URL) ? import.meta.env.BASE_URL : "/";
const iconSrc = (name) => name ? `${ICON_BASE}icons/${encodeURIComponent(name)}.png` : null;
async function copyToClipboard(text) { try { await navigator.clipboard.writeText(text); return true; } catch { return false; } }

/* =========================================
   3. KOMPONENTE
   ========================================= */

const Card = ({ title, children, theme, badge }) => (
  <div style={{ border: `1px solid ${theme.border}`, borderRadius: 16, padding: 16, background: theme.cardBg, boxShadow: "0 2px 4px rgba(0,0,0,0.05)", marginBottom: 16 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
      <div style={{ fontWeight: 800, fontSize: 16, color: theme.text, fontFamily: "sans-serif", textTransform: "uppercase" }}>{title}</div>
      {badge && <span style={{ fontSize: 11, fontWeight: 700, background: theme.accent, color: '#fff', padding: "2px 8px", borderRadius: 10 }}>{badge}</span>}
    </div>
    {children}
  </div>
);

const Select = ({ value, onChange, options, theme }) => (
  <select value={value} onChange={onChange} style={{ width: "100%", padding: "12px", borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.text, fontSize: 16, appearance: "none" }}>
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
);

const Input = ({ value, onChange, placeholder, theme }) => (
  <input type="number" value={value} onChange={onChange} placeholder={placeholder} style={{ width: "100%", padding: "12px", borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.text, fontSize: 16, boxSizing: "border-box" }} />
);

/* =========================================
   4. GLAVNA APLIKACIJA
   ========================================= */

export default function App() {
  const isDark = usePrefersDark();
  const theme = useMemo(() => makeTheme(isDark), [isDark]);

  // --- ZAŠTITA OD BIJELOG EKRANA ---
  if (!TB || !TB.citadels || !TB.troops) {
    return (
      <div style={{ padding: 30, background: theme.pageBg, color: theme.text, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <h2 style={{ color: "red" }}>⚠️ PODACI NEDOSTAJU</h2>
        <p>Aplikacija ne može učitati <b>tb_data.json</b>.</p>
        <p style={{ fontSize: 14, color: theme.subtext }}>Provjeri nalazi li se datoteka u istom folderu i ima li ispravan sadržaj.</p>
      </div>
    );
  }

  // State
  const citadelKeys = Object.keys(TB.citadels);
  const troopByName = useMemo(() => {
    const m = new Map();
    TB.troops.forEach(t => m.set(t.name, t));
    return m;
  }, []);

  const [citadelLevel, setCitadelLevel] = useState(citadelKeys[0] || "25");
  const [strikerTroops, setStrikerTroops] = useState(Array(9).fill(""));
  const [strikerBonus, setStrikerBonus] = useState(Array(9).fill(""));
  const [firstHpBonus, setFirstHpBonus] = useState("");
  const [wallKiller, setWallKiller] = useState("");
  const [wallBonus, setWallBonus] = useState("");
  
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);

  // Kalkulacija
  const calculate = () => {
    const cit = TB.citadels[citadelLevel];
    if (!cit) return;

    const targets = cit.normalTargets || []; 
    let lines = [];

    // Wall
    const wk = troopByName.get(wallKiller);
    if (wk) {
      const str = toNum(wk.strength || wk.baseStrength) * (1 + (toNum(wallBonus) + toNum(wk.fortBonus))/100) * 20;
      if (str > 0) lines.push({ troop: wallKiller, req: Math.ceil(toNum(cit.wallHP)/str) });
    }

    // Strikers
    const t1 = troopByName.get(strikerTroops[0]);
    const hp1 = toNum(t1?.health || t1?.baseHealth) * (1 + toNum(firstHpBonus)/100);
    const firstLosses = hp1 > 0 ? Math.floor(toNum(cit.firstStrikeDamage)/hp1) : 0;

    strikerTroops.forEach((name, i) => {
      if (!name) return;
      const t = troopByName.get(name);
      let b = toNum(strikerBonus[i]);
      if (TB.additionalBonusNormal?.[name]) b += TB.additionalBonusNormal[name];
      
      const str = toNum(t?.strength || t?.baseStrength) * (1 + b/100);
      let req = str > 0 ? Math.floor(toNum(targets[i]||0)/str) : 0;
      if (i===0) req += firstLosses;

      const exist = lines.find(l => l.troop === name);
      if (exist) exist.req += req;
      else lines.push({ troop: name, req });
    });

    lines.sort((a,b) => RESULT_ORDER.indexOf(a.troop) - RESULT_ORDER.indexOf(b.troop));
    setResults(lines);
    setShowResults(true);
  };

  return (
    <div style={{ minHeight: "100vh", background: theme.pageBg, color: theme.text, fontFamily: "sans-serif", paddingBottom: 100 }}>
      {/* HEADER */}
      <div style={{ padding: "20px 16px", background: theme.pageBg, position: "sticky", top:0, zIndex:10, borderBottom:`1px solid ${theme.border}` }}>
        <h1 style={{ margin:0, fontSize: 20, fontWeight: 900, textTransform: "uppercase", letterSpacing: 1 }}>Citadel Calc</h1>
      </div>

      <div style={{ padding: 16, maxWidth: 600, margin: "0 auto" }}>
        
        {/* SETTINGS */}
        <Card title="Postavke" theme={theme}>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 13, color: theme.subtext, marginBottom: 5 }}>Citadel Level</div>
            <Select value={citadelLevel} onChange={e => setCitadelLevel(e.target.value)} options={citadelKeys} theme={theme} />
          </div>
          <button onClick={() => { setStrikerTroops(Array(9).fill("")); setWallKiller(""); setResults(null); }} style={{ width: "100%", padding: 10, borderRadius: 8, background: "rgba(255,0,0,0.1)", color: "red", border: "none", fontWeight: "bold" }}>RESETIRAJ SVE</button>
        </Card>

        {/* WALL KILLER */}
        <Card title="Wall Breaker" theme={theme} badge="Obavezno">
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 13, color: theme.subtext, marginBottom: 5 }}>Jedinica</div>
            <select value={wallKiller} onChange={e => setWallKiller(e.target.value)} style={{ width: "100%", padding: 12, borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.text }}>
               <option value="">-- Odaberi --</option>
               {WALL_KILLERS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
             <div style={{ fontSize: 13, color: theme.subtext, marginBottom: 5 }}>Bonus Snage (%)</div>
             <Input value={wallBonus} onChange={e => setWallBonus(e.target.value)} placeholder="0" theme={theme} />
          </div>
        </Card>

        {/* STRIKERS */}
        {STRIKER_LABELS.map((label, i) => (
          <Card key={i} title={`${i+1}. ${label}`} theme={theme} badge={i===0 ? "Tenk" : null}>
            <div style={{ marginBottom: 10 }}>
               <div style={{ fontSize: 13, color: theme.subtext, marginBottom: 5 }}>Jedinica</div>
               <select value={strikerTroops[i]} onChange={e => { const n=[...strikerTroops]; n[i]=e.target.value; setStrikerTroops(n); }} style={{ width: "100%", padding: 12, borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.text }}>
                  <option value="">-- Odaberi --</option>
                  {TROOPS_Simple.map(n => <option key={n} value={n}>{n}</option>)}
               </select>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: i===0?"1fr 1fr":"1fr", gap: 10 }}>
              {i===0 && (
                <div>
                  <div style={{ fontSize: 12, color: theme.subtext, marginBottom: 5 }}>HP Bonus %</div>
                  <Input value={firstHpBonus} onChange={e => setFirstHpBonus(e.target.value)} placeholder="0" theme={theme} />
                </div>
              )}
              <div>
                <div style={{ fontSize: 12, color: theme.subtext, marginBottom: 5 }}>Str Bonus %</div>
                <Input value={strikerBonus[i]} onChange={e => {const n=[...strikerBonus]; n[i]=e.target.value; setStrikerBonus(n);}} placeholder="0" theme={theme} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* FAB ACTION BUTTON */}
      <div style={{ position: "fixed", bottom:0, left:0, right:0, padding: 16, background: theme.bottomBarBg, borderTop: `1px solid ${theme.border}` }}>
        <button onClick={calculate} style={{ width: "100%", padding: 16, borderRadius: 14, background: theme.btnBg, color: "white", fontWeight: 800, border: "none", fontSize: 16, boxShadow: "0 4px 10px rgba(0,0,0,0.2)" }}>IZRAČUNAJ NAPAD</button>
      </div>

      {/* REZULTATI MODAL */}
      {showResults && (
        <div style={{ position: "fixed", inset: 0, background: theme.overlay, backdropFilter: "blur(5px)", display: "flex", alignItems: "flex-end", zIndex: 100 }} onClick={() => setShowResults(false)}>
           <div style={{ background: theme.cardBg, width: "100%", borderRadius: "20px 20px 0 0", padding: 20, maxHeight: "80vh", overflowY: "auto", borderTop: `1px solid ${theme.border}` }} onClick={e => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                 <h2 style={{ margin: 0 }}>Plan Napada</h2>
                 <button onClick={() => setShowResults(false)} style={{ background: "transparent", border: "none", fontSize: 24, color: theme.text }}>✕</button>
              </div>
              
              {results && results.length > 0 ? (
                <div>
                  {results.map((l, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${theme.border}` }}>
                       <span style={{ fontWeight: "bold" }}>{l.troop}</span>
                       <span style={{ fontWeight: "bold", color: theme.accent, fontSize: 18 }}>{fmtInt(l.req)}</span>
                    </div>
                  ))}
                  <button onClick={() => copyToClipboard(results.map(l => `${l.troop} - ${l.req}`).join("\n"))} style={{ width: "100%", marginTop: 20, padding: 14, background: "#10b981", color: "white", border: "none", borderRadius: 12, fontWeight: "bold" }}>KOPIRAJ LISTU</button>
                </div>
              ) : (
                <p>Nema rezultata. Provjeri jesi li odabrao trupe.</p>
              )}
           </div>
        </div>
      )}
    </div>
  );
}
