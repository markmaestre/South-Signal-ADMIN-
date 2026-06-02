import React, { useState, useRef, useEffect } from 'react';
import API_URL from '../Utils/Api';

/* ─────────────────────────────────────────────────────────────
   ICON
───────────────────────────────────────────────────────────── */
const Icon = ({ d, size = 16, color = 'currentColor', strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0, display: 'block' }}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const ICONS = {
  plus:    ["M12 5v14", "M5 12h14"],
  check:   ["M22 11.08V12a10 10 0 11-5.93-9.14", "M22 4L12 14.01l-3-3"],
  x:       "M18 6L6 18M6 6l12 12",
  alert:   ["M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z","M12 9v4","M12 17h.01"],
  spinner: "M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83",
  eye:     ["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z","M12 9a3 3 0 100 6 3 3 0 000-6z"],
  eyeOff:  ["M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94","M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19","M1 1l22 22"],
  user:    ["M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2","M12 11a4 4 0 100-8 4 4 0 000 8z"],
};

/* ─────────────────────────────────────────────────────────────
   SECTION TITLE
───────────────────────────────────────────────────────────── */
const SectionTitle = ({ children }) => (
  <h3 style={{
    fontSize: 12, fontWeight: 700, color: '#6b7280',
    textTransform: 'uppercase', letterSpacing: '0.08em',
    margin: '0 0 0 0', paddingBottom: 10,
    borderBottom: '1px solid #e5e7eb',
  }}>{children}</h3>
);

/* ─────────────────────────────────────────────────────────────
   INLINE EDITABLE ROW
───────────────────────────────────────────────────────────── */
const EditableRow = ({ label, value, type = 'text', placeholder, hint, last, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal]         = useState('');
  const [showPw, setShowPw]   = useState(false);
  const [saving, setSaving]   = useState(false);
  const inputRef = useRef();

  // sync displayed value if parent updates it (e.g. after email save)
  const [displayVal, setDisplayVal] = useState(value || '');
  useEffect(() => { setDisplayVal(value || ''); }, [value]);

  const startEdit = () => {
    setVal(type === 'password' ? '' : displayVal);
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 40);
  };

  const cancel = () => { setEditing(false); setVal(''); };

  const save = async () => {
    if (!val || (type !== 'password' && val === displayVal)) { cancel(); return; }
    setSaving(true);
    const result = await onSave(val);
    setSaving(false);
    if (result !== false) {
      if (type !== 'password') setDisplayVal(val); // optimistic update
      setEditing(false);
      setVal('');
    }
  };

  const masked = '••••••••••';

  return (
    <div style={{ padding: '16px 0', borderBottom: last ? 'none' : '1px solid #f3f4f6' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 7 }}>
        {label}
      </div>

      {editing ? (
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                ref={inputRef}
                type={type === 'password' ? (showPw ? 'text' : 'password') : type}
                value={val}
                onChange={e => setVal(e.target.value)}
                placeholder={placeholder}
                onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel(); }}
                style={{
                  width: '100%', padding: type === 'password' ? '9px 40px 9px 12px' : '9px 12px',
                  border: '1.5px solid #10b981', borderRadius: 8,
                  fontSize: 14, color: '#111827', outline: 'none',
                  background: '#fff', boxSizing: 'border-box',
                  boxShadow: '0 0 0 3px rgba(16,185,129,0.08)',
                }}
              />
              {type === 'password' && (
                <button onClick={() => setShowPw(p => !p)} style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  display: 'flex', alignItems: 'center',
                }}>
                  <Icon d={showPw ? ICONS.eyeOff : ICONS.eye} size={15} color="#9ca3af" />
                </button>
              )}
            </div>
            <button onClick={save} disabled={saving} style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '9px 16px', borderRadius: 8, border: 'none',
              background: '#10b981', color: '#fff', fontSize: 13, fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
              whiteSpace: 'nowrap',
            }}>
              {saving
                ? <Icon d={ICONS.spinner} size={14} color="#fff" />
                : <Icon d={ICONS.check} size={14} color="#fff" strokeWidth={2.5} />
              }
              Save
            </button>
            <button onClick={cancel} style={{
              width: 36, height: 36, borderRadius: 8,
              border: '1px solid #e5e7eb', background: '#fff',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon d={ICONS.x} size={14} color="#6b7280" strokeWidth={2.5} />
            </button>
          </div>
          {hint && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 5 }}>{hint}</div>}
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <span style={{
            fontSize: 14,
            color: type === 'password' ? '#d1d5db' : '#374151',
            letterSpacing: type === 'password' ? 4 : 'normal',
          }}>
            {type === 'password' ? masked : (displayVal || <span style={{ color: '#d1d5db' }}>—</span>)}
          </span>
          <button onClick={startEdit} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, color: '#10b981',
            padding: 0, whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            {type === 'password' ? 'Change password' : 'Change email'}
          </button>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
const AdminProfiles = ({ admin, onAdminUpdate, onProfileUpdate, onDeleteProfilePicture }) => {
  // display name — seeded from email prefix, updates immediately on save
  const [displayName,    setDisplayName]    = useState(admin?.email?.split('@')[0] || 'Admin');
  const [nameInput,      setNameInput]      = useState(admin?.email?.split('@')[0] || 'Admin');
  const [savingName,     setSavingName]     = useState(false);
  const [nameFocus,      setNameFocus]      = useState(false);

  // photo
  const [photoSrc,       setPhotoSrc]       = useState(admin?.profile || null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showConfirmDel, setShowConfirmDel] = useState(false);

  // current email — stays in sync with admin prop
  const [currentEmail,   setCurrentEmail]  = useState(admin?.email || '');
  useEffect(() => {
    setCurrentEmail(admin?.email || '');
    setDisplayName(admin?.email?.split('@')[0] || 'Admin');
    setNameInput(admin?.email?.split('@')[0] || 'Admin');
    setPhotoSrc(admin?.profile || null);
  }, [admin]);

  // toast
  const [toast,          setToast]          = useState(null);
  const toastTimer = useRef(null);

  const token = localStorage.getItem('adminToken');

  const showToast = (msg, success = true) => {
    setToast({ msg, success });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  };

  /* ── Save display name ── */
  const saveName = async () => {
    if (!nameInput.trim() || nameInput === displayName) return;
    setSavingName(true);
    // Optimistic — update UI immediately
    setDisplayName(nameInput.trim());
    try {
      // Extend your backend if you want to persist a separate displayName field.
      // For now this just hits the profile endpoint; add 'displayName' to formData
      // if your schema supports it.
      const formData = new FormData();
      formData.append('displayName', nameInput.trim());
      await fetch(`${API_URL}/api/admins/profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      showToast('Display name updated');
    } catch {
      showToast('Failed to save name', false);
      setDisplayName(admin?.email?.split('@')[0] || 'Admin'); // rollback
    } finally {
      setSavingName(false);
    }
  };

  /* ── Photo upload — immediate ── */
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast('File must be under 5MB', false); return; }
    if (!file.type.startsWith('image/')) { showToast('Only image files are allowed', false); return; }

    // Optimistic preview immediately
    const preview = URL.createObjectURL(file);
    setPhotoSrc(preview);
    setUploadingPhoto(true);

    try {
      const formData = new FormData();
      formData.append('profile', file);
      const res = await fetch(`${API_URL}/api/admins/profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error(`Server ${res.status}`);
      const data = await res.json();
      // Replace blob URL with real server URL
      if (data.admin?.profile) setPhotoSrc(data.admin.profile);
      if (onAdminUpdate) onAdminUpdate(data.admin);
      if (onProfileUpdate) onProfileUpdate(data.admin);
      showToast('Profile photo updated');
    } catch (err) {
      setPhotoSrc(admin?.profile || null); // rollback
      showToast(err.message || 'Failed to upload photo', false);
    } finally {
      setUploadingPhoto(false);
    }
  };

  /* ── Delete photo ── */
  const handleDeletePhoto = async () => {
    setShowConfirmDel(false);
    setPhotoSrc(null); // optimistic
    try {
      const res = await fetch(`${API_URL}/api/admins/profile/picture`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Server ${res.status}`);
      const data = await res.json();
      if (onAdminUpdate) onAdminUpdate(data.admin);
      if (onDeleteProfilePicture) onDeleteProfilePicture();
      showToast('Profile photo removed');
    } catch (err) {
      setPhotoSrc(admin?.profile || null); // rollback
      showToast(err.message || 'Failed to remove photo', false);
    }
  };

  /* ── Save email — optimistic ── */
  const saveEmail = async (newEmail) => {
    setCurrentEmail(newEmail); // optimistic
    try {
      const formData = new FormData();
      formData.append('email', newEmail);
      const res = await fetch(`${API_URL}/api/admins/profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error(`Server ${res.status}`);
      const data = await res.json();
      if (onAdminUpdate) onAdminUpdate(data.admin);
      if (onProfileUpdate) onProfileUpdate(data.admin);
      showToast('Email updated');
      return true;
    } catch (err) {
      setCurrentEmail(admin?.email || ''); // rollback
      showToast(err.message || 'Failed to update email', false);
      return false;
    }
  };

  /* ── Save password ── */
  const savePassword = async (newPassword) => {
    if (newPassword.length < 8) { showToast('Password must be at least 8 characters', false); return false; }
    try {
      const formData = new FormData();
      formData.append('password', newPassword);
      const res = await fetch(`${API_URL}/api/admins/profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error(`Server ${res.status}`);
      const data = await res.json();
      if (onAdminUpdate) onAdminUpdate(data.admin);
      showToast('Password updated');
      return true;
    } catch (err) {
      showToast(err.message || 'Failed to update password', false);
      return false;
    }
  };

  const initials = (displayName || 'A').charAt(0).toUpperCase();

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '0 24px' }}>
      <div style={{
        fontFamily: "'DM Sans','Segoe UI',sans-serif",
        color: '#111827',
        maxWidth: 560,
        width: '100%',
        paddingBottom: 48,
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
          * { box-sizing: border-box; }
          input[type="file"] { display: none; }
        `}</style>

        {/* ── MY PROFILE ── */}
        <div style={{ marginBottom: 32 }}>
          <SectionTitle>My profile</SectionTitle>

          {/* Avatar row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 20, marginBottom: 24 }}>
            <div style={{
              width: 68, height: 68, borderRadius: '50%',
              background: '#ecfdf5', border: '2px solid #a7f3d0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, fontWeight: 700, color: '#059669',
              overflow: 'hidden', flexShrink: 0, position: 'relative',
            }}>
              {photoSrc
                ? <img src={photoSrc} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span>{initials}</span>
              }
              {uploadingPhoto && (
                <div style={{
                  position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon d={ICONS.spinner} size={20} color="#10b981" strokeWidth={2} />
                </div>
              )}
            </div>

            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                <input
                  type="file"
                  id="photo-upload"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handlePhotoChange}
                />
                <label htmlFor="photo-upload" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '7px 14px', borderRadius: 8,
                  border: '1.5px solid #10b981', background: '#fff',
                  color: '#10b981', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f0fdf4'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  <Icon d={ICONS.plus} size={14} color="#10b981" strokeWidth={2.5} />
                  Change image
                </label>

                {photoSrc && (
                  <button onClick={() => setShowConfirmDel(true)} style={{
                    display: 'inline-flex', alignItems: 'center',
                    padding: '7px 14px', borderRadius: 8,
                    border: '1px solid #e5e7eb', background: '#fff',
                    color: '#6b7280', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  >
                    Remove image
                  </button>
                )}
              </div>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
                We support PNGs, JPEGs and GIFs under 5MB
              </p>
            </div>
          </div>

          {/* Display name — single field */}
          <div>
            <label style={{
              display: 'block',
              fontSize: 11, fontWeight: 700, color: '#9ca3af',
              textTransform: 'uppercase', letterSpacing: '0.07em',
              marginBottom: 7,
            }}>
              Display name
            </label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="text"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onFocus={() => setNameFocus(true)}
                onBlur={() => setNameFocus(false)}
                onKeyDown={e => { if (e.key === 'Enter') saveName(); }}
                placeholder="Your display name"
                style={{
                  flex: 1, padding: '9px 12px',
                  border: `1.5px solid ${nameFocus ? '#10b981' : '#e5e7eb'}`,
                  borderRadius: 8, fontSize: 14, color: '#111827',
                  outline: 'none', background: '#fff',
                  boxShadow: nameFocus ? '0 0 0 3px rgba(16,185,129,0.08)' : 'none',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
              />
              <button
                onClick={saveName}
                disabled={savingName || !nameInput.trim() || nameInput === displayName}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '9px 18px', borderRadius: 8, border: 'none',
                  background: '#10b981', color: '#fff', fontSize: 13, fontWeight: 600,
                  cursor: (savingName || !nameInput.trim() || nameInput === displayName) ? 'not-allowed' : 'pointer',
                  opacity: (savingName || !nameInput.trim() || nameInput === displayName) ? 0.55 : 1,
                  whiteSpace: 'nowrap', transition: 'opacity 0.15s',
                }}
              >
                {savingName
                  ? <Icon d={ICONS.spinner} size={14} color="#fff" />
                  : <Icon d={ICONS.check} size={14} color="#fff" strokeWidth={2.5} />
                }
                Save
              </button>
            </div>
          </div>
        </div>

        {/* ── ACCOUNT SECURITY ── */}
        <div>
          <SectionTitle>Account security</SectionTitle>

          <EditableRow
            label="Email"
            value={currentEmail}
            type="email"
            placeholder="Enter new email"
            onSave={saveEmail}
          />

          <EditableRow
            label="Password"
            value=""
            type="password"
            placeholder="Enter new password"
            hint="Minimum 8 characters"
            last
            onSave={savePassword}
          />
        </div>

        {/* ── DELETE PHOTO CONFIRM (inline) ── */}
        {showConfirmDel && (
          <div style={{
            marginTop: 24, padding: '14px 18px', borderRadius: 10,
            background: '#fef2f2', border: '1px solid #fca5a5',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#991b1b', marginBottom: 2 }}>Remove profile picture?</div>
              <div style={{ fontSize: 12, color: '#b91c1c' }}>This action cannot be undone.</div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button onClick={() => setShowConfirmDel(false)} style={{
                padding: '7px 14px', borderRadius: 8, border: '1px solid #e5e7eb',
                background: '#fff', color: '#6b7280', fontSize: 13, cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={handleDeletePhoto} style={{
                padding: '7px 14px', borderRadius: 8, border: 'none',
                background: '#ef4444', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>Remove</button>
            </div>
          </div>
        )}

        {/* ── TOAST ── */}
        {toast && (
          <div style={{
            position: 'fixed', bottom: 24, right: 24,
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '11px 16px', borderRadius: 10,
            background: '#fff',
            border: `1px solid ${toast.success ? '#a7f3d0' : '#fca5a5'}`,
            color: toast.success ? '#065f46' : '#991b1b',
            fontSize: 13, fontWeight: 500,
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            zIndex: 99999,
          }}>
            <Icon
              d={toast.success ? ICONS.check : ICONS.alert}
              size={15}
              color={toast.success ? '#10b981' : '#ef4444'}
              strokeWidth={2}
            />
            {toast.msg}
            <button onClick={() => setToast(null)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', marginLeft: 4,
            }}>
              <Icon d={ICONS.x} size={13} color="#9ca3af" strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProfiles;