module.exports = {
  apps: [
    {
      instances: 2,
      name: "xlog",
      script: "./server.js",
      max_memory_restart: "3G",
    },
  ],
}
