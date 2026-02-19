// Notification Routes
const express = require('express');
const router = express.Router();
const {
    sendEmailNotification,
    sendSMSNotification,
    testNotifications
} = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/email', sendEmailNotification);
router.post('/sms', sendSMSNotification);
router.post('/test', testNotifications);

module.exports = router;
