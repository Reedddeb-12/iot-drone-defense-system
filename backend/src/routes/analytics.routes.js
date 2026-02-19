// Analytics Routes
const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getThreatTrends,
    getCameraPerformance,
    getHeatmapData
} = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/trends', getThreatTrends);
router.get('/camera-performance', getCameraPerformance);
router.get('/heatmap', getHeatmapData);

module.exports = router;
