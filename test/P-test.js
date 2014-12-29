var assert = buster.referee.assert;

function equals(a, b) {
  assert.equals(JSON.stringify(a), JSON.stringify(b));
}

buster.testCase("P.and", {
  "And with no arguments": function() {
    assert(P.and()());
  },

  "And with single argument": function() {
    assert(P.and(function() {
      return true;
    })());
    assert(!P.and(function() {
      return false;
    })());
  },

  "And with multiple functions": function() {
    equals(
      F([-10, -9, -8, 1, 2, 3, 4, 5, 6, 7, 8, 9, 20])
      .filter(P.and(
        function(x) {
          return x % 2 == 0;
        },
        function(x) {
          return x > 5;
        },
        function(x) {
          return x < 15;
        }))
      .toArray(), [6, 8]
    );
  },

  "And with array as input functions": function() {
    equals(
      F([-10, -9, -8, 1, 2, 3, 4, 5, 6, 7, 8, 9, 20])
      .filter(P.and([
        function(x) {
          return x % 2 == 0;
        },
        function(x) {
          return x > 5;
        },
        function(x) {
          return x < 15;
        }
      ]))
      .toArray(), [6, 8]
    );
  }
});

buster.testCase("P.or", {
  "Or with no arguments": function() {
    assert(!P.or()());
  },

  "Or with single argument": function() {
    assert(P.or(function() {
      return true;
    })());
    assert(!P.or(function() {
      return false;
    })());
  },

  "Or with multiple functions": function() {
    equals(
      F([-10, -9, -8, 1, 2, 3, 4, 5, 6, 7, 8, 9, 25])
      .filter(P.or(
        function(x) {
          return x % 2 == 0;
        },
        function(x) {
          return x < 0;
        },
        function(x) {
          return x > 15;
        }))
      .toArray(), [-10, -9, -8, 2, 4, 6, 8, 25]
    );
  },

  "Or with array as input": function() {
    equals(
      F([-10, -9, -8, 1, 2, 3, 4, 5, 6, 7, 8, 9, 25])
      .filter(P.or([
        function(x) {
          return x % 2 == 0;
        },
        function(x) {
          return x < 0;
        },
        function(x) {
          return x > 15;
        }
      ]))
      .toArray(), [-10, -9, -8, 2, 4, 6, 8, 25]
    );
  }
});

buster.testCase("P.not", {
  "Not with single argument": function() {
    assert(!P.not(function() {
      return true;
    })());
    assert(P.not(function() {
      return false;
    })());
  },

  "Not with filter": function() {
    equals(
      F([-10, -9, -8, 1, 2, 3, 4, 5, 6, 7, 8, 9, 25])
      .filter(P.not(
        function(x) {
          return x % 2 == 0;
        }))
      .toArray(), [-9, 1, 3, 5, 7, 9, 25]
    );
  }
});