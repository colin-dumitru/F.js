var config = module.exports;

config["F tests"] = {
  rootPath: "../",
  environment: "node",
  sources: [
    "build/*.js"
  ],
  tests: [
    "test/F-test.js",
    "test/P-test.js"
  ]
}