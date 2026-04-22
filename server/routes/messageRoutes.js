const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const Admin = require('../models/admin'); // Add Admin model import
const auth = require('../middleware/auth');

// Helper function to find user in either User or Admin collection
const findUserById = async (userId) => {
  try {
    // First try to find in User collection
    let user = await User.findById(userId);
    if (user) return user;

    // If not found in User collection, try Admin collection
    user = await Admin.findById(userId);
    return user;
  } catch (error) {
    console.error('Error finding user:', error);
    return null;
  }
};

// Helper function to search users across both collections
const searchUsers = async (query, excludeUserId) => {
  try {
    const userResults = await User.find({
      _id: { $ne: excludeUserId },
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('username email profile role');

    const adminResults = await Admin.find({
      _id: { $ne: excludeUserId },
      $or: [
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('email profile role').lean();

    // Add username field for admins (use email as username if no username field)
    const formattedAdminResults = adminResults.map(admin => ({
      ...admin,
      username: admin.email.split('@')[0] // Use email prefix as username
    }));

    return [...userResults, ...formattedAdminResults];
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
};

// 1️⃣ Get all users (for admin) - PROTECTED - UPDATED
router.get('/users', auth, async (req, res) => {
  try {
    console.log('Fetching all users for:', req.user.id);
    
    // Get all users from User collection
    const users = await User.find({ 
      _id: { $ne: req.user.id }
    }).select('username email profile status role');

    // Get all admins from Admin collection (except current user)
    const admins = await Admin.find({ 
      _id: { $ne: req.user.id }
    }).select('email profile role').lean();

    // Format admins to include username
    const formattedAdmins = admins.map(admin => ({
      ...admin,
      username: admin.email.split('@')[0], // Use email prefix as username
      email: admin.email,
      profile: admin.profile,
      role: admin.role || 'admin',
      status: 'active'
    }));

    const allUsers = [...users, ...formattedAdmins];
    console.log(`Found ${allUsers.length} total users (${users.length} users + ${admins.length} admins)`);
    
    res.json(allUsers);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
});

// 2️⃣ Get all admins (for user) - PROTECTED
router.get('/admins', auth, async (req, res) => {
  try {
    const admins = await Admin.find().select('email profile').lean();
    
    // Format admins to include username
    const formattedAdmins = admins.map(admin => ({
      ...admin,
      username: admin.email.split('@')[0],
      role: 'admin'
    }));
    
    res.json(formattedAdmins);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch admins', error: err.message });
  }
});

// 3️⃣ Search users - PROTECTED - UPDATED: Search BOTH User and Admin collections
router.get('/search', auth, async (req, res) => {
  try {
    const query = req.query.q;
    console.log('Searching users with query:', query, 'by user:', req.user.id);
    
    if (!query) {
      return res.json([]);
    }

    const results = await searchUsers(query, req.user.id);
    console.log(`Search found ${results.length} results`);
    
    res.json(results);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ message: 'Search failed', error: err.message });
  }
});

// 4️⃣ Send message - PROTECTED - UPDATED: Works with both User and Admin collections
router.post('/send', auth, async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    
    // Get senderId from authenticated user
    const senderId = req.user.id || req.user.userId;
    
    console.log('=== SEND MESSAGE DEBUG START ===');
    console.log('Sending message request:', { 
      senderId, 
      receiverId, 
      text,
      authenticatedUser: req.user 
    });
    
    // Validate required fields
    if (!receiverId || !text) {
      console.error('Missing required fields');
      return res.status(400).json({ 
        message: 'receiverId and text are required',
        received: { receiverId, text }
      });
    }

    // Validate senderId exists
    if (!senderId) {
      console.error('Sender ID not found in token');
      return res.status(400).json({ message: 'User authentication failed - no user ID in token' });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      console.error('Invalid receiverId format');
      return res.status(400).json({ message: 'Invalid receiver ID format' });
    }

    if (!mongoose.Types.ObjectId.isValid(senderId)) {
      console.error('Invalid senderId format');
      return res.status(400).json({ message: 'Invalid sender ID format' });
    }

    // Check if sender exists - UPDATED: Check both collections
    console.log('Checking sender existence...');
    const sender = await findUserById(senderId);
    console.log('Sender found:', sender ? {
      _id: sender._id,
      username: sender.username || sender.email?.split('@')[0],
      email: sender.email,
      role: sender.role
    } : 'NULL - SENDER NOT FOUND');

    if (!sender) {
      console.error(`Sender user ${senderId} not found in database`);
      return res.status(404).json({ 
        message: 'Your user account was not found. Please login again.',
        senderId: senderId
      });
    }

    // Check if receiver exists - UPDATED: Check both collections
    console.log('Checking receiver existence...');
    const receiver = await findUserById(receiverId);
    console.log('Receiver found:', receiver ? {
      _id: receiver._id,
      username: receiver.username || receiver.email?.split('@')[0],
      email: receiver.email,
      role: receiver.role
    } : 'NULL - RECEIVER NOT FOUND');

    if (!receiver) {
      return res.status(404).json({ 
        message: 'Receiver user not found',
        receiverId: receiverId
      });
    }

    // Prevent sending message to yourself
    if (senderId === receiverId) {
      return res.status(400).json({ 
        message: 'Cannot send message to yourself' 
      });
    }

    console.log('Creating message document...');
    const message = new Message({ 
      sender: senderId, 
      receiver: receiverId, 
      message: text 
    });
    
    await message.save();
    console.log('Message saved with ID:', message._id);
    
    // Populate sender and receiver information - UPDATED: Handle both User and Admin
    console.log('Populating message data...');
    
    // Custom population since we have multiple models
    const populatedMessage = await Message.findById(message._id)
      .populate([
        {
          path: 'sender',
          model: 'User', // Try User first
          select: 'username email profile role'
        },
        {
          path: 'receiver', 
          model: 'User', // Try User first
          select: 'username email profile role'
        }
      ]);

    // If sender not found in User collection, try Admin collection
    if (!populatedMessage.sender) {
      const adminSender = await Admin.findById(senderId).select('email profile role');
      if (adminSender) {
        populatedMessage.sender = {
          _id: adminSender._id,
          username: adminSender.email.split('@')[0],
          email: adminSender.email,
          profile: adminSender.profile,
          role: adminSender.role || 'admin'
        };
      }
    }

    // If receiver not found in User collection, try Admin collection
    if (!populatedMessage.receiver) {
      const adminReceiver = await Admin.findById(receiverId).select('email profile role');
      if (adminReceiver) {
        populatedMessage.receiver = {
          _id: adminReceiver._id,
          username: adminReceiver.email.split('@')[0],
          email: adminReceiver.email,
          profile: adminReceiver.profile,
          role: adminReceiver.role || 'admin'
        };
      }
    }

    const responseMessage = {
      _id: populatedMessage._id,
      senderId: populatedMessage.sender._id,
      receiverId: populatedMessage.receiver._id,
      text: populatedMessage.message,
      timestamp: populatedMessage.timestamp,
      read: populatedMessage.read,
      sender: populatedMessage.sender,
      receiver: populatedMessage.receiver
    };
    
    console.log('Sending response:', responseMessage);
    console.log('=== SEND MESSAGE DEBUG END ===');
    
    res.json({ 
      success: true, 
      message: responseMessage
    });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ message: 'Failed to send message', error: err.message });
  }
});

// 5️⃣ Get conversation between two users - PROTECTED - UPDATED
router.get('/conversation/:otherUserId', auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    const otherUserId = req.params.otherUserId;
    
    console.log('Fetching conversation between:', userId, 'and', otherUserId);
    
    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid authenticated user ID' });
    }

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    }).sort({ timestamp: 1 });

    // Custom population for messages
    const populatedMessages = await Promise.all(
      messages.map(async (msg) => {
        let sender = await User.findById(msg.sender).select('username email profile role');
        let receiver = await User.findById(msg.receiver).select('username email profile role');

        // If not found in User collection, try Admin collection
        if (!sender) {
          const adminSender = await Admin.findById(msg.sender).select('email profile role');
          if (adminSender) {
            sender = {
              _id: adminSender._id,
              username: adminSender.email.split('@')[0],
              email: adminSender.email,
              profile: adminSender.profile,
              role: adminSender.role || 'admin'
            };
          }
        }

        if (!receiver) {
          const adminReceiver = await Admin.findById(msg.receiver).select('email profile role');
          if (adminReceiver) {
            receiver = {
              _id: adminReceiver._id,
              username: adminReceiver.email.split('@')[0],
              email: adminReceiver.email,
              profile: adminReceiver.profile,
              role: adminReceiver.role || 'admin'
            };
          }
        }

        return {
          _id: msg._id,
          senderId: msg.sender,
          receiverId: msg.receiver,
          text: msg.message,
          timestamp: msg.timestamp,
          read: msg.read,
          sender: sender,
          receiver: receiver
        };
      })
    );

    console.log(`Found ${populatedMessages.length} messages`);
    
    res.json(populatedMessages);
  } catch (err) {
    console.error('Get conversation error:', err);
    res.status(500).json({ message: 'Failed to fetch conversation', error: err.message });
  }
});

// 6️⃣ Get user's conversations list - PROTECTED - UPDATED
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;

    console.log('Fetching conversations for user:', userId, 'with role:', req.user.role);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Get all unique conversation partners using aggregation
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: new mongoose.Types.ObjectId(userId) },
            { receiver: new mongoose.Types.ObjectId(userId) }
          ]
        }
      },
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$sender", new mongoose.Types.ObjectId(userId)] },
              then: "$receiver",
              else: "$sender"
            }
          },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $ne: ["$sender", new mongoose.Types.ObjectId(userId)] },
                    { $eq: ["$read", false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // Custom population for conversation users
    const populatedConversations = await Promise.all(
      conversations.map(async (conv) => {
        let user = await User.findById(conv._id).select('username email profile role');
        
        // If not found in User collection, try Admin collection
        if (!user) {
          const adminUser = await Admin.findById(conv._id).select('email profile role');
          if (adminUser) {
            user = {
              _id: adminUser._id,
              username: adminUser.email.split('@')[0],
              email: adminUser.email,
              profile: adminUser.profile,
              role: adminUser.role || 'admin'
            };
          }
        }

        return {
          user: user,
          lastMessage: {
            _id: conv.lastMessage._id,
            text: conv.lastMessage.message,
            timestamp: conv.lastMessage.timestamp,
            read: conv.lastMessage.read,
            sender: conv.lastMessage.sender
          },
          unread: conv.unreadCount > 0,
          timestamp: conv.lastMessage.timestamp
        };
      })
    );

    // Filter out conversations where user is null (shouldn't happen but just in case)
    const validConversations = populatedConversations.filter(conv => conv.user !== null);

    console.log(`Found ${validConversations.length} conversations for user ${userId}`);
    
    res.json(validConversations);
  } catch (err) {
    console.error('Get conversations error:', err);
    res.status(500).json({ message: 'Failed to fetch conversations', error: err.message });
  }
});

// 7️⃣ Mark messages as read - PROTECTED
router.put('/read/:senderId', auth, async (req, res) => {
  try {
    const receiverId = req.user.id || req.user.userId;
    const senderId = req.params.senderId;
    
    console.log('Marking messages as read from:', senderId, 'to:', receiverId);
    
    if (!mongoose.Types.ObjectId.isValid(receiverId) || !mongoose.Types.ObjectId.isValid(senderId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    const result = await Message.updateMany(
      { 
        sender: senderId, 
        receiver: receiverId, 
        read: false 
      },
      { 
        $set: { read: true } 
      }
    );
    
    console.log('Marked as read result:', result);
    
    res.json({ 
      success: true, 
      message: 'Messages marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    console.error('Mark as read error:', err);
    res.status(500).json({ message: 'Failed to update read status', error: err.message });
  }
});

// 8️⃣ Health check for messages
router.get('/health', auth, (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Messages API',
    authenticatedUser: req.user,
    userId: req.user.id,
    timestamp: new Date().toISOString()
  });
});

// 9️⃣ Debug route to check user existence - UPDATED
router.get('/debug/user/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('Debug: Looking for user:', userId);
    
    const user = await findUserById(userId);
    console.log('Debug: User found:', user ? {
      _id: user._id,
      username: user.username || user.email?.split('@')[0],
      email: user.email,
      role: user.role
    } : 'NOT FOUND');
    
    // Check all users from both collections
    const allUsers = await User.find().select('_id username email role').limit(5);
    const allAdmins = await Admin.find().select('_id email role').limit(5);
    
    console.log('First 5 users in User collection:', allUsers);
    console.log('First 5 users in Admin collection:', allAdmins);
    
    res.json({ 
      userExists: !!user,
      user: user,
      userId: userId,
      allUsers: allUsers,
      allAdmins: allAdmins
    });
  } catch (err) {
    console.error('Debug error:', err);
    res.status(500).json({ message: 'Debug failed', error: err.message });
  }
});

module.exports = router;