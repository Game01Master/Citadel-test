import React, { useMemo, useState, useEffect } from "react";
import TB from "./tb_data.json";

/* =========================================
   LOGIC & CONSTANTS (NEIZMJENJENO / UNTOUCHED)
   ========================================= */

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

// Display order for Calculate results ONLY
const RESULT_ORDER = [
  "Wyvern",
  "Warregal",
  "Jago",
  "Ariel",
  "Epic Monster Hunter",
  "Fire Phoenix II",
  "Fire Phoenix I",
  "Manticore",
  "Corax II",
  "Royal Lion II",
  "Corax I",
  "Royal Lion I",
  "Griffin VII",
  "Josephine II",
  "Griffin VI",
  "Josephine I",
  "Griffin V",
  "Siege Ballistae VII",
  "Siege Ballistae VI",
  "Punisher I",
  "Duelist I",
  "Catapult V",
  "Vulture VII",
  "Heavy Halberdier VII",
  "Heavy Knight VII",
  "Catapult IV",
  "Vulture VI",
  "Heavy Halberdier VI",
  "Heavy Knight VI",
  "Spearmen V",
  "Swordsmen V",
  "Vulture V"
];

// Troop pools
const TROOPS_WITH_M8_RAW = [
  "Wyvern",
  "Warregal",
  "Jago",
  "Ariel",
  "Epic Monster Hunter",
  "Fire Phoenix II",
  "Fire Phoenix I",
  "Manticore",
  "Corax II",
  "Royal Lion II",
  "Corax I",
  "Royal Lion I",
  "Griffin VII",
  "Josephine II",
  "Griffin VI",
  "Josephine I",
  "Griffin V",
  "Siege Ballistae VII",
  "Siege Ballistae VI",
  "Catapult V",
  "Vulture VII",
  "Catapult IV",
  "Vulture VI",
  "Vulture V",
];

const TROOPS_WITHOUT_M8_RAW = [
  "Wyvern",
  "Warregal",
  "Jago",
  "Ariel",
  "Epic Monster Hunter",
  "Manticore",
  "Corax I",
  "Royal Lion I",
  "Griffin VII",
  "Josephine II",
  "Griffin VI",
  "Josephine I",
  "Griffin V",
  "Siege Ballistae VII",
  "Siege Ballistae VI",
  "Punisher I",
  "Duelist I",
  "Catapult V",
  "Vulture VII",
  "Heavy Halberdier VII",
  "Heavy Knight VII",
  "Catapult IV",
  "Vulture VI",
  "Heavy Halberdier VI",
  "Heavy Knight VI",
  "Spearmen V",
  "Swordsmen V",
  "Vulture V"
];

// Wall killer troops
const WALL_KILLER_NAMES_RAW = [
  "Ariel",
  "Josephine II",
  "Josephine I",
  "Siege Ballistae VII",
  "Siege Ballistae VI",
  "Catapult V",
  "Catapult IV",
];

function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function fmtInt(n) {
  if (!Number.isFinite(n)) return "-";
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
    Math.floor(n)
  );
}
function normName(s) {
  return String(s ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

// Troop icons
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

const ICON_BASE = (import.meta && import.meta.env && import.meta.env.BASE_URL) ? import.meta.env.BASE_URL : "/";

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
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return !!ok;
    } catch {
      return false;
    }
  }
}

/* =========================================
   VISUAL & THEME ENGINE (NOVO / NEW)
   ========================================= */

function usePrefersDark() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setIsDark(!!e.matches);
    if (mq.addEventListener) mq.addEventListener("change", handler);
    else mq.addListener(handler);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", handler);
      else mq.removeListener(handler);
    };
  }, []);

  return isDark;
}

function makeTheme(isDark) {
  return {
    pageBg: isDark ? "#0b0e14" : "#f0f2f5", 
    cardBg: isDark ? "#151b26" : "#ffffff",
    accent: isDark ? "#3b82f6" : "#2563eb", // Primary Blue
    accentGlow: isDark ? "rgba(59, 130, 246, 0.3)" : "rgba(37, 99, 235, 0.2)",
    border: isDark ? "#2a3441" : "#e2e8f0",
    borderSoft: isDark ? "#1e2630" : "#f1f5f9",
    text: isDark ? "#f1f5f9" : "#0f172a",
    subtext: isDark ? "#94a3b8" : "#64748b",
    inputBg: isDark ? "#0f1116" : "#f8fafc",
    inputBorder: isDark ? "#2a3441" : "#cbd5e1",
    inputFocus: isDark ? "#3b82f6" : "#2563eb",
    btnBg: isDark ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    btnText: "#ffffff",
    btnGhostBg: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
    overlay: "rgba(0,0,0,0.75)",
    bottomBarBg: isDark ? "rgba(11, 14, 20, 0.95)" : "rgba(255,255,255,0.95)",
    success: "#10b981",
    danger: "#ef4444",
  };
}

/* =========================================
   COMPONENTS (NOVO / NEW)
   ========================================= */

function Card({ title, children, theme, badge }) {
  return (
    <div
      style={{
        border: `1px solid ${theme.border}`,
        borderRadius: 16,
        padding: 16,
        background: theme.cardBg,
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: theme.text, fontFamily: "'Rajdhani', sans-serif", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {title}
        </div>
        {badge && (
           <span style={{ fontSize: 11, fontWeight: 700, background: theme.accent, color: '#fff', padding: "2px 8px", borderRadius: 10 }}>
             {badge}
           </span>
        )}
      </div>
      {children}
    </div>
  );
}

function TroopPicker({ label, value, options, onChange, theme, inputStyle }) {
  const [open, setOpen] = useState(false);
  const display = value ? value : "—";
  const hasIcon = value && iconSrcForTroop(value);

  return (
    <div style={{ display: "grid", gap: 6 }}>
      <span style={{ color: theme.subtext, fontSize: 13, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>{label}</span>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          ...inputStyle,
          textAlign: "left",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          cursor: "pointer",
          height: 52
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          {hasIcon ? (
              <img src={iconSrcForTroop(value)} alt={value} width={36} height={36} style={{ borderRadius: 8, flexShrink: 0, border: `1px solid ${theme.border}` }} loading="lazy" />
          ) : (
            <div style={{ width: 36, height: 36, borderRadius: 8, background: theme.btnGhostBg, border: `1px solid ${theme.borderSoft}` }} />
          )}
          <span style={{ color: value ? theme.text : theme.subtext, fontWeight: 700, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {display}
          </span>
        </div>
        <span style={{ color: theme.subtext, fontSize: 18 }}>▾</span>
      </button>

      <Modal open={open} title={label} onClose={() => setOpen(false)} theme={theme}>
        <div style={{ display: "grid", gap: 8 }}>
          {options.map((opt) => {
            const isBlank = opt === "";
            const name = isBlank ? "None / Remove" : opt;
            const isSelected = value === opt;
            
            return (
              <button
                key={opt || "__blank__"}
                type="button"
                onClick={() => { onChange(opt); setOpen(false); }}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: isSelected ? `1px solid ${theme.accent}` : `1px solid ${theme.border}`,
                  background: isSelected ? theme.btnGhostBg : theme.cardBg,
                  color: theme.text,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 12
                }}
              >
                {!isBlank && iconSrcForTroop(opt) ? (
                  <img src={iconSrcForTroop(opt)} alt={opt} width={38} height={38} style={{ borderRadius: 8, flexShrink: 0 }} loading="lazy" />
                ) : (
                  <div style={{ width: 38, height: 38, borderRadius: 8, background: theme.btnGhostBg, display: 'flex', alignItems:'center', justifyContent:'center', color: theme.subtext }}>{isBlank ? "✕" : ""}</div>
                )}
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
                {isSelected && <span style={{ marginLeft: "auto", color: theme.accent }}>●</span>}
              </button>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}

function Row({ label, value, theme, highlight }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "8px 0", borderBottom: `1px dashed ${theme.borderSoft}` }}>
      <div style={{ color: theme.subtext, fontSize: 13, fontWeight: 500 }}>{label}</div>
      <div style={{ fontWeight: 700, color: highlight ? theme.accent : theme.text, fontSize: 15, fontFamily: "'Rajdhani', sans-serif" }}>{value}</div>
    </div>
  );
}

function Modal({ open, title, onClose, children, theme }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: theme.overlay,
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: 12,
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 600,
          background: theme.cardBg,
          color: theme.text,
          borderRadius: "20px 20px 0 0",
          border: `1px solid ${theme.border}`,
          display: "flex",
          flexDirection: "column",
          maxHeight: "85vh",
          boxShadow: "0 -10px 40px rgba(0,0,0,0.3)",
          animation: "slideUp 0.3s ease-out"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${theme.borderSoft}` }}>
          <div style={{ fontWeight: 800, fontSize: 18, fontFamily: "'Rajdhani', sans-serif" }}>{title}</div>
          <button onClick={onClose} style={{ border: "none", background: theme.btnGhostBg, color: theme.subtext, borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 18 }}>✕</button>
        </div>
        <div style={{ padding: 20, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
          {children}
        </div>
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </div>
  );
}

/* =========================================
   MAIN APP
   ========================================= */

export default function App() {
  const isDark = usePrefersDark();
  const theme = useMemo(() => makeTheme(isDark), [isDark]);

  const citadelKeys = Object.keys(TB.citadels ?? {});
  const troops = TB.troops ?? [];

  // Canonical mapping
  const canon = useMemo(() => {
    const m = new Map();
    for (const t of troops) m.set(normName(t.name), t.name);
    if (m.has(normName("Royal Lion I")))
      m.set(normName("Royla Lion I"), m.get(normName("Royal Lion I")));
    return m;
  }, [troops]);

  const troopByName = useMemo(
    () => new Map(troops.map((t) => [t.name, t])),
    [troops]
  );

  const additionalBonus = TB.additionalBonusNormal ?? {};
  const phoenixExtra = TB.phoenixExtra ?? {};
  const firstStrikerAllowed = TB.firstStrikerAllowed ?? {};

  const [citadelLevel, setCitadelLevel] = useState(citadelKeys[0] ?? "25");
  const [mode, setMode] = useState(MODE_WITHOUT);

  // selections
  const [strikerTroops, setStrikerTroops] = useState(() => Array(9).fill(""));
  const [strikerBonusPct, setStrikerBonusPct] = useState(() => Array(9).fill(""));
  const [firstHealthBonusPct, setFirstHealthBonusPct] = useState("");

  const [warningMsg, setWarningMsg] = useState("");

  // Group-synced bonuses
  const GROUP_KEYS = useMemo(() => (["CORAX","PHOENIX","PHH_SPEAR","DUEL_HK_SW","VULTURE","ROYAL_LION","GRIFFIN"]), []);
  const [groupBonusPct, setGroupBonusPct] = useState(() => ({
    CORAX: "",
    PHOENIX: "",
    PHH_SPEAR: "",
    DUEL_HK_SW: "",
    VULTURE: "",
    ROYAL_LION: "",
    GRIFFIN: "",
  }));

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
    if (n.startsWith("punisher") || n.startsWith("heavy halberdier") || n.startsWith("spearmen"))
      return "PHH_SPEAR";
    if (n.startsWith("duelist") || n.startsWith("heavy knight") || n.startsWith("swordsmen"))
      return "DUEL_HK_SW";
    return null;
  };

  const getBaseStrength = (troopName) => {
    if (!troopName) return 0;
    const exact = canon.get(normName(troopName)) || troopName;
    const t = troopByName.get(exact);
    const v = t?.baseStrength ?? t?.base_strength ?? t?.strength ?? t?.base ?? 0;
    return Number(v) || 0;
  };

  const getBaseHealth = (troopName) => {
    if (!troopName) return 0;
    const exact = canon.get(normName(troopName)) || troopName;
    const t = troopByName.get(exact);
    const v = t?.baseHealth ?? t?.base_health ?? t?.health ?? t?.hp ?? 0;
    return Number(v) || 0;
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

  const inputStyle = useMemo(
    () => ({
      padding: "0 12px",
      borderRadius: 12,
      border: `1px solid ${theme.inputBorder}`,
      background: theme.inputBg,
      color: theme.text,
      outline: "none",
      width: "100%",
      height: 50,
      fontSize: 16,
      boxSizing: "border-box",
      fontFamily: "'Inter', sans-serif",
      transition: "border-color 0.2s"
    }),
    [theme]
  );

  const poolAll = useMemo(() => {
    const raw = mode === MODE_WITH ? TROOPS_WITH_M8_RAW : TROOPS_WITHOUT_M8_RAW;
    const out = [];
    for (const r of raw) {
      const c = canon.get(normName(r));
      if (c) out.push(c);
    }
    const seen = new Set();
    return out.filter((n) => {
      const k = normName(n);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }, [mode, canon]);

  const wallKillerPool = useMemo(() => {
    const out = [];
    for (const r of WALL_KILLER_NAMES_RAW) {
      const c = canon.get(normName(r));
      if (c) out.push(c);
    }
    const seen = new Set();
    return out.filter((n) => {
      const k = normName(n);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
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
      const c = canon.get(normName(r));
      if (!c) continue;
      if (allowedSet.has(normName(c))) out.push(c);
    }
    const seen = new Set();
    return out.filter((n) => {
      const k = normName(n);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }, [mode, firstStrikerAllowed, nonWallPool, canon]);

  const normalize = (current) => {
    const next = [...current];
    const secFallback = secondAllowed[0] ?? "";
    next[1] = secondAllowed.includes(next[1]) ? next[1] : secFallback;

    if (next[0] && !firstAllowed.map(normName).includes(normName(next[0])))
      next[0] = "";

    for (let i = 2; i < 9; i++) {
      if (next[i] && !nonWallPool.map(normName).includes(normName(next[i])))
        next[i] = "";
    }

    const seen = new Set();
    for (let i = 0; i < 9; i++) {
      const v = next[i];
      if (!v) continue;
      const k = normName(v);
      if (seen.has(k)) next[i] = "";
      else seen.add(k);
    }

    const wallSet = new Set(wallKillerPool.map(normName));
    for (let i = 0; i < 9; i++) {
      if (next[i] && wallSet.has(normName(next[i])))
        next[i] = i === 1 ? next[i] : "";
    }

    return next;
  };

  const [wallKillerTroop, setWallKillerTroop] = useState("");
  const [wallKillerBonusPct, setWallKillerBonusPct] = useState("");

  useEffect(() => {
    if (!wallKillerTroop) setWallKillerTroop(wallKillerPool[0] ?? "");
  }, [wallKillerTroop, wallKillerPool]);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setStrikerTroops((prev) => normalize(["", prev[1], "", "", "", "", "", "", ""]));
    setStrikerBonusPct(() => Array(9).fill(""));
    setFirstHealthBonusPct("");
    setGroupBonusPct({
      CORAX: "", PHOENIX: "", PHH_SPEAR: "", DUEL_HK_SW: "", VULTURE: "", ROYAL_LION: "", GRIFFIN: "",
    });
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
    if (idx !== 1) return ["", ...filtered];
    return filtered;
  };

  const setTroopAt = (idx, name) => {
    setStrikerTroops((prev) => normalize(prev.map((v, i) => (i === idx ? name : v))));
    const g = getBonusGroup(name);
    if (g) {
      setStrikerBonusPct((prev) => {
        const next = [...prev];
        next[idx] = groupBonusPct[g] ?? "";
        return next;
      });
    } else if (!name) {
      setStrikerBonusPct((prev) => {
        const next = [...prev];
        next[idx] = "";
        return next;
      });
    }
    setCalcOutput(null);
    setResultsOpen(false);
  };

  const handleTroopChange = (idx, picked) => {
    if (idx >= 2) {
      const first = strikerTroops[0];
      if (first && picked && isFirstStrikerTroop(picked)) {
        const firstS = getBaseStrength(first);
        const firstH = getBaseHealth(first);
        const pickedS = getBaseStrength(picked);
        const pickedH = getBaseHealth(picked);

        if (pickedS > firstS || pickedH > firstH) {
          const label = STRIKER_LABELS[idx] || "Striker";
          setWarningMsg(
            `${label} (${picked}) has higher BASE strength (${fmtInt(pickedS)}) and BASE health (${fmtInt(pickedH)}) than your First striker (${first}, ${fmtInt(firstS)} / ${fmtInt(firstH)}).\n\nChoose a stronger First striker troops!!`
          );
          setTroopAt(idx, "");
          setStrikerBonusPct((prev) => {
            const next = [...prev];
            next[idx] = "";
            return next;
          });
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
        for (let i = 0; i < strikerTroops.length; i++) {
          if (getBonusGroup(strikerTroops[i]) === g) next[i] = raw;
        }
        return next;
      });
    } else {
      setStrikerBonusPct((prev) => {
        const next = [...prev];
        next[idx] = raw;
        return next;
      });
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
    setGroupBonusPct({ CORAX: "", PHOENIX: "", PHH_SPEAR: "", DUEL_HK_SW: "", VULTURE: "", ROYAL_LION: "", GRIFFIN: "", });
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
      if (troopName && additionalBonus[troopName] !== undefined)
        effBonus += toNum(additionalBonus[troopName]);
      if (troopName && mode === MODE_WITH && idx === 1 && phoenixExtra[troopName] !== undefined) {
        effBonus += toNum(phoenixExtra[troopName]);
      }
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
    const add = (name, n) => {
      if (!name || !Number.isFinite(n)) return;
      const k = normName(name);
      counts.set(k, (counts.get(k) || 0) + Math.floor(n));
    };
    if (wallKillerTroop && wallKiller?.requiredTroops) {
      add(wallKillerTroop, wallKiller.requiredTroops);
    }
    for (const s of perStriker) {
      if (s?.troopName && s?.requiredTroops) {
        add(s.troopName, s.requiredTroops);
      }
    }
    const ordered = [];
    for (const name of RESULT_ORDER) {
      const k = normName(name);
      if (counts.has(k)) {
        ordered.push({ troop: name, required: counts.get(k) });
      }
    }
    setCalcOutput({
      modeLabel: mode === MODE_WITH ? "With M8/M9" : "Without M8/M9",
      citadelLabel: `Elven ${citadelLevel}`,
      troops: ordered,
    });
    setResultsOpen(true);
  };

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: theme.pageBg, color: theme.text, fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Rajdhani:wght@600;700&display=swap');
        html, body, #root { width: 100%; max-width: 100%; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.3); border-radius: 3px; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 600, margin: "0 auto", padding: "20px 16px" }}>
        {/* HEADER */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 24, fontFamily: "'Rajdhani', sans-serif", letterSpacing: "1px", background: `linear-gradient(90deg, ${theme.text}, ${theme.subtext})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            CITADEL CALCULATOR
          </div>
          <button onClick={() => setHelpOpen(true)} style={{ background: 'none', border: `2px solid ${theme.border}`, color: theme.subtext, borderRadius: '50%', width: 36, height: 36, fontWeight: 900, cursor: 'pointer' }}>?</button>
        </header>

        <div style={{ display: "grid", gap: 16, paddingBottom: 130 }}>
          {/* SETUP */}
          <Card title="Configuration" theme={theme}>
            <div style={{ display: "grid", gap: 12 }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ color: theme.subtext, fontSize: 13, fontWeight: 600 }}>Troop Tier Availability</span>
                <select value={mode} onChange={(e) => handleModeChange(e.target.value)} style={inputStyle}>
                  <option value={MODE_WITHOUT}>Standard (No M8/M9)</option>
                  <option value={MODE_WITH}>Advanced (With M8/M9)</option>
                </select>
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ color: theme.subtext, fontSize: 13, fontWeight: 600 }}>Citadel Level</span>
                <select value={citadelLevel} onChange={(e) => { setCitadelLevel(e.target.value); setCalcOutput(null); setResultsOpen(false); }} style={inputStyle}>
                  {citadelKeys.map((lvl) => (<option key={lvl} value={lvl}>Level {lvl}</option>))}
                </select>
              </label>
              <button onClick={resetSelections} style={{ marginTop: 8, width: "100%", padding: "12px", borderRadius: 12, border: "none", background: "rgba(239, 68, 68, 0.1)", color: theme.danger, fontWeight: 700, cursor: "pointer", fontSize: 14 }}>Reset All</button>
            </div>
          </Card>

          {/* WALL KILLER */}
          <Card title="Wall Breaker" theme={theme} badge="Essential">
            <div style={{ display: "grid", gap: 12 }}>
              <TroopPicker label="Select Unit" value={wallKillerTroop} options={wallKillerPool} onChange={(v) => { setWallKillerTroop(v); setCalcOutput(null); setResultsOpen(false); }} theme={theme} inputStyle={inputStyle} />
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ color: theme.subtext, fontSize: 13, fontWeight: 600 }}>Strength Bonus (%)</span>
                <input type="number" step="any" inputMode="decimal" value={wallKillerBonusPct} placeholder="0" onChange={(e) => { setWallKillerBonusPct(e.target.value); setCalcOutput(null); setResultsOpen(false); }} style={inputStyle} />
              </label>
              <div style={{ background: theme.btnGhostBg, borderRadius: 12, padding: "8px 12px", marginTop: 4 }}>
                <Row label="Eff. Bonus" value={`${fmtInt(wallKiller.effBonus)}%`} theme={theme} />
                <Row label="Required" value={fmtInt(wallKiller.requiredTroops)} theme={theme} highlight />
              </div>
            </div>
          </Card>

          {/* STRIKERS */}
          {perStriker.map((s) => {
            const idx = s.idx;
            const isFirst = idx === 0;
            const opts = optionsForIdx(idx);
            return (
              <Card key={idx} title={`${idx + 1}. ${s.label}`} theme={theme} badge={isFirst ? "Tank" : undefined}>
                <div style={{ display: "grid", gap: 12 }}>
                  <TroopPicker label="Select Unit" value={strikerTroops[idx]} options={opts} onChange={(v) => handleTroopChange(idx, v)} theme={theme} inputStyle={inputStyle} />
                  <div style={{ display: 'grid', gridTemplateColumns: isFirst ? '1fr 1fr' : '1fr', gap: 10 }}>
                    {isFirst && (
                      <label style={{ display: "grid", gap: 6 }}>
                        <span style={{ color: theme.subtext, fontSize: 13, fontWeight: 600 }}>HP Bonus %</span>
                        <input type="number" step="any" inputMode="decimal" value={firstHealthBonusPct} placeholder="0" onChange={(e) => { setFirstHealthBonusPct(e.target.value); setCalcOutput(null); setResultsOpen(false); }} style={inputStyle} />
                      </label>
                    )}
                    <label style={{ display: "grid", gap: 6 }}>
                      <span style={{ color: theme.subtext, fontSize: 13, fontWeight: 600 }}>Str Bonus %</span>
                      <input type="number" step="any" inputMode="decimal" value={strikerBonusPct[idx]} placeholder="0" onChange={(e) => setBonusAt(idx, e.target.value)} style={inputStyle} />
                    </label>
                  </div>
                  <div style={{ background: theme.btnGhostBg, borderRadius: 12, padding: "8px 12px", marginTop: 4 }}>
                    <Row label="Eff. Bonus" value={`${fmtInt(s.effBonus)}%`} theme={theme} />
                    <Row label="Required" value={fmtInt(s.requiredTroops)} theme={theme} highlight />
                    {isFirst && (
                      <div style={{ marginTop: 4, paddingTop: 4, borderTop: `1px solid ${theme.borderSoft}` }}>
                        <Row label="Expected Losses" value={fmtInt(firstDeaths)} theme={theme} />
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* FAB */}
        <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, padding: "16px", background: theme.bottomBarBg, backdropFilter: "blur(12px)", borderTop: `1px solid ${theme.border}`, zIndex: 999, display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: "100%", maxWidth: 600 }}>
            <button
              onClick={showResults}
              style={{
                width: "100%", padding: "16px 20px", borderRadius: 16, border: "none", background: theme.btnBg, color: theme.btnText,
                fontWeight: 800, letterSpacing: "1px", fontSize: 16, fontFamily: "'Rajdhani', sans-serif", boxShadow: `0 8px 20px -4px ${theme.accentGlow}`, cursor: "pointer"
              }}
            >
              CALCULATE ATTACK
            </button>
          </div>
        </div>

        {/* Modals */}
        <Modal open={!!warningMsg} title="Tactical Alert" onClose={() => setWarningMsg("")} theme={theme}>
          <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, color: theme.text, background: 'rgba(239,68,68,0.1)', padding: 12, borderRadius: 8, border: `1px solid ${theme.danger}` }}>{warningMsg}</div>
          <button onClick={() => setWarningMsg("")} style={{ width: "100%", marginTop: 16, padding: "14px", borderRadius: 12, border: "none", background: theme.text, color: theme.pageBg, fontWeight: 800, cursor: "pointer" }}>ACKNOWLEDGE</button>
        </Modal>

        <Modal open={helpOpen} title="Command Manual" onClose={() => setHelpOpen(false)} theme={theme}>
          <div style={{ color: theme.text, lineHeight: 1.6, fontSize: 15 }}>
            <div style={{ fontWeight: 800, marginBottom: 8, color: theme.accent, fontFamily: "'Rajdhani', sans-serif", fontSize: 18 }}>Objective</div>
            <div style={{ color: theme.subtext, marginBottom: 16 }}>Minimize losses. Only the <b style={{ color: theme.text }}>First Striker</b> should take damage.</div>
            <div style={{ fontWeight: 800, marginBottom: 8, color: theme.accent, fontFamily: "'Rajdhani', sans-serif", fontSize: 18 }}>Golden Rule</div>
            <div style={{ color: theme.subtext, marginBottom: 16 }}>Maximize <b style={{ color: theme.text }}>Health</b> on your First Striker.</div>
          </div>
        </Modal>

        <Modal open={resultsOpen} title="Battle Plan" onClose={() => setResultsOpen(false)} theme={theme}>
          {calcOutput ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div style={{ background: theme.btnGhostBg, padding: 10, borderRadius: 10, textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: theme.subtext, textTransform: 'uppercase', fontWeight: 700 }}>Configuration</div>
                      <div style={{ fontWeight: 700, marginTop: 4 }}>{calcOutput.modeLabel}</div>
                  </div>
                  <div style={{ background: theme.btnGhostBg, padding: 10, borderRadius: 10, textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: theme.subtext, textTransform: 'uppercase', fontWeight: 700 }}>Target</div>
                      <div style={{ fontWeight: 700, marginTop: 4 }}>{calcOutput.citadelLabel}</div>
                  </div>
              </div>

              <button
                onClick={async () => {
                  const list = (calcOutput.troops || []).map((t) => `${t.troop} - ${fmtInt(t.required)}`).join("\n");
                  const ok = await copyToClipboard(list);
                  setCopyNotice(ok ? "COPIED!" : "ERROR");
                  window.setTimeout(() => setCopyNotice(""), 1200);
                }}
                style={{
                  width: "100%", padding: "14px", borderRadius: 12, border: "none", background: copyNotice ? theme.success : theme.accent, color: "#fff", fontWeight: 800, marginBottom: 16, cursor: "pointer", display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Rajdhani', sans-serif", letterSpacing: "1px"
                }}
              >
                {copyNotice || "COPY TROOP LIST"}
              </button>

              <div style={{ border: `1px solid ${theme.border}`, borderRadius: 12, overflow: 'hidden' }}>
              {calcOutput.troops.map((l, i) => (
                <div key={i} style={{ padding: "12px 16px", borderBottom: i < calcOutput.troops.length - 1 ? `1px solid ${theme.borderSoft}` : 'none', background: i % 2 === 0 ? theme.cardBg : theme.btnGhostBg, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {iconSrcForTroop(l.troop) && <img src={iconSrcForTroop(l.troop)} alt={l.troop} width={40} height={40} style={{ borderRadius: 8 }} loading="lazy" />}
                    <span style={{ fontWeight: 700, color: theme.text, fontSize: 15 }}>{l.troop}</span>
                  </div>
                  <span style={{ fontWeight: 800, color: theme.accent, fontSize: 16, fontFamily: "'Rajdhani', sans-serif" }}>{fmtInt(l.required)}</span>
                </div>
              ))}
              </div>
            </>
          ) : (
            <div style={{ color: theme.subtext }}>No results calculated yet.</div>
          )}
        </Modal>
      </div>
    </div>
  );
}
