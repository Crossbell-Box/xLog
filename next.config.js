const pkg = require("./package.json")

/** @type {import('next').NextConfig} */
module.exports = {
  env: {
    APP_DESCRIPTION: pkg.description,
  },
}
