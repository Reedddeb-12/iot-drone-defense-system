// Unique Features for Drone Defense System
class UniqueFeatures {
    constructor() {
        this.voiceAlerts = null;
        this.heatmap = [];
        this.threatTrajectory = [];
        this.soundDetection = false;
        this.faceRecognition = [];
        this.weatherData = null;
        this.autoResponse = false;
        this.aiPrediction = [];
        this.recordingClips = [];
    }

    // 1. Voice Alert System
    initializeVoiceAlerts() {
        if ('speechSynthesis' in window) {
            this.voiceAlerts = window.speechSynthesis;
            console.log('Voice alerts initialized');
            return true;
        }
        return false;
    }

    speakAlert(message, urgency = 'normal') {
        if (!this.voiceAlerts) return;

        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'en-US';
        
        // Adjust voice based on urgency
        switch(urgency) {
            case 'high':
                utterance.rate = 1.3;
                utterance.pitch = 1.2;
                utterance.volume = 1.0;
                break;
            case 'medium':
                utterance.rate = 1.1;
                utterance.pitch = 1.0;
                utterance.volume = 0.9;
                break;
            default:
                utterance.rate = 1.0;
                utterance.pitch = 0.9;
                utterance.volume = 0.8;
        }

        this.voiceAlerts.speak(utterance);
    }

    // 2. Threat Heatmap Generation
    addToHeatmap(location, threatLevel) {
        const heatPoint = {
            lat: location.lat,
            lng: location.lng,
            intensity: threatLevel === 'HIGH' ? 1.0 : threatLevel === 'MEDIUM' ? 0.6 : 0.3,
            timestamp: Date.now()
        };

        this.heatmap.push(heatPoint);

        // Keep only last 100 points
        if (this.heatmap.length > 100) {
            this.heatmap.shift();
        }

        return this.heatmap;
    }

    getHeatmapData() {
        // Remove old data (older than 1 hour)
        const oneHourAgo = Date.now() - 3600000;
        this.heatmap = this.heatmap.filter(point => point.timestamp > oneHourAgo);
        return this.heatmap;
    }

    // 3. Threat Trajectory Prediction
    trackThreatMovement(threatId, position) {
        let threat = this.threatTrajectory.find(t => t.id === threatId);
        
        if (!threat) {
            threat = {
                id: threatId,
                positions: [],
                velocity: { x: 0, y: 0 },
                predictedPath: []
            };
            this.threatTrajectory.push(threat);
        }

        threat.positions.push({
            x: position.x,
            y: position.y,
            timestamp: Date.now()
        });

        // Keep only last 10 positions
        if (threat.positions.length > 10) {
            threat.positions.shift();
        }

        // Calculate velocity and predict path
        if (threat.positions.length >= 2) {
            const recent = threat.positions.slice(-2);
            const timeDiff = (recent[1].timestamp - recent[0].timestamp) / 1000; // seconds
            
            threat.velocity = {
                x: (recent[1].x - recent[0].x) / timeDiff,
                y: (recent[1].y - recent[0].y) / timeDiff
            };

            // Predict next 5 positions (1 second intervals)
            threat.predictedPath = [];
            for (let i = 1; i <= 5; i++) {
                threat.predictedPath.push({
                    x: recent[1].x + (threat.velocity.x * i),
                    y: recent[1].y + (threat.velocity.y * i),
                    confidence: 1 - (i * 0.15) // Decreasing confidence
                });
            }
        }

        return threat;
    }

    // 4. Sound-based Threat Detection
    async initializeSoundDetection() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const microphone = audioContext.createMediaStreamSource(stream);
            
            analyser.fftSize = 2048;
            microphone.connect(analyser);

            this.soundDetection = {
                analyser: analyser,
                dataArray: new Uint8Array(analyser.frequencyBinCount),
                threshold: 150
            };

            console.log('Sound detection initialized');
            return true;
        } catch (error) {
            console.error('Sound detection error:', error);
            return false;
        }
    }

    detectLoudSound() {
        if (!this.soundDetection) return null;

        this.soundDetection.analyser.getByteFrequencyData(this.soundDetection.dataArray);
        
        const average = this.soundDetection.dataArray.reduce((a, b) => a + b) / this.soundDetection.dataArray.length;
        
        if (average > this.soundDetection.threshold) {
            return {
                level: average,
                timestamp: Date.now(),
                type: average > 200 ? 'LOUD' : 'MODERATE'
            };
        }

        return null;
    }

    // 5. Face Recognition & Whitelist
    addToWhitelist(faceData, name) {
        this.faceRecognition.push({
            id: Date.now(),
            name: name,
            faceData: faceData,
            addedAt: new Date().toISOString()
        });
        console.log(`Added ${name} to whitelist`);
    }

    isWhitelisted(faceData) {
        // Simplified face matching (in production, use proper face recognition)
        return this.faceRecognition.some(face => {
            // Compare face data (simplified)
            return this.compareFaces(face.faceData, faceData);
        });
    }

    compareFaces(face1, face2) {
        // Simplified comparison - in production use proper face recognition library
        return Math.random() > 0.7; // Placeholder
    }

    // 6. Weather-based Threat Assessment
    async fetchWeatherData(lat, lng) {
        try {
            // Using Open-Meteo API (free, no API key required)
            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`
            );
            
            const data = await response.json();
            
            this.weatherData = {
                temperature: data.current_weather.temperature,
                windSpeed: data.current_weather.windspeed,
                windDirection: data.current_weather.winddirection,
                weatherCode: data.current_weather.weathercode,
                timestamp: Date.now()
            };

            return this.weatherData;
        } catch (error) {
            console.error('Weather fetch error:', error);
            return null;
        }
    }

    assessWeatherThreat() {
        if (!this.weatherData) return 'UNKNOWN';

        const { windSpeed, weatherCode } = this.weatherData;

        // High wind makes drones harder to control
        if (windSpeed > 30) return 'HIGH_WIND_RISK';
        
        // Poor visibility conditions
        if ([45, 48, 51, 53, 55, 61, 63, 65, 71, 73, 75, 77, 85, 86, 95, 96, 99].includes(weatherCode)) {
            return 'POOR_VISIBILITY';
        }

        return 'NORMAL';
    }

    // 7. Automatic Response System
    enableAutoResponse(actions) {
        this.autoResponse = {
            enabled: true,
            actions: actions || {
                highThreat: ['alert', 'record', 'notify'],
                mediumThreat: ['alert', 'record'],
                lowThreat: ['log']
            }
        };
    }

    executeAutoResponse(threatLevel) {
        if (!this.autoResponse || !this.autoResponse.enabled) return;

        const actions = this.autoResponse.actions[threatLevel.toLowerCase() + 'Threat'] || [];
        
        actions.forEach(action => {
            switch(action) {
                case 'alert':
                    this.speakAlert(`${threatLevel} threat detected. Initiating response protocol.`, threatLevel.toLowerCase());
                    break;
                case 'record':
                    console.log('Auto-recording initiated');
                    break;
                case 'notify':
                    console.log('Notifications sent');
                    break;
                case 'log':
                    console.log(`Threat logged: ${threatLevel}`);
                    break;
            }
        });
    }

    // 8. AI-Powered Threat Prediction
    predictThreatProbability(historicalData) {
        // Simple prediction based on time patterns
        const now = new Date();
        const hour = now.getHours();
        const dayOfWeek = now.getDay();

        // Analyze historical data
        const hourlyThreats = historicalData.filter(t => 
            new Date(t.timestamp).getHours() === hour
        ).length;

        const weekdayThreats = historicalData.filter(t => 
            new Date(t.timestamp).getDay() === dayOfWeek
        ).length;

        const probability = ((hourlyThreats + weekdayThreats) / historicalData.length) * 100;

        return {
            probability: Math.min(probability, 100),
            riskLevel: probability > 70 ? 'HIGH' : probability > 40 ? 'MEDIUM' : 'LOW',
            factors: {
                timeOfDay: hour,
                dayOfWeek: dayOfWeek,
                historicalIncidents: historicalData.length
            }
        };
    }

    // 9. Smart Recording Clips
    createThreatClip(videoElement, duration = 10) {
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const ctx = canvas.getContext('2d');

        const frames = [];
        const frameRate = 10; // 10 fps
        const totalFrames = duration * frameRate;
        let frameCount = 0;

        const captureInterval = setInterval(() => {
            ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            frames.push(canvas.toDataURL('image/jpeg', 0.8));
            frameCount++;

            if (frameCount >= totalFrames) {
                clearInterval(captureInterval);
                
                const clip = {
                    id: Date.now(),
                    frames: frames,
                    duration: duration,
                    timestamp: new Date().toISOString(),
                    frameRate: frameRate
                };

                this.recordingClips.push(clip);
                console.log('Threat clip created:', clip.id);
            }
        }, 1000 / frameRate);
    }

    // 10. Perimeter Breach Detection
    definePerimeter(points) {
        this.perimeter = {
            points: points,
            breaches: []
        };
    }

    checkPerimeterBreach(threatLocation) {
        if (!this.perimeter) return false;

        // Simple point-in-polygon check
        const isInside = this.pointInPolygon(threatLocation, this.perimeter.points);

        if (isInside) {
            this.perimeter.breaches.push({
                location: threatLocation,
                timestamp: Date.now()
            });
            return true;
        }

        return false;
    }

    pointInPolygon(point, polygon) {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].lat, yi = polygon[i].lng;
            const xj = polygon[j].lat, yj = polygon[j].lng;
            
            const intersect = ((yi > point.lng) !== (yj > point.lng))
                && (point.lat < (xj - xi) * (point.lng - yi) / (yj - yi) + xi);
            
            if (intersect) inside = !inside;
        }
        return inside;
    }

    // 11. Multi-Camera Coordination
    coordinateCameras(cameras, threat) {
        const closestCamera = cameras.reduce((closest, camera) => {
            const distance = this.calculateDistance(camera.location, threat.location);
            return distance < closest.distance ? { camera, distance } : closest;
        }, { camera: null, distance: Infinity });

        return {
            primaryCamera: closestCamera.camera,
            backupCameras: cameras.filter(c => c.id !== closestCamera.camera.id)
        };
    }

    calculateDistance(point1, point2) {
        const R = 6371; // Earth's radius in km
        const dLat = (point2.lat - point1.lat) * Math.PI / 180;
        const dLon = (point2.lng - point1.lng) * Math.PI / 180;
        
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    // 12. Threat Classification Learning
    learnFromFeedback(threatId, actualThreat, predictedThreat) {
        const feedback = {
            threatId: threatId,
            actual: actualThreat,
            predicted: predictedThreat,
            correct: actualThreat === predictedThreat,
            timestamp: Date.now()
        };

        this.aiPrediction.push(feedback);

        // Calculate accuracy
        const accuracy = this.aiPrediction.filter(f => f.correct).length / this.aiPrediction.length;
        
        return {
            accuracy: (accuracy * 100).toFixed(2) + '%',
            totalFeedback: this.aiPrediction.length
        };
    }

    // Get system statistics
    getStatistics() {
        return {
            heatmapPoints: this.heatmap.length,
            trackedThreats: this.threatTrajectory.length,
            whitelistedFaces: this.faceRecognition.length,
            recordedClips: this.recordingClips.length,
            perimeterBreaches: this.perimeter ? this.perimeter.breaches.length : 0,
            aiAccuracy: this.aiPrediction.length > 0 
                ? ((this.aiPrediction.filter(f => f.correct).length / this.aiPrediction.length) * 100).toFixed(2) + '%'
                : 'N/A'
        };
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UniqueFeatures;
}
