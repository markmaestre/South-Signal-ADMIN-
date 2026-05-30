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

const REPORT_TYPES = [
  { id: 'full',           label: 'Full Report',              desc: 'All sections included' },
  { id: 'classification', label: 'Classification Only',      desc: 'Waste type breakdown + progress bars' },
];

function getCurrentWeekNumber() {
  const now   = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const days  = Math.floor((now - start) / 864e5);
  return Math.ceil((days + start.getDay() + 1) / 7);
}

/* ─────────────────────────────────────────────
   ICON
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
  filter:   ['M22 3H2l8 9.46V19l4 2v-8.54L22 3z'],
  layers:   ['M12 2L2 7l10 5 10-5-10-5z','M2 17l10 5 10-5','M2 12l10 5 10-5'],
  info:     ['M12 2a10 10 0 100 20A10 10 0 0012 2z','M12 16v-4','M12 8h.01'],
};

/* ─────────────────────────────────────────────
   UI COMPONENTS
───────────────────────────────────────────── */
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
      <svg width="10" height="10" viewBox="0 0 10 10" fill={T.slate}><path d="M1 3l4 4 4-4"/></svg>
    </span>
  </div>
);

const PeriodTabs = ({ value, onChange }) => {
  const tabs = [
    { id:'week',  label:'Weekly',  icon:IC.week     },
    { id:'month', label:'Monthly', icon:IC.calendar },
    { id:'year',  label:'Yearly',  icon:IC.year     },
  ];
  return (
    <div style={{ display:'flex', gap:4, background:'#EEF2F7', borderRadius:10, padding:3 }}>
      {tabs.map(tab => {
        const active = value === tab.id;
        return (
          <button key={tab.id} onClick={() => onChange(tab.id)} style={{
            display:'flex', alignItems:'center', gap:5,
            padding:'7px 14px', borderRadius:8, border:'none',
            background: active ? T.white : 'transparent',
            color: active ? T.navy : T.slate,
            fontWeight: active ? 700 : 500, fontSize:12.5, cursor:'pointer',
            boxShadow: active ? '0 1px 4px rgba(10,22,40,0.1)' : 'none',
            transition:'all 0.18s', fontFamily:'inherit',
          }}>
            <Ico d={tab.icon} size={13} color={active ? T.blue : T.slate} sw={active ? 2.2 : 1.8} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

/* Report type selector cards */
const ReportTypeCards = ({ value, onChange }) => (
  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
    {REPORT_TYPES.map(rt => {
      const active = value === rt.id;
      return (
        <div key={rt.id} onClick={() => onChange(rt.id)} style={{
          display:'flex', alignItems:'center', gap:10,
          padding:'10px 16px', borderRadius:10, cursor:'pointer',
          border: active ? `2px solid ${T.blue}` : `2px solid ${T.border}`,
          background: active ? 'rgba(37,99,235,0.05)' : T.white,
          transition:'all 0.15s', minWidth:160,
          boxShadow: active ? `0 0 0 3px rgba(37,99,235,0.12)` : '0 1px 3px rgba(10,22,40,0.06)',
        }}>
          <div style={{
            width:28, height:28, borderRadius:7, flexShrink:0,
            background: active ? T.blue : T.pageBg,
            display:'flex', alignItems:'center', justifyContent:'center',
            transition:'all 0.15s',
          }}>
            <Ico d={rt.id === 'full' ? IC.layers : IC.filter} size={14}
              color={active ? T.white : T.slate} sw={2} />
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

/* ═══════════════════════════════════════════
   PDF BUILDER
═══════════════════════════════════════════ */
const buildPDF = (doc, analyticsData, {
  reportPeriod, selectedMonth, selectedYear, selectedWeek,
  barangayName, startDate, endDate, reportType,
}) => {
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const ML = 15, MR = 15, CT = pw / 2;

  const C = {
    navy:   [10, 22, 40],
    blue:   [37, 99, 235],
    cyan:   [6, 182, 212],
    green:  [16, 185, 129],
    amber:  [245, 158, 11],
    red:    [239, 68, 68],
    slate:  [100, 116, 139],
    light:  [241, 245, 249],
    white:  [255, 255, 255],
    border: [226, 232, 240],
    teal:   [13, 148, 136],
    purple: [124, 58, 237],
  };

  const rgb  = (a) => doc.setTextColor(...a);
  const fill = (a) => doc.setFillColor(...a);
  const draw = (a) => doc.setDrawColor(...a);
  const rR   = (x,y,w,h,r,m) => doc.roundedRect(x,y,w,h,r,r,m);

  /* ── Period label ── */
  let periodLabel = '';
  if (reportPeriod === 'week')
    periodLabel = `Week ${selectedWeek}, ${selectedYear}  ·  ${startDate.toLocaleDateString()} – ${endDate.toLocaleDateString()}`;
  else if (reportPeriod === 'month')
    periodLabel = `${MONTHS[selectedMonth]} ${selectedYear}`;
  else
    periodLabel = `Full Year ${selectedYear}`;

  /* ── Report type label ── */
  const rtLabel = reportType === 'classification' ? 'Classification Report' : 'Full Analytics Report';

  /* ────── HEADER ────── */
  const drawHeader = () => {
    fill(C.navy); doc.rect(0, 0, pw, 50, 'F');

    // Left cyan accent
    fill(C.cyan); doc.rect(0, 0, 4, 50, 'F');

    // Blue bottom stripe
    fill(C.blue); doc.rect(0, 50, pw, 2.5, 'F');

    // Logo area left
    fill([255,255,255]); doc.setFillColor(255,255,255);
    doc.setFillColor(255, 255, 255);
    rR(ML + 6, 9, 32, 32, 3, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(10, 22, 40);
    doc.text('T.M.F.K', ML + 22, 22, { align:'center' });
    doc.text('WASTE', ML + 22, 27.5, { align:'center' });
    doc.text('INNOVATIONS', ML + 22, 33, { align:'center' });

    // Title
    doc.setFontSize(17);
    doc.setFont('helvetica', 'bold');
    rgb(C.white);
    doc.text('WASTE MANAGEMENT REPORT', CT + 10, 16, { align:'center' });

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    rgb(C.cyan);
    doc.text((barangayName || 'South Signal Village').toUpperCase(), CT + 10, 26, { align:'center' });

    doc.setFontSize(7.5);
    rgb([148, 163, 184]);
    doc.text(periodLabel, CT + 10, 34, { align:'center' });

    // Report type badge top-right
    fill([37,99,235]);
    rR(pw - MR - 42, 8, 42, 12, 2, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    rgb(C.white);
    doc.text(rtLabel.toUpperCase(), pw - MR - 21, 15.5, { align:'center' });

    // Generated
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    rgb([100,116,139]);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pw - MR, 44, { align:'right' });
  };

  /* ── FOOTER ── */
  const drawFooter = () => {
    const pages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      fill(C.navy); doc.rect(0, ph - 11, pw, 11, 'F');
      // progress bar
      fill(C.blue); doc.rect(0, ph - 11, pw * (i / pages), 2, 'F');
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      rgb(C.white);
      doc.text(
        `${barangayName || 'Waste Management System'}  ·  Page ${i} of ${pages}  ·  ${new Date().getFullYear()} T.M.F.K. Waste Innovations`,
        CT, ph - 3.5, { align:'center' }
      );
    }
  };

  /* ── SECTION HEADING ── */
  const secHead = (label, y, color = C.blue) => {
    fill(C.light); rR(ML, y, pw - ML - MR, 10, 2, 'F');
    fill(color); doc.rect(ML, y, 3, 10, 'F');
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    rgb(C.navy);
    doc.text(label, ML + 8, y + 6.8);
    return y + 15;
  };

  /* ── STAT CARD ── */
  const statCard = (x, y, w, h, label, value, accent) => {
    fill(C.white); rR(x, y, w, h, 3, 'F');
    draw(C.border); doc.setLineWidth(0.25); rR(x, y, w, h, 3, 'S');
    fill(accent); rR(x, y, w, 2, 1.5, 'F');
    doc.setFontSize(6.5); doc.setFont('helvetica', 'normal'); rgb(C.slate);
    doc.text(label, x + w / 2, y + 9, { align:'center' });
    doc.setFontSize(15); doc.setFont('helvetica', 'bold'); rgb(accent);
    doc.text(String(value), x + w / 2, y + 19, { align:'center' });
  };

  /* ── PROGRESS BAR ── */
  const progBar = (x, y, w, pct, color, label, sublabel) => {
    fill(C.light); rR(x, y, w, 5, 2.5, 'F');
    const fw = Math.max(pct > 0 ? 6 : 0, w * (pct / 100));
    fill(color); rR(x, y, fw, 5, 2.5, 'F');
    if (label) {
      doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); rgb(C.navy);
      doc.text(label, x, y - 3);
    }
    if (sublabel) {
      doc.setFontSize(7); doc.setFont('helvetica', 'normal'); rgb(C.slate);
      doc.text(sublabel, x + w, y - 3, { align:'right' });
    }
  };

  /* ── DONUT ── */
  const drawDonut = (cx, cy, r, segments) => {
    let angle = -Math.PI / 2;
    const total = segments.reduce((s,g) => s + g.value, 0) || 1;
    segments.forEach(seg => {
      const sweep = (seg.value / total) * 2 * Math.PI;
      if (sweep < 0.02) return;
      const steps = Math.max(10, Math.round(sweep * 14));
      fill(seg.color);
      const pts = [];
      for (let s = 0; s <= steps; s++) {
        const a = angle + (s / steps) * sweep;
        pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
      }
      const dxdy = pts.slice(1).map((p, i) => [p[0]-pts[i][0], p[1]-pts[i][1]]);
      doc.lines([[pts[0][0]-cx, pts[0][1]-cy], ...dxdy], cx, cy, [1,1], 'F');
      angle += sweep;
    });
    fill(C.white); doc.circle(cx, cy, r * 0.54, 'F');
    // Center total
    doc.setFontSize(8); doc.setFont('helvetica', 'bold'); rgb(C.navy);
    doc.text(String(segments.reduce((s,g)=>s+g.value,0)), cx, cy + 3, { align:'center' });
    doc.setFontSize(5.5); doc.setFont('helvetica', 'normal'); rgb(C.slate);
    doc.text('TOTAL', cx, cy + 8, { align:'center' });
  };

  /* ── HORIZONTAL BAR ── */
  const hBar = (x, y, totalW, h, value, maxV, color, label, countLabel) => {
    fill(C.light); rR(x, y, totalW, h, 2, 'F');
    const bw = Math.max(value > 0 ? 4 : 0, totalW * (value / (maxV || 1)));
    fill(color); rR(x, y, bw, h, 2, 'F');
    // label left
    doc.setFontSize(7); doc.setFont('helvetica', 'normal'); rgb(C.navy);
    doc.text(String(label).substring(0, 22), x, y - 2);
    // count right
    doc.setFont('helvetica', 'bold'); rgb(color);
    doc.text(countLabel, x + totalW, y - 2, { align:'right' });
  };

  /* ══════════ BUILD ══════════ */
  drawHeader();
  let y = 62;

  const ov = analyticsData.overview;
  const hasData = ov.total > 0;

  /* ── NO DATA ── */
  if (!hasData) {
    fill(C.light); rR(ML, y + 10, pw - ML - MR, 44, 4, 'F');
    doc.setFontSize(13); doc.setFont('helvetica', 'bold'); rgb(C.slate);
    doc.text('No waste reports found for the selected period.', CT, y + 30, { align:'center' });
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); rgb([148,163,184]);
    doc.text('Please try a different date range or barangay filter.', CT, y + 40, { align:'center' });
    drawFooter(); return;
  }

  const recyclingRate  = ov.total > 0 ? ((ov.recycled / ov.total) * 100).toFixed(1) : '0.0';
  const efficiencyRate = ov.total > 0 ? (((ov.processed + ov.recycled) / ov.total) * 100).toFixed(1) : '0.0';

  /* ════════════════════════════════════════
     SECTION 1: OVERVIEW STATS (both modes)
  ════════════════════════════════════════ */
  y = secHead('REPORT OVERVIEW', y);

  const cW = (pw - ML - MR - 12) / 5;
  const overviewCards = [
    { label:'TOTAL REPORTS', value:ov.total,     color:C.blue  },
    { label:'RECYCLED',      value:ov.recycled,  color:C.green },
    { label:'PROCESSED',     value:ov.processed, color:C.cyan  },
    { label:'PENDING',       value:ov.pending,   color:C.amber },
    { label:'DISPOSED',      value:ov.disposed,  color:C.slate },
  ];
  overviewCards.forEach((c, i) => statCard(ML + i * (cW + 3), y, cW, 26, c.label, c.value, c.color));
  y += 32;

  // Rate row
  const rW = (pw - ML - MR - 6) / 3;
  const rateCards = [
    { label:'RECYCLING RATE',  value:`${recyclingRate}%`,  color:C.green  },
    { label:'EFFICIENCY RATE', value:`${efficiencyRate}%`, color:C.blue   },
    { label:'REJECTED',        value:ov.rejected,          color:C.red    },
  ];
  rateCards.forEach((c, i) => statCard(ML + i * (rW + 3), y, rW, 24, c.label, c.value, c.color));
  y += 30;

  /* ════════════════════════════════════════
     SECTION 2: CLASSIFICATION BREAKDOWN
  ════════════════════════════════════════ */
  const cls = analyticsData.classificationBreakdown || [];

  if (cls.length > 0) {
    if (y > 195) { doc.addPage(); drawHeader(); y = 62; }
    y = secHead('WASTE CLASSIFICATION BREAKDOWN', y, C.blue);

    /* Two-column layout: donut left, table right */
    const leftW  = 70;
    const rightW = pw - ML - MR - leftW - 8;
    const panH   = Math.max(70, Math.min(cls.length * 12 + 16, 110));

    /* Left: donut */
    fill(C.white); rR(ML, y, leftW, panH, 3, 'F');
    draw(C.border); doc.setLineWidth(0.25); rR(ML, y, leftW, panH, 3, 'S');

    doc.setFontSize(7); doc.setFont('helvetica', 'bold'); rgb(C.navy);
    doc.text('Status Mix', ML + leftW / 2, y + 6, { align:'center' });

    const donutSegs = [
      { value: ov.recycled,  color: C.green },
      { value: ov.processed, color: C.cyan  },
      { value: ov.pending,   color: C.amber },
      { value: ov.disposed,  color: C.slate },
      { value: ov.rejected,  color: C.red   },
    ];
    drawDonut(ML + 22, y + panH / 2 + 4, 18, donutSegs);

    // Legend inside donut panel
    const legItems = [
      { label:'Recycled',  color:C.green },
      { label:'Processed', color:C.cyan  },
      { label:'Pending',   color:C.amber },
      { label:'Disposed',  color:C.slate },
      { label:'Rejected',  color:C.red   },
    ];
    legItems.forEach((li, i) => {
      const lx = ML + 44, ly = y + 14 + i * 9.5;
      fill(li.color); rR(lx, ly, 4.5, 3.5, 1, 'F');
      doc.setFontSize(6.5); doc.setFont('helvetica', 'normal'); rgb(C.slate);
      doc.text(li.label, lx + 6.5, ly + 3);
    });

    /* Right: classification table */
    const rx = ML + leftW + 8;
    fill(C.white); rR(rx, y, rightW, panH, 3, 'F');
    draw(C.border); doc.setLineWidth(0.25); rR(rx, y, rightW, panH, 3, 'S');

    doc.setFontSize(7); doc.setFont('helvetica', 'bold'); rgb(C.navy);
    doc.text('Classification Distribution', rx + rightW / 2, y + 6, { align:'center' });

    const tableColorsArr = [C.blue, C.green, C.amber, C.cyan, C.teal, C.purple, C.red, C.slate];
    const maxCls = Math.max(...cls.map(c => c.count), 1);
    const visibleCls = cls.slice(0, 7);
    const barAreaX = rx + 6;
    const barAreaW = rightW - 12;

    visibleCls.forEach((item, i) => {
      const by = y + 12 + i * ((panH - 14) / visibleCls.length);
      const col = tableColorsArr[i % tableColorsArr.length];
      hBar(
        barAreaX, by + 8, barAreaW, 5,
        item.count, maxCls, col,
        item.classification || 'Unknown',
        `${item.count} · ${(item.percentage||0).toFixed(1)}%`
      );
    });

    y += panH + 10;

    /* Full classification table */
    if (y > 200) { doc.addPage(); drawHeader(); y = 62; }
    autoTable(doc, {
      startY: y,
      head: [['#', 'Classification', 'Reports', 'Share', 'Progress']],
      body: cls.map((item, idx) => {
        const filled  = Math.round((item.percentage || 0) / 5);
        const empty   = 20 - filled;
        const barStr  = '▓'.repeat(Math.max(0,filled)) + '░'.repeat(Math.max(0,empty));
        return [
          `${idx + 1}`,
          item.classification || 'Unknown',
          item.count,
          `${(item.percentage||0).toFixed(1)}%`,
          barStr,
        ];
      }),
      theme: 'plain',
      headStyles: {
        fillColor: C.navy, textColor: C.white,
        fontStyle: 'bold', fontSize: 8,
        cellPadding: { top:4, bottom:4, left:5, right:5 },
      },
      bodyStyles: {
        fontSize: 8, cellPadding: { top:3.5, bottom:3.5, left:5, right:5 },
        textColor: C.navy,
      },
      alternateRowStyles: { fillColor: C.light },
      columnStyles: {
        0: { cellWidth:10, halign:'center', textColor:C.slate },
        1: { cellWidth:65, fontStyle:'bold' },
        2: { cellWidth:18, halign:'center', fontStyle:'bold', textColor:C.blue },
        3: { cellWidth:20, halign:'center', textColor:C.green, fontStyle:'bold' },
        4: { cellWidth:'auto', textColor:C.teal, fontSize:6.5, font:'courier' },
      },
      margin: { left:ML, right:MR },
      tableLineWidth: 0,
      rowPageBreak: 'auto',
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 1) {
          data.cell.styles.textColor = tableColorsArr[data.row.index % tableColorsArr.length];
        }
      },
    });
    y = doc.lastAutoTable.finalY + 10;

    /* Progress bars section */
    if (y > 200) { doc.addPage(); drawHeader(); y = 62; }
    y = secHead('CLASSIFICATION PROGRESS BARS', y, C.teal);

    const colW2 = (pw - ML - MR - 8) / 2;
    cls.slice(0, 10).forEach((item, i) => {
      const col   = i % 2;
      const row   = Math.floor(i / 2);
      const bx    = ML + col * (colW2 + 8);
      const by    = y + row * 18;
      const color = tableColorsArr[i % tableColorsArr.length];
      progBar(
        bx, by + 8, colW2, item.percentage || 0, color,
        (item.classification || 'Unknown').substring(0, 28),
        `${item.count} reports  (${(item.percentage||0).toFixed(1)}%)`
      );
    });
    y += Math.ceil(cls.length / 2) * 18 + 12;
  }

  /* ════════════════════════════════════════
     SECTION 3 onward — FULL REPORT only
  ════════════════════════════════════════ */
  if (reportType === 'full') {

    /* ── Material Breakdown ── */
    const mat = analyticsData.materialBreakdown || [];
    if (mat.length > 0) {
      if (y > 200) { doc.addPage(); drawHeader(); y = 62; }
      y = secHead('MATERIAL BREAKDOWN', y, C.teal);

      autoTable(doc, {
        startY: y,
        head: [['#', 'Material Type', 'Count', 'Share (%)']],
        body: mat.map((item, idx) => [
          `${idx + 1}`, item.material || 'Other', item.count, `${(item.percentage||0).toFixed(1)}%`
        ]),
        theme: 'plain',
        headStyles: {
          fillColor: C.teal, textColor: C.white,
          fontStyle: 'bold', fontSize: 8,
          cellPadding: { top:4, bottom:4, left:5, right:5 },
        },
        bodyStyles: {
          fontSize: 8, cellPadding: { top:3.5, bottom:3.5, left:5, right:5 }, textColor: C.navy,
        },
        alternateRowStyles: { fillColor: C.light },
        columnStyles: {
          0: { cellWidth:10, halign:'center', textColor:C.slate },
          1: { cellWidth:90 },
          2: { cellWidth:25, halign:'center', fontStyle:'bold', textColor:C.blue },
          3: { cellWidth:30, halign:'center', textColor:C.teal, fontStyle:'bold' },
        },
        margin: { left:ML, right:MR }, tableLineWidth: 0,
      });
      y = doc.lastAutoTable.finalY + 12;
    }

    /* ── Top Contributors ── */
    const users = analyticsData.userActivity || [];
    if (users.length > 0) {
      if (y > 200) { doc.addPage(); drawHeader(); y = 62; }
      y = secHead('TOP CONTRIBUTORS', y, C.navy);

      const medalColors = [C.amber, [156,163,175], [180,130,80]];

      autoTable(doc, {
        startY: y,
        head: [['Rank', 'Contributor', 'Reports', 'Email / ID']],
        body: users.slice(0, 10).map((u, idx) => [
          idx < 3 ? `★ ${idx+1}` : `${idx+1}`,
          u.userName || 'Anonymous',
          u.reportCount,
          u.userEmail || '—',
        ]),
        theme: 'plain',
        headStyles: {
          fillColor: C.navy, textColor: C.white,
          fontStyle: 'bold', fontSize: 8,
          cellPadding: { top:4, bottom:4, left:5, right:5 },
        },
        bodyStyles: {
          fontSize: 8, cellPadding: { top:4, bottom:4, left:5, right:5 }, textColor: C.navy,
        },
        alternateRowStyles: { fillColor: C.light },
        columnStyles: {
          0: { cellWidth:18, halign:'center', fontStyle:'bold', textColor:C.amber },
          1: { cellWidth:70 },
          2: { cellWidth:22, halign:'center', fontStyle:'bold', textColor:C.blue },
          3: { cellWidth:65, textColor:C.slate, fontSize:7.5 },
        },
        margin: { left:ML, right:MR }, tableLineWidth: 0,
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 0 && data.row.index < 3) {
            data.cell.styles.textColor = medalColors[data.row.index];
          }
        },
      });
      y = doc.lastAutoTable.finalY + 12;
    }

    /* ── Summary & Analytics ── */
    if (y > 210) { doc.addPage(); drawHeader(); y = 62; }
    y = secHead('SUMMARY & ANALYTICS', y, C.blue);

    // 4 metric cards
    const mW2 = (pw - ML - MR - 9) / 4;
    const metrics = [
      { label:'RECYCLING RATE',    value:`${recyclingRate}%`,  sub:'recycled / total',       color:C.green  },
      { label:'EFFICIENCY',        value:`${efficiencyRate}%`, sub:'processed + recycled',   color:C.blue   },
      { label:'AVG REPORTS/USER',  value:(analyticsData.summary?.avgReportsPerUser||0).toFixed(1), sub:'across contributors', color:C.cyan },
      { label:'ACTIVE CONTRIBUTORS', value:users.length,       sub:'top reporters',          color:C.amber  },
    ];
    metrics.forEach((m, i) => {
      const mx = ML + i * (mW2 + 3);
      fill(C.white); rR(mx, y, mW2, 38, 3, 'F');
      draw(m.color); doc.setLineWidth(0.5); rR(mx, y, mW2, 38, 3, 'S');
      fill(m.color); rR(mx, y, mW2, 2.5, 2, 'F');
      doc.setFontSize(6.5); doc.setFont('helvetica', 'bold'); rgb(C.slate);
      doc.text(m.label, mx + mW2/2, y + 9, { align:'center' });
      doc.setFontSize(16); doc.setFont('helvetica', 'bold'); rgb(m.color);
      doc.text(String(m.value), mx + mW2/2, y + 24, { align:'center' });
      doc.setFontSize(6); doc.setFont('helvetica', 'normal'); rgb(C.slate);
      doc.text(m.sub, mx + mW2/2, y + 32, { align:'center' });
    });
    y += 46;

    // Key insights text
    if (y > 220) { doc.addPage(); drawHeader(); y = 62; }
    fill(C.light); rR(ML, y, pw - ML - MR, 34, 3, 'F');
    fill(C.blue); doc.rect(ML, y, 3, 34, 'F');

    const summaryLines = [
      `Period: ${periodLabel}  ·  Barangay: ${barangayName || 'All Barangays'}`,
      `Total waste reports: ${ov.total}  ·  Recycled: ${ov.recycled} (${recyclingRate}%)  ·  Pending: ${ov.pending}`,
      `Top waste category: ${analyticsData.summary?.mostCommonClassification || 'N/A'}  ·  Most active material: ${analyticsData.summary?.topMaterial || 'N/A'}`,
      `Most active contributor: ${analyticsData.summary?.mostActiveUser || 'N/A'}  ·  Avg reports/user: ${(analyticsData.summary?.avgReportsPerUser||0).toFixed(1)}`,
    ];
    doc.setFontSize(8); doc.setFont('helvetica', 'normal'); rgb(C.navy);
    summaryLines.forEach((line, i) => {
      const wrapped = doc.splitTextToSize(line, pw - ML - MR - 10);
      doc.text(wrapped, ML + 7, y + 6 + i * 7);
    });
    y += 42;

    /* ── Recommendations ── */
    if (y > 220) { doc.addPage(); drawHeader(); y = 62; }
    y = secHead('RECOMMENDATIONS', y, C.green);

    const rRate = parseFloat(recyclingRate);
    const recs = rRate >= 60 ? [
      'Excellent recycling performance — maintain current initiatives.',
      'Share best practices with neighboring barangays to expand impact.',
      'Introduce advanced waste sorting categories for better granularity.',
      'Set progressively higher targets for the next reporting period.',
      'Consider expanding the recycling program to adjacent communities.',
    ] : rRate >= 30 ? [
      'Continue current recycling initiatives and expand collection coverage.',
      'Consider incentives for users who consistently report and recycle.',
      'Schedule more frequent collections in high-density waste areas.',
      'Implement targeted education for proper waste classification.',
      'Partner with local facilities for improved waste processing pipelines.',
    ] : [
      'Increase recycling awareness campaigns to improve recycling rates.',
      'Provide clearly labeled recycling bins in all high-traffic areas.',
      'Conduct community seminars on proper waste segregation techniques.',
      'Offer household incentives for consistent waste classification.',
      'Collaborate with schools and local orgs for community-wide education.',
    ];

    // Performance badge
    const perf = rRate >= 60 ? 'EXCELLENT' : rRate >= 30 ? 'MODERATE' : 'NEEDS IMPROVEMENT';
    const perfColor = rRate >= 60 ? C.green : rRate >= 30 ? C.amber : C.red;
    fill(perfColor); rR(ML, y, 58, 9, 2, 'F');
    doc.setFontSize(7); doc.setFont('helvetica', 'bold'); rgb(C.white);
    doc.text(`PERFORMANCE: ${perf}`, ML + 29, y + 6, { align:'center' });
    y += 14;

    recs.forEach((rec, i) => {
      fill(C.blue); doc.circle(ML + 3, y + 3, 1.5, 'F');
      doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); rgb(C.navy);
      const wrapped = doc.splitTextToSize(rec, pw - ML - MR - 10);
      doc.text(wrapped, ML + 9, y + 4.5);
      y += wrapped.length * 5.5 + 3;
    });
    y += 6;

    /* ── Closing box ── */
    if (y > 240) { doc.addPage(); drawHeader(); y = 62; }
    fill(C.navy); rR(ML, y, pw - ML - MR, 22, 4, 'F');
    fill(C.blue); doc.rect(ML, y, pw - ML - MR, 2, 'F');
    doc.setFontSize(8.5); doc.setFont('helvetica', 'bold'); rgb(C.white);
    doc.text('This report is system-generated by T.M.F.K. Waste Innovations.', CT, y + 11, { align:'center' });
    doc.setFontSize(7); doc.setFont('helvetica', 'normal'); rgb([100,116,139]);
    doc.text('Data accuracy depends on information submitted by registered barangay users.', CT, y + 18, { align:'center' });
  }

  drawFooter();
};

/* ═══════════════════════════════════════════
   MAIN ANALYTICS COMPONENT
═══════════════════════════════════════════ */
const Analytics = ({ adminRole, barangayName }) => {
  const [loading,       setLoading]       = useState(false);
  const [reportPeriod,  setReportPeriod]  = useState('month');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear,  setSelectedYear]  = useState(new Date().getFullYear());
  const [selectedWeek,  setSelectedWeek]  = useState(getCurrentWeekNumber());
  const [reportType,    setReportType]    = useState('full');
  const [fetchError,    setFetchError]    = useState(null);
  const [success,       setSuccess]       = useState(false);

  const availableYears = [new Date().getFullYear(), new Date().getFullYear()-1, new Date().getFullYear()-2];

  const getDateRange = () => {
    let startDate, endDate;
    if (reportPeriod === 'week') {
      const firstDay = new Date(selectedYear, 0, 1);
      const dow = firstDay.getDay();
      startDate = new Date(selectedYear, 0, 1);
      startDate.setDate(startDate.getDate() + (selectedWeek-1)*7 - dow);
      const curDow = startDate.getDay();
      startDate.setDate(startDate.getDate() - (curDow===0?6:curDow-1));
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
    const token = localStorage.getItem('adminToken');
    let url = `${API_URL}/api/waste-reports`;
    const params = new URLSearchParams();
    if (startDate && endDate) {
      params.append('startDate', startDate.toISOString().split('T')[0]);
      params.append('endDate',   endDate.toISOString().split('T')[0]);
    }
    if (adminRole === 'southadmin')   params.append('barangay', 'south_signal');
    if (adminRole === 'centraladmin') params.append('barangay', 'central_signal');
    if (params.toString()) url += `?${params.toString()}`;
    const res = await fetch(url, {
      headers: { Authorization:`Bearer ${token}`, 'Content-Type':'application/json' }
    });
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
    const data = await res.json();
    return data.reports || data || [];
  };

  const processData = (reports) => {
    if (!reports?.length) return {
      overview: { total:0, pending:0, processed:0, recycled:0, disposed:0, rejected:0 },
      classificationBreakdown:[], materialBreakdown:[], userActivity:[],
      summary: { mostCommonClassification:'N/A', topMaterial:'N/A', mostActiveUser:'N/A', avgReportsPerUser:0 },
    };
    const ov = {
      total:     reports.length,
      pending:   reports.filter(r=>r.status==='pending').length,
      processed: reports.filter(r=>r.status==='processed').length,
      recycled:  reports.filter(r=>r.status==='recycled').length,
      disposed:  reports.filter(r=>r.status==='disposed').length,
      rejected:  reports.filter(r=>r.status==='rejected').length,
    };
    const clsMap = new Map();
    reports.forEach(r => { const c=r.classification||'Unknown'; clsMap.set(c,(clsMap.get(c)||0)+1); });
    const classificationBreakdown = [...clsMap.entries()]
      .map(([name,count])=>({ classification:name, count, percentage:(count/ov.total)*100 }))
      .sort((a,b)=>b.count-a.count);

    const matMap = new Map();
    reports.forEach(r => { const m=r.materialType||r.material||'Other'; matMap.set(m,(matMap.get(m)||0)+1); });
    const materialBreakdown = [...matMap.entries()]
      .map(([name,count])=>({ material:name, count, percentage:(count/ov.total)*100 }))
      .sort((a,b)=>b.count-a.count);

    const userMap = new Map();
    reports.forEach(r => {
      const uid = r.userId||r.user?._id||r.user;
      const uname = r.userName||r.user?.name||r.user?.email?.split('@')[0]||'Anonymous';
      const key = uid||uname;
      userMap.set(key, { userName:uname, reportCount:(userMap.get(key)?.reportCount||0)+1, userEmail:r.userEmail||r.user?.email||'' });
    });
    const userActivity = [...userMap.values()].sort((a,b)=>b.reportCount-a.reportCount).slice(0,10);
    return {
      overview: ov, classificationBreakdown, materialBreakdown, userActivity,
      summary: {
        mostCommonClassification: classificationBreakdown[0]?.classification||'N/A',
        topMaterial:              materialBreakdown[0]?.material||'N/A',
        mostActiveUser:           userActivity[0]?.userName||'N/A',
        avgReportsPerUser:        ov.total / (userMap.size||1),
      },
    };
  };

  const handleDownload = async () => {
    setLoading(true); setFetchError(null); setSuccess(false);
    try {
      const reports = await fetchWasteReports();
      const data    = processData(reports);
      const { startDate, endDate } = getDateRange();
      const doc = new jsPDF('p','mm','a4');
      buildPDF(doc, data, {
        reportPeriod, selectedMonth, selectedYear, selectedWeek,
        barangayName: barangayName||'South Signal Village',
        startDate, endDate, reportType,
      });
      const rtSuffix = reportType === 'classification' ? '_Classification' : '_Full';
      const mSuffix  = reportPeriod === 'month' ? `_${selectedMonth+1}` : '';
      doc.save(`WasteReport_${(barangayName||'Barangay').replace(/\s/g,'_')}${rtSuffix}_${reportPeriod}_${selectedYear}${mSuffix}.pdf`);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3500);
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const periodLabel = reportPeriod==='week'
    ? `Week ${selectedWeek}, ${selectedYear}`
    : reportPeriod==='month'
    ? `${MONTHS[selectedMonth]} ${selectedYear}`
    : `Year ${selectedYear}`;

  /* ── Styles ── */
  const S = {
    wrap: {
      background:T.white, border:`1.5px solid ${T.border}`,
      borderRadius:16, marginBottom:24, overflow:'hidden',
      boxShadow:'0 2px 16px rgba(10,22,40,0.07)',
      fontFamily:"'Sora','DM Sans','Inter',sans-serif",
    },
    band: {
      background:`linear-gradient(130deg, ${T.navy} 0%, ${T.navyLight} 100%)`,
      padding:'20px 24px 18px', position:'relative', overflow:'hidden',
    },
    bandBottom: {
      position:'absolute', bottom:0, left:0, right:0, height:3,
      background:`linear-gradient(90deg, ${T.cyan}, ${T.blue})`,
    },
    bandDeco: {
      position:'absolute', top:-40, right:-40,
      width:180, height:180, borderRadius:'50%',
      background:'rgba(255,255,255,0.04)', pointerEvents:'none',
    },
    bandTitle: {
      fontSize:17, fontWeight:800, color:T.white,
      margin:'0 0 4px', letterSpacing:'-0.02em',
      display:'flex', alignItems:'center', gap:9,
    },
    bandSub: { fontSize:12, color:'rgba(148,163,184,0.85)', margin:0 },
    pillBadge: {
      display:'inline-flex', alignItems:'center', gap:5,
      padding:'4px 12px', borderRadius:20,
      background:'rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.85)',
      fontSize:11.5, fontWeight:600, border:'1px solid rgba(255,255,255,0.16)',
    },
    body:    { padding:'20px 24px' },
    divider: { width:'1px', height:26, background:T.border, flexShrink:0 },
    row:     { display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:16 },
    label:   { fontSize:11.5, fontWeight:700, color:T.slate, textTransform:'uppercase', letterSpacing:'0.07em', flexShrink:0 },
    dlBtn: (dis) => ({
      display:'flex', alignItems:'center', gap:8,
      padding:'11px 24px', borderRadius:10, border:'none',
      background: dis ? '#CBD5E1' : `linear-gradient(135deg, ${T.navy}, ${T.blue})`,
      color: dis ? T.slate : T.white,
      fontSize:13, fontWeight:700, cursor: dis ? 'not-allowed' : 'pointer',
      boxShadow: dis ? 'none' : '0 4px 14px rgba(37,99,235,0.35)',
      transition:'all 0.2s', fontFamily:'inherit', letterSpacing:'0.01em',
      whiteSpace:'nowrap',
    }),
    hint: {
      display:'flex', alignItems:'center', gap:6,
      marginTop:4, fontSize:11.5, color:T.slateLight,
      padding:'8px 12px', background:T.pageBg, borderRadius:8,
    },
    successBar: {
      display:'flex', alignItems:'center', gap:8,
      background:'#ECFDF5', border:'1px solid #6EE7B7',
      borderRadius:8, padding:'10px 16px', marginTop:12,
      fontSize:12.5, color:'#065F46', fontWeight:600,
    },
    errorBar: {
      display:'flex', alignItems:'center', gap:8,
      background:'#FEF2F2', border:'1px solid #FECACA',
      borderRadius:8, padding:'10px 16px', marginTop:12,
      fontSize:12.5, color:'#991B1B', fontWeight:500,
    },
    overlay: {
      position:'fixed', inset:0, background:'rgba(10,22,40,0.75)',
      backdropFilter:'blur(6px)',
      display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999,
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes tmfk_spin   { to { transform: rotate(360deg); } }
        @keyframes tmfk_fadein { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
      `}</style>

      {/* Loading overlay */}
      {loading && (
        <div style={S.overlay}>
          <div style={{ ...S.overlayBox, animation:'tmfk_fadein 0.2s ease' }}>
            <div style={{
              width:72, height:72, borderRadius:'50%',
              background:`linear-gradient(135deg,${T.navy},${T.navyLight})`,
              display:'flex', alignItems:'center', justifyContent:'center',
              position:'relative',
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
              <p style={S.bandSub}>
                Generate a detailed waste report for {barangayName || 'your barangay'}
              </p>
            </div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
              <span style={S.pillBadge}>
                <Ico d={IC.chart} size={12} color={T.cyan} sw={2.2} />
                {(barangayName||'All Barangays').toUpperCase()}
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

          {/* Row 1: Period */}
          <div style={S.row}>
            <span style={S.label}>Period</span>
            <PeriodTabs value={reportPeriod} onChange={setReportPeriod} />
            <div style={S.divider} />
            {reportPeriod === 'month' && (
              <StyledSelect value={selectedMonth} onChange={e=>setSelectedMonth(parseInt(e.target.value))} icon={IC.calendar}>
                {MONTHS.map((m,i) => <option key={i} value={i}>{m}</option>)}
              </StyledSelect>
            )}
            {reportPeriod === 'week' && (
              <StyledSelect value={selectedWeek} onChange={e=>setSelectedWeek(parseInt(e.target.value))} icon={IC.week}>
                {Array.from({length:52},(_,i)=>(
                  <option key={i+1} value={i+1}>Week {i+1}</option>
                ))}
              </StyledSelect>
            )}
            <StyledSelect value={selectedYear} onChange={e=>setSelectedYear(parseInt(e.target.value))} icon={IC.year}>
              {availableYears.map(y=><option key={y} value={y}>{y}</option>)}
            </StyledSelect>
          </div>

          {/* Row 2: Report Type */}
          <div style={{ marginBottom:16 }}>
            <div style={{ ...S.label, marginBottom:10, display:'block' }}>Report Content</div>
            <ReportTypeCards value={reportType} onChange={setReportType} />
          </div>

          {/* Hint + Download row */}
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
            <div style={S.hint}>
              <Ico d={IC.info} size={14} color={T.slateLight} sw={1.8} />
              <span>
                {reportType === 'classification'
                  ? 'Includes: Overview stats · Classification table · Progress bars'
                  : 'Includes: Overview stats · Classification · Materials · Contributors · Summary · Recommendations'}
              </span>
            </div>
            <button
              style={S.dlBtn(loading)}
              onClick={handleDownload}
              disabled={loading}
              onMouseEnter={e=>{ if(!loading) e.currentTarget.style.transform='translateY(-1px)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform='none'; }}
            >
              <Ico d={IC.download} size={15} color={loading?T.slate:T.white} sw={2.2} />
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