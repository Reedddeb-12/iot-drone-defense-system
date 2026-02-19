// Camera Routes
const express = require('express');
const router = express.Router();
const {
    createCamera,
    getCameras,
    getCameraById,
    updateCamera,
    deleteCamera,
    updateCameraStatus
} = require('../controllers/camera.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(getCameras)
    .post(createCamera);

router.route('/:id')
    .get(getCameraById)
    .put(updateCamera)
    .delete(deleteCamera);

router.put('/:id/status', updateCameraStatus);

module.exports = router;
