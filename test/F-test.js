if (typeof buster === 'undefined') {
  buster = require("buster");
}
var assert = buster.referee.assert;

function equals(a, b) {
  assert.equals(JSON.stringify(a), JSON.stringify(b));
}

buster.testCase("Iterable from object", {
  "Empty object": function() {
    equals(
      F({})
      .toArray(), []
    )
  },

  "Mixed key values": function() {
    equals(
      F({
        a: 1,
        1: "b",
        2: undefined,
        3: null
      })
      .toArray(), [
        ["1", "b"],
        ["2", null],
        ["3", null],
        ["a", 1]
      ]
    )
  },

  "With map and filter": function() {
    equals(
      F({
        1: "John",
        2: "Colin",
        3: "Jake"
      })
      .map(function(val) {
        return val[1];
      })
      .filter(function(val) {
        return val.length == 4;
      })
      .toArray(), ["John", "Jake"]
    )
  }
});

buster.testCase("Iterable from function", {
  "Function which doesn't return anything": function() {
    equals(
      F(function() {})
      .toArray(), []
    )
  },

  "With generated values": function() {
    equals(
      F(function(index) {
        if (index < 5) {
          return 2 * index;
        }
      })
      .toArray(), [0, 2, 4, 6, 8]
    )
  }
});

buster.testCase("Iterable.toArray", {
  "Numbers multiplied by 2": function() {
    equals(
      F([1, 2, 3, 4])
      .toArray(), [1, 2, 3, 4]
    )
  },

  "Nested iterables": function() {
    equals(
      F(F(F(F([1, 2, 3, 4]))))
      .toArray(), [1, 2, 3, 4]
    )
  },

  "Empty array": function() {
    equals(
      F([])
      .toArray(), []
    )
  }
});

buster.testCase("Iterable.concat", {
  "No arguments": function() {
    equals(
      F([1, 2, 3])
      .concat()
      .toArray(), [1, 2, 3]
    )
  },

  "Empty array": function() {
    equals(
      F([1, 2, 3])
      .concat([])
      .toArray(), [1, 2, 3]
    )
  },

  "Single array": function() {
    equals(
      F([1, 2, 3])
      .concat([4, 5])
      .toArray(), [1, 2, 3, 4, 5]
    )
  },

  "Multiple arrays": function() {
    equals(
      F([1, 2, 3])
      .concat([4, 5], [], [], [6, 7, 8], [])
      .toArray(), [1, 2, 3, 4, 5, 6, 7, 8]
    )
  }
});

buster.testCase("Iterable.map", {
  "Empty array": function() {
    equals(
      F([])
      .map(function(x) {
        assert(false);
      })
      .toArray(), []
    )
  },

  "Numbers multiplied by 2": function() {
    equals(
      F([1, 2, 3, 4])
      .map(function(x) {
        return 2 * x;
      })
      .toArray(), [2, 4, 6, 8]
    )
  },

  "Strings to lengths": function() {
    equals(
      F(["John", "Mike", "Colin"])
      .map(function(x) {
        return x.length;
      })
      .toArray(), [4, 4, 5]
    )
  }
});

buster.testCase("Iterable.filter", {
  "Empty array": function() {
    equals(
      F([])
      .filter(function(x) {
        assert(false);
      })
      .toArray(), []
    )
  },

  "Filter even numbers": function() {
    equals(
      F([1, 2, 3, 4, 5, 6])
      .filter(function(x) {
        return x % 2 == 0;
      })
      .toArray(), [2, 4, 6]
    )
  },

  "Filter strings based on length": function() {
    equals(
      F(["John", "Mike", "Colin"])
      .filter(function(x) {
        return x.length > 4;
      })
      .toArray(), ["Colin"]
    )
  },

  "All elements are filtered": function() {
    equals(
      F(["John", "Mike", "Colin"])
      .filter(function(x) {
        return x.length < 2;
      })
      .toArray(), []
    )
  }
});

buster.testCase("Iterable.zip", {
  "Zip with empty arrays": function() {
    equals(
      F([])
      .zip([])
      .toArray(), []
    )
  },

  "With combined elements": function() {
    equals(
      F(["John", "Mike", "Colin"])
      .zip([1, 2, 3])
      .toArray(), [
        ["John", 1],
        ["Mike", 2],
        ["Colin", 3]
      ]
    )
  },

  "With iterable": function() {
    equals(
      F(["John", "Mike", "Colin"])
      .zip(F([1, 2, 3]))
      .toArray(), [
        ["John", 1],
        ["Mike", 2],
        ["Colin", 3]
      ]
    )
  },

  "First array longer": function() {
    equals(
      F(["John", "Mike", "Colin"])
      .zip([1, 2])
      .toArray(), [
        ["John", 1],
        ["Mike", 2]
      ]
    )
  },

  "Second array longer": function() {
    equals(
      F(["John"])
      .zip([1, 2, 3])
      .toArray(), [
        ["John", 1]
      ]
    )
  },

  "Second array empty": function() {
    equals(
      F(["John", "Mike", "Colin"])
      .zip([])
      .toArray(), []
    )
  },

  "First array empty": function() {
    equals(
      F([])
      .zip([1, 2, 3])
      .toArray(), []
    )
  },

  "With filter and drop": function() {
    var people = [{
      name: "John",
      age: 31
    }, {
      name: "Colin",
      age: 25
    }, {
      name: "Dave",
      age: 13
    }, {
      name: "Vic",
      age: 52
    }];

    var result = F(people)
      .filter(function(person) {
        return person.age < 50;
      })
      .property("name")
      .drop(1)
      .zip(["first", "second"])
      .toArray();

    equals(result, [
      ["Colin", "first"],
      ["Dave", "second"]
    ]);
  },

  "With streams": function() {
    var s1 = F.stream(),
      s2 = F.stream();

    var promise = F(s1)
      .filter(function(x) {
        return x % 2 == 0;
      })
      .zip(
        F(s2)
        .filter(function(x) {
          return x % 2 == 1;
        })
      )
      .pullStream(F.mplex(s1, s2))
      .then(function(values) {
        equals(values, [
          [2, 1],
          [4, 3],
          [6, 5],
          [8, 11],
          [10, 13],
        ]);
      });

    s1.pushAll([1, 2, 3, 4, 5]);
    s2.pushAll([1, 2, 3, 4, 5]);
    s1.pushAll([6, 7, 8, 9, 10]);
    s2.pushAll([11, 12, 13, 14]);

    s1.stop();
    s2.stop();

    return promise;
  }
});

buster.testCase("Iterable.partition", {
  "Empty arrays": function() {
    equals(
      F([])
      .partition(function() {}), [
        [],
        []
      ]
    )
  },

  "Strings from numbers": function() {
    equals(
      F([1, 2, "Mike", "Colin", 3, "John"])
      .partition(function(x) {
        return x.length;
      }), [
        ["Mike", "Colin", "John"],
        [1, 2, 3]
      ]
    )
  },

  "All in first array": function() {
    equals(
      F(["Mike", "Colin", "John"])
      .partition(function(x) {
        return x.length;
      }), [
        ["Mike", "Colin", "John"],
        []
      ]
    )
  },

  "All in second array": function() {
    equals(
      F([1, 2, 3])
      .partition(function(x) {
        return x.length;
      }), [
        [],
        [1, 2, 3]
      ]
    )
  }
});

buster.testCase("Iterable.find", {
  "Empty arrays": function() {
    equals(
      F([])
      .find(function() {}), undefined
    )
  },

  "Multiple valid values": function() {
    equals(
      F([1, 3, 2, 5, 6, 4])
      .find(function(x) {
        return x % 2 == 0
      }), 2
    )
  },

  "Value not found": function() {
    equals(
      F([1, 3, 5])
      .find(function(x) {
        return x % 2 == 0
      }), undefined
    )
  }
});

buster.testCase("Iterable.findIndex", {
  "Empty arrays": function() {
    equals(
      F([])
      .findIndex(function() {}), -1
    )
  },

  "Multiple valid values": function() {
    equals(
      F([5, 1, 3, 2, 5, 6, 4])
      .findIndex(function(x) {
        return x % 2 == 0
      }), 3
    )
  },

  "Value not found": function() {
    equals(
      F([1, 3, 5])
      .findIndex(function(x) {
        return x % 2 == 0
      }), -1)
  }
});

buster.testCase("Iterable.drop", {
  "Empty arrays": function() {
    equals(
      F([])
      .drop(10)
      .toArray(), []
    )
  },

  "More values than in array": function() {
    equals(
      F([1, 2, 3, 4, 5])
      .drop(20)
      .toArray(), []
    )
  },

  "Drop some values": function() {
    equals(
      F([1, 2, 3, 4, 5])
      .drop(2)
      .toArray(), [3, 4, 5]
    )
  },

  "Drop with filter": function() {
    equals(
      F([1, 2, 3, 4, 5, 6])
      .filter(function(x) {
        return x % 2 == 0;
      })
      .drop(2)
      .toArray(), [6]
    )
  }
});

buster.testCase("Iterable.dropWhile", {
  "Empty arrays": function() {
    equals(
      F([])
      .dropWhile(function() {})
      .toArray(), []
    )
  },

  "All values match": function() {
    equals(
      F([1, 2, 3, 4, 5])
      .dropWhile(function(x) {
        return x < 10;
      })
      .toArray(), []
    )
  },

  "Drop some values": function() {
    equals(
      F([1, 2, 3, 4, 5])
      .dropWhile(function(x) {
        return x < 3;
      })
      .toArray(), [3, 4, 5]
    )
  },

  "Drop and filter": function() {
    equals(
      F([1, 2, 3, 4, 5, 6])
      .filter(function(x) {
        return x % 2 == 0;
      })
      .dropWhile(function(x) {
        return x < 3;
      })
      .toArray(), [4, 6]
    )
  }
});

buster.testCase("Iterable.takeWhile", {
  "Empty arrays": function() {
    equals(
      F([])
      .takeWhile(function() {})
      .toArray(), []
    )
  },

  "No values match": function() {
    equals(
      F([1, 2, 3, 4, 5])
      .takeWhile(function(x) {
        return x < 0;
      })
      .toArray(), []
    )
  },

  "All values match": function() {
    equals(
      F([1, 2, 3, 4, 5])
      .takeWhile(function(x) {
        return x < 10;
      })
      .toArray(), [1, 2, 3, 4, 5]
    )
  },

  "Take some values": function() {
    equals(
      F([1, 2, 3, 4, 5])
      .takeWhile(function(x) {
        return x < 3;
      })
      .toArray(), [1, 2]
    )
  },

  "Take and filter": function() {
    equals(
      F([1, 2, 3, 4, 5, 6])
      .filter(function(x) {
        return x % 2 == 0;
      })
      .takeWhile(function(x) {
        return x < 5;
      })
      .toArray(), [2, 4]
    )
  }
});

buster.testCase("Iterable.fold", {
  "Fold with empty arrays": function() {
    equals(
      F([])
      .fold(function() {}), undefined
    )
  },

  "Fold with empty arrays and starting value": function() {
    equals(
      F([])
      .fold(function() {}, 10), 10
    )
  },

  "Fold with sum": function() {
    equals(
      F([1, 3, 4, 5, 6])
      .fold(function(x, y) {
        return x + y;
      }), 19
    )
  },

  "Fold with string concatenation": function() {
    equals(
      F(["John", "Mike", "Colin"])
      .fold(function(x, y) {
        return x + " and " + y;
      }), "John and Mike and Colin"
    )
  },

  "Fold with sum and starting value": function() {
    equals(
      F([1, 3, 4, 5, 6])
      .fold(function(x, y) {
        return x + y;
      }, 10), 29
    )
  },
});

buster.testCase("Iterable.foreach", {
  "with empty arrays": function() {
    F([])
      .foreach(function() {
        assert(false);
      });
    /* As there has to be at least one assertion */
    assert(true);
  },

  "Sum with foreach": function() {
    var sum = 0;

    F([1, 2, 3, 4])
      .foreach(function(x) {
        sum += x;
      })

    equals(sum, 10);
  },

  "Filter and map with foreach": function() {
    var sum = 0;

    F([1, 2, 3, 4, 5])
      .filter(function(x) {
        return x > 2;
      })
      .map(function(x) {
        return x * x;
      })
      .filter(function(x) {
        return x > 10;
      })
      .foreach(function(x) {
        sum += x;
      })

    equals(sum, 41);
  },

  "Index and done": function() {
    F([2, 4, 6])
      .foreach(function(x, index, done) {
        assert.equals(x / 2, index + 1);

        if (index == 2) {
          assert(done);
        }
      });
  }
});

buster.testCase("Iterable.reverse", {
  "With empty arrays": function() {
    equals(
      F([])
      .toArray()
      .reverse(), []
    )
  },

  "With numbers": function() {
    equals(
      F([1, 2, 3, 4, 5])
      .reverse()
      .toArray(), [5, 4, 3, 2, 1]
    )
  }
});

buster.testCase("Iterable.flatten", {
  "with empty array": function() {
    equals(
      F([])
      .flatten()
      .toArray(), []
    )
  },

  "with empty arrays": function() {
    equals(
      F([
        [],
        [],
        []
      ])
      .flatten()
      .toArray(), []
    )
  },

  "with mixed arrays": function() {
    equals(
      F([
        [],
        [1, 2, 3],
        [],
        ["John", "Colin"],
        []
      ])
      .flatten()
      .toArray(), [1, 2, 3, "John", "Colin"]
    )
  }
});

buster.testCase("Iterable.toMap", {
  "With empty array": function() {
    equals(
      F([])
      .toMap(), {}
    )
  },

  "With valid pairs": function() {
    equals(
      F([
        ["A", 1],
        ["B", 2]
      ])
      .toMap(), {
        A: 1,
        B: 2
      }
    )
  }
});

buster.testCase("Iterable.each", {
  "With empty array": function() {
    equals(
      F([])
      .each(function() {
        assert(false);
      })
      .toArray(), []
    )
  },

  "Return value is ignored": function() {
    equals(
      F([1, 2, 3, 4])
      .each(function() {
        return 0;
      })
      .toArray(), [1, 2, 3, 4]
    )
  },

  "Each with map": function() {
    var sum = 0;

    equals(
      F([1, 2, 3, 4])
      .map(function(x) {
        return x * 2;
      })
      .each(function(x) {
        sum += x;
      })
      .toArray(), [2, 4, 6, 8]
    )

    assert.equals(sum, 20);
  }
});

buster.testCase("Iterable.property", {
  "With empty array": function() {
    equals(
      F([])
      .property("nothing", "here")
      .toArray(), []
    )
  },

  "With single property": function() {
    equals(
      F([{
        name: "John"
      }, {
        name: "Colin"
      }, {
        name: "Mike"
      }])
      .property("name")
      .toArray(), ["John", "Colin", "Mike"]
    )
  },

  "With missing properties": function() {
    equals(
      F([{
        name: "John"
      }, {
        name: "Colin"
      }, {
        name: "Mike"
      }])
      .property("surname")
      .toArray(), [null, null, null]
    )
  },

  "With nested properties": function() {
    equals(
      F([{
        name: "John"
      }, {
        name: "Colin"
      }, {
        name: "Mike"
      }])
      .property("name", "length")
      .toArray(), [4, 5, 4]
    )
  },

  "With filer properties": function() {
    equals(
      F([{
        name: "John"
      }, {
        name: "Colin"
      }, {
        name: "Mike"
      }])
      .property("name", "length")
      .filter(P.equalTo(4))
      .toArray(), [4, 4]
    )
  }
});

buster.testCase("Iterable.keys", {
  "With empty array": function() {
    equals(
      F([])
      .keys()
      .toArray(), []
    )
  },

  "With mixed keys": function() {
    equals(
      F({
        a: 1,
        2: "b",
        null: "c"
      })
      .keys()
      .toArray(), ["2", "a", "null"]
    )
  }
});

buster.testCase("Iterable.values", {
  "With empty array": function() {
    equals(
      F([])
      .values()
      .toArray(), []
    )
  },

  "With mixed values": function() {
    equals(
      F({
        a: 1,
        2: "b",
        null: "c"
      })
      .values()
      .toArray(), ["b", 1, "c"]
    )
  },

  "With undefined values": function() {
    equals(
      F({
        a: 1,
        2: "b",
        null: undefined,
        3: 5
      })
      .values()
      .toArray(), ["b", 5, 1]
    )
  }
});

buster.testCase("Iterable.accumulateUntil", {
  "With empty array": function() {
    equals(
      F([])
      .accumulateUntil(P.alwaysTrue)
      .toArray(), []
    )
  },

  "Predicate always true": function() {
    equals(
      F([1, 2, 3, 4])
      .accumulateUntil(P.alwaysTrue)
      .toArray(), [
        [1],
        [2],
        [3],
        [4]
      ]
    )
  },

  "Predicate always false": function() {
    equals(
      F([1, 2, 3, 4])
      .accumulateUntil(P.alwaysFalse)
      .toArray(), []
    )
  },

  "Basic test": function() {
    equals(
      F([1, 2, 3, 4])
      .accumulateUntil(function(x) {
        return x % 2 == 0
      })
      .toArray(), [
        [1, 2],
        [3, 4]
      ]
    )
  },

  "With flatten": function() {
    equals(
      F([1, 2, 3, 4])
      .accumulateUntil(function(x) {
        return x % 2 == 0
      })
      .flatten()
      .toArray(), [1, 2, 3, 4]
    )
  },

  "With map": function() {
    equals(
      F([1, 1, 2, 3, 4])
      .accumulateUntil(function(x) {
        return x % 2 == 0
      })
      .map(function(x) {
        return x.length;
      })
      .toArray(), [3, 2]
    )
  }
});

buster.testCase("F.log", {
  "Basic test": function() {
    var result = F([1, 2, 3, 4])
      .filter(function(x) {
        return x % 2 == 0;
      })
      .log()
      .fold(function(l, r) {
        return l + r;
      });

    assert.equals(result, 6);
  }
});

buster.testCase("F.take", {
  "Basic test": function() {
    var result = F([1, 2, 3, 4])
      .take(2)
      .toArray();

    assert.equals(result, [1, 2]);
  },

  "With not enough elements": function() {
    var result = F([1, 2, 3, 4])
      .take(20)
      .toArray();

    assert.equals(result, [1, 2, 3, 4]);
  },

  "With drop": function() {
    var result = F([1, 2, 3, 4, 5, 6])
      .drop(2)
      .take(2)
      .toArray();

    assert.equals(result, [3, 4]);
  },

  "With filter": function() {
    var result = F([1, 2, 3, 4, 5, 6])
      .filter(function(x) {
        return x % 2 == 0;
      })
      .take(2)
      .toArray();

    assert.equals(result, [2, 4]);
  }
});

buster.testCase("F.unique", {
  "Empty array": function() {
    var result = F([])
      .unique()
      .toArray();

    assert.equals(result, []);
  },

  "With numbers": function() {
    var result = F([1, 2, 3, 1, 1, 4, 5, 2])
      .unique()
      .toArray();

    assert.equals(result, [1, 2, 3, 4, 5]);
  },

  "With strings": function() {
    var result = F(["a", "A", "a", "b", "c", "b", "b"])
      .unique()
      .toArray();

    assert.equals(result, ["a", "A", "b", "c"]);
  },

  "With objects": function() {
    var o1 = {},
      o2 = {},
      o3 = {},

      result = F([o1, o1, o2, o3, o2, o1, o2])
      .unique()
      .toArray();

    assert.equals(result, [o1, o2, o3]);
  },

  "With filter": function() {
    var result = F([1, 2, 3, 1, 1, 4, 5, 2])
      .filter(function(val) {
        return val % 2 == 0;
      })
      .unique()
      .toArray();

    assert.equals(result, [2, 4]);
  },

  "With stream": function() {
    var
      stream = F.stream(),

      result = F(stream)
      .unique()
      .pullStream(stream)
      .then(function(values) {
        equals(values, [1, 2, 3, 4, 5]);
      });

    stream.pushAll([1, 2, 3, 1, 1, 4, 5, 2]);
    stream.stop();

    return result;
  }
});

buster.testCase("F.all", {
  "Empty array": function() {
    var result = F([])
      .all();

    assert.equals(result, true);
  },

  "All values match": function() {
    var result = F([1, 3, 5])
      .all(function(val) {
        return val % 2 == 1;
      });

    assert.equals(result, true);
  },

  "Not all values match": function() {
    var result = F([1, 3, 2, 5])
      .all(function(val) {
        return val % 2 == 1;
      });

    assert.equals(result, false);
  },

  "With filter": function() {
    var result = F([1, 3, 2, 5])
      .filter(function(val) {
        return val % 2 == 1;
      })
      .all(function(val) {
        return val % 2 == 1;
      });

    assert.equals(result, true);
  }
});

buster.testCase("F.some", {
  "Empty array": function() {
    var result = F([])
      .some();

    assert.equals(result, false);
  },

  "Some values match": function() {
    var result = F([1, 2, 5])
      .some(function(val) {
        return val % 2 == 0;
      });

    assert.equals(result, true);
  },

  "No values match": function() {
    var result = F([1, 3, 5])
      .all(function(val) {
        return val % 2 == 0;
      });

    assert.equals(result, false);
  },

  "With filter": function() {
    var result = F([1, 3, 2, 5])
      .filter(function(val) {
        return val % 2 == 1;
      })
      .some(function(val) {
        return val % 2 == 1;
      });

    assert.equals(result, true);
  }
});

buster.testCase("F.none", {
  "Empty array": function() {
    var result = F([])
      .none();

    assert.equals(result, true);
  },

  "Some values match": function() {
    var result = F([1, 2, 5])
      .none(function(val) {
        return val % 2 == 0;
      });

    assert.equals(result, false);
  },

  "No values match": function() {
    var result = F([1, 3, 5])
      .none(function(val) {
        return val % 2 == 0;
      });

    assert.equals(result, true);
  },

  "With filter": function() {
    var result = F([1, 3, 2, 5])
      .filter(function(val) {
        return val % 2 == 1;
      })
      .none(function(val) {
        return val % 2 == 0;
      });

    assert.equals(result, true);
  }
});

buster.testCase("F.max", {
  "Empty array": function() {
    var result = F([])
      .max();

    assert.equals(result, undefined);
  },

  "Single number": function() {
    var result = F([1])
      .max();

    assert.equals(result, 1);
  },

  "Multiple numbers": function() {
    var result = F([5, 3, 1, 2, 10, 3, 4])
      .max();

    assert.equals(result, 10);
  },

  "Custom compare method": function() {
    var result = F(["John", "Colin", "Dave"])
      .max(function(l, r) {
        return l.length > r.length;
      });

    assert.equals(result, "Colin");
  }
});

buster.testCase("F.min", {
  "Empty array": function() {
    var result = F([])
      .min();

    assert.equals(result, undefined);
  },

  "Single number": function() {
    var result = F([1])
      .min();

    assert.equals(result, 1);
  },

  "Multiple numbers": function() {
    var result = F([5, 3, 1, 2, 10, 3, 4])
      .min();

    assert.equals(result, 1);
  },

  "Custom compare method": function() {
    var result = F(["John", "Colin", "Michael"])
      .min(function(l, r) {
        return l.length < r.length;
      });

    assert.equals(result, "John");
  }
});