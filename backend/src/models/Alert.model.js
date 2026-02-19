// Alert Model
const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    threat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Threat',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    camera: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Camera',
        required: true
    },
    type: {
        type: String,
        enum: ['email', 'sms', 'push', 'voice', 'webhook'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'failed', 'read'],
        default: 'pending'
    },
    recipient: {
        type: String,
        required: true
    },
    subject: String,
    message: {
        type: String,
        required: true
    },
    metadata: {
        provider: String, // e.g., 'twilio', 'sendgrid'
        messageId: String,
        errorMessage: String,
        deliveredAt: Date,
        readAt: Date
    },
    retryCount: {
        type: Number,
        default: 0
    },
    maxRetries: {
        type: Number,
        default: 3
    }
}, {
    timestamps: true
});

// Index for querying
alertSchema.index({ user: 1, createdAt: -1 });
alertSchema.index({ status: 1 });
alertSchema.index({ threat: 1 });

module.exports = mongoose.model('Alert', alertSchema);
