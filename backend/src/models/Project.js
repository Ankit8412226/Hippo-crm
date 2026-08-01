const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  location: {
    type: String,
    required: true
  },
  city: {
    type: String,
    default: 'Gurgaon'
  },
  state: {
    type: String,
    default: 'Haryana'
  },
  description: {
    type: String,
    default: 'Premium Gated Real Estate Township with 24/7 Security, Wide Roads, and Commercial Zones.'
  },
  amenities: [{ type: String }],
  totalAreaSqft: {
    type: Number,
    required: true
  },
  totalPlots: {
    type: Number,
    default: 0
  },
  launchDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['UPCOMING', 'ACTIVE', 'COMPLETED'],
    default: 'ACTIVE'
  },
  basePricePerSqft: {
    type: Number,
    required: true
  },
  bannerImage: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
