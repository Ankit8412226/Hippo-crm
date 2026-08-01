const Notification = require('../models/Notification');

exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find()
      .populate('userId', 'fullName email')
      .sort({ sentAt: -1 });

    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notif = await Notification.findById(id);
    if (!notif) return res.status(404).json({ message: 'Notification not found' });

    notif.status = 'READ';
    await notif.save();

    res.json(notif);
  } catch (error) {
    next(error);
  }
};
