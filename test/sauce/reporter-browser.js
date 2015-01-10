buster.reporters.sauce = {

  create: function(opt) {

    var htmlReporter = buster.reporters.html.create(opt),
      results = [];

    function wrap(obj, func, wrapper) {
      var original = obj[func];

      obj[func] = function() {
        wrapper.apply(this, arguments);
        original.apply(this, arguments);
      }
    }

    wrap(htmlReporter, 'suite:end', function(stats) {
      var total = stats.tests,
        failed = stats.failures + stats.errors + stats.timeouts;

      window.global_test_results = {
        total: total,
        failed: failed,
        passed: total - failed,
        tests: results.slice(0, 1)
      };
    });

    wrap(htmlReporter, 'test:success', function(test) {
      /* Sauce labs has an issue currently, where if the global_test_results object
      is too large, their system silently fails. So we're adding just the failed
      tests to at least get some messages back. */
      return;

      results.push({
        name: test.name,
        result: true,
        message: "passed"
      });
    });

    wrap(htmlReporter, "test:failure", function(test) {
      results.push({
        name: test.name,
        result: false,
        message: test.error.toString() + "\n" + test.error.stack
      });
    });

    wrap(htmlReporter, "test:error", function(test) {
      results.push({
        name: test.name,
        result: false,
        message: test.error.toString() + "\n" + test.error.stack
      });
    });

    wrap(htmlReporter, "test:deferred", function(test) {
      console.log(test);
    });

    wrap(htmlReporter, "test:timeout", function(test) {
      results.push({
        name: test.name,
        result: false,
        message: "Test timeout"
      });
    });
    return htmlReporter;
  }
};