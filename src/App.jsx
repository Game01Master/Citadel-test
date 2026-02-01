import React, { useMemo, useState, useEffect } from "react";
import TB from "./tb_data.json";

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

function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function fmtInt(n) {
  if (!Number.isFinite(n)) return "-";
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(Math.floor(n));
}
function normName(s) {
  return String(s ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}

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

function iconSrcForTroop(name) {
  const file = ICON_FILE_MAP[name];
  if (!file) return null;
  return `${ICON_BASE}icons/${encodeURIComponent(file)}`;
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed"; ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return !!ok;
    } catch { return false; }
  }
}

// --- TEMA DIZAJNA ---
// Zlatna boja i prozirnost
const GOLD_COLOR = "#F0C058"; // Bogata zlatna boja
const GOLD_BORDER = `1px solid ${GOLD_COLOR}`;

function Card({ title, children }) {
  return (
    <div
      style={{
        border: `1px solid rgba(240, 192, 88, 0.5)`, // Polu-prozirni zlatni rub
        borderRadius: 16,
        padding: 16,
        // Povećana prozirnost (0.65 umjesto 0.85)
        background: "rgba(20, 20, 25, 0.65)",
        backdropFilter: "blur(8px)",
        boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.5)",
        marginBottom: 16,
        boxSizing: "border-box"
      }}
    >
      <div style={{ 
        fontWeight: 800, 
        fontSize: 18, 
        marginBottom: 12, 
        color: GOLD_COLOR, // Zlatni naslov
        textTransform: "uppercase",
        letterSpacing: "1px",
        textShadow: "0 2px 4px rgba(0,0,0,0.8)"
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Row({ label, value, accent }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
      <span style={{ color: "#ccc", fontSize: 14 }}>{label}</span>
      <span style={{ fontWeight: 700, color: accent ? GOLD_COLOR : "#fff" }}>{value}</span>
    </div>
  );
}

function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 2000,
        backdropFilter: "blur(5px)"
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "rgba(25, 25, 30, 0.95)", width: "100%", maxWidth: 500, borderRadius: 16,
        maxHeight: "85vh", display: "flex", flexDirection: "column", border: `2px solid ${GOLD_COLOR}`,
        boxShadow: "0 0 40px rgba(240, 192, 88, 0.2)"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <span style={{ fontWeight: 800, color: GOLD_COLOR, fontSize: 20, textTransform: "uppercase" }}>{title}</span>
          <button onClick={onClose} style={{
              background: "transparent", border: "none", color: "#fff", fontSize: 28, cursor: "pointer", display: "flex", alignItems: "center"
            }}
          >✕</button>
        </div>
        <div style={{ padding: 20, overflowY: "auto", flex: 1, color: "#e0e0e0" }}>{children}</div>
      </div>
    </div>
  );
}

// Custom Picker za odabir trupa (Zlatni stil)
function TroopPicker({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const display = value ? value : "—";

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <span style={{ color: "#aaa", fontSize: 13, fontWeight: "bold", textTransform: "uppercase" }}>{label}</span>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          padding: "12px", borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.2)",
          background: "rgba(0, 0, 0, 0.5)",
          color: "#fff", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between",
          cursor: "pointer", width: "100%", boxSizing: "border-box"
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          {value && iconSrcForTroop(value) && (
            <img src={iconSrcForTroop(value)} alt={value} width={36} height={36} style={{ borderRadius: 6, flexShrink: 0 }} />
          )}
          <span style={{ fontWeight: 600, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {display}
          </span>
        </span>
        <span style={{ color: GOLD_COLOR, fontSize: 14 }}>▼</span>
      </button>

      <Modal open={open} title={label} onClose={() => setOpen(false)}>
        <div style={{ display: "grid", gap: 8 }}>
          {options.map((opt) => {
            const isBlank = opt === "";
            const name = isBlank ? "—" : opt;
            const isSelected = opt === value;
            return (
              <button
                key={opt || "__blank__"}
                type="button"
                onClick={() => { onChange(opt); setOpen(false); }}
                style={{
                  width: "100%", textAlign: "left", padding: "10px", borderRadius: 8,
                  border: isSelected ? `1px solid ${GOLD_COLOR}` : "1px solid rgba(255,255,255,0.1)",
                  background: isSelected ? "rgba(240, 192, 88, 0.15)" : "rgba(255,255,255,0.05)",
                  color: isSelected ? GOLD_COLOR : "#fff", fontWeight: 600, fontSize: 15,
                  display: "flex", alignItems: "center", gap: 12, cursor: "pointer"
                }}
              >
                {!isBlank && iconSrcForTroop(opt) ? (
                  <img src={iconSrcForTroop(opt)} alt={opt} width={40} height={40} style={{ borderRadius: 6, flexShrink: 0 }} loading="lazy" />
                ) : (
                  <div style={{ width: 40, height: 40, borderRadius: 6, flexShrink: 0, border: "1px dashed #555" }} />
                )}
                <span>{name}</span>
              </button>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}

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
    setGroupBonusPct({ CORAX: "", PHOENIX: "", PHH_SPEAR: "", DUEL_HK_SW: "", VULTURE: "", ROYAL_LION: "", GRIFFIN: "" });
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
          setWarningMsg(`${label} (${picked}) has higher BASE strength (${fmtInt(pickedS)}) and BASE health (${fmtInt(pickedH)}) than your First striker (${first}, ${fmtInt(firstS)} / ${fmtInt(firstH)}).\n\nChoose a stronger First striker troops!!`);
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
    const keepSecond = current[1];
    setStrikerTroops(() => normalize(["", keepSecond, "", "", "", "", "", "", ""]));
    setStrikerBonusPct(() => Array(9).fill(""));
    setFirstHealthBonusPct("");
    setGroupBonusPct({ CORAX: "", PHOENIX: "", PHH_SPEAR: "", DUEL_HK_SW: "", VULTURE: "", ROYAL_LION: "", GRIFFIN: "" });
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

  const inputStyle = {
    padding: "12px", borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(0, 0, 0, 0.5)",
    color: "#fff", outline: "none", width: "100%",
    boxSizing: "border-box", fontSize: 16,
    marginBottom: 0
  };

  return (
    <div style={{
        width: "100%", minHeight: "100vh",
        background: "#121212",
        // OVDJE JE POZADINA:
        backgroundImage: "url('./bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        color: "#fff",
        fontFamily: "'Segoe UI', Roboto, sans-serif"
      }}
    >
      {/* Dark overlay */}
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 0, pointerEvents: "none" }} />
      
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 600, margin: "0 auto", padding: "20px 16px" }}>
        <div style={{ fontWeight: 800, fontSize: 32, marginBottom: 30, textAlign: "center", color: GOLD_COLOR, textShadow: "0 4px 10px rgba(0,0,0,0.8)", textTransform: "uppercase", letterSpacing: "1px" }}>
          Citadel<br/>Calculator
        </div>

        <div style={{ display: "grid", gap: 16, paddingBottom: 100 }}>
          <Card title="⚙️ Setup">
            <button onClick={() => setHelpOpen(true)}
              style={{
                width: "100%", padding: "12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.05)", color: "#ddd", fontWeight: "bold", fontSize: 15, marginBottom: 16, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8
              }}
            >
              <span>ℹ️</span> Instructions
            </button>
            <div style={{ display: "grid", gap: 16 }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ color: "#aaa", fontSize: 13, textTransform: "uppercase", fontWeight: "bold" }}>Mode</span>
                <select value={mode} onChange={(e) => handleModeChange(e.target.value)} style={inputStyle}>
                  <option value={MODE_WITHOUT}>Without M8/M9 troops</option>
                  <option value={MODE_WITH}>With M8/M9 troops</option>
                </select>
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ color: "#aaa", fontSize: 13, textTransform: "uppercase", fontWeight: "bold" }}>Citadel Level</span>
                <select value={citadelLevel} onChange={(e) => { setCitadelLevel(e.target.value); setCalcOutput(null); setResultsOpen(false); }} style={inputStyle}>
                  {citadelKeys.map((lvl) => <option key={lvl} value={lvl}>Elven Citadel {lvl}</option>)}
                </select>
              </label>
              <button onClick={resetSelections}
                style={{
                  width: "100%", padding: "12px", borderRadius: 10, border: "1px solid #d32f2f",
                  background: "rgba(211, 47, 47, 0.15)", color: "#ff8a80", fontWeight: "bold", fontSize: 14, cursor: "pointer", marginTop: 8
                }}
              >
                Reset Troops Selection
              </button>
            </div>
          </Card>

          <Card title="🛡️ Wall Killer">
            <div style={{ display: "grid", gap: 16 }}>
              <TroopPicker label="Troop" value={wallKillerTroop} options={wallKillerPool} onChange={(v) => { setWallKillerTroop(v); setCalcOutput(null); setResultsOpen(false); }} />
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ color: "#aaa", fontSize: 13, textTransform: "uppercase", fontWeight: "bold" }}>Strength Bonus (%)</span>
                <input type="number" step="any" inputMode="decimal" placeholder="0" value={wallKillerBonusPct} onChange={(e) => { setWallKillerBonusPct(e.target.value); setCalcOutput(null); setResultsOpen(false); }} style={inputStyle} onFocus={(e) => e.target.select()} />
              </label>
              <div style={{ background: "rgba(0,0,0,0.3)", padding: 12, borderRadius: 10 }}>
                  <Row label="Effective Bonus" value={`${fmtInt(wallKiller.effBonus)}%`} accent />
                  <Row label="Required Troops" value={fmtInt(wallKiller.requiredTroops)} accent />
              </div>
            </div>
          </Card>

          {perStriker.map((s) => {
            const idx = s.idx;
            const isFirst = idx === 0;
            const opts = optionsForIdx(idx);
            return (
              <Card key={idx} title={`${idx + 1}. ${s.label}`}>
                <div style={{ display: "grid", gap: 16 }}>
                  <TroopPicker label="Select Troop" value={strikerTroops[idx]} options={opts} onChange={(v) => handleTroopChange(idx, v)} />
                  <div style={{ display: "grid", gridTemplateColumns: isFirst ? "1fr 1fr" : "1fr", gap: 12 }}>
                    {isFirst && (
                      <label style={{ display: "grid", gap: 6 }}>
                        <span style={{ color: "#ff8a80", fontSize: 12, fontWeight: "bold", textTransform: "uppercase" }}>Health Bonus %</span>
                        <input type="number" step="any" inputMode="decimal" placeholder="0" value={firstHealthBonusPct} onChange={(e) => { setFirstHealthBonusPct(e.target.value); setCalcOutput(null); setResultsOpen(false); }} style={{...inputStyle, borderColor: "rgba(255, 138, 128, 0.4)"}} onFocus={(e) => e.target.select()} />
                      </label>
                    )}
                    <label style={{ display: "grid", gap: 6 }}>
                      <span style={{ color: "#80d8ff", fontSize: 12, fontWeight: "bold", textTransform: "uppercase" }}>Strength Bonus %</span>
                      <input type="number" step="any" inputMode="decimal" placeholder="0" value={strikerBonusPct[idx]} onChange={(e) => setBonusAt(idx, e.target.value)} style={{...inputStyle, borderColor: "rgba(128, 216, 255, 0.4)"}} onFocus={(e) => e.target.select()} />
                    </label>
                  </div>
                  <div style={{ background: "rgba(0,0,0,0.3)", padding: 12, borderRadius: 10 }}>
                      <Row label="Effective Bonus" value={`${fmtInt(s.effBonus)}%`} accent />
                      <Row label="Required Troops" value={fmtInt(s.requiredTroops)} accent />
                      {isFirst && (
                        <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                            <Row label="Citadel First Strike Losses" value={fmtInt(firstDeaths)} />
                        </div>
                      )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, padding: 16, background: "rgba(15, 15, 20, 0.95)", backdropFilter: "blur(10px)", borderTop: `1px solid ${GOLD_COLOR}`, zIndex: 100 }}>
          <div style={{ width: "100%", maxWidth: 600, margin: "0 auto" }}>
            <button onClick={showResults} style={{ width: "100%", padding: "16px", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${GOLD_COLOR}, #b8860b)`, color: "#000", fontWeight: 900, letterSpacing: 1, fontSize: 18, boxShadow: `0 0 20px rgba(240, 192, 88, 0.4)`, cursor: "pointer", textTransform: "uppercase" }}>
              CALCULATE
            </button>
          </div>
        </div>

        <Modal open={!!warningMsg} title="⚠️ Warning" onClose={() => setWarningMsg("")}>
          <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, color: "#fff", fontSize: 16 }}>{warningMsg}</div>
          <button onClick={() => setWarningMsg("")} style={{ width: "100%", marginTop: 24, padding: "14px", borderRadius: 10, border: "none", background: GOLD_COLOR, color: "#000", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>OK</button>
        </Modal>

        {/* IDENTIČNE UPUTE IZ ORIGINALA */}
        <Modal open={helpOpen} title="ℹ️ Instructions & Help" onClose={() => setHelpOpen(false)}>
          <div style={{ color: "#e0e0e0", lineHeight: 1.6, fontSize: 15, display: "grid", gap: 20 }}>
            <div>
                <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: "#4299e1" }}>🎯 Goal</div>
                <div style={{ color: "#bbb" }}>Use the correct troops and bonuses to minimize losses when attacking a Citadel. I took care of the proper troops selection.</div>
            </div>
            <div>
                <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: "#e53e3e" }}>❗ Most Important Rule</div>
                <div style={{ color: "#bbb", borderLeft: `4px solid #e53e3e`, paddingLeft: 12 }}>
                Maximize <b style={{ color: "#fff" }}>First Striker Health</b>. In a proper attack, the First Striker is the only troop group that should take losses. If you are losing other troops, check your bonuses or troop counts.<br /><br />
                The number of <b style={{ color: "#fff" }}>FIRST STRIKER</b> troops <b style={{ color: "#fff" }}> CAN</b> be higher than calculated. All other troops <b style={{ color: "#fff" }}>MUST</b> be used in the exact number as calculated.
                </div>
            </div>
            <div>
                <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: "#4299e1" }}>🦅 First Striker</div>
                <div style={{ color: "#bbb" }}>Must be the strongest <b style={{ color: "#fff" }}>flying Guardsmen</b>: <b style={{ color: "#fff" }}> Corax</b> or <b style={{ color: "#fff" }}> Griffin</b>.</div>
            </div>
            <div>
                <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: "#4299e1" }}>🦸 Captains</div>
                <div style={{ color: "#bbb" }}>Recommended: <b style={{ color: "#fff" }}> Wu Zetian, Brunhild, Skadi, Beowulf, Aydae, Ramses, Sofia</b>.</div>
            </div>
            <div>
                <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: "#4299e1" }}>✨ Artifacts</div>
                <div style={{ color: "#bbb" }}>Use artifacts that increase Health for <b style={{ color: "#fff" }}> Flying</b>, <b style={{ color: "#fff" }}> Guardsmen</b>, or the <b style={{ color: "#fff" }}> Army</b>. (e.g., <b style={{ color: "#fff" }}>Valkyrie Diadem, Medallion, Belt, Flask</b>).</div>
            </div>
            <div>
                <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: "#4299e1" }}>🔄 Recalculate</div>
                <div style={{ color: "#bbb" }}>After ANY strength bonus change, enter new bonuses and press <b style={{ color: "#fff" }}> Calculate</b> again. Small changes matter!</div>
            </div>
            <div>
                <div style={{ fontWeight: 800, marginBottom: 8, fontSize: 18, color: "#4299e1" }}>❓ How to find bonuses?</div>
                <div style={{ color: "#bbb" }}>Attack a level 10 Citadel with <b style={{ color: "#fff" }}>10 of each selected troop type</b>. Copy the bonuses from the attack report into the calculator.</div>
            </div>
          </div>
        </Modal>

        <Modal open={resultsOpen} title="📋 Calculated Results" onClose={() => setResultsOpen(false)}>
          {calcOutput ? (
            <>
              <div style={{ background: "rgba(0,0,0,0.4)", padding: 16, borderRadius: 12, marginBottom: 20 }}>
                  <Row label="Mode" value={calcOutput.modeLabel} accent />
                  <Row label="Citadel" value={calcOutput.citadelLabel} accent />
              </div>
              <button onClick={async () => {
                  const list = (calcOutput.lines || calcOutput.troops || []).map((t) => `${t.troop} - ${fmtInt(t.required)}`).join("\n");
                  const ok = await copyToClipboard(list);
                  setCopyNotice(ok ? "✅ Copied!" : "❌ Copy failed");
                  window.setTimeout(() => setCopyNotice(""), 1500);
                }}
                style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: "#4a90e2", color: "#ffffff", fontWeight: 700, fontSize: 16, marginBottom: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                <span>📄</span> Copy List to Clipboard
              </button>
              {copyNotice ? <div style={{ textAlign: "center", marginBottom: 16, color: GOLD_COLOR, fontWeight: 700 }}>{copyNotice}</div> : null}
              <div style={{ display: "grid", gap: 8 }}>
              {calcOutput.troops.map((l, i) => (
                <div key={i} style={{ padding: "12px 16px", background: "rgba(30,30,35,0.8)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 4px 6px rgba(0,0,0,0.2)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {iconSrcForTroop(l.troop) ? <img src={iconSrcForTroop(l.troop)} alt={l.troop} width={44} height={44} style={{ borderRadius: 8, flexShrink: 0 }} loading="lazy" /> : null}
                    <span style={{ fontWeight: 700, color: "#fff", fontSize: 16 }}>{l.troop}</span>
                  </div>
                  <span style={{ fontWeight: 800, color: GOLD_COLOR, fontSize: 20 }}>{fmtInt(l.required)}</span>
                </div>
              ))}
              </div>
            </>
          ) : (<div style={{ color: "#aaa", textAlign: "center", padding: 20 }}>No results to display.</div>)}
        </Modal>
      </div>
    </div>
  );
}
