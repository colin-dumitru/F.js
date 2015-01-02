(function() {
  F.stream = function() {
    return F.lastStream = new Stream();
  }

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
    this._doneListeners.push(callback);
  }

  Stream.prototype.done = function(callback) {
    this._doneListeners.push(callback);
  }

  Stream.prototype.push = function(value) {
    if (this._done) {
      return;
    }
    this._value = value;

    for (var i = 0; i < this._doneListeners.length; i++) {
      this._doneListeners[i](this._value);
    }
  }

  Stream.prototype.pushAll = function(values) {
    if (this._done) {
      return;
    }
    for (var i = 0; i < values.length; i++) {
      this.push(values[i]);
    }
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