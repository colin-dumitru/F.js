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

F.isEmptyValue = function(value) {
  return value.done && typeof value.value == "undefined";
}

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

  if (F.isEmptyValue(value)) {
    return {
      done: true
    };
  } else {
    return {
      value: this._func(value.value),
      done: value.done
    };
  }
};

F.FilterIterator = function(iterator, pred) {
  this._iter = iterator;
  this._pred = pred;
};

F.FilterIterator.prototype.next = function() {
  var value = null;

  do {
    value = this._iter.next();

    if (!F.isEmptyValue(value) && this._pred(value.value)) {
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

  if (F.isEmptyValue(value) || F.isEmptyValue(zipValue)) {
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

F.ConcatIterator = function(iterators) {
  this._iterators = iterators.slice(1);

  if (iterators.length) {
    this._activeIter = iterators[0];
  } else {
    this._activeIter = F([]);
  }
};

F.ConcatIterator.prototype.next = function() {
  var value,
    hasSwitched = false;

  do {
    value = this._activeIter.next();

    if (value.done && this._iterators.length) {
      this._activeIter = this._iterators[0];
      this._iterators = this._iterators.slice(1);
      hasSwitched = true;
    }
  } while (F.isEmptyValue(value) && this._iterators.length);

  if (hasSwitched && value.done) {
    value.done = false;
  }
  return value;
};

F.Iterable = function(iterator) {
  this._iter = iterator;
};

F.Iterable.prototype.concat = function(func) {
  return F(new F.ConcatIterator(
    [this._iter].concat(
      F(arguments).map(function(arg) {
        return F(arg)._iter;
      }).toArray()
    )
  ));
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
    value;

  do {
    value = this._iter.next();

    if (!F.isEmptyValue(value)) {
      result.push(value.value);
    }
  } while (!value.done);

  return result;
};

F.Iterable.prototype.partition = function(pred) {
  var result = [
      [],
      []
    ],
    value;

  do {
    value = this._iter.next();

    if (!F.isEmptyValue(value)) {
      if (pred(value.value)) {
        result[0].push(value.value);
      } else {
        result[1].push(value.value);
      }
    }
  } while (!value.done);

  return result;
};

F.Iterable.prototype.find = function(pred) {
  var value;

  do {
    value = this._iter.next();

    if (!F.isEmptyValue(value) && pred(value.value)) {
      return value.value;
    }
  } while (!value.done);
};

F.Iterable.prototype.findIndex = function(pred) {
  var value,
    index = -1;

  do {
    value = this._iter.next();
    index++;

    if (!F.isEmptyValue(value) && pred(value.value)) {
      return index;
    }
  } while (!value.done);

  return -1;
};

F.Iterable.prototype.drop = function(count) {
  while (count-- > 0) {
    this._iter.next();
  }
  return this;
};

F.Iterable.prototype.dropWhile = function(pred) {
  var value;

  do {
    value = this._iter.next();

    if (!F.isEmptyValue(value) && !pred(value.value)) {
      return F([value.value]).concat(this);
    }
  } while (!value.done);

  return this;
};