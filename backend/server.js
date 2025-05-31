require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const morgan = require('morgan');
const helmet = require('helmet');

// Debug environment variables
console.log('🔍 Environment Variables Debug:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  hasJWT_SECRET: !!process.env.JWT_SECRET,
  JWT_SECRET_length: process.env.JWT_SECRET?.length,
  JWT_EXPIRE: process.env.JWT_EXPIRE,
  MONGODB_URI: process.env.MONGODB_URI ? '***configured***' : 'missing',
  CLIENT_URL: process.env.CLIENT_URL
});

// Import utilities and routes
const { SOCKET_EVENTS } = require('./utils/constants');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const partnerRoutes = require('./routes/partners');
const analyticsRoutes = require('./routes/analytics');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 30000,
  allowUpgrades: true,
  perMessageDeflate: {
    threshold: 2048
  }
});

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'x-auth-token',
    'Origin',
    'X-Requested-With',
    'Accept'
  ],
  credentials: true,
  optionsSuccessStatus: 200 // Support legacy browsers
}));

// Add preflight handling for all routes
app.options('*', cors());

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Logging middleware (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB database:', mongoose.connection.name);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });

// Connection event listeners
mongoose.connection.on('connected', () => {
  console.log('📊 MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('🔥 MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('📡 MongoDB disconnected');
});

// Test route for database connection
app.get('/test-db', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    res.json({
      status: 'success',
      database: mongoose.connection.name,
      connectionState: states[dbState],
      message: 'Database connection is working!'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Zomato Ops Pro API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/analytics', analyticsRoutes);

// Socket.IO authentication middleware
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    
    if (token) {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id || decoded.userId;
      socket.userRole = decoded.role;
      console.log(`✅ Socket authenticated for user: ${socket.userId}, role: ${socket.userRole}`);
    } else {
      console.log('⚠️ Socket connection without token - allowing anonymous connection');
    }
    
    next(); // Always allow connection, even without auth
  } catch (error) {
    console.log('⚠️ Socket authentication error:', error.message);
    // Allow connection even with auth errors
    next();
  }
});

// Socket.IO connection handling
io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
  console.log(`Client connected: ${socket.id}${socket.userId ? ` (User: ${socket.userId})` : ''}`);

  socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
    console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
  });
});

// Start server
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

const startServer = (port) => {
  server.listen(port, HOST, () => {
    console.log(`
🚀 Zomato Ops Pro Server is running!
📍 Environment: ${process.env.NODE_ENV || 'development'}
🔗 Server URL: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${port}
📊 Health Check: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${port}/health
📚 API Docs: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${port}/api
🔐 MongoDB: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/zomato_ops_pro'}
🌐 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}
⚡ Socket.IO: Ready for real-time communications
    `);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ Port ${port} is busy, trying ${port + 1}`);
      startServer(port + 1);
    } else {
      console.error('❌ Server error:', err);
      process.exit(1);
    }
  });
};

startServer(PORT);

// Export for testing
module.exports = { app, server, io }; 