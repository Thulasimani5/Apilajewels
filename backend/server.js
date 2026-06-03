const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();


const app = express();

const PORT = process.env.PORT || 5000;

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Middleware to dynamically rewrite legacy port 5000 image/file URLs to the active port
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (body) {
    if (body) {
      try {
        let str = JSON.stringify(body);
        // Replace legacy localhost:5000 with the actual request host and protocol
        const hostUrl = `${req.protocol}://${req.get('host')}`;
        str = str.replace(/http:\/\/localhost:5000/g, hostUrl);
        body = JSON.parse(str);
      } catch (e) {}
    }
    return originalJson.call(this, body);
  };
  next();
});

// Note: Static file serving removed — images are now served via Cloudinary.

// Lazily connect to MongoDB on the first request (required for Vercel serverless)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB connection failed:', err.message);
    res.status(500).json({ success: false, error: 'Database connection failed' });
  }
});

// Mount routers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jewellery', require('./routes/jewellery'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/categories', require('./routes/category'));

app.get('/', (req, res) => {
  res.send('Apila Jewels API is running...');
});

// Global error handler — catches multer errors and other unhandled errors
app.use((err, req, res, next) => {
  if (err && err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ success: false, error: 'Too many files uploaded. Maximum allowed is 20.' });
  }
  if (err && err.code && err.code.startsWith('LIMIT_')) {
    return res.status(400).json({ success: false, error: err.message });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: err.message || 'Server Error' });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
