const { processMapImageOCR } = require('../services/ocrPipeline');
const PlotMap = require('../models/PlotMap');
const Plot = require('../models/Plot');

exports.analyzeMap = async (req, res, next) => {
  try {
    const { projectId, mapName } = req.body;

    // Execute OCR + PyMuPDF + OpenCV extraction pipeline
    const result = await processMapImageOCR({
      projectId: projectId || '656565656565656565656565',
      mapName: mapName || 'Green Valley Masterplan',
      fileBuffer: req.file ? req.file.buffer : null,
      fileName: req.file ? req.file.originalname : 'map_layout.pdf'
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.approveMapOverlay = async (req, res, next) => {
  try {
    const { mapId } = req.params;
    const { updatedVectorOverlayData } = req.body;

    const plotMap = await PlotMap.findById(mapId);
    if (!plotMap) return res.status(404).json({ message: 'Plot Map not found' });

    plotMap.status = 'APPROVED';
    if (updatedVectorOverlayData) {
      plotMap.vectorOverlayData = updatedVectorOverlayData;
    }
    await plotMap.save();

    // Sync extracted plots into actual database Plots table with full report fields
    for (const plotData of plotMap.vectorOverlayData) {
      await Plot.findOneAndUpdate(
        { projectId: plotMap.projectId, plotNo: plotData.plotNo },
        {
          projectId: plotMap.projectId,
          block: plotData.plotNo.split('-')[0] || 'E5',
          plotNo: plotData.plotNo,
          sizeSqft: plotData.sizeSqft || (plotData.sellableSqYrd ? plotData.sellableSqYrd * 9 : 1800),
          sellableSqYrd: plotData.sellableSqYrd || 0,
          carpetSqYrd: plotData.carpetSqYrd || 0,
          plc12mtr: plotData.plc12mtr || 0,
          plc9mtr: plotData.plc9mtr || 0,
          plcCorner: plotData.plcCorner || 0,
          plcParkFacing: plotData.plcParkFacing || 0,
          totalPlc: plotData.totalPlc || 0,
          discountedPlc: plotData.discountedPlc || 0,
          otmc: plotData.otmc || 0,
          gstOnOtherCharges: plotData.gstOnOtherCharges || 0,
          totalCost: plotData.totalCost || (plotData.sizeSqft || 1800) * 3500,
          price: plotData.totalCost || (plotData.sizeSqft || 1800) * 3500,
          ownerName: plotData.ownerName || '',
          status: plotData.status || 'AVAILABLE',
          polygon: { points: plotData.polygonPoints || [] }
        },
        { upsert: true, new: true }
      );
    }

    res.json({
      message: 'Plot Map Overlay successfully approved and synchronized with Plot Database',
      plotMap
    });
  } catch (error) {
    next(error);
  }
};

exports.rejectMapOverlay = async (req, res, next) => {
  try {
    const { mapId } = req.params;
    const plotMap = await PlotMap.findById(mapId);
    if (!plotMap) return res.status(404).json({ message: 'Plot Map not found' });

    plotMap.status = 'REJECTED';
    await plotMap.save();

    res.json({ message: 'Map overlay rejected', plotMap });
  } catch (error) {
    next(error);
  }
};
