// api/proxy.js
const OWNER_URL = "http://node.cyberhost.site:3002";

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-dash-token, x-tenant-token");
  if (req.method === "OPTIONS") return res.status(200).end();

  // Vem tudo por query string: /api/proxy?endpoint=/dash/me&token=xxx
  const endpoint = req.query.endpoint || "/";

  const params = { ...req.query };
  delete params.endpoint;

  const qs = new URLSearchParams(params).toString();
  const targetUrl = `${OWNER_URL}${endpoint}${qs ? "?" + qs : ""}`;

  console.log(`[PROXY] ${req.method} ${targetUrl}`);

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: { "Content-Type": "application/json" },
      body: req.method !== "GET" ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.text();
    res.status(response.status);
    try {
      res.json(JSON.parse(data));
    } catch {
      res.send(data);
    }
  } catch (e) {
    console.error(`[PROXY] erro:`, e.message);
    res.status(500).json({ erro: "Proxy error: " + e.message });
  }
};
