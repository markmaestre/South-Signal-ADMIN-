const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const WasteReport = require('../models/WasteReport');
const Notification = require('../models/Notification');
const User = require('../models/User');
const auth = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;

// Helper function to get barangay filter based on admin role
const getBarangayFilterFromRole = (role, assignedBarangay = null) => {
  switch (role) {
    case 'southadmin':
      return { assignedBarangay: 'south_signal' };
    case 'centraladmin':
      return { assignedBarangay: 'central_signal' };
    case 'admin':
      // Super admin sees all - no filter
      return null;
    default:
      return null;
  }
};

// Helper to check if admin has access to a specific barangay
const hasBarangayAccess = (adminRole, reportBarangay) => {
  if (adminRole === 'admin') return true;
  if (adminRole === 'southadmin') return reportBarangay === 'south_signal';
  if (adminRole === 'centraladmin') return reportBarangay === 'central_signal';
  return false;
};

// Helper to check if user belongs to a specific barangay
async function getUserBarangay(userId) {
  const user = await User.findById(userId);
  if (!user) return null;
  return user.assignedBarangay;
}

// @desc    Create waste detection report with image upload
// @route   POST /api/waste-reports/detect
// @access  Private
router.post('/detect', 
  auth,
  [
    body('image').notEmpty().withMessage('Image is required'),
    body('classification').notEmpty().withMessage('Classification is required'),
    body('classification_confidence')
      .custom((value) => {
        const numValue = parseFloat(value);
        return !isNaN(numValue) && numValue >= 0;
      })
      .withMessage('Confidence must be a valid number')
  ],
  async (req, res) => {
    try {
      console.log('📨 Received waste detection request from user:', req.user.id);
      
      // Get user's assigned barangay
      const userBarangay = await getUserBarangay(req.user.id);
      
      let assignedBarangay = 'south_signal'; // default
      let assignedBarangayLabel = 'South Signal, Taguig';
      
      if (userBarangay === 'central_signal') {
        assignedBarangay = 'central_signal';
        assignedBarangayLabel = 'Central Signal, Taguig';
      } else if (userBarangay === 'tup_taguig') {
        assignedBarangay = 'tup_taguig';
        assignedBarangayLabel = 'TUP Taguig';
      }
      
      console.log(`📍 User belongs to: ${assignedBarangayLabel}`);
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          error: 'Validation failed',
          details: errors.array() 
        });
      }

      const {
        image,
        detected_objects = [],
        classification,
        classification_confidence,
        waste_composition = {},
        material_breakdown = {},
        recycling_tips = [],
        location = {},
        scan_date
      } = req.body;

      // Convert confidence if it's in percentage format
      let finalConfidence = parseFloat(classification_confidence);
      if (finalConfidence > 1) {
        finalConfidence = finalConfidence / 100;
      }

      // Convert detected objects confidence
      const processedObjects = detected_objects.map(obj => ({
        ...obj,
        confidence: obj.confidence > 1 ? obj.confidence / 100 : obj.confidence
      }));

      let imageUrl = image;
      let cloudinaryId = '';

      // Upload image to Cloudinary if it's base64
      if (image && image.startsWith('data:image')) {
        try {
          console.log('☁️ Uploading image to Cloudinary...');
          const folder = `waste-reports-${assignedBarangay}`;
          const uploadResponse = await cloudinary.uploader.upload(image, {
            folder: folder,
            resource_type: 'image',
            quality: 'auto:good',
            fetch_format: 'auto'
          });
          imageUrl = uploadResponse.secure_url;
          cloudinaryId = uploadResponse.public_id;
          console.log('✅ Image uploaded to Cloudinary:', imageUrl);
        } catch (uploadError) {
          console.error('❌ Cloudinary upload error:', uploadError);
          return res.status(500).json({
            success: false,
            error: 'Failed to upload image to cloud storage'
          });
        }
      }

      const session = await WasteReport.startSession();
      session.startTransaction();

      try {
        const reportData = {
          user: req.user.id,
          userEmail: req.user.email,
          image: imageUrl,
          cloudinaryId: cloudinaryId,
          detectedObjects: processedObjects,
          classification,
          classificationConfidence: finalConfidence,
          wasteComposition: waste_composition,
          materialBreakdown: material_breakdown,
          recyclingTips: recycling_tips,
          location,
          status: 'pending',
          assignedBarangay: assignedBarangay,
          assignedBarangayLabel: assignedBarangayLabel
        };

        if (scan_date) {
          reportData.scanDate = new Date(scan_date);
        }

        const report = new WasteReport(reportData);
        await report.save({ session });

        console.log(`✅ Waste report saved to database: ${report._id} - Barangay: ${assignedBarangayLabel}`);

        // Create notification
        const notification = new Notification({
          user: req.user.id,
          title: 'Waste Report Created',
          message: `Your waste detection report for ${assignedBarangayLabel} has been created successfully. Classification: ${classification}`,
          type: 'report_created',
          relatedReport: report._id
        });
        await notification.save({ session });

        await session.commitTransaction();
        session.endSession();

        const populatedReport = await WasteReport.findById(report._id)
          .populate('user', 'name email');

        res.status(201).json({
          success: true,
          message: 'Report successfully saved to database!',
          report: populatedReport,
          notification: {
            id: notification._id,
            title: notification.title,
            message: notification.message
          }
        });

      } catch (transactionError) {
        await session.abortTransaction();
        session.endSession();
        console.error('❌ Transaction error:', transactionError);
        
        if (transactionError.name === 'ValidationError') {
          return res.status(400).json({
            success: false,
            error: 'Data validation failed',
            details: transactionError.errors
          });
        }
        
        if (transactionError.code === 11000) {
          return res.status(400).json({
            success: false,
            error: 'Duplicate entry found'
          });
        }
        
        throw transactionError;
      }

    } catch (error) {
      console.error('❌ Report creation error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to create waste report',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// @desc    Get user's own reports (filtered by their barangay)
// @route   GET /api/waste-reports/my-reports
// @access  Private
router.get('/my-reports', auth, async (req, res) => {
  try {
    const userBarangay = await getUserBarangay(req.user.id);
    
    const query = { 
      user: req.user.id,
      assignedBarangay: userBarangay
    };
    
    const { page = 1, limit = 10, status } = req.query;
    if (status && status !== 'all') {
      query.status = status;
    }

    const reports = await WasteReport.find(query)
      .populate('user', 'name email profile')
      .sort({ scanDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const total = await WasteReport.countDocuments(query);

    res.json({
      success: true,
      reports,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      barangay: userBarangay
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch reports' 
    });
  }
});

// @desc    Get single report by ID (with access control)
// @route   GET /api/waste-reports/:id
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const report = await WasteReport.findById(req.params.id)
      .populate('user', 'name email profile');
    
    if (!report) {
      return res.status(404).json({ 
        success: false,
        error: 'Report not found' 
      });
    }

    // Check if user owns the report
    if (report.user._id.toString() === req.user.id) {
      return res.json({ success: true, report });
    }

    // For admin access - check role-based permissions
    if (req.user.role === 'admin') {
      return res.json({ success: true, report });
    }
    
    if (req.user.role === 'southadmin' && report.assignedBarangay === 'south_signal') {
      return res.json({ success: true, report });
    }
    
    if (req.user.role === 'centraladmin' && report.assignedBarangay === 'central_signal') {
      return res.json({ success: true, report });
    }

    return res.status(403).json({ 
      success: false,
      error: 'Access denied' 
    });

  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch report' 
    });
  }
});

// @desc    Get all reports (admin only - filtered by role)
// @route   GET /api/waste-reports
// @access  Private/Admin
router.get('/', auth, async (req, res) => {
  try {
    console.log('🔐 Admin access check - User role:', req.user.role);
    console.log('🔐 User ID:', req.user.id);
    
    // Check if user has admin role
    if (!['admin', 'southadmin', 'centraladmin'].includes(req.user.role)) {
      console.log('❌ Access denied - User is not an admin');
      return res.status(403).json({ 
        success: false,
        error: 'Access denied. Admin privileges required.' 
      });
    }

    const { 
      page = 1, 
      limit = 50, 
      status, 
      user, 
      classification, 
      startDate, 
      endDate 
    } = req.query;
    
    console.log('📋 Query parameters:', { 
      page, limit, status, user, classification, startDate, endDate 
    });
    
    // Build query based on admin role
    let query = {};
    const barangayFilter = getBarangayFilterFromRole(req.user.role, req.user.assignedBarangay);
    
    if (barangayFilter) {
      query = { ...barangayFilter };
      console.log(`🔍 Filtering for: ${req.user.role} - ${JSON.stringify(barangayFilter)}`);
    } else {
      console.log('🔍 Super admin - showing all barangays');
    }
    
    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // User filter
    if (user) {
      query.user = user;
    }
    
    // Classification filter
    if (classification && classification !== 'all') {
      query.classification = classification;
    }
    
    // Date range filter
    if (startDate || endDate) {
      query.scanDate = {};
      if (startDate) {
        query.scanDate.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.scanDate.$lte = end;
      }
    }

    console.log('🔍 Final query:', JSON.stringify(query, null, 2));

    const reports = await WasteReport.find(query)
      .populate('user', 'name email profile')
      .sort({ scanDate: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('-__v');

    const total = await WasteReport.countDocuments(query);

    // Get unique barangays in results
    const barangays = [...new Set(reports.map(r => r.assignedBarangayLabel).filter(Boolean))];

    console.log(`✅ Admin fetched ${reports.length} reports`);

    res.json({
      success: true,
      reports: reports || [],
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      filters: {
        status: status || 'all',
        user: user || 'all',
        classification: classification || 'all',
        startDate: startDate || '',
        endDate: endDate || ''
      },
      adminRole: req.user.role,
      barangays: barangays
    });

  } catch (error) {
    console.error('❌ Get all reports error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch reports',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Update report status (with access control)
// @route   PUT /api/waste-reports/:id/status
// @access  Private
router.put('/:id/status', 
  auth,
  [
    body('status').isIn(['pending', 'processed', 'recycled', 'disposed', 'rejected'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          error: 'Validation failed',
          details: errors.array() 
        });
      }

      const { status, adminNotes } = req.body;
      
      console.log(`🔄 Updating report ${req.params.id} to status: ${status}`);

      const report = await WasteReport.findById(req.params.id);
      if (!report) {
        return res.status(404).json({ 
          success: false,
          error: 'Report not found' 
        });
      }

      // Check access based on role
      let hasAccess = false;
      
      if (req.user.role === 'admin') {
        hasAccess = true; // Super admin can update any
      } else if (req.user.role === 'southadmin' && report.assignedBarangay === 'south_signal') {
        hasAccess = true;
      } else if (req.user.role === 'centraladmin' && report.assignedBarangay === 'central_signal') {
        hasAccess = true;
      } else if (report.user.toString() === req.user.id) {
        hasAccess = true; // User can update their own
      }
      
      if (!hasAccess) {
        return res.status(403).json({ 
          success: false,
          error: 'Access denied - You do not have permission to update this report' 
        });
      }

      const session = await WasteReport.startSession();
      session.startTransaction();

      try {
        const oldStatus = report.status;
        report.status = status;
        
        if (adminNotes && (req.user.role !== 'user')) {
          report.adminNotes = adminNotes;
        }
        
        await report.save({ session });

        // Create notification
        const notificationMessage = req.user.role !== 'user'
          ? `${req.user.role === 'admin' ? 'Admin' : req.user.role === 'southadmin' ? 'South Signal Admin' : 'Central Signal Admin'} updated your report status from ${oldStatus} to: ${status}. ${adminNotes ? `Notes: ${adminNotes}` : ''}`
          : `Your report status updated to: ${status}`;

        const notification = new Notification({
          user: report.user,
          title: 'Report Status Updated',
          message: notificationMessage,
          type: 'report_processed',
          relatedReport: report._id
        });
        await notification.save({ session });

        await session.commitTransaction();
        session.endSession();

        const updatedReport = await WasteReport.findById(report._id)
          .populate('user', 'name email profile');

        res.json({ 
          success: true, 
          message: 'Report status updated successfully',
          report: updatedReport
        });

      } catch (transactionError) {
        await session.abortTransaction();
        session.endSession();
        throw transactionError;
      }

    } catch (error) {
      console.error('Update status error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to update report status' 
      });
    }
  }
);

// @desc    Delete waste report (with access control)
// @route   DELETE /api/waste-reports/:id
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const report = await WasteReport.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ 
        success: false,
        error: 'Report not found' 
      });
    }

    // Check access based on role
    let hasAccess = false;
    
    if (req.user.role === 'admin') {
      hasAccess = true;
    } else if (req.user.role === 'southadmin' && report.assignedBarangay === 'south_signal') {
      hasAccess = true;
    } else if (req.user.role === 'centraladmin' && report.assignedBarangay === 'central_signal') {
      hasAccess = true;
    } else if (report.user.toString() === req.user.id) {
      hasAccess = true;
    }
    
    if (!hasAccess) {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied' 
      });
    }

    // Delete image from Cloudinary
    if (report.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(report.cloudinaryId);
      } catch (cloudinaryError) {
        console.error('Cloudinary delete error:', cloudinaryError);
      }
    }

    await WasteReport.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete report' 
    });
  }
});

// @desc    Get comprehensive waste reports statistics (filtered by role)
// @route   GET /api/waste-reports/stats/comprehensive
// @access  Private/Admin
router.get('/stats/comprehensive', auth, async (req, res) => {
  try {
    if (!['admin', 'southadmin', 'centraladmin'].includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied' 
      });
    }

    // Build base filter based on role
    let baseFilter = {};
    const barangayFilter = getBarangayFilterFromRole(req.user.role, req.user.assignedBarangay);
    
    if (barangayFilter) {
      baseFilter = { ...barangayFilter };
    }

    // Basic counts
    const totalReports = await WasteReport.countDocuments(baseFilter);
    const pendingReports = await WasteReport.countDocuments({ ...baseFilter, status: 'pending' });
    const processedReports = await WasteReport.countDocuments({ ...baseFilter, status: 'processed' });
    const recycledReports = await WasteReport.countDocuments({ ...baseFilter, status: 'recycled' });
    const disposedReports = await WasteReport.countDocuments({ ...baseFilter, status: 'disposed' });
    const rejectedReports = await WasteReport.countDocuments({ ...baseFilter, status: 'rejected' });

    // Classification breakdown with percentages
    const classificationStats = await WasteReport.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: '$classification',
          count: { $sum: 1 },
          avgConfidence: { $avg: '$classificationConfidence' }
        }
      },
      {
        $project: {
          classification: '$_id',
          count: 1,
          avgConfidence: 1,
          percentage: totalReports > 0 ? { $multiply: [{ $divide: ['$count', totalReports] }, 100] } : 0
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Monthly trends
    const monthlyStats = await WasteReport.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: {
            year: { $year: '$scanDate' },
            month: { $month: '$scanDate' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          period: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              { $toString: { $cond: [{ $lt: ['$_id.month', 10] }, { $concat: ['0', { $toString: '$_id.month' }] }, { $toString: '$_id.month' }] } }
            ]
          },
          count: 1
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    // User activity stats
    const userStats = await WasteReport.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: '$user',
          reportCount: { $sum: 1 },
          firstReport: { $min: '$scanDate' },
          lastReport: { $max: '$scanDate' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $project: {
          userId: '$_id',
          userName: { $arrayElemAt: ['$userInfo.name', 0] },
          userEmail: { $arrayElemAt: ['$userInfo.email', 0] },
          reportCount: 1,
          firstReport: 1,
          lastReport: 1
        }
      },
      { $sort: { reportCount: -1 } },
      { $limit: 10 }
    ]);

    // Material breakdown
    const materialStats = await WasteReport.aggregate([
      { $match: baseFilter },
      { $unwind: '$detectedObjects' },
      {
        $group: {
          _id: '$detectedObjects.material',
          count: { $sum: 1 },
          avgConfidence: { $avg: '$detectedObjects.confidence' }
        }
      },
      {
        $project: {
          material: '$_id',
          count: 1,
          avgConfidence: 1,
          percentage: totalReports > 0 ? { $multiply: [{ $divide: ['$count', totalReports] }, 100] } : 0
        }
      },
      { $sort: { count: -1 } },
      { $match: { material: { $ne: null, $ne: '' } } }
    ]);

    res.json({
      success: true,
      adminRole: req.user.role,
      barangayFilter: barangayFilter ? Object.values(barangayFilter)[0] : 'all',
      stats: {
        overview: {
          total: totalReports,
          pending: pendingReports,
          processed: processedReports,
          recycled: recycledReports,
          disposed: disposedReports,
          rejected: rejectedReports
        },
        classificationBreakdown: classificationStats,
        monthlyTrends: monthlyStats,
        userActivity: userStats,
        materialBreakdown: materialStats,
        summary: {
          mostCommonClassification: classificationStats[0]?.classification || 'None',
          topMaterial: materialStats[0]?.material || 'None',
          mostActiveUser: userStats[0]?.userName || 'None',
          avgReportsPerUser: totalReports / (userStats.length || 1)
        }
      }
    });
  } catch (error) {
    console.error('Get comprehensive stats error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch comprehensive statistics' 
    });
  }
});

// @desc    Get quick overview statistics (filtered by role)
// @route   GET /api/waste-reports/stats/overview
// @access  Private/Admin
router.get('/stats/overview', auth, async (req, res) => {
  try {
    if (!['admin', 'southadmin', 'centraladmin'].includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied' 
      });
    }

    let baseFilter = {};
    const barangayFilter = getBarangayFilterFromRole(req.user.role, req.user.assignedBarangay);
    
    if (barangayFilter) {
      baseFilter = { ...barangayFilter };
    }

    const totalReports = await WasteReport.countDocuments(baseFilter);
    const pendingReports = await WasteReport.countDocuments({ ...baseFilter, status: 'pending' });
    const processedReports = await WasteReport.countDocuments({ ...baseFilter, status: 'processed' });
    const recycledReports = await WasteReport.countDocuments({ ...baseFilter, status: 'recycled' });
    const disposedReports = await WasteReport.countDocuments({ ...baseFilter, status: 'disposed' });
    const rejectedReports = await WasteReport.countDocuments({ ...baseFilter, status: 'rejected' });

    const classificationStats = await WasteReport.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: '$classification',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Today's reports
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaysReports = await WasteReport.countDocuments({
      ...baseFilter,
      scanDate: { $gte: today }
    });

    // This week's reports
    const startOfWeek = new Date();
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const thisWeeksReports = await WasteReport.countDocuments({
      ...baseFilter,
      scanDate: { $gte: startOfWeek }
    });

    res.json({
      success: true,
      adminRole: req.user.role,
      barangayFilter: barangayFilter ? Object.values(barangayFilter)[0] : 'all',
      stats: {
        total: totalReports,
        pending: pendingReports,
        processed: processedReports,
        recycled: recycledReports,
        disposed: disposedReports,
        rejected: rejectedReports,
        todaysReports,
        thisWeeksReports,
        classificationBreakdown: classificationStats
      }
    });
  } catch (error) {
    console.error('Get overview stats error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch overview statistics' 
    });
  }
});

module.exports = router;