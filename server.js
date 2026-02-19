// Backend Server for Mobile Notifications
// Run with: node server.js

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('.'));

// Configuration (Replace with your actual credentials)
const CONFIG = {
    // Email Configuration (Gmail example)
    email: {
        service: 'gmail',
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        password: process.env.EMAIL_PASSWORD || 'your-app-password'
    },
    
    // Twilio Configuration for SMS
    twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID || 'your-twilio-account-sid',
        authToken: process.env.TWILIO_AUTH_TOKEN || 'your-twilio-auth-token',
        phoneNumber: process.env.TWILIO_PHONE || '+1234567890'
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

// Initialize Twilio client
const twilioClient = twilio(CONFIG.twilio.accountSid, CONFIG.twilio.authToken);

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
        
        console.log('Email sent:', info.messageId);
        res.json({ 
            success: true, 
            messageId: info.messageId,
            message: 'Email sent successfully'
        });

    } catch (error) {
        console.error('Email error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Send SMS Alert
app.post('/api/send-sms', async (req, res) => {
    try {
        const { to, message } = req.body;

        if (!to || !message) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required fields' 
            });
        }

        const smsMessage = await twilioClient.messages.create({
            body: message,
            from: CONFIG.twilio.phoneNumber,
            to: to
        });

        console.log('SMS sent:', smsMessage.sid);
        res.json({ 
            success: true, 
            sid: smsMessage.sid,
            message: 'SMS sent successfully'
        });

    } catch (error) {
        console.error('SMS error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Send both Email and SMS
app.post('/api/send-alert', async (req, res) => {
    try {
        const { email, phone, threatData, snapshot } = req.body;

        const results = {
            email: { success: false },
            sms: { success: false }
        };

        // Prepare alert message
        const subject = `🚨 THREAT ALERT: ${threatData.threatType.toUpperCase()} Detected`;
        const emailBody = `
THREAT DETECTION ALERT

Time: ${new Date(threatData.timestamp).toLocaleString()}
Threat Type: ${threatData.threatType}
Confidence: ${threatData.confidence}%
Severity: ${threatData.severity}
Location: ${threatData.location}

A snapshot has been attached to this email.
Please review immediately.

- Drone Defense System
        `;

        const smsBody = `🚨 THREAT ALERT: ${threatData.threatType} detected with ${threatData.confidence}% confidence at ${new Date(threatData.timestamp).toLocaleTimeString()}. Check your email for snapshot.`;

        // Send Email
        if (email) {
            try {
                const mailOptions = {
                    from: CONFIG.email.user,
                    to: email,
                    subject: subject,
                    text: emailBody,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <div style="background: linear-gradient(135deg, #1a472a, #2d5a3d); padding: 20px; border-radius: 10px 10px 0 0;">
                                <h1 style="color: #00ff88; margin: 0;">🚨 THREAT ALERT</h1>
                            </div>
                            <div style="background: #f5f5f5; padding: 20px; border-radius: 0 0 10px 10px;">
                                <pre style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #ff4444;">${emailBody}</pre>
                                <h3>Threat Snapshot:</h3>
                                <img src="cid:snapshot" style="max-width: 100%; border-radius: 5px; border: 2px solid #1a472a;" />
                                <p style="color: #666; font-size: 12px; margin-top: 20px;">
                                    This is an automated alert from your Drone Defense System.
                                </p>
                            </div>
                        </div>
                    `,
                    attachments: [{
                        filename: 'threat-snapshot.jpg',
                        content: snapshot.split(',')[1],
                        encoding: 'base64',
                        cid: 'snapshot'
                    }]
                };

                const info = await emailTransporter.sendMail(mailOptions);
                results.email = { success: true, messageId: info.messageId };
                console.log('Email sent:', info.messageId);
            } catch (error) {
                console.error('Email error:', error);
                results.email = { success: false, error: error.message };
            }
        }

        // Send SMS
        if (phone) {
            try {
                const smsMessage = await twilioClient.messages.create({
                    body: smsBody,
                    from: CONFIG.twilio.phoneNumber,
                    to: phone
                });

                results.sms = { success: true, sid: smsMessage.sid };
                console.log('SMS sent:', smsMessage.sid);
            } catch (error) {
                console.error('SMS error:', error);
                results.sms = { success: false, error: error.message };
            }
        }

        res.json({ 
            success: results.email.success || results.sms.success,
            results: results
        });

    } catch (error) {
        console.error('Alert error:', error);
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
        sms: CONFIG.twilio.accountSid !== 'your-twilio-account-sid',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║   Drone Defense System - Backend Server                   ║
╚════════════════════════════════════════════════════════════╝

Server running on: http://localhost:${PORT}
API Endpoints:
  - GET  /api/test        - Test server
  - GET  /api/health      - Health check
  - POST /api/send-email  - Send email alert
  - POST /api/send-sms    - Send SMS alert
  - POST /api/send-alert  - Send both email & SMS

Configuration Status:
  Email: ${CONFIG.email.user !== 'your-email@gmail.com' ? '✓ Configured' : '✗ Not configured'}
  SMS:   ${CONFIG.twilio.accountSid !== 'your-twilio-account-sid' ? '✓ Configured' : '✗ Not configured'}

⚠️  IMPORTANT: Update credentials in server.js or use environment variables
    `);
});

// Error handling
process.on('unhandledRejection', (error) => {
    console.error('Unhandled rejection:', error);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
});
