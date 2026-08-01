const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  channel: {
    type: String,
    enum: ['IN_APP', 'EMAIL', 'WHATSAPP'],
    default: 'IN_APP'
  },
  status: {
    type: String,
    enum: ['UNREAD', 'READ', 'SENT', 'FAILED'],
    default: 'UNREAD'
  },
  sentAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
