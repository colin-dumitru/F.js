var config = module.exports;

config["F tests"] = {
  rootPath: "../",
  environment: "node",
  sources: [
    "lib/*.js"
  ],
  tests: [
    "test/*-test.js"
  ]
}