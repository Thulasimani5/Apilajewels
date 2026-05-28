const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB(); 

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
        str = str.replace(/http:\/\/localhost:5000/g, `http://localhost:${PORT}`);
        body = JSON.parse(str);
      } catch (e) {}
    }
    return originalJson.call(this, body);
  };
  next();
});

// Make uploads folder publicly accessible
app.use('/uploads', express.static('uploads'));

// Mount routers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jewellery', require('./routes/jewellery'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/categories', require('./routes/category'));

app.get('/', (req, res) => {
  res.send('Apila Jewels API is running...');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
