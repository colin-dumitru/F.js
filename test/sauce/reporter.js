module.exports = {
  name: "buster-reporter-sauce",

  create: function() {
    return Object.create(this);
  },

  configure: function(config) {
    config.on("load:framework", function(resourceSet) {
      resourceSet.addFileResource(require.resolve("./reporter-browser"), {
        path: "/buster/sauce-reporter.js"
      }).then(function() {
        resourceSet.loadPath.append("/buster/sauce-reporter.js");
      });
    });
  }
};