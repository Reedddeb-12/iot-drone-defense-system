// Main Server File
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const http = require('http');
const socketIO = require('socket.io');

// Import configurations
const connectDB = require('./config/database');
const logger = require('./config/logger');
const { errorHandler } = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const cameraRoutes = require('./routes/camera.routes');
const threatRoutes = require('./routes/threat.routes');
const alertRoutes = require('./routes/alert.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const notificationRoutes = require('./routes/notification.routes');
const deviceRoutes = require('./routes/device.routes');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIO(server, {
    cors: {
        origin: process.env.CORS_ORIGIN?.split(',') || '*',
        methods: ['GET', 'POST']
    }
});

// Connect to Database
connectDB();

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true
}));
app.use(compression()); // Compress responses
app.use(express.json({ limit: '50mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Rate limiting
app.use('/api/', rateLimiter);

// Make io accessible to routes
app.set('io', io);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
    });
});

// API Routes
const API_PREFIX = `/api/${process.env.API_VERSION || 'v1'}`;

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/cameras`, cameraRoutes);
app.use(`${API_PREFIX}/threats`, threatRoutes);
app.use(`${API_PREFIX}/alerts`, alertRoutes);
app.use(`${API_PREFIX}/analytics`, analyticsRoutes);
app.use(`${API_PREFIX}/notifications`, notificationRoutes);
app.use(`${API_PREFIX}/devices`, deviceRoutes);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handling middleware
app.use(errorHandler);

// Socket.IO connection handling
io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        logger.info(`Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on('threat-detected', (data) => {
        io.to(data.roomId).emit('new-threat', data);
    });

    socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
    });
});

// Start server
const PORT = process.env.PORT || 5000;
const WEBSOCKET_PORT = process.env.WEBSOCKET_PORT || 5001;

server.listen(PORT, () => {
    logger.info(`
╔════════════════════════════════════════════════════════════╗
║   Drone Defense System - Backend API Server               ║
╚════════════════════════════════════════════════════════════╝

🚀 Server running on: http://localhost:${PORT}
🔌 WebSocket running on: http://localhost:${PORT}
📊 Environment: ${process.env.NODE_ENV}
📡 API Version: ${process.env.API_VERSION || 'v1'}

API Endpoints:
  - POST   ${API_PREFIX}/auth/register
  - POST   ${API_PREFIX}/auth/login
  - GET    ${API_PREFIX}/cameras
  - POST   ${API_PREFIX}/threats
  - POST   ${API_PREFIX}/alerts
  - GET    ${API_PREFIX}/analytics
  - POST   ${API_PREFIX}/notifications/email
  - POST   ${API_PREFIX}/notifications/sms

📖 API Documentation: http://localhost:${PORT}/api-docs
🏥 Health Check: http://localhost:${PORT}/health
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
});

process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Rejection:', err);
    server.close(() => process.exit(1));
});

module.exports = { app, io };
