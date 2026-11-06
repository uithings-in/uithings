const crypto = require("crypto");
const { getRedisClient } = require("../config/redis");

const OTP_LENGTH = 6;
const OTP_TTL_SECONDS = Math.max(
  Number(process.env.OTP_TTL_MINUTES || 10) * 60,
  60,
);
const OTP_MAX_ATTEMPTS = Math.max(
  Number(process.env.OTP_MAX_ATTEMPTS || 5),
  1,
);
const OTP_RESEND_COOLDOWN_SECONDS = Math.max(
  Number(process.env.OTP_RESEND_COOLDOWN_SECONDS || 60),
  0,
);

const PENDING_PREFIX = "otp:register:pending:";
const COOLDOWN_PREFIX = "otp:register:cooldown:";

function pendingKey(email) {
  return `${PENDING_PREFIX}${email}`;
}

function cooldownKey(email) {
  return `${COOLDOWN_PREFIX}${email}`;
}

function generateOtp() {
  const max = 10 ** OTP_LENGTH;
  return crypto
    .randomInt(0, max)
    .toString()
    .padStart(OTP_LENGTH, "0");
}

function hashOtp(otp) {
  const secret =
    process.env.OTP_SECRET || process.env.JWT_SECRET || "otp-dev-secret";
  return crypto
    .createHmac("sha256", secret)
    .update(String(otp))
    .digest("hex");
}

function otpMatches(plainOtp, storedHash) {
  if (!storedHash) return false;
  const candidate = Buffer.from(hashOtp(plainOtp), "hex");
  const expected = Buffer.from(String(storedHash), "hex");
  if (candidate.length !== expected.length) return false;
  return crypto.timingSafeEqual(candidate, expected);
}

function parseJsonValue(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === "object") return value;
  try {
    const parsed = JSON.parse(String(value));
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

async function savePendingRegistration({ email, name, passwordHash, otpHash }) {
  const redis = getRedisClient();
  const now = Date.now();
  const pending = {
    email,
    name,
    passwordHash,
    otpHash,
    attempts: 0,
    createdAt: now,
    expiresAt: now + OTP_TTL_SECONDS * 1000,
  };

  await redis.set(pendingKey(email), JSON.stringify(pending), {
    ex: OTP_TTL_SECONDS,
  });

  return pending;
}

async function getPendingRegistration(email) {
  const redis = getRedisClient();
  const raw = await redis.get(pendingKey(email));
  return parseJsonValue(raw);
}

async function updatePendingRegistration(email, pending) {
  const redis = getRedisClient();
  const remaining = Math.max(
    Math.ceil((pending.expiresAt - Date.now()) / 1000),
    1,
  );
  await redis.set(pendingKey(email), JSON.stringify(pending), {
    ex: remaining,
  });
  return pending;
}

async function clearPendingRegistration(email) {
  const redis = getRedisClient();
  await redis.del(pendingKey(email));
}

async function setRegistrationCooldown(email) {
  if (OTP_RESEND_COOLDOWN_SECONDS <= 0) return;
  const redis = getRedisClient();
  await redis.set(cooldownKey(email), String(Date.now()), {
    ex: OTP_RESEND_COOLDOWN_SECONDS,
  });
}

async function getRegistrationCooldownSeconds(email) {
  if (OTP_RESEND_COOLDOWN_SECONDS <= 0) return 0;

  const redis = getRedisClient();
  const raw = await redis.get(cooldownKey(email));
  if (raw === null || raw === undefined) return 0;

  const sentAt = Number(typeof raw === "object" ? raw.sentAt : raw);
  if (!sentAt || Number.isNaN(sentAt)) return 0;

  const elapsed = Math.floor((Date.now() - sentAt) / 1000);
  return Math.max(OTP_RESEND_COOLDOWN_SECONDS - elapsed, 0);
}

module.exports = {
  OTP_LENGTH,
  OTP_TTL_SECONDS,
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_COOLDOWN_SECONDS,
  generateOtp,
  hashOtp,
  otpMatches,
  savePendingRegistration,
  getPendingRegistration,
  updatePendingRegistration,
  clearPendingRegistration,
  setRegistrationCooldown,
  getRegistrationCooldownSeconds,
};
