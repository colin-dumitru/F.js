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
    var stream = F.stream();

    stream.push(1);
    stream.push(2);

    equals(stream.buffer, [1, 2]);
  },

  "Elements are consumed when calling next": function() {
    var stream = F.stream();

    stream.push(1);
    stream.push(2);

    equals(stream.buffer, [1, 2]);

    equals(stream.next(), {
      value: 1,
      done: false
    });
    equals(stream.next(), {
      value: 2,
      done: false
    });
  },

  "onevent is fired when pushing new items": function() {
    var stream = F.stream(),
      values = [];

    stream.onevent = function(value) {
      values.push(value);
    }

    stream.push(1);
    stream.push(2);

    equals(values, [1, 2]);
  },

  "Canceling streams": function() {
    var stream = F.stream();

    stream.push(1);
    stream.push(2);
    stream.cancel();

    equals(stream.buffer, [1, 2]);

    equals(stream.next(), {
      value: 1,
      done: false
    });
    equals(stream.next(), {
      value: 2,
      done: true
    });
  },
});

buster.testCase("Iterable.pullStream", {
  "Elements are pushed into buffer": function() {
    var stream = F.stream();

    var promise = F(stream)
      .pullStream(stream, P.count(1))
      .then(function(values) {
        equals(values, [1, 2])
      })

    stream.push(1);
    stream.push(2);

    return promise;
  }
});