/* global console: true */
/* global setInterval: true */
/* global clearInterval: true */
/* global setTimeout: true */
/* global clearTimeout: true */
(function(root) {
  var F = root.F,
    P = root.P;

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
  F.eventStream = function(obj, event) {
    var stream = F.stream(),
      handler = function(obj) {
        stream.push(obj);
      };

    if (typeof obj.addEventListener === "function") {
      /* Normal DOM elements */
      obj.addEventListener(event, handler);

      stream.done(function() {
        obj.removeEventListener(event, handler);
      });
    } else if (typeof obj.on === "function") {
      /* jQuery event handling */
      obj.on(event, handler);

      stream.done(function() {
        obj.off(event, handler);
      });
    }
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

    for (var i = 0; i < this._eventListeners.length; i++) {
      this._eventListeners[i](value);
    }
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
      delete this._value;
      this._done = true;

      for (var i = 0; i < this._doneListeners.length; i++) {
        this._doneListeners[i]();
      }
    }
  };

  F.Iterable.prototype.pullStream = function(stream, pred) {

    /* If the second argument is not passed, then never cancel the stream */
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
          stream.stop();
        }
      });

      stream.done(function() {
        resolve(values);
      });
    });
  };
})(this);