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

buster.testCase("F.eventStream", {
  "With keydown events": function() {
    var mock = mockElement();

    var promise = F(F.eventStream(mock, "keydown"))
      .map(function(obj) {
        return obj.keycode;
      })
      .pullStream(F.lastStream, P.limit(2))
      .then(function(values) {
        equals(values, [22, 33])
      });

    mock.trigger("keydown", {
      keycode: 22
    });
    mock.trigger("keydown", {
      keycode: 33
    });

    return promise;
  },

  "With keydown events and take": function() {
    var mock = mockElement();

    var promise = F(F.eventStream(mock, "keydown"))
      .map(function(obj) {
        return obj.keycode;
      })
      .take(1)
      .pullStream(F.lastStream)
      .then(function(values) {
        equals(values, [22])
      });

    mock.trigger("keydown", {
      keycode: 22
    });
    return promise;
  },

  "Handlers are removed after the stream is stopped": function() {
    var mock = mockElement();

    var promise = F(F.eventStream(mock, "keydown"))
      .map(function(obj) {
        return obj.keycode;
      })
      .pullStream(F.lastStream, P.limit(2))
      .then(function(values) {
        equals(values, [22, 33])
      });

    mock.trigger("keydown", {
      keycode: 22
    });
    mock.trigger("keydown", {
      keycode: 33
    });

    assert(!mock.listeners["keydown"])

    return promise;
  }
});

buster.testCase("F.feedStream", {
  "Basic test": function() {

    var mock = mockElement(),

      keyStream = F.stream(),

      promise = F(keyStream)
      .map(function(val) {
        return val * 2;
      })
      .pullStream(keyStream, P.limit(2))
      .then(function(values) {
        equals(values, [44, 66]);
      });

    F(F.eventStream(mock, "keydown"))
      .property("keycode")
      .feedStream(keyStream)
      .pullStream(F.lastStream);

    mock.trigger("keydown", {
      keycode: 22
    });
    mock.trigger("keydown", {
      keycode: 33
    });

    return promise;
  }
});

buster.testCase("Stream.multiplexStream", {
  "With array of streams": function() {

    var s1 = F.stream(),
      s2 = F.stream(),
      s3 = F.stream(),
      multiplex = F.multiplexStream([s1, s2, s3]),

      values = [],
      doneCalled = false;

    multiplex
      .then(function(value) {
        values.push(value);
      })
      .done(function(values) {
        doneCalled = true;
      });

    s3.push(1);
    s2.push(2);
    s1.push(3);
    s3.push(4);
    s3.push(5);

    s1.stop();
    s2.stop();
    s3.stop();

    equals(values, [1, 2, 3, 4, 5]);
    assert(doneCalled);
  },

  "With variadic function": function() {

    var s1 = F.stream(),
      s2 = F.stream(),
      s3 = F.stream(),
      multiplex = F.multiplexStream(s1, s2, s3),

      values = [],
      doneCalled = false;

    multiplex
      .then(function(value) {
        values.push(value);
      })
      .done(function(values) {
        doneCalled = true;
      });

    s3.push(1);
    s2.push(2);
    s1.push(3);
    s3.push(4);
    s3.push(5);

    s1.stop();
    s2.stop();
    s3.stop();

    equals(values, [1, 2, 3, 4, 5]);
    assert(doneCalled);
  },

  "With pull stream": function() {
    var s1 = F.stream(),
      s2 = F.stream(),
      s3 = F.stream(),
      multiplex = F.multiplexStream(s1, s2, s3),

      values = [],

      promise = F(multiplex)
      .filter(function(val) {
        return val % 2 == 0;
      })
      .map(function(val) {
        return val * 2;
      })
      .each(values.push.bind(values))
      .pullStream(multiplex)
      .then(function(values) {
        equals(values, [4, 8]);
      });

    s3.push(1);
    s2.push(2);
    s1.push(3);
    s3.push(4);
    s3.push(5);

    s1.stop();
    s2.stop();
    s3.stop();

    equals(values, [4, 8]);

    return promise;
  }
});

buster.testCase("Stream.multiplexStream", {
  "Stream is stopped after three tries": function() {
    var stream = F.intervalStream("Colin", 10),
      values = [];

    return new Promise(function(resolve) {
      stream.then(function(value) {
        values.push(value);

        if (values.length == 3) {
          stream.stop();
        }
      });
      stream.done(function() {
        equals(values, ["Colin", "Colin", "Colin"]);
        resolve();
      });
    });
  },

  "With drop and limit": function() {
    var stream = F.intervalStream(50, 10),
      values = [];

    return new Promise(function(resolve) {
      F(stream)
        .drop(2)
        .pullStream(stream, P.limit(3))
        .then(function(values) {
          equals(values, [50]);
          resolve()
        });
    });
  }
});

buster.testCase("Stream.multiplexStream", {
  "Stream is never stopped": function() {
    var stream = F.timerStream("Colin", 10),
      values = [];

    return new Promise(function(resolve) {
      stream.then(function(value) {
        values.push(value);
      });
      stream.done(function() {
        equals(values, ["Colin"]);
        resolve();
      });
    });
  },

  "Stream is stopped before the timeout": function() {
    var stream = F.timerStream("Colin", 5000),
      values = [];

    return new Promise(function(resolve) {
      stream.then(function(value) {
        values.push(value);
      });
      stream.done(function() {
        equals(values, []);
        resolve();
      });

      stream.stop();
    });
  },

  "With drop": function() {
    var stream = F.timerStream(50, 10),
      values = [];

    return new Promise(function(resolve) {
      F(stream)
        .drop(1)
        .pullStream(stream)
        .then(function(values) {
          equals(values, []);
          resolve()
        });
    });
  }
});

function mockElement() {
  var listeners = {};

  function addEventListener(event, handler) {
    listeners[event] = handler;
  }

  function removeEventListener(event, handler) {
    delete listeners[event];
  }

  function trigger(event, value) {
    listeners[event](value);
  }

  return {
    addEventListener: addEventListener,
    removeEventListener: removeEventListener,
    trigger: trigger,
    listeners: listeners
  };
}