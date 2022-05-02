function readPackage(pkg, context) {
  if (pkg.dependencies["sort-package-json"]) {
    pkg.dependencies["sort-package-json"] = "1.55.0"
  }

  return pkg
}

module.exports = {
  hooks: {
    readPackage,
  },
}
