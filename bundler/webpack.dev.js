const path = require("path");
const { merge } = require("webpack-merge");
const commonConfiguration = require("./webpack.common.js");
const ip = require("ip");
const portFinderSync = require("portfinder-sync");

const infoColor = (_message) => {
  return `\u001b[1m\u001b[34m${_message}\u001b[39m\u001b[22m`;
};

module.exports = merge(commonConfiguration, {
  stats: "errors-warnings",
  mode: "development",
  infrastructureLogging: {
    level: "warn",
  },
  devServer: {
    // v5: use a real host value
    host: "0.0.0.0",
    port: portFinderSync.getPort(8080),
    open: true,
    server: "http",
    allowedHosts: "all",

    // If you previously relied on full reloads, keep hot: false.
    // If you want HMR, set hot: true (might require extra setup depending on your app).
    hot: false,

    watchFiles: ["src/**", "static/**"],

    static: {
      watch: true,
      // IMPORTANT:
      // In your webpack.common.js you CopyWebpackPlugin from ../static,
      // but for dev server you probably want to *serve* either ../static or ../public.
      // Keeping your original intent: serve ../static.
      directory: path.join(__dirname, "../static"),
    },

    client: {
      logging: "none",
      overlay: true,
      progress: false,
    },

    // v5 replacement for onAfterSetupMiddleware
setupMiddlewares: (middlewares, devServer) => {
  if (!devServer) throw new Error("webpack-dev-server is not defined");

  const port = devServer.options.port;
  const localIp = ip.address();

  const isHttps =
    devServer.options.server &&
    (typeof devServer.options.server === "string"
      ? devServer.options.server === "https"
      : devServer.options.server.type === "https");

  const protocol = isHttps ? "https" : "http";
  const domain1 = `${protocol}://${localIp}:${port}`;
  const domain2 = `${protocol}://localhost:${port}`;

  console.log(
    `Project running at:\n  - ${infoColor(domain1)}\n  - ${infoColor(domain2)}`
  );

  return middlewares;
},

  },
});
