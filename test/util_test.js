var should = require('should');
var swivel = require('../dist/swivel');

//eval(require('fs').readFileSync('./dist/swivel.js', 'utf8'));

describe("Utils", function () {
  it("should make array out of arguments", function() {

    function getArgs() {
      return swivel.args(arguments);
    };

    getArgs('a', 'b').length.should.equal(2);
  });

  it("should merge two objects", function() {
    var target = {'a': 1};
    swivel.merge(target, {'b': 2});

    target['a'].should.equal(1);
    target['b'].should.equal(2);
    Object.keys(target).length.should.equal(2);   
  });
});
