/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  ignoredRouteFiles: ["**/.*"],
  server:
    process.env.NODE_ENV === "development"
      ? "./server-dev.ts"
      : "./server-prod.ts",
}
