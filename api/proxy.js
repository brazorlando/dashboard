// api/proxy.js
const OWNER_URL = "http://node.cyberhost.site:3002";
const TENANT_URL = "http://node.cyberhost.site:3003";

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, x-dash-token, x-tenant-token"
  );
  if (req.method === "OPTIONS") return res.status(200).end();

  const endpoint = req.query.endpoint || "/";

  let base;
  let realPath = endpoint;

  if (endpoint.startsWith("/tenant")) {
    base = TENANT_URL;
    realPath = endpoint.replace(/^\/tenant/, "") || "/";
  } else if (endpoint.startsWith("/owner")) {
    base = OWNER_URL;
    realPath = endpoint.replace(/^\/owner/, "") || "/";
  } else {
    base = OWNER_URL;
    realPath = endpoint;
  }

  const params = { ...req.query };
  delete params.endpoint;

  const qs = new URLSearchParams(params).toString();
  const targetUrl = `${base}${realPath}${qs ? "?" + qs : ""}`;

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
