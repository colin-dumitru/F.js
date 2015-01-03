(function() {
  /**
   * Creates a new stream instance. The new instance will also be set on the
   * F.lastStream static property
   *
   * @return - a new stream instance.
   */
  F.stream = function() {
    return F.lastStream = new Stream();
  }

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
    var stream = F.stream();

    if (typeof obj.addEventListener == "function") {
      /* Normal DOM elements */
      obj.addEventListener(event, function(obj) {
        stream.push(obj);
      });
    } else if (typeof obj.on == "function") {
      /* jQuery event handling */
      obj.on(event, function(obj) {
        stream.push(obj);
      });
    }
    return stream;
  }

  var Stream = function() {
    this._done = false;
    this._value = undefined;
    this._eventListeners = [];
    this._doneListeners = [];
  }

  Stream.prototype.then = function(callback) {
    this._eventListeners.push(callback);
    return this;
  }

  Stream.prototype.done = function(callback) {
    this._doneListeners.push(callback);
    return this;
  }

  Stream.prototype.push = function(value) {
    if (this._done) {
      return this;
    }
    this._value = value;

    for (var i = 0; i < this._eventListeners.length; i++) {
      this._eventListeners[i](this._value);
    }
    return this;
  }

  Stream.prototype.pushAll = function(values) {
    if (this._done) {
      return;
    }
    for (var i = 0; i < values.length; i++) {
      this.push(values[i]);
    }
    return this;
  }

  Stream.prototype.next = function() {
    return {
      value: this._value,
      done: this._done
    }
  }

  Stream.prototype.stop = function() {
    if (!this._done) {
      delete this._value;
      this._done = true;

      for (var i = 0; i < this._doneListeners.length; i++) {
        this._doneListeners[i]();
      }
    }
  }

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
      })
    });
  }
})(this);