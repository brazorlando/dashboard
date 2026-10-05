// api/proxy.js
// Este ficheiro é executado no Vercel (HTTPS).
// Faz proxy dos pedidos para o bot (HTTP), evitando o Mixed Content.

const OWNER_URL = "http://node.cyberhost.site:3002";

module.exports = async (req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-dash-token, x-tenant-token");
  if (req.method === "OPTIONS") return res.status(200).end();

  // Reconstrói o path
  // /api?path=/dash/me&token=xxx  →  http://node.cyberhost.site:3002/dash/me?token=xxx
  const path = req.query.path || "";
  const params = { ...req.query };
  delete params.path;

  const qs = new URLSearchParams(params).toString();
  const targetUrl = `${OWNER_URL}${path}${qs ? "?" + qs : ""}`;

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
    res.status(500).json({ erro: "Proxy error: " + e.message });
  }
};
