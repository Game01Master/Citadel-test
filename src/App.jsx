import React, { useState, useEffect, useMemo } from "react";

/* =========================================
   ⚔️ PODACI IGRE (HARDCODED FOR SAFETY) ⚔️
   Ovo osigurava da se aplikacija ne ruši.
   ========================================= */
const TB_DATA = {
  citadels: {
    "25": {
      wallHP: 20000000,
      firstStrikeDamage: 50000,
      normalTargets: [100000, 100000, 100000, 50000, 50000, 50000, 50000, 50000, 50000],
      m8m9Targets: [200000, 200000, 200000, 100000, 100000, 100000, 100000, 100000, 100000]
    },
    "26": {
      wallHP: 25000000,
      firstStrikeDamage: 60000,
      normalTargets: [120000, 120000, 120000, 60000, 60000, 60000, 60000, 60000, 60000],
      m8m9Targets: [250000, 250000, 250000, 120000, 120000, 120000, 120000, 120000, 120000]
    },
     "27": {
      wallHP: 30000000,
      firstStrikeDamage: 70000,
      normalTargets: [140000, 140000, 140000, 70000, 70000, 70000, 70000, 70000, 70000],
      m8m9Targets: [300000, 300000, 300000, 140000, 140000, 140000, 140000, 140000, 140000]
    }
  },
  troops: [
    { name: "Corax II", strength: 100, health: 500 },
    { name: "Griffin VII", strength: 120, health: 600 },
    { name: "Manticore", strength: 80, health: 400 },
    { name: "Fire Phoenix I", strength: 90, health: 450 },
    { name: "Fire Phoenix II", strength: 110, health: 550 },
    { name: "Ariel", strength: 50, health: 200, fortBonus: 50 },
    { name: "Siege Ballistae VII", strength: 60, health: 250, fortBonus: 40 },
    { name: "Wyvern", strength: 95, health: 480 },
    { name: "Warregal", strength: 105, health: 520 },
    { name: "Jago", strength: 100, health: 500 },
    { name: "Epic Monster Hunter", strength: 110, health: 550 },
    { name: "Royal Lion I", strength: 95, health: 480 },
    { name: "Royal Lion II", strength: 105, health: 520 },
    { name: "Vulture VII", strength: 85, health: 420 },
    { name: "Catapult V", strength: 55, health: 220, fortBonus: 30 }
  ],
  firstStrikerAllowed: {
    WITHOUT: ["Corax II", "Griffin VII", "Wyvern", "Manticore"],
    WITH: ["Corax II", "Griffin VII", "Warregal", "Fire Phoenix II"]
  }
};

// --- IKONE I POMOĆNE FUNKCIJE ---
const ICON_MAP = {
  "Corax II": "Corax II.png", "Griffin VII": "Griffin VII.png", "Manticore": "Manticore.png",
  "Fire Phoenix I": "Fire Phoenix I.png", "Fire Phoenix II": "Fire Phoenix II.png",
  "Ariel": "Ariel.png", "Siege Ballistae VII": "Siege Ballistae VII.png",
  "Wyvern": "Wyvern.png", "Warregal": "Warregal.png", "Jago": "Jago.png",
  "Epic Monster Hunter": "Epic Monster Hunter.png", "Royal Lion I": "Royal Lion I.png",
  "Royal Lion II": "Royal Lion II.png", "Vulture VII": "Vulture VII.png",
  "Catapult V": "Catapult V.png"
};

function getIcon(name) {
  if (!name || !ICON_MAP[name]) return null;
  // Putanja do public/icons
  return `./icons/${ICON_MAP[name]}`; 
}

function fmtInt(n) { return Math.floor(n || 0).toLocaleString('en-US'); }

// --- GAME DIZAJN KOMPONENTE ---

// 1. Staklena Kartica
const GameCard = ({ title, children, isGold }) => (
  <div style={{
    background: "rgba(20, 20, 25, 0.75)", // Polu-prozirna crna
    backdropFilter: "blur(12px)", // Zamućenje pozadine
    border: isGold ? "1px solid #C5A059" : "1px solid rgba(255,255,255,0.15)",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "16px",
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
    color: "#E0E0E0"
  }}>
    {title && (
      <div style={{
        textTransform: "uppercase",
        letterSpacing: "2px",
        color: isGold ? "#FFD700" : "#A0AEC0", // Zlatna ili siva
        fontSize: "14px",
        fontWeight: "bold",
        marginBottom: "12px",
        borderBottom: `1px solid ${isGold ? "#C5A059" : "rgba(255,255,255,0.1)"}`,
        paddingBottom: "8px",
        textShadow: isGold ? "0 0 5px rgba(255, 215, 0, 0.5)" : "none"
      }}>
        {title}
      </div>
    )}
    {children}
  </div>
);

// 2. RPG Gumb
const GameButton = ({ onClick, children, variant = "primary" }) => {
  const isPrimary = variant === "primary";
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "14px",
        borderRadius: "8px",
        border: "none",
        background: isPrimary 
          ? "linear-gradient(135deg, #b8860b 0%, #daa520 100%)" // Zlatni gradijent
          : "rgba(255, 255, 255, 0.1)",
        color: isPrimary ? "#000" : "#fff",
        fontWeight: "800",
        fontSize: "16px",
        textTransform: "uppercase",
        letterSpacing: "1px",
        cursor: "pointer",
        boxShadow: isPrimary ? "0 4px 15px rgba(218, 165, 32, 0.4)" : "none",
        transition: "transform 0.1s",
        marginTop: "8px"
      }}
      onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.98)"}
      onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
    >
      {children}
    </button>
  );
};

// 3. Select i Input
const inputStyle = {
  width: "100%",
  padding: "12px",
  background: "rgba(0, 0, 0, 0.5)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  outline: "none",
  appearance: "none" // Miče default strelicu na mobitelima
};


export default function App() {
  // --- STATE ---
  const [mode, setMode] = useState("WITHOUT");
  const [citadelLevel, setCitadelLevel] = useState("25");
  
  // 9 Strikers + 1 Wall Killer
  const [strikerTroops, setStrikerTroops] = useState(Array(9).fill(""));
  const [strikerBonus, setStrikerBonus] = useState(Array(9).fill(""));
  const [wallKiller, setWallKiller] = useState("");
  const [wallBonus, setWallBonus] = useState("");
  const [firstHpBonus, setFirstHpBonus] = useState("");
  
  const [results, setResults] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- LOGIKA ---
  const LABELS = ["First Striker", "Second Striker", "Third Striker", "Cleanup 1", "Cleanup 2", "Cleanup 3", "Cleanup 4", "Cleanup 5", "Cleanup 6"];
  const cit = TB_DATA.citadels[citadelLevel];
  const targets = mode === "WITH" ? cit?.m8m9Targets : cit?.normalTargets;
  
  // Filtrirane liste
  const availableTroops = TB_DATA.troops.map(t => t.name);
  const wallKillerOptions = ["Ariel", "Siege Ballistae VII", "Catapult V"]; // Pojednostavljeno za demo
  
  const calculate = () => {
    if (!cit) return;

    // 1. Wall Killer Calculation
    let wkRes = null;
    if (wallKiller) {
      const t = TB_DATA.troops.find(x => x.name === wallKiller);
      if (t) {
        const totalBonus = Number(wallBonus) + (t.fortBonus || 0);
        const dmg = t.strength * (1 + totalBonus/100) * 20;
        const req = dmg > 0 ? Math.ceil(cit.wallHP / dmg) : 0;
        wkRes = { name: wallKiller, req, type: "Wall" };
      }
    }

    // 2. Strikers
    const sRes = LABELS.map((lbl, i) => {
      const name = strikerTroops[i];
      if (!name) return null;
      const t = TB_DATA.troops.find(x => x.name === name);
      if (!t) return null;

      const bonus = Number(strikerBonus[i]);
      const dmg = t.strength * (1 + bonus/100);
      let req = dmg > 0 ? Math.floor(targets[i] / dmg) : 0;
      
      // First striker deaths
      if (i === 0) {
         const effHp = t.health * (1 + Number(firstHpBonus)/100);
         const deaths = effHp > 0 ? Math.floor(cit.firstStrikeDamage / effHp) : 0;
         req += deaths;
      }
      return { name, req, type: "Striker" };
    }).filter(Boolean);

    // Grupiranje
    const finalCounts = {};
    if (wkRes) finalCounts[wkRes.name] = wkRes.req;
    sRes.forEach(r => {
      finalCounts[r.name] = (finalCounts[r.name] || 0) + r.req;
    });

    const list = Object.keys(finalCounts).map(k => ({ name: k, count: finalCounts[k] }));
    setResults(list);
    setIsModalOpen(true);
  };

  const reset = () => {
    setStrikerTroops(Array(9).fill(""));
    setStrikerBonus(Array(9).fill(""));
    setWallKiller("");
    setWallBonus("");
    setFirstHpBonus("");
    setResults(null);
  };

  // --- RENDER ---
  return (
    <div style={{
      minHeight: "100vh",
      // OVDJE SE UCITAVA POZADINA:
      backgroundImage: `url('./bg.jpg')`, 
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      backgroundColor: "#1a1a1a", // Fallback boja
      fontFamily: "'Cinzel', serif", // Probamo serif font ako ga sistem ima
      padding: "20px 16px",
      paddingBottom: "100px",
      boxSizing: "border-box"
    }}>
      
      {/* HEADER */}
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
         <h1 style={{ 
           margin: 0, 
           color: "#FFD700", // Zlato
           textShadow: "0 2px 4px rgba(0,0,0,0.8)",
           fontSize: "28px",
           letterSpacing: "2px",
           fontFamily: "serif"
         }}>
           CITADEL<br/>CALCULATOR
         </h1>
         <div style={{ color: "#aaa", fontSize: "12px", marginTop: "4px" }}>GAME EDITION</div>
      </div>

      {/* SETUP */}
      <GameCard title="Battle Setup">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label style={{ fontSize: "12px", color: "#888", display:"block", marginBottom:4 }}>MODE</label>
            <select style={inputStyle} value={mode} onChange={e => setMode(e.target.value)}>
              <option value="WITHOUT">No M8/M9</option>
              <option value="WITH">With M8/M9</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "#888", display:"block", marginBottom:4 }}>CITADEL</label>
            <select style={inputStyle} value={citadelLevel} onChange={e => setCitadelLevel(e.target.value)}>
              {Object.keys(TB_DATA.citadels).map(k => <option key={k} value={k}>Lvl {k}</option>)}
            </select>
          </div>
        </div>
        <GameButton onClick={reset} variant="secondary">Reset Troops</GameButton>
      </GameCard>

      {/* WALL KILLER */}
      <GameCard title="🛡️ Wall Breaker" isGold>
        <div style={{ marginBottom: "12px" }}>
           <select style={inputStyle} value={wallKiller} onChange={e => setWallKiller(e.target.value)}>
             <option value="">-- Select Unit --</option>
             {wallKillerOptions.map(o => <option key={o} value={o}>{o}</option>)}
           </select>
        </div>
        {wallKiller && (
          <div style={{display:"flex", alignItems:"center", gap: 10}}>
             {getIcon(wallKiller) && <img src={getIcon(wallKiller)} width={48} height={48} style={{borderRadius:6, border:"1px solid #C5A059"}} />}
             <div style={{flex:1}}>
                <label style={{ fontSize: "12px", color: "#888" }}>Strength Bonus %</label>
                <input type="number" style={inputStyle} placeholder="0" value={wallBonus} onChange={e => setWallBonus(e.target.value)} />
             </div>
          </div>
        )}
      </GameCard>

      {/* STRIKERS */}
      {LABELS.map((lbl, idx) => (
        <GameCard key={idx} title={`${idx + 1}. ${lbl}`}>
          <div style={{ marginBottom: "12px" }}>
            <select 
              style={inputStyle} 
              value={strikerTroops[idx]} 
              onChange={e => {
                const copy = [...strikerTroops];
                copy[idx] = e.target.value;
                setStrikerTroops(copy);
              }}
            >
              <option value="">-- Select Unit --</option>
              {availableTroops.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
            {getIcon(strikerTroops[idx]) ? (
               <img src={getIcon(strikerTroops[idx])} width={48} height={48} style={{borderRadius:6, border:"1px solid #555"}} />
            ) : (
               <div style={{width:48, height:48, background:"rgba(0,0,0,0.3)", borderRadius:6}} />
            )}
            
            <div style={{flex:1}}>
               {idx === 0 && (
                 <div style={{marginBottom: 8}}>
                    <label style={{ fontSize: "11px", color: "#FF6B6B" }}>Health Bonus %</label>
                    <input type="number" style={{...inputStyle, borderColor: "#FF6B6B"}} placeholder="HP Bonus" value={firstHpBonus} onChange={e => setFirstHpBonus(e.target.value)} />
                 </div>
               )}
               <div>
                  <label style={{ fontSize: "11px", color: "#4ECDC4" }}>Strength Bonus %</label>
                  <input type="number" style={{...inputStyle, borderColor: "#4ECDC4"}} placeholder="Str Bonus" value={strikerBonus[idx]} onChange={e => {
                    const copy = [...strikerBonus];
                    copy[idx] = e.target.value;
                    setStrikerBonus(copy);
                  }} />
               </div>
            </div>
          </div>
        </GameCard>
      ))}

      {/* FOOTER ACTION */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "rgba(0,0,0,0.9)",
        borderTop: "1px solid #C5A059",
        padding: "16px",
        zIndex: 100
      }}>
         <GameButton onClick={calculate}>⚔️ CALCULATE ⚔️</GameButton>
      </div>

      {/* RESULTS MODAL */}
      {isModalOpen && results && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 999,
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(5px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }} onClick={() => setIsModalOpen(false)}>
          
          <div style={{
            background: "#1a1a1a",
            border: "2px solid #C5A059",
            borderRadius: "16px",
            width: "100%", maxWidth: "400px",
            maxHeight: "80vh", overflowY: "auto",
            boxShadow: "0 0 30px rgba(197, 160, 89, 0.3)"
          }} onClick={e => e.stopPropagation()}>
            
            <div style={{ 
               padding: "16px", 
               background: "linear-gradient(to right, #b8860b, #8b6508)",
               color: "white", textAlign: "center", fontWeight: "bold", fontSize: "18px",
               textTransform: "uppercase", letterSpacing: "1px"
            }}>
              Victory Plan
            </div>

            <div style={{ padding: "16px" }}>
              {results.length === 0 ? (
                <div style={{textAlign:"center", color:"#aaa"}}>No troops needed? Check your selection.</div>
              ) : (
                results.map((r, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px", marginBottom: "8px",
                    background: "rgba(255,255,255,0.05)", borderRadius: "8px",
                    borderLeft: "4px solid #C5A059"
                  }}>
                    <div style={{display:"flex", alignItems:"center", gap: 10}}>
                       {getIcon(r.name) && <img src={getIcon(r.name)} width={32} height={32} style={{borderRadius:4}} />}
                       <span style={{color: "#ddd", fontWeight: "bold"}}>{r.name}</span>
                    </div>
                    <span style={{color: "#FFD700", fontSize: "18px", fontWeight: "bold"}}>{fmtInt(r.count)}</span>
                  </div>
                ))
              )}
            </div>

            <div style={{ padding: "16px", borderTop: "1px solid #333" }}>
              <GameButton onClick={() => setIsModalOpen(false)} variant="secondary">Close</GameButton>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
