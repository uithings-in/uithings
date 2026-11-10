const crypto = require("crypto");
const PendingRegistration = require("../models/PendingRegistration");

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
const REGISTRATION_COMPLETION_TTL_SECONDS = Math.max(
  Number(process.env.REGISTRATION_COMPLETION_TTL_MINUTES || 15) * 60,
  60,
);

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

async function savePendingRegistration({ email, name, otpHash }) {
  const now = Date.now();
  const expiresAt = now + OTP_TTL_SECONDS * 1000;
  const pending = {
    email,
    name,
    otpHash,
    attempts: 0,
    createdAt: now,
    expiresAt,
    cooldownUntil: 0,
    verified: false,
    verifiedAt: 0,
    expireAt: new Date(expiresAt),
  };

  try {
    await PendingRegistration.findOneAndUpdate(
      { email },
      { $set: pending },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );
  } catch (error) {
    if (error && error.code === 11000) {
      await PendingRegistration.updateOne({ email }, { $set: pending });
    } else {
      throw error;
    }
  }

  return pending;
}

async function getPendingRegistration(email) {
  return PendingRegistration.findOne({ email }).lean();
}

async function updatePendingRegistration(email, pending) {
  const expiresAt =
    Number(pending.expiresAt) || Date.now() + OTP_TTL_SECONDS * 1000;

  await PendingRegistration.updateOne(
    { email },
    {
      $set: {
        name: pending.name,
        otpHash: pending.otpHash,
        attempts: Number(pending.attempts || 0),
        expiresAt,
        expireAt: new Date(expiresAt),
        verified: Boolean(pending.verified),
        verifiedAt: Number(pending.verifiedAt || 0),
      },
    },
  );

  return { ...pending, expiresAt };
}

async function markPendingRegistrationVerified(email) {
  const now = Date.now();
  const expiresAt = now + REGISTRATION_COMPLETION_TTL_SECONDS * 1000;

  await PendingRegistration.updateOne(
    { email },
    {
      $set: {
        verified: true,
        verifiedAt: now,
        expiresAt,
        expireAt: new Date(expiresAt),
      },
    },
  );

  return {
    expiresAt,
    expiresIn: REGISTRATION_COMPLETION_TTL_SECONDS,
  };
}

async function clearPendingRegistration(email) {
  await PendingRegistration.deleteOne({ email });
}

async function setRegistrationCooldown(email) {
  if (OTP_RESEND_COOLDOWN_SECONDS <= 0) return;
  const cooldownUntil = Date.now() + OTP_RESEND_COOLDOWN_SECONDS * 1000;
  await PendingRegistration.updateOne({ email }, { $set: { cooldownUntil } });
}

async function getRegistrationCooldownSeconds(email) {
  if (OTP_RESEND_COOLDOWN_SECONDS <= 0) return 0;

  const pending = await PendingRegistration.findOne({ email })
    .select({ cooldownUntil: 1 })
    .lean();
  const cooldownUntil = Number(pending && pending.cooldownUntil) || 0;

  return Math.max(Math.ceil((cooldownUntil - Date.now()) / 1000), 0);
}

module.exports = {
  OTP_LENGTH,
  OTP_TTL_SECONDS,
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_COOLDOWN_SECONDS,
  REGISTRATION_COMPLETION_TTL_SECONDS,
  generateOtp,
  hashOtp,
  otpMatches,
  savePendingRegistration,
  getPendingRegistration,
  updatePendingRegistration,
  markPendingRegistrationVerified,
  clearPendingRegistration,
  setRegistrationCooldown,
  getRegistrationCooldownSeconds,
};
