// Mobile Notification System for Threat Alerts
class MobileNotificationSystem {
    constructor() {
        this.isEnabled = false;
        this.notificationMethods = {
            email: false,
            sms: false,
            push: false,
            websocket: false
        };
        this.userContacts = {
            email: '',
            phone: '',
            deviceToken: ''
        };
        this.alertHistory = [];
        this.cooldownPeriod = 30000; // 30 seconds between alerts
        this.lastAlertTime = 0;
        this.websocketConnection = null;
    }

    // Initialize notification system
    initialize(config = {}) {
        this.userContacts = {
            email: config.email || '',
            phone: config.phone || '',
            deviceToken: config.deviceToken || ''
        };

        this.notificationMethods = {
            email: config.enableEmail || false,
            sms: config.enableSMS || false,
            push: config.enablePush || false,
            websocket: config.enableWebSocket || false
        };

        this.isEnabled = Object.values(this.notificationMethods).some(v => v);

        if (this.isEnabled) {
            console.log('Mobile notification system initialized');
            this.requestPushPermission();
        }

        return this.isEnabled;
    }

    // Request push notification permission
    async requestPushPermission() {
        if ('Notification' in window && this.notificationMethods.push) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                console.log('Push notification permission granted');
                return true;
            } else {
                console.warn('Push notification permission denied');
                this.notificationMethods.push = false;
                return false;
            }
        }
        return false;
    }

    // Send threat alert with snapshot
    async sendThreatAlert(threat, snapshotBlob) {
        // Check cooldown period
        const now = Date.now();
        if (now - this.lastAlertTime < this.cooldownPeriod) {
            console.log('Alert cooldown active, skipping notification');
            return false;
        }

        if (!this.isEnabled) {
            console.warn('Mobile notification system not enabled');
            return false;
        }

        this.lastAlertTime = now;

        const alertData = {
            timestamp: new Date().toISOString(),
            threatType: threat.class,
            confidence: Math.round(threat.score * 100),
            severity: threat.severity || 'MEDIUM',
            location: 'Camera Feed',
            snapshot: snapshotBlob
        };

        // Send via enabled methods
        const results = {
            email: false,
            sms: false,
            push: false,
            websocket: false
        };

        if (this.notificationMethods.email) {
            results.email = await this.sendEmailAlert(alertData);
        }

        if (this.notificationMethods.sms) {
            results.sms = await this.sendSMSAlert(alertData);
        }

        if (this.notificationMethods.push) {
            results.push = await this.sendPushNotification(alertData);
        }

        if (this.notificationMethods.websocket) {
            results.websocket = await this.sendWebSocketAlert(alertData);
        }

        // Save to history
        this.alertHistory.push({
            ...alertData,
            sentVia: results,
            success: Object.values(results).some(v => v)
        });

        return results;
    }

    // Send email alert
    async sendEmailAlert(alertData) {
        if (!this.userContacts.email) {
            console.warn('No email address configured');
            return false;
        }

        try {
            // Convert blob to base64
            const base64Image = await this.blobToDataURL(alertData.snapshot);

            const subject = `🚨 THREAT ALERT: ${alertData.threatType.toUpperCase()} Detected`;
            const body = `
THREAT DETECTION ALERT

Time: ${new Date(alertData.timestamp).toLocaleString()}
Threat Type: ${alertData.threatType}
Confidence: ${alertData.confidence}%
Severity: ${alertData.severity}
Location: ${alertData.location}

A snapshot has been attached to this email.
Please review immediately.

- Drone Defense System
            `;

            // Call backend API
            const response = await fetch('http://localhost:3000/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: this.userContacts.email,
                    subject: subject,
                    body: body,
                    snapshot: base64Image
                })
            });

            const result = await response.json();
            
            if (result.success) {
                console.log('Email sent successfully:', result.messageId);
                this.showNotification('Email alert sent to ' + this.userContacts.email, 'success');
                return true;
            } else {
                console.error('Email failed:', result.error);
                this.showNotification('Email failed: ' + result.error, 'error');
                return false;
            }

        } catch (error) {
            console.error('Email alert failed:', error);
            this.showNotification('Email failed: Server not running. Start backend with "npm start"', 'error');
            return false;
        }
    }

    // Send SMS alert
    async sendSMSAlert(alertData) {
        if (!this.userContacts.phone) {
            console.warn('No phone number configured');
            return false;
        }

        try {
            const message = `🚨 THREAT ALERT: ${alertData.threatType} detected with ${alertData.confidence}% confidence at ${new Date(alertData.timestamp).toLocaleTimeString()}. Check your email for snapshot.`;

            // Call backend API
            const response = await fetch('http://localhost:3000/api/send-sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: this.userContacts.phone,
                    message: message
                })
            });

            const result = await response.json();
            
            if (result.success) {
                console.log('SMS sent successfully:', result.sid);
                this.showNotification('SMS alert sent to ' + this.userContacts.phone, 'success');
                return true;
            } else {
                console.error('SMS failed:', result.error);
                this.showNotification('SMS failed: ' + result.error, 'error');
                return false;
            }

        } catch (error) {
            console.error('SMS alert failed:', error);
            this.showNotification('SMS failed: Server not running. Start backend with "npm start"', 'error');
            return false;
        }
    }

    // Send push notification
    async sendPushNotification(alertData) {
        if (!('Notification' in window)) {
            console.warn('Push notifications not supported');
            return false;
        }

        if (Notification.permission !== 'granted') {
            console.warn('Push notification permission not granted');
            return false;
        }

        try {
            // Create notification with image
            const imageUrl = await this.blobToDataURL(alertData.snapshot);

            const notification = new Notification('🚨 Threat Detected!', {
                body: `${alertData.threatType} detected with ${alertData.confidence}% confidence`,
                icon: imageUrl,
                image: imageUrl,
                badge: imageUrl,
                tag: 'threat-alert',
                requireInteraction: true,
                vibrate: [200, 100, 200],
                data: alertData
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
            };

            console.log('Push notification sent');
            return true;

        } catch (error) {
            console.error('Push notification failed:', error);
            return false;
        }
    }

    // Send WebSocket alert to mobile app
    async sendWebSocketAlert(alertData) {
        try {
            if (!this.websocketConnection || this.websocketConnection.readyState !== WebSocket.OPEN) {
                console.warn('WebSocket not connected');
                return false;
            }

            const base64Image = await this.blobToBase64(alertData.snapshot);

            const message = {
                type: 'THREAT_ALERT',
                data: {
                    ...alertData,
                    snapshot: base64Image
                }
            };

            this.websocketConnection.send(JSON.stringify(message));
            console.log('WebSocket alert sent');
            return true;

        } catch (error) {
            console.error('WebSocket alert failed:', error);
            return false;
        }
    }

    // Connect to WebSocket server for mobile app
    connectWebSocket(url) {
        try {
            this.websocketConnection = new WebSocket(url);

            this.websocketConnection.onopen = () => {
                console.log('WebSocket connected for mobile notifications');
                this.notificationMethods.websocket = true;
            };

            this.websocketConnection.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.notificationMethods.websocket = false;
            };

            this.websocketConnection.onclose = () => {
                console.log('WebSocket disconnected');
                this.notificationMethods.websocket = false;
            };

            return true;
        } catch (error) {
            console.error('WebSocket connection failed:', error);
            return false;
        }
    }

    // Capture snapshot from video element
    captureSnapshot(videoElement) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

            // Add timestamp overlay
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(10, 10, 300, 40);
            ctx.fillStyle = '#00ff88';
            ctx.font = 'bold 16px Arial';
            ctx.fillText(new Date().toLocaleString(), 20, 35);

            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg', 0.9);
        });
    }

    // Convert blob to base64
    blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    // Convert blob to data URL
    blobToDataURL(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    // Update user contacts
    updateContacts(contacts) {
        this.userContacts = {
            ...this.userContacts,
            ...contacts
        };
        console.log('User contacts updated');
    }

    // Enable/disable notification methods
    setNotificationMethod(method, enabled) {
        if (this.notificationMethods.hasOwnProperty(method)) {
            this.notificationMethods[method] = enabled;
            this.isEnabled = Object.values(this.notificationMethods).some(v => v);
            console.log(`${method} notifications ${enabled ? 'enabled' : 'disabled'}`);
        }
    }

    // Set cooldown period
    setCooldownPeriod(milliseconds) {
        this.cooldownPeriod = milliseconds;
        console.log(`Alert cooldown set to ${milliseconds}ms`);
    }

    // Get alert history
    getAlertHistory() {
        return this.alertHistory;
    }

    // Clear alert history
    clearHistory() {
        this.alertHistory = [];
        console.log('Alert history cleared');
    }

    // Get system status
    getStatus() {
        return {
            enabled: this.isEnabled,
            methods: this.notificationMethods,
            contacts: {
                email: this.userContacts.email ? '***' + this.userContacts.email.slice(-10) : 'Not set',
                phone: this.userContacts.phone ? '***' + this.userContacts.phone.slice(-4) : 'Not set'
            },
            alertCount: this.alertHistory.length,
            lastAlert: this.lastAlertTime ? new Date(this.lastAlertTime).toLocaleString() : 'Never'
        };
    }

    // Show notification in UI
    showNotification(message, type = 'info') {
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    // Test notification system
    async testNotification() {
        const testThreat = {
            class: 'test-object',
            score: 0.95,
            severity: 'LOW'
        };

        // Create test snapshot
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#1a472a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00ff88';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('TEST ALERT', canvas.width / 2, canvas.height / 2);

        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));

        const results = await this.sendThreatAlert(testThreat, blob);
        
        console.log('Test notification results:', results);
        this.showNotification('Test notification sent!', 'info');
        
        return results;
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileNotificationSystem;
}
