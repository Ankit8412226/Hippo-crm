const { processMapImageOCR } = require('../services/ocrPipeline');
const PlotMap = require('../models/PlotMap');
const Plot = require('../models/Plot');
const { computePricing, deriveBaseRatePerSqYrd } = require('../services/pricingEngine');

/** Axis-aligned bounding box for a polygon, used as the canvas rectangle fallback. */
function bboxFromPoints(points) {
  if (!Array.isArray(points) || points.length === 0) {
    return { x: 50, y: 50, width: 120, height: 90 };
  }
  const xs = points.map((p) => Number(p.x) || 0);
  const ys = points.map((p) => Number(p.y) || 0);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  return {
    x: minX,
    y: minY,
    width: Math.max(...xs) - minX || 120,
    height: Math.max(...ys) - minY || 90
  };
}

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

    // Sync extracted plots into the Plots table with reconciled pricing AND
    // canvas geometry (both polygon points and a bounding-box rectangle).
    for (const plotData of plotMap.vectorOverlayData) {
      const points = plotData.polygonPoints || plotData.polygon?.points || [];
      const coordinates = bboxFromPoints(points);

      const priceInputs = {
        sellableSqYrd: plotData.sellableSqYrd || 0,
        plc12mtr: plotData.plc12mtr || 0,
        plc9mtr: plotData.plc9mtr || 0,
        plcCorner: plotData.plcCorner || 0,
        plcParkFacing: plotData.plcParkFacing || 0,
        discountedPlc: plotData.discountedPlc || 0,
        otmc: plotData.otmc || 0,
        totalCost: plotData.totalCost || 0
      };
      const baseRatePerSqYrd = deriveBaseRatePerSqYrd(priceInputs);
      const pricing = computePricing({ ...priceInputs, baseRatePerSqYrd });
      const finalTotalCost = baseRatePerSqYrd > 0 ? pricing.totalCost : (plotData.totalCost || 0);

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
          totalPlc: pricing.totalPlc,
          discountedPlc: plotData.discountedPlc || 0,
          otmc: plotData.otmc || 0,
          baseRatePerSqYrd,
          gstOnOtherCharges: pricing.gstOnOtherCharges,
          totalCost: finalTotalCost,
          price: finalTotalCost || 0,
          ownerName: plotData.ownerName || '',
          status: plotData.status || 'AVAILABLE',
          coordinates,
          polygon: { points }
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
