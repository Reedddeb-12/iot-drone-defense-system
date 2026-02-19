// IoT Device Routes
const express = require('express');
const router = express.Router();
const {
    registerDevice,
    getDevices,
    updateDeviceStatus,
    sendCommand
} = require('../controllers/device.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/register', registerDevice);
router.get('/', getDevices);
router.put('/:deviceId/status', updateDeviceStatus);
router.post('/:deviceId/command', sendCommand);

module.exports = router;
