/**
 * Minimal promises polyfill for runtimes which do not support it.
 */
(function(root) {
  if (root.Promise) {
    return;
  }

  var Promise = function(callback) {

    var that = this;

    this._value = undefined;
    this._resolved = false;
    this._callbacks = [];

    callback(function(value) {
      that._value = value;
      that._resolved = true;

      for (var i = 0; i < that._callbacks.length; i++) {
        that._callbacks[i](value);
      }
    });
  };

  Promise.prototype.then = function(callback) {
    if (this._resolved) {
      callback(this._value);
    } else {
      this._callbacks.push(callback);
    }
    return this;
  };
  root.Promise = Promise;
})(this);