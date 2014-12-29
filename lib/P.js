P = function(iterator) {};

P.and = function() {
  var predicates = arguments;

  return function(val) {
    for (var i = 0; i < predicates.length; i++) {
      if (!predicates[i](val)) {
        return false;
      }
    }
    return true;
  }
};

P.or = function() {
  var predicates = arguments;

  return function(val) {
    for (var i = 0; i < predicates.length; i++) {
      if (predicates[i](val)) {
        return true;
      }
    }
    return false;
  }
};

P.not = function(pred) {
  return function(val) {
    return !pred(val);
  }
};