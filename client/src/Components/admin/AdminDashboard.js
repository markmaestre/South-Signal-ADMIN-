import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import API_URL from '../Utils/Api';
import WasteManagement from './WasteManagement';
import Message from './Message';
import AdminProfiles from './AdminProfiles';
import Analytics from './Analytics';

// Import Leaflet and heatmap libraries
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import 'leaflet-fullscreen/dist/Leaflet.fullscreen.js';
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS — Blue, White, Red Theme
───────────────────────────────────────────────────────────── */

const S = {
  root: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f3f4f6',
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    color: '#1f2937',
  },
  sidebar: {
    width: 260,
    minHeight: '100vh',
    background: '#1e3a5f',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 100,
    boxShadow: '4px 0 24px rgba(30,58,95,0.18)',
  },
  sidebarHeader: {
    padding: '28px 24px 22px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  logoWrap: { display: 'flex', alignItems: 'center', gap: 12 },
  logoMark: {
    width: 42,
    height: 42,
    background: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: '1px solid rgba(255,255,255,0.15)',
  },
  logoTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#ffffff',
    letterSpacing: '0.04em',
    lineHeight: 1.2,
  },
  logoSub: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 3,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
  nav: { flex: 1, padding: '18px 12px', overflowY: 'auto' },
  navSection: { marginBottom: 26 },
  navSectionLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.3)',
    padding: '0 12px',
    marginBottom: 6,
  },
  navItem: (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 12px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 13.5,
    fontWeight: active ? 600 : 400,
    color: active ? '#ffffff' : 'rgba(255,255,255,0.55)',
    background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
    borderLeft: active ? '3px solid #ef4444' : '3px solid transparent',
    transition: 'all 0.15s ease',
    marginBottom: 2,
    userSelect: 'none',
  }),
  sidebarFooter: {
    padding: '16px 12px',
    borderTop: '1px solid rgba(255,255,255,0.08)',
  },
  adminMini: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 8,
    marginBottom: 8,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.08)',
    cursor: 'pointer',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 8,
    background: 'rgba(59,130,246,0.3)',
    border: '1px solid rgba(59,130,246,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 700,
    color: '#3b82f6',
    flexShrink: 0,
    overflow: 'hidden',
  },
  adminName: { fontSize: 13, fontWeight: 600, color: '#ffffff' },
  adminRole: { fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1 },
  logoutBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '9px 12px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)',
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    fontFamily: "'DM Sans', sans-serif",
  },
  main: {
    marginLeft: 260,
    flex: 1,
    minHeight: '100vh',
    background: '#f3f4f6',
  },
  topbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 32px',
    borderBottom: '1px solid #e5e7eb',
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(10px)',
    position: 'sticky',
    top: 0,
    zIndex: 50,
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  pageTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 26,
    fontWeight: 400,
    letterSpacing: '0.04em',
    color: '#1e3a5f',
    margin: 0,
    lineHeight: 1,
  },
  pageSub: { fontSize: 13, color: '#6b7280', margin: '5px 0 0' },
  dateChip: {
    fontSize: 12,
    color: '#6b7280',
    background: '#eff6ff',
    border: '1px solid #e5e7eb',
    borderRadius: 7,
    padding: '7px 14px',
    fontWeight: 500,
  },
  content: { padding: '28px 32px' },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#6b7280',
    marginBottom: 14,
    marginTop: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    background: '#e5e7eb',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    marginBottom: 28,
  },
  statCard: {
    background: '#ffffff',
    border: '1.5px solid #e5e7eb',
    borderRadius: 14,
    padding: '22px 22px 18px',
    position: 'relative',
    overflow: 'hidden',
    transition: 'box-shadow 0.2s, transform 0.2s',
    cursor: 'pointer',
  },
  statCardAccent: (color) => ({
    position: 'absolute',
    top: 0, left: 0,
    width: '100%',
    height: 3,
    background: color,
    borderRadius: '14px 14px 0 0',
  }),
  statIconBox: (color) => ({
    width: 40,
    height: 40,
    borderRadius: 10,
    background: color + '14',
    border: '1px solid ' + color + '25',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  }),
  statLabel: { fontSize: 12, color: '#6b7280', fontWeight: 500, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' },
  statValue: { fontSize: 30, fontWeight: 800, color: '#1e3a5f', lineHeight: 1, marginBottom: 10 },
  statBadge: (positive) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 11,
    fontWeight: 600,
    color: positive ? '#2563eb' : '#dc2626',
    background: positive ? '#eff6ff' : '#fef2f2',
    border: '1px solid ' + (positive ? '#bfdbfe' : '#fecaca'),
    borderRadius: 5,
    padding: '3px 8px',
  }),
  analyticsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 16,
    marginBottom: 28,
  },
  analyticsCard: {
    background: '#ffffff',
    border: '1.5px solid #e5e7eb',
    borderRadius: 14,
    padding: '24px',
  },
  analyticsCardTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: '#1e3a5f',
    marginBottom: 18,
    marginTop: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    letterSpacing: '0.01em',
  },
  titleDot: (color) => ({
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: color,
    flexShrink: 0,
  }),
  miniGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 18 },
  miniCard: {
    background: '#eff6ff',
    borderRadius: 9,
    padding: '12px 14px',
    border: '1px solid #e5e7eb',
  },
  miniValue: { fontSize: 22, fontWeight: 800, color: '#1e3a5f', marginBottom: 3 },
  miniLabel: { fontSize: 11, color: '#6b7280', fontWeight: 500 },
  barRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  barLabel: { fontSize: 12, color: '#6b7280', width: 100, flexShrink: 0 },
  barTrack: { flex: 1, height: 7, background: '#eff6ff', borderRadius: 4, overflow: 'hidden' },
  barFill: (w, color) => ({
    height: '100%',
    width: `${w}%`,
    background: color,
    borderRadius: 4,
    transition: 'width 0.6s cubic-bezier(.4,0,.2,1)',
  }),
  barVal: { fontSize: 12, color: '#6b7280', width: 40, textAlign: 'right', flexShrink: 0 },
  collectionTable: {
    background: '#ffffff',
    border: '1.5px solid #e5e7eb',
    borderRadius: 14,
    overflow: 'hidden',
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr',
    background: '#eff6ff',
    padding: '12px 16px',
    fontWeight: 600,
    fontSize: 12,
    color: '#1e3a5f',
    borderBottom: '1px solid #e5e7eb',
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr',
    padding: '12px 16px',
    fontSize: 13,
    color: '#6b7280',
    borderBottom: '1px solid #e5e7eb',
    transition: 'background 0.2s',
  },
  statusBadge: (status) => ({
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600,
    background: status === 'completed' || status === 'recycled' ? '#dcfce7' : 
                status === 'pending' ? '#fef3c7' : '#fee2e2',
    color: status === 'completed' || status === 'recycled' ? '#16a34a' : 
           status === 'pending' ? '#d97706' : '#dc2626',
  }),
  mapContainer: {
    background: '#ffffff',
    border: '1.5px solid #e5e7eb',
    borderRadius: 14,
    padding: '0px',
    minHeight: 500,
    overflow: 'hidden',
    position: 'relative',
  },
  mapLegend: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    background: 'rgba(255,255,255,0.95)',
    padding: '12px 16px',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    zIndex: 1000,
    fontSize: 12,
    border: '1px solid #e5e7eb',
  },
  mapLegendTitle: {
    fontWeight: 700,
    marginBottom: 8,
    color: '#1e3a5f',
  },
  legendGradient: {
    width: 200,
    height: 12,
    background: 'linear-gradient(to right, #00ff00, #ffff00, #ff0000)',
    borderRadius: 6,
    marginBottom: 8,
  },
  legendLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 10,
    color: '#6b7280',
  },
  mapControls: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1000,
    display: 'flex',
    gap: 8,
  },
  mapControlBtn: {
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 500,
    color: '#1e3a5f',
    transition: 'all 0.2s',
  },
  mapInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    background: 'rgba(255,255,255,0.95)',
    padding: '8px 12px',
    borderRadius: 6,
    fontSize: 11,
    color: '#6b7280',
    zIndex: 1000,
    border: '1px solid #e5e7eb',
  },
  locationRanking: {
    position: 'absolute',
    top: 20,
    left: 20,
    background: 'rgba(255,255,255,0.95)',
    padding: '12px 16px',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    zIndex: 1000,
    fontSize: 12,
    border: '1px solid #e5e7eb',
    maxWidth: 250,
  },
  locationRankingTitle: {
    fontWeight: 700,
    marginBottom: 8,
    color: '#1e3a5f',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: 4,
  },
  rankingItem: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 6,
    fontSize: 11,
  },
  rankingName: {
    fontWeight: 500,
    color: '#374151',
  },
  rankingCount: {
    color: '#2563eb',
    fontWeight: 600,
  },
  historyItem: {
    background: '#ffffff',
    border: '1.5px solid #e5e7eb',
    borderRadius: 12,
    padding: '16px',
    marginBottom: 12,
    transition: 'all 0.2s',
  },
  historyRow: {
    display: 'flex',
    gap: 16,
    fontSize: 12,
    color: '#6b7280',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(30,58,95,0.5)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  modal: {
    background: '#ffffff',
    border: '1.5px solid #e5e7eb',
    borderRadius: 16,
    padding: 36,
    width: 500,
    maxWidth: '90vw',
    boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
  },
  modalTitle: { fontSize: 20, fontWeight: 700, color: '#1e3a5f', marginBottom: 10, marginTop: 0 },
  modalDesc: { fontSize: 14, color: '#6b7280', lineHeight: 1.65, marginBottom: 26 },
  modalActions: { display: 'flex', gap: 10, justifyContent: 'flex-end' },
  btnSecondary: {
    padding: '10px 20px',
    borderRadius: 8,
    border: '1.5px solid #e5e7eb',
    background: 'transparent',
    color: '#6b7280',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },
  btnDanger: {
    padding: '10px 20px',
    borderRadius: 8,
    border: 'none',
    background: 'linear-gradient(135deg, #dc2626, #ef4444)',
    color: '#fff',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },
  errorBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 8,
    padding: '11px 18px',
    margin: '0 32px 16px',
    fontSize: 13,
    color: '#dc2626',
  },
  errClose: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    fontSize: 18,
    lineHeight: 1,
  },
  loadWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#f3f4f6',
    gap: 16,
  },
  spinner: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    border: '3px solid #e5e7eb',
    borderTop: '3px solid #2563eb',
    animation: 'spin 0.8s linear infinite',
  },
  loadText: { fontSize: 14, color: '#6b7280', fontWeight: 500 },
  chartContainer: {
    height: 300,
    marginTop: 16,
  },
};

const Icon = ({ d, size = 18, color = 'currentColor', strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const ICONS = {
  dashboard: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  analytics: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  collection: "M20 7h-4.18A3 3 0 0013 5h-2a3 3 0 00-2.82 2H4a1 1 0 00-1 1v10a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1z M12 11v4 M9 13h6",
  response: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z M8 10h.01 M12 10h.01 M16 10h.01",
  map: "M21 10.5c0 4.5-9 12-9 12s-9-7.5-9-12a9 9 0 0118 0z M12 13.5a3 3 0 100-6 3 3 0 000 6z",
  history: "M12 8v4l3 3 M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
  waste: ["M3 6h18", "M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6", "M10 11v6", "M14 11v6", "M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"],
  messages: ["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z", "M22 6l-10 7L2 6"],
  logout: ["M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4", "M16 17l5-5-5-5", "M21 12H9"],
  profile: ["M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2", "M12 11a4 4 0 100-8 4 4 0 000 8z"],
  shield: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"],
  leaf: ["M6.5 7.5C5 10 4 14 8 18c4 4 8.5 2.5 10.5 0.5C20 16 21 12 17 8c-3-3-7-3-9-2", "M3 21l6-6"],
  trending: ["M23 6l-9.5 9.5-5-5L1 18", "M17 6h6v6"],
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  recycle: ["M4 15l3 3 3-3", "M7 18V9.5C7 7 9 5 11.5 5H13", "M20 9l-3-3-3 3", "M17 6v8.5C17 17 15 19 12.5 19H11"],
  check: "M22 11.08V12a10 10 0 11-5.93-9.14",
  alert: ["M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z", "M12 9v4", "M12 17h.01"],
  village: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  fullscreen: "M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3",
  calendar: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z",
  weight: "M12 2v4M12 6l4 4-4 4-4-4 4-4z M4 12h16 M12 22v-4",
  location: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 13a3 3 0 100-6 3 3 0 000 6z",
  trophy: "M12 15v4m-4 4h8M6 3h12v6c0 3.314-2.686 6-6 6s-6-2.686-6-6V3z M6 9h12",
  download: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3",
  fileText: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
};

const ACCENT = {
  blueDark: '#1e3a5f',
  blue: '#2563eb',
  blueLight: '#3b82f6',
  bluePale: '#eff6ff',
  red: '#dc2626',
  redLight: '#ef4444',
  redPale: '#fef2f2',
  gray: '#6b7280',
  grayLight: '#9ca3af',
};

const SectionHeading = ({ children }) => (
  <div style={S.sectionTitle}>
    <span>{children}</span>
    <div style={S.sectionLine} />
  </div>
);

// Map Component with Heatmap based on real user addresses
const WasteHeatmap = ({ locations, topLocations, onLocationClick, adminRole }) => {
  const mapRef = useRef(null);
  const heatmapRef = useRef(null);
  const markersRef = useRef([]);

  // Different center coordinates based on admin role
  const getCenterCoordinates = () => {
    if (adminRole === 'southadmin') {
      return { lat: 14.50493, lng: 121.05368 }; // South Signal center
    } else if (adminRole === 'centraladmin') {
      return { lat: 14.5185, lng: 121.0580 }; // Central Signal center
    }
    return { lat: 14.5117, lng: 121.0558 }; // Center of Taguig
  };

  const SOUTH_SIGNAL_CENTER = getCenterCoordinates();

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('waste-map').setView([SOUTH_SIGNAL_CENTER.lat, SOUTH_SIGNAL_CENTER.lng], 14);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CartoDB',
        subdomains: 'abcd',
        maxZoom: 19,
        minZoom: 12,
      }).addTo(mapRef.current);

      L.control.scale({ metric: true, imperial: false }).addTo(mapRef.current);
      
      L.control.fullscreen({
        position: 'topright',
        title: 'Fullscreen',
        titleCancel: 'Exit Fullscreen',
      }).addTo(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [adminRole]);

  useEffect(() => {
    if (!mapRef.current || !locations.length) return;

    if (heatmapRef.current) {
      mapRef.current.removeLayer(heatmapRef.current);
    }
    markersRef.current.forEach(marker => {
      mapRef.current.removeLayer(marker);
    });
    markersRef.current = [];

    // Prepare heatmap data from real locations
    const heatData = locations.map(loc => [loc.lat, loc.lng, loc.intensity || loc.count || 1]);
    
    heatmapRef.current = L.heatLayer(heatData, {
      radius: 30,
      blur: 20,
      maxZoom: 18,
      minOpacity: 0.3,
      gradient: {
        0.2: '#00ff00',
        0.4: '#aaff00',
        0.6: '#ffff00',
        0.8: '#ff8800',
        1.0: '#ff0000'
      }
    }).addTo(mapRef.current);

    // Add markers for top locations only (to avoid clutter)
    const topLocationsToShow = topLocations.slice(0, 10);
    topLocationsToShow.forEach((loc, idx) => {
      const markerColor = '#ef4444';
      
      const marker = L.circleMarker([loc.lat, loc.lng], {
        radius: 8 + (idx < 3 ? 4 : 0),
        fillColor: markerColor,
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9
      }).addTo(mapRef.current);

      marker.bindPopup(`
        <div style="font-family: 'DM Sans', sans-serif; min-width: 180px;">
          <strong style="color: #1e3a5f;">📍 ${loc.address}</strong><br/>
          <hr style="margin: 8px 0; border-color: #e5e7eb;">
          <strong>Total Reports:</strong> ${loc.count}<br/>
          <strong>Total Weight:</strong> ${loc.totalWeight.toFixed(2)} kg<br/>
          <strong>Rank:</strong> #${idx + 1} most active<br/>
          <div style="margin-top: 8px; font-size: 11px; color: #6b7280;">
            Click to view detailed analytics
          </div>
        </div>
      `);

      marker.on('click', () => {
        if (onLocationClick) onLocationClick(loc);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all locations
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lng]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }

  }, [locations, topLocations, onLocationClick]);

  return (
    <div id="waste-map" style={{ height: '500px', width: '100%', borderRadius: '14px' }} />
  );
};

const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [adminRole, setAdminRole] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    recycledReports: 0,
    processedReports: 0,
    disposedReports: 0,
    totalMessages: 0,
    unreadMessages: 0,
    weeklyGrowth: 0,
    totalWeight: 0,
  });
  const [classificationData, setClassificationData] = useState({});
  const [collectionData, setCollectionData] = useState([]);
  const [responseData, setResponseData] = useState({
    totalFeedback: 0,
    respondedFeedback: 0,
    responseRate: 0,
    totalMessages: 0,
    repliedMessages: 0,
  });
  const [historyData, setHistoryData] = useState([]);
  const [mapLocations, setMapLocations] = useState([]);
  const [topLocations, setTopLocations] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState({});
  const [locationAnalytics, setLocationAnalytics] = useState({});
  const [dailyTrends, setDailyTrends] = useState([]);
  const navigate = useNavigate();

  // Get barangay name based on role
  const getBarangayName = () => {
    if (adminRole === 'southadmin') return 'South Signal, Taguig';
    if (adminRole === 'centraladmin') return 'Central Signal, Taguig';
    return 'Waste Management System';
  };

  // Geocoding function to convert address to coordinates
  const geocodeAddress = async (address) => {
    // Handle non-string addresses
    let addressString = '';
    if (typeof address === 'string') {
      addressString = address;
    } else if (address && typeof address === 'object') {
      addressString = address.address || address.location || address.name || '';
    } else {
      addressString = '';
    }
    
    if (!addressString) {
      // Return appropriate default based on role
      if (adminRole === 'southadmin') return { lat: 14.50493, lng: 121.05368 };
      if (adminRole === 'centraladmin') return { lat: 14.5185, lng: 121.0580 };
      return { lat: 14.5117, lng: 121.0558 };
    }
    
    const southSignalPhases = {
      'phase 1': { lat: 14.5012, lng: 121.0505 },
      'phase 2': { lat: 14.5028, lng: 121.0521 },
      'phase 3': { lat: 14.5045, lng: 121.0542 },
      'phase 4': { lat: 14.5061, lng: 121.0558 },
      'phase 5': { lat: 14.5078, lng: 121.0575 },
      'barangay hall': { lat: 14.50493, lng: 121.05368 },
      'covered court': { lat: 14.5025, lng: 121.0518 },
      'health center': { lat: 14.5058, lng: 121.0545 },
      'elementary school': { lat: 14.5032, lng: 121.0525 },
      'high school': { lat: 14.5065, lng: 121.0562 },
      'market': { lat: 14.5040, lng: 121.0528 },
      'church': { lat: 14.5055, lng: 121.0548 },
    };
    
    const centralSignalPhases = {
      'phase 1': { lat: 14.5155, lng: 121.0555 },
      'phase 2': { lat: 14.5172, lng: 121.0572 },
      'phase 3': { lat: 14.5188, lng: 121.0588 },
      'barangay hall': { lat: 14.5185, lng: 121.0580 },
      'covered court': { lat: 14.5165, lng: 121.0565 },
      'health center': { lat: 14.5192, lng: 121.0592 },
    };
    
    const phaseMap = adminRole === 'southadmin' ? southSignalPhases : centralSignalPhases;
    const lowerAddress = addressString.toLowerCase();
    
    for (const [key, coords] of Object.entries(phaseMap)) {
      if (lowerAddress.includes(key)) {
        return coords;
      }
    }
    
    // Return default for the assigned barangay
    if (adminRole === 'southadmin') return { lat: 14.50493, lng: 121.05368 };
    if (adminRole === 'centraladmin') return { lat: 14.5185, lng: 121.0580 };
    return { lat: 14.5117, lng: 121.0558 };
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');
    if (!token || !adminData) { 
      navigate('/admin/login'); 
      return;
    }
    try {
      const parsedAdmin = JSON.parse(adminData);
      setAdmin(parsedAdmin);
      setAdminRole(parsedAdmin.role);
      fetchAllData(parsedAdmin.role);
    } catch { 
      navigate('/admin/login'); 
    }
  }, [navigate]);

  const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('adminToken');
    const config = {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', ...options.headers },
      ...options,
    };
    const response = await fetch(`${API_URL}${url}`, config);
    const ct = response.headers.get('content-type');
    if (ct?.includes('text/html')) throw new Error('Server returned HTML instead of JSON.');
    if (!response.ok) {
      let msg = `HTTP ${response.status}`;
      try { const e = await response.json(); msg = e.message || msg; } catch {}
      throw new Error(msg);
    }
    return response.json();
  };

  // Helper to check if a user belongs to a specific barangay
  const isUserInBarangay = (user, role) => {
    if (!user) return false;
    if (role === 'southadmin') {
      return user.assignedBarangay === 'south_signal' || user.assignedBarangayLabel === 'South Signal, Taguig';
    }
    if (role === 'centraladmin') {
      return user.assignedBarangay === 'central_signal' || user.assignedBarangayLabel === 'Central Signal, Taguig';
    }
    return true; // Super admin sees all
  };

  // Helper to extract address string safely
  const getAddressString = (address) => {
    if (!address) return '';
    if (typeof address === 'string') return address;
    if (typeof address === 'object') {
      return address.address || address.location || address.name || '';
    }
    return '';
  };

  const fetchAllData = async (role) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('👤 Admin Role:', role);
      
      // The backend will automatically filter based on role
      const [wasteRes, messagesRes, feedbackRes, usersRes] = await Promise.allSettled([
        fetchWithAuth('/api/waste-reports'),
        fetchWithAuth('/api/messages'),
        fetchWithAuth('/api/feedback/all'),
        fetchWithAuth('/api/users/all-users'),
      ]);

      // Get all users
      const allUsers = usersRes.status === 'fulfilled' ? (usersRes.value || []) : [];
      
      // Filter users based on admin role (frontend extra safety)
      let filteredUsers = allUsers;
      if (role === 'southadmin') {
        filteredUsers = allUsers.filter(user => 
          user.assignedBarangay === 'south_signal' || 
          user.assignedBarangayLabel === 'South Signal, Taguig'
        );
      } else if (role === 'centraladmin') {
        filteredUsers = allUsers.filter(user => 
          user.assignedBarangay === 'central_signal' || 
          user.assignedBarangayLabel === 'Central Signal, Taguig'
        );
      }
      // admin (super admin) sees all users
      
      const barangayUserIds = new Set(filteredUsers.map(u => u._id));
      
      const usersMap = new Map();
      filteredUsers.forEach(user => {
        usersMap.set(user._id, user);
      });

      // Waste reports - backend already filters based on role
      let wasteReports = wasteRes.status === 'fulfilled' ? (wasteRes.value.reports || []) : [];
      
      // Extra frontend filter for safety
      if (role === 'southadmin') {
        wasteReports = wasteReports.filter(r => r.assignedBarangay === 'south_signal');
      } else if (role === 'centraladmin') {
        wasteReports = wasteReports.filter(r => r.assignedBarangay === 'central_signal');
      }
      // admin sees all

      // Filter messages
      let allMessages = messagesRes.status === 'fulfilled' ? (messagesRes.value.messages || []) : [];
      let messages = [];
      if (role === 'admin') {
        messages = allMessages;
      } else {
        messages = allMessages.filter(msg => {
          const userId = msg.user?._id || msg.user;
          return userId && barangayUserIds.has(userId);
        });
      }

      // Filter feedback
      let allFeedback = feedbackRes.status === 'fulfilled' ? (feedbackRes.value.feedback || feedbackRes.value || []) : [];
      let feedback = [];
      if (role === 'admin') {
        feedback = allFeedback;
      } else {
        feedback = allFeedback.filter(fb => {
          const userId = fb.user?._id || fb.user;
          return userId && barangayUserIds.has(userId);
        });
      }

      // Calculate statistics
      const totalReports = wasteReports.length;
      const pendingReports = wasteReports.filter(r => r.status === 'pending').length;
      const recycledReports = wasteReports.filter(r => r.status === 'recycled').length;
      const processedReports = wasteReports.filter(r => r.status === 'processed').length;
      const disposedReports = wasteReports.filter(r => r.status === 'disposed').length;
      const totalMessages = messages.length;
      const unreadMessages = messages.filter(m => !m.isRead).length;
      
      let totalWeight = 0;
      wasteReports.forEach(r => {
        totalWeight += r.weight || 0.1;
      });

      // Calculate weekly growth
      const now = new Date();
      const lastWeek = wasteReports.filter(r => {
        const date = new Date(r.scanDate || r.createdAt);
        const daysDiff = (now - date) / (1000 * 60 * 60 * 24);
        return daysDiff <= 7;
      }).length;
      const prevWeek = wasteReports.filter(r => {
        const date = new Date(r.scanDate || r.createdAt);
        const daysDiff = (now - date) / (1000 * 60 * 60 * 24);
        return daysDiff > 7 && daysDiff <= 14;
      }).length;
      const weeklyGrowth = prevWeek > 0 ? ((lastWeek - prevWeek) / prevWeek) * 100 : lastWeek > 0 ? 100 : 0;

      setDashboardStats({
        totalReports,
        pendingReports,
        recycledReports,
        processedReports,
        disposedReports,
        totalMessages,
        unreadMessages,
        weeklyGrowth,
        totalWeight,
      });

      // Classification breakdown
      const classification = {};
      wasteReports.forEach(r => {
        const type = r.classification || 'Unknown';
        classification[type] = (classification[type] || 0) + 1;
      });
      setClassificationData(classification);

      // Daily collection data
      const dailyCollection = {};
      const dailyTrendsArray = [];
      wasteReports.forEach(r => {
        const date = new Date(r.scanDate || r.createdAt);
        const dateKey = date.toISOString().split('T')[0];
        if (!dailyCollection[dateKey]) {
          dailyCollection[dateKey] = { date: dateKey, count: 0, weight: 0 };
        }
        dailyCollection[dateKey].count++;
        dailyCollection[dateKey].weight += r.weight || 0.1;
      });
      const sortedCollection = Object.values(dailyCollection).sort((a, b) => a.date.localeCompare(b.date)).slice(-30);
      setCollectionData(sortedCollection);
      
      // Prepare daily trends for line chart
      const last30Days = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        const dayData = dailyCollection[dateKey] || { date: dateKey, count: 0, weight: 0 };
        last30Days.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          count: dayData.count,
          weight: dayData.weight
        });
      }
      setDailyTrends(last30Days);

      // Monthly trends
      const monthlyData = {};
      wasteReports.forEach(r => {
        const date = new Date(r.scanDate || r.createdAt);
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        const monthName = date.toLocaleString('default', { month: 'short' });
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { month: monthName, count: 0, weight: 0, fullDate: date };
        }
        monthlyData[monthKey].count++;
        monthlyData[monthKey].weight += r.weight || 0.1;
      });
      setMonthlyTrends(monthlyData);

      // Response data
      const respondedFeedback = feedback.filter(f => f.adminReply).length;
      const responseRate = feedback.length > 0 ? Math.round((respondedFeedback / feedback.length) * 100) : 0;
      const repliedMessages = messages.filter(m => m.reply).length;
      
      setResponseData({
        totalFeedback: feedback.length,
        respondedFeedback,
        responseRate,
        totalMessages: messages.length,
        repliedMessages,
      });

      // History data
      const history = wasteReports.slice(-20).map(r => {
        const userId = r.user?._id || r.user;
        const user = usersMap.get(userId);
        const locationAddress = getAddressString(r.location) || getAddressString(user?.address) || 'Not specified';
        
        return {
          id: r._id,
          type: r.classification || 'Unknown',
          status: r.status || 'pending',
          date: new Date(r.scanDate || r.createdAt).toLocaleDateString(),
          weight: (r.weight || 0.1).toFixed(2),
          location: locationAddress,
        };
      });
      setHistoryData(history);

      // Location-based analytics
      const locationMap = new Map();
      
      for (const report of wasteReports) {
        const userId = report.user?._id || report.user;
        const user = usersMap.get(userId);
        
        // Safely get address string
        let address = getAddressString(report.location);
        if (!address) {
          address = getAddressString(user?.address);
        }
        
        if (address && address !== 'Not specified' && address !== '') {
          try {
            const coords = await geocodeAddress(address);
            const key = address.toLowerCase().trim();
            
            if (locationMap.has(key)) {
              const existing = locationMap.get(key);
              existing.count++;
              existing.totalWeight += report.weight || 0.1;
              existing.reports.push(report);
              existing.intensity = existing.totalWeight;
            } else {
              locationMap.set(key, {
                id: key,
                address: address,
                lat: coords.lat,
                lng: coords.lng,
                count: 1,
                totalWeight: report.weight || 0.1,
                reports: [report],
                intensity: report.weight || 0.1
              });
            }
          } catch (err) {
            console.error('Error geocoding address:', address, err);
          }
        }
      }
      
      const locations = Array.from(locationMap.values());
      const sortedLocations = [...locations].sort((a, b) => b.count - a.count);
      setTopLocations(sortedLocations);
      
      const heatmapLocations = locations.map(loc => ({
        ...loc,
        intensity: loc.totalWeight
      }));
      setMapLocations(heatmapLocations);
      
      const locationStats = {
        totalUniqueLocations: locations.length,
        mostActiveLocation: sortedLocations[0] || null,
        top5Locations: sortedLocations.slice(0, 5),
        averagePerLocation: locations.length > 0 ? (totalReports / locations.length).toFixed(1) : 0,
      };
      setLocationAnalytics(locationStats);

      console.log(`✅ Data Loaded for role: ${role}`, {
        totalReports,
        filteredUsers: filteredUsers.length,
        totalLocations: locations.length,
      });

    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError(`Failed to load data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin/login');
  };

  const handleProfileUpdate = async (profileForm) => {
    const token = localStorage.getItem('adminToken');
    if (!token) throw new Error('Authentication token not found.');
    let response, data;
    if (profileForm.profile) {
      const formData = new FormData();
      formData.append('profile', profileForm.profile);
      if (profileForm.email && profileForm.email !== admin.email) formData.append('email', profileForm.email);
      if (profileForm.password) formData.append('password', profileForm.password);
      response = await fetch(`${API_URL}/api/admin/profile`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
    } else {
      const updateData = {};
      if (profileForm.email && profileForm.email !== admin.email) updateData.email = profileForm.email;
      if (profileForm.password) updateData.password = profileForm.password;
      response = await fetch(`${API_URL}/api/admin/profile`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(updateData) });
    }
    data = await response.json();
    if (response.ok && data.admin) {
      setAdmin(data.admin);
      setAdminRole(data.admin.role);
      localStorage.setItem('adminData', JSON.stringify(data.admin));
    } else throw new Error(data.message || 'Failed to update profile');
  };

  const handleDeleteProfilePicture = async () => {
    await fetchWithAuth('/api/admin/profile/picture', { method: 'DELETE' });
    const adminData = await fetchWithAuth('/api/admin/profile');
    if (adminData.admin) { 
      setAdmin(adminData.admin); 
      setAdminRole(adminData.admin.role);
      localStorage.setItem('adminData', JSON.stringify(adminData.admin)); 
    }
  };

  // Chart configurations
  const classificationChartData = {
    labels: Object.keys(classificationData),
    datasets: [
      {
        label: 'Number of Reports',
        data: Object.values(classificationData),
        backgroundColor: [
          '#2563eb',
          '#3b82f6',
          '#60a5fa',
          '#93c5fd',
          '#bfdbfe',
          '#1e3a5f',
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const dailyTrendsChartData = {
    labels: dailyTrends.map(d => d.date),
    datasets: [
      {
        label: 'Number of Reports',
        data: dailyTrends.map(d => d.count),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#2563eb',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Weight (kg)',
        data: dailyTrends.map(d => d.weight),
        borderColor: '#dc2626',
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#dc2626',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: 'y1',
      },
    ],
  };

  const statusChartData = {
    labels: ['Recycled', 'Processed', 'Pending', 'Disposed'],
    datasets: [
      {
        data: [
          dashboardStats.recycledReports,
          dashboardStats.processedReports,
          dashboardStats.pendingReports,
          dashboardStats.disposedReports,
        ],
        backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const monthlyTrendsChartData = {
    labels: Object.values(monthlyTrends).map(m => m.month),
    datasets: [
      {
        label: 'Reports per Month',
        data: Object.values(monthlyTrends).map(m => m.count),
        backgroundColor: '#3b82f6',
        borderColor: '#2563eb',
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  const locationChartData = {
    labels: locationAnalytics.top5Locations?.map(loc => 
      loc.address && loc.address.length > 15 ? loc.address.substring(0, 15) + '...' : (loc.address || 'Unknown')
    ) || [],
    datasets: [
      {
        label: 'Number of Reports',
        data: locationAnalytics.top5Locations?.map(loc => loc.count) || [],
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 11,
            family: "'DM Sans', sans-serif",
          },
          usePointStyle: true,
          boxWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 12, family: "'DM Sans', sans-serif" },
        bodyFont: { size: 11, family: "'DM Sans', sans-serif" },
        padding: 8,
        cornerRadius: 6,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#e5e7eb',
          drawBorder: false,
        },
        ticks: {
          font: { size: 10 },
          color: '#6b7280',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 10 },
          color: '#6b7280',
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
  };

  const lineChartOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        title: {
          display: true,
          text: 'Number of Reports',
          font: { size: 10 },
          color: '#6b7280',
        },
      },
      y1: {
        position: 'right',
        beginAtZero: true,
        title: {
          display: true,
          text: 'Weight (kg)',
          font: { size: 10 },
          color: '#6b7280',
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          font: { size: 10 },
          color: '#6b7280',
        },
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { size: 11, family: "'DM Sans', sans-serif" },
          usePointStyle: true,
          boxWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.raw / total) * 100).toFixed(1);
            return `${context.label}: ${context.raw} (${percentage}%)`;
          },
        },
      },
    },
  };

  const statCards = [
    { 
      label: 'Total Reports', 
      value: dashboardStats.totalReports, 
      icon: ICONS.waste, 
      color: ACCENT.blue, 
      footer: `+${Math.round(dashboardStats.weeklyGrowth)}% this week`, 
      positive: true,
      navTo: 'waste'
    },
    { 
      label: 'Total Weight', 
      value: `${dashboardStats.totalWeight.toFixed(1)} kg`, 
      icon: ICONS.weight, 
      color: ACCENT.blueLight, 
      footer: `${dashboardStats.totalReports} items collected`, 
      positive: true,
      navTo: 'collection'
    },
    { 
      label: 'Recycled Rate', 
      value: `${dashboardStats.totalReports > 0 ? Math.round((dashboardStats.recycledReports / dashboardStats.totalReports) * 100) : 0}%`, 
      icon: ICONS.recycle, 
      color: ACCENT.blue, 
      footer: `${dashboardStats.recycledReports} items recycled`, 
      positive: true,
      navTo: 'analytics'
    },
    { 
      label: 'Active Locations', 
      value: locationAnalytics.totalUniqueLocations || 0, 
      icon: ICONS.location, 
      color: ACCENT.red, 
      footer: `${locationAnalytics.top5Locations?.length || 0} top areas`, 
      positive: true,
      navTo: 'map'
    },
  ];

  // Dynamic nav items based on role
  const getNavItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: ICONS.dashboard, section: 'Overview' },
      { id: 'analytics', label: 'Analytics', icon: ICONS.analytics, section: 'Insights' },
      { id: 'collection', label: 'Collection', icon: ICONS.collection, section: 'Operations' },
      { id: 'response', label: 'Response', icon: ICONS.response, section: 'Operations' },
      { id: 'map', label: 'Heat Map', icon: ICONS.map, section: 'Operations' },
      { id: 'history', label: 'History', icon: ICONS.history, section: 'Records' },
    ];
    
    // Super admin sees all sections, others see only their barangay reports
    if (adminRole === 'admin') {
      baseItems.push(
        { id: 'waste', label: 'Waste Reports', icon: ICONS.waste, section: 'Management' },
        { id: 'messages', label: 'Messages', icon: ICONS.messages, section: 'Management' },
        { id: 'profile', label: 'Admin Profile', icon: ICONS.profile, section: 'Account' }
      );
    } else {
      baseItems.push(
        { id: 'waste', label: `${getBarangayName()} Reports`, icon: ICONS.waste, section: 'Management' },
        { id: 'messages', label: 'Messages', icon: ICONS.messages, section: 'Management' },
        { id: 'profile', label: 'Admin Profile', icon: ICONS.profile, section: 'Account' }
      );
    }
    
    return baseItems;
  };

  const navItems = getNavItems();
  const sections = ['Overview', 'Insights', 'Operations', 'Records', 'Management', 'Account'];

  const renderDashboard = () => (
    <>
      <SectionHeading>System Overview - {getBarangayName()}</SectionHeading>
      <div style={S.statsGrid}>
        {statCards.map((card, i) => (
          <div 
            key={i} 
            style={S.statCard}
            onClick={() => card.navTo && setActiveSection(card.navTo)}
          >
            <div style={S.statCardAccent(card.color)} />
            <div style={S.statIconBox(card.color)}>
              <Icon d={card.icon} size={18} color={card.color} strokeWidth={2} />
            </div>
            <div style={S.statLabel}>{card.label}</div>
            <div style={S.statValue}>{card.value}</div>
            <div style={S.statBadge(card.positive)}>{card.footer}</div>
          </div>
        ))}
      </div>

      <SectionHeading>Daily Collection Trends</SectionHeading>
      <div style={S.analyticsCard}>
        <div style={S.chartContainer}>
          {dailyTrends.length > 0 ? (
            <Line data={dailyTrendsChartData} options={lineChartOptions} />
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
              No daily trend data available
            </div>
          )}
        </div>
      </div>

      <SectionHeading>Top Collection Areas</SectionHeading>
      <div style={S.analyticsGrid}>
        <div style={S.analyticsCard}>
          <p style={S.analyticsCardTitle}>
            <span style={S.titleDot(ACCENT.red)} /> Most Active Locations
          </p>
          {locationAnalytics.top5Locations && locationAnalytics.top5Locations.length > 0 ? (
            <div style={S.chartContainer}>
              <Bar data={locationChartData} options={chartOptions} />
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 20, color: '#6b7280' }}>
              No location data available
            </div>
          )}
        </div>

        <div style={S.analyticsCard}>
          <p style={S.analyticsCardTitle}>
            <span style={S.titleDot(ACCENT.blue)} /> Waste Classification
          </p>
          {Object.keys(classificationData).length > 0 ? (
            <div style={S.chartContainer}>
              <Pie data={classificationChartData} options={pieChartOptions} />
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 20, color: '#6b7280' }}>No classification data available</div>
          )}
        </div>
      </div>
    </>
  );

  const renderAnalytics = () => (
    <>
      <SectionHeading>Detailed Analytics - {getBarangayName()}</SectionHeading>
      
      {/* Add PDF Download Button Component */}
      <Analytics adminRole={adminRole} barangayName={getBarangayName()} />
      
      {/* Rest of your existing analytics content */}
      <div style={S.analyticsGrid}>
        <div style={S.analyticsCard}>
          <p style={S.analyticsCardTitle}>
            <span style={S.titleDot(ACCENT.red)} /> Location-Based Analytics
          </p>
          {locationAnalytics.mostActiveLocation ? (
            <div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1e3a5f' }}>
                  <Icon d={ICONS.location} size={14} color={ACCENT.red} strokeWidth={2} style={{ display: 'inline', marginRight: 6 }} />
                  Most Active Area
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: ACCENT.red, marginTop: 8 }}>
                  {locationAnalytics.mostActiveLocation.address || 'Unknown'}
                </div>
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
                  {locationAnalytics.mostActiveLocation.count} reports · {locationAnalytics.mostActiveLocation.totalWeight.toFixed(1)} kg total
                </div>
              </div>
              
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1e3a5f', marginBottom: 12 }}>
                  <Icon d={ICONS.trophy} size={14} color={ACCENT.red} strokeWidth={2} style={{ display: 'inline', marginRight: 6 }} />
                  Top 5 Areas Ranking
                </div>
                <div style={S.chartContainer}>
                  <Bar data={locationChartData} options={chartOptions} />
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1e3a5f', marginBottom: 8 }}>
                  <Icon d={ICONS.analytics} size={14} color={ACCENT.blue} strokeWidth={2} style={{ display: 'inline', marginRight: 6 }} />
                  Insights
                </div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>
                  • Average {locationAnalytics.averagePerLocation} reports per location<br/>
                  • Top area has {Math.round((locationAnalytics.mostActiveLocation.count / dashboardStats.totalReports) * 100)}% of all reports<br/>
                  • {locationAnalytics.totalUniqueLocations} unique collection points
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 20, color: '#6b7280' }}>
              No location analytics available
            </div>
          )}
        </div>

        <div style={S.analyticsCard}>
          <p style={S.analyticsCardTitle}>
            <span style={S.titleDot(ACCENT.blue)} /> Waste Classification Breakdown
          </p>
          {Object.keys(classificationData).length > 0 ? (
            <div style={S.chartContainer}>
              <Doughnut data={classificationChartData} options={pieChartOptions} />
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 20, color: '#6b7280' }}>No classification data available</div>
          )}
        </div>

        <div style={S.analyticsCard}>
          <p style={S.analyticsCardTitle}>
            <span style={S.titleDot(ACCENT.blueLight)} /> Monthly Trends
          </p>
          {Object.keys(monthlyTrends).length > 0 ? (
            <div style={S.chartContainer}>
              <Bar data={monthlyTrendsChartData} options={chartOptions} />
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 20, color: '#6b7280' }}>No monthly trend data available</div>
          )}
        </div>

        <div style={S.analyticsCard}>
          <p style={S.analyticsCardTitle}>
            <span style={S.titleDot(ACCENT.red)} /> Status Distribution
          </p>
          <div style={S.chartContainer}>
            <Pie data={statusChartData} options={pieChartOptions} />
          </div>
          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: ACCENT.blue }}>
              {dashboardStats.totalWeight.toFixed(1)} kg
            </div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Total Waste Collected</div>
          </div>
        </div>
      </div>
    </>
  );

  const renderCollection = () => (
    <>
      <SectionHeading>Collection Records - {getBarangayName()}</SectionHeading>
      <div style={S.collectionTable}>
        <div style={S.tableHeader}>
          <span>Date</span>
          <span>Items Collected</span>
          <span>Total Weight</span>
          <span>Status</span>
        </div>
        {collectionData.length > 0 ? collectionData.map((item, idx) => (
          <div key={idx} style={S.tableRow}>
            <span>{item.date}</span>
            <span>{item.count}</span>
            <span>{item.weight.toFixed(2)} kg</span>
            <span><span style={S.statusBadge('completed')}>Completed</span></span>
          </div>
        )) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            No collection data available
          </div>
        )}
      </div>
    </>
  );

  const renderResponse = () => (
    <>
      <SectionHeading>Response Management - {getBarangayName()}</SectionHeading>
      <div style={S.analyticsGrid}>
        <div style={S.analyticsCard}>
          <p style={S.analyticsCardTitle}>
            <span style={S.titleDot(ACCENT.blue)} /> Feedback Response Rate
          </p>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: 48, fontWeight: 800, color: ACCENT.blue }}>
              {responseData.responseRate}%
            </div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 8 }}>
              {responseData.respondedFeedback} out of {responseData.totalFeedback} feedback responses
            </div>
          </div>
        </div>

        <div style={S.analyticsCard}>
          <p style={S.analyticsCardTitle}>
            <span style={S.titleDot(ACCENT.red)} /> Message Statistics
          </p>
          <div style={S.miniGrid}>
            <div style={S.miniCard}>
              <div style={S.miniValue}>{responseData.totalMessages}</div>
              <div style={S.miniLabel}>Total Messages</div>
            </div>
            <div style={S.miniCard}>
              <div style={S.miniValue}>{responseData.repliedMessages}</div>
              <div style={S.miniLabel}>Replied</div>
            </div>
            <div style={S.miniCard}>
              <div style={S.miniValue}>{dashboardStats.unreadMessages}</div>
              <div style={S.miniLabel}>Unread</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderMap = () => (
    <>
      <SectionHeading>Waste Collection Heat Map - {getBarangayName()}</SectionHeading>
      <div style={S.mapContainer}>
        <div style={S.mapControls}>
          <button style={S.mapControlBtn}>
            <Icon d={ICONS.weight} size={12} color={ACCENT.blue} strokeWidth={2} style={{ display: 'inline', marginRight: 4 }} />
            Heat by Weight
          </button>
        </div>
        <div style={S.mapLegend}>
          <div style={S.mapLegendTitle}>Collection Intensity</div>
          <div style={S.legendGradient} />
          <div style={S.legendLabels}>
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
          </div>
        </div>
        <div style={S.locationRanking}>
          <div style={S.locationRankingTitle}>
            <Icon d={ICONS.trophy} size={12} color={ACCENT.red} strokeWidth={2} style={{ display: 'inline', marginRight: 4 }} />
            Top Collection Areas
          </div>
          {topLocations.slice(0, 5).map((loc, idx) => (
            <div key={idx} style={S.rankingItem}>
              <span style={S.rankingName}>{idx + 1}. {loc.address && loc.address.length > 25 ? loc.address.substring(0, 25) + '...' : (loc.address || 'Unknown')}</span>
              <span style={S.rankingCount}>{loc.count} reports</span>
            </div>
          ))}
        </div>
        <div style={S.mapInfo}>
          <Icon d={ICONS.location} size={10} color={ACCENT.gray} strokeWidth={2} style={{ display: 'inline', marginRight: 4 }} />
          {mapLocations.length} active collection points | {getBarangayName()}
        </div>
        <WasteHeatmap 
          locations={mapLocations}
          topLocations={topLocations}
          adminRole={adminRole}
          onLocationClick={(loc) => {
            console.log('Selected location:', loc);
          }}
        />
      </div>
    </>
  );

  const renderHistory = () => (
    <>
      <SectionHeading>Waste Collection History - {getBarangayName()}</SectionHeading>
      {historyData.length > 0 ? historyData.map((item) => (
        <div key={item.id} style={S.historyItem}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontWeight: 600, color: '#1e3a5f' }}>{item.type}</span>
            <span style={S.statusBadge(item.status)}>{item.status}</span>
          </div>
          <div style={S.historyRow}>
            <span>
              <Icon d={ICONS.calendar} size={10} color={ACCENT.gray} strokeWidth={2} style={{ display: 'inline', marginRight: 4 }} />
              {item.date}
            </span>
            <span>
              <Icon d={ICONS.weight} size={10} color={ACCENT.gray} strokeWidth={2} style={{ display: 'inline', marginRight: 4 }} />
              {item.weight} kg
            </span>
            <span>
              <Icon d={ICONS.location} size={10} color={ACCENT.gray} strokeWidth={2} style={{ display: 'inline', marginRight: 4 }} />
              {item.location}
            </span>
          </div>
        </div>
      )) : (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          No history data available
        </div>
      )}
    </>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard': return renderDashboard();
      case 'analytics': return renderAnalytics();
      case 'collection': return renderCollection();
      case 'response': return renderResponse();
      case 'map': return renderMap();
      case 'history': return renderHistory();
      case 'waste': return <WasteManagement barangayFilter={adminRole === 'southadmin' ? 'south_signal' : adminRole === 'centraladmin' ? 'central_signal' : null} />;
      case 'messages': return <Message barangayFilter={adminRole === 'southadmin' ? 'south_signal' : adminRole === 'centraladmin' ? 'central_signal' : null} />;
      case 'profile': return <AdminProfiles admin={admin} onProfileUpdate={handleProfileUpdate} onDeleteProfilePicture={handleDeleteProfilePicture} />;
      default: return renderDashboard();
    }
  };

  const sectionTitles = {
    dashboard: { title: `${getBarangayName()} Dashboard`, sub: `Welcome back, ${admin?.email?.split('@')[0] || 'Admin'}` },
    analytics: { title: 'Location & Waste Analytics', sub: 'See which areas have the most waste collection activity' },
    collection: { title: 'Collection Records', sub: 'Daily waste collection tracking' },
    response: { title: 'Response Management', sub: 'Track feedback and message responses' },
    map: { title: 'Waste Collection Heat Map', sub: 'Real heatmap based on user addresses - Red areas have highest collection activity' },
    history: { title: 'History', sub: 'Complete waste collection history' },
    waste: { title: `${getBarangayName()} Reports`, sub: 'Manage and classify waste detection reports' },
    messages: { title: 'Messages', sub: 'Internal communications' },
    profile: { title: 'Admin Profile', sub: 'Manage your account details' },
  };

  if (loading) {
    return (
      <div style={S.loadWrap}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={S.spinner} />
        <p style={S.loadText}>Loading {getBarangayName()} Admin Panel...</p>
      </div>
    );
  }

  return (
    <div style={S.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(30,58,95,0.15); border-radius: 4px; }
        .leaflet-container {
          z-index: 1;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 10px;
        }
        .leaflet-control-fullscreen {
          background: white;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
        }
        .leaflet-control-fullscreen a {
          color: #1e3a5f;
        }
      `}</style>

      <aside style={S.sidebar}>
        <div style={S.sidebarHeader}>
          <div style={S.logoWrap}>
            <div style={S.logoMark}>
              <Icon d={ICONS.village} size={20} color="#3b82f6" strokeWidth={2.2} />
            </div>
            <div>
              <div style={S.logoTitle}>{getBarangayName()}</div>
              <div style={S.logoSub}>Waste Management System</div>
            </div>
          </div>
        </div>

        <nav style={S.nav}>
          {sections.map(sec => {
            const items = navItems.filter(n => n.section === sec);
            if (!items.length) return null;
            return (
              <div key={sec} style={S.navSection}>
                <div style={S.navSectionLabel}>{sec}</div>
                {items.map(item => (
                  <div
                    key={item.id}
                    style={S.navItem(activeSection === item.id)}
                    onClick={() => setActiveSection(item.id)}
                  >
                    <Icon
                      d={item.icon}
                      size={15}
                      color={activeSection === item.id ? '#ef4444' : 'rgba(255,255,255,0.45)'}
                      strokeWidth={activeSection === item.id ? 2.2 : 1.8}
                    />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </nav>

        <div style={S.sidebarFooter}>
          <div style={S.adminMini} onClick={() => setActiveSection('profile')}>
            <div style={S.avatar}>
              {admin?.profile
                ? <img src={admin.profile} alt="Admin" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span>{admin?.email?.charAt(0).toUpperCase()}</span>
              }
            </div>
            <div>
              <div style={S.adminName}>{admin?.email?.split('@')[0] || 'Admin'}</div>
              <div style={S.adminRole}>
                {adminRole === 'southadmin' ? 'South Signal Administrator' : 
                 adminRole === 'centraladmin' ? 'Central Signal Administrator' : 
                 'Super Administrator'}
              </div>
            </div>
          </div>
          <button style={S.logoutBtn} onClick={() => setShowLogoutConfirm(true)}>
            <Icon d={ICONS.logout} size={15} color="currentColor" strokeWidth={2} />
            Sign Out
          </button>
        </div>
      </aside>

      <main style={S.main}>
        <div style={S.topbar}>
          <div>
            <h1 style={S.pageTitle}>{sectionTitles[activeSection]?.title}</h1>
            <p style={S.pageSub}>{sectionTitles[activeSection]?.sub}</p>
          </div>
          <div style={S.dateChip}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {error && (
          <div style={S.errorBar}>
            <Icon d={ICONS.alert} size={16} color="#dc2626" strokeWidth={2} />
            <span>{error}</span>
            <button style={S.errClose} onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div style={S.content}>
          {renderSection()}
        </div>
      </main>

      {showLogoutConfirm && (
        <div style={S.overlay} onClick={() => setShowLogoutConfirm(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <h3 style={S.modalTitle}>Confirm Sign Out</h3>
            <p style={S.modalDesc}>
              Are you sure you want to sign out from {getBarangayName()} Waste Management System?
            </p>
            <div style={S.modalActions}>
              <button style={S.btnSecondary} onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
              <button style={S.btnDanger} onClick={handleLogout}>Sign Out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;