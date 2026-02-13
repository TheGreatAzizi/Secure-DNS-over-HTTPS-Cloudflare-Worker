# 🛡️ Secure DNS over HTTPS (DoH)

### **基于 Cloudflare Workers 的最可靠并行竞速 DNS 解析器**

[![Cloudflare Workers](https://img.shields.io/badge/Platform-Cloudflare_Workers-F38020?logo=cloudflare)](https://workers.cloudflare.com)
[![Architecture](https://img.shields.io/badge/Architecture-Parallel_Racing_v4.5-emerald)](https://github.com/TheGreatAzizi/Secure-DNS-over-HTTPS-Cloudflare-Worker)
[![Security](https://img.shields.io/badge/Privacy-Zero_Logging-teal)](https://x.com/the_azzi)
[![Interface](https://img.shields.io/badge/UI-English_Persian_Chinese-0ea5e9)](https://github.com/TheGreatAzizi/Secure-DNS-over-HTTPS-Cloudflare-Worker)

[![English](https://img.shields.io/badge/Readme-English-blue)](./README.md)
[![Farsi](https://img.shields.io/badge/Readme-Farsi-green)](./README-Fa.md)
![Repository Views](https://komarev.com/ghpvc/?username=TheGreatAzizi&repo=Secure-DNS-over-HTTPS-Cloudflare-Worker&color=red)

一个基于 Cloudflare Worker 的项目，提供**企业级自定义 DNS over HTTPS (DoH) 端点**以及现代化的教学仪表盘。它允许你在 Cloudflare 边缘网络上使用自己的自定义域名来加密 DNS 查询、绕过 DNS 污染并提升隐私性。

**演示：** [dns.theazizi.ir](https://dns.theazizi.ir) | **端点：** `https://dns.theazizi.ir/dns-query`

---

## ⚠ 重要提示（特别是伊朗用户）

### 1. Worker 子域名已被封锁
Cloudflare 默认的 worker 域名（`*.workers.dev`）在伊朗境内被严格过滤。你**必须通过 Workers → Settings → Domains & Routes 将 Worker 绑定到你自己的自定义域名或子域名**（例如：`dns.yourdomain.com`）。请确保启用 **橙色云（已代理 / Proxied）**。

### 2. 仅限 DNS —— 你的 IP 仍然公开
本项目**仅加密 DNS 查询**。你的公网 IP 地址**不会改变**。  
- 如果你使用此 DNS 访问类似 **Twitter (X)** 之类的平台，服务仍可能检测到你的真实位置/IP。  
- 社交媒体上的个人资料活动仍可能显示你是从本国（伊朗）连接。

### 3. 绕过范围
虽然本 Worker 可以绕过**基于 DNS 层的过滤**（占审查的大部分比例），但**可能无法**绕过：
- **IP 级封锁**（当 IP 直接不可达时）。
- **SNI 过滤**（基于 TLS 握手中的网站名称进行封锁）。
- **深度包检测（DPI）**。

---

## ⚡ 本版本包含哪些功能？

- **🚀 8 轨并行竞速：** 每当你发送一个 DNS 查询，Worker 会同时联系 **8 个高级全球 DNS 提供商**（Google、Cloudflare、Quad9、AdGuard、Mullvad 等）。  
- **🏆 最快响应胜出：** Worker 会将收到的第一个经过验证的响应返回给你，有效消除单个慢速或拥堵提供商带来的延迟。  
- **🧠 自主健康评分：** 如果某个提供商被审查或变慢，系统会自动降低其评分，并实时提升健康节点。  
- **💾 全球边缘缓存：** 常见域名（例如 Google、Spotify 或 CDN 资源）会缓存在 Cloudflare 内存银行中，提供**低于 10ms**的响应时间。

---

## 📋 本项目功能

- 提供高度安全的 `/dns-query` 端点。  
- 防止 **ISP 级监控** 和 **DNS 劫持**。  
- 提供 **多语言 UI**（英语、波斯语、中文）以供全球用户使用。  
- 包含 **原生 Apple 配置文件生成器**（iOS/macOS `.mobileconfig`）。  
- 使用 **诱饵请求（Decoy Requests）** 和随机化请求头来规避流量指纹识别。

---

## 📖 如何部署

### 1. 创建 Worker
- 登录你的 Cloudflare 控制面板。  
- 进入 **Workers & Pages** → **Create Service**。  
- 粘贴 [worker.js](./worker.js) 代码并点击 **Deploy**。

### 2. 绑定自定义域名（受限地区必需）
- 在 Worker 设置中，进入 **Settings → Domains & Routes**。  
- 添加一个自定义域名或子域名（例如：`doh.yourdomain.com`）。  
- 确保 DNS 处于代理状态（**已启用橙色云**）。

---

## 🔧 各设备使用指南

### 🌐 浏览器（推荐 ⭐）
*浏览器级 DoH 是稳定性的黄金标准。*  
- **Chrome / Edge / Brave：** `Settings` → `Privacy & Security` → `Use secure DNS` → `With: Custom` → 粘贴你的端点 URL。  
- **Firefox：** `Settings` → 搜索 `DNS` → `DNS over HTTPS` → 设置为 **Max Protection** → 自定义 → 粘贴你的链接。

### 🍎 Apple（iOS / iPadOS / macOS）
- Apple 设置不支持直接粘贴 DoH 链接。  
- 在 Safari 中打开你的 Worker 首页（例如：`https://dns.example.com`）。  
- 进入 **Apple** 标签页并下载配置文件。  
- 在 iPhone 上：**Settings → Profile Downloaded → Install**。

### 📱 Android
- Android 的“Private DNS”仅接受 **DOT（端口 853）** 主机名。Cloudflare Workers **不原生支持 DOT**。  
- **在 Android 上使用：** 必须使用中继应用，例如 **RethinkDNS** 或 **Intra**。选择 “Custom DOH” 并粘贴你的链接。

### 💻 Linux
- 使用 `systemd-resolved`、`dnscrypt-proxy` 或浏览器级设置进行配置。

### ⚙ 代理客户端（Xray / v2rayNG）
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

## 🛠️ 技术规格
- 端点：支持 POST 和 GET（Base64）格式。  
- 逻辑：Worker 端竞速引擎，使用 AbortController 进行并发清理。  
- 缓存：边缘缓存银行，支持 TTL 同步。  
- 兼容性：针对浏览器级解析及 Xray/Sing-Box 核心客户端优化。  
- 速率限制：对每个唯一 IP 自动保护，限制为每分钟 200 次请求。

---

## 👤 作者与支持
用 ❤️ 制作 —— TheGreatAzizi  
| X（Twitter）：[@the_azzi](https://x.com/the_azzi)
