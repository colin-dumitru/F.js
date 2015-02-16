if (typeof require !== 'undefined') {
  var Fjs = require("../dist/F.min.js"),
    F = Fjs.F,
    P = Fjs.P,
    buster = require("buster");
} else {
  var Fjs = window;
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

  "Buffered next": function() {
    var stream = F.stream(3);

    stream.pushAll([1, 2, 3, 4]);

    assert.equals(stream.next().value, 2);
    assert.equals(stream.next().value, 3);
    assert.equals(stream.next().value, 4);
    assert.equals(stream.next().value, undefined);
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

  "Pull stream": function() {
    var stream = F.stream();

    var promise = F([1, 2, 3, 4, 5])
      .map(function(x) {
        return x * 2;
      })
      .pullStream(stream)
      .then(function(values) {
        equals(values, [2, 4, 6]);
      });

    stream.pushAll(["Colin", "Dave", "Johnny"]);
    stream.stop();

    return promise;
  },


  "Pull stream with stream and predicate": function() {
    var stream = F.stream();

    var promise = F([1, 2, 3, 4, 5])
      .map(function(x) {
        return x * 2;
      })
      .pullStream(stream, P.limit(3))
      .then(function(values) {
        equals(values, [2, 4, 6]);
      });

    stream.pushAll(["Colin", "Dave", "Johnny"]);

    return promise;
  },

  "Pull stream with multiple chains": function() {
    var stream = F.stream(),
      values = [],
      doneCalled = 0,

      onDone = function() {
        doneCalled++;

        if (doneCalled == 3) {
          equals(values, [1, 2, 3, 10, 20, 30, 20, 40, 60]);
          equals(doneCalled, 3);
        }
      };

    var promise = F(stream)
      .each(function(x) {
        values.push(x);
      })
      .pullStream()
      .then(onDone);

    var promise = F(stream)
      .each(function(x) {
        values.push(x * 2);
      })
      .pullStream()
      .then(onDone);

    var promise = F(stream)
      .each(function(x) {
        values.push(x * 3);
      })
      .pullStream()
      .then(onDone);

    stream.push(1);
    stream.push(10);
    stream.push(20);
    stream.stop();

    return promise;
  }
});

buster.testCase("Iterable.pullStream", {
  "With predicate": function() {
    var stream = F.stream();

    var promise = F(stream)
      .pullStream(P.limit(2))
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
      .pullStream()
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
      .pullStream()
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
      .pullStream()
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
      .pullStream()
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
      .pullStream()
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
      .pullStream(P.limit(2))
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

  "Multiplexed keydown events": function() {
    var mock1 = mockElement(),
      mock2 = mockElement(),

      stream1 = F.eventStream(mock1, "keydown"),
      stream2 = F.eventStream(mock2, "keydown");

    var promise = F(F.mplex(stream1, stream2))
      .map(function(obj) {
        return obj.keycode;
      })
      .pullStream(P.limit(5))
      .then(function(values) {
        equals(values, [11, 22, 33, 44, 55])
      });

    mock1.trigger("keydown", {
      keycode: 11
    });
    mock1.trigger("keydown", {
      keycode: 22
    });
    mock2.trigger("keydown", {
      keycode: 33
    });
    mock2.trigger("keydown", {
      keycode: 44
    });
    mock2.trigger("keydown", {
      keycode: 55
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
      .pullStream()
      .then(function(values) {
        equals(values, [22])
      });

    mock.trigger("keydown", {
      keycode: 22
    });
    return promise;
  },

  "With keydown events and takeWhile": function() {
    var mock = mockElement();

    var promise = F(F.eventStream(mock, "keydown"))
      .map(function(obj) {
        return obj.keycode;
      })
      .takeWhile(P.alwaysFalse)
      .pullStream()
      .then(function(values) {
        equals(values, [])
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
      .pullStream(P.limit(2))
      .then(function(values) {
        equals(values, [22, 33])
      })
      .then(function() {
        /* The handler is disabled when pushing a new values without any listeners attached */
        mock.trigger("keydown", {
          keycode: 33
        });
        assert(!mock.listeners["keydown"]);
      });

    mock.trigger("keydown", {
      keycode: 22
    });
    mock.trigger("keydown", {
      keycode: 33
    });

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
      .pullStream(P.limit(2))
      .then(function(values) {
        equals(values, [44, 66]);
      });

    F(F.eventStream(mock, "keydown"))
      .property("keycode")
      .feedStream(keyStream)
      .pullStream();

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
      .pullStream()
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

    return new Fjs.Promise(function(resolve) {
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

    return new Fjs.Promise(function(resolve) {
      F(stream)
        .drop(2)
        .pullStream(P.limit(3))
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

    return new Fjs.Promise(function(resolve) {
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

    return new Fjs.Promise(function(resolve) {
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

    return new Fjs.Promise(function(resolve) {
      F(stream)
        .drop(1)
        .pullStream()
        .then(function(values) {
          equals(values, []);
          resolve()
        });
    });
  }
});

buster.testCase("Stream.throttle", {
  "setUp": function() {
    this.timeout = 2000;
  },

  "Push four values consecutively": function() {
    var start = Date.now(),
      stream = F.stream().throttle(1000),

      timesCalled = 0;

    return new Fjs.Promise(function(resolve) {
      stream.then(function(values) {
        timesCalled++;

        if (timesCalled == 1) {
          equals(values, [1]);
          assert.less(Date.now() - start, 500);
        } else {
          equals(values, [2, 3, 4]);
          assert.greater(Date.now() - start, 500);
          resolve();
        }
      });

      stream.push(1);
      stream.push(2);
      stream.push(3);
      stream.push(4);
    });
  },

  "Push values in burst": function() {
    var start = Date.now(),
      stream = F.stream().throttle(400),

      timesCalled = 0,
      index = 0;

    return new Fjs.Promise(function(resolve) {
      stream.then(function(values) {
        timesCalled++;


        if (timesCalled == 1) {
          equals(values, [1]);
        } else if (timesCalled == 2) {
          equals(values, [2, 3]);
        } else {
          equals(values, [4, 5]);
          resolve();
        }
      });

      setInterval(function() {
        index++;

        if (index < 6) {
          stream.push(index);
        }
      }, 150);
    });
  }
});

buster.testCase("Stream.bindPush", {
  "Basic test": function() {
    var stream = F.stream(),
      delegate = stream.bindPush(),

      promise = F(stream).pullStream().then(function(values) {
        equals([1, 2, 3, 4, 5], values);
      });

    delegate(1);
    stream.push(2);
    delegate(3);
    stream.push(4);
    delegate(5);

    stream.stop();

    return promise;
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