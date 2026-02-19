# Drone Defense System - Backend API

Professional Node.js/Express backend for IoT-based drone defense system with MongoDB, real-time WebSocket communication, and comprehensive API endpoints.

## Features

- ✅ RESTful API with Express.js
- ✅ MongoDB database with Mongoose ODM
- ✅ JWT authentication & authorization
- ✅ Real-time WebSocket communication (Socket.IO)
- ✅ Email & SMS notifications (Nodemailer, Twilio)
- ✅ File upload to AWS S3
- ✅ Rate limiting & security (Helmet)
- ✅ Comprehensive logging (Winston)
- ✅ Error handling middleware
- ✅ Geospatial queries for threat locations
- ✅ Analytics & reporting endpoints

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO
- **Email**: Nodemailer
- **SMS**: Twilio
- **Storage**: AWS S3
- **Logging**: Winston
- **Security**: Helmet, bcrypt, express-rate-limit

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   └── logger.js            # Winston logger config
│   ├── controllers/
│   │   ├── auth.controller.js   # Authentication logic
│   │   ├── threat.controller.js # Threat management
│   │   ├── camera.controller.js # Camera management
│   │   ├── alert.controller.js  # Alert management
│   │   └── analytics.controller.js # Analytics
│   ├── models/
│   │   ├── User.model.js        # User schema
│   │   ├── Threat.model.js      # Threat schema
│   │   ├── Camera.model.js      # Camera schema
│   │   └── Alert.model.js       # Alert schema
│   ├── routes/
│   │   ├── auth.routes.js       # Auth endpoints
│   │   ├── threat.routes.js     # Threat endpoints
│   │   ├── camera.routes.js     # Camera endpoints
│   │   └── alert.routes.js      # Alert endpoints
│   ├── middleware/
│   │   ├── auth.js              # JWT verification
│   │   ├── errorHandler.js      # Error handling
│   │   ├── rateLimiter.js       # Rate limiting
│   │   └── upload.js            # File upload
│   ├── services/
│   │   ├── notification.service.js # Email/SMS
│   │   └── storage.service.js   # AWS S3
│   └── server.js                # Main server file
├── logs/                        # Log files
├── .env.example                 # Environment variables template
├── package.json                 # Dependencies
└── README.md                    # This file
```

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- AWS Account (for S3 storage)
- Twilio Account (for SMS)
- Gmail Account (for email)

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Server
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database
MONGODB_URI=mongodb://localhost:27017/drone-defense

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRE=30d

# Email (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Twilio SMS
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=drone-defense-media

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:8080
```

### Step 3: Start MongoDB

```bash
# Using MongoDB service
sudo systemctl start mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Step 4: Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will start on `http://localhost:5000`

## API Endpoints

### Authentication

```
POST   /api/v1/auth/register        # Register new user
POST   /api/v1/auth/login           # Login user
POST   /api/v1/auth/logout          # Logout user
POST   /api/v1/auth/refresh-token   # Refresh JWT token
GET    /api/v1/auth/me              # Get current user
PUT    /api/v1/auth/update-profile  # Update profile
PUT    /api/v1/auth/change-password # Change password
```

### Cameras

```
GET    /api/v1/cameras              # Get all cameras
POST   /api/v1/cameras              # Create camera
GET    /api/v1/cameras/:id          # Get camera by ID
PUT    /api/v1/cameras/:id          # Update camera
DELETE /api/v1/cameras/:id          # Delete camera
PUT    /api/v1/cameras/:id/status   # Update camera status
```

### Threats

```
GET    /api/v1/threats              # Get all threats
POST   /api/v1/threats              # Create threat
GET    /api/v1/threats/:id          # Get threat by ID
PUT    /api/v1/threats/:id          # Update threat status
DELETE /api/v1/threats/:id          # Delete threat
GET    /api/v1/threats/nearby       # Get threats near location
```

### Alerts

```
GET    /api/v1/alerts               # Get all alerts
GET    /api/v1/alerts/:id           # Get alert by ID
PUT    /api/v1/alerts/:id/read      # Mark alert as read
DELETE /api/v1/alerts/:id           # Delete alert
```

### Analytics

```
GET    /api/v1/analytics/dashboard  # Dashboard statistics
GET    /api/v1/analytics/trends     # Threat trends
GET    /api/v1/analytics/camera-performance # Camera stats
GET    /api/v1/analytics/heatmap    # Threat heatmap data
```

### Notifications

```
POST   /api/v1/notifications/email  # Send email notification
POST   /api/v1/notifications/sms    # Send SMS notification
POST   /api/v1/notifications/test   # Test notifications
```

## API Usage Examples

### Register User

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "+1234567890"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Threat (with authentication)

```bash
curl -X POST http://localhost:5000/api/v1/threats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cameraId": "camera_id_here",
    "type": "person",
    "confidence": 95,
    "severity": "HIGH",
    "location": {
      "type": "Point",
      "coordinates": [77.2090, 28.6139]
    }
  }'
```

## WebSocket Events

### Client → Server

```javascript
socket.emit('join-room', 'user-123');
socket.emit('threat-detected', { threatData });
```

### Server → Client

```javascript
socket.on('new-threat', (data) => {
    console.log('New threat detected:', data);
});

socket.on('camera-status-changed', (data) => {
    console.log('Camera status:', data);
});
```

## Database Models

### User Model
- name, email, password (hashed)
- phone, role (user/admin/operator)
- preferences (email/SMS/push alerts)
- timestamps

### Camera Model
- name, deviceId, location (GeoJSON)
- status, specifications, battery
- network info, settings
- statistics (detections, threats, uptime)

### Threat Model
- type, confidence, severity
- location (GeoJSON), boundingBox
- snapshot, videoClip (S3 URLs)
- metadata (weather, time, movement)
- trajectory, status, resolution

### Alert Model
- threat, user, camera references
- type (email/SMS/push), status
- recipient, message, metadata
- retry count, timestamps

## Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting (100 requests per 15 minutes)
- Helmet.js security headers
- CORS configuration
- Input validation
- SQL injection prevention (MongoDB)
- XSS protection

## Error Handling

All errors return consistent JSON format:

```json
{
  "success": false,
  "error": "Error message here",
  "stack": "Stack trace (development only)"
}
```

## Logging

Logs are stored in `logs/` directory:
- `combined.log` - All logs
- `error.log` - Error logs only

Log levels: error, warn, info, debug

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Deployment

### Using PM2 (Production)

```bash
# Install PM2
npm install -g pm2

# Start server
pm2 start src/server.js --name drone-defense-api

# Monitor
pm2 monit

# View logs
pm2 logs drone-defense-api
```

### Using Docker

```bash
# Build image
docker build -t drone-defense-api .

# Run container
docker run -d -p 5000:5000 --env-file .env drone-defense-api
```

## Performance Optimization

- Database indexing on frequently queried fields
- Pagination for large datasets
- Compression middleware
- Caching with Redis (optional)
- Connection pooling
- Async/await for non-blocking operations

## Monitoring

- Health check endpoint: `/health`
- Winston logging
- PM2 monitoring
- Database connection monitoring

## Troubleshooting

### MongoDB Connection Error
```bash
# Check MongoDB is running
sudo systemctl status mongod

# Check connection string in .env
MONGODB_URI=mongodb://localhost:27017/drone-defense
```

### JWT Token Errors
- Ensure JWT_SECRET is set in .env
- Check token expiration time
- Verify Authorization header format: `Bearer <token>`

### Email Not Sending
- Use Gmail App Password, not regular password
- Enable 2-Step Verification in Google Account
- Check EMAIL_USER and EMAIL_PASSWORD in .env

### SMS Not Sending
- Verify phone number in Twilio console
- Check Twilio credits
- Ensure phone number format: +[country code][number]

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License

## Support

For issues and questions:
- Check this README
- Review API documentation
- Check server logs
- Contact: support@dronedefense.com

---

Built with ❤️ for IoT Drone Defense System
