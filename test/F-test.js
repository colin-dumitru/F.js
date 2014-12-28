var buster = require("buster"),
  assert = buster.referee.assert;

function equals(a, b) {
  assert.equals(JSON.stringify(a), JSON.stringify(b));
}

buster.testCase("Iterable.toArray", {
  "Numbers multiplied by 2": function() {
    equals(
      F([1, 2, 3, 4]).toArray(), [1, 2, 3, 4]
    )
  }
});

buster.testCase("Iterable.map", {
  "Numbers multiplied by 2": function() {
    equals(
      F([1, 2, 3, 4]).map(function(x) {
        return 2 * x;
      }).toArray(), [2, 4, 6, 8]
    )
  },

  "Strings to lengths": function() {
    equals(
      F(["John", "Mike", "Colin"]).map(function(x) {
        return x.length;
      }).toArray(), [4, 4, 5]
    )
  }
});

buster.testCase("Iterable.filter", {
  "Filter even numbers": function() {
    equals(
      F([1, 2, 3, 4, 5, 6]).filter(function(x) {
        return x % 2 == 0;
      }).toArray(), [2, 4, 6]
    )
  },

  "Filter strings based on length": function() {
    equals(
      F(["John", "Mike", "Colin"])
      .filter(function(x) {
        return x.length > 4;
      }).toArray(), ["Colin"]
    )
  },

  "All elements are filtered": function() {
    equals(
      F(["John", "Mike", "Colin"])
      .filter(function(x) {
        return x.length < 2;
      }).toArray(), []
    )
  }
});