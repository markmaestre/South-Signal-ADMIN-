import React, { useState, useEffect } from 'react';
import API_URL from '../Utils/Api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Users, UserCheck, UserX, BarChart2, Download, RefreshCw,
  Search, ChevronDown, X, Eye, Shield, ShieldOff, Calendar,
  Mail, MapPin, User, Clock, Hash, Filter
} from 'lucide-react';

// ── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
  navyDark:  '#1B2B4B',
  navyMid:   '#2C4070',
  navyLight: '#3D5A8A',
  accent:    '#3B82F6',
  accentHov: '#2563EB',
  success:   '#10B981',
  warning:   '#F59E0B',
  danger:    '#EF4444',
  deepDark:  '#0F1E38',
  bodyGray:  '#64748B',
  mutedGray: '#94A3B8',
  border:    'rgba(27,43,75,0.09)',
  pageBg:    '#F8FAFC',
  white:     '#FFFFFF',
};

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  // Layout
  page: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    background: C.pageBg,
    minHeight: '100vh',
  },
  container: {
    background: C.white,
    borderRadius: 16,
    border: `1px solid ${C.border}`,
    boxShadow: '0 1px 4px rgba(27,43,75,0.06), 0 4px 24px rgba(27,43,75,0.04)',
    overflow: 'hidden',
  },

  // Header
  header: {
    padding: '24px 28px',
    borderBottom: `1px solid ${C.border}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 20,
    background: C.white,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    background: 'rgba(59,130,246,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: C.accent,
    flexShrink: 0,
  },
  title: {
    fontSize: 17,
    fontWeight: 700,
    color: C.navyDark,
    margin: 0,
    letterSpacing: '-0.01em',
  },
  subtitle: {
    fontSize: 12.5,
    color: C.mutedGray,
    marginTop: 3,
    letterSpacing: '0.01em',
  },
  headerStats: {
    display: 'flex',
    gap: 6,
  },
  statPill: (color) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '7px 14px',
    borderRadius: 8,
    background: color === 'blue' ? 'rgba(59,130,246,0.07)' :
                color === 'green' ? 'rgba(16,185,129,0.07)' : 'rgba(239,68,68,0.07)',
    border: `1px solid ${color === 'blue' ? 'rgba(59,130,246,0.15)' :
             color === 'green' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}`,
  }),
  statPillNum: (color) => ({
    fontSize: 15,
    fontWeight: 700,
    color: color === 'blue' ? C.accent : color === 'green' ? C.success : C.danger,
  }),
  statPillLabel: {
    fontSize: 11,
    color: C.bodyGray,
    fontWeight: 500,
  },

  // Analytics card
  analyticsCard: {
    padding: '20px 28px',
    borderBottom: `1px solid ${C.border}`,
    background: C.pageBg,
  },
  analyticsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 12,
  },
  analyticsTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    fontWeight: 600,
    color: C.navyDark,
  },
  analyticsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: 12,
  },
  analyticsItem: {
    background: C.white,
    borderRadius: 10,
    padding: '14px 16px',
    border: `1px solid ${C.border}`,
  },
  analyticsNum: {
    fontSize: 22,
    fontWeight: 800,
    color: C.navyDark,
    letterSpacing: '-0.02em',
    lineHeight: 1,
  },
  analyticsLabel: {
    fontSize: 11,
    color: C.mutedGray,
    marginTop: 5,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontWeight: 600,
  },

  // Date filters
  filterSection: {
    padding: '16px 28px',
    borderBottom: `1px solid ${C.border}`,
    background: C.white,
  },
  filterRow: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 11.5,
    fontWeight: 600,
    color: C.bodyGray,
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    minWidth: 100,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  quickBtn: (active) => ({
    padding: '6px 13px',
    borderRadius: 6,
    border: active ? `1.5px solid ${C.accent}` : `1px solid ${C.border}`,
    background: active ? C.accent : C.white,
    color: active ? C.white : C.bodyGray,
    fontSize: 12,
    fontWeight: active ? 600 : 500,
    cursor: 'pointer',
    transition: 'all 0.15s',
    fontFamily: "'DM Sans', sans-serif",
  }),
  dateInput: {
    padding: '7px 12px',
    border: `1px solid ${C.border}`,
    borderRadius: 7,
    fontSize: 12.5,
    fontFamily: "'DM Sans', sans-serif",
    color: C.navyDark,
    outline: 'none',
    background: C.white,
  },
  clearBtn: {
    padding: '6px 12px',
    borderRadius: 6,
    border: `1px solid rgba(239,68,68,0.25)`,
    background: 'rgba(239,68,68,0.06)',
    color: C.danger,
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontFamily: "'DM Sans', sans-serif",
  },

  // Search bar
  searchBar: {
    padding: '16px 28px',
    borderBottom: `1px solid ${C.border}`,
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
    background: C.white,
  },
  searchWrap: {
    flex: 1,
    position: 'relative',
    minWidth: 200,
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    color: C.mutedGray,
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '9px 12px 9px 36px',
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    fontSize: 13,
    fontFamily: "'DM Sans', sans-serif",
    color: C.navyDark,
    outline: 'none',
    background: C.pageBg,
    boxSizing: 'border-box',
    transition: 'border 0.15s',
  },
  selectWrap: {
    position: 'relative',
  },
  filterSelect: {
    padding: '9px 34px 9px 12px',
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    fontSize: 13,
    fontFamily: "'DM Sans', sans-serif",
    background: C.pageBg,
    color: C.navyDark,
    cursor: 'pointer',
    outline: 'none',
    appearance: 'none',
  },
  selectIcon: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    color: C.mutedGray,
  },

  // Buttons
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    padding: '9px 16px',
    borderRadius: 8,
    border: 'none',
    background: C.navyDark,
    color: C.white,
    fontSize: 12.5,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  },
  ghostBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '9px 14px',
    borderRadius: 8,
    border: `1px solid ${C.border}`,
    background: C.white,
    color: C.bodyGray,
    fontSize: 12.5,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'all 0.15s',
  },

  // Table
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left',
    padding: '11px 16px',
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    color: C.mutedGray,
    background: C.pageBg,
    borderBottom: `1px solid ${C.border}`,
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '13px 16px',
    fontSize: 13,
    color: C.bodyGray,
    borderBottom: `1px solid rgba(27,43,75,0.04)`,
    verticalAlign: 'middle',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 8,
    background: 'rgba(59,130,246,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 700,
    color: C.accent,
    overflow: 'hidden',
    flexShrink: 0,
    border: `1.5px solid rgba(59,130,246,0.15)`,
  },
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  username: { fontWeight: 600, color: C.navyDark, fontSize: 13 },
  badge: (status) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '4px 10px',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600,
    background: status === 'active' ? 'rgba(16,185,129,0.09)' : status === 'banned' ? 'rgba(239,68,68,0.09)' : 'rgba(245,158,11,0.09)',
    color: status === 'active' ? C.success : status === 'banned' ? C.danger : C.warning,
    border: `1px solid ${status === 'active' ? 'rgba(16,185,129,0.2)' : status === 'banned' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  }),
  actionBtnSm: (variant) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '5px 11px',
    borderRadius: 6,
    border: 'none',
    fontSize: 11.5,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'all 0.15s',
    marginRight: 6,
    background: variant === 'view' ? 'rgba(59,130,246,0.09)' : variant === 'ban' ? 'rgba(239,68,68,0.09)' : 'rgba(16,185,129,0.09)',
    color: variant === 'view' ? C.accent : variant === 'ban' ? C.danger : C.success,
    border: `1px solid ${variant === 'view' ? 'rgba(59,130,246,0.2)' : variant === 'ban' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
  }),

  // States
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
    color: C.mutedGray,
    gap: 12,
  },
  emptyState: {
    textAlign: 'center',
    padding: 60,
    color: C.mutedGray,
  },
  errorBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: '12px 24px',
    background: 'rgba(239,68,68,0.07)',
    borderBottom: `1px solid rgba(239,68,68,0.15)`,
    color: C.danger,
    fontSize: 13,
  },

  // Modal
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15,30,56,0.65)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  modal: {
    background: C.white,
    borderRadius: 16,
    width: 480,
    maxWidth: '90vw',
    maxHeight: '85vh',
    overflow: 'auto',
    boxShadow: '0 32px 64px rgba(0,0,0,0.18)',
  },
  modalHeader: {
    padding: '18px 22px',
    borderBottom: `1px solid ${C.border}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    background: C.white,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: C.navyDark,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  modalBody: { padding: '22px' },
  modalFooter: {
    padding: '14px 22px',
    borderTop: `1px solid ${C.border}`,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  closeIconBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: C.mutedGray,
    padding: 4,
    borderRadius: 6,
    display: 'flex',
  },
  modalAvatarWrap: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 22,
  },
  modalAvatar: {
    width: 72,
    height: 72,
    borderRadius: 14,
    background: 'rgba(59,130,246,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 26,
    fontWeight: 800,
    color: C.accent,
    overflow: 'hidden',
    border: `2px solid rgba(59,130,246,0.2)`,
  },
  infoRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    padding: '11px 0',
    borderBottom: `1px solid rgba(27,43,75,0.05)`,
  },
  infoIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 6,
    background: C.pageBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: C.mutedGray,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 13,
    color: C.navyDark,
    fontWeight: 500,
  },
};

// ── Subcomponents ─────────────────────────────────────────────────────────────
const StatPill = ({ icon: Icon, value, label, color }) => (
  <div style={S.statPill(color)}>
    <Icon size={14} color={color === 'blue' ? C.accent : color === 'green' ? C.success : C.danger} strokeWidth={2.5} />
    <div>
      <div style={S.statPillNum(color)}>{value}</div>
      <div style={S.statPillLabel}>{label}</div>
    </div>
  </div>
);

const AnalyticsItem = ({ value, label, color }) => (
  <div style={S.analyticsItem}>
    <div style={{ ...S.analyticsNum, color: color || C.navyDark }}>{value}</div>
    <div style={S.analyticsLabel}>{label}</div>
  </div>
);

const StatusBadge = ({ status }) => {
  const Icon = status === 'active' ? UserCheck : status === 'banned' ? UserX : User;
  return (
    <span style={S.badge(status)}>
      <Icon size={10} strokeWidth={2.5} />
      {status?.toUpperCase() || 'ACTIVE'}
    </span>
  );
};

const InfoRow = ({ icon: Icon, label, value }) => (
  <div style={S.infoRow}>
    <div style={S.infoIconWrap}>
      <Icon size={13} color={C.mutedGray} strokeWidth={2} />
    </div>
    <div>
      <div style={S.infoLabel}>{label}</div>
      <div style={S.infoValue}>{value || '—'}</div>
    </div>
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────────
const UserManagement = ({ barangayFilter, adminRole }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [quickFilter, setQuickFilter] = useState('all');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('No authentication token found');
      const adminType = adminRole === 'southadmin' ? 'southadmin' : adminRole === 'centraladmin' ? 'centraladmin' : '';
      const url = adminType ? `${API_URL}/api/users/all-users?adminType=${adminType}` : `${API_URL}/api/users/all-users`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch users: ${response.status}`);
      }
      let allUsers = await response.json();
      allUsers = allUsers.filter(u => u.status !== 'pending');
      setUsers(allUsers);
      setFilteredUsers(allUsers);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyDateFilter = (list, range) => {
    if (!range.start && !range.end) return list;
    return list.filter(u => {
      const d = new Date(u.createdAt);
      if (range.start && range.end) return d >= new Date(range.start) && d <= new Date(range.end);
      if (range.start) return d >= new Date(range.start);
      return d <= new Date(range.end);
    });
  };

  const applyQuickFilter = (list, type) => {
    const today = new Date(); today.setHours(0,0,0,0);
    if (type === 'week') { const d = new Date(today); d.setDate(d.getDate()-7); return list.filter(u => new Date(u.createdAt) >= d); }
    if (type === 'month') { const d = new Date(today); d.setMonth(d.getMonth()-1); return list.filter(u => new Date(u.createdAt) >= d); }
    if (type === 'year') { const d = new Date(today); d.setFullYear(d.getFullYear()-1); return list.filter(u => new Date(u.createdAt) >= d); }
    return list;
  };

  useEffect(() => { fetchUsers(); }, [adminRole]);

  useEffect(() => {
    let f = [...users];
    if (quickFilter !== 'all') f = applyQuickFilter(f, quickFilter);
    if (dateRange.start || dateRange.end) f = applyDateFilter(f, dateRange);
    if (searchTerm) f = f.filter(u => u.username?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    if (statusFilter !== 'all') f = f.filter(u => u.status === statusFilter);
    setFilteredUsers(f);
  }, [searchTerm, statusFilter, users, dateRange, quickFilter]);

  const handleQuickFilter = (f) => {
    setQuickFilter(f);
    if (f !== 'all') setDateRange({ start: '', end: '' });
  };

  const handleDateRangeChange = (type, value) => {
    setDateRange(prev => ({ ...prev, [type]: value }));
    if (value) setQuickFilter('all');
  };

  const handleBanUser = async (userId, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus === 'active' ? 'ban' : 'activate'} this user?`)) return;
    try {
      const token = localStorage.getItem('adminToken');
      const newStatus = currentStatus === 'active' ? 'banned' : 'active';
      const res = await fetch(`${API_URL}/api/users/ban/${userId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Failed to update user status'); }
      await fetchUsers();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const getAnalytics = () => {
    const totalUsers = filteredUsers.length;
    const activeUsers = filteredUsers.filter(u => u.status === 'active').length;
    const bannedUsers = filteredUsers.filter(u => u.status === 'banned').length;
    const maleUsers = filteredUsers.filter(u => u.gender?.toLowerCase() === 'male').length;
    const femaleUsers = filteredUsers.filter(u => u.gender?.toLowerCase() === 'female').length;
    const southSignalUsers = filteredUsers.filter(u => u.barangay === 'South Signal').length;
    const centralBicutanUsers = filteredUsers.filter(u => u.barangay === 'Central Bicutan').length;
    const now = new Date();
    const thisMonth = filteredUsers.filter(u => { const d = new Date(u.createdAt); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).length;
    const thisWeek = filteredUsers.filter(u => { const d = new Date(u.createdAt); const w = new Date(now); w.setDate(now.getDate()-7); return d >= w; }).length;
    return { totalUsers, activeUsers, bannedUsers, maleUsers, femaleUsers, southSignalUsers, centralBicutanUsers, thisMonth, thisWeek, activePercentage: totalUsers > 0 ? ((activeUsers/totalUsers)*100).toFixed(1) : 0 };
  };

  const generatePDF = () => {
    const analytics = getAnalytics();
    const doc = new jsPDF();
    doc.setFontSize(20); doc.setTextColor(27,43,75); doc.text('User Analytics Report', 14, 20);
    doc.setFontSize(12); doc.setTextColor(84,110,122);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Barangay: ${adminRole === 'southadmin' ? 'South Signal' : adminRole === 'centraladmin' ? 'Central Bicutan' : 'All Barangays'}`, 14, 38);
    doc.text(`Date Range: ${quickFilter !== 'all' ? quickFilter.toUpperCase() : dateRange.start || dateRange.end ? 'Custom Range' : 'All Time'}`, 14, 46);
    doc.setFontSize(14); doc.setTextColor(27,43,75); doc.text('Summary Statistics', 14, 58);
    autoTable(doc, {
      startY: 62,
      head: [['Metric','Value']],
      body: [
        ['Total Users', analytics.totalUsers.toString()],
        ['Active Users', `${analytics.activeUsers} (${analytics.activePercentage}%)`],
        ['Banned Users', analytics.bannedUsers.toString()],
        ['Male Users', analytics.maleUsers.toString()],
        ['Female Users', analytics.femaleUsers.toString()],
        [`${adminRole === 'southadmin' ? 'South Signal' : 'Central Bicutan'} Residents`, adminRole === 'southadmin' ? analytics.southSignalUsers.toString() : analytics.centralBicutanUsers.toString()],
        ['New Users (This Month)', analytics.thisMonth.toString()],
        ['New Users (This Week)', analytics.thisWeek.toString()],
      ],
      theme: 'striped',
      headStyles: { fillColor: [59,130,246], textColor:[255,255,255], fontStyle:'bold' },
      bodyStyles: { textColor:[84,110,122] },
      margin: { left:14, right:14 },
    });
    let finalY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14); doc.setTextColor(27,43,75); doc.text('User Details', 14, finalY);
    autoTable(doc, {
      startY: finalY + 5,
      head: [['Username','Email','Barangay','Gender','Status','Joined Date']],
      body: filteredUsers.map(u => [u.username||'—', u.email||'—', u.barangay||'—', u.gender||'—', u.status?.toUpperCase()||'—', new Date(u.createdAt).toLocaleDateString()]),
      theme: 'striped',
      headStyles: { fillColor:[59,130,246], textColor:[255,255,255], fontStyle:'bold' },
      bodyStyles: { textColor:[84,110,122] },
      margin: { left:14, right:14 },
      didDrawPage: (data) => {
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8); doc.setTextColor(150,150,150);
        doc.text(`Page ${data.pageNumber} of ${pageCount}`, doc.internal.pageSize.getWidth()/2, doc.internal.pageSize.getHeight()-10, { align:'center' });
      },
    });
    doc.save(`user-analytics-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const getAvatar = (user, large = false) => {
    const style = large ? S.modalAvatar : S.avatar;
    if (user.profile) return <div style={style}><img src={user.profile} alt={user.username} style={S.avatarImg} /></div>;
    return <div style={style}>{user.username?.charAt(0).toUpperCase() || 'U'}</div>;
  };

  const stats = { total: users.length, active: users.filter(u => u.status==='active').length, banned: users.filter(u => u.status==='banned').length };
  const analytics = getAnalytics();

  if (loading) return (
    <div style={S.container}>
      <div style={S.loading}>
        <RefreshCw size={28} color={C.mutedGray} style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        <span style={{ fontSize: 13 }}>Loading users…</span>
      </div>
    </div>
  );

  return (
    <div style={S.container}>

      {/* ── Header ── */}
      <div style={S.header}>
        <div style={S.headerLeft}>
          <div style={S.headerIcon}><Users size={20} strokeWidth={2} /></div>
          <div>
            <h3 style={S.title}>User Management</h3>
            <p style={S.subtitle}>
              {adminRole === 'southadmin' ? 'South Signal Residents' : adminRole === 'centraladmin' ? 'Central Bicutan Residents' : 'All Registered Users'}
            </p>
          </div>
        </div>
        <div style={S.headerStats}>
          <StatPill icon={Users} value={stats.total} label="Total" color="blue" />
          <StatPill icon={UserCheck} value={stats.active} label="Active" color="green" />
          <StatPill icon={UserX} value={stats.banned} label="Banned" color="red" />
        </div>
      </div>

      {/* ── Analytics ── */}
      <div style={S.analyticsCard}>
        <div style={S.analyticsHeader}>
          <div style={S.analyticsTitleRow}>
            <BarChart2 size={15} color={C.accent} strokeWidth={2} />
            Analytics Summary
          </div>
          <button
            style={{ ...S.primaryBtn, opacity: filteredUsers.length === 0 ? 0.5 : 1, cursor: filteredUsers.length === 0 ? 'not-allowed' : 'pointer' }}
            onClick={generatePDF}
            disabled={filteredUsers.length === 0}
          >
            <Download size={14} strokeWidth={2.5} />
            Download PDF Report
          </button>
        </div>
        <div style={S.analyticsGrid}>
          <AnalyticsItem value={analytics.totalUsers} label="Filtered Users" color={C.accent} />
          <AnalyticsItem value={`${analytics.activeUsers} (${analytics.activePercentage}%)`} label="Active" color={C.success} />
          <AnalyticsItem value={analytics.bannedUsers} label="Banned" color={C.danger} />
          <AnalyticsItem value={analytics.thisMonth} label="New This Month" />
          <AnalyticsItem value={analytics.thisWeek} label="New This Week" />
          <AnalyticsItem
            value={adminRole === 'southadmin' ? analytics.southSignalUsers : adminRole === 'centraladmin' ? analytics.centralBicutanUsers : analytics.southSignalUsers + analytics.centralBicutanUsers}
            label={adminRole === 'southadmin' ? 'South Signal' : adminRole === 'centraladmin' ? 'Central Bicutan' : 'Total Residents'}
          />
        </div>
      </div>

      {/* ── Date Filters ── */}
      <div style={S.filterSection}>
        <div style={S.filterRow}>
          <span style={S.filterLabel}><Filter size={11} strokeWidth={2.5} />Quick Filter</span>
          {['all','week','month','year'].map(f => (
            <button key={f} style={S.quickBtn(quickFilter === f)} onClick={() => handleQuickFilter(f)}>
              {f === 'all' ? 'All Time' : f === 'week' ? 'Last 7 Days' : f === 'month' ? 'This Month' : 'This Year'}
            </button>
          ))}
        </div>
        <div style={S.filterRow}>
          <span style={S.filterLabel}><Calendar size={11} strokeWidth={2.5} />Date Range</span>
          <input type="date" style={S.dateInput} value={dateRange.start} onChange={e => handleDateRangeChange('start', e.target.value)} />
          <span style={{ fontSize: 12, color: C.mutedGray }}>to</span>
          <input type="date" style={S.dateInput} value={dateRange.end} onChange={e => handleDateRangeChange('end', e.target.value)} />
          {(dateRange.start || dateRange.end) && (
            <button style={S.clearBtn} onClick={() => { setDateRange({ start:'', end:'' }); setQuickFilter('all'); }}>
              <X size={11} strokeWidth={2.5} />Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Search & Status ── */}
      <div style={S.searchBar}>
        <div style={S.searchWrap}>
          <Search size={14} style={S.searchIcon} strokeWidth={2.5} />
          <input
            type="text"
            placeholder="Search by name or email…"
            style={S.searchInput}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={S.selectWrap}>
          <select style={S.filterSelect} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="banned">Banned</option>
          </select>
          <ChevronDown size={13} style={S.selectIcon} strokeWidth={2.5} />
        </div>
        <button style={S.ghostBtn} onClick={fetchUsers}>
          <RefreshCw size={13} strokeWidth={2.5} />Refresh
        </button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={S.errorBar}>
          <UserX size={15} strokeWidth={2} />
          {error}
          <button onClick={fetchUsers} style={{ ...S.ghostBtn, padding:'4px 10px', fontSize:12 }}>Retry</button>
        </div>
      )}

      {/* ── Table ── */}
      {!error && (
        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>User</th>
                <th style={S.th}>Email</th>
                <th style={S.th}>Barangay</th>
                <th style={S.th}>Gender</th>
                <th style={S.th}>Status</th>
                <th style={S.th}>Joined</th>
                <th style={S.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <div style={S.emptyState}>
                      <Users size={36} color={C.border} style={{ display:'block', margin:'0 auto 12px' }} />
                      No users found for the selected filters
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.map(user => (
                <tr key={user._id} style={{ transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = C.pageBg}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={S.td}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      {getAvatar(user)}
                      <span style={S.username}>{user.username}</span>
                    </div>
                  </td>
                  <td style={S.td}>{user.email}</td>
                  <td style={S.td}>{user.barangay || '—'}</td>
                  <td style={S.td}>{user.gender || '—'}</td>
                  <td style={S.td}><StatusBadge status={user.status} /></td>
                  <td style={S.td}>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td style={S.td}>
                    <button style={S.actionBtnSm('view')} onClick={() => { setSelectedUser(user); setShowModal(true); }}>
                      <Eye size={11} strokeWidth={2.5} />View
                    </button>
                    <button
                      style={S.actionBtnSm(user.status === 'active' ? 'ban' : 'activate')}
                      onClick={() => handleBanUser(user._id, user.status)}
                    >
                      {user.status === 'active'
                        ? <><ShieldOff size={11} strokeWidth={2.5} />Ban</>
                        : <><Shield size={11} strokeWidth={2.5} />Activate</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── User Detail Modal ── */}
      {showModal && selectedUser && (
        <div style={S.overlay} onClick={() => setShowModal(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={S.modalHeader}>
              <div style={S.modalTitle}>
                <User size={16} color={C.accent} strokeWidth={2} />
                User Details
              </div>
              <button style={S.closeIconBtn} onClick={() => setShowModal(false)}>
                <X size={18} strokeWidth={2} />
              </button>
            </div>
            <div style={S.modalBody}>
              <div style={S.modalAvatarWrap}>{getAvatar(selectedUser, true)}</div>
              <InfoRow icon={Hash} label="Username" value={selectedUser.username} />
              <InfoRow icon={Mail} label="Email" value={selectedUser.email} />
              <InfoRow icon={User} label="Gender" value={selectedUser.gender} />
              <InfoRow icon={Calendar} label="Date of Birth" value={selectedUser.bod} />
              <InfoRow icon={MapPin} label="Address" value={selectedUser.address} />
              <InfoRow icon={MapPin} label="Barangay" value={selectedUser.barangay} />
              <div style={S.infoRow}>
                <div style={S.infoIconWrap}><Shield size={13} color={C.mutedGray} strokeWidth={2} /></div>
                <div>
                  <div style={S.infoLabel}>Status</div>
                  <div style={{ marginTop: 2 }}><StatusBadge status={selectedUser.status} /></div>
                </div>
              </div>
              <InfoRow icon={Clock} label="Member Since" value={new Date(selectedUser.createdAt).toLocaleString()} />
              <InfoRow icon={Clock} label="Last Login" value={selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : null} />
            </div>
            <div style={S.modalFooter}>
              <button style={S.ghostBtn} onClick={() => setShowModal(false)}>
                <X size={13} strokeWidth={2.5} />Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;