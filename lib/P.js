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
 * Static predicate which evaluates to true if the evaluated object is null
 */
P.isNull = function(val) {
  return val == null;
};

/**
 * Static predicate which evaluates to true if the evaluated object is not null
 */
P.notNull = function(val) {
  return val != null;
};

/**
 * Creates a new predicate which evaluates to true of the evaluated object
 * has the given property.
 *
 * @param - a series of string elements which correspond to property names.
 * @return - a new predicate instance.
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

/**
 * Creates a new predicate which evaluates to true of the evaluated object
 * has the given property.
 *
 * @param - a series of string elements which correspond to property names.
 * @return - a new predicate instance.
 */
P.in = function(array) {
  return function(obj) {
    return array.indexOf(obj) != -1;
  }
};

/**
 * Creates a new predicate which evaluates to true if both the input object
 * and the evaluated object are equal (weak equals)
 *
 * @param toCheck - object to check against all evaluated objects.
 * @return - a new predicate instance.
 */
P.equalTo = function(toCheck) {
  return function(obj) {
    return obj == toCheck;
  }
};

/**
 * Creates a new predicate which evaluates to true if both the input object
 * and the evaluated object are equal (string equals)
 *
 * @param toCheck - object to check against all evaluated objects.
 * @return - a new predicate instance.
 */
P.strongEqualTo = function(toCheck) {
  return function(obj) {
    return obj === toCheck;
  }
};

/**
 * Creates a new predicate which evaluates to true if the evaluated object is
 * an instance of the input type.
 *
 * @param type - the type to check againsts evaluated objects.
 * @return - a new predicate instance.
 */
P.instanceOf = function(type) {
  return function(obj) {
    return obj instanceof type;
  }
};

/**
 * Creates a new predicate which evaluates to true if the evaluated object is
 * an instance of the input type.
 *
 * @param type - the type to check againsts evaluated objects.
 * @return - a new predicate instance.
 */
P.on = function() {
  var pred = arguments[arguments.length - 1],
    properties = arguments;

  return function(obj) {
    /* We don't iterate over the last argument as that is the predicate */
    for (var i = 0; i < properties.length - 1; i++) {
      if (typeof obj[properties[i]] == "undefined") {
        return false;
      }
      obj = obj[properties[i]];
    }
    return pred(obj);
  }
};

/**
 * Creates a new predicate which evaluates to true for the first <count>
 * times, after which it will always evaluate to false.
 *
 * @param count - the number of times to evaluate to true.
 * @return - a new predicate instance.
 */
P.count = function(count) {
  return function() {
    if (count-- > 0) {
      return true;
    } else {
      return false;
    }
  };
};