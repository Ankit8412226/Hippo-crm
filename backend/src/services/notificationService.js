const Notification = require('../models/Notification');

async function sendNotification({ userId, title, message, channel = 'IN_APP' }) {
  const notif = await Notification.create({
    userId,
    title,
    message,
    channel,
    status: 'UNREAD',
    sentAt: new Date()
  });

  // Mock log for external channels
  if (channel === 'WHATSAPP') {
    console.log(`[WHATSAPP DISPATCH] To User ${userId}: ${title} - ${message}`);
  } else if (channel === 'EMAIL') {
    console.log(`[EMAIL DISPATCH] To User ${userId}: ${title} - ${message}`);
  }

  return notif;
}

module.exports = {
  sendNotification
};
