require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const adminRoutes = require('./routes/adminRoutes');
const messageRoutes = require('./routes/messageRoutes');
const wasteRoutes = require('./routes/wasteRoutes');
const Notification = require('./routes/notificationRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Add a health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/users', userRoutes)
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/waste-reports', wasteRoutes); // CHANGED FROM '/api/waste'
app.use('/api/notifications', Notification);

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection failed:", err));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});