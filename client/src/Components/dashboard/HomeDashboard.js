import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import {
  FaSignInAlt,
  FaShieldAlt,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaTimesCircle,
} from "react-icons/fa";
import API_URL from '../Utils/Api';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #2D3561;
    --bg-dark:   #252850;
    --bg-card:   #323761;
    --accent:    #3DD6F5;
    --accent2:   #00B4D8;
    --white:     #FFFFFF;
    --muted:     rgba(255,255,255,0.45);
    --border:    rgba(255,255,255,0.10);
    --danger:    #f06060;
    --input-bg:  rgba(255,255,255,0.06);
    --input-border: rgba(255,255,255,0.13);
  }

  body {
    font-family: 'Sora', sans-serif;
    background: var(--bg);
    color: var(--white);
    overflow: hidden;
    height: 100vh;
  }

  /* ── PAGE LAYOUT ── */
  .tmfk-page {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    width: 100vw;
    position: relative;
    overflow: hidden;
    background: var(--bg);
  }

  /* ── DECORATIVE BLOB (left side, like OneShop) ── */
  .tmfk-blob {
    position: absolute;
    left: -80px;
    top: -60px;
    width: 480px;
    height: 520px;
    pointer-events: none;
    z-index: 0;
  }

  .tmfk-blob-inner {
    width: 100%;
    height: 100%;
    background: linear-gradient(145deg, #3DD6F5 0%, #1a9fb5 40%, #0d6a80 100%);
    border-radius: 55% 45% 40% 60% / 50% 55% 45% 50%;
    opacity: 0.22;
  }

  .tmfk-blob-2 {
    position: absolute;
    left: -120px;
    top: 60px;
    width: 380px;
    height: 420px;
    pointer-events: none;
    z-index: 0;
  }

  .tmfk-blob-2-inner {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #00B4D8 0%, #0077b6 100%);
    border-radius: 40% 60% 55% 45% / 45% 50% 55% 50%;
    opacity: 0.30;
  }

  /* small decorative dots */
  .tmfk-dots {
    position: absolute;
    bottom: 60px;
    right: 60px;
    width: 120px;
    height: 120px;
    background-image: radial-gradient(circle, rgba(61,214,245,0.25) 1.5px, transparent 1.5px);
    background-size: 18px 18px;
    pointer-events: none;
    z-index: 0;
    border-radius: 8px;
  }

  /* ── CARD ── */
  .tmfk-card {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 420px;
    background: rgba(40, 46, 90, 0.70);
    backdrop-filter: blur(20px);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 48px 44px 40px;
    box-shadow: 0 32px 80px rgba(10,15,40,0.45);
    animation: cardIn 0.5s cubic-bezier(0.34,1.4,0.64,1) both;
  }
  @keyframes cardIn {
    from { opacity: 0; transform: translateY(28px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* ── HEADER ── */
  .tmfk-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 32px;
  }

  .tmfk-logo-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 22px;
  }

  .tmfk-logo-img {
    width: 38px;
    height: 38px;
    object-fit: contain;
    border-radius: 8px;
    background: rgba(255,255,255,0.08);
    padding: 4px;
  }

  .tmfk-brand {
    font-size: 18px;
    font-weight: 700;
    color: var(--white);
    letter-spacing: 0.04em;
    line-height: 1.1;
  }

  .tmfk-brand span {
    display: block;
    font-size: 10px;
    font-weight: 400;
    color: var(--accent);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-top: 2px;
  }

  .tmfk-header h1 {
    font-size: 22px;
    font-weight: 600;
    color: var(--white);
    letter-spacing: -0.01em;
    text-align: center;
  }

  /* ── FORM ── */
  .tmfk-form-group {
    margin-bottom: 16px;
  }

  .tmfk-form-group label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 7px;
  }

  .tmfk-input-wrap {
    position: relative;
  }

  .tmfk-input-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--muted);
    font-size: 13px;
    display: flex;
    align-items: center;
    pointer-events: none;
  }

  .tmfk-input-wrap input {
    width: 100%;
    padding: 12px 42px 12px 40px;
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: 10px;
    font-size: 13.5px;
    font-family: 'Sora', sans-serif;
    color: var(--white);
    outline: none;
    transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
  }

  .tmfk-input-wrap input::placeholder {
    color: rgba(255,255,255,0.25);
  }

  .tmfk-input-wrap input:focus {
    border-color: var(--accent);
    background: rgba(61,214,245,0.06);
    box-shadow: 0 0 0 3px rgba(61,214,245,0.12);
  }

  /* checkmark for filled email (like OneShop) */
  .tmfk-check-icon {
    position: absolute;
    right: 13px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--accent);
    font-size: 13px;
    display: flex;
    align-items: center;
  }

  .tmfk-pw-toggle {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: rgba(255,255,255,0.75);
    font-size: 14px;
    display: flex;
    align-items: center;
    padding: 4px;
    transition: color 0.18s;
  }
  .tmfk-pw-toggle:hover { color: var(--accent); }

  /* ── WRONG PASSWORD TOAST ── */
  .tmfk-toast {
    position: fixed;
    top: 28px;
    left: 50%;
    transform: translateX(-50%) translateY(-20px);
    z-index: 999;
    background: #1a0f0f;
    border: 1px solid rgba(240,96,96,0.45);
    border-radius: 14px;
    padding: 14px 22px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.5);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.28s ease, transform 0.32s cubic-bezier(0.34,1.4,0.64,1);
    white-space: nowrap;
  }
  .tmfk-toast.show {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
    pointer-events: auto;
  }
  .tmfk-toast-icon {
    width: 30px; height: 30px; flex-shrink: 0;
    border-radius: 50%;
    background: rgba(240,96,96,0.18);
    border: 1.5px solid rgba(240,96,96,0.5);
    display: flex; align-items: center; justify-content: center;
    font-size: 14px;
    animation: tmfk-wobble 0.5s ease 0.1s both;
  }
  @keyframes tmfk-wobble {
    0%   { transform: rotate(0deg) scale(1); }
    25%  { transform: rotate(-12deg) scale(1.15); }
    50%  { transform: rotate(10deg) scale(0.95); }
    75%  { transform: rotate(-6deg) scale(1.05); }
    100% { transform: rotate(0deg) scale(1); }
  }
  .tmfk-toast-body {}
  .tmfk-toast-title {
    font-size: 13px; font-weight: 700;
    color: #f9a0a0; margin-bottom: 1px;
  }
  .tmfk-toast-sub {
    font-size: 11px; color: rgba(249,160,160,0.6);
  }
  .tmfk-toast-bar {
    position: absolute;
    bottom: 0; left: 0;
    height: 3px;
    background: linear-gradient(90deg, #f06060, #f9a0a0);
    border-radius: 0 0 14px 14px;
    width: 100%;
    transform-origin: left;
    animation: none;
  }
  .tmfk-toast.show .tmfk-toast-bar {
    animation: tmfk-shrink 3s linear forwards;
  }
  @keyframes tmfk-shrink {
    from { transform: scaleX(1); }
    to   { transform: scaleX(0); }
  }

  /* card shake on error */
  .tmfk-card.shake {
    animation: cardShake 0.5s cubic-bezier(0.36,0.07,0.19,0.97) both;
  }
  @keyframes cardShake {
    0%,100% { transform: translateX(0); }
    10%,50%,90% { transform: translateX(-8px); }
    30%,70% { transform: translateX(8px); }
  }

  /* password input red flash on error */
  .tmfk-input-wrap input.error-flash {
    border-color: rgba(240,96,96,0.7) !important;
    background: rgba(240,96,96,0.07) !important;
    animation: inputFlash 0.4s ease;
  }
  @keyframes inputFlash {
    0%,100% { box-shadow: none; }
    50% { box-shadow: 0 0 0 3px rgba(240,96,96,0.2); }
  }

  /* ── SUBMIT ── */
  .tmfk-submit {
    width: 100%;
    margin-top: 6px;
    padding: 13px;
    background: var(--accent);
    color: #0d2030;
    border: none;
    border-radius: 10px;
    font-size: 13.5px;
    font-weight: 700;
    font-family: 'Sora', sans-serif;
    letter-spacing: 0.04em;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: background 0.18s, transform 0.18s, box-shadow 0.18s;
  }
  .tmfk-submit:hover:not(:disabled) {
    background: #6de5f8;
    transform: translateY(-1px);
    box-shadow: 0 8px 28px rgba(61,214,245,0.30);
  }
  .tmfk-submit:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }

  /* ── SPINNER ── */
  .tmfk-spinner {
    width: 16px; height: 16px; flex-shrink: 0;
    border-radius: 50%;
    border: 2.5px solid rgba(13,32,48,0.25);
    border-top-color: #0d2030;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── FOOTER NOTE ── */
  .tmfk-footer-note {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-top: 22px;
    padding-top: 18px;
    border-top: 1px solid var(--border);
    font-size: 11px;
    color: var(--muted);
  }
  .tmfk-footer-note svg { color: var(--accent); flex-shrink: 0; }

  /* ── PAGE LOADER ── */
  .tmfk-loader {
    position: fixed; inset: 0; z-index: 9999;
    background: var(--bg-dark);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 18px;
    transition: opacity 0.5s, visibility 0.5s;
  }
  .tmfk-loader.hidden { opacity: 0; visibility: hidden; pointer-events: none; }
  .tmfk-loader-logo {
    width: 64px; height: 64px; object-fit: contain;
    animation: pulse 1s ease infinite alternate;
  }
  @keyframes pulse {
    from { opacity: 0.5; transform: scale(0.94); }
    to   { opacity: 1;   transform: scale(1.04); }
  }
  .tmfk-loader-bar {
    width: 160px; height: 3px;
    background: rgba(255,255,255,0.08);
    border-radius: 2px; overflow: hidden;
  }
  .tmfk-loader-fill {
    height: 100%; background: var(--accent);
    border-radius: 2px; transition: width 0.12s linear;
  }
  .tmfk-loader-text {
    font-size: 10px; letter-spacing: 0.2em;
    color: rgba(255,255,255,0.28); text-transform: uppercase;
  }

  @media (max-width: 480px) {
    .tmfk-card { padding: 36px 22px 30px; margin: 16px; max-width: calc(100% - 32px); }
    .tmfk-blob, .tmfk-blob-2 { display: none; }
  }
`;

export default function Home() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [loaderProgress, setLoaderProgress] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [shakeCard, setShakeCard] = useState(false);
  const [flashInput, setFlashInput] = useState(false);
  const toastTimer = React.useRef(null);
  const navigate = useNavigate();

  const triggerError = (msg) => {
    setError(msg);
    setShowToast(false);
    setShakeCard(false);
    setFlashInput(false);
    // micro delay so re-triggering resets animations
    setTimeout(() => {
      setShowToast(true);
      setShakeCard(true);
      setFlashInput(true);
    }, 20);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      setShowToast(false);
    }, 3200);
    setTimeout(() => setShakeCard(false), 520);
    setTimeout(() => setFlashInput(false), 450);
  };

  useEffect(() => {
    let prog = 0;
    const tick = setInterval(() => {
      prog += Math.random() * 18 + 8;
      if (prog >= 100) {
        prog = 100;
        clearInterval(tick);
        setTimeout(() => setPageLoaded(true), 350);
      }
      setLoaderProgress(Math.min(prog, 100));
    }, 120);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');
    if (token && adminData) {
      try {
        const { role } = JSON.parse(adminData);
        if (['admin', 'southadmin', 'centraladmin'].includes(role)) {
          navigate('/admin/dashboard');
        } else {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminData');
        }
      } catch {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/admins/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        const { role } = data.admin;
        if (['admin', 'southadmin', 'centraladmin'].includes(role)) {
          localStorage.setItem('adminToken', data.token);
          localStorage.setItem('adminData', JSON.stringify(data.admin));
          navigate('/admin/dashboard');
        } else {
          triggerError('Unauthorized role. Please contact system administrator.');
        }
      } else {
        triggerError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch {
      triggerError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>

      {/* Page loader */}
      <div className={`tmfk-loader${pageLoaded ? ' hidden' : ''}`}>
        <img src="/TMFK.png" alt="TMFK" className="tmfk-loader-logo" />
        <div className="tmfk-loader-bar">
          <div className="tmfk-loader-fill" style={{ width: `${loaderProgress}%` }} />
        </div>
        <div className="tmfk-loader-text">Loading System</div>
      </div>

      {/* Wrong password toast */}
      <div className={`tmfk-toast${showToast ? ' show' : ''}`}>
        <div className="tmfk-toast-icon"><FaTimesCircle size={15} color="#f06060" /></div>
        <div className="tmfk-toast-body">
          <div className="tmfk-toast-title">Oops! {error || 'Wrong credentials'}</div>
          <div className="tmfk-toast-sub">Please double-check and try again.</div>
        </div>
        <div className="tmfk-toast-bar" />
      </div>

      {/* Page */}
      <div className="tmfk-page">

        {/* Decorative blobs */}
        <div className="tmfk-blob"><div className="tmfk-blob-inner" /></div>
        <div className="tmfk-blob-2"><div className="tmfk-blob-2-inner" /></div>
        <div className="tmfk-dots" />

        {/* Login card */}
        <div className={`tmfk-card${shakeCard ? ' shake' : ''}`}>

          {/* Header */}
          <div className="tmfk-header">
            <div className="tmfk-logo-wrap">
              <img src="/TMFK.png" alt="TMFK" className="tmfk-logo-img" />
              <div className="tmfk-brand">
                TMFK
                <span>Waste Innovations</span>
              </div>
            </div>
            <h1>Welcome Back!</h1>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin}>
            <div className="tmfk-form-group">
              <label htmlFor="tmfk-email">Email</label>
              <div className="tmfk-input-wrap">
                <span className="tmfk-input-icon"><FaEnvelope size={12} /></span>
                <input
                  id="tmfk-email"
                  type="email"
                  name="email"
                  placeholder="admin@taguig.gov.ph"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
                {formData.email && (
                  <span className="tmfk-check-icon">✓</span>
                )}
              </div>
            </div>

            <div className="tmfk-form-group">
              <label htmlFor="tmfk-password">Password</label>
              <div className="tmfk-input-wrap">
                <span className="tmfk-input-icon"><FaLock size={12} /></span>
                <input
                  id="tmfk-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  className={flashInput ? 'error-flash' : ''}
                />
                <button
                  type="button"
                  className="tmfk-pw-toggle"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
                </button>
              </div>
            </div>

            <button type="submit" className="tmfk-submit" disabled={loading}>
              {loading
                ? <><span className="tmfk-spinner" /> Signing in...</>
                : <><FaSignInAlt size={13} /> Sign in</>
              }
            </button>
          </form>

          <div className="tmfk-footer-note">
            <FaShieldAlt size={11} />
            Secure access — authorized personnel only
          </div>
        </div>

      </div>
    </>
  );
}