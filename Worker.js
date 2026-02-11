export default {
  async fetch(request) {
    const url = new URL(request.url);
    const dnsLink = `${url.origin}/dns-query`; // لینک DNS DoH

    // ===== DNS Proxy =====
    if (url.pathname === "/dns-query") {
      if (request.method !== "GET" && request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
      }

      const targetUrl = "https://cloudflare-dns.com/dns-query" + url.search;

      const dnsRequest = new Request(targetUrl, {
        method: request.method,
        headers: {
          Accept: request.headers.get("Accept") || "application/dns-message",
          "Content-Type": request.headers.get("Content-Type") || "application/dns-message",
        },
        body: request.method === "POST" ? await request.arrayBuffer() : undefined,
      });

      const response = await fetch(dnsRequest);

      return new Response(response.body, {
        status: response.status,
        headers: {
          "Content-Type": response.headers.get("Content-Type") || "application/dns-message",
          "Cache-Control": "no-store",
        },
      });
    }

    // ===== UI PAGE =====
    return new Response(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Secure DNS over HTTPS</title>
<style>
body {
  background: #0f172a;
  color: #e2e8f0;
  font-family: Arial, sans-serif;
  display: flex;
  justify-content: center;
  padding: 40px 20px;
  margin: 0;
}
.container {
  max-width: 600px;
  background: #1e293b;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 0 40px rgba(0,0,0,0.5);
}
h1 {
  margin-bottom: 20px;
  font-size: 28px;
  text-align: center;
}
h2 {
  margin-top: 25px;
  font-size: 20px;
}
p {
  font-size: 15px;
  line-height: 1.6;
  margin: 10px 0;
}
.copy-input {
  width: 100%;
  margin-top: 15px;
  padding: 10px;
  border-radius: 8px;
  border: none;
  text-align: center;
  background: #0f172a;
  color: #e2e8f0;
  font-family: monospace;
  font-size: 14px;
}
button {
  margin-top: 15px;
  padding: 12px 25px;
  background: #3b82f6;
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  font-size: 14px;
}
button:hover { background: #2563eb; }
ul { margin-left: 20px; }
</style>
</head>
<body>
<div class="container">
  <h1>Secure DNS over HTTPS (DoH)</h1>
  <p>This page provides a secure DNS link you can use in your system or browser to encrypt DNS queries and protect your privacy.</p>

  <h2>Your DNS Link</h2>
  <input class="copy-input" id="dnsInput" value="${dnsLink}" readonly />
  <button onclick="copyDNS()">Copy DNS Link</button>

  <h2>What is DNS over HTTPS (DoH)?</h2>
  <p>DNS (Domain Name System) translates website names into IP addresses. Normally, DNS queries are sent unencrypted, which allows ISPs or others to monitor or block them.</p>
  <p>DNS over HTTPS (DoH) encrypts these queries, making them private and harder to tamper with.</p>

  <h2>How to use this DNS link</h2>
  <ul>
    <li><strong>Windows/macOS:</strong> In browsers like Chrome or Firefox, set a custom DNS over HTTPS server using this link.</li>
    <li><strong>Android:</strong> Go to Settings → Network → Private DNS, and enter this link as the hostname.</li>
    <li><strong>iOS:</strong> Use a DNS configuration app that supports DoH, and paste this link.</li>
    <li><strong>Linux:</strong> Configure DoH using systemd-resolved, dnscrypt-proxy, or your browser's DoH settings.</li>
  </ul>

  <h2>Tips</h2>
  <ul>
    <li>After changing DNS settings, restart your browser or flush DNS cache to apply changes.</li>
    <li>Not all apps or systems use DoH automatically; browser support is the easiest way to start.</li>
    <li>This link only works for DNS over HTTPS. Normal DNS settings in the OS won't use it unless configured.</li>
  </ul>
</div>

<script>
function copyDNS() {
  const input = document.getElementById("dnsInput");
  input.select();
  input.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(input.value).then(() => {
    alert("DNS link copied to clipboard!");
  });
}
</script>
</body>
</html>
`, {
      headers: { "Content-Type": "text/html" },
    });
  },
};
