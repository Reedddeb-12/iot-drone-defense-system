// Threat Controller
const Threat = require('../models/Threat.model');
const Camera = require('../models/Camera.model');
const { uploadToS3 } = require('../services/storage.service');
const { sendAlert } = require('../services/notification.service');
const logger = require('../config/logger');

// Create new threat
exports.createThreat = async (req, res, next) => {
    try {
        const {
            cameraId,
            type,
            subType,
            confidence,
            severity,
            location,
            boundingBox,
            metadata
        } = req.body;

        // Verify camera exists
        const camera = await Camera.findById(cameraId);
        if (!camera) {
            return res.status(404).json({
                success: false,
                message: 'Camera not found'
            });
        }

        // Upload snapshot if provided
        let snapshotData = null;
        if (req.files && req.files.snapshot) {
            snapshotData = await uploadToS3(req.files.snapshot[0], 'snapshots');
        }

        // Create threat
        const threat = await Threat.create({
            camera: cameraId,
            user: req.user.id,
            type,
            subType,
            confidence,
            severity,
            location,
            boundingBox,
            snapshot: snapshotData,
            metadata
        });

        // Update camera statistics
        camera.statistics.totalDetections += 1;
        if (severity === 'HIGH' || severity === 'CRITICAL') {
            camera.statistics.totalThreats += 1;
        }
        camera.statistics.lastDetection = new Date();
        await camera.save();

        // Send alerts based on user preferences
        await sendAlert(req.user, threat);

        // Emit real-time event via Socket.IO
        const io = req.app.get('io');
        io.to(`user-${req.user.id}`).emit('threat-detected', threat);

        logger.info(`Threat created: ${threat._id} by user ${req.user.id}`);

        res.status(201).json({
            success: true,
            data: threat
        });

    } catch (error) {
        logger.error('Create threat error:', error);
        next(error);
    }
};

// Get all threats
exports.getThreats = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 20,
            severity,
            status,
            type,
            cameraId,
            startDate,
            endDate
        } = req.query;

        // Build query
        const query = { user: req.user.id };

        if (severity) query.severity = severity;
        if (status) query.status = status;
        if (type) query.type = type;
        if (cameraId) query.camera = cameraId;

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        // Execute query with pagination
        const threats = await Threat.find(query)
            .populate('camera', 'name deviceId location')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Threat.countDocuments(query);

        res.json({
            success: true,
            data: threats,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        });

    } catch (error) {
        logger.error('Get threats error:', error);
        next(error);
    }
};

// Get threat by ID
exports.getThreatById = async (req, res, next) => {
    try {
        const threat = await Threat.findById(req.params.id)
            .populate('camera')
            .populate('resolution.resolvedBy', 'name email');

        if (!threat) {
            return res.status(404).json({
                success: false,
                message: 'Threat not found'
            });
        }

        // Check ownership
        if (threat.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this threat'
            });
        }

        res.json({
            success: true,
            data: threat
        });

    } catch (error) {
        logger.error('Get threat by ID error:', error);
        next(error);
    }
};

// Update threat status
exports.updateThreatStatus = async (req, res, next) => {
    try {
        const { status, notes, action } = req.body;

        const threat = await Threat.findById(req.params.id);

        if (!threat) {
            return res.status(404).json({
                success: false,
                message: 'Threat not found'
            });
        }

        // Check ownership
        if (threat.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this threat'
            });
        }

        threat.status = status;
        if (status === 'resolved' || status === 'false-positive') {
            threat.resolution = {
                resolvedBy: req.user.id,
                resolvedAt: new Date(),
                notes,
                action
            };
        }

        await threat.save();

        logger.info(`Threat ${threat._id} status updated to ${status}`);

        res.json({
            success: true,
            data: threat
        });

    } catch (error) {
        logger.error('Update threat status error:', error);
        next(error);
    }
};

// Delete threat
exports.deleteThreat = async (req, res, next) => {
    try {
        const threat = await Threat.findById(req.params.id);

        if (!threat) {
            return res.status(404).json({
                success: false,
                message: 'Threat not found'
            });
        }

        // Check ownership or admin
        if (threat.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this threat'
            });
        }

        await threat.deleteOne();

        logger.info(`Threat ${threat._id} deleted by user ${req.user.id}`);

        res.json({
            success: true,
            message: 'Threat deleted successfully'
        });

    } catch (error) {
        logger.error('Delete threat error:', error);
        next(error);
    }
};

// Get threats near location
exports.getThreatsNearLocation = async (req, res, next) => {
    try {
        const { longitude, latitude, radius = 1000 } = req.query; // radius in meters

        if (!longitude || !latitude) {
            return res.status(400).json({
                success: false,
                message: 'Longitude and latitude are required'
            });
        }

        const threats = await Threat.find({
            user: req.user.id,
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    $maxDistance: parseInt(radius)
                }
            }
        }).populate('camera', 'name deviceId');

        res.json({
            success: true,
            data: threats,
            count: threats.length
        });

    } catch (error) {
        logger.error('Get threats near location error:', error);
        next(error);
    }
};
