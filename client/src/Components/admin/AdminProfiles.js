import React, { useState } from 'react';
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
  edit:      ["M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7", "M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"],
  mail:      ["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z", "M22 6l-10 7L2 6"],
  user:      ["M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2", "M12 11a4 4 0 100-8 4 4 0 000 8z"],
  shield:    ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"],
  clock:     ["M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10z", "M12 6v6l4 2"],
  check:     ["M22 11.08V12a10 10 0 11-5.93-9.14", "M22 4L12 14.01l-3-3"],
  id:        ["M2 5h20v14H2z", "M6 9h4M6 13h8M6 17h4"],
  trash:     ["M3 6h18", "M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6", "M10 11v6", "M14 11v6", "M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"],
  x:         "M18 6L6 18M6 6l12 12",
  upload:    ["M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4", "M17 8l-5-5-5 5", "M12 3v12"],
  lock:      ["M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z", "M7 11V7a5 5 0 0110 0v4"],
  image:     ["M21 19a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h3l2-3h4l2 3h3a2 2 0 012 2z", "M12 13a3 3 0 100-6 3 3 0 000 6z"],
  alert:     ["M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z", "M12 9v4", "M12 17h.01"],
  chevronR:  "M9 18l6-6-6-6",
  spinner:   "M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83",
};

/* ─────────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────────── */
const S = {
  root: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    color: '#e2e8f0',
    minHeight: '100%',
  },
  actionRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: 24,
  },
  editBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '9px 18px',
    borderRadius: 8,
    border: '1px solid rgba(16,185,129,0.3)',
    background: 'rgba(16,185,129,0.08)',
    color: '#10b981',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  profileCard: {
    background: 'linear-gradient(135deg, #131c27 0%, #111827 100%)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
  },
  cardAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    background: 'linear-gradient(90deg, #10b981, #0ea5e9)',
  },
  cardInner: {
    display: 'flex',
    gap: 40,
    padding: '36px 36px',
    alignItems: 'flex-start',
  },
  avatarSide: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    flexShrink: 0,
    minWidth: 160,
  },
  avatarRing: {
    position: 'relative',
    width: 108,
    height: 108,
  },
  avatar: {
    width: 108,
    height: 108,
    borderRadius: 20,
    background: 'linear-gradient(135deg, #10b981, #0891b2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 36,
    fontWeight: 800,
    color: '#fff',
    overflow: 'hidden',
    border: '3px solid rgba(16,185,129,0.3)',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 14,
    height: 14,
    borderRadius: '50%',
    background: '#10b981',
    border: '2px solid #131c27',
    boxShadow: '0 0 8px #10b981',
  },
  removePhotoBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '5px 10px',
    borderRadius: 6,
    border: '1px solid rgba(239,68,68,0.25)',
    background: 'rgba(239,68,68,0.06)',
    color: '#f87171',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
  },
  adminName: {
    fontSize: 17,
    fontWeight: 800,
    color: '#f1f5f9',
    margin: 0,
    textAlign: 'center',
  },
  adminRolePill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: '#10b981',
    background: 'rgba(16,185,129,0.1)',
    border: '1px solid rgba(16,185,129,0.2)',
    borderRadius: 6,
    padding: '4px 10px',
  },
  roleDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#10b981',
    boxShadow: '0 0 5px #10b981',
  },
  detailsSide: { flex: 1 },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 0,
  },
  detailItem: {
    padding: '18px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    borderRight: '1px solid rgba(255,255,255,0.04)',
  },
  detailLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#475569',
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 500,
    color: '#e2e8f0',
    margin: 0,
    wordBreak: 'break-all',
  },
  statusActive: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    color: '#10b981',
    fontWeight: 600,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: '#10b981',
    boxShadow: '0 0 6px #10b981',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.72)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: 20,
  },
  modal: {
    background: '#131c27',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 14,
    width: 480,
    maxWidth: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative',
  },
  modalAccent: {
    height: 3,
    background: 'linear-gradient(90deg, #10b981, #0ea5e9)',
    borderRadius: '14px 14px 0 0',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '24px 28px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  modalTitle: { fontSize: 17, fontWeight: 800, color: '#f1f5f9', margin: 0 },
  modalSub: { fontSize: 12, color: '#475569', marginTop: 4 },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 7,
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#64748b',
    flexShrink: 0,
  },
  modalBody: { padding: '24px 28px' },
  formField: { marginBottom: 20 },
  fieldLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
    color: '#64748b',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    background: '#0d1117',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    color: '#e2e8f0',
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  fieldHint: { fontSize: 11, color: '#334155', marginTop: 5, display: 'block' },
  fileLabel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    background: '#0d1117',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'border-color 0.15s',
  },
  fileLabelText: { fontSize: 13, color: '#64748b' },
  fileLabelBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 12,
    fontWeight: 600,
    color: '#10b981',
    background: 'rgba(16,185,129,0.1)',
    border: '1px solid rgba(16,185,129,0.2)',
    borderRadius: 5,
    padding: '4px 10px',
  },
  previewWrap: {
    marginTop: 10,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  previewImg: {
    width: 52,
    height: 52,
    borderRadius: 10,
    objectFit: 'cover',
    border: '2px solid rgba(16,185,129,0.3)',
  },
  previewName: { fontSize: 12, color: '#94a3b8' },
  formActions: {
    display: 'flex',
    gap: 10,
    justifyContent: 'flex-end',
    paddingTop: 8,
    borderTop: '1px solid rgba(255,255,255,0.05)',
    marginTop: 8,
  },
  btnSecondary: {
    padding: '9px 18px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'transparent',
    color: '#64748b',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    padding: '9px 20px',
    borderRadius: 8,
    border: 'none',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: '#fff',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(16,185,129,0.25)',
  },
  btnDanger: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    padding: '9px 20px',
    borderRadius: 8,
    border: 'none',
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: '#fff',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
  },
  alert: (isSuccess) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '11px 16px',
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 13,
    background: isSuccess ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
    border: `1px solid ${isSuccess ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
    color: isSuccess ? '#6ee7b7' : '#fca5a5',
  }),
  confirmBody: {
    padding: '32px 28px 28px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: 12,
  },
  confirmIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  confirmTitle: { fontSize: 17, fontWeight: 800, color: '#f1f5f9', margin: 0 },
  confirmDesc: { fontSize: 13, color: '#64748b', lineHeight: 1.6, maxWidth: 340, margin: 0 },
  confirmActions: { display: 'flex', gap: 10, justifyContent: 'center', marginTop: 8 },
  toast: {
    position: 'fixed',
    bottom: 28,
    right: 28,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 18px',
    borderRadius: 10,
    background: '#131c27',
    border: '1px solid rgba(16,185,129,0.25)',
    color: '#6ee7b7',
    fontSize: 13,
    fontWeight: 500,
    zIndex: 99999,
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
  },
  toastClose: {
    background: 'none',
    border: 'none',
    color: '#475569',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    marginLeft: 4,
  },
};

/* ─────────────────────────────────────────────────────────────
   DETAIL FIELDS
───────────────────────────────────────────────────────────── */
const DETAIL_FIELDS = (admin) => [
  { icon: ICONS.mail,   label: 'Email Address',       value: admin?.email },
  { icon: ICONS.user,   label: 'Display Name',         value: admin?.email?.split('@')[0] || 'Admin' },
  { icon: ICONS.shield, label: 'Role & Permissions',   value: admin?.role || 'Administrator' },
  {
    icon: ICONS.clock,
    label: 'Last Authentication',
    value: admin?.lastLogin
      ? new Date(admin.lastLogin).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
      : 'Never',
  },
  { icon: ICONS.check, label: 'Account Status', value: null, isStatus: true },
  { icon: ICONS.id,    label: 'Admin ID', value: admin?.id || admin?._id?.substring(0, 8) || 'N/A' },
];

/* ─────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────── */
const AdminProfiles = ({ admin, onAdminUpdate, onProfileUpdate, onDeleteProfilePicture }) => {
  const [showEdit, setShowEdit]         = useState(false);
  const [showDelete, setShowDelete]     = useState(false);
  const [profileForm, setProfileForm]   = useState({ email: '', password: '', profile: null });
  const [previewUrl, setPreviewUrl]     = useState(null);
  const [message, setMessage]           = useState('');
  const [isSuccess, setIsSuccess]       = useState(true);
  const [loading, setLoading]           = useState(false);
  const [inputFocus, setInputFocus]     = useState('');

  const token = localStorage.getItem('adminToken');

  const openEdit = () => {
    setProfileForm({ email: admin?.email || '', password: '', profile: null });
    setPreviewUrl(null);
    setMessage('');
    setShowEdit(true);
  };

  const closeEdit = () => {
    setShowEdit(false);
    setMessage('');
    setPreviewUrl(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setProfileForm(p => ({ ...p, password: '', profile: null }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage('File size must be less than 5MB');
      setIsSuccess(false);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setMessage('Only image files are allowed');
      setIsSuccess(false);
      return;
    }

    setProfileForm(p => ({ ...p, profile: file }));

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  // ── FIXED: /api/admins (plural) to match server.js mount point ──
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData();

      if (profileForm.email && profileForm.email !== admin?.email) {
        formData.append('email', profileForm.email);
      }
      if (profileForm.password) {
        formData.append('password', profileForm.password);
      }
      if (profileForm.profile) {
        formData.append('profile', profileForm.profile);
      }

      if (!formData.has('email') && !formData.has('password') && !formData.has('profile')) {
        setMessage('No changes to update');
        setIsSuccess(false);
        setLoading(false);
        return;
      }

      // ✅ FIXED: changed /api/admin → /api/admins
      const res = await fetch(`${API_URL}/api/admins/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          // Do NOT set Content-Type — browser sets it automatically with multipart boundary
        },
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        console.error('Server response:', text);
        throw new Error(`Server responded with ${res.status}: ${text.substring(0, 100)}`);
      }

      const data = await res.json();

      setMessage('Profile updated successfully!');
      setIsSuccess(true);

      if (onAdminUpdate) onAdminUpdate(data.admin);
      if (onProfileUpdate) onProfileUpdate(data.admin);

      setTimeout(() => closeEdit(), 1600);
    } catch (err) {
      console.error('Update error:', err);
      setMessage(err.message || 'Failed to update profile');
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  // ── FIXED: /api/admins (plural) to match server.js mount point ──
  const handleDeletePicture = async () => {
    try {
      // ✅ FIXED: changed /api/admin → /api/admins
      const res = await fetch(`${API_URL}/api/admins/profile/picture`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        console.error('Delete response:', text);
        throw new Error(`Server responded with ${res.status}`);
      }

      const data = await res.json();

      setShowDelete(false);
      setMessage('Profile picture removed successfully.');
      setIsSuccess(true);

      if (onAdminUpdate) onAdminUpdate(data.admin);
      if (onDeleteProfilePicture) onDeleteProfilePicture();

      setTimeout(() => setMessage(''), 3500);
    } catch (err) {
      console.error('Delete error:', err);
      setMessage(err.message || 'Failed to remove profile picture');
      setIsSuccess(false);
    }
  };

  const focusStyle = (field) => ({
    ...S.input,
    borderColor: inputFocus === field ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.08)',
    boxShadow: inputFocus === field ? '0 0 0 3px rgba(16,185,129,0.08)' : 'none',
  });

  const details = DETAIL_FIELDS(admin);

  return (
    <div style={S.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        * { box-sizing: border-box; }
        input[type="file"] { display: none; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
      `}</style>

      {/* Edit button */}
      <div style={S.actionRow}>
        <button
          style={S.editBtn}
          onClick={openEdit}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.14)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.08)'; }}
        >
          <Icon d={ICONS.edit} size={14} color="#10b981" strokeWidth={2} />
          Edit Profile
        </button>
      </div>

      {/* Profile card */}
      <div style={S.profileCard}>
        <div style={S.cardAccent} />
        <div style={S.cardInner}>

          {/* Avatar column */}
          <div style={S.avatarSide}>
            <div style={S.avatarRing}>
              <div style={S.avatar}>
                {admin?.profile
                  ? <img src={admin.profile} alt="Admin" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span>{admin?.email?.charAt(0).toUpperCase() || 'A'}</span>
                }
              </div>
              <div style={S.onlineDot} />
            </div>
            <p style={S.adminName}>{admin?.email?.split('@')[0] || 'Admin'}</p>
            <span style={S.adminRolePill}>
              <span style={S.roleDot} />
              {admin?.role === 'southadmin' ? 'South Signal Admin' :
               admin?.role === 'centraladmin' ? 'Central Signal Admin' :
               admin?.role || 'Administrator'}
            </span>
            {admin?.profile && (
              <button
                style={S.removePhotoBtn}
                onClick={() => setShowDelete(true)}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; }}
              >
                <Icon d={ICONS.trash} size={11} color="#f87171" strokeWidth={2} />
                Remove Photo
              </button>
            )}
          </div>

          {/* Details grid */}
          <div style={S.detailsSide}>
            <div style={S.detailsGrid}>
              {details.map((d, i) => (
                <div
                  key={i}
                  style={{
                    ...S.detailItem,
                    borderRight: i % 2 === 0 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    borderBottom: i < details.length - 2 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  }}
                >
                  <div style={S.detailLabel}>
                    <Icon d={d.icon} size={12} color="#334155" strokeWidth={2} />
                    {d.label}
                  </div>
                  {d.isStatus ? (
                    <p style={{ ...S.detailValue, ...S.statusActive }}>
                      <span style={S.statusDot} />
                      Active &amp; Verified
                    </p>
                  ) : (
                    <p style={S.detailValue}>{d.value || '—'}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {showEdit && (
        <div style={S.overlay} onClick={closeEdit}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={S.modalAccent} />
            <div style={S.modalHeader}>
              <div>
                <h3 style={S.modalTitle}>Edit Administrator Profile</h3>
                <p style={S.modalSub}>Update your account information</p>
              </div>
              <button style={S.closeBtn} onClick={closeEdit}>
                <Icon d={ICONS.x} size={14} color="#64748b" strokeWidth={2.5} />
              </button>
            </div>

            <div style={S.modalBody}>
              {message && (
                <div style={S.alert(isSuccess)}>
                  <Icon d={isSuccess ? ICONS.check : ICONS.alert} size={14} color={isSuccess ? '#10b981' : '#f87171'} strokeWidth={2} />
                  {message}
                </div>
              )}

              <div>
                {/* Email */}
                <div style={S.formField}>
                  <label style={S.fieldLabel}>
                    <Icon d={ICONS.mail} size={12} color="#475569" strokeWidth={2} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    style={focusStyle('email')}
                    value={profileForm.email}
                    onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))}
                    onFocus={() => setInputFocus('email')}
                    onBlur={() => setInputFocus('')}
                  />
                  <span style={S.fieldHint}>Your administrative email address</span>
                </div>

                {/* Password */}
                <div style={S.formField}>
                  <label style={S.fieldLabel}>
                    <Icon d={ICONS.lock} size={12} color="#475569" strokeWidth={2} />
                    New Password
                  </label>
                  <input
                    type="password"
                    style={focusStyle('password')}
                    value={profileForm.password}
                    onChange={e => setProfileForm(p => ({ ...p, password: e.target.value }))}
                    onFocus={() => setInputFocus('password')}
                    onBlur={() => setInputFocus('')}
                    placeholder="Leave blank to keep current password"
                  />
                  <span style={S.fieldHint}>Minimum 8 characters recommended</span>
                </div>

                {/* Profile picture */}
                <div style={{ ...S.formField, marginBottom: 24 }}>
                  <label style={S.fieldLabel}>
                    <Icon d={ICONS.image} size={12} color="#475569" strokeWidth={2} />
                    Profile Picture
                  </label>
                  <input
                    type="file"
                    id="profile-file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="profile-file"
                    style={S.fileLabel}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(16,185,129,0.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                  >
                    <span style={S.fileLabelText}>
                      {profileForm.profile ? profileForm.profile.name : 'Choose an image file…'}
                    </span>
                    <span style={S.fileLabelBtn}>
                      <Icon d={ICONS.upload} size={11} color="#10b981" strokeWidth={2} />
                      Browse
                    </span>
                  </label>

                  {/* Preview thumbnail */}
                  {previewUrl && (
                    <div style={S.previewWrap}>
                      <img src={previewUrl} alt="Preview" style={S.previewImg} />
                      <span style={S.previewName}>{profileForm.profile?.name}</span>
                      <button
                        onClick={() => {
                          setPreviewUrl(null);
                          setProfileForm(p => ({ ...p, profile: null }));
                        }}
                        style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                      >
                        <Icon d={ICONS.x} size={14} color="#ef4444" strokeWidth={2} />
                      </button>
                    </div>
                  )}

                  <span style={S.fieldHint}>Accepted: JPG, PNG, GIF, WebP — Max 5 MB</span>
                </div>

                {/* Actions */}
                <div style={S.formActions}>
                  <button type="button" style={S.btnSecondary} onClick={closeEdit} disabled={loading}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    style={{ ...S.btnPrimary, opacity: loading ? 0.7 : 1 }}
                    disabled={loading}
                    onClick={handleUpdate}
                  >
                    {loading
                      ? <><Icon d={ICONS.spinner} size={14} color="#fff" strokeWidth={2} style={{ animation: 'spin 1s linear infinite' }} /> Updating…</>
                      : <><Icon d={ICONS.check} size={14} color="#fff" strokeWidth={2.5} /> Update Profile</>
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {showDelete && (
        <div style={S.overlay} onClick={() => setShowDelete(false)}>
          <div style={{ ...S.modal, width: 420 }} onClick={e => e.stopPropagation()}>
            <div style={{ ...S.modalAccent, background: 'linear-gradient(90deg, #ef4444, #f97316)' }} />
            <div style={S.confirmBody}>
              <div style={S.confirmIcon}>
                <Icon d={ICONS.trash} size={22} color="#f87171" strokeWidth={1.8} />
              </div>
              <h3 style={S.confirmTitle}>Remove Profile Picture</h3>
              <p style={S.confirmDesc}>
                Are you sure you want to remove your profile picture? This action cannot be undone.
              </p>
              <div style={S.confirmActions}>
                <button style={S.btnSecondary} onClick={() => setShowDelete(false)}>Cancel</button>
                <button style={S.btnDanger} onClick={handleDeletePicture}>
                  <Icon d={ICONS.trash} size={13} color="#fff" strokeWidth={2} />
                  Remove Picture
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {message && !showEdit && !showDelete && (
        <div style={S.toast}>
          <Icon d={isSuccess ? ICONS.check : ICONS.alert} size={14} color={isSuccess ? '#10b981' : '#f87171'} strokeWidth={2} />
          {message}
          <button style={S.toastClose} onClick={() => setMessage('')}>
            <Icon d={ICONS.x} size={12} color="#475569" strokeWidth={2.5} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminProfiles;