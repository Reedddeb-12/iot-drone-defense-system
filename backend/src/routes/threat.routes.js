// Threat Routes
const express = require('express');
const router = express.Router();
const {
    createThreat,
    getThreats,
    getThreatById,
    updateThreatStatus,
    deleteThreat,
    getThreatsNearLocation
} = require('../controllers/threat.controller');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Protect all routes
router.use(protect);

router.route('/')
    .get(getThreats)
    .post(upload.fields([{ name: 'snapshot', maxCount: 1 }]), createThreat);

router.get('/nearby', getThreatsNearLocation);

router.route('/:id')
    .get(getThreatById)
    .put(updateThreatStatus)
    .delete(deleteThreat);

module.exports = router;
