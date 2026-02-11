# Secure DNS over HTTPS 

A Cloudflare Worker that provides a **custom DNS over HTTPS (DoH) endpoint** along with a simple instructional web page.  
It allows users to securely encrypt DNS queries using their own domain, improving privacy and helping bypass DNS-based filtering.

---

## ⚠ Important (For Users in Iran)

Cloudflare default worker domains (e.g. `*.workers.dev`) are filtered inside Iran.

You **must connect the Worker to your own custom domain or subdomain** (for example: `dns.yourdomain.com`) in order for it to work properly.

If you do not attach your own domain, the DNS endpoint will likely be inaccessible.

---

## What This Project Does

- Provides a `/dns-query` endpoint that forwards DNS queries securely to Cloudflare DNS.
- Encrypts DNS requests using HTTPS (DoH).
- Displays a simple web interface with:
  - Your custom DNS link
  - A copy button
  - Step-by-step configuration instructions

---

## Why Use This?

Using DNS over HTTPS:

- Encrypts DNS queries (prevents ISP-level monitoring)
- Prevents DNS tampering or hijacking
- Helps bypass **DNS-based filtering**
- Allows you to use your own domain as a secure DNS endpoint

> In Iran, many websites are blocked using DNS-level filtering.  
> Using this Worker can bypass most DNS-based restrictions.  
> However, it may not bypass IP-level blocking or deep packet inspection (DPI).

---

## Deployment Guide

### 1️⃣ Create the Worker

1. Go to Cloudflare Dashboard  
2. Open **Workers & Pages**
3. Create a new Worker
4. Paste the provided Worker code
5. Deploy

---

### 2️⃣ Connect a Custom Domain (Required for Iran)

1. Go to **Workers → Settings → Domains & Routes**
2. Add a custom domain or subdomain  
   Example: dns.yourdomain.com
3. Ensure DNS is proxied through Cloudflare (orange cloud enabled)

After this step, your DoH endpoint will be:
https://dns.yourdomain.com/dns-query

---

## How to Use the DNS Link

### Windows / macOS (Browser Method – Recommended)

In Chrome or Firefox:

1. Go to browser settings
2. Find **Secure DNS** or **DNS over HTTPS**
3. Choose **Custom Provider**
4. Paste your DNS link

---

### Android

Settings → Network → Private DNS  
Enter your custom domain (if using DoT-compatible configuration)  
Or use a browser with custom DoH support.

---

### iOS

Use a DNS configuration app that supports DNS over HTTPS (DoH)  
Paste your DNS link there.

---

### Linux

You can configure DoH using:

- systemd-resolved
- dnscrypt-proxy
- Browser-level DoH settings

---

## How It Works

1. User sets your custom DoH endpoint.
2. DNS queries are sent via HTTPS.
3. The Worker forwards them to Cloudflare DNS.
4. Cloudflare resolves the domain securely.
5. Encrypted DNS response is returned to the user.

---

## Technical Notes

- Only supports DNS over HTTPS (DoH)
- Does not support plain DNS (Port 53)
- Does not support DNS over TLS (DoT) unless configured separately
- Designed for browser-level or DoH-compatible clients

---

## Security & Limitations

- Bypasses most DNS-based filtering.
- Does NOT guarantee bypass of:
  - IP blocking
  - SNI filtering
  - Deep Packet Inspection (DPI)

Performance depends on Cloudflare network availability.

---

## Contributing

Pull requests and improvements are welcome.

---

## 👤 Author

Made with ❤️ by **TheAzizi**  
https://x.com/the_azzi

---

## 🔗 Useful Links

- [Cloudflare](https://cloudflare.com/)

