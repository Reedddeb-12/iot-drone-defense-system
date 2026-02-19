// Threat Detection System using TensorFlow.js
class ThreatDetectionSystem {
    constructor() {
        this.model = null;
        this.isModelLoaded = false;
        this.detectionInterval = null;
        this.detectionThreshold = 0.7; // Increased from 0.6 for better accuracy
        this.threatObjects = ['person', 'car', 'truck', 'airplane', 'bird', 'drone'];
        this.detectedThreats = [];
        this.alertCallback = null;
        this.consecutiveDetections = {}; // Track consecutive detections
        this.minConsecutiveFrames = 3; // Require 3 consecutive detections
        this.lastDetectionTime = {};
        this.detectionTimeout = 2000; // Reset if no detection for 2 seconds
    }

    // Initialize TensorFlow.js and load COCO-SSD model
    async initialize() {
        try {
            console.log('Loading threat detection model...');
            
            // Load COCO-SSD model for object detection
            if (typeof cocoSsd !== 'undefined') {
                this.model = await cocoSsd.load();
                this.isModelLoaded = true;
                console.log('Threat detection model loaded successfully');
                return true;
            } else {
                console.warn('TensorFlow.js COCO-SSD not loaded. Please include the library.');
                return false;
            }
        } catch (error) {
            console.error('Error loading detection model:', error);
            return false;
        }
    }

    // Start continuous threat detection
    startDetection(videoElement, canvasElement, fps = 2) {
        if (!this.isModelLoaded) {
            console.error('Model not loaded. Call initialize() first.');
            return;
        }

        const detectionDelay = 1000 / fps; // Convert FPS to milliseconds

        this.detectionInterval = setInterval(async () => {
            await this.detectThreats(videoElement, canvasElement);
        }, detectionDelay);

        console.log(`Threat detection started at ${fps} FPS`);
    }

    // Stop threat detection
    stopDetection() {
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
            this.detectionInterval = null;
            console.log('Threat detection stopped');
        }
    }

    // Detect threats in video frame with improved accuracy
    async detectThreats(videoElement, canvasElement) {
        if (!this.model || !videoElement.videoWidth) return;

        try {
            // Run detection
            const predictions = await this.model.detect(videoElement);
            
            // Filter for threat objects with higher confidence
            const threats = predictions.filter(pred => 
                this.threatObjects.includes(pred.class) && 
                pred.score >= this.detectionThreshold
            );

            // Apply temporal filtering for accuracy
            const confirmedThreats = this.applyTemporalFiltering(threats);

            // Draw bounding boxes
            this.drawDetections(canvasElement, videoElement, predictions);

            // Process only confirmed threats
            if (confirmedThreats.length > 0) {
                this.processThreats(confirmedThreats);
            }

            return confirmedThreats;
        } catch (error) {
            console.error('Detection error:', error);
            return [];
        }
    }

    // Apply temporal filtering to reduce false positives
    applyTemporalFiltering(threats) {
        const now = Date.now();
        const confirmedThreats = [];

        // Clean up old detections
        Object.keys(this.lastDetectionTime).forEach(key => {
            if (now - this.lastDetectionTime[key] > this.detectionTimeout) {
                delete this.consecutiveDetections[key];
                delete this.lastDetectionTime[key];
            }
        });

        threats.forEach(threat => {
            const key = `${threat.class}_${Math.round(threat.bbox[0] / 50)}_${Math.round(threat.bbox[1] / 50)}`;
            
            // Initialize or increment consecutive detection counter
            if (!this.consecutiveDetections[key]) {
                this.consecutiveDetections[key] = 1;
            } else {
                this.consecutiveDetections[key]++;
            }
            
            this.lastDetectionTime[key] = now;

            // Only confirm threat if detected in multiple consecutive frames
            if (this.consecutiveDetections[key] >= this.minConsecutiveFrames) {
                confirmedThreats.push(threat);
            }
        });

        return confirmedThreats;
    }

    // Draw detection boxes on canvas
    drawDetections(canvas, video, predictions) {
        const ctx = canvas.getContext('2d');
        
        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Clear previous drawings
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw each detection
        predictions.forEach(prediction => {
            const [x, y, width, height] = prediction.bbox;
            const isThreat = this.threatObjects.includes(prediction.class);
            
            // Set color based on threat level
            ctx.strokeStyle = isThreat ? '#ff4444' : '#00ff88';
            ctx.lineWidth = 3;
            ctx.fillStyle = isThreat ? 'rgba(255, 68, 68, 0.3)' : 'rgba(0, 255, 136, 0.3)';

            // Draw bounding box
            ctx.fillRect(x, y, width, height);
            ctx.strokeRect(x, y, width, height);

            // Draw label
            const label = `${prediction.class} ${Math.round(prediction.score * 100)}%`;
            ctx.fillStyle = isThreat ? '#ff4444' : '#00ff88';
            ctx.font = 'bold 16px Arial';
            ctx.fillText(label, x, y > 20 ? y - 5 : y + 20);
        });
    }

    // Process detected threats
    processThreats(threats) {
        const timestamp = new Date().toISOString();
        
        threats.forEach(threat => {
            const threatData = {
                id: `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: threat.class,
                confidence: threat.score,
                bbox: threat.bbox,
                timestamp: timestamp,
                severity: this.calculateSeverity(threat)
            };

            this.detectedThreats.push(threatData);

            // Trigger alert callback
            if (this.alertCallback) {
                this.alertCallback(threatData);
            }

            console.log('Threat detected:', threatData);
        });

        // Keep only last 100 threats
        if (this.detectedThreats.length > 100) {
            this.detectedThreats = this.detectedThreats.slice(-100);
        }
    }

    // Calculate threat severity with improved logic
    calculateSeverity(threat) {
        const criticalObjects = ['drone', 'airplane'];
        const highThreatObjects = ['person'];
        const mediumThreatObjects = ['car', 'truck'];
        const confidence = threat.score;
        const size = threat.bbox[2] * threat.bbox[3]; // width * height

        // Critical threats
        if (criticalObjects.includes(threat.class) && confidence > 0.75) {
            return 'CRITICAL';
        }
        
        // High threats - consider both confidence and object size
        if (highThreatObjects.includes(threat.class) && confidence > 0.8) {
            return 'HIGH';
        }
        
        // Medium threats
        if (mediumThreatObjects.includes(threat.class) && confidence > 0.75) {
            return 'MEDIUM';
        }
        
        // Size-based severity adjustment
        if (size > 50000 && confidence > 0.7) {
            return 'HIGH';
        } else if (confidence > 0.7) {
            return 'MEDIUM';
        } else {
            return 'LOW';
        }
    }

    // Set alert callback function
    onThreatDetected(callback) {
        this.alertCallback = callback;
    }

    // Get detection statistics
    getStatistics() {
        const now = Date.now();
        const last24Hours = this.detectedThreats.filter(t => 
            new Date(t.timestamp).getTime() > now - 24 * 60 * 60 * 1000
        );

        const threatCounts = {};
        last24Hours.forEach(t => {
            threatCounts[t.type] = (threatCounts[t.type] || 0) + 1;
        });

        return {
            total: this.detectedThreats.length,
            last24Hours: last24Hours.length,
            byType: threatCounts,
            highSeverity: last24Hours.filter(t => t.severity === 'HIGH').length
        };
    }

    // Clear threat history
    clearHistory() {
        this.detectedThreats = [];
        console.log('Threat history cleared');
    }

    // Update detection threshold
    setThreshold(threshold) {
        this.detectionThreshold = Math.max(0, Math.min(1, threshold));
        console.log(`Detection threshold set to ${this.detectionThreshold}`);
    }

    // Add custom threat object
    addThreatObject(objectClass) {
        if (!this.threatObjects.includes(objectClass)) {
            this.threatObjects.push(objectClass);
            console.log(`Added threat object: ${objectClass}`);
        }
    }

    // Remove threat object
    removeThreatObject(objectClass) {
        const index = this.threatObjects.indexOf(objectClass);
        if (index > -1) {
            this.threatObjects.splice(index, 1);
            console.log(`Removed threat object: ${objectClass}`);
        }
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThreatDetectionSystem;
}
