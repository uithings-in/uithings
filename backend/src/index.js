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
const userRoutes = require("./routes/userRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((value) => value.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  const norm = origin.replace(/\/+$/, "").toLowerCase();

  // Explicitly block deprecated domains
  if (norm.includes("figmacomponents.site") || norm.includes("figcomponents.site")) {
    return false;
  }

  // Allow uithings.site, admin.uithings.site, localhost, and Vercel deployments
  return (
    allowedOrigins.some((allowed) => norm === allowed.toLowerCase()) ||
    norm.includes("localhost") ||
    norm.includes("127.0.0.1") ||
    norm.includes("uithings.site") ||
    norm.endsWith("uithings.site") ||
    norm.endsWith(".vercel.app")
  );
};

const corsOptions = {
  origin(origin, callback) {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));


app.use(compression());
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));

// Domain security: block all requests coming from deprecated/unauthorized domains
app.use((req, res, next) => {
  const origin = (req.headers.origin || req.headers.referer || "").toLowerCase();
  if (origin.includes("figmacomponents.site") || origin.includes("figcomponents.site")) {
    return res.status(403).json({
      success: false,
      message: "Access via this domain is permanently disabled. Please use https://admin.uithings.site",
    });
  }
  next();
});

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
app.use("/api/users", userRoutes);

app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT || 5000);

if (!process.env.VERCEL) {
  async function startServer() {
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`API listening on http://localhost:${port}`);
    });

    try {
      await connectDatabase();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("⚠️ Initial DB connection delayed:", error.message);
    }

    // Log Redis connection status
    const redis = getRedisClient();
    if (redis) {
      // eslint-disable-next-line no-console
      console.log("✅ Redis connected (Upstash)");
    } else {
      // eslint-disable-next-line no-console
      console.warn("⚠️  Redis disabled – UPSTASH_REDIS_REST_URL not set. Running without cache.");
    }
  }

  startServer().catch((error) => {
    // eslint-disable-next-line no-console
    console.error("Server boot error:", error.message);
  });
}

module.exports = app;

