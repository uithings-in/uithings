const jwt = require("jsonwebtoken");

function createAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

function createRegistrationToken(payload) {
  return jwt.sign(
    { ...payload, purpose: "registration" },
    process.env.JWT_SECRET,
    { expiresIn: "15m" },
  );
}

function verifyRegistrationToken(token) {
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  if (payload.purpose !== "registration") {
    throw new Error("Invalid registration token");
  }
  return payload;
}

module.exports = {
  createAccessToken,
  verifyAccessToken,
  createRegistrationToken,
  verifyRegistrationToken,
};
