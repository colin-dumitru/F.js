F.stream = function() {
  return F.lastStream = new F.Stream();
}

F.Stream = function() {
  this.buffer = [];
  this.done = false;

  this.onevent = function() {};
  this.oncancel = function() {};
}

F.Stream.prototype.push = function(value) {
  if (!this.done) {
    this.buffer.push(value);
    this.onevent(value);
  }
}

F.Stream.prototype.next = function() {
  var value = this.buffer.splice(0, 1)[0];

  return {
    value: value,
    done: this.done && !this.buffer.length
  }
}

F.Stream.prototype.cancel = function(value) {
  this.done = true;

  this.oncancel();
}

F.Iterable.prototype.pullStream = function(stream, pred) {

  /* If the second argument is not passed, then never cancel the stream */
  if (!pred) {
    pred = P.alwaysTrue;
  }

  var us = this;

  return new Promise(function(resolve) {
    var values = [],
      value;

    /* Each time the stream pushes an event, we must pull the iterable chain
    so the value is passed through. */
    stream.onevent = function() {
      while (stream.buffer.length) {
        /* Pull values from the iterable chain */
        value = us._iter.next();

        if (!F.isEmptyValue(value)) {
          values.push(value.value);
        }

        if (!pred(value.value) || value.done) {
          stream.cancel();
          resolve(values);
        }
      }
    }

  });
}