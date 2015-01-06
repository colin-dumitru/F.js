# F.js

[![Build Status](https://travis-ci.org/colin-dumitru/F.js.svg)](https://travis-ci.org/colin-dumitru/F.js)
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/colin-dumitru/F.js?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Stable release](https://img.shields.io/bower/v/f.js.svg)](http://bower.io/search/?q=f.js)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/colin-dumitru/F.js/blob/master/LICENSE)



F.js is a collection of helper methods used for functional and reactive programming
in JavaScript. It provides methods for transforming, filtering, reducing and
other operations which work on **arrays**, **HTMLCollections**, **ES6
generators** (and almost all other indexables) and **streams of events**.

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
* [Introduction](https://github.com/colin-dumitru/F.js/wiki)
* [Functional Methods](https://github.com/colin-dumitru/F.js/wiki/Functional)
* [Predicates](https://github.com/colin-dumitru/F.js/wiki/Predicates)
* [Streams](https://github.com/colin-dumitru/F.js/wiki/Streams)

## Samples

> F.js works with regular Arrays ([RUN](http://codepen.io/colin-dumitru/pen/GgNNmE))

```JavaScript
var people = [
  { name: "John", age: 31},
  { name: "Colin", age: 25},
  { name: "Dave", age: 13},
  { name: "Vic", age: 52}
];

var result = F(people)
  .filter(function(person) {
    return person.age < 50;
  })
  .property("name")
  .drop(1)
  .zip(["first", "second"])
  .toArray();

document.write(JSON.stringify(result));
```

> HTML collections ([RUN](http://codepen.io/colin-dumitru/pen/xbRRYw))

```JavaScript
var links = document.getElementsByTagName("a"),
    titles = document.getElementsByTagName("h5");

var result = F(links)
  .property("href")
  .dropWhile(function(val) {
    return val.indexOf("http") == -1;
  })
  .zip(
    F(titles)
      .property("innerText")
  )
  .toMap();

document.write(JSON.stringify(result));
```

> And even ES6 generators ([RUN](http://codepen.io/colin-dumitru/pen/xbRRjZ))

```JavaScript
function *gen() {
  for (var i = 0; i < 10; i++) {
    yield i;
  }
}

var result = F(gen())
  .fold((l, r) => l + r);

document.write(result);
```

> So at it's core, F.js is just another functional library. But the real power comes when you combine reactive programming with streams.

Streams are nothing more than promises which can resolve multiple times. You can either push or consume values from a stream, all done asynchronously. This enabled you to write more modular async code, by passing values through streams and not callbacks.

This next examples takes a search query from an input element and displays a list of images which match the given query, all done using streams.

> Stream example ([RUN](http://codepen.io/colin-dumitru/pen/XJNNPJ))

```JavaScript
var input = $("#search_query"),
    keyStream = F.eventStream(input, "keydown"),
    wordStream = F.stream(),
    imageStream = F.stream();

F(keyStream)
  .property("keyCode")
  .accumulateUntil(P.equalTo(13)) /* Enter */
  .map(function() {
    return input.val();
  })
  .feedStream(wordStream)
  .pullStream(keyStream);

F(wordStream)
  .each(text =>
        $.ajax({
                url: url + text,
                dataType: 'jsonp',
                jsonp: 'jsonFlickrApi',
                jsonpCallback: 'jsonFlickrApi'
            })
          .then(imageStream.push.bind(imageStream)))
  .pullStream(wordStream);

F(imageStream)
  .each(reset)
  .property("photos", "photo")
  .each(images =>
       F(images)
        .map(render)
        .foreach(display))
  .pullStream(imageStream);
```

Got you interested? Visit our [wiki pages](https://github.com/colin-dumitru/F.js/wiki) for more examples and information.
