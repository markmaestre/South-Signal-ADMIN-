import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import {
  FaRecycle,
  FaHome,
  FaInfoCircle,
  FaCogs,
  FaSignInAlt,
  FaClipboardList,
  FaChartBar,
  FaUsers,
  FaBell,
  FaShieldAlt,
  FaLock,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaFacebookF,
  FaTwitter,
  FaLeaf,
  FaTrashAlt,
  FaCalendarAlt,
  FaTruck,
} from "react-icons/fa";
import API_URL from '../Utils/Api';

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --blue-dark:   #1e3a5f;
    --blue-mid:    #2563eb;
    --blue-light:  #3b82f6;
    --blue-pale:   #eff6ff;
    --red:         #dc2626;
    --red-light:   #ef4444;
    --red-pale:    #fef2f2;
    --white:       #ffffff;
    --text:        #1f2937;
    --text-muted:  #6b7280;
  }

  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--white);
    color: var(--text);
    overflow-x: hidden;
  }

  /* ── NAV ── */
  .swms-nav {
    position: sticky; top: 0; z-index: 200;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 48px;
    height: 64px;
    background: rgba(255,255,255,0.97);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid #e5e7eb;
    box-shadow: 0 2px 16px rgba(30,58,95,0.06);
    animation: swms-slideDown 0.45s ease both;
  }
  @keyframes swms-slideDown {
    from { transform: translateY(-100%); opacity: 0; }
    to   { transform: translateY(0);     opacity: 1; }
  }

  .swms-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
  .swms-logo-icon {
    width: 38px; height: 38px;
    background: var(--blue-dark);
    border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 18px;
  }
  .swms-logo-text strong {
    display: block; font-size: 13px; font-weight: 700;
    color: var(--blue-dark); letter-spacing: 0.06em; text-transform: uppercase;
    line-height: 1.1;
  }
  .swms-logo-text span {
    display: block; font-size: 10px; color: var(--text-muted);
    text-transform: uppercase; letter-spacing: 0.09em;
  }

  .swms-nav-links { display: flex; align-items: center; gap: 4px; list-style: none; }
  .swms-nav-links li a,
  .swms-nav-links li button.swms-nav-text-btn {
    display: flex; align-items: center; gap: 7px;
    padding: 8px 14px; border-radius: 8px;
    font-size: 13.5px; font-weight: 500;
    color: var(--text-muted); text-decoration: none;
    border: none; background: transparent; cursor: pointer;
    transition: background 0.18s, color 0.18s;
    font-family: 'DM Sans', sans-serif;
  }
  .swms-nav-links li a:hover,
  .swms-nav-links li button.swms-nav-text-btn:hover {
    background: var(--blue-pale); color: var(--blue-dark);
  }
  .swms-nav-links li a.active {
    background: var(--blue-pale); color: var(--blue-dark); font-weight: 600;
  }

  .swms-nav-login-btn {
    display: flex; align-items: center; gap: 7px;
    padding: 9px 20px;
    background: var(--blue-dark);
    color: white;
    border-radius: 8px;
    font-size: 13.5px; font-weight: 600;
    cursor: pointer; border: none;
    font-family: 'DM Sans', sans-serif;
    letter-spacing: 0.02em;
    transition: background 0.18s, transform 0.18s, box-shadow 0.18s;
  }
  .swms-nav-login-btn:hover {
    background: var(--blue-mid);
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(30,58,95,0.2);
  }

  /* ── HERO ── */
  .swms-hero {
    min-height: 560px;
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 45%, #bfdbfe 100%);
    display: flex; align-items: center;
    padding: 64px 48px;
    position: relative; overflow: hidden;
    animation: swms-fadeUp 0.75s ease 0.15s both;
  }
  @keyframes swms-fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  .swms-hero::before {
    content: '';
    position: absolute; right: -100px; top: -100px;
    width: 480px; height: 480px;
    background: radial-gradient(circle, rgba(59,130,246,0.22) 0%, transparent 68%);
    border-radius: 50%; pointer-events: none;
  }
  .swms-hero::after {
    content: '';
    position: absolute; right: 80px; bottom: -80px;
    width: 320px; height: 320px;
    background: radial-gradient(circle, rgba(220,38,38,0.1) 0%, transparent 68%);
    border-radius: 50%; pointer-events: none;
  }

  .swms-hero-content { max-width: 500px; z-index: 1; }
  .swms-hero-tag {
    display: inline-flex; align-items: center; gap: 7px;
    font-size: 12.5px; color: var(--blue-mid);
    font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;
    margin-bottom: 18px;
    animation: swms-fadeUp 0.65s ease 0.35s both;
  }
  .swms-hero-tag svg { color: var(--blue-light); }

  .swms-hero h1 {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 76px; line-height: 0.93;
    color: var(--blue-dark); letter-spacing: 0.015em;
    margin-bottom: 22px;
    animation: swms-fadeUp 0.65s ease 0.45s both;
  }
  .swms-hero h1 em { font-style: normal; color: var(--blue-mid); }

  .swms-hero p {
    font-size: 15.5px; color: var(--text-muted);
    line-height: 1.75; max-width: 400px;
    margin-bottom: 32px;
    animation: swms-fadeUp 0.65s ease 0.55s both;
  }

  .swms-hero-cta {
    display: inline-flex; align-items: center; gap: 9px;
    background: var(--blue-dark); color: white;
    padding: 14px 28px; border-radius: 9px;
    font-size: 14px; font-weight: 600;
    border: none; cursor: pointer;
    transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
    animation: swms-fadeUp 0.65s ease 0.65s both;
    font-family: 'DM Sans', sans-serif;
    letter-spacing: 0.02em;
  }
  .swms-hero-cta:hover {
    background: var(--blue-mid);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(30,58,95,0.22);
  }

  .swms-hero-illustration {
    position: absolute; right: 48px; bottom: 0; z-index: 1;
    animation: swms-riseIn 0.9s ease 0.3s both;
  }
  @keyframes swms-riseIn {
    from { opacity: 0; transform: translateY(48px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  .swms-truck-svg { width: 400px; }

  /* Location Badge */
  .swms-location-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255,255,255,0.9);
    padding: 6px 14px;
    border-radius: 30px;
    font-size: 12px;
    font-weight: 600;
    color: var(--blue-dark);
    margin-top: 20px;
  }

  /* ── FEATURES ── */
  .swms-features {
    padding: 88px 48px;
    background: var(--white);
    text-align: center;
  }
  .swms-section-tag {
    display: inline-flex; align-items: center; gap: 7px;
    font-size: 12px; color: var(--blue-mid); font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 10px;
  }
  .swms-section-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 44px; color: var(--blue-dark);
    letter-spacing: 0.03em; margin-bottom: 8px;
  }
  .swms-section-sub { font-size: 15px; color: var(--text-muted); margin-bottom: 52px; }

  .swms-features-grid {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 22px; max-width: 1020px; margin: 0 auto;
  }
  .swms-feature-card {
    border: 1.5px solid #e5e7eb;
    border-radius: 16px;
    padding: 34px 22px 30px;
    transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
    cursor: default;
  }
  .swms-feature-card:hover {
    transform: translateY(-7px);
    box-shadow: 0 16px 40px rgba(30,58,95,0.11);
    border-color: var(--blue-light);
  }
  .swms-feature-icon {
    width: 62px; height: 62px;
    background: var(--blue-dark);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 22px;
    color: white; font-size: 22px;
    transition: background 0.25s;
  }
  .swms-feature-card:hover .swms-feature-icon { background: var(--blue-mid); }
  .swms-feature-card h3 {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 19px; letter-spacing: 0.05em;
    color: var(--blue-dark); margin-bottom: 10px;
  }
  .swms-feature-card p { font-size: 13.5px; color: var(--text-muted); line-height: 1.65; }

  /* Schedule Section */
  .swms-schedule {
    background: var(--blue-pale);
    padding: 60px 48px;
    margin: 0 0 60px;
  }
  .swms-schedule-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 30px;
    max-width: 1020px;
    margin: 40px auto 0;
  }
  .swms-schedule-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    border-top: 3px solid var(--blue-light);
  }
  .swms-schedule-day {
    font-size: 20px;
    font-weight: 700;
    color: var(--blue-dark);
    margin-bottom: 12px;
  }
  .swms-schedule-area {
    font-size: 14px;
    color: var(--text-muted);
    margin-bottom: 8px;
  }
  .swms-schedule-time {
    font-size: 13px;
    color: var(--blue-mid);
    font-weight: 600;
  }

  /* ── ADMIN BANNER ── */
  .swms-admin-banner {
    margin: 0 48px 88px;
    background: var(--blue-dark);
    border-radius: 20px;
    padding: 44px 52px;
    display: flex; align-items: center; justify-content: space-between;
    gap: 32px; overflow: hidden; position: relative;
  }
  .swms-admin-banner::before {
    content: '';
    position: absolute; right: -80px; top: -80px;
    width: 300px; height: 300px;
    background: rgba(255,255,255,0.04);
    border-radius: 50%; pointer-events: none;
  }
  .swms-admin-left { display: flex; align-items: center; gap: 22px; z-index: 1; }
  .swms-admin-shield-icon {
    width: 66px; height: 66px;
    background: rgba(255,255,255,0.1);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: var(--blue-light); font-size: 28px; flex-shrink: 0;
  }
  .swms-admin-label {
    font-size: 11px; color: var(--blue-light);
    font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; margin-bottom: 6px;
  }
  .swms-admin-banner h2 {
    font-size: 22px; font-weight: 700; color: white; margin-bottom: 5px;
  }
  .swms-admin-desc { font-size: 14px; color: rgba(255,255,255,0.6); }
  .swms-divider-v {
    width: 1px; background: rgba(255,255,255,0.13);
    height: 72px; flex-shrink: 0; z-index: 1;
  }
  .swms-admin-right { text-align: center; flex-shrink: 0; z-index: 1; }
  .swms-admin-btn {
    display: inline-flex; align-items: center; gap: 9px;
    background: var(--white); color: var(--blue-dark);
    padding: 14px 34px; border-radius: 10px;
    font-size: 13.5px; font-weight: 700;
    border: none; cursor: pointer;
    letter-spacing: 0.06em; text-transform: uppercase;
    transition: background 0.2s, transform 0.2s;
    margin-bottom: 8px;
    font-family: 'DM Sans', sans-serif;
  }
  .swms-admin-btn:hover { background: var(--blue-pale); transform: translateY(-2px); }
  .swms-admin-sub { font-size: 12px; color: rgba(255,255,255,0.45); }

  /* ── LOGIN MODAL ── */
  .swms-modal-overlay {
    position: fixed; inset: 0; z-index: 500;
    background: rgba(30,58,95,0.65);
    backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    animation: swms-overlayIn 0.2s ease both;
  }
  @keyframes swms-overlayIn { from { opacity: 0; } to { opacity: 1; } }

  .swms-modal {
    background: var(--white);
    border-radius: 20px;
    padding: 48px 44px;
    width: 100%; max-width: 420px;
    box-shadow: 0 32px 80px rgba(30,58,95,0.28);
    position: relative;
    animation: swms-modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  @keyframes swms-modalIn {
    from { opacity: 0; transform: scale(0.9) translateY(20px); }
    to   { opacity: 1; transform: scale(1)   translateY(0);    }
  }
  .swms-modal-close {
    position: absolute; top: 16px; right: 16px;
    width: 32px; height: 32px; border-radius: 8px;
    background: var(--blue-pale); border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: var(--text-muted); font-size: 15px; font-weight: 600;
    transition: background 0.18s, color 0.18s;
  }
  .swms-modal-close:hover { background: #e0e7ff; color: var(--blue-dark); }

  .swms-modal-header { text-align: center; margin-bottom: 32px; }
  .swms-modal-icon {
    width: 60px; height: 60px;
    background: var(--blue-dark);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 16px;
    color: white; font-size: 24px;
  }
  .swms-modal-header h2 {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 30px; color: var(--blue-dark);
    letter-spacing: 0.04em; margin-bottom: 4px;
  }
  .swms-modal-header p { font-size: 13.5px; color: var(--text-muted); }

  .swms-form-group { margin-bottom: 18px; }
  .swms-form-group label {
    display: block; font-size: 12px; font-weight: 700;
    color: var(--text-muted); letter-spacing: 0.07em;
    text-transform: uppercase; margin-bottom: 7px;
  }
  .swms-input-wrap { position: relative; }
  .swms-input-icon {
    position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
    color: var(--text-muted); font-size: 14px; pointer-events: none;
    display: flex; align-items: center;
  }
  .swms-input-wrap input {
    width: 100%; padding: 12px 14px 12px 40px;
    border: 1.5px solid #e5e7eb; border-radius: 9px;
    font-size: 14px; font-family: 'DM Sans', sans-serif;
    color: var(--text); background: var(--white);
    transition: border-color 0.18s, box-shadow 0.18s;
    outline: none;
  }
  .swms-input-wrap input:focus {
    border-color: var(--blue-mid);
    box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
  }
  .swms-input-wrap input::placeholder { color: #b8c5d4; }

  .swms-login-submit {
    width: 100%; padding: 14px;
    background: var(--blue-dark); color: white;
    border: none; border-radius: 10px; cursor: pointer;
    font-size: 14px; font-weight: 700; letter-spacing: 0.06em;
    text-transform: uppercase; font-family: 'DM Sans', sans-serif;
    display: flex; align-items: center; justify-content: center; gap: 9px;
    transition: background 0.2s, transform 0.18s, box-shadow 0.18s;
    margin-top: 8px;
  }
  .swms-login-submit:hover {
    background: var(--blue-mid);
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(30,58,95,0.22);
  }
  .swms-modal-footer-note {
    text-align: center; margin-top: 20px;
    font-size: 12px; color: var(--text-muted);
    display: flex; align-items: center; justify-content: center; gap: 6px;
  }
  .swms-modal-footer-note svg { color: var(--blue-light); }

  /* Error message styling */
  .swms-error-message {
    background: var(--red-pale);
    border-left: 4px solid var(--red);
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    color: var(--red);
  }
  .swms-error-icon {
    width: 20px;
    height: 20px;
    background: var(--red);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
  }

  /* Role Badge Styles */
  .role-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    margin: 0 4px;
  }
  .role-super {
    background: #8b5cf6;
    color: white;
  }
  .role-south {
    background: #10b981;
    color: white;
  }
  .role-central {
    background: #f59e0b;
    color: white;
  }

  /* ── FOOTER ── */
  .swms-footer {
    background: var(--blue-dark);
    padding: 64px 48px 0;
    color: rgba(255,255,255,0.7);
  }
  .swms-footer-grid {
    display: grid; grid-template-columns: 2fr 1fr 1.6fr 1.6fr;
    gap: 52px; padding-bottom: 52px;
    border-bottom: 1px solid rgba(255,255,255,0.09);
  }
  .swms-footer-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
  .swms-footer-logo .swms-logo-icon { background: rgba(255,255,255,0.1); }
  .swms-footer-logo .swms-logo-text strong,
  .swms-footer-logo .swms-logo-text span { color: rgba(255,255,255,0.85); }
  .swms-footer-brand-desc {
    font-size: 13px; line-height: 1.72;
    color: rgba(255,255,255,0.5); margin-bottom: 22px;
  }
  .swms-socials { display: flex; gap: 10px; }
  .swms-socials a {
    width: 34px; height: 34px;
    background: rgba(255,255,255,0.08);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    color: rgba(255,255,255,0.6); font-size: 14px;
    text-decoration: none; transition: background 0.18s, color 0.18s;
  }
  .swms-socials a:hover { background: var(--blue-mid); color: white; }

  .swms-footer-col h4 {
    font-size: 11px; font-weight: 700;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--blue-light); margin-bottom: 20px;
  }
  .swms-footer-col ul { list-style: none; }
  .swms-footer-col ul li { margin-bottom: 11px; }
  .swms-footer-col ul li a {
    text-decoration: none; color: rgba(255,255,255,0.55);
    font-size: 13.5px; transition: color 0.18s; cursor: pointer;
  }
  .swms-footer-col ul li a:hover { color: white; }

  .swms-contact-row {
    display: flex; align-items: flex-start; gap: 11px;
    margin-bottom: 14px; font-size: 13px; color: rgba(255,255,255,0.55);
  }
  .swms-contact-row svg { color: var(--blue-light); font-size: 14px; margin-top: 2px; flex-shrink: 0; }

  .swms-hours-row { margin-bottom: 10px; }
  .swms-hours-row strong { display: block; color: rgba(255,255,255,0.8); font-size: 13px; font-weight: 600; }
  .swms-hours-row span { font-size: 13px; color: rgba(255,255,255,0.5); }

  .swms-footer-bottom {
    padding: 22px 0;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    font-size: 12.5px; color: rgba(255,255,255,0.35);
  }
  .swms-footer-bottom svg { color: var(--blue-light); }

  /* ── RESPONSIVE ── */
  @media (max-width: 960px) {
    .swms-nav { padding: 0 20px; }
    .swms-hero { padding: 52px 20px 300px; }
    .swms-hero-illustration { right: 20px; }
    .swms-truck-svg { width: 280px; }
    .swms-hero h1 { font-size: 54px; }
    .swms-features { padding: 60px 20px; }
    .swms-features-grid { grid-template-columns: repeat(2,1fr); }
    .swms-schedule-grid { grid-template-columns: 1fr; }
    .swms-admin-banner { margin: 0 20px 60px; padding: 32px 28px; flex-direction: column; text-align: center; }
    .swms-admin-left { flex-direction: column; text-align: center; }
    .swms-divider-v { display: none; }
    .swms-footer { padding: 52px 20px 0; }
    .swms-footer-grid { grid-template-columns: 1fr 1fr; gap: 36px; }
  }
  @media (max-width: 600px) {
    .swms-hero h1 { font-size: 44px; }
    .swms-hero-illustration { position: relative; right: unset; bottom: unset; margin-top: 32px; }
    .swms-hero { padding: 48px 20px; flex-direction: column; }
    .swms-features-grid { grid-template-columns: 1fr; }
    .swms-footer-grid { grid-template-columns: 1fr; }
    .swms-modal { padding: 36px 24px; margin: 16px; max-width: calc(100% - 32px); }
  }
`;

// ─── DATA ─────────────────────────────────────────────────────────────────────
const FEATURES = [
  { Icon: FaClipboardList, title: "Collection Management",    desc: "Schedule, monitor, and manage waste collection activities efficiently." },
  { Icon: FaChartBar,      title: "Reports & Analytics",      desc: "Generate reports and analyze waste data for better decision making." },
  { Icon: FaUsers,         title: "User & Staff Management",  desc: "Manage staff accounts, roles, and permissions with ease." },
  { Icon: FaBell,          title: "Notifications & Updates",  desc: "Stay informed with real-time alerts and important notifications." },
];

const NAV_ITEMS = [

];

const SCHEDULES = [
  { day: "Monday", area: "Phase 1 & 2", time: "7:00 AM - 10:00 AM" },
  { day: "Wednesday", area: "Phase 3 & 4", time: "7:00 AM - 10:00 AM" },
  { day: "Friday", area: "Phase 5 & Commercial", time: "7:00 AM - 10:00 AM" },
];

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function Home() {
  const [activeNav, setActiveNav] = useState("Home");
  const [showLogin, setShowLogin] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in - redirect to dashboard
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');
    
    if (token && adminData) {
      try {
        const parsedData = JSON.parse(adminData);
        const { role } = parsedData;
        
        // Allow all valid roles to access dashboard
        if (role === 'admin' || role === 'southadmin' || role === 'centraladmin') {
          navigate('/admin/dashboard');
        } else {
          // Clear invalid data
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminData');
        }
      } catch (error) {
        console.error('Error parsing admin data:', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/admins/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        const { role } = data.admin;
        
        // Check if role is valid
        if (role === 'admin' || role === 'southadmin' || role === 'centraladmin') {
          // Store token and admin data
          localStorage.setItem('adminToken', data.token);
          localStorage.setItem('adminData', JSON.stringify(data.admin));
          setShowLogin(false);
          
          // Redirect to dashboard
          navigate('/admin/dashboard');
        } else {
          setError('Unauthorized role. Please contact system administrator.');
        }
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openLogin = () => {
    setFormData({ email: '', password: '' });
    setError('');
    setShowLogin(true);
  };
  
  const closeLogin = () => {
    setShowLogin(false);
    setError('');
    setFormData({ email: '', password: '' });
  };

  const getRoleBadges = () => {
    return (
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '10px', flexWrap: 'wrap' }}>
    
      </div>
    );
  };

  return (
    <>
      <style>{styles}</style>

      {/* ── NAV ────────────────────────────────────────── */}
      <nav className="swms-nav">
        <div className="swms-logo">
          <div className="swms-logo-icon"><FaRecycle /></div>
          <div className="swms-logo-text">
            <strong>Solid Waste</strong>
            <span>Management System</span>
          </div>
        </div>

        <ul className="swms-nav-links">
          {NAV_ITEMS.map(({ label, Icon, key }) => (
            <li key={key}>
              <a
                className={activeNav === key ? "active" : ""}
                onClick={() => setActiveNav(key)}
                style={{ cursor: "pointer" }}
              >
                <Icon size={13} /> {label}
              </a>
            </li>
          ))}
          <li>
            <button className="swms-nav-login-btn" onClick={openLogin}>
              <FaSignInAlt size={13} /> Login
            </button>
          </li>
        </ul>
      </nav>

      {/* ── HERO ────────────────────────────────────────── */}
      <section className="swms-hero">
        <div className="swms-hero-content">
          <div className="swms-hero-tag">
            <FaLeaf /> Building a cleaner community
          </div>
          <h1>
            SOLID WASTE<br />
            <em>MANAGEMENT</em><br />
            SYSTEM
          </h1>
          <p>
            An efficient and organized platform for managing solid waste collection,
            tracking, and reporting. Together, let's create a cleaner, healthier, 
            and more sustainable community.
          </p>
          <button className="swms-hero-cta" onClick={openLogin}>
            <FaSignInAlt size={13} /> Get Started
          </button>
          <div className="swms-location-badge">
            <FaMapMarkerAlt /> Taguig City, Metro Manila
          </div>
        </div>

        <div className="swms-hero-illustration">
          <svg
            className="swms-truck-svg"
            viewBox="0 0 420 280"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <ellipse cx="210" cy="265" rx="200" ry="13" fill="#bfdbfe" />
            <circle cx="370" cy="78"  r="54" fill="#3b82f6" opacity="0.25" />
            <circle cx="378" cy="58"  r="38" fill="#2563eb" opacity="0.38" />
            <rect x="369" y="108" width="8"  height="40"  rx="4" fill="#5a4a3a" opacity="0.45" />
            <rect x="308" y="28"  width="32" height="122" rx="3" fill="#bfdbfe" opacity="0.75" />
            <rect x="344" y="48"  width="24" height="102" rx="3" fill="#93c5fd" opacity="0.65" />
            <rect x="294" y="58"  width="18" height="92"  rx="3" fill="#a8c9fa" opacity="0.55" />
            <rect x="58"  y="128" width="222" height="102" rx="10" fill="#1e3a5f" />
            <rect x="238" y="108" width="92"  height="122" rx="10" fill="#2563eb" />
            <rect x="256" y="118" width="57"  height="48"  rx="6"  fill="#a8c9fa" opacity="0.65" />
            <circle cx="148" cy="174" r="30" fill="#3b82f6" opacity="0.25" />
            <text x="148" y="182" textAnchor="middle" fontSize="26" fill="white" opacity="0.9">♻</text>
            {[108, 228, 298].map((cx) => (
              <g key={cx}>
                <circle cx={cx} cy="237" r="22" fill="#1f2937" />
                <circle cx={cx} cy="237" r="12" fill="#374151" />
                <circle cx={cx} cy="237" r="5"  fill="#93c5fd" />
              </g>
            ))}
            <rect x="328" y="88" width="6" height="26" rx="3" fill="#374151" />
            <rect x="20"  y="168" width="36" height="52" rx="5" fill="#2563eb" />
            <rect x="18"  y="161" width="40" height="10" rx="4" fill="#1e3a5f" />
            <text x="38" y="200" textAnchor="middle" fontSize="14" fill="white" opacity="0.85">♻</text>
            <rect x="2"   y="183" width="36" height="52" rx="5" fill="#dc2626" />
            <rect x="0"   y="176" width="40" height="10" rx="4" fill="#b91c1c" />
            <text x="20" y="215" textAnchor="middle" fontSize="14" fill="white" opacity="0.85">♻</text>
          </svg>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────── */}
      <section className="swms-features">
        <div className="swms-section-tag"><FaLeaf /> System Features</div>
        <div className="swms-section-title">SYSTEM FEATURES</div>
        <div className="swms-section-sub">Powerful tools for better waste management</div>

        <div className="swms-features-grid">
          {FEATURES.map(({ Icon, title, desc }) => (
            <div className="swms-feature-card" key={title}>
              <div className="swms-feature-icon"><Icon /></div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── COLLECTION SCHEDULE ─────────────────────────── */}
      <section className="swms-schedule">
        <div className="swms-section-tag"><FaCalendarAlt /> Collection Schedule</div>
        <div className="swms-section-title">WASTE COLLECTION SCHEDULE</div>
        <div className="swms-section-sub">Regular collection schedule for Taguig City</div>
        
        <div className="swms-schedule-grid">
          {SCHEDULES.map((schedule) => (
            <div className="swms-schedule-card" key={schedule.day}>
              <div className="swms-schedule-day">{schedule.day}</div>
              <div className="swms-schedule-area">
                <FaMapMarkerAlt size={11} /> {schedule.area}
              </div>
              <div className="swms-schedule-time">
                <FaTruck size={11} /> {schedule.time}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ADMIN BANNER ────────────────────────────────── */}
      <div className="swms-admin-banner">
        <div className="swms-admin-left">
          <div className="swms-admin-shield-icon"><FaShieldAlt /></div>
          <div>
            <div className="swms-admin-label">Admin Access Portal</div>
            <h2>Welcome, Administrator!</h2>
            <p className="swms-admin-desc">
              Please sign in to access the Solid Waste Management System.
              Choose your designated role below.
            </p>
            {getRoleBadges()}
          </div>
        </div>
        <div className="swms-divider-v" />
        <div className="swms-admin-right">
          <button className="swms-admin-btn" onClick={openLogin}>
            <FaLock size={13} /> Login to Portal
          </button>
          <div className="swms-admin-sub">Secure Access Portal for Authorized Personnel</div>
        </div>
      </div>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer className="swms-footer">
        <div className="swms-footer-grid">

          {/* Brand */}
          <div>
            <div className="swms-footer-logo">
              <div className="swms-logo-icon"><FaRecycle /></div>
              <div className="swms-logo-text">
                <strong>Solid Waste</strong>
                <span>Management System</span>
              </div>
            </div>
            <p className="swms-footer-brand-desc">
              Committed to efficient waste management and a cleaner environment
              for Taguig City and future generations.
            </p>
            <div className="swms-socials">
              <a href="#" aria-label="Facebook"><FaFacebookF /></a>
              <a href="#" aria-label="Twitter"><FaTwitter /></a>
              <a href="#" aria-label="Email"><FaEnvelope /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="swms-footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><a onClick={() => setActiveNav("Home")} href="#">Home</a></li>
              <li><a onClick={() => setActiveNav("About")} href="#">About</a></li>
              <li><a onClick={() => setActiveNav("System")} href="#">System Features</a></li>
              <li><a onClick={(e) => { e.preventDefault(); openLogin(); }} href="#">Login</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="swms-footer-col">
            <h4>Contact Us</h4>
            <div className="swms-contact-row">
              <FaMapMarkerAlt />
              <span>Taguig City Hall<br />Taguig City, Metro Manila</span>
            </div>
            <div className="swms-contact-row">
              <FaPhoneAlt />
              <span>(02) 1234 5678</span>
            </div>
            <div className="swms-contact-row">
              <FaEnvelope />
              <span>info@taguigwaste.gov.ph</span>
            </div>
          </div>

          {/* Hours */}
          <div className="swms-footer-col">
            <h4>Office Hours</h4>
            <div className="swms-hours-row">
              <strong>Monday – Friday</strong>
              <span>8:00 AM – 5:00 PM</span>
            </div>
            <div className="swms-hours-row">
              <strong>Saturday</strong>
              <span>8:00 AM – 12:00 PM</span>
            </div>
            <div className="swms-hours-row">
              <strong>Sunday &amp; Holidays</strong>
              <span>Closed</span>
            </div>
          </div>
        </div>

        <div className="swms-footer-bottom">
          <FaLeaf />
          Taguig City — Reduce. Reuse. Recycle. For a better tomorrow.
        </div>
      </footer>

      {/* ── LOGIN MODAL ─────────────────────────────────── */}
      {showLogin && (
        <div
          className="swms-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && closeLogin()}
        >
          <div className="swms-modal" role="dialog" aria-modal="true" aria-labelledby="login-title">
            <button className="swms-modal-close" onClick={closeLogin} aria-label="Close">✕</button>

            <div className="swms-modal-header">
              <div className="swms-modal-icon"><FaShieldAlt /></div>
              <h2 id="login-title">Admin Login</h2>
              <p>Sign in to access your dashboard</p>
              {getRoleBadges()}
            </div>

            {error && (
              <div className="swms-error-message">
                <div className="swms-error-icon">!</div>
                <span className="error-text">{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="swms-form-group">
                <label htmlFor="swms-email">Email Address</label>
                <div className="swms-input-wrap">
                  <span className="swms-input-icon"><FaEnvelope size={13} /></span>
                  <input
                    id="swms-email"
                    type="email"
                    name="email"
                    placeholder="admin@wastewise.gov.ph"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="swms-form-group">
                <label htmlFor="swms-password">Password</label>
                <div className="swms-input-wrap">
                  <span className="swms-input-icon"><FaLock size={13} /></span>
                  <input
                    id="swms-password"
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button type="submit" className="swms-login-submit" disabled={loading}>
                <FaSignInAlt size={14} /> 
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>

            <div className="swms-modal-footer-note">
              <FaShieldAlt size={11} />
              Secure access — authorized personnel only
            </div>
           
          </div>
        </div>
      )}
    </>
  );
}