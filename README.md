# 🛡️ Secure DNS over HTTPS (DoH) Pro

### **The Most Reliable Parallel-Racing DNS Resolver on Cloudflare Workers**

[![Cloudflare Workers](https://img.shields.io/badge/Platform-Cloudflare_Workers-F38020?logo=cloudflare)](https://workers.cloudflare.com)
[![Architecture](https://img.shields.io/badge/Architecture-Parallel_Racing_v4.5-emerald)](https://github.com/TheGreatAzizi/Secure-DNS-over-HTTPS-Cloudflare-Worker)
[![Security](https://img.shields.io/badge/Privacy-Zero_Logging-teal)](https://x.com/the_azzi)
[![Interface](https://img.shields.io/badge/UI-English_Persian_Chinese-0ea5e9)](https://github.com/TheGreatAzizi/Secure-DNS-over-HTTPS-Cloudflare-Worker)

A Cloudflare Worker that provides an **enterprise-grade custom DNS over HTTPS (DoH) endpoint** along with a modern, instructional dashboard. It allows you to encrypt your DNS queries, bypass DNS poisoning, and improve privacy using your own custom domain on the Cloudflare Edge network.

**Demo:** [dns.theazizi.ir](https://dns.theazizi.ir) | **Endpoint:** `https://dns.theazizi.ir/dns-query`

---

## ⚠ Important Notices (Especially for Users in Iran)

### 1. Worker Subdomains are Blocked
Cloudflare's default worker domains (`*.workers.dev`) are strictly filtered inside Iran. You **MUST connect the Worker to your own custom domain or subdomain** (e.g., `dns.yourdomain.com`) via **Workers → Settings → Domains & Routes**. Ensure the **Orange Cloud (Proxied)** is enabled.

### 2. DNS Only — Your IP Remains Public
This project **ONLY encrypts DNS queries**. Your public IP address **DOES NOT change**. 
- If you use this DNS to access platforms like **Twitter (X)**, the service may still detect your real location/IP.
- Profile activity on social media may still show you are connected from your home country (Iran).

### 3. Bypass Scope
While this Worker bypasses **DNS-level filtering** (which accounts for a large percentage of censorship), it **MAY NOT** bypass:
- **IP-level blocking** (When an IP is directly unreachable).
- **SNI Filtering** (Block based on the website name in the TLS handshake).
- **Deep Packet Inspection (DPI)**.

---

## ⚡ What do we have inside this version?

- **🚀 8-Track Parallel Racing:** For every DNS query you send, the worker contacts **8 premium global DNS providers** (Google, Cloudflare, Quad9, AdGuard, Mullvad, etc.) simultaneously. 
- **🏆 Fastest Response Wins:** The worker returns the very first verified response it receives to you, effectively eliminating the lag of any single slow or congested provider.
- **🧠 Autonomous Health Scoring:** If a provider is censored or slow, the engine drops its score automatically and promotes healthy nodes in real-time.
- **💾 Global Edge Cache:** Common domains (like Google, Spotify, or CDN assets) are cached in the Cloudflare memory bank to provide **sub-10ms** response times.

---

## 📋 What This Project Does

- Provides a highly secure `/dns-query` endpoint.
- Protects against **ISP-level monitoring** and **DNS hijacking**.
- Features a **Multilingual UI** (English, Persian, Chinese) for global users.
- Includes a **Native Apple Profile Generator** (iOS/macOS `.mobileconfig`).
- Employs **Decoy Requests** and randomized headers to evade Traffic Fingerprinting.

---

## 📖 How to Deploy

### 1. Create the Worker
- Log in to your Cloudflare Dashboard.
- Go to **Workers & Pages** -> **Create Service**.
- Paste the [worker.js](./worker.js) code and click **Deploy**.

### 2. Connect a Custom Domain (Required for Restricted Regions)
- Inside the Worker settings, go to **Settings → Domains & Routes**.
- Add a custom domain or subdomain (e.g., `doh.yourdomain.com`).
- Ensure DNS is proxied (**Orange Cloud enabled**).

---

## 🔧 Implementation Guide per Device

### 🌐 Web Browsers (Recommended ⭐)
*Browser-level DoH is the gold standard for stability.*
- **Chrome / Edge / Brave:** `Settings` -> `Privacy & Security` -> `Use secure DNS` -> `With: Custom` -> Paste your endpoint URL.
- **Firefox:** `Settings` -> Search `DNS` -> `DNS over HTTPS` -> Set to **Max Protection** -> Custom -> Paste your link.

### 🍎 Apple (iOS / iPadOS / macOS)
- Apple settings don't support pasting DoH links directly.
- Open your Worker's home page (e.g., `https://dns.example.com`) in Safari.
- Go to the **Apple** tab and download the configuration profile.
- On iPhone: **Settings -> Profile Downloaded -> Install**.

### 📱 Android
- Android "Private DNS" only accepts **DOT (Port 853)** hostnames. Cloudflare Workers do **NOT** support DOT natively.
- **To use on Android:** You must use a relay app like **RethinkDNS** or **Intra**. Choose "Custom DOH" and paste your link.

### 💻 Linux
- Configure using `systemd-resolved`, `dnscrypt-proxy`, or the browser-level settings.

### ⚙ Proxy Clients (Xray / v2rayNG)
```json
"dns": {
  "servers": [
    { "address": "https://your-custom-domain.com/dns-query", "skipFallback": true },
    "1.1.1.1"
  ],
  "queryStrategy": "UseIPv4"
}
```
---

## 🛠️ Technical Specifications
- Endpoint: Supports POST and GET (Base64) formats.
- Logic: Worker-side Race Engine with AbortController for concurrency cleanup.
- Cache: Edge-Cache Bank with TTL synchronization.
- Compatibility: Optimized for browser-level resolution and Xray/Sing-Box core clients.
- Rate Limit: Automated 200 requests/minute protection per unique IP.

---

## 👤 Author & Support
Made with ❤️ by TheGreatAzizi
| X (Twitter): [@the_azzi](https://x.com/the_azzi)
