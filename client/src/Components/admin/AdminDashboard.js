import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../Utils/Api';
import UsersManagement from '../admin/UsersManagement';
import FeedbackManagement from '../admin/FeedbackManagement';
import AdminProfiles from './AdminProfiles';
import Message from './Message';
import WasteManagement from './WasteManagement';

/* ─────────────────────────────────────────────────────────────
   INLINE STYLES — single-file, no external CSS dependency
───────────────────────────────────────────────────────────── */
const S = {
  /* Root */
  root: {
    display: 'flex',
    minHeight: '100vh',
    background: '#0d1117',
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    color: '#e2e8f0',
  },

  /* ── Sidebar ── */
  sidebar: {
    width: 260,
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #0f1923 0%, #0d1520 100%)',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 100,
  },
  sidebarHeader: {
    padding: '28px 24px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  logoWrap: { display: 'flex', alignItems: 'center', gap: 12 },
  logoMark: {
    width: 40,
    height: 40,
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
  },
  logoTitle: { fontSize: 15, fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.02em' },
  logoSub: { fontSize: 11, color: '#64748b', marginTop: 2, letterSpacing: '0.04em', textTransform: 'uppercase' },

  nav: { flex: 1, padding: '16px 12px', overflowY: 'auto' },
  navSection: { marginBottom: 24 },
  navSectionLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#475569',
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
    color: active ? '#10b981' : '#94a3b8',
    background: active ? 'rgba(16,185,129,0.1)' : 'transparent',
    borderLeft: active ? '2px solid #10b981' : '2px solid transparent',
    transition: 'all 0.15s ease',
    marginBottom: 2,
    userSelect: 'none',
  }),

  sidebarFooter: {
    padding: '16px 12px',
    borderTop: '1px solid rgba(255,255,255,0.05)',
  },
  adminMini: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 8,
    marginBottom: 8,
    background: 'rgba(255,255,255,0.03)',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 8,
    background: 'linear-gradient(135deg, #10b981, #0891b2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
    overflow: 'hidden',
  },
  adminName: { fontSize: 13, fontWeight: 600, color: '#e2e8f0' },
  adminRole: { fontSize: 11, color: '#475569' },
  logoutBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '9px 12px',
    borderRadius: 8,
    border: '1px solid rgba(239,68,68,0.2)',
    background: 'rgba(239,68,68,0.05)',
    color: '#f87171',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },

  /* ── Main ── */
  main: {
    marginLeft: 260,
    flex: 1,
    minHeight: '100vh',
    background: '#0d1117',
  },

  /* ── Topbar ── */
  topbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 32px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    background: 'rgba(13,17,23,0.8)',
    backdropFilter: 'blur(8px)',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  pageTitle: { fontSize: 20, fontWeight: 700, color: '#f1f5f9', margin: 0 },
  pageSub: { fontSize: 13, color: '#475569', margin: '3px 0 0' },
  dateChip: {
    fontSize: 12,
    color: '#64748b',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 6,
    padding: '6px 12px',
  },

  /* ── Content ── */
  content: { padding: '28px 32px' },

  /* ── Section title ── */
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#475569',
    marginBottom: 16,
    marginTop: 0,
  },

  /* ── Stat cards ── */
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    marginBottom: 28,
  },
  statCard: {
    background: 'linear-gradient(135deg, #131c27 0%, #111827 100%)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: '20px 22px',
    position: 'relative',
    overflow: 'hidden',
  },
  statCardAccent: (color) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 2,
    background: color,
  }),
  statIconBox: (color) => ({
    width: 38,
    height: 38,
    borderRadius: 9,
    background: color + '18',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  }),
  statLabel: { fontSize: 12, color: '#64748b', fontWeight: 500, marginBottom: 6 },
  statValue: { fontSize: 28, fontWeight: 800, color: '#f1f5f9', lineHeight: 1, marginBottom: 10 },
  statBadge: (positive) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 11,
    fontWeight: 600,
    color: positive ? '#10b981' : '#f87171',
    background: positive ? 'rgba(16,185,129,0.1)' : 'rgba(248,113,113,0.1)',
    borderRadius: 5,
    padding: '2px 7px',
  }),
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: '#10b981',
    display: 'inline-block',
    boxShadow: '0 0 6px #10b981',
    marginRight: 6,
  },

  /* ── Quick actions ── */
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 16,
    marginBottom: 28,
  },
  actionCard: (color) => ({
    background: 'linear-gradient(135deg, #131c27 0%, #111827 100%)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: '20px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative',
    overflow: 'hidden',
  }),
  actionIconBox: (color) => ({
    width: 42,
    height: 42,
    borderRadius: 10,
    background: color + '18',
    border: '1px solid ' + color + '30',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  }),
  actionTitle: { fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 5 },
  actionDesc: { fontSize: 12, color: '#64748b', lineHeight: 1.5, marginBottom: 12 },
  actionBadge: (color) => ({
    display: 'inline-block',
    fontSize: 11,
    fontWeight: 600,
    color: color,
    background: color + '15',
    border: '1px solid ' + color + '25',
    borderRadius: 5,
    padding: '2px 8px',
  }),

  /* ── Analytics grid ── */
  analyticsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 16,
    marginBottom: 28,
  },
  analyticsCard: {
    background: 'linear-gradient(135deg, #131c27 0%, #111827 100%)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: '22px',
  },
  analyticsCardTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: '#e2e8f0',
    marginBottom: 18,
    marginTop: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  titleDot: (color) => ({
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: color,
    flexShrink: 0,
  }),

  /* Mini stats */
  miniGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 18 },
  miniCard: {
    background: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    padding: '12px 14px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  miniValue: { fontSize: 20, fontWeight: 800, color: '#f1f5f9', marginBottom: 3 },
  miniLabel: { fontSize: 11, color: '#475569' },

  /* Bar chart rows */
  barRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  barLabel: { fontSize: 12, color: '#94a3b8', width: 70, flexShrink: 0 },
  barTrack: { flex: 1, height: 7, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' },
  barFill: (w, color) => ({
    height: '100%',
    width: `${w}%`,
    background: color,
    borderRadius: 4,
    transition: 'width 0.6s cubic-bezier(.4,0,.2,1)',
  }),
  barVal: { fontSize: 12, color: '#64748b', width: 30, textAlign: 'right', flexShrink: 0 },

  /* Waste grid */
  wasteGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16 },
  wasteItem: {
    background: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    padding: '14px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  wasteVal: { fontSize: 22, fontWeight: 800, color: '#f1f5f9', marginBottom: 3 },
  wasteLabel: { fontSize: 11, color: '#475569' },

  /* ── Modal ── */
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  modal: {
    background: '#131c27',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 32,
    width: 420,
    maxWidth: '90vw',
  },
  modalTitle: { fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 10, marginTop: 0 },
  modalDesc: { fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 24 },
  modalActions: { display: 'flex', gap: 10, justifyContent: 'flex-end' },
  btnSecondary: {
    padding: '9px 20px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'transparent',
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  btnDanger: {
    padding: '9px 20px',
    borderRadius: 8,
    border: 'none',
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: '#fff',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
  },

  /* Error */
  errorBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: 8,
    padding: '11px 16px',
    margin: '0 32px 16px',
    fontSize: 13,
    color: '#fca5a5',
  },
  errClose: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    color: '#f87171',
    cursor: 'pointer',
    fontSize: 18,
    lineHeight: 1,
  },

  /* Loading */
  loadWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#0d1117',
    gap: 16,
  },
  spinner: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    border: '3px solid rgba(16,185,129,0.15)',
    borderTop: '3px solid #10b981',
    animation: 'spin 0.8s linear infinite',
  },
  loadText: { fontSize: 14, color: '#475569' },
};

/* ─────────────────────────────────────────────────────────────
   ICON LIBRARY — consistent 20px stroke icons
───────────────────────────────────────────────────────────── */
const Icon = ({ d, size = 18, color = 'currentColor', strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const ICONS = {
  dashboard: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  users: ["M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2", "M23 21v-2a4 4 0 00-3-3.87", "M16 3.13a4 4 0 010 7.75", "M9 7a4 4 0 100 8 4 4 0 000-8z"],
  feedback: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  waste: ["M3 6h18", "M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6", "M10 11v6", "M14 11v6", "M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"],
  messages: ["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z", "M22 6l-10 7L2 6"],
  profile: ["M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2", "M12 11a4 4 0 100-8 4 4 0 000 8z"],
  logout: ["M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4", "M16 17l5-5-5-5", "M21 12H9"],
  shield: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"],
  alert: ["M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z", "M12 9v4", "M12 17h.01"],
  check: "M22 11.08V12a10 10 0 11-5.93-9.14",
  trending: ["M23 6l-9.5 9.5-5-5L1 18", "M17 6h6v6"],
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  recycle: ["M4 15l3 3 3-3", "M7 18V9.5C7 7 9 5 11.5 5H13", "M20 9l-3-3-3 3", "M17 6v8.5C17 17 15 19 12.5 19H11"],
};

/* ─────────────────────────────────────────────────────────────
   CHART COMPONENTS
───────────────────────────────────────────────────────────── */
const BarChart = ({ data, colors }) => {
  const max = Math.max(...Object.values(data), 1);
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  return (
    <div>
      {Object.entries(data).map(([label, val], i) => (
        <div key={label} style={S.barRow}>
          <span style={S.barLabel}>{label}</span>
          <div style={S.barTrack}>
            <div style={S.barFill((val / max) * 100, colors[i % colors.length])} />
          </div>
          <span style={S.barVal}>{total > 0 ? Math.round((val / total) * 100) : 0}%</span>
        </div>
      ))}
    </div>
  );
};

const RatingChart = ({ distribution }) => {
  const total = Object.values(distribution).reduce((a, b) => a + b, 0);
  const colors = { 5: '#10b981', 4: '#22c55e', 3: '#eab308', 2: '#f97316', 1: '#ef4444' };
  return (
    <div>
      {[5, 4, 3, 2, 1].map(r => (
        <div key={r} style={S.barRow}>
          <span style={{ ...S.barLabel, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon d={ICONS.star} size={11} color={colors[r]} strokeWidth={2} />
            <span style={{ fontSize: 12, color: '#94a3b8' }}>{r}</span>
          </span>
          <div style={S.barTrack}>
            <div style={S.barFill(total > 0 ? ((distribution[r] || 0) / total) * 100 : 0, colors[r])} />
          </div>
          <span style={S.barVal}>{distribution[r] || 0}</span>
        </div>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState(null);
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [wasteStats, setWasteStats] = useState(null);
  const [error, setError] = useState(null);
  const [hovered, setHovered] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');
    if (!token || !adminData) { navigate('/admin/login'); return; }
    try {
      setAdmin(JSON.parse(adminData));
      fetchAdminStats();
      fetchUserStatistics();
      fetchFeedbackStatistics();
      fetchWasteStatistics();
    } catch { navigate('/admin/login'); }
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

  const fetchAdminStats = async () => {
    try {
      setError(null);
      const [statsRes, usersRes] = await Promise.allSettled([
        fetchWithAuth('/api/feedback/stats'),
        fetchWithAuth('/api/users/all-users'),
      ]);
      const statsData = statsRes.status === 'fulfilled' ? statsRes.value : {};
      const totalUsers = usersRes.status === 'fulfilled' && Array.isArray(usersRes.value) ? usersRes.value.length : 0;
      setStats({ ...statsData, totalUsers });
    } catch (e) { setError(`Failed to load statistics: ${e.message}`); }
    finally { setLoading(false); }
  };

  const fetchUserStatistics = async () => {
    try {
      const data = await fetchWithAuth('/api/users/all-users');
      if (!Array.isArray(data)) return;
      const now = new Date();
      const activeUsers = data.filter(u => u.status === 'active').length;
      const newUsersThisMonth = data.filter(u => {
        const d = new Date(u.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length;
      const genderCounts = {};
      data.forEach(u => { const g = u.gender || 'not_specified'; genderCounts[g] = (genderCounts[g] || 0) + 1; });
      const usersByGender = {};
      Object.keys(genderCounts).forEach(g => { usersByGender[g] = Math.round((genderCounts[g] / data.length) * 100); });
      setUserStats({
        totalUsers: data.length, activeUsers, newUsersThisMonth, usersByGender,
        userGrowth: Math.round((newUsersThisMonth / ((data.length - newUsersThisMonth) || 1)) * 100) || 0,
      });
    } catch {}
  };

  const fetchFeedbackStatistics = async () => {
    try {
      const raw = await fetchWithAuth('/api/feedback/all');
      const list = raw.feedback || raw || [];
      const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      const categoryCounts = {};
      const statusCounts = {};
      list.forEach(f => {
        if (f.rating) ratingCounts[f.rating] = (ratingCounts[f.rating] || 0) + 1;
        const cat = f.category || 'general'; categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        const st = f.status || 'pending'; statusCounts[st] = (statusCounts[st] || 0) + 1;
      });
      const totalRatings = Object.values(ratingCounts).reduce((a, b) => a + b, 0);
      const averageRating = totalRatings > 0 ? list.reduce((s, i) => s + (i.rating || 0), 0) / totalRatings : 0;
      const repliedCount = list.filter(i => i.adminReply).length;
      setFeedbackStats({
        totalFeedback: list.length, averageRating, ratingDistribution: ratingCounts,
        feedbackByCategory: categoryCounts, responseRate: list.length > 0 ? Math.round((repliedCount / list.length) * 100) : 0,
        resolvedIssues: statusCounts.resolved || 0, pendingIssues: statusCounts.pending || 0,
      });
    } catch {}
  };

  const fetchWasteStatistics = async () => {
    try {
      const raw = await fetchWithAuth('/api/waste-reports');
      const reports = raw.reports || [];
      const classificationBreakdown = {};
      reports.forEach(r => {
        const c = r.classification;
        classificationBreakdown[c] = (classificationBreakdown[c] || 0) + 1;
      });
      setWasteStats({
        totalReports: reports.length,
        pending: reports.filter(r => r.status === 'pending').length,
        processed: reports.filter(r => r.status === 'processed').length,
        recycled: reports.filter(r => r.status === 'recycled').length,
        disposed: reports.filter(r => r.status === 'disposed').length,
        classificationBreakdown,
      });
    } catch {}
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
      localStorage.setItem('adminData', JSON.stringify(data.admin));
    } else throw new Error(data.message || 'Failed to update profile');
  };

  const handleDeleteProfilePicture = async () => {
    await fetchWithAuth('/api/admin/profile/picture', { method: 'DELETE' });
    const adminData = await fetchWithAuth('/api/admin/profile');
    if (adminData.admin) { setAdmin(adminData.admin); localStorage.setItem('adminData', JSON.stringify(adminData.admin)); }
  };

  /* ── Navigation items ── */
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: ICONS.dashboard, section: 'Overview' },
    { id: 'users', label: 'Users Management', icon: ICONS.users, section: 'Management' },
    { id: 'feedback', label: 'Feedback', icon: ICONS.feedback, section: 'Management' },
    { id: 'waste', label: 'Waste Reports', icon: ICONS.waste, section: 'Management' },
    { id: 'messages', label: 'Messages', icon: ICONS.messages, section: 'Management' },
    { id: 'profile', label: 'Admin Profile', icon: ICONS.profile, section: 'Account' },
  ];

  const sections = ['Overview', 'Management', 'Account'];

  /* ── Quick action configs ── */
  const actions = [
    { id: 'waste', label: 'Waste Reports', desc: 'Manage and classify waste detection reports', color: '#10b981', icon: ICONS.waste, badge: `${wasteStats?.pending || 0} pending` },
    { id: 'messages', label: 'Messages', desc: 'Communicate with users and team members', color: '#0ea5e9', icon: ICONS.messages, badge: 'Inbox' },
    { id: 'feedback', label: 'Feedback', desc: 'Review and respond to user submissions', color: '#f59e0b', icon: ICONS.feedback, badge: `${feedbackStats?.pendingIssues || 0} pending` },
    { id: 'users', label: 'User Accounts', desc: 'Manage accounts and access permissions', color: '#8b5cf6', icon: ICONS.users, badge: `${userStats?.totalUsers || 0} total` },
  ];

  /* ── Stat card configs ── */
  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: ICONS.users, color: '#8b5cf6', footer: `+${userStats?.userGrowth || 0}% this month`, positive: true },
    { label: 'Total Feedback', value: stats?.totalFeedback || 0, icon: ICONS.feedback, color: '#f59e0b', footer: `${feedbackStats?.responseRate || 0}% response rate`, positive: true },
    { label: 'Waste Reports', value: wasteStats?.totalReports || 0, icon: ICONS.waste, color: '#10b981', footer: `${Math.round((wasteStats?.recycled / (wasteStats?.totalReports || 1)) * 100) || 0}% recycling rate`, positive: true },
    { label: 'System Status', value: 'Operational', icon: ICONS.shield, color: '#0ea5e9', footer: '99.9% uptime', positive: true, isStatus: true },
  ];

  if (!admin && loading) {
    return (
      <div style={S.loadWrap}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={S.spinner} />
        <p style={S.loadText}>Loading WasteWise Admin...</p>
      </div>
    );
  }

  const renderDashboard = () => (
    <>
      {/* Stats */}
      <section style={{ marginBottom: 28 }}>
        <p style={S.sectionTitle}>System Overview</p>
        <div style={S.statsGrid}>
          {statCards.map((card, i) => (
            <div key={i} style={S.statCard}>
              <div style={S.statCardAccent(card.color)} />
              <div style={S.statIconBox(card.color)}>
                <Icon d={card.icon} size={18} color={card.color} strokeWidth={2} />
              </div>
              <div style={S.statLabel}>{card.label}</div>
              <div style={{ ...S.statValue, fontSize: card.isStatus ? 16 : 28 }}>
                {card.isStatus && <span style={S.statusDot} />}
                {card.value}
              </div>
              <div style={S.statBadge(card.positive)}>{card.footer}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section style={{ marginBottom: 28 }}>
        <p style={S.sectionTitle}>Quick Actions</p>
        <div style={S.actionsGrid}>
          {actions.map((a) => (
            <div
              key={a.id}
              style={{
                ...S.actionCard(a.color),
                borderColor: hovered === a.id ? a.color + '30' : 'rgba(255,255,255,0.06)',
                transform: hovered === a.id ? 'translateY(-2px)' : 'none',
                boxShadow: hovered === a.id ? `0 8px 24px ${a.color}18` : 'none',
              }}
              onClick={() => setActiveSection(a.id)}
              onMouseEnter={() => setHovered(a.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <div style={S.actionIconBox(a.color)}>
                <Icon d={a.icon} size={20} color={a.color} strokeWidth={1.8} />
              </div>
              <div style={S.actionTitle}>{a.label}</div>
              <div style={S.actionDesc}>{a.desc}</div>
              <div style={S.actionBadge(a.color)}>{a.badge}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Analytics */}
      <section>
        <p style={S.sectionTitle}>Analytics</p>
        <div style={S.analyticsGrid}>

          {/* Users */}
          <div style={S.analyticsCard}>
            <p style={S.analyticsCardTitle}>
              <span style={S.titleDot('#8b5cf6')} /> User Overview
            </p>
            <div style={S.miniGrid}>
              {[
                { v: userStats?.totalUsers || 0, l: 'Total' },
                { v: userStats?.activeUsers || 0, l: 'Active' },
                { v: userStats?.newUsersThisMonth || 0, l: 'This Month' },
              ].map((m, i) => (
                <div key={i} style={S.miniCard}>
                  <div style={S.miniValue}>{m.v}</div>
                  <div style={S.miniLabel}>{m.l}</div>
                </div>
              ))}
            </div>
            {Object.keys(userStats?.usersByGender || {}).length > 0 ? (
              <BarChart
                data={userStats.usersByGender}
                colors={['#8b5cf6', '#ec4899', '#06b6d4', '#64748b']}
              />
            ) : <div style={{ fontSize: 12, color: '#475569' }}>No demographic data available</div>}
          </div>

          {/* Feedback */}
          <div style={S.analyticsCard}>
            <p style={S.analyticsCardTitle}>
              <span style={S.titleDot('#f59e0b')} /> Feedback Analysis
            </p>
            <div style={S.miniGrid}>
              {[
                { v: feedbackStats?.totalFeedback || 0, l: 'Total' },
                { v: feedbackStats?.averageRating ? feedbackStats.averageRating.toFixed(1) : '0.0', l: 'Avg Rating' },
                { v: `${feedbackStats?.responseRate || 0}%`, l: 'Response Rate' },
              ].map((m, i) => (
                <div key={i} style={S.miniCard}>
                  <div style={S.miniValue}>{m.v}</div>
                  <div style={S.miniLabel}>{m.l}</div>
                </div>
              ))}
            </div>
            <RatingChart distribution={feedbackStats?.ratingDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }} />
          </div>

          {/* Waste */}
          <div style={S.analyticsCard}>
            <p style={S.analyticsCardTitle}>
              <span style={S.titleDot('#10b981')} /> Waste Management
            </p>
            <div style={S.wasteGrid}>
              {[
                { v: wasteStats?.totalReports || 0, l: 'Total Reports' },
                { v: wasteStats?.pending || 0, l: 'Pending Review' },
                { v: wasteStats?.recycled || 0, l: 'Recycled' },
                { v: `${Math.round((wasteStats?.recycled / (wasteStats?.totalReports || 1)) * 100) || 0}%`, l: 'Recycling Rate' },
              ].map((m, i) => (
                <div key={i} style={S.wasteItem}>
                  <div style={S.wasteVal}>{m.v}</div>
                  <div style={S.wasteLabel}>{m.l}</div>
                </div>
              ))}
            </div>
            {Object.keys(wasteStats?.classificationBreakdown || {}).length > 0 ? (
              <BarChart
                data={wasteStats.classificationBreakdown}
                colors={['#10b981', '#0ea5e9', '#f59e0b', '#8b5cf6', '#ef4444']}
              />
            ) : <div style={{ fontSize: 12, color: '#475569' }}>No classification data</div>}
          </div>

          {/* Feedback by Category */}
          <div style={S.analyticsCard}>
            <p style={S.analyticsCardTitle}>
              <span style={S.titleDot('#0ea5e9')} /> Feedback Categories
            </p>
            {Object.keys(feedbackStats?.feedbackByCategory || {}).length > 0 ? (
              <BarChart
                data={Object.fromEntries(
                  Object.entries(feedbackStats.feedbackByCategory).map(([k, v]) => [
                    k.charAt(0).toUpperCase() + k.slice(1), v
                  ])
                )}
                colors={['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#64748b']}
              />
            ) : <div style={{ fontSize: 12, color: '#475569' }}>No category data available</div>}
          </div>

        </div>
      </section>
    </>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'users': return <UsersManagement />;
      case 'feedback': return <FeedbackManagement />;
      case 'waste': return <WasteManagement />;
      case 'messages': return <Message />;
      case 'profile': return <AdminProfiles admin={admin} onProfileUpdate={handleProfileUpdate} onDeleteProfilePicture={handleDeleteProfilePicture} />;
      default: return renderDashboard();
    }
  };

  const sectionTitles = {
    dashboard: { title: 'Waste Management Dashboard', sub: `Welcome back, ${admin?.email?.split('@')[0] || 'Admin'}` },
    users: { title: 'Users Management', sub: 'Manage user accounts and permissions' },
    feedback: { title: 'Feedback Management', sub: 'Review and respond to user submissions' },
    waste: { title: 'Waste Reports', sub: 'Classify and manage waste detection reports' },
    messages: { title: 'Messages', sub: 'Internal communications' },
    profile: { title: 'Admin Profile', sub: 'Manage your account details' },
  };

  return (
    <div style={S.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
      `}</style>

      {/* ── Sidebar ── */}
      <aside style={S.sidebar}>
        <div style={S.sidebarHeader}>
          <div style={S.logoWrap}>
            <div style={S.logoMark}>
              <Icon d={ICONS.recycle} size={20} color="#fff" strokeWidth={2.2} />
            </div>
            <div>
              <div style={S.logoTitle}>T.M.F.K</div>
              <div style={S.logoSub}>Waste Innovations</div>
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
                      size={16}
                      color={activeSection === item.id ? '#10b981' : '#475569'}
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
          <div style={S.adminMini}>
            <div style={S.avatar}>
              {admin?.profile
                ? <img src={admin.profile} alt="Admin" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span>{admin?.email?.charAt(0).toUpperCase()}</span>
              }
            </div>
            <div>
              <div style={S.adminName}>{admin?.email?.split('@')[0] || 'Admin'}</div>
              <div style={S.adminRole}>Administrator</div>
            </div>
          </div>
          <button
            style={S.logoutBtn}
            onClick={() => setShowLogoutConfirm(true)}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.05)'; }}
          >
            <Icon d={ICONS.logout} size={15} color="#f87171" strokeWidth={2} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={S.main}>
        {/* Topbar */}
        <div style={S.topbar}>
          <div>
            <h1 style={S.pageTitle}>{sectionTitles[activeSection]?.title}</h1>
            <p style={S.pageSub}>{sectionTitles[activeSection]?.sub}</p>
          </div>
          <div style={S.dateChip}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={S.errorBar}>
            <Icon d={ICONS.alert} size={16} color="#f87171" strokeWidth={2} />
            <span>{error}</span>
            <button style={S.errClose} onClick={() => setError(null)}>×</button>
          </div>
        )}

        {/* Page content */}
        <div style={S.content}>
          {renderSection()}
        </div>
      </main>

      {/* ── Logout modal ── */}
      {showLogoutConfirm && (
        <div style={S.overlay} onClick={() => setShowLogoutConfirm(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <h3 style={S.modalTitle}>Confirm Sign Out</h3>
            <p style={S.modalDesc}>
              Are you sure you want to sign out? You will need to authenticate again to access the admin dashboard.
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