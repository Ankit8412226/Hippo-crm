const express = require('express');
const router = express.Router();
const multer = require('multer');

const authController = require('../controllers/authController');
const employeeController = require('../controllers/employeeController');
const mlmController = require('../controllers/mlmController');
const projectController = require('../controllers/projectController');
const plotController = require('../controllers/plotController');
const plotMapController = require('../controllers/plotMapController');
const ocrController = require('../controllers/ocrController');
const commissionController = require('../controllers/commissionController');
const payoutController = require('../controllers/payoutController');
const dashboardController = require('../controllers/dashboardController');
const notificationController = require('../controllers/notificationController');
const reportController = require('../controllers/reportController');

const { protect, authorize } = require('../middleware/auth');
const { rateLimit } = require('../middleware/rateLimit');
const { validate } = require('../middleware/validate');

const upload = multer({ storage: multer.memoryStorage() });

const ROLES = ['ADMIN', 'MANAGER', 'EMPLOYEE', 'AGENT', 'DIRECTOR'];
const PLOT_STATUSES = ['AVAILABLE', 'BOOKED', 'PENDING', 'SOLD'];

// Throttle auth endpoints to blunt brute-force / credential stuffing.
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many attempts, please try again later.' });

// --- Auth Routes ---
router.post('/auth/register', authLimiter, validate({
  fullName: { required: true, type: 'string', minLength: 2, maxLength: 80 },
  email: { required: true, type: 'email' },
  password: { required: true, type: 'string', minLength: 6, maxLength: 128 },
  phone: { type: 'string', maxLength: 20 }
}), authController.register);
router.post('/auth/login', authLimiter, validate({
  email: { required: true, type: 'email' },
  password: { required: true, type: 'string' }
}), authController.login);
router.get('/auth/me', protect, authController.getMe);

// --- Employee / Agent CRUD & MLM Routes ---
router.get('/employees', protect, employeeController.getEmployees);
router.post('/employees', protect, validate({
  fullName: { required: true, type: 'string', minLength: 2, maxLength: 80 },
  email: { required: true, type: 'email' },
  phone: { type: 'string', maxLength: 20 },
  password: { type: 'string', minLength: 6, maxLength: 128 },
  role: { type: 'string', enum: ROLES },
  parentId: { type: 'objectId' }
}), employeeController.createEmployee);
router.get('/employees/:id', protect, employeeController.getEmployeeById);
router.put('/employees/:id', protect, validate({
  fullName: { type: 'string', minLength: 2, maxLength: 80 },
  phone: { type: 'string', maxLength: 20 },
  currentRank: { type: 'string' },
  parentId: { type: 'objectId' }
}), employeeController.updateEmployee);
router.delete('/employees/:id', protect, authorize('ADMIN'), employeeController.deleteEmployee);
router.post('/employees/:id/evaluate-rank', protect, authorize('ADMIN', 'DIRECTOR'), employeeController.updateEmployeeRank);

router.get('/mlm/tree', protect, mlmController.getTree);
router.get('/mlm/rank-rules', protect, mlmController.getRankRules);
router.get('/mlm/summary', protect, authorize('ADMIN', 'DIRECTOR'), mlmController.getMLMSummary);
router.post('/mlm/evaluate-rank/:employeeId', protect, authorize('ADMIN', 'DIRECTOR'), mlmController.evaluateRank);

// --- Projects & Settings CRUD Routes ---
router.get('/projects', protect, projectController.getProjects);
router.post('/projects', protect, authorize('ADMIN', 'DIRECTOR'), validate({
  name: { required: true, type: 'string', minLength: 2, maxLength: 120 },
  code: { required: true, type: 'string', minLength: 2, maxLength: 30 },
  location: { required: true, type: 'string' },
  totalAreaSqft: { required: true, type: 'number', min: 0 },
  basePricePerSqft: { required: true, type: 'number', min: 0 }
}), projectController.createProject);
router.get('/projects/:id', protect, projectController.getProjectById);
router.put('/projects/:id', protect, authorize('ADMIN', 'DIRECTOR'), validate({
  name: { type: 'string', minLength: 2, maxLength: 120 },
  code: { type: 'string', minLength: 2, maxLength: 30 },
  totalAreaSqft: { type: 'number', min: 0 },
  basePricePerSqft: { type: 'number', min: 0 }
}), projectController.updateProject);
router.delete('/projects/:id', protect, authorize('ADMIN'), projectController.deleteProject);
router.put('/projects/:projectId/settings', protect, authorize('ADMIN'), projectController.updateProjectSettings);

// --- Plot Management & Sales Routes ---
router.get('/plots', protect, plotController.getPlots);
router.get('/plots/export-csv', protect, authorize('ADMIN', 'DIRECTOR', 'MANAGER'), plotController.exportPlotsCSV);
router.post('/plots/compute-price', protect, authorize('ADMIN', 'DIRECTOR', 'MANAGER'), plotController.computePricePreview);
router.post('/plots/import-csv', protect, authorize('ADMIN', 'DIRECTOR'), validate({
  projectId: { required: true, type: 'objectId' },
  plotsData: { required: true, type: 'array' }
}), plotController.importPlotsCSV);
router.get('/plots/:id', protect, plotController.getPlotById);
router.put('/plots/:id/status', protect, validate({
  status: { required: true, type: 'string', enum: PLOT_STATUSES },
  ownerEmail: { type: 'email' },
  sellerEmployeeId: { type: 'objectId' },
  paidAmount: { type: 'number', min: 0 }
}), plotController.updatePlotStatus);
router.post('/plots/:plotId/documents', protect, plotController.uploadPlotDocument);

// --- Plot Map & OCR Pipeline Routes ---
router.get('/plot-maps', protect, plotMapController.getPlotMaps);
router.get('/plot-maps/:id', protect, plotMapController.getPlotMapById);
router.post('/ocr/analyze', protect, authorize('ADMIN', 'DIRECTOR'), upload.single('file'), ocrController.analyzeMap);
router.post('/ocr/approve/:mapId', protect, authorize('ADMIN', 'DIRECTOR'), ocrController.approveMapOverlay);
router.post('/ocr/reject/:mapId', protect, authorize('ADMIN', 'DIRECTOR'), ocrController.rejectMapOverlay);

// --- Commission & Payout Routes ---
router.get('/commissions', protect, commissionController.getCommissions);
router.get('/commissions/summary', protect, authorize('ADMIN', 'DIRECTOR'), commissionController.getCommissionSummary);

router.get('/payouts', protect, payoutController.getPayouts);
router.post('/payouts/request', protect, validate({
  employeeId: { type: 'objectId' }
}), payoutController.requestPayout);
router.post('/payouts/:id/approve', protect, authorize('ADMIN', 'DIRECTOR'), payoutController.approvePayout);

// --- Reports (admin / director only) ---
router.get('/reports/commission-audit', protect, authorize('ADMIN', 'DIRECTOR'), reportController.commissionAuditReport);
router.get('/reports/revenue', protect, authorize('ADMIN', 'DIRECTOR'), reportController.revenueReport);
router.get('/reports/mlm-performance', protect, authorize('ADMIN', 'DIRECTOR'), reportController.mlmPerformanceReport);
router.get('/reports/payout-summary', protect, authorize('ADMIN', 'DIRECTOR'), reportController.payoutSummaryReport);
router.get('/reports/plot-ledger', protect, authorize('ADMIN', 'DIRECTOR'), reportController.plotLedgerReport);

// --- Executive Dashboard & Notifications ---
router.get('/dashboard/stats', protect, authorize('ADMIN', 'DIRECTOR'), dashboardController.getDashboardStats);
router.get('/notifications', protect, notificationController.getNotifications);
router.put('/notifications/:id/read', protect, notificationController.markAsRead);

module.exports = router;
