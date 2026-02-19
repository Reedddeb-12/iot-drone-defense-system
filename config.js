// Configuration for IoT Drone Defense System
const CONFIG = {
    // Email Alert Configuration
    email: {
        // Change this to your email address
        defaultRecipient: 'reeddhijitdeb@gmail.com',
        
        // Alert cooldown period (milliseconds)
        // 60000 = 1 minute between alerts
        cooldownPeriod: 60000,
        
        // Enable automatic email alerts
        autoSendAlerts: true
    },
    
    // Detection Configuration
    detection: {
        // Confidence threshold (0.0 - 1.0)
        confidenceThreshold: 0.7,
        
        // NMS threshold (0.0 - 1.0)
        nmsThreshold: 0.5,
        
        // Detection FPS
        fps: 3,
        
        // Temporal filtering frames
        temporalFrames: 3,
        
        // Active model: 'coco', 'yolo', or 'hybrid'
        activeModel: 'hybrid',
        
        // Unique threat timeout (milliseconds)
        // After this time, same threat can trigger alert again
        // 300000 = 5 minutes
        uniqueThreatTimeout: 300000
    },
    
    // Threat Objects to Monitor
    threatObjects: [
        'person',
        'car',
        'truck',
        'bus',
        'motorcycle',
        'airplane',
        'drone',
        'bird'
    ],
    
    // Severity Thresholds
    severity: {
        critical: {
            objects: ['drone', 'airplane'],
            minConfidence: 0.75
        },
        high: {
            objects: ['person'],
            minConfidence: 0.80
        },
        medium: {
            objects: ['car', 'truck', 'bus', 'motorcycle'],
            minConfidence: 0.75
        }
    },
    
    // Push Notifications
    push: {
        enabled: true,
        requireInteraction: true
    },
    
    // Map Configuration
    map: {
        defaultLocation: {
            lat: 28.6139,
            lng: 77.2090
        },
        zoom: 15,
        coverageRadius: 100 // meters
    },
    
    // Video Configuration
    video: {
        idealWidth: 1920,
        idealHeight: 1080,
        frameRate: 30
    },
    
    // Backend Server
    server: {
        url: 'http://localhost:3000',
        endpoints: {
            email: '/api/send-email'
        }
    }
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
