/**
 * PROJECT: SECURE DNS OVER HTTPS (DOH-ONLY CLOUDNET)
 * ARCHITECTURE: Edge-Racing Multi-Resolver v4.0
 * REPOSITORY: https://github.com/TheGreatAzizi/Secure-DNS-over-HTTPS-Cloudflare-Worker
 * DEVELOPER: @the_azzi
 */

const DNS_UPSTREAMS = [
  "https://cloudflare-dns.com/dns-query", "https://dns.google/dns-query",
  "https://dns.quad9.net/dns-query", "https://1.1.1.1/dns-query",
  "https://8.8.8.8/dns-query", "https://9.9.9.9/dns-query",
  "https://dns.nextdns.io/dns-query", "https://doh.mullvad.net/dns-query",
  "https://freedns.controld.com/p0", "https://doh.applied-privacy.net/query",
  "https://anycast.uncensoreddns.org/dns-query", "https://dns.adguard-dns.com/dns-query",
  "https://doh.cleanbrowsing.org/doh/family-filter/", "https://dnsforge.de/dns-query",
  "https://unfiltered.adguard-dns.com/dns-query", "https://doh.posteo.de/dns-query",
  "https://doh-de.blahdns.com/dns-query", "https://doh-fi.blahdns.com/dns-query",
  "https://jp.tiar.app/dns-query", "https://doh.libredns.gr/dns-query",
  "https://odvr.nic.cz/dns-query", "https://dns.alidns.com/dns-query",
  "https://doh.pub/dns-query", "https://doh.360.cn/dns-query",
  "https://resolver.dnsprivacy.org.uk/dns-query", "https://doh.sz-dns.com/dns-query",
  "https://dns.bitdefender.net/dns-query", "https://doh.rethinkdns.com/dns-query",
  "https://hard.dnsforge.de/dns-query", "https://clean.dnsforge.de/dns-query",
  "https://kids.dns0.eu/dns-query", "https://zero.dns0.eu/dns-query"
];

const STATE = {
  REGISTRY: DNS_UPSTREAMS.map(u => ({ url: u, score: 100, last_lat: 0 })),
  CACHE: new Map(),
  THROTTLE: new Map(),
  TTL: 300 // Cache for 5 mins
};

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const client_ip = req.headers.get('CF-Connecting-IP') || 'edge-client';

    // 250 requests per minute quota
    if (this.isFlooding(client_ip)) return new Response('Rate Limit Exceeded', { status: 429 });

    if (url.pathname === '/dns-query') return this.executeDNS(req);
    if (url.pathname === '/apple') return this.generateAppleConfig(url.host);

    return this.renderTerminal(url.host);
  },

  isFlooding(ip) {
    const now = Date.now();
    let user = STATE.THROTTLE.get(ip) || { count: 0, ts: now };
    if (now - user.ts > 60000) user = { count: 0, ts: now };
    user.count++;
    STATE.THROTTLE.set(ip, user);
    return user.count > 250;
  },

  async executeDNS(req) {
    let payload;
    if (req.method === 'POST') payload = await req.arrayBuffer();
    else {
      const q = new URL(req.url).searchParams.get('dns');
      if (!q) return new Response('Invalid Query', { status: 400 });
      payload = Uint8Array.from(atob(q.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
    }

    const cache_id = await this.hash(payload);
    const hit = STATE.CACHE.get(cache_id);
    if (hit && (Date.now() - hit.ts < STATE.TTL * 1000)) {
      return new Response(hit.body, { headers: { 'content-type': 'application/dns-message', 'x-cache': 'HIT' } });
    }

    const winners = STATE.REGISTRY.sort((a, b) => b.score - a.score).slice(0, 8);
    try {
      const race_win = await Promise.any(winners.map(node => this.race(node, payload)));
      STATE.CACHE.set(cache_id, { body: race_win.body, ts: Date.now() });
      return new Response(race_win.body, { headers: { 'content-type': 'application/dns-message', 'x-racer-ms': `${race_win.t}ms` } });
    } catch (e) {
      return new Response('Global Resolving Failed', { status: 502 });
    }
  },

  async race(node, packet) {
    const start = Date.now();
    const res = await fetch(node.url, {
      method: 'POST',
      headers: { 'content-type': 'application/dns-message', 'accept': 'application/dns-message' },
      body: packet
    });
    if (!res.ok) { node.score -= 15; throw 0; }
    node.score = Math.min(100, node.score + 2);
    node.last_lat = Date.now() - start;
    return { body: await res.arrayBuffer(), t: node.last_lat };
  },

  async hash(buf) {
    const h = await crypto.subtle.digest('SHA-1', buf);
    return Array.from(new Uint8Array(h)).map(x => x.toString(16).padStart(2, '0')).join('');
  },

  generateAppleConfig(host) {
    const id = crypto.randomUUID();
    const plist = `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd"><plist version="1.0"><dict><key>PayloadContent</key><array><dict><key>DNSSettings</key><dict><key>DNSProtocol</key><string>HTTPS</string><key>ServerURL</key><string>https://${host}/dns-query</string></dict><key>PayloadType</key><string>com.apple.dnsSettings.managed</string><key>PayloadUUID</key><string>${id}</string><key>PayloadVersion</key><integer>1</integer><key>PayloadDisplayName</key><string>Secure DNS (PRO)</string></dict></array><key>PayloadType</key><string>Configuration</string><key>PayloadUUID</key><string>${crypto.randomUUID()}</string><key>PayloadIdentifier</key><string>com.azizi.secure.dns</string><key>PayloadVersion</key><integer>1</integer><key>PayloadDisplayName</key><string>Secure DNS (DoH-ONLY) @${host}</string></dict></plist>`;
    return new Response(plist, { headers: { 'content-type': 'application/x-apple-aspen-config', 'content-disposition': 'attachment; filename="secure.mobileconfig"' } });
  },

  renderTerminal(host) {
    const endpoint = `https://${host}/dns-query`;
    return new Response(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Secure DNS over HTTPS (DoH) | Edge Resolution</title>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🛡️</text></svg>">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;500;700&family=Vazirmatn:wght@300;500;800&family=JetBrains+Mono:wght@400;700&display=swap');
        body { background: #01040a; color: #f0f6fc; font-family: 'Space Grotesk', 'Vazirmatn', sans-serif; transition: background 0.4s ease; overflow-x: hidden; }
        .cyber-panel { background: rgba(13, 20, 33, 0.7); backdrop-filter: blur(20px); border: 1px solid rgba(0, 243, 255, 0.08); box-shadow: 0 15px 50px rgba(0,0,0,0.6); }
        .lang-fa { direction: rtl; font-family: 'Vazirmatn', sans-serif; }
        .btn-active { background: #0ea5e9; color: white !important; box-shadow: 0 0 20px rgba(14, 165, 233, 0.5); border: none !important; }
        .hidden-pane { display: none; } .visible-pane { display: block; animation: paneReveal 0.4s ease-out; }
        @keyframes paneReveal { from { opacity: 0; filter: blur(5px); transform: scale(0.98); } to { opacity: 1; filter: blur(0); transform: scale(1); } }
        code { font-family: 'JetBrains Mono', monospace; }
        .tech-glow { position: absolute; filter: blur(120px); pointer-events: none; z-index: -1; }
        ::-webkit-scrollbar { width: 8px; } ::-webkit-scrollbar-track { background: #01040a; } ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
    </style>
</head>
<body class="p-4 md:p-12 relative">
    
    <div class="tech-glow top-0 left-1/4 w-96 h-96 bg-cyan-900/20"></div>
    <div class="tech-glow bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-900/10"></div>

    <!-- LANGUAGE FLOATER -->
    <div class="fixed top-6 right-6 z-50">
        <button onclick="document.getElementById('langSwitcher').classList.toggle('hidden')" class="cyber-panel px-6 py-3 rounded-2xl flex items-center gap-4 text-xs font-bold border-cyan-500/30 hover:scale-105 transition-all">
            🌐 <span id="currentLangDisplay">GLOBAL SETTINGS</span>
        </button>
        <div id="langSwitcher" class="hidden absolute right-0 mt-3 cyber-panel p-2 rounded-2xl w-48 border-cyan-900/40">
            <button onclick="applyLang('en')" class="w-full text-left p-3 hover:bg-cyan-600 rounded-xl text-xs transition-colors mb-1">ENGLISH (US)</button>
            <button onclick="applyLang('fa')" class="w-full text-right p-3 hover:bg-emerald-600 rounded-xl text-xs transition-colors mb-1">فارسی (FA)</button>
            <button onclick="applyLang('zh')" class="w-full text-left p-3 hover:bg-teal-600 rounded-xl text-xs transition-colors">简体中文 (CN)</button>
        </div>
    </div>

    <div class="max-w-4xl mx-auto">
        
        <header class="text-center py-20 relative">
            <h1 class="text-4xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 via-sky-300 to-emerald-400 tracking-tighter" id="titleMain">
                Secure DNS over HTTPS
            </h1>
            <p class="mt-8 text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px] md:text-xs" id="subTagline">Autonomous Resolver Logic • High Availability Network</p>
        </header>

        <!-- DASHBOARD HERO -->
        <main class="cyber-panel rounded-[3rem] p-8 md:p-16 mb-12 relative overflow-hidden">
            <div class="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rotate-45 -mr-24 -mt-24 border border-cyan-500/10"></div>
            
            <div class="relative z-10">
                <div class="mb-4 flex justify-between items-end">
                    <span class="text-[10px] font-black text-cyan-500 tracking-widest uppercase" id="endpointText">DoH Target URL</span>
                    <span class="text-[10px] text-slate-600" id="encryptionText">DOH-ONLY RESOLUTION</span>
                </div>
                
                <div class="flex flex-col lg:flex-row gap-5">
                    <input id="rawUrl" value="${endpoint}" readonly class="w-full bg-slate-950/60 border border-slate-800 p-5 rounded-[1.2rem] text-cyan-300 font-mono text-sm outline-none focus:border-cyan-500/50 shadow-inner">
                    <button onclick="performCopy()" class="bg-cyan-600 hover:bg-cyan-400 text-black font-black px-12 py-5 rounded-[1.2rem] transition-all flex items-center justify-center gap-2 group">
                        <span id="copyBtnTxt">COPY ENDPOINT</span>
                    </button>
                </div>

                <div class="mt-10 flex flex-wrap gap-8 items-center border-t border-slate-800/50 pt-8">
                    <div class="flex gap-4 items-center">
                        <div class="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_12px_#10b981]"></div>
                        <p class="text-[10px] font-black text-slate-400 tracking-tighter" id="statusNet">EDGE CLUSTER STATUS: HEALTHY</p>
                    </div>
                    <div class="flex gap-4 items-center">
                        <div class="h-3 w-3 rounded-full bg-cyan-500 shadow-[0_0_12px_#06b6d4]"></div>
                        <p class="text-[10px] font-black text-slate-400 tracking-tighter" id="statRacing">RACING: 8-WAY PARALLEL</p>
                    </div>
                </div>
            </div>
        </main>

        <!-- EDUCATION PRO-NOTICE -->
        <div class="cyber-panel border-cyan-500/20 mb-12 p-8 rounded-[2.5rem] flex flex-col lg:flex-row items-center gap-8 group">
            <div class="text-4xl filter grayscale group-hover:grayscale-0 transition-all duration-700">🥇</div>
            <div>
                <h4 id="bestUseHeader" class="text-cyan-400 font-black text-sm uppercase tracking-wider">Ultimate Performance Method</h4>
                <p id="bestUseBody" class="text-slate-400 text-[13px] leading-relaxed mt-3">Browser-based DoH is currently the <b>gold standard</b> for stability. Configuring your specific browser ensures that even if local system policies or DPI attempt to block standard DNS, your web queries stay encrypted, invisible to ISP sniffers, and unaffected by global OS firewall conflicts.</p>
            </div>
        </div>

        <!-- DOCUMENTATION TABS -->
        <div class="mb-20">
            <nav id="docTabs" class="flex overflow-x-auto no-scrollbar gap-4 justify-center md:justify-center mb-10 pb-2">
                <button onclick="showDoc('web')" id="tabWeb" class="px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-500 border border-slate-800 transition-all btn-active">Browsers</button>
                <button onclick="showDoc('mac')" id="tabMac" class="px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-500 border border-slate-800 transition-all">Apple Cluster</button>
                <button onclick="showDoc('droid')" id="tabDroid" class="px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-500 border border-slate-800 transition-all">Mobile Engine</button>
                <button onclick="showDoc('dev')" id="tabDev" class="px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-500 border border-slate-800 transition-all">Pro / Xray</button>
            </nav>

            <section id="docHost" class="min-h-[400px]">
                <div id="web" class="visible-pane cyber-panel p-10 md:p-14 rounded-[3.5rem]">
                    <h3 class="text-2xl font-black mb-10 text-cyan-100" id="browserHead">Configure Your Workspace</h3>
                    <div class="space-y-12">
                        <div class="border-l-2 border-slate-800 pl-6 hover:border-cyan-500 transition-all">
                            <h5 class="text-sm font-black text-emerald-400 uppercase mb-4" id="chrHead">Chrome / Brave / Edge</h5>
                            <p class="text-[13px] text-slate-500 leading-relaxed" id="chrText">Visit <code>Settings > Security & Privacy</code>. Search for <b>"Secure DNS"</b>. Set to "Custom" and input the DOH URL above. Note: This service is specifically for DoH (HTTPS) and does not support port 53 / 853 DOT connections.</p>
                        </div>
                        <div class="border-l-2 border-slate-800 pl-6 hover:border-teal-500 transition-all">
                            <h5 class="text-sm font-black text-emerald-400 uppercase mb-4" id="ffHead">Mozilla Firefox</h5>
                            <p class="text-[13px] text-slate-500 leading-relaxed" id="ffText">Head to <code>Settings > Privacy > DNS over HTTPS</code>. Under "Increased Protection", choose "Custom" and add our Gateway Endpoint. It works best when combined with ECH settings (network.dns.echconfig.enabled).</p>
                        </div>
                    </div>
                </div>

                <div id="mac" class="hidden-pane cyber-panel p-14 rounded-[3.5rem] text-center">
                    <div class="max-w-md mx-auto">
                        <div class="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 text-2xl">🍎</div>
                        <h3 class="text-2xl font-black mb-4 text-white" id="iosHead">iOS & macOS Configuration</h3>
                        <p id="iosText" class="text-slate-500 text-sm mb-12 leading-relaxed">System-wide DOH encryption on iPhones requires a MobileConfig profile. Downloading this profile integrates our DOH resolving as a Managed DNS Provider within your device settings.</p>
                        <a href="/apple" class="bg-cyan-100 text-black font-black px-12 py-6 rounded-3xl shadow-xl hover:bg-white hover:scale-105 transition-all inline-block uppercase text-xs">Provision Device Profile</a>
                    </div>
                </div>

                <div id="droid" class="hidden-pane cyber-panel p-10 rounded-[3.5rem]">
                    <h3 class="text-2xl font-black mb-8 text-white" id="andHead">Android Strategy</h3>
                    <p class="text-[13px] text-slate-500 mb-10" id="andSub">Since Cloudflare Workers cannot serve as a DOT (Port 853) hostname, Native Private DNS in Android Settings will not accept this link directly. Instead, you MUST use one of these trusted DOH-relay apps:</p>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="bg-slate-900/50 p-8 rounded-3xl border border-slate-800">
                            <span class="text-xs font-black text-cyan-400 mb-3 block">SOLUTION #1</span>
                            <h5 class="text-sm font-bold mb-4">RETHINK DNS</h5>
                            <p class="text-[11px] text-slate-600 leading-relaxed" id="reDesc">Go to Network Configuration -> Choose DOH. Clear default list and paste the Secure Endpoint. This handles full app-traffic resolution.</p>
                        </div>
                        <div class="bg-slate-900/50 p-8 rounded-3xl border border-slate-800">
                            <span class="text-xs font-black text-cyan-400 mb-3 block">SOLUTION #2</span>
                            <h5 class="text-sm font-bold mb-4">GOOGLE INTRA</h5>
                            <p class="text-[11px] text-slate-600 leading-relaxed" id="intraDesc">Designed purely for DoH bypass. Enter our gateway link in 'Settings > Custom DNS'. This works flawlessly as a standalone bypass tool.</p>
                        </div>
                    </div>
                </div>

                <div id="dev" class="hidden-pane cyber-panel p-14 rounded-[3.5rem]">
                    <h3 class="text-2xl font-black mb-4 text-emerald-300">Advanced JSON Structure</h3>
                    <p class="text-xs text-slate-600 mb-8 italic uppercase tracking-wider" id="devTag">Outbound Object Mapping (Xray-Core / Sing-box / Surfboard)</p>
                    <div class="bg-slate-950 p-8 rounded-[2rem] shadow-2xl relative border border-slate-800">
                        <pre class="text-[11px] text-emerald-500 font-mono leading-relaxed overflow-x-auto whitespace-pre">"dns": {
  "servers": [
    {
      "address": "${endpoint}",
      "skipFallback": true
    },
    "https://8.8.8.8/dns-query",
    "https://1.1.1.1/dns-query"
  ],
  "queryStrategy": "UseIPv4",
  "tag": "dns_external"
}</pre>
                    </div>
                </div>
            </section>
        </div>

        <footer class="mt-40 py-20 border-t border-slate-900">
            <div class="flex flex-col lg:flex-row justify-between items-center gap-12 opacity-60">
                <div class="flex flex-col items-center lg:items-start">
                    <span class="text-[11px] font-black tracking-[0.3em] text-cyan-500 uppercase">Architecture: Serverless v4</span>
                    <p class="text-[10px] mt-2 text-slate-600">ZERO DATA-RETENTION POLICY ACTIVE</p>
                </div>
                <div class="flex flex-wrap justify-center gap-10 md:gap-14 font-black text-[10px] uppercase tracking-widest">
                    <a href="https://x.com/the_azzi" class="hover:text-cyan-400 transition-all" target="_blank">Developer Feed (X)</a>
                    <a href="https://github.com/TheGreatAzizi/Secure-DNS-over-HTTPS-Cloudflare-Worker" class="hover:text-cyan-400 transition-all" target="_blank">Global Registry (GitHub)</a>
                </div>
            </div>
        </footer>
    </div>

    <script>
        const LOCALE = {
            en: {
                mainTitle: 'Secure DNS over HTTPS', tagLine: 'Autonomous Resolver Logic • High Availability Network',
                eLab: 'DoH Target URL', cpy: 'COPY ENDPOINT', stNet: 'EDGE CLUSTER STATUS: HEALTHY', stRace: 'RACING: 8-WAY PARALLEL',
                bestHead: 'Ultimate Performance Method',
                bestBody: 'Browser-based DoH is currently the gold standard for stability. Configuring your specific browser ensures that even if local system policies attempt to block DNS, your web queries stay encrypted, invisible to ISP sniffers, and unaffected by local firewall conflicts.',
                tabW: 'Browsers', tabM: 'Apple Cluster', tabD: 'Mobile Engine', tabP: 'Pro / Xray',
                brHead: 'Configure Your Workspace', 
                chrHead: 'Google Chrome / Chromium Engines', chrBody: 'Visit Settings > Security. Set Secure DNS to Custom and use the link. This is a DoH service; port 853 DOT is not supported natively by Cloudflare Workers.',
                ffHead: 'Mozilla Firefox', ffBody: 'Privacy Settings > DNS over HTTPS. Max Protection mode recommended.',
                ioHead: 'iOS & macOS Deployment', ioBody: 'Deployment on Apple platforms via signed Profiles creates a system-wide Managed Resolver. Click below to install.',
                anHead: 'Android Engine (Relay required)', anSub: 'Since this is DOH-ONLY (Edge Worker), Native Android Settings will not accept this URL directly. You must use a Relay App.',
                devH: 'ADVANCED TERMINAL LOGIC', btnL: 'GLOBAL CONFIG'
            },
            fa: {
                mainTitle: 'سرویس امن DNS بر روی HTTPS', tagLine: 'مسابقه هوشمند بین ۳۲ نود جهانی • کمترین تاخیر در لایه لبه',
                eLab: 'آدرس مستقیم سرور شما (DOH)', cpy: 'کپی آدرس هوشمند', stNet: 'وضعیت شبکه کلودفلر: فعال', stRace: 'حالت پاسخگویی: مسابقه موازی (۸ مسیر)',
                bestHead: 'بهترین روش پیشنهادی کارشناسان',
                bestBody: 'استفاده مستقیم در مرورگر (Browser DoH) پایدارترین حالت ممکن برای دور زدن محدودیت‌های شدید DNS است. این روش حتی در صورت مسدود بودن کل ترافیک UDP یا اختلال در DNS کل سیستم، از بستر امن HTTPS مرورگر استفاده کرده و وب‌گردی شما را به طور کامل رمزنگاری می‌کند.',
                tabW: 'مرورگرها', tabM: 'محصولات اپل', tabD: 'گوشی موبایل', tabP: 'تنظیمات حرفه‌ای',
                brHead: 'فعالسازی در مرورگر دسکتاپ و لپ‌تاپ', 
                chrHead: 'کروم / اج / بریو و انجین‌های مشابه', chrBody: 'در تنظیمات به Security رفته و در بخش Use Secure DNS لینک بالای صفحه را قرار دهید. توجه: این سرویس DOH است و برای تنظیمات DOT اندروید مناسب نیست.',
                ffHead: 'فایرفاکس (توصیه شده)', ffBody: 'در بخش Privacy، گزینه DNS over HTTPS را روی حالت Max قرار داده و آدرس را وارد کنید.',
                ioHead: 'نصب سیستمی در iOS و macOS', ioBody: 'برای فعال شدن سرویس در تمام برنامه‌های آیفون و مک، از پروفایل اختصاصی زیر استفاده کنید. این فایل تنظیمات DNS را به لایه ریشه سیستم منتقل می‌کند.',
                anHead: 'استراتژی اندروید (نیازمند رله)', anSub: 'به دلیل اجرا در محیط ورکر کلودفلر، این سرویس فقط DOH است و توسط Private DNS تنظیمات گوشی پذیرفته نمی‌شود. حتما باید از برنامه‌های رله استفاده کنید.',
                devH: 'کد آماده برای Xray-Core / Sing-box', btnL: 'تنظیمات جهانی'
            },
            zh: {
                mainTitle: 'Secure DoH 安全加密协议', tagLine: '边缘计算高并发加速 • 全球全方位集群解析方案',
                eLab: 'DoH 配置终端', cpy: '点击复制解析端点', stNet: '边缘集群状态: 运行良好', stRace: '并发竞赛: 8 路径响应加速',
                bestHead: '最推荐的使用策略',
                bestBody: '在浏览器内部直接配置 DoH 是绕过复杂干扰的最佳选择。它可以完全避开系统底层的防火墙拦截，通过 HTTPS 加密流确保浏览网页时的域名解析既隐私又安全。',
                tabW: '主流浏览器', tabM: '苹果配置集', tabD: '移动解析方案', tabP: '进阶配置 JSON',
                brHead: '配置您的浏览器办公环境', 
                chrHead: '谷歌 Chrome / 微软 Edge 引擎', chrBody: '设置 > 安全性 > 使用安全 DNS。该服务由边缘 Worker 提供，不支持原生 Port 853 加密协议，请确保选择 HTTPS。',
                ffHead: '火狐浏览器 (推荐)', ffBody: '隐私与安全设置中启用 DoH 最高保护模式并粘贴上方的域名解析端点即可生效。',
                ioHead: 'Apple 系统级安全分发', ioBody: '针对 iPhone 和 Mac 设备，通过 MobileConfig 系统文件集成系统级别的 DOH 加密。点击下载签名文件进行配置。',
                anHead: 'Android 端解决策略', anSub: '原生 Android 设置暂不支持直接导入长链 DoH 地址，因此必须配合专用的转发软件如 RethinkDNS 或 Intra 来引导解析流量。',
                devH: '开发人员 API JSON', btnL: '全局策略'
            }
        };

        function applyLang(code) {
            localStorage.setItem('doc_lang', code);
            const l = LOCALE[code];
            document.body.classList.toggle('lang-fa', code === 'fa');
            document.getElementById('currentLangDisplay').innerText = l.btnL;
            document.getElementById('titleMain').innerText = l.mainTitle;
            document.getElementById('subTagline').innerText = l.tagLine;
            document.getElementById('endpointText').innerText = l.eLab;
            document.getElementById('copyBtnTxt').innerText = l.cpy;
            document.getElementById('statusNet').innerText = l.stNet;
            document.getElementById('statRacing').innerText = l.stRace;
            document.getElementById('bestUseHeader').innerText = l.bestHead;
            document.getElementById('bestUseBody').innerHTML = l.bestBody;
            document.getElementById('tabWeb').innerText = l.tabW;
            document.getElementById('tabMac').innerText = l.tabM;
            document.getElementById('tabDroid').innerText = l.tabD;
            document.getElementById('tabDev').innerText = l.tabP;
            document.getElementById('browserHead').innerText = l.brHead;
            document.getElementById('chrHead').innerText = l.chrHead;
            document.getElementById('chrText').innerHTML = l.chrBody;
            document.getElementById('ffHead').innerText = l.ffHead;
            document.getElementById('ffText').innerHTML = l.ffBody;
            document.getElementById('iosHead').innerText = l.ioHead;
            document.getElementById('iosText').innerText = l.ioBody;
            document.getElementById('andHead').innerText = l.anHead;
            document.getElementById('andSub').innerText = l.anSub;
            document.getElementById('langSwitcher').classList.add('hidden');
        }

        function showDoc(pane) {
            document.querySelectorAll('.visible-pane').forEach(el => {el.classList.add('hidden-pane'); el.classList.remove('visible-pane');});
            document.querySelectorAll('nav button').forEach(bt => bt.classList.remove('btn-active'));
            document.getElementById(pane).classList.add('visible-pane');
            document.getElementById(pane).classList.remove('hidden-pane');
            event.target.classList.add('btn-active');
        }

        function performCopy() {
            const v = document.getElementById("rawUrl");
            v.select(); document.execCommand("copy");
            alert('LINK CAPTURED SUCCESSFULY');
        }

        window.onload = () => applyLang(localStorage.getItem('doc_lang') || 'en');
    </script>
</body>
</html>`, { headers: { 'content-type': 'text/html' } });
  }
};
