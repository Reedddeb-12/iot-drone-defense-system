// Camera Model
const mongoose = require('mongoose');

const cameraSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    deviceId: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        },
        address: String
    },
    status: {
        type: String,
        enum: ['online', 'offline', 'maintenance', 'error'],
        default: 'offline'
    },
    specifications: {
        resolution: String,
        frameRate: Number,
        fieldOfView: Number,
        nightVision: Boolean,
        audioEnabled: Boolean
    },
    battery: {
        level: {
            type: Number,
            min: 0,
            max: 100,
            default: 100
        },
        charging: {
            type: Boolean,
            default: false
        },
        lastCharged: Date
    },
    network: {
        type: {
            type: String,
            enum: ['wifi', '4g', '5g', 'ethernet'],
            default: 'wifi'
        },
        signalStrength: Number,
        ipAddress: String
    },
    settings: {
        detectionEnabled: {
            type: Boolean,
            default: true
        },
        recordingEnabled: {
            type: Boolean,
            default: false
        },
        motionSensitivity: {
            type: Number,
            min: 0,
            max: 100,
            default: 70
        },
        alertThreshold: {
            type: Number,
            min: 0,
            max: 100,
            default: 60
        }
    },
    statistics: {
        totalDetections: {
            type: Number,
            default: 0
        },
        totalThreats: {
            type: Number,
            default: 0
        },
        uptime: {
            type: Number,
            default: 0
        },
        lastDetection: Date
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastSeen: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Create geospatial index
cameraSchema.index({ location: '2dsphere' });

// Update lastSeen on any update
cameraSchema.pre('save', function(next) {
    this.lastSeen = new Date();
    next();
});

module.exports = mongoose.model('Camera', cameraSchema);
