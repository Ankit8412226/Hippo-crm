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

const { protect, authorize } = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage() });

// --- Auth Routes ---
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', protect, authController.getMe);

// --- Employee / Agent CRUD & MLM Routes ---
router.get('/employees', protect, employeeController.getEmployees);
router.post('/employees', protect, employeeController.createEmployee);
router.get('/employees/:id', protect, employeeController.getEmployeeById);
router.put('/employees/:id', protect, employeeController.updateEmployee);
router.delete('/employees/:id', protect, employeeController.deleteEmployee);
router.post('/employees/:id/evaluate-rank', protect, employeeController.updateEmployeeRank);

router.get('/mlm/tree', protect, mlmController.getTree);
router.get('/mlm/rank-rules', protect, mlmController.getRankRules);
router.get('/mlm/summary', protect, authorize('ADMIN', 'DIRECTOR'), mlmController.getMLMSummary);
router.post('/mlm/evaluate-rank/:employeeId', protect, mlmController.evaluateRank);

// --- Projects & Settings CRUD Routes ---
router.get('/projects', protect, projectController.getProjects);
router.post('/projects', protect, authorize('ADMIN', 'DIRECTOR'), projectController.createProject);
router.get('/projects/:id', protect, projectController.getProjectById);
router.put('/projects/:id', protect, authorize('ADMIN', 'DIRECTOR'), projectController.updateProject);
router.delete('/projects/:id', protect, authorize('ADMIN'), projectController.deleteProject);
router.put('/projects/:projectId/settings', protect, authorize('ADMIN'), projectController.updateProjectSettings);

// --- Plot Management & Sales Routes ---
router.get('/plots', protect, plotController.getPlots);
router.get('/plots/export-csv', protect, authorize('ADMIN', 'DIRECTOR', 'MANAGER'), plotController.exportPlotsCSV);
router.post('/plots/import-csv', protect, authorize('ADMIN', 'DIRECTOR'), plotController.importPlotsCSV);
router.get('/plots/:id', protect, plotController.getPlotById);
router.put('/plots/:id/status', protect, plotController.updatePlotStatus);
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
router.post('/payouts/request', protect, payoutController.requestPayout);
router.post('/payouts/:id/approve', protect, authorize('ADMIN', 'DIRECTOR'), payoutController.approvePayout);

// --- Executive Dashboard & Notifications ---
router.get('/dashboard/stats', protect, authorize('ADMIN', 'DIRECTOR'), dashboardController.getDashboardStats);
router.get('/notifications', protect, notificationController.getNotifications);
router.put('/notifications/:id/read', protect, notificationController.markAsRead);

module.exports = router;
