if (typeof require !== 'undefined') {
  buster = require("buster");
  Promise = require('es6-promise')
    .Promise;
}
var assert = buster.referee.assert;

function equals(a, b) {
  assert.equals(JSON.stringify(a), JSON.stringify(b));
}

buster.testCase("F.stream", {
  "Elements are pushed into buffer": function() {
    var stream = F.stream(),
      buffer = [];

    stream.then(buffer.push.bind(buffer));

    stream.push(1);
    stream.push(2);

    equals(buffer, [1, 2]);
  },

  "Next is last item pushed": function() {
    var stream = F.stream(),
      buffer = [];

    stream.then(buffer.push.bind(buffer));

    stream.push(1);

    equals(stream.next(), {
      value: 1,
      done: false
    });

    stream.push(2);

    equals(buffer, [1, 2]);

    equals(stream.next(), {
      value: 2,
      done: false
    });
  },

  "Then is fired when pushing new items": function() {
    var stream = F.stream(),
      values = [];

    stream.then(function(value) {
      values.push(value);
    });

    stream.push(1);
    stream.push(2);

    equals(values, [1, 2]);
  },

  "Stopping streams": function() {
    var stream = F.stream(),
      doneCalled = false;

    stream.done(function() {
      doneCalled = true;
    });

    stream.push(1);
    equals(stream.next(), {
      value: 1,
      done: false
    });
    stream.push(2);
    equals(stream.next(), {
      value: 2,
      done: false
    });
    stream.stop();
    equals(stream.next(), {
      done: true
    });

    assert(doneCalled);
  },
});

buster.testCase("Iterable.pullStream", {
  "With predicate": function() {
    var stream = F.stream();

    var promise = F(stream)
      .pullStream(stream, P.limit(2))
      .then(function(values) {
        equals(values, [1, 2])
      });

    stream.push(1);
    stream.push(2);

    return promise;
  },

  "With no predicate and stop": function() {
    var stream = F.stream();

    var promise = F(stream)
      .pullStream(stream)
      .then(function(values) {
        equals(values, [1, 2, 3])
      });

    stream.pushAll([1, 2, 3]);
    stream.stop();

    return promise;
  },

  "With map": function() {
    var stream = F.stream();

    var promise = F(stream)
      .map(function(x) {
        return x * 2;
      })
      .pullStream(stream)
      .then(function(values) {
        equals(values, [2, 4, 6])
      });

    stream.pushAll([1, 2, 3]);
    stream.stop();

    return promise;
  },

  "With filter": function() {
    var stream = F.stream();

    var promise = F(stream)
      .filter(function(x) {
        return x % 2 == 0;
      })
      .pullStream(stream)
      .then(function(values) {
        equals(values, [2])
      });

    stream.pushAll([1, 2, 3]);
    stream.stop();

    return promise;
  },

  "With drop": function() {
    var stream = F.stream();

    var promise = F(stream)
      .drop(2)
      .pullStream(stream)
      .then(function(values) {
        equals(values, [3])
      });

    stream.pushAll([1, 2, 3]);
    stream.stop();

    return promise;
  },

  "With drop while": function() {
    var stream = F.stream();

    var promise = F(stream)
      .dropWhile(function(x) {
        return x < 4;
      })
      .pullStream(stream)
      .then(function(values) {
        equals(values, [4, 5])
      });

    stream.pushAll([1, 2, 3, 4, 5]);
    stream.stop();

    return promise;
  }
});