/**
 * Entry point for the "F" library. This method receives as parameter
 * either a iterator or a plain collection (it must be indexable and have
 * a "length" property)
 *
 * @param iterator - either a JS collection or an iterable.
 * @return - a iterator wrapper used for method chaining.
 */
F = function(iterator) {
  if (iterator instanceof F.Iterable) {
    /* There's no point in creating another wrapper if it's already an instance we want */
    return iterator;
  } else if (typeof iterator.next === "function") {
    /* If the input is a ES6 generator, just create an Iterable wrapper */
    return new F.Iterable(iterator);
  } else {
    /* TODO - we should check if it's an actual collection */
    return new F.Iterable(new F.ArrayIterator(iterator));
  }
};

F.ArrayIterator = function(collection) {
  this._collection = collection;
  this._index = -1;
};

F.ArrayIterator.prototype.next = function() {
  this._index++;

  return {
    value: this._collection[this._index],
    done: this._index >= (this._collection.length - 1)
  };
};

F.MapIterator = function(iterator, func) {
  this._iter = iterator;
  this._func = func;
};

F.MapIterator.prototype.next = function() {
  var value = this._iter.next();

  return {
    value: this._func(value.value),
    done: value.done
  };
};

F.FilterIterator = function(iterator, pred) {
  this._iter = iterator;
  this._pred = pred;
};

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
};

F.ZipIterator = function(iterator, zipIterator) {
  this._iter = iterator;
  this._zipIter = zipIterator;
};

F.ZipIterator.prototype.next = function() {
  var value = this._iter.next(),
    zipValue = this._zipIter.next(),
    isDone = value.done || zipValue.done;

  if (isDone && (typeof value.value == "undefined" || typeof zipValue.value == "undefined")) {
    return {
      done: true
    };
  } else {
    return {
      done: isDone,
      value: [value.value, zipValue.value]
    };
  }
};

F.Iterable = function(iterator) {
  this._iter = iterator;
};

F.Iterable.prototype.map = function(func) {
  return F(new F.MapIterator(this._iter, func));
};

F.Iterable.prototype.filter = function(pred) {
  return F(new F.FilterIterator(this._iter, pred));
};

F.Iterable.prototype.zip = function(other) {
  return F(new F.ZipIterator(this._iter, F(other)._iter));
};

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
};