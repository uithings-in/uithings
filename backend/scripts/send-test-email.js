const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const to = process.argv[2];

if (!to) {
  console.error("Usage: npm run mail:test -- you@example.com");
  process.exit(1);
}

const { getMailProvider, sendOtpEmail } = require("../src/utils/mailer");

async function main() {
  console.log(`Mail provider: ${getMailProvider()}`);
  console.log(`Sending test email to ${to}...`);

  await sendOtpEmail({
    to,
    name: "Test User",
    otp: "123456",
    expiresInMinutes: 10,
  });

  console.log("Email sent successfully.");
}

main().catch((error) => {
  console.error("Failed to send test email:", error.message);
  process.exit(1);
});
