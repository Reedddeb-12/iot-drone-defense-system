# IoT-Based Drone Defense System

A comprehensive web-based surveillance and threat detection system with real-time video streaming, AI-powered object detection, and IoT device management.

## Features

### 1. Live Video Streaming
- Real-time webcam/IP camera integration
- Multiple camera feed support
- Video recording and snapshot capture
- Fullscreen viewing mode

### 2. AI-Powered Threat Detection (COCO-SSD)
- TensorFlow.js with COCO-SSD model
- Real-time object detection (90+ object classes)
- Non-Maximum Suppression (NMS) for accurate detection
- Temporal consistency tracking
- Automatic threat classification with confidence scoring
- Configurable detection threshold and FPS
- Bounding box visualization with threat highlighting
- Detection history and statistics

### 3. IoT Device Management
- WebSocket-based real-time communication
- Device registration and monitoring
- Battery level tracking
- System status monitoring
- Remote command execution

### 4. Mobile Alert System
- Automatic threat snapshot capture
- Email notifications with attachments
- SMS text message alerts
- Browser push notifications
- WebSocket real-time alerts to mobile apps
- Configurable alert cooldown
- Alert history tracking
- Multiple notification methods

### 4. Command Center Dashboard
- Real-time system metrics
- Interactive tactical map (Leaflet.js)
- Alert management system
- Analytics and reporting
- System configuration

## Installation

### Prerequisites
- Modern web browser (Chrome, Firefox, Edge)
- Webcam or IP camera access
- **For Mobile Alerts:** Node.js (v14+), Gmail account, Twilio account (free trial)

### Quick Start (Frontend Only)

1. Clone or download the repository
2. Open `index.html` for the main dashboard
3. Open `live-detection.html` for basic live threat detection
4. Open `advanced-detection.html` for advanced COCO-SSD detection

### Full Setup (With Mobile Alerts to Phone)

**📱 See `QUICK-START.md` for 5-minute setup guide!**

1. **Install Node.js** from https://nodejs.org/

2. **Install dependencies:**
```bash
npm install
```

3. **Configure credentials** in `server.js`:
   - Gmail App Password (for email alerts)
   - Twilio credentials (for SMS alerts)
   - See `SETUP-GUIDE.md` for detailed instructions

4. **Start backend server:**
```bash
npm start
```
Or double-click `START-SERVER.bat` (Windows)

5. **Open detection page and configure alerts:**
   - Open `advanced-detection.html` in browser
   - Click "Configure Mobile Alerts"
   - Enter email and phone number
   - Click "Test Alert" to verify
   - Start detection

**⚠️ Important:** Backend server must be running to send email/SMS alerts to your phone!

## Usage

### Main Dashboard (`index.html`)
- Navigate through different sections using the sidebar
- Monitor system status and alerts
- View camera feeds and map locations
- Configure system settings

### Live Detection (`live-detection.html`)
1. Click "Start Detection" to activate camera
2. AI will automatically detect objects in real-time
3. Threats are highlighted with red bounding boxes
4. Adjust detection threshold and FPS as needed
5. Use recording and snapshot features as required

### Advanced Detection (`advanced-detection.html`)
1. Click "Start Detection" to activate camera
2. COCO-SSD AI detects and classifies objects with high accuracy
3. Click "Configure Mobile Alerts" to set up email/SMS notifications
4. Enter your email and phone number
5. Click "Test Alert" to verify configuration
6. Adjust confidence threshold, FPS, and NMS threshold
7. View real-time statistics and detection history
8. System automatically sends snapshots to your mobile when threats detected
9. Export detection data for analysis

## File Structure

```
iot-based-drone-defence-system-main/
├── index.html                  # Main dashboard
├── live-detection.html         # Basic live threat detection
├── advanced-detection.html     # Advanced COCO-SSD detection
├── js/
│   ├── iot-communication.js   # IoT device communication
│   ├── video-stream.js        # Video streaming handler
│   ├── threat-detection.js    # Basic AI threat detection
│   ├── advanced-ml-model.js   # COCO-SSD with NMS
│   └── mobile-notification.js # Mobile alert system
├── server.js                   # Backend server for alerts
├── package.json                # Node.js dependencies
├── START-SERVER.bat            # Quick start script (Windows)
├── README.md                   # This file
├── QUICK-START.md             # 5-minute setup guide
├── SETUP-GUIDE.md             # Detailed setup instructions
├── COCO-SSD-INFO.md           # COCO-SSD model documentation
└── MOBILE-ALERTS.md           # Mobile alerts documentation
```

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **AI/ML**: 
  - TensorFlow.js (Core ML framework)
  - COCO-SSD (Object detection - 90 classes)
  - Non-Maximum Suppression (NMS)
  - Temporal consistency tracking
- **Mapping**: Leaflet.js
- **Charts**: Chart.js
- **Icons**: Font Awesome
- **Communication**: WebSocket API

## Configuration

### Detection Settings
- **Threshold**: Adjust confidence level (0-100%)
- **FPS**: Detection frame rate (1-10 FPS)
- **Threat Objects**: Customize detected object types

### Camera Settings
- **Resolution**: 720p, 1080p, 1440p, 4K
- **Frame Rate**: 15, 30, 60 FPS
- **Night Vision**: Enable/disable
- **Auto-Recording**: Motion-triggered recording

### Security Settings
- **Encryption**: AES-256-CBC
- **Two-Factor Authentication**: Enable/disable
- **SSL/TLS Verification**: Enable/disable

## API Integration

### WebSocket Communication

```javascript
const iotManager = new IoTCommunicationManager();
iotManager.initializeWebSocket('ws://your-server:8080');

// Send command to device
iotManager.sendCommand('device-id', 'command', { params });

// Listen for messages
iotManager.onMessage('topic', (data) => {
    console.log('Received:', data);
});
```

### Video Streaming

```javascript
const videoManager = new VideoStreamManager();

// Initialize camera
await videoManager.initializeStream('camera-id', videoElement, 'webcam');

// Start recording
videoManager.startRecording('camera-id');

// Capture snapshot
videoManager.captureSnapshot('camera-id', videoElement);
```

### Threat Detection

```javascript
const detector = new ThreatDetectionSystem();

// Initialize AI model
await detector.initialize();

// Start detection
detector.startDetection(videoElement, canvasElement, fps);

// Handle threats
detector.onThreatDetected((threat) => {
    console.log('Threat detected:', threat);
});
```

## Browser Compatibility

- Chrome 90+ (Recommended)
- Firefox 88+
- Edge 90+
- Safari 14+

## Performance Optimization

- Adjust detection FPS based on system capabilities
- Lower video resolution for better performance
- Use hardware acceleration when available
- Close unused camera feeds

## Security Considerations

- Always use HTTPS in production
- Implement proper authentication
- Encrypt sensitive data
- Validate all user inputs
- Use secure WebSocket (WSS)

## Troubleshooting

### Camera Not Working
- Check browser permissions
- Ensure camera is not in use by another application
- Try different browsers

### Detection Not Working
- Verify TensorFlow.js libraries are loaded
- Check browser console for errors
- Ensure adequate lighting for detection

### WebSocket Connection Failed
- Verify server is running
- Check firewall settings
- Ensure correct WebSocket URL

## Future Enhancements

- [ ] Multi-camera synchronization
- [ ] Cloud storage integration
- [ ] Mobile app support
- [ ] Advanced AI models (YOLO, SSD)
- [ ] Facial recognition
- [ ] License plate detection
- [ ] Drone tracking algorithms
- [ ] Integration with physical defense systems

## License

This project is for educational and demonstration purposes.

## Support

For issues and questions, please check the documentation or contact support.

## Credits

- TensorFlow.js Team
- COCO-SSD Model
- Leaflet.js
- Font Awesome
- Chart.js

---

**Note**: This is a demonstration system. For production deployment, implement proper backend infrastructure, authentication, and security measures.
