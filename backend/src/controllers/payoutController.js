const Payout = require('../models/Payout');
const Commission = require('../models/Commission');
const { sendNotification } = require('../services/notificationService');
const Employee = require('../models/Employee');
const { getDownlineEmployeeIds } = require('../services/mlmEngine');

exports.getPayouts = async (req, res, next) => {
  try {
    let filter = {};

    if (req.user && !['ADMIN', 'DIRECTOR'].includes(req.user.role)) {
      const loggedInEmp = await Employee.findOne({ userId: req.user._id });
      if (!loggedInEmp) {
        return res.json([]);
      }
      const downlines = await getDownlineEmployeeIds(loggedInEmp._id);
      const allowedIds = [loggedInEmp._id, ...downlines];
      filter = { employeeId: { $in: allowedIds } };
    }

    const payouts = await Payout.find(filter)
      .populate({
        path: 'employeeId',
        populate: { path: 'userId', select: 'fullName email phone' }
      })
      .sort({ createdAt: -1 });

    res.json(payouts);
  } catch (error) {
    next(error);
  }
};

exports.requestPayout = async (req, res, next) => {
  try {
    const { employeeId, amount, bankDetails } = req.body;
    const count = await Payout.countDocuments();
    const referenceNo = `PAY-${Date.now()}-${count + 1}`;

    const payout = await Payout.create({
      employeeId,
      amount,
      referenceNo,
      bankDetails,
      status: 'PENDING'
    });

    res.status(201).json(payout);
  } catch (error) {
    next(error);
  }
};

exports.approvePayout = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payout = await Payout.findById(id).populate('employeeId');

    if (!payout) return res.status(404).json({ message: 'Payout not found' });

    payout.status = 'COMPLETED';
    payout.approvedBy = req.user ? req.user._id : null;
    await payout.save();

    // Mark corresponding calculated commissions as PAID
    await Commission.updateMany(
      { employeeId: payout.employeeId._id, status: { $in: ['CALCULATED', 'APPROVED'] } },
      { status: 'PAID' }
    );

    // Send multi-channel notification (Email + WhatsApp + In-App)
    if (payout.employeeId && payout.employeeId.userId) {
      const msg = `Congratulations! Your payout of ₹${payout.amount.toLocaleString()} (Ref: ${payout.referenceNo}) has been approved and processed.`;
      await sendNotification({
        userId: payout.employeeId.userId,
        title: 'Payout Disbursement Successful',
        message: msg,
        channel: 'WHATSAPP'
      });
      await sendNotification({
        userId: payout.employeeId.userId,
        title: 'Payout Disbursement Successful',
        message: msg,
        channel: 'IN_APP'
      });
    }

    res.json({ message: 'Payout approved and completed', payout });
  } catch (error) {
    next(error);
  }
};
