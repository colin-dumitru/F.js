var assert = buster.referee.assert;

function equals(a, b) {
  assert.equals(JSON.stringify(a), JSON.stringify(b));
}

buster.testCase("Arrow notations", {
  "Map nodes to tag name": function() {
    var nodes = document.children;

    equals(
      F(nodes)
      .map(x => x.tagName)
      .toArray(), ["HTML"]
    )
  }
});