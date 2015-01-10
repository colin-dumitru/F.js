var config = module.exports;

/* The buster config filename musta always be "buster.js", otherwise it's not
 * recognized. That's why it's put into it's own separate folder. */
config["F tests"] = {
  rootPath: "../../",
  environment: "browser",
  sources: [
    "dist/*.js"
  ],
  tests: [
    "test/F-test.js",
    "test/F-stream-test.js",
    "test/P-test.js"
  ],
  extensions: [require("./reporter.js")]
}