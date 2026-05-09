import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import API_URL from '../Utils/Api';

const Analytics = ({ adminRole, barangayName }) => {
  const [loading, setLoading] = useState(false);
  const [reportPeriod, setReportPeriod] = useState('month');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeekNumber());
  const [analyticsData, setAnalyticsData] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  
  // Generate available years (current year and 2 years back)
  const getAvailableYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 2; i--) {
      years.push(i);
    }
    return years;
  };

  // Helper function to get current week number
  function getCurrentWeekNumber() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - start) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + start.getDay() + 1) / 7);
  }

  // Get date range based on selected period
  const getDateRange = () => {
    let startDate, endDate;

    if (reportPeriod === 'week') {
      // Calculate the start of the selected week
      const firstDayOfYear = new Date(selectedYear, 0, 1);
      const dayOfWeek = firstDayOfYear.getDay();
      const daysToAdd = (selectedWeek - 1) * 7 - dayOfWeek;
      
      startDate = new Date(selectedYear, 0, 1);
      startDate.setDate(startDate.getDate() + daysToAdd);
      
      // Adjust to Monday
      const currentDayOfWeek = startDate.getDay();
      const daysToMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
      startDate.setDate(startDate.getDate() - daysToMonday);
      startDate.setHours(0, 0, 0, 0);
      
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } 
    else if (reportPeriod === 'month') {
      startDate = new Date(selectedYear, selectedMonth, 1);
      endDate = new Date(selectedYear, selectedMonth + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    } 
    else if (reportPeriod === 'year') {
      startDate = new Date(selectedYear, 0, 1);
      endDate = new Date(selectedYear, 11, 31);
      endDate.setHours(23, 59, 59, 999);
    }

    return { startDate, endDate };
  };

  // Fetch waste reports directly from API
  const fetchWasteReports = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      
      const { startDate, endDate } = getDateRange();
      const token = localStorage.getItem('adminToken');
      
      // Build URL for waste reports
      let url = `${API_URL}/api/waste-reports`;
      const params = new URLSearchParams();
      
      if (startDate && endDate) {
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];
        params.append('startDate', startDateStr);
        params.append('endDate', endDateStr);
        console.log('Date range:', startDateStr, 'to', endDateStr);
      }
      
      // Add barangay filter based on admin role
      if (adminRole === 'southadmin') {
        params.append('barangay', 'south_signal');
      } else if (adminRole === 'centraladmin') {
        params.append('barangay', 'central_signal');
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      console.log('Fetching waste reports from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch reports: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Waste reports response:', data);
      
      let reports = data.reports || data || [];
      
      // Process the reports to generate analytics
      const processedStats = processReportsData(reports);
      setAnalyticsData(processedStats);
      
    } catch (error) {
      console.error('Error fetching waste reports:', error);
      setFetchError(error.message);
      setAnalyticsData({
        overview: {
          total: 0,
          pending: 0,
          processed: 0,
          recycled: 0,
          disposed: 0,
          rejected: 0
        },
        classificationBreakdown: [],
        materialBreakdown: [],
        userActivity: [],
        summary: {
          mostCommonClassification: 'N/A',
          topMaterial: 'N/A',
          mostActiveUser: 'N/A',
          avgReportsPerUser: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // Process reports data to match the expected format
  const processReportsData = (reports) => {
    if (!reports || reports.length === 0) {
      return {
        overview: {
          total: 0,
          pending: 0,
          processed: 0,
          recycled: 0,
          disposed: 0,
          rejected: 0
        },
        classificationBreakdown: [],
        materialBreakdown: [],
        userActivity: [],
        summary: {
          mostCommonClassification: 'N/A',
          topMaterial: 'N/A',
          mostActiveUser: 'N/A',
          avgReportsPerUser: 0
        }
      };
    }

    // Calculate overview stats
    const overview = {
      total: reports.length,
      pending: reports.filter(r => r.status === 'pending').length,
      processed: reports.filter(r => r.status === 'processed').length,
      recycled: reports.filter(r => r.status === 'recycled').length,
      disposed: reports.filter(r => r.status === 'disposed').length,
      rejected: reports.filter(r => r.status === 'rejected').length
    };

    // Classification breakdown
    const classificationMap = new Map();
    reports.forEach(r => {
      const classification = r.classification || 'Unknown';
      classificationMap.set(classification, (classificationMap.get(classification) || 0) + 1);
    });
    
    const classificationBreakdown = Array.from(classificationMap.entries()).map(([name, count]) => ({
      classification: name,
      count: count,
      percentage: (count / overview.total) * 100
    })).sort((a, b) => b.count - a.count);

    // Material breakdown (if materials are tracked)
    const materialMap = new Map();
    reports.forEach(r => {
      const material = r.materialType || r.material || 'Other';
      materialMap.set(material, (materialMap.get(material) || 0) + 1);
    });
    
    const materialBreakdown = Array.from(materialMap.entries()).map(([name, count]) => ({
      material: name,
      count: count,
      percentage: (count / overview.total) * 100
    })).sort((a, b) => b.count - a.count);

    // User activity
    const userMap = new Map();
    reports.forEach(r => {
      const userId = r.userId || r.user?._id || r.user;
      const userName = r.userName || r.user?.name || r.user?.email?.split('@')[0] || 'Anonymous';
      userMap.set(userId || userName, {
        userName: userName,
        reportCount: (userMap.get(userId || userName)?.reportCount || 0) + 1,
        userEmail: r.userEmail || r.user?.email || ''
      });
    });
    
    const userActivity = Array.from(userMap.values())
      .sort((a, b) => b.reportCount - a.reportCount)
      .slice(0, 10);

    // Summary stats
    const mostCommonClassification = classificationBreakdown[0]?.classification || 'N/A';
    const topMaterial = materialBreakdown[0]?.material || 'N/A';
    const mostActiveUser = userActivity[0]?.userName || 'N/A';
    const avgReportsPerUser = overview.total / (userMap.size || 1);

    return {
      overview,
      classificationBreakdown,
      materialBreakdown,
      userActivity,
      summary: {
        mostCommonClassification,
        topMaterial,
        mostActiveUser,
        avgReportsPerUser
      }
    };
  };

  // Generate PDF Report
  const generatePDF = async () => {
    // Fetch fresh data first
    await fetchWasteReports();
    
    if (!analyticsData) {
      console.error('No analytics data available');
      return;
    }

    setLoading(true);
    
    try {
      const { startDate, endDate } = getDateRange();
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Helper function to add header
      const addHeader = () => {
        doc.setDrawColor(37, 99, 235);
        doc.setLineWidth(3);
        doc.line(15, 15, pageWidth - 15, 15);
        
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 58, 95);
        doc.text('WASTE MANAGEMENT REPORT', pageWidth / 2, 35, { align: 'center' });
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(37, 99, 235);
        doc.text(barangayName || 'South Signal Village, Taguig City', pageWidth / 2, 48, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setTextColor(107, 114, 128);
        let periodText = '';
        if (reportPeriod === 'week') {
          periodText = `Week ${selectedWeek}, ${selectedYear} | ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
        } else if (reportPeriod === 'month') {
          const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
          periodText = `${monthNames[selectedMonth]} ${selectedYear}`;
        } else {
          periodText = `Year ${selectedYear}`;
        }
        doc.text(periodText, pageWidth / 2, 58, { align: 'center' });
        
        doc.setFontSize(9);
        doc.setTextColor(156, 163, 175);
        doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 15, 25, { align: 'right' });
        
        doc.setDrawColor(229, 231, 235);
        doc.setLineWidth(0.5);
        doc.line(15, 65, pageWidth - 15, 65);
      };
      
      const addFooter = () => {
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(156, 163, 175);
          doc.text(
            `Page ${i} of ${pageCount} | ${barangayName || 'South Signal Village'} Waste Management System | ${new Date().getFullYear()}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
          );
        }
      };
      
      addHeader();
      let yPos = 80;
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 58, 95);
      doc.text('EXECUTIVE SUMMARY', 15, yPos);
      
      yPos += 8;
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(1);
      doc.line(15, yPos, 60, yPos);
      
      yPos += 10;
      
      const hasReports = analyticsData?.overview?.total > 0;
      
      if (!hasReports) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(107, 114, 128);
        doc.text('No waste reports found for the selected period.', pageWidth / 2, yPos + 20, { align: 'center' });
        doc.text(`Period: ${reportPeriod} - ${selectedYear}`, pageWidth / 2, yPos + 30, { align: 'center' });
        doc.text('Please try a different date range or check if there are reports in the system.', pageWidth / 2, yPos + 40, { align: 'center' });
        addFooter();
        const fileName = `Waste_Report_${barangayName?.replace(/\s/g, '_') || 'Waste_System'}_${reportPeriod}_${selectedYear}${reportPeriod === 'month' ? `_${selectedMonth + 1}` : ''}.pdf`;
        doc.save(fileName);
        setLoading(false);
        return;
      }
      
      // Stats boxes
      const stats = [
        { label: 'Total Reports', value: analyticsData?.overview?.total || 0, color: [37, 99, 235] },
        { label: 'Recycled', value: analyticsData?.overview?.recycled || 0, color: [34, 197, 94] },
        { label: 'Processed', value: analyticsData?.overview?.processed || 0, color: [59, 130, 246] },
        { label: 'Pending', value: analyticsData?.overview?.pending || 0, color: [245, 158, 11] }
      ];
      
      let xPos = 15;
      stats.forEach((stat, index) => {
        doc.setFillColor(249, 250, 251);
        doc.roundedRect(xPos, yPos, 42, 30, 3, 3, 'F');
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(107, 114, 128);
        doc.text(stat.label, xPos + 21, yPos + 10, { align: 'center' });
        
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
        doc.text(stat.value.toString(), xPos + 21, yPos + 23, { align: 'center' });
        
        xPos += 45;
      });
      
      yPos += 45;
      
      // Period Summary Section
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 58, 95);
      doc.text('PERIOD SUMMARY', 15, yPos);
      
      yPos += 6;
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(0.5);
      doc.line(15, yPos, 50, yPos);
      
      yPos += 10;
      
      const recyclingRate = analyticsData.overview.total > 0 
        ? ((analyticsData.overview.recycled / analyticsData.overview.total) * 100).toFixed(1)
        : 0;
      const processingRate = analyticsData.overview.total > 0
        ? (((analyticsData.overview.processed + analyticsData.overview.recycled) / analyticsData.overview.total) * 100).toFixed(1)
        : 0;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(75, 85, 99);
      
      const periodSummary = [
        `During this ${reportPeriod}, a total of ${analyticsData.overview.total} waste reports were recorded in ${barangayName}.`,
        `Out of these, ${analyticsData.overview.recycled} items (${recyclingRate}%) were successfully recycled,`,
        `while ${analyticsData.overview.processed} items (${processingRate}%) were processed.`,
        `The recycling initiative shows ${recyclingRate >= 50 ? 'strong' : 'moderate'} performance.`,
        `Top waste category: ${analyticsData.summary.mostCommonClassification || 'N/A'}`,
        `Most collected material: ${analyticsData.summary.topMaterial || 'N/A'}`
      ];
      
      periodSummary.forEach(line => {
        const lines = doc.splitTextToSize(line, pageWidth - 30);
        doc.text(lines, 15, yPos);
        yPos += (lines.length * 5);
      });
      
      yPos += 5;
      
      // Waste Classification Section
      if (analyticsData?.classificationBreakdown?.length > 0) {
        if (yPos > 220) {
          doc.addPage();
          yPos = 20;
          addHeader();
          yPos = 80;
        }
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 58, 95);
        doc.text('WASTE CLASSIFICATION BREAKDOWN', 15, yPos);
        
        yPos += 6;
        doc.setDrawColor(37, 99, 235);
        doc.setLineWidth(0.5);
        doc.line(15, yPos, 80, yPos);
        
        yPos += 10;
        
        const classificationData = analyticsData.classificationBreakdown.map(item => [
          item.classification,
          item.count,
          `${item.percentage?.toFixed(1) || 0}%`
        ]);
        
        autoTable(doc, {
          startY: yPos,
          head: [['Classification', 'Count', 'Percentage']],
          body: classificationData,
          theme: 'striped',
          headStyles: {
            fillColor: [30, 58, 95],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 10
          },
          bodyStyles: {
            fontSize: 9
          },
          columnStyles: {
            0: { cellWidth: 70 },
            1: { cellWidth: 40, halign: 'center' },
            2: { cellWidth: 40, halign: 'center' }
          },
          margin: { left: 15 }
        });
        
        yPos = doc.lastAutoTable.finalY + 15;
      }
      
      // Material Breakdown Section
      if (analyticsData?.materialBreakdown?.length > 0) {
        if (yPos > 220) {
          doc.addPage();
          yPos = 20;
          addHeader();
          yPos = 80;
        }
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 58, 95);
        doc.text('MATERIAL BREAKDOWN', 15, yPos);
        
        yPos += 6;
        doc.setDrawColor(37, 99, 235);
        doc.setLineWidth(0.5);
        doc.line(15, yPos, 60, yPos);
        
        yPos += 10;
        
        const materialData = analyticsData.materialBreakdown.map(item => [
          item.material,
          item.count,
          `${item.percentage?.toFixed(1) || 0}%`
        ]);
        
        autoTable(doc, {
          startY: yPos,
          head: [['Material Type', 'Count', 'Percentage']],
          body: materialData,
          theme: 'striped',
          headStyles: {
            fillColor: [30, 58, 95],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 10
          },
          bodyStyles: {
            fontSize: 9
          },
          columnStyles: {
            0: { cellWidth: 70 },
            1: { cellWidth: 40, halign: 'center' },
            2: { cellWidth: 40, halign: 'center' }
          },
          margin: { left: 15 }
        });
        
        yPos = doc.lastAutoTable.finalY + 15;
      }
      
      // User Activity Section
      if (analyticsData?.userActivity?.length > 0) {
        if (yPos > 220) {
          doc.addPage();
          yPos = 20;
          addHeader();
          yPos = 80;
        }
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 58, 95);
        doc.text('TOP CONTRIBUTORS', 15, yPos);
        
        yPos += 6;
        doc.setDrawColor(37, 99, 235);
        doc.setLineWidth(0.5);
        doc.line(15, yPos, 60, yPos);
        
        yPos += 10;
        
        const userData = analyticsData.userActivity.slice(0, 10).map((user, index) => [
          `${index + 1}`,
          user.userName || 'Anonymous',
          user.reportCount
        ]);
        
        autoTable(doc, {
          startY: yPos,
          head: [['Rank', 'User Name', 'Reports Submitted']],
          body: userData,
          theme: 'striped',
          headStyles: {
            fillColor: [30, 58, 95],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 10
          },
          bodyStyles: {
            fontSize: 9
          },
          columnStyles: {
            0: { cellWidth: 20, halign: 'center' },
            1: { cellWidth: 90 },
            2: { cellWidth: 40, halign: 'center' }
          },
          margin: { left: 15 }
        });
        
        yPos = doc.lastAutoTable.finalY + 15;
      }
      
      // Key Insights Section
      if (analyticsData?.summary) {
        if (yPos > 240) {
          doc.addPage();
          yPos = 20;
          addHeader();
          yPos = 80;
        }
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 58, 95);
        doc.text('KEY INSIGHTS & RECOMMENDATIONS', 15, yPos);
        
        yPos += 6;
        doc.setDrawColor(37, 99, 235);
        doc.setLineWidth(0.5);
        doc.line(15, yPos, 80, yPos);
        
        yPos += 12;
        
        const recyclingRateCalc = analyticsData.overview?.total > 0 
          ? ((analyticsData.overview.recycled / analyticsData.overview.total) * 100).toFixed(1) 
          : 0;
        const efficiencyRate = analyticsData.overview?.total > 0 
          ? (((analyticsData.overview.processed + analyticsData.overview.recycled) / analyticsData.overview.total) * 100).toFixed(1) 
          : 0;
        
        const insights = [
          `• Most Common Waste Type: ${analyticsData.summary.mostCommonClassification || 'N/A'}`,
          `• Top Material Found: ${analyticsData.summary.topMaterial || 'N/A'}`,
          `• Most Active User: ${analyticsData.summary.mostActiveUser || 'N/A'}`,
          `• Average Reports per User: ${analyticsData.summary.avgReportsPerUser?.toFixed(1) || 0}`,
          `• Recycling Rate: ${recyclingRateCalc}%`,
          `• Processing Efficiency: ${efficiencyRate}%`
        ];
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(75, 85, 99);
        
        insights.forEach(insight => {
          doc.text(insight, 20, yPos);
          yPos += 7;
        });
        
        yPos += 10;
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 58, 95);
        doc.text('Recommendations:', 15, yPos);
        
        yPos += 8;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        
        let recommendations = [];
        if (recyclingRateCalc < 30) {
          recommendations.push('1. Increase recycling awareness campaigns to improve recycling rates');
          recommendations.push('2. Provide more recycling bins in high-traffic areas');
        } else if (recyclingRateCalc < 60) {
          recommendations.push('1. Continue current recycling initiatives and expand to new areas');
          recommendations.push('2. Consider incentives for users who consistently recycle');
        } else {
          recommendations.push('1. Maintain excellent recycling performance and share best practices');
          recommendations.push('2. Consider expanding recycling programs to neighboring areas');
        }
        
        recommendations.push('3. Schedule more frequent collections in high-density waste areas');
        recommendations.push('4. Implement targeted education for proper waste classification');
        recommendations.push('5. Partner with local recycling facilities for better waste processing');
        
        recommendations.forEach(rec => {
          doc.text(rec, 20, yPos);
          yPos += 6;
        });
      }
      
      addFooter();
      
      const fileName = `Waste_Report_${barangayName?.replace(/\s/g, '_') || 'Waste_System'}_${reportPeriod}_${selectedYear}${reportPeriod === 'month' ? `_${selectedMonth + 1}` : ''}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const styles = {
    container: {
      background: '#ffffff',
      borderRadius: '14px',
      padding: '24px',
      marginBottom: '24px',
      border: '1.5px solid #e5e7eb'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      flexWrap: 'wrap',
      gap: '16px'
    },
    title: {
      fontSize: '18px',
      fontWeight: 700,
      color: '#1e3a5f',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    controls: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    selectGroup: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center'
    },
    select: {
      padding: '8px 12px',
      borderRadius: '8px',
      border: '1.5px solid #e5e7eb',
      fontSize: '13px',
      color: '#1f2937',
      background: '#ffffff',
      cursor: 'pointer'
    },
    button: {
      background: 'linear-gradient(135deg, #1e3a5f, #2563eb)',
      color: '#ffffff',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: 600,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s'
    },
    buttonDisabled: {
      background: '#9ca3af',
      cursor: 'not-allowed'
    },
    loadingOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    },
    loadingContent: {
      background: '#ffffff',
      padding: '30px',
      borderRadius: '12px',
      textAlign: 'center'
    },
    spinner: {
      width: '40px',
      height: '40px',
      border: '3px solid #e5e7eb',
      borderTop: '3px solid #2563eb',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
      margin: '0 auto 16px'
    },
    errorMessage: {
      background: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '8px',
      padding: '12px 16px',
      marginTop: '12px',
      fontSize: '13px',
      color: '#dc2626'
    }
  };
  
  const FileTextIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
  
  const availableYears = getAvailableYears();
  
  // Auto-fetch data when component mounts or filters change
  useEffect(() => {
    fetchWasteReports();
  }, [reportPeriod, selectedMonth, selectedYear, selectedWeek, adminRole]);
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>
          <FileTextIcon />
          Download Analytics Report
        </h3>
        
        <div style={styles.controls}>
          <div style={styles.selectGroup}>
            <select 
              style={styles.select}
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value)}
            >
              <option value="week">Weekly Report</option>
              <option value="month">Monthly Report</option>
              <option value="year">Yearly Report</option>
            </select>
            
            {reportPeriod === 'month' && (
              <>
                <select 
                  style={styles.select}
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                >
                  {['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December']
                    .map((month, idx) => (
                      <option key={idx} value={idx}>{month}</option>
                    ))}
                </select>
                
                <select 
                  style={styles.select}
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                >
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </>
            )}
            
            {reportPeriod === 'year' && (
              <select 
                style={styles.select}
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            )}
            
            {reportPeriod === 'week' && (
              <>
                <select 
                  style={styles.select}
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                >
                  {[...Array(52)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>Week {i + 1}</option>
                  ))}
                </select>
                
                <select 
                  style={styles.select}
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                >
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </>
            )}
          </div>
          
          <button 
            style={{...styles.button, ...(loading && styles.buttonDisabled)}}
            onClick={generatePDF}
            disabled={loading}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <path d="M7 10l5 5 5-5" />
              <path d="M12 15V3" />
            </svg>
            {loading ? 'Generating...' : 'Download PDF Report'}
          </button>
        </div>
      </div>
      
      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '12px' }}>
        <p>Generate a comprehensive PDF report including waste classification, material breakdown, user activity, and key insights.</p>
        {analyticsData && analyticsData.overview.total > 0 && (
          <p style={{ marginTop: '8px', color: '#16a34a' }}>
            ✓ Found {analyticsData.overview.total} reports for this period
          </p>
        )}
        {analyticsData && analyticsData.overview.total === 0 && !loading && (
          <p style={{ marginTop: '8px', color: '#d97706' }}>
            ⚠ No reports found for the selected period. Try changing the date range.
          </p>
        )}
      </div>
      
      {fetchError && (
        <div style={styles.errorMessage}>
          Error: {fetchError}
        </div>
      )}
      
      {loading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingContent}>
            <div style={styles.spinner} />
            <p>Generating PDF Report...</p>
            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>Please wait while we prepare your report</p>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Analytics;