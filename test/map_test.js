var should = require('should');
var smash  = require('smash');

eval(require('fs').readFileSync('./dist/swivel.js', 'utf8'));

describe("Map", function () {
  it("should default all fields do rows", function() {
    var map = swivel.map(['a', 'b']);

    map.hasRows().should.equal(true);
    map.hasColumns().should.equal(false);
  });

  describe("#pivots", function() {
    it("should add pivots when called", function() {
      var map = swivel.map(['a', 'b', 'c']).pivots('b');

      map.hasRows().should.equal(true);
      map.hasColumns().should.equal(true);
      map.getField('b').isColumn().should.equal(true);
    });
  });
});
