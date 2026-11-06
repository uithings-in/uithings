const nodemailer = require("nodemailer");
const { getRedisClient } = require("../config/redis");

const GRAPH_LOGIN_BASE = "https://login.microsoftonline.com";
const GRAPH_API_BASE = "https://graph.microsoft.com/v1.0";
const RESEND_API_URL = "https://api.resend.com/emails";
const GRAPH_SCOPE = (
  process.env.MS_GRAPH_SCOPE ||
  "https://graph.microsoft.com/Mail.Send offline_access"
).trim();
const GRAPH_REFRESH_TOKEN_KEY = "mail:graph:refresh_token";
const GRAPH_REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 365;

let cachedAccessToken = null;
let cachedAccessTokenExpiresAt = 0;
let refreshPromise = null;

function getMailProvider() {
  const explicit = (process.env.MAIL_PROVIDER || "").trim().toLowerCase();
  if (explicit === "graph" || explicit === "smtp" || explicit === "resend") {
    return explicit;
  }

  if ((process.env.RESEND_API_KEY || "").trim()) return "resend";
  if ((process.env.MS_GRAPH_CLIENT_ID || "").trim()) return "graph";
  return "smtp";
}

function getGraphConfig() {
  const tenant = (process.env.MS_GRAPH_TENANT || "consumers").trim();
  const tenantPath = encodeURIComponent(tenant || "consumers");
  return {
    tenant,
    tenantPath,
    clientId: (process.env.MS_GRAPH_CLIENT_ID || "").trim(),
    clientSecret: (process.env.MS_GRAPH_CLIENT_SECRET || "").trim(),
    sender: (process.env.MS_GRAPH_SENDER || "").trim(),
  };
}

function normalizeToken(value) {
  if (value === null || value === undefined) return "";
  const asString = String(value).trim();
  if (asString.startsWith('"') && asString.endsWith('"')) {
    try {
      return String(JSON.parse(asString)).trim();
    } catch {
      return asString;
    }
  }
  return asString;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function isPlaceholderToken(token) {
  if (!token) return true;
  const normalized = token.toLowerCase();
  return (
    normalized.startsWith("your_") ||
    normalized.includes("your_refresh_token")
  );
}

async function getRefreshTokenCandidates() {
  const candidates = [];
  const seen = new Set();

  const push = (value, source) => {
    const token = normalizeToken(value);
    if (!token || isPlaceholderToken(token) || seen.has(token)) return;
    seen.add(token);
    candidates.push({ token, source });
  };

  try {
    const redis = getRedisClient();
    push(await redis.get(GRAPH_REFRESH_TOKEN_KEY), "redis");
  } catch {
    // Redis is optional
  }

  push(process.env.MS_GRAPH_REFRESH_TOKEN, "env");

  return candidates;
}

async function storeRefreshToken(token) {
  const normalized = normalizeToken(token);
  if (!normalized || isPlaceholderToken(normalized)) return;

  try {
    const redis = getRedisClient();
    await redis.set(GRAPH_REFRESH_TOKEN_KEY, normalized, {
      ex: GRAPH_REFRESH_TOKEN_TTL_SECONDS,
    });
  } catch {
    // The environment variable remains the fallback
  }
}

async function clearStoredRefreshToken() {
  try {
    const redis = getRedisClient();
    await redis.del(GRAPH_REFRESH_TOKEN_KEY);
  } catch {
    // Ignore
  }
}

async function requestGraphAccessToken() {
  const { tenantPath, clientId, clientSecret } = getGraphConfig();

  if (!clientId) {
    throw new Error(
      "Microsoft Graph is not configured: MS_GRAPH_CLIENT_ID is missing",
    );
  }

  const candidates = await getRefreshTokenCandidates();
  if (!candidates.length) {
    throw new Error(
      "Microsoft Graph refresh token is missing. Run `npm run graph:token` in the backend folder.",
    );
  }

  let lastError = null;

  for (const candidate of candidates) {
    const body = new URLSearchParams({
      client_id: clientId,
      grant_type: "refresh_token",
      refresh_token: candidate.token,
      scope: GRAPH_SCOPE,
    });
    if (clientSecret) body.set("client_secret", clientSecret);

    const response = await fetchWithTimeout(
      `${GRAPH_LOGIN_BASE}/${tenantPath}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      },
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.access_token) {
      const detail =
        data.error_description || data.error || `HTTP ${response.status}`;

      if (data.error === "invalid_grant") {
        lastError = new Error(
          `Microsoft Graph refresh token was rejected (${detail}). Run \`npm run graph:token\` to authorize again.`,
        );
        if (candidate.source === "redis") {
          await clearStoredRefreshToken();
        }
        continue;
      }

      throw new Error(`Microsoft Graph token request failed: ${detail}`);
    }

    cachedAccessToken = data.access_token;
    const expiresIn = Number(data.expires_in) || 3600;
    cachedAccessTokenExpiresAt =
      Date.now() + Math.max(expiresIn - 60, 30) * 1000;

    if (data.refresh_token && data.refresh_token !== candidate.token) {
      await storeRefreshToken(data.refresh_token);
    }

    return cachedAccessToken;
  }

  throw (
    lastError ||
    new Error(
      "Microsoft Graph refresh token was rejected. Run `npm run graph:token` to authorize again.",
    )
  );
}

async function getGraphAccessToken(forceRefresh = false) {
  if (
    !forceRefresh &&
    cachedAccessToken &&
    Date.now() < cachedAccessTokenExpiresAt
  ) {
    return cachedAccessToken;
  }

  if (!refreshPromise) {
    refreshPromise = requestGraphAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

function toAddressList(value) {
  const list = Array.isArray(value) ? value : [value];
  return list.map((address) => String(address || "").trim()).filter(Boolean);
}

function toRecipients(value) {
  return toAddressList(value).map((address) => ({
    emailAddress: { address },
  }));
}

async function sendViaGraph({ to, subject, html, text, replyTo }) {
  const recipients = toRecipients(to);
  if (!recipients.length) {
    throw new Error("No recipient email address provided");
  }

  const message = {
    subject,
    body: {
      contentType: html ? "HTML" : "Text",
      content: html || text || "",
    },
    toRecipients: recipients,
  };

  const replyToRecipients = toRecipients(replyTo);
  if (replyToRecipients.length) {
    message.replyTo = replyToRecipients;
  }

  const payload = JSON.stringify({ message, saveToSentItems: true });

  for (let attempt = 0; attempt < 2; attempt++) {
    const accessToken = await getGraphAccessToken(attempt > 0);

    const response = await fetchWithTimeout(
      `${GRAPH_API_BASE}/me/sendMail`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: payload,
      },
    );

    if (response.ok) return;

    const rawBody = await response.text().catch(() => "");
    let detail = rawBody || response.statusText;
    try {
      const parsed = JSON.parse(rawBody);
      detail = parsed?.error?.message || detail;
    } catch {
      // Keep the raw response text
    }

    if (response.status === 401 && attempt === 0) {
      continue;
    }

    throw new Error(
      `Microsoft Graph sendMail failed (${response.status}): ${detail}`,
    );
  }
}

function getResendConfig() {
  return {
    apiKey: (process.env.RESEND_API_KEY || "").trim(),
    fromEmail: (
      process.env.RESEND_FROM_EMAIL ||
      process.env.SMTP_FROM_EMAIL ||
      ""
    ).trim(),
    fromName: (
      process.env.RESEND_FROM_NAME ||
      process.env.SMTP_FROM_NAME ||
      "UI Things"
    ).trim(),
  };
}

async function sendViaResend({ to, subject, html, text, replyTo }) {
  const { apiKey, fromEmail, fromName } = getResendConfig();

  if (!apiKey) {
    throw new Error("Resend is not configured: RESEND_API_KEY is missing");
  }
  if (!fromEmail) {
    throw new Error("Resend is not configured: RESEND_FROM_EMAIL is missing");
  }

  const recipients = toAddressList(to);
  if (!recipients.length) {
    throw new Error("No recipient email address provided");
  }

  const body = {
    from: fromName ? `${fromName} <${fromEmail}>` : fromEmail,
    to: recipients,
    subject,
  };

  if (html) body.html = html;
  if (text) body.text = text;
  if (!html && !text) body.text = "";

  const replyToAddresses = toAddressList(replyTo);
  if (replyToAddresses.length) {
    body.reply_to = replyToAddresses;
  }

  const response = await fetchWithTimeout(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const rawBody = await response.text().catch(() => "");
  let data = {};
  try {
    data = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    data = {};
  }

  if (!response.ok) {
    const detail =
      data.message || data.error?.message || rawBody || response.statusText;
    throw new Error(`Resend send failed (${response.status}): ${detail}`);
  }

  return data;
}

function buildTransport() {
  const host = process.env.SMTP_HOST;
  if (!host) {
    return null;
  }

  const port = Number(process.env.SMTP_PORT || 587);
  const secure = port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: !secure,
    auth: user && pass ? { user, pass } : undefined,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 30000,
  });
}

function getFromAddress() {
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
  const fromName = process.env.SMTP_FROM_NAME || "Figma Components";
  return fromEmail ? `${fromName} <${fromEmail}>` : fromName;
}

async function sendViaSmtp({ to, subject, html, text, replyTo }) {
  const transport = buildTransport();
  if (!transport) {
    throw new Error("SMTP is not configured");
  }

  await transport.sendMail({
    from: getFromAddress(),
    to,
    replyTo,
    subject,
    html,
    text,
  });
}

async function sendEmail(payload) {
  const provider = getMailProvider();
  if (provider === "graph") {
    return sendViaGraph(payload);
  }
  if (provider === "resend") {
    return sendViaResend(payload);
  }
  return sendViaSmtp(payload);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return character;
    }
  });
}

async function sendContactEmail({ to, replyTo, subject, html, text }) {
  await sendEmail({ to, replyTo, subject, html, text });
}

async function sendOtpEmail({ to, name, otp, expiresInMinutes }) {
  const safeName = escapeHtml(name || "there");
  const expires = Number(expiresInMinutes) || 10;

  const subject = "Your UI Things verification code";
  const text = [
    `Hi ${name || "there"},`,
    "",
    `Your email verification code is: ${otp}`,
    "",
    `This code expires in ${expires} minutes. If you did not request this, you can safely ignore this email.`,
    "",
    "— UI Things",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #10131A;">
      <h2 style="margin: 0 0 12px; font-size: 20px;">Verify your email</h2>
      <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.5; color: #4B5563;">
        Hi ${safeName}, use the code below to verify your email and finish creating your UI Things account.
      </p>
      <div style="margin: 24px 0; padding: 16px; border-radius: 12px; background: #F5F3FF; text-align: center;">
        <span style="font-size: 32px; letter-spacing: 8px; font-weight: 700; color: #8A2BE2;">${otp}</span>
      </div>
      <p style="margin: 0 0 8px; font-size: 13px; line-height: 1.5; color: #4B5563;">
        This code expires in <strong>${expires} minutes</strong>.
      </p>
      <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #6B7280;">
        If you did not request this, you can safely ignore this email.
      </p>
    </div>
  `;

  await sendEmail({ to, subject, html, text });
}

module.exports = {
  getMailProvider,
  sendContactEmail,
  sendOtpEmail,
  sendEmail,
};
