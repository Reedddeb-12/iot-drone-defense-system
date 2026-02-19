// Threat Model
const mongoose = require('mongoose');

const threatSchema = new mongoose.Schema({
    camera: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Camera',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['person', 'vehicle', 'drone', 'airplane', 'bird', 'animal', 'unknown']
    },
    subType: {
        type: String // e.g., 'car', 'truck', 'motorcycle' for vehicle
    },
    confidence: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    severity: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
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
        }
    },
    boundingBox: {
        x: Number,
        y: Number,
        width: Number,
        height: Number
    },
    snapshot: {
        url: String,
        s3Key: String,
        size: Number,
        mimeType: String
    },
    videoClip: {
        url: String,
        s3Key: String,
        duration: Number,
        size: Number
    },
    metadata: {
        weather: {
            temperature: Number,
            windSpeed: Number,
            conditions: String
        },
        timeOfDay: String,
        lightLevel: String,
        movementDetected: Boolean,
        soundDetected: Boolean,
        soundLevel: Number
    },
    trajectory: [{
        position: {
            x: Number,
            y: Number
        },
        timestamp: Date,
        velocity: {
            x: Number,
            y: Number
        }
    }],
    status: {
        type: String,
        enum: ['active', 'resolved', 'false-positive', 'investigating'],
        default: 'active'
    },
    resolution: {
        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        resolvedAt: Date,
        notes: String,
        action: String
    },
    alertsSent: {
        email: { type: Boolean, default: false },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: false },
        voice: { type: Boolean, default: false }
    },
    isWhitelisted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Create geospatial index
threatSchema.index({ location: '2dsphere' });
threatSchema.index({ createdAt: -1 });
threatSchema.index({ camera: 1, createdAt: -1 });
threatSchema.index({ severity: 1, status: 1 });

module.exports = mongoose.model('Threat', threatSchema);
