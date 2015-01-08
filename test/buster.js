var config = module.exports;

config["F tests"] = {
  rootPath: "../",
  environment: "browser",
  sources: [
    "dist/*.js"
  ],
  tests: [
    "test/*-test.js"
  ]
}