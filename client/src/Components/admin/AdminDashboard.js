import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, Pie, Line, Doughnut, Radar, PolarArea } from 'react-chartjs-2';
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
  RadialLinearScale,
} from 'chart.js';
import API_URL from '../Utils/Api';
import WasteManagement from './WasteManagement';
import Message from './Message';
import AdminProfiles from './AdminProfiles';
import Analytics from './Analytics';
import UserManagement from './UserManagement';
import Post from './Post';
import Collection from './Collection';
import History from './History';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import 'leaflet-fullscreen/dist/Leaflet.fullscreen.js';
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
  ArcElement, PointElement, LineElement, Filler, RadialLinearScale
);

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ==================== SCIENTIFIC CO2 EMISSION FACTORS (IPCC/EPA BASED) ====================
const SCIENTIFIC_CO2_FACTORS = {
  landfill: {
    plastic: 1.5, paper: 0.9, glass: 0.02, metal: 0.05,
    aluminum: 0.05, organic: 1.2, electronic: 0.8, textile: 0.7, cardboard: 0.5,
    default: 0.5,
  },
  recycling: {
    plastic: -1.2, paper: -1.1, glass: -0.3, metal: -4.0,
    aluminum: -8.0, organic: -0.2, electronic: -2.5, textile: -1.5, cardboard: -1.0,
    default: -1.0,
  },
  incineration: {
    plastic: 2.8, paper: 1.5, glass: 0.1, metal: 0.1,
    aluminum: 0.1, organic: 0.5, electronic: 1.8, textile: 2.0, cardboard: 1.3,
    default: 1.0,
  },
  processing: {
    plastic: 0.3, paper: 0.2, glass: 0.1, metal: 0.2,
    aluminum: 0.2, organic: 0.1, electronic: 0.4, textile: 0.3, cardboard: 0.2,
    default: 0.2,
  },
  transportation: 0.0002,
};

const VIRGIN_EMISSIONS = {
  plastic: 2.5, paper: 1.5, glass: 0.8, metal: 6.0,
  aluminum: 12.0, electronic: 3.5, textile: 2.0, cardboard: 1.2, default: 1.5,
};

const RECYCLED_EMISSIONS = {
  plastic: 1.0, paper: 0.6, glass: 0.3, metal: 1.5,
  aluminum: 2.0, electronic: 1.0, textile: 0.8, cardboard: 0.5, default: 0.6,
};

// ==================== WEIGHT CALCULATION FUNCTIONS ====================
const calculateItemWeight = (classification, detectedObjectLabel) => {
  const weights = {
    plastic: { default: 0.04, bottle: 0.05, bag: 0.01, container: 0.08, cup: 0.03, straw: 0.002 },
    paper: { default: 0.08, bag: 0.05, cup: 0.01, newspaper: 0.10, magazine: 0.15 },
    glass: { default: 0.25, bottle: 0.30, jar: 0.25, cup: 0.20 },
    metal: { default: 0.02, can: 0.015, tin: 0.015, lid: 0.01 },
    aluminum: { default: 0.015, can: 0.015, foil: 0.005 },
    organic: { default: 0.25, food: 0.25, fruit: 0.10, vegetable: 0.20, yard: 0.50 },
    electronic: { default: 0.50, phone: 0.18, laptop: 2.00, tablet: 0.50, battery: 0.15 },
    textile: { default: 0.25, shirt: 0.20, pants: 0.40, jeans: 0.50, jacket: 0.60 },
    cardboard: { default: 0.25, box: 0.50, sheet: 0.15, carton: 0.10 },
  };
  
  const classKey = (classification || '').toLowerCase().trim();
  const rawLabel = (detectedObjectLabel || '').toLowerCase().trim();
  const category = weights[classKey] || { default: 0.10 };
  
  for (const [keyword, weight] of Object.entries(category)) {
    if (rawLabel.includes(keyword)) return weight;
  }
  return category.default || 0.10;
};

const calculateTotalWeight = (report) => {
  const quantity = (report.detectedObjects && report.detectedObjects.length > 0)
    ? report.detectedObjects.length
    : 1;
  const classKey = (report.classification || '').toLowerCase().trim();
  const rawLabel = (report.detectedObjects?.[0]?.label || '').toLowerCase().trim();
  const unitWeight = calculateItemWeight(classKey, rawLabel);
  return unitWeight * quantity;
};

const calculateMethaneEmissions = (organicWeight) => {
  const methanePotential = 0.2;
  const methaneDensity = 0.717;
  const methaneGWP = 25;
  const methaneMass = organicWeight * methanePotential * methaneDensity;
  return methaneMass * methaneGWP;
};

const calculateRecyclingSavings = (wasteType, weight) => {
  const virgin = VIRGIN_EMISSIONS[wasteType] || VIRGIN_EMISSIONS.default;
  const recycled = RECYCLED_EMISSIONS[wasteType] || RECYCLED_EMISSIONS.default;
  return (virgin - recycled) * weight;
};

const calculateCO2Emission = (report, weight) => {
  const wasteType = (report.classification || '').toLowerCase();
  const status = report.status || 'pending';
  const distance = 10;
  
  let baseEmission = 0;
  
  switch (status) {
    case 'recycled':
      baseEmission = (SCIENTIFIC_CO2_FACTORS.recycling[wasteType] || SCIENTIFIC_CO2_FACTORS.recycling.default) * weight;
      break;
    case 'processed':
      baseEmission = (SCIENTIFIC_CO2_FACTORS.processing[wasteType] || SCIENTIFIC_CO2_FACTORS.processing.default) * weight;
      break;
    case 'incinerated':
      baseEmission = (SCIENTIFIC_CO2_FACTORS.incineration[wasteType] || SCIENTIFIC_CO2_FACTORS.incineration.default) * weight;
      break;
    default:
      baseEmission = (SCIENTIFIC_CO2_FACTORS.landfill[wasteType] || SCIENTIFIC_CO2_FACTORS.landfill.default) * weight;
      break;
  }
  
  let transportEmission = 0;
  if (status !== 'recycled' && status !== 'processed') {
    transportEmission = weight * distance * SCIENTIFIC_CO2_FACTORS.transportation;
  }
  
  return baseEmission + transportEmission;
};

// ==================== THEME CONSTANTS ====================
const C = {
  navyDark:  '#1B2B4B',
  navyMid:   '#2C4070',
  accent:    '#4FC3F7',
  success:   '#4CAF50',
  warning:   '#FF9800',
  danger:    '#F44336',
  deepDark:  '#0F1E38',
  bodyGray:  '#546E7A',
  mutedGray: '#90A4AE',
  pageBg:    '#F0F4F8',
  white:     '#FFFFFF',
};

const getCatBadgeStyle = (category) => {
  const map = {
    announcement: { bg: '#E8F0FE', color: '#1877F2' },
    event:        { bg: '#F3E8FD', color: '#8B5CF6' },
    cleanup_drive:{ bg: '#E8F5E9', color: '#059669' },
    advisory:     { bg: '#FFF3E0', color: '#D97706' },
    recycling_tip:{ bg: '#E8F5E9', color: '#047857' },
    news:         { bg: '#EEF2FF', color: '#4F46E5' },
    alert:        { bg: '#FDEBEB', color: '#DC2626' },
    general:      { bg: '#F1F5F9', color: '#64748B' },
  };
  const s = map[category] || map.general;
  return {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    fontSize: 10, fontWeight: 700,
    background: s.bg, color: s.color,
    padding: '2px 7px', borderRadius: 20,
  };
};

const getAdminDisplayName = (post) => {
  if (post.adminName) return post.adminName;
  if (post.admin?.fullName) return post.admin.fullName;
  if (post.admin?.username) return post.admin.username;
  return 'Admin';
};

const getAdminRoleFromPost = (post) => {
  if (post.adminRole) return post.adminRole;
  if (post.admin?.role) return post.admin.role;
  return 'admin';
};

const getAdminTypeLabel = (role) => {
  if (role === 'southadmin')   return 'South Signal';
  if (role === 'centraladmin') return 'Central Bicutan';
  if (role === 'superadmin')   return 'Super Admin';
  return 'Admin';
};

const getAdminBadgeStyle = (role) => {
  const map = {
    southadmin:   { bg: '#DBEAFE', color: '#1D4ED8', icon: 'mapPin' },
    centraladmin: { bg: '#D1FAE5', color: '#047857', icon: 'building' },
    superadmin:   { bg: '#FEF3C7', color: '#92400E', icon: 'shield' },
    admin:        { bg: '#EDE9FE', color: '#7C3AED', icon: 'user' },
  };
  return map[role] || map.admin;
};

// ==================== STYLES ====================
const S = {
  root: {
    display: 'flex', minHeight: '100vh',
    background: C.pageBg,
    fontFamily: "'Inter', 'DM Sans', 'Segoe UI', sans-serif",
    color: C.navyDark,
  },
  sidebar: {
    width: 252, minHeight: '100vh',
    background: C.deepDark,
    display: 'flex', flexDirection: 'column',
    position: 'fixed', top: 0, left: 0, bottom: 0,
    zIndex: 100,
    boxShadow: '4px 0 32px rgba(15,30,56,0.28)',
  },
  sidebarHeader: {
    padding: '22px 18px 18px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  logoWrap: { display: 'flex', alignItems: 'center', gap: 11 },
  logoImg: {
    width: 38, height: 38, objectFit: 'contain', borderRadius: 8,
    background: 'rgba(255,255,255,0.06)', padding: 4,
    border: '1px solid rgba(79,195,247,0.18)', flexShrink: 0,
  },
  logoTitle: {
    fontSize: 13, fontWeight: 700, color: C.white,
    letterSpacing: '0.06em', lineHeight: 1.2, textTransform: 'uppercase',
  },
  logoSub: {
    fontSize: 9, color: C.accent, marginTop: 3,
    letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.85,
  },
  nav: { flex: 1, padding: '14px 10px', overflowY: 'auto' },
  navSection: { marginBottom: 20 },
  navSectionLabel: {
    fontSize: 9.5, fontWeight: 700, letterSpacing: '0.14em',
    textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)',
    padding: '0 10px', marginBottom: 4,
  },
  navItem: (active) => ({
    display: 'flex', alignItems: 'center', gap: 9,
    padding: '8px 10px', borderRadius: 7, cursor: 'pointer',
    fontSize: 12.5, fontWeight: active ? 600 : 400,
    color: active ? C.white : 'rgba(255,255,255,0.45)',
    background: active ? 'rgba(79,195,247,0.12)' : 'transparent',
    borderLeft: active ? `2px solid ${C.accent}` : '2px solid transparent',
    transition: 'all 0.15s ease',
    marginBottom: 1, userSelect: 'none',
  }),
  sidebarFooter: {
    padding: '12px 10px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
  adminMini: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 10px', borderRadius: 8, marginBottom: 8,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.06)',
    cursor: 'pointer', transition: 'background 0.15s',
  },
  avatar: {
    width: 34, height: 34, borderRadius: 8,
    background: 'rgba(79,195,247,0.14)',
    border: '1px solid rgba(79,195,247,0.25)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 600, color: C.accent,
    flexShrink: 0, overflow: 'hidden', letterSpacing: '0.02em',
  },
  adminName: { fontSize: 12.5, fontWeight: 600, color: C.white },
  adminRole: { fontSize: 10, color: 'rgba(255,255,255,0.32)', marginTop: 2 },
  logoutBtn: {
    width: '100%', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: 7, padding: '8px 10px',
    borderRadius: 7, border: '1px solid rgba(244,67,54,0.3)',
    background: 'rgba(244,67,54,0.07)', color: '#ff5c5e',
    fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
    transition: 'all 0.15s ease', fontFamily: "'Inter', 'DM Sans', sans-serif",
    letterSpacing: '0.05em', textTransform: 'uppercase',
  },
  main: { marginLeft: 252, flex: 1, minHeight: '100vh', background: C.pageBg },
  topbar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 28px', borderBottom: '1px solid rgba(27,43,75,0.08)',
    background: C.white, position: 'sticky', top: 0, zIndex: 50,
    boxShadow: '0 1px 8px rgba(27,43,75,0.06)',
  },
  pageTitle: {
    fontSize: 18, fontWeight: 700, color: C.navyDark,
    margin: 0, letterSpacing: '-0.01em', lineHeight: 1.25,
  },
  pageSub: { fontSize: 12, color: C.bodyGray, margin: '3px 0 0' },
  dateChip: {
    fontSize: 12, color: C.bodyGray, background: C.pageBg,
    border: '1px solid rgba(27,43,75,0.1)', borderRadius: 7,
    padding: '6px 13px', fontWeight: 500,
    display: 'flex', alignItems: 'center', gap: 6,
  },
  content: { padding: '24px 28px' },
  sectionTitle: {
    fontSize: 10.5, fontWeight: 700, letterSpacing: '0.11em',
    textTransform: 'uppercase', color: C.mutedGray,
    marginBottom: 14, marginTop: 0,
    display: 'flex', alignItems: 'center', gap: 8,
  },
  sectionLine: { flex: 1, height: 1, background: 'rgba(27,43,75,0.08)' },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 14, marginBottom: 24,
  },
  statCard: {
    background: C.white,
    border: '1px solid rgba(27,43,75,0.07)',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    transition: 'box-shadow 0.2s, transform 0.18s',
    cursor: 'pointer',
    boxShadow: '0 1px 4px rgba(27,43,75,0.04)',
    display: 'flex',
    flexDirection: 'column',
  },
  statCardAccent: (color) => ({
    height: 3,
    width: '100%',
    background: color,
    flexShrink: 0,
  }),
  statCardBody: {
    padding: '14px 16px 0',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  statCardTop: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statIconBox: (color) => ({
    width: 36, height: 36, borderRadius: 9,
    background: color + '18',
    border: '1px solid ' + color + '30',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  }),
  statTrendBadge: (positive) => ({
    display: 'inline-flex', alignItems: 'center', gap: 3,
    fontSize: 10.5, fontWeight: 700,
    color: positive ? C.success : C.danger,
    background: positive ? 'rgba(76,175,80,0.12)' : 'rgba(244,67,54,0.12)',
    padding: '3px 8px', borderRadius: 20,
  }),
  statLabel: {
    fontSize: 10, color: C.bodyGray, fontWeight: 600,
    marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.07em',
  },
  statValue: {
    fontSize: 24, fontWeight: 800, color: C.navyDark,
    lineHeight: 1, letterSpacing: '-0.02em',
  },
  statSub: {
    fontSize: 10.5, color: C.mutedGray, marginTop: 4, marginBottom: 0,
  },
  sparklineWrap: {
    height: 56,
    marginTop: 10,
    overflow: 'hidden',
  },
  dashboardColumns: {
    display: 'grid',
    gridTemplateColumns: '1fr 360px',
    gap: 16, alignItems: 'start',
  },
  chartsPanel: { display: 'flex', flexDirection: 'column', gap: 16 },
  chartCard: {
    background: C.white, border: '1px solid rgba(27,43,75,0.07)',
    borderRadius: 12, padding: '18px 20px',
    boxShadow: '0 1px 4px rgba(27,43,75,0.04)',
  },
  chartCardTitle: {
    fontSize: 13, fontWeight: 700, color: C.navyDark,
    marginBottom: 14, marginTop: 0,
    display: 'flex', alignItems: 'center', gap: 8,
  },
  chartDot: (color) => ({
    width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0,
  }),
  chartRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  chartContainer: { height: 220, marginTop: 4 },
  feedPanel: {
    display: 'flex', flexDirection: 'column',
    background: C.white, border: '1px solid rgba(27,43,75,0.07)',
    borderRadius: 12, overflow: 'hidden',
    position: 'sticky', top: 82,
    maxHeight: 'calc(100vh - 100px)',
    boxShadow: '0 1px 4px rgba(27,43,75,0.04)',
  },
  feedStickyHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 16px 10px',
    borderBottom: '1px solid rgba(27,43,75,0.07)',
    background: C.white, position: 'sticky', top: 0, zIndex: 10, flexShrink: 0,
  },
  feedScrollArea: { overflowY: 'auto', flex: 1, padding: '10px' },
  feedTitle: {
    fontSize: 14, fontWeight: 700, color: C.navyDark, margin: 0,
    display: 'flex', alignItems: 'center', gap: 6,
  },
  viewAllLink: {
    color: C.accent, fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '4px 10px', borderRadius: 6,
    background: 'rgba(79,195,247,0.08)', border: '1px solid rgba(79,195,247,0.2)',
    transition: 'all 0.15s', textDecoration: 'none',
  },
  postCard: {
    background: C.white, border: '1px solid rgba(27,43,75,0.07)',
    borderRadius: 12, marginBottom: 10, overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(27,43,75,0.04)', transition: 'box-shadow 0.15s',
  },
  postCardHeader: {
    display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px 8px',
  },
  postAvatar: {
    width: 40, height: 40, borderRadius: '50%',
    background: C.navyMid,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 700, color: C.white,
    flexShrink: 0, overflow: 'hidden',
  },
  postAuthorName: { fontSize: 13, fontWeight: 700, color: C.navyDark, margin: 0 },
  postAuthorMeta: { display: 'flex', alignItems: 'center', gap: 4, marginTop: 3, flexWrap: 'wrap' },
  postBody: { padding: '0 14px 10px' },
  postTitle: { fontSize: 13, fontWeight: 700, color: C.navyDark, margin: '0 0 4px' },
  postExcerpt: { fontSize: 12, color: C.bodyGray, lineHeight: 1.6, margin: 0 },
  seeMore: {
    color: C.accent, cursor: 'pointer', fontSize: 12,
    fontWeight: 600, marginTop: 3, display: 'inline-block',
  },
  postImage: { width: '100%', display: 'block', maxHeight: 200, objectFit: 'cover' },
  postFooter: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '7px 14px', borderTop: '1px solid rgba(27,43,75,0.05)',
    fontSize: 11, color: C.mutedGray,
  },
  postStat: { display: 'flex', alignItems: 'center', gap: 3 },
  postActions: { display: 'flex', borderTop: '1px solid rgba(27,43,75,0.05)' },
  postActionBtn: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 5, padding: '8px 0', fontSize: 11.5, fontWeight: 600, color: C.bodyGray,
    cursor: 'pointer', background: 'none', border: 'none',
    borderRight: '1px solid rgba(27,43,75,0.05)',
    fontFamily: "'Inter', 'DM Sans', sans-serif", transition: 'background 0.15s',
  },
  feedEmpty: {
    background: C.white, border: '1px solid rgba(27,43,75,0.07)',
    borderRadius: 10, textAlign: 'center', padding: '36px 20px', color: C.mutedGray,
  },
  postModal: {
    position: 'fixed', inset: 0, background: 'rgba(15,30,56,0.65)',
    backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999, padding: 16,
  },
  postModalBox: {
    background: C.white, borderRadius: 16,
    width: '100%', maxWidth: 520, maxHeight: '88vh',
    overflow: 'hidden', display: 'flex', flexDirection: 'column',
    border: '1px solid rgba(27,43,75,0.1)',
    boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
  },
  postModalHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 18px', borderBottom: '1px solid rgba(27,43,75,0.07)', flexShrink: 0,
  },
  postModalBody: { overflowY: 'auto', flex: 1 },
  postModalCloseBtn: {
    width: 30, height: 30, borderRadius: '50%',
    background: C.pageBg, border: '1px solid rgba(27,43,75,0.1)',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 16, color: C.bodyGray, fontFamily: "'Inter',sans-serif", lineHeight: 1,
  },
  collectionTable: {
    background: C.white, border: '1px solid rgba(27,43,75,0.07)',
    borderRadius: 12, overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(27,43,75,0.04)',
  },
  tableHeader: {
    display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
    background: '#F8FAFC', padding: '11px 16px',
    fontWeight: 700, fontSize: 10.5, color: C.navyDark,
    borderBottom: '1px solid rgba(27,43,75,0.08)',
    textTransform: 'uppercase', letterSpacing: '0.06em',
  },
  tableRow: {
    display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
    padding: '11px 16px', fontSize: 13, color: C.bodyGray,
    borderBottom: '1px solid rgba(27,43,75,0.04)', transition: 'background 0.15s',
  },
  statusBadge: (status) => ({
    display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px',
    borderRadius: 5, fontSize: 11, fontWeight: 600,
    background:
      status === 'completed' || status === 'recycled' ? '#E8F5E9' :
      status === 'pending' ? '#FFF3E0' : '#FFEBEE',
    color:
      status === 'completed' || status === 'recycled' ? C.success :
      status === 'pending' ? C.warning : C.danger,
  }),
  mapContainer: {
    background: C.white, border: '1px solid rgba(27,43,75,0.07)',
    borderRadius: 12, minHeight: 500, overflow: 'hidden', position: 'relative',
    boxShadow: '0 1px 4px rgba(27,43,75,0.04)',
  },
  mapLegend: {
    position: 'absolute', bottom: 20, right: 20,
    background: 'rgba(255,255,255,0.97)', padding: '12px 16px',
    borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    zIndex: 1000, fontSize: 12, border: '1px solid rgba(27,43,75,0.08)',
  },
  mapLegendTitle: { fontWeight: 700, marginBottom: 8, color: C.navyDark, fontSize: 11 },
  legendGradient: {
    width: 190, height: 10,
    background: 'linear-gradient(to right, #00ff00, #ffff00, #ff0000)',
    borderRadius: 6, marginBottom: 6,
  },
  legendLabels: { display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.bodyGray },
  mapControls: { position: 'absolute', top: 20, right: 20, zIndex: 1000, display: 'flex', gap: 8 },
  mapControlBtn: {
    background: C.white, border: '1px solid rgba(27,43,75,0.1)',
    borderRadius: 6, padding: '7px 12px', cursor: 'pointer',
    fontSize: 12, fontWeight: 500, color: C.navyDark, transition: 'all 0.15s',
    display: 'flex', alignItems: 'center', gap: 6,
  },
  mapInfo: {
    position: 'absolute', bottom: 20, left: 20,
    background: 'rgba(255,255,255,0.97)', padding: '7px 12px',
    borderRadius: 6, fontSize: 11, color: C.bodyGray,
    zIndex: 1000, border: '1px solid rgba(27,43,75,0.08)',
    display: 'flex', alignItems: 'center', gap: 6,
  },
  locationRanking: {
    position: 'absolute', top: 20, left: 20,
    background: 'rgba(255,255,255,0.97)', padding: '12px 16px',
    borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    zIndex: 1000, fontSize: 12, border: '1px solid rgba(27,43,75,0.08)', maxWidth: 250,
  },
  locationRankingTitle: {
    fontWeight: 700, marginBottom: 8, color: C.navyDark, fontSize: 11,
    borderBottom: '1px solid rgba(27,43,75,0.08)', paddingBottom: 6,
    display: 'flex', alignItems: 'center', gap: 6,
  },
  rankingItem: { display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 11 },
  rankingName: { fontWeight: 500, color: C.bodyGray },
  rankingCount: {
    color: C.white, fontWeight: 700, fontSize: 10,
    background: C.danger, borderRadius: 4, padding: '1px 6px',
  },
  historyItem: {
    background: C.white, border: '1px solid rgba(27,43,75,0.07)',
    borderRadius: 10, padding: '14px 16px', marginBottom: 8,
    transition: 'all 0.15s', boxShadow: '0 1px 3px rgba(27,43,75,0.04)',
  },
  historyRow: { display: 'flex', gap: 16, fontSize: 12, color: C.bodyGray },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(15,30,56,0.7)',
    backdropFilter: 'blur(4px)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 9999,
  },
  modal: {
    background: C.white, border: '1px solid rgba(27,43,75,0.1)',
    borderRadius: 14, padding: 32, width: 480, maxWidth: '90vw',
    boxShadow: '0 24px 64px rgba(0,0,0,0.16)',
  },
  modalTitle: { fontSize: 18, fontWeight: 700, color: C.navyDark, marginBottom: 10, marginTop: 0 },
  modalDesc: { fontSize: 13.5, color: C.bodyGray, lineHeight: 1.7, marginBottom: 24 },
  modalActions: { display: 'flex', gap: 10, justifyContent: 'flex-end' },
  btnSecondary: {
    padding: '9px 18px', borderRadius: 7,
    border: '1px solid rgba(27,43,75,0.12)', background: 'transparent',
    color: C.bodyGray, fontSize: 13, fontWeight: 600,
    cursor: 'pointer', fontFamily: "'Inter', 'DM Sans', sans-serif",
  },
  btnDanger: {
    padding: '9px 18px', borderRadius: 7, border: 'none',
    background: C.danger, color: C.white, fontSize: 13, fontWeight: 700,
    cursor: 'pointer', fontFamily: "'Inter', 'DM Sans', sans-serif",
    display: 'flex', alignItems: 'center', gap: 7,
  },
  errorBar: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: '#FFEBEE', border: '1px solid #FFCDD2',
    borderRadius: 8, padding: '10px 16px',
    margin: '0 28px 16px', fontSize: 13, color: C.danger,
  },
  errClose: {
    marginLeft: 'auto', background: 'none', border: 'none',
    color: C.danger, cursor: 'pointer', fontSize: 18, lineHeight: 1,
  },
  analyticsCard: {
    background: C.white, border: '1px solid rgba(27,43,75,0.07)',
    borderRadius: 12, padding: '20px',
    boxShadow: '0 1px 4px rgba(27,43,75,0.04)',
  },
  analyticsCardTitle: {
    fontSize: 13, fontWeight: 700, color: C.navyDark,
    marginBottom: 16, marginTop: 0,
    display: 'flex', alignItems: 'center', gap: 8, letterSpacing: '0.01em',
  },
  titleDot: (color) => ({
    width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0,
  }),
  userAnalyticsCard: {
    background: C.white, border: '1px solid rgba(27,43,75,0.07)',
    borderRadius: 12, padding: '20px',
    boxShadow: '0 1px 4px rgba(27,43,75,0.04)',
    marginBottom: 16,
  },
  userStatsRow: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 0, marginBottom: 20,
  },
  userStatSectionLabel: {
    fontSize: 10, fontWeight: 700, letterSpacing: '0.09em',
    textTransform: 'uppercase', color: C.mutedGray, marginBottom: 10,
  },
  activeRateBar: {
    height: 5, borderRadius: 3, background: 'rgba(27,43,75,0.07)',
    overflow: 'hidden', marginTop: 6,
  },
  activeRateFill: (pct, color) => ({
    height: '100%', width: `${pct}%`,
    background: color, borderRadius: 3,
    transition: 'width 0.6s ease',
  }),
  wasteAnalyticsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 0,
    background: C.white,
    border: '1px solid rgba(27,43,75,0.07)',
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(27,43,75,0.04)',
    marginBottom: 16,
  },
  wasteCol: { padding: '20px' },
  colHeader: { display: 'flex', alignItems: 'center', gap: 7, marginBottom: 16 },
  colHeaderDot: (color) => ({
    width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0,
  }),
  colTitle: { fontSize: 12.5, fontWeight: 700, color: C.navyDark, margin: 0, letterSpacing: '0.01em' },
  scannedItem: {
    display: 'flex', alignItems: 'center',
    padding: '8px 0', borderBottom: '1px solid rgba(27,43,75,0.05)',
  },
  scannedRank: { width: 28, fontSize: 11, fontWeight: 700, color: C.mutedGray, flexShrink: 0 },
  scannedLabel: { flex: 1, fontSize: 12.5, fontWeight: 500, color: C.navyDark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  scannedBadge: (color) => ({
    fontSize: 11, fontWeight: 700, color: C.white, background: color,
    padding: '2px 10px', borderRadius: 20, flexShrink: 0, marginLeft: 8,
  }),
  totalCollectedFull: {
    background: `linear-gradient(135deg, ${C.deepDark} 0%, ${C.navyMid} 100%)`,
    padding: '24px 32px',
    marginTop: 0,
    borderRadius: 0,
  },
  totalCollectedContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 24,
  },
  totalCollectedLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 32,
    flexWrap: 'wrap',
  },
  weightCircleLarge: {
    width: 100,
    height: 100,
    borderRadius: '50%',
    border: `3px solid ${C.accent}`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(79,195,247,0.07)',
    flexShrink: 0,
  },
  weightNumLarge: { fontSize: 26, fontWeight: 900, color: C.accent, lineHeight: 1, letterSpacing: '-0.02em' },
  weightUnitLarge: { fontSize: 12, fontWeight: 600, color: C.accent, opacity: 0.7, marginTop: 2 },
  statusBarsContainer: {
    flex: 1,
    minWidth: 260,
  },
  statusBarItem: { width: '100%', marginBottom: 14 },
  statusBarLabel: { display: 'flex', justifyContent: 'space-between', marginBottom: 5 },
  statusBarLabelText: { fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.04em' },
  statusBarValue: { fontSize: 11, fontWeight: 700, color: C.white },
  statusBarTrack: { height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' },
  statusBarFill: (color, percent) => ({
    height: '100%',
    width: `${percent}%`,
    background: color,
    borderRadius: 3,
    transition: 'width 0.6s ease',
  }),
  totalCollectedRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
  },
  totalReportsText: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  totalReportsValue: { fontSize: 28, fontWeight: 800, color: C.white, lineHeight: 1 },
  locationCard: {
    background: C.white, border: '1px solid rgba(27,43,75,0.07)',
    borderRadius: 12, padding: '20px', boxShadow: '0 1px 4px rgba(27,43,75,0.04)',
  },
  locationHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16, flexWrap: 'wrap', gap: 12,
  },
  locationTableHeader: {
    display: 'grid', gridTemplateColumns: '40px 1fr 80px 100px',
    padding: '10px 12px', background: C.pageBg, borderRadius: 8,
    fontSize: 10.5, fontWeight: 700, color: C.mutedGray,
    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8,
  },
  locationRow: {
    display: 'grid', gridTemplateColumns: '40px 1fr 80px 100px',
    padding: '12px', borderBottom: '1px solid rgba(27,43,75,0.05)',
    alignItems: 'center', transition: 'background 0.15s ease', cursor: 'pointer', borderRadius: 8,
  },
  locationRank: { fontSize: 13, fontWeight: 700, color: C.mutedGray },
  locationName: { fontSize: 13, fontWeight: 600, color: C.navyDark },
  locationReports: { fontSize: 13, fontWeight: 700, color: C.danger },
  locationDetections: {
    fontSize: 12, fontWeight: 600, color: C.accent,
    background: `${C.accent}14`, padding: '4px 8px', borderRadius: 20,
    textAlign: 'center', display: 'inline-block', width: 'fit-content',
  },
  locationMostActive: {
    fontSize: 11, color: C.bodyGray, background: C.pageBg, padding: '6px 12px', borderRadius: 20,
  },
};

// ==================== ICON COMPONENT ====================
const Icon = ({ d, size = 18, color = 'currentColor', strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
    style={{ display: 'inline-block', flexShrink: 0, verticalAlign: 'middle' }}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const ICONS = {
  dashboard:   "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  analytics:   "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  collection:  "M20 7h-4.18A3 3 0 0013 5h-2a3 3 0 00-2.82 2H4a1 1 0 00-1 1v10a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1z M12 11v4 M9 13h6",
  map:         "M21 10.5c0 4.5-9 12-9 12s-9-7.5-9-12a9 9 0 0118 0z M12 13.5a3 3 0 100-6 3 3 0 000 6z",
  history:     "M12 8v4l3 3 M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
  waste:       ["M3 6h18", "M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6", "M10 11v6", "M14 11v6", "M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"],
  messages:    ["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z", "M22 6l-10 7L2 6"],
  logout:      ["M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4", "M16 17l5-5-5-5", "M21 12H9"],
  profile:     ["M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2", "M12 11a4 4 0 100-8 4 4 0 000 8z"],
  leaf:        ["M6.5 7.5C5 10 4 14 8 18c4 4 8.5 2.5 10.5 0.5C20 16 21 12 17 8c-3-3-7-3-9-2", "M3 21l6-6"],
  recycle:     ["M4 15l3 3 3-3", "M7 18V9.5C7 7 9 5 11.5 5H13", "M20 9l-3-3-3 3", "M17 6v8.5C17 17 15 19 12.5 19H11"],
  alert:       ["M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z", "M12 9v4", "M12 17h.01"],
  weight:      "M12 2v4M12 6l4 4-4 4-4-4 4-4z M4 12h16 M12 22v-4",
  location:    "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 13a3 3 0 100-6 3 3 0 000 6z",
  users:       ["M12 11a4 4 0 100-8 4 4 0 000 8z", "M18 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2", "M22 21v-2a4 4 0 00-3-3.87", "M16 3.13a4 4 0 010 7.75"],
  megaphone:   "M3 11l19-9-9 19-2-8-8-2z",
  calendar:    ["M8 2v4", "M16 2v4", "M3 10h18", "M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"],
  broom:       ["M9 3l2 2", "M5 7l4-4 10 10-4 4z", "M6 18l-3 3", "M9 21l-3-3 8-8"],
  newspaper:   ["M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 002 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2", "M18 14h-8", "M15 18h-5", "M10 6h8v4h-8V6z"],
  siren:       ["M5 10.5V19a2 2 0 002 2h10a2 2 0 002-2v-8.5", "M12 2v2", "M4.93 4.93l1.41 1.41", "M19.07 4.93l-1.41 1.41", "M2 11h2", "M20 11h2", "M9 10a3 3 0 116 0v1H9v-1z"],
  filetext:    ["M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z", "M14 2v6h6", "M16 13H8", "M16 17H8"],
  pin:         ["M12 17v5", "M5 17h14v-1.76a2 2 0 00-1.11-1.79l-1.78-.9A2 2 0 0115 10.76V6h1a2 2 0 000-4H8a2 2 0 000 4h1v4.76a2 2 0 01-1.11 1.79l-1.78.9A2 2 0 005 15.24V17z"],
  user:        ["M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2", "M12 11a4 4 0 100-8 4 4 0 000 8z"],
  eye:         ["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z", "M12 9a3 3 0 100 6 3 3 0 000-6z"],
  heart:       "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z",
  comment:     "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  arrowRight:  "M5 12h14M12 5l7 7-7 7",
  share:       ["M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8", "M16 6l-4-4-4 4", "M12 2v13"],
  mapPin:      "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 13a3 3 0 100-6 3 3 0 000 6z",
  building:    ["M3 21h18", "M5 21V7l8-4 8 4v14", "M9 21v-6h6v6"],
  shield:      "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  trending:    ["M23 6l-9.5 9.5-5-5L1 18", "M17 6h6v6"],
  trendingUp:  ["M23 6l-9.5 9.5-5-5L1 18", "M17 6h6v6"],
  trendingDown:["M23 18l-9.5-9.5-5 5L1 6", "M17 18h6v-6"],
  check:       ["M20 6L9 17l-5-5"],
  layers:      ["M12 2L2 7l10 5 10-5-10-5z", "M2 17l10 5 10-5", "M2 12l10 5 10-5"],
  barChart:    ["M18 20V10", "M12 20V4", "M6 20v-6"],
  close:       ["M18 6L6 18", "M6 6l12 12"],
  scan:        ["M3 9V5a2 2 0 012-2h4", "M3 15v4a2 2 0 002 2h4", "M21 9V5a2 2 0 00-2-2h-4", "M21 15v4a2 2 0 01-2 2h-4", "M8 12h8", "M12 8v8"],
  chartPie:    ["M21.21 15.89A10 10 0 118 2.83", "M22 12A10 10 0 0012 2v10z"],
  target:      "M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10z M12 18a6 6 0 100-12 6 6 0 000 12z M12 14a2 2 0 100-4 2 2 0 000 4z",
};

const CATEGORY_ICONS = {
  announcement: ICONS.megaphone,
  event:        ICONS.calendar,
  cleanup_drive:ICONS.broom,
  advisory:     ICONS.alert,
  recycling_tip:ICONS.recycle,
  news:         ICONS.newspaper,
  alert:        ICONS.siren,
  general:      ICONS.filetext,
};

const ADMIN_ROLE_ICONS = {
  southadmin:   ICONS.mapPin,
  centraladmin: ICONS.building,
  superadmin:   ICONS.shield,
  admin:        ICONS.user,
};

const CHART_COLORS = [
  '#4FC3F7', '#1B2B4B', '#4CAF50', '#FF9800',
  '#F44336', '#9C27B0', '#00BCD4', '#FF5722',
  '#607D8B', '#795548',
];

const SectionHeading = ({ children }) => (
  <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.11em', textTransform: 'uppercase', color: '#90A4AE', marginBottom: 14, marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
    <span>{children}</span>
    <div style={{ flex: 1, height: 1, background: 'rgba(27,43,75,0.08)' }} />
  </div>
);

// ==================== SPARKLINE COMPONENT ====================
const Sparkline = ({ data = [], color = '#4FC3F7' }) => {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !data.length) return;
    if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
    const ctx = canvasRef.current.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 56);
    grad.addColorStop(0, color + '45');
    grad.addColorStop(1, color + '00');
    chartRef.current = new ChartJS(ctx, {
      type: 'line',
      data: {
        labels: data.map((_, i) => i),
        datasets: [{
          data, borderColor: color, backgroundColor: grad,
          fill: true, tension: 0.42, borderWidth: 2,
          pointRadius: 0, pointHoverRadius: 0,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: { x: { display: false }, y: { display: false } },
        layout: { padding: { top: 2, bottom: 2, left: 0, right: 0 } },
      },
    });
    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
  }, [data, color]);

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '56px' }} />;
};

// ==================== STAT CARD COMPONENT ====================
const StatCard = ({ label, value, sub, color, iconPath, trendUp, trendPct, sparkData, onClick }) => (
  <div style={S.statCard} onClick={onClick}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(27,43,75,0.13)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(27,43,75,0.04)'; e.currentTarget.style.transform = 'none'; }}>
    <div style={S.statCardAccent(color)} />
    <div style={S.statCardBody}>
      <div style={S.statCardTop}>
        <div style={S.statIconBox(color)}><Icon d={iconPath} size={17} color={color} strokeWidth={2} /></div>
        <div style={S.statTrendBadge(trendUp)}>
          <Icon d={trendUp ? ICONS.trendingUp : ICONS.trendingDown} size={11} color={trendUp ? C.success : C.danger} strokeWidth={2.5} />
          {trendPct}
        </div>
      </div>
      <div style={S.statLabel}>{label}</div>
      <div style={{ ...S.statValue, color }}>{value}</div>
      <div style={S.statSub}>{sub}</div>
    </div>
    <div style={S.sparklineWrap}><Sparkline data={sparkData} color={color} /></div>
  </div>
);

// ==================== WASTE HEATMAP COMPONENT ====================
const WasteHeatmap = ({ locations, topLocations, onLocationClick, adminRole }) => {
  const mapRef = useRef(null);
  const heatmapRef = useRef(null);
  const markersRef = useRef([]);

  const getCenter = () => {
    if (adminRole === 'southadmin')   return { lat: 14.50493, lng: 121.05368 };
    if (adminRole === 'centraladmin') return { lat: 14.5185,  lng: 121.0580  };
    return { lat: 14.5117, lng: 121.0558 };
  };

  useEffect(() => {
    const center = getCenter();
    if (!mapRef.current) {
      mapRef.current = L.map('waste-map').setView([center.lat, center.lng], 14);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OSM &copy; CartoDB', subdomains: 'abcd', maxZoom: 19, minZoom: 12,
      }).addTo(mapRef.current);
      L.control.scale({ metric: true, imperial: false }).addTo(mapRef.current);
      L.control.fullscreen({ position: 'topright', title: 'Fullscreen', titleCancel: 'Exit Fullscreen' }).addTo(mapRef.current);
    }
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, [adminRole]);

  useEffect(() => {
    if (!mapRef.current || !locations.length) return;
    if (heatmapRef.current) mapRef.current.removeLayer(heatmapRef.current);
    markersRef.current.forEach(m => mapRef.current.removeLayer(m));
    markersRef.current = [];
    const heatData = locations.map(loc => [loc.lat, loc.lng, loc.intensity || loc.count || 1]);
    heatmapRef.current = L.heatLayer(heatData, {
      radius: 30, blur: 20, maxZoom: 18, minOpacity: 0.3,
      gradient: { 0.2: '#00ff00', 0.4: '#aaff00', 0.6: '#ffff00', 0.8: '#ff8800', 1.0: '#ff0000' }
    }).addTo(mapRef.current);
    topLocations.slice(0, 10).forEach((loc, idx) => {
      const marker = L.circleMarker([loc.lat, loc.lng], {
        radius: 8 + (idx < 3 ? 4 : 0), fillColor: C.danger,
        color: C.white, weight: 2, opacity: 1, fillOpacity: 0.9
      }).addTo(mapRef.current);
      marker.bindPopup(`
        <div style="font-family:'Inter','DM Sans',sans-serif;min-width:160px;padding:4px 0;">
          <strong style="color:${C.navyDark};font-size:13px;">${loc.address}</strong>
          <hr style="margin:8px 0;border:none;border-top:1px solid #e5e7eb;">
          <div style="font-size:12px;color:#546E7A;line-height:1.8;">
            <div><strong>Reports:</strong> ${loc.count}</div>
            <div><strong>Weight:</strong> ${loc.totalWeight.toFixed(2)} kg</div>
            <div><strong>Rank:</strong> #${idx + 1}</div>
          </div>
        </div>
      `);
      marker.on('click', () => onLocationClick && onLocationClick(loc));
      markersRef.current.push(marker);
    });
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lng]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locations, topLocations, onLocationClick]);

  return <div id="waste-map" style={{ height: '500px', width: '100%', borderRadius: '12px' }} />;
};

// ==================== MAIN ADMIN DASHBOARD COMPONENT ====================
const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [adminRole, setAdminRole] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [error, setError] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalReports: 0, pendingReports: 0, recycledReports: 0,
    processedReports: 0, disposedReports: 0, totalMessages: 0,
    unreadMessages: 0, weeklyGrowth: 0, totalWeight: 0,
  });
  const [classificationData, setClassificationData] = useState({});
  const [collectionData, setCollectionData] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [mapLocations, setMapLocations] = useState([]);
  const [topLocations, setTopLocations] = useState([]);
  const [locationAnalytics, setLocationAnalytics] = useState({});
  const [dailyTrends, setDailyTrends] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [detectedObjectsData, setDetectedObjectsData] = useState({});
  const [userAnalytics, setUserAnalytics] = useState({
    totalUsers: 0, activeUsers: 0, bannedUsers: 0,
    maleUsers: 0, femaleUsers: 0, usersThisMonth: 0, usersThisWeek: 0,
  });
  const [locationDetections, setLocationDetections] = useState([]);
  const [sparkReports, setSparkReports] = useState(Array(14).fill(0));
  const [sparkWeight, setSparkWeight] = useState(Array(14).fill(0));
  const [sparkUsers, setSparkUsers] = useState(Array(14).fill(0));
  const [sparkLocations, setSparkLocations] = useState(Array(14).fill(0));

  const navigate = useNavigate();

  const getBarangayName = (role = adminRole) => {
    if (role === 'southadmin')   return 'South Signal Village';
    if (role === 'centraladmin') return 'Central Signal Village';
    return 'All Barangays';
  };

  const geocodeAddress = async (address) => {
    let str = typeof address === 'string' ? address : (address ? (address.address || address.location || address.name || '') : '');
    if (!str) return getDefaultCoords();
    const southMap = {
      'phase 1': { lat: 14.5012, lng: 121.0505 }, 'phase 2': { lat: 14.5028, lng: 121.0521 },
      'phase 3': { lat: 14.5045, lng: 121.0542 }, 'phase 4': { lat: 14.5061, lng: 121.0558 },
      'phase 5': { lat: 14.5078, lng: 121.0575 }, 'barangay hall': { lat: 14.50493, lng: 121.05368 },
    };
    const centralMap = {
      'phase 1': { lat: 14.5155, lng: 121.0555 }, 'phase 2': { lat: 14.5172, lng: 121.0572 },
      'phase 3': { lat: 14.5188, lng: 121.0588 }, 'barangay hall': { lat: 14.5185, lng: 121.0580 },
    };
    const phaseMap = adminRole === 'centraladmin' ? centralMap : southMap;
    const lower = str.toLowerCase();
    for (const [key, coords] of Object.entries(phaseMap)) {
      if (lower.includes(key)) return coords;
    }
    return getDefaultCoords();
  };

  const getDefaultCoords = () => {
    if (adminRole === 'southadmin')   return { lat: 14.50493, lng: 121.05368 };
    if (adminRole === 'centraladmin') return { lat: 14.5185,  lng: 121.0580  };
    return { lat: 14.5117, lng: 121.0558 };
  };

  const getAddressString = (address) => {
    if (!address) return '';
    if (typeof address === 'string') return address;
    return address.address || address.location || address.name || '';
  };

  const fetchRecentPosts = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/posts?status=published&limit=6`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      setRecentPosts(data.posts || []);
    } catch (err) { console.error('Error fetching recent posts:', err); }
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');
    if (!token || !adminData) { navigate('/admin/login'); return; }
    try {
      const parsed = JSON.parse(adminData);
      setAdmin(parsed);
      setAdminRole(parsed.role);
      fetchAllData(parsed.role);
      fetchRecentPosts();
    } catch { navigate('/admin/login'); }
  }, [navigate]);

  const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('adminToken');
    const res = await fetch(`${API_URL}${url}`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    const ct = res.headers.get('content-type');
    if (ct?.includes('text/html')) throw new Error('Server returned HTML instead of JSON.');
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try { const e = await res.json(); msg = e.message || msg; } catch {}
      throw new Error(msg);
    }
    return res.json();
  };

  const fetchAllData = async (role) => {
    try {
      setError(null);
      const [wasteRes, messagesRes, usersRes] = await Promise.allSettled([
        fetchWithAuth('/api/waste-reports'),
        fetchWithAuth('/api/messages'),
        fetchWithAuth('/api/users/all-users'),
      ]);

      const allUsers = usersRes.status === 'fulfilled' ? (usersRes.value || []) : [];
      let filteredUsers = allUsers;
      if (role === 'southadmin')   filteredUsers = allUsers.filter(u => u.barangay === 'South Signal');
      if (role === 'centraladmin') filteredUsers = allUsers.filter(u => u.barangay === 'Central Bicutan');
      filteredUsers = filteredUsers.filter(u => u.status !== 'pending');
      const usersMap = new Map(filteredUsers.map(u => [u._id, u]));

      const now = new Date();
      const usersThisMonth = filteredUsers.filter(u => {
        const joinDate = new Date(u.createdAt);
        return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
      }).length;
      const usersThisWeek = filteredUsers.filter(u => {
        const joinDate = new Date(u.createdAt);
        const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
        return joinDate >= weekAgo;
      }).length;
      setUserAnalytics({
        totalUsers: filteredUsers.length,
        activeUsers: filteredUsers.filter(u => u.status === 'active').length,
        bannedUsers: filteredUsers.filter(u => u.status === 'banned').length,
        maleUsers: filteredUsers.filter(u => u.gender?.toLowerCase() === 'male').length,
        femaleUsers: filteredUsers.filter(u => u.gender?.toLowerCase() === 'female').length,
        usersThisMonth, usersThisWeek,
      });

      let wasteReports = wasteRes.status === 'fulfilled' ? (wasteRes.value.reports || []) : [];
      if (role === 'southadmin')   wasteReports = wasteReports.filter(r => r.assignedBarangay === 'south_signal');
      if (role === 'centraladmin') wasteReports = wasteReports.filter(r => r.assignedBarangay === 'central_signal');

      // Calculate weight using scientific method
      let totalWeight = 0;
      wasteReports.forEach(r => { totalWeight += calculateTotalWeight(r); });

      const totalReports = wasteReports.length;
      const pendingReports   = wasteReports.filter(r => r.status === 'pending').length;
      const recycledReports  = wasteReports.filter(r => r.status === 'recycled').length;
      const processedReports = wasteReports.filter(r => r.status === 'processed').length;
      const disposedReports  = wasteReports.filter(r => r.status === 'disposed').length;

      const lastWeek = wasteReports.filter(r => ((now - new Date(r.scanDate || r.createdAt)) / 86400000) <= 7).length;
      const prevWeek = wasteReports.filter(r => { const d = (now - new Date(r.scanDate || r.createdAt)) / 86400000; return d > 7 && d <= 14; }).length;
      const weeklyGrowth = prevWeek > 0 ? ((lastWeek - prevWeek) / prevWeek) * 100 : lastWeek > 0 ? 100 : 0;
      setDashboardStats({ 
        totalReports, pendingReports, recycledReports, processedReports, disposedReports, 
        totalMessages: 0, unreadMessages: 0, weeklyGrowth, 
        totalWeight: totalWeight.toFixed(2) 
      });

      const classification = {};
      wasteReports.forEach(r => { const t = r.classification || 'Unknown'; classification[t] = (classification[t] || 0) + 1; });
      setClassificationData(classification);

      const objectsCount = {};
      wasteReports.forEach(report => {
        if (report.detectedObjects && Array.isArray(report.detectedObjects)) {
          report.detectedObjects.forEach(obj => {
            const label = obj.label || 'Unknown';
            objectsCount[label] = (objectsCount[label] || 0) + 1;
          });
        }
      });
      setDetectedObjectsData(objectsCount);

      const dailyBuckets = {};
      for (let i = 13; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const dk = d.toISOString().split('T')[0];
        dailyBuckets[dk] = { count: 0, weight: 0 };
      }
      wasteReports.forEach(r => {
        const dk = new Date(r.scanDate || r.createdAt).toISOString().split('T')[0];
        if (dailyBuckets[dk]) {
          dailyBuckets[dk].count++;
          dailyBuckets[dk].weight += calculateTotalWeight(r);
        }
      });
      const bucketKeys = Object.keys(dailyBuckets).sort();
      setSparkReports(bucketKeys.map(k => dailyBuckets[k].count));
      setSparkWeight(bucketKeys.map(k => Math.round(dailyBuckets[k].weight * 10) / 10));

      const userDailyBuckets = {};
      bucketKeys.forEach(k => { userDailyBuckets[k] = 0; });
      filteredUsers.forEach(u => {
        const dk = new Date(u.createdAt).toISOString().split('T')[0];
        if (userDailyBuckets[dk] !== undefined) userDailyBuckets[dk]++;
      });
      setSparkUsers(bucketKeys.map(k => userDailyBuckets[k]));

      const dailyCollection = {};
      wasteReports.forEach(r => {
        const dk = new Date(r.scanDate || r.createdAt).toISOString().split('T')[0];
        if (!dailyCollection[dk]) dailyCollection[dk] = { date: dk, count: 0, weight: 0 };
        dailyCollection[dk].count++; dailyCollection[dk].weight += calculateTotalWeight(r);
      });
      setCollectionData(Object.values(dailyCollection).sort((a, b) => a.date.localeCompare(b.date)).slice(-30));

      const last30 = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const dk = d.toISOString().split('T')[0];
        const day = dailyCollection[dk] || { count: 0, weight: 0 };
        last30.push({ date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), count: day.count, weight: day.weight });
      }
      setDailyTrends(last30);

      setHistoryData(wasteReports.slice(-20).map(r => {
        const user = usersMap.get(r.user?._id || r.user);
        return {
          id: r._id, type: r.classification || 'Unknown', status: r.status || 'pending',
          date: new Date(r.scanDate || r.createdAt).toLocaleDateString(),
          weight: calculateTotalWeight(r).toFixed(2),
          location: getAddressString(r.location) || getAddressString(user?.address) || 'Not specified',
        };
      }));

      const locationMap = new Map();
      for (const report of wasteReports) {
        const user = usersMap.get(report.user?._id || report.user);
        let address = getAddressString(report.location) || getAddressString(user?.address);
        if (address && address !== 'Not specified') {
          try {
            const coords = await geocodeAddress(address);
            const key = address.toLowerCase().trim();
            let detectionCount = 0;
            if (report.detectedObjects && Array.isArray(report.detectedObjects)) {
              detectionCount = report.detectedObjects.length;
            }
            const weight = calculateTotalWeight(report);
            if (locationMap.has(key)) {
              const ex = locationMap.get(key);
              ex.count++; ex.totalWeight += weight;
              ex.intensity = ex.totalWeight; ex.detectionCount += detectionCount;
            } else {
              locationMap.set(key, {
                id: key, address, lat: coords.lat, lng: coords.lng,
                count: 1, totalWeight: weight, intensity: weight, detectionCount,
              });
            }
          } catch {}
        }
      }
      const locations = Array.from(locationMap.values());
      const sorted = [...locations].sort((a, b) => b.count - a.count);
      setTopLocations(sorted);
      setMapLocations(locations);

      const locDailyBuckets = {};
      bucketKeys.forEach(k => { locDailyBuckets[k] = new Set(); });
      wasteReports.forEach(r => {
        const user = usersMap.get(r.user?._id || r.user);
        const addr = getAddressString(r.location) || getAddressString(user?.address);
        if (addr) {
          const dk = new Date(r.scanDate || r.createdAt).toISOString().split('T')[0];
          if (locDailyBuckets[dk]) locDailyBuckets[dk].add(addr.toLowerCase().trim());
        }
      });
      setSparkLocations(bucketKeys.map(k => locDailyBuckets[k].size));

      const locationData = sorted.slice(0, 10).map((loc, idx) => ({
        rank: idx + 1, name: loc.address,
        reports: loc.count, detections: loc.detectionCount || 0, weight: loc.totalWeight,
      }));
      setLocationDetections(locationData);

      setLocationAnalytics({
        totalUniqueLocations: locations.length,
        mostActiveLocation: sorted[0] || null,
        top5Locations: sorted.slice(0, 5),
        averagePerLocation: locations.length > 0 ? (totalReports / locations.length).toFixed(1) : 0,
      });
    } catch (err) { setError(`Failed to load data: ${err.message}`); }
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
      const fd = new FormData();
      fd.append('profile', profileForm.profile);
      if (profileForm.email && profileForm.email !== admin.email) fd.append('email', profileForm.email);
      if (profileForm.password) fd.append('password', profileForm.password);
      response = await fetch(`${API_URL}/api/admin/profile`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: fd });
    } else {
      const upd = {};
      if (profileForm.email && profileForm.email !== admin.email) upd.email = profileForm.email;
      if (profileForm.password) upd.password = profileForm.password;
      response = await fetch(`${API_URL}/api/admin/profile`, { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(upd) });
    }
    data = await response.json();
    if (response.ok && data.admin) {
      setAdmin(data.admin); setAdminRole(data.admin.role);
      localStorage.setItem('adminData', JSON.stringify(data.admin));
    } else throw new Error(data.message || 'Failed to update profile');
  };

  const handleDeleteProfilePicture = async () => {
    await fetchWithAuth('/api/admin/profile/picture', { method: 'DELETE' });
    const d = await fetchWithAuth('/api/admin/profile');
    if (d.admin) { setAdmin(d.admin); setAdminRole(d.admin.role); localStorage.setItem('adminData', JSON.stringify(d.admin)); }
  };

  // Chart options
  const baseTooltip = {
    backgroundColor: C.deepDark,
    titleFont: { size: 11, family: "'Inter','DM Sans',sans-serif" },
    bodyFont: { size: 10, family: "'Inter','DM Sans',sans-serif" },
    padding: 8, cornerRadius: 6,
  };
  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: baseTooltip },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(27,43,75,0.05)' }, ticks: { font: { size: 10 }, color: C.mutedGray } },
      x: { grid: { display: false }, ticks: { font: { size: 10 }, color: C.mutedGray, maxRotation: 40, minRotation: 0 } },
    },
  };
  const pieChartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 10.5, family: "'Inter','DM Sans',sans-serif" }, usePointStyle: true, boxWidth: 7, padding: 12 } },
      tooltip: { ...baseTooltip, callbacks: { label: (ctx) => { const total = ctx.dataset.data.reduce((a, b) => a + b, 0); return ` ${ctx.label}: ${ctx.raw} (${((ctx.raw / total) * 100).toFixed(1)}%)`; } } },
    },
  };
  const polarOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 10, family: "'Inter','DM Sans',sans-serif" }, usePointStyle: true, boxWidth: 6, padding: 10 } },
      tooltip: baseTooltip,
    },
    scales: { r: { ticks: { display: false }, grid: { color: 'rgba(27,43,75,0.07)' } } },
  };
  const radarOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: baseTooltip },
    scales: {
      r: {
        beginAtZero: true,
        grid: { color: 'rgba(27,43,75,0.07)' },
        pointLabels: { font: { size: 10 }, color: C.mutedGray },
        ticks: { display: false },
      }
    },
  };
  const lineOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: baseTooltip },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(27,43,75,0.05)' }, ticks: { font: { size: 10 }, color: C.mutedGray, precision: 0 } },
      x: { grid: { display: false }, ticks: { font: { size: 10 }, color: C.mutedGray, maxRotation: 35, minRotation: 0 } },
    },
  };
  const barOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y: { ...chartOptions.scales.y, beginAtZero: true, grid: { display: true, color: 'rgba(27,43,75,0.04)' } },
    },
  };

  // Chart Data
  const classificationChartData = {
    labels: Object.keys(classificationData),
    datasets: [{
      data: Object.values(classificationData),
      backgroundColor: CHART_COLORS.slice(0, Object.keys(classificationData).length),
      borderColor: C.white, borderWidth: 2, hoverOffset: 6,
    }],
  };

  const dailyTrendsChartData = {
    labels: dailyTrends.slice(-14).map(d => d.date),
    datasets: [{
      label: 'Reports', data: dailyTrends.slice(-14).map(d => d.count),
      borderColor: C.accent, backgroundColor: 'rgba(79,195,247,0.08)',
      fill: true, tension: 0.4,
      pointBackgroundColor: C.accent, pointBorderColor: C.white,
      pointBorderWidth: 2, pointRadius: 3, pointHoverRadius: 5,
    }],
  };

  const statusPolarData = {
    labels: ['Recycled', 'Processed', 'Pending', 'Disposed'],
    datasets: [{
      data: [dashboardStats.recycledReports, dashboardStats.processedReports, dashboardStats.pendingReports, dashboardStats.disposedReports],
      backgroundColor: [C.success + 'CC', C.accent + 'CC', C.warning + 'CC', C.danger + 'CC'],
      borderColor: [C.success, C.accent, C.warning, C.danger], borderWidth: 1.5,
    }],
  };

  const getMostScannedItems = () => Object.entries(detectedObjectsData).sort((a, b) => b[1] - a[1]).slice(0, 7);
  const mostScannedItems = getMostScannedItems();
  const totalDetections = Object.values(detectedObjectsData).reduce((a, b) => a + b, 0);

  const mostScannedBarData = {
    labels: mostScannedItems.map(([label]) => label.length > 12 ? label.slice(0, 12) + '…' : label),
    datasets: [{
      label: 'Scan Count',
      data: mostScannedItems.map(([, count]) => count),
      backgroundColor: CHART_COLORS.slice(0, mostScannedItems.length),
      borderColor: C.white, borderWidth: 1, borderRadius: 6, barPercentage: 0.65,
    }],
  };

  const userRadarData = {
    labels: ['Total', 'Active', 'New/Month', 'New/Week', 'Male', 'Female'],
    datasets: [{
      label: 'Users',
      data: [userAnalytics.totalUsers, userAnalytics.activeUsers, userAnalytics.usersThisMonth, userAnalytics.usersThisWeek, userAnalytics.maleUsers, userAnalytics.femaleUsers],
      borderColor: C.success, backgroundColor: C.success + '22',
      pointBackgroundColor: C.success, pointBorderColor: C.white,
      pointBorderWidth: 2, pointRadius: 4,
    }],
  };

  // Navigation
  const navItems = [
    { id: 'dashboard',  label: 'Dashboard',     icon: ICONS.dashboard,  section: 'Overview'   },
    { id: 'analytics',  label: 'Analytics',     icon: ICONS.analytics,  section: 'Insights'   },
    { id: 'collection', label: 'Collection',    icon: ICONS.collection, section: 'Operations' },
    { id: 'map',        label: 'Heat Map',      icon: ICONS.map,        section: 'Operations' },
    { id: 'users',      label: 'Users',         icon: ICONS.users,      section: 'Management' },
    { id: 'history',    label: 'History',       icon: ICONS.history,    section: 'Records'    },
    { id: 'waste',      label: 'Waste Reports', icon: ICONS.waste,      section: 'Management' },
    { id: 'messages',   label: 'Messages',      icon: ICONS.messages,   section: 'Management' },
    { id: 'posts',      label: 'Posts',         icon: ICONS.leaf,       section: 'Management' },
    { id: 'profile',    label: 'Admin Profile', icon: ICONS.profile,    section: 'Account'    },
  ];
  const navSections = ['Overview', 'Insights', 'Operations', 'Records', 'Management', 'Account'];

  const pageTitles = {
    dashboard:  { title: 'Overview Dashboard',      sub: `Welcome back, ${admin?.email?.split('@')[0] || 'Admin'}` },
    analytics:  { title: 'Waste & User Analytics',  sub: 'Detailed breakdown of collection trends and user insights' },
    collection: { title: 'Collection Records',      sub: 'Daily waste collection log and tracking' },
    map:        { title: 'Waste Heat Map',          sub: 'Geographic visualization of collection activity' },
    users:      { title: 'User Management',         sub: 'Manage residents and monitor account status' },
    history:    { title: 'Collection History',      sub: 'Complete log of waste collection events' },
    waste:      { title: 'Waste Reports',           sub: 'Manage and classify waste detection reports' },
    messages:   { title: 'Messages',                sub: 'Resident communications and inquiries' },
    posts:      { title: 'Posts Management',        sub: 'Manage community posts and announcements' },
    profile:    { title: 'Admin Profile',           sub: 'Manage your account and credentials' },
  };

  // Post Modal
  const renderPostModal = () => {
    if (!selectedPost) return null;
    const post = selectedPost;
    const adminDisplayName  = getAdminDisplayName(post);
    const adminRoleFromPost = getAdminRoleFromPost(post);
    const adminBadge        = getAdminBadgeStyle(adminRoleFromPost);
    const adminTypeLabel    = getAdminTypeLabel(adminRoleFromPost);
    const roleIcon          = ADMIN_ROLE_ICONS[adminRoleFromPost] || ADMIN_ROLE_ICONS.admin;
    const catLabel          = post.category ? post.category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'General';
    const catIcon           = CATEGORY_ICONS[post.category] || CATEGORY_ICONS.general;
    const likeCount         = post.likes?.length || 0;
    const commentCount      = post.commentCount || post.comments?.length || 0;

    return (
      <div style={S.postModal} onClick={() => setSelectedPost(null)}>
        <div style={S.postModalBox} onClick={e => e.stopPropagation()}>
          <div style={S.postModalHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ ...S.postAvatar, width: 42, height: 42 }}>
                {post.admin?.profile
                  ? <img src={post.admin.profile} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span>{adminDisplayName.charAt(0).toUpperCase()}</span>}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.navyDark }}>{adminDisplayName}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3, flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: adminBadge.bg, color: adminBadge.color, fontSize: 9.5, fontWeight: 600, padding: '2px 7px', borderRadius: 20 }}>
                    <Icon d={roleIcon} size={8} color={adminBadge.color} strokeWidth={2.2} />{adminTypeLabel}
                  </span>
                  <span style={getCatBadgeStyle(post.category)}>
                    <Icon d={catIcon} size={8} color="currentColor" strokeWidth={2} />{catLabel}
                  </span>
                  <span style={{ fontSize: 10, color: C.mutedGray }}>
                    {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
            <button style={S.postModalCloseBtn} onClick={() => setSelectedPost(null)}>✕</button>
          </div>
          <div style={S.postModalBody}>
            {post.image && (
              <img src={post.image} alt={post.title}
                style={{ width: '100%', maxHeight: 280, objectFit: 'cover', display: 'block' }}
                onError={e => { e.target.style.display = 'none'; }}
              />
            )}
            <div style={{ padding: '16px 18px 18px' }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: C.navyDark, margin: '0 0 10px' }}>{post.title}</p>
              <p style={{ fontSize: 13.5, color: C.bodyGray, lineHeight: 1.75, margin: 0, whiteSpace: 'pre-wrap' }}>{post.content}</p>
              <div style={{ display: 'flex', gap: 16, marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(27,43,75,0.07)', fontSize: 12, color: C.mutedGray }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon d={ICONS.heart} size={13} color={C.mutedGray} strokeWidth={2} /> {likeCount} likes</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon d={ICONS.comment} size={13} color={C.mutedGray} strokeWidth={2} /> {commentCount} comments</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon d={ICONS.eye} size={13} color={C.mutedGray} strokeWidth={2} /> {post.views || 0} views</span>
              </div>
            </div>
          </div>
          <div style={{ ...S.postActions, borderTop: '1px solid rgba(27,43,75,0.07)', flexShrink: 0 }}>
            {[{ icon: ICONS.heart, label: 'Like' }, { icon: ICONS.comment, label: 'Comment' }, { icon: ICONS.share, label: 'Share' }].map(({ icon, label }) => (
              <button key={label} style={{ ...S.postActionBtn, fontSize: 13 }}
                onClick={() => setActiveSection('posts')}
                onMouseEnter={e => { e.currentTarget.style.background = C.pageBg; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
              >
                <Icon d={icon} size={15} color={C.bodyGray} strokeWidth={1.8} />{label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Feed Panel
  const renderFeedPanel = () => (
    <div style={S.feedPanel}>
      <div style={S.feedStickyHeader}>
        <h4 style={S.feedTitle}>
          <Icon d={ICONS.megaphone} size={14} color={C.navyDark} strokeWidth={2} />
          Announcements
        </h4>
        <span style={S.viewAllLink}
          onClick={() => setActiveSection('posts')}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(79,195,247,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(79,195,247,0.08)'; }}
        >
          View All <Icon d={ICONS.arrowRight} size={11} color={C.accent} strokeWidth={2.5} />
        </span>
      </div>
      <div style={S.feedScrollArea}>
        {recentPosts.length === 0 ? (
          <div style={S.feedEmpty}>
            <Icon d={ICONS.filetext} size={32} color={C.mutedGray} strokeWidth={1.2} />
            <div style={{ fontSize: 13, fontWeight: 600, color: C.bodyGray, marginTop: 10 }}>No posts yet</div>
            <div style={{ fontSize: 11, marginTop: 4, color: C.mutedGray }}>Create your first post</div>
          </div>
        ) : recentPosts.map((post) => {
          const catIcon           = CATEGORY_ICONS[post.category] || CATEGORY_ICONS.general;
          const likeCount         = post.likes?.length || 0;
          const commentCount      = post.commentCount || post.comments?.length || 0;
          const catLabel          = post.category ? post.category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'General';
          const adminDisplayName  = getAdminDisplayName(post);
          const adminRoleFromPost = getAdminRoleFromPost(post);
          const adminBadge        = getAdminBadgeStyle(adminRoleFromPost);
          const adminTypeLabel    = getAdminTypeLabel(adminRoleFromPost);
          const roleIcon          = ADMIN_ROLE_ICONS[adminRoleFromPost] || ADMIN_ROLE_ICONS.admin;
          const EXCERPT_LIMIT     = 120;
          const isLong            = post.content.length > EXCERPT_LIMIT;

          return (
            <div key={post._id} style={S.postCard}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 3px 12px rgba(27,43,75,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(27,43,75,0.04)'; }}
            >
              <div style={S.postCardHeader}>
                <div style={S.postAvatar}>
                  {post.admin?.profile
                    ? <img src={post.admin.profile} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span>{adminDisplayName.charAt(0).toUpperCase()}</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={S.postAuthorName}>{adminDisplayName}</p>
                  <div style={S.postAuthorMeta}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: adminBadge.bg, color: adminBadge.color, fontSize: 9.5, fontWeight: 600, padding: '2px 7px', borderRadius: 20 }}>
                      <Icon d={roleIcon} size={8} color={adminBadge.color} strokeWidth={2.2} />{adminTypeLabel}
                    </span>
                    <span style={{ color: 'rgba(27,43,75,0.2)', fontSize: 12 }}>·</span>
                    <span style={{ fontSize: 10, color: C.mutedGray, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Icon d={ICONS.calendar} size={9} color={C.mutedGray} strokeWidth={2} />
                      {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <span style={getCatBadgeStyle(post.category)}>
                      <Icon d={catIcon} size={8} color="currentColor" strokeWidth={2} />{catLabel}
                    </span>
                    {post.isPinned && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, background: '#FFF3E0', color: C.warning, fontSize: 9.5, fontWeight: 700, padding: '2px 7px', borderRadius: 20, marginLeft: 4 }}>
                        <Icon d={ICONS.pin} size={8} color={C.warning} strokeWidth={2} />Pinned
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {post.image && (
                <img src={post.image} alt={post.title} style={S.postImage}
                  onError={e => { e.target.style.display = 'none'; }}
                />
              )}
              <div style={S.postBody}>
                <p style={S.postTitle}>{post.title}</p>
                <p style={S.postExcerpt}>{isLong ? post.content.substring(0, EXCERPT_LIMIT) + '…' : post.content}</p>
                {isLong && <span style={S.seeMore} onClick={() => setSelectedPost(post)}>See more</span>}
              </div>
              <div style={S.postFooter}>
                <div style={S.postStat}><Icon d={ICONS.heart} size={11} color={C.mutedGray} strokeWidth={2} />&nbsp;{likeCount}</div>
                <div style={S.postStat}>
                  <Icon d={ICONS.comment} size={11} color={C.mutedGray} strokeWidth={2} />&nbsp;{commentCount}
                  &nbsp;&nbsp;
                  <Icon d={ICONS.eye} size={11} color={C.mutedGray} strokeWidth={2} />&nbsp;{post.views || 0}
                </div>
              </div>
              <div style={S.postActions}>
                {[{ icon: ICONS.heart, label: 'Like' }, { icon: ICONS.comment, label: 'Comment' }, { icon: ICONS.share, label: 'Share' }].map(({ icon, label }, idx) => (
                  <button key={label}
                    style={{ ...S.postActionBtn, borderRight: idx < 2 ? '1px solid rgba(27,43,75,0.05)' : 'none' }}
                    onClick={() => setSelectedPost(post)}
                    onMouseEnter={e => { e.currentTarget.style.background = C.pageBg; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                  >
                    <Icon d={icon} size={13} color={C.bodyGray} strokeWidth={1.8} />{label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Charts Panel
  const renderChartsPanel = () => (
    <div style={S.chartsPanel}>
      <div style={S.chartRow}>
        <div style={S.chartCard}>
          <p style={S.chartCardTitle}>
            <span style={S.chartDot(C.accent)} />
            Daily Trend — 14 days
          </p>
          <div style={S.chartContainer}>
            <Line data={dailyTrendsChartData} options={lineOptions} />
          </div>
        </div>
        <div style={S.chartCard}>
          <p style={S.chartCardTitle}>
            <span style={S.chartDot(C.warning)} />
            Report Status
          </p>
          <div style={S.chartContainer}>
            <PolarArea data={statusPolarData} options={polarOptions} />
          </div>
        </div>
      </div>
      <div style={S.chartRow}>
        <div style={S.chartCard}>
          <p style={S.chartCardTitle}>
            <span style={S.chartDot(C.success)} />
            Waste Classification
          </p>
          <div style={S.chartContainer}>
            {Object.keys(classificationData).length > 0
              ? <Pie data={classificationChartData} options={pieChartOptions} />
              : <div style={{ textAlign: 'center', paddingTop: 60, color: C.mutedGray, fontSize: 12 }}>No data</div>}
          </div>
        </div>
        <div style={S.chartCard}>
          <p style={S.chartCardTitle}>
            <span style={S.chartDot(C.danger)} />
            Most Scanned Items
          </p>
          <div style={S.chartContainer}>
            {mostScannedItems.length > 0
              ? <Bar data={mostScannedBarData} options={barOptions} />
              : <div style={{ textAlign: 'center', paddingTop: 60, color: C.mutedGray, fontSize: 12 }}>No scan data</div>}
          </div>
        </div>
      </div>
    </div>
  );

  // Dashboard
  const renderDashboard = () => {
    const weeklyGrowthPct = `${Math.abs(Math.round(dashboardStats.weeklyGrowth))}%`;
    const weeklyUp        = dashboardStats.weeklyGrowth >= 0;

    return (
      <>
        <SectionHeading>System Overview</SectionHeading>
        <div style={S.statsGrid}>
          <StatCard
            label="Total Reports"
            value={dashboardStats.totalReports.toLocaleString()}
            sub={`${weeklyGrowthPct} ${weeklyUp ? 'increase' : 'decrease'} vs last week`}
            color={C.accent}
            iconPath={ICONS.collection}
            trendUp={weeklyUp}
            trendPct={weeklyGrowthPct}
            sparkData={sparkReports}
            onClick={() => setActiveSection('collection')}
          />
          <StatCard
            label="Total Weight Collected"
            value={`${dashboardStats.totalWeight} kg`}
            sub={`${dashboardStats.totalReports} items scanned`}
            color={C.navyMid}
            iconPath={ICONS.weight}
            trendUp={true}
            trendPct={weeklyGrowthPct}
            sparkData={sparkWeight}
            onClick={() => setActiveSection('collection')}
          />
          <StatCard
            label="Total Users"
            value={userAnalytics.totalUsers.toLocaleString()}
            sub={`${userAnalytics.usersThisMonth} new this month`}
            color={C.success}
            iconPath={ICONS.users}
            trendUp={true}
            trendPct={`${userAnalytics.usersThisWeek} this wk`}
            sparkData={sparkUsers}
            onClick={() => setActiveSection('users')}
          />
          <StatCard
            label="Active Locations"
            value={locationAnalytics.totalUniqueLocations || 0}
            sub={`${locationAnalytics.top5Locations?.length || 0} hotspot areas`}
            color={C.danger}
            iconPath={ICONS.location}
            trendUp={false}
            trendPct={`${locationAnalytics.top5Locations?.length || 0} hot`}
            sparkData={sparkLocations}
            onClick={() => setActiveSection('map')}
          />
        </div>
        <div style={S.dashboardColumns}>
          {renderChartsPanel()}
          {renderFeedPanel()}
        </div>
      </>
    );
  };

  // Analytics
  const renderAnalytics = () => {
    const activeRate = userAnalytics.totalUsers > 0 ? Math.round((userAnalytics.activeUsers / userAnalytics.totalUsers) * 100) : 0;
    const maleRate   = userAnalytics.totalUsers > 0 ? Math.round((userAnalytics.maleUsers   / userAnalytics.totalUsers) * 100) : 0;

    return (
      <>
        <Analytics adminRole={adminRole} barangayName={getBarangayName(adminRole)} />

        <SectionHeading>User Analytics</SectionHeading>
        <div style={S.userAnalyticsCard}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid rgba(27,43,75,0.07)' }}>
            <div style={{ padding: '0 20px 0 0', borderRight: '1px solid rgba(27,43,75,0.07)', marginRight: 20 }}>
              <div style={S.userStatSectionLabel}>User Status</div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: C.success, lineHeight: 1, marginBottom: 3 }}>{userAnalytics.activeUsers}</div>
                  <div style={{ fontSize: 10.5, color: C.bodyGray }}>Active</div>
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: C.danger, lineHeight: 1, marginBottom: 3 }}>{userAnalytics.bannedUsers}</div>
                  <div style={{ fontSize: 10.5, color: C.bodyGray }}>Banned</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: C.mutedGray, marginBottom: 5 }}>Active Rate: {activeRate}%</div>
              <div style={S.activeRateBar}><div style={S.activeRateFill(activeRate, C.success)} /></div>
            </div>
            <div style={{ padding: '0 20px', borderRight: '1px solid rgba(27,43,75,0.07)' }}>
              <div style={S.userStatSectionLabel}>Gender Distribution</div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: C.accent, lineHeight: 1, marginBottom: 3 }}>{userAnalytics.maleUsers}</div>
                  <div style={{ fontSize: 10.5, color: C.bodyGray }}>Male</div>
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: C.warning, lineHeight: 1, marginBottom: 3 }}>{userAnalytics.femaleUsers}</div>
                  <div style={{ fontSize: 10.5, color: C.bodyGray }}>Female</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: C.mutedGray, marginBottom: 5 }}>Male: {maleRate}% · Female: {100 - maleRate}%</div>
              <div style={S.activeRateBar}><div style={S.activeRateFill(maleRate, C.accent)} /></div>
            </div>
            <div style={{ padding: '0 0 0 20px' }}>
              <div style={S.userStatSectionLabel}>Growth</div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: C.navyMid, lineHeight: 1, marginBottom: 3 }}>{userAnalytics.usersThisMonth}</div>
                  <div style={{ fontSize: 10.5, color: C.bodyGray }}>This Month</div>
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: C.accent, lineHeight: 1, marginBottom: 3 }}>{userAnalytics.usersThisWeek}</div>
                  <div style={{ fontSize: 10.5, color: C.bodyGray }}>This Week</div>
                </div>
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: C.navyDark }}>{userAnalytics.totalUsers}</div>
              <div style={{ fontSize: 11, color: C.mutedGray }}>Total Registered Users</div>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navyDark, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.success, display: 'inline-block', flexShrink: 0 }} />
              User Metrics Overview
            </div>
            <div style={{ height: 260 }}>
              {userAnalytics.totalUsers > 0
                ? <Radar data={userRadarData} options={radarOptions} />
                : <div style={{ textAlign: 'center', paddingTop: 80, color: C.mutedGray, fontSize: 13 }}>No user data available</div>}
            </div>
          </div>
        </div>

        <SectionHeading>Waste Analytics</SectionHeading>
        <div style={S.wasteAnalyticsGrid}>
          <div style={{ ...S.wasteCol, borderRight: '1px solid rgba(27,43,75,0.07)' }}>
            <div style={S.colHeader}>
              <span style={S.colHeaderDot(C.accent)} />
              <p style={S.colTitle}>Classification Breakdown</p>
            </div>
            {Object.keys(classificationData).length > 0 ? (
              <div style={{ height: 280 }}>
                <Pie data={classificationChartData} options={pieChartOptions} />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 280, color: C.mutedGray, gap: 8 }}>
                <Icon d={ICONS.chartPie} size={36} color={C.mutedGray} strokeWidth={1.2} />
                <span style={{ fontSize: 12 }}>No classification data</span>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ ...S.wasteCol, borderBottom: '1px solid rgba(27,43,75,0.07)' }}>
              <div style={S.colHeader}>
                <span style={S.colHeaderDot(C.navyMid)} />
                <p style={S.colTitle}>Most Scanned Items</p>
              </div>
              {mostScannedItems.length > 0 ? (
                <>
                  <div style={{ height: 150, marginBottom: 12 }}>
                    <Bar data={mostScannedBarData} options={barOptions} />
                  </div>
                  <div style={{ borderTop: '1px solid rgba(27,43,75,0.06)', paddingTop: 10 }}>
                    {mostScannedItems.slice(0, 5).map(([label, count], idx) => (
                      <div key={idx} style={S.scannedItem}>
                        <span style={S.scannedRank}>#{idx + 1}</span>
                        <span style={S.scannedLabel}>{label}</span>
                        <span style={S.scannedBadge(CHART_COLORS[idx % CHART_COLORS.length])}>{count}</span>
                      </div>
                    ))}
                    <div style={{ fontSize: 10.5, color: C.mutedGray, marginTop: 8, textAlign: 'right' }}>
                      {totalDetections} total detections
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 180, color: C.mutedGray, gap: 8 }}>
                  <Icon d={ICONS.scan} size={36} color={C.mutedGray} strokeWidth={1.2} />
                  <span style={{ fontSize: 12 }}>No scan data available</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={S.totalCollectedFull}>
          <div style={S.totalCollectedContent}>
            <div style={S.totalCollectedLeft}>
              <div style={S.weightCircleLarge}>
                <div style={S.weightNumLarge}>{dashboardStats.totalWeight}</div>
                <div style={S.weightUnitLarge}>kg</div>
              </div>
              <div style={S.statusBarsContainer}>
                {[
                  { label: 'Recycled',  value: dashboardStats.recycledReports,  color: C.success },
                  { label: 'Processed', value: dashboardStats.processedReports, color: C.accent  },
                  { label: 'Pending',   value: dashboardStats.pendingReports,   color: C.warning  },
                  { label: 'Disposed',  value: dashboardStats.disposedReports,  color: C.danger   },
                ].map(({ label, value, color }) => (
                  <div key={label} style={S.statusBarItem}>
                    <div style={S.statusBarLabel}>
                      <span style={S.statusBarLabelText}>{label}</span>
                      <span style={S.statusBarValue}>{value}</span>
                    </div>
                    <div style={S.statusBarTrack}>
                      <div style={S.statusBarFill(color, dashboardStats.totalReports > 0 ? (value / dashboardStats.totalReports) * 100 : 0)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={S.totalCollectedRight}>
              <div style={S.totalReportsValue}>{dashboardStats.totalReports}</div>
              <div style={S.totalReportsText}>Total Reports</div>
            </div>
          </div>
        </div>

        <div style={S.locationCard}>
          <div style={S.locationHeader}>
            <div style={S.colHeader}>
              <span style={S.colHeaderDot(C.danger)} />
              <p style={S.colTitle}>Location Breakdown</p>
            </div>
            {locationAnalytics.mostActiveLocation && (
              <div style={S.locationMostActive}>
                Most active: <strong style={{ color: C.danger }}>{locationAnalytics.mostActiveLocation.address}</strong>
                {' '}· {locationAnalytics.mostActiveLocation.count} reports
              </div>
            )}
          </div>
          {locationDetections.length > 0 ? (
            <>
              <div style={S.locationTableHeader}>
                <span>#</span><span>Location</span>
                <span style={{ textAlign: 'center' }}>Reports</span>
                <span style={{ textAlign: 'center' }}>Detections</span>
              </div>
              {locationDetections.map((loc) => (
                <div key={loc.rank} style={S.locationRow}
                  onMouseEnter={e => { e.currentTarget.style.background = C.pageBg; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  onClick={() => console.log('Selected location:', loc)}
                >
                  <span style={S.locationRank}>#{loc.rank}</span>
                  <span style={S.locationName}>{loc.name}</span>
                  <span style={{ ...S.locationReports, textAlign: 'center' }}>{loc.reports}</span>
                  <span style={{ textAlign: 'center' }}>
                    <span style={S.locationDetections}>{loc.detections}</span>
                  </span>
                </div>
              ))}
              <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(27,43,75,0.07)', display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: C.mutedGray }}>
                <span>Total Locations: {locationDetections.length}</span>
                <span>Total Reports: {locationDetections.reduce((sum, loc) => sum + loc.reports, 0)}</span>
                <span>Total Detections: {locationDetections.reduce((sum, loc) => sum + loc.detections, 0)}</span>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, color: C.mutedGray, gap: 8 }}>
              <Icon d={ICONS.location} size={36} color={C.mutedGray} strokeWidth={1.2} />
              <span style={{ fontSize: 12 }}>No location data available</span>
            </div>
          )}
        </div>
      </>
    );
  };

  const renderCollection = () => <Collection barangayFilter={adminRole === 'southadmin' ? 'south_signal' : adminRole === 'centraladmin' ? 'central_signal' : null} />;

  const renderMap = () => (
    <>
      <SectionHeading>Geographic Heat Map</SectionHeading>
      <div style={S.mapContainer}>
        <div style={S.mapControls}>
          <button style={S.mapControlBtn}><Icon d={ICONS.layers} size={13} color={C.bodyGray} strokeWidth={2} /> Heat by Weight</button>
        </div>
        <div style={S.mapLegend}>
          <div style={S.mapLegendTitle}>Collection Intensity</div>
          <div style={S.legendGradient} />
          <div style={S.legendLabels}><span>Low</span><span>Medium</span><span>High</span></div>
        </div>
        <div style={S.locationRanking}>
          <div style={S.locationRankingTitle}><Icon d={ICONS.trending} size={12} color={C.navyDark} strokeWidth={2} /> Top Collection Areas</div>
          {topLocations.slice(0, 5).map((loc, idx) => (
            <div key={idx} style={S.rankingItem}>
              <span style={S.rankingName}>{idx + 1}. {(loc.address || 'Unknown').substring(0, 22)}{(loc.address || '').length > 22 ? '…' : ''}</span>
              <span style={S.rankingCount}>{loc.count}</span>
            </div>
          ))}
        </div>
        <div style={S.mapInfo}><Icon d={ICONS.location} size={12} color={C.bodyGray} strokeWidth={2} /> {mapLocations.length} active collection points</div>
        <WasteHeatmap locations={mapLocations} topLocations={topLocations} adminRole={adminRole} onLocationClick={(loc) => console.log('Selected:', loc)} />
      </div>
    </>
  );

  const renderHistory = () => <History barangayFilter={adminRole === 'southadmin' ? 'south_signal' : adminRole === 'centraladmin' ? 'central_signal' : null} />;

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':  return renderDashboard();
      case 'analytics':  return renderAnalytics();
      case 'collection': return renderCollection();
      case 'map':        return renderMap();
      case 'users':      return <UserManagement barangayFilter={adminRole === 'southadmin' ? 'south_signal' : adminRole === 'centraladmin' ? 'central_signal' : null} adminRole={adminRole} />;
      case 'history':    return renderHistory();
      case 'waste':      return <WasteManagement barangayFilter={adminRole === 'southadmin' ? 'south_signal' : adminRole === 'centraladmin' ? 'central_signal' : null} />;
      case 'messages':   return <Message barangayFilter={adminRole === 'southadmin' ? 'south_signal' : adminRole === 'centraladmin' ? 'central_signal' : null} />;
      case 'posts':      return <Post adminRole={adminRole} currentUser={admin} />;
      case 'profile':    return <AdminProfiles admin={admin} onProfileUpdate={handleProfileUpdate} onDeleteProfilePicture={handleDeleteProfilePicture} />;
      default:           return renderDashboard();
    }
  };

  const adminInitials = admin?.email ? admin.email.split('@')[0].slice(0, 2).toUpperCase() : 'AD';

  return (
    <div style={S.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(27,43,75,0.12); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(27,43,75,0.22); }
        .leaflet-container { z-index: 1; }
        .leaflet-popup-content-wrapper { border-radius: 10px; font-family: 'Inter','DM Sans',sans-serif; box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
        .leaflet-popup-tip { display: none; }
      `}</style>

      <aside style={S.sidebar}>
        <div style={S.sidebarHeader}>
          <div style={S.logoWrap}>
            <img src="/TMFK.png" alt="TMFK" style={S.logoImg} />
            <div>
              <div style={S.logoTitle}>TMFK</div>
              <div style={S.logoSub}>Waste Innovations</div>
            </div>
          </div>
        </div>
        <nav style={S.nav}>
          {navSections.map(sec => {
            const items = navItems.filter(n => n.section === sec);
            if (!items.length) return null;
            return (
              <div key={sec} style={S.navSection}>
                <div style={S.navSectionLabel}>{sec}</div>
                {items.map(item => (
                  <div key={item.id} style={S.navItem(activeSection === item.id)}
                    onClick={() => setActiveSection(item.id)}
                    onMouseEnter={e => { if (activeSection !== item.id) e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                    onMouseLeave={e => { if (activeSection !== item.id) e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
                  >
                    <Icon d={item.icon} size={14} color={activeSection === item.id ? C.accent : 'rgba(255,255,255,0.38)'} strokeWidth={activeSection === item.id ? 2.2 : 1.8} />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </nav>
        <div style={S.sidebarFooter}>
          <div style={S.adminMini} onClick={() => setActiveSection('profile')}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
          >
            <div style={S.avatar}>
              {admin?.profile
                ? <img src={admin.profile} alt="Admin" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span>{adminInitials}</span>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={S.adminName}>{admin?.email?.split('@')[0] || 'Admin'}</div>
              <div style={S.adminRole}>
                {adminRole === 'southadmin' ? 'South Signal Admin' : adminRole === 'centraladmin' ? 'Central Signal Admin' : 'Super Admin'}
              </div>
            </div>
            <Icon d={ICONS.profile} size={13} color="rgba(255,255,255,0.25)" strokeWidth={1.8} />
          </div>
          <button style={S.logoutBtn} onClick={() => setShowLogoutConfirm(true)}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,67,54,0.13)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(244,67,54,0.07)'; }}
          >
            <Icon d={ICONS.logout} size={13} color="currentColor" strokeWidth={2} />Sign Out
          </button>
        </div>
      </aside>

      <main style={S.main}>
        <div style={S.topbar}>
          <div>
            <h1 style={S.pageTitle}>{pageTitles[activeSection]?.title}</h1>
            <p style={S.pageSub}>{pageTitles[activeSection]?.sub}</p>
          </div>
          <div style={S.dateChip}>
            <Icon d={ICONS.calendar} size={13} color={C.bodyGray} strokeWidth={1.8} />
            {new Date().toLocaleDateString('US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {error && (
          <div style={S.errorBar}>
            <Icon d={ICONS.alert} size={15} color={C.danger} strokeWidth={2} />
            <span>{error}</span>
            <button style={S.errClose} onClick={() => setError(null)}>
              <Icon d={ICONS.close} size={15} color={C.danger} strokeWidth={2} />
            </button>
          </div>
        )}

        <div style={S.content}>{renderSection()}</div>
      </main>

      {showLogoutConfirm && (
        <div style={S.overlay} onClick={() => setShowLogoutConfirm(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#FFEBEE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon d={ICONS.logout} size={18} color={C.danger} strokeWidth={2} />
              </div>
              <h3 style={S.modalTitle}>Confirm Sign Out</h3>
            </div>
            <p style={S.modalDesc}>Are you sure you want to sign out from TMFK Waste Innovations Admin Panel?</p>
            <div style={S.modalActions}>
              <button style={S.btnSecondary} onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
              <button style={S.btnDanger} onClick={handleLogout}>
                <Icon d={ICONS.logout} size={14} color={C.white} strokeWidth={2.2} />Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {renderPostModal()}
    </div>
  );
};

export default AdminDashboard;