# Resend Email Setup Guide

This guide configures Resend for:

- Registration OTP emails
- Contact form emails

The backend already supports Resend through `MAIL_PROVIDER=resend`. It sends with the Resend HTTP API (`POST https://api.resend.com/emails`) using `RESEND_API_KEY`; no extra npm package is required.

## Current DNS situation

- Domain: `uithings.site`
- DNS provider: Spaceship (`launch1.spaceship.net`, `launch2.spaceship.net`)
- Existing SPF/DKIM/DMARC: none
- This means there are no record conflicts to resolve before adding Resend.

## Resend free plan

- 3,000 emails per month
- 100 emails per day (hard cap; sends fail after the cap until UTC midnight)
- 3 domains
- 30-day data retention

That is enough for early OTP volume. Upgrade only if you consistently exceed 100 sends/day.

## Step 1: Create a Resend account and API key

1. Sign up at https://resend.com.
2. Open **API Keys** in the dashboard.
3. Click **Create API Key**.
4. Name it `uithings-backend`.
5. Permission: **Sending access** is enough.
6. Optionally restrict it to the `uithings.site` domain.
7. Copy the key. It starts with `re_` and is shown only once.

Do not put this key in the frontend or commit it to Git.

## Step 2: Add the domain in Resend

1. Open **Domains** in the Resend dashboard.
2. Click **Add Domain**.
3. Enter `uithings.site`.
4. Choose the region closest to your users. The dashboard will show the exact MX value for that region.
5. Keep the default Return-Path subdomain (`send`).
6. Click **Add**.
7. Open the domain's **Records** tab and leave it open; you will copy these values into Spaceship.

Resend may show either:

- MX + TXT + TXT records, or
- CNAME records for newer domains.

Always copy exactly what the Records tab shows. Do not substitute values from an old tutorial.

## Step 3: Add the DNS records in Spaceship

1. Log in to Spaceship.
2. Open **Launchpad -> Domain List**.
3. Click **uithings.site -> Manage**.
4. Open **DNS / Advanced DNS**.
5. Click **Add Record** for each record below.
6. Save each record.

Typical records (copy the real values from Resend):

| Type | Host / Name | Value / Content | Priority | TTL |
|---|---|---|---|---|
| MX | `send` | `feedback-smtp.<region>.amazonses.com` | 10 | 3600 |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` | - | 3600 |
| TXT | `resend._domainkey` | `p=MIGf...` (long DKIM key) | - | 3600 |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:team.uithings@outlook.com` | - | 3600 |

If Resend shows CNAME records instead of the MX/TXT pair, add those CNAME records exactly as shown. Set them to **DNS only** if you move DNS to Cloudflare later.

Host field notes:

- Usually enter the relative name: `send`, `resend._domainkey`, `_dmarc`.
- If Spaceship automatically appends `uithings.site`, enter the full name once, for example `send.uithings.site`.
- Do not enter `send.uithings.site.uithings.site`.
- For CNAME values, Spaceship may require a trailing dot. If the record is rejected, try the value with a trailing dot.

Do not change the existing A/CNAME records that point the website to Vercel. MX/TXT records for email are separate.

### About SPF

Resend puts its SPF record on the `send` subdomain, not the root. The root domain does not need an SPF record for Resend.

If you later add a root SPF record for another provider, there must be only one. Example:

```text
v=spf1 include:_spf.google.com ~all
```

Do not add a second `v=spf1` record. Two SPF records at the root will break SPF.

### About DMARC

The DMARC record is optional for testing but strongly recommended:

```text
v=DMARC1; p=none; rua=mailto:team.uithings@outlook.com
```

`p=none` only monitors. After a few weeks of clean reports, you can move to `p=quarantine`, then `p=reject`.

## Step 4: Verify the domain in Resend

1. Return to **Resend -> Domains -> uithings.site**.
2. Click **Verify DNS Records**.
3. Wait. Verification usually completes in 5-30 minutes, but can take up to 72 hours.
4. The domain status must become **Verified** before you can send to arbitrary recipients.

Check records from PowerShell:

```powershell
Resolve-DnsName send.uithings.site -Type MX
Resolve-DnsName send.uithings.site -Type TXT
Resolve-DnsName resend._domainkey.uithings.site -Type TXT
Resolve-DnsName _dmarc.uithings.site -Type TXT
```

You can also use https://dns.email to check public DNS visibility.

## Step 5: Configure the backend

Open `backend/.env` and set:

```env
MAIL_PROVIDER=resend
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=no-reply@uithings.site
RESEND_FROM_NAME=UI Things
OTP_SECRET=replace_with_a_long_random_secret
```

Generate a strong OTP secret:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Notes:

- `RESEND_FROM_EMAIL` must be on the verified domain. Use `no-reply@uithings.site`, not a Gmail or Outlook address.
- If `RESEND_API_KEY` is present and `MAIL_PROVIDER` is empty, the backend auto-selects Resend. Keeping `MAIL_PROVIDER=resend` explicit is safer.
- `RESEND_FROM_NAME` is the display name shown in the recipient's inbox.
- Restart the backend after changing `.env`.

## Step 6: Send a test email

From the backend folder:

```powershell
cd D:\MYPROJECTS\uithings\backend
npm run mail:test -- your@email.com
```

Expected output:

```text
Mail provider: resend
Sending test email to your@email.com...
Email sent successfully.
```

Check the inbox and the spam folder. A 2026 OTP email should include a 6-digit code.

If the command fails, see Troubleshooting below.

## Step 7: Test the registration OTP flow

1. Restart the backend (`npm run dev` or your normal start command).
2. Open the frontend registration modal.
3. Enter a name, email, and password.
4. Submit and check that the OTP email arrives.
5. Enter the 6-digit code and confirm the account is created.

The OTP is valid for 10 minutes, allows 5 attempts, and has a 60-second resend cooldown by default.

## Step 8: Verify authentication passed

Send a test to a Gmail address, open the message, click **Show original**, and check for:

```text
spf=pass
dkim=pass
dmarc=pass
```

Or use https://www.mail-tester.com and aim for 9-10/10.

PowerShell checks:

```powershell
Resolve-DnsName send.uithings.site -Type MX
Resolve-DnsName send.uithings.site -Type TXT
Resolve-DnsName resend._domainkey.uithings.site -Type TXT
Resolve-DnsName _dmarc.uithings.site -Type TXT
```

## Alternative: use Resend over SMTP

The backend also supports Resend through SMTP, with no code changes:

```env
MAIL_PROVIDER=smtp
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=re_your_api_key
SMTP_FROM_EMAIL=no-reply@uithings.site
SMTP_FROM_NAME=UI Things
```

The built-in `resend` provider is recommended because it gives clearer errors and does not need SMTP credentials.

## Troubleshooting

### Domain stays pending

- Confirm every record in Resend's **Records** tab exists in Spaceship.
- Copy DKIM values exactly. Do not add quotes, spaces, or line breaks.
- Check for a CNAME conflict on `send` or `resend._domainkey`.
- If using Cloudflare, set relevant records to **DNS only** (grey cloud) and disable CNAME flattening for Brevo-style CNAME DKIM records.
- Wait; DNS can take up to 72 hours.

### `401` or `403` from Resend

- The API key is wrong, revoked, or missing.
- Regenerate the key and update `RESEND_API_KEY`.
- Confirm the key has Sending access to `uithings.site`.

### `403 domain is not verified`

- The domain is still pending in Resend.
- The `RESEND_FROM_EMAIL` domain does not match the verified domain.
- Fix the DNS records and verify again.

### `422` from Resend

- Invalid `from`, `to`, or subject.
- `RESEND_FROM_EMAIL` is not a valid address on the verified domain.
- Check the backend log for the full Resend error message.

### `429` from Resend

- You hit a rate limit. Retry with backoff.
- If you hit the free daily cap of 100 emails, wait until UTC midnight or upgrade.

### Email lands in spam

- Confirm `spf=pass`, `dkim=pass`, `dmarc=pass`.
- Send from `no-reply@uithings.site`, not a free mailbox.
- Avoid spammy subject lines and too many links.
- A new domain has low reputation; start with low volume.
- Use mail-tester.com to inspect the score.

### Before domain verification

Resend only allows sending to your own account email from `onboarding@resend.dev` until the domain is verified. Verify `uithings.site` to send OTP emails to real users.

## Production checklist

- Add `MAIL_PROVIDER`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_FROM_NAME`, and `OTP_SECRET` to the production environment (Vercel or your backend host).
- Keep the same verified domain in production.
- OTP state is stored in MongoDB, so it works across serverless instances. Upstash Redis is optional and only used for caching and Microsoft Graph token caching.
- Add IP-based rate limiting to the OTP request/resend endpoints to protect your Resend quota.
- Redeploy or restart after adding env vars.
- Check the Resend dashboard for delivery logs after the first production OTP.

## Security notes

- Never commit `backend/.env` or the Resend API key.
- Use a Sending-access key restricted to `uithings.site`.
- Rotate the key immediately if it is exposed.
- The API key belongs only on the backend, never in frontend code.
- Keep `OTP_SECRET` private and stable; changing it invalidates outstanding OTP hashes.
