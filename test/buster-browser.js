var config = module.exports;

config["F tests"] = {
  rootPath: "../",
  environment: "browser",
  sources: [
    "lib/*.js"
  ],
  tests: [
    "test/*-test.js"
  ]
}