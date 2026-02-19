// Alert Routes
const express = require('express');
const router = express.Router();
const {
    getAlerts,
    getAlertById,
    markAsRead,
    deleteAlert
} = require('../controllers/alert.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getAlerts);
router.get('/:id', getAlertById);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteAlert);

module.exports = router;
