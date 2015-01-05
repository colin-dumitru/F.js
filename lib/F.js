/* global console: true */
(function() {
  /**
   * Entry point for the "F" library. This method receives as parameter
   * either a iterator or a plain collection (it must be indexable and have
   * a "length" property)
   *
   * @param iterator - either a JS collection or an iterable.
   * @return - a iterator wrapper used for method chaining.
   */
  var F = function(iterator) {
    if (iterator instanceof Iterable) {
      /* There's no point in creating another wrapper if it's already an instance we want */
      return iterator;
    } else if (typeof iterator.next === "function") {
      /* If the input is a ES6 generator, just create an Iterable wrapper */
      return new Iterable(iterator);
    } else {
      /* TODO - we should check if it's an actual collection */
      return new Iterable(new ArrayIterator(iterator));
    }
  };

  /**
   * Checks if an input value is empty (the "done" property is true and the
   * "value" property is undefined. )
   *
   * @param value - the value to check
   * @return - if the input value is empty
   */
  var isEmptyValue = function(value) {
    return typeof value.value === "undefined";
  };

  /**
   * A wrapper iterator which can iterate over a plain JavaScript array.
   * The input array must have a "length" property and be indexable.
   *
   * @param collection - the input collection over which to iterate
   */
  var ArrayIterator = function(collection) {
    this._collection = collection;
    this._index = -1;
  };

  ArrayIterator.prototype.next = function() {
    this._index++;

    return {
      value: this._collection[this._index],
      done: this._index >= (this._collection.length - 1)
    };
  };

  /**
   * A wrapper iterator which transforms every element from the input array using
   * an unary function.
   *
   * @param iterator - the input collection to transform
   * @param func - the unary function to apply over all elements
   */
  var MapIterator = function(iterator, func) {
    this._iter = iterator;
    this._func = func;
  };

  MapIterator.prototype.next = function() {
    var value = this._iter.next();

    /* Empty collection will not return any values, so we must skip them */
    if (isEmptyValue(value)) {
      return value;
    } else {
      return {
        value: this._func(value.value),
        done: value.done
      };
    }
  };

  /**
   * A wrapper iterator which filters elements from an input iterator using a
   * given predicate
   *
   * @param iterator - the input collection to filter
   * @param pred - the unary predicate used for selecting items
   */
  var FilterIterator = function(iterator, pred) {
    this._iter = iterator;
    this._pred = pred;
  };

  FilterIterator.prototype.next = function() {
    var value = this._iter.next();

    if (!isEmptyValue(value) && !this._pred(value.value)) {
      delete value.value;
    }
    return value;
  };

  /**
   * A wrapper iterator which applies a method on each element.
   *
   * @param iterator - the input collection to iterate over.
   * @param func - the function to apply on each element.
   */
  var EachIterator = function(iterator, func) {
    this._iter = iterator;
    this._func = func;
  };

  EachIterator.prototype.next = function() {
    var value = this._iter.next();

    if (!isEmptyValue(value)) {
      this._func(value.value);
    }
    return value;
  };

  /**
   * A wrapper iterator which applies a method on each element.
   *
   * @param iterator - the input collection to iterate over.
   * @param func - the function to apply on each element.
   */
  var AccumulateUntilIterator = function(iterator, pred) {
    this._iter = iterator;
    this._pred = pred;
    this._buffer = [];
  };

  AccumulateUntilIterator.prototype.next = function() {
    var value = this._iter.next();

    if (!isEmptyValue(value)) {
      this._buffer.push(value.value);

      if (this._pred(value.value)) {
        /* If the predicate is true, then send the accumulated buffer */
        value.value = this._buffer.splice(0);
      } else {
        /* Otherwise, filter the current value */
        delete value.value;
      }
    }
    return value;
  };

  /**
   * A wrapper iterator which drops a fixed number of elements from the start
   * of the iterator.
   *
   * @param iterator - the input collection to filter
   * @param count - the number of elements to drop
   */
  var DropIterator = function(iterator, count) {
    this._iter = iterator;
    this._count = count;
  };

  DropIterator.prototype.next = function() {
    var value = this._iter.next();

    if (!isEmptyValue(value)) {
      if (this._count-- > 0) {
        delete value.value;
      }
    }
    return value;
  };

  /**
   * A wrapper iterator which only takes the first <count> elements from a stream.
   *
   * @param iterator - the input collection to filter.
   * @param count - the number of elements to take.
   */
  var TakeIterator = function(iterator, count) {
    this._iter = iterator;
    this._count = count;
  };

  TakeIterator.prototype.next = function() {
    var value = this._iter.next();

    if (!isEmptyValue(value)) {
      if (--this._count <= 0) {
        value.done = true;
      }
    }
    return value;
  };

  /**
   * A wrapper iterator which drops elements from the begining of the iterable
   * until the given predicate is no longer satisfied.
   *
   * @param iterator - the input collection to filter
   * @param pred - the predicate used to drop elements from the begining of the
   *  iterable
   */
  var DropWhileIterator = function(iterator, pred) {
    this._iter = iterator;
    this._pred = pred;
    /* Using a boolean flag to optimize the number of checkes after the values
    have been dropped */
    this._dropped = false;
  };

  DropWhileIterator.prototype.next = function() {
    var value = this._iter.next();

    if (!isEmptyValue(value) && !this._dropped) {
      if (this._pred(value.value)) {
        delete value.value;
      } else {
        this._dropped = true;
      }
    }
    return value;
  };

  /**
   * A wrapper iterator which takes elements from the begining of the iterable
   * until the given predicate is no longer satisfied. The input chain is
   * considered done when the predicate is no longer satisfied (including streams).
   *
   * @param iterator - the input collection to filter
   * @param pred - the predicate used to take elements from the begining of the
   *  iterable
   */
  var TakeWhileIterator = function(iterator, pred) {
    this._iter = iterator;
    this._pred = pred;
  };

  TakeWhileIterator.prototype.next = function() {
    var value = this._iter.next();

    if (!isEmptyValue(value) && !this._pred(value.value)) {
      delete value.value;
      value.done = true;
    }
    return value;
  };

  /**
   * A wrapper iterator which combines elements from two input iterators into
   * pairs.
   *
   * @param iterator - the first iterator from which to extract elements
   * @param zipIterator - the second iterator from which to extract elements
   */
  var ZipIterator = function(iterator, zipIterator) {
    this._liter = iterator;
    this._riter = zipIterator;

    this._lbuffer = [];
    this._rbuffer = [];
  };

  ZipIterator.prototype._read = function(iter, buffer) {
    var value = iter.next();

    if (!F.isEmptyValue(value)) {
      buffer.push(value);
    }
    return value.done;
  };

  ZipIterator.prototype.next = function() {
    var isFirstDone = this._read(this._liter, this._lbuffer),
      isSecondDone = this._read(this._riter, this._rbuffer),
      isDone = isFirstDone && isSecondDone;

    if (this._lbuffer.length && this._rbuffer.length) {
      return {
        value: [
          this._lbuffer.shift().value, this._rbuffer.shift().value
        ],
        done: isDone
      };
    } else {
      return {
        done: isDone
      };
    }
  };

  /**
   * A wrapper iterator which concatentates the values from 1 ore more iterators.
   *
   * @param iterators - an array of iterators from which to extract the values.
   */
  var ConcatIterator = function(iterators) {
    /* The first iterator in the list becomes the active one (from which we are
    currently pulling values)*/
    this._iterators = iterators.slice(1);

    if (iterators.length) {
      this._activeIter = iterators[0];
    } else {
      /* If the input list is empty, then just create an iterator over an empty
      collection so the algorithm doesn't fail. */
      this._activeIter = F([])
        ._iter;
    }
  };

  ConcatIterator.prototype.next = function() {
    var value;

    /* We use a loop to skip all collections which are empty */
    do {
      /* Get the next value of the current iterator */
      value = this._activeIter.next();

      if (isEmptyValue(value) && this._iterators.length) {
        /* If the value is empty, that means the current iterator had no
        values to give, so we should move onto to next one (if there are any )*/
        this._activeIter = this._iterators[0];
        this._iterators = this._iterators.slice(1);
      } else {
        /* Otherwise just break the loop and move onto the next value */
        break;
      }
    } while (true);

    /* If the current iterator is done, then move onto the next one */
    if (value.done && this._iterators.length) {
      /* Even though the current iterator is finished, there still are other
      values to consume */
      value.done = false;
      this._activeIter = this._iterators[0];
      this._iterators = this._iterators.slice(1);
    }
    return value;
  };

  /**
   * A wrapper object over iterators which provides utilitary functions.
   *
   * @param iterator - the input iterator
   */
  var Iterable = function(iterator) {
    this._iter = iterator;
  };

  Iterable.prototype.concat = function() {
    return F(new ConcatIterator(
      [this._iter].concat(
        F(arguments)
        .map(function(arg) {
          return F(arg)
            ._iter;
        })
        .toArray()
      )
    ));
  };

  Iterable.prototype.flatten = function() {
    return F(new ConcatIterator(
      this.map(function(arg) {
        return F(arg)
          ._iter;
      })
      .toArray()
    ));
  };

  Iterable.prototype.map = function(func) {
    return F(new MapIterator(this._iter, func));
  };

  Iterable.prototype.filter = function(pred) {
    return F(new FilterIterator(this._iter, pred));
  };

  Iterable.prototype.zip = function(other) {
    return F(new ZipIterator(this._iter, F(other)
      ._iter));
  };

  Iterable.prototype.toArray = function() {
    var result = [],
      value;

    do {
      value = this._iter.next();

      if (!isEmptyValue(value)) {
        result.push(value.value);
      }
    } while (!value.done);

    return result;
  };

  Iterable.prototype.toMap = function() {
    var result = {},
      value;

    do {
      value = this._iter.next();

      if (!isEmptyValue(value)) {
        result[value.value[0]] = value.value[1];
      }
    } while (!value.done);

    return result;
  };

  Iterable.prototype.partition = function(pred) {
    var result = [
        [],
        []
      ],
      value;

    do {
      value = this._iter.next();

      if (!isEmptyValue(value)) {
        if (pred(value.value)) {
          result[0].push(value.value);
        } else {
          result[1].push(value.value);
        }
      }
    } while (!value.done);

    return result;
  };

  Iterable.prototype.find = function(pred) {
    var value;

    do {
      value = this._iter.next();

      if (!isEmptyValue(value) && pred(value.value)) {
        return value.value;
      }
    } while (!value.done);
  };

  Iterable.prototype.findIndex = function(pred) {
    var value,
      index = -1;

    do {
      value = this._iter.next();
      index++;

      if (!isEmptyValue(value) && pred(value.value)) {
        return index;
      }
    } while (!value.done);

    return -1;
  };

  /**
   * Drops a fixed number of elements from the beginning of the iterator.
   *
   * @param count - the number of elements to drop.
   * @return - a new lazy iterable with the first <count> elements dropped
   */
  Iterable.prototype.drop = function(count) {
    return F(new DropIterator(this._iter, count));
  };

  /**
   * Takes a fixed number of elements from the beginning of the iterator.
   * When the take limit is reached, the chain is consideted done.
   *
   * @param count - the number of elements to take.
   * @return - a new lazy iterable.
   */
  Iterable.prototype.take = function(count) {
    return F(new TakeIterator(this._iter, count));
  };

  /**
   * Drops elements from the begining of the iterable until the predicate is no
   * longer satisfied.
   *
   * @param pred - the predicate to apply.
   * @return - a new lazy iterable with the first elements which satisfy
   * the predicate dropped. If all the elements are dropped, then an empty
   * iterable is returned.
   */
  Iterable.prototype.dropWhile = function(pred) {
    return F(new DropWhileIterator(this._iter, pred));
  };

  /**
   * Takes elements from the begining of the iterable until the predicate is no
   * longer satisfied.
   *
   * @param pred - the predicate to apply.
   * @return - a new lazy iterable.
   */
  Iterable.prototype.takeWhile = function(pred) {
    return F(new TakeWhileIterator(this._iter, pred));
  };

  Iterable.prototype.fold = function(func, startValue) {
    var value;

    do {
      value = this._iter.next();

      if (!isEmptyValue(value)) {
        if (typeof startValue === "undefined") {
          startValue = value.value;
        } else {
          startValue = func(startValue, value.value);
        }
      }
    } while (!value.done);

    return startValue;
  };

  /**
   * Applies the given callback on all elements of the input iterable.
   *
   * @param func - the unary function which will be called for every element of
   * the iterable. The first argument is the current element, the second argument
   * is the elements index into the iterable, and the third argument is a boolean
   * flag which signals if there are no more elements to iterate over.
   */
  Iterable.prototype.foreach = function(func) {
    var value,
      index = 0;

    do {
      value = this._iter.next();

      if (!isEmptyValue(value)) {
        func(value.value, index++, value.done);
      }
    } while (!value.done);
  };

  /**
   * Applies the given callback on all elements of the input iterable. Unlike
   * `foreach` the evaluation is done lazily. So this method can be chained and
   * works with streams.
   *
   * @param func - the unary function which will be called for every element of
   * the iterable.
   */
  Iterable.prototype.each = function(func) {
    return F(new EachIterator(this._iter, func));
  };

  /**
   * Pushes the input values into the given stream.
   *
   * @param stream - the stream in which to push values.
   * @return - a new iterable instance.
   */
  Iterable.prototype.feedStream = function(stream) {
    return F(new EachIterator(this._iter, function(value) {
      stream.push(value);
    }));
  };

  /**
   * Reverses the elements of an iterable. The resulting value is still an iterable.
   *
   * @return - a new iterable instance with the elements from the original iterable in reverse order.
   */
  Iterable.prototype.reverse = function() {
    var value,
      reversed = [];

    do {
      value = this._iter.next();

      if (!isEmptyValue(value)) {
        reversed.unshift(value.value);
      }
    } while (!value.done);

    return F(reversed);
  };

  /**
   * Maps an input object to one of it's nested properties.
   *
   * @param... - a series of nested properties to extract from the mapped object.
   * @return - a new iterable instance.
   */
  Iterable.prototype.property = function() {
    var properties = arguments;

    return F(new MapIterator(this._iter, function(obj) {
      for (var i = 0; i < properties.length; i++) {
        if (typeof obj[properties[i]] === "undefined") {
          /* Return null and not undefined as undefined values are ignored */
          return null;
        }
        obj = obj[properties[i]];
      }
      return obj;
    }));
  };

  /**
   * Accumulates values until a condition is met. When the predicate is true,
   * all values will get pushed down the iterable chain.
   *
   * @pred - the accumulate condition.
   * @return - a new iterable instance.
   */
  Iterable.prototype.accumulateUntil = function(pred) {
    return F(new AccumulateUntilIterator(this._iter, pred));
  };

  /**
   * Logs all input values to the console
   *
   * @return - a new iterable instance.
   */
  Iterable.prototype.log = function() {
    return F(new EachIterator(this._iter, function(value) {
      console.log(value);
    }));
  };

  /* Global exports */
  F.Iterable = Iterable;
  F.isEmptyValue = isEmptyValue;
  this.F = F;
})(this);