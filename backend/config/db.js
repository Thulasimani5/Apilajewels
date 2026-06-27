const mongoose = require('mongoose');

const connectDB = async () => {
  // Use Mongoose's actual connection state (1 = connected)
  if (mongoose.connection.readyState === 1) return;

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    // Don't call process.exit in serverless — just throw so the request gets a 500
    throw error;
  }
};

module.exports = connectDB;
