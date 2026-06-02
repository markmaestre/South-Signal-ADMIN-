import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import API_URL from '../Utils/Api';

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
const T = {
  navy:       '#0A1628',
  navyMid:    '#132044',
  navyLight:  '#1E3A6E',
  blue:       '#2563EB',
  blueLight:  '#3B82F6',
  cyan:       '#06B6D4',
  teal:       '#0D9488',
  green:      '#10B981',
  amber:      '#F59E0B',
  red:        '#EF4444',
  slate:      '#64748B',
  slateLight: '#94A3B8',
  pageBg:     '#F1F5F9',
  white:      '#FFFFFF',
  border:     'rgba(15,30,60,0.09)',
};

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function getCurrentWeekNumber() {
  const now   = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const days  = Math.floor((now - start) / 864e5);
  return Math.ceil((days + start.getDay() + 1) / 7);
}

/* ─────────────────────────────────────────────
   ICONS
───────────────────────────────────────────── */
const Ico = ({ d, size = 16, color = 'currentColor', sw = 1.8, fill = 'none' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"
    fill={fill} stroke={color} strokeWidth={sw}
    strokeLinecap="round" strokeLinejoin="round"
    style={{ display:'inline-block', flexShrink:0, verticalAlign:'middle' }}>
    {Array.isArray(d) ? d.map((p,i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const IC = {
  doc:      ['M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z','M14 2v6h6','M16 13H8','M16 17H8','M10 9H8'],
  download: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M7 10l5 5 5-5','M12 15V3'],
  calendar: ['M8 2v4','M16 2v4','M3 10h18','M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z'],
  week:     ['M3 12h18','M3 6l9-3 9 3','M3 18l9 3 9-3'],
  year:     ['M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'],
  check:    ['M20 6L9 17l-5-5'],
  alert:    ['M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z','M12 9v4','M12 17h.01'],
  chart:    ['M18 20V10','M12 20V4','M6 20v-6'],
  recycle:  ['M4 15l3 3 3-3','M7 18V9.5C7 7 9 5 11.5 5H13','M20 9l-3-3-3 3','M17 6v8.5C17 17 15 19 12.5 19H11'],
  layers:   ['M12 2L2 7l10 5 10-5-10-5z','M2 17l10 5 10-5','M2 12l10 5 10-5'],
  info:     ['M12 2a10 10 0 100 20A10 10 0 0012 2z','M12 16v-4','M12 8h.01'],
  users:    ['M12 11a4 4 0 100-8 4 4 0 000 8z','M18 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
};

/* ═══════════════════════════════════════════
   WEIGHT CALCULATION
═══════════════════════════════════════════ */
const calculateItemWeight = (classification, detectedObjectLabel) => {
  const weights = {
    plastic:        { default:0.04, bottle:0.05, bag:0.01, container:0.08, cup:0.03, straw:0.002 },
    paper:          { default:0.08, bag:0.05, cup:0.01, newspaper:0.10, magazine:0.15 },
    glass:          { default:0.25, bottle:0.30, jar:0.25, cup:0.20 },
    metal:          { default:0.02, can:0.015, tin:0.015, lid:0.01 },
    aluminum:       { default:0.015, can:0.015, foil:0.005 },
    organic:        { default:0.25, food:0.25, fruit:0.10, vegetable:0.20, yard:0.50 },
    electronic:     { default:0.50, phone:0.18, laptop:2.00, tablet:0.50, battery:0.15 },
    textile:        { default:0.25, shirt:0.20, pants:0.40, jeans:0.50, jacket:0.60 },
    cardboard:      { default:0.25, box:0.50, sheet:0.15, carton:0.10 },
    recyclable:     { default:0.10, bottle:0.05, can:0.015, paper:0.08 },
    'non-recyclable':{ default:0.15 },
  };
  const classKey = (classification || '').toLowerCase().trim();
  const rawLabel  = (detectedObjectLabel  || '').toLowerCase().trim();
  const category  = weights[classKey] || { default: 0.10 };
  for (const [kw, w] of Object.entries(category)) {
    if (rawLabel.includes(kw)) return w;
  }
  return category.default || 0.10;
};

const calculateTotalWeight = (report) => {
  const qty       = report.detectedObjects?.length || 1;
  const classKey  = (report.classification || '').toLowerCase().trim();
  const rawLabel  = (report.detectedObjects?.[0]?.label || '').toLowerCase().trim();
  return calculateItemWeight(classKey, rawLabel) * qty;
};

/* ═══════════════════════════════════════════
   PDF BUILDER — FIXED ALIGNMENT + PAGE BREAKS
═══════════════════════════════════════════ */
const buildPDF = async (doc, analyticsData, {
  reportPeriod, selectedMonth, selectedYear, selectedWeek,
  barangayName, startDate, endDate, reportType,
}) => {
  const pw  = doc.internal.pageSize.getWidth();   // 210 mm (A4)
  const ph  = doc.internal.pageSize.getHeight();  // 297 mm
  const ML  = 14;
  const MR  = 14;
  const CW  = pw - ML - MR;  // 182 mm usable content width
  const CT  = pw / 2;

  /* ── PDF color palette (RGB arrays) ─────────────────────────── */
  const P = {
    navy:    [10,  22,  40],
    navyMd:  [30,  46,  80],
    blue:    [37,  99,  235],
    blueLt:  [239, 246, 255],
    cyan:    [6,   182, 212],
    green:   [16,  185, 129],
    greenLt: [236, 253, 245],
    amber:   [245, 158, 11],
    amberLt: [255, 251, 235],
    red:     [239, 68,  68],
    redLt:   [254, 242, 242],
    teal:    [13,  148, 136],
    tealLt:  [240, 253, 250],
    purple:  [124, 58,  237],
    purpleLt:[245, 243, 255],
    slate:   [100, 116, 139],
    slateL:  [148, 163, 184],
    light:   [241, 245, 249],
    surf:    [248, 250, 252],
    border:  [226, 232, 240],
    white:   [255, 255, 255],
  };

  /* ── Shorthand helpers ────────────────────────────────────────── */
  const setTxt  = (a) => doc.setTextColor(...a);
  const setFill = (a) => doc.setFillColor(...a);
  const setDrw  = (a) => doc.setDrawColor(...a);
  const rR      = (x,y,w,h,r,m='F') => doc.roundedRect(x,y,w,h,r,r,m);

  /* ── Period / Barangay labels ─────────────────────────────────── */
  let periodLabel = '', periodRange = '', periodType = '';
  if (reportPeriod === 'week') {
    periodLabel = `Week ${selectedWeek}, ${selectedYear}`;
    periodRange = `${startDate.toLocaleDateString()} – ${endDate.toLocaleDateString()}`;
    periodType  = 'week';
  } else if (reportPeriod === 'month') {
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    periodLabel = `${MONTHS[selectedMonth]} ${selectedYear}`;
    periodRange = `${MONTHS[selectedMonth]} 1 – ${MONTHS[selectedMonth]} ${lastDay}, ${selectedYear}`;
    periodType  = 'month';
  } else {
    periodLabel = `Year ${selectedYear}`;
    periodRange = `January 1 – December 31, ${selectedYear}`;
    periodType  = 'year';
  }

  let brgyFull  = barangayName || 'South Signal Village';
  let brgyShort = 'South Signal Village';
  if (brgyFull.toLowerCase().includes('central')) {
    brgyFull  = 'Central Bicutan, Taguig City';
    brgyShort = 'Central Bicutan';
  }

  /* ── Logo loader ─────────────────────────────────────────────── */
  const loadLogo = () => new Promise((resolve) => {
    let src = '/TMFK.png';
    if (brgyFull.toLowerCase().includes('south'))   src = '/South.jpg';
    if (brgyFull.toLowerCase().includes('central')) src = '/Central.jpg';
    const img = new Image();
    img.onload = () => {
      try {
        const c = document.createElement('canvas');
        c.width = img.width; c.height = img.height;
        c.getContext('2d').drawImage(img,0,0);
        resolve(c.toDataURL('image/png'));
      } catch { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
  const logo = await loadLogo();

  /* ══════════════════════════════════════════════════════
     PAGE HEADER
  ══════════════════════════════════════════════════════ */
  const drawHeader = () => {
    const H = 48;
    setFill(P.navy); doc.rect(0, 0, pw, H, 'F');
    setFill(P.cyan);  doc.rect(0, 0, 4, H, 'F');
    setFill(P.blue);  doc.rect(0, H, pw, 2, 'F');

    if (logo) {
      setFill(P.white); rR(ML + 1, 8, 32, 32, 2);
      try { doc.addImage(logo, 'PNG', ML + 2, 9, 30, 30); } catch {}
    }

    const tx = ML + 40;

    let titleText = reportType === 'user'
      ? 'USER ANALYTICS REPORT'
      : reportType === 'waste'
        ? 'WASTE ANALYTICS REPORT'
        : 'COMPREHENSIVE WASTE MANAGEMENT REPORT';

    doc.setFontSize(12.5);
    doc.setFont('helvetica', 'bold');
    setTxt(P.white);
    doc.text(titleText, tx, 18);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    setTxt(P.cyan);
    doc.text(`Barangay ${brgyShort}`, tx, 27);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    setTxt(P.slateL);
    doc.text(`${periodLabel}  ·  ${periodRange}`, tx, 35);

    doc.setFontSize(6.5);
    setTxt(P.slate);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pw - MR, 42, { align: 'right' });
  };

  /* ══════════════════════════════════════════════════════
     PAGE FOOTER
  ══════════════════════════════════════════════════════ */
  const drawFooter = () => {
    const pages = doc.internal.getNumberOfPages();
    const dateStr = new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      setDrw(P.border);
      doc.setLineWidth(0.3);
      doc.line(ML, ph - 16, pw - MR, ph - 16);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      setTxt(P.slate);
      doc.text('System-generated report. Data accuracy depends on submitted waste reports.', ML, ph - 10);
      doc.text(`Page ${i} of ${pages}`, pw - MR, ph - 10, { align: 'right' });
      doc.setFontSize(6);
      setTxt(P.slateL);
      doc.text(`${dateStr}  ·  Waste Management System`, CT, ph - 4, { align: 'center' });
    }
  };

  /* ══════════════════════════════════════════════════════
     REUSABLE DRAWING HELPERS
  ══════════════════════════════════════════════════════ */

  // FIX: increased default minSpace so heading + table header + rows don't orphan
  const checkPage = (y, minSpace = 55) => {
    if (y + minSpace > ph - 24) {
      doc.addPage();
      drawHeader();
      return 58;
    }
    return y;
  };

  // FIX: bumped minSpace to 40 so section heading never lands alone at bottom
  const sectionHeading = (label, y, accent = P.blue) => {
    y = checkPage(y, 40);
    setFill(P.light);
    rR(ML, y, CW, 10, 2);
    setFill(accent);
    doc.rect(ML, y, 3.5, 10, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    setTxt(P.navy);
    doc.text(label, ML + 9, y + 7);
    return y + 15;
  };

  const metricRow = (y, stats) => {
    y = checkPage(y, 36);
    const gap   = 4;
    const boxW  = (CW - gap * (stats.length - 1)) / stats.length;
    stats.forEach((s, i) => {
      const bx = ML + i * (boxW + gap);
      setFill(P.white);
      setDrw(P.border);
      doc.setLineWidth(0.25);
      rR(bx, y, boxW, 28, 2, 'FD');
      setFill(s.color || P.blue);
      doc.rect(bx, y, boxW, 2, 'F');
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      setTxt(s.color || P.navy);
      doc.text(String(s.value), bx + boxW / 2, y + 16, { align: 'center' });
      doc.setFontSize(6);
      doc.setFont('helvetica', 'normal');
      setTxt(P.slateL);
      doc.text(s.label.toUpperCase(), bx + boxW / 2, y + 23, { align: 'center' });
    });
    return y + 33;
  };

  const insightBox = (y, title, content, accent = P.blue, bgColor = P.blueLt) => {
    const innerW   = CW - 20;
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    const lines    = doc.splitTextToSize(content, innerW);
    const lineH    = 4.8;
    const titleH   = 14;
    const padB     = 8;
    const boxH     = titleH + lines.length * lineH + padB;

    y = checkPage(y, boxH + 6);

    setFill(bgColor);
    setDrw(P.border);
    doc.setLineWidth(0.3);
    rR(ML, y, CW, boxH, 3, 'FD');
    setFill(accent);
    doc.rect(ML, y, 3.5, boxH, 'F');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    setTxt(P.navy);
    doc.text(title, ML + 9, y + 9);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    setTxt([60, 72, 90]);
    let ty = y + titleH;
    lines.forEach(l => { doc.text(l, ML + 9, ty); ty += lineH; });

    return y + boxH + 8;
  };

  /* ══════════════════════════════════════════════════════
     autoTable DEFAULTS
     FIX: added showHead:'everyPage' and rowPageBreak:'avoid'
  ══════════════════════════════════════════════════════ */
  const tableDefaults = {
    theme: 'plain',
    margin: { left: ML, right: MR },
    tableLineWidth: 0,
    showHead: 'everyPage',      // ← FIX: always show header on each page
    rowPageBreak: 'avoid',      // ← FIX: don't split a single row across pages
    headStyles: {
      fillColor: P.navy, textColor: P.white, fontStyle: 'bold',
      fontSize: 7.5, cellPadding: { top: 4, bottom: 4, left: 5, right: 5 },
    },
    bodyStyles: {
      fontSize: 7.5, textColor: P.navy,
      cellPadding: { top: 3.5, bottom: 3.5, left: 5, right: 5 },
    },
    alternateRowStyles: { fillColor: P.light },
  };

  /* ══════════════════════════════════════════════════════
     START BUILDING
  ══════════════════════════════════════════════════════ */
  drawHeader();
  let y = 58;

  const ov      = analyticsData.overview;
  const hasData = ov.total > 0;

  if (!hasData) {
    y = checkPage(y, 50);
    setFill(P.light);
    rR(ML, y, CW, 44, 4);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    setTxt(P.slate);
    doc.text('No waste reports found for the selected period.', CT, y + 20, { align: 'center' });
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    setTxt(P.slateL);
    doc.text('Please try a different date range or barangay filter.', CT, y + 32, { align: 'center' });
    drawFooter();
    return;
  }

  /* ── Computed rates ─────────────────────────────────── */
  const pct       = (n) => ov.total > 0 ? ((n / ov.total) * 100).toFixed(1) : '0.0';
  const recycRate = pct(ov.recycled);
  const procRate  = pct(ov.processed);
  const effRate   = ov.total > 0 ? (((ov.processed + ov.recycled) / ov.total) * 100).toFixed(1) : '0.0';

  const topWaste   = analyticsData.classificationBreakdown?.[0]?.classification || 'None';
  const topWastePct= analyticsData.classificationBreakdown?.[0]?.percentage?.toFixed(1) || '0';
  const topItem    = analyticsData.mostScannedItems?.[0]?.name || 'None';
  const users      = analyticsData.userActivity || [];
  const topUser    = users[0]?.userName || 'None';
  const topUserRep = users[0]?.reportCount || 0;
  const avgRpu     = users.length > 0 ? (ov.total / users.length).toFixed(1) : '0.0';
  const totalWt    = ov.totalWeight || 0;

  /* ════════════════════════════════════════════════
     SECTION 1 — EXECUTIVE SUMMARY
  ════════════════════════════════════════════════ */
  y = sectionHeading('1. EXECUTIVE SUMMARY', y, P.blue);

  const perfMsg = recycRate > 50
    ? 'The recycling initiative shows excellent performance.'
    : recycRate > 25
      ? 'The recycling initiative shows moderate performance. Further improvement is recommended.'
      : 'The recycling initiative requires significant improvement. Immediate action is needed.';

  const summaryText =
    `During this ${periodType} (${periodLabel}), Barangay ${brgyShort} recorded ${ov.total} waste ` +
    `${ov.total === 1 ? 'report' : 'reports'}. Recycled: ${ov.recycled} (${recycRate}%), ` +
    `Processed: ${ov.processed} (${procRate}%). Top waste category: "${topWaste}" (${topWastePct}%). ` +
    `Most scanned item: "${topItem !== 'None' ? topItem : 'Other'}". ${perfMsg}`;

  y = insightBox(y, 'PERFORMANCE OVERVIEW', summaryText, P.blue, P.blueLt);
  y += 4;

  /* ════════════════════════════════════════════════
     SECTION 2 — WASTE ANALYTICS
  ════════════════════════════════════════════════ */
  if (reportType === 'full' || reportType === 'waste') {
    y = sectionHeading('2. WASTE ANALYTICS', y, P.teal);

    y = metricRow(y, [
      { label: 'Total Reports',   value: ov.total,              color: P.blue  },
      { label: 'Recycled',        value: ov.recycled,           color: P.green },
      { label: 'Processed',       value: ov.processed,          color: P.cyan  },
      { label: 'Pending',         value: ov.pending,            color: P.amber },
      { label: 'Disposed',        value: ov.disposed,           color: P.slate },
    ]);

    y = metricRow(y, [
      { label: 'Total Weight (kg)',  value: totalWt.toFixed(1), color: P.teal   },
      { label: 'Recycling Rate',     value: `${recycRate}%`,    color: P.green  },
      { label: 'Efficiency Rate',    value: `${effRate}%`,      color: P.blue   },
      { label: 'Avg Wt/Report (kg)', value: ov.total > 0 ? (totalWt / ov.total).toFixed(2) : '0.00', color: P.navyMd },
    ]);
    y += 4;

    const wasteLevel = recycRate > 30 ? 'good' : recycRate > 10 ? 'moderate' : 'low';
    const wasteText =
      `Based on ${ov.total} reports this ${periodType}, "${topWaste}" is the most common waste ` +
      `type at ${topWastePct}%. Recycling rate is ${recycRate}% (${wasteLevel}). Overall efficiency ` +
      `(recycled + processed): ${effRate}%. ${ov.pending} report${ov.pending !== 1 ? 's' : ''} remain pending.`;

    y = insightBox(y, 'WASTE ANALYSIS INSIGHTS', wasteText, P.teal, P.tealLt);
    y += 4;

    /* 2.1 — Classification Breakdown */
    const cls = analyticsData.classificationBreakdown || [];
    if (cls.length > 0) {
      y = sectionHeading('2.1  Waste Classification Breakdown', y, P.blue);

      // FIX: explicit pre-flight space check before autoTable
      y = checkPage(y, 60);

      autoTable(doc, {
        ...tableDefaults,
        startY: y,
        head: [['No.', 'Waste Classification', 'Reports', 'Percentage']],
        body: cls.map((item, i) => [
          i + 1,
          item.classification || 'Unclassified',
          item.count,
          `${(item.percentage || 0).toFixed(1)}%`,
        ]),
        columnStyles: {
          0: { cellWidth: 14, halign: 'center', fontStyle: 'bold', textColor: P.slateL },
          1: { cellWidth: 90, fontStyle: 'bold' },
          2: { cellWidth: 40, halign: 'center', fontStyle: 'bold', textColor: P.blue },
          3: { cellWidth: 38, halign: 'center', fontStyle: 'bold', textColor: P.green },
        },
        didParseCell: (d) => {
          if (d.section === 'head') d.cell.styles.halign = d.column.index === 0 ? 'center' : 'left';
        },
        // FIX: re-draw header background on each new page
        didDrawPage: (data) => {
          if (data.pageNumber > 1) drawHeader();
        },
      });
      y = doc.lastAutoTable.finalY + 8;

      const clsText =
        `"${topWaste}" is the most prevalent waste type at ${topWastePct}% of all reports. ` +
        `This data helps identify priority categories for waste management interventions.`;
      y = insightBox(y, 'Classification Analysis', clsText, P.blue, P.blueLt);
      y += 4;
    }

    /* 2.2 — Most Scanned Items */
    const scanned = analyticsData.mostScannedItems || [];
    if (scanned.length > 0) {
      y = sectionHeading('2.2  Most Scanned Items', y, P.green);

      // FIX: explicit pre-flight space check before autoTable
      y = checkPage(y, 60);

      autoTable(doc, {
        ...tableDefaults,
        startY: y,
        head: [['Rank', 'Item Type', 'Scans', 'Share (%)']],
        body: scanned.slice(0, 8).map((item, i) => [
          i + 1,
          item.name || 'Unknown',
          item.count,
          `${(item.percentage || 0).toFixed(1)}%`,
        ]),
        columnStyles: {
          0: { cellWidth: 14, halign: 'center', fontStyle: 'bold', textColor: P.slateL },
          1: { cellWidth: 94, fontStyle: 'bold' },
          2: { cellWidth: 38, halign: 'center', fontStyle: 'bold', textColor: P.blue },
          3: { cellWidth: 36, halign: 'center', fontStyle: 'bold', textColor: P.green },
        },
        didDrawPage: (data) => {
          if (data.pageNumber > 1) drawHeader();
        },
      });
      y = doc.lastAutoTable.finalY + 8;

      const firstItem  = scanned[0]?.name || 'Unknown';
      const firstCount = scanned[0]?.count || 0;
      const firstShare = ov.total > 0 ? ((firstCount / ov.total) * 100).toFixed(1) : '0.0';
      const scanText   =
        `"${firstItem}" is the most frequently scanned item with ${firstCount} scan${firstCount !== 1 ? 's' : ''} ` +
        `(${firstShare}% of all scans). This helps identify which materials need focused recycling programs.`;
      y = insightBox(y, 'Scan Pattern Analysis', scanText, P.green, P.greenLt);
      y += 4;
    }
  }

  /* ════════════════════════════════════════════════
     SECTION 3 — USER ANALYTICS
  ════════════════════════════════════════════════ */
  if (reportType === 'full' || reportType === 'user') {
    const totalContrib  = users.length;
    const activeContrib = users.filter(u => u.reportCount > 0).length;

    y = sectionHeading('3. USER ANALYTICS', y, P.purple);

    y = metricRow(y, [
      { label: 'Total Users',       value: totalContrib,  color: P.purple },
      { label: 'Active Users',      value: activeContrib, color: P.green  },
      { label: 'Top Contributor',   value: topUserRep,    color: P.cyan   },
      { label: 'Avg Reports / User',value: avgRpu,        color: P.blue   },
    ]);
    y += 4;

    let userText = '';
    if (totalContrib === 0) {
      userText = `No community participation was recorded during this ${periodType}. Urgent engagement initiatives are needed.`;
    } else if (totalContrib < 5) {
      userText = `Only ${totalContrib} resident${totalContrib > 1 ? 's' : ''} participated during this ${periodType}. "${topUser}" was most active with ${topUserRep} reports. Community participation is low.`;
    } else if (totalContrib < 20) {
      userText = `${totalContrib} residents participated this ${periodType}. "${topUser}" led with ${topUserRep} reports. Average: ${avgRpu} reports/user. Participation is moderate.`;
    } else {
      userText = `${totalContrib} residents participated this ${periodType}. "${topUser}" led with ${topUserRep} reports. Average: ${avgRpu} reports/user. Strong community participation.`;
    }
    y = insightBox(y, 'User Participation Insights', userText, P.purple, P.purpleLt);
    y += 4;

    /* 3.1 — Top Contributors */
    if (users.length > 0) {
      y = sectionHeading('3.1  Top Contributors', y, P.purple);

      // FIX: explicit pre-flight space check before autoTable
      y = checkPage(y, 60);

      autoTable(doc, {
        ...tableDefaults,
        startY: y,
        head: [['Rank', 'Name', 'Reports', 'Email']],
        body: users.slice(0, 10).map((u, i) => [
          i + 1,
          u.userName  || 'Resident',
          u.reportCount,
          u.userEmail || '—',
        ]),
        columnStyles: {
          0: { cellWidth: 14, halign: 'center', fontStyle: 'bold', textColor: P.slateL },
          1: { cellWidth: 72, fontStyle: 'bold' },
          2: { cellWidth: 28, halign: 'center', fontStyle: 'bold', textColor: P.blue },
          3: { cellWidth: 68, textColor: P.slate, fontSize: 7 },
        },
        didDrawPage: (data) => {
          if (data.pageNumber > 1) drawHeader();
        },
      });
      y = doc.lastAutoTable.finalY + 8;
    }
  }

  /* ════════════════════════════════════════════════
     SECTION 4 — LOCATION INSIGHTS  (full only)
  ════════════════════════════════════════════════ */
  if (reportType === 'full') {
    const locs     = analyticsData.locationBreakdown || [];
    const topLocs  = locs.slice(0, 6);

    if (topLocs.length > 0) {
      y = sectionHeading('4. LOCATION INSIGHTS', y, P.amber);

      // FIX: explicit pre-flight space check before autoTable
      y = checkPage(y, 60);

      autoTable(doc, {
        ...tableDefaults,
        startY: y,
        head: [['Rank', 'Location', 'Reports', 'Weight (kg)']],
        body: topLocs.map((loc, i) => [
          i + 1,
          (loc.name || loc.address || 'Unknown').substring(0, 38),
          loc.reports || loc.count || 0,
          (loc.weight || loc.totalWeight || 0).toFixed(1),
        ]),
        columnStyles: {
          0: { cellWidth: 14, halign: 'center', fontStyle: 'bold', textColor: P.slateL },
          1: { cellWidth: 96, fontStyle: 'bold' },
          2: { cellWidth: 34, halign: 'center', fontStyle: 'bold', textColor: P.blue },
          3: { cellWidth: 38, halign: 'center', fontStyle: 'bold', textColor: P.teal },
        },
        didDrawPage: (data) => {
          if (data.pageNumber > 1) drawHeader();
        },
      });
      y = doc.lastAutoTable.finalY + 8;

      const topLoc      = topLocs[0]?.name || topLocs[0]?.address || 'an area';
      const topLocCount = topLocs[0]?.reports || topLocs[0]?.count || 0;
      const locText =
        `"${topLoc}" has the highest concentration of waste reports with ${topLocCount} ` +
        `report${topLocCount !== 1 ? 's' : ''}. This helps identify priority areas for collection scheduling.`;
      y = insightBox(y, 'Geographic Distribution', locText, P.amber, P.amberLt);
      y += 4;
    }
  }

  /* ════════════════════════════════════════════════
     SECTION 5 — RECOMMENDATIONS  (full only)
  ════════════════════════════════════════════════ */
  if (reportType === 'full') {
    y = sectionHeading('5. RECOMMENDATIONS', y, P.red);

    const recs = [];
    if (recycRate < 30) {
      recs.push('Launch intensive recycling awareness campaigns targeting households and businesses.');
      recs.push('Install additional recycling bins in strategic locations across the barangay.');
      recs.push('Partner with local recycling facilities to improve waste processing capacity.');
    } else if (recycRate < 60) {
      recs.push('Enhance existing recycling programs with incentives for active participants.');
      recs.push('Conduct regular community workshops on proper waste segregation techniques.');
      recs.push('Expand recycling infrastructure to cover more waste types.');
    } else {
      recs.push('Maintain current recycling momentum through continued education and support.');
      recs.push('Share success stories to encourage wider community participation.');
      recs.push('Explore advanced recycling technologies for difficult-to-process materials.');
    }
    if (users.length < 5) {
      recs.push('Implement community engagement initiatives to increase resident participation.');
      recs.push('Create recognition programs for active contributors to motivate others.');
    } else if (users.length < 20) {
      recs.push('Develop user-friendly reporting tools to make waste reporting more accessible.');
      recs.push('Establish a feedback system to acknowledge and reward regular contributors.');
    }
    recs.push('Process pending waste reports promptly to maintain data accuracy.');
    recs.push('Schedule more frequent waste collection in high-density areas.');
    recs.push('Provide targeted education for proper classification of common waste types.');

    const finalRecs = recs.slice(0, 8);

    // FIX: explicit pre-flight space check before autoTable
    y = checkPage(y, 60);

    autoTable(doc, {
      ...tableDefaults,
      startY: y,
      head: [['#', 'Recommendation']],
      body: finalRecs.map((r, i) => [i + 1, r]),
      columnStyles: {
        0: { cellWidth: 10, halign: 'center', fontStyle: 'bold', textColor: P.slateL },
        1: { cellWidth: 172 },
      },
      bodyStyles: {
        ...tableDefaults.bodyStyles,
        cellPadding: { top: 4, bottom: 4, left: 5, right: 5 },
        lineColor: P.border,
      },
      didDrawPage: (data) => {
        if (data.pageNumber > 1) drawHeader();
      },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  drawFooter();
};

/* ═══════════════════════════════════════════
   PROCESS DATA
═══════════════════════════════════════════ */
const processData = (reports) => {
  if (!reports?.length) return {
    overview: { total:0, pending:0, processed:0, recycled:0, disposed:0, rejected:0, totalWeight:0 },
    classificationBreakdown:[], userActivity:[], mostScannedItems:[], locationBreakdown:[],
    summary: { mostCommonClassification:'N/A', topMaterial:'N/A', mostActiveUser:'N/A', avgReportsPerUser:0 },
  };

  let totalWeight = 0;
  reports.forEach(r => { totalWeight += calculateTotalWeight(r); });

  const ov = {
    total:     reports.length,
    pending:   reports.filter(r => r.status === 'pending').length,
    processed: reports.filter(r => r.status === 'processed').length,
    recycled:  reports.filter(r => r.status === 'recycled').length,
    disposed:  reports.filter(r => r.status === 'disposed').length,
    rejected:  reports.filter(r => r.status === 'rejected').length,
    totalWeight: parseFloat(totalWeight.toFixed(2)),
  };

  const clsMap = new Map();
  reports.forEach(r => {
    let c = r.classification || 'Unknown';
    if (c === 'Unknown' || c === 'unknown') c = 'Unclassified';
    clsMap.set(c, (clsMap.get(c) || 0) + 1);
  });
  const classificationBreakdown = [...clsMap.entries()]
    .map(([name, count]) => ({ classification:name, count, percentage:(count/ov.total)*100 }))
    .sort((a,b) => b.count - a.count);

  const scanMap = new Map();
  reports.forEach(r => {
    if (r.detectedObjects?.length) {
      r.detectedObjects.forEach(obj => {
        let lbl = obj.label || 'Unknown';
        if (lbl === 'Unknown' || lbl === 'unknown') lbl = 'Unclassified Item';
        scanMap.set(lbl, (scanMap.get(lbl) || 0) + 1);
      });
    } else {
      let c = r.classification || 'Unknown';
      if (c === 'Unknown') c = 'Unclassified';
      scanMap.set(c, (scanMap.get(c) || 0) + 1);
    }
  });
  const mostScannedItems = [...scanMap.entries()]
    .map(([name, count]) => ({ name, count, percentage:(count/ov.total)*100 }))
    .sort((a,b) => b.count - a.count).slice(0, 10);

  const userMap = new Map();
  reports.forEach(r => {
    const uid   = r.userId || r.user?._id || r.user;
    let uname   = r.userName || r.user?.name || r.user?.email?.split('@')[0] || 'Resident';
    if (!uname || uname === 'anonymous') uname = 'Resident';
    const uemail = r.userEmail || r.user?.email || '';
    const key    = uid || uname;
    if (userMap.has(key)) { userMap.get(key).reportCount += 1; }
    else { userMap.set(key, { userName:uname, reportCount:1, userEmail:uemail }); }
  });
  const userActivity = [...userMap.values()].sort((a,b) => b.reportCount - a.reportCount).slice(0, 15);

  const locMap = new Map();
  reports.forEach(r => {
    let loc = r.location || r.address || 'Unknown Location';
    if (typeof loc === 'object') loc = loc.address || loc.name || 'Unknown Location';
    if (!loc || loc === 'unknown') loc = 'Other Areas';
    const w = calculateTotalWeight(r);
    if (locMap.has(loc)) { const e = locMap.get(loc); e.reports += 1; e.weight += w; }
    else { locMap.set(loc, { name:loc, reports:1, weight:w }); }
  });
  const locationBreakdown = [...locMap.values()].sort((a,b) => b.reports - a.reports).slice(0, 10);

  return {
    overview: ov,
    classificationBreakdown,
    mostScannedItems,
    userActivity,
    locationBreakdown,
    summary: {
      mostCommonClassification: classificationBreakdown[0]?.classification || 'None',
      topMaterial:   mostScannedItems[0]?.name || 'None',
      mostActiveUser: userActivity[0]?.userName || 'None',
      avgReportsPerUser: ov.total / (userMap.size || 1),
    },
  };
};

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
const Analytics = ({ adminRole, barangayName }) => {
  const [loading,        setLoading]       = useState(false);
  const [reportPeriod,   setReportPeriod]  = useState('month');
  const [selectedMonth,  setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear,   setSelectedYear]  = useState(new Date().getFullYear());
  const [selectedWeek,   setSelectedWeek]  = useState(getCurrentWeekNumber());
  const [reportType,     setReportType]    = useState('full');
  const [fetchError,     setFetchError]    = useState(null);
  const [success,        setSuccess]       = useState(false);

  const availableYears = [
    new Date().getFullYear(),
    new Date().getFullYear() - 1,
    new Date().getFullYear() - 2,
  ];

  const getDateRange = () => {
    let startDate, endDate;
    if (reportPeriod === 'week') {
      const firstDay = new Date(selectedYear, 0, 1);
      const dow      = firstDay.getDay();
      startDate = new Date(selectedYear, 0, 1);
      startDate.setDate(startDate.getDate() + (selectedWeek - 1) * 7 - dow);
      const curDow = startDate.getDay();
      startDate.setDate(startDate.getDate() - (curDow === 0 ? 6 : curDow - 1));
      startDate.setHours(0,0,0,0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23,59,59,999);
    } else if (reportPeriod === 'month') {
      startDate = new Date(selectedYear, selectedMonth, 1);
      endDate   = new Date(selectedYear, selectedMonth + 1, 0);
      endDate.setHours(23,59,59,999);
    } else {
      startDate = new Date(selectedYear, 0, 1);
      endDate   = new Date(selectedYear, 11, 31);
      endDate.setHours(23,59,59,999);
    }
    return { startDate, endDate };
  };

  const fetchWasteReports = async () => {
    const { startDate, endDate } = getDateRange();
    const token  = localStorage.getItem('adminToken');
    const params = new URLSearchParams();
    if (startDate && endDate) {
      params.append('startDate', startDate.toISOString().split('T')[0]);
      params.append('endDate',   endDate.toISOString().split('T')[0]);
    }
    if (adminRole === 'southadmin')   params.append('barangay', 'south_signal');
    if (adminRole === 'centraladmin') params.append('barangay', 'central_bicutan');
    let url = `${API_URL}/api/waste-reports`;
    if (params.toString()) url += `?${params.toString()}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
    const data = await res.json();
    return data.reports || data || [];
  };

  const handleDownload = async () => {
    setLoading(true);
    setFetchError(null);
    setSuccess(false);
    try {
      const reports = await fetchWasteReports();
      if (!reports?.length) {
        setFetchError('No waste reports found for the selected period. Please try a different date range.');
        return;
      }
      const data       = processData(reports);
      const { startDate, endDate } = getDateRange();
      const doc        = new jsPDF('p', 'mm', 'a4');
      await buildPDF(doc, data, {
        reportPeriod, selectedMonth, selectedYear, selectedWeek,
        barangayName: barangayName || 'South Signal Village',
        startDate, endDate, reportType,
      });
      const rtSuffix = reportType === 'full' ? '_Full' : reportType === 'waste' ? '_Waste' : '_User';
      const mSuffix  = reportPeriod === 'month' ? `_${selectedMonth + 1}` : '';
      doc.save(
        `WasteReport_${(barangayName || 'Barangay').replace(/\s/g,'_')}` +
        `${rtSuffix}_${reportPeriod}_${selectedYear}${mSuffix}.pdf`
      );
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3500);
    } catch (err) {
      console.error(err);
      setFetchError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const periodLabel = reportPeriod === 'week'
    ? `Week ${selectedWeek}, ${selectedYear}`
    : reportPeriod === 'month'
      ? `${MONTHS[selectedMonth]} ${selectedYear}`
      : `Year ${selectedYear}`;

  /* ── Styles ─────────────────────────────────────────────────── */
  const S = {
    wrap: {
      background: T.white, border: `1.5px solid ${T.border}`,
      borderRadius: 16, marginBottom: 24, overflow: 'hidden',
      boxShadow: '0 2px 16px rgba(10,22,40,0.07)',
      fontFamily: "'Sora','DM Sans','Inter',sans-serif",
    },
    band: {
      background: `linear-gradient(130deg, ${T.navy} 0%, ${T.navyLight} 100%)`,
      padding: '20px 24px 18px', position: 'relative', overflow: 'hidden',
    },
    bandBottom: {
      position:'absolute', bottom:0, left:0, right:0, height:3,
      background: `linear-gradient(90deg,${T.cyan},${T.blue})`,
    },
    bandDeco: {
      position:'absolute', top:-40, right:-40, width:180, height:180,
      borderRadius:'50%', background:'rgba(255,255,255,0.04)', pointerEvents:'none',
    },
    bandTitle: {
      fontSize:17, fontWeight:800, color:T.white, margin:'0 0 4px',
      letterSpacing:'-0.02em', display:'flex', alignItems:'center', gap:9,
    },
    bandSub: { fontSize:12, color:'rgba(148,163,184,0.85)', margin:0 },
    pillBadge: {
      display:'inline-flex', alignItems:'center', gap:5,
      padding:'4px 12px', borderRadius:20,
      background:'rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.85)',
      fontSize:11.5, fontWeight:600, border:'1px solid rgba(255,255,255,0.16)',
    },
    body: { padding:'20px 24px' },
    divider: { width:'1px', height:26, background:T.border, flexShrink:0 },
    row: { display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:16 },
    label: { fontSize:11.5, fontWeight:700, color:T.slate, textTransform:'uppercase', letterSpacing:'0.07em', flexShrink:0 },
    dlBtn: (dis) => ({
      display:'flex', alignItems:'center', gap:8, padding:'11px 24px',
      borderRadius:10, border:'none',
      background: dis ? '#CBD5E1' : `linear-gradient(135deg,${T.navy},${T.blue})`,
      color: dis ? T.slate : T.white,
      fontSize:13, fontWeight:700, cursor: dis ? 'not-allowed' : 'pointer',
      boxShadow: dis ? 'none' : '0 4px 14px rgba(37,99,235,0.35)',
      transition:'all 0.2s', fontFamily:'inherit', letterSpacing:'0.01em', whiteSpace:'nowrap',
    }),
    hint: {
      display:'flex', alignItems:'center', gap:6, marginTop:4, fontSize:11.5,
      color:T.slateLight, padding:'8px 12px', background:T.pageBg, borderRadius:8,
    },
    successBar: {
      display:'flex', alignItems:'center', gap:8, background:'#ECFDF5',
      border:'1px solid #6EE7B7', borderRadius:8, padding:'10px 16px', marginTop:12,
      fontSize:12.5, color:'#065F46', fontWeight:600,
    },
    errorBar: {
      display:'flex', alignItems:'center', gap:8, background:'#FEF2F2',
      border:'1px solid #FECACA', borderRadius:8, padding:'10px 16px', marginTop:12,
      fontSize:12.5, color:'#991B1B', fontWeight:500,
    },
    overlay: {
      position:'fixed', inset:0, background:'rgba(10,22,40,0.75)',
      backdropFilter:'blur(6px)', display:'flex', alignItems:'center',
      justifyContent:'center', zIndex:9999,
    },
    overlayBox: {
      background:T.white, borderRadius:20, padding:'44px 52px', textAlign:'center',
      boxShadow:'0 32px 80px rgba(0,0,0,0.25)',
      display:'flex', flexDirection:'column', alignItems:'center', gap:18,
      border:`1px solid ${T.border}`, minWidth:280,
    },
    spinRing: {
      width:52, height:52, borderRadius:'50%',
      border:`5px solid ${T.pageBg}`, borderTop:`5px solid ${T.blue}`,
      animation:'tmfk_spin 0.75s linear infinite',
    },
  };

  /* ── Period tabs ─────────────────────────────────────────────── */
  const PeriodTabs = ({ value, onChange }) => {
    const tabs = [
      { id:'week',  label:'Weekly',  icon:IC.week },
      { id:'month', label:'Monthly', icon:IC.calendar },
      { id:'year',  label:'Yearly',  icon:IC.year },
    ];
    return (
      <div style={{ display:'flex', gap:4, background:'#EEF2F7', borderRadius:10, padding:3 }}>
        {tabs.map(tab => {
          const active = value === tab.id;
          return (
            <button key={tab.id} onClick={() => onChange(tab.id)} style={{
              display:'flex', alignItems:'center', gap:5, padding:'7px 14px',
              borderRadius:8, border:'none',
              background: active ? '#FFFFFF' : 'transparent',
              color: active ? '#0A1628' : '#64748B',
              fontWeight: active ? 700 : 500, fontSize:12.5, cursor:'pointer',
              boxShadow: active ? '0 1px 4px rgba(10,22,40,0.1)' : 'none',
              transition:'all 0.18s', fontFamily:'inherit',
            }}>
              <Ico d={tab.icon} size={13} color={active ? '#2563EB' : '#64748B'} sw={active ? 2.2 : 1.8} />
              {tab.label}
            </button>
          );
        })}
      </div>
    );
  };

  /* ── Report type cards ───────────────────────────────────────── */
  const ReportTypeCards = ({ value, onChange }) => {
    const types = [
      { id:'full',  label:'Full Report',       desc:'All sections included',              icon:IC.layers  },
      { id:'waste', label:'Waste Analytics',   desc:'Waste classification & materials',  icon:IC.recycle },
      { id:'user',  label:'User Analytics',    desc:'User activity & contributions',     icon:IC.users   },
    ];
    return (
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        {types.map(rt => {
          const active = value === rt.id;
          return (
            <div key={rt.id} onClick={() => onChange(rt.id)} style={{
              display:'flex', alignItems:'center', gap:10, padding:'10px 16px',
              borderRadius:10, cursor:'pointer',
              border: active ? `2px solid ${T.blue}` : `2px solid ${T.border}`,
              background: active ? 'rgba(37,99,235,0.05)' : T.white,
              transition:'all 0.15s', minWidth:160,
              boxShadow: active ? `0 0 0 3px rgba(37,99,235,0.12)` : '0 1px 3px rgba(10,22,40,0.06)',
            }}>
              <div style={{
                width:28, height:28, borderRadius:7, flexShrink:0,
                background: active ? T.blue : T.pageBg,
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                <Ico d={rt.icon} size={14} color={active ? T.white : T.slate} sw={2} />
              </div>
              <div>
                <div style={{ fontSize:12.5, fontWeight:700, color: active ? T.blue : T.navy }}>{rt.label}</div>
                <div style={{ fontSize:10.5, color:T.slateLight, marginTop:1 }}>{rt.desc}</div>
              </div>
              {active && (
                <div style={{ marginLeft:'auto', flexShrink:0 }}>
                  <Ico d={IC.check} size={14} color={T.blue} sw={2.5} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  /* ── Styled select ───────────────────────────────────────────── */
  const StyledSelect = ({ value, onChange, children, icon }) => (
    <div style={{ position:'relative', display:'flex', alignItems:'center' }}>
      {icon && (
        <span style={{ position:'absolute', left:10, pointerEvents:'none', display:'flex' }}>
          <Ico d={icon} size={14} color={T.slate} sw={2} />
        </span>
      )}
      <select value={value} onChange={onChange} style={{
        appearance:'none', WebkitAppearance:'none',
        paddingLeft: icon ? 30 : 12, paddingRight:28, paddingTop:8, paddingBottom:8,
        borderRadius:9, border:`1.5px solid ${T.border}`,
        fontSize:12.5, color:T.navy, fontWeight:600, background:T.white,
        cursor:'pointer', fontFamily:'inherit',
        boxShadow:'0 1px 3px rgba(10,22,40,0.06)', outline:'none', minWidth:120,
      }}>
        {children}
      </select>
      <span style={{ position:'absolute', right:9, pointerEvents:'none', display:'flex' }}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill={T.slate}><path d="M1 3l4 4 4-4" /></svg>
      </span>
    </div>
  );

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes tmfk_spin   { to { transform: rotate(360deg); } }
        @keyframes tmfk_fadein { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
      `}</style>

      {loading && (
        <div style={S.overlay}>
          <div style={{ ...S.overlayBox, animation:'tmfk_fadein 0.2s ease' }}>
            <div style={{
              width:72, height:72, borderRadius:'50%',
              background:`linear-gradient(135deg,${T.navy},${T.navyLight})`,
              display:'flex', alignItems:'center', justifyContent:'center', position:'relative',
            }}>
              <div style={S.spinRing} />
              <div style={{ position:'absolute' }}>
                <Ico d={IC.doc} size={22} color={T.cyan} sw={1.6} />
              </div>
            </div>
            <div>
              <p style={{ fontSize:16, fontWeight:800, color:T.navy, margin:'0 0 4px' }}>Building Your Report…</p>
              <p style={{ fontSize:12, color:T.slate, margin:0 }}>Fetching data and generating PDF</p>
            </div>
          </div>
        </div>
      )}

      <div style={S.wrap}>
        {/* Header band */}
        <div style={S.band}>
          <div style={S.bandDeco} />
          <div style={{ position:'relative', zIndex:1, display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
            <div>
              <h3 style={S.bandTitle}>
                <Ico d={IC.doc} size={20} color={T.cyan} sw={2} />
                Analytics PDF Report
              </h3>
              <p style={S.bandSub}>Generate a detailed waste report for {barangayName || 'your barangay'}</p>
            </div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
              <span style={S.pillBadge}>
                <Ico d={IC.chart} size={12} color={T.cyan} sw={2.2} />
                {(barangayName || 'All Barangays').toUpperCase()}
              </span>
              <span style={S.pillBadge}>
                <Ico d={IC.calendar} size={12} color={T.cyan} sw={2.2} />
                {periodLabel}
              </span>
            </div>
          </div>
          <div style={S.bandBottom} />
        </div>

        {/* Body */}
        <div style={S.body}>
          {/* Period row */}
          <div style={S.row}>
            <span style={S.label}>Period</span>
            <PeriodTabs value={reportPeriod} onChange={setReportPeriod} />
            <div style={S.divider} />
            {reportPeriod === 'month' && (
              <StyledSelect value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))} icon={IC.calendar}>
                {MONTHS.map((m,i) => <option key={i} value={i}>{m}</option>)}
              </StyledSelect>
            )}
            {reportPeriod === 'week' && (
              <StyledSelect value={selectedWeek} onChange={e => setSelectedWeek(parseInt(e.target.value))} icon={IC.week}>
                {Array.from({ length:52 }, (_,i) => (
                  <option key={i+1} value={i+1}>Week {i+1}</option>
                ))}
              </StyledSelect>
            )}
            <StyledSelect value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} icon={IC.year}>
              {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
            </StyledSelect>
          </div>

          {/* Report type */}
          <div style={{ marginBottom:16 }}>
            <div style={{ ...S.label, marginBottom:10, display:'block' }}>Report Content</div>
            <ReportTypeCards value={reportType} onChange={setReportType} />
          </div>

          {/* Download row */}
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
            <div style={S.hint}>
              <Ico d={IC.info} size={14} color={T.slateLight} sw={1.8} />
              <span>
                {reportType === 'full'
                  ? 'Includes: Executive Summary · Waste Analytics · Classification · Most Scanned Items · User Analytics · Location Insights · Recommendations'
                  : reportType === 'waste'
                    ? 'Includes: Executive Summary · Waste Analytics · Classification · Most Scanned Items'
                    : 'Includes: Executive Summary · User Analytics · Top Contributors'}
              </span>
            </div>
            <button
              style={S.dlBtn(loading)}
              onClick={handleDownload}
              disabled={loading}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
            >
              <Ico d={IC.download} size={15} color={loading ? T.slate : T.white} sw={2.2} />
              {loading ? 'Generating…' : 'Download PDF'}
            </button>
          </div>

          {success && (
            <div style={{ ...S.successBar, animation:'tmfk_fadein 0.25s ease' }}>
              <Ico d={IC.check} size={16} color="#059669" sw={2.5} />
              Report downloaded successfully!
            </div>
          )}

          {fetchError && (
            <div style={S.errorBar}>
              <Ico d={IC.alert} size={16} color="#DC2626" sw={2} />
              Error: {fetchError}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Analytics;