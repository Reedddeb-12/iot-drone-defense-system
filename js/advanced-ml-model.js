// COCO-SSD Model for Drone Defense System
class AdvancedMLModel {
    constructor() {
        this.model = null;
        this.isInitialized = false;
        this.detectionHistory = [];
        this.confidenceThreshold = 0.6;
        this.nmsThreshold = 0.5; // Non-maximum suppression
    }

    // Initialize COCO-SSD model
    async initializeModels() {
        console.log('Initializing COCO-SSD model...');
        
        try {
            if (typeof cocoSsd !== 'undefined') {
                this.model = await cocoSsd.load({
                    base: 'mobilenet_v2'
                });
                this.isInitialized = true;
                console.log('✓ COCO-SSD model loaded successfully');
                return true;
            } else {
                console.error('COCO-SSD library not loaded');
                return false;
            }
        } catch (error) {
            console.error('Error initializing COCO-SSD model:', error);
            return false;
        }
    }

    // Perform detection with COCO-SSD
    async detect(imageElement) {
        if (!this.isInitialized) {
            console.error('Model not initialized');
            return [];
        }

        try {
            let predictions = await this.model.detect(imageElement);

            // Apply post-processing
            predictions = this.postProcessPredictions(predictions);
            
            // Update detection history
            this.updateDetectionHistory(predictions);
            
            return predictions;
        } catch (error) {
            console.error('Detection error:', error);
            return [];
        }
    }

    // Post-process predictions
    postProcessPredictions(predictions) {
        // Filter by confidence threshold
        let filtered = predictions.filter(p => p.score >= this.confidenceThreshold);
        
        // Apply Non-Maximum Suppression to remove duplicate detections
        filtered = this.applyNMS(filtered);
        
        // Sort by confidence
        filtered.sort((a, b) => b.score - a.score);
        
        return filtered;
    }

    // Non-Maximum Suppression
    applyNMS(predictions) {
        if (predictions.length === 0) return [];

        const boxes = predictions.map(p => ({
            prediction: p,
            bbox: p.bbox,
            score: p.score
        }));

        boxes.sort((a, b) => b.score - a.score);

        const selected = [];
        const suppressed = new Set();

        for (let i = 0; i < boxes.length; i++) {
            if (suppressed.has(i)) continue;

            selected.push(boxes[i].prediction);

            for (let j = i + 1; j < boxes.length; j++) {
                if (suppressed.has(j)) continue;

                const iou = this.calculateIoU(boxes[i].bbox, boxes[j].bbox);
                
                if (iou > this.nmsThreshold) {
                    suppressed.add(j);
                }
            }
        }

        return selected;
    }

    // Calculate Intersection over Union
    calculateIoU(box1, box2) {
        const [x1, y1, w1, h1] = box1;
        const [x2, y2, w2, h2] = box2;

        const xA = Math.max(x1, x2);
        const yA = Math.max(y1, y2);
        const xB = Math.min(x1 + w1, x2 + w2);
        const yB = Math.min(y1 + h1, y2 + h2);

        const intersectionArea = Math.max(0, xB - xA) * Math.max(0, yB - yA);
        const box1Area = w1 * h1;
        const box2Area = w2 * h2;
        const unionArea = box1Area + box2Area - intersectionArea;

        return intersectionArea / unionArea;
    }

    // Update detection history for temporal consistency
    updateDetectionHistory(predictions) {
        const timestamp = Date.now();
        
        this.detectionHistory.push({
            timestamp: timestamp,
            predictions: predictions,
            count: predictions.length
        });

        // Keep only last 30 seconds of history
        const cutoff = timestamp - 30000;
        this.detectionHistory = this.detectionHistory.filter(h => h.timestamp > cutoff);
    }

    // Get temporal consistency score
    getTemporalConsistency(objectClass) {
        const recentDetections = this.detectionHistory.slice(-10);
        const occurrences = recentDetections.filter(h => 
            h.predictions.some(p => p.class === objectClass)
        ).length;

        return occurrences / recentDetections.length;
    }



    // Set confidence threshold
    setConfidenceThreshold(threshold) {
        this.confidenceThreshold = Math.max(0, Math.min(1, threshold));
        console.log(`Confidence threshold set to ${this.confidenceThreshold}`);
    }

    // Set NMS threshold
    setNMSThreshold(threshold) {
        this.nmsThreshold = Math.max(0, Math.min(1, threshold));
        console.log(`NMS threshold set to ${this.nmsThreshold}`);
    }

    // Get model information
    getModelInfo() {
        return {
            activeModel: 'COCO-SSD',
            isInitialized: this.isInitialized,
            confidenceThreshold: this.confidenceThreshold,
            nmsThreshold: this.nmsThreshold,
            detectionHistorySize: this.detectionHistory.length
        };
    }

    // Get detection statistics
    getStatistics() {
        if (this.detectionHistory.length === 0) {
            return {
                totalDetections: 0,
                averageDetections: 0,
                mostCommonClass: null,
                detectionRate: 0
            };
        }

        const totalDetections = this.detectionHistory.reduce((sum, h) => sum + h.count, 0);
        const averageDetections = totalDetections / this.detectionHistory.length;

        // Count class occurrences
        const classCounts = {};
        this.detectionHistory.forEach(h => {
            h.predictions.forEach(p => {
                classCounts[p.class] = (classCounts[p.class] || 0) + 1;
            });
        });

        const mostCommonClass = Object.keys(classCounts).reduce((a, b) => 
            classCounts[a] > classCounts[b] ? a : b, null
        );

        const framesWithDetections = this.detectionHistory.filter(h => h.count > 0).length;
        const detectionRate = framesWithDetections / this.detectionHistory.length;

        return {
            totalDetections,
            averageDetections: averageDetections.toFixed(2),
            mostCommonClass,
            detectionRate: (detectionRate * 100).toFixed(1) + '%',
            classCounts
        };
    }

    // Clear detection history
    clearHistory() {
        this.detectionHistory = [];
        console.log('Detection history cleared');
    }

    // Export detection data
    exportDetectionData() {
        const data = {
            modelInfo: this.getModelInfo(),
            statistics: this.getStatistics(),
            history: this.detectionHistory,
            exportTime: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `detection-data-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('Detection data exported');
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedMLModel;
}
