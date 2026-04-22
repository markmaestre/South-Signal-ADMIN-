import React, { useState, useEffect } from 'react';
import API_URL from '../Utils/Api';

/* ─────────────────────────────────────────────────────────────
   ICON SYSTEM
───────────────────────────────────────────────────────────── */
const Icon = ({ d, size = 16, color = 'currentColor', strokeWidth = 1.8, fill = 'none' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0 }}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const ICONS = {
  search: ["M21 21l-4.35-4.35", "M17 11A6 6 0 115 11a6 6 0 0112 0z"],
  filter: "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
  x: "M18 6L6 18M6 6l12 12",
  xCircle: ["M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10z", "M15 9l-6 6M9 9l6 6"],
  check: "M20 6L9 17l-5-5",
  checkCircle: ["M22 11.08V12a10 10 0 11-5.93-9.14", "M22 4L12 14.01l-3-3"],
  users: ["M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2", "M23 21v-2a4 4 0 00-3-3.87", "M16 3.13a4 4 0 010 7.75", "M9 7a4 4 0 100 8 4 4 0 000-8z"],
  ban: ["M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10z", "M4.93 4.93l14.14 14.14"],
  userCheck: ["M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2", "M9 7a4 4 0 100 8 4 4 0 000-8z", "M17 11l2 2 4-4"],
  calendar: ["M3 4h18v18H3z", "M16 2v4M8 2v4M3 10h18"],
  clock: ["M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10z", "M12 6v6l4 2"],
  chevronRight: "M9 18l6-6-6-6",
  tag: ["M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z", "M7 7h.01"],
  shield: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"],
  male: ["M10 14a5 5 0 100-10 5 5 0 000 10z", "M21 3l-6 6", "M15 3h6v6"],
  female: ["M12 12a5 5 0 100-10 5 5 0 000 10z", "M12 17v5", "M9 20h6"],
  alert: ["M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z", "M12 9v4", "M12 17h.01"],
};

/* ─────────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────── */
const S = {
  root: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    color: '#e2e8f0',
    minHeight: '100%',
  },

  /* ── Search bar ── */
  searchRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  searchWrap: {
    position: 'relative',
    flex: 1,
  },
  searchInput: {
    width: '100%',
    padding: '10px 14px 10px 40px',
    background: '#131c27',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    color: '#e2e8f0',
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  },
  searchIcon: {
    position: 'absolute',
    left: 13,
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
  },
  countChip: {
    fontSize: 12,
    color: '#64748b',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 6,
    padding: '8px 14px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },

  /* ── Filter panel ── */
  filterPanel: {
    background: '#131c27',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 10,
    padding: '16px 20px',
    marginBottom: 20,
  },
  filterHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  filterTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    fontWeight: 600,
    color: '#94a3b8',
    margin: 0,
  },
  clearBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '5px 10px',
    borderRadius: 6,
    border: '1px solid rgba(239,68,68,0.25)',
    background: 'rgba(239,68,68,0.06)',
    color: '#f87171',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  filterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 12,
  },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  filterLabel: { fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#475569' },
  filterSelect: {
    padding: '8px 12px',
    background: '#0d1117',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 7,
    color: '#e2e8f0',
    fontSize: 13,
    outline: 'none',
    cursor: 'pointer',
  },
  activeTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
    paddingTop: 14,
    borderTop: '1px solid rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  activeTagsLabel: { fontSize: 11, color: '#475569', fontWeight: 600, marginRight: 4 },
  tag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    fontWeight: 500,
    color: '#10b981',
    background: 'rgba(16,185,129,0.1)',
    border: '1px solid rgba(16,185,129,0.2)',
    borderRadius: 5,
    padding: '3px 8px',
  },
  tagClose: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#10b981',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    lineHeight: 1,
  },

  /* ── Alert ── */
  alert: (isError) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '11px 16px',
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 13,
    background: isError ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)',
    border: `1px solid ${isError ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
    color: isError ? '#fca5a5' : '#6ee7b7',
  }),

  /* ── Table ── */
  tableWrap: {
    background: '#131c27',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 13,
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
    color: '#475569',
    background: '#0f1923',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '13px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    color: '#94a3b8',
    verticalAlign: 'middle',
  },

  /* User cell */
  userCell: { display: 'flex', alignItems: 'center', gap: 10 },
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
  userName: { fontSize: 13, fontWeight: 600, color: '#e2e8f0' },
  userEmail: { fontSize: 11, color: '#475569', marginTop: 1 },

  /* Badges */
  badge: (bg, color, border) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 11,
    fontWeight: 600,
    color,
    background: bg,
    border: `1px solid ${border}`,
    borderRadius: 5,
    padding: '3px 8px',
    whiteSpace: 'nowrap',
  }),

  statusDot: (color) => ({
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: color,
    flexShrink: 0,
    ...(color === '#10b981' ? { boxShadow: '0 0 5px #10b981' } : {}),
  }),

  /* Action buttons */
  banBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '7px 12px',
    borderRadius: 7,
    border: '1px solid rgba(239,68,68,0.25)',
    background: 'rgba(239,68,68,0.07)',
    color: '#f87171',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  },
  activateBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '7px 12px',
    borderRadius: 7,
    border: '1px solid rgba(16,185,129,0.25)',
    background: 'rgba(16,185,129,0.07)',
    color: '#10b981',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  },

  /* Empty state */
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '64px 32px',
    gap: 12,
  },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.07)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 15, fontWeight: 700, color: '#e2e8f0', margin: 0 },
  emptyDesc: { fontSize: 13, color: '#475569', margin: 0, textAlign: 'center' },

  /* Loading */
  loadWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 32px',
    gap: 16,
  },
  spinner: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    border: '3px solid rgba(16,185,129,0.15)',
    borderTop: '3px solid #10b981',
    animation: 'spin 0.8s linear infinite',
  },
  loadText: { fontSize: 13, color: '#475569' },
};

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────── */
const roleBadge = (role) => {
  const map = {
    admin: ['rgba(139,92,246,0.12)', '#a78bfa', 'rgba(139,92,246,0.25)'],
    user:  ['rgba(14,165,233,0.1)',  '#38bdf8', 'rgba(14,165,233,0.22)'],
  };
  const [bg, color, border] = map[role?.toLowerCase()] || ['rgba(100,116,139,0.1)', '#94a3b8', 'rgba(100,116,139,0.2)'];
  return S.badge(bg, color, border);
};

const statusConfig = {
  active: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', label: 'Active' },
  banned: { color: '#f87171', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', label: 'Banned' },
};
const getStatus = (status) => statusConfig[status?.toLowerCase()] || { color: '#64748b', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.2)', label: status };

const genderConfig = {
  male:   { color: '#38bdf8', bg: 'rgba(14,165,233,0.1)',  border: 'rgba(14,165,233,0.22)',  icon: ICONS.male },
  female: { color: '#f472b6', bg: 'rgba(236,72,153,0.1)',  border: 'rgba(236,72,153,0.22)',  icon: ICONS.female },
};
const getGender = (g) => genderConfig[g?.toLowerCase()] || { color: '#64748b', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.2)', icon: ICONS.tag };

/* ─────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────── */
const UsersManagement = () => {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [message, setMessage]   = useState('');
  const [searchTerm, setSearch] = useState('');
  const [filters, setFilters]   = useState({ role: 'all', status: 'all', gender: 'all' });
  const [hoveredRow, setHoveredRow] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/users/all-users`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      setUsers(await res.json());
    } catch (e) {
      setMessage('Error fetching users: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'banned' : 'active';
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/users/ban/${userId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update user status');
      setUsers(users.map(u => u._id === userId ? { ...u, status: newStatus } : u));
      setMessage(`User ${newStatus === 'banned' ? 'banned' : 'activated'} successfully`);
      setTimeout(() => setMessage(''), 3000);
    } catch (e) {
      setMessage('Error updating user status: ' + e.message);
    }
  };

  const updateFilter = (k, v) => setFilters(p => ({ ...p, [k]: v }));
  const clearFilters = () => setFilters({ role: 'all', status: 'all', gender: 'all' });

  const filtered = users.filter(u => {
    const s = searchTerm.toLowerCase();
    const matchSearch = !searchTerm ||
      u.username?.toLowerCase().includes(s) ||
      u.email?.toLowerCase().includes(s) ||
      u.role?.toLowerCase().includes(s) ||
      u.gender?.toLowerCase().includes(s) ||
      u.status?.toLowerCase().includes(s);
    return matchSearch
      && (filters.role   === 'all' || u.role   === filters.role)
      && (filters.status === 'all' || u.status === filters.status)
      && (filters.gender === 'all' || u.gender === filters.gender);
  });

  const uniqueRoles    = [...new Set(users.map(u => u.role).filter(Boolean))];
  const uniqueStatuses = [...new Set(users.map(u => u.status).filter(Boolean))];
  const uniqueGenders  = [...new Set(users.map(u => u.gender).filter(Boolean))];
  const activeCount    = Object.values(filters).filter(v => v !== 'all').length;

  if (loading) return (
    <div style={S.loadWrap}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={S.spinner} />
      <p style={S.loadText}>Loading users...</p>
    </div>
  );

  const COLS = ['User', 'Role', 'Status', 'Gender', 'Joined', 'Last Login', 'Action'];

  return (
    <div style={S.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        select option { background: #131c27; color: #e2e8f0; }
      `}</style>

      {/* Search row */}
      <div style={S.searchRow}>
        <div style={S.searchWrap}>
          <span style={S.searchIcon}>
            <Icon d={ICONS.search} size={15} color="#475569" strokeWidth={2} />
          </span>
          <input
            style={{
              ...S.searchInput,
              borderColor: searchFocused ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.08)',
              boxShadow: searchFocused ? '0 0 0 3px rgba(16,185,129,0.08)' : 'none',
            }}
            type="text"
            placeholder="Search by name, email, role, gender or status…"
            value={searchTerm}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>
        <div style={S.countChip}>
          <strong style={{ color: '#e2e8f0' }}>{filtered.length}</strong>&nbsp;
          {filtered.length === 1 ? 'user' : 'users'}
          {searchTerm && <span style={{ color: '#475569' }}> for "{searchTerm}"</span>}
        </div>
      </div>

      {/* Filter panel */}
      <div style={S.filterPanel}>
        <div style={S.filterHeader}>
          <p style={S.filterTitle}>
            <Icon d={ICONS.filter} size={14} color="#475569" strokeWidth={2} />
            Filters
            {activeCount > 0 && (
              <span style={{
                fontSize: 10, fontWeight: 700, color: '#10b981',
                background: 'rgba(16,185,129,0.12)', borderRadius: 4, padding: '1px 6px',
              }}>{activeCount}</span>
            )}
          </p>
          {activeCount > 0 && (
            <button style={S.clearBtn} onClick={clearFilters}>
              <Icon d={ICONS.x} size={11} color="#f87171" strokeWidth={2.5} />
              Clear all
            </button>
          )}
        </div>

        <div style={S.filterGrid}>
          {[
            { key: 'role', label: 'Role', options: uniqueRoles },
            { key: 'status', label: 'Status', options: uniqueStatuses },
            { key: 'gender', label: 'Gender', options: uniqueGenders },
          ].map(({ key, label, options }) => (
            <div key={key} style={S.filterGroup}>
              <label style={S.filterLabel}>{label}</label>
              <select
                style={S.filterSelect}
                value={filters[key]}
                onChange={e => updateFilter(key, e.target.value)}
              >
                <option value="all">All {label}s</option>
                {options.map(o => (
                  <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {activeCount > 0 && (
          <div style={S.activeTags}>
            <span style={S.activeTagsLabel}>Active:</span>
            {filters.role !== 'all' && (
              <span style={S.tag}>
                Role: {filters.role}
                <button style={S.tagClose} onClick={() => updateFilter('role', 'all')}>
                  <Icon d={ICONS.x} size={10} color="#10b981" strokeWidth={2.5} />
                </button>
              </span>
            )}
            {filters.status !== 'all' && (
              <span style={S.tag}>
                Status: {filters.status}
                <button style={S.tagClose} onClick={() => updateFilter('status', 'all')}>
                  <Icon d={ICONS.x} size={10} color="#10b981" strokeWidth={2.5} />
                </button>
              </span>
            )}
            {filters.gender !== 'all' && (
              <span style={S.tag}>
                Gender: {filters.gender}
                <button style={S.tagClose} onClick={() => updateFilter('gender', 'all')}>
                  <Icon d={ICONS.x} size={10} color="#10b981" strokeWidth={2.5} />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Alert */}
      {message && (
        <div style={S.alert(message.includes('Error'))}>
          <Icon
            d={message.includes('Error') ? ICONS.alert : ICONS.checkCircle}
            size={15}
            color={message.includes('Error') ? '#f87171' : '#10b981'}
            strokeWidth={2}
          />
          {message}
        </div>
      )}

      {/* Table */}
      <div style={S.tableWrap}>
        <table style={S.table}>
          <thead>
            <tr>
              {COLS.map(col => (
                <th key={col} style={S.th}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(user => {
              const st = getStatus(user.status);
              const gd = getGender(user.gender);
              const isHovered = hoveredRow === user._id;
              return (
                <tr
                  key={user._id}
                  onMouseEnter={() => setHoveredRow(user._id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{ background: isHovered ? 'rgba(255,255,255,0.02)' : 'transparent', transition: 'background 0.12s' }}
                >
                  {/* User */}
                  <td style={S.td}>
                    <div style={S.userCell}>
                      <div style={S.avatar}>
                        {user.profile
                          ? <img src={user.profile} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <span>{(user.username || user.email || '?').charAt(0).toUpperCase()}</span>
                        }
                      </div>
                      <div>
                        <div style={S.userName}>{user.username || '—'}</div>
                        <div style={S.userEmail}>{user.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td style={S.td}>
                    <span style={roleBadge(user.role)}>
                      <Icon d={ICONS.shield} size={10} color="currentColor" strokeWidth={2} />
                      {user.role || '—'}
                    </span>
                  </td>

                  {/* Status */}
                  <td style={S.td}>
                    <span style={S.badge(st.bg, st.color, st.border)}>
                      <span style={S.statusDot(st.color)} />
                      {st.label}
                    </span>
                  </td>

                  {/* Gender */}
                  <td style={S.td}>
                    {user.gender
                      ? <span style={S.badge(gd.bg, gd.color, gd.border)}>
                          <Icon d={gd.icon} size={10} color={gd.color} strokeWidth={2.5} />
                          {user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}
                        </span>
                      : <span style={{ color: '#334155', fontSize: 12 }}>—</span>
                    }
                  </td>

                  {/* Joined */}
                  <td style={S.td}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 12 }}>
                      <Icon d={ICONS.calendar} size={12} color="#334155" strokeWidth={2} />
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                    </span>
                  </td>

                  {/* Last Login */}
                  <td style={S.td}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 12 }}>
                      <Icon d={ICONS.clock} size={12} color="#334155" strokeWidth={2} />
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Never'}
                    </span>
                  </td>

                  {/* Action */}
                  <td style={S.td}>
                    <button
                      style={user.status === 'active' ? S.banBtn : S.activateBtn}
                      onClick={() => handleStatusUpdate(user._id, user.status)}
                    >
                      <Icon
                        d={user.status === 'active' ? ICONS.ban : ICONS.userCheck}
                        size={13}
                        color="currentColor"
                        strokeWidth={2}
                      />
                      {user.status === 'active' ? 'Ban User' : 'Activate'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div style={S.empty}>
            <div style={S.emptyIcon}>
              <Icon d={ICONS.users} size={24} color="#334155" strokeWidth={1.5} />
            </div>
            <p style={S.emptyTitle}>No users found</p>
            <p style={S.emptyDesc}>
              {searchTerm || activeCount > 0
                ? 'Try adjusting your search terms or filters.'
                : 'No users are registered in the system yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersManagement;