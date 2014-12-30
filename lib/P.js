P = function(iterator) {};

/**
 * Combines two or more predicates. The resulting predicate will evaluate to true
 * IFF all the input predicates evaluate to true for the given arguments.
 *
 * @param - a list of predicates to combine. Can either be a list of predicates,
 *  or individual values.
 * @return - predicate which evaluates to true if all input predicates evaluate to true
 */
P.and = function() {
  var predicates = arguments;

  /* Check if the first argument is an array */
  if (predicates && Array.isArray(predicates[0])) {
    predicates = predicates[0];
  }

  return function(val) {
    for (var i = 0; i < predicates.length; i++) {
      if (!predicates[i](val)) {
        return false;
      }
    }
    return true;
  }
};


/**
 * Combines two or more predicates. The resulting predicate will evaluate to true
 * IFF any of the input predicates evaluate to true for the given arguments.
 *
 * @param - a list of predicates to combine. Can either be a list of predicates,
 *  or individual values.
 * @return - predicate which evaluates to true if any input predicates evaluate to true
 */
P.or = function() {
  var predicates = arguments;

  /* Check if the first argument is an array */
  if (predicates && Array.isArray(predicates[0])) {
    predicates = predicates[0];
  }

  return function(val) {
    for (var i = 0; i < predicates.length; i++) {
      if (predicates[i](val)) {
        return true;
      }
    }
    return false;
  }
};

/**
 * Negates an input predicate.
 *
 * @param - the predicate to negate
 * @return - a predicate which negates the input value
 */
P.not = function(pred) {
  return function(val) {
    return !pred(val);
  }
};

/**
 * Creates a predicate which always returns true.
 *
 * @return - a predicate which always returns true.
 */
P.alwaysTrue = function() {
  return true;
};

/**
 * Creates a predicate which always returns false.
 *
 * @return - a predicate which always returns false.
 */
P.alwaysFalse = function() {
  return false;
};

/**
 * Creates a predicate which always returns true.
 *
 * @return - a predicate which always returns true.
 */
P.isNull = function(val) {
  return val == null;
};

/**
 * Creates a predicate which always returns false.
 *
 * @return - a predicate which always returns false.
 */
P.notNull = function(val) {
  return val != null;
};

/**
 * Creates a new predicate which evaluates to true of the evaluated object
 * has the given property.
 *
 * @param - a series of string elements which correspond to property names.
 * @return - a predicate which always returns false.
 */
P.hasProperty = function() {
  var properties = arguments;

  return function(obj) {
    for (var i = 0; i < properties.length; i++) {
      if (typeof obj[properties[i]] == "undefined") {
        return false;
      }
      obj = obj[properties[i]];
    }
    return true;
  }
};