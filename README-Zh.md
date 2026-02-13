# 🛡️ Secure DNS over HTTPS (DoH) V2.1

### **基于 Cloudflare Worker 的全自动全球并行竞赛解析服务**

[![Cloudflare Workers](https://img.shields.io/badge/Platform-Cloudflare_Workers-F38020?logo=cloudflare)](https://workers.cloudflare.com)
[![Architecture](https://img.shields.io/badge/Architecture-Parallel_Racing_v6.0-emerald)](https://github.com/TheGreatAzizi/Secure-DNS-over-HTTPS-Cloudflare-Worker)
[![Security](https://img.shields.io/badge/Privacy-Zero_Logging-teal)](https://x.com/the_azzi)
[![Interface](https://img.shields.io/badge/UI-English_Persian_Chinese-0ea5e9)](https://github.com/TheGreatAzizi/Secure-DNS-over-HTTPS-Cloudflare-Worker)

[![English](https://img.shields.io/badge/Readme-English-blue)](./README.md)
[![Farsi](https://img.shields.io/badge/Readme-Farsi-green)](./README-Fa.md)
![Repository Views](https://komarev.com/ghpvc/?username=TheGreatAzizi&repo=Secure-DNS-over-HTTPS-Cloudflare-Worker&color=red)

这是一个高性能的 Cloudflare Worker 解析器，通过独有的 **8 路径并行竞赛引擎 (8-Way Edge Racing)**，同时向全球 50 多个权威 DNS 节点发起请求，并瞬时返回最快且已验证的解析结果。它内置了交互式说明页面，旨在提升隐私、防止 DNS 投毒及绕过特定区域的域名限制。

**在线演示:** [dns.theazizi.ir](https://dns.theazizi.ir) | **配置地址:** `https://dns.theazizi.ir/dns-query`

---

## ⚠ 重要声明（受限地区用户必读）

### 1. 默认域名干扰
Cloudflare 的默认分配域名 (`*.workers.dev`) 在部分受限地区可能已被防火墙干扰。您 **必须** 将此 Worker 绑定到您 **自定义域名**（如 `dns.yourdomain.com`）。请确保 Cloudflare DNS 面板中的 **小云朵 (Proxied)** 已开启。

### 2. 不改变公网 IP
该工具 **仅加密 DNS 查询过程**。它不会改变您的公网 IP 地址。访问 X (Twitter) 等社交平台时，服务器仍会检测到您的原始地理位置。如需全局隐身，请配合 VPN 或 Proxy 使用。

### 3. 解析局限性
该服务主要解决 DNS 污染问题。它本身无法绕过 IP 级别屏蔽、SNI 过滤或深度包检测 (DPI)。

---

## 🚀 核心架构：v6.0 智能竞速引擎

常规 DoH 请求可能会因为单一点位拥塞而响应缓慢。本版本通过以下机制确保零延迟：
- **8 路径并发:** 每一个 DNS 请求都会同步发送至全球 8 个当前得分最高的解析服务器（涵盖 Google, Cloudflare, Quad9, AdGuard 等）。
- **最快响应胜出:** Worker 只采用第一个返回的合法解析包，从而将解析延迟降至极致（边缘节点处理时间通常小于 30ms）。
- **节点自动评价:** 系统自动对服务器性能评分。若某个节点出现连接超时或污染，其权重将瞬间自动下降并退出优先解析列表。

---

## 📋 功能特点

- **✅ 边缘缓存:** 热门网站记录（如 Google, Spotify 等）会存储在共享的 RAM 中，实现瞬时解析响应。
- **✅ 多语言支持:** 内置英语、波斯语 (FA) 和简体中文 (ZH) 的图形化配置教程。
- **✅ 请求频率保护:** 每个 IP 每分钟限制 250 次请求，有效防止暴力请求并确保系统长期稳定运行。
- **✅ 隐匿通信:** 查询流量包裹在 **端口 443 (HTTPS)** 协议中，看起来与普通网页浏览完全一致，极难被精准拦截。

---

## 📖 如何部署

1. **部署 Worker:** 在 Cloudflare 面板新建 Worker，并粘贴项目中的 `worker.js` 代码。
2. **绑定域名:** 在 Worker 的 `Settings -> Domains & Routes` 中，添加您的自定义二级域名。
3. **启用代理:** 确保该域名的 Cloudflare DNS 设置中处于 **开启 (Proxied)** 代理状态。

---

## 🔧 配置指南：为何“浏览器配置”是最佳选择？

### 🛑 核心技术差异：DoH vs DoT
现代操作系统（Windows 11 系统设置、安卓的“私有 DNS”、或 iOS 的内置描述文件）通常默认采用运行在 **853 端口** 上的 **DNS-over-TLS (DoT)**。
*   由于此 Cloudflare Worker 运行在 **443 端口** (HTTPS)，大多数操作系统的原生设置项并不接受 `https://` 开头的完整链接，并会报错。

### 🏆 最佳解决方案：浏览器内置设置（强烈推荐 ⭐）
浏览器自带独立的 DoH 引擎，不仅完美支持 443 端口，其稳定性也远超系统全局配置方案。

#### 🌐 Google Chrome, Edge, Brave, Chromium 系列
1. 进入“设置” -> “隐私和安全” -> “安全性”。
2. 开启 **“使用安全 DNS”**。
3. 选择 **“自定义 (Custom)”**。
4. 粘贴上方属于您的 DoH 解析端点 URL。

#### 🦊 Mozilla Firefox
1. 进入“设置” -> 搜索“DNS”。
2. 找到 **“基于 HTTPS 的 DNS”**。
3. 设置为 **“最高保护”**。
4. 选择自定义解析商，并输入您的 DoH 地址。

#### 📱 移动端 (安卓与 iOS)
- **Safari:** 苹果设备目前较难通过原生界面设置 Port 443 解析。建议安装 **火狐浏览器 (Firefox)** 或 **Brave**，并在这些浏览器的应用设置中进行配置。
- **全局应用:** 如果需要在手机上全系统使用，建议安装 **Intra** 或 **RethinkDNS**。在 App 中选择“自定义 DoH 解析”并输入本页面的链接。

---

👤 开发人员与技术支持
项目作者: TheGreatAzizi

X (Twitter): https://x.com/the_azzi
