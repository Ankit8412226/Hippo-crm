const mongoose = require('mongoose');

const plotMapSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  mapName: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  vectorOverlayData: [{
    plotNo: { type: String },
    status: { type: String },
    sellableSqYrd: { type: Number, default: 0 },
    carpetSqYrd: { type: Number, default: 0 },
    plc12mtr: { type: Number, default: 0 },
    plc9mtr: { type: Number, default: 0 },
    plcCorner: { type: Number, default: 0 },
    plcParkFacing: { type: Number, default: 0 },
    totalPlc: { type: Number, default: 0 },
    discountedPlc: { type: Number, default: 0 },
    otmc: { type: Number, default: 0 },
    gstOnOtherCharges: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
    sizeSqft: { type: Number, default: 0 },
    dimensions: { type: String },
    polygonPoints: [{ x: Number, y: Number }],
    confidence: { type: Number }
  }],
  processedAt: {
    type: Date,
    default: Date.now
  },
  confidenceScore: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['PENDING_REVIEW', 'APPROVED', 'REJECTED'],
    default: 'PENDING_REVIEW'
  }
}, { timestamps: true });

module.exports = mongoose.model('PlotMap', plotMapSchema);
