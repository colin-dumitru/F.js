if (typeof require !== 'undefined') {
  var Fjs = require("../dist/F.min.js"),
    F = Fjs.F,
    P = Fjs.P,
    buster = require("buster");
}
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

buster.testCase("P.alwaysTrue", {
  "Basic test": function() {
    assert(P.alwaysTrue());
    assert(P.alwaysTrue("Some", "Random", 1));
  }
});

buster.testCase("P.alwaysFalse", {
  "Basic test": function() {
    assert(!P.alwaysFalse());
    assert(!P.alwaysFalse("Some", "Random", 1));
  }
});

buster.testCase("P.isNull", {
  "Basic test": function() {
    assert(P.isNull(null));
    assert(!P.isNull(undefined));
    assert(!P.isNull(0));
    assert(!P.isNull(1));
    assert(!P.isNull("ABC"));
  }
});

buster.testCase("P.notNull", {
  "Basic test": function() {
    assert(!P.notNull(null));
    assert(P.notNull(undefined));
    assert(P.notNull(0));
    assert(P.notNull(1));
    assert(P.notNull("ABC"));
  }
});

buster.testCase("P.hasProperty", {
  "No properties given": function() {
    assert(
      P.hasProperty()({})
    );
  },

  "Has single nested property": function() {
    assert(
      P.hasProperty("parent")({
        parent: 1
      })
    );
  },

  "Has multi-level nested property": function() {
    assert(
      P.hasProperty("grandparent", "parent", "child")({
        grandparent: {
          parent: {
            child: 1
          }
        }
      })
    );
  },

  "Not has single nested property": function() {
    assert(!P.hasProperty("parent")({
      child: 1
    }));
  },

  "Not has multi-level nested property": function() {
    assert(!P.hasProperty("grandparent", "parent", "child")({
      grandparent: {
        parent: {
          uncle: 1
        }
      }
    }));
  }
});

buster.testCase("P.in", {
  "In with empty array": function() {
    equals(
      F([1, 2, 3, 4])
      .filter(
        P.in([])
      )
      .toArray(), []
    )
  },

  "In with numbers": function() {
    equals(
      F([1, 2, 1, 4])
      .filter(
        P.in([1, 4])
      )
      .toArray(), [1, 1, 4]
    )
  },

  "In with objects": function() {
    var obj = {
      a: 1
    };

    equals(
      F([1, 2, obj, 4, obj])
      .filter(
        P.in([obj])
      )
      .toArray(), [obj, obj]
    )
  }
});

buster.testCase("P.equalTo", {
  "Basic tests": function() {
    assert(P.equalTo(1)(1));
    assert(P.equalTo(1)(true));
    assert(P.equalTo(1)("1"));
  }
});

buster.testCase("P.strongEqualTo", {
  "Basic tests": function() {
    assert(P.strongEqualTo(1)(1));
    assert(!P.strongEqualTo(1)(true));
    assert(!P.strongEqualTo(1)("1"));
  }
});

buster.testCase("P.instanceOf", {
  "With strings": function() {
    equals(
      F(["John", 1, 2, "Colin", 3])
      .filter(P.instanceOf(String))
      .toArray(), []
    );
  },

  "With functions": function() {
    var p = function(name) {
      this.name = name;
    }

    equals(
      F([new p("John"), 1, 2, new p("Colin"), 3])
      .filter(P.instanceOf(p))
      .toArray(), [{
        name: "John"
      }, {
        name: "Colin"
      }]
    );
  }
});

buster.testCase("P.on", {
  "With strings": function() {
    equals(
      F(["John", "Colin"])
      .filter(P.on("length", function(length) {
        return length > 4;
      }))
      .toArray(), ["Colin"]
    );
  },

  "Property doesn't exist": function() {
    equals(
      F(["John", "Colin"])
      .filter(P.on("bongo", P.alwaysTrue))
      .toArray(), []
    );
  },

  "With object": function() {
    var people = [{
      name: "John"
    }, {
      name: "Colin"
    }, {
      nickname: "Dave"
    }];

    equals(
      F(people)
      .filter(P.on("name", "length", function(length) {
        return length > 4;
      }))
      .toArray(), [{
        name: "Colin"
      }]
    );
  }
});

buster.testCase("P.count", {
  "With negative numbers": function() {
    var p = P.count(-100);

    assert(!p());
    assert(!p());
    assert(!p());
  },

  "With 0": function() {
    var p = P.count(0);

    assert(!p());
    assert(!p());
    assert(!p());
  },

  "With positive numbers": function() {
    var p = P.count(5);

    assert(p());
    assert(p());
    assert(p());
    assert(p());
    assert(p());
    assert(!p());
    assert(!p());
  }
});

buster.testCase("P.limit", {
  "With negative numbers": function() {
    var p = P.limit(-100);

    assert(!p());
    assert(!p());
    assert(!p());
  },

  "With 0": function() {
    var p = P.limit(0);

    assert(!p());
    assert(!p());
    assert(!p());
  },

  "With positive numbers": function() {
    var p = P.limit(5);

    assert(p());
    assert(p());
    assert(p());
    assert(p());
    assert(!p());
    assert(!p());
    assert(!p());
  }
});