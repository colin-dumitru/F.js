/**
 * Entry point for the "F" library. This method receives as parameter
 * either a iterator or a plain collection (it must be indexable and have
 * a "length" property)
 *
 * @param iterator - either a JS collection or an iterable.
 * @return - a iterator wrapper used for method chaining.
 */
F = function(iterator) {
  if (typeof iterator.next === "function") {
    return new F.Iterable(iterator);
  } else {
    return new F.Iterable(new F.ArrayIterator(iterator));
  }
}

F.ArrayIterator = function(collection) {
  this._collection = collection;
  this._index = -1;
}

F.ArrayIterator.prototype.next = function() {
  this._index++;

  return {
    value: this._collection[this._index],
    done: this._index >= (this._collection.length - 1)
  };
}

F.MapIterator = function(iterator, func) {
  this._iter = iterator;
  this._func = func;
}

F.MapIterator.prototype.next = function() {
  var value = this._iter.next();

  return {
    value: this._func(value.value),
    done: value.done
  };
}

F.FilterIterator = function(iterator, pred) {
  this._iter = iterator;
  this._pred = pred;
}

F.FilterIterator.prototype.next = function() {
  var value = null;

  do {
    value = this._iter.next();

    if (this._pred(value.value)) {
      return {
        value: value.value,
        done: value.done
      }
    }
  } while (!value.done);

  return {
    done: value.done
  };
}

F.Iterable = function(iterator) {
  this._iter = iterator;
}

F.Iterable.prototype.map = function(func) {
  return F(new F.MapIterator(this._iter, func));
}

F.Iterable.prototype.filter = function(pred) {
  return F(new F.FilterIterator(this._iter, pred));
}

F.Iterable.prototype.toArray = function() {
  var result = [],
    value = null;

  do {
    value = this._iter.next();

    if (typeof value.value != "undefined") {
      result.push(value.value);
    }
  } while (!value.done);

  return result;
}

/* If under the nodeJS runtime, export global variables */
if (exports) {
  exports.F = F;
}