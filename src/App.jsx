import React, { useMemo, useState, useEffect } from "react";

/* =========================================
   1. PODACI (Ugrađeni direktno da nema greške s importom)
   ========================================= */

const TB_DATA = {
  "citadels": {
    "25": { 
      "wallHP": 28435800, 
      "firstStrikeDamage": 115000, 
      "normalTargets": [26500000, 26500000, 26500000, 26500000, 26500000, 26500000, 26500000, 26500000, 26500000],
      "m8m9Targets": [26500000, 26500000, 26500000, 26500000, 26500000, 26500000, 26500000, 26500000, 26500000]
    },
    "30": { 
      "wallHP": 35000000, 
      "firstStrikeDamage": 150000, 
      "normalTargets": [30000000, 30000000, 30000000, 30000000, 30000000, 30000000, 30000000, 30000000, 30000000] 
    }
  },
  "troops": [
    { "name": "Wyvern", "strength": 4000, "health": 15000 },
    { "name": "Warregal", "strength": 4000, "health": 15000 },
    { "name": "Jago", "strength": 5000, "health": 18000 },
    { "name": "Ariel", "strength": 12000, "health": 4000, "fortBonus": 300 },
    { "name": "Epic Monster Hunter", "strength": 6000, "health": 20000 },
    { "name": "Fire Phoenix II", "strength": 8000, "health": 25000 },
    { "name": "Fire Phoenix I", "strength": 7000, "health": 22000 },
    { "name": "Manticore", "strength": 5000, "health": 18000 },
    { "name": "Corax II", "strength": 3500, "health": 14000 },
    { "name": "Corax I", "strength": 3000, "health": 12000 },
    { "name": "Royal Lion II", "strength": 3500, "health": 14000 },
    { "name": "Royal Lion I", "strength": 3000, "health": 12000 },
    { "name": "Griffin VII", "strength": 3000, "health": 12000 },
    { "name": "Josephine II", "strength": 10000, "health": 3500, "fortBonus": 250 },
    { "name": "Josephine I", "strength": 8000, "health": 3000, "fortBonus": 200 },
    { "name": "Griffin VI", "strength": 2800, "health": 11000 },
    { "name": "Griffin V", "strength": 2500, "health": 10000 },
    { "name": "Siege Ballistae VII", "strength": 5000, "health": 2000 },
    { "name": "Siege Ballistae VI", "strength": 4000, "health": 1800 },
    { "name": "Catapult V", "strength": 3000, "health": 1500 },
    { "name": "Catapult IV", "strength": 2500, "health": 1200 },
    { "name": "Vulture VII", "strength": 2000, "health": 8000 },
    { "name": "Vulture VI", "strength": 1800, "health": 7000 },
    { "name": "Vulture V", "strength": 1500, "health": 6000 }
  ]
};

/* =========================================
   2. TEMA & POMOĆNE FUNKCIJE
   ========================================= */

function usePrefersDark() {
  const [isDark, setIsDark] = useState(false);
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
  return isDark ? {
      pageBg: "#0b0e14", cardBg: "#151b26", accent: "#3b82f6", text: "#f1f5f9", subtext: "#94a3b8", border: "#2a3441", inputBg: "#0f1116", btnBg: "blue", overlay: "rgba(0,0,0,0.9)"
    } : {
      pageBg: "#f0f2f5", cardBg: "#ffffff", accent: "#2563eb", text: "#0f172a", subtext: "#64748b", border: "#e2e8f0", inputBg: "#f8fafc", btnBg: "blue", overlay: "rgba(0,0,0,0.5)"
    };
}

// Konstante
const STRIKER_LABELS = ["1. First Striker", "2. Second Striker", "3. Third Striker", "4. Cleanup 1", "5. Cleanup 2", "6. Cleanup 3", "7. Cleanup 4", "8. Cleanup 5", "9. Cleanup 6"];
const TROOP_NAMES = TB_DATA.troops.map(t => t.name);
const WALL_KILLERS = ["Ariel", "Josephine II", "Josephine I", "Siege Ballistae VII", "Siege Ballistae VI", "Catapult V"];

// Helpers
const toNum = v => Number(v) || 0;
const fmtInt = n => Math.floor(n).toLocaleString();

/* =========================================
   3. UI KOMPONENTE
   ========================================= */

const Card = ({ title, children, theme }) => (
  <div style={{ background: theme.cardBg, borderRadius: 12, padding: 16, marginBottom: 16, border: `1px solid ${theme.border}`, boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
    <div style={{ fontSize: 14, fontWeight: "bold", color: theme.text, marginBottom: 10, textTransform: "uppercase" }}>{title}</div>
    {children}
  </div>
);

const Select = ({ value, onChange, options, theme }) => (
  <select value={value} onChange={onChange} style={{ width: "100%", padding: 12, borderRadius: 8, background: theme.inputBg, color: theme.text, border: `1px solid ${theme.border}`, fontSize: 16, marginBottom: 8 }}>
    <option value="">-- Select --</option>
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
);

const Input = ({ value, onChange, placeholder, theme }) => (
  <input type="number" value={value} onChange={onChange} placeholder={placeholder} style={{ width: "100%", padding: 12, borderRadius: 8, background: theme.inputBg, color: theme.text, border: `1px solid ${theme.border}`, fontSize: 16, boxSizing: "border-box" }} />
);

/* =========================================
   4. GLAVNA APLIKACIJA
   ========================================= */

export default function App() {
  const isDark = usePrefersDark();
  const theme = useMemo(() => makeTheme(isDark), [isDark]);

  // State
  const [citadelLevel, setCitadelLevel] = useState("25");
  const [strikerTroops, setStrikerTroops] = useState(Array(9).fill(""));
  const [strikerBonus, setStrikerBonus] = useState(Array(9).fill(""));
  const [firstHpBonus, setFirstHpBonus] = useState("");
  const [wallKiller, setWallKiller] = useState("");
  const [wallBonus, setWallBonus] = useState("");
  const [results, setResults] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Mape za brzi dohvat
  const troopMap = useMemo(() => {
    const m = new Map();
    TB_DATA.troops.forEach(t => m.set(t.name, t));
    return m;
  }, []);

  const calculate = () => {
    try {
      const cit = TB_DATA.citadels[citadelLevel];
      if (!cit) { alert("Citadel level not found!"); return; }

      const targets = cit.normalTargets || [];
      const lines = [];

      // 1. Zid
      const wk = troopMap.get(wallKiller);
      if (wk) {
        const bonus = toNum(wallBonus) + toNum(wk.fortBonus || 0);
        const str = wk.strength * (1 + bonus / 100) * 20; // x20 za zid
        if (str > 0) lines.push({ name: wallKiller, count: Math.ceil(cit.wallHP / str) });
      }

      // 2. Napadači
      // Prvi napadač gubici
      const t1 = troopMap.get(strikerTroops[0]);
      let firstLosses = 0;
      if (t1) {
        const hp = t1.health * (1 + toNum(firstHpBonus) / 100);
        if (hp > 0) firstLosses = Math.floor(cit.firstStrikeDamage / hp);
      }

      strikerTroops.forEach((name, i) => {
        if (!name) return;
        const t = troopMap.get(name);
        if (!t) return;

        const str = t.strength * (1 + toNum(strikerBonus[i]) / 100);
        if (str > 0) {
          let req = Math.floor((targets[i] || 0) / str);
          if (i === 0) req += firstLosses;
          
          const exist = lines.find(l => l.name === name);
          if (exist) exist.count += req;
          else lines.push({ name, count: req });
        }
      });

      setResults(lines);
      setShowModal(true);
    } catch (err) {
      alert("Error in calculation: " + err.message);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: theme.pageBg, color: theme.text, fontFamily: "sans-serif", paddingBottom: 100 }}>
      {/* TEST DA VIDIMO RADI LI REACT */}
      <div style={{ padding: 15, background: theme.accent, color: "white", textAlign: "center", fontWeight: "bold" }}>
        STATUS: OK (v3)
      </div>

      <div style={{ padding: 16, maxWidth: 600, margin: "0 auto" }}>
        
        {/* POSTAVKE */}
        <Card title="Citadel Settings" theme={theme}>
          <label style={{ fontSize: 12, color: theme.subtext }}>Level</label>
          <Select value={citadelLevel} onChange={e => setCitadelLevel(e.target.value)} options={Object.keys(TB_DATA.citadels)} theme={theme} />
          
          <div style={{ height: 10 }} />
          <button onClick={() => { setStrikerTroops(Array(9).fill("")); setWallKiller(""); setResults(null); }} style={{ width: "100%", padding: 10, background: "rgba(255,0,0,0.1)", color: "red", border: "none", borderRadius: 8 }}>RESET ALL</button>
        </Card>

        {/* WALL BREAKER */}
        <Card title="Wall Breaker" theme={theme}>
          <Select value={wallKiller} onChange={e => setWallKiller(e.target.value)} options={WALL_KILLERS} theme={theme} />
          <Input value={wallBonus} onChange={e => setWallBonus(e.target.value)} placeholder="Strength Bonus %" theme={theme} />
        </Card>

        {/* STRIKERS LOOP */}
        {STRIKER_LABELS.map((label, i) => (
          <Card key={i} title={label} theme={theme}>
            <Select value={strikerTroops[i]} onChange={e => { const n = [...strikerTroops]; n[i] = e.target.value; setStrikerTroops(n); }} options={TROOP_NAMES} theme={theme} />
            
            <div style={{ display: "grid", gridTemplateColumns: i === 0 ? "1fr 1fr" : "1fr", gap: 10 }}>
              {i === 0 && (
                 <Input value={firstHpBonus} onChange={e => setFirstHpBonus(e.target.value)} placeholder="HP Bonus %" theme={theme} />
              )}
              <Input value={strikerBonus[i]} onChange={e => { const n = [...strikerBonus]; n[i] = e.target.value; setStrikerBonus(n); }} placeholder="Str Bonus %" theme={theme} />
            </div>
          </Card>
        ))}

      </div>

      {/* FLOAT BUTTON */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: 16, background: theme.pageBg, borderTop: `1px solid ${theme.border}` }}>
        <button onClick={calculate} style={{ width: "100%", padding: 16, borderRadius: 12, background: theme.accent, color: "white", fontWeight: "bold", border: "none", fontSize: 16 }}>CALCULATE ATTACK</button>
      </div>

      {/* REZULTATI MODAL */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: theme.overlay, backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }} onClick={() => setShowModal(false)}>
          <div style={{ background: theme.cardBg, width: "90%", maxWidth: 400, padding: 20, borderRadius: 16, border: `1px solid ${theme.border}`, maxHeight: "80vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ margin: 0, color: theme.text }}>Result</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "transparent", border: "none", color: theme.text, fontSize: 20 }}>✕</button>
            </div>
            
            {results && results.length > 0 ? (
              results.map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${theme.border}` }}>
                  <span style={{ color: theme.text }}>{r.name}</span>
                  <span style={{ fontWeight: "bold", color: theme.accent, fontSize: 18 }}>{fmtInt(r.count)}</span>
                </div>
              ))
            ) : (
              <p style={{ color: theme.subtext }}>No troops selected.</p>
            )}
            
            <button onClick={() => setShowModal(false)} style={{ width: "100%", marginTop: 20, padding: 12, background: theme.text, color: theme.pageBg, border: "none", borderRadius: 8, fontWeight: "bold" }}>CLOSE</button>
          </div>
        </div>
      )}

    </div>
  );
}
