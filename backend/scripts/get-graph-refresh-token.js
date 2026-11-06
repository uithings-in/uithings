const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const tenant = (process.env.MS_GRAPH_TENANT || "consumers").trim();
const tenantPath = encodeURIComponent(tenant || "consumers");
const clientId = (process.env.MS_GRAPH_CLIENT_ID || "").trim();
const clientSecret = (process.env.MS_GRAPH_CLIENT_SECRET || "").trim();
const sender = (process.env.MS_GRAPH_SENDER || "").trim();
const scope = (
  process.env.MS_GRAPH_SCOPE ||
  "https://graph.microsoft.com/Mail.Send offline_access"
).trim();
const shouldWriteEnv = process.argv.includes("--write");
const loginBase = `https://login.microsoftonline.com/${tenantPath}/oauth2/v2.0`;

if (!clientId) {
  console.error("MS_GRAPH_CLIENT_ID is missing in backend/.env");
  process.exit(1);
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 20000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function postForm(url, params) {
  const response = await fetchWithTimeout(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params),
  });
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

function upsertEnv(content, key, value) {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, "m");
  if (pattern.test(content)) {
    return content.replace(pattern, line);
  }
  const trimmed = content.replace(/\s*$/, "");
  return `${trimmed}\n\n# Added by npm run graph:token\n${line}\n`;
}

async function main() {
  console.log("\nRequesting a Microsoft device code...\n");

  const { response: codeResponse, data: codeData } = await postForm(
    `${loginBase}/devicecode`,
    { client_id: clientId, scope },
  );

  if (!codeResponse.ok || !codeData.device_code) {
    throw new Error(
      codeData.error_description ||
        codeData.error ||
        `Device code request failed (HTTP ${codeResponse.status})`,
    );
  }

  console.log("1. Open this URL in a browser:");
  console.log(`   ${codeData.verification_uri || codeData.verification_url}`);
  console.log("\n2. Enter this code:");
  console.log(`   ${codeData.user_code}`);
  console.log(
    `\n3. Sign in with the Outlook account you want to send from${
      sender ? ` (${sender})` : " (for example team.uithings@outlook.com)"
    } and approve access.\n`,
  );
  console.log("Waiting for approval...");

  const expiresAt =
    Date.now() + (Number(codeData.expires_in) || 900) * 1000;
  let interval = Math.max(Number(codeData.interval) || 5, 1);

  while (Date.now() < expiresAt) {
    await new Promise((resolve) => setTimeout(resolve, interval * 1000));

    const params = {
      grant_type: "urn:ietf:params:oauth:grant-type:device_code",
      client_id: clientId,
      device_code: codeData.device_code,
    };
    if (clientSecret) params.client_secret = clientSecret;

    const { response, data } = await postForm(`${loginBase}/token`, params);

    if (response.ok && data.refresh_token) {
      console.log("\nAuthorization successful.\n");
      console.log("MS_GRAPH_REFRESH_TOKEN=" + data.refresh_token);

      if (shouldWriteEnv) {
        const envPath = path.resolve(__dirname, "../.env");
        const existing = fs.existsSync(envPath)
          ? fs.readFileSync(envPath, "utf8")
          : "";
        fs.writeFileSync(
          envPath,
          upsertEnv(existing, "MS_GRAPH_REFRESH_TOKEN", data.refresh_token),
          "utf8",
        );
        console.log("\nSaved MS_GRAPH_REFRESH_TOKEN to backend/.env");
      } else {
        console.log(
          "\nCopy the value above into MS_GRAPH_REFRESH_TOKEN in backend/.env, or re-run with --write to save it automatically.",
        );
      }

      return;
    }

    if (data.error === "authorization_pending") {
      continue;
    }

    if (data.error === "slow_down") {
      interval += Number(data.interval) || 5;
      continue;
    }

    throw new Error(
      data.error_description ||
        data.error ||
        `Token request failed (HTTP ${response.status})`,
    );
  }

  throw new Error("The device code expired. Please run the script again.");
}

main().catch((error) => {
  console.error("\nAuthorization failed:", error.message);
  process.exit(1);
});
