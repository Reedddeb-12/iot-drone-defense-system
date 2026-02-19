// Video Stream Handler for IoT Drone Defense System
class VideoStreamManager {
    constructor() {
        this.streams = new Map();
        this.mediaRecorders = new Map();
        this.detectionWorker = null;
        this.isDetectionActive = false;
        this.threatLevel = 'LOW';
        this.detectedObjects = [];
    }

    // Initialize webcam or IP camera stream
    async initializeStream(cameraId, videoElement, sourceType = 'webcam') {
        try {
            let stream;
            
            if (sourceType === 'webcam') {
                // Access user's webcam
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 1920 },
                        height: { ideal: 1080 },
                        frameRate: { ideal: 30 }
                    },
                    audio: false
                });
            } else if (sourceType === 'ip-camera') {
                // For IP cameras, use RTSP/HTTP stream
                // This would require a backend server to handle RTSP to WebRTC conversion
                console.log('IP Camera stream requires backend server');
                return null;
            }

            videoElement.srcObject = stream;
            this.streams.set(cameraId, stream);
            
            console.log(`Stream initialized for camera ${cameraId}`);
            return stream;
        } catch (error) {
            console.error('Error accessing camera:', error);
            this.showError(`Failed to access camera ${cameraId}: ${error.message}`);
            return null;
        }
    }

    // Start recording video stream
    startRecording(cameraId) {
        const stream = this.streams.get(cameraId);
        if (!stream) {
            console.error(`No stream found for camera ${cameraId}`);
            return;
        }

        const options = { mimeType: 'video/webm;codecs=vp9' };
        const mediaRecorder = new MediaRecorder(stream, options);
        const chunks = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                chunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `recording_${cameraId}_${timestamp}.webm`;
            
            this.downloadVideo(url, filename);
            console.log(`Recording saved: ${filename}`);
        };

        mediaRecorder.start();
        this.mediaRecorders.set(cameraId, mediaRecorder);
        console.log(`Recording started for camera ${cameraId}`);
    }

    // Stop recording
    stopRecording(cameraId) {
        const recorder = this.mediaRecorders.get(cameraId);
        if (recorder && recorder.state !== 'inactive') {
            recorder.stop();
            this.mediaRecorders.delete(cameraId);
            console.log(`Recording stopped for camera ${cameraId}`);
        }
    }

    // Capture snapshot from video stream
    captureSnapshot(cameraId, videoElement) {
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `snapshot_${cameraId}_${timestamp}.png`;
            
            this.downloadImage(url, filename);
            console.log(`Snapshot captured: ${filename}`);
        }, 'image/png');
    }

    // Download video file
    downloadVideo(url, filename) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Download image file
    downloadImage(url, filename) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Stop all streams
    stopStream(cameraId) {
        const stream = this.streams.get(cameraId);
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            this.streams.delete(cameraId);
            console.log(`Stream stopped for camera ${cameraId}`);
        }
    }

    // Stop all streams
    stopAllStreams() {
        this.streams.forEach((stream, cameraId) => {
            this.stopStream(cameraId);
        });
    }

    // Show error message
    showError(message) {
        if (typeof showNotification === 'function') {
            showNotification(message, 'error');
        } else {
            console.error(message);
        }
    }

    // Get stream statistics
    getStreamStats(cameraId) {
        const stream = this.streams.get(cameraId);
        if (!stream) return null;

        const videoTrack = stream.getVideoTracks()[0];
        if (!videoTrack) return null;

        const settings = videoTrack.getSettings();
        return {
            width: settings.width,
            height: settings.height,
            frameRate: settings.frameRate,
            aspectRatio: settings.aspectRatio,
            deviceId: settings.deviceId
        };
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VideoStreamManager;
}
