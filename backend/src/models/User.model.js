// User Model
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false
    },
    phone: {
        type: String,
        match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid phone number']
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'operator'],
        default: 'user'
    },
    organization: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    phoneVerified: {
        type: Boolean,
        default: false
    },
    preferences: {
        emailAlerts: { type: Boolean, default: true },
        smsAlerts: { type: Boolean, default: false },
        pushAlerts: { type: Boolean, default: true },
        voiceAlerts: { type: Boolean, default: false }
    },
    lastLogin: {
        type: Date
    },
    refreshToken: {
        type: String,
        select: false
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
    return jwt.sign(
        { id: this._id, email: this.email, role: this.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

// Generate refresh token
userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        { id: this._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRE }
    );
};

module.exports = mongoose.model('User', userSchema);
