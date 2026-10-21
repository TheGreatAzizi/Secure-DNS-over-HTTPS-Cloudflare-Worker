# 🛡️ Secure DNS over HTTPS (DoH) V2.2.0
[![DevSponsors](https://devsponsors.github.io/assets/badges/sponsor.svg)](https://devsponsors.github.io)
### **A Cloudflare Worker DoH Resolver with Full-Pool Mode, Resolver Profiles, Safer Validation, and Parallel Racing**

[![Cloudflare Workers](https://img.shields.io/badge/Platform-Cloudflare_Workers-F38020?logo=cloudflare)](https://workers.cloudflare.com)
[![Architecture](https://img.shields.io/badge/Architecture-Parallel_Racing_v7.0-emerald)](https://github.com/TheGreatAzizi/Secure-DNS-over-HTTPS-Cloudflare-Worker)
[![Security](https://img.shields.io/badge/Privacy-DNS_Encryption-teal)](https://x.com/the_azzi)
[![Interface](https://img.shields.io/badge/UI-English_Persian_Chinese-0ea5e9)](https://github.com/TheGreatAzizi/Secure-DNS-over-HTTPS-Cloudflare-Worker)

[![中文](https://img.shields.io/badge/Readme-中文-red)](./README-Zh.md)
[![Farsi](https://img.shields.io/badge/Readme-Farsi-green)](./README-Fa.md)
![Repository Views](https://komarev.com/ghpvc/?username=TheGreatAzizi&repo=Secure-DNS-over-HTTPS-Cloudflare-Worker&color=red)

A high-performance Cloudflare Worker that provides a **custom DNS-over-HTTPS endpoint** with a built-in multilingual dashboard. Version **2.2.0** keeps the original visual design while upgrading the backend with safer request validation, bounded memory usage, upstream timeouts, resolver scoring, and a new **default full-pool mode**.

**Demo:** [dns.theazizi.ir](https://dns.theazizi.ir)  
**Default Endpoint:** `https://dns.theazizi.ir/dns-query`

---


## ✨ What's New in V2.2.0

This README is updated for Worker **VERSION 2.2.0**.

Key backend changes:
- `DEFAULT_PROFILE: 'all'`
- `/dns-query` uses the full resolver pool by default
- Optional profiles: `default`, `security`, `family`, `adblock`, `dns64`
- Safe GET base64url decoding
- Method/content-type/body-size validation
- DNS packet validation: exactly one DNS question is required
- Per-upstream timeout with `AbortController`
- `RACE_COUNT: 4`
- Bounded in-memory cache and throttle maps
- SHA-256 cache keys
- Safer HTML escaping for host-derived endpoint
- Cleaner UI JS with Clipboard API fallback
- More accurate privacy/security wording


---

## ⚠ Important Notices

### 1. Cloudflare Worker Subdomains May Be Filtered

The default Cloudflare Worker domain (`*.workers.dev`) may be filtered or unreliable on some networks. For best results, attach the Worker to a **custom domain**, for example:

```txt
dns.yourdomain.com
```

In Cloudflare DNS, make sure the domain is **Proxied** with the orange cloud enabled.

### 2. DNS Only, Not a VPN

This service **encrypts DNS queries** between the client and your Worker endpoint. It does **not** change your public IP address and does **not** hide the destination IPs you connect to.

For full traffic tunneling or IP masking, use it together with a VPN, proxy, v2rayN, Hiddify, Nekoray, Clash, or another tunneling tool.

### 3. What It Can and Cannot Bypass

This service can help with DNS poisoning, DNS hijacking, ISP DNS manipulation, and DNS-level blocking.

It does not guarantee bypass for IP blocking, SNI filtering, TLS/HTTPS blocking, QUIC blocking, DPI, or network-level throttling.

---

## 🚀 Architecture: Parallel Racing Engine

Traditional DoH services usually rely on one resolver. If that provider is slow, blocked, or unreliable, the whole service becomes slow. This Worker uses a racing engine:

- **Resolver Racing:** For every DNS query, the Worker selects the best-scoring upstream resolvers.
- **Concurrent Requests:** It races several upstreams at the same time.
- **Fastest Valid Response Wins:** The first valid DNS response is returned to the user.
- **Self-Healing Scores:** Successful resolvers gain score. Failed or timed-out resolvers lose score.
- **Timeout Protection:** Slow upstreams are aborted with `AbortController`.
- **Safe Cache:** Frequently requested records can be served from bounded in-memory cache.

Important constants:

```js
DEFAULT_PROFILE: 'all'
CACHE_TTL_SECONDS: 300
MAX_CACHE_ENTRIES: 5000
MAX_THROTTLE_ENTRIES: 20000
MAX_DNS_MESSAGE_BYTES: 4096
RATE_LIMIT_MAX_REQUESTS: 250
UPSTREAM_TIMEOUT_MS: 1800
RACE_COUNT: 4
```

---

## 🌐 Endpoints and Profiles

### Default Full-Pool Endpoint

```txt
https://dns.theazizi.ir/dns-query
```

The default endpoint uses:

```js
DEFAULT_PROFILE: 'all'
```

This means `/dns-query` uses the full resolver pool without requiring a query parameter.

### Optional Profile Endpoints

```txt
https://dns.theazizi.ir/dns-query?profile=default
https://dns.theazizi.ir/dns-query?profile=security
https://dns.theazizi.ir/dns-query?profile=family
https://dns.theazizi.ir/dns-query?profile=adblock
https://dns.theazizi.ir/dns-query?profile=dns64
```

| Profile | Purpose |
|---|---|
| `all` | Full mixed resolver pool. This is the default mode. |
| `default` | Balanced public resolvers without family/adblock/DNS64 policy mixing. |
| `security` | Security-focused resolvers with malware/threat filtering. |
| `family` | Family-safe filtering resolvers. |
| `adblock` | Ad/tracker blocking resolvers. |
| `dns64` | DNS64 resolvers for IPv6-only/NAT64 networks. |

> [!WARNING]
> The default `all` profile intentionally mixes different resolver policies. This maximizes coverage, but a result may vary when upstream providers use different filtering rules. Use a specific profile when predictable policy behavior matters.

---

## 📋 Features

- **✅ Cloudflare Worker Native:** Runs entirely on Cloudflare Workers.
- **✅ Full Resolver Pool:** Includes a large list of DoH upstreams.
- **✅ Default General Query:** `/dns-query` uses the complete pool by default.
- **✅ Optional Separated Profiles:** Choose policy-specific resolver groups when needed.
- **✅ GET and POST DoH:** Supports both standard DoH request methods.
- **✅ Safer GET base64url Handling:** Rejects invalid GET query data.
- **✅ DNS Query Validation:** Validates message size, query/response flag, QDCOUNT, and question format.
- **✅ Upstream Validation:** Verifies DNS response ID and response flag.
- **✅ Resolver Scoring:** Rewards healthy resolvers and penalizes failed or timed-out ones.
- **✅ Bounded Cache and Throttle Maps:** Reduces memory growth risk.
- **✅ Rate Limiting:** Basic 250 requests/min per IP.
- **✅ Multilingual Dashboard:** English, Persian, and Chinese UI.
- **✅ Health Endpoint:** `/health` returns resolver scores and runtime state.

---

## 📖 Deployment

1. Create a new Cloudflare Worker.
2. Paste the `worker.js` code.
3. Deploy the Worker.
4. Add a custom domain from `Settings -> Domains & Routes`.
5. In Cloudflare DNS, make sure the domain is **Proxied**.
6. Use your DoH endpoint:

```txt
https://dns.yourdomain.com/dns-query
```

---

## 🔧 Setup Guide

### Chrome / Edge / Brave

1. Go to `Settings -> Privacy and security -> Security`.
2. Enable **Use Secure DNS**.
3. Choose **Custom**.
4. Paste your endpoint:

```txt
https://dns.yourdomain.com/dns-query
```

If the browser says the provider is invalid, test the endpoint with a DoH GET request. Some networks or browser validation flows may fail even when the Worker itself is healthy.

### Firefox

1. Open `Settings -> Privacy & Security`.
2. Find **DNS over HTTPS**.
3. Select **Max Protection** or **Custom**.
4. Paste your DoH endpoint.

### Android / iOS

Native Android Private DNS expects **DoT**, not a full DoH URL. For this Worker, use a client that supports custom DoH:

- Intra
- RethinkDNS
- Firefox Mobile
- Brave Mobile

### Windows

Windows native DNS settings usually do not accept full DoH URLs like this Worker endpoint. Recommended options:

- Browser-level Secure DNS
- YogaDNS
- dnscrypt-proxy
- v2rayN/Xray DNS configuration
- Any client that supports custom DoH URLs

---

## 🧪 Quick Test

A healthy DoH GET request should return:

```txt
HTTP 200
Content-Type: application/dns-message
```

The response may include headers such as:

```txt
x-cache: HIT / MISS
x-profile: all
x-winner: <upstream-url>
x-winner-lat: <latency>
```

---

## 🧩 Notes for YouTube and Similar Services

YouTube depends on multiple domains, for example:

```txt
youtube.com
www.youtube.com
youtubei.googleapis.com
youtube.googleapis.com
googlevideo.com
ytimg.com
i.ytimg.com
ggpht.com
```

If DNS queries resolve correctly but the website still does not load, the network is likely blocking more than DNS. In that case, use a proxy/VPN/TUN-based client for full traffic tunneling.

---

## 👤 Credits & Links

Developer: **TheGreatAzizi**  
Twitter/X: [@the_azzi](https://x.com/the_azzi)
