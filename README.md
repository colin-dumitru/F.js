[![Build Status](https://travis-ci.org/colin-dumitru/F.js.svg)](https://travis-ci.org/colin-dumitru/F.js)

# F.js

F.js is a collection of helper methods used for functional-style programming
in JavaScript. It provides methods for transforming, filtering, reducing and
other operations which work on **arrays**, **HTMLCollections**, **ES6
generators** (or any other type of collection which has a *length* property
and which are indexable.)

## Installing

**With bower**
<pre>
bower install f.js --save-dev
</pre>

And include the main script file into your project:
<pre>
&lt;script src="bower_components/f.js/build/F.min.js"&gt;&lt;/script&gt;
</pre>

**Manually downloading the zip file**
<pre>
url https://codeload.github.com/colin-dumitru/F.js/zip/v0.1.1 -o F.js.zip
unzip F.js.zip
</pre>

And include the main script file into your project:
<pre>
&lt;script src="F.js-0.1.1/build/F.min.js"&gt;&lt;/script&gt;
</pre>

## Documentation
* [Functional Methods](https://github.com/colin-dumitru/F.js/wiki/Functional)
* [Predicates](https://github.com/colin-dumitru/F.js/wiki/Predicates)

## Sample - basic functionality

```JavaScript
// F works with ES6 generators
function *gen() {
	for (var i = 0; i < 10; i++) {
		yield i;
	}
}

// Node lists
var nodes = document.getElementsByTagName("a");

// Or any other indexable
var names = ["John", "Colin", "Dave"];


F(gen())
	.filter(x => x % 2 == 0)
	.map(x => x * 2)
	.zip(
		F(nodes)
			.drop(4)
			.filter(
				P.and(
					a => a.href.indexOf("http") != -1,
					P.hasProperty("parentNode")
				)
			)
			.map(x => x.href)
			.concat(names)
	)
	.toMap()
```

## Sample - streams (proposed)

```JavaScript
var keyStream = F.eventStream($("input"), "keydown"),
	wordStream = F.stream(),
	matchesStream = F.stream();

F(keyStream)
	.accumulateUntil(k => k.keycode == 13 /* Enter */)
	.map(function(keys) {
		return F(keys).property("keycode").map(String.fromCharCode).toArray().join();
	})
	.feedStream(wordStream)
	.pullStream(keyStream);

F(wordStream)
	.each(function(word) {
		fetchFromService(word).then(matchesStream.push)
	})
	.pullStream(wordStream);

F(matchesStream)
	.each(function(word) {
		fetchFromService(word).then(matchesStream.push)
	})
	.pullStream(matchesStream);
```
