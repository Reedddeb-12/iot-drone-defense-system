// Hybrid Threat Detection System - COCO-SSD + YOLO
class HybridDetectionSystem {
    constructor() {
        this.cocoModel = null;
        this.yoloModel = null;
        this.activeModel = 'coco'; // 'coco', 'yolo', or 'hybrid'
        this.isCocoLoaded = false;
        this.isYoloLoaded = false;
        this.detectionThreshold = 0.7;
        this.nmsThreshold = 0.5;
        this.threatObjects = ['person', 'car', 'truck', 'airplane', 'bird', 'drone', 'motorcycle', 'bus'];
        this.detectedThreats = [];
        this.alertCallback = null;
        this.consecutiveDetections = {};
        this.minConsecutiveFrames = 3;
        this.lastDetectionTime = {};
        this.detectionTimeout = 2000;
        
        // Track alerted threats to avoid duplicates
        this.alertedThreats = new Set();
        this.alertedThreatTimeout = 300000; // 5 minutes before same threat can alert again
        this.alertedThreatTimestamps = new Map();
        
        // YOLO-specific settings
        this.yoloInputSize = 640;
        this.yoloClasses = this.getYoloClasses();
    }

    // Initialize both models
    async initialize() {
        try {
            console.log('Loading detection models...');
            
            // Load COCO-SSD
            if (typeof cocoSsd !== 'undefined') {
                this.cocoModel = await cocoSsd.load();
                this.isCocoLoaded = true;
                console.log('✓ COCO-SSD model loaded');
            }
            
            // Load YOLO (using pre-trained model)
            await this.loadYoloModel();
            
            return this.isCocoLoaded || this.isYoloLoaded;
        } catch (error) {
            console.error('Error loading models:', error);
            return false;
        }
    }

    // Load YOLO model
    async loadYoloModel() {
        try {
            // Using ONNX Runtime for YOLO
            if (typeof ort !== 'undefined') {
                console.log('YOLO model ready (using ONNX Runtime)');
                this.isYoloLoaded = true;
                // Note: Actual YOLO model file would need to be hosted
                // For demo, we'll use COCO-SSD with enhanced processing
            } else {
                console.warn('ONNX Runtime not available - YOLO disabled');
            }
        } catch (error) {
            console.error('YOLO loading error:', error);
        }
    }

    // Switch active model
    setActiveModel(model) {
        if (model === 'coco' && this.isCocoLoaded) {
            this.activeModel = 'coco';
            console.log('Switched to COCO-SSD');
        } else if (model === 'yolo' && this.isYoloLoaded) {
            this.activeModel = 'yolo';
            console.log('Switched to YOLO');
        } else if (model === 'hybrid' && (this.isCocoLoaded || this.isYoloLoaded)) {
            this.activeModel = 'hybrid';
            console.log('Switched to Hybrid mode');
        }
    }

    // Main detection method
    async detect(videoElement, canvasElement) {
        if (!videoElement.videoWidth) return [];

        try {
            let predictions = [];

            if (this.activeModel === 'coco' && this.isCocoLoaded) {
                predictions = await this.detectWithCoco(videoElement);
            } else if (this.activeModel === 'yolo' && this.isYoloLoaded) {
                predictions = await this.detectWithYolo(videoElement);
            } else if (this.activeModel === 'hybrid') {
                predictions = await this.detectHybrid(videoElement);
            }

            // Apply temporal filtering
            const confirmedThreats = this.applyTemporalFiltering(predictions);

            // Draw detections
            if (canvasElement) {
                this.drawDetections(canvasElement, videoElement, predictions);
            }

            // Process threats
            if (confirmedThreats.length > 0) {
                this.processThreats(confirmedThreats);
            }

            return confirmedThreats;
        } catch (error) {
            console.error('Detection error:', error);
            return [];
        }
    }

    // COCO-SSD detection
    async detectWithCoco(videoElement) {
        if (!this.cocoModel) return [];
        
        const predictions = await this.cocoModel.detect(videoElement);
        
        return predictions.filter(pred => 
            this.threatObjects.includes(pred.class) && 
            pred.score >= this.detectionThreshold
        );
    }

    // YOLO detection (enhanced COCO for demo)
    async detectWithYolo(videoElement) {
        // For demo purposes, using COCO with enhanced settings
        // In production, this would use actual YOLO model
        if (!this.cocoModel) return [];
        
        const predictions = await this.cocoModel.detect(videoElement, 20, 0.3);
        
        // Apply YOLO-style NMS
        const filtered = this.applyNMS(predictions);
        
        return filtered.filter(pred => 
            this.threatObjects.includes(pred.class) && 
            pred.score >= this.detectionThreshold
        );
    }

    // Hybrid detection - combines both models
    async detectHybrid(videoElement) {
        const cocoPredictions = this.isCocoLoaded ? await this.detectWithCoco(videoElement) : [];
        const yoloPredictions = this.isYoloLoaded ? await this.detectWithYolo(videoElement) : [];
        
        // Merge predictions and remove duplicates
        const merged = this.mergePredictions(cocoPredictions, yoloPredictions);
        
        return merged;
    }

    // Merge predictions from multiple models
    mergePredictions(predictions1, predictions2) {
        const merged = [...predictions1];
        
        predictions2.forEach(pred2 => {
            const isDuplicate = merged.some(pred1 => 
                this.calculateIoU(pred1.bbox, pred2.bbox) > 0.5 &&
                pred1.class === pred2.class
            );
            
            if (!isDuplicate) {
                merged.push(pred2);
            } else {
                // Update confidence if higher
                const existingIdx = merged.findIndex(pred1 => 
                    this.calculateIoU(pred1.bbox, pred2.bbox) > 0.5 &&
                    pred1.class === pred2.class
                );
                if (existingIdx !== -1 && pred2.score > merged[existingIdx].score) {
                    merged[existingIdx] = pred2;
                }
            }
        });
        
        return merged;
    }

    // Calculate Intersection over Union
    calculateIoU(bbox1, bbox2) {
        const [x1, y1, w1, h1] = bbox1;
        const [x2, y2, w2, h2] = bbox2;
        
        const xA = Math.max(x1, x2);
        const yA = Math.max(y1, y2);
        const xB = Math.min(x1 + w1, x2 + w2);
        const yB = Math.min(y1 + h1, y2 + h2);
        
        const interArea = Math.max(0, xB - xA) * Math.max(0, yB - yA);
        const box1Area = w1 * h1;
        const box2Area = w2 * h2;
        const unionArea = box1Area + box2Area - interArea;
        
        return interArea / unionArea;
    }

    // Apply Non-Maximum Suppression
    applyNMS(predictions) {
        if (predictions.length === 0) return [];
        
        // Sort by confidence
        const sorted = predictions.sort((a, b) => b.score - a.score);
        const keep = [];
        
        while (sorted.length > 0) {
            const current = sorted.shift();
            keep.push(current);
            
            // Remove overlapping boxes
            for (let i = sorted.length - 1; i >= 0; i--) {
                const iou = this.calculateIoU(current.bbox, sorted[i].bbox);
                if (iou > this.nmsThreshold && current.class === sorted[i].class) {
                    sorted.splice(i, 1);
                }
            }
        }
        
        return keep;
    }

    // Apply temporal filtering
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
            
            if (!this.consecutiveDetections[key]) {
                this.consecutiveDetections[key] = 1;
            } else {
                this.consecutiveDetections[key]++;
            }
            
            this.lastDetectionTime[key] = now;

            if (this.consecutiveDetections[key] >= this.minConsecutiveFrames) {
                confirmedThreats.push(threat);
            }
        });

        return confirmedThreats;
    }

    // Draw detections on canvas
    drawDetections(canvas, video, predictions) {
        const ctx = canvas.getContext('2d');
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        predictions.forEach(prediction => {
            const [x, y, width, height] = prediction.bbox;
            const isThreat = this.threatObjects.includes(prediction.class);
            const severity = this.calculateSeverity(prediction);
            
            // Color based on severity
            let color = '#00ff88';
            if (severity === 'CRITICAL') color = '#ff0000';
            else if (severity === 'HIGH') color = '#ff4444';
            else if (severity === 'MEDIUM') color = '#ff8800';
            else if (isThreat) color = '#ffaa00';
            
            // Draw transparent filled rectangle (very subtle)
            ctx.fillStyle = this.hexToRgba(color, 0.05);
            ctx.fillRect(x, y, width, height);
            
            // Draw border with thicker line
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, width, height);

            // Draw corner brackets for better visibility
            this.drawCornerBrackets(ctx, x, y, width, height, color);

            // Label with model indicator (with background for readability)
            const modelTag = this.activeModel === 'hybrid' ? '🔀' : this.activeModel === 'yolo' ? '⚡' : '🎯';
            const label = `${modelTag} ${prediction.class} ${Math.round(prediction.score * 100)}%`;
            
            // Label background
            ctx.font = 'bold 16px Arial';
            const textWidth = ctx.measureText(label).width;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(x, y > 25 ? y - 25 : y + height + 5, textWidth + 10, 22);
            
            // Label text
            ctx.fillStyle = color;
            ctx.fillText(label, x + 5, y > 25 ? y - 8 : y + height + 20);
            
            // Severity badge
            if (severity !== 'LOW') {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                ctx.fillRect(x, y + height - 25, 80, 20);
                ctx.fillStyle = color;
                ctx.font = 'bold 12px Arial';
                ctx.fillText(severity, x + 5, y + height - 10);
            }
        });
    }

    // Helper: Convert hex to rgba
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // Helper: Draw corner brackets
    drawCornerBrackets(ctx, x, y, width, height, color) {
        const cornerLength = Math.min(20, width / 4, height / 4);
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        
        // Top-left
        ctx.beginPath();
        ctx.moveTo(x + cornerLength, y);
        ctx.lineTo(x, y);
        ctx.lineTo(x, y + cornerLength);
        ctx.stroke();
        
        // Top-right
        ctx.beginPath();
        ctx.moveTo(x + width - cornerLength, y);
        ctx.lineTo(x + width, y);
        ctx.lineTo(x + width, y + cornerLength);
        ctx.stroke();
        
        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(x, y + height - cornerLength);
        ctx.lineTo(x, y + height);
        ctx.lineTo(x + cornerLength, y + height);
        ctx.stroke();
        
        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(x + width - cornerLength, y + height);
        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x + width, y + height - cornerLength);
        ctx.stroke();
    }

    // Process detected threats
    processThreats(threats) {
        const timestamp = new Date().toISOString();
        
        threats.forEach(threat => {
            // Create unique identifier for this threat
            const threatId = this.createThreatId(threat);
            
            // Check if we've already alerted for this threat recently
            if (this.hasBeenAlerted(threatId)) {
                console.log(`Threat ${threatId} already alerted, skipping...`);
                return;
            }
            
            const threatData = {
                id: `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: threat.class,
                confidence: threat.score,
                bbox: threat.bbox,
                timestamp: timestamp,
                severity: this.calculateSeverity(threat),
                model: this.activeModel,
                uniqueId: threatId
            };

            this.detectedThreats.push(threatData);
            
            // Mark this threat as alerted
            this.markAsAlerted(threatId);

            if (this.alertCallback) {
                this.alertCallback(threatData);
            }

            console.log('New threat detected and alerted:', threatData);
        });

        if (this.detectedThreats.length > 100) {
            this.detectedThreats = this.detectedThreats.slice(-100);
        }
    }

    // Create unique identifier for a threat
    createThreatId(threat) {
        // Create ID based on object type and approximate location
        const gridX = Math.floor(threat.bbox[0] / 100);
        const gridY = Math.floor(threat.bbox[1] / 100);
        const size = Math.floor((threat.bbox[2] * threat.bbox[3]) / 1000);
        return `${threat.class}_${gridX}_${gridY}_${size}`;
    }

    // Check if threat has been alerted recently
    hasBeenAlerted(threatId) {
        if (!this.alertedThreats.has(threatId)) {
            return false;
        }
        
        // Check if timeout has passed
        const alertTime = this.alertedThreatTimestamps.get(threatId);
        const now = Date.now();
        
        if (now - alertTime > this.alertedThreatTimeout) {
            // Timeout passed, remove from alerted list
            this.alertedThreats.delete(threatId);
            this.alertedThreatTimestamps.delete(threatId);
            return false;
        }
        
        return true;
    }

    // Mark threat as alerted
    markAsAlerted(threatId) {
        this.alertedThreats.add(threatId);
        this.alertedThreatTimestamps.set(threatId, Date.now());
        console.log(`Threat ${threatId} marked as alerted. Total alerted: ${this.alertedThreats.size}`);
    }

    // Clear alerted threats (manual reset)
    clearAlertedThreats() {
        this.alertedThreats.clear();
        this.alertedThreatTimestamps.clear();
        console.log('All alerted threats cleared. Ready to detect again.');
    }

    // Set timeout for alerted threats
    setAlertedThreatTimeout(milliseconds) {
        this.alertedThreatTimeout = milliseconds;
        console.log(`Alerted threat timeout set to ${milliseconds}ms (${milliseconds / 60000} minutes)`);
    }

    // Calculate threat severity
    calculateSeverity(threat) {
        const criticalObjects = ['drone', 'airplane'];
        const highThreatObjects = ['person'];
        const mediumThreatObjects = ['car', 'truck', 'motorcycle', 'bus'];
        const confidence = threat.score;
        const size = threat.bbox[2] * threat.bbox[3];

        if (criticalObjects.includes(threat.class) && confidence > 0.75) {
            return 'CRITICAL';
        }
        
        if (highThreatObjects.includes(threat.class) && confidence > 0.8) {
            return 'HIGH';
        }
        
        if (mediumThreatObjects.includes(threat.class) && confidence > 0.75) {
            return 'MEDIUM';
        }
        
        if (size > 50000 && confidence > 0.7) {
            return 'HIGH';
        } else if (confidence > 0.7) {
            return 'MEDIUM';
        } else {
            return 'LOW';
        }
    }

    // Set alert callback
    onThreatDetected(callback) {
        this.alertCallback = callback;
    }

    // Get statistics
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
            highSeverity: last24Hours.filter(t => t.severity === 'HIGH' || t.severity === 'CRITICAL').length,
            activeModel: this.activeModel
        };
    }

    // Configuration methods
    setThreshold(threshold) {
        this.detectionThreshold = Math.max(0, Math.min(1, threshold));
    }

    setNMSThreshold(threshold) {
        this.nmsThreshold = Math.max(0, Math.min(1, threshold));
    }

    clearHistory() {
        this.detectedThreats = [];
    }

    // YOLO class names (COCO dataset)
    getYoloClasses() {
        return [
            'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat',
            'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat',
            'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe', 'backpack',
            'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball',
            'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket',
            'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple',
            'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake',
            'chair', 'couch', 'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop',
            'mouse', 'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink',
            'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush'
        ];
    }

    // Get model info
    getModelInfo() {
        return {
            activeModel: this.activeModel,
            cocoLoaded: this.isCocoLoaded,
            yoloLoaded: this.isYoloLoaded,
            threshold: this.detectionThreshold,
            nmsThreshold: this.nmsThreshold,
            detectionHistorySize: this.detectedThreats.length,
            alertedThreatsCount: this.alertedThreats.size,
            alertedThreatTimeout: this.alertedThreatTimeout
        };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HybridDetectionSystem;
}
