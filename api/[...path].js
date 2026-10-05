// api/[...path].js
const OWNER_URL = "http://node.cyberhost.site:3002";

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-dash-token, x-tenant-token");
  if (req.method === "OPTIONS") return res.status(200).end();

  // req.query.path vem como array: ['dash', 'me']
  const pathParts = req.query.path || [];
  const path = Array.isArray(pathParts) ? "/" + pathParts.join("/") : "/" + pathParts;

  // Params sem o "path"
  const params = { ...req.query };
  delete params.path;
  const qs = new URLSearchParams(params).toString();
  const targetUrl = `${OWNER_URL}${path}${qs ? "?" + qs : ""}`;

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
