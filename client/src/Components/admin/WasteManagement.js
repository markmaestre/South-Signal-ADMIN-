import React, { useState, useEffect } from 'react';
import API_URL from '../Utils/Api';

/* ─────────────────────────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes fadeUp  { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideIn { from { opacity: 0; transform: translateY(24px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
  @keyframes pulse   { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
  @keyframes zoomIn  { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); } }
  @keyframes backdropIn { from { opacity: 0; } to { opacity: 1; } }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  ::-webkit-scrollbar              { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track        { background: transparent; }
  ::-webkit-scrollbar-thumb        { background: #d1d5db; border-radius: 99px; }
  ::-webkit-scrollbar-thumb:hover  { background: #9ca3af; }

  .wm-root { font-family: 'Syne', sans-serif; }
  .wm-root * { font-family: inherit; }

  .wm-table-row:hover { background: #f9fafb; }

  .wm-btn { transition: all 0.15s ease; }
  .wm-btn:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(0.96); }
  .wm-btn:active:not(:disabled) { transform: translateY(0); }

  .wm-stat-card { transition: box-shadow 0.2s ease, transform 0.2s ease; }
  .wm-stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08) !important; }

  .wm-img-thumb {
    cursor: zoom-in;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .wm-img-thumb:hover {
    transform: scale(1.06);
    box-shadow: 0 6px 20px rgba(0,0,0,0.18) !important;
  }

  .wm-modal-img {
    cursor: zoom-in;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .wm-modal-img:hover {
    box-shadow: 0 8px 32px rgba(0,0,0,0.22) !important;
  }

  .wm-lightbox-img {
    animation: zoomIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    max-width: 90vw;
    max-height: 88vh;
    object-fit: contain;
    border-radius: 14px;
    box-shadow: 0 32px 80px rgba(0,0,0,0.55);
    display: block;
  }

  input[type="date"],
  input[type="time"] {
    color-scheme: light;
    appearance: auto;
    -webkit-appearance: auto;
  }
  input[type="date"]::-webkit-calendar-picker-indicator,
  input[type="time"]::-webkit-calendar-picker-indicator {
    cursor: pointer;
    opacity: 0.6;
    filter: invert(0.3);
  }
  input[type="date"]::-webkit-calendar-picker-indicator:hover,
  input[type="time"]::-webkit-calendar-picker-indicator:hover {
    opacity: 1;
  }
`;

/* ─────────────────────────────────────────────────────────────
   ICON SYSTEM — minimal inline SVGs
───────────────────────────────────────────────────────────── */
const Ico = ({ d, size = 16, color = 'currentColor', sw = 1.8, fill = 'none' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0, display: 'block' }}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const IC = {
  chart:    ["M18 20V10","M12 20V4","M6 20v-6"],
  clock:    "M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10zM12 6v6l4 2",
  check:    ["M22 11.08V12a10 10 0 11-5.93-9.14","M22 4L12 14.01l-3-3"],
  recycle:  ["M4 15l3 3 3-3","M7 18V9.5C7 7 9 5 11.5 5H13","M20 9l-3-3-3 3","M17 6v8.5C17 17 15 19 12.5 19H11"],
  calendar: ["M3 4h18v18H3z","M16 2v4M8 2v4M3 10h18"],
  trending: ["M23 6l-9.5 9.5-5-5L1 18","M17 6h6v6"],
  trash:    ["M3 6h18","M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6","M10 11v6","M14 11v6","M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"],
  eye:      ["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z","M12 9a3 3 0 100 6 3 3 0 000-6z"],
  refresh:  ["M23 4v6h-6","M1 20v-6h6","M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"],
  x:        "M18 6L6 18M6 6l12 12",
  filter:   "M22 3H2l8 9.46V19l4 2v-8.54L22 3",
  tag:      ["M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z","M7 7h.01"],
  image:    ["M21 19a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h3l2-3h4l2 3h3a2 2 0 012 2z","M12 13a3 3 0 100-6 3 3 0 000 6z"],
  info:     ["M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10z","M12 8h.01","M11 12h1v4h1"],
  alert:    ["M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z","M12 9v4","M12 17h.01"],
  checkC:   ["M22 11.08V12a10 10 0 11-5.93-9.14","M22 4L12 14.01l-3-3"],
  zap:      "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  bars:     ["M12 20h9","M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"],
  users:    ["M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2","M23 21v-2a4 4 0 00-3-3.87","M16 3.13a4 4 0 010 7.75","M9 7a4 4 0 100 8 4 4 0 000-8z"],
  bulb:     ["M9 18h6","M10 22h4","M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 01-1 1H9a1 1 0 01-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z"],
  box:      ["M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z","M3.27 6.96L12 12.01l8.73-5.05","M12 22.08V12"],
  truck:    ["M1 3h15v13H1z","M16 8h4l3 3v5h-7V8z","M5.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5z","M18.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"],
  arrow:    "M5 12h14M12 5l7 7-7 7",
  pin:      ["M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z","M12 10a1 1 0 100-2 1 1 0 000 2z"],
  note:     ["M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z","M14 2v6h6","M16 13H8","M16 17H8","M10 9H8"],
  camera:   ["M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z","M12 13a3 3 0 100-6 3 3 0 000 6z"],
  star:     "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  dispose:  ["M3 6h18","M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"],
  reject:   ["M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10z","M15 9l-6 6M9 9l6 6"],
  complete: ["M9 11l3 3L22 4","M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"],
  time:     ["M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10z","M12 6v6l4 2"],
  zoomIn:   ["M11 19a8 8 0 100-16 8 8 0 000 16z","M21 21l-4.35-4.35","M11 8v6","M8 11h6"],
  zoomOut:  ["M11 19a8 8 0 100-16 8 8 0 000 16z","M21 21l-4.35-4.35","M8 11h6"],
  expand:   ["M15 3h6v6","M9 21H3v-6","M21 3l-7 7","M3 21l7-7"],
};

/* ─────────────────────────────────────────────────────────────
   TOKENS
───────────────────────────────────────────────────────────── */
const C = {
  bg:         '#f4f4f0',
  surface:    '#ffffff',
  surface2:   '#f8f8f5',
  border:     '#e8e8e2',
  border2:    '#f0f0ec',
  text:       '#1a1a18',
  muted:      '#8a8a80',
  dim:        '#5a5a54',
  green:      '#1a7a52',
  greenBg:    '#e8f5ee',
  greenBorder:'#a8dfc0',
  blue:       '#1a5fa0',
  blueBg:     '#e8f0fb',
  blueBorder: '#a8c4e8',
  violet:     '#5a2ea0',
  violetBg:   '#f0eafa',
  amber:      '#a05a10',
  amberBg:    '#fdf3e0',
  amberBorder:'#e8c880',
  red:        '#a01a1a',
  redBg:      '#faeaea',
  redBorder:  '#e8a8a8',
  slate:      '#5a5a70',
};

/* ─────────────────────────────────────────────────────────────
   STATUS CONFIG
───────────────────────────────────────────────────────────── */
const STATUS = {
  pending:   { color: C.amber,  bg: C.amberBg,  border: C.amberBorder, label: 'Pending',   icon: IC.clock,    dot: '#e0a020' },
  processed: { color: C.violet, bg: C.violetBg, border: '#c8b4e8',     label: 'Processed', icon: IC.check,    dot: '#7c40cc' },
  scheduled: { color: C.blue,   bg: C.blueBg,   border: C.blueBorder,  label: 'Scheduled', icon: IC.truck,    dot: '#2070c8' },
  recycled:  { color: C.green,  bg: C.greenBg,  border: C.greenBorder, label: 'Recycled',  icon: IC.recycle,  dot: '#2a9060' },
  disposed:  { color: C.slate,  bg: '#f0f0f5',  border: '#d0d0dc',     label: 'Disposed',  icon: IC.dispose,  dot: '#7070a0' },
  rejected:  { color: C.red,    bg: C.redBg,    border: C.redBorder,   label: 'Rejected',  icon: IC.reject,   dot: '#cc2020' },
  completed: { color: C.violet, bg: C.violetBg, border: '#c8b4e8',     label: 'Completed', icon: IC.complete, dot: '#7c40cc' },
};

const CLASS_CFG = {
  'Recyclable':                { color: C.green,  bg: C.greenBg,  border: C.greenBorder },
  'Biodegradable':             { color: C.violet, bg: C.violetBg, border: '#c8b4e8' },
  'Residual / Non-Recyclable': { color: C.slate,  bg: '#f0f0f5',  border: '#d0d0dc' },
  'Special Waste':             { color: C.red,    bg: C.redBg,    border: C.redBorder },
  'unknown':                   { color: C.muted,  bg: C.surface2, border: C.border },
};

const WORKFLOW = {
  pending:   { next: ['processed','rejected'],             label: 'Actions' },
  processed: { next: ['scheduled'],                        label: 'Next Step' },
  scheduled: { next: ['completed','recycled','disposed'],  label: 'Mark Pickup Result' },
  rejected:  { next: [], label: '' },
  completed: { next: [], label: '' },
  recycled:  { next: [], label: '' },
  disposed:  { next: [], label: '' },
};

const getS = (s) => STATUS[s] || STATUS.pending;
const getCls = (c) => CLASS_CFG[c] || CLASS_CFG.unknown;

const fmt = (d) => new Date(d).toLocaleDateString('en-US', {
  year: 'numeric', month: 'short', day: 'numeric',
  hour: '2-digit', minute: '2-digit',
});
const fmtConf = (c) => Math.round((c || 0) * 100);

/* ─────────────────────────────────────────────────────────────
   IMAGE LIGHTBOX COMPONENT
───────────────────────────────────────────────────────────── */
const ImageLightbox = ({ src, alt, onClose }) => {
  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    // Prevent body scroll while lightbox is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        animation: 'backdropIn 0.2s ease',
        padding: 20,
        cursor: 'zoom-out',
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 20,
          right: 20,
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.12)',
          border: '1.5px solid rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'background 0.15s',
          zIndex: 100000,
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
      >
        <Ico d={IC.x} size={18} color="#fff" sw={2.5} />
      </button>

      {/* ESC hint */}
      <div style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(255,255,255,0.10)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 99,
        padding: '6px 16px',
        fontSize: 12,
        color: 'rgba(255,255,255,0.55)',
        fontWeight: 600,
        letterSpacing: '0.05em',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        pointerEvents: 'none',
      }}>
        <kbd style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 4, padding: '1px 6px', fontSize: 11 }}>ESC</kbd>
        or click anywhere to close
      </div>

      {/* The zoomed image */}
      <img
        src={src}
        alt={alt || 'Waste Report Image'}
        className="wm-lightbox-img"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '90vw',
          maxHeight: '85vh',
          objectFit: 'contain',
          borderRadius: 14,
          boxShadow: '0 32px 80px rgba(0,0,0,0.55)',
          display: 'block',
          animation: 'zoomIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          cursor: 'default',
          border: '1.5px solid rgba(255,255,255,0.12)',
        }}
      />
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   TINY COMPONENTS
───────────────────────────────────────────────────────────── */
const Pill = ({ status, lg }) => {
  const s = getS(status);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: lg ? '5px 11px' : '3px 8px',
      borderRadius: 6, fontSize: lg ? 12 : 11, fontWeight: 700,
      color: s.color, background: s.bg, border: `1px solid ${s.border}`,
      letterSpacing: '0.02em',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {s.label}
    </span>
  );
};

const ClsPill = ({ cls }) => {
  const cfg = getCls(cls);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '3px 8px',
      borderRadius: 6, fontSize: 11, fontWeight: 700,
      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
    }}>{cls}</span>
  );
};

const ConfBar = ({ value }) => {
  const color = value >= 75 ? C.green : value >= 50 ? C.amber : C.red;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 64, height: 5, background: C.border, borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 99, transition: 'width 0.4s' }} />
      </div>
      <span style={{ fontSize: 11.5, color, fontWeight: 700, minWidth: 28 }}>{value}%</span>
    </div>
  );
};

const StatCard = ({ label, value, color, icon, accent }) => (
  <div className="wm-stat-card" style={{
    background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: 14, padding: '20px 18px', position: 'relative',
    overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    animation: 'fadeUp 0.3s ease',
  }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accent || color, borderRadius: '14px 14px 0 0' }} />
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <div style={{ width: 36, height: 36, borderRadius: 9, background: `${color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Ico d={icon} size={16} color={color} sw={2} />
      </div>
    </div>
    <div style={{ fontSize: 30, fontWeight: 800, color: C.text, lineHeight: 1, marginBottom: 5 }}>{value}</div>
    <div style={{ fontSize: 10.5, color: C.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
  </div>
);

const DRow = ({ label, children }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '8px 0', borderBottom: `1px solid ${C.border2}`, gap: 16,
  }}>
    <span style={{ fontSize: 11.5, color: C.muted, fontWeight: 600, flexShrink: 0 }}>{label}</span>
    <span style={{ fontSize: 12.5, color: C.text, textAlign: 'right', wordBreak: 'break-all', fontWeight: 500 }}>{children}</span>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   WORKFLOW STEPPER
───────────────────────────────────────────────────────────── */
const STEPS = ['pending','processed','scheduled','completed'];

const Stepper = ({ current }) => {
  const idx = STEPS.indexOf(current);
  const isRej = current === 'rejected';
  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted, marginBottom: 14 }}>Workflow Progress</p>
      {isRej ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: C.redBg, border: `1px solid ${C.redBorder}`, borderRadius: 10 }}>
          <Ico d={IC.reject} size={14} color={C.red} sw={2} />
          <span style={{ fontSize: 13, color: C.red, fontWeight: 700 }}>Report has been rejected</span>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {STEPS.map((step, i) => {
            const cfg = getS(step);
            const done = i < idx, active = i === idx;
            return (
              <React.Fragment key={step}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: done ? cfg.color : active ? cfg.bg : C.surface2,
                    border: `2px solid ${done ? cfg.color : active ? cfg.color : C.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: active ? `0 0 0 4px ${cfg.color}22` : 'none',
                    transition: 'all 0.3s',
                  }}>
                    {done
                      ? <Ico d={IC.check} size={13} color="#fff" sw={2.5} />
                      : <Ico d={cfg.icon} size={13} color={active ? cfg.color : C.muted} sw={2} />
                    }
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: active ? 800 : 500,
                    color: active ? cfg.color : done ? C.dim : C.muted,
                    whiteSpace: 'nowrap',
                  }}>{cfg.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: 2, marginBottom: 20, background: i < idx ? C.green : C.border, transition: 'background 0.3s' }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   SCHEDULE PICKUP FORM — native date + time pickers
───────────────────────────────────────────────────────────── */
const todayStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};

const ScheduleForm = ({ onConfirm, onCancel, loading, defaultAddress }) => {
  const [date, setDate]       = useState(todayStr());
  const [time, setTime]       = useState('08:00');
  const [address, setAddress] = useState(defaultAddress || '');
  const [notes, setNotes]     = useState('');

  const fieldStyle = {
    width: '100%', padding: '10px 13px',
    background: '#ffffff', border: `1.5px solid ${C.border}`, borderRadius: 9,
    color: C.text, fontSize: 13.5, outline: 'none',
    fontFamily: "'Syne', sans-serif", transition: 'border-color 0.2s',
  };
  const labelStyle = {
    fontSize: 10.5, color: C.muted, fontWeight: 800, letterSpacing: '0.1em',
    textTransform: 'uppercase', display: 'block', marginBottom: 7,
  };

  const handleConfirm = () => {
    if (!date || !time) return;
    onConfirm({ date, time, address, notes });
  };

  const fmtPreview = () => {
    if (!date || !time) return '';
    const d = new Date(`${date}T${time}`);
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      + ' at '
      + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <div style={{
      background: '#f0f6ff', border: `1.5px solid ${C.blueBorder}`,
      borderRadius: 14, padding: 22, marginTop: 4,
      animation: 'slideIn 0.22s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: C.blueBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Ico d={IC.truck} size={18} color={C.blue} sw={2} />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>Schedule Waste Pickup</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 1 }}>Choose a date and time for collection</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div>
          <label style={labelStyle}>Pickup Date *</label>
          <div style={{ position: 'relative' }}>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().slice(0, 10)}
              onChange={e => setDate(e.target.value)}
              style={{ ...fieldStyle, paddingLeft: 38, cursor: 'pointer' }}
              onFocus={e => e.target.style.borderColor = C.blue}
              onBlur={e => e.target.style.borderColor = C.border}
            />
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <Ico d={IC.calendar} size={14} color={C.muted} sw={2} />
            </span>
          </div>
        </div>

        <div>
          <label style={labelStyle}>Pickup Time *</label>
          <div style={{ position: 'relative' }}>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              style={{ ...fieldStyle, paddingLeft: 38, cursor: 'pointer' }}
              onFocus={e => e.target.style.borderColor = C.blue}
              onBlur={e => e.target.style.borderColor = C.border}
            />
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <Ico d={IC.time} size={14} color={C.muted} sw={2} />
            </span>
          </div>
        </div>
      </div>

      {date && time && (
        <div style={{
          marginBottom: 14, padding: '9px 13px',
          background: C.blueBg, border: `1px solid ${C.blueBorder}`, borderRadius: 8,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Ico d={IC.checkC} size={13} color={C.blue} sw={2} />
          <span style={{ fontSize: 12, color: C.blue, fontWeight: 600 }}>{fmtPreview()}</span>
        </div>
      )}

      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Pickup Address</label>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Enter pickup address…"
            style={{ ...fieldStyle, paddingLeft: 38 }}
            onFocus={e => e.target.style.borderColor = C.blue}
            onBlur={e => e.target.style.borderColor = C.border}
          />
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <Ico d={IC.pin} size={14} color={C.muted} sw={2} />
          </span>
        </div>
        {defaultAddress && address === defaultAddress && (
          <p style={{ marginTop: 5, fontSize: 11, color: C.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Ico d={IC.info} size={10} color={C.muted} sw={2} /> Pre-filled from report address
          </p>
        )}
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Notes <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 10.5 }}>(optional)</span></label>
        <textarea
          rows={2}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="e.g. Gate code, landmark, special instructions…"
          style={{ ...fieldStyle, resize: 'vertical' }}
          onFocus={e => e.target.style.borderColor = C.blue}
          onBlur={e => e.target.style.borderColor = C.border}
        />
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button className="wm-btn" onClick={handleConfirm} disabled={loading || !date || !time}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '11px 22px', borderRadius: 10, border: 'none',
            cursor: loading || !date || !time ? 'not-allowed' : 'pointer',
            background: !date || !time ? '#b0c8e8' : C.blue,
            color: '#fff', fontSize: 13.5, fontWeight: 700,
            boxShadow: '0 2px 10px rgba(26,95,160,0.3)',
          }}>
          <Ico d={IC.check} size={14} color="#fff" sw={2.5} />
          {loading ? 'Scheduling…' : 'Confirm Schedule'}
        </button>
        <button onClick={onCancel} style={{
          padding: '11px 18px', borderRadius: 10,
          border: `1.5px solid ${C.border}`, background: C.surface,
          color: C.dim, fontSize: 13.5, cursor: 'pointer', fontWeight: 600,
        }}>Cancel</button>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
const WasteManagement = () => {
  const [reports, setReports]        = useState([]);
  const [loading, setLoading]        = useState(true);
  const [selected, setSelected]      = useState(null);
  const [showModal, setShowModal]    = useState(false);
  const [statusFilter, setFilter]    = useState('all');
  const [stats, setStats]            = useState({ total:0, pending:0, processed:0, recycled:0, disposed:0, rejected:0, todaysReports:0, thisWeeksReports:0 });
  const [compStats, setCompStats]    = useState(null);
  const [showStats, setShowStats]    = useState(false);
  const [error, setError]            = useState(null);
  const [adminNotes, setAdminNotes]  = useState('');
  const [showSchedule, setShowSched] = useState(false);
  const [proofImg, setProofImg]      = useState(null);
  const [proofPrev, setProofPrev]    = useState('');
  const [saving, setSaving]          = useState(false);

  // ── LIGHTBOX STATE ──
  const [lightboxSrc, setLightboxSrc] = useState(null);

  const openLightbox = (src, e) => {
    if (e) e.stopPropagation();
    setLightboxSrc(src);
  };
  const closeLightbox = () => setLightboxSrc(null);

  useEffect(() => { fetchReports(); fetchOverview(); }, [statusFilter]);

  const authFetch = async (url, opts = {}) => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found.');
    const cfg = {
      method: opts.method || 'GET',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...opts.headers },
    };
    if (opts.body) cfg.body = JSON.stringify(opts.body);
    const res = await fetch(`${API_URL}${url}`, cfg);
    if (res.status === 401) throw new Error('Session expired.');
    if (res.status === 403) throw new Error('Access denied.');
    const ct = res.headers.get('content-type');
    if (!ct?.includes('application/json')) throw new Error('Unexpected server response.');
    if (!res.ok) { const e = await res.json(); throw new Error(e.error || e.message || `HTTP ${res.status}`); }
    return res.json();
  };

  const fetchReports = async () => {
    try {
      setLoading(true); setError(null);
      const p = new URLSearchParams();
      if (statusFilter !== 'all') p.append('status', statusFilter);
      p.append('limit', '50'); p.append('page', '1');
      const data = await authFetch(`/api/waste-reports?${p}`);
      if (data.success) setReports(data.reports || []);
      else throw new Error(data.error || 'Unknown error');
    } catch (e) {
      setError({ type: 'error', message: e.message.includes('Failed to fetch') ? 'Cannot connect to server.' : e.message });
      setReports([]);
    } finally { setLoading(false); }
  };

  const fetchOverview = async () => {
    try {
      const data = await authFetch('/api/waste-reports/stats/overview');
      if (data.success) setStats(data.stats);
    } catch {}
  };

  const fetchCompStats = async () => {
    try {
      setLoading(true);
      const data = await authFetch('/api/waste-reports/stats/comprehensive');
      if (data.success) { setCompStats(data.stats); setShowStats(true); }
    } catch { setError({ type: 'error', message: 'Failed to load statistics.' }); }
    finally { setLoading(false); }
  };

  const openReport = (r) => {
    setSelected(r); setAdminNotes(r.adminNotes || '');
    setShowModal(true); setShowSched(false);
    setProofImg(null); setProofPrev('');
  };

  const toB64 = (f) => new Promise((res, rej) => {
    const r = new FileReader(); r.readAsDataURL(f);
    r.onload = () => res(r.result); r.onerror = () => rej(new Error('File read error'));
  });

  const handleSchedulePickup = async ({ date, time, address, notes }) => {
    if (!date || !time) { setError({ type: 'error', message: 'Date and time are required.' }); return; }
    try {
      setSaving(true);
      const res = await authFetch(`/api/waste-reports/${selected._id}/schedule-pickup`, {
        method: 'POST',
        body: { scheduledDate: date, scheduledTime: time, pickupAddress: address, notes },
      });
      if (res.success) {
        setError({ type: 'success', message: 'Pickup scheduled! Status updated to Scheduled.' });
        await fetchReports(); await fetchOverview();
        setShowSched(false);
        const upd = await authFetch(`/api/waste-reports/${selected._id}`);
        if (upd.success) setSelected(upd.report);
        setTimeout(() => setError(null), 3500);
      } else throw new Error(res.error);
    } catch (e) { setError({ type: 'error', message: e.message }); }
    finally { setSaving(false); }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      setSaving(true); setError(null);
      const body = { status: newStatus, adminNotes };
      if (proofImg) body.proofImage = await toB64(proofImg);
      const res = await authFetch(`/api/waste-reports/${id}/status`, { method: 'PUT', body });
      if (res.success) {
        if (newStatus === 'processed') {
          await fetchReports(); await fetchOverview();
          const upd = await authFetch(`/api/waste-reports/${id}`);
          if (upd.success) setSelected(upd.report);
          setShowSched(true);
          setError({ type: 'success', message: 'Marked as Processed. Now schedule a pickup.' });
        } else {
          await fetchReports(); await fetchOverview();
          setShowModal(false); setAdminNotes(''); setProofImg(null); setProofPrev('');
          setError({ type: 'success', message: `Status updated to ${getS(newStatus).label}.` });
        }
        setTimeout(() => setError(null), 3500);
      } else throw new Error(res.error || 'Update failed');
    } catch (e) { setError({ type: 'error', message: e.message }); }
    finally { setSaving(false); }
  };

  const deleteReport = async (id) => {
    if (!window.confirm('Delete this report permanently?')) return;
    try {
      setSaving(true); setError(null);
      const res = await authFetch(`/api/waste-reports/${id}`, { method: 'DELETE' });
      if (res.success) {
        await fetchReports(); await fetchOverview();
        setError({ type: 'success', message: 'Report deleted.' });
        setTimeout(() => setError(null), 3000);
      } else throw new Error(res.error);
    } catch (e) { setError({ type: 'error', message: e.message }); }
    finally { setSaving(false); }
  };

  const STAT_CARDS = [
    { label: 'Total Reports', value: stats.total,            color: C.violet, icon: IC.chart,   accent: '#8b5cf6' },
    { label: 'Pending',       value: stats.pending,          color: C.amber,  icon: IC.clock,   accent: '#f59e0b' },
    { label: 'Processed',     value: stats.processed,        color: C.blue,   icon: IC.check,   accent: '#3b82f6' },
    { label: 'Recycled',      value: stats.recycled,         color: C.green,  icon: IC.recycle, accent: '#10b981' },
    { label: 'Today',         value: stats.todaysReports,    color: '#0891b2',icon: IC.calendar,accent: '#06b6d4' },
    { label: 'This Week',     value: stats.thisWeeksReports, color: '#db2777',icon: IC.trending,accent: '#ec4899' },
  ];

  const nextActions = selected ? (WORKFLOW[selected.status]?.next || []) : [];

  const inputSx = {
    padding: '9px 13px', background: C.surface, border: `1.5px solid ${C.border}`,
    borderRadius: 9, color: C.text, fontSize: 13.5, outline: 'none',
    fontFamily: "'Syne', sans-serif", fontWeight: 500,
  };

  return (
    <div className="wm-root" style={{ color: C.text, minHeight: '100%', background: C.bg }}>
      <style>{GLOBAL_CSS}</style>

      {/* ── LIGHTBOX OVERLAY ── */}
      {lightboxSrc && (
        <ImageLightbox src={lightboxSrc} onClose={closeLightbox} />
      )}

      {/* Toast */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', borderRadius: 12, marginBottom: 20,
          background: error.type === 'success' ? C.greenBg : C.redBg,
          border: `1.5px solid ${error.type === 'success' ? C.greenBorder : C.redBorder}`,
          color: error.type === 'success' ? C.green : C.red,
          animation: 'fadeUp 0.2s ease', boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
          fontSize: 13.5,
        }}>
          <Ico d={error.type === 'success' ? IC.checkC : IC.alert} size={15}
            color={error.type === 'success' ? C.green : C.red} sw={2} />
          <span style={{ flex: 1, fontWeight: 600 }}>{error.message}</span>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', opacity: 0.6, padding: 0 }}>
            <Ico d={IC.x} size={13} color={error.type === 'success' ? C.green : C.red} sw={2.5} />
          </button>
        </div>
      )}

      {/* Stat Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 24 }}>
        {STAT_CARDS.map((c, i) => <StatCard key={i} {...c} />)}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Ico d={IC.filter} size={13} color={C.muted} sw={2} />
          <span style={{ fontSize: 10.5, color: C.muted, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Filter:</span>
          <select value={statusFilter} onChange={e => setFilter(e.target.value)} style={{
            ...inputSx, cursor: 'pointer', paddingRight: 32,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238a8a80' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
            appearance: 'none', WebkitAppearance: 'none',
          }}>
            <option value="all">All Reports</option>
            {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { label: 'Stats Overview', color: C.green,  border: C.greenBorder,  bg: C.greenBg,  icon: IC.bars,    action: fetchCompStats },
            { label: 'Refresh',        color: C.blue,   border: C.blueBorder,   bg: C.blueBg,   icon: IC.refresh, action: fetchReports  },
          ].map(b => (
            <button key={b.label} onClick={b.action} disabled={loading} className="wm-btn" style={{
              display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px',
              borderRadius: 9, border: `1.5px solid ${b.border}`, background: b.bg,
              color: b.color, fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}>
              <Ico d={b.icon} size={13} color={b.color} sw={2} />
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Card */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', borderBottom: `1px solid ${C.border}` }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Waste Reports</h3>
            <p style={{ fontSize: 12, color: C.muted, marginTop: 2 }}></p>
          </div>
          <span style={{ fontSize: 12, color: C.muted, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: '5px 12px', fontWeight: 700 }}>
            {reports.length} {reports.length !== 1 ? 'records' : 'record'}
          </span>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 32px', gap: 14 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', border: `3px solid ${C.border}`, borderTop: `3px solid ${C.green}`, animation: 'spin 0.8s linear infinite' }} />
            <span style={{ fontSize: 13, color: C.muted }}>Loading reports…</span>
          </div>
        ) : reports.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '72px 32px', gap: 10 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: C.surface2, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
              <Ico d={IC.box} size={24} color={C.muted} sw={1.5} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 800, color: C.text }}>No reports found</p>
            <p style={{ fontSize: 13, color: C.muted, textAlign: 'center' }}>
              {statusFilter !== 'all' ? `No ${STATUS[statusFilter]?.label || statusFilter} reports.` : 'No waste reports yet.'}
            </p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: C.surface2 }}>
                {['User','Image','Classification','Confidence','Status','Date Reported','Actions'].map(h => (
                  <th key={h} style={{
                    padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 800,
                    letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted,
                    borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reports.map(r => {
                const name    = r.user?.name || '';
                const email   = r.userEmail || r.user?.email || '—';
                const initials= name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                const conf    = fmtConf(r.classificationConfidence);
                return (
                  <tr key={r._id} className="wm-table-row" style={{ transition: 'background 0.1s' }}>
                    {/* User */}
                    <td style={{ padding: '13px 16px', borderBottom: `1px solid ${C.border2}`, verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 10, flexShrink: 0, overflow: 'hidden',
                          background: 'linear-gradient(135deg, #1a7a52, #1a5fa0)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11.5, fontWeight: 800, color: '#fff',
                        }}>
                          {r.user?.profile
                            ? <img src={r.user.profile} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : initials}
                        </div>
                        <div>
                          <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text }}>{name}</div>
                          <div style={{ fontSize: 11.5, color: C.muted, marginTop: 1 }}>{email}</div>
                        </div>
                      </div>
                    </td>

                    {/* ── Image cell — click thumbnail to zoom ── */}
                    <td style={{ padding: '13px 16px', borderBottom: `1px solid ${C.border2}`, verticalAlign: 'middle' }}>
                      {r.image ? (
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <div
                            className="wm-img-thumb"
                            onClick={(e) => openLightbox(r.image, e)}
                            style={{
                              width: 52, height: 52, borderRadius: 10, overflow: 'hidden',
                              border: `1.5px solid ${C.border}`,
                              position: 'relative',
                            }}
                          >
                            <img src={r.image} alt="Waste" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            {/* Zoom icon overlay */}
                            <div style={{
                              position: 'absolute', inset: 0,
                              background: 'rgba(0,0,0,0)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'background 0.2s',
                              borderRadius: 9,
                            }}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.35)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}
                            >
                              <Ico d={IC.expand} size={16} color="#fff" sw={2.5} />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: C.muted }}>
                          <Ico d={IC.image} size={13} color={C.muted} sw={1.5} />
                          <span style={{ fontSize: 11.5 }}>None</span>
                        </div>
                      )}
                    </td>

                    {/* Classification */}
                    <td style={{ padding: '13px 16px', borderBottom: `1px solid ${C.border2}`, verticalAlign: 'middle' }}>
                      <ClsPill cls={r.classification} />
                    </td>
                    {/* Confidence */}
                    <td style={{ padding: '13px 16px', borderBottom: `1px solid ${C.border2}`, verticalAlign: 'middle' }}>
                      <ConfBar value={conf} />
                    </td>
                    {/* Status */}
                    <td style={{ padding: '13px 16px', borderBottom: `1px solid ${C.border2}`, verticalAlign: 'middle' }}>
                      <Pill status={r.status} />
                      {r.scheduledPickup?.scheduledDate && r.status === 'scheduled' && (
                        <div style={{ fontSize: 10.5, color: C.blue, marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Ico d={IC.truck} size={10} color={C.blue} sw={2} />
                          {new Date(r.scheduledPickup.scheduledDate).toLocaleDateString()} {r.scheduledPickup.scheduledTime}
                        </div>
                      )}
                    </td>
                    {/* Date */}
                    <td style={{ padding: '13px 16px', borderBottom: `1px solid ${C.border2}`, verticalAlign: 'middle', fontSize: 12.5, color: C.dim, whiteSpace: 'nowrap' }}>
                      {fmt(r.scanDate)}
                    </td>
                    {/* Actions */}
                    <td style={{ padding: '13px 16px', borderBottom: `1px solid ${C.border2}`, verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => openReport(r)} className="wm-btn" style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px',
                          borderRadius: 8, border: `1.5px solid ${C.blueBorder}`, background: C.blueBg,
                          color: C.blue, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        }}>
                          <Ico d={IC.eye} size={12} color={C.blue} sw={2} /> View
                        </button>
                        <button onClick={() => deleteReport(r._id)} className="wm-btn" style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px',
                          borderRadius: 8, border: `1.5px solid ${C.redBorder}`, background: C.redBg,
                          color: C.red, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        }}>
                          <Ico d={IC.trash} size={12} color={C.red} sw={2} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── REPORT DETAIL MODAL ── */}
      {showModal && selected && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(10,10,10,0.45)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20,
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20,
            width: 960, maxWidth: '100%', maxHeight: '92vh', overflowY: 'auto',
            display: 'flex', flexDirection: 'column', animation: 'slideIn 0.25s ease',
            boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          }} onClick={e => e.stopPropagation()}>

            <div style={{ height: 4, background: `linear-gradient(90deg, ${C.green}, ${C.blue}, ${C.violet})`, borderRadius: '20px 20px 0 0', flexShrink: 0 }} />

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 26px 18px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: C.text }}>Waste Report Details</h3>
                <p style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
                  ID: <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: C.dim }}>{selected._id}</span>
                  {' · '}Barangay Central Bicutan, Taguig
                </p>
              </div>
              <button onClick={() => setShowModal(false)} style={{
                width: 34, height: 34, borderRadius: 9, border: `1.5px solid ${C.border}`,
                background: C.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', flexShrink: 0,
              }}>
                <Ico d={IC.x} size={14} color={C.muted} sw={2.5} />
              </button>
            </div>

            <div style={{ padding: 26, overflowY: 'auto' }}>
              <Stepper current={selected.status} />

              {/* ── Main image in modal — click to zoom ── */}
              {selected.image && (
                <div style={{ marginBottom: 20, position: 'relative', cursor: 'zoom-in' }} onClick={(e) => openLightbox(selected.image, e)}>
                  <img
                    src={selected.image}
                    alt="Waste"
                    className="wm-modal-img"
                    style={{ width: '100%', borderRadius: 14, border: `1px solid ${C.border}`, objectFit: 'cover', maxHeight: 280, display: 'block' }}
                  />
                  {/* Zoom badge overlay */}
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: 14,
                    background: 'rgba(0,0,0,0)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.2s',
                  }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(0,0,0,0.28)';
                      e.currentTarget.querySelector('.zoom-badge').style.opacity = '1';
                      e.currentTarget.querySelector('.zoom-badge').style.transform = 'translate(-50%,-50%) scale(1)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(0,0,0,0)';
                      e.currentTarget.querySelector('.zoom-badge').style.opacity = '0';
                      e.currentTarget.querySelector('.zoom-badge').style.transform = 'translate(-50%,-50%) scale(0.85)';
                    }}
                  >
                    <div className="zoom-badge" style={{
                      position: 'absolute', top: '50%', left: '50%',
                      transform: 'translate(-50%,-50%) scale(0.85)',
                      opacity: 0, transition: 'all 0.2s ease',
                      background: 'rgba(255,255,255,0.95)',
                      borderRadius: 99, padding: '8px 16px',
                      display: 'flex', alignItems: 'center', gap: 7,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                      fontSize: 13, fontWeight: 700, color: C.text,
                      pointerEvents: 'none',
                    }}>
                      <Ico d={IC.expand} size={14} color={C.text} sw={2} />
                      Click to zoom
                    </div>
                  </div>
                </div>
              )}

              {/* Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 13, padding: 18 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Ico d={IC.info} size={11} color={C.muted} sw={2} /> Report Information
                  </div>
                  <DRow label="User">{selected.user?.name || 'Unknown'} ({selected.userEmail || selected.user?.email || '—'})</DRow>
                  <DRow label="Classification"><ClsPill cls={selected.classification} /></DRow>
                  <DRow label="Confidence">{fmtConf(selected.classificationConfidence)}%</DRow>
                  <DRow label="Scan Date">{fmt(selected.scanDate)}</DRow>
                  <DRow label="Status"><Pill status={selected.status} lg /></DRow>
                </div>
                <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 13, padding: 18 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Ico d={IC.zap} size={11} color={C.muted} sw={2} /> Detected Objects
                  </div>
                  {selected.detectedObjects?.length > 0
                    ? selected.detectedObjects.map((obj, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: `1px solid ${C.border}` }}>
                        <span style={{ flex: 1, fontSize: 12.5, color: C.text, fontWeight: 600 }}>{obj.label}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: C.green, background: C.greenBg, borderRadius: 5, padding: '2px 8px', border: `1px solid ${C.greenBorder}` }}>{fmtConf(obj.confidence)}%</span>
                        {obj.material && <span style={{ fontSize: 11.5, color: C.muted }}>({obj.material})</span>}
                      </div>
                    ))
                    : <p style={{ fontSize: 12.5, color: C.muted }}>No objects detected</p>
                  }
                  {selected.recyclingTips?.length > 0 && (
                    <>
                      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, marginTop: 14, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Ico d={IC.bulb} size={11} color={C.muted} sw={2} /> Recycling Tips
                      </div>
                      {selected.recyclingTips.map((tip, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, padding: '5px 0', borderBottom: `1px solid ${C.border2}` }}>
                          <Ico d={IC.checkC} size={12} color={C.green} sw={2} />
                          <span style={{ fontSize: 12.5, color: C.dim }}>{tip}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Scheduled Pickup Info */}
              {selected.scheduledPickup?.scheduledDate && (
                <div style={{ background: C.blueBg, border: `1.5px solid ${C.blueBorder}`, borderRadius: 13, padding: 18, marginBottom: 20 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.blue, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Ico d={IC.truck} size={11} color={C.blue} sw={2} /> Scheduled Pickup
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <DRow label="Date">{new Date(selected.scheduledPickup.scheduledDate).toLocaleDateString('en-US', { weekday:'short', year:'numeric', month:'long', day:'numeric' })}</DRow>
                    <DRow label="Time">{selected.scheduledPickup.scheduledTime}</DRow>
                    {selected.scheduledPickup.pickupAddress && <DRow label="Address">{selected.scheduledPickup.pickupAddress}</DRow>}
                    {selected.scheduledPickup.notes && <DRow label="Notes">{selected.scheduledPickup.notes}</DRow>}
                    <DRow label="Confirmation">{selected.scheduledPickup.confirmed ? '✓ Confirmed' : 'Pending'}</DRow>
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Ico d={IC.note} size={11} color={C.muted} sw={2} /> Admin Notes
                </div>
                <textarea rows={3} value={adminNotes} onChange={e => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this report…"
                  style={{
                    width: '100%', padding: '11px 14px', background: C.surface2,
                    border: `1.5px solid ${C.border}`, borderRadius: 10,
                    color: C.text, fontSize: 13.5, outline: 'none', resize: 'vertical',
                    fontFamily: "'Syne', sans-serif",
                  }} />
              </div>

              {/* Proof Upload */}
              {['scheduled','completed','recycled','disposed'].includes(selected.status) && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Ico d={IC.camera} size={11} color={C.muted} sw={2} />
                    Proof of Pickup <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 10 }}>(optional)</span>
                  </div>
                  <label style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px',
                    borderRadius: 9, border: `1.5px dashed ${C.border}`, background: C.surface2,
                    color: C.dim, fontSize: 13, cursor: 'pointer', fontWeight: 600,
                  }}>
                    <Ico d={IC.camera} size={13} color={C.muted} sw={2} />
                    {proofImg ? proofImg.name : 'Upload pickup photo…'}
                    <input type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={e => {
                        const f = e.target.files[0]; if (!f) return;
                        setProofImg(f);
                        const rd = new FileReader(); rd.onloadend = () => setProofPrev(rd.result); rd.readAsDataURL(f);
                      }} />
                  </label>
                  {proofPrev && (
                    <div style={{ marginTop: 10, position: 'relative', display: 'inline-block' }}>
                      {/* Proof preview — also clickable to zoom */}
                      <img
                        src={proofPrev}
                        alt="Preview"
                        className="wm-img-thumb"
                        onClick={(e) => openLightbox(proofPrev, e)}
                        style={{ width: 160, height: 120, objectFit: 'cover', borderRadius: 10, border: `1px solid ${C.border}`, display: 'block' }}
                      />
                      <button onClick={() => { setProofImg(null); setProofPrev(''); }} style={{
                        position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: '50%',
                        background: 'rgba(0,0,0,0.55)', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Ico d={IC.x} size={10} color="#fff" sw={3} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Action Panel */}
              {nextActions.length > 0 && (
                <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px', marginBottom: 20 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Ico d={IC.arrow} size={11} color={C.muted} sw={2} />
                    {WORKFLOW[selected.status]?.label || 'Update Status'}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {nextActions.map(s => {
                      const cfg = getS(s);
                      const isPrimary = s === 'processed' || s === 'completed' || s === 'scheduled';
                      return (
                        <button key={s} disabled={saving} className="wm-btn"
                          onClick={() => s === 'scheduled' ? setShowSched(true) : updateStatus(selected._id, s)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            padding: '10px 18px', borderRadius: 10, cursor: saving ? 'not-allowed' : 'pointer',
                            border: `1.5px solid ${cfg.border}`,
                            background: isPrimary ? cfg.bg : `${cfg.bg}88`,
                            color: cfg.color, fontSize: 13.5, fontWeight: 700,
                            boxShadow: isPrimary ? `0 2px 8px ${cfg.dot}30` : 'none',
                          }}>
                          <Ico d={cfg.icon} size={14} color={cfg.color} sw={2} />
                          {s === 'processed' ? 'Mark as Processed' :
                           s === 'scheduled' ? 'Schedule Pickup' :
                           s === 'completed' ? 'Mark as Completed' :
                           s === 'rejected'  ? 'Reject Report' :
                           s === 'recycled'  ? 'Mark as Recycled' :
                           s === 'disposed'  ? 'Mark as Disposed' : cfg.label}
                          {isPrimary && <Ico d={IC.arrow} size={12} color={cfg.color} sw={2} />}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ marginTop: 12, padding: '9px 13px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, color: C.muted }}>
                    {selected.status === 'pending'   && '→ Mark as Processed when waste has been verified and is ready for collection scheduling.'}
                    {selected.status === 'processed' && '→ Schedule a pickup date and time for waste collection.'}
                    {selected.status === 'scheduled' && '→ Once pickup is complete, mark the final result.'}
                  </div>
                </div>
              )}

              {/* End state */}
              {nextActions.length === 0 && selected.status !== 'pending' && (
                <div style={{
                  padding: '14px 18px', borderRadius: 12,
                  background: getS(selected.status).bg,
                  border: `1.5px solid ${getS(selected.status).border}`,
                  display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
                }}>
                  <Ico d={getS(selected.status).icon} size={16} color={getS(selected.status).color} sw={2} />
                  <span style={{ fontSize: 13.5, color: getS(selected.status).color, fontWeight: 700 }}>
                    This report has reached its final state: {getS(selected.status).label}
                  </span>
                </div>
              )}

              {/* Schedule Form */}
              {showSchedule && (
                <ScheduleForm
                  onConfirm={handleSchedulePickup}
                  onCancel={() => setShowSched(false)}
                  loading={saving}
                  defaultAddress={selected.location?.address || selected.address || selected.user?.address || ''}
                />
              )}

              {/* Status History */}
              {selected.statusHistory?.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Ico d={IC.clock} size={11} color={C.muted} sw={2} /> Status History
                  </div>
                  <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                    {selected.statusHistory.map((h, i) => (
                      <div key={i} style={{ padding: '13px 18px', borderBottom: i < selected.statusHistory.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <Pill status={h.status} />
                          <span style={{ fontSize: 11.5, color: C.muted }}>{new Date(h.changedAt).toLocaleString()}</span>
                        </div>
                        <div style={{ fontSize: 11.5, color: C.dim, marginTop: 4 }}>
                          By: {h.changedByName || h.changedBy?.name || 'Admin'} · {h.changedByRole || 'admin'}
                        </div>
                        {h.notes && <div style={{ fontSize: 11.5, color: C.text, marginTop: 4, fontWeight: 500 }}>Note: {h.notes}</div>}
                        {/* Proof image in history — also zoomable */}
                        {h.proofImageUrl && (
                          <img
                            src={h.proofImageUrl}
                            alt="Proof"
                            className="wm-img-thumb"
                            onClick={(e) => openLightbox(h.proofImageUrl, e)}
                            style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, marginTop: 8, border: `1px solid ${C.border}`, display: 'block' }}
                          />
                        )}
                        {h.scheduledPickupDate && (
                          <div style={{ fontSize: 11.5, color: C.blue, marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Ico d={IC.truck} size={10} color={C.blue} sw={2} />
                            Pickup: {new Date(h.scheduledPickupDate).toLocaleDateString()} at {h.scheduledPickupTime}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Proof Images grid — also zoomable */}
              {selected.adminProofImages?.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Ico d={IC.image} size={11} color={C.muted} sw={2} /> Proof Images
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                    {selected.adminProofImages.map((img, i) => (
                      <div key={i}>
                        <img
                          src={img.url}
                          alt={img.description}
                          className="wm-img-thumb"
                          onClick={(e) => openLightbox(img.url, e)}
                          style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 10, border: `1px solid ${C.border}`, display: 'block' }}
                        />
                        <div style={{ fontSize: 10.5, color: C.muted, marginTop: 5 }}>
                          {img.description} · {new Date(img.uploadedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── COMPREHENSIVE STATS MODAL ── */}
      {showStats && compStats && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,10,0.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20 }}
          onClick={() => setShowStats(false)}>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, width: 900, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', animation: 'slideIn 0.25s ease', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ height: 4, background: `linear-gradient(90deg, ${C.green}, ${C.blue})`, borderRadius: '20px 20px 0 0' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 26px 18px', borderBottom: `1px solid ${C.border}` }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: C.text }}>Comprehensive Statistics — Central Bicutan</h3>
              <button onClick={() => setShowStats(false)} style={{ width: 34, height: 34, borderRadius: 9, border: `1.5px solid ${C.border}`, background: C.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Ico d={IC.x} size={14} color={C.muted} sw={2.5} />
              </button>
            </div>
            <div style={{ padding: 26 }}>

              <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Ico d={IC.star} size={11} color={C.muted} sw={2} /> Quick Summary
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 26 }}>
                {[
                  ['Most Common', compStats.summary?.mostCommonClassification],
                  ['Top Material', compStats.summary?.topMaterial],
                  ['Most Active User', compStats.summary?.mostActiveUser],
                  ['Avg / User', compStats.summary?.avgReportsPerUser?.toFixed(1)],
                ].map(([l, v]) => (
                  <div key={l} style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
                    <div style={{ fontSize: 10, color: C.muted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 7 }}>{l}</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{v || '—'}</div>
                  </div>
                ))}
              </div>

              <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Ico d={IC.tag} size={11} color={C.muted} sw={2} /> Classification Breakdown
              </p>
              <div style={{ marginBottom: 26 }}>
                {compStats.classificationBreakdown?.map((item, i) => {
                  const cfg = getCls(item.classification);
                  return (
                    <div key={i} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{item.classification}</span>
                        <span style={{ fontSize: 12, color: C.muted }}>{item.count} · {item.percentage?.toFixed(1)}% · {(item.avgConfidence * 100)?.toFixed(1)}% avg</span>
                      </div>
                      <div style={{ height: 6, background: C.surface2, borderRadius: 99, overflow: 'hidden', border: `1px solid ${C.border}` }}>
                        <div style={{ height: '100%', width: `${item.percentage}%`, background: cfg.color, borderRadius: 99, transition: 'width 0.4s' }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {compStats.materialBreakdown?.length > 0 && (
                <>
                  <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Ico d={IC.box} size={11} color={C.muted} sw={2} /> Material Breakdown
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 26 }}>
                    {compStats.materialBreakdown.slice(0, 8).map((m, i) => (
                      <div key={i} style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, textAlign: 'center' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>{m.material}</div>
                        <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>{m.count} detections</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: C.green }}>{m.percentage?.toFixed(1)}%</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Ico d={IC.users} size={11} color={C.muted} sw={2} /> Top Users
              </p>
              <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 26 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: C.surface2 }}>
                      {['User','Reports','First Report','Last Report'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {compStats.userActivity?.map((u, i) => (
                      <tr key={i} className="wm-table-row">
                        <td style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border2}` }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{u.userName || 'Unknown'}</div>
                          <div style={{ fontSize: 11.5, color: C.muted }}>{u.userEmail}</div>
                        </td>
                        <td style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border2}`, fontWeight: 800, color: C.text, fontSize: 16 }}>{u.reportCount}</td>
                        <td style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border2}`, color: C.dim, fontSize: 12 }}>{fmt(u.firstReport)}</td>
                        <td style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border2}`, color: C.dim, fontSize: 12 }}>{fmt(u.lastReport)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Ico d={IC.trending} size={11} color={C.muted} sw={2} /> Monthly Trends
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 8 }}>
                {compStats.monthlyTrends?.map((m, i) => (
                  <div key={i} style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: 10.5, color: C.muted, marginBottom: 5 }}>{m.period}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>{m.count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WasteManagement;