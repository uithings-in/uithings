/**
 * Regression test for the "Figma payload disappears while editing" bug.
 *
 * Scenario reproduced:
 *   A user edits a component they previously uploaded. The editor could not
 *   load the original payload (it is stripped for Pro components), so the
 *   payload box rendered empty and the client sent figmaDataBase64: "" — which
 *   the server happily stored, permanently destroying the uploaded asset.
 *
 * Run: node test-payload-preservation.js
 */
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, ".env") });

const mongoose = require("mongoose");
const request = require("http");

const { Component } = require("./src/models/Component");
const { User } = require("./src/models/User");
const { createAccessToken } = require("./src/utils/token");

const app = require("./src/index");

let server;
let baseUrl;
const created = { componentIds: [], userIds: [] };
const ORIGINAL_PAYLOAD = "UEZJR01QV1BBWS1PUklHSU5BTC1QQVlMT0FELU9SSUdJTkFM";

function api(method, url, { token, body } = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const payload = body ? JSON.stringify(body) : null;
    const req = request.request(
      {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(payload ? { "Content-Length": Buffer.byteLength(payload) } : {}),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          let parsed = null;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = data;
          }
          resolve({ status: res.statusCode, body: parsed });
        });
      },
    );
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

const results = [];
function check(name, passed, detail = "") {
  results.push({ name, passed, detail });
  console.log(`${passed ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const address = server.address();
      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
  });

  const owner = await User.create({
    name: "Payload Owner",
    email: `payload-owner-${Date.now()}@example.com`,
    password: "hashed-placeholder",
    role: "user",
  });
  created.userIds.push(owner._id);

  const other = await User.create({
    name: "Other User",
    email: `payload-other-${Date.now()}@example.com`,
    password: "hashed-placeholder",
    role: "user",
  });
  created.userIds.push(other._id);

  const ownerToken = createAccessToken({
    userId: owner._id.toString(),
    email: owner.email,
    role: "user",
  });
  const otherToken = createAccessToken({
    userId: other._id.toString(),
    email: other.email,
    role: "user",
  });

  // A Free component owned by `owner`, carrying the original payload.
  const component = await Component.create({
    name: "Original Component",
    description: "keeps its payload",
    tags: ["web"],
    previewImageUrl: "https://example.com/preview.png",
    figmaDataBase64: ORIGINAL_PAYLOAD,
    designType: "UI Design",
    pricingType: "Free",
    createdBy: owner._id,
    status: "approved",
  });
  created.componentIds.push(component._id);

  const id = component._id.toString();

  // ── 1. The core bug: an empty payload must not wipe the stored asset ──────
  const emptyPatch = await api("PATCH", `${baseUrl}/api/components/${id}`, {
    token: ownerToken,
    body: { name: "Renamed Component", figmaDataBase64: "" },
  });
  check(
    "PATCH with empty payload succeeds",
    emptyPatch.status === 200,
    `status=${emptyPatch.status}`,
  );

  let stored = await Component.findById(component._id);
  check(
    "Stored payload survives an empty figmaDataBase64",
    stored.figmaDataBase64 === ORIGINAL_PAYLOAD,
    `stored=${JSON.stringify(stored.figmaDataBase64)}`,
  );
  check(
    "Other fields are still updated",
    stored.name === "Renamed Component",
    `name=${stored.name}`,
  );

  // ── 2. A null payload must not wipe it either ─────────────────────────────
  await api("PATCH", `${baseUrl}/api/components/${id}`, {
    token: ownerToken,
    body: { description: "updated", figmaDataBase64: null },
  });
  stored = await Component.findById(component._id);
  check(
    "Stored payload survives a null figmaDataBase64",
    stored.figmaDataBase64 === ORIGINAL_PAYLOAD,
    `stored=${JSON.stringify(stored.figmaDataBase64)}`,
  );

  // ── 3. A whitespace-only payload must not wipe it ─────────────────────────
  await api("PATCH", `${baseUrl}/api/components/${id}`, {
    token: ownerToken,
    body: { figmaDataBase64: "   " },
  });
  stored = await Component.findById(component._id);
  check(
    "Stored payload survives a whitespace-only figmaDataBase64",
    stored.figmaDataBase64 === ORIGINAL_PAYLOAD,
    `stored=${JSON.stringify(stored.figmaDataBase64)}`,
  );

  // ── 4. A genuine replacement must still work ─────────────────────────────
  const NEW_PAYLOAD = "TkVXLVBBWUxPQUQtUlVQTEFDRURJTkctRk9SLURFVklDRQ==";
  const replacePatch = await api("PATCH", `${baseUrl}/api/components/${id}`, {
    token: ownerToken,
    body: { figmaDataBase64: NEW_PAYLOAD },
  });
  check(
    "PATCH with a new payload succeeds",
    replacePatch.status === 200,
    `status=${replacePatch.status}`,
  );
  stored = await Component.findById(component._id);
  check(
    "A genuine replacement payload is stored",
    stored.figmaDataBase64 === NEW_PAYLOAD,
    `stored=${JSON.stringify(stored.figmaDataBase64)}`,
  );

  // ── 5. A non-string payload is rejected outright ──────────────────────────
  const badPatch = await api("PATCH", `${baseUrl}/api/components/${id}`, {
    token: ownerToken,
    body: { figmaDataBase64: { nope: true } },
  });
  check(
    "PATCH with a non-string payload is rejected",
    badPatch.status === 400,
    `status=${badPatch.status}`,
  );
  stored = await Component.findById(component._id);
  check(
    "Stored payload survives a rejected (non-string) payload",
    stored.figmaDataBase64 === NEW_PAYLOAD,
    `stored=${JSON.stringify(stored.figmaDataBase64)}`,
  );

  // ── 6. The owner can always load the original payload for editing ────────
  const ownerFetch = await api(
    "GET",
    `${baseUrl}/api/components/${id}/figma`,
    { token: ownerToken },
  );
  check(
    "Owner can load the original payload via /:id/figma",
    ownerFetch.status === 200 &&
      ownerFetch.body?.data?.figmaDataBase64 === NEW_PAYLOAD,
    `status=${ownerFetch.status}`,
  );

  // ── 7. A non-owner cannot read another user's payload ─────────────────────
  const otherFetch = await api(
    "GET",
    `${baseUrl}/api/components/${id}/figma`,
    { token: otherToken },
  );
  check(
    "A non-owner is refused the original payload",
    otherFetch.status === 403,
    `status=${otherFetch.status}`,
  );

  // ── 8. The endpoint requires authentication ────────────────────────────────
  const anonFetch = await api("GET", `${baseUrl}/api/components/${id}/figma`);
  check(
    "Anonymous access to /:id/figma is rejected",
    anonFetch.status === 401,
    `status=${anonFetch.status}`,
  );

  // ── 9. A Pro component's owner can also load their own payload ───────────
  const proComponent = await Component.create({
    name: "Pro Component",
    description: "pro payload",
    tags: ["web"],
    previewImageUrl: "https://example.com/pro.png",
    figmaDataBase64: ORIGINAL_PAYLOAD,
    designType: "UI Design",
    pricingType: "Pro",
    createdBy: owner._id,
    status: "approved",
  });
  created.componentIds.push(proComponent._id);

  const proFetch = await api(
    "GET",
    `${baseUrl}/api/components/${proComponent._id}/figma`,
    { token: ownerToken },
  );
  check(
    "Owner can load a Pro component's payload via /:id/figma",
    proFetch.status === 200 &&
      proFetch.body?.data?.figmaDataBase64 === ORIGINAL_PAYLOAD,
    `status=${proFetch.status}`,
  );

  const proDetail = await api(
    "GET",
    `${baseUrl}/api/components/${proComponent._id}`,
  );
  check(
    "The public detail endpoint still hides the Pro payload",
    proDetail.status === 200 &&
      proDetail.body?.data?.figmaDataBase64 === undefined,
    `status=${proDetail.status}`,
  );

  // ── 10. Editing a Pro component must not wipe its payload ────────────────
  const proPatch = await api(
    "PATCH",
    `${baseUrl}/api/components/${proComponent._id}`,
    {
      token: ownerToken,
      body: { name: "Renamed Pro", figmaDataBase64: "" },
    },
  );
  check(
    "Editing a Pro component succeeds",
    proPatch.status === 200,
    `status=${proPatch.status}`,
  );
  const storedPro = await Component.findById(proComponent._id);
  check(
    "Pro component payload survives an edit",
    storedPro.figmaDataBase64 === ORIGINAL_PAYLOAD,
    `stored=${JSON.stringify(storedPro.figmaDataBase64)}`,
  );

  // ── 11. A non-owner still cannot edit the component ───────────────────────
  const foreignPatch = await api(
    "PATCH",
    `${baseUrl}/api/components/${id}`,
    { token: otherToken, body: { name: "Hijacked" } },
  );
  check(
    "A non-owner cannot edit the component",
    foreignPatch.status === 403,
    `status=${foreignPatch.status}`,
  );
}

async function cleanup() {
  await Component.deleteMany({ _id: { $in: created.componentIds } });
  await User.deleteMany({ _id: { $in: created.userIds } });
  await mongoose.disconnect();
}

run()
  .catch((err) => {
    console.error("Test run failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await cleanup();
    server?.close();
    const failed = results.filter((r) => !r.passed);
    console.log(
      `\n${results.length - failed.length}/${results.length} checks passed.`,
    );
    if (failed.length) {
      failed.forEach((f) => console.log(`  FAILED: ${f.name} — ${f.detail}`));
      process.exitCode = 1;
    }
    process.exit(process.exitCode || 0);
  });
