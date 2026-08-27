const mongoose = require("mongoose");

let isConnecting = null;

async function connectDatabase() {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  if (isConnecting) {
    await isConnecting;
    return;
  }
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is missing in environment variables.");
  }

  mongoose.set("strictQuery", true);
  isConnecting = mongoose.connect(mongoUri, {
    maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE || 20),
    minPoolSize: Number(process.env.MONGO_MIN_POOL_SIZE || 5),
    serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 10000),
    socketTimeoutMS: Number(process.env.MONGO_SOCKET_TIMEOUT_MS || 45000),
  });

  try {
    await isConnecting;
    // eslint-disable-next-line no-console
    console.log("MongoDB connected");
  } finally {
    isConnecting = null;
  }
}

module.exports = { connectDatabase };
