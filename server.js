// Backend Server for Email Notifications
// Run with: node server.js

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('.'));

// Get local IP address
function getLocalIPAddress() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Skip internal and non-IPv4 addresses
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

// Configuration (Replace with your actual credentials)
const CONFIG = {
    // Email Configuration (Gmail example)
    email: {
        service: 'gmail',
        user: process.env.EMAIL_USER || 'reeddhijitdeb@gmail.com',
        password: process.env.EMAIL_PASSWORD || 'xxvypgyhkyxdhasy'
    }
};

// Initialize email transporter
const emailTransporter = nodemailer.createTransport({
    service: CONFIG.email.service,
    auth: {
        user: CONFIG.email.user,
        pass: CONFIG.email.password
    }
});

console.log('✅ Email service configured');

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ 
        status: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Send Email Alert
app.post('/api/send-email', async (req, res) => {
    try {
        const { to, subject, html, body, snapshot, threatLevel } = req.body;

        if (!to || !subject) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required fields' 
            });
        }

        // Determine threat level color
        const threatColors = {
            'CRITICAL': '#ff0000',
            'HIGH': '#ff6600',
            'MEDIUM': '#ffaa00',
            'LOW': '#00ff88'
        };
        const levelColor = threatColors[threatLevel] || '#ffaa00';

        // Prepare email with snapshot attachment
        const mailOptions = {
            from: `"🚁 Drone Defense System" <${CONFIG.email.user}>`,
            to: to,
            subject: subject,
            text: body || 'Threat detected - see HTML version',
            html: html || `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #1a472a, #2d5a3d); padding: 20px; border-radius: 10px 10px 0 0;">
                        <h1 style="color: #00ff88; margin: 0;">🚨 THREAT ALERT</h1>
                        ${threatLevel ? `<h2 style="color: ${levelColor}; margin: 10px 0;">${threatLevel} THREAT</h2>` : ''}
                    </div>
                    <div style="background: #f5f5f5; padding: 20px; border-radius: 0 0 10px 10px;">
                        <pre style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid ${levelColor};">${body || 'Threat detected'}</pre>
                        ${snapshot ? '<h3>Threat Snapshot:</h3><img src="cid:threat-snapshot" style="max-width: 100%; border-radius: 5px; border: 2px solid ' + levelColor + ';" />' : ''}
                        <p style="color: #666; font-size: 12px; margin-top: 20px;">
                            This is an automated alert from your Drone Defense System.
                        </p>
                    </div>
                </div>
            `,
            attachments: snapshot ? [{
                filename: `threat-${Date.now()}.jpg`,
                content: snapshot.split(',')[1] || snapshot,
                encoding: 'base64',
                cid: 'threat-snapshot'
            }] : []
        };

        const info = await emailTransporter.sendMail(mailOptions);
        
        console.log('✅ Email sent:', info.messageId);
        res.json({ 
            success: true, 
            messageId: info.messageId,
            message: 'Email sent successfully'
        });

    } catch (error) {
        console.error('❌ Email error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        email: CONFIG.email.user !== 'your-email@gmail.com',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    const localIP = getLocalIPAddress();
    console.log(`
╔════════════════════════════════════════════════════════════╗
║   Drone Defense System - Email Alert Server               ║
╚════════════════════════════════════════════════════════════╝

Server running on:
  Local:    http://localhost:${PORT}
  Network:  http://${localIP}:${PORT}

API Endpoints:
  - GET  /api/test        - Test server
  - GET  /api/health      - Health check
  - POST /api/send-email  - Send email alert

Configuration Status:
  Email: ${CONFIG.email.user !== 'your-email@gmail.com' ? '✓ Configured' : '✗ Not configured'}

⚠️  IMPORTANT: 
  - Update email credentials in server.js or use environment variables
  - To access from other devices, use: http://${localIP}:${PORT}
  - Make sure firewall allows port ${PORT}
    `);
});

// Error handling
process.on('unhandledRejection', (error) => {
    console.error('Unhandled rejection:', error);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
});
