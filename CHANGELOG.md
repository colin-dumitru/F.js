## 0.5.1
* Fixed an issue where stream could not be used by multiple iterable chains.
* Event streams now detach their handlers when they have no more listeners to prevent memory leaks.
* Polyfill promises can now be chained through the "then" method.

## 0.5.0 (in development)
* The `pullStream` no longer requires a stream to pull, and inferes the value initially passed to the `F(...)` method.
* Added `throttle` method on streams for limiting how often values can be pushed to a stream.
* Added `bindPush` method on streams.
