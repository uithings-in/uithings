const express = require("express");
const cors = require("cors");
const compression = require("compression");
const dotenv = require("dotenv");
const path = require("path");

// Load dotenv FIRST before any other imports
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const dns = require("dns");

if (!process.env.VERCEL) {
  try {
    dns.setDefaultResultOrder("ipv4first");
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
  } catch (e) {
    // ignore DNS configuration errors
  }
}

const { connectDatabase } = require("./config/database");
const { getRedisClient } = require("./config/redis");
const authRoutes = require("./routes/authRoutes");
const componentRoutes = require("./routes/componentRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const planRoutes = require("./routes/planRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const contactRoutes = require("./routes/contactRoutes");
const tagRoutes = require("./routes/tagRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((value) => value.trim().replace(/\/+$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      const norm = origin.replace(/\/+$/, "");
      const isAllowed =
        allowedOrigins.length === 0 ||
        allowedOrigins.includes(norm) ||
        allowedOrigins.includes("*") ||
        norm.endsWith(".vercel.app") ||
        norm.endsWith("uithings.site") ||
        norm.endsWith("figcomponents.site");

      if (isAllowed) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(compression());
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));

// Ensure DB is connected for every request (especially serverless cold starts)
app.use(async (req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (err) {
    next(err);
  }
});

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

app.get("/api/debug/razorpay", (req, res) => {
  const { razorpay } = require("./config/razorpay");
  res.json({
    razorpayInitialized: !!razorpay,
    keyId: razorpay ? "***" : null,
    envKeyId: process.env.RAZORPAY_KEY_ID ? "SET" : "MISSING",
    envKeySecret: process.env.RAZORPAY_KEY_SECRET ? "SET" : "MISSING",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/components", componentRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/tags", tagRoutes);

app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT || 5000);

if (!process.env.VERCEL) {
  async function startServer() {
    await connectDatabase();

    // Log Redis connection status
    const redis = getRedisClient();
    if (redis) {
      // eslint-disable-next-line no-console
      console.log("✅ Redis connected (Upstash)");
    } else {
      // eslint-disable-next-line no-console
      console.warn("⚠️  Redis disabled – UPSTASH_REDIS_REST_URL not set. Running without cache.");
    }

    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`API listening on http://localhost:${port}`);
    });
  }

  startServer().catch((error) => {
    // eslint-disable-next-line no-console
    console.error("Server boot failed", error.message);
    process.exit(1);
  });
}

module.exports = app;

