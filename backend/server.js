const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const validateEnv = require('./config/envCheck');

// Load & Validate env vars
dotenv.config();
validateEnv();

const app = express();
const PORT = process.env.PORT || 5000;

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Enable CORS
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174', 'https://apilajewels.in', 'https://apilajewels.vercel.app'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));

// Visitor tracking middleware
app.use(require('./middleware/visitor'));

// Middleware to dynamically rewrite legacy port 5000 URLs
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (body) {
    if (body) {
      try {
        let str = JSON.stringify(body);
        const hostUrl = `${req.protocol}://${req.get('host')}`;
        str = str.replace(/http:\/\/localhost:5000/g, hostUrl);
        body = JSON.parse(str);
      } catch (e) {}
    }
    return originalJson.call(this, body);
  };
  next();
});

// Database connection middleware
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB connection failed:', err.message);
    res.status(500).json({ success: false, error: 'Database connection failed' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Apila Jewels API'
  });
});

// Mount routers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jewellery', require('./routes/jewellery'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/categories', require('./routes/category'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/payments', require('./routes/paymentRoutes'));

app.get('/', (req, res) => {
  res.send('Apila Jewels API is running...');
});

// Global error handler
app.use((err, req, res, next) => {
  if (err && err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ success: false, error: 'Too many files uploaded. Maximum allowed is 20.' });
  }
  if (err && err.code && err.code.startsWith('LIMIT_')) {
    return res.status(400).json({ success: false, error: err.message });
  }
  console.error('Unhandled error:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Server Error',
    code: err.code || 'SERVER_ERROR'
  });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
