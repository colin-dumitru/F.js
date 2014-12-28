F = function(iterator) {
  if (typeof iterator.next === "function") {
    return new F.Iterable(iterator);
  } else {
    return new F.Iterable(new F.Iterator(iterator));
  }
}

F.Iterator = function(collection) {
  this._collection = collection;
  this._index = -1;
}

F.Iterator.prototype.next = function() {
  this._index++;

  return {
    value: this._collection[this._index],
    done: this._index == this._collection.length
  };
}

F.Iterable = function(iterator) {
  this._iter = iterator;
}

F.Iterable.prototype.map = function(func) {
  var result = [],
    value = this._iter.next();

  while (!value.done) {
    result.push(func(value.value));
    value = this._iter.next();
  }
  return F(result);
}

F.Iterable.prototype.filter = function(pred) {
  var result = [],
    value = this._iter.next();

  while (!value.done) {
    if (pred(value.value)) {
      result.push(value.value);
    }
    value = this._iter.next();
  }
  return F(result);
}

F.Iterable.prototype.toArray = function() {
  var result = [],
    value = this._iter.next();

  while (!value.done) {
    result.push(value.value);
    value = this._iter.next();
  }
  return result;
}

/* If under the nodeJS runtime, export global variables */
exports.F = F;