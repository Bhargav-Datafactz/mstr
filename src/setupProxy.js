const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/MicroStrategyLibrary/api", // Only proxy API requests
    createProxyMiddleware({
      target: "https://10.1.51.211:8080",
      changeOrigin: true,
      secure: false, // Ignore SSL issues (if using self-signed certs)
      onProxyRes(proxyRes, req, res) {
        // Log Headers for Debugging
        console.log("🔄 Proxy Response Headers:", proxyRes.headers);
      }
    })
  );
};
