const mongoose = require('mongoose');

const RANKS = [
  'Business Executive',
  'Sr Business Executive',
  'Team Leader',
  'Sr Team Leader',
  'Business Development Manager',
  'Associate Sales Director',
  'Director Sales'
];

const employeeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employeeCode: {
    type: String,
    required: true,
    unique: true
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  currentRank: {
    type: String,
    enum: RANKS,
    default: 'Business Executive'
  },
  selfSalesCount: {
    type: Number,
    default: 0
  },
  teamSalesCount: {
    type: Number,
    default: 0
  },
  activeLegsCount: {
    type: Number,
    default: 0
  },
  targetDeadline: {
    type: Date
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
module.exports.RANKS = RANKS;
