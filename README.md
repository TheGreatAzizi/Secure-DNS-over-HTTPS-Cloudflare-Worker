# 🛡️ Secure DNS over HTTPS (DoH) V2.1.0

### **The Most Reliable Parallel-Racing DNS Resolver on Cloudflare Workers**

[![Cloudflare Workers](https://img.shields.io/badge/Platform-Cloudflare_Workers-F38020?logo=cloudflare)](https://workers.cloudflare.com)
[![Architecture](https://img.shields.io/badge/Architecture-Parallel_Racing_v6.0-emerald)](https://github.com/TheGreatAzizi/Secure-DNS-over-HTTPS-Cloudflare-Worker)
[![Security](https://img.shields.io/badge/Privacy-Zero_Logging-teal)](https://x.com/the_azzi)
[![Interface](https://img.shields.io/badge/UI-English_Persian_Chinese-0ea5e9)](https://github.com/TheGreatAzizi/Secure-DNS-over-HTTPS-Cloudflare-Worker)

[![中文](https://img.shields.io/badge/Readme-中文-red)](./README-Zh.md)
[![Farsi](https://img.shields.io/badge/Readme-Farsi-green)](./README-Fa.md)
![Repository Views](https://komarev.com/ghpvc/?username=TheGreatAzizi&repo=Secure-DNS-over-HTTPS-Cloudflare-Worker&color=red)

A high-performance Cloudflare Worker providing a **custom DoH endpoint** with a built-in interactive dashboard. Built with a unique **8-Way Edge Racing Engine**, this service queries over 50 global DNS nodes simultaneously to return the fastest verified result.

**Demo:** [dns.theazizi.ir](https://dns.theazizi.ir) | **Endpoint:** `https://dns.theazizi.ir/dns-query`

---

## ⚠ Important Notices (Especially for Users in Iran)

### 1. Worker Subdomains are Filtered
The default Cloudflare domain (`*.workers.dev`) is filtered inside Iran. You **MUST** attach the Worker to a **Custom Domain** (e.g., `dns.yourdomain.com`). In the Cloudflare DNS dashboard, ensure the **Orange Cloud (Proxied)** is active.

### 2. No IP Masking (DNS Only)
This tool **only encrypts your DNS lookups**. Your Public IP remains the same. External platforms (like Twitter/X) will still detect your Iranian location. For full IP masking, pair this with a proxy or VPN.

### 3. DNS-Level Bypassing Only
This service effectively bypasses DNS Poisoning (G-FW). It cannot bypass IP-level blocking, SNI filtering, or Deep Packet Inspection (DPI) on its own.

---

## 🚀 Advanced Architecture: v6.0 Racing Engine

Standard DoH can sometimes be slow due to single-provider congestion. Our Pro engine uses a superior approach:
- **8-Track Concurrency:** For every query, the worker sends requests to 8 of the best healthy global providers at the exact same time.
- **Winner Takes All:** The fastest response is returned to the user, ensuring the absolute lowest latency (sub-30ms edge resolution).
- **Self-Healing Scores:** Providers are continuously scored. If a node starts failing or lagging due to ISP interference, its weight is automatically lowered.

---

## 📋 Features

- **✅ Edge Caching:** Frequent records (like Google/Spotify) are stored in shared RAM for instant results.
- **✅ Multilingual Support:** Professional instructional UI available in English, Persian (FA), and Chinese (ZH).
- **✅ Rate-Limiting:** Automated 250 req/min per IP to prevent flood-based instability.
- **✅ Stealth Mode:** Since the query travels through **Port 443 (HTTPS)**, it looks like regular encrypted web traffic.

---

## 📖 How to Deploy

1.  **Deploy Worker:** Create a new Worker on Cloudflare and paste the `worker.js` code.
2.  **Bind Domain:** Under `Settings -> Domains & Routes`, add your custom subdomain.
3.  **Proxy:** Verify the subdomain in Cloudflare DNS settings has the orange proxy cloud enabled.

---

## 🔧 Setup Guide: Why Browser-Level is Best

### 🛑 THE LIMITATION: Native System Settings
Modern Operating Systems (Windows 11 settings, Android "Private DNS", or iOS Profiles) natively prioritize **DNS-over-TLS (DoT)** running on **Port 853**. 
*   Because Cloudflare Workers run on **Port 443**, system settings often reject an `https://` link as an "Invalid Hostname." 
*   **Result:** You cannot natively paste this URL into the Windows or Android native settings directly without receiving errors.

### 🏆 THE SOLUTION: Browser Integration (Recommended ⭐)
Web Browsers have independent DoH engines that support Port 443 perfectly. Setting this up at the browser level provides the highest stealth and reliability.

#### 🌐 Google Chrome / Chromium / Edge / Brave
1.  Go to `Settings` -> `Privacy & Security` -> `Security`.
2.  Enable **"Use Secure DNS"**.
3.  Choose **"Custom"** and paste your Neptune DoH URL.

#### 🦊 Mozilla Firefox
1.  Go to `Settings` -> `Privacy & Security`.
2.  Under `DNS over HTTPS`, select **Max Protection**.
3.  Set "Choose Provider" to **Custom** and paste your URL.

#### 📱 Mobile (Android / iOS)
- **Safari:** Safari prioritizes native DOT. We recommend using the **Firefox Mobile** or **Brave** browser on your phone for full DOH support.
- **Apps:** For system-wide use on Android, we suggest the **Intra** or **RethinkDNS** app. Use their "Custom DoH" field to add your link.

---

👤 Credits & Links
Developer: TheGreatAzizi

Twitter (X): [@the_azzi](https://x.com/the_azzi)
