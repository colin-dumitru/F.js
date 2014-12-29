var assert = buster.referee.assert;

function equals(a, b) {
  assert.equals(JSON.stringify(a), JSON.stringify(b));
}

buster.testCase("Arrow notations", {
  "Filter": function() {
    equals(
      F([1, 2, 3, 4])
      .filter(x => x % 2 == 0)
      .toArray(), [2, 4]
    )
  },

  "Map": function() {
    equals(
      F([1, 2, 3, 4])
      .map(x => x * 2)
      .toArray(), [2, 4, 6, 8]
    )
  },

  "Multiple operations": function() {
    equals(
      F([1, 2, 3, 4])
      .filter(x => x % 2 == 1)
      .map(x => x * 2)
      .fold((x, y) => x + y), 8
    )
  },

  "Predicates And": function() {
    equals(
      F([1, 2, 3, 4, 11, 12, 13, 14])
      .filter(
        P.and(
          x => x < 10,
          x => x % 2 == 0
        )
      )
      .toArray(), [2, 4]
    )
  }
});

buster.testCase("Generators", {
  "Map with generators": function() {

    var gen = function*() {
      yield 1;
      yield 2;
      yield 3;
      return 4;
    };

    equals(
      F(gen())
      .filter(x => x % 2 == 0)
      .toArray(), [2, 4]
    )
  },

  "Gnerators with no return value": function() {

    var gen = function*() {
      yield 1;
      yield 2;
      yield 3;
    };

    equals(
      F(gen())
      .filter(x => x % 2 == 0)
      .toArray(), [2]
    )
  }
});