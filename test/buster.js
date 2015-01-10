var config = module.exports;

config["F tests"] = {
  rootPath: "../",
  environment: "node",
  sources: [
    "dist/*.js"
  ],
  tests: [
    "test/*-test.js"
  ]
}