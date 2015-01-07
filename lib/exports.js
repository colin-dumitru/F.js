/* global define: true */
/* global module: true */
(function(root) {
  var globals = {
    F: root.F,
    P: root.P
  };

  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], function() {
      return globals;
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = globals;
  }
})(this);