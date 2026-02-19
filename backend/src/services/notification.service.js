// Notification Service
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const Alert = require('../models/Alert.model');
const logger = require('../config/logger');

// Initialize email transporter
const emailTransporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Initialize Twilio client
const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

// Send alert to user
exports.sendAlert = async (user, threat) => {
    const results = {
        email: false,
        sms: false,
        push: false
    };

    try {
        // Send email if enabled
        if (user.preferences.emailAlerts && user.email) {
            results.email = await this.sendEmailAlert(user, threat);
        }

        // Send SMS if enabled
        if (user.preferences.smsAlerts && user.phone) {
            results.sms = await this.sendSMSAlert(user, threat);
        }

        // Send push notification if enabled
        if (user.preferences.pushAlerts) {
            results.push = await this.sendPushNotification(user, threat);
        }

        return results;

    } catch (error) {
        logger.error('Send alert error:', error);
        return results;
    }
};

// Send email alert
exports.sendEmailAlert = async (user, threat) => {
    try {
        const subject = `🚨 THREAT ALERT: ${threat.type.toUpperCase()} Detected`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #1a472a, #2d5a3d); padding: 20px; border-radius: 10px 10px 0 0;">
                    <h1 style="color: #00ff88; margin: 0;">🚨 THREAT ALERT</h1>
                </div>
                <div style="background: #f5f5f5; padding: 20px; border-radius: 0 0 10px 10px;">
                    <h2>Threat Detected</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Type:</strong></td>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${threat.type}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Confidence:</strong></td>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${threat.confidence}%</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Severity:</strong></td>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd; color: ${threat.severity === 'HIGH' ? '#ff4444' : '#ff8800'};">${threat.severity}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Time:</strong></td>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${new Date(threat.createdAt).toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px;"><strong>Location:</strong></td>
                            <td style="padding: 10px;">${threat.location.coordinates[1]}, ${threat.location.coordinates[0]}</td>
                        </tr>
                    </table>
                    ${threat.snapshot ? `<img src="${threat.snapshot.url}" style="max-width: 100%; margin-top: 20px; border-radius: 5px;" />` : ''}
                    <p style="color: #666; font-size: 12px; margin-top: 20px;">
                        This is an automated alert from your Drone Defense System.
                    </p>
                </div>
            </div>
        `;

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: subject,
            html: html
        };

        const info = await emailTransporter.sendMail(mailOptions);

        // Log alert
        await Alert.create({
            threat: threat._id,
            user: user._id,
            camera: threat.camera,
            type: 'email',
            status: 'sent',
            recipient: user.email,
            subject: subject,
            message: html,
            metadata: {
                provider: 'nodemailer',
                messageId: info.messageId
            }
        });

        logger.info(`Email alert sent to ${user.email}`);
        return true;

    } catch (error) {
        logger.error('Email alert error:', error);
        
        // Log failed alert
        await Alert.create({
            threat: threat._id,
            user: user._id,
            camera: threat.camera,
            type: 'email',
            status: 'failed',
            recipient: user.email,
            message: 'Failed to send email',
            metadata: {
                errorMessage: error.message
            }
        });

        return false;
    }
};

// Send SMS alert
exports.sendSMSAlert = async (user, threat) => {
    try {
        const message = `🚨 THREAT ALERT: ${threat.type} detected with ${threat.confidence}% confidence at ${new Date(threat.createdAt).toLocaleTimeString()}. Severity: ${threat.severity}. Check your email for details.`;

        const sms = await twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: user.phone
        });

        // Log alert
        await Alert.create({
            threat: threat._id,
            user: user._id,
            camera: threat.camera,
            type: 'sms',
            status: 'sent',
            recipient: user.phone,
            message: message,
            metadata: {
                provider: 'twilio',
                messageId: sms.sid
            }
        });

        logger.info(`SMS alert sent to ${user.phone}`);
        return true;

    } catch (error) {
        logger.error('SMS alert error:', error);
        
        // Log failed alert
        await Alert.create({
            threat: threat._id,
            user: user._id,
            camera: threat.camera,
            type: 'sms',
            status: 'failed',
            recipient: user.phone,
            message: 'Failed to send SMS',
            metadata: {
                errorMessage: error.message
            }
        });

        return false;
    }
};

// Send push notification
exports.sendPushNotification = async (user, threat) => {
    try {
        // Implement push notification logic here
        // This would typically use Firebase Cloud Messaging or similar service
        
        logger.info(`Push notification sent to user ${user._id}`);
        return true;

    } catch (error) {
        logger.error('Push notification error:', error);
        return false;
    }
};
