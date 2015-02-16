/* global console: true */
/* global setInterval: true */
/* global clearInterval: true */
/* global setTimeout: true */
/* global clearTimeout: true */
(function(root) {
  var F = root.F,
    P = root.P,

    Promise = root.Promise;

  /**
   * A wrapper iterator over streams which buffer a stream output.
   *
   * @param stream - the stream to buffer values.
   */
  var StreamIterator = function(stream) {
    var us = this;

    this._stream = stream;
    this._buffer = [];
    this._done = false;
    this._handler = function(value) {
      us._buffer.push(value);
    };

    stream.then(this._handler);
    stream.done(function() {
      us._done = true;
    });
  };

  StreamIterator.prototype.next = function() {
    return {
      value: this._buffer.shift(),
      done: this._done
    };
  };

  StreamIterator.prototype.stop = function() {
    this._done = true;
    this._stream.remove(this._handler);
  };

  /**
   * Creates a new stream instance. The new instance will also be set on the
   * F.lastStream static property
   *
   * @return - a new stream instance.
   */
  F.stream = function(bufferSize) {
    return F.lastStream = new Stream(bufferSize);
  };

  /**
   * Creates a new stream which pushes values received from an event handler.
   * The input object on which to attach the event handler must either have an
   * `addEventListener` method (regular DOM objects), or an `on` method
   * (jQuery objects). The input events are dirrectly passed down the filter chain.
   *
   * @param obj - the object on which to attach the event handler. Must either
   *  have an `addEventListener` method , or an `on` method (jQuery objects).
   * @param event - the event name which will be passed to the attach method.
   * @return - a new stream instance.
   */
  F.eventStream = function(obj, eventName) {
    var stream = F.stream(),

      attach,
      detach,
      attached = false,

      originalThen = stream.then;

    if (typeof obj.addEventListener === "function") {
      /* Normal DOM elements */
      attach = obj.addEventListener;
      detach = obj.removeEventListener;
    } else if (typeof obj.on === "function") {
      /* jQuery event handling */
      attach = obj.on;
      detach = obj.off;
    }

    function handler(event) {
      stream.push(event);
      if (!stream._eventListeners.length) {
        disable();
      }
    }

    function enable() {
      attached = true;
      attach.call(obj, eventName, handler);
    }

    function disable() {
      attached = false;
      detach.call(obj, eventName, handler);
    }

    stream.then = function() {
      if (!attached) {
        enable();
      }
      originalThen.apply(stream, arguments);
      return stream;
    };

    stream.done(function() {
      disable();
    });
    return stream;
  };

  /* Alias for event stream */
  F.estream = F.eventStream;

  /**
   * Creates a stream which multiplexes a list of streams.
   *
   * @param streams... - can either be an array of streams or passed as varargs.
   * @return - a new stream instance.
   */
  F.multiplexStream = function() {
    var stream = F.stream(),
      streams,
      finishedStreams = 0,

      onValue = function(value) {
        stream.push(value);
      },

      onDone = function(values) {
        if (++finishedStreams === streams.length) {
          stream.stop();
        }
      };

    if (Array.isArray(arguments[0])) {
      streams = arguments[0];
    } else {
      streams = arguments;
    }

    for (var i = 0; i < streams.length; i++) {
      streams[i]
        .then(onValue)
        .done(onDone);
    }
    return stream;
  };
  /* Alias for multiplex stream */
  F.mplex = F.multiplexStream;

  /**
   * Creates a stream which pushes a constant value periodically.
   *
   * @param value - value to push for the duration of the interval.
   * @param interval - how often should the value get pushed (in milliseconds)
   * @return - a new stream instance.
   */
  F.intervalStream = function(value, interval) {
    var stream = F.stream(),
      timer = setInterval(function() {
        stream.push(value);
      }, interval);

    stream.done(function() {
      clearInterval(timer);
    });

    return stream;
  };


  /**
   * Creates a stream which pushes a value once, after a set period of time. The
   * stream is stopped after the value is pushed.
   *
   * @param value - value to push for the duration of the interval.
   * @param timeout - the delay in milliseconds before pushing the value. The
   *   stream can be canceled before the value is pushed.
   * @return - a new stream instance.
   */
  F.timerStream = function(value, interval) {
    var stream = F.stream(),
      timer = setTimeout(function() {
        stream.push(value);
        stream.stop();
      }, interval);

    stream.done(function() {
      clearTimeout(timer);
    });

    return stream;
  };

  var Stream = function(bufferSize) {
    this._done = false;
    this._eventListeners = [];
    this._doneListeners = [];
    this._size = bufferSize || 1;
    this._buffer = [];
  };

  Stream.prototype.then = function(callback) {
    this._eventListeners.push(callback);
    return this;
  };

  Stream.prototype.remove = function(callback) {
    this._eventListeners.splice(this._eventListeners.indexOf(callback), 1);
    return this;
  };

  Stream.prototype.done = function(callback) {
    this._doneListeners.push(callback);
    return this;
  };

  Stream.prototype.push = function(value) {
    if (this._done) {
      return this;
    }
    this._buffer.push(value);

    if (this._buffer.length > this._size) {
      this._buffer.shift();
    }

    this._notify(value);

    return this;
  };

  Stream.prototype._notify = function(value) {
    this._eventListeners = this._eventListeners.filter(function(handler) {
      return handler(value) !== false;
    });
  };

  Stream.prototype.bindPush = function() {
    var us = this,
      push = this.push;

    return function() {
      push.apply(us, arguments);
    };
  };

  Stream.prototype.throttle = function(rate) {
    /* I apologize to anyone reading this code. */
    var originalPush = this.push,
      us = this,
      timer = 0,
      /* Init with 0 so the first value is always pushed */
      lastPushed = 0,

      buffer = [];

    /* Create a proxy on the push method */
    this.push = function(value) {
      var now = Date.now();

      buffer.push(value);

      if (now - lastPushed > rate) {
        /* If sufficient time has passed since a value was received, then just
        push immediatelly */
        originalPush.call(us, buffer.splice(0));
        lastPushed = now;
      } else if (!timer) {
        /* Otherwise, create a timer which will push the entire buffer once enough
        time has passed */
        timer = setTimeout(function() {
          originalPush.call(us, buffer.splice(0));
          lastPushed = Date.now();
          timer = 0;
        }, rate - (now - lastPushed));
      }
    };

    return this;
  };

  Stream.prototype.pushAll = function(values) {
    if (this._done) {
      return;
    }
    for (var i = 0; i < values.length; i++) {
      this.push(values[i]);
    }
    return this;
  };

  Stream.prototype.next = function() {
    var ret = {
      value: this._buffer.shift(),
      done: this._done
    };
    return ret;
  };

  Stream.prototype.stop = function() {
    if (!this._done) {
      this._done = true;

      for (var i = 0; i < this._doneListeners.length; i++) {
        this._doneListeners[i]();
      }
    }
  };

  Stream.prototype["@@iterator"] = function() {
    return new StreamIterator(this);
  };

  /**
   * Pulls values from the root stream down the iterable chain. You can also
   * pass a stream as the first argument, in which case the values will be pulled
   * when values are pushed inside the second steam.
   *
   * @param stream - (optional) - the stream which trigers when values should be pulled
   * @param pred - (optional) when this predicate valuates to false, the stream will be stopped
   * @return - a promise which will resolve when the stream is stopped. The values
   *  passed to the stream are the complete list of values sent into the stream
   */
  F.Iterable.prototype.pullStream = function(stream, pred) {
    if (!(stream instanceof Stream)) {
      pred = stream;
      stream = this._context.root;
    }
    if (!pred) {
      pred = P.alwaysTrue;
    }

    var us = this;

    return new Promise(function(resolve) {
        var values = [];

        /* Each time the stream pushes an event, we must pull the iterable chain
        so the value is passed through. */
        stream.then(function() {
          /* Pull values from the iterable chain */
          var value = us._iter.next();

          if (!F.isEmptyValue(value)) {
            values.push(value.value);
          }

          if (!pred(value.value) || value.done) {
            resolve(values);
            /* Signal to the stream that the event listener should be removed */
            return false;
          }
        });

        stream.done(function() {
          resolve(values);
        });
      })
      .then(function(values) {
        /* Remove this iterator from the list of listeners on the stream to
        prevent memory leaks and slowness */
        if (typeof us._context.iterable._iter.stop === "function") {
          us._context.iterable._iter.stop();
        }
        return values;
      });
  };
})(this);