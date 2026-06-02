import React, { useState, useEffect } from 'react';
import API_URL from '../Utils/Api';

/* ─────────────────────────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Mono:wght@400;500&display=swap');
  @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.19.0/dist/tabler-icons.min.css');

  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes fadeUp  { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes backdropIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes zoomIn  { from { opacity: 0; transform: scale(0.94); } to { opacity: 1; transform: scale(1); } }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  ::-webkit-scrollbar              { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track        { background: transparent; }
  ::-webkit-scrollbar-thumb        { background: #d1d5db; border-radius: 99px; }

  .wm-root {
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 14px;
    line-height: 1.6;
    color: #111;
    background: #f6f6f3;
    min-height: 100%;
  }

  .wm-root * { font-family: inherit; }

  .wm-table-row { transition: background 0.1s; }
  .wm-table-row:hover { background: #f9f9f7; }

  .wm-btn { transition: all 0.15s ease; cursor: pointer; }
  .wm-btn:hover:not(:disabled) { opacity: 0.85; transform: translateY(-1px); }
  .wm-btn:active:not(:disabled) { transform: translateY(0); }

  .wm-stat-card { transition: box-shadow 0.18s ease, transform 0.18s ease; }
  .wm-stat-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.07) !important; }

  .wm-img-thumb { transition: transform 0.2s ease; cursor: zoom-in; }
  .wm-img-thumb:hover { transform: scale(1.05); }

  .wm-lightbox-img {
    animation: zoomIn 0.22s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    max-width: 90vw;
    max-height: 88vh;
    object-fit: contain;
    border-radius: 12px;
    box-shadow: 0 32px 80px rgba(0,0,0,0.5);
    display: block;
  }

  input[type="date"], input[type="time"] {
    color-scheme: light;
    appearance: auto;
    -webkit-appearance: auto;
  }

  .wm-field {
    width: 100%;
    padding: 10px 14px;
    background: #fff;
    border: 1px solid #e4e4de;
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: #111;
    outline: none;
    transition: border-color 0.15s;
  }
  .wm-field:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.08); }

  .wm-label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: #888;
    margin-bottom: 6px;
  }
`;

/* ─────────────────────────────────────────────────────────────
   ICON — wraps Tabler webfont
───────────────────────────────────────────────────────────── */
const Ti = ({ name, size = 16, style = {} }) => (
  <i
    className={`ti ti-${name}`}
    aria-hidden="true"
    style={{ fontSize: size, lineHeight: 1, display: 'inline-block', flexShrink: 0, ...style }}
  />
);

/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────────────────────── */
const T = {
  bg:         '#f6f6f3',
  surface:    '#ffffff',
  surface2:   '#f9f9f7',
  border:     '#e4e4de',
  border2:    '#eeeeea',
  text:       '#111111',
  muted:      '#888888',
  dim:        '#555555',

  indigo:     '#4f46e5',
  indigoBg:   '#eef2ff',
  indigoBorder:'#c7d2fe',

  green:      '#16a34a',
  greenBg:    '#f0fdf4',
  greenBorder:'#bbf7d0',

  amber:      '#b45309',
  amberBg:    '#fffbeb',
  amberBorder:'#fde68a',

  red:        '#dc2626',
  redBg:      '#fef2f2',
  redBorder:  '#fecaca',

  blue:       '#1d4ed8',
  blueBg:     '#eff6ff',
  blueBorder: '#bfdbfe',

  violet:     '#7c3aed',
  violetBg:   '#f5f3ff',
  violetBorder:'#ddd6fe',

  slate:      '#475569',
  slateBg:    '#f8fafc',
  slateBorder:'#cbd5e1',
};

/* ─────────────────────────────────────────────────────────────
   STATUS CONFIG
───────────────────────────────────────────────────────────── */
const STATUS = {
  pending:   { color: T.amber,   bg: T.amberBg,   border: T.amberBorder,   label: 'Pending',   icon: 'clock',           dot: '#f59e0b' },
  processed: { color: T.indigo,  bg: T.indigoBg,  border: T.indigoBorder,  label: 'Processed', icon: 'circle-check',    dot: '#6366f1' },
  scheduled: { color: T.blue,    bg: T.blueBg,    border: T.blueBorder,    label: 'Scheduled', icon: 'truck-delivery',  dot: '#3b82f6' },
  recycled:  { color: T.green,   bg: T.greenBg,   border: T.greenBorder,   label: 'Recycled',  icon: 'recycle',         dot: '#22c55e' },
  disposed:  { color: T.slate,   bg: T.slateBg,   border: T.slateBorder,   label: 'Disposed',  icon: 'trash',           dot: '#64748b' },
  rejected:  { color: T.red,     bg: T.redBg,     border: T.redBorder,     label: 'Rejected',  icon: 'ban',             dot: '#ef4444' },
  completed: { color: T.violet,  bg: T.violetBg,  border: T.violetBorder,  label: 'Completed', icon: 'square-check',    dot: '#8b5cf6' },
};

const CLASS_CFG = {
  'Recyclable':                { color: T.green,  bg: T.greenBg,  border: T.greenBorder },
  'Biodegradable':             { color: T.violet, bg: T.violetBg, border: T.violetBorder },
  'Residual / Non-Recyclable': { color: T.slate,  bg: T.slateBg,  border: T.slateBorder },
  'Special Waste':             { color: T.red,    bg: T.redBg,    border: T.redBorder },
  'unknown':                   { color: T.muted,  bg: T.surface2, border: T.border },
};

const WORKFLOW = {
  pending:   { next: ['processed','rejected'],            label: 'Available Actions' },
  processed: { next: ['scheduled'],                       label: 'Next Step' },
  scheduled: { next: ['completed','recycled','disposed'], label: 'Mark Pickup Result' },
  rejected:  { next: [], label: '' },
  completed: { next: [], label: '' },
  recycled:  { next: [], label: '' },
  disposed:  { next: [], label: '' },
};

const getS   = (s) => STATUS[s] || STATUS.pending;
const getCls = (c) => CLASS_CFG[c] || CLASS_CFG.unknown;

const fmt = (d) => new Date(d).toLocaleDateString('en-US', {
  year: 'numeric', month: 'short', day: 'numeric',
  hour: '2-digit', minute: '2-digit',
});
const fmtConf = (c) => Math.round((c || 0) * 100);

/* ─────────────────────────────────────────────────────────────
   LIGHTBOX
───────────────────────────────────────────────────────────── */
const Lightbox = ({ src, onClose }) => {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 99999, padding: 24, cursor: 'zoom-out',
      animation: 'backdropIn 0.18s ease',
    }}>
      <button onClick={onClose} style={{
        position: 'fixed', top: 20, right: 20,
        width: 40, height: 40, borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: '#fff', zIndex: 100000,
        transition: 'background 0.15s',
      }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
      >
        <Ti name="x" size={18} />
      </button>

      <div style={{
        position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 99, padding: '5px 14px',
        fontSize: 12, color: 'rgba(255,255,255,0.45)',
        display: 'flex', alignItems: 'center', gap: 6,
        pointerEvents: 'none',
      }}>
        <Ti name="keyboard" size={12} style={{ color: 'rgba(255,255,255,0.45)' }} />
        Press ESC to close
      </div>

      <img
        src={src}
        alt="Zoomed view"
        className="wm-lightbox-img"
        onClick={e => e.stopPropagation()}
        style={{ cursor: 'default' }}
      />
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   SHARED SMALL COMPONENTS
───────────────────────────────────────────────────────────── */
const StatusPill = ({ status, lg }) => {
  const s = getS(status);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: lg ? '5px 12px' : '3px 9px',
      borderRadius: 6, fontSize: lg ? 12 : 11, fontWeight: 600,
      color: s.color, background: s.bg, border: `1px solid ${s.border}`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {s.label}
    </span>
  );
};

const ClsPill = ({ cls }) => {
  const cfg = getCls(cls);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '3px 9px',
      borderRadius: 6, fontSize: 11, fontWeight: 600,
      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
    }}>{cls}</span>
  );
};

const ConfBar = ({ value }) => {
  const color = value >= 75 ? T.green : value >= 50 ? T.amber : T.red;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 60, height: 4, background: T.border, borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 99 }} />
      </div>
      <span style={{ fontSize: 12, color, fontWeight: 600, minWidth: 30, fontFamily: "'DM Mono', monospace" }}>{value}%</span>
    </div>
  );
};

const StatCard = ({ label, value, color, icon, borderColor }) => (
  <div className="wm-stat-card" style={{
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderTop: `3px solid ${borderColor || color}`,
    borderRadius: 12,
    padding: '20px 20px 18px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
    animation: 'fadeUp 0.3s ease',
  }}>
    <div style={{
      width: 34, height: 34, borderRadius: 8,
      background: `${color}18`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: 14, color,
    }}>
      <Ti name={icon} size={17} />
    </div>
    <div style={{ fontSize: 28, fontWeight: 600, color: T.text, lineHeight: 1, marginBottom: 4 }}>{value}</div>
    <div style={{ fontSize: 11, color: T.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
  </div>
);

const DetailRow = ({ label, children }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '10px 0', borderBottom: `1px solid ${T.border2}`, gap: 20,
  }}>
    <span style={{ fontSize: 12, color: T.muted, fontWeight: 500, flexShrink: 0, minWidth: 100 }}>{label}</span>
    <span style={{ fontSize: 13, color: T.text, textAlign: 'right', wordBreak: 'break-all', fontWeight: 400 }}>{children}</span>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   WORKFLOW STEPPER
───────────────────────────────────────────────────────────── */
const STEPS = ['pending', 'processed', 'scheduled', 'completed'];

const Stepper = ({ current }) => {
  const idx    = STEPS.indexOf(current);
  const isRej  = current === 'rejected';

  if (isRej) return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 16px', borderRadius: 10,
      background: T.redBg, border: `1px solid ${T.redBorder}`,
      marginBottom: 24, color: T.red,
    }}>
      <Ti name="ban" size={15} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>This report has been rejected</span>
    </div>
  );

  return (
    <div style={{ marginBottom: 28 }}>
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.muted, marginBottom: 16 }}>Workflow</p>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {STEPS.map((step, i) => {
          const cfg    = getS(step);
          const done   = i < idx;
          const active = i === idx;
          return (
            <React.Fragment key={step}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: done ? cfg.color : active ? cfg.bg : T.surface2,
                  border: `2px solid ${done ? cfg.color : active ? cfg.color : T.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: done ? '#fff' : active ? cfg.color : T.muted,
                  boxShadow: active ? `0 0 0 4px ${cfg.dot}1a` : 'none',
                  transition: 'all 0.25s',
                }}>
                  <Ti name={done ? 'check' : cfg.icon} size={13} />
                </div>
                <span style={{
                  fontSize: 11, fontWeight: active ? 600 : 400,
                  color: active ? cfg.color : done ? T.dim : T.muted,
                  whiteSpace: 'nowrap',
                }}>{cfg.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  flex: 1, height: 1, marginBottom: 20,
                  background: i < idx ? T.green : T.border,
                }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   SCHEDULE FORM
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

  const fmtPreview = () => {
    if (!date || !time) return '';
    return new Date(`${date}T${time}`).toLocaleString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true,
    });
  };

  return (
    <div style={{
      background: T.blueBg, border: `1px solid ${T.blueBorder}`,
      borderRadius: 12, padding: 24, marginTop: 6,
      animation: 'slideIn 0.2s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: T.blueBg, border: `1px solid ${T.blueBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: T.blue,
        }}>
          <Ti name="truck-delivery" size={18} />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: T.text }}>Schedule Waste Pickup</div>
          <div style={{ fontSize: 12, color: T.muted, marginTop: 1 }}>Select a collection date and time</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <label className="wm-label">Pickup Date *</label>
          <div style={{ position: 'relative' }}>
            <input type="date" value={date}
              min={new Date().toISOString().slice(0, 10)}
              onChange={e => setDate(e.target.value)}
              className="wm-field"
              style={{ paddingLeft: 38 }}
            />
            <Ti name="calendar" size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.muted, pointerEvents: 'none' }} />
          </div>
        </div>
        <div>
          <label className="wm-label">Pickup Time *</label>
          <div style={{ position: 'relative' }}>
            <input type="time" value={time}
              onChange={e => setTime(e.target.value)}
              className="wm-field"
              style={{ paddingLeft: 38 }}
            />
            <Ti name="clock" size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.muted, pointerEvents: 'none' }} />
          </div>
        </div>
      </div>

      {date && time && (
        <div style={{
          marginBottom: 16, padding: '10px 14px',
          background: '#fff', border: `1px solid ${T.blueBorder}`, borderRadius: 8,
          display: 'flex', alignItems: 'center', gap: 8, color: T.blue,
        }}>
          <Ti name="calendar-check" size={14} />
          <span style={{ fontSize: 12, fontWeight: 500 }}>{fmtPreview()}</span>
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <label className="wm-label">Pickup Address</label>
        <div style={{ position: 'relative' }}>
          <input type="text" value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Enter pickup address"
            className="wm-field"
            style={{ paddingLeft: 38 }}
          />
          <Ti name="map-pin" size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.muted, pointerEvents: 'none' }} />
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label className="wm-label">Notes <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11 }}>(optional)</span></label>
        <textarea rows={2} value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Gate code, landmarks, special instructions…"
          className="wm-field"
          style={{ resize: 'vertical' }}
        />
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button className="wm-btn"
          onClick={() => onConfirm({ date, time, address, notes })}
          disabled={loading || !date || !time}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 8, border: 'none',
            background: !date || !time ? '#93c5fd' : T.blue,
            color: '#fff', fontSize: 13.5, fontWeight: 600,
            cursor: loading || !date || !time ? 'not-allowed' : 'pointer',
          }}>
          <Ti name="check" size={14} />
          {loading ? 'Scheduling…' : 'Confirm Schedule'}
        </button>
        <button onClick={onCancel} style={{
          padding: '10px 16px', borderRadius: 8,
          border: `1px solid ${T.border}`, background: T.surface,
          color: T.dim, fontSize: 13.5, cursor: 'pointer', fontWeight: 500,
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
  const [stats, setStats]            = useState({ total: 0, pending: 0, processed: 0, recycled: 0, disposed: 0, rejected: 0, todaysReports: 0, thisWeeksReports: 0 });
  const [compStats, setCompStats]    = useState(null);
  const [showStats, setShowStats]    = useState(false);
  const [error, setError]            = useState(null);
  const [adminNotes, setAdminNotes]  = useState('');
  const [showSchedule, setShowSched] = useState(false);
  const [proofImg, setProofImg]      = useState(null);
  const [proofPrev, setProofPrev]    = useState('');
  const [saving, setSaving]          = useState(false);
  const [lightboxSrc, setLightbox]   = useState(null);

  const openLightbox  = (src, e) => { if (e) e.stopPropagation(); setLightbox(src); };
  const closeLightbox = () => setLightbox(null);

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

      // ── Fetch ALL reports (no status/page filter) so we have the full dataset ──
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/waste-reports`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const raw = await res.json();
      const allReports = raw.reports || [];

      // ── Classification breakdown ──
      const clsMap = {};
      allReports.forEach(r => {
        const cls = r.classification || 'Unknown';
        if (!clsMap[cls]) clsMap[cls] = { count: 0, confSum: 0 };
        clsMap[cls].count++;
        clsMap[cls].confSum += r.classificationConfidence || 0;
      });
      const total = allReports.length || 1;
      const classificationBreakdown = Object.entries(clsMap)
        .map(([classification, d]) => ({
          classification,
          count: d.count,
          percentage: (d.count / total) * 100,
          avgConfidence: d.confSum / d.count,
        }))
        .sort((a, b) => b.count - a.count);

      // ── Material breakdown from detectedObjects ──
      const matMap = {};
      allReports.forEach(r => {
        (r.detectedObjects || []).forEach(obj => {
          const mat = obj.material || obj.label || 'Unknown';
          matMap[mat] = (matMap[mat] || 0) + 1;
        });
      });
      const totalMats = Object.values(matMap).reduce((a, b) => a + b, 0) || 1;
      const materialBreakdown = Object.entries(matMap)
        .map(([material, count]) => ({ material, count, percentage: (count / totalMats) * 100 }))
        .sort((a, b) => b.count - a.count);
      const topMaterial = materialBreakdown[0]?.material || null;

      // ── User activity — resolve name via username field (mirrors UserManagement) ──
      const userMap = {};
      allReports.forEach(r => {
        const uid = r.user?._id || r.user;
        if (!uid) return;
        if (!userMap[uid]) {
          const displayName = r.user?.username || null;
          const email       = r.userEmail || r.user?.email || null;
          userMap[uid] = { userId: uid, userName: displayName, userEmail: email, reportCount: 0, dates: [] };
        }
        userMap[uid].reportCount++;
        const d = r.scanDate || r.createdAt;
        if (d) userMap[uid].dates.push(new Date(d));
      });
      const userActivity = Object.values(userMap)
        .map(u => ({
          ...u,
          firstReport: u.dates.length ? new Date(Math.min(...u.dates)) : null,
          lastReport:  u.dates.length ? new Date(Math.max(...u.dates)) : null,
        }))
        .sort((a, b) => b.reportCount - a.reportCount);

      const mostActiveUser = userActivity[0]?.userName || userActivity[0]?.userEmail || null;
      const mostCommonClassification = classificationBreakdown[0]?.classification || null;
      const avgReportsPerUser = userActivity.length ? (allReports.length / userActivity.length) : 0;

      // ── Monthly trends (last 6 months) ──
      const monthlyMap = {};
      allReports.forEach(r => {
        const d = new Date(r.scanDate || r.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthlyMap[key] = (monthlyMap[key] || 0) + 1;
      });
      const monthlyTrends = Object.entries(monthlyMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([period, count]) => ({ period, count }));

      setCompStats({
        summary: { mostCommonClassification, topMaterial, mostActiveUser, avgReportsPerUser },
        classificationBreakdown,
        materialBreakdown,
        userActivity,
        monthlyTrends,
      });
      setShowStats(true);
    } catch (e) {
      setError({ type: 'error', message: 'Failed to load statistics.' });
    } finally { setLoading(false); }
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
        setError({ type: 'success', message: 'Pickup scheduled. Status updated to Scheduled.' });
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
          setError({ type: 'success', message: 'Marked as Processed. Schedule a pickup below.' });
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
    { label: 'Total Reports', value: stats.total,            color: T.violet,  icon: 'chart-bar',      borderColor: '#8b5cf6' },
    { label: 'Pending',       value: stats.pending,          color: T.amber,   icon: 'clock',          borderColor: '#f59e0b' },
    { label: 'Processed',     value: stats.processed,        color: T.indigo,  icon: 'circle-check',   borderColor: '#6366f1' },
    { label: 'Recycled',      value: stats.recycled,         color: T.green,   icon: 'recycle',        borderColor: '#22c55e' },
    { label: "Today's",       value: stats.todaysReports,    color: '#0891b2', icon: 'calendar-today', borderColor: '#06b6d4' },
    { label: 'This Week',     value: stats.thisWeeksReports, color: '#e11d48', icon: 'trending-up',    borderColor: '#f43f5e' },
  ];

  const nextActions = selected ? (WORKFLOW[selected.status]?.next || []) : [];

  /* ── MODAL SHARED SECTION HEADER ── */
  const SectionHeader = ({ icon, label }) => (
    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.muted, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
      <Ti name={icon} size={13} />
      {label}
    </p>
  );

  return (
    <div className="wm-root">
      <style>{GLOBAL_CSS}</style>

      {/* LIGHTBOX */}
      {lightboxSrc && <Lightbox src={lightboxSrc} onClose={closeLightbox} />}

      {/* TOAST */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', borderRadius: 10, marginBottom: 20,
          background: error.type === 'success' ? T.greenBg : T.redBg,
          border: `1px solid ${error.type === 'success' ? T.greenBorder : T.redBorder}`,
          color: error.type === 'success' ? T.green : T.red,
          animation: 'fadeUp 0.18s ease', fontSize: 13.5,
        }}>
          <Ti name={error.type === 'success' ? 'circle-check' : 'alert-triangle'} size={15} />
          <span style={{ flex: 1, fontWeight: 500 }}>{error.message}</span>
          <button onClick={() => setError(null)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: error.type === 'success' ? T.green : T.red, display: 'flex', opacity: 0.6,
          }}>
            <Ti name="x" size={14} />
          </button>
        </div>
      )}

      {/* STAT GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 28 }}>
        {STAT_CARDS.map((c, i) => <StatCard key={i} {...c} />)}
      </div>

      {/* TOOLBAR */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 16, gap: 12, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Ti name="filter" size={14} style={{ color: T.muted }} />
          <span style={{ fontSize: 11, color: T.muted, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Filter</span>
          <div style={{ position: 'relative' }}>
            <select value={statusFilter} onChange={e => setFilter(e.target.value)} style={{
              padding: '8px 32px 8px 12px',
              background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8,
              color: T.text, fontSize: 13.5, outline: 'none', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
              appearance: 'none', WebkitAppearance: 'none',
            }}>
              <option value="all">All Reports</option>
              {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={fetchCompStats} disabled={loading} className="wm-btn" style={{
            display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 16px',
            borderRadius: 8, border: `1px solid ${T.greenBorder}`, background: T.greenBg,
            color: T.green, fontSize: 13, fontWeight: 600, opacity: loading ? 0.6 : 1,
          }}>
            <Ti name="chart-bar" size={14} /> Stats Overview
          </button>
          <button onClick={fetchReports} disabled={loading} className="wm-btn" style={{
            display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 16px',
            borderRadius: 8, border: `1px solid ${T.border}`, background: T.surface,
            color: T.dim, fontSize: 13, fontWeight: 600, opacity: loading ? 0.6 : 1,
          }}>
            <Ti name="refresh" size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* TABLE CARD */}
      <div style={{
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: 14, overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px', borderBottom: `1px solid ${T.border}`,
        }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: T.text }}>Waste Reports</h3>
            <p style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>Barangay Central Bicutan, Taguig</p>
          </div>
          <span style={{
            fontSize: 12, color: T.muted, fontWeight: 600,
            background: T.surface2, border: `1px solid ${T.border}`,
            borderRadius: 6, padding: '4px 10px',
          }}>
            {reports.length} {reports.length !== 1 ? 'records' : 'record'}
          </span>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 32px', gap: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', border: `2px solid ${T.border}`, borderTop: `2px solid ${T.indigo}`, animation: 'spin 0.75s linear infinite' }} />
            <span style={{ fontSize: 13, color: T.muted }}>Loading reports…</span>
          </div>
        ) : reports.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '72px 32px', gap: 8 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: T.surface2, border: `1px solid ${T.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: T.muted, marginBottom: 4,
            }}>
              <Ti name="inbox" size={22} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: T.text }}>No reports found</p>
            <p style={{ fontSize: 13, color: T.muted, textAlign: 'center' }}>
              {statusFilter !== 'all' ? `No ${STATUS[statusFilter]?.label || statusFilter} reports.` : 'No waste reports yet.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: T.surface2 }}>
                  {['User', 'Image', 'Classification', 'Confidence', 'Status', 'Date Reported', 'Actions'].map(h => (
                    <th key={h} style={{
                      padding: '11px 20px', textAlign: 'left',
                      fontSize: 11, fontWeight: 600, letterSpacing: '0.07em',
                      textTransform: 'uppercase', color: T.muted,
                      borderBottom: `1px solid ${T.border}`, whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.map(r => {
                  // Backend populates user.username
                  const name    = r.user?.username || '';
                  const email   = r.userEmail || r.user?.email || '—';
                  const initials = name
                    ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                    : (email !== '—' ? email[0].toUpperCase() : '?');
                  const conf    = fmtConf(r.classificationConfidence);

                  return (
                    <tr key={r._id} className="wm-table-row">
                      {/* User */}
                      <td style={{ padding: '14px 20px', borderBottom: `1px solid ${T.border2}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: 10, flexShrink: 0, overflow: 'hidden',
                            background: 'linear-gradient(135deg, #16a34a 0%, #4f46e5 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, fontWeight: 600, color: '#fff',
                          }}>
                            {r.user?.profile
                              ? <img src={r.user.profile} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : initials}
                          </div>
                          <div>
                            <div style={{ fontSize: 13.5, fontWeight: 600, color: T.text }}>
                              {name || <span style={{ color: T.muted, fontWeight: 400, fontStyle: 'italic' }}>No name</span>}
                            </div>
                            <div style={{ fontSize: 12, color: T.muted, marginTop: 1 }}>{email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Image */}
                      <td style={{ padding: '14px 20px', borderBottom: `1px solid ${T.border2}` }}>
                        {r.image ? (
                          <div
                            className="wm-img-thumb"
                            onClick={e => openLightbox(r.image, e)}
                            style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', border: `1px solid ${T.border}`, position: 'relative' }}
                          >
                            <img src={r.image} alt="Waste" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            <div style={{
                              position: 'absolute', inset: 0,
                              background: 'rgba(0,0,0,0)', display: 'flex',
                              alignItems: 'center', justifyContent: 'center',
                              transition: 'background 0.15s',
                            }}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.35)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}
                            >
                              <Ti name="zoom-in" size={14} style={{ color: '#fff', opacity: 0 }} />
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: T.muted, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                            <Ti name="photo-off" size={13} /> None
                          </span>
                        )}
                      </td>

                      {/* Classification */}
                      <td style={{ padding: '14px 20px', borderBottom: `1px solid ${T.border2}` }}>
                        <ClsPill cls={r.classification} />
                      </td>

                      {/* Confidence */}
                      <td style={{ padding: '14px 20px', borderBottom: `1px solid ${T.border2}` }}>
                        <ConfBar value={conf} />
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 20px', borderBottom: `1px solid ${T.border2}` }}>
                        <StatusPill status={r.status} />
                        {r.scheduledPickup?.scheduledDate && r.status === 'scheduled' && (
                          <div style={{ fontSize: 11, color: T.blue, marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Ti name="truck-delivery" size={11} />
                            {new Date(r.scheduledPickup.scheduledDate).toLocaleDateString()} {r.scheduledPickup.scheduledTime}
                          </div>
                        )}
                      </td>

                      {/* Date */}
                      <td style={{ padding: '14px 20px', borderBottom: `1px solid ${T.border2}`, fontSize: 12.5, color: T.dim, whiteSpace: 'nowrap', fontFamily: "'DM Mono', monospace" }}>
                        {fmt(r.scanDate)}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 20px', borderBottom: `1px solid ${T.border2}` }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => openReport(r)} className="wm-btn" style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px',
                            borderRadius: 7, border: `1px solid ${T.indigoBorder}`, background: T.indigoBg,
                            color: T.indigo, fontSize: 12, fontWeight: 600,
                          }}>
                            <Ti name="eye" size={13} /> View
                          </button>
                          <button onClick={() => deleteReport(r._id)} className="wm-btn" style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px',
                            borderRadius: 7, border: `1px solid ${T.redBorder}`, background: T.redBg,
                            color: T.red, fontSize: 12, fontWeight: 600,
                          }}>
                            <Ti name="trash" size={13} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── REPORT DETAIL MODAL ── */}
      {showModal && selected && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: 24,
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: 16, width: 980, maxWidth: '100%', maxHeight: '92vh',
            display: 'flex', flexDirection: 'column',
            animation: 'slideIn 0.22s ease',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }} onClick={e => e.stopPropagation()}>

            {/* Top accent bar */}
            <div style={{ height: 3, background: 'linear-gradient(90deg, #16a34a, #4f46e5, #7c3aed)', borderRadius: '16px 16px 0 0', flexShrink: 0 }} />

            {/* Modal header */}
            <div style={{
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
              padding: '20px 28px 18px', borderBottom: `1px solid ${T.border}`, flexShrink: 0,
            }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 600, color: T.text }}>Report Details</h3>
                <p style={{ fontSize: 12, color: T.muted, marginTop: 3 }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{selected._id}</span>
                  {' · '}Barangay Central Bicutan, Taguig
                </p>
              </div>
              <button onClick={() => setShowModal(false)} style={{
                width: 32, height: 32, borderRadius: 8, border: `1px solid ${T.border}`,
                background: T.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', flexShrink: 0, color: T.muted,
              }}>
                <Ti name="x" size={14} />
              </button>
            </div>

            {/* Modal body */}
            <div style={{ padding: '24px 28px', overflowY: 'auto' }}>
              <Stepper current={selected.status} />

              {/* Main image */}
              {selected.image && (
                <div style={{ marginBottom: 24, position: 'relative', cursor: 'zoom-in', borderRadius: 12, overflow: 'hidden', border: `1px solid ${T.border}` }}
                  onClick={e => openLightbox(selected.image, e)}>
                  <img
                    src={selected.image}
                    alt="Waste report"
                    style={{ width: '100%', height: 260, objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,0,0,0)', transition: 'background 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(0,0,0,0.25)';
                      const badge = e.currentTarget.querySelector('.zoom-badge');
                      if (badge) { badge.style.opacity = '1'; badge.style.transform = 'translate(-50%,-50%) scale(1)'; }
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(0,0,0,0)';
                      const badge = e.currentTarget.querySelector('.zoom-badge');
                      if (badge) { badge.style.opacity = '0'; badge.style.transform = 'translate(-50%,-50%) scale(0.9)'; }
                    }}
                  >
                    <div className="zoom-badge" style={{
                      position: 'absolute', top: '50%', left: '50%',
                      transform: 'translate(-50%,-50%) scale(0.9)',
                      opacity: 0, transition: 'all 0.18s ease',
                      background: 'rgba(255,255,255,0.95)', borderRadius: 99,
                      padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 7,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.15)', fontSize: 13, fontWeight: 600,
                      color: T.text, pointerEvents: 'none',
                    }}>
                      <Ti name="zoom-in" size={14} /> Click to zoom
                    </div>
                  </div>
                </div>
              )}

              {/* Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                {/* Report info */}
                <div style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 12, padding: '18px 20px' }}>
                  <SectionHeader icon="info-circle" label="Report Information" />
                  <DetailRow label="User">
                    {selected.user?.username || <span style={{ color: T.muted, fontStyle: 'italic' }}>No name</span>}
                    {' '}<span style={{ color: T.muted, fontSize: 12 }}>({selected.userEmail || selected.user?.email || '—'})</span>
                  </DetailRow>
                  <DetailRow label="Classification"><ClsPill cls={selected.classification} /></DetailRow>
                  <DetailRow label="Confidence">{fmtConf(selected.classificationConfidence)}%</DetailRow>
                  <DetailRow label="Scan Date">{fmt(selected.scanDate)}</DetailRow>
                  <DetailRow label="Status"><StatusPill status={selected.status} lg /></DetailRow>
                </div>

                {/* Detected objects */}
                <div style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 12, padding: '18px 20px' }}>
                  <SectionHeader icon="scan" label="Detected Objects" />
                  {selected.detectedObjects?.length > 0
                    ? selected.detectedObjects.map((obj, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '8px 0', borderBottom: `1px solid ${T.border2}`,
                      }}>
                        <span style={{ flex: 1, fontSize: 13, color: T.text, fontWeight: 500 }}>{obj.label}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: T.green, background: T.greenBg, borderRadius: 5, padding: '2px 8px', border: `1px solid ${T.greenBorder}` }}>
                          {fmtConf(obj.confidence)}%
                        </span>
                        {obj.material && <span style={{ fontSize: 11.5, color: T.muted }}>({obj.material})</span>}
                      </div>
                    ))
                    : <p style={{ fontSize: 13, color: T.muted }}>No objects detected</p>
                  }
                  {selected.recyclingTips?.length > 0 && (
                    <>
                      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: T.muted, marginTop: 16, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Ti name="bulb" size={12} /> Recycling Tips
                      </p>
                      {selected.recyclingTips.map((tip, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, padding: '5px 0', borderBottom: `1px solid ${T.border2}` }}>
                          <Ti name="circle-check" size={13} style={{ color: T.green, marginTop: 1, flexShrink: 0 }} />
                          <span style={{ fontSize: 12.5, color: T.dim }}>{tip}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Scheduled Pickup Info */}
              {selected.scheduledPickup?.scheduledDate && (
                <div style={{ background: T.blueBg, border: `1px solid ${T.blueBorder}`, borderRadius: 12, padding: '18px 20px', marginBottom: 20 }}>
                  <SectionHeader icon="truck-delivery" label="Scheduled Pickup" />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <DetailRow label="Date">{new Date(selected.scheduledPickup.scheduledDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}</DetailRow>
                    <DetailRow label="Time">{selected.scheduledPickup.scheduledTime}</DetailRow>
                    {selected.scheduledPickup.pickupAddress && <DetailRow label="Address">{selected.scheduledPickup.pickupAddress}</DetailRow>}
                    {selected.scheduledPickup.notes && <DetailRow label="Notes">{selected.scheduledPickup.notes}</DetailRow>}
                    <DetailRow label="Confirmation">{selected.scheduledPickup.confirmed ? 'Confirmed' : 'Pending'}</DetailRow>
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              <div style={{ marginBottom: 20 }}>
                <label className="wm-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Ti name="notes" size={12} /> Admin Notes
                </label>
                <textarea rows={3} value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this report…"
                  className="wm-field"
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Proof Upload */}
              {['scheduled', 'completed', 'recycled', 'disposed'].includes(selected.status) && (
                <div style={{ marginBottom: 20 }}>
                  <label className="wm-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Ti name="camera" size={12} /> Proof of Pickup <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11, marginLeft: 4 }}>(optional)</span>
                  </label>
                  <label style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '9px 14px', borderRadius: 8,
                    border: `1.5px dashed ${T.border}`, background: T.surface2,
                    color: T.dim, fontSize: 13, cursor: 'pointer', fontWeight: 500,
                  }}>
                    <Ti name="upload" size={14} style={{ color: T.muted }} />
                    {proofImg ? proofImg.name : 'Upload pickup photo'}
                    <input type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={e => {
                        const f = e.target.files[0]; if (!f) return;
                        setProofImg(f);
                        const rd = new FileReader(); rd.onloadend = () => setProofPrev(rd.result); rd.readAsDataURL(f);
                      }} />
                  </label>
                  {proofPrev && (
                    <div style={{ marginTop: 10, position: 'relative', display: 'inline-block' }}>
                      <img
                        src={proofPrev} alt="Preview"
                        className="wm-img-thumb"
                        onClick={e => openLightbox(proofPrev, e)}
                        style={{ width: 140, height: 105, objectFit: 'cover', borderRadius: 8, border: `1px solid ${T.border}`, display: 'block' }}
                      />
                      <button onClick={() => { setProofImg(null); setProofPrev(''); }} style={{
                        position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: '50%',
                        background: 'rgba(0,0,0,0.55)', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                      }}>
                        <Ti name="x" size={10} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Action Panel */}
              {nextActions.length > 0 && (
                <div style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 12, padding: '18px 20px', marginBottom: 20 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: T.muted, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Ti name="arrow-right" size={12} />
                    {WORKFLOW[selected.status]?.label || 'Update Status'}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                    {nextActions.map(s => {
                      const cfg = getS(s);
                      const isPrimary = ['processed', 'completed', 'scheduled'].includes(s);
                      const LABELS = {
                        processed: 'Mark as Processed',
                        scheduled: 'Schedule Pickup',
                        completed: 'Mark as Completed',
                        rejected:  'Reject Report',
                        recycled:  'Mark as Recycled',
                        disposed:  'Mark as Disposed',
                      };
                      return (
                        <button key={s} disabled={saving} className="wm-btn"
                          onClick={() => s === 'scheduled' ? setShowSched(true) : updateStatus(selected._id, s)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 7,
                            padding: '9px 18px', borderRadius: 8,
                            border: `1px solid ${cfg.border}`,
                            background: cfg.bg,
                            color: cfg.color, fontSize: 13.5, fontWeight: 600,
                            cursor: saving ? 'not-allowed' : 'pointer',
                          }}>
                          <Ti name={cfg.icon} size={14} />
                          {LABELS[s] || cfg.label}
                          {isPrimary && <Ti name="arrow-right" size={13} />}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ padding: '10px 14px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12, color: T.muted }}>
                    {selected.status === 'pending'   && 'Mark as Processed once the waste has been verified and is ready for collection scheduling.'}
                    {selected.status === 'processed' && 'Schedule a pickup date and time for collection.'}
                    {selected.status === 'scheduled' && 'Once pickup is complete, record the final outcome.'}
                  </div>
                </div>
              )}

              {/* Terminal state */}
              {nextActions.length === 0 && selected.status !== 'pending' && (
                <div style={{
                  padding: '14px 18px', borderRadius: 10,
                  background: getS(selected.status).bg,
                  border: `1px solid ${getS(selected.status).border}`,
                  display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
                  color: getS(selected.status).color,
                }}>
                  <Ti name={getS(selected.status).icon} size={15} />
                  <span style={{ fontSize: 13.5, fontWeight: 500 }}>
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
                <div style={{ marginTop: 24 }}>
                  <SectionHeader icon="history" label="Status History" />
                  <div style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden' }}>
                    {selected.statusHistory.map((h, i) => (
                      <div key={i} style={{ padding: '14px 20px', borderBottom: i < selected.statusHistory.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                          <StatusPill status={h.status} />
                          <span style={{ fontSize: 11.5, color: T.muted, fontFamily: "'DM Mono', monospace" }}>{new Date(h.changedAt).toLocaleString()}</span>
                        </div>
                        <div style={{ fontSize: 12, color: T.dim, marginTop: 4 }}>
                          By: {h.changedByName || h.changedBy?.name || 'Admin'} · {h.changedByRole || 'admin'}
                        </div>
                        {h.notes && <div style={{ fontSize: 12.5, color: T.text, marginTop: 4 }}>Note: {h.notes}</div>}
                        {h.proofImageUrl && (
                          <img
                            src={h.proofImageUrl} alt="Proof"
                            className="wm-img-thumb"
                            onClick={e => openLightbox(h.proofImageUrl, e)}
                            style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, marginTop: 8, border: `1px solid ${T.border}`, display: 'block' }}
                          />
                        )}
                        {h.scheduledPickupDate && (
                          <div style={{ fontSize: 12, color: T.blue, marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Ti name="truck-delivery" size={11} />
                            Pickup: {new Date(h.scheduledPickupDate).toLocaleDateString()} at {h.scheduledPickupTime}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Proof Images */}
              {selected.adminProofImages?.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <SectionHeader icon="photo" label="Proof Images" />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                    {selected.adminProofImages.map((img, i) => (
                      <div key={i}>
                        <img
                          src={img.url} alt={img.description}
                          className="wm-img-thumb"
                          onClick={e => openLightbox(img.url, e)}
                          style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 10, border: `1px solid ${T.border}`, display: 'block' }}
                        />
                        <div style={{ fontSize: 11, color: T.muted, marginTop: 5 }}>
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
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: 24,
        }} onClick={() => setShowStats(false)}>
          <div style={{
            background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: 16, width: 900, maxWidth: '100%', maxHeight: '90vh',
            overflowY: 'auto', animation: 'slideIn 0.22s ease',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ height: 3, background: `linear-gradient(90deg, ${T.green}, ${T.indigo})`, borderRadius: '16px 16px 0 0' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px 18px', borderBottom: `1px solid ${T.border}` }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: T.text }}>Comprehensive Statistics — Central Bicutan</h3>
              <button onClick={() => setShowStats(false)} style={{
                width: 32, height: 32, borderRadius: 8, border: `1px solid ${T.border}`,
                background: T.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: T.muted,
              }}>
                <Ti name="x" size={14} />
              </button>
            </div>
            <div style={{ padding: '24px 28px' }}>

              {/* Summary cards */}
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: T.muted, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Ti name="star" size={12} /> Summary
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 28 }}>
                {[
                  ['Most Common', compStats.summary?.mostCommonClassification, 'tag'],
                  ['Top Material', compStats.summary?.topMaterial, 'box'],
                  ['Most Active User', compStats.summary?.mostActiveUser, 'user'],
                  ['Avg / User', compStats.summary?.avgReportsPerUser != null ? Number(compStats.summary.avgReportsPerUser).toFixed(1) : null, 'chart-bar'],
                ].map(([l, v, icon]) => (
                  <div key={l} style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 10, padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <Ti name={icon} size={13} style={{ color: T.muted }} />
                      <span style={{ fontSize: 11, color: T.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{l}</span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: v ? T.text : T.muted, fontStyle: v ? 'normal' : 'italic' }}>
                      {v || 'No data'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Classification breakdown */}
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: T.muted, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Ti name="tag" size={12} /> Classification Breakdown
              </p>
              <div style={{ marginBottom: 28 }}>
                {compStats.classificationBreakdown?.map((item, i) => {
                  const cfg = getCls(item.classification);
                  return (
                    <div key={i} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, color: T.text, fontWeight: 500 }}>{item.classification}</span>
                        <span style={{ fontSize: 12, color: T.muted, fontFamily: "'DM Mono', monospace" }}>
                          {item.count} · {item.percentage?.toFixed(1)}% · {(item.avgConfidence * 100)?.toFixed(1)}% avg
                        </span>
                      </div>
                      <div style={{ height: 5, background: T.surface2, borderRadius: 99, overflow: 'hidden', border: `1px solid ${T.border}` }}>
                        <div style={{ height: '100%', width: `${item.percentage}%`, background: cfg.color, borderRadius: 99, transition: 'width 0.4s' }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Material breakdown */}
              {compStats.materialBreakdown?.length > 0 && (
                <>
                  <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: T.muted, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Ti name="package" size={12} /> Material Breakdown
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 28 }}>
                    {compStats.materialBreakdown.slice(0, 8).map((m, i) => (
                      <div key={i} style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 3 }}>{m.material}</div>
                        <div style={{ fontSize: 11, color: T.muted, marginBottom: 6 }}>{m.count} detections</div>
                        <div style={{ fontSize: 22, fontWeight: 600, color: T.green }}>{m.percentage?.toFixed(1)}%</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Top users */}
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: T.muted, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Ti name="users" size={12} /> Top Users
              </p>
              <div style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 28 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: T.surface2 }}>
                      {['User', 'Reports', 'First Report', 'Last Report'].map(h => (
                        <th key={h} style={{ padding: '10px 18px', textAlign: 'left', fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: T.muted, borderBottom: `1px solid ${T.border}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {compStats.userActivity?.map((u, i) => {
                      const displayName = u.userName; // resolved as user.username in fetchCompStats
                      return (
                      <tr key={i} className="wm-table-row">
                        <td style={{ padding: '12px 18px', borderBottom: `1px solid ${T.border2}` }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                              width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                              background: 'linear-gradient(135deg, #16a34a 0%, #4f46e5 100%)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 11, fontWeight: 700, color: '#fff',
                            }}>
                              {displayName ? displayName[0].toUpperCase() : (u.userEmail?.[0]?.toUpperCase() || '?')}
                            </div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 500, color: displayName ? T.text : T.muted, fontStyle: displayName ? 'normal' : 'italic' }}>
                                {displayName || 'No name'}
                              </div>
                              <div style={{ fontSize: 11.5, color: T.muted }}>{u.userEmail}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 18px', borderBottom: `1px solid ${T.border2}`, fontWeight: 600, color: T.text, fontSize: 16 }}>{u.reportCount}</td>
                        <td style={{ padding: '12px 18px', borderBottom: `1px solid ${T.border2}`, color: T.dim, fontSize: 12, fontFamily: "'DM Mono', monospace" }}>{fmt(u.firstReport)}</td>
                        <td style={{ padding: '12px 18px', borderBottom: `1px solid ${T.border2}`, color: T.dim, fontSize: 12, fontFamily: "'DM Mono', monospace" }}>{fmt(u.lastReport)}</td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Monthly trends */}
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: T.muted, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Ti name="trending-up" size={12} /> Monthly Trends
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 8 }}>
                {compStats.monthlyTrends?.map((m, i) => (
                  <div key={i} style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 10, padding: '12px 10px', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: T.muted, marginBottom: 5 }}>{m.period}</div>
                    <div style={{ fontSize: 22, fontWeight: 600, color: T.text }}>{m.count}</div>
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