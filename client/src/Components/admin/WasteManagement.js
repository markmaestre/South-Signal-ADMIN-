import React, { useState, useEffect } from 'react';
import API_URL from '../Utils/Api';

/* ─────────────────────────────────────────────────────────────
   ICON SYSTEM
───────────────────────────────────────────────────────────── */
const Icon = ({ d, size = 16, color = 'currentColor', strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0 }}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const ICONS = {
  chart:     ["M18 20V10", "M12 20V4", "M6 20v-6"],
  clock:     ["M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10z", "M12 6v6l4 2"],
  check:     ["M22 11.08V12a10 10 0 11-5.93-9.14", "M22 4L12 14.01l-3-3"],
  recycle:   ["M4 15l3 3 3-3", "M7 18V9.5C7 7 9 5 11.5 5H13", "M20 9l-3-3-3 3", "M17 6v8.5C17 17 15 19 12.5 19H11"],
  calendar:  ["M3 4h18v18H3z", "M16 2v4M8 2v4M3 10h18"],
  trending:  ["M23 6l-9.5 9.5-5-5L1 18", "M17 6h6v6"],
  trash:     ["M3 6h18", "M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6", "M10 11v6", "M14 11v6", "M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"],
  eye:       ["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z", "M12 9a3 3 0 100 6 3 3 0 000-6z"],
  refresh:   ["M23 4v6h-6", "M1 20v-6h6", "M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"],
  x:         "M18 6L6 18M6 6l12 12",
  filter:    "M22 3H2l8 9.46V19l4 2v-8.54L22 3",
  tag:       ["M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z", "M7 7h.01"],
  user:      ["M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2", "M12 11a4 4 0 100-8 4 4 0 000 8z"],
  image:     ["M21 19a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h3l2-3h4l2 3h3a2 2 0 012 2z", "M12 13a3 3 0 100-6 3 3 0 000 6z"],
  info:      ["M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10z", "M12 8h.01", "M11 12h1v4h1"],
  alert:     ["M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z", "M12 9v4", "M12 17h.01"],
  checkCirc: ["M22 11.08V12a10 10 0 11-5.93-9.14", "M22 4L12 14.01l-3-3"],
  zap:       "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  barChart:  ["M12 20h9", "M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"],
  users:     ["M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2", "M23 21v-2a4 4 0 00-3-3.87", "M16 3.13a4 4 0 010 7.75", "M9 7a4 4 0 100 8 4 4 0 000-8z"],
  lightbulb: ["M9 18h6", "M10 22h4", "M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 01-1 1H9a1 1 0 01-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z"],
  box:       ["M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z", "M3.27 6.96L12 12.01l8.73-5.05", "M12 22.08V12"],
  spinner:   "M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83",
  dispose:   ["M3 6h18", "M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"],
  reject:    ["M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10z", "M15 9l-6 6M9 9l6 6"],
};

/* ─────────────────────────────────────────────────────────────
   COLOR MAPS
───────────────────────────────────────────────────────────── */
const STATUS_MAP = {
  pending:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)',  label: 'Pending',   icon: ICONS.clock },
  processed: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.25)', label: 'Processed', icon: ICONS.check },
  recycled:  { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', label: 'Recycled',  icon: ICONS.recycle },
  disposed:  { color: '#64748b', bg: 'rgba(100,116,139,0.1)',border: 'rgba(100,116,139,0.25)',label: 'Disposed',  icon: ICONS.dispose },
  rejected:  { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.25)',  label: 'Rejected',  icon: ICONS.reject },
};

const CLASS_MAP = {
  Recycling:    '#10b981',
  organic:      '#8b5cf6',
  general_waste:'#64748b',
  hazardous:    '#ef4444',
  unknown:      '#94a3b8',
};

const getStatus = (s) => STATUS_MAP[s] || { color: '#64748b', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.2)', label: s, icon: ICONS.tag };
const getClassColor = (c) => CLASS_MAP[c] || '#94a3b8';

/* ─────────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────────── */
const S = {
  root: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    color: '#e2e8f0',
    minHeight: '100%',
  },

  /* ── Alert ── */
  alert: (ok) => ({
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '11px 16px', borderRadius: 8, marginBottom: 20,
    fontSize: 13,
    background: ok ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
    border: `1px solid ${ok ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
    color: ok ? '#6ee7b7' : '#fca5a5',
  }),
  alertClose: {
    marginLeft: 'auto', background: 'none', border: 'none',
    color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center',
  },

  /* ── Stats grid ── */
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14, marginBottom: 20,
  },
  statCard: (color) => ({
    background: 'linear-gradient(135deg, #131c27 0%, #111827 100%)',
    border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12,
    padding: '18px 16px', position: 'relative', overflow: 'hidden',
  }),
  statAccent: (color) => ({
    position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: color,
  }),
  statIcon: (color) => ({
    width: 34, height: 34, borderRadius: 8,
    background: color + '18', display: 'flex', alignItems: 'center',
    justifyContent: 'center', marginBottom: 12,
  }),
  statVal: { fontSize: 24, fontWeight: 800, color: '#f1f5f9', lineHeight: 1, marginBottom: 5 },
  statLabel: { fontSize: 11, color: '#475569', fontWeight: 500 },

  /* ── Toolbar ── */
  toolbar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 16, gap: 12, flexWrap: 'wrap',
  },
  filterRow: { display: 'flex', alignItems: 'center', gap: 10 },
  filterLabel: { fontSize: 12, color: '#475569', fontWeight: 600 },
  select: {
    padding: '8px 12px', background: '#131c27',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
    color: '#e2e8f0', fontSize: 13, outline: 'none', cursor: 'pointer',
  },
  btnOutline: (color) => ({
    display: 'inline-flex', alignItems: 'center', gap: 7,
    padding: '8px 14px', borderRadius: 8,
    border: `1px solid ${color}30`, background: `${color}08`,
    color, fontSize: 12, fontWeight: 600, cursor: 'pointer',
    transition: 'all 0.15s',
  }),
  btnPrimary: {
    display: 'inline-flex', alignItems: 'center', gap: 7,
    padding: '8px 16px', borderRadius: 8, border: 'none',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(16,185,129,0.25)',
  },

  /* ── Table ── */
  tableWrap: {
    background: '#131c27', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 12, overflow: 'hidden',
  },
  tableHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  tableTitle: { fontSize: 14, fontWeight: 700, color: '#e2e8f0', margin: 0 },
  tableCount: {
    fontSize: 12, color: '#475569',
    background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: '4px 10px',
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: {
    padding: '11px 16px', textAlign: 'left',
    fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
    color: '#475569', background: '#0f1923', borderBottom: '1px solid rgba(255,255,255,0.05)',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)',
    color: '#94a3b8', verticalAlign: 'middle',
  },

  /* User cell */
  userCell: { display: 'flex', alignItems: 'center', gap: 10 },
  avatar: {
    width: 32, height: 32, borderRadius: 8, flexShrink: 0, overflow: 'hidden',
    background: 'linear-gradient(135deg, #10b981, #0891b2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, fontWeight: 700, color: '#fff',
  },
  userName: { fontSize: 13, fontWeight: 600, color: '#e2e8f0' },
  userEmail: { fontSize: 11, color: '#475569', marginTop: 1 },

  /* Thumbnail */
  thumb: {
    width: 48, height: 48, borderRadius: 8, overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer',
    position: 'relative', flexShrink: 0,
  },

  /* Badge */
  badge: (color) => ({
    display: 'inline-flex', alignItems: 'center', gap: 5,
    fontSize: 11, fontWeight: 600,
    color, background: color + '18', border: `1px solid ${color}30`,
    borderRadius: 5, padding: '3px 8px', whiteSpace: 'nowrap',
  }),

  /* Confidence bar */
  confWrap: { display: 'flex', alignItems: 'center', gap: 8 },
  confTrack: {
    width: 70, height: 6, background: 'rgba(255,255,255,0.05)',
    borderRadius: 4, overflow: 'hidden',
  },
  confFill: (pct) => ({
    height: '100%', width: `${pct}%`,
    background: pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444',
    borderRadius: 4,
  }),
  confText: { fontSize: 12, color: '#64748b', fontWeight: 600, minWidth: 30 },

  /* Action btns */
  viewBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '6px 11px', borderRadius: 7,
    border: '1px solid rgba(14,165,233,0.25)', background: 'rgba(14,165,233,0.07)',
    color: '#38bdf8', fontSize: 12, fontWeight: 600, cursor: 'pointer',
    marginRight: 6,
  },
  delBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '6px 11px', borderRadius: 7,
    border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.07)',
    color: '#f87171', fontSize: 12, fontWeight: 600, cursor: 'pointer',
  },

  /* Empty */
  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '64px 32px', gap: 12,
  },
  emptyIcon: {
    width: 52, height: 52, borderRadius: 14,
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  emptyTitle: { fontSize: 15, fontWeight: 700, color: '#e2e8f0', margin: 0 },
  emptyDesc: { fontSize: 13, color: '#475569', margin: 0, textAlign: 'center' },

  /* ── Modal ── */
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999, padding: 20,
  },
  modal: (wide) => ({
    background: '#131c27', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 14, width: wide ? 800 : 520, maxWidth: '100%',
    maxHeight: '90vh', overflowY: 'auto', position: 'relative',
    display: 'flex', flexDirection: 'column',
  }),
  modalAccent: (color = 'linear-gradient(90deg, #10b981, #0ea5e9)') => ({
    height: 3, background: color, borderRadius: '14px 14px 0 0', flexShrink: 0,
  }),
  modalHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '20px 24px 18px', borderBottom: '1px solid rgba(255,255,255,0.05)',
    flexShrink: 0,
  },
  modalTitle: { fontSize: 16, fontWeight: 800, color: '#f1f5f9', margin: 0 },
  closeBtn: {
    width: 30, height: 30, borderRadius: 7,
    border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: '#64748b', flexShrink: 0,
  },
  modalBody: { padding: '24px', overflowY: 'auto' },

  /* Detail modal layout */
  detailGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 },
  detailCard: {
    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: 10, padding: '16px',
  },
  detailCardTitle: {
    fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
    color: '#475569', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7,
  },
  detailRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', gap: 12,
  },
  detailKey: { fontSize: 12, color: '#475569', fontWeight: 500, flexShrink: 0 },
  detailVal: { fontSize: 12, color: '#e2e8f0', textAlign: 'right', wordBreak: 'break-all' },

  imgFull: {
    width: '100%', borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.08)', objectFit: 'cover',
  },

  objectItem: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
    fontSize: 12,
  },

  notesArea: {
    width: '100%', padding: '10px 14px',
    background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8, color: '#e2e8f0', fontSize: 13,
    resize: 'vertical', outline: 'none', fontFamily: 'inherit',
    boxSizing: 'border-box',
  },

  /* Status update row */
  statusRow: {
    display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16,
    paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)',
  },
  statusBtn: (cfg, active) => ({
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600,
    border: `1px solid ${active ? cfg.color : cfg.color + '30'}`,
    background: active ? cfg.color + '25' : cfg.color + '0d',
    color: cfg.color,
    transition: 'all 0.15s',
    boxShadow: active ? `0 0 10px ${cfg.color}25` : 'none',
  }),

  /* Stats modal */
  summaryGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20,
  },
  summaryCard: {
    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: 8, padding: '14px',
  },
  summaryLabel: { fontSize: 11, color: '#475569', fontWeight: 600, marginBottom: 5 },
  summaryVal: { fontSize: 14, fontWeight: 700, color: '#e2e8f0' },

  sectionTitle: {
    fontSize: 12, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
    color: '#475569', marginBottom: 12, marginTop: 0,
    display: 'flex', alignItems: 'center', gap: 7,
  },
  barRow: { marginBottom: 12 },
  barMeta: { display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 },
  barTrack: { height: 7, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' },
  barFill: (w, color) => ({ height: '100%', width: `${w}%`, background: color, borderRadius: 4 }),

  matGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 },
  matCard: {
    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: 8, padding: '12px', textAlign: 'center',
  },
  matName: { fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 4 },
  matCount: { fontSize: 11, color: '#475569', marginBottom: 4 },
  matPct: { fontSize: 14, fontWeight: 800, color: '#10b981' },

  trendGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8,
  },
  trendItem: {
    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: 8, padding: '10px 8px', textAlign: 'center',
  },
  trendPeriod: { fontSize: 10, color: '#475569', marginBottom: 4 },
  trendCount: { fontSize: 16, fontWeight: 800, color: '#f1f5f9' },

  /* Loading */
  loadWrap: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '80px 32px', gap: 16,
  },
  spinner: {
    width: 36, height: 36, borderRadius: '50%',
    border: '3px solid rgba(16,185,129,0.15)', borderTop: '3px solid #10b981',
    animation: 'spin 0.8s linear infinite',
  },
  loadText: { fontSize: 13, color: '#475569' },
};

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
const WasteManagement = () => {
  const [reports, setReports]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [selectedReport, setSelected]   = useState(null);
  const [showModal, setShowModal]       = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats]               = useState({ total:0, pending:0, processed:0, recycled:0, disposed:0, rejected:0, todaysReports:0, thisWeeksReports:0 });
  const [comprehensiveStats, setCompStats] = useState(null);
  const [showStatsModal, setShowStats]  = useState(false);
  const [error, setError]               = useState(null);
  const [adminNotes, setAdminNotes]     = useState('');
  const [hoveredRow, setHoveredRow]     = useState(null);

  useEffect(() => { fetchReports(); fetchOverviewStats(); }, [statusFilter]);

  const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found.');
    const config = {
      method: options.method || 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', ...options.headers },
    };
    if (options.body) config.body = JSON.stringify(options.body);
    const response = await fetch(`${API_URL}${url}`, config);
    if (response.status === 401) { localStorage.removeItem('adminToken'); throw new Error('Session expired.'); }
    if (response.status === 403) throw new Error('Access denied. Admin privileges required.');
    if (response.status === 404) throw new Error('API endpoint not found.');
    const ct = response.headers.get('content-type');
    if (!ct?.includes('application/json')) throw new Error('Server returned unexpected response.');
    if (!response.ok) { const e = await response.json(); throw new Error(e.error || e.message || `HTTP ${response.status}`); }
    return response.json();
  };

  const fetchReports = async () => {
    try {
      setLoading(true); setError(null);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('limit', '50'); params.append('page', '1');
      const data = await fetchWithAuth(`/api/waste-reports?${params.toString()}`);
      if (data.success) setReports(data.reports || []);
      else throw new Error(data.error || 'Unknown error');
    } catch (e) {
      let msg = e.message;
      if (msg.includes('Failed to fetch')) msg = 'Cannot connect to server. Check if the backend is running.';
      setError({ type: 'error', message: msg });
      setReports([]);
    } finally { setLoading(false); }
  };

  const fetchOverviewStats = async () => {
    try {
      const data = await fetchWithAuth('/api/waste-reports/stats/overview');
      if (data.success) setStats(data.stats);
    } catch {}
  };

  const fetchComprehensiveStats = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/api/waste-reports/stats/comprehensive');
      if (data.success) { setCompStats(data.stats); setShowStats(true); }
    } catch (e) {
      setError({ type: 'error', message: 'Failed to load comprehensive statistics' });
    } finally { setLoading(false); }
  };

  const viewReport = (report) => { setSelected(report); setAdminNotes(report.adminNotes || ''); setShowModal(true); };

  const updateStatus = async (reportId, newStatus) => {
    try {
      setError(null);
      const res = await fetchWithAuth(`/api/waste-reports/${reportId}/status`, {
        method: 'PUT', body: { status: newStatus, adminNotes },
      });
      if (res.success) {
        await fetchReports(); await fetchOverviewStats();
        setShowModal(false); setAdminNotes('');
        setError({ type: 'success', message: 'Report status updated successfully.' });
        setTimeout(() => setError(null), 3000);
      } else throw new Error(res.error || 'Failed to update status');
    } catch (e) { setError({ type: 'error', message: e.message }); }
  };

  const deleteReport = async (reportId) => {
    if (!window.confirm('Delete this report? This action cannot be undone.')) return;
    try {
      setError(null);
      const res = await fetchWithAuth(`/api/waste-reports/${reportId}`, { method: 'DELETE' });
      if (res.success) {
        await fetchReports(); await fetchOverviewStats();
        setError({ type: 'success', message: 'Report deleted successfully.' });
        setTimeout(() => setError(null), 3000);
      } else throw new Error(res.error || 'Failed to delete report');
    } catch (e) { setError({ type: 'error', message: e.message }); }
  };

  const fmt = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const fmtConf = (c) => Math.round(c * 100);

  const STAT_CARDS = [
    { label: 'Total',       value: stats.total,           color: '#8b5cf6', icon: ICONS.chart   },
    { label: 'Pending',     value: stats.pending,         color: '#f59e0b', icon: ICONS.clock   },
    { label: 'Processed',   value: stats.processed,       color: '#3b82f6', icon: ICONS.check   },
    { label: 'Recycled',    value: stats.recycled,        color: '#10b981', icon: ICONS.recycle },
    { label: "Today",       value: stats.todaysReports,   color: '#0ea5e9', icon: ICONS.calendar},
    { label: 'This Week',   value: stats.thisWeeksReports,color: '#6366f1', icon: ICONS.trending},
  ];

  const STATUS_BTNS = ['pending','processed','recycled','disposed','rejected'];

  if (loading && !showStatsModal) return (
    <div style={S.loadWrap}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={S.spinner} />
      <p style={S.loadText}>Loading waste reports…</p>
      <button style={{ ...S.btnOutline('#10b981'), marginTop: 4 }} onClick={fetchReports}>
        <Icon d={ICONS.refresh} size={13} color="#10b981" strokeWidth={2} /> Retry
      </button>
    </div>
  );

  return (
    <div style={S.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        select option { background: #131c27; color: #e2e8f0; }
        textarea { resize: vertical; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
      `}</style>

      {/* Alert */}
      {error && (
        <div style={S.alert(error.type === 'success')}>
          <Icon d={error.type === 'success' ? ICONS.checkCirc : ICONS.alert}
            size={14} color={error.type === 'success' ? '#10b981' : '#f87171'} strokeWidth={2} />
          {error.message}
          <button style={S.alertClose} onClick={() => setError(null)}>
            <Icon d={ICONS.x} size={12} color="#475569" strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* Stat cards */}
      <div style={S.statsGrid}>
        {STAT_CARDS.map((c, i) => (
          <div key={i} style={S.statCard(c.color)}>
            <div style={S.statAccent(c.color)} />
            <div style={S.statIcon(c.color)}>
              <Icon d={c.icon} size={16} color={c.color} strokeWidth={2} />
            </div>
            <div style={S.statVal}>{c.value}</div>
            <div style={S.statLabel}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={S.toolbar}>
        <div style={S.filterRow}>
          <span style={S.filterLabel}>
            <Icon d={ICONS.filter} size={13} color="#475569" strokeWidth={2} />
          </span>
          <span style={{ ...S.filterLabel, marginLeft: 4 }}>Status:</span>
          <select style={S.select} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Reports</option>
            {STATUS_BTNS.map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            style={S.btnOutline('#10b981')}
            onClick={fetchComprehensiveStats}
            disabled={loading}
          >
            <Icon d={ICONS.barChart} size={13} color="#10b981" strokeWidth={2} />
            Comprehensive Stats
          </button>
          <button style={S.btnOutline('#0ea5e9')} onClick={fetchReports} disabled={loading}>
            <Icon d={ICONS.refresh} size={13} color="#0ea5e9" strokeWidth={2} />
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={S.tableWrap}>
        <div style={S.tableHeader}>
          <h3 style={S.tableTitle}>Waste Reports</h3>
          <span style={S.tableCount}>{reports.length} report{reports.length !== 1 ? 's' : ''}</span>
        </div>
        {reports.length > 0 ? (
          <table style={S.table}>
            <thead>
              <tr>
                {['User','Image','Classification','Confidence','Status','Date','Actions'].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reports.map(report => {
                const st = getStatus(report.status);
                const conf = fmtConf(report.classificationConfidence);
                const isHovered = hoveredRow === report._id;
                return (
                  <tr
                    key={report._id}
                    onMouseEnter={() => setHoveredRow(report._id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{ background: isHovered ? 'rgba(255,255,255,0.02)' : 'transparent', transition: 'background 0.12s' }}
                  >
                    {/* User */}
                    <td style={S.td}>
                      <div style={S.userCell}>
                        <div style={S.avatar}>
                          {report.user?.profile
                            ? <img src={report.user.profile} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <span>{(report.user?.name || report.userEmail || 'U').charAt(0).toUpperCase()}</span>
                          }
                        </div>
                        <div>
                          <div style={S.userName}>{report.user?.name || 'Unknown'}</div>
                          <div style={S.userEmail}>{report.userEmail}</div>
                        </div>
                      </div>
                    </td>
                    {/* Image */}
                    <td style={S.td}>
                      {report.image ? (
                        <div style={S.thumb} onClick={() => viewReport(report)}>
                          <img src={report.image} alt="Waste" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ) : (
                        <span style={{ fontSize: 11, color: '#334155', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Icon d={ICONS.image} size={13} color="#334155" strokeWidth={1.5} /> No image
                        </span>
                      )}
                    </td>
                    {/* Classification */}
                    <td style={S.td}>
                      <span style={S.badge(getClassColor(report.classification))}>
                        <Icon d={ICONS.tag} size={10} color={getClassColor(report.classification)} strokeWidth={2} />
                        {report.classification}
                      </span>
                    </td>
                    {/* Confidence */}
                    <td style={S.td}>
                      <div style={S.confWrap}>
                        <div style={S.confTrack}>
                          <div style={S.confFill(conf)} />
                        </div>
                        <span style={S.confText}>{conf}%</span>
                      </div>
                    </td>
                    {/* Status */}
                    <td style={S.td}>
                      <span style={S.badge(st.color)}>
                        <Icon d={st.icon} size={10} color={st.color} strokeWidth={2} />
                        {st.label}
                      </span>
                    </td>
                    {/* Date */}
                    <td style={{ ...S.td, fontSize: 12, color: '#64748b' }}>
                      {fmt(report.scanDate)}
                    </td>
                    {/* Actions */}
                    <td style={S.td}>
                      <button style={S.viewBtn} onClick={() => viewReport(report)}>
                        <Icon d={ICONS.eye} size={12} color="#38bdf8" strokeWidth={2} /> View
                      </button>
                      <button style={S.delBtn} onClick={() => deleteReport(report._id)}>
                        <Icon d={ICONS.trash} size={12} color="#f87171" strokeWidth={2} /> Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div style={S.empty}>
            <div style={S.emptyIcon}>
              <Icon d={ICONS.box} size={24} color="#334155" strokeWidth={1.5} />
            </div>
            <p style={S.emptyTitle}>No reports found</p>
            <p style={S.emptyDesc}>
              {statusFilter !== 'all'
                ? `No reports with status "${statusFilter}".`
                : 'No waste reports in the system yet.'}
            </p>
            <button style={{ ...S.btnOutline('#10b981'), marginTop: 8 }} onClick={fetchReports}>
              <Icon d={ICONS.refresh} size={13} color="#10b981" strokeWidth={2} /> Try Again
            </button>
          </div>
        )}
      </div>

      {/* ── Report detail modal ── */}
      {showModal && selectedReport && (
        <div style={S.overlay} onClick={() => setShowModal(false)}>
          <div style={S.modal(true)} onClick={e => e.stopPropagation()}>
            <div style={S.modalAccent()} />
            <div style={S.modalHeader}>
              <div>
                <h3 style={S.modalTitle}>Waste Report Details</h3>
                <p style={{ fontSize: 12, color: '#475569', margin: '3px 0 0' }}>
                  ID: {selectedReport._id}
                </p>
              </div>
              <button style={S.closeBtn} onClick={() => setShowModal(false)}>
                <Icon d={ICONS.x} size={14} color="#64748b" strokeWidth={2.5} />
              </button>
            </div>

            <div style={S.modalBody}>
              {/* Image */}
              {selectedReport.image && (
                <div style={{ marginBottom: 20 }}>
                  <img src={selectedReport.image} alt="Waste detection" style={S.imgFull} />
                </div>
              )}

              {/* Info grid */}
              <div style={S.detailGrid}>
                {/* Report info */}
                <div style={S.detailCard}>
                  <p style={S.detailCardTitle}>
                    <Icon d={ICONS.info} size={12} color="#475569" strokeWidth={2} />
                    Report Information
                  </p>
                  {[
                    ['User', `${selectedReport.user?.name || 'Unknown'} (${selectedReport.userEmail})`],
                    ['Classification', selectedReport.classification],
                    ['Confidence', `${fmtConf(selectedReport.classificationConfidence)}%`],
                    ['Scan Date', fmt(selectedReport.scanDate)],
                  ].map(([k, v]) => (
                    <div key={k} style={S.detailRow}>
                      <span style={S.detailKey}>{k}</span>
                      <span style={S.detailVal}>{v}</span>
                    </div>
                  ))}
                  <div style={{ ...S.detailRow, border: 'none', paddingBottom: 0 }}>
                    <span style={S.detailKey}>Status</span>
                    <span style={S.badge(getStatus(selectedReport.status).color)}>
                      {getStatus(selectedReport.status).label}
                    </span>
                  </div>
                </div>

                {/* Detected objects */}
                <div style={S.detailCard}>
                  <p style={S.detailCardTitle}>
                    <Icon d={ICONS.zap} size={12} color="#475569" strokeWidth={2} />
                    Detected Objects
                  </p>
                  {selectedReport.detectedObjects?.length > 0
                    ? selectedReport.detectedObjects.map((obj, i) => (
                        <div key={i} style={S.objectItem}>
                          <span style={{ flex: 1, color: '#e2e8f0', fontWeight: 500 }}>{obj.label}</span>
                          <span style={{ ...S.badge('#10b981'), fontSize: 10 }}>{fmtConf(obj.confidence)}%</span>
                          {obj.material && <span style={{ fontSize: 11, color: '#475569' }}>({obj.material})</span>}
                        </div>
                      ))
                    : <p style={{ fontSize: 12, color: '#334155', margin: 0 }}>No objects detected</p>
                  }

                  {selectedReport.recyclingTips?.length > 0 && (
                    <>
                      <p style={{ ...S.detailCardTitle, marginTop: 16 }}>
                        <Icon d={ICONS.lightbulb} size={12} color="#475569" strokeWidth={2} />
                        Recycling Tips
                      </p>
                      {selectedReport.recyclingTips.map((tip, i) => (
                        <div key={i} style={{ ...S.objectItem, gap: 10 }}>
                          <Icon d={ICONS.checkCirc} size={12} color="#10b981" strokeWidth={2} />
                          <span style={{ fontSize: 12, color: '#94a3b8' }}>{tip}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Admin notes */}
              <div style={{ marginBottom: 20 }}>
                <p style={S.sectionTitle}>
                  <Icon d={ICONS.barChart} size={13} color="#475569" strokeWidth={2} />
                  Admin Notes
                </p>
                <textarea
                  style={S.notesArea}
                  rows={3}
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  placeholder="Add admin notes here…"
                />
              </div>

              {/* Status update */}
              <div>
                <p style={S.sectionTitle}>
                  <Icon d={ICONS.refresh} size={13} color="#475569" strokeWidth={2} />
                  Update Status
                </p>
                <div style={S.statusRow}>
                  {STATUS_BTNS.map(s => {
                    const cfg = getStatus(s);
                    const active = selectedReport.status === s;
                    return (
                      <button
                        key={s}
                        style={S.statusBtn(cfg, active)}
                        onClick={() => updateStatus(selectedReport._id, s)}
                      >
                        <Icon d={cfg.icon} size={12} color={cfg.color} strokeWidth={2} />
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Comprehensive stats modal ── */}
      {showStatsModal && comprehensiveStats && (
        <div style={S.overlay} onClick={() => setShowStats(false)}>
          <div style={S.modal(true)} onClick={e => e.stopPropagation()}>
            <div style={S.modalAccent()} />
            <div style={S.modalHeader}>
              <h3 style={S.modalTitle}>Comprehensive Waste Statistics</h3>
              <button style={S.closeBtn} onClick={() => setShowStats(false)}>
                <Icon d={ICONS.x} size={14} color="#64748b" strokeWidth={2.5} />
              </button>
            </div>
            <div style={S.modalBody}>

              {/* Summary */}
              <p style={S.sectionTitle}>
                <Icon d={ICONS.info} size={13} color="#475569" strokeWidth={2} /> Quick Summary
              </p>
              <div style={S.summaryGrid}>
                {[
                  ['Most Common Classification', comprehensiveStats.summary.mostCommonClassification],
                  ['Top Material', comprehensiveStats.summary.topMaterial],
                  ['Most Active User', comprehensiveStats.summary.mostActiveUser],
                  ['Avg Reports / User', comprehensiveStats.summary.avgReportsPerUser?.toFixed(1)],
                ].map(([label, val]) => (
                  <div key={label} style={S.summaryCard}>
                    <div style={S.summaryLabel}>{label}</div>
                    <div style={S.summaryVal}>{val || '—'}</div>
                  </div>
                ))}
              </div>

              {/* Classification breakdown */}
              <p style={S.sectionTitle}>
                <Icon d={ICONS.tag} size={13} color="#475569" strokeWidth={2} /> Classification Breakdown
              </p>
              <div style={{ marginBottom: 20 }}>
                {comprehensiveStats.classificationBreakdown.map((item, i) => (
                  <div key={i} style={S.barRow}>
                    <div style={S.barMeta}>
                      <span style={{ fontSize: 12, color: '#e2e8f0', fontWeight: 500 }}>{item.classification}</span>
                      <span style={{ fontSize: 12, color: '#64748b' }}>
                        {item.count} reports · {item.percentage?.toFixed(1)}% · avg {(item.avgConfidence * 100)?.toFixed(1)}% conf
                      </span>
                    </div>
                    <div style={S.barTrack}>
                      <div style={S.barFill(item.percentage, getClassColor(item.classification))} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Materials */}
              {comprehensiveStats.materialBreakdown?.length > 0 && (
                <>
                  <p style={S.sectionTitle}>
                    <Icon d={ICONS.box} size={13} color="#475569" strokeWidth={2} /> Material Breakdown
                  </p>
                  <div style={S.matGrid}>
                    {comprehensiveStats.materialBreakdown.slice(0, 8).map((m, i) => (
                      <div key={i} style={S.matCard}>
                        <div style={S.matName}>{m.material}</div>
                        <div style={S.matCount}>{m.count} detections</div>
                        <div style={S.matPct}>{m.percentage?.toFixed(1)}%</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Top users */}
              <p style={S.sectionTitle}>
                <Icon d={ICONS.users} size={13} color="#475569" strokeWidth={2} /> Top Users by Activity
              </p>
              <div style={{ ...S.tableWrap, marginBottom: 20 }}>
                <table style={S.table}>
                  <thead>
                    <tr>
                      {['User','Reports','First Report','Last Report'].map(h => (
                        <th key={h} style={S.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {comprehensiveStats.userActivity.map((u, i) => (
                      <tr key={i}>
                        <td style={S.td}>
                          <div style={S.userName}>{u.userName || 'Unknown'}</div>
                          <div style={S.userEmail}>{u.userEmail}</div>
                        </td>
                        <td style={{ ...S.td, fontWeight: 700, color: '#f1f5f9' }}>{u.reportCount}</td>
                        <td style={{ ...S.td, fontSize: 12 }}>{fmt(u.firstReport)}</td>
                        <td style={{ ...S.td, fontSize: 12 }}>{fmt(u.lastReport)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Monthly trends */}
              <p style={S.sectionTitle}>
                <Icon d={ICONS.trending} size={13} color="#475569" strokeWidth={2} /> Monthly Trends (Last 12 Months)
              </p>
              <div style={S.trendGrid}>
                {comprehensiveStats.monthlyTrends.map((m, i) => (
                  <div key={i} style={S.trendItem}>
                    <div style={S.trendPeriod}>{m.period}</div>
                    <div style={S.trendCount}>{m.count}</div>
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