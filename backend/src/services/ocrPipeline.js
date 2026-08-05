const PlotMap = require('../models/PlotMap');
const Plot = require('../models/Plot');
const { uploadToS3 } = require('./s3Service');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Naksa (site layout map) parser.
 *
 * When GEMINI_API_KEY is configured, the uploaded map image is sent to Google
 * Gemini Vision to extract plot numbers, geometry and (where legible) pricing.
 * When AWS credentials are configured, the original file is stored to S3.
 *
 * If neither the key nor a real extraction is available, a clearly-labelled
 * SAMPLE dataset is returned with low confidence so the human-in-the-loop
 * review flow is always triggered (nothing is silently trusted).
 */
async function processMapImageOCR({ projectId, mapName, fileBuffer, fileName }) {
  let s3ImageUrl = 'https://images.unsplash.com/photo-1524813686514-a57563d77965?auto=format&fit=crop&w=1200&q=80';

  // 1. Store the uploaded Naksa file (no-op fake URL if AWS creds absent).
  if (fileBuffer) {
    s3ImageUrl = await uploadToS3(fileBuffer, fileName, 'image/png', 'naksa_layouts');
  }

  let extractedPlots = [];
  let overallConfidence = 0.896;
  let usedAI = false;

  // 2. Extract via Google Gemini Vision (best for architectural blueprints / Naksa).
  if (process.env.GEMINI_API_KEY && fileBuffer) {
    const preferredModel = process.env.GEMINI_VISION_MODEL || 'gemini-1.5-pro';
    const fallbackModels = [preferredModel, 'gemini-1.5-flash', 'gemini-2.0-flash-exp'];

    for (const modelName of fallbackModels) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: modelName });

        const imagePart = {
          inlineData: {
            data: fileBuffer.toString('base64'),
            mimeType: 'image/png'
          }
        };

        const prompt = `You are a high-precision real estate site layout map (Naksa) parser. Analyze this site plan image and extract EVERY visible plot unit.
Return ONLY a raw JSON array (no markdown). Each object must have these keys:
- plotNo (string, e.g. "E5-83")
- status: one of AVAILABLE, BOOKED, PENDING, SOLD (infer from colour/legend; default AVAILABLE)
- sellableSqYrd, carpetSqYrd (numbers, 0 if unknown)
- plc12mtr, plc9mtr, plcCorner, plcParkFacing, totalPlc, discountedPlc, otmc, gstOnOtherCharges, totalCost (numbers, 0 if not printed on the map)
- polygonPoints: array of {x, y} pixel coordinates tracing the plot boundary in this image (clockwise). REQUIRED so the plot can be drawn on a canvas.
- confidence: number 0-1 for this plot.
Return ONLY the JSON array.`;

        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          extractedPlots = parsed;
          overallConfidence = 0.96;
          usedAI = true;
          break;
        }
      } catch (aiError) {
        console.warn(`Gemini Vision AI (${modelName}) parsing attempt note:`, aiError.message);
      }
    }
  }

  // 3. SAMPLE dataset when no AI extraction is available (no key / parse failed).
  //    Kept at low confidence so it is always flagged for human review.
  let isSample = false;
  if (extractedPlots.length === 0) {
    isSample = true;
    extractedPlots = [
      {
        plotNo: 'E5-78',
        status: 'SOLD',
        sellableSqYrd: 201.28,
        carpetSqYrd: 104.48,
        plc12mtr: 0,
        plc9mtr: 0,
        plcCorner: 0,
        plcParkFacing: 0,
        totalPlc: 0,
        discountedPlc: 0,
        otmc: 250,
        gstOnOtherCharges: 9057.69,
        totalCost: 1367510,
        dimensions: '30x60',
        sizeSqft: 1811.5,
        confidence: 0.96,
        polygonPoints: [{ x: 50, y: 50 }, { x: 150, y: 50 }, { x: 150, y: 130 }, { x: 50, y: 130 }]
      },
      {
        plotNo: 'E5-80',
        status: 'SOLD',
        sellableSqYrd: 188.82,
        carpetSqYrd: 98.01,
        plc12mtr: 0,
        plc9mtr: 500,
        plcCorner: 500,
        plcParkFacing: 0,
        totalPlc: 1000,
        discountedPlc: 750,
        otmc: 250,
        gstOnOtherCharges: 33987.07,
        totalCost: 1449926,
        dimensions: '28x60',
        sizeSqft: 1699.38,
        confidence: 0.94,
        polygonPoints: [{ x: 160, y: 50 }, { x: 260, y: 50 }, { x: 260, y: 130 }, { x: 160, y: 130 }]
      },
      {
        plotNo: 'E5-83',
        status: 'AVAILABLE',
        sellableSqYrd: 201.28,
        carpetSqYrd: 104.48,
        plc12mtr: 0,
        plc9mtr: 0,
        plcCorner: 0,
        plcParkFacing: 0,
        totalPlc: 0,
        discountedPlc: 0,
        otmc: 250,
        gstOnOtherCharges: 9057.69,
        totalCost: 1367510,
        dimensions: '30x60',
        sizeSqft: 1811.5,
        confidence: 0.88,
        polygonPoints: [{ x: 270, y: 50 }, { x: 380, y: 50 }, { x: 380, y: 130 }, { x: 270, y: 130 }]
      },
      {
        plotNo: 'E5-86',
        status: 'AVAILABLE',
        sellableSqYrd: 201.28,
        carpetSqYrd: 104.48,
        plc12mtr: 0,
        plc9mtr: 0,
        plcCorner: 500,
        plcParkFacing: 500,
        totalPlc: 500,
        discountedPlc: 500,
        otmc: 250,
        gstOnOtherCharges: 27173.07,
        totalCost: 1486266,
        dimensions: '30x60',
        sizeSqft: 1811.5,
        confidence: 0.95,
        polygonPoints: [{ x: 390, y: 50 }, { x: 510, y: 50 }, { x: 510, y: 140 }, { x: 390, y: 140 }]
      },
      {
        plotNo: 'E5-94',
        status: 'SOLD',
        sellableSqYrd: 202.85,
        carpetSqYrd: 105.29,
        plc12mtr: 0,
        plc9mtr: 500,
        plcCorner: 500,
        plcParkFacing: 0,
        totalPlc: 1000,
        discountedPlc: 750,
        otmc: 250,
        gstOnOtherCharges: 36512.77,
        totalCost: 1557675,
        ownerName: 'Surya Prakash',
        dimensions: '30x61',
        sizeSqft: 1825.65,
        confidence: 0.85,
        polygonPoints: [{ x: 50, y: 160 }, { x: 150, y: 160 }, { x: 150, y: 240 }, { x: 50, y: 240 }]
      }
    ];
  }

  // Attach a bounding-box rectangle to every plot so the canvas can always draw
  // it, even if only polygon points (or nothing) were provided.
  extractedPlots = extractedPlots.map((p) => {
    const points = p.polygonPoints || p.polygon?.points || [];
    return { ...p, coordinates: bboxFromPoints(points) };
  });

  const plotMapRecord = await PlotMap.create({
    projectId,
    mapName: mapName || fileName || 'Site Layout Plan',
    imageUrl: s3ImageUrl,
    vectorOverlayData: extractedPlots,
    confidenceScore: overallConfidence,
    status: overallConfidence < 0.90 ? 'PENDING_REVIEW' : 'APPROVED'
  });

  return {
    mapId: plotMapRecord._id,
    mapName: plotMapRecord.mapName,
    imageUrl: plotMapRecord.imageUrl,
    confidenceScore: overallConfidence,
    requiresHumanReview: overallConfidence < 0.90,
    usedAI,
    isSample,
    extractedPlots
  };
}

/** Axis-aligned bounding box for a polygon (canvas rectangle fallback). */
function bboxFromPoints(points) {
  if (!Array.isArray(points) || points.length === 0) {
    return { x: 50, y: 50, width: 120, height: 90 };
  }
  const xs = points.map((p) => Number(p.x) || 0);
  const ys = points.map((p) => Number(p.y) || 0);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  return { x: minX, y: minY, width: (Math.max(...xs) - minX) || 120, height: (Math.max(...ys) - minY) || 90 };
}

module.exports = {
  processMapImageOCR
};
